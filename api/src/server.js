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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  credentials: true
}));

// Rate limiting - Ajustado para desenvolvimento/testes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for health check and analytics endpoints
    return req.path === '/api/health' ||
           req.path === '/api/maps-health' ||
           req.path.startsWith('/api/analytics') ||
           req.path.startsWith('/api/errors') ||
           req.path.startsWith('/api/google-reviews');
  }
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
  // { path: '/api/revalidate', handler: '../revalidate.js' }, // Desabilitado - dependência ausente
  { path: '/api/google-reviews', handler: '../google-reviews.js' },
  { path: '/api/google-reviews-stats', handler: '../google-reviews-stats.js' },
  // { path: '/api/blog-posts', handler: '../blog-posts.js' }, // Desabilitado - arquivo ausente
  { path: '/api/ping', handler: '../ping.js' },
  { path: '/api/analytics/funnel', handler: '../analytics/funnel.js' },
  { path: '/api/analytics', handler: './routes/analytics.js', type: 'express' },
  { path: '/api/bug-report', handler: './routes/bugReport.js', type: 'express' },
  { path: '/api/track-404', handler: './routes/404tracking.js', type: 'express' },
  { path: '/api/errors', handler: './routes/errors.js', type: 'express' },
  { path: '/api/csrf-token', handler: './routes/csrf.js', type: 'express' },
  { path: '/api/csp-reports', handler: './routes/csp-reports.js', type: 'express' },
  { path: '/api/webhook-appointment', handler: '../webhook-appointment.js' },
  { path: '/api/ga', handler: './routes/ga.js', type: 'express' },
  { path: '/api/gtm', handler: './routes/gtm.js', type: 'express' },
  { path: '/api/maps-health', handler: './routes/maps-health.js', type: 'express' }
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