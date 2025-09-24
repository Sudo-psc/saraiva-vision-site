/**
 * Instagram Input Validator Service
 * Provides comprehensive input validation and sanitization for Instagram API requests
 */

class InstagramInputValidator {
    constructor() {
        this.validationRules = new Map();
        this.sanitizationRules = new Map();
        this.validationCache = new Map();

        // Initialize default validation rules
        this.initializeValidationRules();
        this.initializeSanitizationRules();
    }

    /**
     * Initialize validation rules
     */
    initializeValidationRules() {
        // Instagram API parameter validation
        this.addValidationRule('access_token', {
            type: 'string',
            required: true,
            minLength: 50,
            maxLength: 500,
            pattern: /^[A-Za-z0-9_-]+$/,
            sanitize: true
        });

        this.addValidationRule('user_id', {
            type: 'string',
            required: false,
            pattern: /^\d+$/,
            maxLength: 20
        });

        this.addValidationRule('fields', {
            type: 'string',
            required: false,
            maxLength: 500,
            allowedValues: [
                'id', 'username', 'account_type', 'media_count',
                'caption', 'media_type', 'media_url', 'permalink',
                'thumbnail_url', 'timestamp', 'like_count', 'comments_count'
            ],
            customValidator: this.validateFieldsList.bind(this)
        });

        this.addValidationRule('limit', {
            type: 'number',
            required: false,
            min: 1,
            max: 25,
            default: 25
        });

        this.addValidationRule('after', {
            type: 'string',
            required: false,
            pattern: /^[A-Za-z0-9_=-]+$/,
            maxLength: 200
        });

        this.addValidationRule('before', {
            type: 'string',
            required: false,
            pattern: /^[A-Za-z0-9_=-]+$/,
            maxLength: 200
        });

        // Configuration validation
        this.addValidationRule('hashtag', {
            type: 'string',
            required: false,
            minLength: 1,
            maxLength: 100,
            pattern: /^[a-zA-Z0-9_]+$/,
            customValidator: this.validateHashtag.bind(this)
        });

        this.addValidationRule('caption', {
            type: 'string',
            required: false,
            maxLength: 2200, // Instagram's caption limit
            customValidator: this.validateCaption.bind(this)
        });

        this.addValidationRule('media_url', {
            type: 'string',
            required: false,
            maxLength: 2048,
            customValidator: this.validateMediaUrl.bind(this)
        });

        // Security-related validation
        this.addValidationRule('callback_url', {
            type: 'string',
            required: false,
            maxLength: 2048,
            customValidator: this.validateCallbackUrl.bind(this)
        });

        this.addValidationRule('state', {
            type: 'string',
            required: false,
            maxLength: 256,
            pattern: /^[A-Za-z0-9_-]+$/
        });
    }

    /**
     * Initialize sanitization rules
     */
    initializeSanitizationRules() {
        // HTML sanitization
        this.addSanitizationRule('html', {
            allowedTags: [],
            allowedAttributes: {},
            stripTags: true,
            decodeEntities: true
        });

        // URL sanitization
        this.addSanitizationRule('url', {
            protocols: ['http', 'https'],
            removeQueryParams: ['access_token', 'client_secret'],
            maxLength: 2048
        });

        // Text sanitization
        this.addSanitizationRule('text', {
            maxLength: 2200,
            removeControlChars: true,
            normalizeWhitespace: true,
            removeEmojis: false
        });

        // Hashtag sanitization
        this.addSanitizationRule('hashtag', {
            removeHash: true,
            toLowerCase: true,
            removeSpaces: true,
            maxLength: 100
        });
    }

    /**
     * Add validation rule
     */
    addValidationRule(field, rule) {
        this.validationRules.set(field, rule);
    }

    /**
     * Add sanitization rule
     */
    addSanitizationRule(type, rule) {
        this.sanitizationRules.set(type, rule);
    }

    /**
     * Validate input data
     */
    validate(data, context = {}) {
        const { strict = true, sanitize = true } = context;
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            sanitizedData: sanitize ? {} : null
        };

        if (!data || typeof data !== 'object') {
            result.isValid = false;
            result.errors.push('Input data must be an object');
            return result;
        }

        // Validate each field
        for (const [field, value] of Object.entries(data)) {
            const rule = this.validationRules.get(field);

            if (!rule && strict) {
                result.warnings.push(`Unknown field: ${field}`);
                continue;
            }

            if (!rule) {
                // No rule defined, pass through if not strict
                if (sanitize) {
                    result.sanitizedData[field] = value;
                }
                continue;
            }

            const fieldResult = this.validateField(field, value, rule);

            if (!fieldResult.isValid) {
                result.isValid = false;
                result.errors.push(...fieldResult.errors);
            }

            if (fieldResult.warnings.length > 0) {
                result.warnings.push(...fieldResult.warnings);
            }

            if (sanitize) {
                result.sanitizedData[field] = fieldResult.sanitizedValue;
            }
        }

        // Check for required fields
        for (const [field, rule] of this.validationRules) {
            if (rule.required && !(field in data)) {
                result.isValid = false;
                result.errors.push(`Required field missing: ${field}`);
            }
        }

