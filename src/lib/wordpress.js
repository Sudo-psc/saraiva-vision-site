/**
 * WordPress REST API Service
 * Handles all WordPress headless CMS API interactions
 * Implements caching, error handling, and security best practices
 */

// Get WordPress API URL from environment with fallback
// Accepts either the site base (e.g. https://example.com) or the full API base (https://example.com/wp-json/wp/v2)
const RAW_WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_API_URL || 'https://saraivavision.com.br/cms';
const NORMALIZED_BASE = (RAW_WORDPRESS_URL || '').replace(/\/$/, '');
const API_BASE_URL = NORMALIZED_BASE.includes('/wp-json')
  ? NORMALIZED_BASE
  : `${NORMALIZED_BASE}/wp-json/wp/v2`;

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

/**
 * Generic API fetch with error handling and caching
 */
async function wpApiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache successful responses
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error('WordPress API fetch error:', error);
    throw error;
  }
}

/**
 * Fetch posts with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.per_page - Posts per page (default: 10)
 * @param {number} params.page - Page number (default: 1)
 * @param {string} params.search - Search query
 * @param {Array} params.categories - Category IDs to filter by
 * @param {Array} params.tags - Tag IDs to filter by
 * @param {string} params.orderby - Order by field (default: date)
 * @param {string} params.order - Order direction (default: desc)
 */
export async function fetchPosts(params = {}) {
  const defaultParams = {
    per_page: 10,
    page: 1,
    orderby: 'date',
    order: 'desc',
    _embed: true, // Include embedded data (featured media, author, etc.)
    status: 'publish'
  };

  const queryParams = { ...defaultParams, ...params };
  const queryString = new URLSearchParams(queryParams).toString();
  
  return await wpApiFetch(`/posts?${queryString}`);
}

/**
 * Fetch a single post by slug
 * @param {string} slug - Post slug
 */
export async function fetchPostBySlug(slug) {
  if (!slug) {
    throw new Error('Post slug is required');
  }

  const posts = await wpApiFetch(`/posts?slug=${encodeURIComponent(slug)}&_embed=true`);
  
  if (!posts || posts.length === 0) {
    throw new Error('Post not found');
  }

  return posts[0];
}

/**
 * Fetch a single post by ID
 * @param {number} id - Post ID
 */
export async function fetchPostById(id) {
  if (!id) {
    throw new Error('Post ID is required');
  }

  return await wpApiFetch(`/posts/${id}?_embed=true`);
}

/**
 * Fetch categories
 * @param {Object} params - Query parameters
 */
export async function fetchCategories(params = {}) {
  const defaultParams = {
    per_page: 100,
    orderby: 'count',
    order: 'desc',
    hide_empty: true
  };

  const queryParams = { ...defaultParams, ...params };
  const queryString = new URLSearchParams(queryParams).toString();
  
  return await wpApiFetch(`/categories?${queryString}`);
}

/**
 * Fetch posts by category
 * @param {string} categorySlug - Category slug
 * @param {Object} params - Additional query parameters
 */
export async function fetchPostsByCategory(categorySlug, params = {}) {
  if (!categorySlug) {
    throw new Error('Category slug is required');
  }

  // First, get the category ID from the slug
  const categories = await fetchCategories({ slug: categorySlug });
  if (!categories || categories.length === 0) {
    throw new Error('Category not found');
  }

  const categoryId = categories[0].id;
  
  return await fetchPosts({
    categories: [categoryId],
    ...params
  });
}

/**
 * Fetch tags
 * @param {Object} params - Query parameters
 */
export async function fetchTags(params = {}) {
  const defaultParams = {
    per_page: 100,
    orderby: 'count',
    order: 'desc',
    hide_empty: true
  };

  const queryParams = { ...defaultParams, ...params };
  const queryString = new URLSearchParams(queryParams).toString();
  
  return await wpApiFetch(`/tags?${queryString}`);
}

/**
 * Search posts
 * @param {string} searchTerm - Search query
 * @param {Object} params - Additional query parameters
 */
