/**
 * Sanity CMS Client Configuration
 *
 * Provides a configured Sanity client with:
 * - Error handling and timeout management
 * - Retry logic for network failures
 * - GROQ query helpers
 * - Portable Text utilities
 *
 * Author: Dr. Philipe Saraiva Cruz
 * Date: 2025-10-25
 */

import { createClient } from '@sanity/client';

// Sanity project configuration
const SANITY_PROJECT_ID = '92ocrdmp';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2025-10-25';
const SANITY_TIMEOUT = 5000; // 5 seconds timeout

/**
 * Create Sanity client instance
 * Uses CDN for read operations (faster, cached)
 */
export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: true, // Use CDN for read operations
  timeout: SANITY_TIMEOUT,
  // No token needed for public read operations
});

/**
 * Sanity client with retry logic
 * Automatically retries failed requests with exponential backoff
 */
class SanityClientWithRetry {
  constructor(client, maxRetries = 2) {
    this.client = client;
    this.maxRetries = maxRetries;
  }

  /**
   * Execute GROQ query with retry logic
   * @param {string} query - GROQ query string
   * @param {object} params - Query parameters
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<any>} Query results
   */
  async fetch(query, params = {}, retryCount = 0) {
    try {
      const result = await this.client.fetch(query, params);
      return result;
    } catch (error) {
      // Check if we should retry
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.warn(`[Sanity] Query failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`, error.message);

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetch(query, params, retryCount + 1);
      }

      // Max retries exceeded or non-retryable error
      console.error('[Sanity] Query failed after retries:', error);
      throw new SanityError('Failed to fetch data from Sanity', error);
    }
  }

  /**
   * Check if error is retryable (network issues, timeouts)
   * @param {Error} error
   * @returns {boolean}
   */
  isRetryableError(error) {
    // Retry on network errors, timeouts, and 5xx server errors
    const retryableCodes = [408, 429, 500, 502, 503, 504];
    const statusCode = error.statusCode || error.response?.status;

    return (
      error.message?.includes('timeout') ||
      error.message?.includes('network') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ETIMEDOUT') ||
      (statusCode && retryableCodes.includes(statusCode))
    );
  }

  /**
   * Get single document by ID
   * @param {string} id - Document ID
   * @returns {Promise<object|null>}
   */
  async getById(id) {
    try {
      const result = await this.client.getDocument(id);
      return result;
    } catch (error) {
      if (error.statusCode === 404) {
        return null; // Document not found
      }
      throw new SanityError(`Failed to get document by ID: ${id}`, error);
    }
  }
}

/**
 * Custom error class for Sanity operations
 */
export class SanityError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'SanityError';
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Sanity GROQ Query Helpers
 * Pre-built queries for common blog operations
 */
export const queries = {
  /**
   * Get all blog posts with metadata (no full content)
   */
  getAllPostsMetadata: () => `
    *[_type == "blogPost"] | order(date desc) {
      _id,
      id,
      slug,
      title,
      excerpt,
      author,
      date,
      category,
      tags,
      "image": image.asset->url,
      featured,
      seo,
      "contentLength": length(pt::text(content))
    }
  `,

  /**
   * Get single post by slug with full content
   */
  getPostBySlug: () => `
    *[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      id,
      slug,
      title,
      excerpt,
      content,
      author,
      date,
      category,
      tags,
      "image": image.asset->url,
      featured,
      seo,
      relatedPodcasts
    }
  `,

  /**
   * Get posts by category
   */
  getPostsByCategory: () => `
    *[_type == "blogPost" && category == $category] | order(date desc) {
      _id,
      id,
      slug,
      title,
      excerpt,
      author,
      date,
      category,
      tags,
      "image": image.asset->url,
      featured,
      seo
    }
  `,

  /**
   * Get featured posts
   */
  getFeaturedPosts: () => `
    *[_type == "blogPost" && featured == true] | order(date desc) [0...$limit] {
      _id,
      id,
      slug,
      title,
      excerpt,
      author,
      date,
      category,
      tags,
      "image": image.asset->url,
      featured,
      seo
    }
  `,

  /**
   * Get recent posts
   */
  getRecentPosts: () => `
    *[_type == "blogPost"] | order(date desc) [0...$limit] {
      _id,
      id,
      slug,
      title,
      excerpt,
      author,
      date,
      category,
      tags,
      "image": image.asset->url,
      featured,
      seo
    }
  `,

  /**
   * Search posts by term (title, excerpt, tags)
   */
  searchPosts: () => `
    *[_type == "blogPost" && (
      title match $term ||
      excerpt match $term ||
      $term in tags
    )] | order(date desc) {
      _id,
      id,
      slug,
      title,
      excerpt,
      author,
      date,
      category,
      tags,
      "image": image.asset->url,
      featured,
      seo
    }
  `
};

/**
 * Portable Text Utilities
 * Helper functions for working with Sanity's Portable Text format
 */
export const portableText = {
  /**
   * Convert Portable Text to plain text
   * @param {array} blocks - Portable Text blocks
   * @returns {string} Plain text content
   */
  toPlainText(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';

    return blocks
      .map(block => {
        if (block._type !== 'block' || !block.children) {
          return '';
        }
        return block.children.map(child => child.text).join('');
      })
      .join('\n\n');
  },

  /**
   * Check if content is Portable Text format
   * @param {any} content
   * @returns {boolean}
   */
  isPortableText(content) {
    return Array.isArray(content) && content.every(block => block._type === 'block');
  },

  /**
   * Convert Portable Text to basic HTML
   * Simple conversion for basic formatting
   * @param {array} blocks - Portable Text blocks
   * @returns {string} HTML string
   */
  toBasicHTML(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';

    return blocks
      .map(block => {
        if (block._type !== 'block') return '';

        const children = block.children || [];
        let text = children
          .map(child => {
            let content = child.text || '';

            // Apply marks (bold, italic, etc.)
            if (child.marks && child.marks.length > 0) {
              child.marks.forEach(mark => {
                if (mark === 'strong') content = `<strong>${content}</strong>`;
                if (mark === 'em') content = `<em>${content}</em>`;
                if (mark === 'code') content = `<code>${content}</code>`;
              });
            }

            return content;
          })
          .join('');

        // Apply block-level formatting
        const style = block.style || 'normal';
        switch (style) {
          case 'h1':
            return `<h1>${text}</h1>`;
          case 'h2':
            return `<h2>${text}</h2>`;
          case 'h3':
            return `<h3>${text}</h3>`;
          case 'h4':
            return `<h4>${text}</h4>`;
          case 'blockquote':
            return `<blockquote>${text}</blockquote>`;
          default:
            return `<p>${text}</p>`;
        }
      })
      .join('\n');
  }
};

/**
 * Export configured client with retry logic
 */
export const sanityClientWithRetry = new SanityClientWithRetry(sanityClient);

/**
 * Health check function
 * Tests Sanity connection and returns status
 * @returns {Promise<{healthy: boolean, error?: string}>}
 */
export async function checkSanityHealth() {
  try {
    await sanityClient.fetch('*[_type == "blogPost"][0]', {}, { timeout: 3000 });
    return { healthy: true };
  } catch (error) {
    console.warn('[Sanity] Health check failed:', error.message);
    return {
      healthy: false,
      error: error.message,
      shouldFallback: true
    };
  }
}

export default {
  client: sanityClient,
  clientWithRetry: sanityClientWithRetry,
  queries,
  portableText,
  checkSanityHealth,
  SanityError
};
