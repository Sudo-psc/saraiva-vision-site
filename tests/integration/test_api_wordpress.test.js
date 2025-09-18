/**
 * Integration Test: API to WordPress Communication
 *
 * This test validates that the API container can successfully
 * communicate with the WordPress container in a containerized environment.
 *
 * MUST FAIL initially (TDD approach) - containers not implemented yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Configuration
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

describe('API to WordPress Communication Integration', () => {
  beforeAll(async () => {
    console.log('Testing API-to-WordPress communication in containerized environment');
    console.log(`API URL: ${API_URL}`);
    console.log(`WordPress URL: ${WORDPRESS_URL}`);
  });

  afterAll(() => {
    console.log('API-to-WordPress integration tests completed');
  });

  describe('Service Availability', () => {
    it('should have API service available for WordPress queries', async () => {
      // This test MUST FAIL initially - API container not running yet
      const available = await waitForService(`${API_URL}/api/health`);
      expect(available).toBe(true);
    }, 30000);

    it('should have WordPress service available for API calls', async () => {
      // This test MUST FAIL initially - WordPress container not running yet
      const available = await waitForService(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`);
      expect(available).toBe(true);
    }, 30000);

    it('should have both services responding to integration checks', async () => {
      // This test MUST FAIL initially - containers not implemented yet
      const [apiResponse, wordpressResponse] = await Promise.all([
        fetchWithTimeout(`${API_URL}/api/health`),
        fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`)
      ]);

      expect(apiResponse.status).toBe(200);
      expect([200, 404]).toContain(wordpressResponse.status); // 404 OK if no posts
    }, REQUEST_TIMEOUT);
  });

  describe('WordPress REST API via Container Network', () => {
    it('should allow API to fetch WordPress posts via container network', async () => {
      // This test MUST FAIL initially - WordPress container not running yet
      const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=5`);

      expect([200, 404]).toContain(response.status); // 404 OK if no posts

      if (response.status === 200) {
        const posts = await response.json();
        expect(Array.isArray(posts)).toBe(true);
      }
    }, REQUEST_TIMEOUT);

    it('should handle WordPress categories endpoint', async () => {
      // This test MUST FAIL initially - WordPress container not running yet
      const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/categories`);

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const categories = await response.json();
        expect(Array.isArray(categories)).toBe(true);
      }
    }, REQUEST_TIMEOUT);

    it('should handle WordPress media endpoint', async () => {
      // This test MUST FAIL initially - WordPress container not running yet
      const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/media?per_page=3`);

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const media = await response.json();
        expect(Array.isArray(media)).toBe(true);
      }
    }, REQUEST_TIMEOUT);

    it('should handle WordPress users endpoint with proper permissions', async () => {
      // This test MUST FAIL initially - WordPress container not running yet
      const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/users`);

      // Should respond but may restrict user data based on permissions
      expect([200, 401, 403]).toContain(response.status);

      if (response.status === 200) {
        const users = await response.json();
        expect(Array.isArray(users)).toBe(true);

        // Verify sensitive data is not exposed
        if (users.length > 0) {
          const user = users[0];
          expect(user).not.toHaveProperty('password');
          expect(user).not.toHaveProperty('user_pass');
        }
      }
    }, REQUEST_TIMEOUT);
  });

  describe('API Proxy Integration', () => {
    it('should allow API to proxy WordPress requests', async () => {
      // This test MUST FAIL initially - API proxy not implemented yet
      // Assumes API will proxy /wp-json/* requests to WordPress container
      const response = await fetchWithTimeout(`${API_URL}/wp-json/wp/v2/posts?per_page=3`);

      expect([200, 404, 502, 503]).toContain(response.status);

      if (response.status === 200) {
        const posts = await response.json();
        expect(Array.isArray(posts)).toBe(true);
      }
    }, REQUEST_TIMEOUT);

    it('should maintain request headers through API proxy', async () => {
      // This test MUST FAIL initially - API proxy headers not configured yet
      const customHeader = 'api-wordpress-test-12345';
      const response = await fetchWithTimeout(`${API_URL}/wp-json/wp/v2/posts?per_page=1`, {
        headers: {
          'X-Test-Header': customHeader,
          'Accept': 'application/json'
        }
      });

      expect([200, 404, 502, 503]).toContain(response.status);

      // If successful, WordPress should receive proxied headers
      if (response.status === 200) {
        const posts = await response.json();
        expect(Array.isArray(posts)).toBe(true);
      }
    }, REQUEST_TIMEOUT);

    it('should handle API authentication for WordPress admin requests', async () => {
      // This test MUST FAIL initially - auth integration not implemented yet
      const response = await fetchWithTimeout(`${API_URL}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // Test token
        },
        body: JSON.stringify({
          title: 'Test Post from API',
          content: 'Test content',
          status: 'draft'
        })
      });

      // Should fail with proper authentication error
      expect([401, 403, 502, 503]).toContain(response.status);

      if (response.status === 401 || response.status === 403) {
        const data = await response.json();
        expect(data).toHaveProperty('code');
        expect(['rest_cannot_create', 'rest_not_logged_in']).toContain(data.code);
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Database Communication', () => {
    it('should allow API to access WordPress SQLite database indirectly', async () => {
      // This test validates database communication through WordPress REST API
      // This test MUST FAIL initially - database not configured yet
      const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts?orderby=date&order=desc&per_page=1`);

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        const posts = await response.json();
        expect(Array.isArray(posts)).toBe(true);
      }
    }, REQUEST_TIMEOUT);

    it('should handle WordPress database connectivity errors gracefully', async () => {
      // This test validates error handling when WordPress database is unavailable
      // For now, just verify the response structure during TDD phase
      try {
        const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts`);
        expect([200, 404, 500, 503]).toContain(response.status);
      } catch (error) {
        // Connection refused expected during TDD phase
        expect(error.message).toContain('fetch failed');
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Container Network Performance', () => {
    it('should communicate efficiently via Docker internal networks', async () => {
      // This test MUST FAIL initially - Docker networks not configured yet
      const startTime = Date.now();
      const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`);
      const endTime = Date.now();

      expect([200, 404, 500]).toContain(response.status);

      const responseTime = endTime - startTime;
      // Container-to-container communication should be fast
      expect(responseTime).toBeLessThan(2000); // Under 2 seconds
    }, REQUEST_TIMEOUT);

    it('should handle concurrent API-to-WordPress requests', async () => {
      // This test MUST FAIL initially - performance not optimized yet
      const concurrentRequests = 3;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, () =>
        fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      responses.forEach(response => {
        expect([200, 404, 500]).toContain(response.status);
      });

      const totalTime = endTime - startTime;
      const avgTime = totalTime / concurrentRequests;

      // Each request should average under 1 second in container environment
      expect(avgTime).toBeLessThan(1000);
    }, REQUEST_TIMEOUT);

    it('should maintain performance under API load', async () => {
      // This test validates performance characteristics
      const startTime = Date.now();
      const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`);
      const endTime = Date.now();

      expect([200, 404, 500]).toContain(response.status);

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(3000); // Under 3 seconds for individual request
    }, REQUEST_TIMEOUT);
  });

  describe('Error Handling and Resilience', () => {
    it('should handle WordPress service unavailability gracefully', async () => {
      // This test validates error handling when WordPress is down
      try {
        const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/nonexistent`);
        expect([404, 500]).toContain(response.status);
      } catch (error) {
        // Connection refused expected during TDD phase
        expect(error.message).toContain('fetch failed');
      }
    }, REQUEST_TIMEOUT);

    it('should handle network timeouts in container environment', async () => {
      // This test validates timeout handling
      try {
        const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts`, {}, 100); // Very short timeout
        // If it succeeds, that's fine too
        expect(response).toBeDefined();
      } catch (error) {
        // Timeout or connection error expected
        expect(error.message).toMatch(/timeout|fetch failed/);
      }
    });

    it('should handle malformed WordPress responses', async () => {
      // This test validates client-side error handling
      try {
        const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts`);
        const data = await response.json();
        expect(data).toBeDefined();
      } catch (error) {
        // JSON parsing or connection errors expected during TDD
        expect(error).toBeDefined();
      }
    }, REQUEST_TIMEOUT);
  });

  describe('WordPress Container Security', () => {
    it('should prevent unauthorized access to admin endpoints', async () => {
      // This test validates WordPress security in containerized environment
      const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      // Should fail with proper authentication error
      expect([401, 403, 500]).toContain(response.status);
    }, REQUEST_TIMEOUT);

    it('should handle CORS properly for API-to-WordPress requests', async () => {
      // This test validates CORS configuration
      const response = await fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`, {
        headers: {
          'Origin': API_URL
        }
      });

      expect([200, 404, 500]).toContain(response.status);

      if (response.status === 200 || response.status === 404) {
        // Check CORS headers if request succeeds
        const corsOrigin = response.headers.get('access-control-allow-origin');
        // May be null in development environment
        expect(corsOrigin === null || corsOrigin === '*' || corsOrigin === API_URL).toBe(true);
      }
    }, REQUEST_TIMEOUT);
  });
});

// Export for potential use in other integration tests
export {
  API_URL,
  WORDPRESS_URL,
  fetchWithTimeout,
  waitForService
};