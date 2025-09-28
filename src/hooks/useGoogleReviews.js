/**
 * Custom hook for Google Reviews integration using Google Places API
 * Provides easy access to Google Places reviews with error handling
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const PLACEHOLDER_TOKENS = ['GOOGLE_PLACE_ID_PLACEHOLDER', 'your_google_place_id_here', 'PLACEHOLDER'];

const normalizePlaceId = (value) => {
    if (!value) return null;
    const cleaned = String(value).trim();
    if (!cleaned) return null;
    if (PLACEHOLDER_TOKENS.some((token) => cleaned.includes(token))) return null;
    return cleaned;
};

const resolvePlaceId = (...candidates) => {
    for (const candidate of candidates) {
        const resolved = normalizePlaceId(candidate);
        if (resolved) {
            return resolved;
        }
    }
    return null;
};

const DEFAULT_OPTIONS = {
    placeId: null,
    limit: 5,
    autoFetch: true,
    refreshInterval: null, // milliseconds
    onError: null,
    onSuccess: null
};

export function useGoogleReviews(options = {}) {
    // Destructure options to create stable dependencies
    const {
        placeId = DEFAULT_OPTIONS.placeId,
        limit = DEFAULT_OPTIONS.limit,
        autoFetch = DEFAULT_OPTIONS.autoFetch,
        refreshInterval = DEFAULT_OPTIONS.refreshInterval,
        onError = DEFAULT_OPTIONS.onError,
        onSuccess = DEFAULT_OPTIONS.onSuccess
    } = options;

    const config = useMemo(() => ({
        placeId,
        limit,
        autoFetch,
        refreshInterval,
        onError,
        onSuccess
    }), [placeId, limit, autoFetch, refreshInterval, onError, onSuccess]);

    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const abortControllerRef = useRef(null);
    const refreshIntervalRef = useRef(null);
    const maxRetries = 3;

    /**
     * Fetch reviews from Google Places API with retry logic
     */
    const fetchReviews = useCallback(async (fetchOptions = {}) => {
        const placeId = resolvePlaceId(
            fetchOptions.placeId,
            config.placeId,
            process.env.GOOGLE_PLACE_ID,
            process.env.VITE_GOOGLE_PLACE_ID
        );

        // Check for placeholder values that indicate missing configuration
        const isPlaceholderValue = !placeId;

        if (isPlaceholderValue) {
            // Don't throw error - let component handle fallback gracefully
            console.info('Google Reviews: Using fallback data (API not configured)');
            setError(null); // Clear any previous errors
            setReviews([]); // Empty array so component uses fallback data
            setStats(null);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setLoading(true);
        setError(null);
        
        const currentRetry = fetchOptions.retryAttempt || 0;

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

            let result;
            try {
                // Check content-type before parsing
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Expected JSON but got:', contentType, text.substring(0, 200));
                    throw new Error('Server returned non-JSON response');
                }
                result = await response.json();
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                const text = await response.text();
                console.error('Response text:', text.substring(0, 500));
                throw new Error('Invalid response format from server');
            }

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

            console.error('Google Reviews fetch error:', err);
            
            // Retry logic for network errors
            if (currentRetry < maxRetries && (err.message.includes('network') || err.message.includes('timeout') || err.message.includes('fetch'))) {
                console.log(`Retrying request (${currentRetry + 1}/${maxRetries})...`);
                setRetryCount(currentRetry + 1);
                
                // Exponential backoff: wait 1s, 2s, 4s
                const delay = Math.pow(2, currentRetry) * 1000;
                setTimeout(() => {
                    fetchReviews({ ...fetchOptions, retryAttempt: currentRetry + 1 });
                }, delay);
                return;
            }

            const error = new Error(err.message || 'Failed to fetch reviews from Google Places API');
            setError(error);
            setRetryCount(0);

            // Call error callback
            if (config.onError) {
                config.onError(error);
            }
        } finally {
            if (currentRetry === 0) { // Only set loading false on the final attempt
                setLoading(false);
            }
        }
    }, [config]);

    /**
     * Fetch review statistics
     */
    const fetchStats = useCallback(async (statsOptions = {}) => {
        const placeId = resolvePlaceId(
            statsOptions.placeId,
            config.placeId,
            process.env.GOOGLE_PLACE_ID,
            process.env.VITE_GOOGLE_PLACE_ID
        );

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
    }, [config.autoFetch]); // Remove fetchReviews dependency to prevent infinite loop

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
    }, [config.refreshInterval]); // Remove fetchReviews dependency to prevent infinite loop

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
        retryCount,
        isRetrying: retryCount > 0,

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
            placeId: resolvePlaceId(
                config.placeId,
                process.env.GOOGLE_PLACE_ID,
                process.env.VITE_GOOGLE_PLACE_ID
            ),
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
        const targetPlaceId = resolvePlaceId(
            placeId,
            process.env.GOOGLE_PLACE_ID,
            process.env.VITE_GOOGLE_PLACE_ID
        );

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