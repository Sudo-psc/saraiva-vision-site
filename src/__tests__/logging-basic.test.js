/**
 * Basic tests for logging system structure
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Logging System Basic Tests', () => {
    beforeAll(() => {
        // Set required environment variables
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    });

    it('should have LOG_LEVELS defined', async () => {
        const { LOG_LEVELS } = await import('../lib/logger.js');

        expect(LOG_LEVELS).toBeDefined();
        expect(LOG_LEVELS.DEBUG).toBeDefined();
        expect(LOG_LEVELS.INFO).toBeDefined();
        expect(LOG_LEVELS.WARN).toBeDefined();
        expect(LOG_LEVELS.ERROR).toBeDefined();
        expect(LOG_LEVELS.CRITICAL).toBeDefined();
    });

    it('should create logger instance', async () => {
        const { createLogger } = await import('../lib/logger.js');

        const logger = createLogger('test-service');

        expect(logger).toBeDefined();
        expect(logger.service).toBe('test-service');
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.error).toBe('function');
    });

    it('should have ALERT_TYPES and ALERT_SEVERITY', async () => {
        const { ALERT_TYPES, ALERT_SEVERITY } = await import('../lib/alertingSystem.js');

        expect(ALERT_TYPES).toBeDefined();
        expect(ALERT_TYPES.EMAIL_DELIVERY_FAILURE).toBe('email_delivery_failure');
        expect(ALERT_TYPES.SMS_DELIVERY_FAILURE).toBe('sms_delivery_failure');

        expect(ALERT_SEVERITY).toBeDefined();
        expect(ALERT_SEVERITY.LOW).toBe('low');
        expect(ALERT_SEVERITY.CRITICAL).toBe('critical');
    });

    it('should have performance monitoring functions', async () => {
        const { getPerformanceMetrics, generatePerformanceReport } = await import('../lib/performanceMonitor.js');

        expect(typeof getPerformanceMetrics).toBe('function');
        expect(typeof generatePerformanceReport).toBe('function');
    });
});