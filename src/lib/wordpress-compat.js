/**
 * WordPress Compatibility Layer
 * Provides backward compatibility for BlogPage.jsx functions
 * Maps old function names to new WordPress API functions
 */

import {
  getAllPosts,
  getAllCategories,
  getPostBySlug,
  getRecentPosts,
  getPostsByCategory
} from './wordpress-api.js';
import {
  getFeaturedImageUrl as getFeaturedImageUrlOriginal,
  extractPlainText as extractPlainTextOriginal
} from './wordpress.js';
import {
  sanitizeWordPressContent,
  sanitizeWordPressExcerpt,
  sanitizeWordPressTitle
} from '@/utils/sanitizeWordPressContent';

// Health check function
export const checkWordPressConnection = async () => {
  try {
    const response = await fetch('/api/wordpress-health?detailed=true', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WordPress health check falhou (${response.status})`);
    }

    const payload = await response.json();

    return {
      isConnected: Boolean(payload.isHealthy),
      error: payload.error || null,
      healthState: payload.healthState || payload.stats || null
    };
  } catch (error) {
    console.error('WordPress connection check failed:', error);
    return {
      isConnected: false,
      error: error.message || 'Connection failed',
      healthState: 'unhealthy'
    };
  }
};

// Fetch categories with backward compatibility
export const fetchCategories = async () => {
  try {
    const result = await getAllCategories();

    if (result.error) {
      console.error('Error fetching categories:', result.error);
      return [];
    }

    // Transform GraphQL categories to REST API format for compatibility
    return result.categories.map(category => ({
      id: category.databaseId || category.id,
      name: category.name,
      slug: category.slug,
      count: category.count || 0,
      description: category.description || ''
    }));
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    return [];
  }
};

// Fetch posts with backward compatibility and REST API format
export const fetchPosts = async (params = {}) => {
  try {
    const {
      per_page = 10,
      page = 1,
      categories = null,
      search = null
    } = params;

    // Convert pagination parameters - use exact amount needed
    const first = per_page;
    // Calculate offset for page-based pagination
    const offset = (page - 1) * per_page;

    let result;

    // Handle category-specific queries efficiently
    if (categories && categories.length > 0) {
      // Use category-specific API for better performance
      const categoryId = categories[0]; // For now, handle first category
      try {
        const categoryResult = await getPostsByCategory(categoryId, { first: first + offset });
        result = {
          posts: categoryResult.posts || [],
          error: categoryResult.error,
          isFallback: categoryResult.isFallback,
          fallbackMeta: categoryResult.fallbackMeta,
          healthState: categoryResult.healthState
        };
      } catch (error) {
        console.warn('Category-specific query failed, falling back to general query:', error);
        result = await getAllPosts({ first: first + offset });
      }
    } else {
      // Use efficient pagination: only fetch what we need
      result = await getAllPosts({ first: first + offset });
    }

    const apiError = result.error;
    const isFallback = Boolean(result.isFallback);
    const fallbackMeta = result.fallbackMeta || null;
    const healthState = result.healthState || null;

    if (apiError && !isFallback) {
      throw new Error(apiError.message || apiError);
    }

    let posts = result.posts || [];

    // Only apply client-side filtering for search (temporary solution until GraphQL search is implemented)
    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(post =>
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination only if we fetched more than needed (due to offset approximation)
    if (!categories || categories.length === 0) {
      // Skip the offset amount and take only what we need
      posts = posts.slice(offset, offset + per_page);
    } else {
      // For category queries, skip the offset amount and take only what we need
      posts = posts.slice(offset, offset + per_page);
    }

    // Transform GraphQL posts to REST API format for compatibility
    const mappedPosts = posts.map(post => {
      const sanitizedTitle = sanitizeWordPressTitle(post.title || '');
      const sanitizedContent = sanitizeWordPressContent(post.content || '');
      const sanitizedExcerpt = sanitizeWordPressExcerpt(post.excerpt || '');

      return {
        id: post.databaseId || post.id,
        slug: post.slug,
        title: {
          rendered: sanitizedTitle
        },
        content: {
          rendered: sanitizedContent
        },
        excerpt: {
          rendered: sanitizedExcerpt
        },
        date: post.date,
        modified: post.modified || post.date,
        categories: post.categories?.nodes?.map(cat => cat.databaseId) || [],
        featuredImage: post.featuredImage,
        author: post.author,
        _embedded: {
          'wp:featuredmedia': post.featuredImage ? [{
            id: post.featuredImage.node?.databaseId,
            source_url: post.featuredImage.node?.sourceUrl,
            alt_text: (post.featuredImage.node?.altText || '')
              .replace(/<[^>]*>/g, '') // Strip HTML tags
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&nbsp;/g, ' ')
              .trim()
              .replace(/"/g, '&quot;') // Escape quotes for HTML attribute
          }] : [],
          'wp:term': post.categories?.nodes ? [[
            ...post.categories.nodes.map(cat => ({
              id: cat.databaseId,
              name: cat.name,
              slug: cat.slug
            }))
          ]] : []
        }
      };
    });

    if (isFallback || fallbackMeta || healthState || apiError) {
      mappedPosts.meta = {
        isFallback,
        fallbackMeta,
        healthState,
        error: apiError,
      };
    }

    return mappedPosts;

  } catch (error) {
    console.error('Error in fetchPosts:', error);
    throw error;
  }
};

// Re-export utility functions with the same names
export const getFeaturedImageUrl = (post) => {
  // Handle both GraphQL and REST API post formats
  if (post.featuredImage?.node?.sourceUrl) {
    return post.featuredImage.node.sourceUrl;
  }
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  return getFeaturedImageUrlOriginal(post);
};

export const extractPlainText = (html, maxLength = null) => {
  return extractPlainTextOriginal(html, maxLength);
};

// Export additional helper functions - renamed to avoid circular import
export { getPostBySlug } from './wordpress-api.js';