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

  const PORT = process.env.FRONTEND_PORT || 3002;
  server.listen(PORT, () => {
    console.log(`Frontend development server with health check listening on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });

  return server;
}

createDevServer().catch((err) => {
  console.error('Failed to start development server:', err);
  process.exit(1);
});