        return result;
    }

    /**
     * Validate a single field
     */
    validateField(field, value, rule) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            sanitizedValue: value
        };

        // Handle null/undefined values
        if (value === null || value === undefined) {
            if (rule.required) {
                result.isValid = false;
                result.errors.push(`${field} is required`);
            } else if (rule.default !== undefined) {
                result.sanitizedValue = rule.default;
            }
            return result;
        }

        // Type validation
        if (rule.type && !this.validateType(value, rule.type)) {
            result.isValid = false;
            result.errors.push(`${field} must be of type ${rule.type}`);
            return result;
        }

        // String validations
        if (rule.type === 'string' && typeof value === 'string') {
            if (rule.minLength && value.length < rule.minLength) {
                result.isValid = false;
                result.errors.push(`${field} must be at least ${rule.minLength} characters`);
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                result.isValid = false;
                result.errors.push(`${field} must be at most ${rule.maxLength} characters`);
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                result.isValid = false;
                result.errors.push(`${field} format is invalid`);
            }

            // Sanitize string
            if (rule.sanitize) {
                result.sanitizedValue = this.sanitizeString(value, field);
            }
        }

        // Number validations
        if (rule.type === 'number' && typeof value === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                result.isValid = false;
                result.errors.push(`${field} must be at least ${rule.min}`);
            }

            if (rule.max !== undefined && value > rule.max) {
                result.isValid = false;
                result.errors.push(`${field} must be at most ${rule.max}`);
            }

            if (!Number.isInteger(value) && rule.integer) {
                result.isValid = false;
                result.errors.push(`${field} must be an integer`);
            }
        }

        // Allowed values validation
        if (rule.allowedValues && !rule.allowedValues.includes(value)) {
            result.isValid = false;
            result.errors.push(`${field} must be one of: ${rule.allowedValues.join(', ')}`);
        }

        // Custom validation
        if (rule.customValidator) {
            try {
                const customResult = rule.customValidator(value, field);
                if (!customResult.isValid) {
                    result.isValid = false;
                    result.errors.push(...customResult.errors);
                }
                if (customResult.warnings) {
                    result.warnings.push(...customResult.warnings);
                }
                if (customResult.sanitizedValue !== undefined) {
                    result.sanitizedValue = customResult.sanitizedValue;
                }
            } catch (error) {
                result.warnings.push(`Custom validation failed for ${field}: ${error.message}`);
            }
        }

        return result;
    }

    /**
     * Validate type
     */
    validateType(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            default:
                return true;
        }
    }

    /**
     * Sanitize string based on context
     */
    sanitizeString(value, context = 'text') {
        let sanitized = value;

        // Remove control characters
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

        // Normalize whitespace
        sanitized = sanitized.replace(/\s+/g, ' ').trim();

        // Context-specific sanitization
        switch (context) {
            case 'access_token':
                sanitized = sanitized.replace(/[^A-Za-z0-9_-]/g, '');
                break;
            case 'hashtag':
                sanitized = sanitized.replace(/^#/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
                break;
            case 'caption':
                sanitized = this.sanitizeCaption(sanitized);
                break;
            case 'media_url':
                sanitized = this.sanitizeUrl(sanitized);
                break;
        }

        return sanitized;
    }

    /**
     * Sanitize caption text
     */
    sanitizeCaption(caption) {
        // Remove potentially dangerous HTML
        let sanitized = caption.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
        sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

        // Remove javascript: and data: URLs
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/data:/gi, '');

        // Limit length
        if (sanitized.length > 2200) {
            sanitized = sanitized.substring(0, 2197) + '...';
        }

        return sanitized;
    }

    /**
     * Sanitize URL
     */
    sanitizeUrl(url) {
        try {
            const urlObj = new URL(url);

            // Only allow http and https
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return '';
            }

            // Remove sensitive query parameters
            urlObj.searchParams.delete('access_token');
            urlObj.searchParams.delete('client_secret');
            urlObj.searchParams.delete('password');

            return urlObj.toString();
        } catch (error) {
            return '';
        }
    }

    /**
     * Custom validator: Fields list
     */
    validateFieldsList(value, field) {
        const result = { isValid: true, errors: [], warnings: [] };

        if (typeof value !== 'string') {
            result.isValid = false;
            result.errors.push(`${field} must be a string`);
            return result;
        }

        const fields = value.split(',').map(f => f.trim());
        const rule = this.validationRules.get('fields');
        const allowedFields = rule.allowedValues;

        const invalidFields = fields.filter(f => !allowedFields.includes(f));
        if (invalidFields.length > 0) {
            result.isValid = false;
            result.errors.push(`Invalid fields: ${invalidFields.join(', ')}`);
        }

        // Sanitize by removing invalid fields
        const validFields = fields.filter(f => allowedFields.includes(f));
        result.sanitizedValue = validFields.join(',');

        return result;
    }

    /**
     * Custom validator: Hashtag
     */
    validateHashtag(value, field) {
        const result = { isValid: true, errors: [], warnings: [] };

        if (typeof value !== 'string') {
            result.isValid = false;
            result.errors.push(`${field} must be a string`);
            return result;
        }

        // Remove # if present
        let hashtag = value.replace(/^#/, '');

        // Check for invalid characters
        if (!/^[a-zA-Z0-9_]+$/.test(hashtag)) {
            result.warnings.push(`${field} contains invalid characters, sanitizing`);
            hashtag = hashtag.replace(/[^a-zA-Z0-9_]/g, '');
        }

        // Check length
        if (hashtag.length === 0) {
            result.isValid = false;
            result.errors.push(`${field} cannot be empty after sanitization`);
        }

        if (hashtag.length > 100) {
            result.warnings.push(`${field} too long, truncating`);
            hashtag = hashtag.substring(0, 100);
        }

        result.sanitizedValue = hashtag.toLowerCase();
        return result;
    }

    /**
     * Custom validator: Caption
     */
    validateCaption(value, field) {
        const result = { isValid: true, errors: [], warnings: [] };

        if (typeof value !== 'string') {
            result.isValid = false;
            result.errors.push(`${field} must be a string`);
            return result;
        }

        // Check for potentially dangerous content
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /data:text\/html/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i
        ];

        const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(value));
        if (hasDangerousContent) {
            result.warnings.push(`${field} contains potentially dangerous content, sanitizing`);
        }

        result.sanitizedValue = this.sanitizeCaption(value);
        return result;
    }

    /**
     * Custom validator: Media URL
     */
    validateMediaUrl(value, field) {
        const result = { isValid: true, errors: [], warnings: [] };

        if (typeof value !== 'string') {
            result.isValid = false;
            result.errors.push(`${field} must be a string`);
            return result;
        }

        try {
            const url = new URL(value);

            // Check protocol
            if (!['http:', 'https:'].includes(url.protocol)) {
                result.isValid = false;
                result.errors.push(`${field} must use http or https protocol`);
            }

            // Check for Instagram/Facebook domains
            const allowedDomains = [
                'instagram.com',
                'cdninstagram.com',
                'fbcdn.net',
                'facebook.com'
            ];

            const isAllowedDomain = allowedDomains.some(domain =>
                url.hostname === domain || url.hostname.endsWith('.' + domain)
            );

            if (!isAllowedDomain) {
                result.warnings.push(`${field} is not from a recognized Instagram domain`);
            }

            result.sanitizedValue = this.sanitizeUrl(value);
        } catch (error) {
            result.isValid = false;
            result.errors.push(`${field} is not a valid URL`);
        }

        return result;
    }

    /**
     * Custom validator: Callback URL
     */
    validateCallbackUrl(value, field) {
        const result = { isValid: true, errors: [], warnings: [] };

        if (typeof value !== 'string') {
            result.isValid = false;
            result.errors.push(`${field} must be a string`);
            return result;
        }

        try {
            const url = new URL(value);

            // Must be HTTPS in production
            if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
                result.isValid = false;
                result.errors.push(`${field} must use HTTPS in production`);
            }

            // Check for localhost in production
            if (url.hostname === 'localhost' && process.env.NODE_ENV === 'production') {
                result.isValid = false;
                result.errors.push(`${field} cannot use localhost in production`);
            }

            result.sanitizedValue = this.sanitizeUrl(value);
        } catch (error) {
            result.isValid = false;
            result.errors.push(`${field} is not a valid URL`);
        }

        return result;
    }

    /**
     * Validate Instagram API request parameters
     */
    validateApiRequest(endpoint, params) {
        const endpointRules = this.getEndpointValidationRules(endpoint);
        const result = this.validate(params, { strict: false, sanitize: true });

        // Add endpoint-specific validation
        if (endpointRules) {
            for (const [param, rule] of Object.entries(endpointRules)) {
                if (params[param] !== undefined) {
                    const paramResult = this.validateField(param, params[param], rule);
                    if (!paramResult.isValid) {
                        result.isValid = false;
                        result.errors.push(...paramResult.errors);
                    }
                }
            }
        }

        return result;
    }

    /**
     * Get validation rules for specific endpoints
     */
    getEndpointValidationRules(endpoint) {
        const rules = {
            '/me': {
                fields: this.validationRules.get('fields')
            },
            '/me/media': {
                fields: this.validationRules.get('fields'),
                limit: this.validationRules.get('limit'),
                after: this.validationRules.get('after'),
                before: this.validationRules.get('before')
            }
        };

        return rules[endpoint] || {};
    }

    /**
     * Sanitize entire object
     */
    sanitizeObject(obj, context = {}) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }

        const sanitized = {};

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value, context[key] || 'text');
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeObject(value, context[key] || {});
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    /**
     * Get validation statistics
     */
    getValidationStats() {
        return {
            validationRules: this.validationRules.size,
            sanitizationRules: this.sanitizationRules.size,
            cacheSize: this.validationCache.size
        };
    }

    /**
     * Clear validation cache
     */
    clearCache() {
        this.validationCache.clear();
    }
}

// Create singleton instance
const instagramInputValidator = new InstagramInputValidator();

export default instagramInputValidator;