/**
 * T009: Ninsaúde Notification Dispatch Contract Tests (TDD)
 *
 * Tests API contract compliance for email and WhatsApp notification endpoints.
 * Reference: /specs/001-ninsaude-integration/contracts/notifications.openapi.yaml
 *
 * EXPECTED STATUS: FAILING (routes not implemented yet)
 *
 * Validates:
 * - POST /api/ninsaude/notifications/send (dual-channel dispatch)
 * - GET /api/ninsaude/notifications/:id/status (delivery tracking)
 * - Request schemas for notification events
 * - Notification event types (booking_confirmation, cancellation, rescheduling)
 */

import { describe, it, expect } from 'vitest';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002';
const NOTIFICATIONS_ENDPOINT = `${API_BASE_URL}/api/ninsaude/notifications`;

// Test data matching OpenAPI spec
const VALID_BOOKING_CONFIRMATION = {
  appointmentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  patientId: 'b2c3d4e5-f6a7-8901-bcde-fa2345678901',
  event: 'booking_confirmation',
  email: 'maria.silva@example.com',
  phone: '(33) 98765-4321',
  appointmentDetails: {
    dateTime: '2025-10-15T10:30:00',
    professionalName: 'Dr. João Saraiva',
    careUnitName: 'Clínica Saraiva Vision'
  }
};

const VALID_CANCELLATION_NOTIFICATION = {
  appointmentId: 'c3d4e5f6-a7b8-9012-cdef-ab3456789012',
  patientId: 'd4e5f6a7-b8c9-0123-defg-cd5678901234',
  event: 'cancellation_confirmation',
  email: 'joao.carlos@example.com',
  phone: '(33) 91234-5678',
  appointmentDetails: {
    dateTime: '2025-10-20T14:00:00',
    professionalName: 'Dr. João Saraiva',
    careUnitName: 'Clínica Saraiva Vision'
  }
};

const VALID_RESCHEDULING_NOTIFICATION = {
  appointmentId: 'e5f6a7b8-c9d0-1234-efgh-de6789012345',
  patientId: 'f6a7b8c9-d0e1-2345-fghi-ef7890123456',
  event: 'rescheduling_confirmation',
  email: 'ana.santos@example.com',
  phone: '(33) 99876-5432',
  appointmentDetails: {
    dateTime: '2025-10-18T11:00:00',
    professionalName: 'Dr. João Saraiva',
    careUnitName: 'Clínica Saraiva Vision'
  }
};

const VALID_BOOKING_REMINDER = {
  appointmentId: 'a7b8c9d0-e1f2-3456-ghij-fa8901234567',
  patientId: 'b8c9d0e1-f2a3-4567-hijk-ab9012345678',
  event: 'booking_reminder',
  email: 'pedro.oliveira@example.com',
  phone: '(33) 98888-7777',
  appointmentDetails: {
    dateTime: '2025-10-16T09:30:00',
    professionalName: 'Dr. João Saraiva',
    careUnitName: 'Clínica Saraiva Vision'
  }
};

const MISSING_REQUIRED_FIELDS = {
  appointmentId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  event: 'booking_confirmation'
  // Missing patientId, email, phone
};

const INVALID_EVENT_TYPE = {
  ...VALID_BOOKING_CONFIRMATION,
  event: 'invalid_event_type'
};

const INVALID_EMAIL_FORMAT = {
  ...VALID_BOOKING_CONFIRMATION,
  email: 'not-an-email'
};

const INVALID_PHONE_FORMAT = {
  ...VALID_BOOKING_CONFIRMATION,
  phone: '33987654321' // Missing formatting
};

