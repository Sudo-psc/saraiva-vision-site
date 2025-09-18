import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';

describe('Docker Healthchecks', () => {
  let apiServer;
  const API_PORT = 3001;
  const API_URL = `http://localhost:${API_PORT}`;

  beforeAll(async () => {
    // Start the API server for testing
    apiServer = spawn('node', ['server.js'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve) => {
      apiServer.stdout.on('data', (data) => {
        if (data.toString().includes('listening')) {
          resolve();
        }
      });
    });
  });

  afterAll(() => {
    if (apiServer) {
      apiServer.kill();
    }
  });

  describe('API Health Endpoint', () => {
    it('should return healthy status on /api/health', async () => {
      const response = await fetch(`${API_URL}/api/health`);
      expect(response.status).toBe(200);
      
      const health = await response.json();
      expect(health.status).toBe('healthy');
      expect(health.service).toBe('saraiva-vision-api');
      expect(health.version).toBe('2.0.0');
      expect(health.checks.server).toBe('ok');
      expect(health.timestamp).toBeDefined();
      expect(health.uptime).toBeGreaterThan(0);
    });

    it('should return proper cache headers for health endpoint', async () => {
      const response = await fetch(`${API_URL}/api/health`);
      expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate');
      expect(response.headers.get('content-type')).toBe('application/json');
    });

    it('should include memory usage in health response', async () => {
      const response = await fetch(`${API_URL}/api/health`);
      const health = await response.json();
      
      expect(health.memory).toBeDefined();
      expect(health.memory.rss).toBeGreaterThan(0);
      expect(health.memory.heapTotal).toBeGreaterThan(0);
      expect(health.memory.heapUsed).toBeGreaterThan(0);
    });
  });

  describe('Frontend Health Check', () => {
    it('should have health.json file with correct structure', async () => {
      const fs = await import('fs/promises');
      const healthContent = await fs.readFile('public/health.json', 'utf-8');
      const health = JSON.parse(healthContent);
      
      expect(health.status).toBe('healthy');
      expect(health.service).toBe('saraiva-vision-frontend');
      expect(health.version).toBe('2.0.0');
      expect(health.checks.static_files).toBe('ok');
      expect(health.checks.build).toBe('ok');
    });
  });

  describe('Docker Compose Configuration', () => {
    it('should have valid docker-compose.yml', async () => {
      const fs = await import('fs/promises');
      const yaml = await import('yaml');
      
      const composeContent = await fs.readFile('docker-compose.yml', 'utf-8');
      const compose = yaml.parse(composeContent);
      
      // Docker Compose v3.8+ no longer requires version field
      expect(compose.services).toBeDefined();
      
      // Check all services have healthchecks
      const requiredServices = ['db', 'wordpress', 'api', 'frontend', 'nginx'];
      requiredServices.forEach(service => {
        expect(compose.services[service]).toBeDefined();
        expect(compose.services[service].healthcheck).toBeDefined();
        expect(compose.services[service].healthcheck.test).toBeDefined();
      });
    });

    it('should have proper depends_on with service_healthy conditions', async () => {
      const fs = await import('fs/promises');
      const yaml = await import('yaml');
      
      const composeContent = await fs.readFile('docker-compose.yml', 'utf-8');
      const compose = yaml.parse(composeContent);
      
      // WordPress depends on healthy database
      expect(compose.services.wordpress.depends_on.db.condition).toBe('service_healthy');
      
      // Nginx depends on healthy services
      expect(compose.services.nginx.depends_on.frontend.condition).toBe('service_healthy');
      expect(compose.services.nginx.depends_on.api.condition).toBe('service_healthy');
      expect(compose.services.nginx.depends_on.wordpress.condition).toBe('service_healthy');
    });
  });

  describe('Dockerfile Validation', () => {
    it('should have Dockerfiles for all services', async () => {
      const fs = await import('fs/promises');
      
      const dockerfiles = [
        'infra/docker/frontend/Dockerfile',
        'infra/docker/api/Dockerfile',
        'infra/docker/nginx/Dockerfile'
      ];
      
      for (const dockerfile of dockerfiles) {
        try {
          await fs.access(dockerfile);
        } catch (error) {
          throw new Error(`Dockerfile not found: ${dockerfile}`);
        }
      }
    });

    it('should have healthcheck instructions in Dockerfiles', async () => {
      const fs = await import('fs/promises');
      
      const dockerfiles = [
        'infra/docker/frontend/Dockerfile',
        'infra/docker/api/Dockerfile',
        'infra/docker/nginx/Dockerfile'
      ];
      
      for (const dockerfile of dockerfiles) {
        const content = await fs.readFile(dockerfile, 'utf-8');
        expect(content).toContain('HEALTHCHECK');
        expect(content).toContain('curl');
      }
    });
  });

  describe('Staging Configuration', () => {
    it('should have staging overrides for faster development', async () => {
      const fs = await import('fs/promises');
      const yaml = await import('yaml');
      
      const stagingContent = await fs.readFile('docker-compose.staging.yml', 'utf-8');
      const staging = yaml.parse(stagingContent);
      
      // Modern Docker Compose doesn't require version field
      expect(staging.services).toBeDefined();
      
      // Check staging has faster intervals
      Object.values(staging.services).forEach(service => {
        if (service.healthcheck) {
          expect(service.healthcheck.interval).toBe('10s');
        }
      });
    });
  });
});