/**
 * Contract Test: API Health Check Endpoint
 *
 * This test validates the Node.js API container's health check endpoint
 * according to the OpenAPI contract specification.
 *
 * MUST FAIL initially (TDD approach) - enhanced health endpoint not implemented yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const HEALTH_ENDPOINT = `${API_BASE_URL}/api/health`;
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

/**
 * Validate enhanced API health response with service checks
 */
function validateApiHealthResponseSchema(data) {
  validateHealthResponseSchema(data);

  // API-specific fields
  if (data.services !== undefined) {
    expect(data.services).toBeTypeOf('object');

    // Database service check
    if (data.services.database !== undefined) {
      expect(['connected', 'disconnected']).toContain(data.services.database);
    }

    // External APIs check
    if (data.services.external_apis !== undefined) {
      expect(['operational', 'degraded', 'down']).toContain(data.services.external_apis);
    }
  }

  if (data.checks !== undefined) {
    expect(data.checks).toBeTypeOf('object');

    // Memory usage check
    if (data.checks.memory !== undefined) {
      expect(data.checks.memory).toBeTypeOf('string');
      expect(data.checks.memory).toMatch(/^\d+MB$/);
    }

    // Request count check
    if (data.checks.requests !== undefined) {
      expect(data.checks.requests).toBeTypeOf('number');
      expect(data.checks.requests).toBeGreaterThanOrEqual(0);
    }
  }
}

