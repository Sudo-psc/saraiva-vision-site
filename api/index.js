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

const router = express.Router();

// STEP 1: LGPD Audit Logging (must be first to log all requests)
router.use(lgpdAudit);

// STEP 2: Rate Limiting (30 requests per minute to Ninsaúde API)
router.use(rateLimiter);

// STEP 3: Health Check Endpoint (no authentication required)
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

// STEP 4: Authentication Routes (no token validation needed)
router.use('/auth', authRoutes);

// STEP 5: Token Validation Middleware (for all protected routes)
// This middleware validates OAuth2 token and refreshes if needed
router.use(validateToken);

// STEP 6: Protected Routes (require valid OAuth2 token)
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/availability', availabilityRoutes);
router.use('/notifications', notificationRoutes);

// STEP 7: Error Handler (must be last in middleware chain)
router.use(errorHandler);

/**
 * Export router for mounting at /api/ninsaude
 *
 * Usage in server.js:
 * ```javascript
 * import ninsaudeRouter from './api/index.js';
 * app.use('/api/ninsaude', ninsaudeRouter);
 * ```
 */
export default router;
