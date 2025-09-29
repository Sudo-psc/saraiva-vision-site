/**
 * WordPress Compatibility Layer
 * Provides backward compatibility for BlogPage.jsx functions
 * Uses WordPress REST API via WordPressBlogService (avoiding GraphQL 502 errors)
 */

import WordPressBlogService from '@/services/WordPressBlogService.js';
import {
  sanitizeWordPressContent,
  sanitizeWordPressExcerpt,
  sanitizeWordPressTitle
} from '@/utils/sanitizeWordPressContent';
import { createLogger } from './logger.js';
import { classifyError, getUserFriendlyError } from './errorHandling.js';

// Initialize REST API service (NOT GraphQL)
const blogService = new WordPressBlogService({
  baseURL: import.meta.env.VITE_WORDPRESS_API_URL || 'https://blog.saraivavision.com.br',
  cmsBaseURL: import.meta.env.VITE_WORDPRESS_SITE_URL || 'https://cms.saraivavision.com.br',
  cacheEnabled: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  useJWTAuth: false // Public endpoints don't need JWT
});

const blogLogger = createLogger('blog-fallback');

const emitLog = (level, message, metadata = {}) => {
  if (!blogLogger || typeof blogLogger[level] !== 'function') return;
  Promise.resolve(blogLogger[level](message, metadata)).catch(() => {});
};

const normalizeError = (error) => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (error && typeof error === 'object') {
    const normalized = new Error(error.message || 'WordPress request failed');
    return Object.assign(normalized, error);
  }

  return new Error('Unknown WordPress error');
};

const buildErrorDetails = (error, context = {}) => {
  if (!error) return null;

  const normalized = normalizeError(error);
  const classification = classifyError(normalized);
  const friendly = getUserFriendlyError(normalized);

  return {
    type: classification.type,
    code: classification.code,
    message: friendly.userMessage || normalized.message,
    originalMessage: normalized.message,
    severity: friendly.severity,
    retryable: friendly.retryable !== false,
    timestamp: new Date().toISOString(),
    context
  };
};

// Health check function using REST API
export const checkWordPressConnection = async () => {
  try {
    // Simple ping to WordPress REST API root
    const result = await blogService.makeRequest('/', { params: { _fields: 'name' } });

    return {
      isConnected: Boolean(result && result.name),
      error: null,
      healthState: 'healthy'
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

// Fetch categories using REST API
export const fetchCategories = async () => {
  try {
    const categories = await blogService.getCategories({
      hide_empty: false,
      per_page: 100
    });

    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    emitLog('error', 'Categories fetch failed', { error: error.message });
    return []; // Return empty array as fallback
  }
};

// Fetch posts using REST API directly
export const fetchPosts = async (params = {}) => {
  try {
    const {
      per_page = 10,
      page = 1,
      categories = null,
      search = null
    } = params;

    // Build REST API parameters
    const apiParams = {
      per_page,
      page,
      _embed: true // Include embedded data (featured image, author, categories)
    };

    // Add category filter if specified
    if (categories && categories.length > 0) {
      apiParams.categories = Array.isArray(categories) ? categories.join(',') : categories;
    }

    // Add search if specified
    if (search) {
      apiParams.search = search;
    }

    // Fetch posts via REST API
    const posts = await blogService.getPosts(apiParams);

    if (!Array.isArray(posts)) {
      throw new Error('Invalid response from WordPress API');
    }

    // Posts are already in correct REST API format, just sanitize content
    const sanitizedPosts = posts.map(post => ({
      ...post,
      title: {
        ...post.title,
        rendered: sanitizeWordPressTitle(post.title?.rendered || '')
      },
      content: {
        ...post.content,
        rendered: sanitizeWordPressContent(post.content?.rendered || '')
      },
      excerpt: {
        ...post.excerpt,
        rendered: sanitizeWordPressExcerpt(post.excerpt?.rendered || '')
      }
    }));

    emitLog('info', 'WordPress posts fetched successfully via REST API', {
      count: sanitizedPosts.length,
      page,
      per_page,
      hasCategories: Boolean(categories),
      hasSearch: Boolean(search)
    });

    return sanitizedPosts;

  } catch (error) {
    const errorDetails = buildErrorDetails(error, {
      stage: 'fetchPosts_rest_api',
      params,
      timestamp: new Date().toISOString()
    });

    emitLog('error', 'WordPress posts fetch failed', errorDetails);

    // Return fallback posts instead of throwing
    console.warn('Returning fallback posts due to API error:', error.message);

    return [
      {
        id: 1,
        slug: 'fallback-post-1',
        title: { rendered: 'Conteúdo em Manutenção' },
        excerpt: { rendered: '<p>Nosso blog está temporariamente indisponível. Tente novamente em alguns instantes.</p>' },
        content: { rendered: '<p>Nosso blog está temporariamente indisponível. Estamos trabalhando para restaurar o serviço o mais rápido possível.</p>' },
        date: new Date().toISOString(),
        _embedded: {
          'wp:featuredmedia': [],
          'wp:term': [[]]
        }
      }
    ];
  }
};

// Get single post by slug using REST API
export const getPostBySlug = async (slug) => {
  try {
    const post = await blogService.getPostBySlug(slug);

    if (!post) {
      console.warn(`Post not found: ${slug}`);
      return null;
    }

    // Sanitize content
    return {
      ...post,
      title: {
        ...post.title,
        rendered: sanitizeWordPressTitle(post.title?.rendered || '')
      },
      content: {
        ...post.content,
        rendered: sanitizeWordPressContent(post.content?.rendered || '')
      },
      excerpt: {
        ...post.excerpt,
        rendered: sanitizeWordPressExcerpt(post.excerpt?.rendered || '')
      }
    };
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    emitLog('error', 'Post fetch failed', { slug, error: error.message });
    return null; // Return null instead of throwing
  }
};

// Utility functions
export const getFeaturedImageUrl = (post) => {
  // Handle REST API format
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  // Handle direct media URL
  if (post.featured_media_url) {
    return post.featured_media_url;
  }
  // Handle legacy GraphQL format (if any)
  if (post.featuredImage?.node?.sourceUrl) {
    return post.featuredImage.node.sourceUrl;
  }
  return null;
};

export const extractPlainText = (html, maxLength = null) => {
  if (!html) return '';

  // Remove HTML tags
  const text = html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  if (maxLength && text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }

  return text;
};