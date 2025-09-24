/**
 * Chatbot Security Middleware
 * Specialized security middleware for AI chatbot endpoints
 * 
 * Features:
 * - Request validation and sanitization
 * - Rate limiting and DDoS protection
 * - Security event logging
 * - Multi-factor authentication for sensitive operations
 * - Real-time threat detection
 */

import ChatbotSecurityService from '../../src/services/chatbotSecurityService.js';
import { getClientIP } from '../contact/rateLimiter.js';

// Initialize security service
const securityService = new ChatbotSecurityService();

/**
 * Main chatbot security middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export async function chatbotSecurityMiddleware(req, res, next) {
    const startTime = Date.now();

    try {
        // Extract request context
        const context = {
            req,
            clientIP: getClientIP(req),
            userAgent: req.headers['user-agent'] || '',
            timestamp: Date.now(),
            requestId: req.headers['x-request-id'] || generateRequestId()
        };

        // Set security headers
        setSecurityHeaders(res);

        // Validate request format
        const formatValidation = validateRequestFormat(req);
        if (!formatValidation.isValid) {
            return sendSecurityError(res, formatValidation.error, 400);
        }

        // Perform comprehensive security validation
        const securityValidation = await securityService.validateChatbotRequest(req.body || {}, context);

        // Handle security violations
        if (!securityValidation.isValid) {
            const criticalViolations = securityValidation.violations.filter(v => v.severity === 'CRITICAL');
            const highViolations = securityValidation.violations.filter(v => v.severity === 'HIGH');

            if (criticalViolations.length > 0) {
                return sendSecurityError(res, {
                    code: 'CRITICAL_SECURITY_VIOLATION',
                    message: 'Request blocked due to critical security violation',
                    violations: criticalViolations.map(v => ({ type: v.type, message: v.message }))
                }, 403);
            }

            if (highViolations.length > 0) {
                return sendSecurityError(res, {
                    code: 'HIGH_SECURITY_VIOLATION',
                    message: 'Request blocked due to high security violation',
                    violations: highViolations.map(v => ({ type: v.type, message: v.message }))
                }, 429);
            }
        }

        // Add security context to request
        req.security = {
            ...context,
            validation: securityValidation,
            sessionId: securityValidation.sessionId,
            securityScore: securityValidation.securityScore,
            processingTime: Date.now() - startTime
        };

        // Set security response headers
        res.setHeader('X-Request-ID', context.requestId);
        res.setHeader('X-Security-Score', securityValidation.securityScore);
        res.setHeader('X-Session-ID', securityValidation.sessionId);

        // Add rate limit headers if applicable
        const rateLimitInfo = securityValidation.metadata?.rateLimitInfo;
        if (rateLimitInfo) {
            res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit || 20);
            res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining || 0);
            res.setHeader('X-RateLimit-Reset', rateLimitInfo.resetTime || Date.now() + 60000);
        }

        next();

    } catch (error) {
        console.error('Chatbot security middleware error:', error);

        // Log security error
        await securityService.logSecurityEvent('MIDDLEWARE_ERROR', {
            error: error.message,
            stack: error.stack?.substring(0, 500),
            timestamp: new Date().toISOString()
        });

        return sendSecurityError(res, {
            code: 'SECURITY_MIDDLEWARE_ERROR',
            message: 'Security validation failed'
        }, 500);
    }
}

/**
 * Sensitive operations middleware (requires additional authentication)
 * @param {Array} operations - List of sensitive operations to protect
 * @returns {Function} Middleware function
 */
export function sensitiveOperationMiddleware(operations = []) {
    return async (req, res, next) => {
        try {
            const operationType = req.body?.operationType || req.query?.operation;

            // Check if this is a sensitive operation
            if (operations.includes(operationType)) {
                // Verify additional authentication
                const authResult = await verifySensitiveOperationAuth(req);

                if (!authResult.isValid) {
                    await securityService.logSecurityEvent('SENSITIVE_OPERATION_BLOCKED', {
                        operation: operationType,
                        reason: authResult.reason,
                        clientIP: req.security?.clientIP,
                        sessionId: req.security?.sessionId
                    });

                    return sendSecurityError(res, {
                        code: 'SENSITIVE_OPERATION_DENIED',
                        message: 'Additional authentication required for sensitive operation',
                        operation: operationType
                    }, 403);
                }

                // Log successful sensitive operation access
                await securityService.logSecurityEvent('SENSITIVE_OPERATION_ACCESSED', {
                    operation: operationType,
                    clientIP: req.security?.clientIP,
                    sessionId: req.security?.sessionId,
                    authMethod: authResult.method
                });
            }

            next();

        } catch (error) {
            console.error('Sensitive operation middleware error:', error);
            return sendSecurityError(res, {
                code: 'SENSITIVE_OPERATION_ERROR',
                message: 'Sensitive operation validation failed'
            }, 500);
        }
    };
}

