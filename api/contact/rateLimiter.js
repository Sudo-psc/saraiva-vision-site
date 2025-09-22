import crypto from 'crypto';

// Global rate limiting store (stateless for serverless)
const rateLimitStore = new Map();

// Configuration
const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes default
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 5, // 5 requests per window default
  cleanupInterval: 5 * 60 * 1000, // Cleanup every 5 minutes
};

/**
 * Hash IP address for privacy compliance
 * @param {string} ip - IP address to hash
 * @returns {string} - SHA-256 hashed IP
 */
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Get client IP address from request
 * @param {Request} req - Request object
 * @returns {string} - Client IP address
 */
function getClientIP(req) {
  // Check various headers for IP (Vercel, CloudFlare, etc.)
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '127.0.0.1';
}

/**
 * Clean up expired rate limit entries
 * Removes entries older than the rate limit window
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  const expiredKeys = [];

  for (const [hashedIP, entry] of rateLimitStore.entries()) {
    if (now > entry.expiresAt) {
      expiredKeys.push(hashedIP);
    }
  }

  expiredKeys.forEach(key => rateLimitStore.delete(key));

  // Log cleanup for monitoring (without exposing IPs)
  if (expiredKeys.length > 0) {
    console.log(`Rate limiter: Cleaned up ${expiredKeys.length} expired entries`);
  }
}

/**
 * Check if request should be rate limited
 * @param {Request} req - Request object
 * @returns {Object} - Rate limit result
 */
function checkRateLimit(req) {
  const clientIP = getClientIP(req);
  const hashedIP = hashIP(clientIP);
  const now = Date.now();

  // Cleanup expired entries periodically
  if (Math.random() < 0.1) { // 10% chance to trigger cleanup
    cleanupExpiredEntries();
  }

  // Get or create rate limit entry
  let entry = rateLimitStore.get(hashedIP);

  if (!entry) {
    // First request from this IP
    entry = {
      hashedIp: hashedIP,
      attempts: 1,
      windowStart: now,
      expiresAt: now + RATE_LIMIT_CONFIG.windowMs
    };
    rateLimitStore.set(hashedIP, entry);

    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime: entry.expiresAt,
      retryAfter: null
    };
  }

  // Check if window has expired
  if (now > entry.expiresAt) {
    // Reset window
    entry.attempts = 1;
    entry.windowStart = now;
    entry.expiresAt = now + RATE_LIMIT_CONFIG.windowMs;
    rateLimitStore.set(hashedIP, entry);

    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime: entry.expiresAt,
      retryAfter: null
    };
  }

  // Check if limit exceeded
  if (entry.attempts >= RATE_LIMIT_CONFIG.maxRequests) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.expiresAt,
      retryAfter: retryAfter
    };
  }

  // Increment attempts
  entry.attempts++;
  rateLimitStore.set(hashedIP, entry);

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - entry.attempts,
    resetTime: entry.expiresAt,
    retryAfter: null
  };
}

/**
 * Enhanced honeypot detection with multiple spam detection techniques
 * @param {Object} formData - Form submission data
 * @param {Object} req - Request object for additional context
 * @returns {Object} - Spam detection result
 */
