import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies for performance testing
vi.mock('../emailService.js', () => ({
    sendContactEmail: vi.fn()
}));

// Set up environment variables for testing
process.env.RESEND_API_KEY = 'test_api_key';
process.env.DOCTOR_EMAIL = 'test@example.com';
process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_WINDOW = '15';
process.env.RATE_LIMIT_MAX = '100'; // Higher limit for performance tests

import handler from '../index.js';
import { sendContactEmail } from '../emailService.js';

/**
 * Performance Tests for Contact API
 * 
 * These tests verify that the contact API meets the <3 second response time requirement
 * specified in requirement 4.2. They test both individual request performance and
 * concurrent request handling.
 * 
 * For comprehensive load testing, use external tools:
 * 
 * Using k6:
 * 1. Install k6: https://k6.io/docs/getting-started/installation/
 * 2. Save the k6 script below as `k6-contact-test.js`
 * 3. Run: k6 run k6-contact-test.js
 * 
 * Example k6 script (k6-contact-test.js):
 * 
 * import http from 'k6/http';
 * import { check, sleep } from 'k6';
 * 
 * export const options = {
 *   stages: [
 *     { duration: '30s', target: 10 },  // Ramp up to 10 users over 30 seconds
 *     { duration: '1m', target: 10 },   // Stay at 10 users for 1 minute
 *     { duration: '30s', target: 0 },   // Ramp down to 0 users
 *   ],
 *   thresholds: {
 *     http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
 *     http_req_failed: ['rate<0.01'],    // Less than 1% of requests can fail
 *   },
 * };
 * 
 * const BASE_URL = 'http://localhost:3000'; // Or your Vercel preview URL
 * 
 * export default function () {
 *   const payload = JSON.stringify({
 *     name: 'Performance Test User',
 *     email: 'test@example.com',
 *     phone: '+55 11 99999-9999',
 *     message: 'This is a performance test message.',
 *     consent: true,
 *     honeypot: ''
 *   });
 * 
 *   const params = {
 *     headers: {
 *       'Content-Type': 'application/json',
 *     },
 *   };
 * 
 *   const res = http.post(`${BASE_URL}/api/contact`, payload, params);
 * 
 *   check(res, {
 *     'status was 200': (r) => r.status == 200,
 *     'response time was < 3s': (r) => r.timings.duration < 3000,
 *     'response has success': (r) => JSON.parse(r.body).success === true,
 *   });
 * 
 *   sleep(1); // Wait 1 second between requests
 * }
 */

