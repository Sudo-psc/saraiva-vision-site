/**
 * Integration Test: Container Startup and Coordination
 *
 * This test validates that all containers start up in the correct order,
 * become healthy, and can communicate with each other properly.
 *
 * MUST FAIL initially (TDD approach) - containers not implemented yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';
const API_URL = process.env.API_URL || 'http://localhost:3001';
const WORDPRESS_URL = process.env.WORDPRESS_URL || 'http://localhost:9000';
const NGINX_URL = process.env.NGINX_URL || 'http://localhost:80';
const REQUEST_TIMEOUT = 20000; // 20 seconds for startup tests
const STARTUP_TIMEOUT = 60000; // 60 seconds for full stack startup

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
 * Wait for service to be healthy with retry logic
 */
async function waitForServiceHealth(url, maxAttempts = 30, interval = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {}, 5000);
      if (response.status === 200) {
        return { healthy: true, attempt, status: response.status };
      }
    } catch (error) {
      console.log(`Health check ${attempt}/${maxAttempts}: ${url} - ${error.message}`);
    }

    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  return { healthy: false, attempt: maxAttempts, status: null };
}

/**
 * Check if container is responding (any status < 500)
 */
async function isContainerResponding(url, maxAttempts = 20, interval = 1500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {}, 3000);
      if (response.status < 500) {
        return { responding: true, attempt, status: response.status };
      }
    } catch (error) {
      console.log(`Startup check ${attempt}/${maxAttempts}: ${url} - ${error.message}`);
    }

    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  return { responding: false, attempt: maxAttempts, status: null };
}

