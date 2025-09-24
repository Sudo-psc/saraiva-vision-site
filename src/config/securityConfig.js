/**
 * Comprehensive Security Configuration for AI Chatbot Widget
 * Implements multi-factor authentication, input validation, and rate limiting
 * Requirements: 8.1, 8.3, 8.6
 */

export const SECURITY_CONFIG = {
    // Multi-Factor Authentication Configuration
    mfa: {
        enabled: true,
        methods: ['totp', 'sms', 'email'],
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        maxFailedAttempts: 3,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        tokenExpiry: 5 * 60 * 1000, // 5 minutes for MFA tokens
        backupCodesCount: 10,
        requireMfaForSensitive: true
    },

    // Input Validation and XSS Protection
    inputValidation: {
        maxMessageLength: 2000,
        maxSessionMessages: 100,
        allowedTags: [], // No HTML tags allowed in user input
        sanitizeOptions: {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: 'discard',
            enforceHtmlBoundary: true
        },
        xssProtection: {
            enabled: true,
            mode: 'block',
            reportUri: '/api/security/xss-report'
        },
        contentSecurityPolicy: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "wss:", "https://api.gemini.google.com"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },

    // Rate Limiting and DDoS Protection
    rateLimiting: {
        // Per-IP rate limits
        perIp: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100,
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            standardHeaders: true,
            legacyHeaders: false
        },

        // Per-session rate limits
        perSession: {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 10,
            burstLimit: 5
        },

        // Gemini API rate limits
        geminiApi: {
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 60, // Adjust based on API quotas
            queueEnabled: true,
            maxQueueSize: 50
        },

        // DDoS protection thresholds
        ddosProtection: {
            enabled: true,
            threshold: 1000, // requests per minute
            banDuration: 60 * 60 * 1000, // 1 hour
            whitelistedIPs: [],
            emergencyMode: {
                threshold: 5000,
                restrictToWhitelist: true
            }
        }
    },

    // Security Headers
    securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    },

    // Session Security
    session: {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        regenerateOnAuth: true,
        rotateKeys: true,
        keyRotationInterval: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Encryption Settings
    encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 16,
        tagLength: 16,
        saltLength: 32,
        iterations: 100000
    },

    // Audit and Monitoring
    audit: {
        logAllRequests: true,
        logFailedAuth: true,
        logSensitiveOperations: true,
        retentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 days
        alertThresholds: {
            failedLogins: 10,
            suspiciousActivity: 5,
            rateLimitExceeded: 3
        }
    }
};

// Environment-specific overrides
export const getSecurityConfig = () => {
    const config = { ...SECURITY_CONFIG };

    if (process.env.NODE_ENV === 'development') {
        config.mfa.enabled = false;
        config.session.secure = false;
        config.rateLimiting.perIp.maxRequests = 1000;
    }

    if (process.env.NODE_ENV === 'test') {
        config.mfa.enabled = false;
        config.rateLimiting.perIp.maxRequests = 10000;
        config.audit.logAllRequests = false;
    }

    return config;
};