/**
 * Basic Security Tests
 * Simple tests to verify security middleware functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeXSS, detectSQLInjection } from '../utils/inputValidation.js';
import { isOriginAllowed } from '../utils/securityHeaders.js';
import { detectHoneypot } from '../contact/rateLimiter.js';

describe('Basic Security Functions', () => {
    describe('XSS Sanitization', () => {
        it('should remove script tags', () => {
            const malicious = '<script>alert("xss")</script>Hello';
            const sanitized = sanitizeXSS(malicious);
            expect(sanitized).not.toContain('<script');
            expect(sanitized).not.toContain('alert');
        });

        it('should preserve safe content', () => {
            const safe = 'Hello, this is a normal message';
            const sanitized = sanitizeXSS(safe);
            expect(sanitized).toBe(safe);
        });

        it('should handle empty input', () => {
            expect(sanitizeXSS('')).toBe('');
            expect(sanitizeXSS(null)).toBe('');
            expect(sanitizeXSS(undefined)).toBe('');
        });
    });

    describe('SQL Injection Detection', () => {
        it('should detect SQL injection attempts', () => {
            const sqlInjection = "'; DROP TABLE users; --";
            const result = detectSQLInjection(sqlInjection);
            expect(result.detected).toBe(true);
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should not flag safe content', () => {
            const safeContent = 'I want to select the best doctor';
            const result = detectSQLInjection(safeContent);
            expect(result.detected).toBe(false);
        });
    });

    describe('CORS Origin Validation', () => {
        it('should allow valid origins', () => {
            expect(isOriginAllowed('https://saraivavision.com.br')).toBe(true);
            expect(isOriginAllowed('https://www.saraivavision.com.br')).toBe(true);
        });

        it('should reject invalid origins', () => {
            expect(isOriginAllowed('https://malicious-site.com')).toBe(false);
            expect(isOriginAllowed('http://saraivavision.com.br')).toBe(false);
        });
    });

    describe('Honeypot Detection', () => {
        it('should detect filled honeypot fields', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                honeypot: 'spam content'
            };

            const mockReq = {
                headers: {
                    'user-agent': 'Mozilla/5.0...',
                    'accept-language': 'en-US,en;q=0.9'
                }
            };

            const result = detectHoneypot(formData, mockReq);
            expect(result.isSpam).toBe(true);
            expect(result.reason).toBe('honeypot_filled');
        });

        it('should allow legitimate submissions', () => {
            const formData = {
                name: 'Dr. Maria Silva',
                email: 'maria@hospital.com.br',
                message: 'Gostaria de agendar uma consulta',
                honeypot: ''
            };

            const mockReq = {
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8'
                }
            };

            const result = detectHoneypot(formData, mockReq);
            expect(result.isSpam).toBe(false);
        });
    });
});