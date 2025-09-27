/**
 * WordPress GraphQL Proxy API
 * Provides a proxy endpoint for WordPress GraphQL requests with enhanced error handling
 * and SSL/CORS bypass capabilities
 */

const express = require('express');
const { GraphQLClient } = require('graphql-request');
const cors = require('cors');
const https = require('https');
const http = require('http');
const { URL } = require('url');

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
    // Custom fetch with SSL bypass
    fetch: async (url, options) => {
      try {
        const parsedUrl = new URL(url);
        const isHttps = parsedUrl.protocol === 'https:';
        const agent = isHttps ? httpsAgent : httpAgent;

        const requestOptions = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: options.method || 'POST',
          headers: {
            ...options.headers,
            'Content-Length': Buffer.byteLength(options.body || '')
          },
          agent,
          timeout: 30000
        };

        return new Promise((resolve, reject) => {
          const req = (isHttps ? https : http).request(requestOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
              data += chunk;
            });

            res.on('end', () => {
              // Check if response is HTML (404 page)
              const contentType = res.headers['content-type'] || '';
              if (contentType.includes('text/html')) {
                const error = new Error('WordPress GraphQL endpoint not found (404). WPGraphQL plugin may not be installed.');
                error.statusCode = res.statusCode;
                error.isHtmlResponse = true;
                reject(error);
                return;
              }

              const response = {
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: new Map(Object.entries(res.headers)),
                text: () => Promise.resolve(data),
                json: () => Promise.resolve(JSON.parse(data))
              };

              resolve(response);
            });
          });

          req.on('error', (error) => {
            console.error('WordPress GraphQL Proxy Error:', error);
            reject(error);
          });

          req.on('timeout', () => {
            req.destroy();
            reject(new Error('WordPress GraphQL request timeout'));
          });

          if (options.body) {
            req.write(options.body);
          }
          req.end();
        });
      } catch (error) {
        console.error('WordPress GraphQL Proxy Fetch Error:', error);
        throw error;
      }
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
    console.log('Query:', query.substring(0, 100) + '...');

    const client = createWordPressClient();
    const startTime = Date.now();

    try {
      const data = await client.request(query, variables);
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
    } catch (graphqlError) {
      console.error('GraphQL Query Error:', graphqlError);

      // Handle specific error types
      let errorResponse = {
        error: 'GraphQL request failed',
        details: graphqlError.message,
        code: 'GRAPHQL_ERROR'
      };

      if (graphqlError.isHtmlResponse) {
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
      } else if (graphqlError.message?.includes('SSL') || graphqlError.message?.includes('CERTIFICATE')) {
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
      } else if (graphqlError.response?.errors) {
        errorResponse = {
          error: 'GraphQL Query Errors',
          details: graphqlError.response.errors.map(e => e.message),
          code: 'GRAPHQL_QUERY_ERROR'
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
    const client = createWordPressClient();
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
      const data = await client.request(healthQuery);
      const responseTime = Date.now() - startTime;

      res.json({
        status: 'healthy',
        responseTime,
        endpoint: WORDPRESS_GRAPHQL_ENDPOINT,
        wordpress: {
          title: data.generalSettings?.title || 'Unknown',
          url: data.generalSettings?.url || 'Unknown',
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
        errorType: error.isHtmlResponse ? 'WPGRAPHQL_NOT_FOUND' : 'CONNECTION_ERROR',
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

module.exports = router;