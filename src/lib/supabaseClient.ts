/**
 * Centralized Supabase Client - Singleton Pattern
 * Prevents multiple GoTrueClient instances and provides fallback for logging
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

// Singleton instances
let clientInstance: SupabaseClient<Database> | null = null;
let adminInstance: SupabaseClient<Database> | null = null;

/**
 * Validate Supabase URL structure
 */
function isValidHttpUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get Supabase client for frontend operations (with RLS)
 * Implements singleton pattern to avoid multiple GoTrueClient instances
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  // Return existing instance if available
  if (clientInstance) {
    return clientInstance;
  }

  // Get environment variables (empty in production to prevent inlining)
  const supabaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_SUPABASE_URL || '');
  const supabaseAnonKey = import.meta.env.PROD ? '' : (import.meta.env.VITE_SUPABASE_ANON_KEY || '');

  // Validate configuration
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
      console.warn(
        'Supabase client not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'
      );
    }
    return null;
  }

  // Validate URL structure
  if (!isValidHttpUrl(supabaseUrl)) {
    if (import.meta.env.DEV) {
      console.error('Invalid Supabase URL:', supabaseUrl);
    }
    return null;
  }

  // Check for placeholder values
  if (
    supabaseUrl.includes('your_supabase') ||
    supabaseAnonKey.includes('your_supabase')
  ) {
    if (import.meta.env.DEV) {
      console.warn('Supabase configuration contains placeholder values');
    }
    return null;
  }

  // Create and cache instance
  try {
    clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-client-info': 'saraiva-vision-frontend',
        },
      },
    });

    if (import.meta.env.DEV) {
      console.log('✅ Supabase client initialized successfully');
    }

    return clientInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Get Supabase admin client for backend operations (bypasses RLS)
 * Should only be used server-side or in secure contexts
 */
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  // Return existing instance if available
  if (adminInstance) {
    return adminInstance;
  }

  // Get environment variables (empty in production to prevent inlining)
  const supabaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_SUPABASE_URL || '');
  const supabaseServiceKey = ''; // Service role key removed - not exposed to frontend

  // Validate configuration
  if (!supabaseUrl || !supabaseServiceKey) {
    if (import.meta.env.DEV) {
      console.warn(
        'Supabase admin not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY'
      );
    }
    return null;
  }

  // Validate URL structure
  if (!isValidHttpUrl(supabaseUrl)) {
    if (import.meta.env.DEV) {
      console.error('Invalid Supabase URL for admin:', supabaseUrl);
    }
    return null;
  }

  // Check for placeholder values
  if (
    supabaseUrl.includes('your_supabase') ||
    supabaseServiceKey.includes('your_supabase')
  ) {
    if (import.meta.env.DEV) {
      console.warn('Supabase admin configuration contains placeholder values');
    }
    return null;
  }

  // Create and cache instance
  try {
    adminInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'x-client-info': 'saraiva-vision-admin',
        },
      },
    });

    if (import.meta.env.DEV) {
      console.log('✅ Supabase admin client initialized successfully');
    }

    return adminInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase admin client:', error);
    return null;
  }
}

/**
 * Reset singleton instances (useful for testing)
 */
export function resetSupabaseClients(): void {
  clientInstance = null;
  adminInstance = null;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  // Return false in production - use runtime config instead
  if (import.meta.env.PROD) return false;

  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return !!(
    url &&
    key &&
    !url.includes('your_supabase') &&
    !key.includes('your_supabase') &&
    isValidHttpUrl(url)
  );
}

// Export default instance for backward compatibility
// This maintains existing import patterns while using singleton
// Note: These will be null initially and should be replaced with async getSupabaseClient() calls
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdmin();

// Add warning about deprecated usage
if (import.meta.env.DEV) {
  console.warn('⚠️ Direct supabase export is deprecated. Use getSupabaseClient() async function instead.');
}