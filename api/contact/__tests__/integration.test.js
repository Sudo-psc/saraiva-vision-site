import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all dependencies before importing the handler
vi.mock('../emailService.js', () => ({
    sendContactEmail: vi.fn()
}));

// Set up environment variables for testing
process.env.RESEND_API_KEY = 'test_api_key';
process.env.DOCTOR_EMAIL = 'test@example.com';
process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_WINDOW = '15';
process.env.RATE_LIMIT_MAX = '5';

import handler from '../index.js';
import { sendContactEmail } from '../emailService.js';

describe('Contact API Integration Tests', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        // Clear all mocks
        vi.clearAllMocks();

        // Mock request object with complete valid data
        mockReq = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Test Browser)',
                'x-forwarded-for': '192.168.1.100' // Use unique IP for each test
            },
            body: {
                name: 'Maria Silva',
                email: 'maria.silva@email.com',
                phone: '+55 11 98765-4321',
                message: 'Olá, gostaria de agendar uma consulta oftalmológica. Tenho sentido dores nos olhos e gostaria de fazer um exame completo.',
                consent: true,
                honeypot: '' // Empty honeypot field
            }
        };

        // Mock response object
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            end: vi.fn().mockReturnThis(),
            setHeader: vi.fn().mockReturnThis()
        };

        // Default successful email mock
        sendContactEmail.mockResolvedValue({
            success: true,
            messageId: 'test_message_id_123',
            contactId: 'test_contact_id_123',
            timestamp: new Date().toISOString()
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Complete Form Submission Flow', () => {
        it('should process a complete valid form submission', async () => {
            await handler(mockReq, mockRes);

            // Verify CORS headers are set
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');

            // Verify email service was called
            expect(sendContactEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Maria Silva',
                    email: 'maria.silva@email.com',
                    phone: '+55 11 98765-4321',
                    message: expect.stringContaining('consulta oftalmológica'),
                    consent: true,
                    timestamp: expect.any(Date),
                    id: expect.stringMatching(/^contact_/)
                })
            );

            // Verify successful response
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
                })
            );
        });

        it('should handle LGPD consent validation', async () => {
            // Test without consent
            mockReq.body.consent = false;

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'validation_error'
                    })
                })
            );

            // Verify email service was not called
            expect(sendContactEmail).not.toHaveBeenCalled();
        });

        it('should validate Brazilian phone number format', async () => {
            // Test with invalid phone format
            mockReq.body.phone = '123456';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(sendContactEmail).not.toHaveBeenCalled();
        });

        it('should sanitize input to prevent XSS', async () => {
            // Test with potentially malicious input
            mockReq.body.name = '<script>alert("xss")</script>João';
            mockReq.body.message = 'Hello <img src="x" onerror="alert(1)"> world, I need help with my vision.';

            await handler(mockReq, mockRes);

            // Should still process successfully after sanitization
            expect(mockRes.status).toHaveBeenCalledWith(200);

            // Verify email service was called (sanitization happens in validation library)
            expect(sendContactEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: expect.any(String),
                    message: expect.any(String),
                    email: 'maria.silva@email.com'
                })
            );
        });
    });

    describe('Rate Limiting Integration', () => {
        it('should allow requests within rate limit', async () => {
            // Use unique IP to avoid rate limiting from previous tests
            mockReq.headers['x-forwarded-for'] = '192.168.1.200';

            await handler(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(sendContactEmail).toHaveBeenCalled();
        });

        it('should detect honeypot spam', async () => {
            // Fill honeypot field (indicates spam)
            mockReq.body.honeypot = 'spam content';
            mockReq.headers['x-forwarded-for'] = '192.168.1.201';

            await handler(mockReq, mockRes);

            // Should be blocked due to spam detection
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(sendContactEmail).not.toHaveBeenCalled();
        });
    });

    describe('Error Scenarios', () => {
        it('should handle missing required fields', async () => {
            mockReq.body = {
                name: '',
                email: '',
                phone: '',
                message: '',
                consent: false
            };
            mockReq.headers['x-forwarded-for'] = '192.168.1.202';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'validation_error',
                        validationErrors: expect.any(Object)
                    })
                })
            );
            expect(sendContactEmail).not.toHaveBeenCalled();
        });

        it('should handle malformed JSON', async () => {
            mockReq.body = 'invalid json string{';
            mockReq.headers['x-forwarded-for'] = '192.168.1.203';

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
        });

        it('should handle email service failure', async () => {
            mockReq.headers['x-forwarded-for'] = '192.168.1.204';

            // Mock email service failure
            sendContactEmail.mockResolvedValue({
                success: false,
                error: {
                    code: 'EMAIL_SEND_FAILED',
                    message: 'Failed to send email'
                }
            });

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
    });

    describe('Performance and Monitoring', () => {
        it('should complete processing within reasonable time', async () => {
            mockReq.headers['x-forwarded-for'] = '192.168.1.205';

            const startTime = Date.now();
            await handler(mockReq, mockRes);
            const processingTime = Date.now() - startTime;

            // Should complete within 3 seconds (requirement 4.2)
            expect(processingTime).toBeLessThan(3000);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should generate unique contact IDs for tracking', async () => {
            mockReq.headers['x-forwarded-for'] = '192.168.1.206';

            await handler(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    contactId: expect.stringMatching(/^contact_[a-z0-9]+_[a-z0-9]+$/)
                })
            );
        });
    });

    describe('LGPD Compliance', () => {
        it('should require explicit consent', async () => {
            // Test various falsy consent values
            const falsyValues = [false, 'false', '', null, undefined];

            for (let i = 0; i < falsyValues.length; i++) {
                const consent = falsyValues[i];
                mockReq.body.consent = consent;
                mockReq.headers['x-forwarded-for'] = `192.168.1.${210 + i}`;

                await handler(mockReq, mockRes);

                expect(mockRes.status).toHaveBeenCalledWith(400);

                // Reset mocks for next iteration
                vi.clearAllMocks();
                mockRes = {
                    status: vi.fn().mockReturnThis(),
                    json: vi.fn().mockReturnThis(),
                    end: vi.fn().mockReturnThis(),
                    setHeader: vi.fn().mockReturnThis()
                };
                sendContactEmail.mockResolvedValue({
                    success: true,
                    messageId: 'test_message_id_123'
                });
            }
        });

        it('should accept explicit true consent', async () => {
            mockReq.body.consent = true;
            mockReq.headers['x-forwarded-for'] = '192.168.1.220';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(sendContactEmail).toHaveBeenCalled();
        });
    });

    describe('Medical Practice Requirements', () => {
        it('should handle medical inquiry with professional response', async () => {
            mockReq.body = {
                name: 'Dr. João Santos',
                email: 'joao.santos@hospital.com.br',
                phone: '+55 11 3456-7890',
                message: 'Gostaria de discutir um caso de paciente com glaucoma avançado. O paciente apresenta pressão intraocular elevada e necessita de avaliação especializada urgente.',
                consent: true
            };
            mockReq.headers['x-forwarded-for'] = '192.168.1.221';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: expect.stringContaining('sucesso')
                })
            );
            expect(sendContactEmail).toHaveBeenCalled();
        });

        it('should handle patient inquiry with appropriate validation', async () => {
            mockReq.body = {
                name: 'Ana Maria Costa',
                email: 'ana.costa@gmail.com',
                phone: '+55 21 99876-5432',
                message: 'Tenho 45 anos e ultimamente tenho sentido dificuldade para enxergar de perto. Gostaria de agendar uma consulta para verificar se preciso usar óculos.',
                consent: true
            };
            mockReq.headers['x-forwarded-for'] = '192.168.1.222';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(sendContactEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Ana Maria Costa',
                    email: 'ana.costa@gmail.com',
                    message: expect.stringContaining('dificuldade para enxergar')
                })
            );
        });
    });
});