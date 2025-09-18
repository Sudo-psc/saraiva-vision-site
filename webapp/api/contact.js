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
    console.warn('Missing RECAPTCHA_SECRET - skipping verification in development');
    return { ok: true, score: 1.0, action: expectedAction || 'contact' };
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
  // Basic in-memory rate limiting per IP (best-effort; use a shared store in prod)
  const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  const RATE_LIMIT_MAX = 5; // max 5 requests per window
  if (!global.__contactRateLimiter) {
    global.__contactRateLimiter = new Map();
  }
  const limiter = global.__contactRateLimiter;
  const now = Date.now();
  const ip = getClientIp(req);
  const bucket = limiter.get(ip) || { count: 0, start: now };
  if (now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    bucket.count = 0;
    bucket.start = now;
  }
  bucket.count += 1;
  limiter.set(ip, bucket);
  if (bucket.count > RATE_LIMIT_MAX) {
    res.setHeader('Retry-After', Math.ceil((bucket.start + RATE_LIMIT_WINDOW_MS - now) / 1000));
    return res.status(429).json({ error: 'rate_limited' });
  }
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

  const body = await parseBody(req);

  const { name, email, phone, message, token, action } = body || {};

  if (!token) {
    return res.status(400).json({ error: 'missing_token' });
  }

  const verification = await verifyRecaptcha({ token, remoteip: ip, expectedAction: action || 'contact' });
  if (!verification.ok) {
    return res.status(400).json({ error: 'recaptcha_failed', details: verification });
  }

  // Sanitize inputs
  const safe = {
    name: String(name || '').slice(0, 80),
    email: String(email || '').slice(0, 120),
    phone: String(phone || '').replace(/\D/g, '').slice(0, 20),
    message: String(message || '').slice(0, 1200)
  };

  // Validate required fields
  if (!safe.name || !safe.email || !safe.message) {
    return res.status(400).json({ error: 'missing_required_fields' });
  }

  // Send email via Resend
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ error: 'email_service_unavailable' });
    }

    const emailPayload = {
      from: 'noreply@saraivavision.com.br',
      to: 'philipe_cruz@outlook.com',
      subject: `Nova mensagem do site - ${safe.name}`,
      html: `
        <h2>Nova mensagem de contato - SaraivaVision</h2>
        <p><strong>Nome:</strong> ${safe.name}</p>
        <p><strong>Email:</strong> ${safe.email}</p>
        ${safe.phone ? `<p><strong>Telefone:</strong> ${safe.phone}</p>` : ''}
        <p><strong>Mensagem:</strong></p>
        <p>${safe.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Data: ${new Date().toLocaleString('pt-BR')}</small></p>
        <p><small>Score reCAPTCHA: ${verification.score}</small></p>
      `,
      text: `
        Nova mensagem de contato - SaraivaVision
        
        Nome: ${safe.name}
        Email: ${safe.email}
        ${safe.phone ? `Telefone: ${safe.phone}` : ''}
        
        Mensagem:
        ${safe.message}
        
        Data: ${new Date().toLocaleString('pt-BR')}
        Score reCAPTCHA: ${verification.score}
      `
    };

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({}));
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'email_send_failed', details: errorData });
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult.id);

    return res.status(200).json({
      ok: true,
      message: 'Mensagem enviada com sucesso!',
      emailId: emailResult.id,
      recaptcha: { score: verification.score, action: verification.action }
    });

  } catch (emailError) {
    console.error('Email sending error:', emailError);
    return res.status(500).json({ error: 'email_service_error', message: emailError.message });
  }
}
