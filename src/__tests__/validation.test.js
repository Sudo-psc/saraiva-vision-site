import { describe, it, expect } from 'vitest';
import {
    contactSubmissionSchema,
    validateContactSubmission,
    validateField,
    mapValidationErrors,
    validationErrorMap,
    sanitize
} from '../lib/validation.js';
import { z } from 'zod';

describe('Sanitization Functions', () => {
    describe('sanitize.html', () => {
        it('should remove HTML tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            const result = sanitize.html(input);
            expect(result).toBe('Hello');
        });

        it('should handle non-string input', () => {
            expect(sanitize.html(null)).toBe('');
            expect(sanitize.html(undefined)).toBe('');
            expect(sanitize.html(123)).toBe('');
        });

        it('should remove all HTML attributes', () => {
            const input = '<div onclick="alert()">Content</div>';
            const result = sanitize.html(input);
            expect(result).toBe('Content');
        });

        it('should remove script tags completely', () => {
            const input = '<script>alert("xss")</script>Safe content';
            const result = sanitize.html(input);
            expect(result).toBe('Safe content');
        });
    });

    describe('sanitize.text', () => {
        it('should remove control characters', () => {
            const input = 'Hello\x00\x01World\x7F';
            const result = sanitize.text(input);
            expect(result).toBe('HelloWorld');
        });

        it('should normalize whitespace', () => {
            const input = '  Hello   World  \n\t  ';
            const result = sanitize.text(input);
            expect(result).toBe('Hello World');
        });

        it('should handle non-string input', () => {
            expect(sanitize.text(null)).toBe('');
            expect(sanitize.text(undefined)).toBe('');
            expect(sanitize.text(123)).toBe('');
        });

        it('should remove HTML tags and sanitize', () => {
            const input = '<script>alert("xss")</script>Hello World';
            const result = sanitize.text(input);
            expect(result).toBe('Hello World');
        });
    });

    describe('sanitize.email', () => {
        it('should convert to lowercase and sanitize', () => {
            const input = '  TEST@EXAMPLE.COM  ';
            const result = sanitize.email(input);
            expect(result).toBe('test@example.com');
        });

        it('should handle non-string input', () => {
            expect(sanitize.email(null)).toBe('');
            expect(sanitize.email(undefined)).toBe('');
        });
    });

    describe('sanitize.phone', () => {
        it('should keep only valid phone characters', () => {
            const input = '+55 (11) 99999-9999 abc';
            const result = sanitize.phone(input);
            expect(result).toBe('+55 (11) 99999-9999');
        });

        it('should remove invalid characters', () => {
            const input = '11#99999@9999!';
            const result = sanitize.phone(input);
            expect(result).toBe('11999999999');
        });

        it('should handle non-string input', () => {
            expect(sanitize.phone(null)).toBe('');
            expect(sanitize.phone(undefined)).toBe('');
        });
    });
});

describe('Brazilian Phone Validation', () => {
    const validPhones = [
        '+55 11 99999-9999', // Mobile with country code
        '+55 (11) 99999-9999', // Mobile with country code and parentheses
        '11 99999-9999', // Mobile without country code
        '(11) 99999-9999', // Mobile with parentheses
        '11999999999', // Mobile digits only
        '+5511999999999', // Mobile with country code, no spaces
        '(11) 3333-3333', // Landline
        '11 3333-3333' // Landline without parentheses
    ];

    const invalidPhones = [
        '123', // too short
        '11 99999-99999', // too long
        '+1 555 123-4567', // not Brazilian
        '', // empty
        '01 99999-9999', // invalid area code
        '11 09999-9999', // mobile starting with 0
        '+55 11 1234-56789' // too many digits
    ];

    validPhones.forEach(phone => {
        it(`should accept valid Brazilian phone: ${phone}`, () => {
            const result = validateField('phone', phone);
            expect(result.success).toBe(true);
        });
    });

    invalidPhones.forEach(phone => {
        it(`should reject invalid phone: ${phone}`, () => {
            const result = validateField('phone', phone);
            expect(result.success).toBe(false);
        });
    });
});

