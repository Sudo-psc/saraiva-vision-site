/**
 * Tests for Chatbot Performance Monitor
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import chatbotPerformanceMonitor from '../chatbotPerformanceMonitor.js';

// Mock Supabase
const mockSupabase = {
    from: vi.fn(() => ({
        insert: vi.fn(),
        select: vi.fn(() => ({
            gte: vi.fn(() => ({
                order: vi.fn()
            }))
        }))
    }))
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabase)
}));

describe('ChatbotPerformanceMonitor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset metrics
        chatbotPerformanceMonitor.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                cached: 0
            },
            responseTime: {
                total: 0,
                count: 0,
                min: Infinity,
                max: 0,
                samples: []
            },
            tokens: {
                total: 0,
                requests: 0,
                average: 0
            },
            cache: {
                hits: 0,
                misses: 0,
                hitRate: 0
            },
            errors: {
                total: 0,
                byType: new Map(),
                recent: []
            },
            performance: {
                slowRequests: 0,
                fastRequests: 0,
                averageResponseTime: 0
            }
        };
    });

    describe('recordRequest', () => {
        it('should record successful requests correctly', () => {
            const requestData = {
                success: true,
                responseTime: 1500,
                tokensUsed: 100,
                cacheHit: false
            };

            chatbotPerformanceMonitor.recordRequest(requestData);

            const metrics = chatbotPerformanceMonitor.getMetrics();
            expect(metrics.requests.total).toBe(1);
            expect(metrics.requests.successful).toBe(1);
            expect(metrics.requests.failed).toBe(0);
            expect(metrics.responseTime.average).toBe(1500);
            expect(metrics.tokens.total).toBe(100);
            expect(metrics.cache.hits).toBe(0);
            expect(metrics.cache.misses).toBe(1);
        });

        it('should record failed requests correctly', () => {
            const requestData = {
                success: false,
                responseTime: 5000,
                tokensUsed: 0,
                cacheHit: false,
                error: { type: 'APIError', message: 'API timeout' }
            };

            chatbotPerformanceMonitor.recordRequest(requestData);

            const metrics = chatbotPerformanceMonitor.getMetrics();
            expect(metrics.requests.total).toBe(1);
            expect(metrics.requests.successful).toBe(0);
            expect(metrics.requests.failed).toBe(1);
            expect(metrics.errors.total).toBe(1);
            expect(metrics.performance.slowRequests).toBe(1);
        });

        it('should record cached requests correctly', () => {
            const requestData = {
                success: true,
                responseTime: 200,
                tokensUsed: 0,
                cacheHit: true
            };

            chatbotPerformanceMonitor.recordRequest(requestData);

            const metrics = chatbotPerformanceMonitor.getMetrics();
            expect(metrics.requests.cached).toBe(1);
            expect(metrics.cache.hits).toBe(1);
            expect(metrics.performance.fastRequests).toBe(1);
        });

        it('should categorize response times correctly', () => {
            // Fast request
            chatbotPerformanceMonitor.recordRequest({
                success: true,
                responseTime: 500,
                tokensUsed: 50
            });

            // Normal request
            chatbotPerformanceMonitor.recordRequest({
                success: true,
                responseTime: 2000,
                tokensUsed: 100
            });

            // Slow request
            chatbotPerformanceMonitor.recordRequest({
                success: true,
                responseTime: 6000,
                tokensUsed: 200
            });

            const metrics = chatbotPerformanceMonitor.getMetrics();
            expect(metrics.performance.fastRequests).toBe(1);
            expect(metrics.performance.slowRequests).toBe(1);
            expect(metrics.responseTime.average).toBe(2833.33); // (500 + 2000 + 6000) / 3
        });
    });

    describe('recordError', () => {
        it('should record errors with types', () => {
            const error1 = { type: 'APIError', message: 'API timeout' };
            const error2 = { type: 'ValidationError', message: 'Invalid input' };
            const error3 = { type: 'APIError', message: 'Rate limit exceeded' };

            chatbotPerformanceMonitor.recordError(error1);
            chatbotPerformanceMonitor.recordError(error2);
            chatbotPerformanceMonitor.recordError(error3);

            const metrics = chatbotPerformanceMonitor.getMetrics();
            expect(metrics.errors.total).toBe(3);
            expect(metrics.errors.byType.APIError).toBe(2);
            expect(metrics.errors.byType.ValidationError).toBe(1);
            expect(metrics.errors.recent).toHaveLength(3);
        });

        it('should limit recent errors list', () => {
            const originalMaxErrors = chatbotPerformanceMonitor.thresholds.maxRecentErrors;
            chatbotPerformanceMonitor.thresholds.maxRecentErrors = 3;

            // Add more errors than the limit
            for (let i = 0; i < 5; i++) {
                chatbotPerformanceMonitor.recordError({
                    type: 'TestError',
                    message: `Error ${i}`
                });
            }

            const metrics = chatbotPerformanceMonitor.getMetrics();
            expect(metrics.errors.recent).toHaveLength(3);

            // Restore original threshold
            chatbotPerformanceMonitor.thresholds.maxRecentErrors = originalMaxErrors;
        });
    });

    describe('calculatePercentile', () => {
        it('should calculate percentiles correctly', () => {
            const values = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

            const p50 = chatbotPerformanceMonitor.calculatePercentile(values, 50);
            const p95 = chatbotPerformanceMonitor.calculatePercentile(values, 95);
            const p99 = chatbotPerformanceMonitor.calculatePercentile(values, 99);

            expect(p50).toBe(500);
            expect(p95).toBe(950);
            expect(p99).toBe(990);
        });

        it('should handle empty arrays', () => {
            const result = chatbotPerformanceMonitor.calculatePercentile([], 95);
            expect(result).toBe(0);
        });

        it('should handle single value arrays', () => {
            const result = chatbotPerformanceMonitor.calculatePercentile([100], 95);
            expect(result).toBe(100);
        });
    });

    describe('calculateEfficiencyScore', () => {
        it('should calculate high efficiency for good performance', () => {
            // Set up good performance metrics
            chatbotPerformanceMonitor.metrics.performance.averageResponseTime = 800;
            chatbotPerformanceMonitor.metrics.cache.hitRate = 85;
            chatbotPerformanceMonitor.metrics.requests.total = 100;
            chatbotPerformanceMonitor.metrics.errors.total = 1;
            chatbotPerformanceMonitor.metrics.tokens.average = 800;

            const score = chatbotPerformanceMonitor.calculateEfficiencyScore();
            expect(score).toBeGreaterThan(90);
        });

        it('should calculate low efficiency for poor performance', () => {
            // Set up poor performance metrics
            chatbotPerformanceMonitor.metrics.performance.averageResponseTime = 8000;
            chatbotPerformanceMonitor.metrics.cache.hitRate = 20;
            chatbotPerformanceMonitor.metrics.requests.total = 100;
            chatbotPerformanceMonitor.metrics.errors.total = 15;
            chatbotPerformanceMonitor.metrics.tokens.average = 3000;

            const score = chatbotPerformanceMonitor.calculateEfficiencyScore();
            expect(score).toBeLessThan(50);
        });
    });

    describe('calculateHealthScore', () => {
        it('should calculate high health for good metrics', () => {
            // Set up good metrics
            chatbotPerformanceMonitor.metrics.responseTime.total = 2000;
            chatbotPerformanceMonitor.metrics.responseTime.count = 1;
            chatbotPerformanceMonitor.metrics.requests.total = 100;
            chatbotPerformanceMonitor.metrics.requests.successful = 98;
            chatbotPerformanceMonitor.metrics.errors.total = 2;

            const score = chatbotPerformanceMonitor.calculateHealthScore();
            expect(score).toBeGreaterThan(80);
        });

        it('should calculate low health for poor metrics', () => {
            // Set up poor metrics
            chatbotPerformanceMonitor.metrics.responseTime.total = 15000;
            chatbotPerformanceMonitor.metrics.responseTime.count = 1;
            chatbotPerformanceMonitor.metrics.requests.total = 100;
            chatbotPerformanceMonitor.metrics.requests.successful = 70;
            chatbotPerformanceMonitor.metrics.errors.total = 20;

            const score = chatbotPerformanceMonitor.calculateHealthScore();
            expect(score).toBeLessThan(40);
        });
    });

    describe('getPerformanceInsights', () => {
        it('should generate insights for slow response times', () => {
            chatbotPerformanceMonitor.metrics.performance.averageResponseTime = 8000;

            const insights = chatbotPerformanceMonitor.getPerformanceInsights();
            const responseTimeInsight = insights.find(i => i.category === 'response_time');

            expect(responseTimeInsight).toBeDefined();
            expect(responseTimeInsight.type).toBe('warning');
            expect(responseTimeInsight.priority).toBe('high');
        });

        it('should generate insights for low cache hit rate', () => {
            chatbotPerformanceMonitor.metrics.cache.hitRate = 30;

            const insights = chatbotPerformanceMonitor.getPerformanceInsights();
            const cacheInsight = insights.find(i => i.category === 'cache');

            expect(cacheInsight).toBeDefined();
            expect(cacheInsight.type).toBe('info');
            expect(cacheInsight.priority).toBe('medium');
        });

        it('should generate insights for high error rate', () => {
            chatbotPerformanceMonitor.metrics.requests.total = 100;
            chatbotPerformanceMonitor.metrics.errors.total = 8;

            const insights = chatbotPerformanceMonitor.getPerformanceInsights();
            const errorInsight = insights.find(i => i.category === 'errors');

            expect(errorInsight).toBeDefined();
            expect(errorInsight.type).toBe('error');
            expect(errorInsight.priority).toBe('high');
        });

        it('should generate insights for high token usage', () => {
            chatbotPerformanceMonitor.metrics.tokens.average = 2500;

            const insights = chatbotPerformanceMonitor.getPerformanceInsights();
            const tokenInsight = insights.find(i => i.category === 'tokens');

            expect(tokenInsight).toBeDefined();
            expect(tokenInsight.type).toBe('warning');
            expect(tokenInsight.priority).toBe('medium');
        });
    });

    describe('getRealtimeStatus', () => {
        it('should return healthy status for good metrics', () => {
            // Set up healthy metrics
            chatbotPerformanceMonitor.metrics.responseTime.total = 2000;
            chatbotPerformanceMonitor.metrics.responseTime.count = 1;
            chatbotPerformanceMonitor.metrics.requests.total = 100;
            chatbotPerformanceMonitor.metrics.requests.successful = 98;
            chatbotPerformanceMonitor.metrics.errors.total = 1;
            chatbotPerformanceMonitor.metrics.cache.hitRate = 80;

            const status = chatbotPerformanceMonitor.getRealtimeStatus();

            expect(status.status).toBe('healthy');
            expect(status.health).toBeGreaterThan(80);
            expect(status.responseTime).toBe(2000);
            expect(status.cacheHitRate).toBe(80);
            expect(status.errorRate).toBe(1);
        });

        it('should return critical status for poor metrics', () => {
            // Set up critical metrics
            chatbotPerformanceMonitor.metrics.responseTime.total = 15000;
            chatbotPerformanceMonitor.metrics.responseTime.count = 1;
            chatbotPerformanceMonitor.metrics.requests.total = 100;
            chatbotPerformanceMonitor.metrics.requests.successful = 60;
            chatbotPerformanceMonitor.metrics.errors.total = 25;
            chatbotPerformanceMonitor.metrics.cache.hitRate = 10;

            const status = chatbotPerformanceMonitor.getRealtimeStatus();

            expect(status.status).toBe('critical');
            expect(status.health).toBeLessThan(50);
        });
    });

    describe('sample management', () => {
        it('should limit response time samples', () => {
            const originalMaxSamples = chatbotPerformanceMonitor.thresholds.maxSampleSize;
            chatbotPerformanceMonitor.thresholds.maxSampleSize = 3;

            // Add more samples than the limit
            for (let i = 0; i < 5; i++) {
                chatbotPerformanceMonitor.recordRequest({
                    success: true,
                    responseTime: 1000 + i * 100,
                    tokensUsed: 100
                });
            }

            expect(chatbotPerformanceMonitor.metrics.responseTime.samples).toHaveLength(3);

            // Restore original threshold
            chatbotPerformanceMonitor.thresholds.maxSampleSize = originalMaxSamples;
        });
    });

    describe('metrics aggregation', () => {
        it('should calculate correct averages', () => {
            const requests = [
                { responseTime: 1000, tokensUsed: 100 },
                { responseTime: 2000, tokensUsed: 200 },
                { responseTime: 3000, tokensUsed: 300 }
            ];

            requests.forEach(req => {
                chatbotPerformanceMonitor.recordRequest({
                    success: true,
                    ...req
                });
            });

            const metrics = chatbotPerformanceMonitor.getMetrics();
            expect(metrics.responseTime.average).toBe(2000);
            expect(metrics.tokens.average).toBe(200);
            expect(metrics.responseTime.min).toBe(1000);
            expect(metrics.responseTime.max).toBe(3000);
        });
    });
});