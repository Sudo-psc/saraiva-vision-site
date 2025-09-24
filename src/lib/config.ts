/**
 * Centralized configuration module for environment variables
 * Validates and provides type-safe access to all VITE_ environment variables
 */

interface AppConfig {
    // Core URLs
    apiBaseUrl: string;
    wordpressUrl: string;
    wordpressGraphqlUrl: string;

    // Supabase
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceKey?: string;

    // Google Services
    googleMapsApiKey: string;
    googlePlaceId: string;
    recaptchaSiteKey: string;

    // Analytics & Tracking
    posthogKey: string;
    posthogHost: string;
    sentryDsn?: string;

    // Social Media
    spotifyShowId: string;
    instagramAccessToken?: string;
    instagramUserId?: string;

    // Vercel Environment
    vercelEnv: string;
    vercelUrl?: string;
    vercelBranchUrl?: string;

    // Feature Flags
    hypertuneToken?: string;
    experimentationConfig?: string;
    experimentationConfigItemKey?: string;

    // Security
    encryptionKey?: string;

    // Environment info
    isDevelopment: boolean;
    isProduction: boolean;
    isPreview: boolean;
}

/**
 * Validates if a value is a placeholder or invalid
 */
function isPlaceholder(value?: string): boolean {
    if (!value) return true;

    const placeholderPatterns = [
        'template-blog-webapp-nextjs.git',
        'contentful',
        'your-api-key-here',
        'your-domain-here',
        'localhost:3000',
        'example.com',
        'placeholder'
    ];

    return placeholderPatterns.some(pattern =>
        value.toLowerCase().includes(pattern.toLowerCase())
    );
}

/**
 * Validates URL format
 */
function isValidUrl(value: string, allowLocalhost = false): boolean {
    try {
        const url = new URL(value);
        if (!allowLocalhost && url.hostname === 'localhost') {
            return false;
        }
        return url.protocol === 'https:' || (allowLocalhost && url.protocol === 'http:');
    } catch {
        return false;
    }
}

/**
 * Validates API key format (basic check)
 */
function isValidApiKey(value: string, minLength = 10): boolean {
    return value.length >= minLength && !isPlaceholder(value);
}

/**
 * Gets and validates environment configuration
 */
