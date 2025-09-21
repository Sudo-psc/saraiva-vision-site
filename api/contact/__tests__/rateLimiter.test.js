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
}); d
escribe('Advanced Rate Limiting Scenarios', () => {
    describe('IP Address Handling', () => {
        it('should handle IPv6 addresses', () => {
            const ipv6Addresses = [
                '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
                '::1',
                '2001:db8::1',
                'fe80::1%lo0'
            ];

            ipv6Addresses.forEach(ip => {
                const hash1 = hashIP(ip);
                const hash2 = hashIP(ip);

                expect(hash1).toBe(hash2); // Consistent hashing
                expect(hash1).toHaveLength(64); // SHA-256 length
            });
        });

        it('should handle malformed IP addresses gracefully', () => {
            const malformedIPs = [
                '999.999.999.999',
                '192.168.1',
                'not-an-ip',
                '',
                null,
                undefined
            ];

            malformedIPs.forEach(ip => {
                expect(() => hashIP(ip)).not.toThrow();
                const hash = hashIP(ip);
                expect(hash).toHaveLength(64);
            });
        });

        it('should extract IP from various header formats', () => {
            const headerTests = [
                {
                    headers: { 'x-forwarded-for': '203.0.113.1, 198.51.100.1, 192.168.1.1' },
                    expected: '203.0.113.1'
                },
                {
                    headers: { 'x-real-ip': '203.0.113.2' },
                    expected: '203.0.113.2'
                },
                {
                    headers: { 'cf-connecting-ip': '203.0.113.3' },
                    expected: '203.0.113.3'
                },
                {
                    headers: {},
                    connection: { remoteAddress: '203.0.113.4' },
                    expected: '203.0.113.4'
                }
            ];

            headerTests.forEach(({ headers, connection, expected }) => {
                const req = { headers, connection };
                const ip = getClientIP(req);
                expect(ip).toBe(expected || '127.0.0.1');
            });
        });
    });

    describe('Rate Limit Window Management', () => {
        it('should handle window expiration correctly', () => {
            const req = {
                headers: { 'x-forwarded-for': '203.0.113.10' }
            };

            // Mock Date.now for controlled time testing
            const originalNow = Date.now;
            let mockTime = originalNow();
            vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

            // Make requests up to limit
            for (let i = 0; i < 5; i++) {
                const result = checkRateLimit(req);
                expect(result.allowed).toBe(true);
            }

            // Next request should be blocked
            let result = checkRateLimit(req);
            expect(result.allowed).toBe(false);

            // Advance time by half window (7.5 minutes)
            mockTime += (7.5 * 60 * 1000);
            result = checkRateLimit(req);
            expect(result.allowed).toBe(false); // Still blocked

            // Advance time past full window (15+ minutes)
            mockTime += (8 * 60 * 1000);
            result = checkRateLimit(req);
            expect(result.allowed).toBe(true); // Should be allowed again

            Date.now.mockRestore();
        });

        it('should handle rapid successive requests', () => {
            const req = {
                headers: { 'x-forwarded-for': '203.0.113.11' }
            };

            // Make rapid requests
            const results = [];
            for (let i = 0; i < 10; i++) {
                results.push(checkRateLimit(req));
            }

            // First 5 should be allowed, rest blocked
            results.slice(0, 5).forEach(result => {
                expect(result.allowed).toBe(true);
            });

            results.slice(5).forEach(result => {
                expect(result.allowed).toBe(false);
            });
        });
    });

    describe('Spam Detection Patterns', () => {
        it('should detect various spam patterns', () => {
            const spamPatterns = [
                {
                    formData: {
                        name: 'Spammer',
                        email: 'spam@example.com',
                        message: 'Buy viagra now! Click here! http://spam1.com http://spam2.com http://spam3.com',
                        honeypot: ''
                    },
                    reason: 'suspicious_content'
                },
                {
                    formData: {
                        name: 'Bot User',
                        email: 'bot@example.com',
                        message: 'URGENT MEDICAL EMERGENCY PLEASE RESPOND IMMEDIATELY!!!',
                        honeypot: ''
                    },
                    reason: 'suspicious_content'
                },
                {
                    formData: {
                        name: 'Legitimate User',
                        email: 'user@example.com',
                        message: 'Normal message',
                        honeypot: 'filled by bot'
                    },
                    reason: 'honeypot_filled'
                },
                {
                    formData: {
                        name: 'Another Bot',
                        email: 'bot2@example.com',
                        message: 'Normal message',
                        website: 'http://spam.com'
                    },
                    reason: 'honeypot_filled'
                }
            ];

            spamPatterns.forEach(({ formData, reason }) => {
                const result = detectHoneypot(formData);
                expect(result.isSpam).toBe(true);
                expect(result.reason).toBe(reason);
            });
        });

        it('should allow legitimate medical inquiries', () => {
            const legitimateMessages = [
                'Gostaria de agendar uma consulta oftalmológica.',
                'Tenho sentido dores nos olhos e visão embaçada.',
                'Preciso fazer exame de fundo de olho para diabetes.',
                'Sou médico e gostaria de discutir um caso de glaucoma.',
                'Minha mãe tem catarata e precisa de cirurgia.'
            ];

            legitimateMessages.forEach(message => {
                const formData = {
                    name: 'Paciente Legítimo',
                    email: 'paciente@example.com',
                    message,
                    honeypot: ''
                };

                const result = detectHoneypot(formData);
                expect(result.isSpam).toBe(false);
                expect(result.reason).toBeNull();
            });
        });
    });

    describe('Memory Management and Cleanup', () => {
        it('should clean up expired entries automatically', () => {
            const originalNow = Date.now;
            let mockTime = originalNow();
            vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

            // Create entries that will expire
            const ips = ['203.0.113.20', '203.0.113.21', '203.0.113.22'];

            ips.forEach(ip => {
                const req = { headers: { 'x-forwarded-for': ip } };
                checkRateLimit(req);
            });

            let stats = getRateLimitStats();
            expect(stats.totalEntries).toBeGreaterThan(0);

            // Advance time to expire entries
            mockTime += (20 * 60 * 1000); // 20 minutes

            // Trigger cleanup
            cleanupExpiredEntries();

            stats = getRateLimitStats();
            expect(stats.expiredEntries).toBe(0);

            Date.now.mockRestore();
        });

        it('should handle high volume without memory leaks', () => {
            const iterations = 1000;
            const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

            // Generate many unique IPs to test memory usage
            for (let i = 0; i < iterations; i++) {
                const req = {
                    headers: { 'x-forwarded-for': `192.168.${Math.floor(i / 255)}.${i % 255}` }
                };
                checkRateLimit(req);
            }

            const finalMemory = process.memoryUsage?.()?.heapUsed || 0;

            if (initialMemory > 0 && finalMemory > 0) {
                const memoryGrowth = finalMemory - initialMemory;
                // Should not grow excessively (allow reasonable growth)
                expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB
            }
        });
    });

    describe('Concurrent Access Handling', () => {
        it('should handle concurrent requests from same IP', async () => {
            const ip = '203.0.113.30';
            const concurrentRequests = 10;

            const promises = Array.from({ length: concurrentRequests }, () => {
                return new Promise(resolve => {
                    const req = { headers: { 'x-forwarded-for': ip } };
                    const result = checkRateLimit(req);
                    resolve(result);
                });
            });

            const results = await Promise.all(promises);

            // Should handle concurrent access gracefully
            const allowedCount = results.filter(r => r.allowed).length;
            const blockedCount = results.filter(r => !r.allowed).length;

            expect(allowedCount).toBeLessThanOrEqual(5); // Rate limit
            expect(blockedCount).toBeGreaterThanOrEqual(5);
            expect(allowedCount + blockedCount).toBe(concurrentRequests);
        });

        it('should handle concurrent requests from different IPs', async () => {
            const concurrentRequests = 20;

            const promises = Array.from({ length: concurrentRequests }, (_, i) => {
                return new Promise(resolve => {
                    const req = {
                        headers: { 'x-forwarded-for': `203.0.113.${40 + i}` }
                    };
                    const result = checkRateLimit(req);
                    resolve(result);
                });
            });

            const results = await Promise.all(promises);

            // All should be allowed (different IPs)
            results.forEach(result => {
                expect(result.allowed).toBe(true);
            });
        });
    });

    describe('Configuration Edge Cases', () => {
        it('should handle missing environment variables', () => {
            const originalWindow = process.env.RATE_LIMIT_WINDOW;
            const originalMax = process.env.RATE_LIMIT_MAX;

            delete process.env.RATE_LIMIT_WINDOW;
            delete process.env.RATE_LIMIT_MAX;

            const req = { headers: { 'x-forwarded-for': '203.0.113.50' } };

            // Should use default values and not crash
            expect(() => checkRateLimit(req)).not.toThrow();

            // Restore environment
            if (originalWindow) process.env.RATE_LIMIT_WINDOW = originalWindow;
            if (originalMax) process.env.RATE_LIMIT_MAX = originalMax;
        });

        it('should handle invalid environment variable values', () => {
            const originalWindow = process.env.RATE_LIMIT_WINDOW;
            const originalMax = process.env.RATE_LIMIT_MAX;

            process.env.RATE_LIMIT_WINDOW = 'invalid';
            process.env.RATE_LIMIT_MAX = 'not-a-number';

            const req = { headers: { 'x-forwarded-for': '203.0.113.51' } };

            // Should handle gracefully with defaults
            expect(() => checkRateLimit(req)).not.toThrow();

            // Restore environment
            process.env.RATE_LIMIT_WINDOW = originalWindow;
            process.env.RATE_LIMIT_MAX = originalMax;
        });
    });

    describe('Statistics and Monitoring', () => {
        it('should provide accurate statistics', () => {
            // Clear any existing entries first
            cleanupExpiredEntries();

            const testIPs = ['203.0.113.60', '203.0.113.61', '203.0.113.62'];

            testIPs.forEach(ip => {
                const req = { headers: { 'x-forwarded-for': ip } };
                checkRateLimit(req);
            });

            const stats = getRateLimitStats();

            expect(stats.totalEntries).toBe(testIPs.length);
            expect(stats.activeEntries).toBe(testIPs.length);
            expect(stats.expiredEntries).toBe(0);
            expect(stats.config).toBeDefined();
            expect(stats.config.maxRequests).toBe(5);
            expect(stats.config.windowMinutes).toBe(15);
        });
    });
});