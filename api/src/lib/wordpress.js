import { GraphQLClient } from 'graphql-request';
import {
  GET_POST_BY_SLUG,
  GET_RELATED_POSTS,
} from './wordpress-queries.js';

// WordPress GraphQL endpoint configuration
const WORDPRESS_GRAPHQL_ENDPOINT = process.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT || 'https://cms.saraivavision.com.br/graphql';

// Create GraphQL client instance
export const wpClient = new GraphQLClient(WORDPRESS_GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'SaraivaVision-NextJS/1.0',
  },
  // Enable request/response logging in development
  ...(import.meta.env.MODE === 'development' && {
    requestMiddleware: (request) => {
      console.log('WordPress GraphQL Request:', request);
      return request;
    },
    responseMiddleware: (response) => {
      console.log('WordPress GraphQL Response:', response);
      return response;
    },
  }),
});

// Error handling wrapper for GraphQL requests
export const executeGraphQLQuery = async (query, variables = {}) => {
  try {
    const data = await wpClient.request(query, variables);
    return { data, error: null };
  } catch (error) {
    console.error('WordPress GraphQL Error:', error);

    // Handle different types of GraphQL errors
    if (error.response?.errors) {
      return {
        data: null,
        error: {
          type: 'GRAPHQL_ERROR',
          message: error.response.errors[0]?.message || 'GraphQL query failed',
          errors: error.response.errors,
        },
      };
    }

    if (error.response?.status >= 500) {
      return {
        data: null,
        error: {
          type: 'SERVER_ERROR',
          message: 'WordPress server is temporarily unavailable',
          status: error.response.status,
        },
      };
    }

    return {
      data: null,
      error: {
        type: 'NETWORK_ERROR',
        message: 'Failed to connect to WordPress CMS',
        originalError: error.message,
      },
    };
  }
};

// Health check function for WordPress GraphQL endpoint
export const checkWordPressHealth = async () => {
  const healthQuery = `
    query HealthCheck {
      generalSettings {
        title
        url
      }
    }
  `;

  try {
    const { data, error } = await executeGraphQLQuery(healthQuery);
    return {
      isHealthy: !error,
      data: data?.generalSettings,
      error,
    };
  } catch (error) {
    return {
      isHealthy: false,
      data: null,
      error: {
        type: 'HEALTH_CHECK_FAILED',
        message: error.message,
      },
    };
  }
};

// Post functions for PostPage component
export const fetchPostBySlug = async (slug) => {
  const { data, error } = await executeGraphQLQuery(GET_POST_BY_SLUG, { slug });

  if (error) {
    throw new Error(error.message || 'Failed to fetch post');
  }

  if (!data.post) {
    throw new Error('Post not found');
  }

  return data.post;
};

export const fetchRelatedPosts = async (post, limit = 3) => {
  // Get related posts by category
  const categories = post.categories?.nodes || [];
  const categoryIds = categories.map(cat => cat.id);

  if (categoryIds.length === 0) {
    return [];
  }

  const relatedPostsQuery = `
    query GetRelatedPosts($categoryIds: [ID!], $excludeId: ID!, $first: Int) {
      posts(
        first: $first,
        where: {
          status: PUBLISH,
          categoryId: $categoryIds,
          notIn: [$excludeId]
        }
      ) {
        nodes {
          id
          title
          slug
          excerpt
          date
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `;

  const { data, error } = await executeGraphQLQuery(relatedPostsQuery, {
    categoryIds,
    excludeId: post.id,
    first: limit,
  });

  if (error) {
    console.warn('Could not fetch related posts:', error);
    return [];
  }

  return data.posts.nodes || [];
};

export const getFeaturedImageUrl = (post) => {
  return post.featuredImage?.node?.sourceUrl || null;
};

export const getAuthorInfo = (post) => {
  return post.author?.node || null;
};

export const cleanHtmlContent = (html) => {
  if (!html) return '';

  // Remove potentially dangerous content
  const cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');

  return cleaned;
};

export const extractPlainText = (html, maxLength = null) => {
  if (!html) return '';

  // Remove HTML tags
  const plainText = html.replace(/<[^>]+>/g, '').trim();

  // Limit length if specified
  if (maxLength && plainText.length > maxLength) {
    return plainText.substring(0, maxLength) + '...';
  }

  return plainText;
};

// Cache management
export const clearWordPressCache = () => {
  // Clear any cached data
  if (typeof window !== 'undefined' && window.wordpressCache) {
    window.wordpressCache.clear();
  }
};
