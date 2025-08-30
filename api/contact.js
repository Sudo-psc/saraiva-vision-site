// Contact form submission with reCAPTCHA validation and email notification
// Uses Resend API to deliver form submissions securely

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (str = '') =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message, consent, recaptchaToken } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !message || !consent || !recaptchaToken) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: {
        name: !name,
        email: !email,
        phone: !phone,
        message: !message,
        consent: !consent,
        recaptchaToken: !recaptchaToken
      }
    });
  }

  try {
    // Validate reCAPTCHA token with Google
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
        remoteip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      })
    });

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      console.error('reCAPTCHA validation failed:', recaptchaData);
      return res.status(400).json({ 
        error: 'reCAPTCHA validation failed',
        details: recaptchaData['error-codes'] || ['unknown-error']
      });
    }

    // For reCAPTCHA v2, we can also check the score (if available)
    // For v3, you would check: recaptchaData.score >= 0.5

    // Basic input sanitization
    const sanitizedData = {
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 100),
      phone: phone.replace(/\D/g, '').slice(0, 15),
      message: message.trim().slice(0, 1000),
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };

    // Security checks
    const linkPattern = /(https?:\/\/|www\.)/i;
    const scriptPattern = /<\/?script/gi;
    if (linkPattern.test(sanitizedData.message) || scriptPattern.test(sanitizedData.message)) {
      return res.status(400).json({ error: 'Suspicious content in message' });
    }

    // Detect common injection patterns
    const injectionPattern = /(\b(select|insert|update|delete|drop|union|create|alter|truncate|exec)\b|;|--)/i;
    if (injectionPattern.test(`${sanitizedData.name} ${sanitizedData.email} ${sanitizedData.message}`)) {
      return res.status(400).json({ error: 'Potential injection attack detected' });
    }

    // Additional validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (sanitizedData.phone.length < 10 || sanitizedData.phone.length > 15) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Rate limiting check (simple server-side implementation)
    const clientId = sanitizedData.ip + sanitizedData.email;
    const now = Date.now();
    const rateLimitKey = `contact_${clientId}`;
    
    // In production, you'd use Redis or similar for this
    // For now, we'll use a simple in-memory store (not persistent across restarts)
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }
    
    const lastSubmission = global.rateLimitStore.get(rateLimitKey);
    if (lastSubmission && (now - lastSubmission) < 30000) { // 30 seconds
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Please wait 30 seconds before submitting again'
      });
    }
    
    global.rateLimitStore.set(rateLimitKey, now);

    const safeData = {
      name: escapeHtml(sanitizedData.name),
      email: escapeHtml(sanitizedData.email),
      phone: escapeHtml(sanitizedData.phone),
      message: escapeHtml(sanitizedData.message)
    };

    try {
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || 'no-reply@example.com',
        to: process.env.CONTACT_TO_EMAIL || 'contact@example.com',
        reply_to: safeData.email,
        subject: `Novo contato de ${safeData.name}`,
        html: `<p><strong>Nome:</strong> ${safeData.name}</p>
               <p><strong>Email:</strong> ${safeData.email}</p>
               <p><strong>Telefone:</strong> ${safeData.phone}</p>
               <p><strong>Mensagem:</strong><br/>${safeData.message}</p>`
      });
    } catch (err) {
      console.error('Resend API error:', err);
      return res.status(502).json({ error: 'Email service failure' });
    }

    console.log('Valid form submission received:', {
      ...sanitizedData,
      recaptchaScore: recaptchaData.score || 'v2'
    });

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      timestamp: sanitizedData.timestamp
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process form submission'
    });
  }
}