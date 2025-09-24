/**
 * Comprehensive Security Middleware for Saraiva Vision API
 * Implements security hardening, rate limiting, and XSS prevention
 */

import crypto from 'crypto';
import { validateRequest, getClientIP } from '../contact/rateLimiter.js';
import { sanitize } from '../../../../../../..../../../../src/lib/validation.js';

/**
 * Security configuration constants
 */
const SECURITY_CONFIG = {
    // Rate limiting configuration
    rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 10, // 10 requests per window
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
    },

    // CORS configuration
    cors: {
        allowedOrigins: [
            'https://saraivavision.com.br',
            'https://www.saraivavision.com.br',
            'https://saraivavision.vercel.app',
            /^https:\/\/saraivavision-git-[\w-]+\.vercel\.app$/,
            ...(process.env.NODE_ENV === 'development' ? [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:3001'
            ] : [])
        ],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-CSRF-Token',
            'X-Request-ID',
            'User-Agent',
            'Accept',
            'Accept-Language',
            'Accept-Encoding'
        ],
        maxAge: 86400, // 24 hours
    },

    // Security headers configuration
    headers: {
        // Prevent clickjacking attacks
        'X-Frame-Options': 'DENY',

        // Prevent MIME type sniffing
        'X-Content-Type-Options': 'nosniff',

        // Enable XSS protection (legacy browsers)
        'X-XSS-Protection': '1; mode=block',

        // Control referrer information
        'Referrer-Policy': 'strict-origin-when-cross-origin',

        // Prevent DNS prefetching
        'X-DNS-Prefetch-Control': 'off',

        // Disable IE compatibility mode
        'X-UA-Compatible': 'IE=edge',

        // Content Security Policy
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
            "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
            "img-src 'self' data: https: blob:",
            "media-src 'self' https:",
            "connect-src 'self' https://api.resend.com https://api.zenvia.com https://api.openai.com https://api.spotify.com https://cms.saraivavision.com.br",
            "frame-src 'self' https://open.spotify.com https://www.youtube.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
        ].join('; '),

        // Strict Transport Security (HTTPS only)
        ...(process.env.NODE_ENV === 'production' ? {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
        } : {}),

        // Permissions Policy (Feature Policy)
        'Permissions-Policy': [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'gyroscope=()',
            'accelerometer=()',
            'ambient-light-sensor=()',
            'autoplay=(self)',
            'encrypted-media=(self)',
            'fullscreen=(self)',
            'picture-in-picture=(self)'
        ].join(', ')
    },

    // Input validation configuration
    validation: {
        maxBodySize: 1024 * 1024, // 1MB
        maxFieldLength: 10000,
        maxFields: 50,
        allowedContentTypes: [
            'application/json',
            'application/x-www-form-urlencoded',
            'multipart/form-data'
        ]
    },

    // Honeypot configuration
    honeypot: {
        fields: ['website', 'url', 'honeypot', 'bot_field', 'email_confirm'],
        maxFillTime: 2000, // Minimum time to fill form (ms)
        maxSubmissionTime: 300000 // Maximum time before form expires (5 minutes)
    }
};

/**
 * Check if origin is allowed by CORS policy
 * @param {string} origin - Request origin
 * @returns {boolean} Whether origin is allowed
 */
function isOriginAllowed(origin) {
    if (!origin) return false;

    return SECURITY_CONFIG.cors.allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
            return allowed === origin;
        }
        if (allowed instanceof RegExp) {
            return allowed.test(origin);
        }
        return false;
    });
}

/**
 * Apply CORS headers to response
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
function applyCorsHeaders(req, res) {
    const origin = req.headers.origin;

    // Set allowed origin
    if (isOriginAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'production') {
        res.setHeader('Access-Control-Allow-Origin', 'https://saraivavision.com.br');
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    // Set other CORS headers
    res.setHeader('Access-Control-Allow-Methods', SECURITY_CONFIG.cors.allowedMethods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', SECURITY_CONFIG.cors.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', SECURITY_CONFIG.cors.maxAge.toString());
    res.setHeader('Access-Control-Allow-Credentials', 'false');
}

/**
 * Apply security headers to response
 * @param {Object} res - Response object
 */
function applySecurityHeaders(res) {
    Object.entries(SECURITY_CONFIG.headers).forEach(([header, value]) => {
        res.setHeader(header, value);
    });

    // Add cache control for security
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
}

/**
 * Validate request content type and size
 * @param {Object} req - Request object
 * @returns {Object|null} Error response if invalid, null if valid
 */
function validateRequestFormat(req) {
    const contentType = req.headers['content-type'];
    const contentLength = parseInt(req.headers['content-length'] || '0');

    // Check content type
    if (req.method === 'POST' || req.method === 'PUT') {
        const isValidContentType = SECURITY_CONFIG.validation.allowedContentTypes.some(type =>
            contentType && contentType.toLowerCase().includes(type)
        );

        if (!isValidContentType) {
            return {
                statusCode: 415,
                error: {
                    code: 'unsupported_media_type',
                    message: 'Unsupported content type'
                }
            };
        }
    }

    // Check content length
    if (contentLength > SECURITY_CONFIG.validation.maxBodySize) {
        return {
            statusCode: 413,
            error: {
                code: 'payload_too_large',
                message: 'Request payload too large'
            }
        };
    }

    return null;
}

