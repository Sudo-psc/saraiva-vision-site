/**
 * Ninsaúde Availability Route - T038
 *
 * Handles appointment slot availability lookup
 * Reference: /specs/001-ninsaude-integration/contracts/availability.openapi.yaml
 *
 * Routes:
 * - GET /api/ninsaude/availability - List available slots
 * - POST /api/ninsaude/availability/check - Verify specific slot availability
 */

import express from 'express';
import { z } from 'zod';
import { HTTP_STATUS } from '../utils/errorHandler.js';

const router = express.Router();

// Validation schemas
const AvailabilityQuerySchema = z.object({
  professionalId: z.string().uuid('Invalid professional ID format'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (use YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (use YYYY-MM-DD)'),
  careUnitId: z.string().uuid('Invalid care unit ID format').optional()
});

const SlotCheckSchema = z.object({
  professionalId: z.string().uuid('Invalid professional ID format'),
  dateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid datetime format')
});

/**
 * GET /api/ninsaude/availability - List available slots
 *
 * Returns available appointment slots within date range
 * Max 30-day range, filters past slots, chronological order
 */
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const validationResult = AvailabilityQuerySchema.safeParse(req.query);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: errors
        }
      });
    }

    const { professionalId, startDate, endDate, careUnitId } = validationResult.data;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Check if start date is in the past
    if (start < now.setHours(0, 0, 0, 0)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'Start date cannot be in the past',
          details: 'Please select a future date'
        }
      });
    }

    // Check if end date is before start date
    if (end < start) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'End date must be after start date',
          details: 'Please check your date range'
        }
      });
    }

    // Validate max 30-day range
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'DATE_RANGE_TOO_LARGE',
          message: 'Date range cannot exceed 30 days',
          details: `Current range: ${daysDiff} days. Maximum allowed: 30 days`
        }
      });
    }

    // Fetch available slots from Ninsaúde
    const slots = await fetchAvailableSlotsFromNinsaude({
      professionalId,
      startDate,
      endDate,
      careUnitId
    });

    // Filter out past slots
    const now2 = new Date();
    const futureSlots = slots.filter(slot => new Date(slot.dateTime) > now2);

    // Sort chronologically
    const sortedSlots = futureSlots.sort((a, b) =>
      new Date(a.dateTime) - new Date(b.dateTime)
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      slots: sortedSlots,
      totalSlots: sortedSlots.length
    });

  } catch (error) {
    console.error('Availability lookup error:', error.message);

    if (error.response?.status === 404) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'PROFESSIONAL_NOT_FOUND',
          message: 'Professional not found',
          details: 'The specified professional ID does not exist'
        }
      });
    }

    if (error.response?.status === 503) {
      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        error: {
          code: 'NINSAUDE_UNAVAILABLE',
          message: 'Appointment system temporarily unavailable',
          details: 'Please try again in a few moments'
        }
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'AVAILABILITY_LOOKUP_FAILED',
        message: 'Failed to retrieve available slots',
        details: 'Please try again or contact support'
      }
    });
  }
});

/**
 * POST /api/ninsaude/availability/check - Verify slot availability
 *
 * Real-time availability check to prevent race conditions
 * Used before final booking confirmation
 */
router.post('/check', async (req, res) => {
  try {
    // Validate request body
    const validationResult = SlotCheckSchema.safeParse(req.body);

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

    const { professionalId, dateTime } = validationResult.data;

    // Check if datetime is in the past
    const slotDateTime = new Date(dateTime);
    const now = new Date();

    if (slotDateTime < now) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'SLOT_IN_PAST',
          message: 'Cannot book appointments in the past',
          details: 'Please select a future time slot'
        }
      });
    }

    // Perform real-time availability check
    const availabilityResult = await checkSlotAvailabilityInNinsaude(
      professionalId,
      dateTime
    );

    if (availabilityResult.available) {
      return res.status(HTTP_STATUS.OK).json({
        available: true,
        slot: formatSlotResponse(availabilityResult.slot)
      });
    } else {
      return res.status(HTTP_STATUS.OK).json({
        available: false,
        slot: null
      });
    }

  } catch (error) {
    console.error('Slot check error:', error.message);

    if (error.response?.status === 404) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'PROFESSIONAL_NOT_FOUND',
          message: 'Professional not found'
        }
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SLOT_CHECK_FAILED',
        message: 'Failed to verify slot availability',
        details: 'Please try again'
      }
    });
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetch available slots from Ninsaúde API
 * In production, uses retry logic with exponential backoff
 */
async function fetchAvailableSlotsFromNinsaude(params) {
  // In production, this would call: GET /ninsaude-api/v1/availability
  // Using retryWithBackoff from api/utils/ninsaude/retryWithBackoff.js

  // Mock implementation for contract tests
  const { professionalId, startDate, endDate, careUnitId } = params;

  // Generate mock slots for testing
  const slots = generateMockSlots(startDate, endDate, professionalId, careUnitId);

  return slots;
}

/**
 * Check specific slot availability in real-time
 * Prevents race conditions by verifying immediately before booking
 */
async function checkSlotAvailabilityInNinsaude(professionalId, dateTime) {
  // In production, this would call: POST /ninsaude-api/v1/availability/check
  // Using retryWithBackoff

  // Mock implementation
  const available = Math.random() > 0.1; // 90% availability for testing

  return {
    available,
    slot: available ? {
      professionalId,
      dateTime,
      professionalName: 'Dr. João Saraiva',
      careUnitId: 'mock-care-unit-id',
      careUnitName: 'Clínica Saraiva Vision',
      duration: 30,
      specialty: 'Ophthalmology',
      available: true
    } : null
  };
}

/**
 * Generate mock slots for testing
 */
function generateMockSlots(startDate, endDate, professionalId, careUnitId) {
  const slots = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Generate slots for each weekday (Mon-Fri) between 8:00-18:00
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Generate slots every 30 minutes from 8:00 to 18:00
      for (let hour = 8; hour < 18; hour++) {
        for (let minute of [0, 30]) {
          const slotDateTime = new Date(currentDate);
          slotDateTime.setHours(hour, minute, 0, 0);

          const slot = {
            date: formatDate(slotDateTime),
            time: formatTime(hour, minute),
            dateTime: slotDateTime.toISOString(),
            professionalId,
            professionalName: 'Dr. João Saraiva',
            careUnitId: careUnitId || 'mock-care-unit-id',
            careUnitName: 'Clínica Saraiva Vision',
            duration: 30,
            specialty: 'Ophthalmology',
            available: true,
            fetchedAt: new Date().toISOString()
          };

          slots.push(slot);
        }
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}

/**
 * Format slot response to match OpenAPI spec
 */
function formatSlotResponse(slot) {
  if (!slot) return null;

  const dateTime = new Date(slot.dateTime);

  return {
    date: formatDate(dateTime),
    time: formatTime(dateTime.getHours(), dateTime.getMinutes()),
    dateTime: slot.dateTime,
    professionalId: slot.professionalId,
    professionalName: slot.professionalName || 'Dr. João Saraiva',
    careUnitId: slot.careUnitId,
    careUnitName: slot.careUnitName || 'Clínica Saraiva Vision',
    duration: slot.duration || 30,
    specialty: slot.specialty || 'Ophthalmology',
    available: slot.available !== false,
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time as HH:mm
 */
function formatTime(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default router;
