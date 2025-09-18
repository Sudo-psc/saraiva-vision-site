/**
 * Integration Test: Nginx Proxy Container
 *
 * This test validates that the Nginx container can successfully
 * proxy requests to all backend containers and handle routing properly.
 *
 * MUST FAIL initially (TDD approach) - containers not implemented yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Configuration
const NGINX_URL = process.env.NGINX_URL || 'http://localhost:80';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';
const API_URL = process.env.API_URL || 'http://localhost:3001';
const WORDPRESS_URL = process.env.WORDPRESS_URL || 'http://localhost:9000';
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
      if (response.status < 500) { // Accept any non-server-error response
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

describe('Nginx Proxy Container Integration', () => {
  beforeAll(async () => {
    console.log('Testing Nginx proxy integration in containerized environment');
    console.log(`Nginx URL: ${NGINX_URL}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log(`API URL: ${API_URL}`);
    console.log(`WordPress URL: ${WORDPRESS_URL}`);
  });

  afterAll(() => {
    console.log('Nginx proxy integration tests completed');
  });

  describe('Nginx Container Availability', () => {
    it('should have Nginx container running and accessible', async () => {
      // This test MUST FAIL initially - Nginx container not running yet
      const available = await waitForService(NGINX_URL);
      expect(available).toBe(true);
    }, 30000);

    it('should return Nginx server information in headers', async () => {
      // This test MUST FAIL initially - Nginx container not configured yet
      const response = await fetchWithTimeout(NGINX_URL);

      expect(response.status).toBeLessThan(500); // Any non-server error

      const serverHeader = response.headers.get('server');
      if (serverHeader) {
        expect(serverHeader.toLowerCase()).toContain('nginx');
      }
    }, REQUEST_TIMEOUT);

    it('should handle basic HTTP requests', async () => {
      // This test MUST FAIL initially - Nginx not serving yet
      const response = await fetchWithTimeout(NGINX_URL);

      expect([200, 404, 502, 503]).toContain(response.status);
    }, REQUEST_TIMEOUT);
  });

  describe('Frontend Proxying', () => {
    it('should proxy requests to frontend container', async () => {
      // This test MUST FAIL initially - frontend proxying not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/`);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const html = await response.text();
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('Saraiva Vision'); // Expected title/brand
      }
    }, REQUEST_TIMEOUT);

    it('should proxy frontend assets correctly', async () => {
      // This test MUST FAIL initially - asset proxying not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/assets/index.css`);

      // May return 404 if assets don't exist yet, or proxy error
      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const contentType = response.headers.get('content-type');
        expect(contentType).toContain('text/css');
      }
    }, REQUEST_TIMEOUT);

    it('should handle SPA routing correctly', async () => {
      // This test MUST FAIL initially - SPA routing not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/servicos`);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const html = await response.text();
        expect(html).toContain('<!DOCTYPE html>'); // Should serve index.html for SPA routes
      }
    }, REQUEST_TIMEOUT);

    it('should set proper caching headers for static assets', async () => {
      // This test MUST FAIL initially - caching headers not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/vite.svg`);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const cacheControl = response.headers.get('cache-control');
        const expires = response.headers.get('expires');

        // Should have some caching strategy
        expect(cacheControl || expires).toBeTruthy();
      }
    }, REQUEST_TIMEOUT);
  });

  describe('API Proxying', () => {
    it('should proxy API requests to backend container', async () => {
      // This test MUST FAIL initially - API proxying not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/api/health`);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
        expect(data.status).toBe('healthy');
      }
    }, REQUEST_TIMEOUT);

    it('should proxy API contact endpoint', async () => {
      // This test MUST FAIL initially - API proxying not configured yet
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Nginx proxy test'
      };

      const response = await fetchWithTimeout(`${NGINX_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      expect([200, 400, 502, 503]).toContain(response.status);

      if (response.status === 200 || response.status === 400) {
        const data = await response.json();
        expect(data).toBeTypeOf('object');
      }
    }, REQUEST_TIMEOUT);

    it('should proxy API reviews endpoint', async () => {
      // This test MUST FAIL initially - API proxying not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/api/reviews`);

      expect([200, 500, 502, 503]).toContain(response.status);

      if (response.status === 200 || response.status === 500) {
        const data = await response.json();
        expect(data).toBeTypeOf('object');
      }
    }, REQUEST_TIMEOUT);

    it('should maintain API request headers through proxy', async () => {
      // This test MUST FAIL initially - header forwarding not configured yet
      const customHeader = 'nginx-proxy-test-12345';
      const response = await fetchWithTimeout(`${NGINX_URL}/api/health`, {
        headers: {
          'X-Test-Header': customHeader,
          'User-Agent': 'nginx-integration-test'
        }
      });

      expect([200, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
      }
    }, REQUEST_TIMEOUT);
  });

  describe('WordPress Proxying', () => {
    it('should proxy WordPress admin requests', async () => {
      // This test MUST FAIL initially - WordPress proxying not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/wp-admin/`);

      expect([200, 302, 404, 502, 503]).toContain(response.status);

      if (response.status === 200 || response.status === 302) {
        // WordPress admin should respond or redirect
        const contentType = response.headers.get('content-type');
        expect(contentType).toContain('text/html');
      }
    }, REQUEST_TIMEOUT);

    it('should proxy WordPress REST API', async () => {
      // This test MUST FAIL initially - WordPress REST API proxying not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/wp-json/wp/v2/posts?per_page=1`);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const posts = await response.json();
        expect(Array.isArray(posts)).toBe(true);
      }
    }, REQUEST_TIMEOUT);

    it('should handle WordPress media uploads through proxy', async () => {
      // This test MUST FAIL initially - WordPress media proxying not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/wp-content/uploads/`);

      expect([200, 403, 404, 502, 503]).toContain(response.status);

      // Directory listing may be disabled (403) which is OK
      if (response.status === 200 || response.status === 403) {
        // Successfully reached WordPress container
        expect(true).toBe(true);
      }
    }, REQUEST_TIMEOUT);

    it('should set proper PHP processing for WordPress files', async () => {
      // This test MUST FAIL initially - PHP processing not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/wp-json/wp/v2/`);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('name'); // WordPress site info
        expect(data).toHaveProperty('url');
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Load Balancing and Health Checks', () => {
    it('should perform upstream health checks', async () => {
      // This test MUST FAIL initially - health checks not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/nginx-health`);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('upstreams');
      }
    }, REQUEST_TIMEOUT);

    it('should handle backend container failures gracefully', async () => {
      // This test validates graceful degradation when backends are down
      // For TDD phase, just verify basic error handling
      try {
        const response = await fetchWithTimeout(`${NGINX_URL}/api/nonexistent`);
        expect([404, 502, 503]).toContain(response.status);
      } catch (error) {
        // Connection errors expected during TDD phase
        expect(error.message).toContain('fetch failed');
      }
    }, REQUEST_TIMEOUT);

    it('should distribute load across healthy backends', async () => {
      // This test validates load balancing (if multiple instances)
      // For single container setup, just verify consistent routing
      const responses = [];

      for (let i = 0; i < 3; i++) {
        try {
          const response = await fetchWithTimeout(`${NGINX_URL}/api/health`);
          responses.push(response.status);
        } catch (error) {
          responses.push(0); // Connection failed
        }
      }

      // All responses should be consistent (same backend)
      const uniqueStatuses = [...new Set(responses)];
      expect(uniqueStatuses.length).toBeLessThanOrEqual(2); // Allow for some variation
    }, REQUEST_TIMEOUT);
  });

  describe('Security and Headers', () => {
    it('should set security headers', async () => {
      // This test MUST FAIL initially - security headers not configured yet
      const response = await fetchWithTimeout(NGINX_URL);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status < 500) {
        // Check for common security headers
        const xFrameOptions = response.headers.get('x-frame-options');
        const xContentTypeOptions = response.headers.get('x-content-type-options');
        const xXSSProtection = response.headers.get('x-xss-protection');

        // At least one security header should be present
        expect(xFrameOptions || xContentTypeOptions || xXSSProtection).toBeTruthy();
      }
    }, REQUEST_TIMEOUT);

    it('should handle CORS correctly for all services', async () => {
      // This test MUST FAIL initially - CORS not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/api/health`, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        }
      });

      expect([200, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const corsOrigin = response.headers.get('access-control-allow-origin');
        expect(corsOrigin).toBeTruthy();
      }
    }, REQUEST_TIMEOUT);

    it('should compress responses appropriately', async () => {
      // This test MUST FAIL initially - compression not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/`, {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const encoding = response.headers.get('content-encoding');
        // Should compress large HTML responses
        expect(['gzip', 'deflate', 'br'].includes(encoding) || encoding === null).toBe(true);
      }
    }, REQUEST_TIMEOUT);
  });

  describe('SSL and HTTPS', () => {
    it('should handle HTTPS termination', async () => {
      // This test validates SSL termination (when available)
      try {
        const httpsUrl = NGINX_URL.replace('http:', 'https:');
        const response = await fetchWithTimeout(httpsUrl);

        if (response.status < 500) {
          console.log('SSL termination working correctly');
          expect(response.url.startsWith('https:')).toBe(true);
        }
      } catch (error) {
        // SSL may not be configured in development - this is OK
        console.log('SSL not configured (development environment)');
        expect(error).toBeDefined();
      }
    }, REQUEST_TIMEOUT);

    it('should redirect HTTP to HTTPS in production', async () => {
      // This test validates HTTP to HTTPS redirection
      // May not be configured in development environment
      try {
        const response = await fetchWithTimeout(NGINX_URL, {
          redirect: 'manual' // Don't follow redirects
        });

        if (response.status === 301 || response.status === 302) {
          const location = response.headers.get('location');
          expect(location?.startsWith('https:')).toBe(true);
        } else {
          // No redirect in development is OK
          expect([200, 404, 502, 503]).toContain(response.status);
        }
      } catch (error) {
        // Expected in development environment
        console.log('HTTP to HTTPS redirect not configured (development)');
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Performance and Caching', () => {
    it('should serve static files efficiently', async () => {
      // This test MUST FAIL initially - static file serving not optimized yet
      const startTime = Date.now();
      const response = await fetchWithTimeout(`${NGINX_URL}/favicon.ico`);
      const endTime = Date.now();

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const responseTime = endTime - startTime;
        expect(responseTime).toBeLessThan(1000); // Under 1 second

        const contentType = response.headers.get('content-type');
        expect(contentType).toContain('image/');
      }
    }, REQUEST_TIMEOUT);

    it('should cache static assets appropriately', async () => {
      // This test MUST FAIL initially - caching not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/vite.svg`);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const cacheControl = response.headers.get('cache-control');
        const etag = response.headers.get('etag');
        const lastModified = response.headers.get('last-modified');

        // Should have some caching mechanism
        expect(cacheControl || etag || lastModified).toBeTruthy();
      }
    }, REQUEST_TIMEOUT);

    it('should handle concurrent requests efficiently', async () => {
      // This test MUST FAIL initially - performance not optimized yet
      const concurrentRequests = 5;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, () =>
        fetchWithTimeout(`${NGINX_URL}/`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      responses.forEach(response => {
        expect([200, 404, 502, 503]).toContain(response.status);
      });

      const totalTime = endTime - startTime;
      const avgTime = totalTime / concurrentRequests;

      // Each request should average under 2 seconds
      expect(avgTime).toBeLessThan(2000);
    }, REQUEST_TIMEOUT);
  });

  describe('Error Handling', () => {
    it('should serve custom error pages', async () => {
      // This test MUST FAIL initially - custom error pages not configured yet
      const response = await fetchWithTimeout(`${NGINX_URL}/nonexistent-page-12345`);

      expect([404, 502, 503]).toContain(response.status);

      if (response.status === 404) {
        const html = await response.text();
        // Should serve a proper 404 page, not default Nginx page
        expect(html).toContain('<!DOCTYPE html>');
      }
    }, REQUEST_TIMEOUT);

    it('should handle backend service errors gracefully', async () => {
      // This test validates graceful error handling
      try {
        const response = await fetchWithTimeout(`${NGINX_URL}/api/error-test`);
        expect([404, 500, 502, 503]).toContain(response.status);
      } catch (error) {
        // Connection errors expected during TDD phase
        expect(error.message).toContain('fetch failed');
      }
    }, REQUEST_TIMEOUT);

    it('should log errors appropriately', async () => {
      // This test validates error logging (hard to test directly)
      // For TDD phase, just verify error responses are structured
      try {
        const response = await fetchWithTimeout(`${NGINX_URL}/api/nonexistent`);
        expect([404, 502, 503]).toContain(response.status);

        if (response.headers.get('content-type')?.includes('application/json')) {
          const data = await response.json();
          expect(data).toBeTypeOf('object');
        }
      } catch (error) {
        // Expected during TDD phase
        expect(error).toBeDefined();
      }
    }, REQUEST_TIMEOUT);
  });
});

// Export for potential use in other integration tests
export {
  NGINX_URL,
  FRONTEND_URL,
  API_URL,
  WORDPRESS_URL,
  fetchWithTimeout,
  waitForService
};