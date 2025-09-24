import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock functions
const mockSendContactEmail = vi.fn();
const mockValidateMessageOutbox = vi.fn();

// Mock Supabase
const mockSupabaseAdmin = {
    from: vi.fn(() => ({
        insert: vi.fn(() => ({
            select: vi.fn(() => ({
                single: vi.fn()
            }))
        })),
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                lte: vi.fn(() => ({
                    lt: vi.fn(() => ({
                        order: vi.fn(() => ({
                            limit: vi.fn()
                        }))
                    }))
                }))
            })),
            gte: vi.fn(() => ({}))
        })),
        update: vi.fn(() => ({
            eq: vi.fn(() => ({
                select: vi.fn()
            })),
            lt: vi.fn(() => ({
                select: vi.fn()
            }))
        }))
    })),
    raw: vi.fn((sql) => sql)
};

vi.mock('../../../../../../..../../../../src/lib/supabase.js', () => ({
    supabaseAdmin: mockSupabaseAdmin
}));

vi.mock('../emailService.js', () => ({
    sendContactEmail: mockSendContactEmail
}));

vi.mock('../../../../../../../..../../../../src/lib/validation.js', () => ({
    validateMessageOutbox: mockValidateMessageOutbox
}));

// Import after mocking
const { addToOutbox, processOutbox, getOutboxStats, retryFailedMessages } = await import('../outboxService.js');

describe('Outbox Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('addToOutbox', () => {
        it('should successfully add message to outbox', async () => {
            // Mock validation success
            mockValidateMessageOutbox.mockReturnValue({
                success: true,
                data: {
                    message_type: 'email',
                    recipient: 'test@example.com',
                    subject: 'Test Subject',
                    content: 'Test Content',
                    template_data: { name: 'Test User' },
                    max_retries: 3,
                    send_after: new Date()
                }
            });

            // Mock database insert success
            mockSupabaseAdmin.from().insert().select().single.mockResolvedValue({
                data: { id: 'test-message-id' },
                error: null
            });

            const result = await addToOutbox({
                message_type: 'email',
                recipient: 'test@example.com',
                subject: 'Test Subject',
                content: 'Test Content'
            });

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('test-message-id');
            expect(result.status).toBe('queued');
        });

        it('should handle validation errors', async () => {
            mockValidateMessageOutbox.mockReturnValue({
                success: false,
                errors: { recipient: 'Invalid email' }
            });

            const result = await addToOutbox({
                message_type: 'email',
                recipient: 'invalid-email'
            });

            expect(result.success).toBe(false);
            expect(result.error.code).toBe('VALIDATION_ERROR');
        });

        it('should handle database errors', async () => {
            mockValidateMessageOutbox.mockReturnValue({
                success: true,
                data: {
                    message_type: 'email',
                    recipient: 'test@example.com',
                    subject: 'Test Subject',
                    content: 'Test Content',
                    max_retries: 3,
                    send_after: new Date()
                }
            });

            mockSupabaseAdmin.from().insert().select().single.mockResolvedValue({
                data: null,
                error: { message: 'Database connection failed' }
            });

            const result = await addToOutbox({
                message_type: 'email',
                recipient: 'test@example.com',
                subject: 'Test Subject',
                content: 'Test Content'
            });

            expect(result.success).toBe(false);
            expect(result.error.code).toBe('DATABASE_ERROR');
        });
    });

    describe('processOutbox', () => {
        it('should process pending messages successfully', async () => {
            const mockMessages = [
                {
                    id: 'msg-1',
                    message_type: 'email',
                    recipient: 'test1@example.com',
                    subject: 'Test 1',
                    content: 'Content 1',
                    template_data: { name: 'User 1' },
                    retry_count: 0,
                    max_retries: 3
                },
                {
                    id: 'msg-2',
                    message_type: 'email',
                    recipient: 'test2@example.com',
                    subject: 'Test 2',
                    content: 'Content 2',
                    template_data: { name: 'User 2' },
                    retry_count: 1,
                    max_retries: 3
                }
            ];

            // Mock database select
            mockSupabaseAdmin.from().select().eq().lte().lt().order().limit.mockResolvedValue({
                data: mockMessages,
                error: null
            });

            // Mock successful email sending
            mockSendContactEmail.mockResolvedValue({
                success: true,
                messageId: 'email-id-123'
            });

            // Mock database update for sent messages
            mockSupabaseAdmin.from().update().eq.mockResolvedValue({
                data: {},
                error: null
            });

            const result = await processOutbox(2);

            expect(result.success).toBe(true);
            expect(result.processed).toBe(2);
            expect(result.failed).toBe(0);
            expect(result.total).toBe(2);
        });

        it('should handle no pending messages', async () => {
            mockSupabaseAdmin.from().select().eq().lte().lt().order().limit.mockResolvedValue({
                data: [],
                error: null
            });

            const result = await processOutbox(10);

            expect(result.success).toBe(true);
            expect(result.processed).toBe(0);
            expect(result.failed).toBe(0);
        });

        it('should handle email delivery failures with retry', async () => {
            const mockMessage = {
                id: 'msg-1',
                message_type: 'email',
                recipient: 'test@example.com',
                subject: 'Test',
                content: 'Content',
                template_data: { name: 'User' },
                retry_count: 0,
                max_retries: 3
            };

            mockSupabaseAdmin.from().select().eq().lte().lt().order().limit.mockResolvedValue({
                data: [mockMessage],
                error: null
            });

            // Mock failed email sending
            mockSendContactEmail.mockResolvedValue({
                success: false,
                error: { message: 'SMTP connection failed' }
            });

            // Mock database update for retry
            mockSupabaseAdmin.from().update().eq.mockResolvedValue({
                data: {},
                error: null
            });

            const result = await processOutbox(1);

            expect(result.success).toBe(true);
            expect(result.processed).toBe(0);
            expect(result.failed).toBe(1);
        });
    });

    describe('getOutboxStats', () => {
        it('should return outbox statistics', async () => {
            const mockData = [
                { status: 'pending', message_type: 'email', created_at: new Date().toISOString() },
                { status: 'sent', message_type: 'email', created_at: new Date().toISOString() },
                { status: 'failed', message_type: 'sms', created_at: new Date().toISOString() }
            ];

            mockSupabaseAdmin.from().select().gte.mockResolvedValue({
                data: mockData,
                error: null
            });

            const result = await getOutboxStats();

            expect(result.success).toBe(true);
            expect(result.stats.total).toBe(3);
            expect(result.stats.pending).toBe(1);
            expect(result.stats.sent).toBe(1);
            expect(result.stats.failed).toBe(1);
            expect(result.stats.byType.email).toBe(2);
            expect(result.stats.byType.sms).toBe(1);
        });

        it('should handle database errors', async () => {
            mockSupabaseAdmin.from().select().gte.mockResolvedValue({
                data: null,
                error: { message: 'Connection timeout' }
            });

            const result = await getOutboxStats();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Connection timeout');
        });
    });

    describe('retryFailedMessages', () => {
        it('should retry failed messages successfully', async () => {
            mockSupabaseAdmin.from().update().eq().lt().select.mockResolvedValue({
                data: [{ id: 'msg-1' }, { id: 'msg-2' }],
                error: null
            });

            const result = await retryFailedMessages();

            expect(result.success).toBe(true);
            expect(result.retriedCount).toBe(2);
        });

        it('should handle database errors during retry', async () => {
            mockSupabaseAdmin.from().update().eq().lt().select.mockResolvedValue({
                data: null,
                error: { message: 'Update failed' }
            });

            const result = await retryFailedMessages();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Update failed');
        });
    });
});

