/**
 * Contract Test: WordPress Health Check Endpoint
 *
 * This test validates the WordPress container's health check endpoint
 * according to the OpenAPI contract specification.
 *
 * MUST FAIL initially (TDD approach) - WordPress health endpoint not implemented yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Configuration
const WORDPRESS_BASE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8083';
const HEALTH_ENDPOINT = `${WORDPRESS_BASE_URL}/health.php`;
const WP_JSON_ENDPOINT = `${WORDPRESS_BASE_URL}/wp-json/wp/v2`;
const REQUEST_TIMEOUT = 15000; // 15 seconds (WordPress can be slower)

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
 * Validate WordPress-specific health response
 */
function validateWordPressHealthResponseSchema(data) {
  validateHealthResponseSchema(data);

  // WordPress-specific fields
  if (data.wordpress !== undefined) {
    expect(data.wordpress).toBeTypeOf('object');

    // WordPress version
    if (data.wordpress.version !== undefined) {
      expect(data.wordpress.version).toMatch(/^\d+\.\d+(\.\d+)?/);
    }

    // PHP version
    if (data.wordpress.php_version !== undefined) {
      expect(data.wordpress.php_version).toMatch(/^\d+\.\d+(\.\d+)?/);
    }

    // Database status
    if (data.wordpress.database !== undefined) {
      expect(['connected', 'disconnected', 'error']).toContain(data.wordpress.database);
    }
  }

  // Database checks
  if (data.database !== undefined) {
    expect(data.database).toBeTypeOf('object');

    if (data.database.type !== undefined) {
      expect(data.database.type).toBe('sqlite'); // Using SQLite
    }

    if (data.database.writable !== undefined) {
      expect(data.database.writable).toBeTypeOf('boolean');
    }
  }

  // File system checks
  if (data.filesystem !== undefined) {
    expect(data.filesystem).toBeTypeOf('object');

    if (data.filesystem.uploads_writable !== undefined) {
      expect(data.filesystem.uploads_writable).toBeTypeOf('boolean');
    }
  }
}

