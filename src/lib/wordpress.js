import { GraphQLClient } from 'graphql-request';
import {
  GET_POST_BY_SLUG,
  GET_RELATED_POSTS,
} from './wordpress-queries.js';
import {
  sanitizeWordPressContent,
  sanitizeWordPressExcerpt,
  sanitizeWordPressTitle
} from '../utils/sanitizeWordPressContent.js';

// WordPress GraphQL configuration with proxy fallback
const WORDPRESS_GRAPHQL_ENDPOINT = import.meta.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT ||
                                  import.meta.env.VITE_WORDPRESS_URL + '/graphql' ||
                                  import.meta.env.WORDPRESS_URL + '/graphql' ||
                                  'https://cms.saraivavision.com.br/graphql';

// Local proxy endpoint for SSL/CORS bypass
const LOCAL_PROXY_ENDPOINT = '/api/wordpress-graphql/graphql';

// Determine which endpoint to use (proxy for SSL/CORS issues, direct for normal operation)
const getGraphQLEndpoint = () => {
  // In production, use proxy to bypass SSL/CORS issues
  if (import.meta.env.PROD) {
    return LOCAL_PROXY_ENDPOINT;
  }
  // In development, try direct first, then fallback to proxy
  return WORDPRESS_GRAPHQL_ENDPOINT;
};

// Enhanced GraphQL client with proxy support and SSL bypass
export const createGraphQLClient = (useProxy = false) => {
  const endpoint = useProxy ? LOCAL_PROXY_ENDPOINT : getGraphQLEndpoint();
  const isProxy = endpoint.startsWith('/');

  const clientOptions = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SaraivaVision-Frontend/1.0',
      'Accept': 'application/json',
    },
    timeout: 30000,
  };

  // Different fetch logic for proxy vs direct
  if (isProxy) {
    // Proxy endpoint (local API)
    clientOptions.fetch = async (url, options) => {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'X-Requested-With': 'XMLHttpRequest',
          }
        });

        return response;
      } catch (error) {
        console.error('Proxy GraphQL Fetch Error:', error);
        throw error;
      }
    };
  } else {
    // Direct endpoint with SSL/CORS handling
    clientOptions.fetch = async (url, options) => {
      try {
        const corsOptions = {
          ...options,
          mode: 'cors',
          credentials: 'omit',
          headers: {
            ...options.headers,
            'Origin': window.location.origin,
          }
        };

        const response = await fetch(url, corsOptions);

        // Check if response is HTML (404 page) instead of JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error(`WordPress GraphQL endpoint not found (404). The WPGraphQL plugin may not be installed or activated at: ${WORDPRESS_GRAPHQL_ENDPOINT}`);
        }

        // Check for SSL/CORS errors
        if (response.status === 0) {
          throw new Error(`SSL/CORS error: Unable to connect to ${WORDPRESS_GRAPHQL_ENDPOINT}. The server may have SSL issues or not be configured for cross-origin requests.`);
        }

        return response;
      } catch (error) {
        console.error('Direct GraphQL Fetch Error:', error);

        // Track specific error types for better debugging
        if (error.message?.includes('SSL') || error.message?.includes('CERTIFICATE') || error.message?.includes('tlsv1')) {
          throw new Error(`SSL Certificate Error: The WordPress server at ${WORDPRESS_GRAPHQL_ENDPOINT} has SSL certificate issues. Using proxy instead.`);
        }

        throw error;
      }
    };
  }

  return new GraphQLClient(isProxy ? window.location.origin + endpoint : endpoint, clientOptions);
};

// Create client instances
export const wpClient = createGraphQLClient();
export const wpProxyClient = createGraphQLClient(true);

