import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';

// Mock Supabase client
const mockSupabaseClient = {
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            gte: vi.fn(() => ({
                eq: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
                    order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                })),
                filter: vi.fn(() => Promise.resolve({ data: [], error: null })),
                order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            eq: vi.fn(() => ({
                gte: vi.fn(() => Promise.resolve({ data: [], error: null })),
                limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabaseClient)
}));

// Mock fetch for external API calls
global.fetch = vi.fn();

describe('Dashboard API Endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
        process.env.WORDPRESS_GRAPHQL_ENDPOINT = 'https://cms.test.com/graphql';
        process.env.RESEND_API_KEY = 'test-resend-key';
        process.env.OPENAI_API_KEY = 'test-openai-key';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('/api/dashboard/metrics', () => {
        it('should return dashboard metrics successfully', async () => {
            // Mock Supabase responses
            const mockContactData = [
                { created_at: new Date().toISOString() },
                { created_at: new Date().toISOString() }
            ];

            const mockAppointmentData = [
                { created_at: new Date().toISOString(), status: 'confirmed' },
                { created_at: new Date().toISOString(), status: 'pending' }
            ];

            const mockOutboxData = [
                { status: 'sent', retry_count: 0, created_at: new Date().toISOString() },
                { status: 'pending', retry_count: 1, created_at: new Date().toISOString() }
            ];

            const mockErrorLogs = [
                { severity: 'error', created_at: new Date().toISOString() }
            ];

            mockSupabaseClient.from
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        gte: vi.fn(() => Promise.resolve({ data: mockContactData, error: null }))
                    }))
                })
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        gte: vi.fn(() => Promise.resolve({ data: mockAppointmentData, error: null }))
                    }))
                })
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        gte: vi.fn(() => Promise.resolve({ data: mockOutboxData, error: null }))
                    }))
                })
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            gte: vi.fn(() => Promise.resolve({ data: mockErrorLogs, error: null }))
                        }))
                    }))
                });

            const { default: handler } = await import('../dashboard/metrics.js');
            const { req, res } = createMocks({ method: 'GET' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('contacts');
            expect(data.data).toHaveProperty('appointments');
            expect(data.data).toHaveProperty('messaging');
            expect(data.data).toHaveProperty('system');

            expect(data.data.contacts.total24h).toBe(2);
            expect(data.data.appointments.total24h).toBe(2);
            expect(data.data.appointments.confirmed).toBe(1);
            expect(data.data.appointments.pending).toBe(1);
        });

        it('should handle database errors gracefully', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn(() => ({
                    gte: vi.fn(() => Promise.resolve({
                        data: null,
                        error: { message: 'Database connection failed' }
                    }))
                }))
            });

            const { default: handler } = await import('../dashboard/metrics.js');
            const { req, res } = createMocks({ method: 'GET' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const data = JSON.parse(res._getData());
            expect(data.success).toBe(false);
            expect(data.error).toBe('Failed to fetch dashboard metrics');
        });

        it('should reject non-GET requests', async () => {
            const { default: handler } = await import('../dashboard/metrics.js');
            const { req, res } = createMocks({ method: 'POST' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(405);
            const data = JSON.parse(res._getData());
            expect(data.error).toBe('Method not allowed');
        });
    });

    describe('/api/dashboard/health', () => {
        it('should return healthy status when all services are up', async () => {
            // Mock successful external API responses
            fetch
                .mockResolvedValueOnce({ ok: true, status: 200 }) // WordPress
                .mockResolvedValueOnce({ ok: true, status: 200 }) // Resend
                .mockResolvedValueOnce({ ok: true, status: 200 }); // OpenAI

            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null }))
                })),
                insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
            });

            const { default: handler } = await import('../dashboard/health.js');
            const { req, res } = createMocks({ method: 'GET' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.overall.status).toBe('healthy');
            expect(data.data.overall.upServices).toBe(4);
            expect(data.data.overall.totalServices).toBe(4);
            expect(data.data.services).toHaveLength(4);
        });

        it('should return degraded status when some services are down', async () => {
            // Mock mixed responses - some services down
            fetch
                .mockRejectedValueOnce(new Error('Connection timeout')) // WordPress down
                .mockResolvedValueOnce({ ok: true, status: 200 }) // Resend up
                .mockResolvedValueOnce({ ok: false, status: 500 }); // OpenAI down

            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: [{ id: 1 }], error: null }))
                })),
                insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
            });

            const { default: handler } = await import('../dashboard/health.js');
            const { req, res } = createMocks({ method: 'GET' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.overall.status).toBe('degraded');
            expect(data.data.overall.upServices).toBe(2); // Supabase + Resend
            expect(data.data.services.filter(s => s.status === 'up')).toHaveLength(2);
            expect(data.data.services.filter(s => s.status === 'down')).toHaveLength(2);
        });

        it('should handle Supabase connection errors', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({
                        data: null,
                        error: { message: 'Connection failed' }
                    }))
                })),
                insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
            });

            fetch
                .mockResolvedValueOnce({ ok: true, status: 200 }) // WordPress
                .mockResolvedValueOnce({ ok: true, status: 200 }) // Resend
                .mockResolvedValueOnce({ ok: true, status: 200 }); // OpenAI

            const { default: handler } = await import('../dashboard/health.js');
            const { req, res } = createMocks({ method: 'GET' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.overall.status).toBe('degraded');
            expect(data.data.services.find(s => s.service === 'Supabase').status).toBe('down');
        });
    });

    describe('/api/dashboard/queue', () => {
        it('should return queue metrics successfully', async () => {
            const mockQueueData = [
                {
                    id: '1',
                    status: 'sent',
                    message_type: 'email',
                    retry_count: 0,
                    created_at: new Date().toISOString(),
                    sent_at: new Date().toISOString()
                },
                {
                    id: '2',
                    status: 'pending',
                    message_type: 'sms',
                    retry_count: 1,
                    created_at: new Date().toISOString(),
                    send_after: new Date().toISOString()
                },
                {
                    id: '3',
                    status: 'failed',
                    message_type: 'email',
                    retry_count: 3,
                    created_at: new Date().toISOString(),
                    error_message: 'Invalid email address'
                }
            ];

            mockSupabaseClient.from
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        order: vi.fn(() => Promise.resolve({ data: mockQueueData, error: null }))
                    }))
                })
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        gte: vi.fn(() => ({
                            order: vi.fn(() => Promise.resolve({ data: mockQueueData, error: null }))
                        }))
                    }))
                });

            const { default: handler } = await import('../dashboard/queue.js');
            const { req, res } = createMocks({ method: 'GET' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.metrics.current.total).toBe(3);
            expect(data.data.metrics.current.sent).toBe(1);
            expect(data.data.metrics.current.pending).toBe(1);
            expect(data.data.metrics.current.failed).toBe(1);
            expect(data.data.failedMessages).toHaveLength(1);
        });

        it('should generate alerts for high failure rates', async () => {
            const mockQueueData = Array.from({ length: 20 }, (_, i) => ({
                id: `${i + 1}`,
                status: i < 15 ? 'failed' : 'sent', // 75% failure rate
                message_type: 'email',
                retry_count: i < 15 ? 3 : 0,
                created_at: new Date().toISOString(),
                error_message: i < 15 ? 'Delivery failed' : null
            }));

            mockSupabaseClient.from
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        order: vi.fn(() => Promise.resolve({ data: mockQueueData, error: null }))
                    }))
                })
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        gte: vi.fn(() => ({
                            order: vi.fn(() => Promise.resolve({ data: mockQueueData, error: null }))
                        }))
                    }))
                });

            const { default: handler } = await import('../dashboard/queue.js');
            const { req, res } = createMocks({ method: 'GET' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.alerts).toHaveLength(2);
            expect(data.data.alerts[0].type).toBe('error');
            expect(data.data.alerts[0].message).toContain('High failure rate');
            expect(data.data.alerts[1].type).toBe('warning');
            expect(data.data.alerts[1].message).toContain('Low success rate');
        });

        it('should identify stuck messages', async () => {
            const stuckTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
            const mockQueueData = [
                {
                    id: '1',
                    status: 'pending',
                    message_type: 'email',
                    retry_count: 0,
                    created_at: stuckTime.toISOString(),
                    send_after: stuckTime.toISOString(),
                    recipient: 'test@example.com'
                }
            ];

            mockSupabaseClient.from
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        order: vi.fn(() => Promise.resolve({ data: mockQueueData, error: null }))
                    }))
                })
                .mockReturnValueOnce({
                    select: vi.fn(() => ({
                        gte: vi.fn(() => ({
                            order: vi.fn(() => Promise.resolve({ data: mockQueueData, error: null }))
                        }))
                    }))
                });

            const { default: handler } = await import('../dashboard/queue.js');
            const { req, res } = createMocks({ method: 'GET' });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.stuckMessages).toHaveLength(1);
            expect(data.data.alerts.some(alert =>
                alert.message.includes('stuck in queue')
            )).toBe(true);
        });
    });
});