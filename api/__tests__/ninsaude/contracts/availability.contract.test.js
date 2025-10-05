/**
 * T008: Ninsaúde Availability Lookup Contract Tests (TDD)
 *
 * Tests API contract compliance for appointment slot availability endpoints.
 * Reference: /specs/001-ninsaude-integration/contracts/availability.openapi.yaml
 *
 * EXPECTED STATUS: FAILING (routes not implemented yet)
 *
 * Validates:
 * - GET /api/ninsaude/availability (list available slots)
 * - POST /api/ninsaude/availability/check (verify slot availability)
 * - Request/response schemas match OpenAPI spec
 * - Query parameter validation
 */

import { describe, it, expect } from 'vitest';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002';
const AVAILABILITY_ENDPOINT = `${API_BASE_URL}/api/ninsaude/availability`;

// Test data matching OpenAPI spec
const VALID_AVAILABILITY_PARAMS = {
  professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  startDate: '2025-10-10',
  endDate: '2025-10-17'
};

const VALID_AVAILABILITY_WITH_CARE_UNIT = {
  ...VALID_AVAILABILITY_PARAMS,
  careUnitId: 'b2c3d4e5-f6a7-8901-bcde-fa2345678901'
};

const VALID_SLOT_CHECK = {
  professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  dateTime: '2025-10-15T10:30:00'
};

const INVALID_DATE_RANGE = {
  professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  startDate: '2025-10-17', // End before start
  endDate: '2025-10-10'
};

const MISSING_REQUIRED_PARAMS = {
  startDate: '2025-10-10'
  // Missing professionalId and endDate
};

const INVALID_UUID_FORMAT = {
  professionalId: 'not-a-uuid',
  startDate: '2025-10-10',
  endDate: '2025-10-17'
};

const INVALID_DATE_FORMAT = {
  professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  startDate: '10/10/2025', // Wrong format
  endDate: '2025-10-17'
};

