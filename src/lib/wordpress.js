import { GraphQLClient } from 'graphql-request';

// WordPress GraphQL endpoint configuration
const WORDPRESS_GRAPHQL_ENDPOINT = process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://cms.saraivavision.com.br/graphql';

// Create GraphQL client instance
export const wpClient = new GraphQLClient(WORDPRESS_GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'SaraivaVision-NextJS/1.0',
  },
  // Enable request/response logging in development
  ...(process.env.NODE_ENV === 'development' && {
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