describe('Contact API Performance Tests', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock successful email service with realistic delay
        sendContactEmail.mockImplementation(async () => {
            // Simulate realistic email service delay (100-500ms)
            await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
            return {
                success: true,
                messageId: 'perf_test_' + Date.now(),
                contactId: 'contact_perf_' + Date.now()
            };
        });

        // Standard valid request
        mockReq = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'user-agent': 'Performance Test Agent',
                'x-forwarded-for': '192.168.100.' + Math.floor(Math.random() * 255) // Random IP
            },
            body: JSON.stringify({
                name: 'Performance Test User',
                email: 'perf.test@example.com',
                phone: '+55 11 99999-9999',
                message: 'This is a performance test message with sufficient length to meet validation requirements.',
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
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Response Time Requirements (Requirement 4.2)', () => {
        it('should process single request within 3 seconds', async () => {
            const startTime = Date.now();

            await handler(mockReq, mockRes);

            const processingTime = Date.now() - startTime;

            // Verify response time meets requirement
            expect(processingTime).toBeLessThan(3000);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(sendContactEmail).toHaveBeenCalled();
        }, 5000); // 5 second timeout for the test itself

        it('should handle cold start scenario within 3 seconds', async () => {
            // Simulate cold start by adding initial delay
            sendContactEmail.mockImplementationOnce(async () => {
                // Simulate cold start delay (up to 1 second)
                await new Promise(resolve => setTimeout(resolve, 1000));
                return {
                    success: true,
                    messageId: 'cold_start_test',
                    contactId: 'contact_cold_start'
                };
            });

            const startTime = Date.now();

            await handler(mockReq, mockRes);

            const processingTime = Date.now() - startTime;

            // Even with cold start, should meet requirement
            expect(processingTime).toBeLessThan(3000);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        }, 5000);

        it('should maintain performance with validation errors', async () => {
            // Test with invalid data to trigger validation
            mockReq.body = JSON.stringify({
                name: '', // Invalid
                email: 'invalid-email', // Invalid
                phone: '123', // Invalid
                message: 'Hi', // Too short
                consent: false // Invalid
            });

            const startTime = Date.now();

            await handler(mockReq, mockRes);

            const processingTime = Date.now() - startTime;

            // Validation errors should be fast
            expect(processingTime).toBeLessThan(1000);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(sendContactEmail).not.toHaveBeenCalled();
        });

        it('should handle rate limiting quickly', async () => {
            // Use same IP to trigger rate limiting after multiple requests
            const sameIP = '192.168.100.250';
            mockReq.headers['x-forwarded-for'] = sameIP;

            // Make requests up to the limit
            for (let i = 0; i < 100; i++) {
                await handler(mockReq, mockRes);
                // Reset mocks for next iteration
                vi.clearAllMocks();
                mockRes = {
                    status: vi.fn().mockReturnThis(),
                    json: vi.fn().mockReturnThis(),
                    end: vi.fn().mockReturnThis(),
                    setHeader: vi.fn().mockReturnThis()
                };
            }

            // Next request should be rate limited quickly
            const startTime = Date.now();

            await handler(mockReq, mockRes);

            const processingTime = Date.now() - startTime;

            // Rate limiting should be very fast
            expect(processingTime).toBeLessThan(100);
        });
    });

    describe('Concurrent Request Handling', () => {
        it('should handle multiple concurrent requests efficiently', async () => {
            const concurrentRequests = 10;
            const requests = [];

            // Create multiple concurrent requests with different IPs
            for (let i = 0; i < concurrentRequests; i++) {
                const req = {
                    ...mockReq,
                    headers: {
                        ...mockReq.headers,
                        'x-forwarded-for': `192.168.101.${i}`
                    }
                };

                const res = {
                    status: vi.fn().mockReturnThis(),
                    json: vi.fn().mockReturnThis(),
                    end: vi.fn().mockReturnThis(),
                    setHeader: vi.fn().mockReturnThis()
                };

                requests.push({ req, res });
            }

            const startTime = Date.now();

            // Execute all requests concurrently
            const promises = requests.map(({ req, res }) => handler(req, res));
            await Promise.all(promises);

            const totalTime = Date.now() - startTime;

            // All concurrent requests should complete within reasonable time
            // Should be faster than sequential execution due to async nature
            expect(totalTime).toBeLessThan(5000);

            // Verify all requests succeeded
            requests.forEach(({ res }) => {
                expect(res.status).toHaveBeenCalledWith(200);
            });

            expect(sendContactEmail).toHaveBeenCalledTimes(concurrentRequests);
        }, 10000);

        it('should maintain performance under mixed load (valid and invalid requests)', async () => {
            const totalRequests = 20;
            const requests = [];

            // Create mix of valid and invalid requests
            for (let i = 0; i < totalRequests; i++) {
                const isValid = i % 2 === 0;

                const req = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'user-agent': 'Mixed Load Test',
                        'x-forwarded-for': `192.168.102.${i}`
                    },
                    body: JSON.stringify(isValid ? {
                        name: `User ${i}`,
                        email: `user${i}@example.com`,
                        phone: '+55 11 99999-9999',
                        message: `Test message ${i} with sufficient length for validation.`,
                        consent: true,
                        honeypot: ''
                    } : {
                        name: '', // Invalid
                        email: 'invalid',
                        phone: '123',
                        message: 'Hi',
                        consent: false
                    })
                };

                const res = {
                    status: vi.fn().mockReturnThis(),
                    json: vi.fn().mockReturnThis(),
                    end: vi.fn().mockReturnThis(),
                    setHeader: vi.fn().mockReturnThis()
                };

                requests.push({ req, res, isValid });
            }

            const startTime = Date.now();

            // Execute all requests concurrently
            const promises = requests.map(({ req, res }) => handler(req, res));
            await Promise.all(promises);

            const totalTime = Date.now() - startTime;

            // Mixed load should complete efficiently
            expect(totalTime).toBeLessThan(8000);

            // Verify correct responses
            requests.forEach(({ res, isValid }) => {
                if (isValid) {
                    expect(res.status).toHaveBeenCalledWith(200);
                } else {
                    expect(res.status).toHaveBeenCalledWith(400);
                }
            });
        }, 15000);
    });

    describe('Memory and Resource Usage', () => {
        it('should not leak memory during repeated requests', async () => {
            const iterations = 50;

            // Measure initial memory if available
            const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

            // Execute many requests sequentially
            for (let i = 0; i < iterations; i++) {
                mockReq.headers['x-forwarded-for'] = `192.168.103.${i}`;

                await handler(mockReq, mockRes);

                // Reset mocks for next iteration
                vi.clearAllMocks();
                mockRes = {
                    status: vi.fn().mockReturnThis(),
                    json: vi.fn().mockReturnThis(),
                    end: vi.fn().mockReturnThis(),
                    setHeader: vi.fn().mockReturnThis()
                };

                sendContactEmail.mockImplementation(async () => ({
                    success: true,
                    messageId: `memory_test_${i}`,
                    contactId: `contact_memory_${i}`
                }));
            }

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = process.memoryUsage?.()?.heapUsed || 0;

            // Memory usage should not grow excessively (allow for some variance)
            if (initialMemory > 0 && finalMemory > 0) {
                const memoryGrowth = finalMemory - initialMemory;
                const maxAllowedGrowth = 50 * 1024 * 1024; // 50MB
                expect(memoryGrowth).toBeLessThan(maxAllowedGrowth);
            }

            // All requests should have been processed
            // Note: sendContactEmail is mocked and reset in each iteration, so we can't check call count
        }, 30000);
    });

    describe('Error Handling Performance', () => {
        it('should handle email service failures quickly', async () => {
            // Mock email service failure
            sendContactEmail.mockRejectedValue(new Error('Email service unavailable'));

            const startTime = Date.now();

            await handler(mockReq, mockRes);

            const processingTime = Date.now() - startTime;

            // Error handling should be fast
            expect(processingTime).toBeLessThan(2000);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });

        it('should handle malformed JSON quickly', async () => {
            mockReq.body = 'invalid json {';

            const startTime = Date.now();

            await handler(mockReq, mockRes);

            const processingTime = Date.now() - startTime;

            // JSON parsing errors should be very fast
            expect(processingTime).toBeLessThan(100);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('Performance Monitoring', () => {
        it('should track processing time in logs', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            await handler(mockReq, mockRes);

            // Verify that processing time is logged
            expect(consoleSpy).toHaveBeenCalled();

            const logCalls = consoleSpy.mock.calls;
            const contactSubmittedLog = logCalls.find(call =>
                call[0].includes('contact_submitted')
            );

            expect(contactSubmittedLog).toBeDefined();

            if (contactSubmittedLog) {
                const logData = JSON.parse(contactSubmittedLog[0].replace('Contact API: ', ''));
                expect(logData.processingTime).toMatch(/^\d+ms$/);
            }

            consoleSpy.mockRestore();
        });

        it('should generate unique identifiers efficiently', async () => {
            const iterations = 100;
            const ids = new Set();

            const startTime = Date.now();

            // Generate many requests to test ID uniqueness
            for (let i = 0; i < iterations; i++) {
                mockReq.headers['x-forwarded-for'] = `192.168.104.${i}`;

                await handler(mockReq, mockRes);

                // Extract contact ID from response (since mocks are reset)
                const responseCall = mockRes.json.mock.calls[0];
                if (responseCall && responseCall[0] && responseCall[0].contactId) {
                    ids.add(responseCall[0].contactId);
                }

                // Reset for next iteration
                vi.clearAllMocks();
                mockRes = {
                    status: vi.fn().mockReturnThis(),
                    json: vi.fn().mockReturnThis(),
                    end: vi.fn().mockReturnThis(),
                    setHeader: vi.fn().mockReturnThis()
                };

                sendContactEmail.mockImplementation(async () => ({
                    success: true,
                    messageId: `id_test_${i}`,
                    contactId: `contact_id_${i}`
                }));
            }

            const totalTime = Date.now() - startTime;

            // ID generation should be fast and unique
            expect(totalTime).toBeLessThan(10000);
            expect(ids.size).toBe(iterations); // All IDs should be unique
        }, 15000);
    });
});