function getAppConfig(): AppConfig {
    const isDev = import.meta.env.DEV;
    const vercelEnv = import.meta.env.VITE_VERCEL_ENV || 'development';

    // Core URLs
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://31.97.129.78:3001/api';
    const wordpressUrl = import.meta.env.VITE_WORDPRESS_API_URL || 'https://cms.saraivavision.com.br';
    const wordpressGraphqlUrl = import.meta.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT || 'https://cms.saraivavision.com.br/graphql';

    // Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    // Google Services
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const googlePlaceId = import.meta.env.VITE_GOOGLE_PLACE_ID || 'ChIJVUKww7WRugARF7u2lAe7BeE';
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

    // Analytics
    const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || import.meta.env.VITE_POSTHOG_KEY || '';
    const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || import.meta.env.VITE_POSTHOG_HOST || 'https://analytics.saraivavision.com.br';
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

    // Social Media
    const spotifyShowId = import.meta.env.VITE_SPOTIFY_SHOW_ID || '6sHIG7HbhF1w5O63CTtxwV';
    const instagramAccessToken = import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN;
    const instagramUserId = import.meta.env.VITE_INSTAGRAM_USER_ID;

    // Vercel
    const vercelUrl = import.meta.env.VITE_VERCEL_URL;
    const vercelBranchUrl = import.meta.env.VITE_VERCEL_BRANCH_URL;

    // Feature Flags
    const hypertuneToken = import.meta.env.VITE_HYPERTUNE_TOKEN;
    const experimentationConfig = import.meta.env.VITE_EXPERIMENTATION_CONFIG;
    const experimentationConfigItemKey = import.meta.env.VITE_EXPERIMENTATION_CONFIG_ITEM_KEY;

    // Security
    const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;

    // Validation errors
    const errors: string[] = [];

    // Validate critical URLs
    if (isPlaceholder(apiBaseUrl)) {
        errors.push('VITE_API_BASE_URL contains placeholder value');
    } else if (!isValidUrl(apiBaseUrl, isDev)) {
        errors.push('VITE_API_BASE_URL is not a valid HTTPS URL');
    }

    if (isPlaceholder(wordpressUrl)) {
        errors.push('VITE_WORDPRESS_API_URL contains placeholder value');
    } else if (!isValidUrl(wordpressUrl, isDev)) {
        errors.push('VITE_WORDPRESS_API_URL is not a valid HTTPS URL');
    }

    if (isPlaceholder(wordpressGraphqlUrl)) {
        errors.push('VITE_WORDPRESS_GRAPHQL_ENDPOINT contains placeholder value');
    } else if (!isValidUrl(wordpressGraphqlUrl, isDev)) {
        errors.push('VITE_WORDPRESS_GRAPHQL_ENDPOINT is not a valid HTTPS URL');
    }

    // Validate Supabase
    if (isPlaceholder(supabaseUrl)) {
        errors.push('VITE_SUPABASE_URL contains placeholder value');
    } else if (!isValidUrl(supabaseUrl)) {
        errors.push('VITE_SUPABASE_URL is not a valid HTTPS URL');
    }

    if (isPlaceholder(supabaseAnonKey)) {
        errors.push('VITE_SUPABASE_ANON_KEY contains placeholder value');
    } else if (!isValidApiKey(supabaseAnonKey, 50)) {
        errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid');
    }

    // Validate Google Services
    if (isPlaceholder(googleMapsApiKey)) {
        errors.push('VITE_GOOGLE_MAPS_API_KEY contains placeholder value');
    } else if (!isValidApiKey(googleMapsApiKey, 20)) {
        errors.push('VITE_GOOGLE_MAPS_API_KEY appears to be invalid');
    }

    if (isPlaceholder(recaptchaSiteKey)) {
        errors.push('VITE_RECAPTCHA_SITE_KEY contains placeholder value');
    } else if (!isValidApiKey(recaptchaSiteKey, 20)) {
        errors.push('VITE_RECAPTCHA_SITE_KEY appears to be invalid');
    }

    // Validate Analytics
    if (isPlaceholder(posthogKey)) {
        errors.push('VITE_POSTHOG_KEY contains placeholder value');
    } else if (!isValidApiKey(posthogKey, 20)) {
        errors.push('VITE_POSTHOG_KEY appears to be invalid');
    }

    if (isPlaceholder(posthogHost)) {
        errors.push('VITE_POSTHOG_HOST contains placeholder value');
    } else if (!isValidUrl(posthogHost)) {
        errors.push('VITE_POSTHOG_HOST is not a valid HTTPS URL');
    }

    // Handle validation errors
    if (errors.length > 0) {
        const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;

        if (isDev) {
            console.warn('⚠️ Configuration Issues Detected:');
            errors.forEach(error => console.warn(`  - ${error}`));
            console.warn('Please check your .env file and Vercel environment variables.');
        } else {
            // In production, log error but don't break the app
            console.error('Configuration validation failed:', errors);
        }
    }

    return {
        // Core URLs
        apiBaseUrl,
        wordpressUrl,
        wordpressGraphqlUrl,

        // Supabase
        supabaseUrl,
        supabaseAnonKey,
        supabaseServiceKey,

        // Google Services
        googleMapsApiKey,
        googlePlaceId,
        recaptchaSiteKey,

        // Analytics & Tracking
        posthogKey,
        posthogHost,
        sentryDsn,

        // Social Media
        spotifyShowId,
        instagramAccessToken,
        instagramUserId,

        // Vercel Environment
        vercelEnv,
        vercelUrl,
        vercelBranchUrl,

        // Feature Flags
        hypertuneToken,
        experimentationConfig,
        experimentationConfigItemKey,

        // Security
        encryptionKey,

        // Environment info
        isDevelopment: vercelEnv === 'development' || isDev,
        isProduction: vercelEnv === 'production',
        isPreview: vercelEnv === 'preview'
    };
}

// Export the configuration
export const appConfig = getAppConfig();

// Export validation functions for testing
export { isPlaceholder, isValidUrl, isValidApiKey };

// Log configuration in development
if (appConfig.isDevelopment) {
    console.log('🔧 App Configuration:', {
        environment: appConfig.vercelEnv,
        apiBaseUrl: appConfig.apiBaseUrl,
        wordpressUrl: appConfig.wordpressUrl,
        supabaseConfigured: !!appConfig.supabaseUrl,
        googleMapsConfigured: !!appConfig.googleMapsApiKey,
        posthogConfigured: !!appConfig.posthogKey,
        recaptchaConfigured: !!appConfig.recaptchaSiteKey
    });
}