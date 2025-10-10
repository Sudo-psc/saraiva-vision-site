/**
 * Instagram Security Middleware - Applies security measures to Instagram API endpoints
 * Handles rate limiting, input validation, authentication, and content filtering
 */

import instagramSecurityService from '../services/instagramSecurityService.js';

/**
 * Security middleware configuration
 */
const securityConfig = {
    // Rate limiting configuration
    rateLimiting: {
        enabled: true,
        endpoints: {
            '/api/instagram/posts': {
                windowMs: 60000, // 1 minute
                max: 30 // requests per window
            },
            '/api/instagram/stats': {
                windowMs: 60000, // 1 minute
                max: 60 // requests per window
            },
            '/api/instagram/websocket': {
                windowMs: 60000, // 1 minute
                max: 100 // messages per window
            }
        }
    },

    // Authentication configuration
    authentication: {
        enabled: true,
        requiredPaths: [
            '/api/instagram/admin',
            '/api/instagram/config'
        ],
        optionalPaths: [
            '/api/instagram/posts',
            '/api/instagram/stats'
        ]
    },

    // Input validation schemas
    validation: {
        '/api/instagram/posts': {
            query: {
                limit: {
                    type: 'number',
                    required: false,
                    min: 1,
                    max: 20,
                    default: 4
                },
                includeStats: {
                    type: 'boolean',
                    required: false,
                    default: true
                },
                fields: {
                    type: 'string',
                    required: false,
                    pattern: /^[A-Za-z0-9_,]+$/
                }
            }
        },
        '/api/instagram/stats': {
            query: {
                postId: {
                    type: 'string',
                    required: false,
                    pattern: /^[A-Za-z0-9_-]+$/
                },
                includeInsights: {
                    type: 'boolean',
                    required: false,
                    default: false
                }
            },
            body: {
                postIds: {
                    type: 'array',
                    required: true,
                    validate: (value) => {
                        return Array.isArray(value) &&
                            value.length > 0 &&
                            value.length <= 50 &&
                            value.every(id => /^[A-Za-z0-9_-]+$/.test(id));
                    }
                },
                includeInsights: {
                    type: 'boolean',
                    required: false,
                    default: false
                }
            }
        }
    },

    // Content filtering configuration
    contentFiltering: {
        enabled: true,
        endpoints: [
            '/api/instagram/posts',
            '/api/instagram/stats'
        ],
        strictMode: false // Block content with score >= 30 in strict mode
    }
};

/**
 * Apply rate limiting to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {string} endpoint - API endpoint
 */
function applyRateLimiting(req, res, next, endpoint) {
    if (!securityConfig.rateLimiting.enabled) {
        return next();
    }

    const rateLimitResult = instagramSecurityService.checkRateLimit(req, endpoint);

    // Add rate limit headers to response
    res.set({
        'X-RateLimit-Limit': securityConfig.rateLimiting.endpoints[endpoint]?.max || 100,
        'X-RateLimit-Remaining': rateLimitResult.remaining,
        'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000)
    });

    if (!rateLimitResult.allowed) {
        return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: rateLimitResult.retryAfter
        });
    }

    next();
}

/**
 * Apply authentication to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {string} path - Request path
 */
function applyAuthentication(req, res, next, path) {
    if (!securityConfig.authentication.enabled) {
        return next();
    }

    // Check if authentication is required for this path
    const isRequired = securityConfig.authentication.requiredPaths.some(requiredPath =>
        path.startsWith(requiredPath)
    );

    const isOptional = securityConfig.authentication.optionalPaths.some(optionalPath =>
        path.startsWith(optionalPath)
    );

    if (!isRequired && !isOptional) {
        return next();
    }

    // Get token from various sources
    const token = getTokenFromRequest(req);

    if (!token) {
        if (isRequired) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Please provide a valid API token'
            });
        } else {
            // Optional authentication - continue without user context
            req.user = null;
            return next();
        }
    }

    // Validate token
    const requiredPermission = isRequired ? 'read' : null;
    const validationResult = instagramSecurityService.validateApiToken(token, requiredPermission);

    if (!validationResult.valid) {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
            message: validationResult.reason
        });
    }

    // Add user context to request
    req.user = {
        id: validationResult.userId,
        permissions: validationResult.permissions
    };

    next();
}

/**
 * Extract token from request
 * @param {Object} req - Express request object
 * @returns {string|null} API token
 */
function getTokenFromRequest(req) {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Check X-API-Key header
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
        return apiKey;
    }

    // Check query parameter
    if (req.query.token) {
        return req.query.token;
    }

    return null;
}

/**
 * Apply input validation to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {string} endpoint - API endpoint
 */
function applyInputValidation(req, res, next, endpoint) {
    const schema = securityConfig.validation[endpoint];
    if (!schema) {
        return next();
    }

    const dataToValidate = {};
    let hasErrors = false;
    const errors = [];

    // Validate query parameters
    if (schema.query) {
        const queryResult = instagramSecurityService.validateAndSanitize(req.query, schema.query);
        if (!queryResult.valid) {
            hasErrors = true;
            errors.push(...queryResult.errors);
        }
        dataToValidate.query = queryResult.sanitized;
    }

    // Validate request body
    if (schema.body && req.body) {
        const bodyResult = instagramSecurityService.validateAndSanitize(req.body, schema.body);
        if (!bodyResult.valid) {
            hasErrors = true;
            errors.push(...bodyResult.errors);
        }
        dataToValidate.body = bodyResult.sanitized;
    }

    // Validate path parameters
    if (schema.params && req.params) {
        const paramsResult = instagramSecurityService.validateAndSanitize(req.params, schema.params);
        if (!paramsResult.valid) {
            hasErrors = true;
            errors.push(...paramsResult.errors);
        }
        dataToValidate.params = paramsResult.sanitized;
    }

    if (hasErrors) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: 'Invalid input data',
            errors
        });
    }

    // Update request with sanitized data
    if (dataToValidate.query) req.query = dataToValidate.query;
    if (dataToValidate.body) req.body = dataToValidate.body;
    if (dataToValidate.params) req.params = dataToValidate.params;

    next();
}

