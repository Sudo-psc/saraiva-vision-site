import express from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Define validation schemas with Zod
const gaEventSchema = z.object({
  event_name: z.string().min(1).max(100).optional(),
  event_params: z.record(z.any()).optional(),
  user_id: z.string().min(1).max(100).optional(),
  user_properties: z.record(z.any()).optional(),
  session_id: z.string().min(1).max(100).optional(),
  timestamp: z.string().datetime().optional(),
  page_location: z.string().url().optional(),
  page_title: z.string().min(1).max(200).optional()
});

const gtmEventSchema = z.object({
  event: z.string().min(1).max(100),
  ecommerce: z.any().optional(),
  page: z.object({
    location: z.string().url().optional(),
    title: z.string().min(1).max(200).optional(),
    path: z.string().min(1).max(500).optional()
  }).optional(),
  user_properties: z.record(z.any()).optional(),
  items: z.array(z.any()).optional(),
  value: z.number().optional(),
  currency: z.string().length(3).optional()
});

// Rate limiting middleware for analytics endpoints
const analyticsRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: {
    error: 'Too many analytics requests',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.warn(`[Analytics] Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(60 / 1000)
    });
  }
});

// Apply rate limiting to all analytics routes
router.use(analyticsRateLimit);

/**
 * @swagger
 * /api/analytics/ga:
 *   post:
 *     summary: Receives a Google Analytics event.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/gaEventSchema'
 *     responses:
 *       204:
 *         description: The event was received successfully.
 *       400:
 *         description: Bad request. Invalid request body.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Internal server error.
 */
router.post('/ga', (req, res) => {
  try {
    // Validate request body
    const validatedData = gaEventSchema.parse(req.body);

    // Log successful analytics event for monitoring
    console.log(`[Analytics] GA event received: ${validatedData.event_name || 'unnamed'} from IP: ${req.ip}`);

    // Return 204 No Content as per analytics best practices
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn(`[Analytics] Invalid GA payload from IP ${req.ip}:`, error.errors);
      return res.status(400).json({
        error: 'Invalid request body',
        details: (error.errors || []).map(err => ({
          field: (err.path || []).join('.'),
          message: err.message || 'Validation error'
        }))
      });
    }

    console.error(`[Analytics] Error processing GA request from IP ${req.ip}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/ga', (req, res) => {
  res.status(405).json({ error: 'Method not allowed' });
});

/**
 * @swagger
 * /api/analytics/gtm:
 *   post:
 *     summary: Receives a Google Tag Manager event.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/gtmEventSchema'
 *     responses:
 *       204:
 *         description: The event was received successfully.
 *       400:
 *         description: Bad request. Invalid request body.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Internal server error.
 */
router.post('/gtm', (req, res) => {
  try {
    // Validate request body
    const validatedData = gtmEventSchema.parse(req.body);

    // Log successful analytics event for monitoring
    console.log(`[Analytics] GTM event received: ${validatedData.event} from IP: ${req.ip}`);

    // Return 204 No Content as per analytics best practices
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn(`[Analytics] Invalid GTM payload from IP ${req.ip}:`, error.errors);
      return res.status(400).json({
        error: 'Invalid request body',
        details: (error.errors || []).map(err => ({
          field: (err.path || []).join('.'),
          message: err.message || 'Validation error'
        }))
      });
    }

    console.error(`[Analytics] Error processing GTM request from IP ${req.ip}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/gtm', (req, res) => {
  res.status(405).json({ error: 'Method not allowed' });
});

export default router;
