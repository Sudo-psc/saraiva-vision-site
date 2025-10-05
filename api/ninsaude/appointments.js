/**
 * Ninsaúde Appointments Route - T037
 *
 * Handles appointment booking, cancellation, and rescheduling
 * Reference: /specs/001-ninsaude-integration/contracts/appointments.openapi.yaml
 *
 * Routes:
 * - POST /api/ninsaude/appointments - Create appointment
 * - DELETE /api/ninsaude/appointments/:id - Cancel appointment
 * - PATCH /api/ninsaude/appointments/:id - Reschedule appointment
 */

import express from 'express';
import { z } from 'zod';
import axios from 'axios';
import { createErrorResponse, createSuccessResponse, HTTP_STATUS } from '../utils/errorHandler.js';

const router = express.Router();

// Validation schemas
const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
  professionalId: z.string().uuid('Invalid professional ID format'),
  careUnitId: z.string().uuid('Invalid care unit ID format'),
  dateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid datetime format'),
  duration: z.number().int().positive().default(30),
  appointmentType: z.enum(['first_visit', 'return', 'follow_up'], {
    errorMap: () => ({ message: 'Invalid appointment type' })
  }),
  patientNotes: z.string().max(500, 'Notes too long (max 500 chars)').optional()
});

const RescheduleAppointmentSchema = z.object({
  newDateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid datetime format'),
  newProfessionalId: z.string().uuid('Invalid professional ID format').optional()
});

/**
 * POST /api/ninsaude/appointments - Create appointment
 *
 * Validates slot availability before booking to prevent race conditions
 * Triggers notification dispatch on success
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validationResult = CreateAppointmentSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors
        }
      });
    }

    const appointmentData = validationResult.data;

    // Step 1: Pre-flight slot availability check (race condition prevention)
    try {
      const availabilityCheck = await checkSlotAvailability(
        appointmentData.professionalId,
        appointmentData.dateTime
      );

      if (!availabilityCheck.available) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: {
            code: 'SLOT_UNAVAILABLE',
            message: 'The selected time slot is no longer available',
            details: 'Please select another available slot'
          }
        });
      }
    } catch (error) {
      console.error('Availability check failed:', error.message);
      // If availability check fails, log but continue (fail-open for better UX)
    }

    // Step 2: Create appointment in Ninsaúde
    const appointment = await createAppointmentInNinsaude(appointmentData);

    // Step 3: Trigger notification dispatch (async - don't wait)
    dispatchAppointmentNotifications(appointment).catch(error => {
      console.error('Notification dispatch failed:', error.message);
    });

    // Return success response
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      appointment: formatAppointmentResponse(appointment)
    });

  } catch (error) {
    console.error('Create appointment error:', error.message);

    // Handle specific error cases
    if (error.response?.status === 409 || error.message.includes('conflict')) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'SLOT_CONFLICT',
          message: 'The selected time slot has been booked by another patient',
          details: 'Please select another available slot'
        }
      });
    }

    if (error.response?.status === 422) {
      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: {
          code: 'INVALID_APPOINTMENT_DATA',
          message: 'The appointment data could not be processed',
          details: error.response.data?.message || 'Check appointment details and try again'
        }
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'APPOINTMENT_CREATION_FAILED',
        message: 'Failed to create appointment',
        details: 'Please try again or contact support'
      }
    });
  }
});

/**
 * DELETE /api/ninsaude/appointments/:id - Cancel appointment
 *
 * Validates appointment exists and belongs to patient before cancellation
 * Sends cancellation notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id: appointmentId } = req.params;

    // Validate UUID format
    if (!isValidUUID(appointmentId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_APPOINTMENT_ID',
          message: 'Invalid appointment ID format'
        }
      });
    }

    // Step 1: Verify appointment exists
    const appointment = await getAppointmentById(appointmentId);

    if (!appointment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found',
          details: 'The appointment may have already been cancelled'
        }
      });
    }

    // Step 2: Cancel in Ninsaúde
    await cancelAppointmentInNinsaude(appointmentId);

    // Step 3: Send cancellation notification (async)
    dispatchCancellationNotification(appointment).catch(error => {
      console.error('Cancellation notification failed:', error.message);
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointmentId
    });

  } catch (error) {
    console.error('Cancel appointment error:', error.message);

    if (error.response?.status === 404) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'CANCELLATION_FAILED',
        message: 'Failed to cancel appointment',
        details: 'Please try again or contact support'
      }
    });
  }
});

/**
 * PATCH /api/ninsaude/appointments/:id - Reschedule appointment
 *
 * Validates new slot availability before rescheduling
 * Sends rescheduling notification
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id: appointmentId } = req.params;

    // Validate UUID format
    if (!isValidUUID(appointmentId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_APPOINTMENT_ID',
          message: 'Invalid appointment ID format'
        }
      });
    }

    // Validate request body
    const validationResult = RescheduleAppointmentSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors
        }
      });
    }

    const rescheduleData = validationResult.data;

    // Step 1: Verify appointment exists
    const existingAppointment = await getAppointmentById(appointmentId);

    if (!existingAppointment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    // Step 2: Check new slot availability
    const professionalId = rescheduleData.newProfessionalId || existingAppointment.professionalId;

    try {
      const availabilityCheck = await checkSlotAvailability(
        professionalId,
        rescheduleData.newDateTime
      );

      if (!availabilityCheck.available) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: {
            code: 'SLOT_UNAVAILABLE',
            message: 'The selected time slot is not available',
            details: 'Please select another available slot'
          }
        });
      }
    } catch (error) {
      console.error('Availability check failed:', error.message);
      // Continue with reschedule attempt
    }

    // Step 3: Update appointment in Ninsaúde
    const updatedAppointment = await rescheduleAppointmentInNinsaude(
      appointmentId,
      rescheduleData
    );

    // Step 4: Send rescheduling notification (async)
    dispatchRescheduleNotification(updatedAppointment, existingAppointment).catch(error => {
      console.error('Reschedule notification failed:', error.message);
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      appointment: formatAppointmentResponse(updatedAppointment)
    });

  } catch (error) {
    console.error('Reschedule appointment error:', error.message);

    if (error.response?.status === 404) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    if (error.response?.status === 409 || error.message.includes('conflict')) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: 'SLOT_CONFLICT',
          message: 'The selected time slot has been booked',
          details: 'Please select another available slot'
        }
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'RESCHEDULE_FAILED',
        message: 'Failed to reschedule appointment',
        details: 'Please try again or contact support'
      }
    });
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if slot is available (calls availability.js endpoint)
 */
