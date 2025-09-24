import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';

// Mock environment variables
process.env.INSTAGRAM_ACCESS_TOKEN = 'mock_access_token';

// Mock fetch globally
global.fetch = vi.fn();

describe('Enhanced Instagram API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset cache between tests
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('/api/instagram/posts with statistics', () => {
        it('should fetch posts with engagement statistics', async () => {
            // Mock Instagram API responses
            const mockPostsResponse = {
                data: [
                    {
                        id: 'post_1',
                        caption: 'Test post 1',
                        media_type: 'IMAGE',
                        media_url: 'https://example.com/image1.jpg',
                        permalink: 'https://instagram.com/p/post1',
                        timestamp: '2024-01-01T00:00:00Z',
                        username: 'testuser'
                    }
                ]
            };

            const mockStatsResponse = {
                like_count: 45,
                comments_count: 8,
                timestamp: '2024-01-01T00:00:00Z'
            };

            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockPostsResponse)
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockStatsResponse)
                });

            // Import handler after mocking
            const { default: handler } = await import('../instagram/posts.js');

            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    limit: '1',
                    includeStats: 'true'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
            expect(data.data[0]).toHaveProperty('stats');
            expect(data.data[0].stats).toMatchObject({
                likes: 45,
                comments: 8,
                engagement_rate: expect.any(Number)
            });
            expect(data.stats_included).toBe(true);
        });

        it('should fetch posts without statistics when disabled', async () => {
            const mockPostsResponse = {
                data: [
                    {
                        id: 'post_1',
                        caption: 'Test post 1',
                        media_type: 'IMAGE',
                        media_url: 'https://example.com/image1.jpg',
                        permalink: 'https://instagram.com/p/post1',
                        timestamp: '2024-01-01T00:00:00Z',
                        username: 'testuser'
                    }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockPostsResponse)
            });

            const { default: handler } = await import('../instagram/posts.js');

            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    limit: '1',
                    includeStats: 'false'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
            expect(data.data[0]).not.toHaveProperty('stats');
            expect(data.stats_included).toBe(false);
        });

        it('should handle statistics fetch errors gracefully', async () => {
            const mockPostsResponse = {
                data: [
                    {
                        id: 'post_1',
                        caption: 'Test post 1',
                        media_type: 'IMAGE',
                        media_url: 'https://example.com/image1.jpg',
                        permalink: 'https://instagram.com/p/post1',
                        timestamp: '2024-01-01T00:00:00Z',
                        username: 'testuser'
                    }
                ]
            };

            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockPostsResponse)
                })
                .mockResolvedValueOnce({
                    ok: false,
                    json: () => Promise.resolve({ error: { message: 'Stats not available' } })
                });

            const { default: handler } = await import('../instagram/posts.js');

            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    limit: '1',
                    includeStats: 'true'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(1);
            expect(data.data[0]).toHaveProperty('stats');
            expect(data.data[0].stats).toMatchObject({
                likes: 0,
                comments: 0,
                engagement_rate: 0,
                error: 'Stats unavailable'
            });
        });
    });

    describe('/api/instagram/stats', () => {
        it('should fetch single post statistics', async () => {
            const mockStatsResponse = {
                like_count: 45,
                comments_count: 8,
                timestamp: '2024-01-01T00:00:00Z'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockStatsResponse)
            });

            const { default: handler } = await import('../instagram/stats.js');

            const { req, res } = createMocks({
                method: 'GET',
                query: {
                    postId: 'post_123'
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data).toMatchObject({
                postId: 'post_123',
                likes: 45,
                comments: 8,
                engagement_rate: expect.any(Number)
            });
        });

        it('should fetch bulk post statistics', async () => {
            const mockStatsResponse1 = {
                like_count: 45,
                comments_count: 8,
                timestamp: '2024-01-01T00:00:00Z'
            };

            const mockStatsResponse2 = {
                like_count: 32,
                comments_count: 5,
                timestamp: '2024-01-01T00:00:00Z'
            };

            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockStatsResponse1)
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockStatsResponse2)
                });

            const { default: handler } = await import('../instagram/stats.js');

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    postIds: ['post_1', 'post_2']
                }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            expect(data.success).toBe(true);
            expect(data.data).toHaveLength(2);
            expect(data.data[0]).toMatchObject({
                postId: 'post_1',
                stats: expect.objectContaining({
                    likes: 45,
                    comments: 8
                })
            });
            expect(data.data[1]).toMatchObject({
                postId: 'post_2',
                stats: expect.objectContaining({
                    likes: 32,
                    comments: 5
                })
            });
        });

        it('should return cached statistics when available', async () => {
            const mockStatsResponse = {
                like_count: 45,
                comments_count: 8,
                timestamp: '2024-01-01T00:00:00Z'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockStatsResponse)
            });

            const { default: handler } = await import('../instagram/stats.js');

            // First request - should fetch from API
            const { req: req1, res: res1 } = createMocks({
                method: 'GET',
                query: { postId: 'post_123' }
            });

            await handler(req1, res1);
            expect(res1._getStatusCode()).toBe(200);
            const data1 = JSON.parse(res1._getData());
            expect(data1.cached).toBe(false);

            // Second request - should use cache
            const { req: req2, res: res2 } = createMocks({
                method: 'GET',
                query: { postId: 'post_123' }
            });

            await handler(req2, res2);
            expect(res2._getStatusCode()).toBe(200);
            const data2 = JSON.parse(res2._getData());
            expect(data2.cached).toBe(true);
        });

        it('should handle missing access token', async () => {
            // Mock missing token
            const originalToken = process.env.INSTAGRAM_ACCESS_TOKEN;
            delete process.env.INSTAGRAM_ACCESS_TOKEN;

            const { default: handler } = await import('../instagram/stats.js');

            const { req, res } = createMocks({
                method: 'GET',
                query: { postId: 'post_123' }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const data = JSON.parse(res._getData());
            expect(data.error).toBe('Instagram access token not configured');
            expect(data.fallback).toBeDefined();

            // Restore token
            process.env.INSTAGRAM_ACCESS_TOKEN = originalToken;
        });

        it('should validate request parameters', async () => {
            const { default: handler } = await import('../instagram/stats.js');

            const { req, res } = createMocks({
                method: 'GET',
                query: {} // Missing postId
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(400);
            const data = JSON.parse(res._getData());
            expect(data.error).toBe('Invalid request parameters');
        });
    });

    describe('Fallback functionality', () => {
        it('should return fallback posts with statistics', async () => {
            // Mock missing token to trigger fallback
            const originalToken = process.env.INSTAGRAM_ACCESS_TOKEN;
            delete process.env.INSTAGRAM_ACCESS_TOKEN;

            const { default: handler } = await import('../instagram/posts.js');

            const { req, res } = createMocks({
                method: 'GET',
                query: { limit: '2' }
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const data = JSON.parse(res._getData());
            expect(data.fallback).toBeDefined();
            expect(data.fallback).toHaveLength(2);
            expect(data.fallback[0]).toHaveProperty('stats');
            expect(data.fallback[0].stats).toMatchObject({
                likes: expect.any(Number),
                comments: expect.any(Number),
                engagement_rate: expect.any(Number)
            });

            // Restore token
            process.env.INSTAGRAM_ACCESS_TOKEN = originalToken;
        });
    });
});