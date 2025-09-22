/**
 * Tests for the comprehensive logging system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Supabase first
const mockSupabase = {
    from: vi.fn(() => ({
        insert: vi.fn(() => ({ error: null }))
    }))
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabase)
}));

import { createLogger, LOG_LEVELS } from '../lib/logger.js';

describe('Logger', () => {
    let logger;
    let consoleSpy;

    beforeEach(() => {
        logger = createLogger('test-service');
        consoleSpy = {
            debug: vi.spyOn(console, 'debug').mockImplementation(() => { }),
            info: vi.spyOn(console, 'info').mockImplementation(() => { }),
            warn: vi.spyOn(console, 'warn').mockImplementation(() => { }),
            error: vi.spyOn(console, 'error').mockImplementation(() => { })
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
        Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    });

    describe('PII Sanitization', () => {
        it('should sanitize email addresses', async () => {
            await logger.info('User email: test@example.com');

            expect(mockSupabase.from).toHaveBeenCalledWith('event_log');
            const insertCall = mockSupabase.from().insert;
            expect(insertCall).toHaveBeenCalled();

            const logData = insertCall.mock.calls[0][0];
            expect(logData.event_data.message).toContain('[EMAIL]');
            expect(logData.event_data.message).not.toContain('test@example.com');
        });

        it('should sanitize Brazilian phone numbers', async () => {
            await logger.info('Phone: +55 11 99999-9999');

            const insertCall = mockSupabase.from().insert;
            const logData = insertCall.mock.calls[0][0];
            expect(logData.event_data.message).toContain('[PHONE]');
            expect(logData.event_data.message).not.toContain('99999-9999');
        });
    });

    describe('Log Levels', () => {
        it('should always log info messages', async () => {
            await logger.info('Info message');
            expect(consoleSpy.info).toHaveBeenCalled();
        });

        it('should log warnings', async () => {
            await logger.warn('Warning message');
            expect(consoleSpy.warn).toHaveBeenCalled();
        });

        it('should log errors', async () => {
            await logger.error('Error message');
            expect(consoleSpy.error).toHaveBeenCalled();
        });
    });

    describe('Request ID Generation', () => {
        it('should generate unique request IDs', () => {
            const logger1 = createLogger('service1');
            const logger2 = createLogger('service2');

            expect(logger1.requestId).not.toBe(logger2.requestId);
            expect(logger1.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
        });
    });
});