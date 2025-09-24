/**
 * Medical Test Utilities
 * Utilities for testing medical workflows and LGPD compliance
 */

import { vi } from 'vitest';

// Mock LGPD compliance system
export const mockLGPDCompliance = {
  consentRecord: null,
  emailLog: [],
  emergencyAlerts: [],
  auditTrail: [],

  reset() {
    this.consentRecord = null;
    this.emailLog = [];
    this.emergencyAlerts = [];
    this.auditTrail = [];
  },

  recordConsent(data) {
    this.consentRecord = {
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 Test',
      ...data
    };
  },

  getConsentRecord() {
    return this.consentRecord;
  },

  logEmail(emailData) {
    this.emailLog.push({
      timestamp: new Date().toISOString(),
      ...emailData
    });
  },

  getEmailLog() {
    return this.emailLog;
  },

  addEmergencyAlert(alert) {
    this.emergencyAlerts.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...alert
    });
  },

  getEmergencyAlerts() {
    return this.emergencyAlerts;
  },

  addAuditEntry(entry) {
    this.auditTrail.push({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...entry
    });
  },

  getAuditTrail(patientId = null) {
    if (patientId) {
      return this.auditTrail.filter(entry => entry.patientId === patientId);
    }
    return this.auditTrail;
  }
};

// Test environment setup
export async function setupTestEnvironment() {
  // Mock APIs
  global.fetch = vi.fn();

  // Mock localStorage and sessionStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };

  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };

  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

  // Mock medical API responses
  global.fetch.mockImplementation((url, options) => {
    const urlPath = new URL(url, 'http://localhost').pathname;

    // Health check endpoints
    if (urlPath.includes('/health')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ status: 'healthy' })
      });
    }

    // Appointment endpoints
    if (urlPath.includes('/appointments')) {
      if (options?.method === 'POST') {
        // Mock appointment creation
        const appointmentData = JSON.parse(options.body || '{}');
        mockLGPDCompliance.logEmail({
          to: appointmentData.patient?.email,
          type: 'appointment_confirmation',
          subject: 'Confirmação de Agendamento - Saraiva Vision'
        });

        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({
            id: Math.random().toString(36).substr(2, 9),
            ...appointmentData,
            status: 'confirmed',
            timestamp: new Date().toISOString()
          })
        });
      }

      if (options?.method === 'GET') {
        // Mock available slots
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                availableSlots: [
                  {
                    id: 'slot-2025-01-20-14:00',
                    date: '2025-01-20',
                    time: '14:00',
                    specialty: 'oftalmologia-geral',
                    doctor: 'Dr. João Saraiva'
                  },
                  {
                    id: 'slot-2025-01-20-15:00',
                    date: '2025-01-20',
                    time: '15:00',
                    specialty: 'oftalmologia-geral',
                    doctor: 'Dr. João Saraiva'
                  }
                ]
              })
            });
          }, Math.random() * 2000); // Simulate network delay up to 2s
        });
      }
    }

    // Patient data endpoints
    if (urlPath.includes('/patient-data')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          id: 'patient-123',
          name: 'João Silva',
          email: 'joao@example.com',
          appointments: [],
          medicalHistory: [],
          consentStatus: mockLGPDCompliance.getConsentRecord()
        })
      });
    }

    // Emergency endpoints
    if (urlPath.includes('/emergency-contact')) {
      const emergencyData = JSON.parse(options.body || '{}');
      mockLGPDCompliance.addEmergencyAlert({
        type: emergencyData.type,
        status: 'active',
        patientName: emergencyData.name,
        description: emergencyData.description
      });

      return Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          id: Math.random().toString(36).substr(2, 9),
          status: 'received',
          estimatedResponse: '15 minutes'
        })
      });
    }

    // LGPD compliance endpoints
    if (urlPath.includes('/lgpd/consent')) {
      if (options?.method === 'POST') {
        const consentData = JSON.parse(options.body || '{}');
        mockLGPDCompliance.recordConsent(consentData);
        mockLGPDCompliance.addAuditEntry({
          action: 'consent_given',
          patientId: consentData.patientId,
          categories: consentData.categories
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockLGPDCompliance.getConsentRecord())
      });
    }

    if (urlPath.includes('/lgpd/data-deletion')) {
      const deletionData = JSON.parse(options.body || '{}');
      mockLGPDCompliance.addAuditEntry({
        action: 'data_deletion_requested',
        patientId: deletionData.patientId,
        reason: deletionData.reason || 'patient_request'
      });

      return Promise.resolve({
        ok: true,
        status: 202,
        json: () => Promise.resolve({
          requestId: Math.random().toString(36).substr(2, 9),
          status: 'processing',
          estimatedCompletion: '30 days'
        })
      });
    }

    // Default fallback
    return Promise.reject(new Error(`Unhandled request: ${url}`));
  });

  // Mock circuit breaker
  vi.mock('../../src/utils/circuitBreaker.js', () => ({
    medicalApiFetch: vi.fn().mockImplementation((endpoint, options) => {
      return global.fetch(endpoint, options).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json().then(data => ({
          data,
          source: 'api',
          timestamp: new Date().toISOString()
        }));
      }).catch(error => {
        // Circuit breaker fallback logic
        if (endpoint.includes('/appointments')) {
          return {
            data: JSON.parse(localStorage.getItem('appointments_cache') || '[]'),
            source: 'fallback',
            message: 'Using cached appointment data. Please verify by phone if urgent.',
            timestamp: new Date().toISOString()
          };
        }

        if (endpoint.includes('/emergency-contact')) {
          return {
            data: {
              emergency: true,
              contact: {
                phone: '(11) 99999-9999',
                whatsapp: '5511999999999'
              }
            },
            source: 'fallback',
            message: 'Service unavailable. Please call emergency line.',
            timestamp: new Date().toISOString()
          };
        }

        throw error;
      });
    }),
    medicalApiCircuitBreaker: {
      getStatus: vi.fn(() => ({
        state: 'CLOSED',
        failureCount: 0,
        isHealthy: true
      }))
    }
  }));

  return {
    mockLGPDCompliance,
    cleanup: async () => {
      vi.clearAllMocks();
      mockLGPDCompliance.reset();
    }
  };
}

