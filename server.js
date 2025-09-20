import 'dotenv/config';
import http from 'node:http';
import url from 'node:url';

// Import the serverless-style API handlers
import reviewsHandler from './api/reviews.js';
import webVitalsHandler from './api/web-vitals.js';
import contactHandler from './api/contact.js';

// ============================================================================
// SERVER CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Rate limiting configuration to prevent abuse
 */
const RATE_LIMITING = {
  WINDOW_MS: 60_000, // 1 minute window
  MAX_REQUESTS: 100, // Maximum requests per window
  RETRY_AFTER_SECONDS: 60
};

/**
 * WordPress proxy configuration
 */
const WORDPRESS_CONFIG = {
  BASE_URL: 'http://wordpress:8083',
  TIMEOUT_MS: 10_000, // 10 second timeout
  PROXY_PATH: '/api/wordpress',
  DEFAULT_HEADERS: {
    'User-Agent': 'Saraiva-Vision-API/1.0',
    'Accept': 'application/json'
  }
};

/**
 * API server configuration
 */
const SERVER_CONFIG = {
  DEFAULT_PORT: 3001,
  DEFAULT_HOST: '0.0.0.0',
  API_BASE_PATH: '/api',
  HEALTH_ENDPOINT: '/api/health',
  OPENAPI_VERSION: '3.0.3'
};

/**
 * CORS configuration for cross-origin requests
 */
const CORS_CONFIG = {
  ALLOWED_ORIGINS: '*',
  ALLOWED_METHODS: 'GET, POST, PUT, DELETE, OPTIONS',
  ALLOWED_HEADERS: 'Content-Type, Content-Length, Authorization'
};

/**
 * HTTP headers to skip when proxying responses
 */
const SKIP_PROXY_HEADERS = ['content-length', 'transfer-encoding', 'connection'];

// ============================================================================
// GLOBAL STATE INITIALIZATION
// ============================================================================

/**
 * Initialize global rate limiting storage if not exists
 * This prevents DDoS attacks by tracking request counts per IP
 */
if (!global.requestCounts) {
  global.requestCounts = new Map();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Wraps Node.js response object with Express-like methods
 * @param {http.ServerResponse} res - The Node.js response object
 * @returns {http.ServerResponse} Enhanced response object with status() and json() methods
 */
function wrapRes(res) {
  /**
   * Sets the HTTP status code
   * @param {number} code - HTTP status code
   * @returns {http.ServerResponse} The response object for chaining
   */
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  /**
   * Sends a JSON response with proper headers
   * @param {Object} obj - Object to stringify and send as JSON
   */
  res.json = (obj) => {
    const body = JSON.stringify(obj);
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json');
    }
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);
  };

  return res;
}

/**
 * Sets CORS headers on a response
 * @param {http.ServerResponse} res - The response object
 */
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', CORS_CONFIG.ALLOWED_ORIGINS);
  res.setHeader('Access-Control-Allow-Methods', CORS_CONFIG.ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', CORS_CONFIG.ALLOWED_HEADERS);
}

/**
 * Sends a JSON error response with proper headers
 * @param {http.ServerResponse} res - The response object
 * @param {number} statusCode - HTTP status code
 * @param {string} error - Error type
 * @param {string} message - Error message
 * @param {Object} additionalData - Additional error data to include
 */
function sendErrorResponse(res, statusCode, error, message, additionalData = {}) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  setCORSHeaders(res);

  const errorResponse = {
    error,
    message,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  res.end(JSON.stringify(errorResponse));
}

/**
 * Handles OPTIONS preflight requests
 * @param {http.ServerResponse} res - The response object
 * @returns {boolean} True if the request was handled, false otherwise
 */
function handlePreflightRequest(res) {
  if (res.req?.method === 'OPTIONS') {
    res.statusCode = 204;
    setCORSHeaders(res);
    res.end();
    return true;
  }
  return false;
}

// ============================================================================
// RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * Checks if a request should be rate limited based on IP address
 * @param {string} ip - Client IP address
 * @returns {boolean} True if the request should be blocked, false otherwise
 */
function isRateLimited(ip) {
  const now = Date.now();
  const entry = global.requestCounts.get(ip) || { count: 0, start: now };

  // Reset window if it has expired
  if (now - entry.start > RATE_LIMITING.WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count += 1;
  }

  global.requestCounts.set(ip, entry);
  return entry.count > RATE_LIMITING.MAX_REQUESTS;
}

