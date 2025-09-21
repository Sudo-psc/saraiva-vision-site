import { parseJsonBody, getClientIp, sanitizeSubmission, validateSubmission, applyCors } from './utils.js';
import { verifyRecaptcha } from './recaptcha.js';
import { getRateLimiter } from './rateLimiter.js';
import { sendContactEmail } from './email.js';

const DEFAULT_ACTION = 'contact';

/**
 * Handles incoming contact form submissions.
 * This serverless function processes POST requests from the contact form.
 * It performs CORS checks, rate limiting, reCAPTCHA verification, input validation,
 * and finally sends a contact email.
 *
 * @param {import('http').IncomingMessage} req The incoming request object.
 * @param {import('http').ServerResponse} res The server response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export default async function handler(req, res) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ipAddress = getClientIp(req);
  const rateLimiter = getRateLimiter();
  const rateStatus = rateLimiter.check(ipAddress);

  if (!rateStatus.allowed) {
    if (rateStatus.retryAfter) {
      res.setHeader('Retry-After', rateStatus.retryAfter);
    }
    return res.status(429).json({ error: 'rate_limited' });
  }

  const body = await parseJsonBody(req);
  const { token, action, name, email, phone, message } = body || {};

  if (!token) {
    return res.status(400).json({ error: 'missing_token' });
  }

  const verification = await verifyRecaptcha({
    token,
    expectedAction: action || DEFAULT_ACTION,
    remoteip: ipAddress
  });

  if (!verification.ok) {
    return res.status(400).json({ error: 'recaptcha_failed', details: verification });
  }

  const submission = sanitizeSubmission({ name, email, phone, message });
  const validation = validateSubmission(submission);

  if (!validation.ok) {
    return res.status(400).json({ error: 'missing_required_fields', details: validation.error });
  }

  try {
    const emailResult = await sendContactEmail({ submission, verification });

    if (!emailResult.ok) {
      return res.status(emailResult.status || 500).json({
        error: emailResult.error,
        details: emailResult.details || null
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Mensagem enviada com sucesso!',
      emailId: emailResult.id,
      recaptcha: {
        score: verification.score,
        action: verification.action
      }
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'email_service_error', message: error.message });
  }
}
