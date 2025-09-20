import { parseJsonBody, getClientIp, sanitizeSubmission, validateSubmission, applyCors } from './utils.js';
import { verifyRecaptcha } from './recaptcha.js';
import { getRateLimiter } from './rateLimiter.js';
import { sendContactEmail } from './email.js';

const DEFAULT_ACTION = 'contact';

/**
 * HTTP handler for the contact form API route.
 *
 * Accepts POST requests containing a reCAPTCHA token and submission fields (name, email, phone, message).
 * Applies CORS, enforces POST-only with OPTIONS support, and enforces per-IP rate limits.
 * Verifies the provided reCAPTCHA token (expected action defaults to "contact"), sanitizes and validates the submission,
 * and forwards the submission to the email service.
 *
 * On success returns 200 with { ok: true, message, emailId, recaptcha: { score, action } }.
 * Returns appropriate HTTP error responses for: method not allowed (405), rate-limited (429),
 * missing token (400 with error 'missing_token'), reCAPTCHA verification failure (400 with error 'recaptcha_failed'),
 * validation failures (400 with error 'missing_required_fields'), and email service errors (propagated status or 500).
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