/**
 * Advanced input sanitization with XSS prevention
 * @param {any} input - Input to sanitize
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {any} Sanitized input
 */
function deepSanitize(input, maxDepth = 5) {
    if (maxDepth <= 0) return null;

    if (typeof input === 'string') {
        return sanitize.text(input);
    }

    if (Array.isArray(input)) {
        return input
            .slice(0, SECURITY_CONFIG.validation.maxFields)
            .map(item => deepSanitize(item, maxDepth - 1));
    }

    if (input && typeof input === 'object') {
        const sanitized = {};
        const keys = Object.keys(input).slice(0, SECURITY_CONFIG.validation.maxFields);

        for (const key of keys) {
            const sanitizedKey = sanitize.text(key);
            if (sanitizedKey && sanitizedKey.length <= 100) {
                sanitized[sanitizedKey] = deepSanitize(input[key], maxDepth - 1);
            }
        }

        return sanitized;
    }

    return input;
}

/**
 * Enhanced honeypot detection with multiple techniques
 * @param {Object} formData - Form submission data
 * @param {Object} req - Request object
 * @returns {Object} Detection result
 */
function detectAdvancedSpam(formData, req) {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';

    // 1. Honeypot field detection
    for (const field of SECURITY_CONFIG.honeypot.fields) {
        if (formData[field] && formData[field].toString().trim() !== '') {
            return {
                isSpam: true,
                reason: 'honeypot_filled',
                field: field,
                confidence: 0.95
            };
        }
    }

    // 2. Submission timing analysis
    const submissionTime = formData._submissionTime || formData.submissionTime;
    const formLoadTime = formData._formLoadTime || formData.formLoadTime;

    if (submissionTime && formLoadTime) {
        const fillTime = submissionTime - formLoadTime;

        if (fillTime < SECURITY_CONFIG.honeypot.maxFillTime) {
            return {
                isSpam: true,
                reason: 'submission_too_fast',
                fillTime: fillTime,
                confidence: 0.9
            };
        }

        if (fillTime > SECURITY_CONFIG.honeypot.maxSubmissionTime) {
            return {
                isSpam: true,
                reason: 'form_expired',
                fillTime: fillTime,
                confidence: 0.7
            };
        }
    }

    // 3. User agent analysis
    const suspiciousUserAgents = [
        /bot|crawler|spider|scraper/i,
        /curl|wget|python|php|java/i,
        /^$/,
        /mozilla\/4\.0.*compatible.*msie/i // Old IE patterns often used by bots
    ];

    if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
        return {
            isSpam: true,
            reason: 'suspicious_user_agent',
            userAgent: userAgent.substring(0, 100),
            confidence: 0.8
        };
    }

    // 4. Missing browser headers
    if (!acceptLanguage || !acceptEncoding) {
        return {
            isSpam: true,
            reason: 'missing_browser_headers',
            confidence: 0.7
        };
    }

    // 5. Content analysis for spam patterns
    const textFields = ['name', 'message', 'subject', 'comment'];
    const combinedText = textFields
        .map(field => formData[field] || '')
        .join(' ')
        .toLowerCase();

    const spamPatterns = [
        // URLs and links
        /(https?:\/\/[^\s]+.*){3,}/i,
        /\b(bit\.ly|tinyurl|t\.co|goo\.gl|short\.link)\b/i,

        // Common spam phrases (Portuguese and English)
        /\b(viagra|cialis|casino|lottery|winner|congratulations|click here|free money)\b/i,
        /\b(ganhe dinheiro|clique aqui|promoção|oferta imperdível|dinheiro fácil)\b/i,
        /\b(bitcoin|cryptocurrency|investment|forex|trading)\b/i,

        // Excessive capitalization
        /[A-Z]{15,}/,

        // Repeated characters (keyboard mashing)
        /(.)\1{8,}/,

        // Suspicious email patterns
        /\b[a-z0-9._%+-]+@(tempmail|10minutemail|guerrillamail|mailinator|throwaway|temp-mail)\./i,

        // Phone number patterns (too many repeated digits)
        /(\d)\1{7,}/,

        // Common spam words in sequence
        /\b(free|win|winner|prize|money|cash|earn|make|guaranteed|limited|offer|deal|discount)\b.*\b(free|win|winner|prize|money|cash|earn|make|guaranteed|limited|offer|deal|discount)\b/i
    ];

    for (const pattern of spamPatterns) {
        if (pattern.test(combinedText)) {
            return {
                isSpam: true,
                reason: 'suspicious_content_pattern',
                pattern: pattern.source.substring(0, 50),
                confidence: 0.85
            };
        }
    }

    // 6. Duplicate content detection (enhanced)
    const contentHash = crypto
        .createHash('sha256')
        .update(combinedText + (formData.email || '') + (formData.phone || ''))
        .digest('hex');

    if (!global.recentSubmissionHashes) {
        global.recentSubmissionHashes = new Map();
    }

    const now = Date.now();
    const duplicateWindow = 300000; // 5 minutes

    if (global.recentSubmissionHashes.has(contentHash)) {
        const lastSubmission = global.recentSubmissionHashes.get(contentHash);
        if (now - lastSubmission < duplicateWindow) {
            return {
                isSpam: true,
                reason: 'duplicate_content',
                confidence: 0.9
            };
        }
    }

    // Store this submission hash
    global.recentSubmissionHashes.set(contentHash, now);

    // Clean old hashes
    for (const [hash, timestamp] of global.recentSubmissionHashes.entries()) {
        if (now - timestamp > duplicateWindow * 2) {
            global.recentSubmissionHashes.delete(hash);
        }
    }

    // 7. Field length analysis
    const suspiciousLengths = textFields.some(field => {
        const value = formData[field] || '';
        return value.length > SECURITY_CONFIG.validation.maxFieldLength;
    });

    if (suspiciousLengths) {
        return {
            isSpam: true,
            reason: 'field_too_long',
            confidence: 0.8
        };
    }

    return {
        isSpam: false,
        reason: null,
        confidence: 0
    };
}

