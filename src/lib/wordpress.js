import { GraphQLClient } from 'graphql-request';
import {
  GET_POST_BY_SLUG,
  GET_RELATED_POSTS,
} from './wordpress-queries.js';
import {
  sanitizeWordPressContent,
  sanitizeWordPressExcerpt,
  sanitizeWordPressTitle
} from '@/utils/sanitizeWordPressContent';

// VPS WordPress GraphQL endpoint configuration with multiple fallback options
const WORDPRESS_GRAPHQL_ENDPOINT = import.meta.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT ||
                                  import.meta.env.VITE_WORDPRESS_URL + '/graphql' ||
                                  import.meta.env.WORDPRESS_URL + '/graphql' ||
                                  'http://31.97.129.78:8081/graphql';

// Create GraphQL client instance with enhanced configuration and proper CORS handling
export const wpClient = new GraphQLClient(WORDPRESS_GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'SaraivaVision-Frontend/1.0',
    'Accept': 'application/json',
  },
  // Add timeout configuration (30 seconds)
  timeout: 30000,
  // Configure fetch options for proper CORS handling
  fetch: (url, options) => {
    const corsOptions = {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        ...options.headers,
        'Origin': window.location.origin,
      }
    };

    // Enhanced error handling for 404 and CORS issues
    return fetch(url, corsOptions).then(async (response) => {
      // Check if response is HTML (404 page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`WordPress GraphQL endpoint not found (404). The WPGraphQL plugin may not be installed or activated at: ${WORDPRESS_GRAPHQL_ENDPOINT}`);
      }

      // Check for CORS errors
      if (response.status === 0) {
        throw new Error(`CORS error: Unable to connect to ${WORDPRESS_GRAPHQL_ENDPOINT}. The server may not be configured for cross-origin requests.`);
      }

      return response;
    }).catch(error => {
      console.error('GraphQL Fetch Error:', error);

      // Enhanced error tracking with PostHog
      if (window.posthog) {
        window.posthog.capture('wordpress_graphql_fetch_error', {
          error: error.message,
          url,
          mode: corsOptions.mode,
          credentials: corsOptions.credentials,
          endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      }

      throw error;
    });
  },
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

    // Log CORS-related response headers in development
    if (import.meta.env.MODE === 'development') {
      console.log('GraphQL Response CORS headers:', {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
      });
    }

    return response;
  },
});

// Error handling wrapper for GraphQL requests with enhanced CORS and 404 error detection
export const executeGraphQLQuery = async (query, variables = {}) => {
  try {
    const data = await wpClient.request(query, variables);
    return { data, error: null };
  } catch (error) {
    console.error('WordPress GraphQL Error:', error);

    // Track specific error types for better debugging
    let errorType = 'UNKNOWN_ERROR';
    let errorMessage = error.message || 'Unknown error occurred';
    let errorDetails = {};

    // Enhanced 404 detection
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorType = 'NOT_FOUND_ERROR';
      errorMessage = 'WordPress GraphQL endpoint not found. The WPGraphQL plugin may not be installed or activated.';
      errorDetails = {
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        suggestion: 'Please install and activate the WPGraphQL plugin in WordPress admin.',
        fixSteps: [
          '1. Log in to WordPress admin at https://cms.saraivavision.com.br/wp-admin',
          '2. Go to Plugins → Add New',
          '3. Search for "WPGraphQL"',
          '4. Install and activate the plugin',
          '5. Verify the GraphQL endpoint is accessible at /graphql'
        ]
      };
    }
    // Track CORS-specific errors
    else if (error.message?.includes('CORS') ||
             error.message?.includes('preflight') ||
             error.message?.includes('Access-Control') ||
             error.message?.includes('cross-origin') ||
             (error.response?.status === 0) ||
             (error.response === undefined && error.message?.includes('Failed to fetch'))) {
      errorType = 'CORS_ERROR';
      errorMessage = 'CORS preflight request failed. WordPress GraphQL endpoint may not be properly configured for cross-origin requests.';
      errorDetails = {
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        origin: window.location.origin,
        suggestion: 'Check WordPress server CORS headers and Nginx configuration.',
        fixSteps: [
          '1. Check if WPGraphQL CORS headers plugin is installed',
          '2. Verify Nginx configuration allows OPTIONS requests',
          '3. Check .htaccess for CORS rules',
          '4. Ensure WordPress permalink settings are set to "Post name"'
        ]
      };
    }
    // Handle GraphQL-specific errors
    else if (error.response?.errors) {
      errorType = 'GRAPHQL_ERROR';
      errorMessage = error.response.errors[0]?.message || 'GraphQL query failed';
      errorDetails = {
        errors: error.response.errors,
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT
      };
    }
    // Handle server errors
    else if (error.response?.status >= 500) {
      errorType = 'SERVER_ERROR';
      errorMessage = 'WordPress server is temporarily unavailable';
      errorDetails = {
        status: error.response.status,
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT
      };
    }
    // Handle network errors
    else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      errorType = 'NETWORK_ERROR';
      errorMessage = 'Failed to connect to WordPress CMS';
      errorDetails = {
        originalError: error.message,
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT
      };
    }

    const formattedError = {
      type: errorType,
      message: errorMessage,
      ...errorDetails,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Track error for analytics
    if (window.posthog) {
      window.posthog.capture('wordpress_graphql_error', {
        errorType,
        message: errorMessage,
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        userAgent: navigator.userAgent,
        timestamp: formattedError.timestamp
      });
    }

    console.error(`${errorType} Details:`, formattedError);
    return { data: null, error: formattedError };
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

  const post = data.post;

  const sanitizedFeaturedImage = post.featuredImage?.node
    ? {
        ...post.featuredImage,
        node: {
          ...post.featuredImage.node,
          altText: sanitizeWordPressExcerpt(post.featuredImage.node.altText || ''),
        },
      }
    : post.featuredImage;

  return {
    ...post,
    title: sanitizeWordPressTitle(post.title || ''),
    excerpt: sanitizeWordPressExcerpt(post.excerpt || ''),
    content: sanitizeWordPressContent(post.content || ''),
    featuredImage: sanitizedFeaturedImage,
  };
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

  return (data.posts.nodes || []).map((relatedPost) => ({
    ...relatedPost,
    title: sanitizeWordPressTitle(relatedPost.title || ''),
    excerpt: sanitizeWordPressExcerpt(relatedPost.excerpt || ''),
  }));
};

export const getFeaturedImageUrl = (post) => {
  return post.featuredImage?.node?.sourceUrl || null;
};

export const getAuthorInfo = (post) => {
  return post.author?.node || null;
};

export const cleanHtmlContent = (html) => {
  if (!html) return '';

  const sanitized = sanitizeWordPressContent(html, {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'base'],
  });

  return sanitized
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
    .replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'");
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
