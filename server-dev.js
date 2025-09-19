import { createServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// ============================================================================
// DEVELOPMENT SERVER CONFIGURATION
// ============================================================================

/**
 * Development server configuration constants
 */
const DEV_SERVER_CONFIG = {
  DEFAULT_PORT: 3002,
  HEALTH_ENDPOINT: '/health',
  VITE_CONFIG: {
    server: { middlewareMode: true },
    appType: 'spa'
  },
  CACHE_HEADERS: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  CORS_HEADERS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
};

// Utility function to get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Generates development server health check data
 * @returns {Object} Health check data for development environment
 */
function generateDevHealthData() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    server: 'Saraiva Vision Frontend',
    service: 'frontend',
    checks: {
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      vite: 'running',
      proxy: {
        wordpress: 'configured',
        api: 'configured'
      }
    },
    endpoints: {
      health: DEV_SERVER_CONFIG.HEALTH_ENDPOINT,
      api: '/api/*',
      wordpress: '/wp-json/*',
      admin: '/wp-admin/*'
    }
  };
}

/**
 * Sets development server health check headers
 * @param {http.ServerResponse} res - The response object
 */
function setHealthCheckHeaders(res) {
  res.setHeader('Content-Type', 'application/json');
  Object.entries(DEV_SERVER_CONFIG.CACHE_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  Object.entries(DEV_SERVER_CONFIG.CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

/**
 * Handles health check requests for development server
 * @param {http.ServerResponse} res - The response object
 */
function handleDevHealthCheck(res) {
  const healthData = generateDevHealthData();
  setHealthCheckHeaders(res);
  res.end(JSON.stringify(healthData));
}

/**
 * Handles OPTIONS preflight requests for health check
 * @param {http.ServerResponse} res - The response object
 * @returns {boolean} True if request was handled, false otherwise
 */
function handleDevPreflightRequest(res) {
  if (res.req?.method === 'OPTIONS') {
    Object.entries(DEV_SERVER_CONFIG.CORS_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

// ============================================================================
// SERVER CREATION
// ============================================================================

/**
 * Creates and configures the development server with Vite middleware
 * @returns {Promise<http.Server>} Configured HTTP server instance
 */
async function createDevServer() {
  // Initialize Vite development server with middleware mode
  const vite = await createViteServer(DEV_SERVER_CONFIG.VITE_CONFIG);

  /**
   * Main request handler for development server
   * Handles health checks and routes all other requests to Vite middleware
   */
  const server = createServer(async (req, res) => {
    // Store request reference for preflight handler
    res.req = req;

    // Health check endpoint
    if (req.url === DEV_SERVER_CONFIG.HEALTH_ENDPOINT || req.url === `${DEV_SERVER_CONFIG.HEALTH_ENDPOINT}/`) {
      // Handle preflight requests
      if (handleDevPreflightRequest(res)) {
        return;
      }

      // Handle health check
      handleDevHealthCheck(res);
      return;
    }

    // Route all other requests to Vite middleware
    vite.middlewares(req, res);
  });

  // Start the server with detailed logging
  const PORT = process.env.FRONTEND_PORT || DEV_SERVER_CONFIG.DEFAULT_PORT;
  server.listen(PORT, () => {
    console.log(`🚀 Saraiva Vision Development Server started successfully`);
    console.log(`📡 Frontend server listening on: http://localhost:${PORT}`);
    console.log(`🏥 Health check endpoint: http://localhost:${PORT}${DEV_SERVER_CONFIG.HEALTH_ENDPOINT}`);
    console.log(`🔥 Hot Module Replacement (HMR) enabled`);
    console.log(`🌐 CORS enabled for development`);
    console.log(`💻 Development environment: ${process.env.NODE_ENV || 'development'}`);

    // Additional helpful information
    console.log(`\n📝 Available endpoints:`);
    console.log(`   • Health: http://localhost:${PORT}${DEV_SERVER_CONFIG.HEALTH_ENDPOINT}`);
    console.log(`   • Frontend: http://localhost:${PORT}/`);
    console.log(`   • API: http://localhost:${PORT}/api/* (proxied)`);
    console.log(`   • WordPress: http://localhost:${PORT}/wp-json/* (proxied)`);
  });

  return server;
}

// ============================================================================
// SERVER STARTUP AND ERROR HANDLING
// ============================================================================

/**
 * Initialize the development server with proper error handling
 */
createDevServer()
  .then((server) => {
    console.log(`✅ Development server is ready for connections`);

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const usedPort = error.port || PORT;
        console.error(`❌ Port ${usedPort} is already in use. Please try a different port.`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start development server:', err);
    console.error('🔍 This might be due to:');
    console.error('   • Port already in use');
    console.error('   • Vite configuration issues');
    console.error('   • Missing dependencies');
    console.error('   • File permission issues');
    process.exit(1);
  });

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down development server gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down development server gracefully...');
  process.exit(0);
});