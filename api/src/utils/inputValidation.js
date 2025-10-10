/**
 * Enhanced Input Validation and XSS Prevention Utility
 * Comprehensive input sanitization and validation for all API endpoints
 */

import { z } from 'zod';
import crypto from 'crypto';

/**
 * XSS Prevention Configuration
 */
const XSS_CONFIG = {
    // HTML entities to encode
    htmlEntities: {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    },

    // Dangerous HTML tags to remove completely
    dangerousTags: [
        'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea',
        'button', 'select', 'option', 'link', 'meta', 'style', 'base',
        'applet', 'body', 'html', 'head', 'title', 'frameset', 'frame'
    ],

    // Dangerous attributes to remove
    dangerousAttributes: [
        'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
        'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur',
        'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload',
        'javascript:', 'vbscript:', 'data:', 'mocha:', 'livescript:'
    ],

    // Maximum field lengths
    maxLengths: {
        name: 100,
        email: 254,
        phone: 20,
        message: 5000,
        subject: 255,
        url: 2048,
        general: 1000
    }
};

/**
 * Advanced XSS sanitization
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
function sanitizeXSS(input, options = {}) {
    if (typeof input !== 'string') {
        return '';
    }

    let sanitized = input;

    // 1. Normalize unicode and remove null bytes
    sanitized = sanitized
        .normalize('NFKC')
        .replace(/\0/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters

    // 2. Remove dangerous protocols
    const dangerousProtocols = /(?:javascript|vbscript|data|mocha|livescript):/gi;
    sanitized = sanitized.replace(dangerousProtocols, '');

    // 3. Encode HTML entities
    if (!options.allowHTML) {
        Object.entries(XSS_CONFIG.htmlEntities).forEach(([char, entity]) => {
            const regex = new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            sanitized = sanitized.replace(regex, entity);
        });
    }

    // 4. Remove dangerous HTML tags (even if encoded)
    XSS_CONFIG.dangerousTags.forEach(tag => {
        const patterns = [
            new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi'),
            new RegExp(`<${tag}[^>]*>`, 'gi'),
            new RegExp(`&lt;${tag}[^&]*&gt;.*?&lt;/${tag}&gt;`, 'gi'),
            new RegExp(`&lt;${tag}[^&]*&gt;`, 'gi')
        ];

        patterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
    });

    // 5. Remove dangerous attributes
    XSS_CONFIG.dangerousAttributes.forEach(attr => {
        const patterns = [
            new RegExp(`${attr}\\s*=\\s*[^\\s>]*`, 'gi'),
            new RegExp(`${attr.replace(':', '')}\\s*=\\s*[^\\s>]*`, 'gi')
        ];

        patterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
    });

    // 6. Remove CSS expressions and imports
    sanitized = sanitized
        .replace(/expression\s*\(/gi, '')
        .replace(/@import/gi, '')
        .replace(/binding\s*:/gi, '');

    // 7. Normalize whitespace
    sanitized = sanitized
        .replace(/\s+/g, ' ')
        .trim();

    // 8. Apply length limits
    const maxLength = options.maxLength || XSS_CONFIG.maxLengths.general;
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
}

/**
 * Sanitize email addresses
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
function sanitizeEmail(email) {
    if (typeof email !== 'string') return '';

    return email
        .toLowerCase()
        .trim()
        .replace(/[^\w@.-]/g, '') // Keep only valid email characters
        .substring(0, XSS_CONFIG.maxLengths.email);
}

/**
 * Sanitize phone numbers
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone
 */
function sanitizePhone(phone) {
    if (typeof phone !== 'string') return '';

    return phone
        .replace(/[^\d\s()\-+]/g, '') // Keep only valid phone characters
        .trim()
        .substring(0, XSS_CONFIG.maxLengths.phone);
}

/**
 * Sanitize URLs
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
function sanitizeURL(url) {
    if (typeof url !== 'string') return '';

    // Remove dangerous protocols
    const cleanUrl = url
        .trim()
        .replace(/^(javascript|vbscript|data|mocha|livescript):/gi, 'http:')
        .substring(0, XSS_CONFIG.maxLengths.url);

    try {
        // Validate URL format
        new URL(cleanUrl);
        return cleanUrl;
    } catch {
        return '';
    }
}

/**
 * Deep sanitization for nested objects
 * @param {any} input - Input to sanitize
 * @param {number} maxDepth - Maximum recursion depth
 * @param {Object} options - Sanitization options
 * @returns {any} Sanitized input
 */
function deepSanitize(input, maxDepth = 5, options = {}) {
    if (maxDepth <= 0) return null;

    if (typeof input === 'string') {
        return sanitizeXSS(input, options);
    }

    if (typeof input === 'number' || typeof input === 'boolean') {
        return input;
    }

    if (Array.isArray(input)) {
        return input
            .slice(0, 50) // Limit array size
            .map(item => deepSanitize(item, maxDepth - 1, options));
    }

    if (input && typeof input === 'object') {
        const sanitized = {};
        const keys = Object.keys(input).slice(0, 50); // Limit object keys

        for (const key of keys) {
            const sanitizedKey = sanitizeXSS(key, { maxLength: 100 });
            if (sanitizedKey && sanitizedKey.length > 0) {
                sanitized[sanitizedKey] = deepSanitize(input[key], maxDepth - 1, options);
            }
        }

        return sanitized;
    }

    return input;
}

