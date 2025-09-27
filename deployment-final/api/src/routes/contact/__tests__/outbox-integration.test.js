import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Contact API with Outbox Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should validate outbox service functions exist', async () => {
        // Test that the outbox service functions are properly exported
        const outboxService = await import('../outboxService.js');

        expect(typeof outboxService.addToOutbox).toBe('function');
        expect(typeof outboxService.processOutbox).toBe('function');
        expect(typeof outboxService.getOutboxStats).toBe('function');
        expect(typeof outboxService.retryFailedMessages).toBe('function');
    });

    it('should validate message outbox schema', async () => {
        const { validateMessageOutbox } = await import('../../../../../../..../../../../src/lib/validation.js');

        // Valid message data
        const validMessage = {
            message_type: 'email',
            recipient: 'test@example.com',
            subject: 'Test Subject',
            content: 'Test Content',
            max_retries: 3
        };

        const result = validateMessageOutbox(validMessage);
        expect(result.success).toBe(true);
        expect(result.data.message_type).toBe('email');
        expect(result.data.recipient).toBe('test@example.com');
    });

    it('should reject invalid message data', async () => {
        const { validateMessageOutbox } = await import('../../../../../../..../../../../src/lib/validation.js');

        // Invalid message data
        const invalidMessage = {
            message_type: 'invalid',
            recipient: 'not-an-email',
            subject: '',
            content: ''
        };

        const result = validateMessageOutbox(invalidMessage);
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
    });

    it('should validate outbox drain endpoint exists', async () => {
        const drainHandler = await import('../../api/outbox/drain.js');
        expect(typeof drainHandler.default).toBe('function');
    });

    it('should validate outbox retry endpoint exists', async () => {
        const retryHandler = await import('../../api/outbox/retry.js');
        expect(typeof retryHandler.default).toBe('function');
    });

    it('should validate enhanced rate limiter functions', async () => {
        const rateLimiter = await import('../rateLimiter.js');

        expect(typeof rateLimiter.checkRateLimit).toBe('function');
        expect(typeof rateLimiter.detectHoneypot).toBe('function');
        expect(typeof rateLimiter.validateRequest).toBe('function');
        expect(typeof rateLimiter.hashIP).toBe('function');
        expect(typeof rateLimiter.getClientIP).toBe('function');
    });

    it('should validate contact API has been updated', async () => {
        // Read the contact API file to verify it includes outbox integration
        const fs = await import('fs');
        const path = await import('path');

        const contactApiPath = path.resolve('api/contact/index.js');
        const contactApiContent = fs.readFileSync(contactApiPath, 'utf8');

        // Check for outbox integration
        expect(contactApiContent).toContain('addToOutbox');
        expect(contactApiContent).toContain('supabaseAdmin');
        expect(contactApiContent).toContain('contact_messages');
        expect(contactApiContent).toContain('deliveryMethod');
    });
});