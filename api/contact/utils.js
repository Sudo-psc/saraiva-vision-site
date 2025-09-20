const TEXT_MAX_LENGTH = 1200;
const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 120;
const PHONE_MAX_LENGTH = 20;

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

export function getClientIp(req) {
  const xfwd = req.headers?.['x-forwarded-for'];
  if (typeof xfwd === 'string' && xfwd.length > 0) {
    return xfwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || undefined;
}

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

export function applyCors(res) {
  if (!res.setHeader) return;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
