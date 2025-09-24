import { GraphQLClient } from 'graphql-request';
import {
  GET_POST_BY_SLUG,
  GET_RELATED_POSTS,
} from './wordpress-queries.js';

// VPS WordPress GraphQL endpoint configuration with multiple fallback options
const WORDPRESS_GRAPHQL_ENDPOINT = import.meta.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT ||
                                  import.meta.env.VITE_WORDPRESS_URL + '/graphql' ||
                                  import.meta.env.WORDPRESS_URL + '/graphql' ||
                                  'http://31.97.129.78:8081/graphql';

// Create GraphQL client instance with enhanced configuration
export const wpClient = new GraphQLClient(WORDPRESS_GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'SaraivaVision-NextJS/1.0',
  },
  // Add timeout configuration (30 seconds)
  timeout: 30000,
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
  // Add retry logic for failed requests
  requestMiddleware: async (request) => {
    const startTime = Date.now();
    return {
      ...request,
      headers: {
        ...request.headers,
        'X-Request-Start': startTime.toString(),
      },
    };
  },
  responseMiddleware: (response) => {
    const responseTime = Date.now() - parseInt(response.headers.get('X-Request-Start') || Date.now());
    if (responseTime > 5000) {
      console.warn(`Slow WordPress GraphQL response: ${responseTime}ms`);
    }
  },
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

// Enhanced health check function for WordPress GraphQL endpoint
export const checkWordPressHealth = async () => {
  const healthQuery = `
    query HealthCheck {
      generalSettings {
        title
        url
        description
      }
      __typename
    }
  `;

  try {
    const startTime = Date.now();
    const { data, error } = await executeGraphQLQuery(healthQuery);
    const responseTime = Date.now() - startTime;

    return {
      isHealthy: !error && data?.generalSettings,
      responseTime,
      data: data?.generalSettings,
      error,
      endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      data: null,
      error: {
        type: 'HEALTH_CHECK_FAILED',
        message: error.message,
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        timestamp: new Date().toISOString(),
      },
    };
  }
};

// Fallback content generator when WordPress is unavailable
export const generateFallbackContent = (contentType, params = {}) => {
  const fallbacks = {
    posts: {
      nodes: [
        {
          id: 'fallback-1',
          title: 'Conteúdo Temporariamente Indisponível',
          slug: 'conteudo-temporario',
          excerpt: 'Estamos enfrentando dificuldades técnicas para carregar nosso conteúdo. Por favor, tente novamente mais tarde.',
          date: new Date().toISOString(),
          featuredImage: null,
          categories: { nodes: [] },
          author: { node: { name: 'Saraiva Vision' } },
        }
      ]
    },
    pages: {
      nodes: [
        {
          id: 'fallback-1',
          title: 'Página Temporariamente Indisponível',
          slug: 'pagina-temporaria',
          content: 'Esta página está temporariamente indisponível devido a problemas técnicos. Estamos trabalhando para resolver o o mais rápido possível.',
          date: new Date().toISOString(),
        }
      ]
    },
    services: {
      nodes: [
        {
          id: 'fallback-1',
          title: 'Serviço Temporariamente Indisponível',
          slug: 'servico-temporario',
          excerpt: 'Informações sobre nossos serviços estão temporariamente indisponíveis.',
          featuredImage: null,
        }
      ]
    },
    teamMembers: {
      nodes: []
    },
    testimonials: {
      nodes: []
    }
  };

  return fallbacks[contentType] || { nodes: [] };
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
