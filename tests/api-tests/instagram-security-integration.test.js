import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createServer } from 'http';
import { parse } from 'url';

// Import the actual API handlers
import postsHandler from '../instagram/posts.js';
import statsHandler from '../instagram/stats.js';

// Mock the Instagram security service
const mockInstagramSecurityService = {
    checkRateLimit: vi.fn(),
    checkWebSocketRateLimit: vi.fn(),
    validateAndSanitize: vi.fn(),
    filterContent: vi.fn(),
    generateApiToken: vi.fn(),
    validateApiToken: vi.fn(),
    getClientIP: vi.fn(),
    getSecurityMetrics: vi.fn()
};

vi.mock('../../src/services/instagramSecurityService.js', () => ({
    default: mockInstagramSecurityService
}));

// Mock environment variables
process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token';

describe('Instagram Security Integration Tests', () => {
    let server;
    let baseUrl;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock responses
        mockInstagramSecurityService.checkRateLimit.mockReturnValue({
            allowed: true,
            remaining: 29,
            resetTime: Date.now() + 60000,
            retryAfter: 0
        });

        mockInstagramSecurityService.validateAndSanitize.mockReturnValue({
            valid: true,
            errors: [],
            sanitized: {}
        });

        mockInstagramSecurityService.getClientIP.mockReturnValue('127.0.0.1');
        mockInstagramSecurityService.filterContent.mockReturnValue({
            allowed: true,
            score: 0,
            issues: []
        });

        // Create test server
        server = createServer((req, res) => {
            const parsedUrl = parse(req.url, true);
            req.query = parsedUrl.query;
            req.path = parsedUrl.pathname;

            // Add required headers
            req.headers = req.headers || {};
            req.headers['content-type'] = 'application/json';

            if (req.url.startsWith('/api/instagram/posts')) {
                postsHandler(req, res);
            } else if (req.url.startsWith('/api/instagram/stats')) {
                statsHandler(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        });

        return new Promise((resolve) => {
            server.listen(0, () => {
                const port = server.address().port;
                baseUrl = `http://localhost:${port}`;
                resolve();
            });
        });
    });

    afterEach(() => {
        return new Promise((resolve) => {
            server.close(() => {
                vi.restoreAllMocks();
                resolve();
            });
        });
    });

    const makeRequest = async (path, options = {}) => {
        const url = `${baseUrl}${path}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json().catch(() => ({}));
        return {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            data
        };
    };

    describe('Posts Endpoint Security Integration', () => {
        it('should apply rate limiting to posts endpoint', async () => {
            const response = await makeRequest('/api/instagram/posts?limit=5');

            expect(response.status).toBe(200);
            expect(response.headers).toHaveProperty('x-ratelimit-limit');
            expect(response.headers).toHaveProperty('x-ratelimit-remaining');
            expect(response.headers).toHaveProperty('x-ratelimit-reset');

            expect(mockInstagramSecurityService.checkRateLimit).toHaveBeenCalledWith(
                expect.objectContaining({
                    path: '/api/instagram/posts',
                    query: { limit: '5' }
                }),
                '/api/instagram/posts'
            );
        });

        it('should block requests that exceed rate limit', async () => {
            mockInstagramSecurityService.checkRateLimit.mockReturnValue({
                allowed: false,
                remaining: 0,
                resetTime: Date.now() + 60000,
                retryAfter: 30
            });

            const response = await makeRequest('/api/instagram/posts');

            expect(response.status).toBe(429);
            expect(response.data).toEqual({
                success: false,
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please try again later.',
                retryAfter: 30
            });
        });

        it('should validate and sanitize input parameters', async () => {
            const response = await makeRequest('/api/instagram/posts?limit=invalid');

            expect(mockInstagramSecurityService.validateAndSanitize).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 'invalid'
                }),
                expect.any(Object)
            );
        });

        it('should filter response content', async () => {
            // Mock the API to return some data
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    data: [
                        {
                            id: '1',
                            caption: 'Test caption',
                            media_type: 'IMAGE',
                            media_url: 'https://example.com/image.jpg',
                            permalink: 'https://instagram.com/p/1/',
                            timestamp: '2023-01-01T00:00:00Z',
                            username: 'testuser'
                        }
                    ]
                })
            });

            const response = await makeRequest('/api/instagram/posts');

            // The filter should be called when processing the response
            expect(mockInstagramSecurityService.filterContent).toHaveBeenCalled();

            global.fetch = originalFetch;
        });

        it('should include security headers', async () => {
            const response = await makeRequest('/api/instagram/posts');

            expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
            expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
            expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
            expect(response.headers).toHaveProperty('strict-transport-security');
            expect(response.headers).toHaveProperty('content-security-policy');
            expect(response.headers).toHaveProperty('referrer-policy');
            expect(response.headers).toHaveProperty('permissions-policy');
        });

        it('should handle authentication for protected paths', async () => {
            // Test with a path that requires authentication
            const response = await makeRequest('/api/instagram/posts');

            // Since posts endpoint doesn't require authentication by default,
            // this should succeed without a token
            expect(response.status).toBe(200);
        });
    });

    describe('Stats Endpoint Security Integration', () => {
        it('should apply rate limiting to stats endpoint', async () => {
            const response = await makeRequest('/api/instagram/stats?postId=123');

            expect(response.status).toBe(200);
            expect(response.headers).toHaveProperty('x-ratelimit-limit');
            expect(response.headers).toHaveProperty('x-ratelimit-remaining');

            expect(mockInstagramSecurityService.checkRateLimit).toHaveBeenCalledWith(
                expect.objectContaining({
                    path: '/api/instagram/stats',
                    query: { postId: '123' }
                }),
                '/api/instagram/stats'
            );
        });

        it('should validate POST request body for bulk stats', async () => {
            const requestBody = {
                postIds: ['123', '456', '789'],
                includeInsights: true
            };

            const response = await makeRequest('/api/instagram/stats', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            expect(mockInstagramSecurityService.validateAndSanitize).toHaveBeenCalledWith(
                requestBody,
                expect.any(Object)
            );
        });

        it('should reject invalid POST request bodies', async () => {
            mockInstagramSecurityService.validateAndSanitize.mockReturnValue({
                valid: false,
                errors: ['Invalid postIds format'],
                sanitized: {}
            });

            const requestBody = {
                postIds: 'invalid', // Should be an array
                includeInsights: true
            };

            const response = await makeRequest('/api/instagram/stats', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            expect(response.status).toBe(400);
            expect(response.data).toEqual({
                success: false,
                error: 'Validation failed',
                message: 'Invalid input data',
                errors: ['Invalid postIds format']
            });
        });

        it('should filter stats response content', async () => {
            // Mock the API to return stats data
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    like_count: 100,
                    comments_count: 10,
                    timestamp: '2023-01-01T00:00:00Z'
                })
            });

            const response = await makeRequest('/api/instagram/stats?postId=123');

            expect(mockInstagramSecurityService.filterContent).toHaveBeenCalled();

            global.fetch = originalFetch;
        });

        it('should handle different HTTP methods correctly', async () => {
            // Test GET method
            const getResponse = await makeRequest('/api/instagram/stats?postId=123');
            expect(getResponse.status).toBe(200);

            // Test POST method
            const postResponse = await makeRequest('/api/instagram/stats', {
                method: 'POST',
                body: JSON.stringify({
                    postIds: ['123'],
                    includeInsights: false
                })
            });
            expect(postResponse.status).toBe(200);

            // Test invalid method
            const putResponse = await makeRequest('/api/instagram/stats', {
                method: 'PUT'
            });
            expect(putResponse.status).toBe(405);
        });
    });

    describe('Cross-Endpoint Security Consistency', () => {
        it('should apply consistent rate limiting across endpoints', async () => {
            // Test posts endpoint
            await makeRequest('/api/instagram/posts');
            const postsRateLimitCall = mockInstagramSecurityService.checkRateLimit.mock.calls.find(
                call => call[1] === '/api/instagram/posts'
            );

            // Test stats endpoint
            await makeRequest('/api/instagram/stats?postId=123');
            const statsRateLimitCall = mockInstagramSecurityService.checkRateLimit.mock.calls.find(
                call => call[1] === '/api/instagram/stats'
            );

            expect(postsRateLimitCall).toBeDefined();
            expect(statsRateLimitCall).toBeDefined();
            expect(postsRateLimitCall[0]).not.toBe(statsRateLimitCall[0]);
        });

        it('should apply consistent security headers across endpoints', async () => {
            const postsResponse = await makeRequest('/api/instagram/posts');
            const statsResponse = await makeRequest('/api/instagram/stats?postId=123');

            // Both should have the same security headers
            const securityHeaders = [
                'x-content-type-options',
                'x-frame-options',
                'x-xss-protection',
                'strict-transport-security',
                'content-security-policy',
                'referrer-policy',
                'permissions-policy'
            ];

            securityHeaders.forEach(header => {
                expect(postsResponse.headers).toHaveProperty(header);
                expect(statsResponse.headers).toHaveProperty(header);
                expect(postsResponse.headers[header]).toBe(statsResponse.headers[header]);
            });
        });

        it('should apply consistent input validation across endpoints', async () => {
            // Test posts endpoint with invalid input
            await makeRequest('/api/instagram/posts?limit=invalid');
            const postsValidationCall = mockInstagramSecurityService.validateAndSanitize.mock.calls.find(
                call => call[0].limit === 'invalid'
            );

            // Test stats endpoint with invalid input
            await makeRequest('/api/instagram/stats?postId=invalid');
            const statsValidationCall = mockInstagramSecurityService.validateAndSanitize.mock.calls.find(
                call => call[0].postId === 'invalid'
            );

            expect(postsValidationCall).toBeDefined();
            expect(statsValidationCall).toBeDefined();
        });
    });

    describe('Error Handling and Resilience', () => {
        it('should handle security service failures gracefully', async () => {
            // Simulate security service failure
            mockInstagramSecurityService.checkRateLimit.mockImplementation(() => {
                throw new Error('Security service unavailable');
            });

            const response = await makeRequest('/api/instagram/posts');

            // The endpoint should still respond, possibly with degraded security
            expect(response.status).toBe(200);
        });

        it('should continue processing when content filtering fails', async () => {
            mockInstagramSecurityService.filterContent.mockImplementation(() => {
                throw new Error('Content filtering failed');
            });

            // Mock the API to return data
            const originalFetch = global.fetch;
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    data: [
                        {
                            id: '1',
                            caption: 'Test caption',
                            media_type: 'IMAGE',
                            media_url: 'https://example.com/image.jpg',
                            permalink: 'https://instagram.com/p/1/',
                            timestamp: '2023-01-01T00:00:00Z',
                            username: 'testuser'
                        }
                    ]
                })
            });

            const response = await makeRequest('/api/instagram/posts');

            // Should still return data despite filtering failure
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('success', true);

            global.fetch = originalFetch;
        });

        it('should handle malformed input safely', async () => {
            const response = await makeRequest('/api/instagram/posts?limit=<script>alert("xss")</script>');

            expect(mockInstagramSecurityService.validateAndSanitize).toHaveBeenCalled();
            // The input should be sanitized before reaching the business logic
        });

        it('should maintain security under high load', async () => {
            // Simulate high load by making many requests
            const requests = [];
            for (let i = 0; i < 10; i++) {
                requests.push(makeRequest('/api/instagram/posts?limit=5'));
            }

            const responses = await Promise.all(requests);

            // All requests should be handled securely
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.headers).toHaveProperty('x-ratelimit-limit');
                expect(response.headers).toHaveProperty('x-content-type-options');
            });

            // Rate limiting should have been applied
            expect(mockInstagramSecurityService.checkRateLimit).toHaveBeenCalledTimes(10);
        });
    });

    describe('Security Metrics and Monitoring', () => {
        it('should track security metrics across endpoints', async () => {
            // Make requests to different endpoints
            await makeRequest('/api/instagram/posts');
            await makeRequest('/api/instagram/stats?postId=123');

            // Security metrics should be collected
            expect(mockInstagramSecurityService.getSecurityMetrics).toHaveBeenCalled();
        });

        it('should log security events appropriately', async () => {
            // Test rate limit exceeded logging
            mockInstagramSecurityService.checkRateLimit.mockReturnValue({
                allowed: false,
                remaining: 0,
                resetTime: Date.now() + 60000,
                retryAfter: 30
            });

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            await makeRequest('/api/instagram/posts');

            // Security event should be logged
            expect(consoleSpy).toHaveBeenCalledWith(
                'Security Event:',
                expect.objectContaining({
                    statusCode: 429,
                    rateLimited: true
                })
            );

            consoleSpy.mockRestore();
        });
    });

    describe('CORS and Security Headers Integration', () => {
        it('should include proper CORS headers', async () => {
            const response = await makeRequest('/api/instagram/posts');

            expect(response.headers).toHaveProperty('access-control-allow-credentials', 'true');
            expect(response.headers).toHaveProperty('access-control-allow-origin');
            expect(response.headers).toHaveProperty('access-control-allow-methods');
            expect(response.headers).toHaveProperty('access-control-allow-headers');
        });

        it('should handle OPTIONS preflight requests', async () => {
            const response = await makeRequest('/api/instagram/posts', {
                method: 'OPTIONS'
            });

            expect(response.status).toBe(200);
            expect(response.headers).toHaveProperty('access-control-allow-methods');
        });
    });
});
