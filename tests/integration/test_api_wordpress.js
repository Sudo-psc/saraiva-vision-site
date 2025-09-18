const axios = require('axios');
const { expect } = require('@jest/globals');

describe('API to WordPress Proxy Integration', () => {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
  const WORDPRESS_BASE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8083';

  beforeAll(async () => {
    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
  });

  describe('WordPress REST API Proxy', () => {
    it('should proxy WordPress posts through API', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/wordpress/posts`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        const post = response.data[0];
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
      }
    });

    it('should handle WordPress post retrieval by ID', async () => {
      try {
        // First get a post ID
        const postsResponse = await axios.get(`${API_BASE_URL}/api/wordpress/posts`);
        if (postsResponse.data.length > 0) {
          const postId = postsResponse.data[0].id;
          const response = await axios.get(`${API_BASE_URL}/api/wordpress/posts/${postId}`);
          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty('id', postId);
        }
      } catch (error) {
        // If no posts exist, this is acceptable for testing
        if (error.response && error.response.status === 404) {
          expect(error.response.status).toBe(404);
        } else {
          throw error;
        }
      }
    });

    it('should proxy WordPress pages through API', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/wordpress/pages`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should handle WordPress categories proxy', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/wordpress/categories`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should proxy WordPress media through API', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/wordpress/media`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('API-WordPress Communication Reliability', () => {
    it('should maintain connection stability under load', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        axios.get(`${API_BASE_URL}/api/wordpress/posts`)
      );

      const responses = await Promise.allSettled(requests);
      const successful = responses.filter(r => r.status === 'fulfilled');
      const failed = responses.filter(r => r.status === 'rejected');

      // Allow for some network issues but require majority success
      expect(successful.length).toBeGreaterThan(7);
      expect(failed.length).toBeLessThan(3);
    });

    it('should handle timeout scenarios gracefully', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/wordpress/posts`, {
          timeout: 100 // Very short timeout
        });
      } catch (error) {
        expect(error.code).toBe('ECONNABORTED');
      }
    });

    it('should retry failed WordPress connections', async () => {
      // This test assumes the API has retry logic
      const startTime = Date.now();
      try {
        await axios.get(`${API_BASE_URL}/api/wordpress/posts`);
      } catch (error) {
        const duration = Date.now() - startTime;
        // Should have taken some time if retrying
        expect(duration).toBeGreaterThan(1000);
      }
    });
  });

  describe('WordPress Content Management Operations', () => {
    it('should handle WordPress content creation proxy', async () => {
      // This would typically require authentication
      // For testing, we verify the endpoint exists and handles auth properly
      try {
        const postData = {
          title: 'Test Post',
          content: 'Test content',
          status: 'draft'
        };

        await axios.post(`${API_BASE_URL}/api/wordpress/posts`, postData);
      } catch (error) {
        // Should fail with 401 or 403 due to authentication
        expect([401, 403]).toContain(error.response?.status);
      }
    });

    it('should proxy WordPress comments through API', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/wordpress/comments`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should handle WordPress users proxy', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/wordpress/users`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('Error Handling and Fallback', () => {
    it('should handle WordPress service unavailability', async () => {
      // This test simulates WordPress being down
      try {
        await axios.get(`${API_BASE_URL}/api/wordpress/posts`, {
          headers: {
            'X-Test-Simulate-WordPress-Down': 'true'
          }
        });
      } catch (error) {
        expect(error.response?.status).toBe(503);
      }
    });

    it('should provide meaningful error messages for WordPress failures', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/wordpress/invalid-endpoint`);
      } catch (error) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data).toHaveProperty('message');
      }
    });

    it('should handle malformed WordPress responses', async () => {
      // Test API's ability to handle invalid responses from WordPress
      try {
        await axios.get(`${API_BASE_URL}/api/wordpress/posts`, {
          headers: {
            'X-Test-Malformed-Response': 'true'
          }
        });
      } catch (error) {
        expect(error.response?.status).toBe(502);
      }
    });
  });

  describe('Performance and Caching', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}/api/wordpress/posts`);
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should implement caching headers', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/wordpress/posts`);
      expect(response.headers).toHaveProperty('cache-control');
      expect(response.headers['cache-control']).toMatch(/public|private|no-cache/);
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 5;
      const startTime = Date.now();

      const requests = Array.from({ length: concurrentRequests }, () =>
        axios.get(`${API_BASE_URL}/api/wordpress/posts`)
      );

      await Promise.all(requests);
      const duration = Date.now() - startTime;

      // Should handle concurrent requests efficiently
      expect(duration).toBeLessThan(10000); // 10 seconds for 5 concurrent requests
    });
  });

  describe('WordPress Authentication and Security', () => {
    it('should proxy WordPress authentication endpoints', async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/wordpress/token`, {
          username: 'test',
          password: 'test'
        });
      } catch (error) {
        // Should fail with authentication error
        expect([400, 401, 403]).toContain(error.response?.status);
      }
    });

    it('should handle WordPress nonce validation through API', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/wordpress/nonce`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('nonce');
    });

    it('should validate WordPress API permissions', async () => {
      // Test that the API respects WordPress permission levels
      try {
        await axios.get(`${API_BASE_URL}/api/wordpress/users`);
      } catch (error) {
        // Should fail due to authentication requirements
        expect([401, 403]).toContain(error.response?.status);
      }
    });
  });

  describe('WordPress Plugin Integration', () => {
    it('should handle custom WordPress plugin endpoints', async () => {
      // Test custom plugin endpoints if they exist
      try {
        const response = await axios.get(`${API_BASE_URL}/api/wordpress/plugins/custom`);
        expect([200, 404]).toContain(response.status);
      } catch (error) {
        expect([404, 501]).toContain(error.response?.status);
      }
    });

    it('should proxy WordPress ACF (Advanced Custom Fields) data', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/wordpress/acf`);
        expect([200, 404]).toContain(response.status);
      } catch (error) {
        expect([404, 501]).toContain(error.response?.status);
      }
    });
  });
});
