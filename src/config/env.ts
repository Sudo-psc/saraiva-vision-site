import { z } from 'zod';

// Environment schema validation
const envSchema = z.object({
  // Google Maps
  VITE_GOOGLE_MAPS_API_KEY: z.string().min(1, 'VITE_GOOGLE_MAPS_API_KEY is required'),

  // Google Business API
  VITE_GOOGLE_BUSINESS_CLIENT_ID: z.string().optional(),
  VITE_GOOGLE_BUSINESS_CLIENT_SECRET: z.string().optional(),
  VITE_GOOGLE_BUSINESS_REFRESH_TOKEN: z.string().optional(),
  VITE_GOOGLE_BUSINESS_LOCATION_ID: z.string().optional(),
  VITE_GOOGLE_BUSINESS_ENCRYPTION_KEY: z.string().optional(),

  // Google Place ID
  VITE_GOOGLE_PLACE_ID: z.string().optional(),

  // Pulse.live WebSocket
  VITE_PULSE_WS_URL: z.string().url().optional(),

  // API Base URL
  VITE_API_BASE: z.string().url().default('http://localhost:3000'),

  // WordPress
  VITE_WORDPRESS_API_URL: z.string().url().optional(),
  VITE_WORDPRESS_GRAPHQL_ENDPOINT: z.string().url().optional(),

  // Instagram
  VITE_INSTAGRAM_ACCESS_TOKEN: z.string().optional(),

  // Resend Email
  VITE_RESEND_API_KEY: z.string().optional(),

  // Sentry
  VITE_SENTRY_DSN: z.string().url().optional(),

  // Site configuration
  VITE_SITE_BASE_URL: z.string().url().optional(),

  // Development flags
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Type inference from schema
export type EnvConfig = z.infer<typeof envSchema>;

// Validate and parse environment variables
function validateEnv(): EnvConfig {
  try {
    // Merge Vite env vars with Node env vars for compatibility
    const envVars = {
      ...import.meta.env,
      ...process.env,
    };

    const parsed = envSchema.parse(envVars);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');

      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

// Validate on module load and export
export const env = validateEnv();

// Helper functions for common env checks
export const isProduction = () => env.NODE_ENV === 'production';
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isTest = () => env.NODE_ENV === 'test';

// Required environment variables for production
const REQUIRED_PROD_VARS = [
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_API_BASE',
] as const;

export function validateProductionEnv(): void {
  if (!isProduction()) return;

  const missing = REQUIRED_PROD_VARS.filter(key => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(', ')}`
    );
  }
}

// Call validation on import
validateProductionEnv();