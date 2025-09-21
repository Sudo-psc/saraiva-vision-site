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
 * Detect honeypot field spam
 * @param {Object} formData - Form submission data
 * @returns {Object} - Spam detection result
 */
function detectHoneypot(formData) {
  // Check for honeypot field (should be empty)
  const honeypotField = formData.website || formData.url || formData.honeypot;

  if (honeypotField && honeypotField.trim() !== '') {
    return {
      isSpam: true,
      reason: 'honeypot_filled',
      message: 'Spam detected: honeypot field filled'
    };
  }

  // Additional spam indicators
  const suspiciousPatterns = [
    // Check for excessive links in message
    /(https?:\/\/[^\s]+.*){3,}/i,
    // Check for common spam phrases
    /\b(viagra|cialis|casino|lottery|winner|congratulations|click here|free money)\b/i,
    // Check for excessive capitalization
    /[A-Z]{10,}/,
  ];

  const message = formData.message || '';
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message)) {
      return {
        isSpam: true,
        reason: 'suspicious_content',
        message: 'Spam detected: suspicious content patterns'
      };
    }
  }

  return {
    isSpam: false,
    reason: null,
    message: null
  };
}

/**
 * Comprehensive rate limiting and spam detection
 * @param {Request} req - Request object
 * @param {Object} formData - Form submission data
 * @returns {Object} - Combined validation result
 */
function validateRequest(req, formData) {
  // Check rate limiting
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

  // Check for spam
  const spamResult = detectHoneypot(formData);

  if (spamResult.isSpam) {
    // Log spam attempt (without exposing IP)
    console.log(`Spam detected: ${spamResult.reason} - ${spamResult.message}`);

    return {
      allowed: false,
      type: 'spam',
      message: 'Request blocked due to spam detection.',
      retryAfter: null,
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests,
        'X-RateLimit-Remaining': rateLimitResult.remaining,
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
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
      'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
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