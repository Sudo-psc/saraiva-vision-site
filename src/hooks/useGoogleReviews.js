/**
 * Custom hook for Google Reviews integration using Google Places API
 * Provides easy access to Google Places reviews with error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_OPTIONS = {
    placeId: null,
    limit: 5,
    autoFetch: true,
    refreshInterval: null, // milliseconds
    onError: null,
    onSuccess: null
};

export function useGoogleReviews(options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    const abortControllerRef = useRef(null);
    const refreshIntervalRef = useRef(null);

    /**
     * Fetch reviews from Google Places API
     */
    const fetchReviews = useCallback(async (fetchOptions = {}) => {
        const placeId = fetchOptions.placeId || config.placeId || process.env.VITE_GOOGLE_PLACE_ID;

        if (!placeId) {
            const error = new Error('Place ID is required');
            setError(error);
            if (config.onError) config.onError(error);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                placeId,
                limit: fetchOptions.limit || config.limit || 5,
                language: 'pt-BR'
            });

            const response = await fetch(`/api/google-reviews?${params}`, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch reviews');
            }

            const { reviews: newReviews, stats: newStats } = result.data;

            setReviews(newReviews || []);

            if (newStats) {
                setStats(newStats);
            }

            setLastFetch(new Date());

            // Call success callback
            if (config.onSuccess) {
                config.onSuccess(result.data);
            }

        } catch (err) {
            if (err.name === 'AbortError') {
                return; // Request was cancelled
            }

            const error = new Error(err.message || 'Failed to fetch reviews');
            setError(error);

            // Call error callback
            if (config.onError) {
                config.onError(error);
            }

            console.error('Google Reviews fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [config]);

    /**
     * Fetch review statistics
     */
    const fetchStats = useCallback(async (statsOptions = {}) => {
        const placeId = statsOptions.placeId || config.placeId || process.env.VITE_GOOGLE_PLACE_ID;

        if (!placeId) {
            return;
        }

        try {
            const params = new URLSearchParams({
                placeId,
                period: statsOptions.period || '30',
                includeDistribution: statsOptions.includeDistribution ?? true,
                includeTrends: statsOptions.includeTrends ?? false
            });

            const response = await fetch(`/api/google-reviews-stats?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                setStats(result.data);
            }

        } catch (err) {
            console.error('Failed to fetch review stats:', err);
        }
    }, [config.placeId]);

    /**
     * Refresh reviews (force fetch from API)
     */
    const refresh = useCallback(async () => {
        await fetchReviews();
    }, [fetchReviews]);

    /**
     * Filter reviews locally
     */
    const filterReviews = useCallback((filters) => {
        return reviews.filter(review => {
            if (filters.minRating && review.starRating < filters.minRating) {
                return false;
            }
            if (filters.maxRating && review.starRating > filters.maxRating) {
                return false;
            }
            if (filters.hasResponse !== undefined && review.hasResponse !== filters.hasResponse) {
                return false;
            }
            if (filters.keywords && filters.keywords.length > 0) {
                const reviewText = (review.comment || '').toLowerCase();
                const hasKeyword = filters.keywords.some(keyword =>
                    reviewText.includes(keyword.toLowerCase())
                );
                if (!hasKeyword) {
                    return false;
                }
            }
            if (filters.dateRange) {
                const reviewDate = new Date(review.createTime);
                if (filters.dateRange.start && reviewDate < filters.dateRange.start) {
                    return false;
                }
                if (filters.dateRange.end && reviewDate > filters.dateRange.end) {
                    return false;
                }
            }
            return true;
        });
    }, [reviews]);

    /**
     * Get reviews by rating
     */
    const getReviewsByRating = useCallback((rating) => {
        return reviews.filter(review => review.starRating === rating);
    }, [reviews]);

    /**
     * Get recent reviews (last 30 days)
     */
    const getRecentReviews = useCallback(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return reviews.filter(review => {
            if (!review.createTime) return false;
            return new Date(review.createTime) >= thirtyDaysAgo;
        });
    }, [reviews]);

    // Auto-fetch on mount and when dependencies change
    useEffect(() => {
        if (config.autoFetch) {
            fetchReviews();
        }
    }, [config.autoFetch, fetchReviews]);

    // Set up refresh interval
    useEffect(() => {
        if (config.refreshInterval && config.refreshInterval > 0) {
            refreshIntervalRef.current = setInterval(() => {
                fetchReviews();
            }, config.refreshInterval);

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [config.refreshInterval, fetchReviews]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    return {
        // Data
        reviews,
        stats,
        hasMore: false, // Google Places API only returns max 5 reviews

        // State
        loading,
        error,
        lastFetch,

        // Actions
        fetchReviews,
        fetchStats,
        refresh,

        // Utilities
        filterReviews,
        getReviewsByRating,
        getRecentReviews,

        // Config
        config: {
            placeId: config.placeId || process.env.VITE_GOOGLE_PLACE_ID,
            limit: config.limit
        }
    };
}

/**
 * Hook for review statistics only
 */
export function useGoogleReviewsStats(placeId, options = {}) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    const fetchStats = useCallback(async () => {
        const targetPlaceId = placeId || process.env.VITE_GOOGLE_PLACE_ID;

        if (!targetPlaceId) {
            setError(new Error('Place ID is required'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                placeId: targetPlaceId,
                period: options.period || '30',
                includeDistribution: options.includeDistribution ?? true,
                includeTrends: options.includeTrends ?? false
            });

            const response = await fetch(`/api/google-reviews-stats?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch stats');
            }

            setStats(result.data);
            setLastFetch(new Date());

        } catch (err) {
            const error = new Error(err.message || 'Failed to fetch review stats');
            setError(error);
            console.error('Google Reviews stats error:', error);
        } finally {
            setLoading(false);
        }
    }, [placeId, options.period, options.includeDistribution, options.includeTrends]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        lastFetch,
        refresh: fetchStats
    };
}

export default useGoogleReviews;