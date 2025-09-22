/**
 * Instagram Configuration Validator Service
 * Provides comprehensive validation for Instagram configuration settings
 */

class InstagramConfigValidator {
    constructor() {
        this.validationRules = new Map();
        this.customValidators = new Map();
        this.validationCache = new Map();

        // Initialize default validation rules
        this.initializeDefaultRules();
    }

    /**
     * Initialize default validation rules
     */
    initializeDefaultRules() {
        // Display settings validation
        this.addRule('maxPosts', {
            type: 'number',
            min: 1,
            max: 20,
            required: true,
            message: 'Number of posts must be between 1 and 20'
        });

        this.addRule('layout', {
            type: 'string',
            enum: ['grid', 'carousel', 'list'],
            required: true,
            message: 'Layout must be one of: grid, carousel, list'
        });

        this.addRule('showStats', {
            type: 'boolean',
            required: true,
            message: 'Show stats must be a boolean value'
        });

        this.addRule('showCaptions', {
            type: 'boolean',
            required: true,
            message: 'Show captions must be a boolean value'
        });

        this.addRule('captionLength', {
            type: 'number',
            min: 50,
            max: 300,
            required: true,
            message: 'Caption length must be between 50 and 300 characters'
        });

        // Content filtering validation
        this.addRule('hashtags', {
            type: 'array',
            items: { type: 'string', pattern: /^[a-zA-Z0-9_]+$/ },
            maxItems: 20,
            required: true,
            message: 'Hashtags must be an array of valid hashtag strings (max 20)'
        });

        this.addRule('excludeHashtags', {
            type: 'array',
            items: { type: 'string', pattern: /^[a-zA-Z0-9_]+$/ },
            maxItems: 20,
            required: true,
            message: 'Exclude hashtags must be an array of valid hashtag strings (max 20)'
        });

        this.addRule('contentTypes', {
            type: 'array',
            items: { type: 'string', enum: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'] },
            minItems: 1,
            required: true,
            message: 'At least one content type must be selected'
        });

        this.addRule('minLikes', {
            type: 'number',
            min: 0,
            max: 1000000,
            required: true,
            message: 'Minimum likes must be between 0 and 1,000,000'
        });

        // Appearance validation
        this.addRule('theme', {
            type: 'string',
            enum: ['light', 'dark', 'auto'],
            required: true,
            message: 'Theme must be one of: light, dark, auto'
        });

        this.addRule('colorScheme', {
            type: 'string',
            enum: ['default', 'brand', 'custom'],
            required: true,
            message: 'Color scheme must be one of: default, brand, custom'
        });

        this.addRule('borderRadius', {
            type: 'string',
            enum: ['none', 'small', 'medium', 'large'],
            required: true,
            message: 'Border radius must be one of: none, small, medium, large'
        });

        this.addRule('spacing', {
            type: 'string',
            enum: ['compact', 'medium', 'spacious'],
            required: true,
            message: 'Spacing must be one of: compact, medium, spacious'
        });

        // Custom colors validation
        this.addRule('customColors', {
            type: 'object',
            properties: {
                primary: { type: 'string', pattern: /^#[0-9A-F]{6}$/i },
                secondary: { type: 'string', pattern: /^#[0-9A-F]{6}$/i },
                background: { type: 'string', pattern: /^#[0-9A-F]{6}$/i },
                text: { type: 'string', pattern: /^#[0-9A-F]{6}$/i },
                border: { type: 'string', pattern: /^#[0-9A-F]{6}$/i }
            },
            required: true,
            message: 'Custom colors must be valid hex color codes'
        });

        // Performance validation
        this.addRule('lazyLoading', {
            type: 'boolean',
            required: true,
            message: 'Lazy loading must be a boolean value'
        });

        this.addRule('imageOptimization', {
            type: 'boolean',
            required: true,
            message: 'Image optimization must be a boolean value'
        });

        this.addRule('cacheEnabled', {
            type: 'boolean',
            required: true,
            message: 'Cache enabled must be a boolean value'
        });

        this.addRule('refreshInterval', {
            type: 'number',
            min: 60000, // 1 minute
            max: 86400000, // 24 hours
            required: true,
            message: 'Refresh interval must be between 1 minute and 24 hours'
        });

        // Accessibility validation
        this.addRule('highContrast', {
            type: 'boolean',
            required: true,
            message: 'High contrast must be a boolean value'
        });

        this.addRule('reducedMotion', {
            type: 'boolean',
            required: true,
            message: 'Reduced motion must be a boolean value'
        });

        this.addRule('altTextEnabled', {
            type: 'boolean',
            required: true,
            message: 'Alt text enabled must be a boolean value'
        });

        this.addRule('keyboardNavigation', {
            type: 'boolean',
            required: true,
            message: 'Keyboard navigation must be a boolean value'
        });

        // Add custom validators
        this.addCustomValidator('colorContrast', this.validateColorContrast.bind(this));
        this.addCustomValidator('hashtagConflicts', this.validateHashtagConflicts.bind(this));
        this.addCustomValidator('performanceImpact', this.validatePerformanceImpact.bind(this));
        this.addCustomValidator('accessibilityCompliance', this.validateAccessibilityCompliance.bind(this));
    }

    /**
     * Add a validation rule
     */
    addRule(field, rule) {
        this.validationRules.set(field, rule);
    }

    /**
     * Add a custom validator
     */
    addCustomValidator(name, validator) {
        this.customValidators.set(name, validator);
    }

    /**
     * Validate configuration
     */
    validate(config, options = {}) {
        const { skipCache = false, includeWarnings = true } = options;

        // Check cache first
        const cacheKey = JSON.stringify(config);
        if (!skipCache && this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey);
        }

        const errors = [];
        const warnings = [];

        // Validate each field against its rules
        for (const [field, rule] of this.validationRules) {
            const fieldErrors = this.validateField(field, config[field], rule, config);
            errors.push(...fieldErrors);
        }

        // Run custom validators
        for (const [name, validator] of this.customValidators) {
            try {
                const result = validator(config);
                if (result.errors) {
                    errors.push(...result.errors);
                }
                if (includeWarnings && result.warnings) {
                    warnings.push(...result.warnings);
                }
            } catch (error) {
                console.warn(`Custom validator ${name} failed:`, error);
            }
        }

        const result = {
            isValid: errors.length === 0,
            errors: [...new Set(errors)], // Remove duplicates
            warnings: includeWarnings ? [...new Set(warnings)] : [],
            timestamp: Date.now()
        };

        // Cache result
        this.validationCache.set(cacheKey, result);

        // Clean cache if it gets too large
        if (this.validationCache.size > 100) {
            const oldestKey = this.validationCache.keys().next().value;
            this.validationCache.delete(oldestKey);
        }

        return result;
    }

    /**
     * Validate a single field
     */
    validateField(fieldName, value, rule, fullConfig = {}) {
        const errors = [];

        // Check if field is required
        if (rule.required && (value === undefined || value === null)) {
            errors.push(`${fieldName} is required`);
            return errors;
        }

        // Skip validation if value is undefined/null and not required
        if (value === undefined || value === null) {
            return errors;
        }

        // Type validation
        if (rule.type) {
            if (!this.validateType(value, rule.type)) {
                errors.push(`${fieldName} must be of type ${rule.type}`);
                return errors;
            }
        }

        // Enum validation
        if (rule.enum && !rule.enum.includes(value)) {
            errors.push(`${fieldName} must be one of: ${rule.enum.join(', ')}`);
        }

        // Number validations
        if (rule.type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                errors.push(`${fieldName} must be at least ${rule.min}`);
            }
            if (rule.max !== undefined && value > rule.max) {
                errors.push(`${fieldName} must be at most ${rule.max}`);
            }
        }

        // String validations
        if (rule.type === 'string') {
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${fieldName} format is invalid`);
            }
            if (rule.minLength !== undefined && value.length < rule.minLength) {
                errors.push(`${fieldName} must be at least ${rule.minLength} characters`);
            }
            if (rule.maxLength !== undefined && value.length > rule.maxLength) {
                errors.push(`${fieldName} must be at most ${rule.maxLength} characters`);
            }
        }

        // Array validations
        if (rule.type === 'array') {
            if (rule.minItems !== undefined && value.length < rule.minItems) {
                errors.push(`${fieldName} must have at least ${rule.minItems} items`);
            }
            if (rule.maxItems !== undefined && value.length > rule.maxItems) {
                errors.push(`${fieldName} must have at most ${rule.maxItems} items`);
            }
            if (rule.items) {
                value.forEach((item, index) => {
                    const itemErrors = this.validateField(`${fieldName}[${index}]`, item, rule.items, fullConfig);
                    errors.push(...itemErrors);
                });
            }
        }

        // Object validations
        if (rule.type === 'object' && rule.properties) {
            Object.entries(rule.properties).forEach(([prop, propRule]) => {
                const propErrors = this.validateField(`${fieldName}.${prop}`, value[prop], propRule, fullConfig);
                errors.push(...propErrors);
            });
        }

        // Custom message override
        if (errors.length > 0 && rule.message) {
            return [rule.message];
        }

        return errors;
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
     * Custom validator: Color contrast
     */
    validateColorContrast(config) {
        const errors = [];
        const warnings = [];

        if (config.colorScheme === 'custom' && config.customColors) {
            const { primary, background, text } = config.customColors;

            if (primary && background) {
                const contrast = this.calculateContrast(primary, background);
                if (contrast < 3) {
                    errors.push('Primary and background colors have insufficient contrast (minimum 3:1)');
                } else if (contrast < 4.5) {
                    warnings.push('Primary and background colors have low contrast (recommended 4.5:1)');
                }
            }

            if (text && background) {
                const contrast = this.calculateContrast(text, background);
                if (contrast < 4.5) {
                    errors.push('Text and background colors have insufficient contrast (minimum 4.5:1)');
                } else if (contrast < 7) {
                    warnings.push('Text and background colors have moderate contrast (recommended 7:1 for AAA)');
                }
            }
        }

        return { errors, warnings };
    }

    /**
     * Custom validator: Hashtag conflicts
     */
    validateHashtagConflicts(config) {
        const errors = [];
        const warnings = [];

        const { hashtags = [], excludeHashtags = [] } = config;

        // Check for conflicts between include and exclude hashtags
        const conflicts = hashtags.filter(tag => excludeHashtags.includes(tag));
        if (conflicts.length > 0) {
            errors.push(`Hashtags cannot be both included and excluded: ${conflicts.join(', ')}`);
        }

        // Warn about too many filters
        if (hashtags.length > 5) {
            warnings.push('Many hashtag filters may result in very few matching posts');
        }

        if (excludeHashtags.length > 10) {
            warnings.push('Many excluded hashtags may unnecessarily complicate filtering');
        }

        return { errors, warnings };
    }

    /**
     * Custom validator: Performance impact
     */
    validatePerformanceImpact(config) {
        const errors = [];
        const warnings = [];

        // Check for performance-impacting combinations
        if (config.maxPosts > 12 && !config.lazyLoading) {
            warnings.push('Displaying many posts without lazy loading may impact performance');
        }

        if (config.refreshInterval < 300000) { // 5 minutes
            warnings.push('Frequent refresh intervals may exceed API rate limits');
        }

        if (!config.imageOptimization && config.maxPosts > 6) {
            warnings.push('Disabling image optimization with many posts may slow loading');
        }

        if (!config.cacheEnabled) {
            warnings.push('Disabling cache may increase API usage and loading times');
        }

        // Check for conflicting settings
        if (config.layout === 'carousel' && config.maxPosts > 10) {
            warnings.push('Carousel layout with many posts may affect user experience');
        }

        return { errors, warnings };
    }

    /**
     * Custom validator: Accessibility compliance
     */
    validateAccessibilityCompliance(config) {
        const errors = [];
        const warnings = [];

        // Check accessibility settings
        if (!config.altTextEnabled) {
            warnings.push('Disabling alt text reduces accessibility for screen readers');
        }

        if (!config.keyboardNavigation) {
            errors.push('Keyboard navigation is required for accessibility compliance');
        }

        // Check color contrast in high contrast mode
        if (config.highContrast && config.colorScheme === 'custom') {
            // Additional contrast requirements for high contrast mode
            const { primary, background } = config.customColors;
            if (primary && background) {
                const contrast = this.calculateContrast(primary, background);
                if (contrast < 7) {
                    warnings.push('High contrast mode requires higher color contrast ratios (7:1)');
                }
            }
        }

        // Check caption settings for accessibility
        if (!config.showCaptions) {
            warnings.push('Hiding captions may reduce content accessibility');
        }

        if (config.captionLength < 100) {
            warnings.push('Short caption length may truncate important accessibility information');
        }

        return { errors, warnings };
    }

    /**
     * Calculate color contrast ratio
     */
    calculateContrast(color1, color2) {
        const getLuminance = (hex) => {
            const rgb = parseInt(hex.slice(1), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;

            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });

            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };

        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);

        return (brightest + 0.05) / (darkest + 0.05);
    }

    /**
     * Validate specific field in real-time
     */
    validateFieldRealtime(fieldName, value, fullConfig = {}) {
        const rule = this.validationRules.get(fieldName);
        if (!rule) {
            return { isValid: true, errors: [], warnings: [] };
        }

        const errors = this.validateField(fieldName, value, rule, fullConfig);

        // Run relevant custom validators
        const warnings = [];
        if (fieldName.includes('color') || fieldName === 'colorScheme') {
            const contrastResult = this.validateColorContrast(fullConfig);
            warnings.push(...contrastResult.warnings);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get validation suggestions
     */
    getValidationSuggestions(config) {
        const suggestions = [];

        // Performance suggestions
        if (config.maxPosts > 8) {
            suggestions.push({
                type: 'performance',
                message: 'Consider enabling lazy loading for better performance',
                action: { lazyLoading: true }
            });
        }

        // Accessibility suggestions
        if (!config.altTextEnabled) {
            suggestions.push({
                type: 'accessibility',
                message: 'Enable alt text for better accessibility',
                action: { altTextEnabled: true }
            });
        }

        // Content suggestions
        if (config.hashtags.length === 0 && config.excludeHashtags.length === 0) {
            suggestions.push({
                type: 'content',
                message: 'Add hashtag filters to curate content',
                action: { hashtags: ['popular', 'trending'] }
            });
        }

        return suggestions;
    }

    /**
     * Clear validation cache
     */
    clearCache() {
        this.validationCache.clear();
    }

    /**
     * Get validation statistics
     */
    getValidationStats() {
        return {
            rulesCount: this.validationRules.size,
            customValidatorsCount: this.customValidators.size,
            cacheSize: this.validationCache.size
        };
    }
}

// Create singleton instance
const instagramConfigValidator = new InstagramConfigValidator();

export default instagramConfigValidator;