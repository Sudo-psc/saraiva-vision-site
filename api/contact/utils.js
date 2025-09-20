const TEXT_MAX_LENGTH = 1200;
const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 120;
const PHONE_MAX_LENGTH = 20;

/**
 * Parse the JSON body from an HTTP request.
 *
 * If `req.body` already contains an object, it is returned as-is. Otherwise the function
 * asynchronously reads the request stream and attempts to parse its UTF-8 contents as JSON.
 * Returns an empty object ({}) when the body is empty, when parsing fails, or when the
 * request body is not valid JSON.
 *
 * @param {import('http').IncomingMessage & { body?: any }} req - Node HTTP request (may have a pre-parsed `body`).
 * @returns {Promise<object>} Parsed JSON object or an empty object on empty/invalid body.
 */
export async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get the client's IP address from an HTTP request.
 *
 * Reads the `x-forwarded-for` header (returns the first IP before a comma, trimmed) when present;
 * otherwise falls back to `req.socket.remoteAddress`. Returns `undefined` if neither is available.
 *
 * @return {string|undefined} The client's IP address or `undefined` if not determinable.
 */
export function getClientIp(req) {
  const xfwd = req.headers?.['x-forwarded-for'];
  if (typeof xfwd === 'string' && xfwd.length > 0) {
    return xfwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || undefined;
}

/**
 * Normalize and truncate a raw contact submission.
 *
 * Coerces each field to a string (missing or non-string values become empty strings),
 * trims whitespace for name, email, and message, strips all non-digits from phone,
 * and enforces maximum lengths defined by NAME_MAX_LENGTH, EMAIL_MAX_LENGTH,
 * PHONE_MAX_LENGTH, and TEXT_MAX_LENGTH.
 *
 * @param {Object} [payload={}] - Raw submission object. May contain `name`, `email`, `phone`, `message`.
 * @return {{name: string, email: string, phone: string, message: string}} Sanitized submission with trimmed/truncated values and digits-only phone.
 */
export function sanitizeSubmission(payload = {}) {
  const name = typeof payload.name === 'string' ? payload.name : '';
  const email = typeof payload.email === 'string' ? payload.email : '';
  const phone = typeof payload.phone === 'string' ? payload.phone : '';
  const message = typeof payload.message === 'string' ? payload.message : '';

  return {
    name: name.trim().slice(0, NAME_MAX_LENGTH),
    email: email.trim().slice(0, EMAIL_MAX_LENGTH),
    phone: phone.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH),
    message: message.trim().slice(0, TEXT_MAX_LENGTH)
  };
}

/**
 * Validate a sanitized contact submission.
 *
 * Ensures required fields are present and returns a result object indicating validity.
 *
 * @param {{name?: string, email?: string, message?: string}} submission - Submission object (typically produced by sanitizeSubmission).
 * @returns {{ok: boolean, error?: 'missing_name' | 'missing_email' | 'missing_message'}} Result with `ok: true` when valid; otherwise `ok: false` and an `error` code indicating the missing field.
 */
export function validateSubmission(submission) {
  if (!submission.name) {
    return { ok: false, error: 'missing_name' };
  }
  if (!submission.email) {
    return { ok: false, error: 'missing_email' };
  }
  if (!submission.message) {
    return { ok: false, error: 'missing_message' };
  }
  return { ok: true };
}

/**
 * Add permissive CORS headers to an HTTP response.
 *
 * If the response object does not support setHeader this is a no-op. Otherwise
 * sets:
 * - Access-Control-Allow-Origin: '*'
 * - Access-Control-Allow-Methods: 'POST, OPTIONS'
 * - Access-Control-Allow-Headers: 'Content-Type'
 */
export function applyCors(res) {
  if (!res.setHeader) return;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
