// React hooks for consuming WordPress content
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
} from '../lib/wordpress-api.js';

// Generic hook for WordPress content fetching
const useWordPressContent = (fetchFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refreshInterval = null,
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction();

      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      console.error('WordPress content fetch error:', err);
      setError({
        type: 'FETCH_ERROR',
        message: err.message || 'Failed to fetch content',
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Auto refresh interval
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return undefined;

    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, fetchData]);

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
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
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

  return {
    recentPosts,
    popularServices,
    featuredTestimonials,
    loading: recentPosts.loading || popularServices.loading || featuredTestimonials.loading,
    error: recentPosts.error || popularServices.error || featuredTestimonials.error,
    refetch: () => {
      recentPosts.refetch();
      popularServices.refetch();
      featuredTestimonials.refetch();
    },
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
