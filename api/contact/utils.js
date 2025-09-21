const TEXT_MAX_LENGTH = 1200;
const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 120;
const PHONE_MAX_LENGTH = 20;

/**
 * Parses the JSON body from an incoming request.
 * Handles cases where the body is already parsed or needs to be read from chunks.
 *
 * @param {import('http').IncomingMessage} req The incoming request object.
 * @returns {Promise<object>} A promise that resolves to the parsed JSON body, or an empty object on failure.
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
 * Retrieves the client's IP address from the request.
 * It prioritizes the 'x-forwarded-for' header, which is common in proxy/load balancer environments.
 *
 * @param {import('http').IncomingMessage} req The incoming request object.
 * @returns {string | undefined} The client's IP address, or undefined if not found.
 */
export function getClientIp(req) {
  const xfwd = req.headers?.['x-forwarded-for'];
  if (typeof xfwd === 'string' && xfwd.length > 0) {
    return xfwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || undefined;
}

/**
 * Sanitizes and normalizes the contact form submission payload.
 * Trims whitespace, enforces max lengths, and removes non-digit characters from the phone number.
 *
 * @param {object} [payload={}] The raw submission payload.
 * @param {string} [payload.name] The user's name.
 * @param {string} [payload.email] The user's email address.
 * @param {string} [payload.phone] The user's phone number.
 * @param {string} [payload.message] The user's message.
 * @returns {{name: string, email: string, phone: string, message: string}} The sanitized submission object.
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
 * Validates the sanitized submission to ensure required fields are present.
 *
 * @param {object} submission The sanitized submission object.
 * @param {string} submission.name The user's name.
 * @param {string} submission.email The user's email address.
 * @param {string} submission.message The user's message.
 * @returns {{ok: boolean, error?: string}} An object indicating if the validation was successful.
 * If not successful, it includes an error code.
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
 * Applies CORS (Cross-Origin Resource Sharing) headers to the server response.
 * Allows requests from any origin for POST and OPTIONS methods.
 *
 * @param {import('http').ServerResponse} res The server response object.
 */
export function applyCors(res) {
  if (!res.setHeader) return;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
