/**
 * Integration tests for Chatbot API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';

// Mock environment variables
vi.stubEnv('GOOGLE_GEMINI_API_KEY', 'test-api-key');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            insert: vi.fn(() => ({ error: null }))
        }))
    }))
}));

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn(() => ({
        getGenerativeModel: vi.fn(() => ({
            generateContent: vi.fn().mockResolvedValue({
                response: {
                    text: () => 'Olá! Como posso ajudá-lo com suas questões sobre saúde ocular? Lembre-se de que esta informação é apenas educativa. Consulte sempre um médico oftalmologista para diagnóstico e tratamento adequados.',
                    candidates: [{
                        safetyRatings: [],
                        finishReason: 'STOP'
                    }],
                    usageMetadata: {
                        totalTokenCount: 45
                    }
                }
            })
        }))
    }))
}));

describe('Chatbot API Integration', () => {
    let handler;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Import the handler
        const module = await import('../chatbot/chat.js');
        handler = module.default;
    });

    describe('POST /api/chatbot/chat', () => {
        it('should handle basic chat request successfully', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Olá, como você pode me ajudar?'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('response');
            expect(data.data).toHaveProperty('sessionId');
            expect(data.data).toHaveProperty('complianceInfo');
            expect(data.metadata).toHaveProperty('tokensUsed');
            expect(data.metadata).toHaveProperty('responseTime');
        });

        it('should detect medical content and add disclaimers', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Estou com dor no olho, o que pode ser?'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.response).toContain('Esta informação é apenas educativa');
            expect(data.data.complianceInfo.medicalAdviceDetected).toBe(true);
            expect(data.data.complianceInfo.disclaimerIncluded).toBe(true);
            expect(data.data.suggestedActions).toContainEqual({
                type: 'appointment',
                label: 'Agendar Consulta',
                action: 'schedule_appointment'
            });
        });

        it('should detect emergency situations', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Socorro! Perdi a visão de repente!'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.response).toContain('EMERGÊNCIA MÉDICA');
            expect(data.data.response).toContain('SAMU (192)');
            expect(data.data.complianceInfo.emergencyDetected).toBe(true);
            expect(data.data.suggestedActions).toContainEqual({
                type: 'emergency',
                label: 'Contatos de Emergência',
                action: 'show_emergency_contacts'
            });
        });

        it('should handle conversation history', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'E sobre cirurgia de catarata?',
                    sessionId: 'test-session-123',
                    conversationHistory: [
                        { role: 'user', content: 'Olá' },
                        { role: 'assistant', content: 'Olá! Como posso ajudar?' }
                    ]
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.sessionId).toBe('test-session-123');
        });

        it('should validate request input', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    // Missing message
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(false);
            expect(data.error).toBe('Validation failed');
            expect(data.details).toContain('Message is required and must be a string');
        });

        it('should reject non-POST requests', async () => {
            const { req, res } = createMocks({
                method: 'GET'
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(405);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(false);
            expect(data.error).toBe('Method not allowed');
        });

        it('should handle long messages', async () => {
            const longMessage = 'a'.repeat(3000); // Exceeds default limit

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: longMessage
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(false);
            expect(data.details).toContain('Message exceeds maximum length');
        });

        it('should include LGPD compliance information', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Como vocês protegem meus dados?',
                    userConsent: [
                        {
                            consentType: 'data_processing',
                            granted: true,
                            timestamp: new Date().toISOString()
                        }
                    ]
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.complianceInfo).toHaveProperty('cfmCompliant', true);
        });
    });
});