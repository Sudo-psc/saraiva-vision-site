import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
    checkRateLimit,
    detectHoneypot,
    validateRequest,
    cleanupExpiredEntries,
    getRateLimitStats,
    hashIP,
    getClientIP
} from '../rateLimiter.js';

// Mock environment variables
vi.mock('process', () => ({
    env: {
        RATE_LIMIT_WINDOW: '15', // 15 minutes
        RATE_LIMIT_MAX: '5'      // 5 requests
    }
}));

describe('Rate Limiter', () => {
    beforeEach(() => {
        // Clear any existing rate limit entries
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('hashIP', () => {
        it('should hash IP addresses consistently', () => {
            const ip = '192.168.1.1';
            const hash1 = hashIP(ip);
            const hash2 = hashIP(ip);

            expect(hash1).toBe(hash2);
            expect(hash1).toHaveLength(64); // SHA-256 produces 64 character hex string
        });

        it('should produce different hashes for different IPs', () => {
            const ip1 = '192.168.1.1';
            const ip2 = '192.168.1.2';

            const hash1 = hashIP(ip1);
            const hash2 = hashIP(ip2);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('getClientIP', () => {
        it('should extract IP from x-forwarded-for header', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.1, 198.51.100.1'
                }
            };

            expect(getClientIP(req)).toBe('203.0.113.1');
        });

        it('should extract IP from x-real-ip header', () => {
            const req = {
                headers: {
                    'x-real-ip': '203.0.113.1'
                }
            };

            expect(getClientIP(req)).toBe('203.0.113.1');
        });

        it('should fallback to connection remoteAddress', () => {
            const req = {
                headers: {},
                connection: {
                    remoteAddress: '203.0.113.1'
                }
            };

            expect(getClientIP(req)).toBe('203.0.113.1');
        });

        it('should fallback to localhost if no IP found', () => {
            const req = {
                headers: {}
            };

            expect(getClientIP(req)).toBe('127.0.0.1');
        });
    });

    describe('checkRateLimit', () => {
        it('should allow first request from new IP', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.1'
                }
            };

            const result = checkRateLimit(req);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4); // 5 max - 1 used
            expect(result.retryAfter).toBeNull();
        });

        it('should track multiple requests from same IP', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.2'
                }
            };

            // First request
            let result = checkRateLimit(req);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4);

            // Second request
            result = checkRateLimit(req);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(3);

            // Third request
            result = checkRateLimit(req);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(2);
        });

        it('should block requests after limit exceeded', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.3'
                }
            };

            // Make 5 requests (the limit)
            for (let i = 0; i < 5; i++) {
                const result = checkRateLimit(req);
                expect(result.allowed).toBe(true);
            }

            // 6th request should be blocked
            const result = checkRateLimit(req);
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
            expect(result.retryAfter).toBeGreaterThan(0);
        });

        it('should reset window after expiration', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.4'
                }
            };

            // Mock Date.now to simulate time passage
            const originalNow = Date.now;
            let mockTime = originalNow();
            vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

            // Make 5 requests to hit the limit
            for (let i = 0; i < 5; i++) {
                checkRateLimit(req);
            }

            // Verify limit is hit
            let result = checkRateLimit(req);
            expect(result.allowed).toBe(false);

            // Advance time beyond window (15 minutes + 1 second)
            mockTime += (15 * 60 * 1000) + 1000;

            // Should allow requests again
            result = checkRateLimit(req);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4);

            Date.now.mockRestore();
        });
    });

    describe('detectHoneypot', () => {
        it('should detect filled honeypot field', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Hello',
                honeypot: 'spam content'
            };

            const result = detectHoneypot(formData);

            expect(result.isSpam).toBe(true);
            expect(result.reason).toBe('honeypot_filled');
        });

        it('should detect website field as honeypot', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Hello',
                website: 'http://spam.com'
            };

            const result = detectHoneypot(formData);

            expect(result.isSpam).toBe(true);
            expect(result.reason).toBe('honeypot_filled');
        });

        it('should allow legitimate submissions', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'I would like to schedule an appointment for an eye exam.',
                honeypot: ''
            };

            const result = detectHoneypot(formData);

            expect(result.isSpam).toBe(false);
            expect(result.reason).toBeNull();
        });

        it('should detect suspicious content patterns', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Buy viagra now! Click here for free money! http://spam1.com http://spam2.com http://spam3.com',
                honeypot: ''
            };

            const result = detectHoneypot(formData);

            expect(result.isSpam).toBe(true);
            expect(result.reason).toBe('suspicious_content');
        });

        it('should detect excessive capitalization', () => {
            const formData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'URGENT MEDICAL EMERGENCY PLEASE RESPOND IMMEDIATELY',
                honeypot: ''
            };

            const result = detectHoneypot(formData);

            expect(result.isSpam).toBe(true);
            expect(result.reason).toBe('suspicious_content');
        });
    });

    describe('validateRequest', () => {
        it('should allow valid requests', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.5'
                }
            };

            const formData = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                message: 'I need to schedule an eye appointment.',
                honeypot: ''
            };

            const result = validateRequest(req, formData);

            expect(result.allowed).toBe(true);
            expect(result.type).toBe('success');
            expect(result.headers).toHaveProperty('X-RateLimit-Limit');
            expect(result.headers).toHaveProperty('X-RateLimit-Remaining');
        });

        it('should block rate limited requests', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.6'
                }
            };

            const formData = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                message: 'Test message',
                honeypot: ''
            };

            // Exhaust rate limit
            for (let i = 0; i < 5; i++) {
                validateRequest(req, formData);
            }

            // Next request should be blocked
            const result = validateRequest(req, formData);

            expect(result.allowed).toBe(false);
            expect(result.type).toBe('rate_limit');
            expect(result.retryAfter).toBeGreaterThan(0);
            expect(result.headers).toHaveProperty('Retry-After');
        });

        it('should block spam requests', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.7'
                }
            };

            const formData = {
                name: 'Spammer',
                email: 'spam@example.com',
                message: 'Legitimate message',
                honeypot: 'filled by bot'
            };

            const result = validateRequest(req, formData);

            expect(result.allowed).toBe(false);
            expect(result.type).toBe('spam');
            expect(result.retryAfter).toBeNull();
        });
    });

    describe('getRateLimitStats', () => {
        it('should return current statistics', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.8'
                }
            };

            // Make a few requests to populate stats
            checkRateLimit(req);
            checkRateLimit(req);

            const stats = getRateLimitStats();

            expect(stats).toHaveProperty('totalEntries');
            expect(stats).toHaveProperty('activeEntries');
            expect(stats).toHaveProperty('expiredEntries');
            expect(stats).toHaveProperty('config');
            expect(stats.config.maxRequests).toBe(5);
        });
    });

    describe('cleanupExpiredEntries', () => {
        it('should remove expired entries', () => {
            const req = {
                headers: {
                    'x-forwarded-for': '203.0.113.9'
                }
            };

            // Mock Date.now to control time
            const originalNow = Date.now;
            let mockTime = originalNow();
            vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

            // Create some entries
            checkRateLimit(req);

            let stats = getRateLimitStats();
            expect(stats.totalEntries).toBeGreaterThan(0);

            // Advance time to expire entries
            mockTime += (20 * 60 * 1000); // 20 minutes

            // Cleanup should remove expired entries
            cleanupExpiredEntries();

            stats = getRateLimitStats();
            expect(stats.expiredEntries).toBe(0);

            Date.now.mockRestore();
        });
    });
});