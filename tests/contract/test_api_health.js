/**
 * Contract Test: API Health Check
 *
 * This test validates that the API container health endpoint
 * complies with the OpenAPI 3.0.3 health check contract specification.
 *
 * Test MUST FAIL before implementing the health endpoint in TDD fashion.
 */

const { expect } = require('chai');
const fetch = require('node-fetch');

describe('API Health Check Contract Compliance', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  const HEALTH_ENDPOINT = '/api/health';
  const READY_ENDPOINT = '/api/health/ready';
  const LIVE_ENDPOINT = '/api/health/live';

  describe('GET /api/health', () => {
    it('should return 200 status code', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);

      // This should fail until health endpoint is implemented
      expect(response.status).to.equal(200);
    });

    it('should return JSON content type', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);

      expect(response.headers.get('content-type')).to.include('application/json');
    });

    it('should contain required health status fields', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);
      const data = await response.json();

      // Validate contract compliance
      expect(data).to.have.property('status');
      expect(data).to.have.property('service');
      expect(data).to.have.property('timestamp');
      expect(data).to.have.property('version');

      // Validate field types
      expect(data.status).to.be.a('string');
      expect(data.service).to.equal('api');
      expect(data.timestamp).to.be.a('string');
      expect(data.version).to.be.a('string');
    });

    it('should return valid status values', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);
      const data = await response.json();

      // Status must be one of the allowed values
      const validStatuses = ['healthy', 'degraded', 'unhealthy'];
      expect(validStatuses).to.include(data.status);
    });

    it('should include database connectivity check', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);
      const data = await response.json();

      expect(data).to.have.property('database');
      expect(data.database).to.have.property('connected');
      expect(data.database).to.have.property('response_time');

      if (data.database.connected) {
        expect(data.database.response_time).to.be.a('number');
      }
    });

    it('should include system metrics', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);
      const data = await response.json();

      expect(data).to.have.property('uptime');
      expect(data).to.have.property('memory');
      expect(data).to.have.property('cpu');

      if (data.memory) {
        expect(data.memory).to.have.property('used');
        expect(data.memory).to.have.property('total');
        expect(data.memory).to.have.property('percentage');
      }
    });

    it('should include API-specific metrics', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);
      const data = await response.json();

      expect(data).to.have.property('endpoints');
      expect(data).to.have.property('active_connections');

      if (data.endpoints) {
        expect(data.endpoints).to.have.property('total');
        expect(data.endpoints).to.have.property('healthy');
        expect(data.endpoints).to.have.property('unhealthy');
      }
    });

    it('should handle CORS headers', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);

      expect(response.headers.get('access-control-allow-origin')).to.equal('*');
    });

    it('should respond within performance threshold', async () => {
      const startTime = Date.now();
      await fetch(`${API_URL}${HEALTH_ENDPOINT}`);
      const responseTime = Date.now() - startTime;

      // API health check should respond within 200ms
      expect(responseTime).to.be.lessThan(200);
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await fetch(`${API_URL}${READY_ENDPOINT}`);
      const data = await response.json();

      expect(response.status).to.equal(200);
      expect(data).to.have.property('ready');
      expect(data).to.have.property('checks');

      // Should check critical dependencies
      expect(data.checks).to.have.property('database');
      expect(data.checks).to.have.property('external_services');
      expect(data.checks).to.have.property('memory');
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness status', async () => {
      const response = await fetch(`${API_URL}${LIVE_ENDPOINT}`);
      const data = await response.json();

      expect(response.status).to.equal(200);
      expect(data).to.have.property('alive');
      expect(data).to.have.property('since');
    });
  });

  describe('API Endpoints Health', () => {
    it('should validate specific API endpoints', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);
      const data = await response.json();

      if (data.endpoints && data.endpoints.details) {
        // Check if core endpoints are healthy
        const coreEndpoints = ['/api/contact', '/api/reviews', '/api/env-debug'];
        coreEndpoints.forEach(endpoint => {
          if (data.endpoints.details[endpoint]) {
            expect(data.endpoints.details[endpoint].status).to.equal('healthy');
          }
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for invalid health endpoints', async () => {
      const response = await fetch(`${API_URL}/api/health/invalid`);

      expect(response.status).to.equal(404);
    });

    it('should handle rate limiting', async () => {
      // Simulate rapid requests
      const requests = Array(20).fill().map(() =>
        fetch(`${API_URL}${HEALTH_ENDPOINT}`)
      );

      const responses = await Promise.all(requests);
      const statusCodes = responses.map(r => r.status);

      // Should handle high load gracefully
      const successfulResponses = statusCodes.filter(code => code === 200);
      expect(successfulResponses.length).to.be.at.least(10);
    });

    it('should maintain service availability under load', async () => {
      // Simulate 15 concurrent requests
      const requests = Array(15).fill().map(() =>
        fetch(`${API_URL}${HEALTH_ENDPOINT}`)
      );

      const responses = await Promise.all(requests);
      const statusCodes = responses.map(r => r.status);

      // Most requests should succeed
      const successfulResponses = statusCodes.filter(code => code === 200);
      expect(successfulResponses.length).to.be.at.least(12);
    });
  });

  describe('Security Compliance', () => {
    it('should not expose sensitive information', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);
      const data = await response.json();

      // Should not expose database credentials
      expect(JSON.stringify(data)).to.not.include('password');
      expect(JSON.stringify(data)).to.not.include('secret');
      expect(JSON.stringify(data)).to.not.include('token');
    });

    it('should include security headers', async () => {
      const response = await fetch(`${API_URL}${HEALTH_ENDPOINT}`);

      expect(response.headers.get('x-content-type-options')).to.equal('nosniff');
      expect(response.headers.get('x-frame-options')).to.equal('DENY');
    });
  });
});