describe('Outbox Integration Tests', () => {
    it('should handle complete message lifecycle', async () => {
        // This would be an integration test that tests the full flow
        // from adding to outbox, processing, and handling retries

        // Mock the complete flow
        mockValidateMessageOutbox.mockReturnValue({
            success: true,
            data: {
                message_type: 'email',
                recipient: 'test@example.com',
                subject: 'Integration Test',
                content: 'Test Content',
                max_retries: 3,
                send_after: new Date()
            }
        });

        // Add to outbox
        mockSupabaseAdmin.from().insert().select().single.mockResolvedValue({
            data: { id: 'integration-test-id' },
            error: null
        });

        const addResult = await addToOutbox({
            message_type: 'email',
            recipient: 'test@example.com',
            subject: 'Integration Test',
            content: 'Test Content'
        });

        expect(addResult.success).toBe(true);

        // Process outbox
        mockSupabaseAdmin.from().select().eq().lte().lt().order().limit.mockResolvedValue({
            data: [{
                id: 'integration-test-id',
                message_type: 'email',
                recipient: 'test@example.com',
                subject: 'Integration Test',
                content: 'Test Content',
                template_data: {},
                retry_count: 0,
                max_retries: 3
            }],
            error: null
        });

        mockSendContactEmail.mockResolvedValue({
            success: true,
            messageId: 'sent-email-id'
        });

        mockSupabaseAdmin.from().update().eq.mockResolvedValue({
            data: {},
            error: null
        });

        const processResult = await processOutbox(1);

        expect(processResult.success).toBe(true);
        expect(processResult.processed).toBe(1);
    });
});