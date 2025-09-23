import { useState, useEffect, useCallback } from 'react';

// Custom hook for Instagram feed management
export const useInstagramFeed = (options = {}) => {
  const {
    limit = 4,
    pollingInterval = 5 * 60 * 1000, // 5 minutes
    autoRefresh = true,
    onError = null,
    onSuccess = null
  } = options;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [cached, setCached] = useState(false);

  // Fetch posts from Instagram API
  const fetchPosts = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL('/api/instagram/posts', window.location.origin);
      url.searchParams.set('limit', limit.toString());
      
      if (force) {
        url.searchParams.set('_t', Date.now().toString());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      if (result.success) {
        setPosts(result.data || []);
        setCached(result.cached || false);
        setLastFetch(new Date());

        if (onSuccess) {
          onSuccess(result.data, result);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch posts');
      }

    } catch (err) {
      console.error('Instagram feed error:', err);
      setError(err.message);

      if (onError) {
        onError(err);
      }

      // If we have fallback data in the response, use it
      if (err.response?.fallback) {
        setPosts(err.response.fallback);
      }
    } finally {
      setLoading(false);
    }
  }, [limit, onError, onSuccess]);

  // Refresh posts manually
  const refresh = useCallback(() => {
    return fetchPosts(true);
  }, [fetchPosts]);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh || pollingInterval <= 0) return;

    const interval = setInterval(() => {
      fetchPosts();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, pollingInterval, fetchPosts]);

  // Page visibility API for smart refreshing
  useEffect(() => {
    if (!autoRefresh) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastFetch) {
        const timeSinceLastFetch = Date.now() - lastFetch.getTime();
        
        // Refresh if it's been more than 5 minutes since last fetch
        if (timeSinceLastFetch > 5 * 60 * 1000) {
          fetchPosts();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefresh, lastFetch, fetchPosts]);

  return {
    posts,
    loading,
    error,
    refresh,
    lastFetch,
    cached,
    isStale: lastFetch ? (Date.now() - lastFetch.getTime()) > pollingInterval : false
  };
};