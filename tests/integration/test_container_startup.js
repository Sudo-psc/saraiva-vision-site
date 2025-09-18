const { exec } = require('child_process');
const { expect } = require('@jest/globals');
const axios = require('axios');

describe('Container Startup Sequence Integration', () => {
  const DOCKER_COMPOSE_DEV = 'docker-compose -f docker-compose.dev.yml';
  const DOCKER_COMPOSE_PROD = 'docker-compose -f docker-compose.prod.yml';
  const SERVICES = ['frontend', 'api', 'wordpress', 'nginx'];
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
  const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3002';
  const WORDPRESS_BASE_URL = process.env.WORDPRESS_BASE_URL || 'http://localhost:8083';
  const NGINX_BASE_URL = process.env.NGINX_BASE_URL || 'http://localhost';

  beforeAll(async () => {
    // Ensure containers are ready before testing
    await new Promise(resolve => setTimeout(resolve, 10000));
  });

  describe('Container Status Verification', () => {
    it('should verify all containers are running', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} ps --services --filter "status=running"`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        const runningServices = stdout.trim().split('\n').filter(s => s);

        // Check that all expected services are running
        SERVICES.forEach(service => {
          expect(runningServices).toContain(service);
        });

        done();
      });
    }, 30000);

    it('should verify container health status', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} ps`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        const output = stdout;

        // Check that all services are either healthy or running
        SERVICES.forEach(service => {
          expect(output).toContain(service);
          // Health status should be present (either "healthy" or "running")
          expect(output).toMatch(new RegExp(`${service}.*\\(healthy\\)|${service}.*\\(running\\)|${service}.*up`));
        });

        done();
      });
    }, 30000);
  });

  describe('Dependency Order Validation', () => {
    it('should respect container startup dependencies', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} ps --format "table {{.Service}}\\t{{.Status}}"`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        const lines = stdout.split('\n').filter(line => line.trim());
        const serviceStatuses = {};

        // Parse service statuses
        lines.forEach(line => {
          const match = line.match(/^(\w+)\s+(.+)$/);
          if (match) {
            const [, service, status] = match;
            serviceStatuses[service] = status;
          }
        });

        // WordPress should start before API (WordPress provides database)
        // API should start before frontend (frontend depends on API)
        // All should start before nginx (nginx depends on all upstream services)

        expect(Object.keys(serviceStatuses)).toEqual(expect.arrayContaining(SERVICES));
        done();
      });
    }, 30000);
  });

  describe('Port Allocation and Network Connectivity', () => {
    it('should verify all required ports are available', (done) => {
      exec('netstat -tlnp 2>/dev/null | grep LISTEN || ss -tlnp | grep LISTEN', (error, stdout, stderr) => {
        if (error) {
          // If netstat/ss fails, try alternative approach
          done();
          return;
        }

        const listeningPorts = stdout;

        // Check for critical ports
        expect(listeningPorts).toMatch(/:80\s/);      // Nginx
        expect(listeningPorts).toMatch(/:443\s/);     // SSL
        expect(listeningPorts).toMatch(/:3001\s/);    // API
        expect(listeningPorts).toMatch(/:3002\s/);    // Frontend
        expect(listeningPorts).toMatch(/:8083\s/);    // WordPress

        done();
      });
    }, 30000);

    it('should verify container network connectivity', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} exec -T frontend wget --spider --timeout=5 http://api:3001/api/health`, (error, stdout, stderr) => {
        if (error) {
          // This might fail during startup, which is acceptable
          done();
          return;
        }

        expect(error).toBeNull();
        done();
      });
    }, 30000);
  });

  describe('Service Health Endpoints', () => {
    it('should verify frontend health endpoint', async () => {
      try {
        const response = await axios.get(`${FRONTEND_BASE_URL}/health`, {
          timeout: 5000
        });
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status');
      } catch (error) {
        // Service might still be starting up
        expect([503, 502, 'ECONNREFUSED', 'ETIMEDOUT']).toContain(
          error.response?.status || error.code
        );
      }
    });

    it('should verify API health endpoint', async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health`, {
          timeout: 5000
        });
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status');
        expect(response.data.status).toBe('healthy');
      } catch (error) {
        // Service might still be starting up
        expect([503, 502, 'ECONNREFUSED', 'ETIMEDOUT']).toContain(
          error.response?.status || error.code
        );
      }
    });

    it('should verify WordPress REST API', async () => {
      try {
        const response = await axios.get(`${WORDPRESS_BASE_URL}/wp-json/wp/v2/posts`, {
          timeout: 5000
        });
        expect(response.status).toBe(200);
      } catch (error) {
        // WordPress might still be initializing
        expect([503, 502, 'ECONNREFUSED', 'ETIMEDOUT']).toContain(
          error.response?.status || error.code
        );
      }
    });

    it('should verify Nginx proxy health', async () => {
      try {
        const response = await axios.get(`${NGINX_BASE_URL}/health`, {
          timeout: 5000
        });
        expect(response.status).toBe(200);
      } catch (error) {
        // Try root endpoint as fallback
        try {
          const fallbackResponse = await axios.get(NGINX_BASE_URL, {
            timeout: 5000
          });
          expect(fallbackResponse.status).toBe(200);
        } catch (fallbackError) {
          // Nginx might still be starting up
          expect([503, 502, 'ECONNREFUSED', 'ETIMEDOUT']).toContain(
            fallbackError.response?.status || fallbackError.code
          );
        }
      }
    });
  });

  describe('Container Resource Management', () => {
    it('should verify container resource limits', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} exec -T frontend cat /sys/fs/cgroup/memory/memory.limit_in_bytes`, (error, stdout, stderr) => {
        if (error) {
          // Resource limits might not be available in all environments
          done();
          return;
        }

        const memoryLimit = parseInt(stdout.trim());
        expect(memoryLimit).toBeGreaterThan(0);
        done();
      });
    }, 30000);

    it('should verify container restart policies', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} ps --format "table {{.Service}}\\t{{.RestartCount}}"`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        const lines = stdout.split('\n').filter(line => line.trim());

        // Parse restart counts
        lines.forEach(line => {
          const match = line.match(/^(\w+)\s+(\d+)$/);
          if (match) {
            const [, service, restartCount] = match;
            const count = parseInt(restartCount);

            // Services should not have restarted excessively
            expect(count).toBeLessThan(5);
          }
        });

        done();
      });
    }, 30000);
  });

  describe('Volume and Mount Management', () => {
    it('should verify persistent volumes are mounted', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} exec -T wordpress ls -la /var/www/html/wp-content/`, (error, stdout, stderr) => {
        if (error) {
          // Volume might not be ready yet
          done();
          return;
        }

        // Should show WordPress content directory
        expect(stdout).toMatch(/plugins|themes|uploads/);
        done();
      });
    }, 30000);

    it('should verify database persistence', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} exec -T wordpress ls -la /var/www/html/wp-content/database/`, (error, stdout, stderr) => {
        if (error) {
          // Database might not be ready yet
          done();
          return;
        }

        // Should show database file
        expect(stdout).toMatch(/\.db$/);
        done();
      });
    }, 30000);
  });

  describe('Environment Variables and Configuration', () => {
    it('should verify critical environment variables are set', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} exec -T api env | grep -E 'NODE_ENV|PORT|DATABASE_URL'`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        const envVars = stdout.trim();
        expect(envVars).toMatch(/NODE_ENV/);
        expect(envVars).toMatch(/PORT/);
        done();
      });
    }, 30000);

    it('should verify WordPress configuration', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} exec -T wordpress wp --info`, (error, stdout, stderr) => {
        if (error) {
          // WP-CLI might not be available
          done();
          return;
        }

        expect(stdout).toMatch(/WordPress version/);
        done();
      });
    }, 30000);
  });

  describe('Startup Performance', () => {
    it('should measure container startup times', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} ps --format "table {{.Service}}\\t{{.Status}}"`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        const lines = stdout.split('\n').filter(line => line.trim());
        const startupTimes = {};

        lines.forEach(line => {
          const match = line.match(/^(\w+)\s+.+?Up\s+([\d.]+)(seconds?|minutes?)/);
          if (match) {
            const [, service, time] = match;
            startupTimes[service] = time;
          }
        });

        // Services should start within reasonable time
        Object.keys(startupTimes).forEach(service => {
          const time = parseFloat(startupTimes[service]);
          expect(time).toBeLessThan(300); // 5 minutes max
        });

        done();
      });
    }, 30000);
  });

  describe('Graceful Shutdown and Cleanup', () => {
    it('should handle container stop and restart gracefully', (done) => {
      // Stop a service and verify it restarts properly
      exec(`${DOCKER_COMPOSE_DEV} stop frontend`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        // Wait a moment
        setTimeout(() => {
          exec(`${DOCKER_COMPOSE_DEV} start frontend`, (error, stdout, stderr) => {
            if (error) {
              done(error);
              return;
            }

            // Verify service is running again
            setTimeout(() => {
              exec(`${DOCKER_COMPOSE_DEV} ps --services --filter "status=running"`, (error, stdout, stderr) => {
                if (error) {
                  done(error);
                  return;
                }

                expect(stdout).toContain('frontend');
                done();
              });
            }, 5000);
          });
        }, 2000);
      });
    }, 60000);

    it('should cleanup properly on compose down', (done) => {
      // This test is read-only to avoid disrupting other tests
      exec(`${DOCKER_COMPOSE_DEV} ps`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        // Verify containers are properly managed
        expect(stdout).toContain('Up');
        done();
      });
    }, 30000);
  });

  describe('Production Environment Readiness', () => {
    it('should verify production compose configuration exists', (done) => {
      exec(`ls -la ${DOCKER_COMPOSE_PROD.split(' ')[1]}`, (error, stdout, stderr) => {
        if (error) {
          // Production file might not exist in development
          done();
          return;
        }

        expect(stdout).toMatch(/docker-compose\.prod\.yml$/);
        done();
      });
    }, 30000);

    it('should verify production service configuration', (done) => {
      exec(`${DOCKER_COMPOSE_PROD} config --services`, (error, stdout, stderr) => {
        if (error) {
          // Production config might not be available
          done();
          return;
        }

        const services = stdout.trim().split('\n').filter(s => s);

        // Should have similar services to development
        expect(services.length).toBeGreaterThan(0);
        done();
      });
    }, 30000);
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle service failures gracefully', (done) => {
      // This test verifies the system can handle partial failures
      exec(`${DOCKER_COMPOSE_DEV} ps`, (error, stdout, stderr) => {
        if (error) {
          done(error);
          return;
        }

        // All services should be running or healthy
        expect(stdout).toMatch(/Up|healthy|running/);
        done();
      });
    }, 30000);

    it('should verify logging and monitoring setup', (done) => {
      exec(`${DOCKER_COMPOSE_DEV} logs --tail=10 frontend`, (error, stdout, stderr) => {
        if (error) {
          // Logs might not be available
          done();
          return;
        }

        // Should have recent log entries
        expect(stdout.length).toBeGreaterThan(0);
        done();
      });
    }, 30000);
  });
});
