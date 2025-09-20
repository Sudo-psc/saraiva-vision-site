import { createServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function setHealthCheckHeaders(res) {
  res.setHeader('Content-Type', 'application/json');
  Object.entries(DEV_SERVER_CONFIG.CACHE_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  Object.entries(DEV_SERVER_CONFIG.CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

function handleDevHealthCheck(res) {
  const healthData = generateDevHealthData();
  setHealthCheckHeaders(res);
  res.end(JSON.stringify(healthData));
}

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

async function createDevServer() {
  const vite = await createViteServer(DEV_SERVER_CONFIG.VITE_CONFIG);

  const server = createServer(async (req, res) => {
    res.req = req;
    if (req.url === DEV_SERVER_CONFIG.HEALTH_ENDPOINT || req.url === `${DEV_SERVER_CONFIG.HEALTH_ENDPOINT}/`) {
      if (handleDevPreflightRequest(res)) {
        return;
      }
      handleDevHealthCheck(res);
      return;
    }
    vite.middlewares(req, res);
  });

  let isShuttingDown = false;
  const activeConnections = new Set();

  server.on('connection', (socket) => {
    activeConnections.add(socket);
    socket.on('close', () => {
      activeConnections.delete(socket);
    });
  });

  function gracefulShutdown(signal) {
    if (isShuttingDown) {
      console.log(`${signal} received again, forcing exit...`);
      process.exit(1);
    }
    isShuttingDown = true;
    console.log(`${signal} received, starting graceful shutdown...`);

    vite.close().then(() => {
      console.log('Vite server closed');
      server.close((err) => {
        if (err) {
          console.error('Error during server close:', err);
          process.exit(1);
        }
        console.log('HTTP server closed');
      });

      const shutdownTimeout = setTimeout(() => {
        console.log('Graceful shutdown timeout, forcing exit...');
        activeConnections.forEach((socket) => {
          socket.destroy();
        });
        process.exit(1);
      }, 30000);

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

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

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