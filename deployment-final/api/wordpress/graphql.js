import express from 'express';
import cors from 'cors';
import { GraphQLClient } from 'graphql-request';

const router = express.Router();

// Enhanced CORS configuration for WordPress GraphQL
const graphqlCorsOptions = {
  origin: [
    'https://saraivavision.com.br',
    'https://saraivavision.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: false, // No credentials for GraphQL
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
router.use(cors(graphqlCorsOptions));

// Handle OPTIONS preflight requests
router.options('*', (req, res) => {
  res.status(200).end();
});

// WordPress GraphQL proxy endpoint
router.post('/graphql', async (req, res) => {
  try {
    const { query, variables } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'GraphQL query is required'
      });
    }

    // WordPress GraphQL endpoint configuration
    const wordpressEndpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT ||
      process.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT ||
      'https://cms.saraivavision.com.br/graphql';

    // Create GraphQL client for WordPress
    const wpClient = new GraphQLClient(wordpressEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SaraivaVision-API-Proxy/1.0'
      }
    });

    // Forward request to WordPress
    const data = await wpClient.request(query, variables);

    // Add CORS headers to response
    Object.entries(graphqlCorsOptions).forEach(([key, value]) => {
      if (key === 'origin') return; // Skip origin, handled by cors middleware
      if (key === 'methods') return; // Skip methods, handled by cors middleware
      if (key === 'allowedHeaders') return; // Skip headers, handled by cors middleware

      const headerKey = key.split(/(?=[A-Z])/).map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('-');

      res.setHeader(`Access-Control-${headerKey}`, value);
    });

    // Set additional GraphQL-specific headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-GraphQL-Proxy', 'SaraivaVision');

    return res.json(data);

  } catch (error) {
    console.error('WordPress GraphQL Proxy Error:', error);

    // Enhanced error handling
    const errorResponse = {
      error: true,
      message: error.message || 'Failed to fetch from WordPress GraphQL',
      type: 'GRAPHQL_PROXY_ERROR',
      timestamp: new Date().toISOString(),
      endpoint: process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://cms.saraivavision.com.br/graphql'
    };

    // Handle specific error types
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorResponse.type = 'ENDPOINT_NOT_FOUND';
      errorResponse.suggestion = 'WordPress GraphQL endpoint may not be configured. Please check WPGraphQL plugin installation.';
    } else if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
      errorResponse.type = 'CORS_ERROR';
      errorResponse.suggestion = 'WordPress server CORS configuration may need adjustment.';
    }

    return res.status(502).json(errorResponse);
  }
});

// Health check endpoint for WordPress GraphQL
router.get('/graphql/health', async (req, res) => {
  const startTime = Date.now();
  try {
    const wordpressEndpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT ||
      process.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT ||
      'https://cms.saraivavision.com.br/graphql';

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

    const wpClient = new GraphQLClient(wordpressEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SaraivaVision-API-Proxy/1.0'
      }
    });
    const data = await wpClient.request(healthQuery);
    const responseTime = Date.now() - startTime;

    res.json({
      healthy: true,
      responseTime,
      endpoint: wordpressEndpoint,
      wordpressAccessible: true,
      data: data.generalSettings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('WordPress GraphQL Health Check Failed:', error);

    res.json({
      healthy: false,
      responseTime: Date.now() - startTime,
      endpoint: process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://cms.saraivavision.com.br/graphql',
      wordpressAccessible: false,
      error: error.message,
      type: error.message?.includes('404') ? 'ENDPOINT_NOT_FOUND' : 'CONNECTION_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;