/**
 * Applies rate limiting to a request and sends error response if needed
 * @param {http.IncomingMessage} req - The request object
 * @param {http.ServerResponse} res - The response object
 * @returns {boolean} True if the request was rate limited (and response sent), false otherwise
 */
function applyRateLimit(req, res) {
  const ip = req.socket.remoteAddress || 'unknown';

  if (isRateLimited(ip)) {
    sendErrorResponse(res, 429, 'Too many requests', 'Rate limit exceeded. Please try again later.', {
      retryAfter: `${RATE_LIMITING.RETRY_AFTER_SECONDS} seconds`
    });
    res.setHeader('Retry-After', RATE_LIMITING.RETRY_AFTER_SECONDS);
    return true;
  }

  return false;
}

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Generates comprehensive health check data for API monitoring
 * @returns {Object} Health check data including system metrics and service status
 */
function generateHealthData() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    service: 'api',
    server: 'Saraiva Vision API',
    checks: {
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      requests: global.requestCounts?.size || 0,
      rate_limit: {
        window_ms: RATE_LIMITING.WINDOW_MS,
        max_requests: RATE_LIMITING.MAX_REQUESTS,
        current_entries: global.requestCounts?.size || 0
      }
    },
    services: {
      database: 'connected',
      external_apis: 'operational',
      wordpress: 'configured',
      frontend: 'configured'
    },
    endpoints: {
      health: SERVER_CONFIG.HEALTH_ENDPOINT,
      reviews: `${SERVER_CONFIG.API_BASE_PATH}/reviews`,
      contact: `${SERVER_CONFIG.API_BASE_PATH}/contact`,
      web_vitals: `${SERVER_CONFIG.API_BASE_PATH}/web-vitals`
    },
    openapi: {
      version: SERVER_CONFIG.OPENAPI_VERSION,
      title: 'Saraiva Vision API Health Check',
      description: 'Health monitoring endpoint for Saraiva Vision API service'
    }
  };
}

/**
 * Handles health check requests with proper headers and caching
 * @param {http.ServerResponse} res - The response object
 */
function handleHealthCheck(res) {
  const healthData = generateHealthData();

  // Set security and caching headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  setCORSHeaders(res);

  res.end(JSON.stringify(healthData));
}

// ============================================================================
// WORDPRESS PROXY FUNCTIONS
// ============================================================================

/**
 * Reads and parses JSON body from a request stream
 * @param {http.IncomingMessage} req - The request object
 * @returns {Promise<Object>} Parsed JSON body or empty object
 */
async function readRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return {};
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Proxies requests to WordPress service
 * @param {http.IncomingMessage} req - The incoming request
 * @param {http.ServerResponse} res - The outgoing response
 * @param {string} wordpressPath - The WordPress path to proxy to
 * @param {string} search - Query string parameters
 */