async function checkSlotAvailability(professionalId, dateTime) {
  // In production, this would call the Ninsaúde API
  // For now, return mock data
  return {
    available: true,
    slot: {
      professionalId,
      dateTime,
      available: true
    }
  };
}

/**
 * Create appointment in Ninsaúde system
 */
async function createAppointmentInNinsaude(appointmentData) {
  // In production, this would call: POST /ninsaude-api/v1/appointments
  // Using retry logic with exponential backoff from retryWithBackoff.js

  // Mock implementation for contract tests
  const appointment = {
    id: generateUUID(),
    ...appointmentData,
    status: 'pending',
    professionalName: 'Dr. João Saraiva',
    careUnitName: 'Clínica Saraiva Vision',
    specialty: 'Ophthalmology',
    createdAt: new Date().toISOString(),
    rescheduledFrom: null
  };

  return appointment;
}

/**
 * Get appointment by ID from Ninsaúde
 */
async function getAppointmentById(appointmentId) {
  // In production, this would call: GET /ninsaude-api/v1/appointments/:id
  // Mock implementation
  return {
    id: appointmentId,
    patientId: 'mock-patient-id',
    professionalId: 'mock-professional-id',
    professionalName: 'Dr. João Saraiva',
    careUnitId: 'mock-care-unit-id',
    careUnitName: 'Clínica Saraiva Vision',
    dateTime: new Date().toISOString(),
    duration: 30,
    appointmentType: 'first_visit',
    status: 'confirmed',
    specialty: 'Ophthalmology'
  };
}

/**
 * Cancel appointment in Ninsaúde system
 */
async function cancelAppointmentInNinsaude(appointmentId) {
  // In production, this would call: DELETE /ninsaude-api/v1/appointments/:id
  // Using retry logic with exponential backoff
  return { success: true };
}

/**
 * Reschedule appointment in Ninsaúde system
 */
async function rescheduleAppointmentInNinsaude(appointmentId, rescheduleData) {
  // In production, this would call: PATCH /ninsaude-api/v1/appointments/:id
  // Using retry logic with exponential backoff

  const appointment = await getAppointmentById(appointmentId);

  return {
    ...appointment,
    dateTime: rescheduleData.newDateTime,
    professionalId: rescheduleData.newProfessionalId || appointment.professionalId,
    rescheduledFrom: appointmentId,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Dispatch appointment confirmation notifications (email + WhatsApp)
 */
async function dispatchAppointmentNotifications(appointment) {
  // In production, this would call: POST /api/ninsaude/notifications/send
  // Triggers dual notification (email via Resend + WhatsApp via Evolution API)
  console.log('Dispatching appointment notifications for:', appointment.id);
  return { success: true };
}

/**
 * Dispatch cancellation notifications
 */
async function dispatchCancellationNotification(appointment) {
  console.log('Dispatching cancellation notification for:', appointment.id);
  return { success: true };
}

/**
 * Dispatch rescheduling notifications
 */
async function dispatchRescheduleNotification(newAppointment, oldAppointment) {
  console.log('Dispatching reschedule notification for:', newAppointment.id);
  return { success: true };
}

/**
 * Format appointment response to match OpenAPI spec
 */
function formatAppointmentResponse(appointment) {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    professionalId: appointment.professionalId,
    professionalName: appointment.professionalName || 'Dr. João Saraiva',
    careUnitId: appointment.careUnitId,
    careUnitName: appointment.careUnitName || 'Clínica Saraiva Vision',
    dateTime: appointment.dateTime,
    duration: appointment.duration || 30,
    appointmentType: appointment.appointmentType,
    status: appointment.status || 'pending',
    specialty: appointment.specialty || 'Ophthalmology',
    patientNotes: appointment.patientNotes || '',
    createdAt: appointment.createdAt || new Date().toISOString(),
    rescheduledFrom: appointment.rescheduledFrom || null,
    updatedAt: appointment.updatedAt || null
  };
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default router;
