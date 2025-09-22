import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing dashboard data with real-time refresh
 * Implements 30-second auto-refresh as per requirements
 */
export const useDashboardData = (refreshInterval = 30000) => {
    const [data, setData] = useState({
        metrics: null,
        health: null,
        queue: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const intervalRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Fetch all dashboard data
    const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
        try {
            // Cancel any ongoing requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            if (isManualRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(null);

            // Fetch all endpoints in parallel
            const [metricsRes, healthRes, queueRes] = await Promise.all([
                fetch('/api/dashboard/metrics', {
                    signal: abortControllerRef.current.signal,
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                }),
                fetch('/api/dashboard/health', {
                    signal: abortControllerRef.current.signal,
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                }),
                fetch('/api/dashboard/queue', {
                    signal: abortControllerRef.current.signal,
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                })
            ]);

            // Check if all requests were successful
            if (!metricsRes.ok || !healthRes.ok || !queueRes.ok) {
                const failedEndpoints = [];
                if (!metricsRes.ok) failedEndpoints.push('metrics');
                if (!healthRes.ok) failedEndpoints.push('health');
                if (!queueRes.ok) failedEndpoints.push('queue');

                throw new Error(`Failed to fetch: ${failedEndpoints.join(', ')}`);
            }

            // Parse responses
            const [metricsData, healthData, queueData] = await Promise.all([
                metricsRes.json(),
                healthRes.json(),
                queueRes.json()
            ]);

            // Validate response structure
            if (!metricsData.success || !healthData.success || !queueData.success) {
                throw new Error('Invalid response format from API');
            }

            // Update state with new data
            setData({
                metrics: metricsData.data,
                health: healthData.data,
                queue: queueData.data
            });

            setLastUpdated(new Date());
            setError(null);

        } catch (err) {
            // Don't set error for aborted requests
            if (err.name !== 'AbortError') {
                console.error('Dashboard fetch error:', err);
                setError(err.message);
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Manual refresh function
    const refresh = useCallback(() => {
        fetchDashboardData(true);
    }, [fetchDashboardData]);

    // Start auto-refresh
    const startAutoRefresh = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            fetchDashboardData(false);
        }, refreshInterval);
    }, [fetchDashboardData, refreshInterval]);

    // Stop auto-refresh
    const stopAutoRefresh = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Initialize data fetch and auto-refresh
    useEffect(() => {
        fetchDashboardData(false);
        startAutoRefresh();

        // Cleanup on unmount
        return () => {
            stopAutoRefresh();
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchDashboardData, startAutoRefresh, stopAutoRefresh]);

    // Handle visibility change to pause/resume refresh when tab is not active
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopAutoRefresh();
            } else {
                // Refresh immediately when tab becomes active
                fetchDashboardData(false);
                startAutoRefresh();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchDashboardData, startAutoRefresh, stopAutoRefresh]);

    return {
        data,
        loading,
        error,
        lastUpdated,
        isRefreshing,
        refresh,
        startAutoRefresh,
        stopAutoRefresh
    };
};

/**
 * Hook for individual dashboard metrics with caching
 */
export const useDashboardMetrics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMetrics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/dashboard/metrics', {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch metrics');
            }

            setMetrics(data.data);
        } catch (err) {
            console.error('Metrics fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return {
        metrics,
        loading,
        error,
        refetch: fetchMetrics
    };
};

/**
 * Hook for system health monitoring
 */
export const useSystemHealth = () => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHealth = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/dashboard/health', {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch health status');
            }

            setHealth(data.data);
        } catch (err) {
            console.error('Health check error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
    }, [fetchHealth]);

    return {
        health,
        loading,
        error,
        refetch: fetchHealth
    };
};