// Create test patient
export async function createTestPatient(patientData) {
  const testPatient = {
    id: `test-patient-${Date.now()}`,
    ...patientData,
    createdAt: new Date().toISOString(),
    consentStatus: {
      essential_medical: true,
      marketing: false,
      analytics: false,
      research: false
    }
  };

  // Record patient creation in audit trail
  mockLGPDCompliance.addAuditEntry({
    action: 'patient_created',
    patientId: testPatient.id,
    data: patientData
  });

  return testPatient;
}

// Verify audit trail
export async function verifyAuditTrail(patientId) {
  // Simulate audit trail query delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const auditEntries = mockLGPDCompliance.getAuditTrail(patientId);

  // Verify audit entries have required fields
  auditEntries.forEach(entry => {
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('timestamp');
    expect(entry).toHaveProperty('action');
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  return auditEntries;
}

// Clean up test data
export async function cleanupTestData() {
  // In a real implementation, this would clean up test data from the database
  mockLGPDCompliance.reset();

  // Clear any cached data
  if (typeof window !== 'undefined') {
    window.localStorage?.clear();
    window.sessionStorage?.clear();
  }

  vi.clearAllMocks();
}

// Mock medical system responses
export function mockMedicalSystemError(endpoint, errorType = 'SERVICE_UNAVAILABLE') {
  global.fetch.mockImplementation((url) => {
    if (url.includes(endpoint)) {
      return Promise.reject(new Error(errorType));
    }
    // Call original implementation for other endpoints
    return vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    })(url);
  });
}

// Simulate system load
export async function simulateSystemLoad(concurrentRequests = 10) {
  const requests = Array(concurrentRequests).fill().map(async (_, index) => {
    const delay = Math.random() * 1000; // Random delay up to 1s
    await new Promise(resolve => setTimeout(resolve, delay));

    return global.fetch('/api/health').then(response => ({
      index,
      status: response.status,
      duration: delay
    }));
  });

  const results = await Promise.allSettled(requests);
  return {
    total: results.length,
    successful: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
    results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
  };
}

// Medical data validation utilities
export function validateMedicalDataStructure(data) {
  const requiredFields = ['id', 'timestamp', 'patientId'];
  const missingFields = requiredFields.filter(field => !(field in data));

  if (missingFields.length > 0) {
    throw new Error(`Missing required medical data fields: ${missingFields.join(', ')}`);
  }

  // Validate timestamp format
  if (!data.timestamp.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    throw new Error('Invalid timestamp format in medical data');
  }

  return true;
}

// LGPD compliance validation
export function validateLGPDCompliance(consentRecord) {
  const requiredFields = ['timestamp', 'ipAddress', 'consentGiven', 'categories'];
  const missingFields = requiredFields.filter(field => !(field in consentRecord));

  if (missingFields.length > 0) {
    throw new Error(`Missing required LGPD consent fields: ${missingFields.join(', ')}`);
  }

  // Validate consent categories
  const requiredCategories = ['essential_medical', 'marketing', 'analytics', 'research'];
  const providedCategories = Object.keys(consentRecord.categories || {});
  const missingCategories = requiredCategories.filter(cat => !providedCategories.includes(cat));

  if (missingCategories.length > 0) {
    throw new Error(`Missing consent categories: ${missingCategories.join(', ')}`);
  }

  return true;
}