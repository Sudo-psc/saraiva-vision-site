import { createClient } from '@supabase/supabase-js'
import { ENV, isDevelopment } from '@/config/env'

/**
 * Supabase Configuration Utility
 * Provides helper functions to check if Supabase is properly configured
 */

/**
 * Check if Supabase environment variables are configured
 * @returns {boolean} True if Supabase is properly configured
 */
export function isSupabaseConfigured() {
    return !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
}

/**
 * Get Supabase configuration status
 * @returns {object} Configuration status object
 */
export function getSupabaseConfigStatus() {
    return {
        hasUrl: !!ENV.SUPABASE_URL,
        hasAnonKey: !!ENV.SUPABASE_ANON_KEY,
        isClientConfigured: !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY),
    };
}

/**
 * Log Supabase configuration status (for development)
 */
export function logSupabaseConfigStatus() {
    if (isDevelopment) {
        const status = getSupabaseConfigStatus();
        console.group('Supabase Configuration Status');
        console.log('Client configured:', status.isClientConfigured);

        if (!status.isClientConfigured) {
            console.warn('Missing Supabase client configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        }

        console.groupEnd();
    }
}

// Criar cliente Supabase com configurações seguras
export const supabase = ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY
    ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
    })
    : null;

// Utilitário para verificar se Supabase está disponível
export const isSupabaseAvailable = () => Boolean(supabase);

// Wrapper seguro para operações Supabase
export const safeSupabaseOperation = async (operation) => {
    if (!supabase) {
        if (isDevelopment) {
            console.warn('Supabase não está disponível');
        }
        return { data: null, error: new Error('Supabase não configurado') };
    }

    try {
        return await operation(supabase);
    } catch (error) {
        console.error('Erro na operação Supabase:', error);
        return { data: null, error };
    }
};

export default {
    isSupabaseConfigured,
    isSupabaseAdminConfigured,
    getSupabaseConfigStatus,
    logSupabaseConfigStatus
};