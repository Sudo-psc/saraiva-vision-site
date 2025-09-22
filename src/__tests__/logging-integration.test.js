/**
 * Integration test for logging system
 */

import { describe, it, expect, vi } from 'vitest';

describe('Logging System Integration', () => {
    it('should be able to import logger modules', async () => {
        // Test that modules can be imported without errors
        const { createLogger } = await import('../lib/logger.js');
        const { performanceMonitor } = await import('../lib/performanceMonitor.js');
        const { alertingSystem } = await import('../lib/alertingSystem.js');

        expect(createLogger).toBeDefined();
        expect(performanceMonitor).toBeDefined();
        expect(alertingSystem).toBeDefined();
    });

    it('should create logger with proper structure', async () => {
        const { createLogger } = await import('../lib/logger.js');

        const logger = createLogger('test-service');

        expect(logger.service).toBe('test-service');
        expect(logger.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.warn).toBe('function');
    });

    it('should have performance monitoring capabilities', async () => {
        const { performanceMonitor } = await import('../lib/performanceMonitor.js');

        expect(typeof performanceMonitor.recordApiCall).toBe('function');
        expect(typeof performanceMonitor.recordDbOperation).toBe('function');
        expect(typeof performanceMonitor.getPerformanceSummary).toBe('function');
    });

    it('should have alerting system capabilities', async () => {
        const { alertingSystem } = await import('../lib/alertingSystem.js');

        expect(typeof alertingSystem.trackEmailDelivery).toBe('function');
        expect(typeof alertingSystem.trackSmsDelivery).toBe('function');
        expect(typeof alertingSystem.createAlert).toBe('function');
    });
});