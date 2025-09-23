import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    createInstagramSecurityMiddleware,
    applyWebSocketSecurity,
    generateAdminToken,
    getSecurityMetrics,
    securityConfig
} from '../instagramSecurityMiddleware.js';

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

vi.mock('../instagramSecurityService.js', () => ({
    default: mockInstagramSecurityService
}));

describe('InstagramSecurityMiddleware', () => {
    let middleware;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset security config to defaults
        securityConfig.rateLimiting.enabled = true;
        securityConfig.authentication.enabled = true;
        securityConfig.contentFiltering.enabled = true;

        // Create mock request, response, and next function
        mockReq = {
            method: 'GET',
            path: '/api/instagram/posts',
            originalUrl: '/api/instagram/posts?limit=10',
            headers: {
                'user-agent': 'test-agent',
                'x-forwarded-for': '192.168.1.1'
            },
            query: { limit: '10' },
            body: {},
            params: {},
            connection: { remoteAddress: '192.168.1.1' }
        };

        mockRes = {
            status: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
            json: vi.fn(),
            end: vi.fn()
        };

        mockNext = vi.fn();

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
            sanitized: { limit: 10 }
        });

        mockInstagramSecurityService.getClientIP.mockReturnValue('192.168.1.1');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Rate Limiting', () => {
        it('should apply rate limiting and add headers', () => {
            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            expect(mockInstagramSecurityService.checkRateLimit).toHaveBeenCalledWith(
                mockReq,
                '/api/instagram/posts'
            );

            expect(mockRes.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    'X-RateLimit-Limit': 30,
                    'X-RateLimit-Remaining': 29,
                    'X-RateLimit-Reset': expect.any(Number)
                })
            );
        });

        it('should block requests that exceed rate limit', () => {
            mockInstagramSecurityService.checkRateLimit.mockReturnValue({
                allowed: false,
                remaining: 0,
                resetTime: Date.now() + 60000,
                retryAfter: 30
            });

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please try again later.',
                retryAfter: 30
            });

            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should skip rate limiting when disabled', () => {
            securityConfig.rateLimiting.enabled = false;
            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            expect(mockInstagramSecurityService.checkRateLimit).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('Authentication', () => {
        it('should allow requests to optional paths without authentication', () => {
            mockReq.path = '/api/instagram/posts';
            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toBeNull();
        });

        it('should require authentication for protected paths', () => {
            mockReq.path = '/api/instagram/config';
            middleware = createInstagramSecurityMiddleware('/api/instagram/config');

            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Authentication required',
                message: 'Please provide a valid API token'
            });

            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should validate Bearer tokens from Authorization header', () => {
            mockReq.path = '/api/instagram/admin';
            mockReq.headers.authorization = 'Bearer valid-token';

            mockInstagramSecurityService.validateApiToken.mockReturnValue({
                valid: true,
                userId: 'user123',
                permissions: ['read', 'write']
            });

            middleware = createInstagramSecurityMiddleware('/api/instagram/admin');

            middleware(mockReq, mockRes, mockNext);

            expect(mockInstagramSecurityService.validateApiToken).toHaveBeenCalledWith(
                'valid-token',
                'read'
            );

            expect(mockReq.user).toEqual({
                id: 'user123',
                permissions: ['read', 'write']
            });

            expect(mockNext).toHaveBeenCalled();
        });

        it('should validate API keys from X-API-Key header', () => {
            mockReq.path = '/api/instagram/admin';
            mockReq.headers['x-api-key'] = 'valid-api-key';

            mockInstagramSecurityService.validateApiToken.mockReturnValue({
                valid: true,
                userId: 'user123',
                permissions: ['admin']
            });

            middleware = createInstagramSecurityMiddleware('/api/instagram/admin');

            middleware(mockReq, mockRes, mockNext);

            expect(mockInstagramSecurityService.validateApiToken).toHaveBeenCalledWith(
                'valid-api-key',
                'read'
            );

            expect(mockNext).toHaveBeenCalled();
        });

        it('should reject invalid tokens', () => {
            mockReq.path = '/api/instagram/admin';
            mockReq.headers.authorization = 'Bearer invalid-token';

            mockInstagramSecurityService.validateApiToken.mockReturnValue({
                valid: false,
                reason: 'Token expired'
            });

            middleware = createInstagramSecurityMiddleware('/api/instagram/admin');

            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid token',
                message: 'Token expired'
            });

            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should skip authentication when disabled', () => {
            securityConfig.authentication.enabled = false;
            mockReq.path = '/api/instagram/admin';
            middleware = createInstagramSecurityMiddleware('/api/instagram/admin');

            middleware(mockReq, mockRes, mockNext);

            expect(mockInstagramSecurityService.validateApiToken).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('Input Validation', () => {
        it('should validate and sanitize query parameters', () => {
            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            expect(mockInstagramSecurityService.validateAndSanitize).toHaveBeenCalledWith(
                { limit: '10' },
                expect.objectContaining({
                    query: expect.any(Object)
                })
            );

            expect(mockNext).toHaveBeenCalled();
        });

        it('should validate and sanitize request body', () => {
            mockReq.method = 'POST';
            mockReq.path = '/api/instagram/stats';
            mockReq.body = { postIds: ['id1', 'id2'] };

            middleware = createInstagramSecurityMiddleware('/api/instagram/stats');

            middleware(mockReq, mockRes, mockNext);

            expect(mockInstagramSecurityService.validateAndSanitize).toHaveBeenCalledWith(
                { postIds: ['id1', 'id2'] },
                expect.objectContaining({
                    body: expect.any(Object)
                })
            );

            expect(mockNext).toHaveBeenCalled();
        });

        it('should reject requests with validation errors', () => {
            mockInstagramSecurityService.validateAndSanitize.mockReturnValue({
                valid: false,
                errors: ['Invalid limit parameter'],
                sanitized: {}
            });

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Validation failed',
                message: 'Invalid input data',
                errors: ['Invalid limit parameter']
            });

            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should update request with sanitized data', () => {
            const sanitizedData = { limit: 10 };
            mockInstagramSecurityService.validateAndSanitize.mockReturnValue({
                valid: true,
                errors: [],
                sanitized: sanitizedData
            });

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            expect(mockReq.query).toEqual(sanitizedData);
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('Content Filtering', () => {
        it('should filter response content for enabled endpoints', () => {
            const mockJson = vi.fn();
            mockRes.json = mockJson;

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            // Simulate the response being sent
            const responseData = {
                success: true,
                data: [
                    {
                        id: '1',
                        caption: 'Test caption',
                        username: '@testuser'
                    }
                ]
            };

            mockInstagramSecurityService.filterContent.mockReturnValue({
                allowed: true,
                score: 0,
                issues: []
            });

            // Call the overridden json method
            mockRes.json(responseData);

            expect(mockInstagramSecurityService.filterContent).toHaveBeenCalledWith(
                responseData.data[0]
            );

            expect(mockJson).toHaveBeenCalledWith(responseData);
        });

        it('should block inappropriate content', () => {
            const mockJson = vi.fn();
            mockRes.json = mockJson;

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            const responseData = {
                success: true,
                data: [
                    {
                        id: '1',
                        caption: 'Spam content',
                        username: '@spammer'
                    }
                ]
            };

            mockInstagramSecurityService.filterContent.mockReturnValue({
                allowed: false,
                score: 60,
                issues: ['Spam detected']
            });

            mockRes.json(responseData);

            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: [
                    {
                        id: '1',
                        caption: '[Content filtered]',
                        media_url: null,
                        filtered: true,
                        filterReason: 'Spam detected'
                    }
                ]
            });
        });

        it('should skip content filtering when disabled', () => {
            securityConfig.contentFiltering.enabled = false;
            const mockJson = vi.fn();
            mockRes.json = mockJson;

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            const responseData = {
                success: true,
                data: [{ id: '1', caption: 'Test' }]
            };

            mockRes.json(responseData);

            expect(mockInstagramSecurityService.filterContent).not.toHaveBeenCalled();
            expect(mockJson).toHaveBeenCalledWith(responseData);
        });

        it('should not filter content for non-array responses', () => {
            const mockJson = vi.fn();
            mockRes.json = mockJson;

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            const responseData = {
                success: true,
                data: {
                    id: '1',
                    caption: 'Single post'
                }
            };

            mockInstagramSecurityService.filterContent.mockReturnValue({
                allowed: true,
                score: 0,
                issues: []
            });

            mockRes.json(responseData);

            expect(mockInstagramSecurityService.filterContent).toHaveBeenCalledWith(
                responseData.data
            );
        });
    });

    describe('Security Headers', () => {
        it('should add security headers to response', () => {
            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block',
                    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                    'Content-Security-Policy': expect.any(String),
                    'Referrer-Policy': 'strict-origin-when-cross-origin',
                    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
                })
            );
        });
    });

    describe('Security Logging', () => {
        it('should log security events', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            // Simulate response completion
            mockRes.statusCode = 200;
            mockRes.end();

            expect(consoleSpy).not.toHaveBeenCalled(); // No warning for successful requests

            // Test error logging
            mockRes.statusCode = 429;
            mockRes.end();

            expect(consoleSpy).toHaveBeenCalledWith(
                'Security Event:',
                expect.objectContaining({
                    method: 'GET',
                    url: '/api/instagram/posts?limit=10',
                    statusCode: 429,
                    rateLimited: true
                })
            );

            consoleSpy.mockRestore();
        });
    });

    describe('WebSocket Security', () => {
        let mockWs;

        beforeEach(() => {
            mockWs = {
                _socket: { remoteAddress: '192.168.1.2' },
                on: vi.fn(),
                send: vi.fn(),
                close: vi.fn()
            };

            mockInstagramSecurityService.checkWebSocketRateLimit.mockReturnValue({
                allowed: true,
                remaining: 99,
                resetTime: Date.now() + 60000,
                retryAfter: 0
            });
        });

        it('should apply WebSocket security measures', () => {
            applyWebSocketSecurity(mockWs, mockReq);

            expect(mockInstagramSecurityService.getClientIP).toHaveBeenCalledWith(mockReq);
            expect(mockWs._ip).toBe('192.168.1.1');
            expect(mockWs.on).toHaveBeenCalledWith('message', expect.any(Function));
        });

        it('should allow WebSocket messages within rate limit', () => {
            applyWebSocketSecurity(mockWs, mockReq);

            // Simulate message event
            const messageHandler = mockWs.on.mock.calls[0][1];
            messageHandler.call(mockWs, JSON.stringify({ type: 'subscribe', postIds: ['1'] }));

            expect(mockInstagramSecurityService.checkWebSocketRateLimit).toHaveBeenCalledWith(mockWs);
            expect(mockWs.send).not.toHaveBeenCalled();
            expect(mockWs.close).not.toHaveBeenCalled();
        });

        it('should block WebSocket messages that exceed rate limit', () => {
            mockInstagramSecurityService.checkWebSocketRateLimit.mockReturnValue({
                allowed: false,
                remaining: 0,
                resetTime: Date.now() + 60000,
                retryAfter: 30
            });

            applyWebSocketSecurity(mockWs, mockReq);

            // Simulate message event
            const messageHandler = mockWs.on.mock.calls[0][1];
            messageHandler.call(mockWs, JSON.stringify({ type: 'subscribe', postIds: ['1'] }));

            expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
                type: 'error',
                message: 'Rate limit exceeded',
                retryAfter: 30
            }));

            expect(mockWs.close).toHaveBeenCalledWith(1008, 'Rate limit exceeded');
        });

        it('should validate WebSocket message structure', () => {
            applyWebSocketSecurity(mockWs, mockReq);

            // Simulate message event with invalid structure
            const messageHandler = mockWs.on.mock.calls[0][1];
            messageHandler.call(mockWs, JSON.stringify({ invalid: 'message' }));

            expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        });

        it('should handle malformed JSON in WebSocket messages', () => {
            applyWebSocketSecurity(mockWs, mockReq);

            // Simulate message event with invalid JSON
            const messageHandler = mockWs.on.mock.calls[0][1];
            messageHandler.call(mockWs, 'invalid json');

            expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
                type: 'error',
                message: 'Invalid JSON format'
            }));
        });
    });

    describe('Utility Functions', () => {
        it('should generate admin tokens', () => {
            mockInstagramSecurityService.generateApiToken.mockReturnValue('admin-token-123');

            const token = generateAdminToken('admin-user', ['read', 'write', 'admin']);

            expect(mockInstagramSecurityService.generateApiToken).toHaveBeenCalledWith(
                'admin-user',
                ['read', 'write', 'admin'],
                86400000
            );

            expect(token).toBe('admin-token-123');
        });

        it('should get security metrics', () => {
            const mockMetrics = {
                activeRateLimits: 5,
                activeTokens: 3,
                totalRequests: 150
            };

            mockInstagramSecurityService.getSecurityMetrics.mockReturnValue(mockMetrics);

            const metrics = getSecurityMetrics();

            expect(mockInstagramSecurityService.getSecurityMetrics).toHaveBeenCalled();
            expect(metrics).toEqual(mockMetrics);
        });
    });

    describe('Error Handling', () => {
        it('should handle errors in security middleware gracefully', () => {
            mockInstagramSecurityService.checkRateLimit.mockImplementation(() => {
                throw new Error('Security service error');
            });

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            expect(() => {
                middleware(mockReq, mockRes, mockNext);
            }).not.toThrow();
        });

        it('should continue processing when content filtering fails', () => {
            const mockJson = vi.fn();
            mockRes.json = mockJson;

            middleware = createInstagramSecurityMiddleware('/api/instagram/posts');

            middleware(mockReq, mockRes, mockNext);

            const responseData = {
                success: true,
                data: [{ id: '1', caption: 'Test' }]
            };

            mockInstagramSecurityService.filterContent.mockImplementation(() => {
                throw new Error('Filtering error');
            });

            // Should not throw, should call original json
            expect(() => {
                mockRes.json(responseData);
            }).not.toThrow();

            expect(mockJson).toHaveBeenCalledWith(responseData);
        });
    });
});
