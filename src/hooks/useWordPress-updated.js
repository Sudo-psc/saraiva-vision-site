/**
 * Enhanced WordPress hooks with SSL/CORS error handling
 * Uses the updated WordPress API with resilient GraphQL client
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllPosts,
  getPostBySlug,
  getAllPages,
  getPageBySlug,
  getAllServices,
  getServiceBySlug,
  getPopularServices,
  getAllTeamMembers,
  getTeamMemberBySlug,
  getFeaturedTestimonials,
  getAllTestimonials,
  getRecentPosts,
  getSiteSettings,
  getNavigationMenus,
  getPostsByCategory,
  getAllCategories,
  checkWordPressHealth
} from '../lib/wordpress-updated.js';

/**
 * Generic hook for WordPress content fetching with enhanced error handling
 */
const useWordPressContent = (fetchFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction();

      if (result.error) {
        // Handle retry logic for retryable errors
        if (result.error.shouldRetry && retryCount < maxRetries) {
          console.log(`Retrying WordPress content fetch (attempt ${retryCount + 1}/${maxRetries})`);
          setRetryCount(prev => prev + 1);
          setTimeout(fetchData, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return;
        }

        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
        setLastUpdated(Date.now());
        setRetryCount(0); // Reset retry count on success
      }
    } catch (err) {
      console.error('WordPress content fetch error:', err);
      setError({
        type: 'FETCH_ERROR',
        message: err.message || 'Failed to fetch content',
        shouldRetry: true
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, enabled, retryCount, maxRetries, retryDelay]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Refetch on window focus if enabled
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      const now = Date.now();
      if (!lastUpdated || now - lastUpdated > staleTime) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, staleTime, lastUpdated, fetchData]);

  const refetch = useCallback(() => {
    setRetryCount(0); // Reset retry count on manual refetch
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
    retryCount,
    canRetry: error?.shouldRetry && retryCount < maxRetries
  };
};

/**
 * Hook for WordPress health status
 */
export const useWordPressHealth = () => {
  const [health, setHealth] = useState({
    healthy: null,
    checking: true,
    lastCheck: null,
    error: null
  });

  const checkHealth = useCallback(async () => {
    try {
      setHealth(prev => ({ ...prev, checking: true }));
      const result = await checkWordPressHealth();
      setHealth({
        healthy: result.healthy,
        checking: false,
        lastCheck: Date.now(),
        error: result.error
      });
    } catch (error) {
      setHealth({
        healthy: false,
        checking: false,
        lastCheck: Date.now(),
        error: {
          type: 'UNKNOWN',
          message: 'Erro ao verificar saúde do WordPress'
        }
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    ...health,
    checkHealth
  };
};

// Hook for fetching all posts with pagination
export const usePosts = (options = {}) => {
  const { first = 10, after = null, ...hookOptions } = options;

  const fetchFunction = useCallback(
    () => getAllPosts({ first, after }),
    [first, after]
  );

  return useWordPressContent(fetchFunction, [first, after], hookOptions);
};

// Hook for fetching a single post by slug
export const usePost = (slug, options = {}) => {
  const fetchFunction = useCallback(
    () => getPostBySlug(slug),
    [slug]
  );

  return useWordPressContent(fetchFunction, [slug], {
    enabled: !!slug,
    ...options,
  });
};

// Hook for fetching recent posts
export const useRecentPosts = (count = 3, options = {}) => {
  const fetchFunction = useCallback(
    () => getRecentPosts(count),
    [count]
  );

  return useWordPressContent(fetchFunction, [count], options);
};

// Hook for fetching all pages
export const usePages = (options = {}) => {
  const fetchFunction = useCallback(
    () => getAllPages(),
    []
  );

  return useWordPressContent(fetchFunction, [], options);
};

// Hook for fetching a single page by slug
export const usePage = (slug, options = {}) => {
  const fetchFunction = useCallback(
    () => getPageBySlug(slug),
    [slug]
  );

  return useWordPressContent(fetchFunction, [slug], {
    enabled: !!slug,
    ...options,
  });
};

// Hook for fetching all services
export const useServices = (options = {}) => {
  const fetchFunction = useCallback(
    () => getAllServices(),
    []
  );

  return useWordPressContent(fetchFunction, [], options);
};

// Hook for fetching a single service by slug
export const useService = (slug, options = {}) => {
  const fetchFunction = useCallback(
    () => getServiceBySlug(slug),
    [slug]
  );

  return useWordPressContent(fetchFunction, [slug], {
    enabled: !!slug,
    ...options,
  });
};

// Hook for fetching popular services
export const usePopularServices = (count = 6, options = {}) => {
  const fetchFunction = useCallback(
    () => getPopularServices(count),
    [count]
  );

  return useWordPressContent(fetchFunction, [count], options);
};

// Hook for fetching all team members
export const useTeamMembers = (options = {}) => {
  const fetchFunction = useCallback(
    () => getAllTeamMembers(),
    []
  );

  return useWordPressContent(fetchFunction, [], options);
};

// Hook for fetching a single team member by slug
export const useTeamMember = (slug, options = {}) => {
  const fetchFunction = useCallback(
    () => getTeamMemberBySlug(slug),
    [slug]
  );

  return useWordPressContent(fetchFunction, [slug], {
    enabled: !!slug,
    ...options,
  });
};

// Hook for fetching featured testimonials
export const useFeaturedTestimonials = (count = 6, options = {}) => {
  const fetchFunction = useCallback(
    () => getFeaturedTestimonials(count),
    [count]
  );

  return useWordPressContent(fetchFunction, [count], options);
};

// Hook for fetching all testimonials
export const useTestimonials = (options = {}) => {
  const fetchFunction = useCallback(
    () => getAllTestimonials(),
    []
  );

  return useWordPressContent(fetchFunction, [], options);
};

// Hook for fetching site settings
export const useSiteSettings = (options = {}) => {
  const fetchFunction = useCallback(
    () => getSiteSettings(),
    []
  );

  return useWordPressContent(fetchFunction, [], {
    staleTime: 60 * 60 * 1000, // 1 hour - settings don't change often
    ...options,
  });
};

// Hook for fetching navigation menus
export const useNavigationMenus = (options = {}) => {
  const fetchFunction = useCallback(
    () => getNavigationMenus(),
    []
  );

  return useWordPressContent(fetchFunction, [], {
    staleTime: 60 * 60 * 1000, // 1 hour - navigation doesn't change often
    ...options,
  });
};

// Hook for fetching homepage data (combines multiple content types)
export const useHomepageData = (options = {}) => {
  const recentPosts = useRecentPosts(3, options);
  const popularServices = usePopularServices(6, options);
  const featuredTestimonials = useFeaturedTestimonials(6, options);
  const siteSettings = useSiteSettings(options);

  return {
    recentPosts,
    popularServices,
    featuredTestimonials,
    siteSettings,
    loading: recentPosts.loading || popularServices.loading || featuredTestimonials.loading || siteSettings.loading,
    error: recentPosts.error || popularServices.error || featuredTestimonials.error || siteSettings.error,
    refetch: () => {
      recentPosts.refetch();
      popularServices.refetch();
      featuredTestimonials.refetch();
      siteSettings.refetch();
    },
    hasRetryableError: [recentPosts, popularServices, featuredTestimonials, siteSettings].some(
      hook => hook.error?.shouldRetry && hook.canRetry
    )
  };
};

// Hook for fetching posts by category
export const usePostsByCategory = (categorySlug, options = {}) => {
  const { per_page = 12, ...hookOptions } = options;

  const fetchFunction = useCallback(
    () => getPostsByCategory(categorySlug, { first: per_page }),
    [categorySlug, per_page]
  );

  return useWordPressContent(fetchFunction, [categorySlug, per_page], {
    enabled: !!categorySlug,
    ...hookOptions,
  });
};

// Hook for fetching all categories
export const useCategories = (options = {}) => {
  const fetchFunction = useCallback(
    () => getAllCategories(),
    []
  );

  return useWordPressContent(fetchFunction, [], {
    staleTime: 60 * 60 * 1000, // 1 hour - categories don't change often
    ...options,
  });
};