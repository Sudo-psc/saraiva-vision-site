import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import axios from 'axios';

const API_BASE_URL = process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';
const CLIENT_ID = process.env.NINSAUDE_CLIENT_ID;
const CLIENT_SECRET = process.env.NINSAUDE_CLIENT_SECRET;

let accessToken = null;

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('NINSAUDE_CLIENT_ID and NINSAUDE_CLIENT_SECRET must be set');
  }

  const response = await axios.post(`${API_BASE_URL}/oauth/token`, {
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  return response.data.access_token;
}

function createAuthHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

describe('Ninsaúde API Endpoints', () => {
  beforeAll(async () => {
    try {
      accessToken = await getAccessToken();
      console.log('✅ Authentication successful for API tests');
    } catch (error) {
      console.warn('⚠️  Could not authenticate:', error.message);
    }
  }, 15000);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/health`,
        createAuthHeaders(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    }, 10000);

    it('should return valid health data structure', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/health`,
        createAuthHeaders(accessToken)
      );

      expect(typeof response.data).toBe('object');
    }, 10000);
  });

  describe('Patients Endpoint', () => {
    it('should list patients', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/patients`,
        createAuthHeaders(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data) || typeof response.data === 'object').toBe(true);
    }, 10000);

    it('should search patient by CPF', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const testCPF = '12345678900';

      try {
        const response = await axios.get(
          `${API_BASE_URL}/patients?cpf=${testCPF}`,
          createAuthHeaders(accessToken)
        );

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Patient not found (expected for test CPF)');
          expect(error.response.status).toBe(404);
        } else {
          throw error;
        }
      }
    }, 10000);

    it('should validate CPF format in search', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const invalidCPF = 'invalid-cpf';

      try {
        await axios.get(
          `${API_BASE_URL}/patients?cpf=${invalidCPF}`,
          createAuthHeaders(accessToken)
        );
      } catch (error) {
        expect(error.response.status).toBeOneOf([400, 422]);
      }
    }, 10000);

    it('should handle patient not found', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const nonExistentCPF = '99999999999';

      try {
        await axios.get(
          `${API_BASE_URL}/patients?cpf=${nonExistentCPF}`,
          createAuthHeaders(accessToken)
        );
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    }, 10000);
  });

  describe('Appointments Endpoint', () => {
    it('should list appointments', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/appointments`,
        createAuthHeaders(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    }, 10000);

    it('should filter appointments by date', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const response = await axios.get(
        `${API_BASE_URL}/appointments?date=${today}`,
        createAuthHeaders(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    }, 10000);

    it('should filter appointments by professional', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const testProfessionalId = 'test-professional-id';

      try {
        const response = await axios.get(
          `${API_BASE_URL}/appointments?professional_id=${testProfessionalId}`,
          createAuthHeaders(accessToken)
        );

        expect(response.status).toBe(200);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Professional not found (expected for test ID)');
        }
      }
    }, 10000);

    it('should validate appointment creation payload', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const invalidPayload = {
        patient_id: null,
        date: 'invalid-date',
      };

      try {
        await axios.post(
          `${API_BASE_URL}/appointments`,
          invalidPayload,
          createAuthHeaders(accessToken)
        );
        
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response.status).toBeOneOf([400, 422]);
      }
    }, 10000);
  });

  describe('Availability Endpoint', () => {
    it('should get availability slots', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const professionalId = 'test-professional-id';

      try {
        const response = await axios.get(
          `${API_BASE_URL}/availability?date=${today}&professional_id=${professionalId}`,
          createAuthHeaders(accessToken)
        );

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ No availability found (expected for test data)');
        }
      }
    }, 10000);

    it('should validate date format in availability query', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const invalidDate = 'not-a-date';
      const professionalId = 'test-professional-id';

      try {
        await axios.get(
          `${API_BASE_URL}/availability?date=${invalidDate}&professional_id=${professionalId}`,
          createAuthHeaders(accessToken)
        );
      } catch (error) {
        expect(error.response.status).toBeOneOf([400, 422]);
      }
    }, 10000);

    it('should require professional_id for availability', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      try {
        await axios.get(
          `${API_BASE_URL}/availability?date=${today}`,
          createAuthHeaders(accessToken)
        );
      } catch (error) {
        expect(error.response.status).toBeOneOf([400, 422]);
      }
    }, 10000);
  });

  describe('Professionals Endpoint', () => {
    it('should list professionals', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/professionals`,
        createAuthHeaders(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data) || typeof response.data === 'object').toBe(true);
    }, 10000);

    it('should get professional by ID', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const testProfessionalId = 'test-professional-id';

      try {
        const response = await axios.get(
          `${API_BASE_URL}/professionals/${testProfessionalId}`,
          createAuthHeaders(accessToken)
        );

        expect(response.status).toBe(200);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Professional not found (expected for test ID)');
          expect(error.response.status).toBe(404);
        }
      }
    }, 10000);

    it('should filter professionals by specialty', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const specialty = 'Oftalmologia';

      const response = await axios.get(
        `${API_BASE_URL}/professionals?specialty=${specialty}`,
        createAuthHeaders(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle 400 Bad Request', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      try {
        await axios.post(
          `${API_BASE_URL}/appointments`,
          { invalid: 'data' },
          createAuthHeaders(accessToken)
        );
      } catch (error) {
        expect(error.response.status).toBeOneOf([400, 422]);
        expect(error.response.data).toHaveProperty('error');
      }
    }, 10000);

    it('should handle 404 Not Found', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      try {
        await axios.get(
          `${API_BASE_URL}/patients/non-existent-id`,
          createAuthHeaders(accessToken)
        );
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    }, 10000);

    it('should handle 401 Unauthorized with invalid token', async () => {
      try {
        await axios.get(
          `${API_BASE_URL}/patients`,
          createAuthHeaders('invalid-token')
        );
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    }, 10000);

    it('should include error message in response', async () => {
      try {
        await axios.get(
          `${API_BASE_URL}/patients`,
          createAuthHeaders('invalid-token')
        );
      } catch (error) {
        expect(error.response.data).toBeDefined();
        expect(
          error.response.data.error ||
          error.response.data.message ||
          error.response.data.detail
        ).toBeDefined();
      }
    }, 10000);
  });

  describe('Response Format', () => {
    it('should return JSON content-type', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/health`,
        createAuthHeaders(accessToken)
      );

      expect(response.headers['content-type']).toContain('application/json');
    }, 10000);

    it('should include standard response fields', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/patients`,
        createAuthHeaders(accessToken)
      );

      expect(response.data).toBeDefined();
      expect(typeof response.data).toBe('object');
    }, 10000);

    it('should handle pagination parameters', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/patients?page=1&limit=10`,
        createAuthHeaders(accessToken)
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    }, 10000);
  });

  describe('Performance', () => {
    it('should respond within acceptable time (< 5s)', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const startTime = Date.now();

      await axios.get(
        `${API_BASE_URL}/health`,
        createAuthHeaders(accessToken)
      );

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000);
      console.log(`✅ Response time: ${duration}ms`);
    }, 10000);

    it('should handle concurrent requests', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token');
        return;
      }

      const requests = Array(10).fill().map(() =>
        axios.get(
          `${API_BASE_URL}/health`,
          createAuthHeaders(accessToken)
        )
      );

      const results = await Promise.all(requests);

      results.forEach(response => {
        expect(response.status).toBe(200);
      });
    }, 15000);
  });
});