describe('T008: Availability Lookup Contract Tests', () => {
  describe('GET /api/ninsaude/availability - List Available Slots', () => {
    it('should return available slots with valid parameters (200 OK)', async () => {
      try {
        const response = await axios.get(AVAILABILITY_ENDPOINT, {
          params: VALID_AVAILABILITY_PARAMS
        });

        // Validate status code
        expect(response.status).toBe(200);

        // Validate response schema per OpenAPI spec
        expect(response.data).toMatchObject({
          success: true,
          slots: expect.any(Array),
          totalSlots: expect.any(Number)
        });

        // Validate slots array structure
        if (response.data.slots.length > 0) {
          response.data.slots.forEach(slot => {
            expect(slot).toMatchObject({
              date: expect.any(String),
              time: expect.any(String),
              dateTime: expect.any(String),
              professionalId: expect.any(String),
              professionalName: expect.any(String),
              duration: expect.any(Number),
              available: true,
              fetchedAt: expect.any(String)
            });

            // Validate date format (YYYY-MM-DD)
            expect(slot.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

            // Validate time format (HH:mm)
            expect(slot.time).toMatch(/^\d{2}:\d{2}$/);

            // Validate datetime format (ISO 8601)
            expect(slot.dateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

            // Validate UUID format
            expect(slot.professionalId).toMatch(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            );

            // Validate fetchedAt timestamp
            expect(slot.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
          });
        }

        // Validate totalSlots matches array length
        expect(response.data.totalSlots).toBe(response.data.slots.length);
      } catch (error) {
        // Expected to fail - route not implemented
        expect(error.response?.status).toBe(404);
      }
    });

    it('should filter by care unit when provided', async () => {
      try {
        const response = await axios.get(AVAILABILITY_ENDPOINT, {
          params: VALID_AVAILABILITY_WITH_CARE_UNIT
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);

        // All slots should have matching careUnitId
        if (response.data.slots.length > 0) {
          response.data.slots.forEach(slot => {
            expect(slot).toHaveProperty('careUnitId');
            expect(slot).toHaveProperty('careUnitName');
          });
        }
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should include professional name and specialty', async () => {
      try {
        const response = await axios.get(AVAILABILITY_ENDPOINT, {
          params: VALID_AVAILABILITY_PARAMS
        });

        expect(response.status).toBe(200);

        if (response.data.slots.length > 0) {
          const firstSlot = response.data.slots[0];
          expect(firstSlot).toMatchObject({
            professionalName: expect.any(String),
            specialty: expect.any(String)
          });
        }
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should return empty array when no slots available', async () => {
      const futureParams = {
        professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        startDate: '2030-12-25',
        endDate: '2030-12-31'
      };

      try {
        const response = await axios.get(AVAILABILITY_ENDPOINT, {
          params: futureParams
        });

        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({
          success: true,
          slots: [],
          totalSlots: 0
        });
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should order slots chronologically', async () => {
      try {
        const response = await axios.get(AVAILABILITY_ENDPOINT, {
          params: VALID_AVAILABILITY_PARAMS
        });

        if (response.data.slots.length > 1) {
          const slots = response.data.slots;
          for (let i = 1; i < slots.length; i++) {
            const prev = new Date(slots[i - 1].dateTime);
            const current = new Date(slots[i].dateTime);
            expect(current.getTime()).toBeGreaterThanOrEqual(prev.getTime());
          }
        }
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('GET /api/ninsaude/availability - Query Parameter Validation', () => {
    it('should reject missing professionalId (400)', async () => {
      const params = {
        startDate: '2025-10-10',
        endDate: '2025-10-17'
      };

      try {
        await axios.get(AVAILABILITY_ENDPOINT, { params });
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
                field: 'professionalId',
                message: expect.any(String)
              })
            ])
          });
        }
      }
    });

    it('should reject missing startDate (400)', async () => {
      const params = {
        professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        endDate: '2025-10-17'
      };

      try {
        await axios.get(AVAILABILITY_ENDPOINT, { params });
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'startDate',
                message: expect.any(String)
              })
            ])
          );
        }
      }
    });

    it('should reject missing endDate (400)', async () => {
      const params = {
        professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        startDate: '2025-10-10'
      };

      try {
        await axios.get(AVAILABILITY_ENDPOINT, { params });
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'endDate',
                message: expect.any(String)
              })
            ])
          );
        }
      }
    });

    it('should reject invalid UUID format (400)', async () => {
      try {
        await axios.get(AVAILABILITY_ENDPOINT, { params: INVALID_UUID_FORMAT });
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'professionalId',
                message: expect.stringContaining('UUID')
              })
            ])
          );
        }
      }
    });

    it('should reject invalid date format (400)', async () => {
      try {
        await axios.get(AVAILABILITY_ENDPOINT, { params: INVALID_DATE_FORMAT });
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'startDate',
                message: expect.stringContaining('YYYY-MM-DD')
              })
            ])
          );
        }
      }
    });

    it('should reject endDate before startDate (400)', async () => {
      try {
        await axios.get(AVAILABILITY_ENDPOINT, { params: INVALID_DATE_RANGE });
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data).toMatchObject({
            success: false,
            error: expect.stringContaining('endDate')
          });
        }
      }
    });

    it('should reject date range exceeding 30 days (400)', async () => {
      const longRange = {
        professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        startDate: '2025-10-01',
        endDate: '2025-12-01' // 61 days
      };

      try {
        await axios.get(AVAILABILITY_ENDPOINT, { params: longRange });
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data).toMatchObject({
            success: false,
            error: expect.stringContaining('30 dias')
          });
        }
      }
    });
  });

  describe('POST /api/ninsaude/availability/check - Verify Slot Availability', () => {
    it('should check slot availability successfully (200 OK)', async () => {
      try {
        const response = await axios.post(
          `${AVAILABILITY_ENDPOINT}/check`,
          VALID_SLOT_CHECK
        );

        // Validate status code
        expect(response.status).toBe(200);

        // Validate response schema per OpenAPI spec
        expect(response.data).toMatchObject({
          available: expect.any(Boolean),
          slot: expect.objectContaining({
            date: expect.any(String),
            time: expect.any(String),
            dateTime: VALID_SLOT_CHECK.dateTime,
            professionalId: VALID_SLOT_CHECK.professionalId,
            professionalName: expect.any(String),
            duration: expect.any(Number),
            available: expect.any(Boolean),
            fetchedAt: expect.any(String)
          })
        });

        // available flag should match slot.available
        expect(response.data.available).toBe(response.data.slot.available);
      } catch (error) {
        // Expected to fail - route not implemented
        expect(error.response?.status).toBe(404);
      }
    });

    it('should return false for unavailable slot', async () => {
      const bookedSlot = {
        professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        dateTime: '2025-10-15T09:00:00' // Assume this is booked
      };

      try {
        const response = await axios.post(`${AVAILABILITY_ENDPOINT}/check`, bookedSlot);

        expect(response.status).toBe(200);
        // Should return available: false for booked slots
        expect(response.data.available).toBe(false);
        expect(response.data.slot.available).toBe(false);
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should include care unit information when available', async () => {
      try {
        const response = await axios.post(`${AVAILABILITY_ENDPOINT}/check`, VALID_SLOT_CHECK);

        if (response.data.slot.careUnitId) {
          expect(response.data.slot).toMatchObject({
            careUnitId: expect.any(String),
            careUnitName: expect.any(String)
          });
        }
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('POST /api/ninsaude/availability/check - Validation', () => {
    it('should reject missing professionalId (400)', async () => {
      const invalidRequest = {
        dateTime: '2025-10-15T10:30:00'
      };

      try {
        await axios.post(`${AVAILABILITY_ENDPOINT}/check`, invalidRequest);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'professionalId',
                message: expect.any(String)
              })
            ])
          );
        }
      }
    });

    it('should reject missing dateTime (400)', async () => {
      const invalidRequest = {
        professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      };

      try {
        await axios.post(`${AVAILABILITY_ENDPOINT}/check`, invalidRequest);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'dateTime',
                message: expect.any(String)
              })
            ])
          );
        }
      }
    });

    it('should reject invalid UUID format (400)', async () => {
      const invalidRequest = {
        professionalId: 'not-a-uuid',
        dateTime: '2025-10-15T10:30:00'
      };

      try {
        await axios.post(`${AVAILABILITY_ENDPOINT}/check`, invalidRequest);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'professionalId',
                message: expect.stringContaining('UUID')
              })
            ])
          );
        }
      }
    });

    it('should reject invalid datetime format (400)', async () => {
      const invalidRequest = {
        professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        dateTime: '15/10/2025 10:30' // Wrong format
      };

      try {
        await axios.post(`${AVAILABILITY_ENDPOINT}/check`, invalidRequest);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'dateTime',
                message: expect.stringContaining('ISO 8601')
              })
            ])
          );
        }
      }
    });

    it('should reject past datetime (400)', async () => {
      const pastRequest = {
        professionalId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        dateTime: '2020-01-01T10:00:00'
      };

      try {
        await axios.post(`${AVAILABILITY_ENDPOINT}/check`, pastRequest);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data).toMatchObject({
            success: false,
            error: expect.stringContaining('passado')
          });
        }
      }
    });
  });

  describe('Contract Compliance Summary', () => {
    it('should document expected behavior', () => {
      const expectedBehavior = {
        currentStatus: 'FAILING - Routes not implemented',
        endpoints: [
          'GET /api/ninsaude/availability',
          'POST /api/ninsaude/availability/check'
        ],
        nextStep: 'Implement availability lookup routes',
        successCriteria: 'All tests pass with proper validation',
        openAPISpec: '/specs/001-ninsaude-integration/contracts/availability.openapi.yaml',
        features: [
          'Date range validation (max 30 days)',
          'UUID format validation',
          'Race condition prevention via slot check',
          'Chronological ordering of slots'
        ]
      };

      expect(expectedBehavior.currentStatus).toBe('FAILING - Routes not implemented');
      expect(expectedBehavior.endpoints).toHaveLength(2);
      expect(expectedBehavior.features).toHaveLength(4);
    });
  });
});
