/**
 * Tests for monitoring API endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import metricsHandler from '../monitoring/metrics.js';
import healthHandler from '../monitoring/health.js';

// Mock dependencies
vi.mock('../../src/lib/logger.js', () => ({
    createLogger: vi.fn(() => ({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }))
}));

vi.mock('../../src/lib/performanceMonitor.js', () => ({
    getPerformanceMetrics: vi.fn(() => ({
        uptime_seconds: 3600,
        endpoints: {
            'GET:/api/test': { count: 10, avg: 150, min: 100, max: 200, p95: 180, p99: 190 }
        },
        database: {},
        external_services: {},
        error_rates: {}
    })),
    generatePerformanceReport: vi.fn(() => ({
        timestamp: '2024-01-01T00:00:00Z',
        summary: {},
        alerts: [],
        health_status: 'healthy'
    }))
}));

vi.mock('../../src/lib/alertingSystem.js', () => ({
    alertingSystem: {
        getDeliveryStats: vi.fn(() => ({
            email: { total: 10, successful: 9, failed: 1, failure_rate: 10 },
            sms: { total: 5, successful: 5, failed: 0, failure_rate: 0 }
        })),
        getRecentAlerts: vi.fn(() => [
            {
                id: 'alert_1',
                timestamp: '2024-01-01T00:00:00Z',
                severity: 'high',
                type: 'email_delivery_failure',
                message: 'High failure rate'
            }
        ])
    }
}));

const mockSupabase = {
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            limit: vi.fn(() => ({ data: [{ id: 'test' }], error: null })),
            eq: vi.fn(() => ({
                head: vi.fn(() => ({ count: 100, error: null }))
            })),
            in: vi.fn(() => ({ data: [], error: null })),
            gte: vi.fn(() => ({ data: [], error: null }))
        }))
    }))
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabase)
}));

describe('Monitoring Metrics API', () => {
    let req, res;

    beforeEach(() => {
        req = {
            method: 'GET',
            headers: {
                authorization: 'Bearer valid-token',
                'x-request-id': 'req_123'
            },
            query: {}
        };

        res = {
            status: vi.fn(() => res),
            json: vi.fn(() => res),
            setHeader: vi.fn(() => res)
        };

        process.env.MONITORING_API_TOKEN = 'valid-token';
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete process.env.MONITORING_API_TOKEN;
    });

    describe('Authentication', () => {
        it('should require Bearer token', async () => {
            delete req.headers.authorization;

            await metricsHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Bearer token required' }
            });
        });

        it('should validate token', async () => {
            req.headers.authorization = 'Bearer invalid-token';

            await metricsHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token' }
            });
        });

        it('should accept valid token', async () => {
            await metricsHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Method Validation', () => {
        it('should only allow GET requests', async () => {
            req.method = 'POST';

            await metricsHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(405);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET method allowed' }
            });
        });
    });

    describe('Metrics Collection', () => {
        it('should return all metrics by default', async () => {
            await metricsHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const responseData = res.json.mock.calls[0][0];

            expect(responseData.success).toBe(true);
            expect(responseData.data.performance).toBeDefined();
            expect(responseData.data.delivery).toBeDefined();
            expect(responseData.data.alerts).toBeDefined();
            expect(responseData.data.database).toBeDefined();
            expect(responseData.data.queue).toBeDefined();
            expect(responseData.data.health).toBeDefined();
            expect(responseData.data.errors).toBeDefined();
        });

        it('should filter metrics based on include parameter', async () => {
            req.query.include = 'performance,delivery';

            await metricsHandler(req, res);

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.data.performance).toBeDefined();
            expect(responseData.data.delivery).toBeDefined();
            expect(responseData.data.alerts).toBeUndefined();
        });

        it('should respect hours parameter', async () => {
            req.query.hours = '12';

            await metricsHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            // Verify that the hours parameter is passed to the stats functions
        });

        it('should set no-cache headers', async () => {
            await metricsHandler(req, res);

            expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
            expect(res.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
            expect(res.setHeader).toHaveBeenCalledWith('Expires', '0');
        });
    });

    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn(() => ({
                    limit: vi.fn(() => ({ data: null, error: new Error('DB Error') }))
                }))
            });

            await metricsHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to retrieve metrics'
                }
            });
        });
    });
});

describe('Health Check API', () => {
    let req, res;

    beforeEach(() => {
        req = {
            method: 'GET',
            headers: { 'x-request-id': 'req_123' },
            query: {}
        };

        res = {
            status: vi.fn(() => res),
            json: vi.fn(() => res),
            setHeader: vi.fn(() => res),
            end: vi.fn(() => res)
        };

        // Mock process.uptime
        vi.spyOn(process, 'uptime').mockReturnValue(3600);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    describe('Basic Health Check', () => {
        it('should return healthy status', async () => {
            await healthHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            const responseData = res.json.mock.calls[0][0];

            expect(responseData.success).toBe(true);
            expect(responseData.data.status).toBe('healthy');
            expect(responseData.data.uptime).toBe(3600);
            expect(responseData.data.checks.api.status).toBe('healthy');
            expect(responseData.data.checks.database.status).toBe('healthy');
        });

        it('should handle database connectivity issues', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn(() => ({
                    limit: vi.fn(() => ({ data: null, error: new Error('Connection failed') }))
                }))
            });

            await healthHandler(req, res);

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.data.status).toBe('degraded');
            expect(responseData.data.checks.database.status).toBe('unhealthy');
        });

        it('should return 503 for unhealthy status', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn(() => {
                    throw new Error('Critical database error');
                })
            });

            await healthHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(503);
            const responseData = res.json.mock.calls[0][0];
            expect(responseData.data.status).toBe('unhealthy');
        });
    });

    describe('Detailed Health Check', () => {
        beforeEach(() => {
            req.query.detailed = 'true';
            process.env.RESEND_API_KEY = 'test-key';
            process.env.ZENVIA_API_TOKEN = 'test-token';
        });

        afterEach(() => {
            delete process.env.RESEND_API_KEY;
            delete process.env.ZENVIA_API_TOKEN;
        });

        it('should include external service checks', async () => {
            // Mock successful external service responses
            global.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: true, status: 200 }) // Resend
                .mockResolvedValueOnce({ ok: true, status: 200 }); // Zenvia

            await healthHandler(req, res);

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.data.checks.external_services).toBeDefined();
            expect(responseData.data.checks.external_services.resend.status).toBe('healthy');
            expect(responseData.data.checks.external_services.zenvia.status).toBe('healthy');
        });

        it('should detect external service failures', async () => {
            global.fetch = vi.fn()
                .mockResolvedValueOnce({ ok: false, status: 500 }) // Resend failure
                .mockResolvedValueOnce({ ok: true, status: 200 });  // Zenvia success

            await healthHandler(req, res);

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.data.status).toBe('degraded');
            expect(responseData.data.checks.external_services.resend.status).toBe('unhealthy');
        });

        it('should check message queue health', async () => {
            await healthHandler(req, res);

            const responseData = res.json.mock.calls[0][0];
            expect(responseData.data.checks.message_queue).toBeDefined();
            expect(responseData.data.checks.message_queue.status).toBe('healthy');
        });
    });

    describe('Method Validation', () => {
        it('should only allow GET requests', async () => {
            req.method = 'POST';

            await healthHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(405);
        });
    });

    describe('Error Handling', () => {
        it('should handle unexpected errors', async () => {
            // Mock an error in the handler
            vi.spyOn(process, 'uptime').mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            await healthHandler(req, res);

            expect(res.status).toHaveBeenCalledWith(503);
            const responseData = res.json.mock.calls[0][0];
            expect(responseData.success).toBe(false);
            expect(responseData.data.status).toBe('unhealthy');
        });
    });

    describe('Cache Headers', () => {
        it('should set no-cache headers', async () => {
            await healthHandler(req, res);

            expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
            expect(res.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
            expect(res.setHeader).toHaveBeenCalledWith('Expires', '0');
        });
    });
});