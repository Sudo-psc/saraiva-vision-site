/**
 * CSRF Token Management
 * Generates and validates CSRF tokens for form submissions
 */

import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Token storage (usar Redis em produção)
const tokens = new Map();

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of tokens.entries()) {
    if (now > data.expiresAt) {
      tokens.delete(sessionId);
    }
  }
}, 60000); // Cleanup a cada 1 minuto

/**
 * @swagger
 * /api/csrf-token:
 *   get:
 *     summary: Generates a new CSRF token.
 *     responses:
 *       200:
 *         description: The CSRF token was generated successfully.
 *       500:
 *         description: Internal server error.
 */
router.get('/csrf-token', (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = req.sessionID || req.ip || req.get('user-agent');

    tokens.set(sessionId, {
      token,
      expiresAt: Date.now() + 300000, // 5 minutos
      createdAt: Date.now()
    });

    console.log('[CSRF] Token generated:', {
      sessionId: sessionId.substring(0, 10) + '...',
      expiresAt: new Date(Date.now() + 300000).toISOString()
    });

    res.json({
      token,
      expiresIn: 300000 // 5 minutos em ms
    });

  } catch (error) {
    console.error('[CSRF] Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
});

/**
 * An Express middleware for validating CSRF tokens.
 *
 * @param {object} req The Express request object.
 * @param {object} res The Express response object.
 * @param {function(): void} next The next middleware function.
 */
export function validateCSRF(req, res, next) {
  const token = req.headers['x-csrf-token'];
  const sessionId = req.sessionID || req.ip || req.get('user-agent');

  if (!token) {
    console.warn('[CSRF] Token missing in request');
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  const storedData = tokens.get(sessionId);

  if (!storedData) {
    console.warn('[CSRF] No stored token for session:', sessionId.substring(0, 10) + '...');
    return res.status(403).json({ error: 'CSRF token invalid' });
  }

  if (Date.now() > storedData.expiresAt) {
    tokens.delete(sessionId);
    console.warn('[CSRF] Token expired');
    return res.status(403).json({ error: 'CSRF token expired' });
  }

  if (storedData.token !== token) {
    console.warn('[CSRF] Token mismatch');
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }

  // Token válido, remover (uso único)
  tokens.delete(sessionId);

  console.log('[CSRF] Token validated successfully');
  next();
}

export default router;
