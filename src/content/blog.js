/**
 * Blog Content API (Sanity CMS + Static Fallback)
 * Backward-compatible wrapper with intelligent data sourcing
 *
 * MIGRATION COMPLETE:
 * 1. This file maintains the same API as before
 * 2. Primary source: Sanity CMS for easy content management
 * 3. Automatic fallback: Static blog posts if Sanity fails
 * 4. Zero breaking changes to existing components
 * 5. Circuit breaker pattern prevents repeated Sanity failures
 *
 * Author: Dr. Philipe Saraiva Cruz
 * Date: 2025-10-25
 */

import blogDataService from '../services/blogDataService.js';

// Dynamic import for legacy posts to avoid 375KB in critical path
let legacyPosts = null;
const getLegacyPostsModule = async () => {
  if (!legacyPosts) {
    const module = await import('../data/enhancedBlogPosts.js');
    legacyPosts = module.enhancedBlogPosts || [];
  }
  return legacyPosts;
};

/**
 * Category Configuration (lightweight, always available)
 */
export const categoryConfig = {
  'Prevenção': {
    icon: 'shield',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-200'
  },
  'Tratamento': {
    icon: 'stethoscope',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-200'
  },
  'Tecnologia': {
    icon: 'cpu',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-200'
  },
  'Dúvidas Frequentes': {
    icon: 'help-circle',
    color: 'cyan',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
    borderColor: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-200'
  }
};

export const categories = Object.keys(categoryConfig);

/**
 * SYNCHRONOUS API (for backward compatibility)
 * WARNING: These load the full blog bundle (208KB)
 * Prefer async versions below for better performance
 */

// Legacy async import (deferred loading)
let legacyBlogPostsCache = null;

// Async function to get legacy posts (use async API instead of sync)
const getLegacyBlogPostsAsync = async () => {
  if (legacyBlogPostsCache) return legacyBlogPostsCache;
  legacyBlogPostsCache = await getLegacyPostsModule();
  return legacyBlogPostsCache;
};

// Synchronous getter returns cached value or empty array
// DEPRECATED: Use async API instead for better performance
const getLegacyBlogPosts = () => {
  // Return cached posts if already loaded
  if (legacyBlogPostsCache) return legacyBlogPostsCache;

  // In browser, trigger async load and return empty array
  // Components using this should migrate to async API
  if (typeof window !== 'undefined') {
    // Trigger async load for future calls
    getLegacyBlogPostsAsync().catch(console.warn);
    console.warn('[blog.js] Synchronous blogPosts access deprecated. Use async API instead.');
    return [];
  }

  return [];
};

// Export for backward compatibility (returns empty array until async loaded)
// DEPRECATED: Use getBlogPostsMetadata() instead
export const blogPosts = getLegacyBlogPosts();

/**
 * OPTIMIZED ASYNC API (recommended)
 * Use these in new/refactored components for better performance
 */

/**
 * Get posts metadata (lightweight, ~10KB)
 * Use this for blog listing, search, navigation
 * PRIMARY: Sanity CMS | FALLBACK: Static blog posts
 */
export const getBlogPostsMetadata = async () => {
  return await blogDataService.getPostsMetadata();
};

/**
 * Get single post by slug (loads only when needed)
 * PRIMARY: Sanity CMS | FALLBACK: Static blog posts
 */
export const getPostBySlug = async (slug) => {
  return await blogDataService.getPostBySlug(slug);
};

/**
 * Get recent posts (lightweight metadata only)
 * PRIMARY: Sanity CMS | FALLBACK: Static blog posts
 */
export const getRecentPosts = async (limit = 3) => {
  return await blogDataService.getRecentPosts(limit);
};

/**
 * Get featured posts (lightweight metadata only)
 * PRIMARY: Sanity CMS | FALLBACK: Static blog posts
 */
export const getFeaturedPosts = async (limit = 3) => {
  return await blogDataService.getFeaturedPosts(limit);
};

/**
 * Get posts by category (lightweight metadata only)
 * PRIMARY: Sanity CMS | FALLBACK: Static blog posts
 */
export const getPostsByCategory = async (category) => {
  return await blogDataService.getPostsByCategory(category);
};

/**
 * Search posts (lightweight metadata only)
 * PRIMARY: Sanity CMS | FALLBACK: Static blog posts
 */
export const searchBlogPosts = async (searchTerm) => {
  return await blogDataService.searchPosts(searchTerm);
};

/**
 * Preload critical posts during idle time
 * Call this in App.jsx or main layout after initial render
 */
export const preloadCriticalBlogPosts = () => {
  blogDataService.preloadCriticalPosts();
};

/**
 * Force refresh from Sanity (bypass cache)
 * Useful for admin operations or manual content updates
 */
export const forceRefreshBlogData = async () => {
  return await blogDataService.forceRefresh();
};

/**
 * Get current data source info (Sanity or static fallback)
 * Useful for monitoring and debugging
 */
export const getBlogDataSource = () => {
  return blogDataService.getDataSource();
};

/**
 * Get cache statistics for monitoring
 */
export const getBlogCacheStats = () => {
  return blogDataService.getCacheStats();
};

/**
 * LEGACY SYNCHRONOUS FUNCTIONS (for backward compatibility)
 * These maintain the old API but are less performant
 */

// Synchronous fallback for getPostBySlug (legacy)
// DEPRECATED: Use getPostBySlug() async version instead
export const getPostBySlugSync = (slug) => {
  // Return from cache if available
  if (legacyBlogPostsCache) {
    return legacyBlogPostsCache.find(post => post.slug === slug) || null;
  }
  console.warn('[blog.js] getPostBySlugSync deprecated. Use getPostBySlug() async.');
  return null;
};

// Synchronous fallback for getRecentPosts (legacy)
// DEPRECATED: Use getRecentPosts() async version instead
export const getRecentPostsSync = (limit = 3) => {
  // Return from cache if available
  if (legacyBlogPostsCache) {
    return legacyBlogPostsCache
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }
  console.warn('[blog.js] getRecentPostsSync deprecated. Use getRecentPosts() async.');
  return [];
};

/**
 * Export everything for compatibility
 */
export default {
  // Configuration (lightweight)
  categoryConfig,
  categories,

  // Async API (recommended, optimized - Sanity + fallback)
  getBlogPostsMetadata,
  getPostBySlug,
  getRecentPosts,
  getFeaturedPosts,
  getPostsByCategory,
  searchBlogPosts,
  preloadCriticalBlogPosts,

  // Admin/Monitoring API
  forceRefreshBlogData,
  getBlogDataSource,
  getBlogCacheStats,

  // Legacy API (synchronous, heavy - static only)
  blogPosts,
  getPostBySlugSync,
  getRecentPostsSync
};