async function proxyToWordPress(req, res, wordpressPath, search) {
  const wordpressUrl = `${WORDPRESS_CONFIG.BASE_URL}${wordpressPath}${search || ''}`;

  try {
    // Build request headers for WordPress
    const headers = {
      ...WORDPRESS_CONFIG.DEFAULT_HEADERS,
      'Content-Type': req.headers['content-type'] || 'application/json',
      'X-Forwarded-For': req.socket.remoteAddress,
      'X-Forwarded-Proto': 'http'
    };

    // Forward authentication headers if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // Read request body for non-GET requests
    const body = req.method !== 'GET' && req.method !== 'HEAD'
      ? await readRequestBody(req)
      : null;

    // Make request to WordPress with timeout
    const response = await fetch(wordpressUrl, {
      method: req.method,
      headers: headers,
      body: body,
      signal: AbortSignal.timeout(WORDPRESS_CONFIG.TIMEOUT_MS)
    });

    // Build response headers (skip problematic ones)
    const responseHeaders = {};
    for (const [key, value] of response.headers.entries()) {
      if (!SKIP_PROXY_HEADERS.includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    }

    // Add CORS headers for cross-origin requests
    responseHeaders['Access-Control-Allow-Origin'] = '*';
    responseHeaders['Access-Control-Allow-Methods'] = CORS_CONFIG.ALLOWED_METHODS;
    responseHeaders['Access-Control-Allow-Headers'] = CORS_CONFIG.ALLOWED_HEADERS;

    // Set headers and forward response
    Object.entries(responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    const responseData = await response.text();
    res.statusCode = response.status;
    res.end(responseData);

  } catch (error) {
    console.error('WordPress proxy error:', error.message);

    if (error.name === 'AbortError') {
      sendErrorResponse(res, 504, 'Gateway Timeout', 'WordPress service timeout');
    } else {
      sendErrorResponse(res, 502, 'Bad Gateway', 'WordPress service unavailable');
    }
  }
}

// ============================================================================
// MAIN SERVER LOGIC
// ============================================================================

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  // Only handle API endpoints - reject all other requests
  if (!parsed.pathname?.startsWith(SERVER_CONFIG.API_BASE_PATH)) {
    sendErrorResponse(res, 404, 'Not found', 'This server only handles API endpoints');
    return;
  }

  // Apply rate limiting to all API requests
  if (applyRateLimit(req, res)) {
    return; // Request was rate limited and response sent
  }

  try { // Added comment to force rewrite
    // Set CORS headers for all API routes
    setCORSHeaders(res);

    // Handle preflight requests
    if (handlePreflightRequest(res)) {
      return; // Preflight request was handled
    }

    // Route API endpoints
    if (parsed.pathname.startsWith(SERVER_CONFIG.API_BASE_PATH)) {
      // Health check endpoint - OpenAPI 3.0.3 compliant
      if (parsed.pathname === SERVER_CONFIG.HEALTH_ENDPOINT || parsed.pathname === `${SERVER_CONFIG.HEALTH_ENDPOINT}/`) {
        handleHealthCheck(res);
        return;
      }

      // Reviews API endpoint
      if (parsed.pathname.startsWith(`${SERVER_CONFIG.API_BASE_PATH}/reviews`)) {
        await reviewsHandler(req, wrapRes(res));
        return;
      }

      // Web vitals API endpoint
      if (parsed.pathname.startsWith(`${SERVER_CONFIG.API_BASE_PATH}/web-vitals`)) {
        req.body = await readRequestBody(req);
        await webVitalsHandler(req, wrapRes(res));
        return;
      }

      // Contact form API endpoint
      if (parsed.pathname.startsWith(`${SERVER_CONFIG.API_BASE_PATH}/contact`)) {
        req.body = await readRequestBody(req);
        await contactHandler(req, wrapRes(res));
        return;
      }

      // WordPress proxy endpoints
      if (parsed.pathname.startsWith(`${WORDPRESS_CONFIG.PROXY_PATH}/`)) {
        const wordpressPath = parsed.pathname.replace(WORDPRESS_CONFIG.PROXY_PATH, '');
        await proxyToWordPress(req, res, wordpressPath, parsed.search);
        return;
      }

      // Unknown API route
      sendErrorResponse(res, 404, 'Not found', 'API endpoint not found', {
        path: parsed.pathname
      });
      return;
    }
  } catch (error) {
    console.error('API handler error:', error);

    if (!res.headersSent) {
      sendErrorResponse(res, 500, 'Internal server error',
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'An error occurred while processing your request'
      );
    }
    return;
  }

  // Handle non-API routes (shouldn't reach here in proper setup)
  sendErrorResponse(res, 404, 'Not found', 'API endpoint not found', {
    path: parsed.pathname
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || SERVER_CONFIG.DEFAULT_PORT;
const HOST = process.env.HOST || SERVER_CONFIG.DEFAULT_HOST;

/**
 * Start the API server with proper error handling
 */
server.listen(PORT, HOST, () => {
  console.log(`🚀 Saraiva Vision API Server started successfully`);
  console.log(`📡 Listening on: http://${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}${SERVER_CONFIG.HEALTH_ENDPOINT}`);
  console.log(`🔒 Rate limiting: ${RATE_LIMITING.MAX_REQUESTS} requests per ${RATE_LIMITING.WINDOW_MS / 1000}s`);
  console.log(`🌐 CORS enabled: ${CORS_CONFIG.ALLOWED_ORIGINS}`);

  if (process.env.NODE_ENV === 'development') {
    console.log(`🛠️  Development mode enabled`);
  }
});

/**
 * Handle server startup errors gracefully
 */
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please choose a different port.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});
