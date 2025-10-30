import { sendContactEmail, validateEmailServiceConfig } from './src/routes/contact/emailService.js';
import { randomBytes } from 'crypto';

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN_SCORE = 0.5;

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

/**
 * Sanitizes a string input by trimming whitespace and limiting its length.
 *
 * @param {string} input The string to sanitize.
 * @returns {string} The sanitized string, or an empty string if the input is not a string.
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 1000);
}

/**
 * Validates an email address using a regular expression.
 *
 * @param {string} email The email address to validate.
 * @returns {boolean} `true` if the email is valid, `false` otherwise.
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number using a regular expression.
 *
 * @param {string} phone The phone number to validate.
 * @returns {boolean} `true` if the phone number is valid, `false` otherwise.
 */
function validatePhone(phone) {
  const phoneRegex = /^[\d\s\(\)\-\+]{10,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Gets the client's IP address from the request headers.
 *
 * @param {object} req The HTTP request object.
 * @returns {string} The client's IP address, or 'unknown' if not found.
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         'unknown';
}

/**
 * Checks if a request from a given IP address is rate-limited.
 *
 * @param {string} ip The IP address to check.
 * @returns {{allowed: boolean, retryAfter?: number}} An object indicating if the request is allowed and, if not, the retry-after time in seconds.
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(ip) || [];
  
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((recentRequests[0] + RATE_LIMIT_WINDOW - now) / 1000)
    };
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  
  return { allowed: true };
}

/**
 * Verifies a reCAPTCHA token with Google's siteverify API.
 *
 * @param {string} token The reCAPTCHA token to verify.
 * @param {string} ip The client's IP address.
 * @returns {Promise<{success: boolean, score?: number, action?: string, error?: string, details?: any}>} An object indicating the verification result.
 */
async function verifyRecaptcha(token, ip) {
  if (!RECAPTCHA_SECRET) {
    console.warn('RECAPTCHA_SECRET_KEY not configured, skipping verification');
    return { success: true, score: 1.0, action: 'skip' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET,
        response: token,
        remoteip: ip
      })
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'reCAPTCHA verification failed',
        details: data['error-codes']
      };
    }

    if (data.score < RECAPTCHA_MIN_SCORE) {
      return {
        success: false,
        error: 'reCAPTCHA score too low',
        score: data.score
      };
    }

    return {
      success: true,
      score: data.score,
      action: data.action
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      error: 'Failed to verify reCAPTCHA',
      details: error.message
    };
  }
}

/**
 * Validates the contact form data.
 *
 * @param {object} data The contact form data.
 * @param {string} data.name The sender's name.
 * @param {string} data.email The sender's email.
 * @param {string} data.phone The sender's phone number.
 * @param {string} data.message The message content.
 * @param {boolean} data.consent The LGPD consent.
 * @param {string} data.token The reCAPTCHA token.
 * @param {string} data.honeypot The honeypot field.
 * @returns {{isValid: boolean, errors: Array<{field: string, message: string}>}} An object indicating if the data is valid and a list of errors.
 */
function validateContactData(data) {
  const errors = [];

  if (!data.name || data.name.length < 2) {
    errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' });
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'E-mail inválido' });
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Telefone inválido' });
  }

  if (!data.message || data.message.length < 10) {
    errors.push({ field: 'message', message: 'Mensagem deve ter pelo menos 10 caracteres' });
  }

  if (!data.consent) {
    errors.push({ field: 'consent', message: 'Consentimento LGPD é obrigatório' });
  }

  if (!data.token) {
    errors.push({ field: 'token', message: 'Token reCAPTCHA é obrigatório' });
  }

  if (data.honeypot) {
    errors.push({ field: 'honeypot', message: 'Spam detected' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Handles the contact form submission.
 *
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the request is handled.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  const clientIP = getClientIP(req);

  const rateCheck = checkRateLimit(clientIP);
  if (!rateCheck.allowed) {
    return res.status(429)
      .setHeader('Retry-After', rateCheck.retryAfter)
      .json({
        error: 'rate_limit_exceeded',
        message: 'Muitas tentativas. Por favor, tente novamente mais tarde.',
        retryAfter: rateCheck.retryAfter
      });
  }

  const configValidation = validateEmailServiceConfig();
  if (!configValidation.isValid) {
    console.error('Email service configuration error:', configValidation.errors);
    return res.status(503).json({
      error: 'service_unavailable',
      message: 'Serviço de e-mail temporariamente indisponível. Tente novamente mais tarde.'
    });
  }

  const { name, email, phone, message, consent, token, honeypot } = req.body;

  const sanitizedData = {
    name: sanitizeInput(name),
    email: sanitizeInput(email)?.toLowerCase(),
    phone: sanitizeInput(phone),
    message: sanitizeInput(message),
    consent: Boolean(consent),
    token: sanitizeInput(token),
    honeypot: sanitizeInput(honeypot)
  };

  const validation = validateContactData(sanitizedData);
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Dados inválidos',
      details: validation.errors
    });
  }

  const recaptchaResult = await verifyRecaptcha(sanitizedData.token, clientIP);
  if (!recaptchaResult.success) {
    return res.status(403).json({
      error: 'recaptcha_failed',
      message: 'Verificação de segurança falhou',
      details: recaptchaResult.error
    });
  }

  const contactId = randomBytes(16).toString('hex');
  
  const emailData = {
    name: sanitizedData.name,
    email: sanitizedData.email,
    phone: sanitizedData.phone,
    message: sanitizedData.message,
    timestamp: req.body.timestamp || new Date().toISOString(),
    id: contactId
  };

  try {
    const emailResult = await sendContactEmail(emailData);

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      return res.status(500).json({
        error: 'email_send_failed',
        message: 'Não foi possível enviar o e-mail. Tente novamente mais tarde.',
        contactId: emailResult.contactId
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      contactId: emailResult.contactId,
      messageId: emailResult.messageId,
      timestamp: emailResult.timestamp
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'Erro interno do servidor. Tente novamente mais tarde.',
      contactId
    });
  }
}