/**
 * Validate and sanitize form data
 * @param {Object} formData - Form data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
function validateAndSanitizeForm(formData, schema) {
    try {
        // First sanitize the input
        const sanitized = deepSanitize(formData, 3, { allowHTML: false });

        // Then validate with schema
        const result = schema.parse(sanitized);

        return {
            success: true,
            data: result,
            errors: null,
            sanitized: true
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                data: null,
                errors: error.errors,
                sanitized: true
            };
        }

        return {
            success: false,
            data: null,
            errors: [{ message: 'Validation failed', code: 'VALIDATION_ERROR' }],
            sanitized: true
        };
    }
}

/**
 * SQL Injection prevention
 * @param {string} input - Input to check
 * @returns {Object} Detection result
 */
function detectSQLInjection(input) {
    if (typeof input !== 'string') return { detected: false };

    const sqlPatterns = [
        // Common SQL injection patterns
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /(--|\/\*|\*\/)/g,
        /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\()/gi,
        /(\b(WAITFOR|DELAY)\b)/gi,
        /(xp_|sp_)/gi,
        /(\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)\b)/gi
    ];

    for (const pattern of sqlPatterns) {
        if (pattern.test(input)) {
            return {
                detected: true,
                pattern: pattern.source,
                confidence: 0.8
            };
        }
    }

    return { detected: false };
}

/**
 * NoSQL Injection prevention
 * @param {any} input - Input to check
 * @returns {Object} Detection result
 */
function detectNoSQLInjection(input) {
    if (typeof input === 'object' && input !== null) {
        const jsonString = JSON.stringify(input);

        const nosqlPatterns = [
            /\$where/gi,
            /\$regex/gi,
            /\$ne/gi,
            /\$gt/gi,
            /\$lt/gi,
            /\$in/gi,
            /\$nin/gi,
            /\$exists/gi,
            /\$or/gi,
            /\$and/gi,
            /javascript:/gi,
            /function\s*\(/gi
        ];

        for (const pattern of nosqlPatterns) {
            if (pattern.test(jsonString)) {
                return {
                    detected: true,
                    pattern: pattern.source,
                    confidence: 0.7
                };
            }
        }
    }

    return { detected: false };
}

/**
 * Path traversal prevention
 * @param {string} input - Input to check
 * @returns {Object} Detection result
 */
function detectPathTraversal(input) {
    if (typeof input !== 'string') return { detected: false };

    const pathPatterns = [
        /\.\.\//g,
        /\.\.\\/g,
        /%2e%2e%2f/gi,
        /%2e%2e%5c/gi,
        /\.\.%2f/gi,
        /\.\.%5c/gi,
        /%252e%252e%252f/gi
    ];

    for (const pattern of pathPatterns) {
        if (pattern.test(input)) {
            return {
                detected: true,
                pattern: pattern.source,
                confidence: 0.9
            };
        }
    }

    return { detected: false };
}

/**
 * Comprehensive security validation
 * @param {any} input - Input to validate
 * @returns {Object} Security validation result
 */
function validateSecurity(input) {
    const results = {
        safe: true,
        threats: [],
        confidence: 0
    };

    // Check for SQL injection
    const sqlResult = detectSQLInjection(JSON.stringify(input));
    if (sqlResult.detected) {
        results.safe = false;
        results.threats.push({
            type: 'sql_injection',
            confidence: sqlResult.confidence,
            pattern: sqlResult.pattern
        });
    }

    // Check for NoSQL injection
    const nosqlResult = detectNoSQLInjection(input);
    if (nosqlResult.detected) {
        results.safe = false;
        results.threats.push({
            type: 'nosql_injection',
            confidence: nosqlResult.confidence,
            pattern: nosqlResult.pattern
        });
    }

    // Check for path traversal
    const pathResult = detectPathTraversal(JSON.stringify(input));
    if (pathResult.detected) {
        results.safe = false;
        results.threats.push({
            type: 'path_traversal',
            confidence: pathResult.confidence,
            pattern: pathResult.pattern
        });
    }

    // Calculate overall confidence
    if (results.threats.length > 0) {
        results.confidence = Math.max(...results.threats.map(t => t.confidence));
    }

    return results;
}

/**
 * Input validation middleware
 * @param {Object} options - Configuration options
 * @returns {Function} Middleware function
 */
function inputValidationMiddleware(options = {}) {
    return (req, res, next) => {
        try {
            // Skip validation for GET requests unless specified
            if (req.method === 'GET' && !options.validateQuery) {
                return next();
            }

            // Validate and sanitize request body
            if (req.body) {
                const securityResult = validateSecurity(req.body);

                if (!securityResult.safe) {
                    console.log(`Security threat detected: ${JSON.stringify({
                        threats: securityResult.threats,
                        confidence: securityResult.confidence,
                        timestamp: new Date().toISOString(),
                        userAgent: req.headers['user-agent']?.substring(0, 100)
                    })}`);

                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'security_threat_detected',
                            message: 'Request blocked due to security threat detection',
                            threats: securityResult.threats.map(t => t.type)
                        }
                    });
                }

                // Sanitize the input
                req.body = deepSanitize(req.body, 3, options.sanitization || {});
            }

            // Validate and sanitize query parameters
            if (req.query && options.validateQuery) {
                const securityResult = validateSecurity(req.query);

                if (!securityResult.safe) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'security_threat_detected',
                            message: 'Query parameters blocked due to security threat detection'
                        }
                    });
                }

                req.query = deepSanitize(req.query, 2, options.sanitization || {});
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

export {
    sanitizeXSS,
    sanitizeEmail,
    sanitizePhone,
    sanitizeURL,
    deepSanitize,
    validateAndSanitizeForm,
    detectSQLInjection,
    detectNoSQLInjection,
    detectPathTraversal,
    validateSecurity,
    inputValidationMiddleware,
    XSS_CONFIG
};

export default {
    sanitizeXSS,
    sanitizeEmail,
    sanitizePhone,
    sanitizeURL,
    deepSanitize,
    validateAndSanitizeForm,
    validateSecurity,
    inputValidationMiddleware
};