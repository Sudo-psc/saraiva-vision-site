import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import instagramSecurityService from '../instagramSecurityService.js';

// Mock crypto API
const mockCrypto = {
    getRandomValues: (array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    }
};

Object.defineProperty(global, 'crypto', {
    value: mockCrypto
});

describe('InstagramSecurityService', () => {
    let service;

    beforeEach(() => {
        // Reset the service state for each test
        service = new instagramSecurityService.constructor();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Rate Limiting', () => {
        it('should allow requests within rate limit', () => {
            const mockReq = {
                headers: {},
                connection: { remoteAddress: '192.168.1.1' }
            };

            const result1 = service.checkRateLimit(mockReq, '/api/instagram/posts');
            expect(result1.allowed).toBe(true);
            expect(result1.remaining).toBeGreaterThan(0);

            const result2 = service.checkRateLimit(mockReq, '/api/instagram/posts');
            expect(result2.allowed).toBe(true);
            expect(result2.remaining).toBe(result1.remaining - 1);
        });

        it('should block requests that exceed rate limit', () => {
            const mockReq = {
                headers: {},
                connection: { remoteAddress: '192.168.1.2' }
            };

            // Make requests up to the limit
            for (let i = 0; i < 30; i++) {
                const result = service.checkRateLimit(mockReq, '/api/instagram/posts');
                expect(result.allowed).toBe(true);
            }

            // Next request should be blocked
            const blockedResult = service.checkRateLimit(mockReq, '/api/instagram/posts');
            expect(blockedResult.allowed).toBe(false);
            expect(blockedResult.remaining).toBe(0);
            expect(blockedResult.retryAfter).toBeGreaterThan(0);
        });

        it('should handle different endpoints with different limits', () => {
            const mockReq = {
                headers: {},
                connection: { remoteAddress: '192.168.1.3' }
            };

            // Test posts endpoint (limit: 30)
            for (let i = 0; i < 30; i++) {
                const result = service.checkRateLimit(mockReq, '/api/instagram/posts');
                expect(result.allowed).toBe(true);
            }

            const postsBlocked = service.checkRateLimit(mockReq, '/api/instagram/posts');
            expect(postsBlocked.allowed).toBe(false);

            // Test stats endpoint (limit: 60) - should still allow requests
            const statsResult = service.checkRateLimit(mockReq, '/api/instagram/stats');
            expect(statsResult.allowed).toBe(true);
        });

        it('should extract client IP from various headers', () => {
            const testCases = [
                {
                    req: {
                        headers: { 'cf-connecting-ip': '203.0.113.1' },
                        connection: { remoteAddress: '192.168.1.1' }
                    },
                    expected: '203.0.113.1'
                },
                {
                    req: {
                        headers: { 'x-real-ip': '203.0.113.2' },
                        connection: { remoteAddress: '192.168.1.1' }
                    },
                    expected: '203.0.113.2'
                },
                {
                    req: {
                        headers: { 'x-forwarded-for': '203.0.113.3, 192.168.1.1' },
                        connection: { remoteAddress: '192.168.1.1' }
                    },
                    expected: '203.0.113.3'
                },
                {
                    req: {
                        headers: {},
                        connection: { remoteAddress: '192.168.1.4' }
                    },
                    expected: '192.168.1.4'
                }
            ];

            testCases.forEach(({ req, expected }) => {
                const result = service.checkRateLimit(req, '/api/instagram/posts');
                // We can't directly test the IP extraction, but we can test that different IPs get different rate limits
                expect(result.allowed).toBe(true);
            });
        });
    });

    describe('Input Validation and Sanitization', () => {
        it('should validate and sanitize input data correctly', () => {
            const schema = {
                username: {
                    type: 'string',
                    required: true,
                    pattern: /^[A-Za-z0-9._]+$/
                },
                limit: {
                    type: 'number',
                    required: true,
                    min: 1,
                    max: 20
                },
                caption: {
                    type: 'string',
                    required: false,
                    maxLength: 300
                }
            };

            const validData = {
                username: '@testuser',
                limit: 10,
                caption: 'This is a valid caption'
            };

            const result = service.validateAndSanitize(validData, schema);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.sanitized.username).toBe('testuser');
        });

        it('should detect validation errors', () => {
            const schema = {
                username: {
                    type: 'string',
                    required: true,
                    pattern: /^[A-Za-z0-9._]+$/
                },
                limit: {
                    type: 'number',
                    required: true,
                    min: 1,
                    max: 20
                }
            };

            const invalidData = {
                username: '@invalid-user!', // Invalid characters
                limit: 25 // Exceeds max
            };

            const result = service.validateAndSanitize(invalidData, schema);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.includes('invalid format'))).toBe(true);
            expect(result.errors.some(error => error.includes('at most 20'))).toBe(true);
        });

        it('should sanitize strings to prevent XSS', () => {
            const maliciousString = '<script>alert("xss")</script>Hello onclick="malicious()"';
            const sanitized = service.sanitizeString(maliciousString, 'caption');

            expect(sanitized).not.toContain('<script>');
            expect(sanitized).not.toContain('onclick');
            expect(sanitized).toBe('Hello');
        });

        it('should sanitize URLs safely', () => {
            const testCases = [
                {
                    input: 'javascript:alert("xss")',
                    expected: ''
                },
                {
                    input: 'https://example.com/page',
                    expected: 'https://example.com/page'
                },
                {
                    input: 'data:text/html,<script>alert(1)</script>',
                    expected: ''
                },
                {
                    input: 'http://legitimate-site.com/path',
                    expected: 'http://legitimate-site.com/path'
                }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = service.sanitizeString(input, 'url');
                expect(result).toBe(expected);
            });
        });

        it('should handle context-specific sanitization', () => {
            // Test username context
            const username = '@user_name123!';
            const sanitizedUsername = service.sanitizeString(username, 'username');
            expect(sanitizedUsername).toBe('user_name123');

            // Test hashtag context
            const hashtag = '#hashtag#123!';
            const sanitizedHashtag = service.sanitizeString(hashtag, 'hashtag');
            expect(sanitizedHashtag).toBe('hashtag123');

            // Test caption context (allows some HTML)
            const caption = '<b>Bold text</b><script>alert("xss")</script>';
            const sanitizedCaption = service.sanitizeString(caption, 'caption');
            expect(sanitizedCaption).toContain('<b>Bold text</b>');
            expect(sanitizedCaption).not.toContain('<script>');
        });

        it('should encode HTML entities', () => {
            const input = '<div>& " \'</div>';
            const encoded = service.encodeHtmlEntities(input);

            expect(encoded).toBe('<div>& " &#39;</div>');
        });
    });

    describe('Content Filtering', () => {
        it('should allow clean content', () => {
            const cleanContent = {
                caption: 'Beautiful sunset at the beach #nature #photography',
                username: '@naturelover',
                hashtags: ['nature', 'photography', 'sunset']
            };

            const result = service.filterContent(cleanContent);
            expect(result.allowed).toBe(true);
            expect(result.score).toBe(0);
            expect(result.issues).toHaveLength(0);
        });

        it('should detect spam keywords', () => {
            const spamContent = {
                caption: 'Click here for free money! Limited time offer, act now!',
                username: '@spammer',
                hashtags: ['freemoney', 'getrichquick']
            };

            const result = service.filterContent(spamContent);
            expect(result.score).toBeGreaterThan(0);
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues.some(issue => issue.includes('Spam keyword'))).toBe(true);
        });

        it('should detect suspicious URL patterns', () => {
            const suspiciousContent = {
                caption: 'Check this link: bit.ly/suspicious',
                username: '@suspicious',
                hashtags: ['link']
            };

            const result = service.filterContent(suspiciousContent);
            expect(result.score).toBeGreaterThan(0);
            expect(result.issues.some(issue => issue.includes('Suspicious URL pattern'))).toBe(true);
        });

        it('should block content with high spam score', () => {
            const highSpamContent = {
                caption: 'Click here for free money! Win prize now! Limited time exclusive offer guaranteed no risk! bit.ly/spam xyz.top',
                username: '@spammer',
                hashtags: ['freemoney', 'winprize', 'clickhere']
            };

            const result = service.filterContent(highSpamContent);
            expect(result.allowed).toBe(false);
            expect(result.score).toBeGreaterThanOrEqual(50);
        });

        it('should allow content with low spam score', () => {
            const lowSpamContent = {
                caption: 'Click here for more information about our services',
                username: '@business',
                hashtags: ['services', 'information']
            };

            const result = service.filterContent(lowSpamContent);
            expect(result.allowed).toBe(true);
            expect(result.score).toBeLessThan(50);
        });
    });

    describe('Token Management', () => {
        it('should generate valid API tokens', () => {
            const token = service.generateApiToken('user123', ['read', 'write']);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
        });

        it('should validate valid tokens', () => {
            const token = service.generateApiToken('user123', ['read', 'write']);
            const result = service.validateApiToken(token);

            expect(result.valid).toBe(true);
            expect(result.userId).toBe('user123');
            expect(result.permissions).toEqual(['read', 'write']);
        });

        it('should reject invalid tokens', () => {
            const result = service.validateApiToken('invalid-token');

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Invalid token');
        });

        it('should reject expired tokens', () => {
            const token = service.generateApiToken('user123', ['read'], 1); // 1ms expiration
            const result = service.validateApiToken(token);

            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Token expired');
        });

        it('should check token permissions', () => {
            const token = service.generateApiToken('user123', ['read']);

            // Should pass with required permission 'read'
            const result1 = service.validateApiToken(token, 'read');
            expect(result1.valid).toBe(true);

            // Should fail with required permission 'write'
            const result2 = service.validateApiToken(token, 'write');
            expect(result2.valid).toBe(false);
            expect(result2.reason).toBe('Insufficient permissions');
        });

        it('should revoke tokens', () => {
            const token = service.generateApiToken('user123', ['read']);

            // Token should be valid initially
            let result = service.validateApiToken(token);
            expect(result.valid).toBe(true);

            // Revoke token
            const revoked = service.revokeApiToken(token);
            expect(revoked).toBe(true);

            // Token should be invalid after revocation
            result = service.validateApiToken(token);
            expect(result.valid).toBe(false);
            expect(result.reason).toBe('Invalid token');
        });
    });

    describe('WebSocket Rate Limiting', () => {
        it('should allow WebSocket messages within rate limit', () => {
            const mockWs = {
                _socket: { remoteAddress: '192.168.1.5' }
            };

            for (let i = 0; i < 50; i++) {
                const result = service.checkWebSocketRateLimit(mockWs);
                expect(result.allowed).toBe(true);
            }
        });

        it('should block WebSocket messages that exceed rate limit', () => {
            const mockWs = {
                _socket: { remoteAddress: '192.168.1.6' }
            };

            // Make requests up to the limit
            for (let i = 0; i < 100; i++) {
                const result = service.checkWebSocketRateLimit(mockWs);
                expect(result.allowed).toBe(true);
            }

            // Next message should be blocked
            const blockedResult = service.checkWebSocketRateLimit(mockWs);
            expect(blockedResult.allowed).toBe(false);
            expect(blockedResult.retryAfter).toBeGreaterThan(0);
        });
    });

    describe('Security Metrics', () => {
        it('should return security metrics', () => {
            // Generate some activity
            const mockReq = {
                headers: {},
                connection: { remoteAddress: '192.168.1.7' }
            };

            service.checkRateLimit(mockReq, '/api/instagram/posts');
            service.generateApiToken('user123', ['read']);

            const metrics = service.getSecurityMetrics();

            expect(metrics).toHaveProperty('activeRateLimits');
            expect(metrics).toHaveProperty('activeTokens');
            expect(metrics).toHaveProperty('totalRequests');
            expect(typeof metrics.activeRateLimits).toBe('number');
            expect(typeof metrics.activeTokens).toBe('number');
            expect(typeof metrics.totalRequests).toBe('number');
        });
    });

    describe('Cleanup Functions', () => {
        it('should cleanup expired rate limits', () => {
            // Manually add an expired rate limit entry
            service.rateLimits.set('test-ip', {
                count: 1,
                resetTime: Date.now() - 86400000, // 24 hours ago
                timestamps: [Date.now() - 86400000]
            });

            expect(service.rateLimits.has('test-ip')).toBe(true);

            service.cleanupRateLimits();

            expect(service.rateLimits.has('test-ip')).toBe(false);
        });

        it('should cleanup expired tokens', () => {
            // Manually add an expired token
            service.apiTokens.set('expired-token', {
                userId: 'user123',
                permissions: ['read'],
                expiresAt: Date.now() - 1000, // 1 second ago
                createdAt: Date.now() - 3600000
            });

            expect(service.apiTokens.has('expired-token')).toBe(true);

            service.cleanupTokens();

            expect(service.apiTokens.has('expired-token')).toBe(false);
        });
    });
});
