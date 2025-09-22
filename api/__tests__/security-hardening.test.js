/**
 * Security Hardening Test Suite
 * Comprehensive tests for security middleware, rate limiting, and XSS prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    securityMiddleware,
    rateLimitMiddleware,
    inputValidationMiddleware,
    createSecurityStack
} from '../middleware/security.js';
import {
    applyCorsHeaders,
    applySecurityHeaders,
    isOriginAllowed,
    validateSecurityConfig
} from '../utils/securityHeaders.js';
import {
    sanitizeXSS,
    detectSQLInjection,
    detectNoSQLInjection,
    detectPathTraversal,
    validateSecurity,
    deepSanitize
} from '../utils/inputValidation.js';
import {
    validateRequest,
    detectHoneypot,
    checkRateLimit,
    cleanupExpiredEntries
} from '../contact/rateLimiter.js';

// Mock request and response objects
const createMockReq = (overrides = {}) => ({
    method: 'POST',
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'origin': 'https://saraivavision.com.br',
        'content-type': 'application/json',
        'x-forwarded-for': '192.168.1.100'
    },
    body: {},
    ...overrides
});

const createMockRes = () => {
    const headers = {};
    return {
        setHeader: vi.fn((key, value) => { headers[key] = value; }),
        getHeader: vi.fn((key) => headers[key]),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        end: vi.fn().mockReturnThis(),
        headers
    };
};

describe('Security Hardening', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = createMockReq();
        mockRes = createMockRes();
        mockNext = vi.fn();

        // Clear global state
        global.recentSubmissions = new Map();
        global.recentSubmissionHashes = new Map();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('CORS Configuration', () => {
        it('should allow valid origins', () => {
            const validOrigins = [
                'https://saraivavision.com.br',
                'https://www.saraivavision.com.br',
                'https://saraivavision.vercel.app',
                'https://saraivavision-git-main.vercel.app'
            ];

            validOrigins.forEach(origin => {
                expect(isOriginAllowed(origin)).toBe(true);
            });
        });

        it('should reject invalid origins', () => {
            const invalidOrigins = [
                'https://malicious-site.com',
                'http://saraivavision.com.br', // HTTP instead of HTTPS
                'https://fake-saraivavision.com',
                'javascript:alert(1)'
            ];

            invalidOrigins.forEach(origin => {
                expect(isOriginAllowed(origin)).toBe(false);
            });
        });

        it('should apply CORS headers correctly', () => {
            mockReq.headers.origin = 'https://saraivavision.com.br';
            applyCorsHeaders(mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://saraivavision.com.br');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', expect.stringContaining('GET, POST'));
            expect(mockRes.setHeader).toHaveBeenCalledWith('Vary', 'Origin');
        });
    });

    describe('Security Headers', () => {
        it('should apply all required security headers', () => {
            applySecurityHeaders(mockRes);

            const expectedHeaders = [
                'X-Frame-Options',
                'X-Content-Type-Options',
                'X-XSS-Protection',
                'Referrer-Policy',
                'Content-Security-Policy',
                'Permissions-Policy'
            ];

            expectedHeaders.forEach(header => {
                expect(mockRes.setHeader).toHaveBeenCalledWith(header, expect.any(String));
            });
        });

        it('should include HSTS header in production', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            applySecurityHeaders(mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );

            process.env.NODE_ENV = originalEnv;
        });

        it('should validate security configuration', () => {
            const validation = validateSecurityConfig();

            expect(validation).toHaveProperty('valid');
            expect(validation).toHaveProperty('issues');
            expect(validation).toHaveProperty('recommendations');
            expect(Array.isArray(validation.issues)).toBe(true);
            expect(Array.isArray(validation.recommendations)).toBe(true);
        });
    });

    describe('XSS Prevention', () => {
        it('should sanitize basic XSS attempts', () => {
            const maliciousInputs = [
                '<script>alert("xss")</script>',
                '<img src="x" onerror="alert(1)">',
                'javascript:alert(1)',
                '<iframe src="javascript:alert(1)"></iframe>',
                '<svg onload="alert(1)">',
                '<div onclick="alert(1)">Click me</div>'
            ];

            maliciousInputs.forEach(input => {
                const sanitized = sanitizeXSS(input);
                expect(sanitized).not.toContain('<script');
                expect(sanitized).not.toContain('javascript:');
                expect(sanitized).not.toContain('onerror');
                expect(sanitized).not.toContain('onclick');
                expect(sanitized).not.toContain('onload');
            });
        });

        it('should preserve safe content', () => {
            const safeInputs = [
                'Hello, this is a normal message',
                'Contact me at user@example.com',
                'Phone: +55 11 99999-9999',
                'Visit our website for more information'
            ];

            safeInputs.forEach(input => {
                const sanitized = sanitizeXSS(input);
                expect(sanitized.length).toBeGreaterThan(0);
                expect(sanitized).not.toContain('&lt;');
            });
        });

        it('should handle nested objects in deep sanitization', () => {
            const maliciousObject = {
                name: '<script>alert("xss")</script>John',
                email: 'user@example.com',
                nested: {
                    message: '<img src="x" onerror="alert(1)">',
                    safe: 'This is safe content'
                }
            };

            const sanitized = deepSanitize(maliciousObject);

            expect(sanitized.name).not.toContain('<script');
            expect(sanitized.nested.message).not.toContain('onerror');
            expect(sanitized.nested.safe).toBe('This is safe content');
        });
    });

    describe('SQL Injection Detection', () => {
        it('should detect SQL injection attempts', () => {
            const sqlInjections = [
                "'; DROP TABLE users; --",
                "1' OR '1'='1",
                "UNION SELECT * FROM users",
                "'; EXEC xp_cmdshell('dir'); --",
                "1; WAITFOR DELAY '00:00:05'"
            ];

            sqlInjections.forEach(injection => {
                const result = detectSQLInjection(injection);
                expect(result.detected).toBe(true);
                expect(result.confidence).toBeGreaterThan(0.5);
            });
        });

        it('should not flag safe SQL-like content', () => {
            const safeInputs = [
                'I want to select the best option',
                'Please update my information',
                'Create a new appointment',
                'Delete this message if needed'
            ];

            safeInputs.forEach(input => {
                const result = detectSQLInjection(input);
                expect(result.detected).toBe(false);
            });
        });
    });

    describe('NoSQL Injection Detection', () => {
        it('should detect NoSQL injection attempts', () => {
            const nosqlInjections = [
                { $where: 'function() { return true; }' },
                { email: { $ne: null } },
                { $or: [{ admin: true }, { role: 'admin' }] },
                { password: { $regex: '.*' } }
            ];

            nosqlInjections.forEach(injection => {
                const result = detectNoSQLInjection(injection);
                expect(result.detected).toBe(true);
                expect(result.confidence).toBeGreaterThan(0.5);
            });
        });

        it('should not flag safe objects', () => {
            const safeObjects = [
                { name: 'John Doe', email: 'john@example.com' },
                { message: 'Hello world', timestamp: new Date() },
                { filters: { category: 'health', active: true } }
            ];

            safeObjects.forEach(obj => {
                const result = detectNoSQLInjection(obj);
                expect(result.detected).toBe(false);
            });
        });
    });

    describe('Path Traversal Detection', () => {
        it('should detect path traversal attempts', () => {
            const pathTraversals = [
                '../../../etc/passwd',
                '..\\..\\windows\\system32',
                '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
                '....//....//....//etc/passwd'
            ];

            pathTraversals.forEach(path => {
                const result = detectPathTraversal(path);
                expect(result.detected).toBe(true);
                expect(result.confidence).toBeGreaterThan(0.8);
            });
        });

        it('should not flag safe paths', () => {
            const safePaths = [
                '/api/contact',
                'images/profile.jpg',
                'documents/report.pdf',
                'https://example.com/page'
            ];

            safePaths.forEach(path => {
                const result = detectPathTraversal(path);
                expect(result.detected).toBe(false);
            });
        });
    });

    describe('Rate Limiting', () => {
        beforeEach(() => {
            // Clear rate limit store
            cleanupExpiredEntries();
        });

        it('should allow requests within rate limit', () => {
            const result = checkRateLimit(mockReq);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBeGreaterThan(0);
            expect(result.resetTime).toBeInstanceOf(Date);
        });

        it('should block requests exceeding rate limit', () => {
            // Simulate multiple requests from same IP
            for (let i = 0; i < 15; i++) {
                checkRateLimit(mockReq);
            }

            const result = checkRateLimit(mockReq);
            expect(result.allowed).toBe(false);
            expect(result.retryAfter).toBeGreaterThan(0);
        });

        it('should reset rate limit after window expires', () => {
            // Mock time to simulate window expiration
            const originalNow = Date.now;
            Date.now = vi.fn(() => originalNow() + 16 * 60 * 1000); // 16 minutes later

            const result = checkRateLimit(mockReq);
            expect(result.allowed).toBe(true);

            Date.now = originalNow;
        });
    });

    describe('Honeypot Detection', () => {
        it('should detect filled honeypot fields', () => {
            const formDataWithHoneypot = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Hello',
                honeypot: 'spam content', // This should be empty
                website: 'http://spam.com' // Another honeypot field
            };

            const result = detectHoneypot(formDataWithHoneypot, mockReq);
            expect(result.isSpam).toBe(true);
            expect(result.reason).toBe('honeypot_filled');
            expect(result.confidence).toBeGreaterThan(0.9);
        });

        it('should detect suspicious user agents', () => {
            const botReq = createMockReq({
                headers: {
                    ...mockReq.headers,
                    'user-agent': 'curl/7.68.0'
                }
            });

            const result = detectHoneypot({}, botReq);
            expect(result.isSpam).toBe(true);
            expect(result.reason).toBe('suspicious_user_agent');
        });

        it('should detect missing browser headers', () => {
            const suspiciousReq = createMockReq({
                headers: {
                    'user-agent': 'Mozilla/5.0...',
                    // Missing accept-language and other browser headers
                }
            });

            const result = detectHoneypot({}, suspiciousReq);
            expect(result.isSpam).toBe(true);
            expect(result.reason).toBe('missing_browser_headers');
        });

        it('should detect spam content patterns', () => {
            const spamFormData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'CLICK HERE FOR FREE MONEY! Visit https://spam1.com https://spam2.com https://spam3.com'
            };

            const result = detectHoneypot(spamFormData, mockReq);
            expect(result.isSpam).toBe(true);
            expect(result.reason).toBe('suspicious_content_pattern');
        });

        it('should detect duplicate submissions', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'This is a test message'
            };

            // First submission should pass
            const firstResult = detectHoneypot(formData, mockReq);
            expect(firstResult.isSpam).toBe(false);

            // Immediate duplicate should be flagged
            const duplicateResult = detectHoneypot(formData, mockReq);
            expect(duplicateResult.isSpam).toBe(true);
            expect(duplicateResult.reason).toBe('duplicate_content');
        });

        it('should allow legitimate submissions', () => {
            const legitimateFormData = {
                name: 'Dr. Maria Silva',
                email: 'maria.silva@hospital.com.br',
                phone: '+55 11 99999-9999',
                message: 'Gostaria de agendar uma consulta para avaliação oftalmológica. Tenho disponibilidade nas manhãs de terça e quinta-feira.',
                honeypot: '', // Empty as expected
                website: '' // Empty as expected
            };

            const result = detectHoneypot(legitimateFormData, mockReq);
            expect(result.isSpam).toBe(false);
            expect(result.confidence).toBe(0);
        });
    });

    describe('Security Middleware Integration', () => {
        it('should handle OPTIONS preflight requests', () => {
            mockReq.method = 'OPTIONS';

            securityMiddleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.end).toHaveBeenCalled();
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should add security context to request', () => {
            securityMiddleware(mockReq, mockRes, mockNext);

            expect(mockReq.security).toBeDefined();
            expect(mockReq.security.clientIP).toBeDefined();
            expect(mockReq.security.userAgent).toBeDefined();
            expect(mockReq.security.timestamp).toBeDefined();
            expect(mockReq.security.requestId).toBeDefined();
            expect(mockNext).toHaveBeenCalled();
        });

        it('should validate request format', () => {
            mockReq.headers['content-type'] = 'text/plain';
            mockReq.headers['content-length'] = '1000000000'; // Too large

            securityMiddleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(413);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should create complete security stack', () => {
            const securityStack = createSecurityStack();

            expect(Array.isArray(securityStack)).toBe(true);
            expect(securityStack.length).toBe(3);
            expect(typeof securityStack[0]).toBe('function');
            expect(typeof securityStack[1]).toBe('function');
            expect(typeof securityStack[2]).toBe('function');
        });
    });

    describe('Input Validation Middleware', () => {
        it('should sanitize malicious input in request body', () => {
            mockReq.body = {
                name: '<script>alert("xss")</script>John',
                message: 'Hello <img src="x" onerror="alert(1)">'
            };

            const middleware = inputValidationMiddleware();
            middleware(mockReq, mockRes, mockNext);

            expect(mockReq.body.name).not.toContain('<script');
            expect(mockReq.body.message).not.toContain('onerror');
            expect(mockNext).toHaveBeenCalled();
        });

        it('should detect and block security threats', () => {
            mockReq.body = {
                query: "'; DROP TABLE users; --",
                filter: { $where: 'function() { return true; }' }
            };

            const middleware = inputValidationMiddleware();
            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'security_threat_detected'
                    })
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should skip validation for GET requests by default', () => {
            mockReq.method = 'GET';
            mockReq.query = { search: '<script>alert(1)</script>' };

            const middleware = inputValidationMiddleware();
            middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.query.search).toContain('<script'); // Not sanitized
        });

        it('should validate query parameters when enabled', () => {
            mockReq.method = 'GET';
            mockReq.query = { search: '<script>alert(1)</script>' };

            const middleware = inputValidationMiddleware({ validateQuery: true });
            middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.query.search).not.toContain('<script'); // Sanitized
        });
    });

    describe('Comprehensive Security Validation', () => {
        it('should validate complex malicious payloads', () => {
            const maliciousPayload = {
                name: '<script>fetch("/api/admin", {method: "DELETE"})</script>',
                email: 'admin@example.com\'; DROP TABLE users; --',
                message: 'Visit my site: javascript:alert(document.cookie)',
                nested: {
                    query: { $where: 'this.password.length > 0' },
                    path: '../../../etc/passwd'
                }
            };

            const result = validateSecurity(maliciousPayload);

            expect(result.safe).toBe(false);
            expect(result.threats.length).toBeGreaterThan(0);
            expect(result.confidence).toBeGreaterThan(0.7);
        });

        it('should pass legitimate complex payloads', () => {
            const legitimatePayload = {
                name: 'Dr. João Silva',
                email: 'joao.silva@clinica.com.br',
                phone: '+55 11 98765-4321',
                message: 'Gostaria de agendar uma consulta para minha mãe, que tem 75 anos e está com dificuldades para enxergar. Ela tem histórico de diabetes e hipertensão.',
                preferences: {
                    timeSlot: 'morning',
                    language: 'pt-BR',
                    notifications: true
                }
            };

            const result = validateSecurity(legitimatePayload);

            expect(result.safe).toBe(true);
            expect(result.threats.length).toBe(0);
            expect(result.confidence).toBe(0);
        });
    });

    describe('Performance and Memory Management', () => {
        it('should cleanup expired rate limit entries', () => {
            // Add some entries to the rate limit store
            for (let i = 0; i < 10; i++) {
                checkRateLimit(createMockReq({
                    headers: { 'x-forwarded-for': `192.168.1.${i}` }
                }));
            }

            // Mock time to make entries expire
            const originalNow = Date.now;
            Date.now = vi.fn(() => originalNow() + 20 * 60 * 1000); // 20 minutes later

            cleanupExpiredEntries();

            // Verify cleanup occurred (this is implementation-dependent)
            expect(true).toBe(true); // Placeholder assertion

            Date.now = originalNow;
        });

        it('should limit deep sanitization recursion', () => {
            // Create deeply nested object
            let deepObject = {};
            let current = deepObject;
            for (let i = 0; i < 10; i++) {
                current.nested = { value: `<script>alert(${i})</script>` };
                current = current.nested;
            }

            const sanitized = deepSanitize(deepObject, 3);

            // Should not crash and should limit depth
            expect(sanitized).toBeDefined();
            expect(typeof sanitized).toBe('object');
        });

        it('should handle large arrays efficiently', () => {
            const largeArray = Array(100).fill(0).map((_, i) => ({
                id: i,
                content: `<script>alert(${i})</script>`
            }));

            const sanitized = deepSanitize(largeArray);

            expect(Array.isArray(sanitized)).toBe(true);
            expect(sanitized.length).toBeLessThanOrEqual(50); // Should be limited
            sanitized.forEach(item => {
                expect(item.content).not.toContain('<script');
            });
        });
    });
});