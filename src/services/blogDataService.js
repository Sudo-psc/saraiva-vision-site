/**
 * Blog Data Service with Sanity CMS + Static Fallback
 *
 * Provides a unified API for blog data with intelligent fallback:
 * 1. Try to fetch from Sanity CMS (primary source)
 * 2. On failure, fall back to static blog posts
 * 3. Maintains same API as blogPostsLoader.js for drop-in replacement
 *
 * Author: Dr. Philipe Saraiva Cruz
 * Date: 2025-10-25
 */

// Use centralized Sanity client from lib
import { sanityClient } from '../lib/sanityClient.js';
import {
  fetchAllPosts as fetchAllPostsFromSanity,
  fetchPostBySlug as fetchPostBySlugFromSanity,
  fetchPostsByCategory as fetchPostsByCategoryFromSanity,
  fetchFeaturedPosts as fetchFeaturedPostsFromSanity,
  searchPosts as searchPostsFromSanity
} from '../lib/sanityUtils.js';

// Lazy import for static fallback (only load when needed)
let staticPostsModule = null;
const getStaticPosts = async () => {
  if (!staticPostsModule) {
    staticPostsModule = await import('../data/enhancedBlogPosts.js');
  }
  return staticPostsModule.enhancedBlogPosts || [];
};

// Cache management
let postsMetadataCache = null;
let fullPostsCache = new Map();
let usingSanity = true; // Track whether we're using Sanity or fallback
let lastHealthCheck = null;
let healthCheckInterval = 60000; // Check health every 60 seconds

/**
 * Check if we should try Sanity or go straight to fallback
 * Implements circuit breaker pattern to avoid repeated failures
 */
const shouldTrySanity = () => {
  if (!lastHealthCheck) return true;

  const now = Date.now();
  if (now - lastHealthCheck.timestamp < healthCheckInterval) {
    return lastHealthCheck.healthy;
  }

  return true; // Try again after interval
};

/**
 * Update health check status
 */
const updateHealthCheck = (healthy) => {
  lastHealthCheck = {
    healthy,
    timestamp: Date.now()
  };
};

// Note: Sanity data normalization is now handled by transformBlogPost in sanityUtils.js

/**
 * Fetch data with Sanity primary, static fallback
 * @param {Function} sanityFetcher - Async function to fetch from Sanity
 * @param {Function} staticFallback - Async function to get static data
 * @param {string} operationName - Operation name for logging
 * @returns {Promise<any>}
 */
const fetchWithFallback = async (sanityFetcher, staticFallback, operationName) => {
  // Try Sanity if circuit breaker allows
  if (shouldTrySanity()) {
    try {
      const data = await sanityFetcher();
      updateHealthCheck(true);
      usingSanity = true;

      // Data is already normalized by sanityUtils functions
      return data;
    } catch (error) {
      console.warn(`[BlogDataService] Sanity ${operationName} failed, falling back to static data:`, error.message);
      updateHealthCheck(false);
      usingSanity = false;
    }
  }

  // Fallback to static data
  try {
    const staticData = await staticFallback();
    return staticData;
  } catch (error) {
    console.error(`[BlogDataService] Both Sanity and static fallback failed for ${operationName}:`, error);
    return Array.isArray(await staticFallback()) ? [] : null;
  }
};

/**
 * Get posts metadata only (titles, slugs, dates, categories)
 * Used for: Blog listing page, navigation, search
 * Size: ~10KB vs 208KB full bundle
 */
export const getPostsMetadata = async () => {
  if (postsMetadataCache) return postsMetadataCache;

  const data = await fetchWithFallback(
    // Sanity fetcher
    async () => {
      const posts = await fetchAllPostsFromSanity();
      return posts;
    },
    // Static fallback
    async () => {
      const staticPosts = await getStaticPosts();
      return staticPosts.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        date: post.date,
        category: post.category,
        tags: post.tags || [],
        image: post.image,
        featured: post.featured || false,
        seo: post.seo || {},
        contentLength: post.content?.length || 0,
        contentType: 'html'
      }));
    },
    'getPostsMetadata'
  );

  postsMetadataCache = data;
  return data;
};

/**
 * Get single post by slug with full content
 * Used for: Individual blog post pages
 * Only loads when user navigates to specific post
 */
export const getPostBySlug = async (slug) => {
  if (!slug) return null;

  // Check cache first
  if (fullPostsCache.has(slug)) {
    return fullPostsCache.get(slug);
  }

  const post = await fetchWithFallback(
    // Sanity fetcher
    async () => {
      const result = await fetchPostBySlugFromSanity(slug);
      return result;
    },
    // Static fallback
    async () => {
      const staticPosts = await getStaticPosts();
      return staticPosts.find(p => p.slug === slug) || null;
    },
    `getPostBySlug(${slug})`
  );

  if (post) {
    fullPostsCache.set(slug, post);
  }

  return post;
};

