/**
 * Instagram Security Service - Handles security measures for Instagram integration
 * Implements rate limiting, input validation, XSS prevention, and content filtering
 */

class InstagramSecurityService {
    constructor() {
        this.rateLimits = new Map(); // IP address -> { count, resetTime }
        this.requestTimestamps = new Map(); // IP address -> [timestamps]
        this.apiTokens = new Map(); // token -> { userId, permissions, expiresAt }
        this.sanitizationPatterns = new Map();
        this.contentFilters = new Map();

        this.initializeSecurityPatterns();
        this.initializeRateLimiting();
    }

    /**
     * Initialize security patterns for sanitization
     * @private
     */
    initializeSecurityPatterns() {
        // XSS prevention patterns
        this.sanitizationPatterns.set('xss', {
            script: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            iframe: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            onEvent: /on\w+\s*=/gi,
            javascript: /javascript:/gi,
            dataUrl: /data:\s*image\/[^;]+;base64,/gi,
            htmlComments: /<!--[\s\S]*?-->/g,
            dangerousTags: /<(object|embed|form|input|button)[^>]*>/gi
        });

        // Input validation patterns
        this.sanitizationPatterns.set('validation', {
            postId: /^[A-Za-z0-9_-]+$/,
            username: /^@[A-Za-z0-9._]+$/,
            hashtag: /^#[A-Za-z0-9_]+$/,
            url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
            colorHex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            numberRange: /^\d+$/
        });

        // Content filtering patterns
        this.contentFilters.set('spam', {
            keywords: [
                'click here', 'free money', 'win prize', 'limited time',
                'act now', 'exclusive offer', 'guaranteed', 'no risk'
            ],
            urlPatterns: [
                /bit\.ly|t\.co|tinyurl\.com/i,
                /\.xyz$|\.top$|\.click$/i
            ]
        });

        this.contentFilters.set('inappropriate', {
            keywords: [
                // Add inappropriate content keywords as needed
                // This would be customized based on content policies
            ],
            patterns: [
                // Add patterns for inappropriate content detection
            ]
        });
    }

    /**
     * Initialize rate limiting configuration
     * @private
     */
    initializeRateLimiting() {
        this.rateLimitConfig = {
            // General API rate limits
            general: {
                requests: 100, // requests per window
                windowMs: 60000, // 1 minute window
                keyGenerator: (req) => this.getClientIP(req)
            },

            // Specific endpoint rate limits
            '/api/instagram/posts': {
                requests: 30,
                windowMs: 60000,
                keyGenerator: (req) => this.getClientIP(req)
            },

            '/api/instagram/stats': {
                requests: 60,
                windowMs: 60000,
                keyGenerator: (req) => this.getClientIP(req)
            },

            // WebSocket rate limits
            websocket: {
                messages: 100,
                windowMs: 60000,
                keyGenerator: (ws) => this.getClientIPFromWebSocket(ws)
            }
        };

        // Start cleanup interval for expired rate limit entries
        setInterval(() => this.cleanupRateLimits(), 300000); // Cleanup every 5 minutes
    }

    /**
     * Get client IP address from request
     * @private
     */
    getClientIP(req) {
        // Check for various headers that might contain the real IP
        const forwarded = req.headers['x-forwarded-for'];
        const realIp = req.headers['x-real-ip'];
        const cfConnectingIp = req.headers['cf-connecting-ip'];

        if (cfConnectingIp) return cfConnectingIp;
        if (realIp) return realIp;
        if (forwarded) {
            const ips = forwarded.split(',').map(ip => ip.trim());
            return ips[0]; // Take the first IP from the forwarded chain
        }

        return req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.connection?.socket?.remoteAddress ||
            'unknown';
    }

    /**
     * Get client IP from WebSocket connection
     * @private
     */
    getClientIPFromWebSocket(ws) {
        // This would need to be implemented based on your WebSocket server setup
        // For now, return a unique identifier for the WebSocket connection
        return ws._socket?.remoteAddress || `ws_${Date.now()}_${Math.random()}`;
    }

    /**
     * Check if request is rate limited
     * @param {Object} req - HTTP request object
     * @param {string} endpoint - API endpoint
     * @returns {Object} Rate limit status
     */
    checkRateLimit(req, endpoint = 'general') {
        const config = this.rateLimitConfig[endpoint] || this.rateLimitConfig.general;
        const key = config.keyGenerator(req);
        const now = Date.now();

        // Initialize rate limit data for this key if not exists
        if (!this.rateLimits.has(key)) {
            this.rateLimits.set(key, {
                count: 0,
                resetTime: now + config.windowMs,
                timestamps: []
            });
        }

        const limitData = this.rateLimits.get(key);

        // Reset window if expired
        if (now > limitData.resetTime) {
            limitData.count = 0;
            limitData.resetTime = now + config.windowMs;
            limitData.timestamps = [];
        }

        // Check if limit exceeded
        if (limitData.count >= config.requests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: limitData.resetTime,
                retryAfter: Math.ceil((limitData.resetTime - now) / 1000)
            };
        }

