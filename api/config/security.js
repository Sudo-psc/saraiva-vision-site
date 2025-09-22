/**
 * Centralized Security Configuration for Saraiva Vision API
 * Defines security policies, rate limits, and validation rules for all endpoints
 */

/**
 * Rate limiting configuration per endpoint
 */
export const RATE_LIMITS = {
    // Contact form - stricter limits due to spam potential
    contact: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 3, // 3 submissions per 15 minutes
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        message: 'Too many contact form submissions. Please wait 15 minutes before trying again.'
    },

    // Appointments - moderate limits to prevent abuse
    appointments: {
        windowMs: 10 * 60 * 1000, // 10 minutes
        maxRequests: 5, // 5 booking attempts per 10 minutes
        skipSuccessfulRequests: true, // Don't count successful bookings
        skipFailedRequests: false,
        message: 'Too many appointment booking attempts. Please wait 10 minutes before trying again.'
    },

    // Chatbot - higher limits for conversation flow
    chatbot: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 20, // 20 messages per 5 minutes
        skipSuccessfulRequests: true,
        skipFailedRequests: false,
        message: 'Too many messages. Please wait a few minutes before continuing the conversation.'
    },

    // Dashboard/monitoring - very strict limits
    dashboard: {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 10, // 10 requests per minute
        skipSuccessfulRequests: true,
        skipFailedRequests: false,
        message: 'Dashboard access rate limit exceeded. Please wait before refreshing.'
    },

    // General API endpoints
    general: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // 100 requests per 15 minutes
        skipSuccessfulRequests: true,
        skipFailedRequests: false,
        message: 'API rate limit exceeded. Please wait before making more requests.'
    }
};

/**
 * Input validation rules per endpoint
 */
export const VALIDATION_RULES = {
    contact: {
        maxFieldLength: 2000,
        maxFields: 10,
        allowedFields: ['name', 'email', 'phone', 'message', 'consent', 'honeypot', 'website', 'url'],
        requiredFields: ['name', 'email', 'phone', 'message', 'consent'],
        enableSpamDetection: true,
        enableHoneypot: true,
        maxSubmissionRate: 1 // Max 1 submission per IP per hour
    },

    appointments: {
        maxFieldLength: 1000,
        maxFields: 15,
        allowedFields: [
            'patient_name', 'patient_email', 'patient_phone',
            'appointment_date', 'appointment_time', 'notes',
            'service_type', 'preferred_doctor', 'insurance_info'
        ],
        requiredFields: ['patient_name', 'patient_email', 'patient_phone', 'appointment_date', 'appointment_time'],
        enableSpamDetection: true,
        enableHoneypot: false, // Not needed for appointment booking
        maxSubmissionRate: 3 // Max 3 bookings per IP per day
    },

    chatbot: {
        maxFieldLength: 1000,
        maxFields: 5,
        allowedFields: ['message', 'sessionId', 'conversationHistory', 'context'],
        requiredFields: ['message'],
        enableSpamDetection: true,
        enableHoneypot: false,
        maxSubmissionRate: 100 // Max 100 messages per IP per hour
    },

    dashboard: {
        maxFieldLength: 500,
        maxFields: 10,
        allowedFields: ['query', 'filters', 'dateRange', 'limit', 'offset'],
        requiredFields: [],
        enableSpamDetection: false,
        enableHoneypot: false,
        maxSubmissionRate: 1000 // High limit for dashboard operations
    }
};

/**
 * Security headers configuration per endpoint type
 */
export const SECURITY_HEADERS = {
    // Public API endpoints (contact, appointments, chatbot)
    public: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-DNS-Prefetch-Control': 'off',
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://api.resend.com https://api.zenvia.com https://api.openai.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; ')
    },

    // Admin/dashboard endpoints
    admin: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-DNS-Prefetch-Control': 'off',
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "font-src 'self'",
            "img-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; '),
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    },

    // Webhook endpoints
    webhook: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Referrer-Policy': 'no-referrer'
    }
};

/**
 * CORS configuration per endpoint type
 */
export const CORS_CONFIG = {
    // Public endpoints - allow main domain and development
    public: {
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
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-Request-ID',
            'User-Agent',
            'Accept',
            'Accept-Language',
            'Accept-Encoding'
        ],
        credentials: false,
        maxAge: 86400 // 24 hours
    },

    // Admin endpoints - more restrictive
    admin: {
        allowedOrigins: [
            'https://saraivavision.com.br',
            'https://www.saraivavision.com.br',
            ...(process.env.NODE_ENV === 'development' ? [
                'http://localhost:3000',
                'http://localhost:3001'
            ] : [])
        ],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-Request-ID'
        ],
        credentials: true,
        maxAge: 3600 // 1 hour
    },

    // Webhook endpoints - very restrictive
    webhook: {
        allowedOrigins: [
            'https://api.resend.com',
            'https://api.zenvia.com',
            'https://cms.saraivavision.com.br'
        ],
        allowedMethods: ['POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Signature'],
        credentials: false,
        maxAge: 0 // No caching
    }
};

/**
 * Honeypot configuration
 */
export const HONEYPOT_CONFIG = {
    fields: ['website', 'url', 'honeypot', 'bot_field', 'email_confirm', 'phone_confirm'],
    minFillTime: 2000, // Minimum 2 seconds to fill form
    maxFillTime: 1800000, // Maximum 30 minutes before form expires
    decoyValues: [
        '', // Should always be empty
        'http://', // Partial URL that bots might complete
        'https://' // Another partial URL
    ]
};