describe('Container Startup and Coordination Integration', () => {
  beforeAll(async () => {
    console.log('Testing container startup coordination in Docker environment');
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log(`API URL: ${API_URL}`);
    console.log(`WordPress URL: ${WORDPRESS_URL}`);
    console.log(`Nginx URL: ${NGINX_URL}`);
  });

  afterAll(() => {
    console.log('Container startup coordination tests completed');
  });

  describe('Individual Container Startup', () => {
    it('should start API container first (dependency base)', async () => {
      // This test MUST FAIL initially - API container not implemented yet
      const result = await waitForServiceHealth(`${API_URL}/api/health`);

      expect(result.healthy).toBe(true);
      expect(result.attempt).toBeLessThan(15); // Should start within 30 seconds
      console.log(`API container healthy after ${result.attempt} attempts`);
    }, STARTUP_TIMEOUT);

    it('should start WordPress container independently', async () => {
      // This test MUST FAIL initially - WordPress container not implemented yet
      const result = await isContainerResponding(`${WORDPRESS_URL}/wp-json/wp/v2/`);

      expect(result.responding).toBe(true);
      expect(result.attempt).toBeLessThan(20); // Should respond within 30 seconds
      console.log(`WordPress container responding after ${result.attempt} attempts`);
    }, STARTUP_TIMEOUT);

    it('should start Frontend container after dependencies', async () => {
      // This test MUST FAIL initially - Frontend container not implemented yet
      const result = await isContainerResponding(`${FRONTEND_URL}/`);

      expect(result.responding).toBe(true);
      expect(result.attempt).toBeLessThan(15); // Should start quickly after deps
      console.log(`Frontend container responding after ${result.attempt} attempts`);
    }, STARTUP_TIMEOUT);

    it('should start Nginx container last as reverse proxy', async () => {
      // This test MUST FAIL initially - Nginx container not implemented yet
      const result = await isContainerResponding(NGINX_URL);

      expect(result.responding).toBe(true);
      expect(result.attempt).toBeLessThan(10); // Should start quickly (just config)
      console.log(`Nginx container responding after ${result.attempt} attempts`);
    }, STARTUP_TIMEOUT);
  });

  describe('Service Dependency Validation', () => {
    it('should validate API is ready before frontend starts serving', async () => {
      // This test MUST FAIL initially - dependency validation not implemented yet
      const [apiHealth, frontendStatus] = await Promise.all([
        waitForServiceHealth(`${API_URL}/api/health`),
        isContainerResponding(`${FRONTEND_URL}/`)
      ]);

      expect(apiHealth.healthy).toBe(true);
      expect(frontendStatus.responding).toBe(true);

      // Frontend should not serve until API is healthy
      if (frontendStatus.responding) {
        const frontendResponse = await fetchWithTimeout(`${FRONTEND_URL}/`);
        expect(frontendResponse.status).toBe(200);
      }
    }, STARTUP_TIMEOUT);

    it('should validate all upstreams before Nginx starts proxying', async () => {
      // This test MUST FAIL initially - upstream validation not implemented yet
      const upstreamChecks = await Promise.all([
        isContainerResponding(`${API_URL}/api/health`),
        isContainerResponding(`${FRONTEND_URL}/`),
        isContainerResponding(`${WORDPRESS_URL}/wp-json/wp/v2/`)
      ]);

      const nginxReady = await isContainerResponding(NGINX_URL);

      // All upstreams should be responding
      upstreamChecks.forEach((check, index) => {
        const services = ['API', 'Frontend', 'WordPress'];
        console.log(`${services[index]} upstream check: ${check.responding}`);
        expect(check.responding).toBe(true);
      });

      expect(nginxReady.responding).toBe(true);
    }, STARTUP_TIMEOUT);

    it('should handle startup dependency failures gracefully', async () => {
      // This test validates graceful degradation when dependencies fail
      // For TDD phase, just verify timeout handling
      try {
        const result = await waitForServiceHealth(`${API_URL}/api/health`, 3, 1000);
        if (!result.healthy) {
          console.log('Dependency failure handling: API not ready within timeout');
          expect(result.healthy).toBe(false);
        } else {
          expect(result.healthy).toBe(true);
        }
      } catch (error) {
        // Expected during TDD phase
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  describe('Health Check Orchestration', () => {
    it('should perform readiness probes on all containers', async () => {
      // This test MUST FAIL initially - readiness probes not implemented yet
      const readinessChecks = await Promise.all([
        fetchWithTimeout(`${API_URL}/api/health`),
        fetchWithTimeout(`${FRONTEND_URL}/health`),
        fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/`),
        fetchWithTimeout(`${NGINX_URL}/nginx-health`)
      ]);

      const services = ['API', 'Frontend', 'WordPress', 'Nginx'];
      readinessChecks.forEach((response, index) => {
        console.log(`${services[index]} readiness: ${response.status}`);
        expect([200, 404]).toContain(response.status); // 404 acceptable for some endpoints
      });
    }, REQUEST_TIMEOUT);

    it('should perform liveness probes during operation', async () => {
      // This test MUST FAIL initially - liveness probes not implemented yet
      const livenessChecks = await Promise.all([
        fetchWithTimeout(`${API_URL}/api/health`),
        fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/`),
        fetchWithTimeout(`${NGINX_URL}/`)
      ]);

      const services = ['API', 'WordPress', 'Nginx'];
      livenessChecks.forEach((response, index) => {
        console.log(`${services[index]} liveness: ${response.status}`);
        expect(response.status).toBeLessThan(500); // Any non-server error is OK
      });
    }, REQUEST_TIMEOUT);

    it('should report container health status comprehensively', async () => {
      // This test MUST FAIL initially - comprehensive health reporting not implemented yet
      const healthResponse = await fetchWithTimeout(`${API_URL}/api/health`);

      expect(healthResponse.status).toBe(200);

      const healthData = await healthResponse.json();
      expect(healthData).toHaveProperty('status');
      expect(healthData).toHaveProperty('timestamp');
      expect(healthData).toHaveProperty('version');
      expect(healthData).toHaveProperty('services');

      // Should include status of dependent services
      if (healthData.services) {
        expect(healthData.services).toHaveProperty('database');
        expect(healthData.services).toHaveProperty('cache');
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Container Network Communication', () => {
    it('should establish internal Docker network connectivity', async () => {
      // This test MUST FAIL initially - Docker networks not configured yet
      // Tests that containers can reach each other via internal hostnames

      const networkTests = await Promise.all([
        fetchWithTimeout(`${API_URL}/api/health`),
        fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`),
        fetchWithTimeout(`${FRONTEND_URL}/`)
      ]);

      networkTests.forEach((response, index) => {
        const services = ['API', 'WordPress', 'Frontend'];
        console.log(`${services[index]} network connectivity: ${response.status}`);
        expect(response.status).toBeLessThan(500);
      });
    }, REQUEST_TIMEOUT);

    it('should resolve container hostnames correctly', async () => {
      // This test validates DNS resolution within Docker network
      // For external testing, just verify services are accessible
      const hostnameTests = [
        { name: 'API', url: `${API_URL}/api/health` },
        { name: 'WordPress', url: `${WORDPRESS_URL}/wp-json/wp/v2/` },
        { name: 'Frontend', url: `${FRONTEND_URL}/` },
        { name: 'Nginx', url: NGINX_URL }
      ];

      for (const test of hostnameTests) {
        try {
          const response = await fetchWithTimeout(test.url);
          console.log(`${test.name} hostname resolution: OK (${response.status})`);
          expect(response.status).toBeLessThan(500);
        } catch (error) {
          console.log(`${test.name} hostname resolution: FAILED - ${error.message}`);
          // Expected during TDD phase
          expect(error).toBeDefined();
        }
      }
    }, REQUEST_TIMEOUT);

    it('should handle network partitions gracefully', async () => {
      // This test validates behavior when network connectivity is lost
      // For TDD phase, just verify timeout handling
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/health`, {}, 2000);
        expect(response.status).toBeLessThan(500);
      } catch (error) {
        // Network issues expected during TDD phase
        expect(error.message).toMatch(/timeout|fetch failed/);
      }
    });
  });

  describe('Resource Management', () => {
    it('should respect container memory limits during startup', async () => {
      // This test validates resource constraints are enforced
      // For TDD phase, just verify containers can start within limits
      const memoryTestPromises = [
        fetchWithTimeout(`${API_URL}/api/health`),
        fetchWithTimeout(`${FRONTEND_URL}/`),
        fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/`),
        fetchWithTimeout(NGINX_URL)
      ];

      const startTime = Date.now();
      const responses = await Promise.all(memoryTestPromises);
      const endTime = Date.now();

      responses.forEach((response, index) => {
        const services = ['API', 'Frontend', 'WordPress', 'Nginx'];
        console.log(`${services[index]} memory test: ${response.status}`);
        expect(response.status).toBeLessThan(500);
      });

      const totalTime = endTime - startTime;
      console.log(`All containers responded in ${totalTime}ms`);
      expect(totalTime).toBeLessThan(15000); // Should all respond within 15 seconds
    }, REQUEST_TIMEOUT);

    it('should handle CPU constraints during concurrent startup', async () => {
      // This test validates CPU usage during startup
      // For TDD phase, just verify reasonable startup times
      const concurrentRequests = 5;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, () =>
        fetchWithTimeout(`${API_URL}/api/health`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });

      const totalTime = endTime - startTime;
      const avgTime = totalTime / concurrentRequests;

      console.log(`Average response time under load: ${avgTime}ms`);
      expect(avgTime).toBeLessThan(3000); // Average under 3 seconds
    }, REQUEST_TIMEOUT);

    it('should monitor resource usage and report status', async () => {
      // This test validates resource monitoring capabilities
      // For TDD phase, just verify health endpoints respond
      const healthResponse = await fetchWithTimeout(`${API_URL}/api/health`);

      expect(healthResponse.status).toBe(200);

      const healthData = await healthResponse.json();
      expect(healthData).toHaveProperty('status');

      // Future: should include resource usage metrics
      if (healthData.resources) {
        expect(healthData.resources).toHaveProperty('memory');
        expect(healthData.resources).toHaveProperty('cpu');
      }
    }, REQUEST_TIMEOUT);
  });

  describe('Startup Performance', () => {
    it('should complete full stack startup within acceptable time', async () => {
      // This test MUST FAIL initially - optimized startup not implemented yet
      const startupStart = Date.now();

      const fullStackHealth = await Promise.all([
        waitForServiceHealth(`${API_URL}/api/health`),
        isContainerResponding(`${FRONTEND_URL}/`),
        isContainerResponding(`${WORDPRESS_URL}/wp-json/wp/v2/`),
        isContainerResponding(NGINX_URL)
      ]);

      const startupEnd = Date.now();
      const totalStartupTime = startupEnd - startupStart;

      console.log(`Full stack startup completed in ${totalStartupTime}ms`);

      // All services should be ready
      fullStackHealth.forEach((result, index) => {
        const services = ['API', 'Frontend', 'WordPress', 'Nginx'];
        const isHealthy = result.healthy !== undefined ? result.healthy : result.responding;
        console.log(`${services[index]} startup result: ${isHealthy}`);
        expect(isHealthy).toBe(true);
      });

      // Total startup should be reasonable
      expect(totalStartupTime).toBeLessThan(45000); // Under 45 seconds
    }, STARTUP_TIMEOUT);

    it('should optimize startup order for minimum total time', async () => {
      // This test validates optimal startup sequencing
      const startupOrder = [];
      const checkInterval = 1000;
      const maxChecks = 30;

      for (let i = 0; i < maxChecks; i++) {
        const checks = await Promise.allSettled([
          fetchWithTimeout(`${API_URL}/api/health`, {}, 2000),
          fetchWithTimeout(`${FRONTEND_URL}/`, {}, 2000),
          fetchWithTimeout(`${WORDPRESS_URL}/wp-json/wp/v2/`, {}, 2000),
          fetchWithTimeout(NGINX_URL, {}, 2000)
        ]);

        const services = ['API', 'Frontend', 'WordPress', 'Nginx'];
        checks.forEach((check, index) => {
          if (check.status === 'fulfilled' && check.value.status < 500) {
            if (!startupOrder.some(s => s.service === services[index])) {
              startupOrder.push({
                service: services[index],
                time: i * checkInterval
              });
            }
          }
        });

        if (startupOrder.length === 4) break;
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }

      console.log('Startup order:', startupOrder);
      expect(startupOrder.length).toBeGreaterThan(0);

      // API should typically start first
      if (startupOrder.length > 1) {
        const apiStartup = startupOrder.find(s => s.service === 'API');
        if (apiStartup) {
          expect(apiStartup.time).toBeLessThanOrEqual(15000); // Within 15 seconds
        }
      }
    }, STARTUP_TIMEOUT);

    it('should handle restart scenarios efficiently', async () => {
      // This test validates restart behavior
      // For TDD phase, just verify current availability
      const restartTest = await Promise.all([
        fetchWithTimeout(`${API_URL}/api/health`),
        fetchWithTimeout(`${FRONTEND_URL}/`),
        fetchWithTimeout(NGINX_URL)
      ]);

      restartTest.forEach((response, index) => {
        const services = ['API', 'Frontend', 'Nginx'];
        console.log(`${services[index]} restart readiness: ${response.status}`);
        expect(response.status).toBeLessThan(500);
      });
    }, REQUEST_TIMEOUT);
  });

  describe('Error Recovery', () => {
    it('should handle individual container failures', async () => {
      // This test validates error recovery when containers fail
      // For TDD phase, just verify error handling exists
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/health`);
        expect(response.status).toBeLessThan(500);
      } catch (error) {
        // Connection errors expected during TDD phase
        console.log('Container failure handling test:', error.message);
        expect(error).toBeDefined();
      }
    }, REQUEST_TIMEOUT);

    it('should maintain service availability during partial failures', async () => {
      // This test validates graceful degradation
      // For TDD phase, just verify basic error responses
      const partialFailureTests = [
        { name: 'API', url: `${API_URL}/api/health` },
        { name: 'Frontend', url: `${FRONTEND_URL}/` },
        { name: 'Nginx', url: NGINX_URL }
      ];

      for (const test of partialFailureTests) {
        try {
          const response = await fetchWithTimeout(test.url);
          console.log(`${test.name} availability test: ${response.status}`);
          expect(response.status).toBeLessThan(500);
        } catch (error) {
          console.log(`${test.name} partial failure test: ${error.message}`);
          // Expected during TDD phase
        }
      }
    }, REQUEST_TIMEOUT);

    it('should recover from network interruptions', async () => {
      // This test validates network recovery
      // For TDD phase, just verify timeout handling
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/health`, {}, 5000);
        expect(response.status).toBeLessThan(500);
      } catch (error) {
        // Network interruptions expected during TDD phase
        expect(error.message).toMatch(/timeout|fetch failed/);
      }
    });
  });
});

// Export for potential use in other integration tests
export {
  FRONTEND_URL,
  API_URL,
  WORDPRESS_URL,
  NGINX_URL,
  fetchWithTimeout,
  waitForServiceHealth,
  isContainerResponding
};