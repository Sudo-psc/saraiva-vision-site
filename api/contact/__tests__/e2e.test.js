import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all external dependencies
vi.mock('resend', () => ({
    Resend: vi.fn().mockImplementation(() => ({
        emails: {
            send: vi.fn()
        }
    }))
}));

// Set up environment variables for testing
process.env.RESEND_API_KEY = 'test_api_key';
process.env.DOCTOR_EMAIL = 'philipe_cruz@outlook.com';
process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_WINDOW = '15';
process.env.RATE_LIMIT_MAX = '5';

import handler from '../index.js';
import { Resend } from 'resend';

/**
 * End-to-End Tests for Contact Form Submission Workflow
 * 
 * These tests verify the complete form submission workflow from request
 * to email delivery, covering all requirements and edge cases.
 * 
 * Requirements covered:
 * - 1.2: Form validation and processing within 3 seconds
 * - 2.5: Email delivery reliability and formatting
 * - 3.1: Rate limiting and spam protection
 * - 4.4: Serverless function performance and logging
 */

describe('Contact Form E2E Workflow', () => {
    let mockReq, mockRes, mockResendSend;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Resend email service
        mockResendSend = vi.fn();
        Resend.mockImplementation(() => ({
            emails: {
                send: mockResendSend
            }
        }));

        // Standard valid request
        mockReq = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Test Browser)',
                'x-forwarded-for': '203.0.113.100',
                'referer': 'https://saraivavision.com.br/contato'
            },
            body: JSON.stringify({
                name: 'Maria Santos Silva',
                email: 'maria.santos@email.com.br',
                phone: '+55 11 98765-4321',
                message: 'Olá Dr. Philipe, gostaria de agendar uma consulta oftalmológica. Tenho sentido dores nos olhos e visão embaçada nos últimos dias. Poderia me orientar sobre os procedimentos?',
                consent: true,
                honeypot: ''
            })
        };

        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            end: vi.fn().mockReturnThis(),
            setHeader: vi.fn().mockReturnThis()
        };

        // Default successful email response
        mockResendSend.mockResolvedValue({
            data: { id: 'email_123456789' },
            error: null
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Complete Successful Workflow', () => {
        it('should process complete form submission from start to finish', async () => {
            const startTime = Date.now();

            await handler(mockReq, mockRes);

            const processingTime = Date.now() - startTime;

            // Verify performance requirement (Requirement 1.2)
            expect(processingTime).toBeLessThan(3000);

            // Verify CORS headers are set
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            // Verify rate limiting headers
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(String));
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(String));

            // Verify email was sent (Requirement 2.5)
            expect(mockResendSend).toHaveBeenCalledTimes(1);

            const emailCall = mockResendSend.mock.calls[0][0];
            expect(emailCall).toMatchObject({
                from: 'Saraiva Vision <contato@saraivavision.com.br>',
                to: ['philipe_cruz@outlook.com'],
                replyTo: 'maria.santos@email.com.br',
                subject: 'Novo contato do site - Maria Santos Silva'
            });

            // Verify email content includes patient information
            expect(emailCall.html).toContain('Maria Santos Silva');
            expect(emailCall.html).toContain('maria.santos@email.com.br');
            expect(emailCall.html).toContain('(11) 98765-4321');
            expect(emailCall.html).toContain('consulta oftalmológica');
            expect(emailCall.html).toContain('LGPD');

            // Verify text version exists
            expect(emailCall.text).toContain('Maria Santos Silva');
            expect(emailCall.text).toContain('consulta oftalmológica');

            // Verify professional headers
            expect(emailCall.headers).toMatchObject({
                'X-Mailer': 'SaraivaVision-ContactForm',
                'X-Priority': '1',
                'X-Contact-ID': expect.stringMatching(/^contact_/)
            });

            // Verify successful response
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
                    messageId: 'email_123456789',
                    contactId: expect.stringMatching(/^contact_/)
                })
            );
        });

        it('should handle medical professional inquiry with appropriate formatting', async () => {
            mockReq.body = JSON.stringify({
                name: 'Dr. João Oliveira',
                email: 'joao.oliveira@hospital.com.br',
                phone: '+55 11 3456-7890',
                message: 'Prezado colega, tenho um paciente de 65 anos com glaucoma avançado que necessita de avaliação especializada urgente. O paciente apresenta pressão intraocular de 35mmHg e campo visual comprometido. Gostaria de discutir o caso e possível encaminhamento.',
                consent: true,
                honeypot: ''
            });

            mockReq.headers['x-forwarded-for'] = '203.0.113.101';

            await handler(mockReq, mockRes);

            // Verify email formatting for medical professional
            const emailCall = mockResendSend.mock.calls[0][0];
            expect(emailCall.subject).toBe('Novo contato do site - Dr. João Oliveira');
            expect(emailCall.html).toContain('Dr. João Oliveira');
            expect(emailCall.html).toContain('glaucoma avançado');
            expect(emailCall.html).toContain('(11) 3456-7890'); // Landline formatting
            expect(emailCall.replyTo).toBe('joao.oliveira@hospital.com.br');

            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should handle patient inquiry with proper data sanitization', async () => {
            mockReq.body = JSON.stringify({
                name: 'Ana <script>alert("xss")</script> Costa',
                email: '  ANA.COSTA@GMAIL.COM  ',
                phone: '  (21) 99876-5432  ',
                message: 'Tenho 45 anos e ultimamente tenho sentido dificuldade para enxergar de perto. <img src="x" onerror="alert(1)"> Gostaria de agendar uma consulta para verificar se preciso usar óculos.',
                consent: true,
                honeypot: ''
            });

            mockReq.headers['x-forwarded-for'] = '203.0.113.102';

            await handler(mockReq, mockRes);

            // Verify data was sanitized
            const emailCall = mockResendSend.mock.calls[0][0];
            expect(emailCall.html).not.toContain('<script>');
            expect(emailCall.html).not.toContain('<img');
            expect(emailCall.html).toContain('Ana Costa');
            expect(emailCall.replyTo).toBe('ana.costa@gmail.com'); // Normalized email
            expect(emailCall.html).toContain('(21) 99876-5432'); // Formatted phone

            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('LGPD Compliance Workflow (Requirement 5.1-5.4)', () => {
        it('should enforce LGPD consent requirement', async () => {
            mockReq.body = JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                phone: '+55 11 99999-9999',
                message: 'Test message with sufficient length for validation requirements.',
                consent: false // No consent given
            });

            mockReq.headers['x-forwarded-for'] = '203.0.113.103';

            await handler(mockReq, mockRes);

            // Should reject without consent
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'validation_error',
                        validationErrors: expect.objectContaining({
                            consent: expect.stringContaining('LGPD')
                        })
                    })
                })
            );

            // Email should not be sent
            expect(mockResendSend).not.toHaveBeenCalled();
        });

        it('should include LGPD compliance notice in email', async () => {
            await handler(mockReq, mockRes);

            const emailCall = mockResendSend.mock.calls[0][0];

            // Verify LGPD notice in both HTML and text versions
            expect(emailCall.html).toContain('LGPD');
            expect(emailCall.html).toContain('consentimento explícito');
            expect(emailCall.text).toContain('LGPD');
            expect(emailCall.text).toContain('consentimento explícito');
        });

        it('should handle data minimization principles', async () => {
            // Add extra fields that should be filtered out
            const bodyWithExtraFields = JSON.parse(mockReq.body);
            bodyWithExtraFields.extraField = 'should be removed';
            bodyWithExtraFields.socialSecurity = '123-45-6789';
            bodyWithExtraFields.creditCard = '4111-1111-1111-1111';

            mockReq.body = JSON.stringify(bodyWithExtraFields);
            mockReq.headers['x-forwarded-for'] = '203.0.113.104';

            await handler(mockReq, mockRes);

            // Verify only necessary data is processed
            const emailCall = mockResendSend.mock.calls[0][0];
            expect(emailCall.html).not.toContain('extraField');
            expect(emailCall.html).not.toContain('socialSecurity');
            expect(emailCall.html).not.toContain('creditCard');
            expect(emailCall.html).not.toContain('123-45-6789');
            expect(emailCall.html).not.toContain('4111-1111-1111-1111');

            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Rate Limiting and Spam Protection (Requirement 3.1, 3.3)', () => {
        it('should detect and block honeypot spam', async () => {
            mockReq.body = JSON.stringify({
                name: 'Spam Bot',
                email: 'spam@example.com',
                phone: '+55 11 99999-9999',
                message: 'This is a spam message with sufficient length.',
                consent: true,
                honeypot: 'filled by bot' // Honeypot filled = spam
            });

            mockReq.headers['x-forwarded-for'] = '203.0.113.105';

            await handler(mockReq, mockRes);

            // Should be blocked as spam
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'spam'
                    })
                })
            );

            // Email should not be sent
            expect(mockResendSend).not.toHaveBeenCalled();
        });

        it('should enforce rate limiting after multiple requests', async () => {
            const sameIP = '203.0.113.106';

            // Make requests up to the limit (5 requests)
            for (let i = 0; i < 5; i++) {
                mockReq.headers['x-forwarded-for'] = sameIP;
                mockReq.body = JSON.stringify({
                    name: `User ${i}`,
                    email: `user${i}@example.com`,
                    phone: '+55 11 99999-9999',
                    message: `Message ${i} with sufficient length for validation.`,
                    consent: true,
                    honeypot: ''
                });

                await handler(mockReq, mockRes);
                expect(mockRes.status).toHaveBeenCalledWith(200);

                // Reset mocks for next iteration
                vi.clearAllMocks();
                mockRes = {
                    status: vi.fn().mockReturnThis(),
                    json: vi.fn().mockReturnThis(),
                    end: vi.fn().mockReturnThis(),
                    setHeader: vi.fn().mockReturnThis()
                };
                mockResendSend.mockResolvedValue({
                    data: { id: `email_${i}` },
                    error: null
                });
            }

            // 6th request should be rate limited
            mockReq.headers['x-forwarded-for'] = sameIP;
            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'rate_limit',
                        retryAfter: expect.any(Number)
                    })
                })
            );
        });

        it('should detect suspicious content patterns', async () => {
            mockReq.body = JSON.stringify({
                name: 'Suspicious User',
                email: 'suspicious@example.com',
                phone: '+55 11 99999-9999',
                message: 'Buy viagra now! Click here for free money! http://spam1.com http://spam2.com http://spam3.com',
                consent: true,
                honeypot: ''
            });

            mockReq.headers['x-forwarded-for'] = '203.0.113.107';

            await handler(mockReq, mockRes);

            // Should be blocked due to suspicious content
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockResendSend).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling and Recovery', () => {
        it('should handle email service failures gracefully', async () => {
            // Mock email service failure
            mockResendSend.mockResolvedValue({
                data: null,
                error: { message: 'Invalid API key' }
            });

            mockReq.headers['x-forwarded-for'] = '203.0.113.108';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'EMAIL_SEND_FAILED'
                    })
                })
            );
        });

        it('should handle network errors with retry mechanism', async () => {
            // Mock network failures followed by success
            mockResendSend
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    data: { id: 'email_retry_success' },
                    error: null
                });

            mockReq.headers['x-forwarded-for'] = '203.0.113.109';

            const startTime = Date.now();
            await handler(mockReq, mockRes);
            const processingTime = Date.now() - startTime;

            // Should eventually succeed after retries
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockResendSend).toHaveBeenCalledTimes(3); // 2 failures + 1 success

            // Should still meet performance requirement despite retries
            expect(processingTime).toBeLessThan(3000);
        });

        it('should handle malformed request data', async () => {
            mockReq.body = 'invalid json {';
            mockReq.headers['x-forwarded-for'] = '203.0.113.110';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'invalid_json'
                    })
                })
            );

            expect(mockResendSend).not.toHaveBeenCalled();
        });
    });

    describe('Logging and Monitoring (Requirement 4.4)', () => {
        it('should log successful submissions without PII', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            await handler(mockReq, mockRes);

            // Verify logging occurred
            expect(consoleSpy).toHaveBeenCalled();

            const logCalls = consoleSpy.mock.calls;
            const contactLog = logCalls.find(call =>
                call[0].includes('contact_submitted')
            );

            expect(contactLog).toBeDefined();

            if (contactLog) {
                const logData = JSON.parse(contactLog[0].replace('Contact API: ', ''));

                // Verify log contains required fields
                expect(logData).toMatchObject({
                    action: 'contact_submitted',
                    contactId: expect.stringMatching(/^contact_/),
                    messageId: 'email_123456789',
                    processingTime: expect.stringMatching(/^\d+ms$/),
                    timestamp: expect.any(String),
                    userAgent: 'Mozilla/5.0 (Test Browser)',
                    referer: 'https://saraivavision.com.br/contato'
                });

                // Verify no PII in logs
                expect(JSON.stringify(logData)).not.toContain('maria.santos@email.com.br');
                expect(JSON.stringify(logData)).not.toContain('Maria Santos Silva');
                expect(JSON.stringify(logData)).not.toContain('98765-4321');
            }

            consoleSpy.mockRestore();
        });

        it('should log validation errors with field information', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            mockReq.body = JSON.stringify({
                name: '',
                email: 'invalid-email',
                phone: '123',
                message: 'Hi',
                consent: false
            });

            mockReq.headers['x-forwarded-for'] = '203.0.113.111';

            await handler(mockReq, mockRes);

            const logCalls = consoleSpy.mock.calls;
            const validationLog = logCalls.find(call =>
                call[0].includes('validation_failed')
            );

            expect(validationLog).toBeDefined();

            if (validationLog) {
                const logData = JSON.parse(validationLog[0].replace('Contact API: ', ''));
                expect(logData.errorCount).toBeGreaterThan(0);
                expect(logData.fields).toBeInstanceOf(Array);
            }

            consoleSpy.mockRestore();
        });

        it('should generate unique contact IDs for tracking', async () => {
            const contactIds = new Set();

            // Generate multiple requests
            for (let i = 0; i < 10; i++) {
                mockReq.headers['x-forwarded-for'] = `203.0.113.${120 + i}`;

                await handler(mockReq, mockRes);

                // Extract contact ID from response
                const responseCall = mockRes.json.mock.calls[0];
                if (responseCall && responseCall[0] && responseCall[0].contactId) {
                    contactIds.add(responseCall[0].contactId);
                }

                // Reset mocks
                vi.clearAllMocks();
                mockRes = {
                    status: vi.fn().mockReturnThis(),
                    json: vi.fn().mockReturnThis(),
                    end: vi.fn().mockReturnThis(),
                    setHeader: vi.fn().mockReturnThis()
                };
                mockResendSend.mockResolvedValue({
                    data: { id: `email_${i}` },
                    error: null
                });
            }

            // All contact IDs should be unique
            expect(contactIds.size).toBe(10);

            // Verify ID format
            contactIds.forEach(id => {
                expect(id).toMatch(/^contact_[a-z0-9]+_[a-z0-9]+$/);
            });
        });
    });

    describe('Accessibility and User Experience', () => {
        it('should provide user-friendly error messages', async () => {
            mockReq.body = JSON.stringify({
                name: 'A', // Too short
                email: 'invalid-email',
                phone: '123', // Invalid format
                message: 'Hi', // Too short
                consent: false
            });

            mockReq.headers['x-forwarded-for'] = '203.0.113.130';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);

            const response = mockRes.json.mock.calls[0][0];
            expect(response.error.validationErrors).toBeDefined();

            // Verify Portuguese error messages
            const errors = response.error.validationErrors;
            expect(errors.name).toContain('caracteres');
            expect(errors.email).toContain('email');
            expect(errors.phone).toContain('telefone');
            expect(errors.message).toContain('caracteres');
            expect(errors.consent).toContain('LGPD');
        });

        it('should handle OPTIONS request for CORS preflight', async () => {
            mockReq.method = 'OPTIONS';

            await handler(mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.end).toHaveBeenCalled();
        });
    });
});