/**
 * Get recent posts (metadata only) for homepage
 * Much lighter than loading all posts
 */
export const getRecentPosts = async (limit = 3) => {
  const metadata = await getPostsMetadata();
  return metadata
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

/**
 * Get featured posts (metadata only)
 */
export const getFeaturedPosts = async (limit = 3) => {
  const data = await fetchWithFallback(
    // Sanity fetcher
    async () => {
      const posts = await fetchFeaturedPostsFromSanity();
      return posts.slice(0, limit);
    },
    // Static fallback
    async () => {
      const metadata = await getPostsMetadata();
      return metadata
        .filter(post => post.featured)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    },
    'getFeaturedPosts'
  );

  return data;
};

/**
 * Get posts by category (metadata only)
 */
export const getPostsByCategory = async (category) => {
  if (!category || category === 'Todas') {
    return await getPostsMetadata();
  }

  const data = await fetchWithFallback(
    // Sanity fetcher
    async () => {
      const posts = await fetchPostsByCategoryFromSanity(category);
      return posts;
    },
    // Static fallback
    async () => {
      const metadata = await getPostsMetadata();
      return metadata.filter(post => post.category === category);
    },
    `getPostsByCategory(${category})`
  );

  return data;
};

/**
 * Search posts (metadata only for performance)
 */
export const searchPosts = async (searchTerm) => {
  if (!searchTerm) return await getPostsMetadata();

  const term = searchTerm.toLowerCase();

  const data = await fetchWithFallback(
    // Sanity fetcher
    async () => {
      const posts = await searchPostsFromSanity(searchTerm);
      return posts;
    },
    // Static fallback
    async () => {
      const metadata = await getPostsMetadata();
      return metadata.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    },
    `searchPosts(${searchTerm})`
  );

  return data;
};

/**
 * Preload critical posts for better UX
 * Call this after initial page load during idle time
 */
export const preloadCriticalPosts = async () => {
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback for non-blocking preload
  const preload = async () => {
    try {
      const featured = await getFeaturedPosts(3);
      const recent = await getRecentPosts(3);

      // Preload full content for featured/recent posts
      const criticalSlugs = [...new Set([
        ...featured.map(p => p.slug),
        ...recent.map(p => p.slug)
      ])].slice(0, 5); // Max 5 posts

      await Promise.all(
        criticalSlugs.map(slug => getPostBySlug(slug))
      );
    } catch (error) {
      console.warn('[BlogDataService] Preload failed:', error);
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 3000 });
  } else {
    setTimeout(preload, 2000);
  }
};

/**
 * Clear cache (useful for development/testing)
 */
export const clearCache = () => {
  postsMetadataCache = null;
  fullPostsCache.clear();
  lastHealthCheck = null;
  usingSanity = true;
  console.log('[BlogDataService] Cache cleared');
};

/**
 * Get cache and system stats for monitoring
 */
export const getCacheStats = () => {
  return {
    metadataCached: !!postsMetadataCache,
    metadataCount: postsMetadataCache?.length || 0,
    fullPostsCached: fullPostsCache.size > 0,
    fullPostsCount: fullPostsCache.size,
    usingSanity,
    lastHealthCheck: lastHealthCheck ? {
      healthy: lastHealthCheck.healthy,
      age: Date.now() - lastHealthCheck.timestamp
    } : null
  };
};

/**
 * Force refresh from Sanity (bypass cache and circuit breaker)
 * Useful for admin operations or manual refresh
 */
export const forceRefresh = async () => {
  console.log('[BlogDataService] Forcing refresh from Sanity');
  clearCache();
  updateHealthCheck(true); // Reset circuit breaker
  return await getPostsMetadata();
};

/**
 * Get data source info for debugging
 */
export const getDataSource = () => {
  return {
    current: usingSanity ? 'sanity' : 'static',
    usingSanity,
    canTrySanity: shouldTrySanity(),
    lastHealthCheck
  };
};

// Export everything for compatibility with blogPostsLoader API
export const blogDataService = {
  getPostsMetadata,
  getPostBySlug,
  getRecentPosts,
  getFeaturedPosts,
  getPostsByCategory,
  searchPosts,
  preloadCriticalPosts,
  clearCache,
  getCacheStats,
  forceRefresh,
  getDataSource
};

export default blogDataService;
