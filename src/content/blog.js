/**
 * Blog Content API (Optimized)
 * Backward-compatible wrapper for lazy-loaded blog posts
 *
 * MIGRATION STRATEGY:
 * 1. This file maintains the same API as before
 * 2. Under the hood, uses lazy loading for performance
 * 3. Gradual migration: components can be updated one by one
 * 4. Zero breaking changes to existing code
 */

import blogPostsLoader from '../data/blogPostsLoader.js';
import { blogPosts as legacyPosts } from '../data/blogPosts.js';

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

// Legacy synchronous import (heavy)
let legacyBlogPostsCache = null;

const getLegacyBlogPosts = () => {
  if (legacyBlogPostsCache) return legacyBlogPostsCache;

  // Use static import for SSR environments, avoid require in browser
  if (typeof window === 'undefined') {
    // SSR environment - use static import
    legacyBlogPostsCache = legacyPosts;
    return legacyBlogPostsCache;
  }

  // Browser environment - return cached posts or empty array
  // Client bundles should use async API instead
  try {
    legacyBlogPostsCache = legacyPosts;
    return legacyBlogPostsCache;
  } catch (error) {
    console.warn('Legacy blog posts not available in browser environment, use async API instead');
    return [];
  }
};

// Export for backward compatibility (synchronous, heavy)
export const blogPosts = getLegacyBlogPosts();

/**
 * OPTIMIZED ASYNC API (recommended)
 * Use these in new/refactored components for better performance
 */

/**
 * Get posts metadata (lightweight, ~10KB)
 * Use this for blog listing, search, navigation
 */
export const getBlogPostsMetadata = async () => {
  return await blogPostsLoader.getPostsMetadata();
};

/**
 * Get single post by slug (loads only when needed)
 */
export const getPostBySlug = async (slug) => {
  return await blogPostsLoader.getPostBySlug(slug);
};

/**
 * Get recent posts (lightweight metadata only)
 */
export const getRecentPosts = async (limit = 3) => {
  return await blogPostsLoader.getRecentPosts(limit);
};

/**
 * Get featured posts (lightweight metadata only)
 */
export const getFeaturedPosts = async (limit = 3) => {
  return await blogPostsLoader.getFeaturedPosts(limit);
};

/**
 * Get posts by category (lightweight metadata only)
 */
export const getPostsByCategory = async (category) => {
  return await blogPostsLoader.getPostsByCategory(category);
};

/**
 * Search posts (lightweight metadata only)
 */
export const searchBlogPosts = async (searchTerm) => {
  return await blogPostsLoader.searchPosts(searchTerm);
};

/**
 * Preload critical posts during idle time
 * Call this in App.jsx or main layout after initial render
 */
export const preloadCriticalBlogPosts = () => {
  blogPostsLoader.preloadCriticalPosts();
};

/**
 * LEGACY SYNCHRONOUS FUNCTIONS (for backward compatibility)
 * These maintain the old API but are less performant
 */

// Synchronous fallback for getPostBySlug (legacy)
export const getPostBySlugSync = (slug) => {
  const posts = getLegacyBlogPosts();
  return posts.find(post => post.slug === slug) || null;
};

// Synchronous fallback for getRecentPosts (legacy)
export const getRecentPostsSync = (limit = 3) => {
  const posts = getLegacyBlogPosts();
  return posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

/**
 * Export everything for compatibility
 */
export default {
  // Configuration (lightweight)
  categoryConfig,
  categories,

  // Async API (recommended, optimized)
  getBlogPostsMetadata,
  getPostBySlug,
  getRecentPosts,
  getFeaturedPosts,
  getPostsByCategory,
  searchBlogPosts,
  preloadCriticalBlogPosts,

  // Legacy API (synchronous, heavy)
  blogPosts,
  getPostBySlugSync,
  getRecentPostsSync
};