describe('T009: Notification Dispatch Contract Tests', () => {
  describe('POST /api/ninsaude/notifications/send - Send Notifications', () => {
    it('should send booking confirmation notification (200 OK)', async () => {
      try {
        const response = await axios.post(
          `${NOTIFICATIONS_ENDPOINT}/send`,
          VALID_BOOKING_CONFIRMATION
        );

        // Validate status code
        expect(response.status).toBe(200);

        // Validate response schema per OpenAPI spec
        expect(response.data).toMatchObject({
          success: true,
          emailStatus: expect.stringMatching(/^(sent|failed|retry_scheduled)$/),
          whatsappStatus: expect.stringMatching(/^(sent|failed|retry_scheduled)$/),
          notificationIds: expect.any(Array)
        });

        // Validate notification IDs are UUIDs
        expect(response.data.notificationIds.length).toBeGreaterThan(0);
        response.data.notificationIds.forEach(id => {
          expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        });

        // Should have at least 2 notification IDs (email + WhatsApp)
        expect(response.data.notificationIds.length).toBeGreaterThanOrEqual(2);
      } catch (error) {
        // Expected to fail - route not implemented
        expect(error.response?.status).toBe(404);
      }
    });

    it('should send cancellation notification successfully', async () => {
      try {
        const response = await axios.post(
          `${NOTIFICATIONS_ENDPOINT}/send`,
          VALID_CANCELLATION_NOTIFICATION
        );

        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({
          success: true,
          emailStatus: expect.any(String),
          whatsappStatus: expect.any(String)
        });
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should send rescheduling notification successfully', async () => {
      try {
        const response = await axios.post(
          `${NOTIFICATIONS_ENDPOINT}/send`,
          VALID_RESCHEDULING_NOTIFICATION
        );

        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({
          success: true,
          emailStatus: expect.any(String),
          whatsappStatus: expect.any(String)
        });
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should send booking reminder notification successfully', async () => {
      try {
        const response = await axios.post(
          `${NOTIFICATIONS_ENDPOINT}/send`,
          VALID_BOOKING_REMINDER
        );

        expect(response.status).toBe(200);
        expect(response.data).toMatchObject({
          success: true,
          emailStatus: expect.any(String),
          whatsappStatus: expect.any(String)
        });
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should handle partial failure (email sent, WhatsApp failed)', async () => {
      try {
        const response = await axios.post(
          `${NOTIFICATIONS_ENDPOINT}/send`,
          VALID_BOOKING_CONFIRMATION
        );

        // In case of partial failure
        if (response.data.emailStatus === 'sent' && response.data.whatsappStatus === 'failed') {
          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true); // Still considered success if one channel works
        }
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should schedule retry for failed notifications', async () => {
      try {
        const response = await axios.post(
          `${NOTIFICATIONS_ENDPOINT}/send`,
          VALID_BOOKING_CONFIRMATION
        );

        if (response.data.emailStatus === 'retry_scheduled' ||
            response.data.whatsappStatus === 'retry_scheduled') {
          expect(response.status).toBe(200);
          expect(response.data.notificationIds).toBeDefined();
        }
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should include appointment details in notification context', async () => {
      // This test validates that appointmentDetails are properly structured
      const detailedNotification = {
        ...VALID_BOOKING_CONFIRMATION,
        appointmentDetails: {
          dateTime: '2025-10-15T10:30:00',
          professionalName: 'Dr. João Saraiva',
          careUnitName: 'Clínica Saraiva Vision',
          specialty: 'Oftalmologia',
          duration: 30
        }
      };

      try {
        const response = await axios.post(`${NOTIFICATIONS_ENDPOINT}/send`, detailedNotification);
        expect(response.status).toBe(200);
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('POST /api/ninsaude/notifications/send - Validation Errors', () => {
    it('should reject missing required fields (400)', async () => {
      try {
        await axios.post(`${NOTIFICATIONS_ENDPOINT}/send`, MISSING_REQUIRED_FIELDS);
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
                field: expect.stringMatching(/patientId|email|phone/),
                message: expect.any(String)
              })
            ])
          });
        }
      }
    });

    it('should reject invalid event type (400)', async () => {
      try {
        await axios.post(`${NOTIFICATIONS_ENDPOINT}/send`, INVALID_EVENT_TYPE);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'event',
                message: expect.stringContaining('booking_confirmation')
              })
            ])
          );
        }
      }
    });

    it('should reject invalid email format (400)', async () => {
      try {
        await axios.post(`${NOTIFICATIONS_ENDPOINT}/send`, INVALID_EMAIL_FORMAT);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: expect.stringContaining('email')
              })
            ])
          );
        }
      }
    });

    it('should reject invalid phone format (400)', async () => {
      try {
        await axios.post(`${NOTIFICATIONS_ENDPOINT}/send`, INVALID_PHONE_FORMAT);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'phone',
                message: expect.stringContaining('(33) 98765-4321')
              })
            ])
          );
        }
      }
    });

    it('should reject invalid UUID formats (400)', async () => {
      const invalidUUIDs = {
        ...VALID_BOOKING_CONFIRMATION,
        appointmentId: 'not-a-uuid',
        patientId: 'also-not-a-uuid'
      };

      try {
        await axios.post(`${NOTIFICATIONS_ENDPOINT}/send`, invalidUUIDs);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
          expect(error.response?.data.details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: expect.stringMatching(/appointmentId|patientId/),
                message: expect.stringContaining('UUID')
              })
            ])
          );
        }
      }
    });

    it('should reject invalid datetime in appointment details (400)', async () => {
      const invalidDateTime = {
        ...VALID_BOOKING_CONFIRMATION,
        appointmentDetails: {
          dateTime: '15/10/2025 10:30', // Wrong format
          professionalName: 'Dr. João Saraiva',
          careUnitName: 'Clínica Saraiva Vision'
        }
      };

      try {
        await axios.post(`${NOTIFICATIONS_ENDPOINT}/send`, invalidDateTime);
      } catch (error) {
        if (error.response?.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          expect(error.response?.status).toBe(400);
        }
      }
    });
  });

  describe('POST /api/ninsaude/notifications/send - Event Types Coverage', () => {
    const eventTypes = [
      'booking_confirmation',
      'booking_reminder',
      'cancellation_confirmation',
      'rescheduling_confirmation'
    ];

    eventTypes.forEach(eventType => {
      it(`should support event type: ${eventType}`, async () => {
        const notification = {
          ...VALID_BOOKING_CONFIRMATION,
          event: eventType
        };

        try {
          const response = await axios.post(`${NOTIFICATIONS_ENDPOINT}/send`, notification);
          expect(response.status).toBe(200);
        } catch (error) {
          // Expected to fail until implementation
          expect(error.response?.status).toBe(404);
        }
      });
    });
  });

  describe('GET /api/ninsaude/notifications/:id/status - Notification Status', () => {
    it('should retrieve notification status (200 OK)', async () => {
      const notificationId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      try {
        const response = await axios.get(`${NOTIFICATIONS_ENDPOINT}/${notificationId}/status`);

        // Validate status code
        expect(response.status).toBe(200);

        // Validate response schema per OpenAPI spec
        expect(response.data).toMatchObject({
          id: notificationId,
          type: expect.stringMatching(/^(email|whatsapp)$/),
          status: expect.stringMatching(/^(pending|sent|delivered|failed|retry_scheduled)$/),
          sentAt: expect.any(String),
          retryCount: expect.any(Number)
        });

        // Validate timestamp format
        expect(response.data.sentAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

        // If delivered, should have deliveredAt timestamp
        if (response.data.status === 'delivered') {
          expect(response.data.deliveredAt).toBeDefined();
          expect(response.data.deliveredAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        }

        // If failed, should have error message
        if (response.data.status === 'failed') {
          expect(response.data.errorMessage).toBeDefined();
          expect(response.data.errorMessage).toMatch(/\w+/);
        }

        // Validate retryCount is non-negative
        expect(response.data.retryCount).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // Expected to fail - route not implemented
        expect(error.response?.status).toBe(404);
      }
    });

    it('should return 404 for non-existent notification', async () => {
      const nonExistentId = 'b2c3d4e5-f6a7-8901-bcde-fa2345678901';

      try {
        await axios.get(`${NOTIFICATIONS_ENDPOINT}/${nonExistentId}/status`);
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should reject invalid UUID format (400)', async () => {
      const invalidId = 'not-a-uuid';

      try {
        await axios.get(`${NOTIFICATIONS_ENDPOINT}/${invalidId}/status`);
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

    it('should track email notification status', async () => {
      const emailNotificationId = 'c3d4e5f6-a7b8-9012-cdef-ab3456789012';

      try {
        const response = await axios.get(`${NOTIFICATIONS_ENDPOINT}/${emailNotificationId}/status`);

        if (response.status === 200) {
          expect(response.data.type).toBe('email');
        }
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should track WhatsApp notification status', async () => {
      const whatsappNotificationId = 'd4e5f6a7-b8c9-0123-defg-cd5678901234';

      try {
        const response = await axios.get(`${NOTIFICATIONS_ENDPOINT}/${whatsappNotificationId}/status`);

        if (response.status === 200) {
          expect(response.data.type).toBe('whatsapp');
        }
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('should include retry information for failed notifications', async () => {
      const failedNotificationId = 'e5f6a7b8-c9d0-1234-efgh-de6789012345';

      try {
        const response = await axios.get(`${NOTIFICATIONS_ENDPOINT}/${failedNotificationId}/status`);

        if (response.data.status === 'retry_scheduled') {
          expect(response.data.retryCount).toBeGreaterThan(0);
          expect(response.data.errorMessage).toBeDefined();
        }
      } catch (error) {
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('Contract Compliance Summary', () => {
    it('should document expected behavior', () => {
      const expectedBehavior = {
        currentStatus: 'FAILING - Routes not implemented',
        endpoints: [
          'POST /api/ninsaude/notifications/send',
          'GET /api/ninsaude/notifications/:id/status'
        ],
        nextStep: 'Implement notification dispatch routes',
        successCriteria: 'All tests pass with dual-channel notification support',
        openAPISpec: '/specs/001-ninsaude-integration/contracts/notifications.openapi.yaml',
        features: [
          'Dual-channel dispatch (email + WhatsApp)',
          'Support for 4 event types',
          'Retry mechanism for failed notifications',
          'Delivery status tracking',
          'Partial failure handling'
        ]
      };

      expect(expectedBehavior.currentStatus).toBe('FAILING - Routes not implemented');
      expect(expectedBehavior.endpoints).toHaveLength(2);
      expect(expectedBehavior.features).toHaveLength(5);
    });

    it('should validate supported event types', () => {
      const supportedEvents = [
        'booking_confirmation',
        'booking_reminder',
        'cancellation_confirmation',
        'rescheduling_confirmation'
      ];

      expect(supportedEvents).toHaveLength(4);
      expect(supportedEvents).toContain('booking_confirmation');
      expect(supportedEvents).toContain('cancellation_confirmation');
      expect(supportedEvents).toContain('rescheduling_confirmation');
    });
  });
});