/**
 * Spam detection patterns
 */
export const SPAM_PATTERNS = {
    // High confidence patterns (block immediately)
    high: [
        // Multiple URLs
        /(https?:\/\/[^\s]+.*){3,}/i,
        // Suspicious domains
        /\b(bit\.ly|tinyurl|t\.co|goo\.gl|short\.link|tiny\.cc)\b/i,
        // Common spam phrases
        /\b(viagra|cialis|casino|lottery|winner|congratulations|click here|free money)\b/i,
        // Portuguese spam
        /\b(ganhe dinheiro|clique aqui|promoção|oferta imperdível|dinheiro fácil|renda extra)\b/i,
        // Crypto/investment spam
        /\b(bitcoin|cryptocurrency|investment|forex|trading|profit|roi)\b/i,
        // Excessive capitalization
        /[A-Z]{15,}/,
        // Repeated characters
        /(.)\1{8,}/
    ],

    // Medium confidence patterns (flag for review)
    medium: [
        // SEO spam
        /\b(seo|backlinks|link building|page rank|google ranking)\b/i,
        // Medical spam
        /\b(prescription|pharmacy|medication|pills|drugs)\b/i,
        // Financial spam
        /\b(loan|credit|debt|mortgage|insurance)\b.*\b(approved|guaranteed|instant|fast)\b/i,
        // Suspicious email domains
        /\b[a-z0-9._%+-]+@(tempmail|10minutemail|guerrillamail|mailinator|throwaway|temp-mail|yopmail)\./i
    ],

    // Low confidence patterns (log but allow)
    low: [
        // Suspicious phone patterns
        /(\d)\1{6,}/,
        // Excessive punctuation
        /[!?]{5,}/,
        // All caps words
        /\b[A-Z]{5,}\b/
    ]
};

/**
 * Security threat detection configuration
 */
export const THREAT_DETECTION = {
    // SQL injection patterns
    sql: [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /(--|\/\*|\*\/)/g,
        /(\b(WAITFOR|DELAY)\b)/gi,
        /(xp_|sp_)/gi
    ],

    // NoSQL injection patterns
    nosql: [
        /\$where/gi,
        /\$regex/gi,
        /\$ne/gi,
        /\$gt/gi,
        /\$lt/gi,
        /\$in/gi,
        /\$nin/gi,
        /\$exists/gi,
        /\$or/gi,
        /\$and/gi
    ],

    // Path traversal patterns
    pathTraversal: [
        /\.\.\//g,
    /\.\.\\g,
        /% 2e % 2e % 2f / gi,
        /%2e%2e%5c/gi,
        /\.\.%2f/gi,
        /\.\.%5c/gi
    ],

    // XSS patterns
    xss: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<svg\b[^>]*onload/gi,
        /<img\b[^>]*onerror/gi
    ]
};

/**
 * Get security configuration for specific endpoint
 * @param {string} endpoint - Endpoint name (contact, appointments, chatbot, etc.)
 * @param {string} type - Configuration type (public, admin, webhook)
 * @returns {Object} Security configuration
 */
export function getSecurityConfig(endpoint, type = 'public') {
    return {
        rateLimit: RATE_LIMITS[endpoint] || RATE_LIMITS.general,
        validation: VALIDATION_RULES[endpoint] || VALIDATION_RULES.contact,
        headers: SECURITY_HEADERS[type] || SECURITY_HEADERS.public,
        cors: CORS_CONFIG[type] || CORS_CONFIG.public,
        honeypot: HONEYPOT_CONFIG,
        spamPatterns: SPAM_PATTERNS,
        threatDetection: THREAT_DETECTION
    };
}

/**
 * Validate security configuration
 * @returns {Object} Validation result
 */
export function validateSecurityConfig() {
    const issues = [];
    const warnings = [];

    // Check rate limits
    Object.entries(RATE_LIMITS).forEach(([endpoint, config]) => {
        if (config.maxRequests > 1000) {
            warnings.push(`High rate limit for ${endpoint}: ${config.maxRequests} requests`);
        }
        if (config.windowMs < 60000) {
            warnings.push(`Short rate limit window for ${endpoint}: ${config.windowMs}ms`);
        }
    });

    // Check CORS configuration
    Object.entries(CORS_CONFIG).forEach(([type, config]) => {
        if (config.allowedOrigins.includes('*')) {
            issues.push(`Wildcard CORS origin in ${type} configuration`);
        }
        if (config.credentials && config.allowedOrigins.includes('*')) {
            issues.push(`Credentials enabled with wildcard origin in ${type} configuration`);
        }
    });

    // Check CSP configuration
    Object.entries(SECURITY_HEADERS).forEach(([type, headers]) => {
        const csp = headers['Content-Security-Policy'];
        if (csp && csp.includes("'unsafe-inline'")) {
            warnings.push(`Unsafe inline allowed in ${type} CSP`);
        }
        if (csp && csp.includes("'unsafe-eval'")) {
            warnings.push(`Unsafe eval allowed in ${type} CSP`);
        }
    });

    return {
        valid: issues.length === 0,
        issues,
        warnings,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    };
}

export default {
    RATE_LIMITS,
    VALIDATION_RULES,
    SECURITY_HEADERS,
    CORS_CONFIG,
    HONEYPOT_CONFIG,
    SPAM_PATTERNS,
    THREAT_DETECTION,
    getSecurityConfig,
    validateSecurityConfig
};