/**
 * Apply content filtering to response data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {string} endpoint - API endpoint
 */
function applyContentFiltering(req, res, next, endpoint) {
    if (!securityConfig.contentFiltering.enabled) {
        return next();
    }

    if (!securityConfig.contentFiltering.endpoints.includes(endpoint)) {
        return next();
    }

    // Override res.json to filter response data
    const originalJson = res.json;
    res.json = function (data) {
        if (data.success && data.data) {
            const posts = Array.isArray(data.data) ? data.data : [data.data];

            const filteredPosts = posts.map(post => {
                const filterResult = instagramSecurityService.filterContent(post);

                if (!filterResult.allowed) {
                    // Block inappropriate content
                    return {
                        ...post,
                        caption: '[Content filtered]',
                        media_url: null,
                        filtered: true,
                        filterReason: filterResult.issues.join(', ')
                    };
                }

                return post;
            });

            // Update response data
            if (Array.isArray(data.data)) {
                data.data = filteredPosts;
            } else {
                data.data = filteredPosts[0];
            }
        }

        return originalJson.call(this, data);
    };

    next();
}

/**
 * Add security headers to response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function addSecurityHeaders(req, res, next) {
    // Security headers
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://googletagmanager.com https://www.google-analytics.com https://google-analytics.com https://www.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' wss: https://www.google-analytics.com https://google-analytics.com https://www.googletagmanager.com https://googletagmanager.com https://stats.g.doubleclick.net https://*.supabase.co; style-src 'self' 'unsafe-inline'; frame-src 'self' https://www.googletagmanager.com; object-src 'none'",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    });

    next();
}

/**
 * Log security events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function logSecurityEvents(req, res, next) {
    const startTime = Date.now();
    const originalEnd = res.end;

    res.end = function (chunk, encoding) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Log security-relevant information
        const securityLog = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: instagramSecurityService.getClientIP(req),
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            responseTime,
            authenticated: !!req.user,
            userId: req.user?.id || null,
            rateLimited: res.statusCode === 429,
            validationErrors: req.validationErrors || []
        };

        // Log to console (in production, this would go to a logging service)
        if (res.statusCode >= 400 || securityLog.rateLimited) {
            console.warn('Security Event:', securityLog);
        }

        originalEnd.call(this, chunk, encoding);
    };

    next();
}

/**
 * Create Instagram security middleware for specific endpoint
 * @param {string} endpoint - API endpoint
 * @returns {Function} Express middleware function
 */
function createInstagramSecurityMiddleware(endpoint) {
    return (req, res, next) => {
        const path = req.path;

        // Apply security measures in order
        addSecurityHeaders(req, res, () => {
            logSecurityEvents(req, res, () => {
                applyRateLimiting(req, res, () => {
                    applyAuthentication(req, res, () => {
                        applyInputValidation(req, res, () => {
                            applyContentFiltering(req, res, next, endpoint);
                        }, endpoint);
                    }, path);
                }, endpoint);
            });
        });
    };
}

/**
 * WebSocket security middleware
 * @param {Object} ws - WebSocket connection
 * @param {Object} req - HTTP request object
 */
function applyWebSocketSecurity(ws, req) {
    const ip = instagramSecurityService.getClientIP(req);

    // Store IP in WebSocket object for rate limiting
    ws._ip = ip;

    // Apply rate limiting to WebSocket messages
    ws.on('message', (message) => {
        const rateLimitResult = instagramSecurityService.checkWebSocketRateLimit(ws);

        if (!rateLimitResult.allowed) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Rate limit exceeded',
                retryAfter: rateLimitResult.retryAfter
            }));

            // Close connection if rate limit is exceeded
            ws.close(1008, 'Rate limit exceeded');
            return;
        }

        // Parse and validate message
        try {
            const data = JSON.parse(message);

            // Validate message structure
            if (!data.type || typeof data.type !== 'string') {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid message format'
                }));
                return;
            }

            // Add validated data to WebSocket object
            ws._validatedMessage = data;

        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid JSON format'
            }));
        }
    });

    // Log connection
    console.log(`WebSocket connection from ${ip}`);
}

/**
 * Generate API token for admin users
 * @param {string} userId - User ID
 * @param {Array} permissions - Token permissions
 * @returns {string} Generated token
 */
function generateAdminToken(userId, permissions = ['read', 'write', 'admin']) {
    return instagramSecurityService.generateApiToken(userId, permissions, 86400000); // 24 hours
}

/**
 * Get security metrics
 * @returns {Object} Security metrics
 */
function getSecurityMetrics() {
    return instagramSecurityService.getSecurityMetrics();
}

export {
    createInstagramSecurityMiddleware,
    applyWebSocketSecurity,
    generateAdminToken,
    getSecurityMetrics,
    securityConfig
};

export default createInstagramSecurityMiddleware;
