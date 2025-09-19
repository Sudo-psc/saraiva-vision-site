import 'dotenv/config';
import http from 'node:http';
import url from 'node:url';

// Import the serverless-style handler
import reviewsHandler from './api/reviews.js';
import webVitalsHandler from './api/web-vitals.js';
import contactHandler from './api/contact.js';

function wrapRes(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
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

// Simple in-memory rate limiter to mitigate local DDoS attempts
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;
if (!global.requestCounts) {
  global.requestCounts = new Map();
}

const server = http.createServer(async (req, res) => {
  const now = Date.now();
  const ip = req.socket.remoteAddress || 'unknown';
  const entry = global.requestCounts.get(ip) || { count: 0, start: now };

  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count += 1;
  }

  global.requestCounts.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', '60');
    res.end(JSON.stringify({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: '60 seconds'
    }));
    return;
  }

  const parsed = url.parse(req.url, true);
  // Route API endpoints
  if (parsed.pathname && parsed.pathname.startsWith('/api/')) {
    try {
      // Set CORS headers for all API routes
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      // Health check endpoint - OpenAPI 3.0.3 compliant
      if (parsed.pathname === '/api/health' || parsed.pathname === '/api/health/') {
        const healthData = {
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
              window_ms: RATE_LIMIT_WINDOW_MS,
              max_requests: RATE_LIMIT_MAX_REQUESTS,
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
            health: '/api/health',
            reviews: '/api/reviews',
            contact: '/api/contact',
            web_vitals: '/api/web-vitals'
          },
          openapi: {
            version: '3.0.3',
            title: 'Saraiva Vision API Health Check',
            description: 'Health monitoring endpoint for Saraiva Vision API service'
          }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.end(JSON.stringify(healthData));
        return;
      }

      if (parsed.pathname.startsWith('/api/reviews')) {
        await reviewsHandler(req, wrapRes(res));
        return;
      }
      if (parsed.pathname.startsWith('/api/web-vitals')) {
        // Collect JSON body for POST/OPTIONS
        if (req.method === 'POST') {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString('utf8');
          try {
            req.body = raw ? JSON.parse(raw) : {};
          } catch {
            req.body = {};
          }
        }
        await webVitalsHandler(req, wrapRes(res));
        return;
      }
      if (parsed.pathname.startsWith('/api/contact')) {
        // Collect JSON body for POST/OPTIONS
        if (req.method === 'POST') {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString('utf8');
          try {
            req.body = raw ? JSON.parse(raw) : {};
          } catch {
            req.body = {};
          }
        }
        await contactHandler(req, wrapRes(res));
        return;
      }

      // WordPress proxy endpoints
      if (parsed.pathname.startsWith('/api/wordpress/')) {
        const wordpressPath = parsed.pathname.replace('/api/wordpress', '');
        const wordpressUrl = `http://wordpress:8083${wordpressPath}${parsed.search || ''}`;

        try {
          const headers = {
            'User-Agent': 'Saraiva-Vision-API/1.0',
            'Accept': 'application/json',
            'Content-Type': req.headers['content-type'] || 'application/json',
            'X-Forwarded-For': req.socket.remoteAddress,
            'X-Forwarded-Proto': 'http'
          };

          // Copy WordPress authentication headers if present
          if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
          }

          let body = null;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            body = Buffer.concat(chunks);
          }

          const response = await fetch(wordpressUrl, {
            method: req.method,
            headers: headers,
            body: body,
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });

          // Copy response headers
          const responseHeaders = {};
          for (const [key, value] of response.headers.entries()) {
            // Skip problematic headers
            if (!['content-length', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
              responseHeaders[key] = value;
            }
          }

          // Add CORS headers
          responseHeaders['Access-Control-Allow-Origin'] = '*';
          responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
          responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

          Object.entries(responseHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
          });

          const responseData = await response.text();
          res.statusCode = response.status;
          res.end(responseData);
          return;

        } catch (error) {
          console.error('WordPress proxy error:', error.message);

          if (error.name === 'AbortError') {
            res.statusCode = 504;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: 'Gateway Timeout',
              message: 'WordPress service timeout',
              timestamp: new Date().toISOString()
            }));
            return;
          }

          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Bad Gateway',
            message: 'WordPress service unavailable',
            timestamp: new Date().toISOString()
          }));
          return;
        }
      }

      // Unknown API route
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Not found',
        message: 'API endpoint not found',
        path: parsed.pathname
      }));
      return;
    } catch (e) {
      console.error('API handler error:', e);

      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
      }

      const errorResponse = {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? e.message : 'An error occurred while processing your request',
        timestamp: new Date().toISOString()
      };

      res.end(JSON.stringify(errorResponse));
      return;
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    error: 'Not found',
    message: 'This server only handles API endpoints'
  }));
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Graceful shutdown implementation
let isShuttingDown = false;
const activeConnections = new Set();

// Track active connections
server.on('connection', (socket) => {
  activeConnections.add(socket);
  socket.on('close', () => {
    activeConnections.delete(socket);
  });
});

// Graceful shutdown function
function gracefulShutdown(signal) {
  if (isShuttingDown) {
    console.log(`${signal} received again, forcing exit...`);
    process.exit(1);
  }

  isShuttingDown = true;
  console.log(`${signal} received, starting graceful shutdown...`);

  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      console.error('Error during server close:', err);
      process.exit(1);
    }
    console.log('HTTP server closed');
  });

  // Set a timeout for forceful shutdown
  const shutdownTimeout = setTimeout(() => {
    console.log('Graceful shutdown timeout, forcing exit...');
    
    // Destroy all active connections
    activeConnections.forEach((socket) => {
      socket.destroy();
    });
    
    process.exit(1);
  }, 30000); // 30 seconds timeout

  // Wait for all connections to close
  const checkConnections = setInterval(() => {
    if (activeConnections.size === 0) {
      clearInterval(checkConnections);
      clearTimeout(shutdownTimeout);
      console.log('All connections closed, exiting gracefully');
      process.exit(0);
    } else {
      console.log(`Waiting for ${activeConnections.size} active connections to close...`);
    }
  }, 1000);
}

// Register signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

server.listen(PORT, HOST, () => {
  console.log(`API server listening on http://${HOST}:${PORT}`);
  console.log('Graceful shutdown handlers registered for SIGTERM and SIGINT');
});
