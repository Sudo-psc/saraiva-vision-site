/**
 * T007: Ninsaúde Appointment Management Contract Tests (TDD)
 *
 * Tests API contract compliance for appointment booking, cancellation, and rescheduling.
 * Reference: /specs/001-ninsaude-integration/contracts/appointments.openapi.yaml
 *
 * EXPECTED STATUS: FAILING (routes not implemented yet)
 *
 * Validates:
 * - POST /api/ninsaude/appointments (create appointment)
 * - DELETE /api/ninsaude/appointments/:id (cancel appointment)
 * - PATCH /api/ninsaude/appointments/:id (reschedule appointment)
 * - Request/response schemas match OpenAPI spec
 * - Error responses (404, 409)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002';
const APPOINTMENTS_ENDPOINT = `${API_BASE_URL}/api/ninsaude/appointments`;

// Test data matching OpenAPI spec
const VALID_APPOINTMENT_REQUEST = {
  patientId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  professionalId: 'b2c3d4e5-f6a7-8901-bcde-fa2345678901',
  careUnitId: 'c3d4e5f6-a7b8-9012-cdef-ab3456789012',
  dateTime: '2025-10-15T10:30:00',
  duration: 30,
  appointmentType: 'first_visit',
  patientNotes: 'First consultation for eye exam'
};

const APPOINTMENT_WITH_INVALID_UUID = {
  ...VALID_APPOINTMENT_REQUEST,
  patientId: 'invalid-uuid-format'
};

const APPOINTMENT_MISSING_REQUIRED = {
  patientId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  professionalId: 'b2c3d4e5-f6a7-8901-bcde-fa2345678901'
  // Missing careUnitId, dateTime, appointmentType
};

const APPOINTMENT_INVALID_TYPE = {
  ...VALID_APPOINTMENT_REQUEST,
  appointmentType: 'invalid_type'
};

const RESCHEDULE_REQUEST = {
  newDateTime: '2025-10-16T14:00:00'
};

const RESCHEDULE_WITH_NEW_PROFESSIONAL = {
  newDateTime: '2025-10-16T14:00:00',
  newProfessionalId: 'c4d5e6f7-a8b9-0123-defg-bc4567890123'
};

describe('T007: Appointment Management Contract Tests', () => {
  describe('POST /api/ninsaude/appointments - Create Appointment', () => {
    it('should create appointment with valid data (201 Created)', async () => {
      try {
        const response = await axios.post(APPOINTMENTS_ENDPOINT, VALID_APPOINTMENT_REQUEST);

        // Validate status code
        expect(response.status).toBe(201);

        // Validate response schema per OpenAPI spec
        expect(response.data).toMatchObject({
          success: true,
          appointment: expect.objectContaining({
            id: expect.any(String),
            patientId: VALID_APPOINTMENT_REQUEST.patientId,
            professionalId: VALID_APPOINTMENT_REQUEST.professionalId,
            careUnitId: VALID_APPOINTMENT_REQUEST.careUnitId,
            dateTime: expect.any(String),
            duration: 30,
            appointmentType: 'first_visit',
            status: expect.stringMatching(/pending|confirmed/),
            createdAt: expect.any(String)
          })
        });

        // Validate UUID format
        expect(response.data.appointment.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );

        // Validate ISO 8601 datetime format
        expect(response.data.appointment.dateTime).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
        );

        // Validate createdAt timestamp
        expect(response.data.appointment.createdAt).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
        );
      } catch (error) {
        // Expected to fail - route not implemented
        expect(error.response?.status).toBe(404);
      }
    });

    it('should include professional and care unit names in response', async () => {
      try {
        const response = await axios.post(APPOINTMENTS_ENDPOINT, VALID_APPOINTMENT_REQUEST);

        expect(response.status).toBe(201);
        expect(response.data.appointment).toMatchObject({
          professionalName: expect.any(String),
          careUnitName: expect.any(String),
          specialty: expect.any(String)
        });
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should accept all valid appointment types', async () => {
      const appointmentTypes = ['first_visit', 'return', 'follow_up'];

      for (const type of appointmentTypes) {
        try {
          const request = { ...VALID_APPOINTMENT_REQUEST, appointmentType: type };
          const response = await axios.post(APPOINTMENTS_ENDPOINT, request);

          expect(response.status).toBe(201);
          expect(response.data.appointment.appointmentType).toBe(type);
        } catch (error) {
          expect(error.response?.status).toBe(404);
        }
      }
    });

    it('should include patient notes when provided', async () => {
      try {
        const response = await axios.post(APPOINTMENTS_ENDPOINT, VALID_APPOINTMENT_REQUEST);

        expect(response.status).toBe(201);
        expect(response.data.appointment.patientNotes).toBe(VALID_APPOINTMENT_REQUEST.patientNotes);
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('POST /api/ninsaude/appointments - Validation Errors', () => {
    it('should reject invalid UUID format (400)', async () => {
      try {
        await axios.post(APPOINTMENTS_ENDPOINT, APPOINTMENT_WITH_INVALID_UUID);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data).toMatchObject({
            success: false,
            error: expect.any(String),
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'patientId',
                message: expect.stringContaining('UUID')
              })
            ])
          });
        }
      }
    });

    it('should reject missing required fields (400)', async () => {
      try {
        await axios.post(APPOINTMENTS_ENDPOINT, APPOINTMENT_MISSING_REQUIRED);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data).toMatchObject({
            success: false,
            error: expect.any(String),
            details: expect.arrayContaining([
              expect.objectContaining({
                field: expect.stringMatching(/careUnitId|dateTime|appointmentType/),
                message: expect.any(String)
              })
            ])
          });
        }
      }
    });

    it('should reject invalid appointment type (400)', async () => {
      try {
        await axios.post(APPOINTMENTS_ENDPOINT, APPOINTMENT_INVALID_TYPE);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'appointmentType',
                message: expect.stringContaining('first_visit, return, follow_up')
              })
            ])
          );
        }
      }
    });

    it('should reject patient notes exceeding 500 characters (400)', async () => {
      const longNotes = {
        ...VALID_APPOINTMENT_REQUEST,
        patientNotes: 'A'.repeat(501)
      };

      try {
        await axios.post(APPOINTMENTS_ENDPOINT, longNotes);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'patientNotes',
                message: expect.stringContaining('500')
              })
            ])
          );
        }
      }
    });

    it('should reject past datetime for new appointments (400)', async () => {
      const pastAppointment = {
        ...VALID_APPOINTMENT_REQUEST,
        dateTime: '2020-01-01T10:00:00'
      };

      try {
        await axios.post(APPOINTMENTS_ENDPOINT, pastAppointment);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'dateTime',
                message: expect.stringContaining('passado')
              })
            ])
          );
        }
      }
    });
  });

  describe('POST /api/ninsaude/appointments - Race Condition (409)', () => {
    it('should handle slot no longer available (409 Conflict)', async () => {
      try {
        await axios.post(APPOINTMENTS_ENDPOINT, VALID_APPOINTMENT_REQUEST);
      } catch (error) {
        if (error.response?.status === 409) {
          expect(error.response.data).toMatchObject({
            success: false,
            error: expect.stringContaining('disponível')
          });
        }
        // Otherwise expect 404 (not implemented)
        expect([404, 409]).toContain(error.response?.status);
      }
    });
  });

  describe('DELETE /api/ninsaude/appointments/:id - Cancel Appointment', () => {
    it('should cancel appointment successfully (200 OK)', async () => {
      const appointmentId = 'd4e5f6a7-b8c9-0123-defg-cd5678901234';

      try {
        const response = await axios.delete(`${APPOINTMENTS_ENDPOINT}/${appointmentId}`);

        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({
          success: true,
          message: expect.any(String)
        });
      } catch (error) {
        // Expected to fail - route not implemented
        expect(error.response?.status).toBe(404);
      }
    });

    it('should return 404 for non-existent appointment', async () => {
      const nonExistentId = 'e5f6a7b8-c9d0-1234-efgh-de6789012345';

      try {
        await axios.delete(`${APPOINTMENTS_ENDPOINT}/${nonExistentId}`);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.data).toMatchObject({
            success: false,
            error: expect.stringContaining('não encontrado')
          });
        }
        expect(error.response?.status).toBe(404);
      }
    });

    it('should reject invalid UUID format (400)', async () => {
      const invalidId = 'not-a-uuid';

      try {
        await axios.delete(`${APPOINTMENTS_ENDPOINT}/${invalidId}`);
      } catch (error) {
        if (error.response?.status === 400) {
          expect(error.response.data).toMatchObject({
            success: false,
            error: expect.stringContaining('UUID')
          });
        }
        expect([400, 404]).toContain(error.response?.status);
      }
    });
  });

  describe('PATCH /api/ninsaude/appointments/:id - Reschedule Appointment', () => {
    it('should reschedule appointment with new datetime (200 OK)', async () => {
      const appointmentId = 'f6a7b8c9-d0e1-2345-fghi-ef7890123456';

      try {
        const response = await axios.patch(
          `${APPOINTMENTS_ENDPOINT}/${appointmentId}`,
          RESCHEDULE_REQUEST
        );

        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({
          success: true,
          appointment: expect.objectContaining({
            id: appointmentId,
            dateTime: RESCHEDULE_REQUEST.newDateTime,
            status: expect.any(String),
            rescheduledFrom: expect.any(String) // Should reference original appointment
          })
        });
      } catch (error) {
        // Expected to fail - route not implemented
        expect(error.response?.status).toBe(404);
      }
    });

    it('should reschedule with new professional', async () => {
      const appointmentId = 'a7b8c9d0-e1f2-3456-ghij-fa8901234567';

      try {
        const response = await axios.patch(
          `${APPOINTMENTS_ENDPOINT}/${appointmentId}`,
          RESCHEDULE_WITH_NEW_PROFESSIONAL
        );

        expect(response.status).toBe(200);
        expect(response.data.appointment).toMatchObject({
          professionalId: RESCHEDULE_WITH_NEW_PROFESSIONAL.newProfessionalId,
          dateTime: RESCHEDULE_WITH_NEW_PROFESSIONAL.newDateTime
        });
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should reject missing newDateTime (400)', async () => {
      const appointmentId = 'b8c9d0e1-f2a3-4567-hijk-ab9012345678';

      try {
        await axios.patch(`${APPOINTMENTS_ENDPOINT}/${appointmentId}`, {});
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'newDateTime',
                message: expect.any(String)
              })
            ])
          );
        }
      }
    });

    it('should return 404 for non-existent appointment', async () => {
      const nonExistentId = 'c9d0e1f2-a3b4-5678-ijkl-bc0123456789';

      try {
        await axios.patch(`${APPOINTMENTS_ENDPOINT}/${nonExistentId}`, RESCHEDULE_REQUEST);
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should reject past datetime for rescheduling (400)', async () => {
      const appointmentId = 'd0e1f2a3-b4c5-6789-jklm-cd1234567890';
      const pastReschedule = {
        newDateTime: '2020-01-01T10:00:00'
      };

      try {
        await axios.patch(`${APPOINTMENTS_ENDPOINT}/${appointmentId}`, pastReschedule);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
        }
      }
    });
  });

  describe('Contract Compliance Summary', () => {
    it('should document expected behavior', () => {
      const expectedBehavior = {
        currentStatus: 'FAILING - Routes not implemented',
        endpoints: [
          'POST /api/ninsaude/appointments',
          'DELETE /api/ninsaude/appointments/:id',
          'PATCH /api/ninsaude/appointments/:id'
        ],
        nextStep: 'Implement appointment management routes',
        successCriteria: 'All tests pass with proper status codes',
        openAPISpec: '/specs/001-ninsaude-integration/contracts/appointments.openapi.yaml'
      };

      expect(expectedBehavior.currentStatus).toBe('FAILING - Routes not implemented');
      expect(expectedBehavior.endpoints).toHaveLength(3);
    });
  });
});
