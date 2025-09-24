/**
 * Podcast Sync API Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';

// Mock dependencies
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                in: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
            update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ error: null }))
            }))
        }))
    }))
}));

vi.mock('../../../../../../..../../../../src/lib/spotifyRssParser.js', () => ({
    default: vi.fn(() => ({
        parseFromUrl: vi.fn()
    }))
}));

// Import after mocking
const handler = await import('../podcast/sync.js').then(m => m.default);
const { createClient } = await import('@supabase/supabase-js');
const SpotifyRssParser = await import('../../../../../../..../../../../src/lib/spotifyRssParser.js').then(m => m.default);

describe('/api/podcast/sync', () => {
    let mockSupabase;
    let mockParser;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup Supabase mock
        mockSupabase = {
            from: vi.fn(() => ({
                select: vi.fn(() => ({
                    in: vi.fn(() => Promise.resolve({ data: [], error: null }))
                })),
                insert: vi.fn(() => Promise.resolve({ error: null })),
                update: vi.fn(() => ({
                    eq: vi.fn(() => Promise.resolve({ error: null }))
                }))
            }))
        };
        createClient.mockReturnValue(mockSupabase);

        // Setup parser mock
        mockParser = {
            parseFromUrl: vi.fn()
        };
        SpotifyRssParser.mockReturnValue(mockParser);

        // Mock environment variables
        process.env.SPOTIFY_RSS_URL = 'https://example.com/rss';
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    it('should reject non-POST requests', async () => {
        const { req, res } = createMocks({
            method: 'GET'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('should reject when RSS URL is not configured', async () => {
        const originalUrl = process.env.SPOTIFY_RSS_URL;
        delete process.env.SPOTIFY_RSS_URL;

        const { req, res } = createMocks({
            method: 'POST'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('MISSING_CONFIG');

        // Restore the environment variable
        process.env.SPOTIFY_RSS_URL = originalUrl;
    });

    it('should handle successful sync with new episodes', async () => {
        // Ensure environment variable is set
        process.env.SPOTIFY_RSS_URL = 'https://example.com/rss';

        const mockPodcast = {
            title: 'Test Podcast',
            description: 'Test Description'
        };

        const mockEpisodes = [
            {
                spotifyId: 'abc123',
                title: 'Episode 1',
                description: 'Episode 1 description',
                duration: 1800000,
                publishedAt: '2024-01-01T10:00:00.000Z',
                spotifyUrl: 'https://open.spotify.com/episode/abc123',
                embedUrl: 'https://open.spotify.com/embed/episode/abc123',
                imageUrl: 'https://example.com/image.jpg'
            }
        ];

        mockParser.parseFromUrl.mockResolvedValue({
            podcast: mockPodcast,
            episodes: mockEpisodes
        });

        // Mock no existing episodes
        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                in: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            insert: vi.fn(() => Promise.resolve({ error: null }))
        });

        const { req, res } = createMocks({
            method: 'POST'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.data.episodesCreated).toBe(1);
        expect(data.data.episodesUpdated).toBe(0);
        expect(data.data.episodesProcessed).toBe(1);
    });

    it('should handle successful sync with existing episodes', async () => {
        // Ensure environment variable is set
        process.env.SPOTIFY_RSS_URL = 'https://example.com/rss';

        const mockPodcast = {
            title: 'Test Podcast',
            description: 'Test Description'
        };

        const mockEpisodes = [
            {
                spotifyId: 'abc123',
                title: 'Episode 1 Updated',
                description: 'Updated description',
                duration: 1800000,
                publishedAt: '2024-01-01T10:00:00.000Z',
                spotifyUrl: 'https://open.spotify.com/episode/abc123',
                embedUrl: 'https://open.spotify.com/embed/episode/abc123',
                imageUrl: 'https://example.com/image.jpg'
            }
        ];

        mockParser.parseFromUrl.mockResolvedValue({
            podcast: mockPodcast,
            episodes: mockEpisodes
        });

        // Mock existing episode
        const mockUpdate = vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null }))
        }));

        const mockInsert = vi.fn(() => Promise.resolve({ error: null }));

        mockSupabase.from.mockImplementation((table) => {
            if (table === 'podcast_episodes') {
                return {
                    select: vi.fn(() => ({
                        in: vi.fn(() => Promise.resolve({
                            data: [{ spotify_id: 'abc123', updated_at: '2024-01-01T09:00:00.000Z' }],
                            error: null
                        }))
                    })),
                    update: mockUpdate,
                    insert: mockInsert
                };
            }
            return {
                insert: vi.fn(() => Promise.resolve({ error: null }))
            };
        });

        const { req, res } = createMocks({
            method: 'POST'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.data.episodesCreated).toBe(0);
        expect(data.data.episodesUpdated).toBe(1);
        expect(data.data.episodesProcessed).toBe(1);
    });

    it('should handle RSS parsing errors', async () => {
        // Ensure environment variable is set
        process.env.SPOTIFY_RSS_URL = 'https://example.com/rss';

        mockParser.parseFromUrl.mockRejectedValue(new Error('RSS parse error'));

        const { req, res } = createMocks({
            method: 'POST'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('SYNC_FAILED');
        expect(data.error.message).toBe('RSS parse error');
    });

    it('should handle database errors', async () => {
        // Ensure environment variable is set
        process.env.SPOTIFY_RSS_URL = 'https://example.com/rss';

        const mockPodcast = {
            title: 'Test Podcast',
            description: 'Test Description'
        };

        const mockEpisodes = [
            {
                spotifyId: 'abc123',
                title: 'Episode 1',
                description: 'Episode 1 description',
                duration: 1800000,
                publishedAt: '2024-01-01T10:00:00.000Z',
                spotifyUrl: 'https://open.spotify.com/episode/abc123',
                embedUrl: 'https://open.spotify.com/embed/episode/abc123',
                imageUrl: 'https://example.com/image.jpg'
            }
        ];

        mockParser.parseFromUrl.mockResolvedValue({
            podcast: mockPodcast,
            episodes: mockEpisodes
        });

        // Mock database error
        mockSupabase.from.mockImplementation((table) => {
            if (table === 'podcast_episodes') {
                return {
                    select: vi.fn(() => ({
                        in: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
                    }))
                };
            }
            return {
                insert: vi.fn(() => Promise.resolve({ error: null }))
            };
        });

        const { req, res } = createMocks({
            method: 'POST'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error.message).toContain('Failed to fetch existing episodes');
    });

    it('should handle empty RSS feed', async () => {
        // Ensure environment variable is set
        process.env.SPOTIFY_RSS_URL = 'https://example.com/rss';

        const mockPodcast = {
            title: 'Test Podcast',
            description: 'Test Description'
        };

        mockParser.parseFromUrl.mockResolvedValue({
            podcast: mockPodcast,
            episodes: []
        });

        const { req, res } = createMocks({
            method: 'POST'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.message).toBe('No episodes found in RSS feed');
        expect(data.data.episodesProcessed).toBe(0);
    });

    it('should limit episodes processed per sync', async () => {
        // Ensure environment variable is set
        process.env.SPOTIFY_RSS_URL = 'https://example.com/rss';

        const mockPodcast = {
            title: 'Test Podcast',
            description: 'Test Description'
        };

        // Create 60 episodes (more than MAX_EPISODES_PER_SYNC = 50)
        const mockEpisodes = Array.from({ length: 60 }, (_, i) => ({
            spotifyId: `episode${i}`,
            title: `Episode ${i}`,
            description: `Episode ${i} description`,
            duration: 1800000,
            publishedAt: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
            spotifyUrl: `https://open.spotify.com/episode/episode${i}`,
            embedUrl: `https://open.spotify.com/embed/episode/episode${i}`,
            imageUrl: 'https://example.com/image.jpg'
        }));

        mockParser.parseFromUrl.mockResolvedValue({
            podcast: mockPodcast,
            episodes: mockEpisodes
        });

        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                in: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            insert: vi.fn(() => Promise.resolve({ error: null }))
        });

        const { req, res } = createMocks({
            method: 'POST'
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        // Should only process 50 episodes (MAX_EPISODES_PER_SYNC)
        expect(data.data.episodesProcessed).toBe(50);
    });

    it('should handle timeout', async () => {
        // Ensure environment variable is set
        process.env.SPOTIFY_RSS_URL = 'https://example.com/rss';

        vi.useFakeTimers();

        mockParser.parseFromUrl.mockImplementation(() => {
            return new Promise(() => { }); // Never resolves
        });

        const { req, res } = createMocks({
            method: 'POST'
        });

        const handlerPromise = handler(req, res);

        // Fast-forward time to trigger timeout
        vi.advanceTimersByTime(25000);

        await handlerPromise;

        expect(res._getStatusCode()).toBe(504);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('SYNC_TIMEOUT');

        vi.useRealTimers();
    }, 10000); // Increase test timeout to 10 seconds
});