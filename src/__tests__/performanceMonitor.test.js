/**
 * Tests for the performance monitoring system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    performanceMonitor,
    performanceTrackingMiddleware,
    trackDbOperation,
    trackExternalCall,
    getPerformanceMetrics,
    generatePerformanceReport
} from '../lib/performanceMonitor.js';

// Mock logger
vi.mock('../lib/logger.js', () => ({
    createLogger: vi.fn(() => ({
        logPerformance: vi.fn(),
        info: vi.fn(),
        warn: vi.fn()
    }))
}));

describe('PerformanceMonitor', () => {
    beforeEach(() => {
        performanceMonitor.reset();
    });

    describe('API Call Recording', () => {
        it('should record API call performance', () => {
            performanceMonitor.recordApiCall('/api/users', 'GET', 200, 150);

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.endpoints['GET:/api/users']).toBeDefined();
            expect(metrics.endpoints['GET:/api/users'].count).toBe(1);
            expect(metrics.endpoints['GET:/api/users'].avg).toBe(150);
        });

        it('should track error rates for failed API calls', () => {
            performanceMonitor.recordApiCall('/api/users', 'POST', 500, 1000);
            performanceMonitor.recordApiCall('/api/users', 'POST', 200, 200);

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.error_rates['POST:/api/users:500']).toBeDefined();
            expect(metrics.error_rates['POST:/api/users:500'].error_count).toBe(1);
            expect(metrics.error_rates['POST:/api/users:500'].total_calls).toBe(2);
            expect(metrics.error_rates['POST:/api/users:500'].error_rate).toBe(50);
        });

        it('should calculate statistics correctly', () => {
            // Record multiple calls with different response times
            performanceMonitor.recordApiCall('/api/test', 'GET', 200, 100);
            performanceMonitor.recordApiCall('/api/test', 'GET', 200, 200);
            performanceMonitor.recordApiCall('/api/test', 'GET', 200, 300);
            performanceMonitor.recordApiCall('/api/test', 'GET', 200, 400);
            performanceMonitor.recordApiCall('/api/test', 'GET', 200, 500);

            const metrics = performanceMonitor.getPerformanceSummary();
            const stats = metrics.endpoints['GET:/api/test'];

            expect(stats.count).toBe(5);
            expect(stats.avg).toBe(300); // (100+200+300+400+500)/5
            expect(stats.min).toBe(100);
            expect(stats.max).toBe(500);
            expect(stats.p95).toBe(500); // 95th percentile
        });
    });

    describe('Database Operation Recording', () => {
        it('should record successful database operations', () => {
            performanceMonitor.recordDbOperation('SELECT', 'users', 50, true);

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.database['db:SELECT:users']).toBeDefined();
            expect(metrics.database['db:SELECT:users'].count).toBe(1);
        });

        it('should record failed database operations', () => {
            performanceMonitor.recordDbOperation('INSERT', 'users', 200, false);

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.error_rates['db:INSERT:users']).toBeDefined();
            expect(metrics.error_rates['db:INSERT:users'].error_count).toBe(1);
        });
    });

    describe('External Service Recording', () => {
        it('should record external service calls', () => {
            performanceMonitor.recordExternalCall('resend', 'send_email', 300, true);

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.external_services['external:resend:send_email']).toBeDefined();
        });

        it('should track external service failures', () => {
            performanceMonitor.recordExternalCall('zenvia', 'send_sms', 1000, false);

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.error_rates['external:zenvia:send_sms']).toBeDefined();
        });
    });

    describe('Threshold Checking', () => {
        it('should detect high error rates', () => {
            // Create 15% error rate (3 errors out of 20 calls)
            for (let i = 0; i < 17; i++) {
                performanceMonitor.recordApiCall('/api/test', 'POST', 200, 100);
            }
            for (let i = 0; i < 3; i++) {
                performanceMonitor.recordApiCall('/api/test', 'POST', 500, 100);
            }

            const alerts = performanceMonitor.checkErrorThresholds();
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('high_error_rate');
            expect(alerts[0].error_rate).toBe(15);
        });

        it('should detect slow response times', () => {
            // Record slow API calls
            performanceMonitor.recordApiCall('/api/slow', 'GET', 200, 6000); // 6 seconds

            const alerts = performanceMonitor.checkPerformanceThresholds();
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('slow_response');
            expect(alerts[0].p95_ms).toBe(6000);
        });

        it('should detect slow database operations', () => {
            performanceMonitor.recordDbOperation('SELECT', 'large_table', 3000, true); // 3 seconds

            const alerts = performanceMonitor.checkPerformanceThresholds();
            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('slow_database');
        });
    });

    describe('Performance Report Generation', () => {
        it('should generate comprehensive performance report', async () => {
            // Add some test data
            performanceMonitor.recordApiCall('/api/users', 'GET', 200, 150);
            performanceMonitor.recordApiCall('/api/users', 'GET', 500, 2000);
            performanceMonitor.recordDbOperation('SELECT', 'users', 50, true);

            const report = await performanceMonitor.generateReport();

            expect(report.timestamp).toBeDefined();
            expect(report.summary).toBeDefined();
            expect(report.alerts).toBeDefined();
            expect(report.health_status).toMatch(/healthy|degraded/);
        });

        it('should mark system as degraded when alerts exist', async () => {
            // Create conditions that trigger alerts
            performanceMonitor.recordApiCall('/api/test', 'POST', 500, 100);
            performanceMonitor.recordApiCall('/api/test', 'POST', 500, 100);

            const report = await performanceMonitor.generateReport();
            expect(report.health_status).toBe('degraded');
            expect(report.alerts.length).toBeGreaterThan(0);
        });
    });

    describe('Statistics Calculation', () => {
        it('should handle empty values gracefully', () => {
            const stats = performanceMonitor.calculateStats([]);
            expect(stats.count).toBe(0);
            expect(stats.avg).toBe(0);
            expect(stats.min).toBe(0);
            expect(stats.max).toBe(0);
        });

        it('should calculate percentiles correctly', () => {
            const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const stats = performanceMonitor.calculateStats(values);

            expect(stats.count).toBe(10);
            expect(stats.avg).toBe(5.5);
            expect(stats.min).toBe(1);
            expect(stats.max).toBe(10);
            expect(stats.p95).toBe(10); // 95th percentile of 10 items
            expect(stats.p99).toBe(10); // 99th percentile of 10 items
        });
    });

    describe('Reset Functionality', () => {
        it('should reset all metrics', () => {
            performanceMonitor.recordApiCall('/api/test', 'GET', 200, 100);
            performanceMonitor.recordDbOperation('SELECT', 'users', 50, true);

            let metrics = performanceMonitor.getPerformanceSummary();
            expect(Object.keys(metrics.endpoints)).toHaveLength(1);

            performanceMonitor.reset();

            metrics = performanceMonitor.getPerformanceSummary();
            expect(Object.keys(metrics.endpoints)).toHaveLength(0);
            expect(Object.keys(metrics.database)).toHaveLength(0);
        });
    });
});

describe('Performance Tracking Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            method: 'GET',
            path: '/api/test',
            url: '/api/test',
            route: { path: '/api/test' },
            get: vi.fn(() => 'test-agent')
        };

        res = {
            statusCode: 200,
            end: vi.fn(),
            get: vi.fn(() => '100')
        };

        next = vi.fn();
        performanceMonitor.reset();
    });

    it('should track request performance', (done) => {
        performanceTrackingMiddleware(req, res, next);

        // Simulate response end after some time
        setTimeout(() => {
            res.end();

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.endpoints['GET:/api/test']).toBeDefined();
            expect(metrics.endpoints['GET:/api/test'].count).toBe(1);
            done();
        }, 10);

        expect(next).toHaveBeenCalled();
    });

    it('should handle requests without route path', () => {
        delete req.route;

        performanceTrackingMiddleware(req, res, next);
        res.end();

        const metrics = performanceMonitor.getPerformanceSummary();
        expect(metrics.endpoints['GET:/api/test']).toBeDefined();
    });
});

describe('Decorator Functions', () => {
    describe('trackDbOperation', () => {
        it('should track successful database operations', async () => {
            class TestService {
                @trackDbOperation('SELECT', 'users')
                async getUsers() {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    return ['user1', 'user2'];
                }
            }

            const service = new TestService();
            const result = await service.getUsers();

            expect(result).toEqual(['user1', 'user2']);

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.database['db:SELECT:users']).toBeDefined();
        });

        it('should track failed database operations', async () => {
            class TestService {
                @trackDbOperation('INSERT', 'users')
                async createUser() {
                    throw new Error('Database error');
                }
            }

            const service = new TestService();

            await expect(service.createUser()).rejects.toThrow('Database error');

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.error_rates['db:INSERT:users']).toBeDefined();
        });
    });

    describe('trackExternalCall', () => {
        it('should track successful external service calls', async () => {
            class EmailService {
                @trackExternalCall('resend', 'send_email')
                async sendEmail() {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    return { success: true };
                }
            }

            const service = new EmailService();
            const result = await service.sendEmail();

            expect(result.success).toBe(true);

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.external_services['external:resend:send_email']).toBeDefined();
        });

        it('should track failed external service calls', async () => {
            class SmsService {
                @trackExternalCall('zenvia', 'send_sms')
                async sendSms() {
                    throw new Error('API error');
                }
            }

            const service = new SmsService();

            await expect(service.sendSms()).rejects.toThrow('API error');

            const metrics = performanceMonitor.getPerformanceSummary();
            expect(metrics.error_rates['external:zenvia:send_sms']).toBeDefined();
        });
    });
});

describe('Utility Functions', () => {
    beforeEach(() => {
        performanceMonitor.reset();
    });

    it('should get performance metrics', () => {
        performanceMonitor.recordApiCall('/api/test', 'GET', 200, 100);

        const metrics = getPerformanceMetrics();
        expect(metrics.endpoints['GET:/api/test']).toBeDefined();
    });

    it('should generate performance report', async () => {
        performanceMonitor.recordApiCall('/api/test', 'GET', 200, 100);

        const report = await generatePerformanceReport();
        expect(report.timestamp).toBeDefined();
        expect(report.summary).toBeDefined();
    });
});