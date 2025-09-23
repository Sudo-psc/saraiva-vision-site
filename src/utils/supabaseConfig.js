/**
 * Supabase Configuration Utility
 * Provides helper functions to check if Supabase is properly configured
 */

/**
 * Check if Supabase environment variables are configured
 * @returns {boolean} True if Supabase is properly configured
 */
export function isSupabaseConfigured() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Check if Supabase admin client is configured
 * @returns {boolean} True if Supabase admin is properly configured
 */
export function isSupabaseAdminConfigured() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    return !!(supabaseUrl && supabaseServiceKey);
}

/**
 * Get Supabase configuration status
 * @returns {object} Configuration status object
 */
export function getSupabaseConfigStatus() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    return {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!supabaseServiceKey,
        isClientConfigured: !!(supabaseUrl && supabaseAnonKey),
        isAdminConfigured: !!(supabaseUrl && supabaseServiceKey),
        isFullyConfigured: !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey)
    };
}

/**
 * Log Supabase configuration status (for development)
 */
export function logSupabaseConfigStatus() {
    if (import.meta.env.DEV) {
        const status = getSupabaseConfigStatus();
        console.group('Supabase Configuration Status');
        console.log('Client configured:', status.isClientConfigured);
        console.log('Admin configured:', status.isAdminConfigured);
        console.log('Fully configured:', status.isFullyConfigured);

        if (!status.isClientConfigured) {
            console.warn('Missing Supabase client configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        }

        if (!status.isAdminConfigured) {
            console.warn('Missing Supabase admin configuration. Set VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file for admin features.');
        }

        console.groupEnd();
    }
}

export default {
    isSupabaseConfigured,
    isSupabaseAdminConfigured,
    getSupabaseConfigStatus,
    logSupabaseConfigStatus
};