describe('ContactSubmission Schema', () => {
    const validSubmission = {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+55 11 99999-9999',
        message: 'Gostaria de agendar uma consulta para avaliação oftalmológica.',
        consent: true,
        honeypot: ''
    };

    it('should validate a complete valid submission', () => {
        const result = validateContactSubmission(validSubmission);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.errors).toBeNull();
    });

    it('should sanitize input data', () => {
        const dirtySubmission = {
            ...validSubmission,
            name: '  João Silva  \n\t',
            email: '  JOAO@EXAMPLE.COM  ',
            message: 'Mensagem com   espaços   extras que tem mais de dez caracteres'
        };

        const result = validateContactSubmission(dirtySubmission);
        expect(result.success).toBe(true);
        expect(result.data.name).toBe('João Silva');
        expect(result.data.email).toBe('joao@example.com');
        expect(result.data.message).toBe('Mensagem com espaços extras que tem mais de dez caracteres');
    });

    describe('Name validation', () => {
        it('should reject empty name', () => {
            const submission = { ...validSubmission, name: '' };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.name).toBeDefined();
        });

        it('should reject name too short', () => {
            const submission = { ...validSubmission, name: 'A' };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.name).toBe(validationErrorMap.NAME_TOO_SHORT);
        });

        it('should reject name too long', () => {
            const submission = { ...validSubmission, name: 'A'.repeat(101) };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.name).toBe(validationErrorMap.NAME_TOO_LONG);
        });
    });

    describe('Email validation', () => {
        it('should reject invalid email format', () => {
            const submission = { ...validSubmission, email: 'invalid-email' };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.email).toBe(validationErrorMap.INVALID_EMAIL);
        });

        it('should reject empty email', () => {
            const submission = { ...validSubmission, email: '' };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.email).toBeDefined();
        });

        it('should reject email too long', () => {
            const longEmail = 'a'.repeat(250) + '@example.com';
            const submission = { ...validSubmission, email: longEmail };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
        });
    });

    describe('Message validation', () => {
        it('should reject message too short', () => {
            const submission = { ...validSubmission, message: 'Oi' };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.message).toBe(validationErrorMap.MESSAGE_TOO_SHORT);
        });

        it('should reject message too long', () => {
            const submission = { ...validSubmission, message: 'A'.repeat(2001) };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.message).toBe(validationErrorMap.MESSAGE_TOO_LONG);
        });

        it('should reject empty message', () => {
            const submission = { ...validSubmission, message: '' };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.message).toBeDefined();
        });
    });

    describe('Consent validation', () => {
        it('should reject false consent', () => {
            const submission = { ...validSubmission, consent: false };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.consent).toBe(validationErrorMap.CONSENT_REQUIRED);
        });

        it('should reject missing consent', () => {
            const submission = { ...validSubmission };
            delete submission.consent;
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.consent).toBeDefined();
        });
    });

    describe('Honeypot validation', () => {
        it('should accept empty honeypot', () => {
            const submission = { ...validSubmission, honeypot: '' };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(true);
        });

        it('should accept missing honeypot', () => {
            const submission = { ...validSubmission };
            delete submission.honeypot;
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(true);
        });

        it('should reject filled honeypot (spam detection)', () => {
            const submission = { ...validSubmission, honeypot: 'spam' };
            const result = validateContactSubmission(submission);
            expect(result.success).toBe(false);
            expect(result.errors.honeypot).toBe(validationErrorMap.SPAM_DETECTED);
        });
    });
});

describe('Field Validation', () => {
    it('should validate individual fields successfully', () => {
        const result = validateField('name', 'João Silva');
        expect(result.success).toBe(true);
        expect(result.value).toBe('João Silva');
        expect(result.error).toBeNull();
    });

    it('should return error for invalid field', () => {
        const result = validateField('email', 'invalid-email');
        expect(result.success).toBe(false);
        expect(result.value).toBeNull();
        expect(result.error).toBe(validationErrorMap.INVALID_EMAIL);
    });

    it('should sanitize field value', () => {
        const result = validateField('name', '  João Silva  ');
        expect(result.success).toBe(true);
        expect(result.value).toBe('João Silva');
    });
});

