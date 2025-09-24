/**
 * Tests for Chatbot Health Check API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';

// Mock environment variables
vi.stubEnv('GOOGLE_GEMINI_API_KEY', 'test-api-key');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                limit: vi.fn(() => ({ data: [], error: null }))
            }))
        }))
    }))
}));

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn(() => ({
        getGenerativeModel: vi.fn(() => ({
            generateContent: vi.fn().mockResolvedValue({
                response: {
                    text: () => 'Health check response',
                    candidates: [{ safetyRatings: [], finishReason: 'STOP' }],
                    usageMetadata: { totalTokenCount: 10 }
                }
            })
        }))
    }))
}));

describe('Chatbot Health API', () => {
    let handler;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Import the handler
        const module = await import('../chatbot/health.js');
        handler = module.default;
    });

    describe('GET /api/chatbot/health', () => {
        it('should return healthy status when all services are working', async () => {
            const { req, res } = createMocks({
                method: 'GET'
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.status).toBe('healthy');
            expect(data).toHaveProperty('timestamp');
            expect(data).toHaveProperty('healthCheckDuration');
            expect(data).toHaveProperty('services');
            expect(data).toHaveProperty('system');
            expect(data).toHaveProperty('features');
            expect(data).toHaveProperty('compliance');
        });

        it('should include service health information', async () => {
            const { req, res } = createMocks({
                method: 'GET'
            });

            await handler(req, res);

            const data = JSON.parse(res._getData());

            expect(data.services).toHaveProperty('database');
            expect(data.services).toHaveProperty('geminiApi');
            expect(data.services).toHaveProperty('geminiService');
            expect(data.services).toHaveProperty('configuration');

            expect(data.services.database).toHaveProperty('status');
            expect(data.services.geminiApi).toHaveProperty('status');
        });

        it('should include system metrics', async () => {
            const { req, res } = createMocks({
                method: 'GET'
            });

            await handler(req, res);

            const data = JSON.parse(res._getData());

            expect(data.system).toHaveProperty('memory');
            expect(data.system).toHaveProperty('uptime');
            expect(data.system).toHaveProperty('timestamp');

            expect(data.system.memory).toHaveProperty('used');
            expect(data.system.memory).toHaveProperty('total');
            expect(data.system.uptime).toHaveProperty('seconds');
            expect(data.system.uptime).toHaveProperty('formatted');
        });

        it('should include feature flags status', async () => {
            const { req, res } = createMocks({
                method: 'GET'
            });

            await handler(req, res);

            const data = JSON.parse(res._getData());

            expect(data.features).toHaveProperty('appointmentBooking');
            expect(data.features).toHaveProperty('referralManagement');
            expect(data.features).toHaveProperty('websocketSupport');
            expect(data.features).toHaveProperty('caching');
            expect(data.features).toHaveProperty('analytics');
        });

        it('should include compliance status', async () => {
            const { req, res } = createMocks({
                method: 'GET'
            });

            await handler(req, res);

            const data = JSON.parse(res._getData());

            expect(data.compliance).toHaveProperty('cfmCompliance');
            expect(data.compliance).toHaveProperty('lgpdCompliance');
            expect(data.compliance).toHaveProperty('auditLogging');
            expect(data.compliance).toHaveProperty('dataEncryption');
        });

        it('should reject non-GET requests', async () => {
            const { req, res } = createMocks({
                method: 'POST'
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(405);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(false);
            expect(data.error).toBe('Method not allowed');
        });

        it('should return degraded status when services are unhealthy', async () => {
            // Mock database error
            vi.doMock('@supabase/supabase-js', () => ({
                createClient: vi.fn(() => ({
                    from: vi.fn(() => ({
                        select: vi.fn(() => ({
                            limit: vi.fn(() => Promise.reject(new Error('Database error')))
                        }))
                    }))
                }))
            }));

            const { req, res } = createMocks({
                method: 'GET'
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(503);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.status).toBe('degraded');
        });

        it('should handle health check errors gracefully', async () => {
            // Mock a complete failure
            vi.doMock('../../src/services/geminiService.js', () => ({
                default: {
                    getHealthStatus: () => { throw new Error('Service error'); }
                }
            }));

            const { req, res } = createMocks({
                method: 'GET'
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(false);
            expect(data.status).toBe('unhealthy');
            expect(data.error).toBe('Health check failed');
        });
    });
});