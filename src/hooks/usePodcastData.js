/**
 * Podcast Data Hook
 * Custom hook for managing podcast episodes data and sync operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export const usePodcastData = ({
    autoSync = false,
    syncInterval = 1800000, // 30 minutes
    initialPage = 1,
    initialLimit = 12
} = {}) => {
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [lastSync, setLastSync] = useState(null);

    const syncIntervalRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Fetch episodes from API
    const fetchEpisodes = useCallback(async (page = 1, limit = 12, search = '') => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                sortBy: 'published_at',
                sortOrder: 'desc'
            });

            const response = await fetch(`/api/podcast/episodes?${params}`, {
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Failed to fetch episodes');
            }

            setEpisodes(data.data.episodes || []);
            setPagination(data.data.pagination);

            return data.data;

        } catch (err) {
            if (err.name === 'AbortError') {
                return null; // Request was cancelled
            }

            console.error('Error fetching episodes:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, []);

    // Trigger podcast sync
    const syncPodcast = useCallback(async () => {
        try {
            setSyncing(true);
            setError(null);

            const response = await fetch('/api/podcast/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Sync failed');
            }

            setLastSync(new Date().toISOString());

            // Refresh episodes after successful sync
            await fetchEpisodes(1, initialLimit);

            return data.data;

        } catch (err) {
            console.error('Error syncing podcast:', err);
            setError(`Sync failed: ${err.message}`);
            throw err;
        } finally {
            setSyncing(false);
        }
    }, [fetchEpisodes, initialLimit]);

    // Get episode by ID
    const getEpisodeById = useCallback((episodeId) => {
        return episodes.find(episode => episode.id === episodeId);
    }, [episodes]);

    // Get episode by Spotify ID
    const getEpisodeBySpotifyId = useCallback((spotifyId) => {
        return episodes.find(episode => episode.spotifyId === spotifyId);
    }, [episodes]);

    // Search episodes
    const searchEpisodes = useCallback(async (searchTerm, page = 1) => {
        return await fetchEpisodes(page, initialLimit, searchTerm);
    }, [fetchEpisodes, initialLimit]);

    // Load more episodes (pagination)
    const loadMore = useCallback(async () => {
        if (!pagination || !pagination.hasNextPage || loading) {
            return;
        }

        try {
            const nextPage = pagination.currentPage + 1;
            const data = await fetchEpisodes(nextPage, initialLimit);

            if (data && data.episodes) {
                setEpisodes(prev => [...prev, ...data.episodes]);
            }
        } catch (err) {
            console.error('Error loading more episodes:', err);
        }
    }, [pagination, loading, fetchEpisodes, initialLimit]);

    // Refresh current page
    const refresh = useCallback(async () => {
        const currentPage = pagination?.currentPage || 1;
        await fetchEpisodes(currentPage, initialLimit);
    }, [fetchEpisodes, pagination, initialLimit]);

    // Setup auto-sync interval
    useEffect(() => {
        if (!autoSync || syncInterval <= 0) {
            return;
        }

        const startAutoSync = () => {
            syncIntervalRef.current = setInterval(() => {
                if (!syncing && !loading) {
                    syncPodcast().catch(console.error);
                }
            }, syncInterval);
        };

        startAutoSync();

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        };
    }, [autoSync, syncInterval, syncing, loading, syncPodcast]);

    // Initial load
    useEffect(() => {
        fetchEpisodes(initialPage, initialLimit).catch(console.error);
    }, [fetchEpisodes, initialPage, initialLimit]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, []);

    return {
        // Data
        episodes,
        pagination,
        lastSync,

        // State
        loading,
        syncing,
        error,

        // Actions
        fetchEpisodes,
        syncPodcast,
        searchEpisodes,
        loadMore,
        refresh,

        // Utilities
        getEpisodeById,
        getEpisodeBySpotifyId,

        // Computed
        hasEpisodes: episodes.length > 0,
        canLoadMore: pagination?.hasNextPage && !loading,
        isInitialLoad: loading && episodes.length === 0
    };
};

export default usePodcastData;