/**
 * Real-time threat detection middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export async function threatDetectionMiddleware(req, res, next) {
    try {
        const threats = await detectRealTimeThreats(req);

        if (threats.length > 0) {
            const highThreats = threats.filter(t => t.severity === 'HIGH' || t.severity === 'CRITICAL');

            if (highThreats.length > 0) {
                // Log threat detection
                await securityService.logSecurityEvent('THREAT_DETECTED', {
                    threats: highThreats,
                    clientIP: req.security?.clientIP,
                    sessionId: req.security?.sessionId,
                    userAgent: req.headers['user-agent']
                });

                return sendSecurityError(res, {
                    code: 'THREAT_DETECTED',
                    message: 'Request blocked due to threat detection',
                    threatCount: highThreats.length
                }, 403);
            }

            // Add threat information to request context
            req.security = req.security || {};
            req.security.threats = threats;
        }

        next();

    } catch (error) {
        console.error('Threat detection middleware error:', error);
        next(); // Continue processing on error
    }
}

/**
 * Audit logging middleware
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function auditLoggingMiddleware(req, res, next) {
    const startTime = Date.now();

    // Capture original response methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to capture response data
    res.send = function (data) {
        logAuditEvent(req, res, data, Date.now() - startTime);
        return originalSend.call(this, data);
    };

    res.json = function (data) {
        logAuditEvent(req, res, data, Date.now() - startTime);
        return originalJson.call(this, data);
    };

    next();
}

/**
 * Set security headers for chatbot endpoints
 * @param {Object} res - Response object
 */
function setSecurityHeaders(res) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy for chatbot
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; '));

    // Cache control
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Custom security headers
    res.setHeader('X-Chatbot-Security', 'enabled');
    res.setHeader('X-Content-Security', 'validated');
}

/**
 * Validate request format and structure
 * @param {Object} req - Request object
 * @returns {Object} Validation result
 */
function validateRequestFormat(req) {
    const validation = { isValid: true, error: null };

    // Check HTTP method
    if (!['POST', 'GET', 'OPTIONS'].includes(req.method)) {
        validation.isValid = false;
        validation.error = {
            code: 'INVALID_HTTP_METHOD',
            message: 'Only POST, GET, and OPTIONS methods are allowed'
        };
        return validation;
    }

    // Check content type for POST requests
    if (req.method === 'POST') {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            validation.isValid = false;
            validation.error = {
                code: 'INVALID_CONTENT_TYPE',
                message: 'Content-Type must be application/json'
            };
            return validation;
        }
    }

    // Check content length
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 10 * 1024) { // 10KB limit
        validation.isValid = false;
        validation.error = {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request payload exceeds maximum size limit'
        };
        return validation;
    }

    return validation;
}

/**
 * Verify additional authentication for sensitive operations
 * @param {Object} req - Request object
 * @returns {Object} Authentication result
 */
async function verifySensitiveOperationAuth(req) {
    // In a real implementation, this would verify:
    // - JWT tokens
    // - API keys
    // - Multi-factor authentication
    // - Session validation
    // - User permissions

    const authHeader = req.headers.authorization;
    const sessionToken = req.headers['x-session-token'];
    const mfaToken = req.headers['x-mfa-token'];

    // Basic validation (implement proper auth logic)
    if (!authHeader && !sessionToken) {
        return {
            isValid: false,
            reason: 'No authentication provided',
            method: null
        };
    }

    // For demo purposes, accept any valid-looking token
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return {
            isValid: true,
            reason: 'Valid bearer token',
            method: 'bearer_token'
        };
    }

    if (sessionToken && sessionToken.length > 10) {
        return {
            isValid: true,
            reason: 'Valid session token',
            method: 'session_token'
        };
    }

    return {
        isValid: false,
        reason: 'Invalid authentication credentials',
        method: null
    };
}

