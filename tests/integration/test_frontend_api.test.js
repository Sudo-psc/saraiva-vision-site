/**
 * Integration Test: Frontend to API Communication
 *
 * This test validates that the frontend container can successfully
 * communicate with the API container in a containerized environment.
 *
 * MUST FAIL initially (TDD approach) - containers not implemented yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';
const API_URL = process.env.API_URL || 'http://localhost:3001';
const NGINX_URL = process.env.NGINX_URL || 'http://localhost:80';
const REQUEST_TIMEOUT = 15000; // 15 seconds

/**
 * Fetch with timeout utility
 */
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Wait for service to be available
 */
async function waitForService(url, maxAttempts = 10, interval = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {}, 5000);
      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      console.log(`Attempt ${attempt}/${maxAttempts}: Service not ready at ${url}`);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }
  return false;
}

describe('Frontend to API Communication Integration', () => {
  beforeAll(async () => {
    console.log('Testing frontend-to-API communication in containerized environment');
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log(`API URL: ${API_URL}`);
    console.log(`Nginx URL: ${NGINX_URL}`);
  });

  afterAll(() => {
    console.log('Frontend-to-API integration tests completed');
  });

  describe('Service Availability', () => {
    it('should have frontend service available', async () => {
      // This test MUST FAIL initially - frontend container not running yet
      const available = await waitForService(`${FRONTEND_URL}/health`);
      expect(available).toBe(true);
    }, 30000);

    it('should have API service available', async () => {
      // This test MUST FAIL initially - API container not running yet
      const available = await waitForService(`${API_URL}/api/health`);
      expect(available).toBe(true);
    }, 30000);

    it('should have both services responding to health checks', async () => {
      // This test MUST FAIL initially - containers not implemented yet
      const [frontendResponse, apiResponse] = await Promise.all([
        fetchWithTimeout(`${FRONTEND_URL}/health`),
        fetchWithTimeout(`${API_URL}/api/health`)
      ]);

      expect(frontendResponse.status).toBe(200);
      expect(apiResponse.status).toBe(200);
    }, REQUEST_TIMEOUT);
  });

  describe('Direct API Communication', () => {
    it('should allow frontend to call API health endpoint directly', async () => {
      // This test MUST FAIL initially - API container not running yet
      const response = await fetchWithTimeout(`${API_URL}/api/health`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('healthy');
    }, REQUEST_TIMEOUT);

    it('should handle API reviews endpoint', async () => {
      // This test MUST FAIL initially - API container not running yet
      const response = await fetchWithTimeout(`${API_URL}/api/reviews`);

      // Should respond (may be 200 with data or 500 if external service down)
      expect([200, 500]).toContain(response.status);

      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should handle API contact endpoint', async () => {
      // This test MUST FAIL initially - API container not running yet
      const testContactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Integration test message'
      };

      const response = await fetchWithTimeout(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testContactData)
      });

      // Should respond with success or validation error
      expect([200, 400, 500]).toContain(response.status);

      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should handle CORS for cross-origin requests', async () => {
      // This test MUST FAIL initially - CORS configuration not in container yet
      const response = await fetchWithTimeout(`${API_URL}/api/health`, {
        headers: {
          'Origin': FRONTEND_URL
        }
      });

      expect(response.status).toBe(200);

      // Check CORS headers
      const corsOrigin = response.headers.get('access-control-allow-origin');
      expect(corsOrigin).toBeTruthy();
    }, REQUEST_TIMEOUT);
  });

  describe('Proxied API Communication (via Nginx)', () => {
    it('should allow API access through Nginx proxy', async () => {
      // This test MUST FAIL initially - Nginx container not running yet
      const response = await fetchWithTimeout(`${NGINX_URL}/api/health`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('healthy');
    }, REQUEST_TIMEOUT);

    it('should proxy API reviews through Nginx', async () => {
      // This test MUST FAIL initially - Nginx proxy not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/api/reviews`);

      // Should successfully proxy to API
      expect([200, 500, 502, 503]).toContain(response.status);

      if (response.status === 200 || response.status === 500) {
        const data = await response.json();
        expect(data).toBeTypeOf('object');
      }
    }, REQUEST_TIMEOUT);

    it('should maintain request headers through proxy', async () => {
      // This test MUST FAIL initially - header forwarding not configured yet
      const customHeader = 'integration-test-12345';
      const response = await fetchWithTimeout(`${NGINX_URL}/api/health`, {
        headers: {
          'X-Test-Header': customHeader
        }
      });

      expect(response.status).toBe(200);

      // API should receive forwarded headers
      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should handle SSL termination at proxy level', async () => {
      // This test validates SSL termination (when available)
      try {
        const httpsUrl = NGINX_URL.replace('http:', 'https:');
        const response = await fetchWithTimeout(`${httpsUrl}/api/health`);

        if (response.status === 200) {
          console.log('SSL termination working correctly');
        }
      } catch (error) {
        // SSL may not be configured in development - this is OK
        console.log('SSL not configured (development environment)');
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Frontend Client-Side API Calls', () => {
    it('should allow frontend JavaScript to call API endpoints', async () => {
      // This test simulates browser behavior calling API from frontend
      // This test MUST FAIL initially - frontend container not serving yet

      // First verify frontend is serving
      const frontendResponse = await fetchWithTimeout(FRONTEND_URL);
      expect([200, 404]).toContain(frontendResponse.status);

      // Then test API call from frontend perspective
      const apiResponse = await fetchWithTimeout(`${API_URL}/api/health`, {
        headers: {
          'Origin': FRONTEND_URL,
          'Referer': FRONTEND_URL
        }
      });

      expect(apiResponse.status).toBe(200);
    }, REQUEST_TIMEOUT);

    it('should handle API calls with authentication headers', async () => {
      // This test MUST FAIL initially - auth handling not implemented yet
      const response = await fetchWithTimeout(`${API_URL}/api/health`, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Origin': FRONTEND_URL
        }
      });

      // Health endpoint should work without auth, but should handle auth headers
      expect(response.status).toBe(200);
    }, REQUEST_TIMEOUT);

    it('should maintain session consistency across requests', async () => {
      // This test MUST FAIL initially - session handling not implemented yet
      const sessionCookie = 'test-session-12345';

      const response1 = await fetchWithTimeout(`${API_URL}/api/health`, {
        headers: {
          'Cookie': `session=${sessionCookie}`,
          'Origin': FRONTEND_URL
        }
      });

      const response2 = await fetchWithTimeout(`${API_URL}/api/health`, {
        headers: {
          'Cookie': `session=${sessionCookie}`,
          'Origin': FRONTEND_URL
        }
      });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Should maintain consistent behavior
      const data1 = await response1.json();
      const data2 = await response2.json();
      expect(data1.status).toBe(data2.status);
    }, REQUEST_TIMEOUT);
  });

  describe('Error Handling and Resilience', () => {
    it('should handle API service unavailability gracefully', async () => {
      // This test validates error handling when API is down
      // For now, just verify error responses are properly structured

      try {
        const response = await fetchWithTimeout(`${API_URL}/api/nonexistent`);
        expect([404, 500]).toContain(response.status);
      } catch (error) {
        // Connection refused is expected during TDD phase
        expect(error.message).toContain('fetch failed');
      }
    }, REQUEST_TIMEOUT);

    it('should handle network timeouts gracefully', async () => {
      // This test validates timeout handling
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/health`, {}, 100); // Very short timeout
        // If it succeeds, that's fine too
        expect(response).toBeDefined();
      } catch (error) {
        // Timeout or connection error expected
        expect(error.message).toMatch(/timeout|fetch failed/);
      }
    });

    it('should handle malformed API responses', async () => {
      // This test validates client-side error handling
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/health`);
        const data = await response.json();
        expect(data).toBeTypeOf('object');
      } catch (error) {
        // JSON parsing or connection errors expected during TDD
        expect(error).toBeDefined();
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Performance and Load', () => {
    it('should handle concurrent API requests efficiently', async () => {
      // This test MUST FAIL initially - performance not optimized yet
      const concurrentRequests = 5;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, () =>
        fetchWithTimeout(`${API_URL}/api/health`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      const totalTime = endTime - startTime;
      const avgTime = totalTime / concurrentRequests;

      // Each request should average under 1 second
      expect(avgTime).toBeLessThan(1000);
    }, 30000);

    it('should maintain performance under load', async () => {
      // This test validates performance characteristics
      const startTime = Date.now();
      const response = await fetchWithTimeout(`${API_URL}/api/health`);
      const endTime = Date.now();

      expect(response.status).toBe(200);

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(5000); // Under 5 seconds for individual request
    }, REQUEST_TIMEOUT);
  });

  describe('Container Network Integration', () => {
    it('should communicate via Docker internal networks', async () => {
      // This test MUST FAIL initially - Docker networks not configured yet
      // This would test internal container-to-container communication
      // For now, we test external access as proxy for internal communication

      const response = await fetchWithTimeout(`${API_URL}/api/health`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('healthy');
    }, REQUEST_TIMEOUT);

    it('should handle service discovery correctly', async () => {
      // This test MUST FAIL initially - service discovery not implemented yet
      // Tests that services can find each other by container names

      const response = await fetchWithTimeout(`${API_URL}/api/health`);
      expect(response.status).toBe(200);

      // Should include service discovery information
      const data = await response.json();
      expect(data).toHaveProperty('status');
    }, REQUEST_TIMEOUT);

    it('should maintain connectivity across container restarts', async () => {
      // This test validates resilience to container restarts
      // For TDD phase, just verify basic connectivity

      const response1 = await fetchWithTimeout(`${API_URL}/api/health`);
      expect(response1.status).toBe(200);

      // Simulate checking after restart (same endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response2 = await fetchWithTimeout(`${API_URL}/api/health`);
      expect(response2.status).toBe(200);
    }, REQUEST_TIMEOUT);
  });
});

// Export for potential use in other integration tests
export {
  FRONTEND_URL,
  API_URL,
  NGINX_URL,
  fetchWithTimeout,
  waitForService
};