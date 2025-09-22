/**
 * Security Headers Utility for Saraiva Vision API
 * Implements comprehensive security headers for all API endpoints
 */

/**
 * Security headers configuration
 */
const SECURITY_HEADERS = {
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

    // Prevent caching of sensitive data
    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',

    // Content Security Policy
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'nonce-{NONCE}' https://cdn.jsdelivr.net https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com https://js.posthog.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
        "img-src 'self' data: https: blob:",
        "media-src 'self' https:",
        "connect-src 'self' https://api.resend.com https://api.zenvia.com https://api.openai.com https://api.spotify.com https://cms.saraivavision.com.br https://app.posthog.com wss://app.posthog.com",
        "frame-src 'self' https://open.spotify.com https://www.youtube.com https://www.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
    ].join('; '),

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
        'picture-in-picture=(self)',
        'web-share=(self)'
    ].join(', ')
};

/**
 * Production-only security headers (HTTPS required)
 */
const PRODUCTION_HEADERS = {
    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Expect Certificate Transparency
    'Expect-CT': 'max-age=86400, enforce'
};

/**
 * CORS configuration
 */
const CORS_CONFIG = {
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
        'Accept-Encoding',
        'Origin',
        'Referer'
    ],
    maxAge: 86400 // 24 hours
};

/**
 * Check if origin is allowed by CORS policy
 * @param {string} origin - Request origin
 * @returns {boolean} Whether origin is allowed
 */
function isOriginAllowed(origin) {
    if (!origin) return false;

    return CORS_CONFIG.allowedOrigins.some(allowed => {
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
        // In development, allow all origins for testing
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    // Set other CORS headers
    res.setHeader('Access-Control-Allow-Methods', CORS_CONFIG.allowedMethods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', CORS_CONFIG.maxAge.toString());
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('Vary', 'Origin');
}

/**
 * Apply security headers to response
 * @param {Object} res - Response object
 * @param {Object} options - Configuration options
 */
function applySecurityHeaders(res, options = {}) {
    // Apply base security headers
    Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
        res.setHeader(header, value);
    });

    // Apply production-only headers in production environment
    if (process.env.NODE_ENV === 'production' && !options.skipProductionHeaders) {
        Object.entries(PRODUCTION_HEADERS).forEach(([header, value]) => {
            res.setHeader(header, value);
        });
    }

    // Add custom headers if provided
    if (options.customHeaders) {
        Object.entries(options.customHeaders).forEach(([header, value]) => {
            res.setHeader(header, value);
        });
    }

    // Add request tracking header
    if (options.requestId) {
        res.setHeader('X-Request-ID', options.requestId);
    }

    // Add API version header
    res.setHeader('X-API-Version', '1.0.0');

    // Add server identification (without revealing sensitive info)
    res.setHeader('X-Powered-By', 'Saraiva Vision API');
}

/**
 * Handle preflight OPTIONS requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
function handlePreflightRequest(req, res) {
    // Apply CORS headers
    applyCorsHeaders(req, res);

    // Apply security headers
    applySecurityHeaders(res);

    // Set content type for preflight
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Length', '0');

    // Send 204 No Content response
    res.status(204).end();
}

/**
 * Comprehensive security middleware for API endpoints
 * @param {Object} options - Configuration options
 * @returns {Function} Middleware function
 */
function securityHeadersMiddleware(options = {}) {
    return (req, res, next) => {
        try {
            // Generate request ID for tracking
            const requestId = options.requestId ||
                `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

            // Apply CORS headers
            applyCorsHeaders(req, res);

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                return handlePreflightRequest(req, res);
            }

            // Apply security headers
            applySecurityHeaders(res, {
                ...options,
                requestId
            });

            // Add request context
            req.security = {
                requestId,
                timestamp: Date.now(),
                origin: req.headers.origin,
                userAgent: req.headers['user-agent'] || 'unknown'
            };

            next();
        } catch (error) {
            console.error('Security headers middleware error:', error);

            // Still apply basic security headers even if there's an error
            try {
                applySecurityHeaders(res, { skipProductionHeaders: true });
            } catch (headerError) {
                console.error('Failed to apply fallback security headers:', headerError);
            }

            next();
        }
    };
}

/**
 * Create CSP nonce for inline scripts/styles
 * @returns {string} Base64 encoded nonce
 */
function generateCSPNonce() {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
}

/**
 * Update CSP header with nonce
 * @param {Object} res - Response object
 * @param {string} nonce - CSP nonce
 */
function updateCSPWithNonce(res, nonce) {
    const currentCSP = res.getHeader('Content-Security-Policy');
    if (currentCSP) {
        const updatedCSP = currentCSP
            .replace("'unsafe-inline'", `'nonce-${nonce}'`)
            .replace(/script-src ([^;]+)/, `script-src $1 'nonce-${nonce}'`)
            .replace(/style-src ([^;]+)/, `style-src $1 'nonce-${nonce}'`);

        res.setHeader('Content-Security-Policy', updatedCSP);
    }
}

/**
 * Validate security headers configuration
 * @returns {Object} Validation result
 */
function validateSecurityConfig() {
    const issues = [];
    const recommendations = [];

    // Check CSP configuration
    const csp = SECURITY_HEADERS['Content-Security-Policy'];
    if (csp.includes("'unsafe-inline'")) {
        recommendations.push('Consider using CSP nonces instead of unsafe-inline');
    }
    if (csp.includes("'unsafe-eval'")) {
        recommendations.push('Consider removing unsafe-eval from CSP if possible');
    }

    // Check CORS configuration
    if (CORS_CONFIG.allowedOrigins.includes('*')) {
        issues.push('Wildcard CORS origin detected - should be restricted in production');
    }

    // Check production headers
    if (process.env.NODE_ENV === 'production') {
        if (!PRODUCTION_HEADERS['Strict-Transport-Security']) {
            issues.push('HSTS header not configured for production');
        }
    }

    return {
        valid: issues.length === 0,
        issues,
        recommendations,
        timestamp: new Date().toISOString()
    };
}

/**
 * Get current security configuration for monitoring
 * @returns {Object} Security configuration summary
 */
function getSecurityConfig() {
    return {
        headers: Object.keys(SECURITY_HEADERS),
        productionHeaders: Object.keys(PRODUCTION_HEADERS),
        corsOrigins: CORS_CONFIG.allowedOrigins.length,
        environment: process.env.NODE_ENV,
        validation: validateSecurityConfig(),
        lastUpdated: new Date().toISOString()
    };
}

export {
    SECURITY_HEADERS,
    PRODUCTION_HEADERS,
    CORS_CONFIG,
    isOriginAllowed,
    applyCorsHeaders,
    applySecurityHeaders,
    handlePreflightRequest,
    securityHeadersMiddleware,
    generateCSPNonce,
    updateCSPWithNonce,
    validateSecurityConfig,
    getSecurityConfig
};

export default securityHeadersMiddleware;