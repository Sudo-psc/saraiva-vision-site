/**
 * Tests for Chatbot Performance API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the services
const mockPerformanceMonitor = {
    getMetrics: vi.fn(() => ({
        requests: { total: 100, successful: 95, failed: 5, cached: 30 },
        responseTime: { average: 1500, recent: { p95: 2000, p99: 3000 } },
        errors: { rate: 5, total: 5, recent: [] },
        performance: { health: 85, efficiency: 80 }
    })),
    getRealtimeStatus: vi.fn(() => ({
        status: 'healthy',
        health: 85,
        responseTime: 1500,
        errorRate: 5
    })),
    getHistoricalMetrics: vi.fn(() => []),
    getPerformanceInsights: vi.fn(() => []),
    generatePerformanceReport: vi.fn(() => ({
        summary: { healthScore: 85 }
    }))
};

const mockCacheService = {
    getCacheStatistics: vi.fn(() => ({
        hitRate: 75,
        hits: 75,
        misses: 25,
        memoryCacheSize: 100,
        memoryCacheUtilization: 50
    })),
    getCacheHealth: vi.fn(() => ({
        status: 'healthy',
        database: { totalEntries: 1000 }
    }))
};

const mockResourceManager = {
    getResourceStatus: vi.fn(() => ({
        connections: { active: 5, idle: 3, total: 8 },
        memory: { heapUsedMB: 150, heapTotalMB: 512, rssMB: 200 },
        load: 0.6,
        requests: { active: 2, queued: 0 }
    })),
    getPerformanceRecommendations: vi.fn(() => [])
};

const mockGeminiService = {
    getServiceStatistics: vi.fn(() => ({
        activeContexts: 10,
        activeSessions: 5,
        totalTokensUsed: 50000,
        averageTokensPerSession: 1000
    })),
    getHealthStatus: vi.fn(() => ({
        status: 'healthy'
    }))
};

const mockSupabase = {
    from: vi.fn(() => ({
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }))
};

// Mock modules
vi.mock('../../src/services/chatbotPerformanceMonitor.js', () => ({
    default: mockPerformanceMonitor
}));

vi.mock('../../src/services/chatbotCacheService.js', () => ({
    default: mockCacheService
}));

vi.mock('../../src/services/chatbotResourceManager.js', () => ({
    default: mockResourceManager
}));

vi.mock('../../src/services/geminiService.js', () => ({
    default: mockGeminiService
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabase)
}));

// Mock process and environment variables
vi.stubGlobal('process', {
    uptime: vi.fn(() => 3600), // 1 hour uptime
    env: {
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        NODE_ENV: 'test'
    }
});

describe('Chatbot Performance API', () => {
    let handler;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Import handler after mocks are set up
        const module = await import('../chatbot/performance.js');
        handler = module.default;
    });

    describe('GET /api/chatbot/performance', () => {
        it('should return performance overview by default', async () => {
            const req = {
                method: 'GET',
                query: {}
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    action: 'overview',
                    data: expect.objectContaining({
                        summary: expect.objectContaining({
                            status: expect.any(String),
                            healthScore: expect.any(Number),
                            uptime: expect.any(Number)
                        }),
                        performance: expect.objectContaining({
                            responseTime: expect.any(Object),
                            throughput: expect.any(Object),
                            errors: expect.any(Object)
                        }),
                        cache: expect.objectContaining({
                            hitRate: expect.any(Number),
                            totalHits: expect.any(Number)
                        }),
                        resources: expect.objectContaining({
                            connections: expect.any(Object),
                            memory: expect.any(Object)
                        })
                    })
                })
            );
        });

        it('should return detailed metrics when action=metrics', async () => {
            const req = {
                method: 'GET',
                query: { action: 'metrics', timeRange: '24h' }
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    action: 'metrics',
                    timeRange: '24h',
                    data: expect.objectContaining({
                        current: expect.any(Object),
                        historical: expect.any(Array),
                        insights: expect.any(Array)
                    })
                })
            );

            expect(mockPerformanceMonitor.getMetrics).toHaveBeenCalled();
            expect(mockPerformanceMonitor.getHistoricalMetrics).toHaveBeenCalledWith('24h');
        });

        it('should return cache performance when action=cache', async () => {
            const req = {
                method: 'GET',
                query: { action: 'cache' }
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    action: 'cache',
                    data: expect.objectContaining({
                        statistics: expect.any(Object),
                        health: expect.any(Object),
                        recommendations: expect.any(Array)
                    })
                })
            );

            expect(mockCacheService.getCacheStatistics).toHaveBeenCalled();
            expect(mockCacheService.getCacheHealth).toHaveBeenCalled();
        });

        it('should return resource utilization when action=resources', async () => {
            const req = {
                method: 'GET',
                query: { action: 'resources' }
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    action: 'resources',
                    data: expect.objectContaining({
                        status: expect.any(Object),
                        recommendations: expect.any(Array),
                        optimization: expect.objectContaining({
                            connectionPoolEfficiency: expect.any(Number),
                            memoryEfficiency: expect.any(Number)
                        })
                    })
                })
            );

            expect(mockResourceManager.getResourceStatus).toHaveBeenCalled();
            expect(mockResourceManager.getPerformanceRecommendations).toHaveBeenCalled();
        });

        it('should return health status when action=health', async () => {
            const req = {
                method: 'GET',
                query: { action: 'health' }
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    action: 'health',
                    data: expect.objectContaining({
                        overall: expect.any(String),
                        components: expect.any(Object),
                        details: expect.objectContaining({
                            performance: expect.any(Object),
                            cache: expect.any(Object),
                            resources: expect.any(Object),
                            gemini: expect.any(Object)
                        }),
                        timestamp: expect.any(Number)
                    })
                })
            );
        });

        it('should return comprehensive report when action=report', async () => {
            const req = {
                method: 'GET',
                query: { action: 'report', timeRange: '7d' }
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(mockPerformanceMonitor.generatePerformanceReport).toHaveBeenCalledWith('7d');
        });

        it('should reject non-GET requests', async () => {
            const req = {
                method: 'POST',
                query: {}
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(405);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Method not allowed'
                })
            );
        });

        it('should validate query parameters', async () => {
            const req = {
                method: 'GET',
                query: { action: 'invalid', timeRange: 'invalid' }
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Validation failed',
                    details: expect.arrayContaining([
                        expect.stringContaining('Invalid timeRange'),
                        expect.stringContaining('Invalid action')
                    ])
                })
            );
        });

        it('should handle errors gracefully', async () => {
            // Mock an error
            mockPerformanceMonitor.getMetrics.mockImplementation(() => {
                throw new Error('Test error');
            });

            const req = {
                method: 'GET',
                query: { action: 'overview' }
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Internal server error'
                })
            );
        });
    });

    describe('Performance calculations', () => {
        it('should calculate correct efficiency metrics', async () => {
            const req = {
                method: 'GET',
                query: { action: 'resources' }
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            const callArgs = res.json.mock.calls[0][0];
            const optimization = callArgs.data.optimization;

            expect(optimization.connectionPoolEfficiency).toBeCloseTo(0.625); // 5/8
            expect(optimization.memoryEfficiency).toBeCloseTo(0.293); // 150/512
        });

        it('should determine overall health status correctly', async () => {
            const req = {
                method: 'GET',
                query: { action: 'health' }
            };
            const res = {
                status: vi.fn(() => res),
                json: vi.fn()
            };

            await handler(req, res);

            const callArgs = res.json.mock.calls[0][0];
            const healthData = callArgs.data;

            expect(healthData.overall).toBe('healthy');
            expect(healthData.components.performance).toBe('healthy');
            expect(healthData.components.cache).toBe('healthy');
            expect(healthData.components.resources).toBe('healthy');
            expect(healthData.components.gemini).toBe('healthy');
        });
    });
});