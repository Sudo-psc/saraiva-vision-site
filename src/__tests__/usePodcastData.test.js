/**
 * usePodcastData Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePodcastData } from '../hooks/usePodcastData';

// Mock fetch
global.fetch = vi.fn();

describe('usePodcastData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const mockEpisodesResponse = {
        success: true,
        data: {
            episodes: [
                {
                    id: '1',
                    spotifyId: 'abc123',
                    title: 'Episode 1',
                    description: 'Description 1',
                    publishedAt: '2024-01-01T10:00:00.000Z'
                },
                {
                    id: '2',
                    spotifyId: 'def456',
                    title: 'Episode 2',
                    description: 'Description 2',
                    publishedAt: '2024-01-02T10:00:00.000Z'
                }
            ],
            pagination: {
                currentPage: 1,
                totalPages: 2,
                totalCount: 20,
                hasNextPage: true,
                hasPrevPage: false
            }
        }
    };

    const mockSyncResponse = {
        success: true,
        data: {
            episodesProcessed: 5,
            episodesCreated: 3,
            episodesUpdated: 2
        }
    };

    it('should initialize with default state', () => {
        const { result } = renderHook(() => usePodcastData());

        expect(result.current.episodes).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.syncing).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.pagination).toBeNull();
        expect(result.current.hasEpisodes).toBe(false);
    });

    it('should fetch episodes on mount', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        const { result } = renderHook(() => usePodcastData());

        // Should start loading
        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.episodes).toHaveLength(2);
        expect(result.current.episodes[0].title).toBe('Episode 1');
        expect(result.current.pagination).toEqual(mockEpisodesResponse.data.pagination);
        expect(result.current.hasEpisodes).toBe(true);
    });

    it('should handle fetch errors', async () => {
        const errorMessage = 'Network error';
        fetch.mockRejectedValueOnce(new Error(errorMessage));

        const { result } = renderHook(() => usePodcastData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(errorMessage);
        expect(result.current.episodes).toEqual([]);
    });

    it('should sync podcast episodes', async () => {
        // Mock initial fetch
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        // Mock sync request
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockSyncResponse)
        });

        // Mock refresh after sync
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        const { result } = renderHook(() => usePodcastData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            const syncResult = await result.current.syncPodcast();
            expect(syncResult).toEqual(mockSyncResponse.data);
        });

        expect(result.current.syncing).toBe(false);
        expect(result.current.lastSync).toBeTruthy();
    });

    it('should handle sync errors', async () => {
        // Mock initial fetch
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        // Mock sync error
        fetch.mockRejectedValueOnce(new Error('Sync failed'));

        const { result } = renderHook(() => usePodcastData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            try {
                await result.current.syncPodcast();
            } catch (error) {
                expect(error.message).toBe('Sync failed');
            }
        });

        expect(result.current.syncing).toBe(false);
        expect(result.current.error).toContain('Sync failed');
    });

    it('should search episodes', async () => {
        const searchResponse = {
            ...mockEpisodesResponse,
            data: {
                ...mockEpisodesResponse.data,
                episodes: [mockEpisodesResponse.data.episodes[0]] // Only first episode
            }
        };

        // Mock initial fetch
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        // Mock search request
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(searchResponse)
        });

        const { result } = renderHook(() => usePodcastData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            const searchResult = await result.current.searchEpisodes('test search');
            expect(searchResult.episodes).toHaveLength(1);
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('search=test%20search'),
            expect.any(Object)
        );
    });

    it('should load more episodes', async () => {
        const page2Response = {
            ...mockEpisodesResponse,
            data: {
                ...mockEpisodesResponse.data,
                episodes: [
                    {
                        id: '3',
                        spotifyId: 'ghi789',
                        title: 'Episode 3',
                        description: 'Description 3',
                        publishedAt: '2024-01-03T10:00:00.000Z'
                    }
                ],
                pagination: {
                    ...mockEpisodesResponse.data.pagination,
                    currentPage: 2,
                    hasNextPage: false,
                    hasPrevPage: true
                }
            }
        };

        // Mock initial fetch
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        // Mock load more request
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(page2Response)
        });

        const { result } = renderHook(() => usePodcastData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.canLoadMore).toBe(true);

        await act(async () => {
            await result.current.loadMore();
        });

        // Should append new episodes to existing ones
        expect(result.current.episodes).toHaveLength(3);
        expect(result.current.episodes[2].title).toBe('Episode 3');
    });

    it('should not load more when no next page', async () => {
        const noNextPageResponse = {
            ...mockEpisodesResponse,
            data: {
                ...mockEpisodesResponse.data,
                pagination: {
                    ...mockEpisodesResponse.data.pagination,
                    hasNextPage: false
                }
            }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(noNextPageResponse)
        });

        const { result } = renderHook(() => usePodcastData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.canLoadMore).toBe(false);

        await act(async () => {
            await result.current.loadMore();
        });

        // Should only have been called once (initial fetch)
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should find episode by ID', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        const { result } = renderHook(() => usePodcastData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const episode = result.current.getEpisodeById('1');
        expect(episode).toBeTruthy();
        expect(episode.title).toBe('Episode 1');

        const notFound = result.current.getEpisodeById('999');
        expect(notFound).toBeUndefined();
    });

    it('should find episode by Spotify ID', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        const { result } = renderHook(() => usePodcastData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const episode = result.current.getEpisodeBySpotifyId('abc123');
        expect(episode).toBeTruthy();
        expect(episode.title).toBe('Episode 1');

        const notFound = result.current.getEpisodeBySpotifyId('xyz999');
        expect(notFound).toBeUndefined();
    });

    it('should auto-sync when enabled', async () => {
        // Mock initial fetch
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        // Mock auto-sync requests
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockSyncResponse)
        });

        const { result } = renderHook(() =>
            usePodcastData({
                autoSync: true,
                syncInterval: 1000 // 1 second for testing
            })
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Fast-forward time to trigger auto-sync
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(result.current.lastSync).toBeTruthy();
        });

        // Should have called sync endpoint
        expect(fetch).toHaveBeenCalledWith('/api/podcast/sync', expect.objectContaining({
            method: 'POST'
        }));
    });

    it('should cancel requests on unmount', async () => {
        const abortSpy = vi.fn();
        const mockAbortController = {
            abort: abortSpy,
            signal: {}
        };

        global.AbortController = vi.fn(() => mockAbortController);

        fetch.mockImplementation(() => new Promise(() => { })); // Never resolves

        const { unmount } = renderHook(() => usePodcastData());

        unmount();

        expect(abortSpy).toHaveBeenCalled();
    });

    it('should refresh current page', async () => {
        // Mock initial fetch
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        // Mock refresh request
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockEpisodesResponse)
        });

        const { result } = renderHook(() => usePodcastData());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.refresh();
        });

        // Should have called fetch twice (initial + refresh)
        expect(fetch).toHaveBeenCalledTimes(2);
    });
});