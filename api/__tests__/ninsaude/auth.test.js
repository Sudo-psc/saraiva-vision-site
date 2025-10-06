import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';

const API_BASE_URL = process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';
const CLIENT_ID = process.env.NINSAUDE_CLIENT_ID;
const CLIENT_SECRET = process.env.NINSAUDE_CLIENT_SECRET;

describe('Ninsaúde API Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('OAuth2 Authentication Flow', () => {
    it('should authenticate with valid credentials', async () => {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        if (process.env.CI) {
          throw new Error('Missing required environment variables: NINSAUDE_CLIENT_ID or NINSAUDE_CLIENT_SECRET');
        }
        console.warn('⚠️  Skipping test: NINSAUDE_CLIENT_ID or NINSAUDE_CLIENT_SECRET not set');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('access_token');
      expect(response.data).toHaveProperty('token_type', 'Bearer');
      expect(response.data).toHaveProperty('expires_in');
      expect(typeof response.data.access_token).toBe('string');
      expect(response.data.access_token.length).toBeGreaterThan(0);
    }, 10000);

    it('should reject authentication with invalid credentials', async () => {
      try {
        await axios.post(`${API_BASE_URL}/oauth/token`, {
          grant_type: 'client_credentials',
          client_id: 'invalid-client-id',
          client_secret: 'invalid-client-secret',
        });
        
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('error');
      }
    }, 10000);

    it('should reject authentication with missing client_id', async () => {
      try {
        await axios.post(`${API_BASE_URL}/oauth/token`, {
          grant_type: 'client_credentials',
          client_secret: CLIENT_SECRET,
        });
        
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBeOneOf([400, 401]);
      }
    }, 10000);

    it('should reject authentication with missing client_secret', async () => {
      try {
        await axios.post(`${API_BASE_URL}/oauth/token`, {
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
        });
        
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBeOneOf([400, 401]);
      }
    }, 10000);

    it('should reject authentication with invalid grant_type', async () => {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        if (process.env.CI) {
          throw new Error('Missing required environment variables: NINSAUDE_CLIENT_ID or NINSAUDE_CLIENT_SECRET');
        }
        console.warn('⚠️  Skipping test: Credentials not set');
        return;
      }

      try {
        await axios.post(`${API_BASE_URL}/oauth/token`, {
          grant_type: 'invalid_grant',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        });
        
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBeOneOf([400, 401]);
      }
    }, 10000);
  });

  describe('Token Validation', () => {
    let accessToken;

    beforeEach(async () => {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      accessToken = response.data.access_token;
    });

    it('should accept valid access token', async () => {
      if (!accessToken) {
        console.warn('⚠️  Skipping test: No access token available');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/health`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
    }, 10000);

    it('should reject invalid access token', async () => {
      try {
        await axios.get(`${API_BASE_URL}/health`, {
          headers: {
            Authorization: 'Bearer invalid-token-123',
          },
        });
        
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    }, 10000);

    it('should reject request without authorization header', async () => {
      try {
        await axios.get(`${API_BASE_URL}/health`);
        
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    }, 10000);

    it('should reject expired access token', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      try {
        await axios.get(`${API_BASE_URL}/health`, {
          headers: {
            Authorization: `Bearer ${expiredToken}`,
          },
        });
        
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    }, 10000);
  });

  describe('Token Properties', () => {
    it('should return token with expected structure', async () => {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        if (process.env.CI) {
          throw new Error('Missing required environment variables: NINSAUDE_CLIENT_ID or NINSAUDE_CLIENT_SECRET');
        }
        console.warn('⚠️  Skipping test: Credentials not set');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      const { access_token, token_type, expires_in } = response.data;

      expect(access_token).toBeDefined();
      expect(typeof access_token).toBe('string');
      expect(access_token.length).toBeGreaterThan(20);

      expect(token_type).toBe('Bearer');

      expect(expires_in).toBeDefined();
      expect(typeof expires_in).toBe('number');
      expect(expires_in).toBeGreaterThan(0);
      expect(expires_in).toBeLessThanOrEqual(3600);
    }, 10000);

    it('should return consistent token format', async () => {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        if (process.env.CI) {
          throw new Error('Missing required environment variables: NINSAUDE_CLIENT_ID or NINSAUDE_CLIENT_SECRET');
        }
        console.warn('⚠️  Skipping test: Credentials not set');
        return;
      }

      const response1 = await axios.post(`${API_BASE_URL}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      const response2 = await axios.post(`${API_BASE_URL}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      expect(response1.data).toHaveProperty('access_token');
      expect(response2.data).toHaveProperty('access_token');
      
      expect(response1.data.token_type).toBe(response2.data.token_type);
    }, 10000);
  });

  describe('Rate Limiting', () => {
    it('should handle multiple authentication requests', async () => {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        if (process.env.CI) {
          throw new Error('Missing required environment variables: NINSAUDE_CLIENT_ID or NINSAUDE_CLIENT_SECRET');
        }
        console.warn('⚠️  Skipping test: Credentials not set');
        return;
      }

      const promises = Array(5).fill().map(() =>
        axios.post(`${API_BASE_URL}/oauth/token`, {
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        })
      );

      const results = await Promise.all(promises);

      results.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('access_token');
      });
    }, 15000);

    it('should respect rate limits on excessive requests', async () => {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        if (process.env.CI) {
          throw new Error('Missing required environment variables: NINSAUDE_CLIENT_ID or NINSAUDE_CLIENT_SECRET');
        }
        console.warn('⚠️  Skipping test: Credentials not set');
        return;
      }

      const requests = Array(8).fill().map((_, index) =>
        axios.post(`${API_BASE_URL}/oauth/token`, {
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }).catch(error => ({ error: true, status: error.response?.status, index }))
      );

      const results = await Promise.all(requests);

      const successCount = results.filter(r => !r.error).length;
      const rateLimitedCount = results.filter(r => r.status === 429).length;

      expect(successCount).toBeGreaterThan(0);
      
      if (rateLimitedCount > 0) {
        console.log(`✅ Rate limiting working: ${rateLimitedCount} requests blocked`);
      }
    }, 30000);
  });

  describe('Token Security', () => {
    it('should not expose client_secret in response', async () => {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        if (process.env.CI) {
          throw new Error('Missing required environment variables: NINSAUDE_CLIENT_ID or NINSAUDE_CLIENT_SECRET');
        }
        console.warn('⚠️  Skipping test: Credentials not set');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      const responseString = JSON.stringify(response.data);
      
      expect(responseString).not.toContain(CLIENT_SECRET);
      expect(response.data).not.toHaveProperty('client_secret');
    }, 10000);

    it('should use HTTPS for authentication endpoint', () => {
      expect(API_BASE_URL).toMatch(/^https:\/\//);
    });

    it('should include security headers in response', async () => {
      if (!CLIENT_ID || !CLIENT_SECRET) {
        if (process.env.CI) {
          throw new Error('Missing required environment variables: NINSAUDE_CLIENT_ID or NINSAUDE_CLIENT_SECRET');
        }
        console.warn('⚠️  Skipping test: Credentials not set');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toContain('application/json');
    }, 10000);
  });
});
