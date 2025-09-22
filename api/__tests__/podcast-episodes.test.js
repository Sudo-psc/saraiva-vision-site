/**
 * Podcast Episodes API Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                or: vi.fn(() => ({
                    order: vi.fn(() => ({
                        range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
                    }))
                })),
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
                }))
            }))
        }))
    }))
}));

// Import after mocking
const handler = await import('../podcast/episodes.js').then(m => m.default);
const { createClient } = await import('@supabase/supabase-js');

describe('/api/podcast/episodes', () => {
    let mockSupabase;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup Supabase mock
        mockSupabase = {
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    or: vi.fn(() => ({
                        order: vi.fn(() => ({
                            range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
                        }))
                    })),
                    order: vi.fn(() => ({
                        range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
                    }))
                }))
            }))
        };
        createClient.mockReturnValue(mockSupabase);

        // Mock environment variables
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    });

    it('should reject non-GET requests', async () => {
        const { req, res } = createMocks({
            method: 'POST'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('should return episodes with default parameters', async () => {
        const mockEpisodes = [
            {
                id: '1',
                spotify_id: 'abc123',
                title: 'Episode 1',
                description: 'Episode 1 description',
                duration_ms: 1800000,
                published_at: '2024-01-01T10:00:00.000Z',
                spotify_url: 'https://open.spotify.com/episode/abc123',
                embed_url: 'https://open.spotify.com/embed/episode/abc123',
                image_url: 'https://example.com/image.jpg',
                created_at: '2024-01-01T09:00:00.000Z'
            }
        ];

        const mockQuery = {
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({
                        data: mockEpisodes,
                        error: null,
                        count: 1
                    }))
                }))
            }))
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        const { req, res } = createMocks({
            method: 'GET'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());

        expect(data.success).toBe(true);
        expect(data.data.episodes).toHaveLength(1);
        expect(data.data.episodes[0].spotifyId).toBe('abc123');
        expect(data.data.episodes[0].formattedDuration).toBe('30:00');
        expect(data.data.pagination.currentPage).toBe(1);
        expect(data.data.pagination.totalCount).toBe(1);
    });

    it('should handle pagination parameters', async () => {
        const mockQuery = {
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({
                        data: [],
                        error: null,
                        count: 25
                    }))
                }))
            }))
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        const { req, res } = createMocks({
            method: 'GET',
            query: {
                page: '2',
                limit: '10'
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());

        expect(data.data.pagination.currentPage).toBe(2);
        expect(data.data.pagination.totalPages).toBe(3);
        expect(data.data.pagination.hasNextPage).toBe(true);
        expect(data.data.pagination.hasPrevPage).toBe(true);

        // Verify range was called with correct offset
        expect(mockQuery.select().order().range).toHaveBeenCalledWith(10, 19);
    });

    it('should handle search parameter', async () => {
        const mockQuery = {
            select: vi.fn(() => ({
                or: vi.fn(() => ({
                    order: vi.fn(() => ({
                        range: vi.fn(() => Promise.resolve({
                            data: [],
                            error: null,
                            count: 0
                        }))
                    }))
                }))
            }))
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        const { req, res } = createMocks({
            method: 'GET',
            query: {
                search: 'catarata'
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);

        // Verify search filter was applied
        expect(mockQuery.select().or).toHaveBeenCalledWith('title.ilike.%catarata%,description.ilike.%catarata%');
    });

    it('should handle sorting parameters', async () => {
        const mockQuery = {
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({
                        data: [],
                        error: null,
                        count: 0
                    }))
                }))
            }))
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        const { req, res } = createMocks({
            method: 'GET',
            query: {
                sortBy: 'title',
                sortOrder: 'asc'
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);

        // Verify sorting was applied
        expect(mockQuery.select().order).toHaveBeenCalledWith('title', { ascending: true });
    });

    it('should validate and sanitize parameters', async () => {
        const mockQuery = {
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({
                        data: [],
                        error: null,
                        count: 0
                    }))
                }))
            }))
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        const { req, res } = createMocks({
            method: 'GET',
            query: {
                page: '-1', // Invalid page
                limit: '100', // Exceeds max limit
                sortBy: 'invalid_field', // Invalid sort field
                sortOrder: 'invalid_order' // Invalid sort order
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());

        // Should use defaults for invalid values
        expect(data.data.pagination.currentPage).toBe(1); // Corrected from -1
        expect(data.data.pagination.limit).toBe(50); // Capped at MAX_LIMIT
        expect(data.data.meta.sortBy).toBe('published_at'); // Default sort field
        expect(data.data.meta.sortOrder).toBe('desc'); // Default sort order
    });

    it('should handle database errors', async () => {
        const mockQuery = {
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({
                        data: null,
                        error: { message: 'Database connection failed' },
                        count: null
                    }))
                }))
            }))
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        const { req, res } = createMocks({
            method: 'GET'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        const data = JSON.parse(res._getData());

        expect(data.success).toBe(false);
        expect(data.error.code).toBe('FETCH_FAILED');
        expect(data.error.message).toContain('Database connection failed');
    });

    it('should format duration correctly', async () => {
        const mockEpisodes = [
            {
                id: '1',
                spotify_id: 'abc123',
                title: 'Short Episode',
                duration_ms: 90000, // 1:30
                published_at: '2024-01-01T10:00:00.000Z'
            },
            {
                id: '2',
                spotify_id: 'def456',
                title: 'Long Episode',
                duration_ms: 3665000, // 1:01:05
                published_at: '2024-01-02T10:00:00.000Z'
            },
            {
                id: '3',
                spotify_id: 'ghi789',
                title: 'No Duration',
                duration_ms: null,
                published_at: '2024-01-03T10:00:00.000Z'
            }
        ];

        const mockQuery = {
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({
                        data: mockEpisodes,
                        error: null,
                        count: 3
                    }))
                }))
            }))
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        const { req, res } = createMocks({
            method: 'GET'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());

        expect(data.data.episodes[0].formattedDuration).toBe('1:30');
        expect(data.data.episodes[1].formattedDuration).toBe('1:01:05');
        expect(data.data.episodes[2].formattedDuration).toBe('0:00');
    });

    it('should handle empty results', async () => {
        const mockQuery = {
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({
                        data: [],
                        error: null,
                        count: 0
                    }))
                }))
            }))
        };

        mockSupabase.from.mockReturnValue(mockQuery);

        const { req, res } = createMocks({
            method: 'GET'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());

        expect(data.success).toBe(true);
        expect(data.data.episodes).toHaveLength(0);
        expect(data.data.pagination.totalCount).toBe(0);
        expect(data.data.pagination.totalPages).toBe(0);
    });
});