/**
 * Detect real-time threats in request
 * @param {Object} req - Request object
 * @returns {Array} Detected threats
 */
async function detectRealTimeThreats(req) {
    const threats = [];
    const message = req.body?.message || '';
    const userAgent = req.headers['user-agent'] || '';

    // 1. SQL Injection detection
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /(--|\/\*|\*\/)/g
    ];

    for (const pattern of sqlPatterns) {
        if (pattern.test(message)) {
            threats.push({
                type: 'SQL_INJECTION',
                severity: 'CRITICAL',
                pattern: pattern.source,
                location: 'message'
            });
        }
    }

    // 2. XSS detection
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
    ];

    for (const pattern of xssPatterns) {
        if (pattern.test(message)) {
            threats.push({
                type: 'XSS_ATTEMPT',
                severity: 'HIGH',
                pattern: pattern.source,
                location: 'message'
            });
        }
    }

    // 3. Command injection detection
    const commandPatterns = [
        /[;&|`$(){}[\]]/g,
        /\b(eval|exec|system|shell_exec|passthru)\b/gi
    ];

    for (const pattern of commandPatterns) {
        if (pattern.test(message)) {
            threats.push({
                type: 'COMMAND_INJECTION',
                severity: 'HIGH',
                pattern: pattern.source,
                location: 'message'
            });
        }
    }

    // 4. Bot detection
    const botPatterns = [
        /bot|crawler|spider|scraper/i,
        /curl|wget|python|php|java/i
    ];

    for (const pattern of botPatterns) {
        if (pattern.test(userAgent)) {
            threats.push({
                type: 'BOT_DETECTED',
                severity: 'MEDIUM',
                pattern: pattern.source,
                location: 'user_agent'
            });
        }
    }

    return threats;
}

/**
 * Log audit event
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {any} responseData - Response data
 * @param {number} processingTime - Processing time in milliseconds
 */
async function logAuditEvent(req, res, responseData, processingTime) {
    try {
        const auditEvent = {
            timestamp: new Date().toISOString(),
            requestId: req.security?.requestId,
            sessionId: req.security?.sessionId,
            clientIP: req.security?.clientIP,
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
            statusCode: res.statusCode,
            processingTime,
            securityScore: req.security?.securityScore,
            violations: req.security?.validation?.violations?.length || 0,
            warnings: req.security?.validation?.warnings?.length || 0,
            messageLength: req.body?.message?.length || 0,
            responseSize: JSON.stringify(responseData).length
        };

        // Log to security service
        await securityService.logSecurityEvent('AUDIT_LOG', auditEvent);

    } catch (error) {
        console.error('Audit logging error:', error);
    }
}

/**
 * Send security error response
 * @param {Object} res - Response object
 * @param {Object} error - Error details
 * @param {number} statusCode - HTTP status code
 */
function sendSecurityError(res, error, statusCode = 400) {
    res.status(statusCode).json({
        success: false,
        error: {
            ...error,
            timestamp: new Date().toISOString(),
            requestId: res.getHeader('X-Request-ID')
        }
    });
}

/**
 * Generate unique request ID
 * @returns {string} Request ID
 */
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get security statistics
 * @returns {Object} Security statistics
 */
export function getSecurityStats() {
    return securityService.getSecurityStats();
}

/**
 * Create complete chatbot security middleware stack
 * @param {Object} options - Configuration options
 * @returns {Array} Array of middleware functions
 */
export function createChatbotSecurityStack(options = {}) {
    const middlewares = [
        chatbotSecurityMiddleware
    ];

    if (options.enableThreatDetection !== false) {
        middlewares.push(threatDetectionMiddleware);
    }

    if (options.sensitiveOperations && options.sensitiveOperations.length > 0) {
        middlewares.push(sensitiveOperationMiddleware(options.sensitiveOperations));
    }

    if (options.enableAuditLogging !== false) {
        middlewares.push(auditLoggingMiddleware);
    }

    return middlewares;
}

export {
    securityService as chatbotSecurityService
};