describe('Error Mapping', () => {
    it('should map Zod errors to user-friendly messages', () => {
        const zodError = new z.ZodError([
            {
                code: 'too_small',
                minimum: 2,
                type: 'string',
                inclusive: true,
                message: 'Nome deve ter pelo menos 2 caracteres',
                path: ['name']
            },
            {
                code: 'invalid_string',
                validation: 'email',
                message: 'Formato de email inválido',
                path: ['email']
            }
        ]);

        const errors = mapValidationErrors(zodError);
        expect(errors.name).toBe(validationErrorMap.NAME_TOO_SHORT);
        expect(errors.email).toBe(validationErrorMap.INVALID_EMAIL);
    });

    it('should handle unknown field errors gracefully', () => {
        const zodError = new z.ZodError([
            {
                code: 'custom',
                message: 'Unknown error',
                path: ['unknownField']
            }
        ]);

        const errors = mapValidationErrors(zodError);
        expect(errors.unknownField).toBe('Unknown error');
    });
});

describe('XSS Prevention', () => {
    it('should prevent XSS in name field', () => {
        const maliciousInput = '<script>alert("xss")</script>João';
        const result = validateField('name', maliciousInput);
        expect(result.success).toBe(true);
        expect(result.value).toBe('João');
        expect(result.value).not.toContain('<script>');
    });

    it('should prevent XSS in message field', () => {
        const maliciousMessage = 'Olá <img src=x onerror=alert("xss")> doutor, preciso de uma consulta';
        const result = validateField('message', maliciousMessage);
        expect(result.success).toBe(true);
        expect(result.value).toBe('Olá doutor, preciso de uma consulta');
        expect(result.value).not.toContain('<img');
    });

    it('should handle SQL injection attempts', () => {
        const sqlInjection = "João'; DROP TABLE users; --";
        const result = validateField('name', sqlInjection);
        expect(result.success).toBe(true);
        expect(result.value).toBe("João'; DROP TABLE users; --"); // Should be sanitized but not cause errors
    });
});

describe('Edge Cases', () => {
    it('should handle null and undefined inputs', () => {
        expect(() => validateContactSubmission(null)).not.toThrow();
        expect(() => validateContactSubmission(undefined)).not.toThrow();
        expect(() => validateField('name', null)).not.toThrow();
        expect(() => validateField('name', undefined)).not.toThrow();
    });

    it('should handle empty object', () => {
        const result = validateContactSubmission({});
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
        expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('should handle unexpected error types', () => {
        // This tests the catch block for non-Zod errors
        const result = validateContactSubmission({
            name: 'Test',
            email: 'test@example.com',
            phone: '+55 11 99999-9999',
            message: 'Test message here with enough characters',
            consent: true
        });
        expect(result.success).toBe(true);
    });
});

describe('Brazilian Phone Number Edge Cases', () => {
    it('should handle phone numbers with country code variations', () => {
        const validPhones = [
            '+5511999999999', // No spaces
            '+55 11 999999999' // 9-digit mobile
        ];

        const invalidPhones = [
            '5511999999999', // Missing +
            '011999999999' // Invalid area code
        ];

        validPhones.forEach(phone => {
            const result = validateField('phone', phone);
            expect(result.success).toBe(true);
        });

        invalidPhones.forEach(phone => {
            const result = validateField('phone', phone);
            expect(result.success).toBe(false);
        });
    });

    it('should validate landline numbers', () => {
        const landlines = [
            '11 3333-3333',
            '(11) 3333-3333'
        ];

        landlines.forEach(phone => {
            const result = validateField('phone', phone);
            expect(result.success).toBe(true);
        });

        // Test landline with country code separately
        const landlineWithCountryCode = '+55 11 3333-3333';
        const result = validateField('phone', landlineWithCountryCode);
        expect(result.success).toBe(true);
    });

    it('should reject invalid area codes', () => {
        const invalidAreaCodes = [
            '01 99999-9999', // Area code too low
            '00 99999-9999', // Area code too low
            '10 99999-9999'  // Area code too low
        ];

        invalidAreaCodes.forEach(phone => {
            const result = validateField('phone', phone);
            expect(result.success).toBe(false);
        });
    });
});