// External WordPress Integration API Router
// Main router entry point for external WordPress proxy services

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import middleware
import { authenticateRequest } from './middleware/authentication.js';
import { validateRateLimit } from './middleware/rate-limiter.js';
import { cacheMiddleware } from './middleware/cache.js';
import { validateRequest } from './middleware/validation.js';
import { complianceFilter } from './middleware/compliance.js';

// Import controllers
import sourcesController from './controllers/sources.js';
import postsController from './controllers/posts.js';
import pagesController from './controllers/pages.js';
import mediaController from './controllers/media.js';
import categoriesController from './controllers/categories.js';
import tagsController from './controllers/tags.js';
import syncController from './controllers/sync.js';

// Import services
import { HealthService } from './services/health-service.js';
import { CacheService } from './services/cache-service.js';
import { ProxyService } from './services/proxy-service.js';

// Import utilities
import { createErrorResponse } from './utils/error-handler.js';
import { logger } from './utils/logger.js';

const router = express.Router();
const healthService = new HealthService();
const cacheService = new CacheService();
const proxyService = new ProxyService();

// CORS configuration for external WordPress API
const corsOptions = {
  origin: [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br',
    'https://saraivavision.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3002'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control'
  ],
  credentials: false,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: {
    error: 'Rate limit exceeded',
    message,
    retryAfter: Math.ceil(windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json(rateLimit.message);
  }
});

// Global rate limiter (applies to all routes)
const globalRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per 15 minutes
  'Too many requests from this IP'
);

// Per-source rate limiter (will be configured dynamically)
const sourceRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  30, // 30 requests per minute per source
  'Too many requests for this WordPress source'
);

// Apply global middleware
router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.saraivavision.com.br"]
    }
  }
}));

router.use(cors(corsOptions));
router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
router.use(globalRateLimiter);

// Request logging middleware
router.use((req, res, next) => {
  logger.info('External WordPress API request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint (no authentication required)
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await healthService.getSystemHealth();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      service: 'external-wordpress-api',
      version: '1.0.0',
      ...healthStatus
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Apply authentication middleware to all routes except health
router.use(authenticateRequest);

// Source management routes
router.get('/sources', sourcesController.listSources);
router.post('/sources', sourcesController.createSource);
router.get('/sources/:id', sourcesController.getSource);
router.put('/sources/:id', sourcesController.updateSource);
router.delete('/sources/:id', sourcesController.deleteSource);

// Content proxy routes with per-source rate limiting
router.use('/:sourceId', sourceRateLimiter);

// Posts endpoints
router.get('/:sourceId/posts',
  cacheMiddleware({ ttl: 300 }), // 5 minutes
  validateRequest('listPosts'),
  postsController.listPosts
);

router.get('/:sourceId/posts/:id',
  cacheMiddleware({ ttl: 600 }), // 10 minutes
  validateRequest('getPost'),
  postsController.getPost
);

router.get('/:sourceId/posts/slug/:slug',
  cacheMiddleware({ ttl: 600 }), // 10 minutes
  validateRequest('getPostBySlug'),
  postsController.getPostBySlug
);

// Pages endpoints
router.get('/:sourceId/pages',
  cacheMiddleware({ ttl: 600 }), // 10 minutes
  validateRequest('listPages'),
  pagesController.listPages
);

router.get('/:sourceId/pages/:id',
  cacheMiddleware({ ttl: 1800 }), // 30 minutes
  validateRequest('getPage'),
  pagesController.getPage
);

// Media endpoints
router.get('/:sourceId/media',
  cacheMiddleware({ ttl: 1800 }), // 30 minutes
  validateRequest('listMedia'),
  mediaController.listMedia
);

router.get('/:sourceId/media/:id',
  cacheMiddleware({ ttl: 3600 }), // 1 hour
  validateRequest('getMedia'),
  mediaController.getMedia
);

router.get('/:sourceId/media/:id/proxy',
  validateRequest('proxyMedia'),
  mediaController.proxyMedia
);

// Taxonomy endpoints
router.get('/:sourceId/categories',
  cacheMiddleware({ ttl: 1800 }), // 30 minutes
  validateRequest('listCategories'),
  categoriesController.listCategories
);

router.get('/:sourceId/categories/:id',
  cacheMiddleware({ ttl: 3600 }), // 1 hour
  validateRequest('getCategory'),
  categoriesController.getCategory
);

router.get('/:sourceId/tags',
  cacheMiddleware({ ttl: 1800 }), // 30 minutes
  validateRequest('listTags'),
  tagsController.listTags
);

router.get('/:sourceId/tags/:id',
  cacheMiddleware({ ttl: 3600 }), // 1 hour
  validateRequest('getTag'),
  tagsController.getTag
);

// Synchronization endpoints
router.post('/:sourceId/sync',
  validateRequest('triggerSync'),
  syncController.triggerSync
);

router.post('/:sourceId/sync/posts',
  validateRequest('syncPosts'),
  syncController.syncPosts
);

router.post('/:sourceId/sync/media',
  validateRequest('syncMedia'),
  syncController.syncMedia
);

router.get('/:sourceId/sync/status',
  syncController.getSyncStatus
);

router.get('/:sourceId/sync/logs',
  syncController.getSyncLogs
);

// Search and aggregation endpoints
router.get('/:sourceId/search',
  cacheMiddleware({ ttl: 300 }), // 5 minutes
  validateRequest('searchContent'),
  postsController.searchContent
);

router.get('/aggregated',
  cacheMiddleware({ ttl: 600 }), // 10 minutes
  validateRequest('getAggregatedContent'),
  postsController.getAggregatedContent
);

router.get('/unified',
  cacheMiddleware({ ttl: 900 }), // 15 minutes
  validateRequest('getUnifiedContent'),
  postsController.getUnifiedContent
);

// Error handling middleware
router.use((error, req, res, next) => {
  logger.error('External WordPress API error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json(createErrorResponse(
      'VALIDATION_ERROR',
      error.message,
      { details: error.details }
    ));
  }

  if (error.name === 'AuthenticationError') {
    return res.status(401).json(createErrorResponse(
      'AUTHENTICATION_ERROR',
      error.message
    ));
  }

  if (error.name === 'RateLimitError') {
    return res.status(429).json(createErrorResponse(
      'RATE_LIMIT_ERROR',
      error.message,
      { retryAfter: error.retryAfter }
    ));
  }

  if (error.name === 'SourceNotFoundError') {
    return res.status(404).json(createErrorResponse(
      'SOURCE_NOT_FOUND',
      error.message
    ));
  }

  if (error.name === 'ExternalServiceError') {
    return res.status(502).json(createErrorResponse(
      'EXTERNAL_SERVICE_ERROR',
      error.message,
      { source: error.source, status: error.status }
    ));
  }

  // Default error response
  res.status(500).json(createErrorResponse(
    'INTERNAL_ERROR',
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
  ));
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json(createErrorResponse(
    'NOT_FOUND',
    `Endpoint ${req.method} ${req.path} not found`
  ));
});

export default router;