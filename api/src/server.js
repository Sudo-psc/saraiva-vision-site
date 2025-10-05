import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes - dynamically import and adapt Vercel handlers
const routes = [
  { path: '/api/config', handler: '../config.js' },
  { path: '/api/contact', handler: '../contact.js' },
  { path: '/api/servicos', handler: '../servicos/index.js' },
  { path: '/api/health', handler: '../health.js' },
  { path: '/api/revalidate', handler: '../revalidate.js' },
  { path: '/api/google-reviews', handler: '../google-reviews.js' },
  { path: '/api/google-reviews-stats', handler: '../google-reviews-stats.js' },
  { path: '/api/maps-health', handler: '../maps-health.js' },
  { path: '/api/maps/config', handler: '../maps-config.js' },
  { path: '/api/blog-posts', handler: '../blog-posts.js' },
  { path: '/api/ping', handler: '../ping.js' },
  { path: '/api/appointments', handler: '../appointments/availability.js' },
  { path: '/api/podcast', handler: '../podcast/episodes.js' },
  { path: '/api/admin', handler: '../admin/auth.js' },
  { path: '/api/analytics', handler: '../analytics/funnel.js' },
  { path: '/api/instagram', handler: '../instagram/posts.js' },
  { path: '/api/security', handler: '../security/monitor.js' },
  { path: '/api/outbox', handler: '../outbox/drain.js' },
  { path: '/api/images', handler: '../images/proxy.js' },
  { path: '/api/patient-data', handler: '../patient-data.js' }
];

// Load routes dynamically
for (const route of routes) {
  try {
    const handler = await import(route.handler);

    if (route.type === 'express') {
      // Handle Express routers directly
      app.use(route.path, handler.default);
    } else {
      // Handle Vercel serverless functions
      app.use(route.path, createExpressAdapter(handler.default));
    }

    console.log(`✅ Loaded route: ${route.path}`);
  } catch (error) {
    console.warn(`⚠️  Failed to load route ${route.path}:`, error.message);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Saraiva Vision API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

/**
 * Adapter to convert Vercel serverless functions to Express middleware
 */
function createExpressAdapter(vercelHandler) {
  return (req, res) => {
    // Convert Express req/res to Vercel format
    const vercelReq = {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
      url: req.url
    };

    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => {
        res.json(data);
      },
      send: (data) => {
        res.send(data);
      },
      setHeader: (name, value) => {
        res.setHeader(name, value);
        return vercelRes;
      },
      end: () => {
        res.end();
      }
    };

    // Call the Vercel handler
    vercelHandler(vercelReq, vercelRes);
  };
}