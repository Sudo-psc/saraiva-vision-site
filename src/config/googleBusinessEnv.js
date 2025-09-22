/**
 * Google Business Environment Configuration
 * Handles environment variables and configuration for Google Business API integration
 */

/**
 * Get environment configuration for Google Business integration
 */
export const getGoogleBusinessEnvConfig = () => {
    return {
        // API Configuration
        apiKey: import.meta.env.VITE_GOOGLE_BUSINESS_API_KEY || null,
        accessToken: import.meta.env.VITE_GOOGLE_BUSINESS_ACCESS_TOKEN || null,
        refreshToken: import.meta.env.VITE_GOOGLE_BUSINESS_REFRESH_TOKEN || null,

        // Location Configuration
        locationId: import.meta.env.VITE_GOOGLE_BUSINESS_LOCATION_ID || null,

        // Security Configuration
        encryptionKey: import.meta.env.VITE_GOOGLE_BUSINESS_ENCRYPTION_KEY || null,

        // Feature Flags
        enableAutoSync: import.meta.env.VITE_GOOGLE_BUSINESS_AUTO_SYNC !== 'false',
        enableCaching: import.meta.env.VITE_GOOGLE_BUSINESS_CACHING !== 'false',
        enableMonitoring: import.meta.env.VITE_GOOGLE_BUSINESS_MONITORING !== 'false',

        // Performance Configuration
        requestTimeout: parseInt(import.meta.env.VITE_GOOGLE_BUSINESS_TIMEOUT) || 10000,
        maxRetries: parseInt(import.meta.env.VITE_GOOGLE_BUSINESS_MAX_RETRIES) || 3,
        rateLimitBuffer: parseInt(import.meta.env.VITE_GOOGLE_BUSINESS_RATE_LIMIT_BUFFER) || 100,

        // Cache Configuration
        cacheDefaultTTL: parseInt(import.meta.env.VITE_GOOGLE_BUSINESS_CACHE_TTL) || 86400, // 24 hours
        maxCachedReviews: parseInt(import.meta.env.VITE_GOOGLE_BUSINESS_MAX_CACHED_REVIEWS) || 50,

        // Sync Configuration
        syncInterval: parseInt(import.meta.env.VITE_GOOGLE_BUSINESS_SYNC_INTERVAL) || 24, // hours

        // Display Configuration
        defaultMaxReviews: parseInt(import.meta.env.VITE_GOOGLE_BUSINESS_DEFAULT_MAX_REVIEWS) || 5,
        defaultMinRating: parseInt(import.meta.env.VITE_GOOGLE_BUSINESS_DEFAULT_MIN_RATING) || 1,

        // Development/Debug Configuration
        isDevelopment: import.meta.env.DEV || false,
        enableDebugLogging: import.meta.env.VITE_GOOGLE_BUSINESS_DEBUG === 'true',
        enableMockData: import.meta.env.VITE_GOOGLE_BUSINESS_MOCK_DATA === 'true'
    };
};

/**
 * Validate environment configuration
 */
export const validateGoogleBusinessEnvConfig = () => {
    const config = getGoogleBusinessEnvConfig();
    const errors = [];
    const warnings = [];

    // Required for production
    if (!config.isDevelopment) {
        if (!config.apiKey) {
            errors.push('VITE_GOOGLE_BUSINESS_API_KEY is required in production');
        }

        if (!config.accessToken) {
            errors.push('VITE_GOOGLE_BUSINESS_ACCESS_TOKEN is required in production');
        }

        if (!config.locationId) {
            errors.push('VITE_GOOGLE_BUSINESS_LOCATION_ID is required in production');
        }

        if (!config.encryptionKey) {
            warnings.push('VITE_GOOGLE_BUSINESS_ENCRYPTION_KEY not set, using generated key');
        }
    }

    // Validate numeric values
    if (config.requestTimeout < 1000 || config.requestTimeout > 60000) {
        warnings.push('VITE_GOOGLE_BUSINESS_TIMEOUT should be between 1000 and 60000ms');
    }

    if (config.maxRetries < 1 || config.maxRetries > 10) {
        warnings.push('VITE_GOOGLE_BUSINESS_MAX_RETRIES should be between 1 and 10');
    }

    if (config.syncInterval < 1 || config.syncInterval > 168) {
        warnings.push('VITE_GOOGLE_BUSINESS_SYNC_INTERVAL should be between 1 and 168 hours');
    }

    if (config.defaultMaxReviews < 1 || config.defaultMaxReviews > 50) {
        warnings.push('VITE_GOOGLE_BUSINESS_DEFAULT_MAX_REVIEWS should be between 1 and 50');
    }

    if (config.defaultMinRating < 1 || config.defaultMinRating > 5) {
        warnings.push('VITE_GOOGLE_BUSINESS_DEFAULT_MIN_RATING should be between 1 and 5');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        config
    };
};

/**
 * Get configuration with fallbacks and validation
 */
export const getValidatedGoogleBusinessConfig = () => {
    const validation = validateGoogleBusinessEnvConfig();

    if (validation.warnings.length > 0) {
        console.warn('Google Business configuration warnings:', validation.warnings);
    }

    if (!validation.isValid) {
        console.error('Google Business configuration errors:', validation.errors);
        throw new Error(`Invalid Google Business configuration: ${validation.errors.join(', ')}`);
    }

    return validation.config;
};

/**
 * Environment configuration template for documentation
 */
export const getEnvTemplate = () => {
    return `
# Google Business API Configuration
VITE_GOOGLE_BUSINESS_API_KEY=your_google_api_key_here
VITE_GOOGLE_BUSINESS_ACCESS_TOKEN=your_oauth_access_token_here
VITE_GOOGLE_BUSINESS_REFRESH_TOKEN=your_oauth_refresh_token_here
VITE_GOOGLE_BUSINESS_LOCATION_ID=accounts/your_account_id/locations/your_location_id

# Security Configuration
VITE_GOOGLE_BUSINESS_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Feature Flags (optional)
VITE_GOOGLE_BUSINESS_AUTO_SYNC=true
VITE_GOOGLE_BUSINESS_CACHING=true
VITE_GOOGLE_BUSINESS_MONITORING=true

# Performance Configuration (optional)
VITE_GOOGLE_BUSINESS_TIMEOUT=10000
VITE_GOOGLE_BUSINESS_MAX_RETRIES=3
VITE_GOOGLE_BUSINESS_RATE_LIMIT_BUFFER=100

# Cache Configuration (optional)
VITE_GOOGLE_BUSINESS_CACHE_TTL=86400
VITE_GOOGLE_BUSINESS_MAX_CACHED_REVIEWS=50

# Sync Configuration (optional)
VITE_GOOGLE_BUSINESS_SYNC_INTERVAL=24

# Display Configuration (optional)
VITE_GOOGLE_BUSINESS_DEFAULT_MAX_REVIEWS=5
VITE_GOOGLE_BUSINESS_DEFAULT_MIN_RATING=1

# Development Configuration (optional)
VITE_GOOGLE_BUSINESS_DEBUG=false
VITE_GOOGLE_BUSINESS_MOCK_DATA=false
`;
};

export default {
    getGoogleBusinessEnvConfig,
    validateGoogleBusinessEnvConfig,
    getValidatedGoogleBusinessConfig,
    getEnvTemplate
};