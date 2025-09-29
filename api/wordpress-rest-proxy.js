/**
 * WordPress REST API Proxy
 * Provides a proxy endpoint for WordPress REST API requests with enhanced error handling
 * and SSL/CORS bypass capabilities
 */

import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const router = express.Router();

// Configuration
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL ||
                         process.env.VITE_WORDPRESS_API_URL ||
                         'https://cms.saraivavision.com.br';

// Enhanced CORS configuration for WordPress REST API proxy
const corsOptions = {
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
router.use(cors(corsOptions));

// Handle OPTIONS preflight requests
router.options('*', cors(corsOptions), (req, res) => {
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

// Main REST API proxy endpoint
router.get('/wp-json/wp/v2/*', async (req, res) => {
  try {
    const path = req.params[0];
    const queryParams = new URLSearchParams(req.query).toString();
    const endpoint = `${WORDPRESS_API_URL}/wp-json/wp/v2/${path}${queryParams ? '?' + queryParams : ''}`;

    console.log('Proxying REST API request to:', endpoint);

    const startTime = Date.now();

    try {
      // Use direct fetch with SSL bypass
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'SaraivaVision-Proxy/1.0',
          'Accept': 'application/json'
        },
        agent: httpsAgent, // Use HTTPS agent for SSL bypass
        timeout: 30000
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      console.log(`REST API request completed in ${responseTime}ms`);

      res.json({
        data,
        extensions: {
          responseTime,
          proxied: true,
          timestamp: new Date().toISOString()
        }
      });
    } catch (fetchError) {
      console.error('REST API Fetch Error:', fetchError);

      // Handle specific error types
      let errorResponse = {
        error: 'REST API request failed',
        details: fetchError.message,
        code: 'REST_API_ERROR'
      };

      if (fetchError.message?.includes('ENOTFOUND') || fetchError.message?.includes('404')) {
        errorResponse = {
          error: 'WordPress REST API endpoint not found',
          details: 'The WordPress REST API may not be accessible.',
          code: 'WP_REST_NOT_FOUND',
          fixSteps: [
            '1. Verify WordPress is running at https://cms.saraivavision.com.br',
            '2. Check if REST API is enabled (default in WordPress)',
            '3. Test endpoint manually: curl https://cms.saraivavision.com.br/wp-json/wp/v2/posts'
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
    console.error('WordPress REST API Proxy Error:', error);
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

    try {
      const response = await fetch(`${WORDPRESS_API_URL}/wp-json/wp/v2/posts?per_page=1`, {
        method: 'GET',
        headers: {
          'User-Agent': 'SaraivaVision-Proxy/1.0',
          'Accept': 'application/json'
        },
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
        endpoint: `${WORDPRESS_API_URL}/wp-json/wp/v2/posts`,
        wordpress: {
          accessible: true,
          postsCount: Array.isArray(data) ? data.length : 0
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.json({
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        endpoint: `${WORDPRESS_API_URL}/wp-json/wp/v2/posts`,
        error: error.message,
        errorType: error.message?.includes('404') ? 'WP_REST_NOT_FOUND' : 'CONNECTION_ERROR',
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

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('WordPress REST API Proxy Error:', error);
  res.status(500).json({
    error: 'Internal proxy error',
    details: error.message,
    timestamp: new Date().toISOString()
  });
});

export default router;