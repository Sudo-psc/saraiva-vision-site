/**
 * SSL Health Monitoring API Tests
 * Comprehensive testing for SSL health endpoints
 */

import request from 'supertest';
import express from 'express';
import sslRouter from '../index.js';
import { jest } from '@jest/globals';

// Mock SSL validation functions
jest.mock('../../lib/sslValidation.js', () => ({
    validateSSLCertificate: jest.fn(),
    simpleGraphQLSSLCheck: jest.fn()
}));

// Mock SSL health monitor
jest.mock('../../lib/sslHealthMonitor.js', () => ({
    SSLHealthMonitor: jest.fn().mockImplementation(() => ({
        checkHealth: jest.fn()
    }))
}));

const { validateSSLCertificate, simpleGraphQLSSLCheck } = await import('../../lib/sslValidation.js');
const { SSLHealthMonitor } = await import('../../lib/sslHealthMonitor.js');

describe('SSL Health Monitoring API', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/ssl', sslRouter);
        jest.clearAllMocks();
    });

    describe('GET /api/ssl/health', () => {
        it('should return SSL health status for all domains', async () => {
            const mockMonitor = new SSLHealthMonitor();
            const mockStatus = {
                healthy: true,
                lastCheck: new Date().toISOString(),
                certificateInfo: {
                    isValid: true,
                    daysUntilExpiry: 60,
                    domain: 'cms.saraivavision.com.br'
                },
                endpointStatus: { ok: true },
                errors: [],
                warnings: []
            };

            mockMonitor.checkHealth.mockResolvedValue(mockStatus);

            const response = await request(app)
                .get('/api/ssl/health')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.overallHealthy).toBe(true);
            expect(response.body.domains).toHaveProperty('cms.saraivavision.com.br');
            expect(response.body.summary.totalDomains).toBe(3);
        });

        it('should handle SSL health check failures', async () => {
            const mockMonitor = new SSLHealthMonitor();
            mockMonitor.checkHealth.mockRejectedValue(new Error('SSL validation failed'));

            const response = await request(app)
                .get('/api/ssl/health')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.overallHealthy).toBe(false);
            expect(response.body.summary.errorsCount).toBe(3);
        });
    });

    describe('GET /api/ssl/health/:domain', () => {
        it('should return SSL health status for specific domain', async () => {
            const mockMonitor = new SSLHealthMonitor();
            const mockStatus = {
                healthy: true,
                lastCheck: new Date().toISOString(),
                certificateInfo: {
                    isValid: true,
                    daysUntilExpiry: 45,
                    domain: 'cms.saraivavision.com.br'
                },
                endpointStatus: { ok: true },
                errors: [],
                warnings: []
            };

            mockMonitor.checkHealth.mockResolvedValue(mockStatus);

            const response = await request(app)
                .get('/api/ssl/health/cms.saraivavision.com.br')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.domain).toBe('cms.saraivavision.com.br');
            expect(response.body.status.healthy).toBe(true);
        });

        it('should handle domain health check failure', async () => {
            const mockMonitor = new SSLHealthMonitor();
            mockMonitor.checkHealth.mockRejectedValue(new Error('Domain not found'));

            const response = await request(app)
                .get('/api/ssl/health/invalid.domain.com')
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('SSL health check failed');
        });
    });

    describe('GET /api/ssl/certificate/:domain', () => {
        it('should return certificate information', async () => {
            const mockCertificate = {
                isValid: true,
                domain: 'cms.saraivavision.com.br',
                issuer: 'Let\'s Encrypt',
                validTo: '2024-12-31T23:59:59Z',
                daysUntilExpiry: 45,
                chainComplete: true,
                warnings: []
            };

            validateSSLCertificate.mockResolvedValue(mockCertificate);

            const response = await request(app)
                .get('/api/ssl/certificate/cms.saraivavision.com.br')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.certificate.isValid).toBe(true);
            expect(response.body.certificate.domain).toBe('cms.saraivavision.com.br');
        });

        it('should handle certificate validation failure', async () => {
            validateSSLCertificate.mockRejectedValue(new Error('Certificate not found'));

            const response = await request(app)
                .get('/api/ssl/certificate/invalid.domain.com')
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Certificate validation failed');
        });
    });

    describe('GET /api/ssl/graphql-status', () => {
        it('should return GraphQL endpoint status', async () => {
            const mockGraphQLStatus = {
                ok: true,
                responseTime: 150,
                sslValid: true,
                endpoint: 'https://cms.saraivavision.com.br/graphql'
            };

            simpleGraphQLSSLCheck.mockResolvedValue(mockGraphQLStatus);

            const response = await request(app)
                .get('/api/ssl/graphql-status')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.graphql.ok).toBe(true);
        });

        it('should handle GraphQL status check failure', async () => {
            simpleGraphQLSSLCheck.mockRejectedValue(new Error('GraphQL endpoint unreachable'));

            const response = await request(app)
                .get('/api/ssl/graphql-status')
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('GraphQL status check failed');
        });
    });

    describe('POST /api/ssl/refresh', () => {
        it('should refresh SSL health monitoring', async () => {
            const mockMonitor = new SSLHealthMonitor();
            const mockStatus = {
                healthy: true,
                lastCheck: new Date().toISOString(),
                certificateInfo: {
                    isValid: true,
                    daysUntilExpiry: 60,
                    domain: 'cms.saraivavision.com.br'
                },
                endpointStatus: { ok: true },
                errors: [],
                warnings: []
            };

            mockMonitor.checkHealth.mockResolvedValue(mockStatus);

            const response = await request(app)
                .post('/api/ssl/refresh')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('SSL health monitoring refreshed successfully');
            expect(response.body.overallHealthy).toBe(true);
        });
    });

    describe('GET /api/ssl/alerts', () => {
        it('should return SSL alerts', async () => {
            const mockMonitor = new SSLHealthMonitor();
            const mockStatus = {
                healthy: false,
                lastCheck: new Date().toISOString(),
                certificateInfo: {
                    isValid: true,
                    daysUntilExpiry: 5, // Critical - less than 7 days
                    domain: 'cms.saraivavision.com.br'
                },
                endpointStatus: { ok: true },
                errors: ['Certificate validation warning'],
                warnings: []
            };

            mockMonitor.checkHealth.mockResolvedValue(mockStatus);

            const response = await request(app)
                .get('/api/ssl/alerts')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.alerts)).toBe(true);
            expect(response.body.summary.totalAlerts).toBeGreaterThan(0);
        });
    });

    describe('GET /api/ssl/metrics', () => {
        it('should return SSL monitoring metrics', async () => {
            const mockMonitor = new SSLHealthMonitor();
            const mockStatus = {
                healthy: true,
                lastCheck: new Date().toISOString(),
                certificateInfo: {
                    isValid: true,
                    daysUntilExpiry: 45,
                    domain: 'cms.saraivavision.com.br'
                },
                endpointStatus: { ok: true },
                errors: [],
                warnings: []
            };

            mockMonitor.checkHealth.mockResolvedValue(mockStatus);

            const response = await request(app)
                .get('/api/ssl/metrics')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.metrics.overall).toHaveProperty('healthy');
            expect(response.body.metrics.overall).toHaveProperty('warning');
            expect(response.body.metrics.overall).toHaveProperty('error');
            expect(response.body.metrics.overall).toHaveProperty('total');
        });
    });

    describe('Error Handling', () => {
        it('should handle malformed domain parameters', async () => {
            const response = await request(app)
                .get('/api/ssl/health/')
                .expect(404); // Should be caught by Express routing
        });

        it('should handle internal server errors gracefully', async () => {
            const mockMonitor = new SSLHealthMonitor();
            mockMonitor.checkHealth.mockImplementation(() => {
                throw new Error('Unexpected internal error');
            });

            const response = await request(app)
                .get('/api/ssl/health/cms.saraivavision.com.br')
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('SSL health check failed');
        });
    });

    describe('Response Format', () => {
        it('should include timestamp in all responses', async () => {
            const mockMonitor = new SSLHealthMonitor();
            mockMonitor.checkHealth.mockResolvedValue({
                healthy: true,
                lastCheck: new Date().toISOString(),
                certificateInfo: { isValid: true },
                endpointStatus: { ok: true },
                errors: [],
                warnings: []
            });

            const response = await request(app)
                .get('/api/ssl/health/cms.saraivavision.com.br')
                .expect(200);

            expect(response.body.timestamp).toBeDefined();
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
        });

        it('should include success flag in all responses', async () => {
            const mockMonitor = new SSLHealthMonitor();
            mockMonitor.checkHealth.mockRejectedValue(new Error('Test error'));

            const response = await request(app)
                .get('/api/ssl/health/cms.saraivavision.com.br')
                .expect(500);

            expect(response.body.success).toBeDefined();
            expect(typeof response.body.success).toBe('boolean');
        });
    });
});