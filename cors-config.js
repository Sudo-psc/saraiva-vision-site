// CORS Configuration for Saraiva Vision VPS Backend
// Optimized for Vercel domains and production environment

const ALLOWED_ORIGINS = [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br',
    'https://saraivavision.vercel.app',
    'https://saraivavision-git-*.vercel.app', // Preview deployments
    'https://31.97.129.78:3000', // Local development
    'https://31.97.129.78:3001', // Local API
    'http://localhost:3000',
    'http://localhost:3001'
];

const CORS_HEADERS = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Vercel-*, X-Forwarded-*, X-Real-IP',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
};

const VERCEL_SPECIFIC_HEADERS = {
    'X-Vercel-*': 'Allow Vercel-specific headers',
    'X-Forwarded-For': 'Allow forwarded IP',
    'X-Real-IP': 'Allow real IP',
};

function isAllowedOrigin(origin) {
    if (!origin) return false;

    // Exact match
    if (ALLOWED_ORIGINS.includes(origin)) return true;

    // Wildcard for Vercel preview deployments
    const vercelPreviewPattern = /^https:\/\/saraivavision-git-[\w-]+\.vercel\.app$/;
    if (vercelPreviewPattern.test(origin)) return true;

    return false;
}

function getCorsHeaders(origin) {
    if (!origin || !isAllowedOrigin(origin)) {
        return {
            'Access-Control-Allow-Origin': 'https://saraivavision.com.br', // Default to production
            ...CORS_HEADERS,
        };
    }

    return {
        'Access-Control-Allow-Origin': origin,
        ...CORS_HEADERS,
    };
}

function handlePreflightRequest(req, res) {
    const origin = req.headers.origin;
    const corsHeaders = getCorsHeaders(origin);

    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // Additional security headers for preflight
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Length', '0');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    res.status(204).end();
}

function addCorsHeaders(req, res, next) {
    const origin = req.headers.origin;

    // Skip CORS for non-browser requests
    if (!origin) {
        return next();
    }

    const corsHeaders = getCorsHeaders(origin);

    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    next();
}

// Middleware for Express.js
function corsMiddleware(req, res, next) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return handlePreflightRequest(req, res);
    }

    // Add CORS headers to all responses
    addCorsHeaders(req, res, next);
}

// Export functions for different use cases
module.exports = {
    ALLOWED_ORIGINS,
    CORS_HEADERS,
    VERCEL_SPECIFIC_HEADERS,
    isAllowedOrigin,
    getCorsHeaders,
    handlePreflightRequest,
    addCorsHeaders,
    corsMiddleware,
    // Convenience function for manual CORS handling
    setupCors: (app) => {
        app.use(corsMiddleware);
    }
};