describe('WordPress Health Check Contract', () => {
  beforeAll(() => {
    console.log(`Testing WordPress health endpoint: ${HEALTH_ENDPOINT}`);
  });

  afterAll(() => {
    console.log('WordPress health check contract tests completed');
  });

  describe('GET /health.php', () => {
    it('should respond with 200 status code when healthy', async () => {
      // This test MUST FAIL initially - health.php not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      expect(response.status).toBe(200);
    }, REQUEST_TIMEOUT);

    it('should return valid JSON response', async () => {
      // This test MUST FAIL initially - health.php not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should conform to WordPress health check schema', async () => {
      // This test MUST FAIL initially - enhanced health schema not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(response.status).toBe(200);
      validateWordPressHealthResponseSchema(data);
      expect(data.status).toBe('healthy');
    }, REQUEST_TIMEOUT);

    it('should include WordPress version information', async () => {
      // This test MUST FAIL initially - version info not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.wordpress).toBeDefined();
      expect(data.wordpress.version).toBeDefined();
      expect(data.wordpress.version).toMatch(/^\d+\.\d+(\.\d+)?/);

      expect(data.wordpress.php_version).toBeDefined();
      expect(data.wordpress.php_version).toMatch(/^\d+\.\d+(\.\d+)?/);
    }, REQUEST_TIMEOUT);

    it('should check database connectivity', async () => {
      // This test MUST FAIL initially - database checks not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.database).toBeDefined();
      expect(data.database.type).toBe('sqlite');
      expect(data.database.writable).toBeTypeOf('boolean');

      expect(data.wordpress.database).toBeDefined();
      expect(['connected', 'disconnected', 'error']).toContain(data.wordpress.database);
    }, REQUEST_TIMEOUT);

    it('should check file system permissions', async () => {
      // This test MUST FAIL initially - filesystem checks not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.filesystem).toBeDefined();
      expect(data.filesystem.uploads_writable).toBeTypeOf('boolean');

      // For a healthy WordPress instance, uploads should be writable
      if (data.status === 'healthy') {
        expect(data.filesystem.uploads_writable).toBe(true);
      }
    }, REQUEST_TIMEOUT);
  });

  describe('WordPress JSON API health', () => {
    it('should verify WordPress API is responding', async () => {
      // This test might PASS if WordPress is running, but needs integration
      const response = await fetchWithTimeout(WP_JSON_ENDPOINT);

      expect([200, 404]).toContain(response.status); // 404 is OK if no posts yet
    }, REQUEST_TIMEOUT);

    it('should validate WordPress API response structure', async () => {
      // This test validates that WordPress itself is functional
      const response = await fetchWithTimeout(WP_JSON_ENDPOINT);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toBeInstanceOf(Array); // Should return array of posts
      } else if (response.status === 404) {
        // No posts yet, but API is responding
        console.log('WordPress API responding with 404 (no posts) - this is OK');
      }
    }, REQUEST_TIMEOUT);

    it('should include proper CORS headers for API access', async () => {
      // This test validates CORS configuration for API proxy
      const response = await fetchWithTimeout(WP_JSON_ENDPOINT, {
        headers: {
          'Origin': 'http://localhost:3002'
        }
      });

      // Check CORS headers are present (may be added by nginx proxy)
      const corsOrigin = response.headers.get('access-control-allow-origin');
      if (corsOrigin) {
        expect(corsOrigin).toBeTruthy();
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Performance requirements', () => {
    it('should respond within acceptable time (under 3 seconds)', async () => {
      // This test MUST FAIL initially - health endpoint not optimized yet
      const startTime = Date.now();
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const endTime = Date.now();

      expect(response.status).toBe(200);

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(3000); // Under 3 seconds
    });

    it('should handle health checks without affecting performance', async () => {
      // This test MUST FAIL initially - performance optimization not implemented yet
      // Multiple rapid health checks should not degrade WordPress performance

      const promises = Array.from({ length: 5 }, () =>
        fetchWithTimeout(HEALTH_ENDPOINT)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Container integration', () => {
    it('should be suitable for Docker health checks', async () => {
      // This test MUST FAIL initially - Docker-specific optimization not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      // Docker health checks expect quick response and proper exit codes
      expect([200, 503]).toContain(response.status);

      // Should be lightweight for frequent Docker health checking
      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should include container-specific information', async () => {
      // This test MUST FAIL initially - container info not included yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      // Should include PHP-FPM status if available
      if (data.phpfpm !== undefined) {
        expect(data.phpfpm).toBeTypeOf('object');
        expect(data.phpfpm.status).toBeDefined();
      }

      // Should include memory usage information
      if (data.system !== undefined) {
        expect(data.system.memory_usage).toBeDefined();
      }
    }, REQUEST_TIMEOUT);

    it('should validate SQLite database file accessibility', async () => {
      // This test MUST FAIL initially - SQLite-specific checks not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.database).toBeDefined();
      expect(data.database.type).toBe('sqlite');

      // Should check if SQLite file exists and is accessible
      expect(data.database.file_exists).toBeTypeOf('boolean');
      expect(data.database.file_writable).toBeTypeOf('boolean');

      if (data.status === 'healthy') {
        expect(data.database.file_exists).toBe(true);
        expect(data.database.file_writable).toBe(true);
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Error scenarios', () => {
    it('should return 503 when unhealthy', async () => {
      // This test MUST FAIL initially - unhealthy state handling not implemented yet
      // This is a conceptual test for when WordPress is in an unhealthy state

      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      if (response.status === 503) {
        const data = await response.json();
        expect(data.status).toBe('unhealthy');
        expect(data.error).toBeDefined();
        expect(data.error).not.toBe('');
      } else {
        // Currently healthy - that's fine for initial testing
        expect(response.status).toBe(200);
      }
    });

    it('should handle database connection errors gracefully', async () => {
      // This test MUST FAIL initially - error handling not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      // When database is unavailable, should report unhealthy status
      if (data.wordpress && data.wordpress.database === 'disconnected') {
        expect(data.status).toBe('unhealthy');
        expect(data.error).toContain('database');
      }
    });

    it('should handle file system permission errors', async () => {
      // This test MUST FAIL initially - filesystem error handling not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      // When uploads directory is not writable, should report issues
      if (data.filesystem && data.filesystem.uploads_writable === false) {
        expect(data.status).toBe('unhealthy');
        expect(data.error).toContain('filesystem');
      }
    });
  });
});

// Export for potential use in integration tests
export {
  WORDPRESS_BASE_URL,
  HEALTH_ENDPOINT,
  WP_JSON_ENDPOINT,
  validateHealthResponseSchema,
  validateWordPressHealthResponseSchema,
  fetchWithTimeout
};