        // Increment count
        limitData.count++;
        limitData.timestamps.push(now);

        return {
            allowed: true,
            remaining: config.requests - limitData.count,
            resetTime: limitData.resetTime,
            retryAfter: 0
        };
    }

    /**
     * Check WebSocket message rate limit
     * @param {Object} ws - WebSocket connection
     * @returns {Object} Rate limit status
     */
    checkWebSocketRateLimit(ws) {
        const config = this.rateLimitConfig.websocket;
        const key = config.keyGenerator(ws);
        const now = Date.now();

        if (!this.rateLimits.has(key)) {
            this.rateLimits.set(key, {
                count: 0,
                resetTime: now + config.windowMs,
                timestamps: []
            });
        }

        const limitData = this.rateLimits.get(key);

        if (now > limitData.resetTime) {
            limitData.count = 0;
            limitData.resetTime = now + config.windowMs;
            limitData.timestamps = [];
        }

        if (limitData.count >= config.messages) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: limitData.resetTime,
                retryAfter: Math.ceil((limitData.resetTime - now) / 1000)
            };
        }

        limitData.count++;
        limitData.timestamps.push(now);

        return {
            allowed: true,
            remaining: config.messages - limitData.count,
            resetTime: limitData.resetTime,
            retryAfter: 0
        };
    }

    /**
     * Cleanup expired rate limit entries
     * @private
     */
    cleanupRateLimits() {
        const now = Date.now();

        for (const [key, data] of this.rateLimits.entries()) {
            if (now > data.resetTime + 86400000) { // Remove entries older than 24h
                this.rateLimits.delete(key);
            }
        }
    }

    /**
     * Validate and sanitize input data
     * @param {Object} data - Input data to validate
     * @param {Object} schema - Validation schema
     * @returns {Object} Validation result with sanitized data
     */
    validateAndSanitize(data, schema) {
        const result = {
            valid: true,
            errors: [],
            sanitized: { ...data }
        };

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            // Check required fields
            if (rules.required && (value === undefined || value === null || value === '')) {
                result.valid = false;
                result.errors.push(`Field '${field}' is required`);
                continue;
            }

            // Skip validation for optional fields that are empty
            if (!rules.required && (value === undefined || value === null || value === '')) {
                continue;
            }

            // Type validation
            if (rules.type && typeof value !== rules.type) {
                result.valid = false;
                result.errors.push(`Field '${field}' must be of type ${rules.type}`);
                continue;
            }

            // Pattern validation
            if (rules.pattern && !rules.pattern.test(value)) {
                result.valid = false;
                result.errors.push(`Field '${field}' has invalid format`);
                continue;
            }

            // Min/Max validation
            if (rules.min !== undefined && value < rules.min) {
                result.valid = false;
                result.errors.push(`Field '${field}' must be at least ${rules.min}`);
                continue;
            }

            if (rules.max !== undefined && value > rules.max) {
                result.valid = false;
                result.errors.push(`Field '${field}' must be at most ${rules.max}`);
                continue;
            }

            // MinLength/MaxLength validation
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                result.valid = false;
                result.errors.push(`Field '${field}' must be at least ${rules.minLength} characters`);
                continue;
            }

            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                result.valid = false;
                result.errors.push(`Field '${field}' must be at most ${rules.maxLength} characters`);
                continue;
            }

            // Custom validation
            if (rules.validate && !rules.validate(value)) {
                result.valid = false;
                result.errors.push(`Field '${field}' failed custom validation`);
                continue;
            }

            // Sanitization
            if (typeof value === 'string') {
                result.sanitized[field] = this.sanitizeString(value, field);
            }
        }

        return result;
    }

    /**
     * Sanitize string to prevent XSS and other attacks
     * @param {string} str - String to sanitize
     * @param {string} context - Context for sanitization (e.g., 'caption', 'username')
     * @returns {string} Sanitized string
     */
    sanitizeString(str, context = 'general') {
        if (typeof str !== 'string') return str;

        let sanitized = str;

        // Remove XSS patterns
        const xssPatterns = this.sanitizationPatterns.get('xss');
        for (const [name, pattern] of Object.entries(xssPatterns)) {
            sanitized = sanitized.replace(pattern, '');
        }

        // Context-specific sanitization
        switch (context) {
            case 'caption':
                // Allow basic HTML formatting but strip dangerous elements
                sanitized = this.sanitizeHtml(sanitized);
                break;

            case 'username':
                // Remove @ symbol and special characters
                sanitized = sanitized.replace(/[^A-Za-z0-9._]/g, '');
                break;

            case 'hashtag':
                // Remove # symbol and special characters
                sanitized = sanitized.replace(/[^A-Za-z0-9_]/g, '');
                break;

            case 'url':
                // Ensure URL is properly formatted
                sanitized = this.sanitizeUrl(sanitized);
                break;

            default:
                // General sanitization - remove all HTML
                sanitized = sanitized.replace(/<[^>]*>/g, '');
        }

        // Encode HTML entities
        sanitized = this.encodeHtmlEntities(sanitized);

        return sanitized.trim();
    }

    /**
     * Sanitize HTML content (allow safe tags only)
     * @param {string} html - HTML to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html) {
        const allowedTags = new Set([
            'b', 'i', 'u', 'em', 'strong', 'br', 'p', 'span'
        ]);

        return html.replace(/<([^>]+)>/g, (match, tagContent) => {
            const tagName = tagContent.split(' ')[0].toLowerCase();
            return allowedTags.has(tagName) ? match : '';
        });
    }

    /**
     * Sanitize URL
     * @param {string} url - URL to sanitize
     * @returns {string} Sanitized URL
     */
    sanitizeUrl(url) {
        try {
            // Remove dangerous protocols
            const sanitized = url.replace(/^(javascript|data|vbscript):/i, '');

            // Validate URL format
            const urlPattern = this.sanitizationPatterns.get('validation').url;
            if (urlPattern.test(sanitized)) {
                return sanitized;
            }

            return '';
        } catch (error) {
            return '';
        }
    }

    /**
     * Encode HTML entities
     * @param {string} str - String to encode
     * @returns {string} Encoded string
     */
    encodeHtmlEntities(str) {
        return str
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#39;');
    }

    /**
     * Filter content for spam and inappropriate material
     * @param {Object} content - Content to filter
     * @returns {Object} Filter result
     */
    filterContent(content) {
        const result = {
            allowed: true,
            score: 0,
            issues: [],
            filtered: { ...content }
        };

        const textToCheck = [
            content.caption || '',
            content.username || '',
            ...(content.hashtags || [])
        ].join(' ').toLowerCase();

        // Check for spam
        const spamFilter = this.contentFilters.get('spam');
        for (const keyword of spamFilter.keywords) {
            if (textToCheck.includes(keyword.toLowerCase())) {
                result.score += 10;
                result.issues.push(`Spam keyword detected: ${keyword}`);
            }
        }

        // Check URL patterns
        for (const pattern of spamFilter.urlPatterns) {
            if (pattern.test(textToCheck)) {
                result.score += 20;
                result.issues.push('Suspicious URL pattern detected');
            }
        }

        // Check for inappropriate content
        const inappropriateFilter = this.contentFilters.get('inappropriate');
        for (const keyword of inappropriateFilter.keywords) {
            if (textToCheck.includes(keyword.toLowerCase())) {
                result.score += 30;
                result.issues.push(`Inappropriate content detected: ${keyword}`);
            }
        }

        for (const pattern of inappropriateFilter.patterns) {
            if (pattern.test(textToCheck)) {
                result.score += 25;
                result.issues.push('Inappropriate content pattern detected');
            }
        }

        // Determine if content should be blocked
        result.allowed = result.score < 50; // Block if score >= 50

        return result;
    }

    /**
     * Generate secure API token
     * @param {string} userId - User ID
     * @param {Array} permissions - Token permissions
     * @param {number} expiresIn - Expiration time in milliseconds
     * @returns {string} Generated token
     */
    generateApiToken(userId, permissions = ['read'], expiresIn = 3600000) {
        const token = this.generateSecureToken();
        const expiresAt = Date.now() + expiresIn;

        this.apiTokens.set(token, {
            userId,
            permissions,
            expiresAt,
            createdAt: Date.now()
        });

        return token;
    }

    /**
     * Validate API token
     * @param {string} token - Token to validate
     * @param {string} requiredPermission - Required permission
     * @returns {Object} Validation result
     */
    validateApiToken(token, requiredPermission = null) {
        const tokenData = this.apiTokens.get(token);

        if (!tokenData) {
            return { valid: false, reason: 'Invalid token' };
        }

        if (Date.now() > tokenData.expiresAt) {
            this.apiTokens.delete(token);
            return { valid: false, reason: 'Token expired' };
        }

        if (requiredPermission && !tokenData.permissions.includes(requiredPermission)) {
            return { valid: false, reason: 'Insufficient permissions' };
        }

        return {
            valid: true,
            userId: tokenData.userId,
            permissions: tokenData.permissions
        };
    }

    /**
     * Revoke API token
     * @param {string} token - Token to revoke
     * @returns {boolean} Success status
     */
    revokeApiToken(token) {
        return this.apiTokens.delete(token);
    }

    /**
     * Generate secure random token
     * @private
     */
    generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Cleanup expired tokens
     * @private
     */
    cleanupTokens() {
        const now = Date.now();

        for (const [token, data] of this.apiTokens.entries()) {
            if (now > data.expiresAt) {
                this.apiTokens.delete(token);
            }
        }
    }

    /**
     * Get security metrics
     * @returns {Object} Security metrics
     */
    getSecurityMetrics() {
        return {
            activeRateLimits: this.rateLimits.size,
            activeTokens: this.apiTokens.size,
            totalRequests: Array.from(this.rateLimits.values())
                .reduce((total, data) => total + data.count, 0)
        };
    }
}

// Create singleton instance
const instagramSecurityService = new InstagramSecurityService();

// Setup periodic cleanup
setInterval(() => {
    instagramSecurityService.cleanupTokens();
}, 300000); // Cleanup every 5 minutes

export default instagramSecurityService;
