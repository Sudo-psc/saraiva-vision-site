import { createServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // Graceful shutdown implementation
  let isShuttingDown = false;
  const activeConnections = new Set();

  const server = createServer(async (req, res) => {
    // Health check endpoint
    if (req.url === '/health' || req.url === '/health/') {
      const healthData = {
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
          health: '/health',
          api: '/api/*',
          wordpress: '/wp-json/*',
          admin: '/wp-admin/*'
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

    // Handle CORS preflight for health endpoint
    if (req.url === '/health' && req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.statusCode = 204;
      res.end();
      return;
    }

    // Vite middleware for all other requests
    vite.middlewares(req, res);
  });

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

    // Close Vite server first
    vite.close().then(() => {
      console.log('Vite server closed');
      
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
    }).catch((err) => {
      console.error('Error closing Vite server:', err);
      process.exit(1);
    });
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

  const PORT = process.env.FRONTEND_PORT || 3002;
  server.listen(PORT, () => {
    console.log(`Frontend development server with health check listening on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log('Graceful shutdown handlers registered for SIGTERM and SIGINT');
  });

  return server;
}

createDevServer().catch((err) => {
  console.error('Failed to start development server:', err);
  process.exit(1);
});