export async function searchPosts(searchTerm, params = {}) {
  if (!searchTerm) {
    return [];
  }

  return await fetchPosts({
    search: searchTerm,
    ...params
  });
}

/**
 * Get featured posts (posts with specific meta or category)
 * @param {Object} params - Query parameters
 */
export async function fetchFeaturedPosts(params = {}) {
  return await fetchPosts({
    per_page: 5,
    orderby: 'date',
    order: 'desc',
    ...params
  });
}

/**
 * Get recent posts
 * @param {number} count - Number of recent posts to fetch
 */
export async function fetchRecentPosts(count = 5) {
  return await fetchPosts({
    per_page: count,
    orderby: 'date',
    order: 'desc'
  });
}

/**
 * Get related posts based on categories and tags
 * @param {Object} post - Current post object
 * @param {number} count - Number of related posts to fetch
 */
export async function fetchRelatedPosts(post, count = 3) {
  if (!post) {
    return [];
  }

  const categories = post.categories || [];
  const tags = post.tags || [];

  // Fetch posts with same categories or tags, excluding current post
  const relatedByCategory = categories.length > 0 
    ? await fetchPosts({
        categories,
        per_page: count + 1, // +1 to account for current post
        exclude: [post.id]
      })
    : [];

  if (relatedByCategory.length >= count) {
    return relatedByCategory.slice(0, count);
  }

  // If not enough related by category, try tags
  if (tags.length > 0) {
    const relatedByTags = await fetchPosts({
      tags,
      per_page: count,
      exclude: [post.id, ...relatedByCategory.map(p => p.id)]
    });
    
    return [...relatedByCategory, ...relatedByTags].slice(0, count);
  }

  return relatedByCategory.slice(0, count);
}

/**
 * Utility functions for post data processing
 */

/**
 * Clean HTML content for safe display
 * @param {string} htmlContent - HTML content to clean
 */
export function cleanHtmlContent(htmlContent) {
  if (!htmlContent) return '';
  
  // Remove script tags and potentially dangerous content
  return htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
}

/**
 * Extract plain text from HTML content
 * @param {string} htmlContent - HTML content
 * @param {number} maxLength - Maximum length of extracted text
 */
export function extractPlainText(htmlContent, maxLength = 150) {
  if (!htmlContent) return '';
  
  const div = document.createElement('div');
  div.innerHTML = htmlContent;
  const text = div.textContent || div.innerText || '';
  
  if (maxLength && text.length > maxLength) {
    return text.substring(0, maxLength).trimEnd() + '...';
  }
  
  return text;
}

/**
 * Get featured image URL from post
 * @param {Object} post - Post object with _embedded data
 * @param {string} size - Image size (thumbnail, medium, large, full)
 */
export function getFeaturedImageUrl(post, size = 'large') {
  if (!post?._embedded?.['wp:featuredmedia']?.[0]) {
    return null;
  }

  const media = post._embedded['wp:featuredmedia'][0];
  
  // Try to get specific size, fallback to full size
  if (media.media_details?.sizes?.[size]) {
    return media.media_details.sizes[size].source_url;
  }
  
  return media.source_url;
}

/**
 * Get author information from post
 * @param {Object} post - Post object with _embedded data
 */
export function getAuthorInfo(post) {
  if (!post?._embedded?.author?.[0]) {
    return null;
  }

  const author = post._embedded.author[0];
  
  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    description: author.description,
    avatar: author.avatar_urls || {},
    link: author.link
  };
}

/**
 * Clear cache (useful for development or when content is updated)
 */
export function clearWordPressCache() {
  cache.clear();
}

/**
 * Check if WordPress API is available
 */
export async function checkWordPressConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/posts?per_page=1`);
    return response.ok;
  } catch (error) {
    console.error('WordPress connection check failed:', error);
    return false;
  }
}

// Export configuration for debugging
export const wordpressConfig = {
  RAW_WORDPRESS_URL,
  API_BASE_URL,
  CACHE_DURATION
};
