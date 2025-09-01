import 'dotenv/config';

// Lightweight contact API with Google reCAPTCHA v3 verification
// Expects POST { name, email, phone, message, token, action }

const parseBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const getClientIp = (req) => {
  const xfwd = req.headers['x-forwarded-for'];
  if (typeof xfwd === 'string') return xfwd.split(',')[0].trim();
  return req.socket?.remoteAddress || undefined;
};

const verifyRecaptcha = async ({ token, remoteip, expectedAction }) => {
  const secret = process.env.RECAPTCHA_SECRET || process.env.GOOGLE_RECAPTCHA_SECRET;
  if (!secret) {
    return { ok: false, code: 'missing_secret', message: 'Missing RECAPTCHA_SECRET' };
  }

  try {
    const params = new URLSearchParams();
    params.set('secret', secret);
    params.set('response', token || '');
    if (remoteip) params.set('remoteip', remoteip);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await res.json();

    if (!data.success) {
      return { ok: false, code: 'verification_failed', message: data['error-codes']?.join(', ') || 'verification failed' };
    }

    if (expectedAction && data.action && data.action !== expectedAction) {
      return { ok: false, code: 'action_mismatch', message: `unexpected action: ${data.action}` };
    }

    // For development/test keys, score might be undefined
    // In that case, we consider it valid if success=true
    const score = typeof data.score === 'number' ? data.score : 1.0;

    // Only apply score threshold for actual v3 responses (when score is provided)
    if (typeof data.score === 'number' && score < 0.5) {
      return { ok: false, code: 'low_score', message: `low score: ${score}`, score };
    }

    return { ok: true, score, action: data.action || null, challenge_ts: data.challenge_ts, hostname: data.hostname };
  } catch (err) {
    return { ok: false, code: 'network_error', message: err.message };
  }
};

export default async function handler(req, res) {
  // CORS preflight (optional local development)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  const body = await parseBody(req);

  const { name, email, phone, message, token, action } = body || {};

  if (!token) {
    return res.status(400).json({ error: 'missing_token' });
  }

  const verification = await verifyRecaptcha({ token, remoteip: ip, expectedAction: action || 'contact' });
  if (!verification.ok) {
    return res.status(400).json({ error: 'recaptcha_failed', details: verification });
  }

  // NOTE: This is a stub. In production, you might enqueue an email/send to CRM.
  // To avoid storing PII, we simply acknowledge receipt.
  const safe = {
    name: String(name || '').slice(0, 80),
    email: String(email || '').slice(0, 120),
    phone: String(phone || '').replace(/\D/g, '').slice(0, 20),
    message: String(message || '').slice(0, 1200)
  };

  return res.status(200).json({
    ok: true,
    received: { ...safe },
    recaptcha: { score: verification.score, action: verification.action }
  });
}

