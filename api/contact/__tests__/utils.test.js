import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    applyRateLimiting,
    addHoneypotField,
    sanitizeFormData,
    validateRequiredFields,
    createErrorResponse,
    createSuccessResponse,
    logRequest
} from '../utils.js';

// Mock the rateLimiter module
vi.mock('../rateLimiter.js', () => ({
    validateRequest: vi.fn()
}));

import { validateRequest } from '../rateLimiter.js';

describe('Contact Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('applyRateLimiting', () => {
        it('should allow valid requests and set headers', () => {
            const mockValidation = {
                allowed: true,
                type: 'success',
                message: 'Request validated successfully.',
                headers: {
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': '4',
                    'X-RateLimit-Reset': '2024-01-01T00:00:00.000Z'
                }
            };

            validateRequest.mockReturnValue(mockValidation);

            const req = { headers: { 'x-forwarded-for': '203.0.113.1' } };
            const res = {
                setHeader: vi.fn()
            };
            const formData = { name: 'John', email: 'john@example.com' };

            const result = applyRateLimiting(req, res, formData);

            expect(result).toBeNull();
            expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
            expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '4');
            expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', '2024-01-01T00:00:00.000Z');
        });

        it('should block rate limited requests with 429 status', () => {
            const mockValidation = {
                allowed: false,
                type: 'rate_limit',
                message: 'Too many requests. Please try again later.',
                retryAfter: 300,
                headers: {
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': '0',
                    'Retry-After': '300'
                }
            };

            validateRequest.mockReturnValue(mockValidation);

            const req = { headers: { 'x-forwarded-for': '203.0.113.1' } };
            const res = { setHeader: vi.fn() };
            const formData = { name: 'John', email: 'john@example.com' };

            const result = applyRateLimiting(req, res, formData);

            expect(result.statusCode).toBe(429);
            expect(JSON.parse(result.body)).toEqual({
                success: false,
                error: {
                    code: 'rate_limit',
                    message: 'Too many requests. Please try again later.',
                    retryAfter: 300
                }
            });
        });

        it('should block spam requests with 400 status', () => {
            const mockValidation = {
                allowed: false,
                type: 'spam',
                message: 'Request blocked due to spam detection.',
                retryAfter: null,
                headers: {
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': '3'
                }
            };

            validateRequest.mockReturnValue(mockValidation);

            const req = { headers: { 'x-forwarded-for': '203.0.113.1' } };
            const res = { setHeader: vi.fn() };
            const formData = { name: 'Spammer', honeypot: 'filled' };

            const result = applyRateLimiting(req, res, formData);

            expect(result.statusCode).toBe(400);
            expect(JSON.parse(result.body)).toEqual({
                success: false,
                error: {
                    code: 'spam',
                    message: 'Request blocked due to spam detection.',
                    retryAfter: null
                }
            });
        });
    });

    describe('addHoneypotField', () => {
        it('should add honeypot fields to form data', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Hello'
            };

            const result = addHoneypotField(formData);

            expect(result).toEqual({
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Hello',
                honeypot: '',
                website: '',
                url: ''
            });
        });

        it('should preserve existing honeypot fields', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                honeypot: 'existing'
            };

            const result = addHoneypotField(formData);

            expect(result.honeypot).toBe('existing');
            expect(result.website).toBe('');
            expect(result.url).toBe('');
        });
    });

    describe('sanitizeFormData', () => {
        it('should remove HTML tags from string fields', () => {
            const formData = {
                name: 'John <script>alert("xss")</script> Doe',
                email: 'john@example.com',
                message: 'Hello <b>world</b>!'
            };

            const result = sanitizeFormData(formData);

            expect(result.name).toBe('John alert(&quot;xss&quot;) Doe');
            expect(result.message).toBe('Hello world!');
            expect(result.email).toBe('john@example.com');
        });

        it('should encode special characters', () => {
            const formData = {
                name: 'John & Jane',
                message: 'Hello "world" & \'friends\' <test>'
            };

            const result = sanitizeFormData(formData);

            expect(result.name).toBe('John &amp; Jane');
            expect(result.message).toBe('Hello &quot;world&quot; &amp; &#x27;friends&#x27;');
        });

        it('should preserve non-string fields', () => {
            const formData = {
                name: 'John Doe',
                consent: true,
                age: 30
            };

            const result = sanitizeFormData(formData);

            expect(result.consent).toBe(true);
            expect(result.age).toBe(30);
        });

        it('should only include allowed fields', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                maliciousField: 'should be removed',
                anotherBadField: 'also removed'
            };

            const result = sanitizeFormData(formData);

            expect(result.name).toBe('John Doe');
            expect(result.email).toBe('john@example.com');
            expect(result.maliciousField).toBeUndefined();
            expect(result.anotherBadField).toBeUndefined();
        });
    });

    describe('validateRequiredFields', () => {
        it('should pass validation for complete form data', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+5511999999999',
                message: 'Hello world',
                consent: true
            };

            const result = validateRequiredFields(formData);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for missing required fields', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com'
                // missing phone, message, consent
            };

            const result = validateRequiredFields(formData);

            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(3);
            expect(result.errors.map(e => e.field)).toEqual(['phone', 'message', 'consent']);
        });

        it('should fail validation for empty string fields', () => {
            const formData = {
                name: '   ',
                email: '',
                phone: '+5511999999999',
                message: 'Hello',
                consent: true
            };

            const result = validateRequiredFields(formData);

            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(2);
            expect(result.errors.map(e => e.field)).toEqual(['name', 'email']);
        });

        it('should fail validation for missing consent', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+5511999999999',
                message: 'Hello',
                consent: false
            };

            const result = validateRequiredFields(formData);

            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toBe('consent');
            expect(result.errors[0].message).toBe('LGPD consent is required to process your request');
        });

        it('should accept string "true" for consent', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+5511999999999',
                message: 'Hello',
                consent: 'true'
            };

            const result = validateRequiredFields(formData);

            expect(result.valid).toBe(true);
        });
    });

    describe('createErrorResponse', () => {
        it('should create basic error response', () => {
            const result = createErrorResponse('validation_error', 'Invalid input');

            expect(result).toEqual({
                success: false,
                error: {
                    code: 'validation_error',
                    message: 'Invalid input'
                }
            });
        });

        it('should include field for validation errors', () => {
            const result = createErrorResponse('validation_error', 'Invalid email', 'email');

            expect(result).toEqual({
                success: false,
                error: {
                    code: 'validation_error',
                    message: 'Invalid email',
                    field: 'email'
                }
            });
        });

        it('should include retryAfter for rate limit errors', () => {
            const result = createErrorResponse('rate_limit', 'Too many requests', null, 300);

            expect(result).toEqual({
                success: false,
                error: {
                    code: 'rate_limit',
                    message: 'Too many requests',
                    retryAfter: 300
                }
            });
        });
    });

    describe('createSuccessResponse', () => {
        it('should create basic success response', () => {
            const result = createSuccessResponse('Email sent successfully');

            expect(result).toEqual({
                success: true,
                message: 'Email sent successfully'
            });
        });

        it('should include additional data', () => {
            const result = createSuccessResponse('Email sent successfully', {
                messageId: '12345',
                timestamp: '2024-01-01T00:00:00Z'
            });

            expect(result).toEqual({
                success: true,
                message: 'Email sent successfully',
                messageId: '12345',
                timestamp: '2024-01-01T00:00:00Z'
            });
        });
    });

    describe('logRequest', () => {
        it('should log request without PII', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const req = {
                headers: {
                    'user-agent': 'Mozilla/5.0',
                    'referer': 'https://example.com'
                }
            };

            logRequest(req, 'form_submission', { status: 'success' });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Contact API:')
            );

            const logCall = consoleSpy.mock.calls[0][0];
            const logData = JSON.parse(logCall.replace('Contact API: ', ''));

            expect(logData.action).toBe('form_submission');
            expect(logData.userAgent).toBe('Mozilla/5.0');
            expect(logData.referer).toBe('https://example.com');
            expect(logData.status).toBe('success');
            expect(logData.timestamp).toBeDefined();

            consoleSpy.mockRestore();
        });

        it('should handle missing headers gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const req = { headers: {} };

            logRequest(req, 'test_action');

            const logCall = consoleSpy.mock.calls[0][0];
            const logData = JSON.parse(logCall.replace('Contact API: ', ''));

            expect(logData.userAgent).toBe('unknown');
            expect(logData.referer).toBe('direct');

            consoleSpy.mockRestore();
        });
    });
});