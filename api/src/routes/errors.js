/**
 * Error Tracking Endpoint
 * Receives error reports from frontend ErrorTracker
 */

import express from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Error report schema
const errorReportSchema = z.object({
  type: z.enum(['error', 'unhandledrejection', 'csp_violation', 'network_error']),
  message: z.string().max(1000),
  stack: z.string().max(5000).optional(),
  filename: z.string().max(500).optional(),
  lineno: z.number().optional(),
  colno: z.number().optional(),
  timestamp: z.string().datetime().optional(),
  url: z.string().url().optional(),
  userAgent: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  context: z.record(z.any()).optional(),
  breadcrumbs: z.array(z.object({
    category: z.string(),
    message: z.string(),
    data: z.any().optional(),
    timestamp: z.number()
  })).optional()
});

// Rate limiting: 100 errors per minute per IP (generous for error reporting)
const errorRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many error reports' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (req, res) => {
    console.warn(`[Errors] Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
});

router.use(errorRateLimit);

/**
 * POST /api/errors
 * Receive error reports from frontend
 */
router.post('/', (req, res) => {
  try {
    // Validate request body
    const validatedError = errorReportSchema.parse(req.body);

    // Filter out Chrome extension errors (not our code)
    if (validatedError.filename?.includes('chrome-extension://')) {
      console.log('[Errors] Ignored Chrome extension error:', validatedError.message.substring(0, 100));
      return res.status(204).send();
    }

    // Filter out known third-party script errors
    const ignoredDomains = [
      'googletagmanager.com',
      'google-analytics.com',
      'doubleclick.net',
      'facebook.com',
      'connect.facebook.net'
    ];

    if (validatedError.filename && ignoredDomains.some(domain => validatedError.filename.includes(domain))) {
      console.log('[Errors] Ignored third-party error:', validatedError.filename);
      return res.status(204).send();
    }

    // Log error for monitoring
    const logLevel = validatedError.severity === 'critical' ? 'error' : 'warn';
    console[logLevel]('[Errors] Frontend error received:', {
      type: validatedError.type,
      message: validatedError.message.substring(0, 200),
      category: validatedError.category,
      severity: validatedError.severity,
      url: validatedError.url,
      filename: validatedError.filename,
      ip: req.ip
    });

    // In production, you might want to:
    // - Send to Sentry/LogRocket/etc
    // - Store in database
    // - Alert on critical errors
    // - Aggregate metrics

    // Return 204 No Content (standard for logging endpoints)
    res.status(204).send();

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn('[Errors] Invalid error report from IP', req.ip, ':', error.errors);
      return res.status(400).json({
        error: 'Invalid error report',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error('[Errors] Failed to process error report:', error);
    res.status(500).json({ error: 'Failed to process error report' });
  }
});

/**
 * GET /api/errors
 * Not allowed - only POST accepted
 */
router.get('/', (req, res) => {
  res.status(405).json({ error: 'Method not allowed' });
});

export default router;
