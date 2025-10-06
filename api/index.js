/**
 * Ninsaúde API Router Index (T055)
 *
 * Central mount point for all Ninsaúde API routes with middleware chain.
 * This file configures the Express router with proper middleware order and error handling.
 *
 * Middleware Chain Order (CRITICAL):
 * 1. CORS configuration (already applied at app level)
 * 2. lgpdAudit - LGPD compliance logging (must be first to log all requests)
 * 3. rateLimiter - Rate limiting (30 req/min to Ninsaúde)
 * 4. Auth routes (no token validation)
 * 5. validateToken - OAuth2 token validation (for protected routes)
 * 6. Protected routes (patients, appointments, availability, notifications)
 * 7. errorHandler - Centralized error handling (must be last)
 *
 * Routes:
 * - POST   /api/ninsaude/auth/token         - OAuth2 authentication (no auth required)
 * - POST   /api/ninsaude/patients           - Create/retrieve patient by CPF
 * - POST   /api/ninsaude/appointments       - Create appointment
 * - DELETE /api/ninsaude/appointments/:id   - Cancel appointment
 * - PATCH  /api/ninsaude/appointments/:id   - Reschedule appointment
 * - GET    /api/ninsaude/availability       - Get available slots
 * - POST   /api/ninsaude/availability/check - Verify specific slot
 * - POST   /api/ninsaude/notifications/send - Send dual notifications
 * - GET    /api/ninsaude/health             - Health check
 *
 * Environment Variables Required:
 * - NINSAUDE_API_URL
 * - NINSAUDE_ACCOUNT
 * - NINSAUDE_USERNAME
 * - NINSAUDE_PASSWORD
 * - REDIS_URL (optional)
 * - RESEND_API_KEY
 * - EVOLUTION_API_URL
 * - EVOLUTION_API_KEY
 */

import express from 'express';
import { createClient } from 'redis';

// Middleware imports
import { lgpdAudit } from './ninsaude/middleware/lgpdAudit.js';
import { rateLimiter } from './ninsaude/middleware/rateLimiter.js';
import { validateToken } from './ninsaude/middleware/validateToken.js';
import { errorHandler } from './ninsaude/middleware/errorHandler.js';

// Route imports
import authRoutes from './ninsaude/auth.js';
import patientRoutes from './ninsaude/patients.js';
import appointmentRoutes from './ninsaude/appointments.js';
import availabilityRoutes from './ninsaude/availability.js';
import notificationRoutes from './ninsaude/notifications.js';

// Initialize Redis client for middlewares
let redisClient = null;
async function getRedisClient() {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('[Ninsaude] Redis connection failed after 10 retries');
          return new Error('Redis connection failed');
        }
        return Math.min(retries * 50, 1000);
      }
    }
  });

  redisClient.on('error', (err) => console.error('[Ninsaude] Redis Error:', err));
  redisClient.on('connect', () => console.log('[Ninsaude] Redis connected'));

  await redisClient.connect();
  return redisClient;
}

// Export function to close Redis client for cleanup
export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
}

// Cleanup on process shutdown
process.on('beforeExit', closeRedisClient);
process.on('SIGINT', closeRedisClient);

const initializeMiddleware = async (router) => {
  try {
    const redis = await getRedisClient();
    router.use(lgpdAudit(redis));
    router.use(rateLimiter(redis));
    console.log('[Ninsaude] LGPD audit and rate limiting middleware initialized');
  } catch (error) {
    console.error('[Ninsaude] Failed to initialize Redis-based middleware:', error.message);
    console.log('[Ninsaude] Falling back to in-memory implementations');
    
    const MemoryCache = await import('./ninsaude/utils/memoryCache.js').then(m => m.MemoryCache);
    const memoryCache = new MemoryCache();
    
    router.use(lgpdAudit(memoryCache));
    router.use(rateLimiter(memoryCache));
    console.log('[Ninsaude] In-memory middleware fallback initialized');
  }
};


async function createRouter() {
  const router = express.Router();
  
  // STEP 1: Initialize middleware first
  await initializeMiddleware(router);
  
  // STEP 2: Health Check Endpoint (no authentication required)
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ninsaude-integration',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        authentication: 'OAuth2 password grant',
        patientRegistration: 'enabled',
        appointmentBooking: 'enabled',
        appointmentCancellation: 'enabled',
        appointmentRescheduling: 'enabled',
        slotAvailability: 'enabled',
        notifications: 'dual (email + WhatsApp)',
        lgpdCompliance: 'enabled',
        cfmCompliance: 'enabled'
      },
      config: {
        hasNinsaudeUrl: !!process.env.NINSAUDE_API_URL,
        hasNinsaudeAccount: !!process.env.NINSAUDE_ACCOUNT,
        hasNinsaudeCredentials: !!(process.env.NINSAUDE_USERNAME && process.env.NINSAUDE_PASSWORD),
        hasRedisUrl: !!process.env.REDIS_URL,
        hasResendKey: !!process.env.RESEND_API_KEY,
        hasEvolutionApi: !!(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY)
      }
    });
  });

  // STEP 3: Authentication Routes (no token validation needed)
  router.use('/auth', authRoutes);
  
  // STEP 4: Token Validation Middleware (for all protected routes)
  const redis = await getRedisClient();
  router.use(validateToken(redis));

  // STEP 5: Protected Routes
  router.use(patientRoutes);
  router.use(appointmentRoutes);
  router.use(availabilityRoutes);
  router.use(notificationRoutes);

  // STEP 6: Error Handler (must be last in middleware chain)
  router.use(errorHandler);
  
  return router;
}

/**
 * Export router factory for mounting at /api/ninsaude
 *
 * Usage in server.js:
 * ```javascript
 * import { createRouter } from './api/index.js';
 * const ninsaudeRouter = await createRouter();
 * app.use('/api/ninsaude', ninsaudeRouter);
 * ```
 */
export { createRouter };

// Stub default export that throws error if used directly
export default function() {
  throw new Error('Direct router usage not supported. Use: await createRouter()');
};