/**
 * Comprehensive security middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function securityMiddleware(req, res, next) {
    try {
        // Apply CORS headers
        applyCorsHeaders(req, res);

        // Apply security headers
        applySecurityHeaders(res);

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        // Validate request format
        const formatValidation = validateRequestFormat(req);
        if (formatValidation) {
            return res.status(formatValidation.statusCode).json({
                success: false,
                error: formatValidation.error
            });
        }

        // Add security context to request
        req.security = {
            clientIP: getClientIP(req),
            userAgent: req.headers['user-agent'] || '',
            timestamp: Date.now(),
            requestId: crypto.randomUUID()
        };

        // Set request ID header for tracking
        res.setHeader('X-Request-ID', req.security.requestId);

        next();
    } catch (error) {
        console.error('Security middleware error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'security_middleware_error',
                message: 'Security validation failed'
            }
        });
    }
}

/**
 * Rate limiting and spam detection middleware
 * @param {Object} options - Configuration options
 * @returns {Function} Middleware function
 */
export function rateLimitMiddleware(options = {}) {
    const config = { ...SECURITY_CONFIG.rateLimiting, ...options };

    return (req, res, next) => {
        try {
            // Skip rate limiting for certain endpoints if configured
            if (options.skip && options.skip(req)) {
                return next();
            }

            // Apply rate limiting
            const rateLimitResult = validateRequest(req, {});

            // Set rate limit headers
            if (rateLimitResult.headers) {
                Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
                    res.setHeader(key, value);
                });
            }

            if (!rateLimitResult.allowed) {
                const statusCode = rateLimitResult.type === 'rate_limit' ? 429 : 400;

                return res.status(statusCode).json({
                    success: false,
                    error: {
                        code: rateLimitResult.type,
                        message: rateLimitResult.message,
                        retryAfter: rateLimitResult.retryAfter
                    }
                });
            }

            next();
        } catch (error) {
            console.error('Rate limit middleware error:', error);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'rate_limit_error',
                    message: 'Rate limiting failed'
                }
            });
        }
    };
}

/**
 * Input validation and sanitization middleware
 * @param {Object} options - Configuration options
 * @returns {Function} Middleware function
 */
export function inputValidationMiddleware(options = {}) {
    return async (req, res, next) => {
        try {
            // Only process POST/PUT requests with body
            if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
                return next();
            }

            // Parse and sanitize request body
            if (req.body) {
                req.body = deepSanitize(req.body);

                // Perform advanced spam detection for form submissions
                if (options.enableSpamDetection !== false) {
                    const spamResult = detectAdvancedSpam(req.body, req);

                    if (spamResult.isSpam) {
                        // Log spam attempt (without exposing PII)
                        console.log(`Spam detected: ${spamResult.reason} (confidence: ${spamResult.confidence})`);

                        return res.status(400).json({
                            success: false,
                            error: {
                                code: 'spam_detected',
                                message: 'Request blocked due to spam detection',
                                reason: spamResult.reason
                            }
                        });
                    }
                }
            }

            next();
        } catch (error) {
            console.error('Input validation middleware error:', error);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'input_validation_error',
                    message: 'Input validation failed'
                }
            });
        }
    };
}

/**
 * Create a complete security middleware stack
 * @param {Object} options - Configuration options
 * @returns {Array} Array of middleware functions
 */
export function createSecurityStack(options = {}) {
    return [
        securityMiddleware,
        rateLimitMiddleware(options.rateLimit || {}),
        inputValidationMiddleware(options.inputValidation || {})
    ];
}

/**
 * Get security configuration for monitoring
 * @returns {Object} Current security configuration
 */
export function getSecurityConfig() {
    return {
        ...SECURITY_CONFIG,
        // Don't expose sensitive configuration
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
    };
}

export {
    SECURITY_CONFIG,
    isOriginAllowed,
    applyCorsHeaders,
    applySecurityHeaders,
    validateRequestFormat,
    deepSanitize,
    detectAdvancedSpam
};