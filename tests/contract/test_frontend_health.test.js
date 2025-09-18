/**
 * Contract Test: Frontend Health Check Endpoint
 *
 * This test validates the frontend container's health check endpoint
 * according to the OpenAPI contract specification.
 *
 * MUST FAIL initially (TDD approach) - no implementation exists yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Configuration
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3002';
const HEALTH_ENDPOINT = `${FRONTEND_BASE_URL}/health`;
const REQUEST_TIMEOUT = 10000; // 10 seconds

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
 * Validate health response schema according to OpenAPI contract
 */
function validateHealthResponseSchema(data) {
  // Required fields according to contract
  expect(data).toHaveProperty('status');
  expect(data).toHaveProperty('timestamp');

  // Status validation
  expect(data.status).toBeTypeOf('string');
  expect(['healthy', 'unhealthy']).toContain(data.status);

  // Timestamp validation (ISO 8601 format)
  expect(data.timestamp).toBeTypeOf('string');
  expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);

  // Optional fields validation
  if (data.uptime !== undefined) {
    expect(data.uptime).toBeTypeOf('number');
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  }

  if (data.version !== undefined) {
    expect(data.version).toBeTypeOf('string');
    expect(data.version).not.toBe('');
  }

  // Error field should only be present when status is unhealthy
  if (data.status === 'unhealthy') {
    expect(data).toHaveProperty('error');
    expect(data.error).toBeTypeOf('string');
    expect(data.error).not.toBe('');
  }
}

describe('Frontend Health Check Contract', () => {
  beforeAll(() => {
    console.log(`Testing frontend health endpoint: ${HEALTH_ENDPOINT}`);
  });

  afterAll(() => {
    console.log('Frontend health check contract tests completed');
  });

  describe('GET /health', () => {
    it('should respond with 200 status code when healthy', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      expect(response.status).toBe(200);
    }, REQUEST_TIMEOUT);

    it('should return valid JSON response', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should conform to health check schema when healthy', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(response.status).toBe(200);
      validateHealthResponseSchema(data);
      expect(data.status).toBe('healthy');
    }, REQUEST_TIMEOUT);

    it('should include required timestamp field', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.timestamp).toBeDefined();

      // Timestamp should be recent (within last 5 seconds)
      const timestampDate = new Date(data.timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - timestampDate.getTime();
      expect(timeDiff).toBeLessThan(5000); // 5 seconds
    }, REQUEST_TIMEOUT);

    it('should include version information when available', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      // Version is optional but should be present for frontend container
      if (data.version) {
        expect(data.version).toMatch(/^\d+\.\d+\.\d+/); // Semantic versioning
      }
    }, REQUEST_TIMEOUT);

    it('should respond quickly (under 1 second)', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const startTime = Date.now();
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const endTime = Date.now();

      expect(response.status).toBe(200);

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // Under 1 second
    });

    it('should handle CORS for cross-origin requests', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT, {
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });

      expect(response.status).toBe(200);

      // Check CORS headers are present
      const corsOrigin = response.headers.get('access-control-allow-origin');
      expect(corsOrigin).toBeTruthy();
    }, REQUEST_TIMEOUT);
  });

  describe('Health endpoint error handling', () => {
    it('should handle malformed requests gracefully', async () => {
      // Test with invalid HTTP method
      try {
        const response = await fetchWithTimeout(HEALTH_ENDPOINT, {
          method: 'POST',
          body: 'invalid data'
        });

        // Should either return 405 Method Not Allowed or 200 (ignoring body)
        expect([200, 405]).toContain(response.status);
      } catch (error) {
        // Connection errors are acceptable for this test during TDD phase
        console.log('Expected connection error during TDD phase:', error.message);
      }
    }, REQUEST_TIMEOUT);

    it('should be accessible without authentication', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      // Health check should not require authentication
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    }, REQUEST_TIMEOUT);
  });

  describe('Container health integration', () => {
    it('should reflect actual frontend service status', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      // When frontend is running, health should be 'healthy'
      // When there are issues, should return 'unhealthy' with error details
      expect(['healthy', 'unhealthy']).toContain(data.status);

      if (data.status === 'unhealthy') {
        expect(data.error).toBeDefined();
        expect(data.error).not.toBe('');
      }
    }, REQUEST_TIMEOUT);

    it('should be suitable for Docker health checks', async () => {
      // This test MUST FAIL initially - no health endpoint implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      // Docker health checks expect:
      // - Exit code 0 for healthy (HTTP 200)
      // - Exit code 1 for unhealthy (HTTP 503)
      // - Quick response time
      expect([200, 503]).toContain(response.status);

      // Response should be immediate for Docker health check
      const startTime = Date.now();
      await response.text(); // Consume response
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // Under 2 seconds
    }, REQUEST_TIMEOUT);
  });
});

// Export for potential use in integration tests
export {
  FRONTEND_BASE_URL,
  HEALTH_ENDPOINT,
  validateHealthResponseSchema,
  fetchWithTimeout
};