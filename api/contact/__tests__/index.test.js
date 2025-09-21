import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../index.js';

// Mock dependencies
vi.mock('../../../src/lib/validation.js', () => ({
    validateContactSubmission: vi.fn()
}));

vi.mock('../emailService.js', () => ({
    sendContactEmail: vi.fn()
}));

vi.mock('../utils.js', () => ({
    applyRateLimiting: vi.fn(),
    sanitizeFormData: vi.fn(),
    createErrorResponse: vi.fn(),
    createSuccessResponse: vi.fn(),
    logRequest: vi.fn()
}));

// Import mocked modules
import { validateContactSubmission } from '../../../src/lib/validation.js';
import { sendContactEmail } from '../emailService.js';
import {
    applyRateLimiting,
    sanitizeFormData,
    createErrorResponse,
    createSuccessResponse,
    logRequest
} from '../utils.js';

describe('Contact API Handler', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Mock request object
        mockReq = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'user-agent': 'test-agent'
            },
            body: JSON.stringify({
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '+55 11 99999-9999',
                message: 'Gostaria de agendar uma consulta',
                consent: true
            })
        };

        // Mock response object
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            end: vi.fn().mockReturnThis(),
            setHeader: vi.fn().mockReturnThis()
        };

        // Default mock implementations
        sanitizeFormData.mockImplementation((data) => data);
        applyRateLimiting.mockReturnValue(null); // No rate limiting by default
        createErrorResponse.mockImplementation((code, message, field, retryAfter, validationErrors) => ({
            success: false,
            error: { code, message, field, retryAfter, validationErrors }
        }));
        createSuccessResponse.mockImplementation((message, data) => ({
            success: true,
            message,
            ...data
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('CORS and Method Handling', () => {
        it('should handle OPTIONS request correctly', async () => {
            mockReq.method = 'OPTIONS';

            await handler(mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.end).toHaveBeenCalled();
        });

        it('should reject non-POST requests', async () => {
            mockReq.method = 'GET';

            await handler(mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', 'POST, OPTIONS');
            expect(mockRes.status).toHaveBeenCalledWith(405);
            expect(logRequest).toHaveBeenCalledWith(mockReq, 'method_not_allowed', { method: 'GET' });
        });
    });

    describe('Request Body Parsing', () => {
        it('should handle valid JSON body', async () => {
            validateContactSubmission.mockReturnValue({
                success: true,
                data: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '+55 11 99999-9999',
                    message: 'Gostaria de agendar uma consulta',
                    consent: true
                }
            });

            sendContactEmail.mockResolvedValue({
                success: true,
                messageId: 'msg_123',
                contactId: 'contact_123'
            });

            await handler(mockReq, mockRes);

            expect(sanitizeFormData).toHaveBeenCalled();
            expect(validateContactSubmission).toHaveBeenCalled();
        });

        it('should handle invalid JSON body', async () => {
            mockReq.body = 'invalid json{';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(logRequest).toHaveBeenCalledWith(mockReq, 'invalid_json', expect.any(Object));
        });

        it('should handle missing body', async () => {
            mockReq.body = null;

            validateContactSubmission.mockReturnValue({
                success: false,
                errors: { name: 'Nome é obrigatório' }
            });

            await handler(mockReq, mockRes);

            expect(sanitizeFormData).toHaveBeenCalledWith({});
        });
    });

    describe('Rate Limiting', () => {
        it('should apply rate limiting and block when limit exceeded', async () => {
            applyRateLimiting.mockReturnValue({
                statusCode: 429,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'rate_limit',
                        message: 'Too many requests',
                        retryAfter: 60
                    }
                })
            });

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(logRequest).toHaveBeenCalledWith(mockReq, 'rate_limited', { type: 'rate_limit' });
        });

        it('should apply spam detection and block spam', async () => {
            applyRateLimiting.mockReturnValue({
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'spam',
                        message: 'Spam detected'
                    }
                })
            });

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(logRequest).toHaveBeenCalledWith(mockReq, 'rate_limited', { type: 'spam' });
        });
    });

    describe('Form Validation', () => {
        it('should handle validation errors', async () => {
            validateContactSubmission.mockReturnValue({
                success: false,
                errors: {
                    name: 'Nome é obrigatório',
                    email: 'Email inválido'
                }
            });

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(createErrorResponse).toHaveBeenCalledWith(
                'validation_error',
                'Form validation failed',
                null,
                null,
                {
                    name: 'Nome é obrigatório',
                    email: 'Email inválido'
                }
            );
            expect(logRequest).toHaveBeenCalledWith(mockReq, 'validation_failed', {
                errorCount: 2,
                fields: ['name', 'email']
            });
        });

        it('should pass validation with valid data', async () => {
            validateContactSubmission.mockReturnValue({
                success: true,
                data: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '+55 11 99999-9999',
                    message: 'Gostaria de agendar uma consulta',
                    consent: true
                }
            });

            sendContactEmail.mockResolvedValue({
                success: true,
                messageId: 'msg_123',
                contactId: 'contact_123'
            });

            await handler(mockReq, mockRes);

            expect(validateContactSubmission).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'João Silva',
                    email: 'joao@example.com'
                })
            );
        });
    });

    describe('Email Service Integration', () => {
        beforeEach(() => {
            validateContactSubmission.mockReturnValue({
                success: true,
                data: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '+55 11 99999-9999',
                    message: 'Gostaria de agendar uma consulta',
                    consent: true
                }
            });
        });

        it('should send email successfully', async () => {
            sendContactEmail.mockResolvedValue({
                success: true,
                messageId: 'msg_123',
                contactId: 'contact_123'
            });

            await handler(mockReq, mockRes);

            expect(sendContactEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'João Silva',
                    email: 'joao@example.com',
                    timestamp: expect.any(Date),
                    id: expect.stringMatching(/^contact_/)
                })
            );

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(createSuccessResponse).toHaveBeenCalledWith(
                'Mensagem enviada com sucesso! Entraremos em contato em breve.',
                expect.objectContaining({
                    messageId: 'msg_123'
                })
            );
        });

        it('should handle email service failure', async () => {
            sendContactEmail.mockResolvedValue({
                success: false,
                error: {
                    code: 'EMAIL_SEND_FAILED',
                    message: 'Failed to send email'
                }
            });

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(createErrorResponse).toHaveBeenCalledWith(
                'EMAIL_SEND_FAILED',
                'Failed to send email'
            );
            expect(logRequest).toHaveBeenCalledWith(mockReq, 'email_failed', expect.any(Object));
        });

        it('should handle email service exception', async () => {
            sendContactEmail.mockRejectedValue(new Error('Network error'));

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(logRequest).toHaveBeenCalledWith(mockReq, 'unexpected_error', expect.any(Object));
        });
    });

    describe('Logging and Monitoring', () => {
        beforeEach(() => {
            validateContactSubmission.mockReturnValue({
                success: true,
                data: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '+55 11 99999-9999',
                    message: 'Gostaria de agendar uma consulta',
                    consent: true
                }
            });

            sendContactEmail.mockResolvedValue({
                success: true,
                messageId: 'msg_123',
                contactId: 'contact_123'
            });
        });

        it('should log successful submission without PII', async () => {
            await handler(mockReq, mockRes);

            expect(logRequest).toHaveBeenCalledWith(mockReq, 'contact_submitted', {
                contactId: expect.stringMatching(/^contact_/),
                messageId: 'msg_123',
                processingTime: expect.stringMatching(/^\d+ms$/)
            });
        });

        it('should generate unique contact IDs', async () => {
            await handler(mockReq, mockRes);
            await handler(mockReq, mockRes);

            const calls = sendContactEmail.mock.calls;
            expect(calls[0][0].id).not.toBe(calls[1][0].id);
            expect(calls[0][0].id).toMatch(/^contact_/);
            expect(calls[1][0].id).toMatch(/^contact_/);
        });
    });

    describe('Error Handling', () => {
        it('should handle unexpected errors gracefully', async () => {
            // Force an unexpected error
            sanitizeFormData.mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(createErrorResponse).toHaveBeenCalledWith(
                'internal_server_error',
                'An unexpected error occurred. Please try again.'
            );
            expect(logRequest).toHaveBeenCalledWith(mockReq, 'unexpected_error', expect.any(Object));
        });
    });

    describe('Performance Requirements', () => {
        it('should track processing time', async () => {
            validateContactSubmission.mockReturnValue({
                success: true,
                data: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '+55 11 99999-9999',
                    message: 'Gostaria de agendar uma consulta',
                    consent: true
                }
            });

            sendContactEmail.mockResolvedValue({
                success: true,
                messageId: 'msg_123'
            });

            await handler(mockReq, mockRes);

            expect(logRequest).toHaveBeenCalledWith(mockReq, 'contact_submitted',
                expect.objectContaining({
                    processingTime: expect.stringMatching(/^\d+ms$/)
                })
            );
        });
    });
});