// Enhanced error handling wrapper with proxy fallback
export const executeGraphQLQuery = async (query, variables = {}) => {
  let lastError = null;
  const attempts = [
    { client: createGraphQLClient(false), type: 'direct' },
    { client: createGraphQLClient(true), type: 'proxy' }
  ];

  // Try direct connection first, then fallback to proxy
  for (const attempt of attempts) {
    try {
      console.log(`Attempting GraphQL ${attempt.type} connection...`);
      const data = await attempt.client.request(query, variables);
      console.log(`GraphQL ${attempt.type} connection successful`);
      return { data, error: null, connectionType: attempt.type };
    } catch (error) {
      console.error(`GraphQL ${attempt.type} connection failed:`, error.message);
      lastError = error;

      // If direct connection fails due to SSL/CORS, continue to proxy
      if (attempt.type === 'direct' && (
        error.message?.includes('SSL') ||
        error.message?.includes('CERTIFICATE') ||
        error.message?.includes('tlsv1') ||
        error.message?.includes('CORS') ||
        error.message?.includes('Failed to fetch')
      )) {
        console.log('Falling back to proxy connection...');
        continue;
      }

      // If proxy also fails, break and return the last error
      break;
    }
  }

  // If all attempts failed, format the error
  console.error('All GraphQL connection attempts failed:', lastError);

  // Track specific error types for better debugging
  let errorType = 'UNKNOWN_ERROR';
  let errorMessage = lastError?.message || 'Unknown error occurred';
  let errorDetails = {};

  // Enhanced SSL error detection
  if (errorMessage?.includes('SSL') ||
      errorMessage?.includes('CERTIFICATE') ||
      errorMessage?.includes('tlsv1') ||
      errorMessage?.includes('internal error')) {
    errorType = 'SSL_ERROR';
    errorMessage = 'WordPress server has SSL certificate issues. The SSL certificate is invalid or expired.';
    errorDetails = {
      endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
      suggestion: 'Server administrator needs to renew SSL certificate via Let\'s Encrypt.',
      fixSteps: [
        '1. SSH to server: ssh root@31.97.129.78',
        '2. Run: certbot --nginx -d cms.saraivavision.com.br',
        '3. Reload nginx: systemctl reload nginx',
        '4. Test SSL: openssl s_client -connect cms.saraivavision.com.br:443'
      ]
    };
  }
  // Enhanced 404 detection
  else if (errorMessage?.includes('404') || errorMessage?.includes('not found') || lastError?.isHtmlResponse) {
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
  else if (errorMessage?.includes('CORS') ||
           errorMessage?.includes('preflight') ||
           errorMessage?.includes('Access-Control') ||
           errorMessage?.includes('cross-origin')) {
    errorType = 'CORS_ERROR';
    errorMessage = 'CORS preflight request failed. Using proxy as fallback.';
    errorDetails = {
      endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
      origin: window.location.origin,
      suggestion: 'WordPress server CORS headers not properly configured. Using local proxy.',
      proxyAvailable: true
    };
  }
  // Handle GraphQL-specific errors
  else if (lastError?.response?.errors) {
    errorType = 'GRAPHQL_ERROR';
    errorMessage = lastError.response.errors[0]?.message || 'GraphQL query failed';
    errorDetails = {
      errors: lastError.response.errors,
      endpoint: WORDPRESS_GRAPHQL_ENDPOINT
    };
  }
  // Handle server errors
  else if (lastError?.response?.status >= 500) {
    errorType = 'SERVER_ERROR';
    errorMessage = 'WordPress server is temporarily unavailable';
    errorDetails = {
      status: lastError.response.status,
      endpoint: WORDPRESS_GRAPHQL_ENDPOINT
    };
  }
  // Handle network errors
  else if (errorMessage?.includes('Network') || errorMessage?.includes('fetch')) {
    errorType = 'NETWORK_ERROR';
    errorMessage = 'Failed to connect to WordPress CMS via both direct and proxy connections.';
    errorDetails = {
      originalError: errorMessage,
      endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
      proxyEndpoint: LOCAL_PROXY_ENDPOINT
    };
  }

  const formattedError = {
    type: errorType,
    message: errorMessage,
    ...errorDetails,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    allAttemptsFailed: true
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
