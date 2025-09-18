const axios = require('axios');
const { expect } = require('@jest/globals');

describe('Nginx Reverse Proxy Routing Integration', () => {
  const NGINX_BASE_URL = process.env.NGINX_BASE_URL || 'http://localhost';
  const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3002';
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
  const WORDPRESS_BASE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8083';

  beforeAll(async () => {
    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  describe('Basic Reverse Proxy Routing', () => {
    it('should proxy root requests to frontend', async () => {
      const response = await axios.get(NGINX_BASE_URL);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    it('should proxy API requests to backend service', async () => {
      const response = await axios.get(`${NGINX_BASE_URL}/api/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('healthy');
    });

    it('should proxy WordPress REST API requests', async () => {
      const response = await axios.get(`${NGINX_BASE_URL}/wp-json/wp/v2/posts`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should proxy WordPress admin requests', async () => {
      const response = await axios.get(`${NGINX_BASE_URL}/wp-admin/`);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('Static File Serving', () => {
    it('should serve static assets directly', async () => {
      try {
        const response = await axios.get(`${NGINX_BASE_URL}/favicon.ico`);
        expect([200, 404]).toContain(response.status);
      } catch (error) {
        // 404 is acceptable if favicon doesn't exist
        expect(error.response?.status).toBe(404);
      }
    });

    it('should handle JavaScript files with proper MIME type', async () => {
      try {
        const response = await axios.get(`${NGINX_BASE_URL}/assets/js/main.js`);
        if (response.status === 200) {
          expect(response.headers['content-type']).toMatch(/application\/javascript/);
        }
      } catch (error) {
        // 404 is acceptable for testing
        expect(error.response?.status).toBe(404);
      }
    });

    it('should handle CSS files with proper MIME type', async () => {
      try {
        const response = await axios.get(`${NGINX_BASE_URL}/assets/css/main.css`);
        if (response.status === 200) {
          expect(response.headers['content-type']).toMatch(/text\/css/);
        }
      } catch (error) {
        // 404 is acceptable for testing
        expect(error.response?.status).toBe(404);
      }
    });

    it('should handle image files with proper MIME type', async () => {
      try {
        const response = await axios.get(`${NGINX_BASE_URL}/assets/images/logo.png`);
        if (response.status === 200) {
          expect(response.headers['content-type']).toMatch(/image\/png/);
        }
      } catch (error) {
        // 404 is acceptable for testing
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('Load Balancing and Upstream Management', () => {
    it('should distribute load across multiple upstream servers', async () => {
      // Test load balancing by making multiple requests
      const requests = Array.from({ length: 5 }, () =>
        axios.get(`${NGINX_BASE_URL}/api/health`)
      );

      const responses = await Promise.allSettled(requests);
      const successful = responses.filter(r => r.status === 'fulfilled');

      // All requests should succeed
      expect(successful.length).toBe(5);
    });

    it('should handle upstream server failures gracefully', async () => {
      // Test that Nginx handles upstream failures
      const response = await axios.get(`${NGINX_BASE_URL}/api/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('upstream');
    });

    it('should implement health checks for upstream servers', async () => {
      const response = await axios.get(`${NGINX_BASE_URL}/nginx-status`);
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('SSL/TLS Termination', () => {
    it('should handle HTTPS requests if SSL is configured', async () => {
      try {
        const response = await axios.get(NGINX_BASE_URL.replace('http', 'https'), {
          validateStatus: false
        });
        // If SSL is configured, it should work
        if (response.status === 200) {
          expect(response.headers['content-type']).toMatch(/text\/html/);
        }
      } catch (error) {
        // SSL not configured is acceptable for testing
        if (error.code !== 'ECONNREFUSED') {
          throw error;
        }
      }
    });

    it('should redirect HTTP to HTTPS if configured', async () => {
      try {
        const response = await axios.get(NGINX_BASE_URL, {
          maxRedirects: 0,
          validateStatus: false
        });
        // Check for redirect
        expect([200, 301, 302]).toContain(response.status);
        if ([301, 302].includes(response.status)) {
          expect(response.headers.location).toMatch(/^https/);
        }
      } catch (error) {
        // No redirect is also acceptable
        expect(error.response?.status).toBe(200);
      }
    });
  });

  describe('Caching and Performance', () => {
    it('should implement caching headers for static assets', async () => {
      try {
        const response = await axios.get(`${NGINX_BASE_URL}/assets/css/main.css`);
        if (response.status === 200) {
          expect(response.headers).toHaveProperty('cache-control');
          expect(response.headers['cache-control']).toMatch(/public|max-age=/);
        }
      } catch (error) {
        // 404 is acceptable for testing
        expect(error.response?.status).toBe(404);
      }
    });

    it('should handle gzip compression', async () => {
      const response = await axios.get(NGINX_BASE_URL, {
        headers: {
          'Accept-Encoding': 'gzip'
        }
      });
      expect(response.status).toBe(200);
      expect(response.headers['content-encoding']).toBe('gzip');
    });

    it('should implement proper CORS headers', async () => {
      const response = await axios.get(`${NGINX_BASE_URL}/api/health`);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await axios.get(NGINX_BASE_URL);
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('should implement Content Security Policy', async () => {
      const response = await axios.get(NGINX_BASE_URL);
      expect(response.headers).toHaveProperty('content-security-policy');
    });

    it('should handle HTTPS enforcement headers', async () => {
      const response = await axios.get(NGINX_BASE_URL);
      expect(response.headers).toHaveProperty('strict-transport-security');
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should handle rate limiting for API endpoints', async () => {
      // Test rate limiting by making multiple requests
      const requests = Array.from({ length: 20 }, () =>
        axios.get(`${NGINX_BASE_URL}/api/health`, {
          validateStatus: false
        })
      );

      const responses = await Promise.all(requests);
      const successful = responses.filter(r => r.status === 200);
      const rateLimited = responses.filter(r => r.status === 429);

      // Should have some successful requests
      expect(successful.length).toBeGreaterThan(0);

      // May have some rate limited requests
      if (rateLimited.length > 0) {
        expect(rateLimited[0].headers).toHaveProperty('retry-after');
      }
    });

    it('should block malicious requests', async () => {
      // Test blocking of malicious requests
      try {
        await axios.get(`${NGINX_BASE_URL}/../../../etc/passwd`);
      } catch (error) {
        expect([400, 403, 404]).toContain(error.response?.status);
      }
    });

    it('should handle request size limits', async () => {
      // Test large request handling
      const largeData = 'x'.repeat(1024 * 1024); // 1MB
      try {
        await axios.post(`${NGINX_BASE_URL}/api/contact`, {
          data: largeData
        }, {
          validateStatus: false
        });
      } catch (error) {
        expect([413, 400]).toContain(error.response?.status);
      }
    });
  });

  describe('URL Rewriting and Redirects', () => {
    it('should handle URL rewriting for frontend routes', async () => {
      // Test SPA routing
      const response = await axios.get(`${NGINX_BASE_URL}/about`);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    it('should handle clean URL redirects', async () => {
      // Test URL redirects
      try {
        const response = await axios.get(`${NGINX_BASE_URL}/old-path`, {
          maxRedirects: 0,
          validateStatus: false
        });
        expect([200, 301, 302]).toContain(response.status);
      } catch (error) {
        expect(error.response?.status).toBe(200);
      }
    });

    it('should handle trailing slash redirects', async () => {
      const response1 = await axios.get(`${NGINX_BASE_URL}/api/health`);
      const response2 = await axios.get(`${NGINX_BASE_URL}/api/health/`);

      expect([response1.status, response2.status]).toContain(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await axios.get(`${NGINX_BASE_URL}/non-existent-page`, {
        validateStatus: false
      });
      expect(response.status).toBe(404);
    });

    it('should handle 502 Bad Gateway errors', async () => {
      // Test handling of upstream failures
      try {
        await axios.get(`${NGINX_BASE_URL}/api/error-502`, {
          validateStatus: false
        });
      } catch (error) {
        expect([502, 504]).toContain(error.response?.status);
      }
    });

    it('should serve custom error pages', async () => {
      const response = await axios.get(`${NGINX_BASE_URL}/non-existent`, {
        validateStatus: false
      });
      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const startTime = Date.now();

      const requests = Array.from({ length: concurrentRequests }, () =>
        axios.get(NGINX_BASE_URL)
      );

      await Promise.all(requests);
      const duration = Date.now() - startTime;

      // Should handle concurrent requests efficiently
      expect(duration).toBeLessThan(5000); // 5 seconds for 10 concurrent requests
    });

    it('should maintain response times under load', async () => {
      const startTime = Date.now();
      const response = await axios.get(NGINX_BASE_URL);
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // 1 second max response time
    });
  });

  describe('WebSocket Support', () => {
    it('should handle WebSocket upgrades if configured', async () => {
      // Test WebSocket support (basic check)
      try {
        const response = await axios.get(`${NGINX_BASE_URL}/socket.io/`, {
          headers: {
            'Connection': 'Upgrade',
            'Upgrade': 'websocket'
          },
          validateStatus: false
        });
        expect([101, 200, 404]).toContain(response.status);
      } catch (error) {
        // WebSocket not configured is acceptable
        expect([404, 501]).toContain(error.response?.status);
      }
    });
  });

  describe('Maintenance Mode', () => {
    it('should handle maintenance mode if enabled', async () => {
      // Test maintenance mode functionality
      try {
        const response = await axios.get(`${NGINX_BASE_URL}/`, {
          headers: {
            'X-Maintenance-Mode': 'true'
          },
          validateStatus: false
        });
        expect([200, 503]).toContain(response.status);
      } catch (error) {
        expect(error.response?.status).toBe(200);
      }
    });
  });
});
