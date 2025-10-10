/**
 * API Endpoint: /api/webhook-appointment
 * Webhook para processar notificações de agendamento
 *
 * Como usar:
 * 1. Gerar assinatura:
 *    echo -n 'PAYLOAD_JSON' | openssl dgst -sha256 -hmac 'SECRET' | cut -d' ' -f2
 *
 * 2. Enviar requisição:
 *    curl -X POST https://saraivavision.com.br/api/webhook-appointment \
 *      -H "Content-Type: application/json" \
 *      -H "X-Webhook-Signature: ASSINATURA" \
 *      -d 'PAYLOAD_JSON'
 *
 * Secret: Ver APPOINTMENT_WEBHOOK_SECRET em .env.production
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { logger } from './src/utils/logger.js';
import { AppointmentWebhook } from './src/webhooks/appointment-webhook.js';

const router = express.Router();
const webhook = new AppointmentWebhook();

// Define appointment webhook schema with Zod
const appointmentWebhookSchema = z.object({
  appointment_id: z.string().min(1).max(100),
  patient_name: z.string().min(1).max(200),
  patient_email: z.string().email().optional(),
  patient_phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  service_type: z.string().min(1).max(100),
  appointment_date: z.string().datetime(),
  appointment_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show']),
  notes: z.string().max(1000).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

// Rate limiting for appointment webhook
const appointmentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: {
    error: 'Too many appointment webhook requests',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req, res) => {
    logger.warn('Appointment webhook rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(60 / 1000)
    });
  }
});

// CORS configuration - restrict to approved origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Approved origins (update with actual allowed domains)
    const allowedOrigins = [
      'https://saraivavision.com.br',
      'https://www.saraivavision.com.br',
      /^https:\/\/.*\.ninsaude\.com\.br$/, // Allow Ninsaúde subdomains
      'https://ninsaude.com.br'
    ];

    if (allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin, ip: req.ip });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply security middleware in order
router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'none'"],
      styleSrc: ["'none'"],
      imgSrc: ["'none'"],
      connectSrc: ["'none'"],
      fontSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

router.use(cors(corsOptions));

// Apply rate limiting
router.use(appointmentRateLimit);

// Main webhook handler
router.post('/', async (req, res) => {
  const startTime = Date.now();
  let requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Validate request body with Zod
    const validationResult = appointmentWebhookSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn('Invalid appointment webhook payload', {
        requestId,
        errors: validationResult.error.errors,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const validatedData = validationResult.data;

    // Log the validated request for monitoring
    logger.info('Processing appointment webhook', {
      requestId,
      appointmentId: validatedData.appointment_id,
      patientName: validatedData.patient_name,
      status: validatedData.status,
      ip: req.ip,
      responseTime: Date.now() - startTime
    });

    // Preserve raw body for signature verification
    const rawBody = JSON.stringify(req.body);

    // Convert Express req to Vercel-like Request format
    const vercelReq = {
      method: req.method,
      headers: req.headers,
      body: {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from(rawBody, 'utf8');
        }
      },
      url: req.url
    };

    // Process webhook
    const response = await webhook.handle(vercelReq);

    // Extract response data
    const responseData = await response.json();
    const status = response.status;

    // Log successful processing
    logger.info('Appointment webhook processed successfully', {
      requestId,
      status,
      responseTime: Date.now() - startTime
    });

    // Return response to Express
    return res.status(status).json(responseData);

  } catch (error) {
    // Log detailed error without exposing sensitive information
    logger.error('Appointment webhook processing failed', {
      requestId,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      responseTime: Date.now() - startTime
    });

    // Return generic error message to client
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      requestId: requestId
    });
  }
});

// Handle unsupported methods
router.use('/', (req, res) => {
  logger.warn('Unsupported method for appointment webhook', {
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(405).json({
    success: false,
    error: 'Method not allowed',
    allowedMethods: ['POST']
  });
});

export default router;
