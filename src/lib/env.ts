import { env } from '@/utils/env';
/**
 * Environment Configuration for Saraiva Vision
 * Centralized environment variable management with proper Vite support
 */

// Vite environment variables (client-side)
export const VITE_ENV = {
  // Vercel deployment info
  VERCEL_ENV: env.VITE_VERCEL_ENV ?? 'development',
  VERCEL_URL: env.VITE_VERCEL_URL,
  VERCEL_BRANCH_URL: env.VITE_VERCEL_BRANCH_URL,

  // Google services
  GOOGLE_MAPS_API_KEY: env.VITE_GOOGLE_MAPS_API_KEY,
  GOOGLE_PLACES_API_KEY: env.VITE_GOOGLE_PLACES_API_KEY,
  GOOGLE_PLACE_ID: env.VITE_GOOGLE_PLACE_ID,

  // Supabase
  SUPABASE_URL: env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,

  // Analytics
  POSTHOG_KEY: env.VITE_POSTHOG_KEY,
  POSTHOG_HOST: env.VITE_POSTHOG_HOST,

  // reCAPTCHA
  RECAPTCHA_SITE_KEY: env.VITE_RECAPTCHA_SITE_KEY,

  // API Configuration
  API_BASE_URL: env.VITE_API_BASE_URL,
  WORDPRESS_URL: env.VITE_WORDPRESS_URL,

  // Site configuration
  SITE_URL: env.VITE_SITE_URL,
} as const;

/**
 * Get deployment URL with proper protocol
 */
export function getDeploymentUrl(): string {
  if (VITE_ENV.VERCEL_URL) {
    return `https://${VITE_ENV.VERCEL_URL}`;
  }
  if (VITE_ENV.VERCEL_BRANCH_URL) {
    return `https://${VITE_ENV.VERCEL_BRANCH_URL}`;
  }
  return VITE_ENV.SITE_URL || 'http://localhost:3002';
}

/**
 * Get API base URL for backend calls
 */
export function getApiBaseUrl(): string {
  // In production, use VPS backend
  if (VITE_ENV.VERCEL_ENV === 'production') {
    return VITE_ENV.API_BASE_URL || 'https://31.97.129.78';
  }

  // In preview/development, use current deployment or localhost
  const deploymentUrl = getDeploymentUrl();
  return deploymentUrl.startsWith('http') ? deploymentUrl : `https://${deploymentUrl}`;
}

/**
 * Construct absolute URL for internal resources
 */
export function absUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const baseUrl = getDeploymentUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Construct backend API URL
 */
export function apiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Check if we're in a specific environment
 */
export const isProduction = VITE_ENV.VERCEL_ENV === 'production';
export const isPreview = VITE_ENV.VERCEL_ENV === 'preview';
export const isDevelopment = VITE_ENV.VERCEL_ENV === 'development';

/**
 * Validate required environment variables
 */
export function validateEnvironment(): string[] {
  const errors: string[] = [];

  const required = {
    'VITE_GOOGLE_PLACE_ID': VITE_ENV.GOOGLE_PLACE_ID,
    'VITE_GOOGLE_MAPS_API_KEY': VITE_ENV.GOOGLE_MAPS_API_KEY,
    'VITE_SUPABASE_URL': VITE_ENV.SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': VITE_ENV.SUPABASE_ANON_KEY,
  };

  for (const [key, value] of Object.entries(required)) {
    if (!value || value === `your_${key.toLowerCase()}_here`) {
      errors.push(`Missing or placeholder value for ${key}`);
    }
  }

  return errors;
}

// Log environment validation on module load (development only)
if (isDevelopment) {
  const errors = validateEnvironment();
  if (errors.length > 0) {
    console.warn('Environment validation errors:', errors);
  }
}