function detectHoneypot(formData, req = {}) {
  const userAgent = req.headers?.['user-agent'] || '';
  const acceptLanguage = req.headers?.['accept-language'] || '';
  const referer = req.headers?.referer || '';

  // 1. Traditional honeypot fields (should be empty)
  const honeypotFields = ['website', 'url', 'honeypot', 'bot_field', 'email_confirm', 'phone_confirm'];

  for (const field of honeypotFields) {
    const value = formData[field];
    if (value && value.toString().trim() !== '') {
      return {
        isSpam: true,
        reason: 'honeypot_filled',
        message: `Spam detected: honeypot field '${field}' filled`,
        confidence: 0.95,
        field: field
      };
    }
  }

  // 2. Time-based detection (enhanced)
  const submissionTime = formData._submissionTime || formData.submissionTime;
  const formLoadTime = formData._formLoadTime || formData.formLoadTime;

  if (submissionTime) {
    const now = Date.now();
    const timeSinceSubmission = now - submissionTime;

    // Too fast (less than 2 seconds)
    if (timeSinceSubmission < 2000) {
      return {
        isSpam: true,
        reason: 'submission_too_fast',
        message: 'Spam detected: submission too fast',
        confidence: 0.9,
        timeTaken: timeSinceSubmission
      };
    }

    // Form expired (more than 30 minutes)
    if (timeSinceSubmission > 1800000) {
      return {
        isSpam: true,
        reason: 'form_expired',
        message: 'Spam detected: form submission expired',
        confidence: 0.7,
        timeTaken: timeSinceSubmission
      };
    }
  }

  // 3. User agent analysis
  const suspiciousUserAgents = [
    /bot|crawler|spider|scraper|automation/i,
    /curl|wget|python|php|java|node|axios|fetch/i,
    /^$/,
    /mozilla\/4\.0.*compatible.*msie/i, // Old IE patterns
    /headless|phantom|selenium|webdriver/i,
    /postman|insomnia|httpie/i
  ];

  if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
    return {
      isSpam: true,
      reason: 'suspicious_user_agent',
      message: 'Spam detected: suspicious user agent',
      confidence: 0.85,
      userAgent: userAgent.substring(0, 100)
    };
  }

  // 4. Missing browser headers (legitimate browsers send these)
  if (!acceptLanguage || acceptLanguage.length < 2) {
    return {
      isSpam: true,
      reason: 'missing_browser_headers',
      message: 'Spam detected: missing browser headers',
      confidence: 0.8
    };
  }

  // 5. Enhanced content analysis
  const textFields = ['name', 'message', 'subject', 'comment'];
  const combinedText = textFields
    .map(field => formData[field] || '')
    .join(' ')
    .toLowerCase();

  const enhancedSpamPatterns = [
    // URLs and suspicious links
    /(https?:\/\/[^\s]+.*){3,}/i,
    /\b(bit\.ly|tinyurl|t\.co|goo\.gl|short\.link|tiny\.cc)\b/i,

    // Common spam phrases (multilingual)
    /\b(viagra|cialis|casino|lottery|winner|congratulations|click here|free money)\b/i,
    /\b(ganhe dinheiro|clique aqui|promoção|oferta imperdível|dinheiro fácil|renda extra)\b/i,
    /\b(bitcoin|cryptocurrency|investment|forex|trading|profit|roi)\b/i,
    /\b(weight loss|diet pills|male enhancement|enlargement)\b/i,

    // Excessive capitalization or repeated characters
    /[A-Z]{15,}/,
    /(.)\1{8,}/,

    // Suspicious email domains
    /\b[a-z0-9._%+-]+@(tempmail|10minutemail|guerrillamail|mailinator|throwaway|temp-mail|yopmail|sharklasers)\./i,

    // Phone spam patterns
    /(\d)\1{7,}/,
    /\+1-?800-?\d{3}-?\d{4}/i, // US toll-free spam pattern

    // SEO spam patterns
    /\b(seo|backlinks|link building|page rank|google ranking)\b/i,

    // Medical spam
    /\b(prescription|pharmacy|medication|pills|drugs)\b/i,

    // Financial spam
    /\b(loan|credit|debt|mortgage|insurance|investment)\b.*\b(approved|guaranteed|instant|fast)\b/i
  ];

  for (const pattern of enhancedSpamPatterns) {
    if (pattern.test(combinedText)) {
      return {
        isSpam: true,
        reason: 'suspicious_content_pattern',
        message: 'Spam detected: suspicious content patterns',
        confidence: 0.85,
        pattern: pattern.source.substring(0, 50)
      };
    }
  }

  // 6. Enhanced duplicate detection with fuzzy matching
  const normalizedContent = combinedText
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  const contentHash = crypto
    .createHash('sha256')
    .update(normalizedContent + (formData.email || '') + (formData.phone || ''))
    .digest('hex');

  if (!global.recentSubmissions) {
    global.recentSubmissions = new Map();
  }

  const now = Date.now();
  const duplicateWindow = 300000; // 5 minutes

  if (global.recentSubmissions.has(contentHash)) {
    const lastSubmission = global.recentSubmissions.get(contentHash);
    if (now - lastSubmission < duplicateWindow) {
      return {
        isSpam: true,
        reason: 'duplicate_content',
        message: 'Spam detected: duplicate submission',
        confidence: 0.9,
        lastSubmission: new Date(lastSubmission).toISOString()
      };
    }
  }

  // Store this submission hash
  global.recentSubmissions.set(contentHash, now);

  // Clean old hashes (keep only last 2 hours)
  const twoHoursAgo = now - 7200000;
  for (const [hash, timestamp] of global.recentSubmissions.entries()) {
    if (timestamp < twoHoursAgo) {
      global.recentSubmissions.delete(hash);
    }
  }

  // 7. Field length and structure analysis
  const name = formData.name || '';
  const email = formData.email || '';
  const message = formData.message || '';

  // Check for suspicious field lengths
  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return {
      isSpam: true,
      reason: 'field_too_long',
      message: 'Spam detected: field exceeds maximum length',
      confidence: 0.8
    };
  }

  // Check for suspicious patterns in name field
  if (name && (/\d{5,}/.test(name) || /[^\w\s\-'.]/.test(name))) {
    return {
      isSpam: true,
      reason: 'suspicious_name_pattern',
      message: 'Spam detected: suspicious name pattern',
      confidence: 0.75
    };
  }

  // 8. Behavioral analysis
  const fieldCount = Object.keys(formData).length;
  if (fieldCount > 20) { // Too many fields might indicate automated submission
    return {
      isSpam: true,
      reason: 'too_many_fields',
      message: 'Spam detected: too many form fields',
      confidence: 0.7,
      fieldCount: fieldCount
    };
  }

  // 9. Referrer analysis
  if (referer && !referer.includes('saraivavision.com.br') && !referer.includes('localhost') && !referer.includes('vercel.app')) {
    return {
      isSpam: true,
      reason: 'suspicious_referrer',
      message: 'Spam detected: suspicious referrer',
      confidence: 0.6,
      referrer: referer.substring(0, 100)
    };
  }

  return {
    isSpam: false,
    reason: null,
    message: null,
    confidence: 0
  };
}

/**
 * Comprehensive rate limiting and spam detection
 * @param {Request} req - Request object
 * @param {Object} formData - Form submission data
 * @returns {Object} - Combined validation result
 */
function validateRequest(req, formData) {
  // Check rate limiting first
  const rateLimitResult = checkRateLimit(req);

  if (!rateLimitResult.allowed) {
    return {
      allowed: false,
      type: 'rate_limit',
      message: 'Too many requests. Please try again later.',
      retryAfter: rateLimitResult.retryAfter,
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests,
        'X-RateLimit-Remaining': rateLimitResult.remaining,
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        'Retry-After': rateLimitResult.retryAfter
      }
    };
  }

  // Check for spam using enhanced detection
  const spamResult = detectHoneypot(formData, req);

  if (spamResult.isSpam) {
    // Log spam attempt with details (without exposing PII)
    const clientIP = getClientIP(req);
    const hashedIP = hashIP(clientIP);

    console.log(`Enhanced spam detection: ${JSON.stringify({
      reason: spamResult.reason,
      confidence: spamResult.confidence,
      hashedIP: hashedIP.substring(0, 16) + '...',
      userAgent: req.headers?.['user-agent']?.substring(0, 50) || 'unknown',
      timestamp: new Date().toISOString(),
      field: spamResult.field || null,
      pattern: spamResult.pattern || null
    })}`);

    // Increase rate limit penalty for spam attempts
    const entry = rateLimitStore.get(hashedIP);
    if (entry) {
      entry.attempts += 2; // Penalty for spam
      rateLimitStore.set(hashedIP, entry);
    }

    return {
      allowed: false,
      type: 'spam',
      message: 'Request blocked due to spam detection.',
      reason: spamResult.reason,
      confidence: spamResult.confidence,
      retryAfter: null,
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests,
        'X-RateLimit-Remaining': Math.max(0, rateLimitResult.remaining - 2),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        'X-Spam-Detection': 'blocked'
      }
    };
  }

  // Request is allowed
  return {
    allowed: true,
    type: 'success',
    message: 'Request validated successfully.',
    retryAfter: null,
    headers: {
      'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests,
      'X-RateLimit-Remaining': rateLimitResult.remaining,
      'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      'X-Spam-Detection': 'passed'
    }
  };
}

/**
 * Get current rate limit statistics (for monitoring)
 * @returns {Object} - Rate limit statistics
 */
function getRateLimitStats() {
  const now = Date.now();
  let activeEntries = 0;
  let expiredEntries = 0;

  for (const [, entry] of rateLimitStore.entries()) {
    if (now > entry.expiresAt) {
      expiredEntries++;
    } else {
      activeEntries++;
    }
  }

  return {
    totalEntries: rateLimitStore.size,
    activeEntries,
    expiredEntries,
    config: {
      windowMs: RATE_LIMIT_CONFIG.windowMs,
      maxRequests: RATE_LIMIT_CONFIG.maxRequests
    }
  };
}

export {
  checkRateLimit,
  detectHoneypot,
  validateRequest,
  cleanupExpiredEntries,
  getRateLimitStats,
  hashIP,
  getClientIP
};