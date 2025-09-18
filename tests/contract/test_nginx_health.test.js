/**
 * Contract Test: Nginx Health Check Endpoint
 *
 * This test validates the Nginx container's health check endpoint
 * according to the OpenAPI contract specification.
 *
 * MUST FAIL initially (TDD approach) - Nginx health endpoint enhancement not implemented yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Configuration
const NGINX_BASE_URL = process.env.NGINX_BASE_URL || 'http://localhost';
const HEALTH_ENDPOINT = `${NGINX_BASE_URL}/health`;
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
 * Validate Nginx-specific health response
 */
function validateNginxHealthResponseSchema(data) {
  validateHealthResponseSchema(data);

  // Nginx-specific fields
  if (data.nginx !== undefined) {
    expect(data.nginx).toBeTypeOf('object');

    // Nginx version
    if (data.nginx.version !== undefined) {
      expect(data.nginx.version).toMatch(/nginx\/\d+\.\d+(\.\d+)?/);
    }

    // Configuration status
    if (data.nginx.config_status !== undefined) {
      expect(['valid', 'invalid', 'unknown']).toContain(data.nginx.config_status);
    }

    // SSL certificate status
    if (data.nginx.ssl_status !== undefined) {
      expect(['valid', 'invalid', 'not_configured']).toContain(data.nginx.ssl_status);
    }
  }

  // Upstream services health
  if (data.upstreams !== undefined) {
    expect(data.upstreams).toBeTypeOf('object');

    // API upstream
    if (data.upstreams.api !== undefined) {
      expect(['healthy', 'unhealthy', 'unknown']).toContain(data.upstreams.api);
    }

    // WordPress upstream
    if (data.upstreams.wordpress !== undefined) {
      expect(['healthy', 'unhealthy', 'unknown']).toContain(data.upstreams.wordpress);
    }

    // Frontend upstream (development)
    if (data.upstreams.frontend !== undefined) {
      expect(['healthy', 'unhealthy', 'unknown']).toContain(data.upstreams.frontend);
    }
  }

  // SSL certificate information
  if (data.ssl !== undefined) {
    expect(data.ssl).toBeTypeOf('object');

    if (data.ssl.certificate_valid !== undefined) {
      expect(data.ssl.certificate_valid).toBeTypeOf('boolean');
    }

    if (data.ssl.expires_at !== undefined) {
      expect(data.ssl.expires_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
    }
  }
}

describe('Nginx Health Check Contract', () => {
  beforeAll(() => {
    console.log(`Testing Nginx health endpoint: ${HEALTH_ENDPOINT}`);
  });

  afterAll(() => {
    console.log('Nginx health check contract tests completed');
  });

  describe('GET /health', () => {
    it('should respond with 200 status code when healthy', async () => {
      // This test might PASS if basic health endpoint exists
      // But enhanced version will FAIL initially
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      expect(response.status).toBe(200);
    }, REQUEST_TIMEOUT);

    it('should return valid JSON response', async () => {
      // This test MUST FAIL initially - JSON response not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should conform to Nginx health check schema', async () => {
      // This test MUST FAIL initially - enhanced schema not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(response.status).toBe(200);
      validateNginxHealthResponseSchema(data);
      expect(data.status).toBe('healthy');
    }, REQUEST_TIMEOUT);

    it('should include Nginx version information', async () => {
      // This test MUST FAIL initially - version info not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.nginx).toBeDefined();
      expect(data.nginx.version).toBeDefined();
      expect(data.nginx.version).toMatch(/nginx\/\d+\.\d+(\.\d+)?/);
    }, REQUEST_TIMEOUT);

    it('should check configuration validity', async () => {
      // This test MUST FAIL initially - config validation not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.nginx.config_status).toBeDefined();
      expect(['valid', 'invalid', 'unknown']).toContain(data.nginx.config_status);

      // For a healthy nginx, config should be valid
      if (data.status === 'healthy') {
        expect(data.nginx.config_status).toBe('valid');
      }
    }, REQUEST_TIMEOUT);

    it('should check upstream services health', async () => {
      // This test MUST FAIL initially - upstream checks not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.upstreams).toBeDefined();
      expect(data.upstreams.api).toBeDefined();
      expect(data.upstreams.wordpress).toBeDefined();

      // Check upstream status values
      expect(['healthy', 'unhealthy', 'unknown']).toContain(data.upstreams.api);
      expect(['healthy', 'unhealthy', 'unknown']).toContain(data.upstreams.wordpress);
    }, REQUEST_TIMEOUT);
  });

  describe('SSL certificate validation', () => {
    it('should check SSL certificate status', async () => {
      // This test MUST FAIL initially - SSL checks not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      expect(data.ssl).toBeDefined();
      expect(data.ssl.certificate_valid).toBeTypeOf('boolean');

      expect(data.nginx.ssl_status).toBeDefined();
      expect(['valid', 'invalid', 'not_configured']).toContain(data.nginx.ssl_status);
    }, REQUEST_TIMEOUT);

    it('should include certificate expiration information', async () => {
      // This test MUST FAIL initially - certificate expiration not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      if (data.ssl && data.ssl.expires_at) {
        expect(data.ssl.expires_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);

        // Certificate should not be expired for healthy status
        const expirationDate = new Date(data.ssl.expires_at);
        const now = new Date();
        if (data.status === 'healthy') {
          expect(expirationDate.getTime()).toBeGreaterThan(now.getTime());
        }
      }
    }, REQUEST_TIMEOUT);

    it('should warn about upcoming certificate expiration', async () => {
      // This test MUST FAIL initially - expiration warnings not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      if (data.ssl && data.ssl.expires_at) {
        const expirationDate = new Date(data.ssl.expires_at);
        const now = new Date();
        const daysUntilExpiration = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        if (daysUntilExpiration < 30) {
          expect(data.ssl.expiring_soon).toBe(true);
        }
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Reverse proxy functionality', () => {
    it('should validate proxy routing to API', async () => {
      // This test validates that Nginx can proxy to API
      const apiProxyUrl = `${NGINX_BASE_URL}/api/health`;
      const response = await fetchWithTimeout(apiProxyUrl);

      // Should successfully proxy to API
      expect([200, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toBeTypeOf('object');
      }
    }, REQUEST_TIMEOUT);

    it('should validate proxy routing to WordPress', async () => {
      // This test validates that Nginx can proxy to WordPress
      const wpProxyUrl = `${NGINX_BASE_URL}/wp-json/wp/v2`;
      const response = await fetchWithTimeout(wpProxyUrl);

      // Should successfully proxy to WordPress (404 is OK if no posts)
      expect([200, 404, 502, 503]).toContain(response.status);
    }, REQUEST_TIMEOUT);

    it('should serve static assets correctly', async () => {
      // This test validates static asset serving
      const manifestUrl = `${NGINX_BASE_URL}/site.webmanifest`;
      const response = await fetchWithTimeout(manifestUrl);

      // Static assets should be served correctly
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const contentType = response.headers.get('content-type');
        expect(contentType).toContain('application/manifest+json');
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Performance requirements', () => {
    it('should respond very quickly (under 100ms)', async () => {
      // This test MUST FAIL initially - performance optimization not implemented yet
      const startTime = Date.now();
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const endTime = Date.now();

      expect(response.status).toBe(200);

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(100); // Under 100ms for reverse proxy
    });

    it('should handle high frequency health checks', async () => {
      // This test MUST FAIL initially - high frequency optimization not implemented yet
      const promises = Array.from({ length: 20 }, () =>
        fetchWithTimeout(HEALTH_ENDPOINT)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // All should complete quickly
      console.log('High frequency health checks completed');
    });
  });

  describe('Security headers validation', () => {
    it('should include proper security headers', async () => {
      // This test validates security headers in health response
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      // Check for important security headers
      expect(response.headers.get('x-frame-options')).toBeTruthy();
      expect(response.headers.get('x-content-type-options')).toBeTruthy();

      // CSP header should be present
      const csp = response.headers.get('content-security-policy');
      if (csp) {
        expect(csp).toContain('default-src');
      }
    }, REQUEST_TIMEOUT);

    it('should not expose sensitive server information', async () => {
      // This test validates that sensitive info is not exposed
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      // Server header should not expose detailed version info
      const serverHeader = response.headers.get('server');
      if (serverHeader) {
        expect(serverHeader).not.toMatch(/nginx\/\d+\.\d+\.\d+/);
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Container integration', () => {
    it('should be suitable for Docker health checks', async () => {
      // This test should mostly PASS but needs optimization
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      // Docker health checks expect quick response
      expect([200, 503]).toContain(response.status);

      // Should be lightweight for frequent checking
      const data = await response.json();
      expect(data).toBeTypeOf('object');
    }, REQUEST_TIMEOUT);

    it('should validate nginx configuration on startup', async () => {
      // This test MUST FAIL initially - startup validation not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      // Should include configuration test results
      expect(data.nginx.config_test_passed).toBeTypeOf('boolean');
      expect(data.nginx.config_test_passed).toBe(true);
    }, REQUEST_TIMEOUT);

    it('should monitor worker process health', async () => {
      // This test MUST FAIL initially - worker monitoring not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      // Should include worker process information
      if (data.nginx.workers !== undefined) {
        expect(data.nginx.workers).toBeTypeOf('object');
        expect(data.nginx.workers.active).toBeTypeOf('number');
        expect(data.nginx.workers.active).toBeGreaterThan(0);
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Error scenarios', () => {
    it('should return 503 when upstream services are down', async () => {
      // This test MUST FAIL initially - upstream monitoring not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);

      if (response.status === 503) {
        const data = await response.json();
        expect(data.status).toBe('unhealthy');
        expect(data.error).toBeDefined();
        expect(data.error).toContain('upstream');
      } else {
        // Currently healthy - that's fine
        expect(response.status).toBe(200);
      }
    });

    it('should handle SSL certificate errors gracefully', async () => {
      // This test MUST FAIL initially - SSL error handling not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      if (data.ssl && data.ssl.certificate_valid === false) {
        expect(data.status).toBe('unhealthy');
        expect(data.error).toContain('ssl');
      }
    });

    it('should handle configuration errors gracefully', async () => {
      // This test MUST FAIL initially - config error handling not implemented yet
      const response = await fetchWithTimeout(HEALTH_ENDPOINT);
      const data = await response.json();

      if (data.nginx && data.nginx.config_status === 'invalid') {
        expect(data.status).toBe('unhealthy');
        expect(data.error).toContain('configuration');
      }
    });
  });
});

// Export for potential use in integration tests
export {
  NGINX_BASE_URL,
  HEALTH_ENDPOINT,
  validateHealthResponseSchema,
  validateNginxHealthResponseSchema,
  fetchWithTimeout
};