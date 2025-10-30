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
  type: z.enum(['error', 'unhandledrejection', 'csp_violation', 'network_error', 'window.onerror', 'fetch']).optional(),
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

// Batch error schema (for error-tracker.js batching)
const batchErrorSchema = z.object({
  errors: z.array(errorReportSchema),
  batch: z.object({
    size: z.number(),
    sessionId: z.string(),
    timestamp: z.string().datetime()
  })
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
 * Processes a single error report, filtering out irrelevant errors and logging valid ones.
 *
 * @param {object} error The error report object.
 * @param {string} ip The IP address of the client.
 * @returns {boolean} `true` if the error was processed, `false` if it was ignored.
 * @private
 */
function processError(error, ip) {
  // Filter out Chrome extension errors (not our code)
  if (error.filename?.includes('chrome-extension://')) {
    console.log('[Errors] Ignored Chrome extension error:', error.message?.substring(0, 100));
    return false;
  }

  // Filter out known third-party script errors
  const ignoredDomains = [
    'googletagmanager.com',
    'google-analytics.com',
    'doubleclick.net',
    'facebook.com',
    'connect.facebook.net'
  ];

  if (error.filename && ignoredDomains.some(domain => error.filename.includes(domain))) {
    console.log('[Errors] Ignored third-party error:', error.filename);
    return false;
  }

  // Log error for monitoring
  const logLevel = error.severity === 'critical' ? 'error' : 'warn';
  console[logLevel]('[Errors] Frontend error received:', {
    type: error.type,
    message: error.message?.substring(0, 200),
    category: error.category,
    severity: error.severity,
    url: error.url,
    filename: error.filename,
    ip: ip
  });

  return true;
}

/**
 * @swagger
 * /api/errors:
 *   post:
 *     summary: Receives error reports from the frontend.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/errorReportSchema'
 *               - $ref: '#/components/schemas/batchErrorSchema'
 *     responses:
 *       204:
 *         description: The error report was received successfully.
 *       400:
 *         description: Bad request. Invalid report format.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Internal server error.
 */
router.post('/', (req, res) => {
  try {
    // Try to parse as batch first
    const batchValidation = batchErrorSchema.safeParse(req.body);

    if (batchValidation.success) {
      // Handle batch
      const { errors, batch } = batchValidation.data;
      let processedCount = 0;

      for (const error of errors) {
        if (processError(error, req.ip)) {
          processedCount++;
        }
      }

      console.log(`[Errors] Batch processed: ${processedCount}/${batch.size} errors (session: ${batch.sessionId})`);
      return res.status(204).send();
    }

    // Try to parse as single error
    const singleValidation = errorReportSchema.safeParse(req.body);

    if (singleValidation.success) {
      processError(singleValidation.data, req.ip);
      return res.status(204).send();
    }

    // Both validations failed, return error
    const errors = batchValidation.error || singleValidation.error;
    console.warn('[Errors] Invalid error report from IP', req.ip, ':', errors.errors);
    return res.status(400).json({
      error: 'Invalid error report',
      details: errors.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });

  } catch (error) {
    console.error('[Errors] Failed to process error report:', error);
    res.status(500).json({ error: 'Failed to process error report' });
  }
});

/**
 * @swagger
 * /api/errors:
 *   get:
 *     summary: Method not allowed.
 *     responses:
 *       405:
 *         description: Method not allowed.
 */
router.get('/', (req, res) => {
  res.status(405).json({ error: 'Method not allowed' });
});

export default router;