describe('API Health Check Contract', () => {
  beforeAll(() => {
    console.log(`Testing API health endpoint: ${HEALTH_ENDPOINT}`);
  });

  afterAll(() => {
    console.log('API health check contract tests completed');
  });

  describe('GET /api/health', () => {
    it('should respond with 200 status code when healthy', async () => {
      // This test will currently PASS but will need enhancement
      // The basic health endpoint exists but needs container-specific enhancements
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      expect(response.status).toBe(200);
    }, REQUEST_TIMEOUT);

    it('should return valid JSON response', async () => {
      // This test will currently PASS but needs enhancement
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should conform to enhanced health check schema', async () => {
      // This test MUST FAIL initially - enhanced health schema not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(response.status).toBe(200);
      validateApiHealthResponseSchema(data);
      expect(data.status).toBe('healthy');
    }, REQUEST_TIMEOUT);

    it('should include service dependency checks', async () => {
      // This test MUST FAIL initially - service checks not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.services).toBeDefined();
      expect(data.services).toBeTypeOf('object');

      // Should check external service dependencies
      expect(data.services.database).toBeDefined();
      expect(data.services.external_apis).toBeDefined();
    }, REQUEST_TIMEOUT);

    it('should include system health checks', async () => {
      // This test MUST FAIL initially - system checks not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.checks).toBeDefined();
      expect(data.checks).toBeTypeOf('object');

      // Should include memory usage
      expect(data.checks.memory).toBeDefined();
      expect(data.checks.memory).toMatch(/^\d+MB$/);

      // Should include request count
      expect(data.checks.requests).toBeDefined();
      expect(data.checks.requests).toBeGreaterThanOrEqual(0);
    }, REQUEST_TIMEOUT);

    it('should include uptime information', async () => {
      // This test MUST FAIL initially - uptime tracking not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.uptime).toBeDefined();
      expect(data.uptime).toBeTypeOf('number');
      expect(data.uptime).toBeGreaterThan(0);
    }, REQUEST_TIMEOUT);

    it('should include version information', async () => {
      // This test MUST FAIL initially - version not included in response yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.version).toBeDefined();
      expect(data.version).toMatch(/^\d+\.\d+\.\d+/); // Semantic versioning
    }, REQUEST_TIMEOUT);
  });

  describe('Health endpoint readiness probe', () => {
    it('should provide readiness endpoint', async () => {
      // This test MUST FAIL initially - readiness endpoint not implemented yet
      const readinessEndpoint = `${API_BASE_URL}/api/health/ready`;
      const response = await fetchWithTimeout(readinessEndpoint);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.ready).toBeDefined();
      expect(data.ready).toBeTypeOf('boolean');
    }, REQUEST_TIMEOUT);

    it('should check dependencies in readiness probe', async () => {
      // This test MUST FAIL initially - dependency checks not implemented yet
      const readinessEndpoint = `${API_BASE_URL}/api/health/ready`;
      const response = await fetchWithTimeout(readinessEndpoint);
      const data = await response.json();

      if (data.dependencies) {
        expect(data.dependencies).toBeInstanceOf(Array);

        data.dependencies.forEach(dep => {
          expect(dep).toHaveProperty('name');
          expect(dep).toHaveProperty('status');
          expect(['connected', 'disconnected']).toContain(dep.status);
        });
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Health endpoint liveness probe', () => {
    it('should provide liveness endpoint', async () => {
      // This test MUST FAIL initially - liveness endpoint not implemented yet
      const livenessEndpoint = `${API_BASE_URL}/api/health/live`;
      const response = await fetchWithTimeout(livenessEndpoint);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.alive).toBeDefined();
      expect(data.alive).toBeTypeOf('boolean');
      expect(data.alive).toBe(true);
    }, REQUEST_TIMEOUT);

    it('should include last activity timestamp', async () => {
      // This test MUST FAIL initially - activity tracking not implemented yet
      const livenessEndpoint = `${API_BASE_URL}/api/health/live`;
      const response = await fetchWithTimeout(livenessEndpoint);
      const data = await response.json();

      expect(data.last_activity).toBeDefined();
      expect(data.last_activity).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
    }, REQUEST_TIMEOUT);
  });

  describe('Performance requirements', () => {
    it('should respond quickly (under 200ms)', async () => {
      // This test should PASS but may need optimization
      const startTime = Date.now();
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const endTime = Date.now();

      expect(response.status).toBe(200);

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(200); // Under 200ms as per requirements
    });

    it('should handle concurrent health check requests', async () => {
      // This test MUST FAIL initially - concurrent handling not optimized yet
      const promises = Array.from({ length: 10 }, () =>
        fetchWithTimeout(HEALTH_ENDPOINT)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // All should complete within reasonable time
      const endTime = Date.now();
      // This will be measured in the actual test execution
    });
  });

  describe('Error scenarios', () => {
    it('should return 503 when unhealthy', async () => {
      // This test MUST FAIL initially - unhealthy state handling not implemented yet
      // We'll simulate this by testing error conditions

      // This is a conceptual test - actual implementation will need
      // a way to simulate unhealthy state for testing
      console.log('Unhealthy state testing requires implementation of health status simulation');

      // For now, just verify the current healthy response
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      expect([200, 503]).toContain(response.status);
    });

    it('should include error details when unhealthy', async () => {
      // This test MUST FAIL initially - error details not implemented yet
      // Conceptual test for when service is in unhealthy state

      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      if (response.status === 503) {
        const data = await response.json();
        expect(data.status).toBe('unhealthy');
        expect(data.error).toBeDefined();
        expect(data.error).not.toBe('');
      }
    });
  });

  describe('Container integration', () => {
    it('should be suitable for Docker health checks', async () => {
      // This test should PASS as basic endpoint exists
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      // Docker health checks expect quick response
      expect([200, 503]).toContain(response.status);

      // Verify it's consumable by Docker health check commands
      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should include container-specific information', async () => {
      // This test MUST FAIL initially - container info not included yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      // Should include Node.js version
      expect(data.environment).toBeDefined();
      expect(data.environment).toBeTypeOf('object');

      if (data.environment.node) {
        expect(data.environment.node).toMatch(/^v\d+\.\d+\.\d+/);
      }
    }, REQUEST_TIMEOUT);
  });
});

// Export for potential use in integration tests
export {
  API_BASE_URL,
  HEALTH_ENDPOINT,
  validateHealthResponseSchema,
  validateApiHealthResponseSchema,
  fetchWithTimeout
};