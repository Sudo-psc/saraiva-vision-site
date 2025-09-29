/**
 * WordPress GraphQL Proxy API
 * Provides a proxy endpoint for WordPress GraphQL requests with enhanced error handling
 * and SSL/CORS bypass capabilities
 */

import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const router = express.Router();

// Configuration
const WORDPRESS_GRAPHQL_ENDPOINT = process.env.WORDPRESS_GRAPHQL_ENDPOINT ||
                                  process.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT ||
                                  'https://cms.saraivavision.com.br/graphql';

// Enhanced CORS configuration for WordPress GraphQL proxy
const graphqlCorsOptions = {
  origin: [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br',
    'https://saraivavision.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: false,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
router.use(cors(graphqlCorsOptions));

// Handle OPTIONS preflight requests
router.options('*', cors(graphqlCorsOptions), (req, res) => {
  res.status(200).end();
});

// Enhanced HTTPS agent for SSL bypass
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Allow self-signed certificates
  timeout: 30000
});

// Enhanced HTTP agent for timeouts
const httpAgent = new http.Agent({
  timeout: 30000
});

// Create GraphQL client with SSL bypass
const createWordPressClient = () => {
  return new GraphQLClient(WORDPRESS_GRAPHQL_ENDPOINT, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SaraivaVision-Proxy/1.0'
    },
    timeout: 30000,
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        agent: url.startsWith('https:') ? httpsAgent : httpAgent
      });
    }
  });
};

// Main GraphQL proxy endpoint
router.post('/graphql', async (req, res) => {
  try {
    const { query, variables, operationName } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'GraphQL query is required',
        code: 'MISSING_QUERY'
      });
    }

    console.log('Proxying GraphQL request to:', WORDPRESS_GRAPHQL_ENDPOINT);

    const startTime = Date.now();

    try {
      // Use direct fetch with SSL bypass
      const response = await fetch(WORDPRESS_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SaraivaVision-Proxy/1.0'
        },
        body: JSON.stringify({
          query,
          variables: variables || {},
          operationName: operationName || null
        }),
        agent: httpsAgent, // Use HTTPS agent for SSL bypass
        timeout: 30000
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      console.log(`GraphQL request completed in ${responseTime}ms`);

      res.json({
        data,
        extensions: {
          responseTime,
          proxied: true,
          timestamp: new Date().toISOString()
        }
      });
    } catch (fetchError) {
      console.error('GraphQL Fetch Error:', fetchError);

      // Handle specific error types
      let errorResponse = {
        error: 'GraphQL request failed',
        details: fetchError.message,
        code: 'GRAPHQL_ERROR'
      };

      if (fetchError.message?.includes('ENOTFOUND') || fetchError.message?.includes('404')) {
        errorResponse = {
          error: 'WordPress GraphQL endpoint not found',
          details: 'The WPGraphQL plugin may not be installed or activated on the WordPress server.',
          code: 'WPGRAPHQL_NOT_FOUND',
          fixSteps: [
            '1. Log in to WordPress admin at https://cms.saraivavision.com.br/wp-admin',
            '2. Go to Plugins → Add New',
            '3. Search for "WPGraphQL"',
            '4. Install and activate the plugin',
            '5. Verify the GraphQL endpoint is accessible at /graphql'
          ]
        };
      } else if (fetchError.message?.includes('SSL') || fetchError.message?.includes('CERTIFICATE')) {
        errorResponse = {
          error: 'SSL Certificate Error',
          details: 'The WordPress server has SSL certificate issues.',
          code: 'SSL_ERROR',
          fixSteps: [
            '1. SSH to WordPress server: ssh root@31.97.129.78',
            '2. Run: certbot --nginx -d cms.saraivavision.com.br',
            '3. Reload nginx: systemctl reload nginx',
            '4. Test SSL configuration'
          ]
        };
      }

      res.status(502).json(errorResponse);
    }
  } catch (error) {
    console.error('WordPress GraphQL Proxy Error:', error);
    res.status(500).json({
      error: 'Internal proxy error',
      details: error.message,
      code: 'PROXY_ERROR'
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();

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
      const response = await fetch(WORDPRESS_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SaraivaVision-Proxy/1.0'
        },
        body: JSON.stringify({ query: healthQuery }),
        agent: httpsAgent,
        timeout: 10000
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      res.json({
        status: 'healthy',
        responseTime,
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        wordpress: {
          title: data.data?.generalSettings?.title || 'Unknown',
          url: data.data?.generalSettings?.url || 'Unknown',
          accessible: true
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.json({
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        error: error.message,
        errorType: error.message?.includes('404') ? 'WPGRAPHQL_NOT_FOUND' : 'CONNECTION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// WordPress server status endpoint
router.get('/server-status', async (req, res) => {
  try {
    const url = new URL(WORDPRESS_GRAPHQL_ENDPOINT);
    const isHttps = url.protocol === 'https:';

    const agent = isHttps ? httpsAgent : httpAgent;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/',
      method: 'HEAD',
      agent,
      timeout: 10000
    };

    const req = (isHttps ? https : http).request(options, (response) => {
      res.json({
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        accessible: true,
        statusCode: response.statusCode,
        statusMessage: response.statusMessage,
        server: response.headers['server'],
        contentType: response.headers['content-type'],
        corsConfigured: !!response.headers['access-control-allow-origin'],
        timestamp: new Date().toISOString()
      });
    });

    req.on('error', (error) => {
      res.json({
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        accessible: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    req.on('timeout', () => {
      req.destroy();
      res.json({
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        accessible: false,
        error: 'Connection timeout',
        timestamp: new Date().toISOString()
      });
    });

    req.end();
  } catch (error) {
    res.status(500).json({
      error: 'Server status check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('WordPress GraphQL Proxy Error:', error);
  res.status(500).json({
    error: 'Internal proxy error',
    details: error.message,
    timestamp: new Date().toISOString()
  });
});

export default router;