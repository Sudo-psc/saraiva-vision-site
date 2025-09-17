/**
 * Custom React hooks for WordPress API integration
 * Provides reactive data fetching with loading states, error handling, and caching
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchPosts,
  fetchPostBySlug,
  fetchPostById,
  fetchCategories,
  fetchPostsByCategory,
  fetchTags,
  searchPosts,
  fetchFeaturedPosts,
  fetchRecentPosts,
  fetchRelatedPosts,
  checkWordPressConnection
} from '@/lib/wordpress';

/**
 * Generic hook for WordPress API calls
 */
function useWordPressApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!apiCall) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('WordPress API error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

/**
 * Hook to fetch posts with filtering and pagination
 */
export function usePosts(params = {}) {
  return useWordPressApi(
    () => fetchPosts(params),
    [JSON.stringify(params)]
  );
}

/**
 * Hook to fetch a single post by slug
 */
export function usePost(slug) {
  return useWordPressApi(
    slug ? () => fetchPostBySlug(slug) : null,
    [slug]
  );
}

/**
 * Hook to fetch a single post by ID
 */
export function usePostById(id) {
  return useWordPressApi(
    id ? () => fetchPostById(id) : null,
    [id]
  );
}

/**
 * Hook to fetch categories
 */
export function useCategories(params = {}) {
  return useWordPressApi(
    () => fetchCategories(params),
    [JSON.stringify(params)]
  );
}

/**
 * Hook to fetch posts by category
 */
export function usePostsByCategory(categorySlug, params = {}) {
  return useWordPressApi(
    categorySlug ? () => fetchPostsByCategory(categorySlug, params) : null,
    [categorySlug, JSON.stringify(params)]
  );
}

/**
 * Hook to fetch tags
 */
export function useTags(params = {}) {
  return useWordPressApi(
    () => fetchTags(params),
    [JSON.stringify(params)]
  );
}

/**
 * Hook for search functionality
 */
export function usePostSearch(searchTerm, params = {}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (term) => {
    if (!term || term.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await searchPosts(term.trim(), params);
      setResults(searchResults);
    } catch (err) {
      setError(err.message || 'Search failed');
      console.error('WordPress search error:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    if (searchTerm) {
      search(searchTerm);
    } else {
      setResults([]);
    }
  }, [searchTerm, search]);

  return {
    results,
    loading,
    error,
    search
  };
}

/**
 * Hook to fetch featured posts
 */
export function useFeaturedPosts(params = {}) {
  return useWordPressApi(
    () => fetchFeaturedPosts(params),
    [JSON.stringify(params)]
  );
}

/**
 * Hook to fetch recent posts
 */
export function useRecentPosts(count = 5) {
  return useWordPressApi(
    () => fetchRecentPosts(count),
    [count]
  );
}

/**
 * Hook to fetch related posts
 */
export function useRelatedPosts(post, count = 3) {
  return useWordPressApi(
    post ? () => fetchRelatedPosts(post, count) : null,
    [post?.id, count]
  );
}

/**
 * Hook to check WordPress connection status
 */
export function useWordPressConnection() {
  const [isConnected, setIsConnected] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      setLoading(true);
      const connected = await checkWordPressConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
      console.error('WordPress connection check failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    loading,
    checkConnection
  };
}

/**
 * Hook for infinite scrolling/pagination
 */
export function useInfinitePosts(params = {}) {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      
      const newPosts = await fetchPosts({
        ...params,
        page: page,
        per_page: params.per_page || 10
      });

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setAllPosts(prev => page === 1 ? newPosts : [...prev, ...newPosts]);
        setPage(prev => prev + 1);
        
        // If we got fewer posts than requested, we've reached the end
        if (newPosts.length < (params.per_page || 10)) {
          setHasMore(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load posts');
      console.error('WordPress infinite scroll error:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, JSON.stringify(params)]);

  const reset = useCallback(() => {
    setAllPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    reset();
    loadMore();
  }, [JSON.stringify(params)]);

  return {
    posts: allPosts,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
}

/**
 * Hook for post pagination with navigation
 */
export function usePaginatedPosts(params = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const postsPerPage = params.per_page || 10;
  
  const { data: posts, loading, error, refetch } = useWordPressApi(
    () => fetchPosts({
      ...params,
      page: currentPage,
      per_page: postsPerPage
    }),
    [currentPage, JSON.stringify(params)]
  );

  // Extract pagination info from WordPress headers would require custom fetch
  // For now, we'll estimate based on results
  useEffect(() => {
    if (posts) {
      // This is a simplified approach - in a real implementation,
      // you'd want to get total count from the API response headers
      if (posts.length < postsPerPage) {
        setTotalPages(currentPage);
      }
    }
  }, [posts, postsPerPage, currentPage]);

  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  return {
    posts: posts || [],
    loading,
    error,
    refetch,
    pagination: {
      currentPage,
      totalPages,
      totalPosts,
      postsPerPage,
      goToPage,
      nextPage,
      prevPage,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  };
}