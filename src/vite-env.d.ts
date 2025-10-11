/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase Configuration (Public Keys Only)
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // ⚠️ REMOVED: VITE_SUPABASE_SERVICE_ROLE_KEY - NEVER expose admin keys to frontend!
  // Service role keys must ONLY be used in backend (Node.js/Express) via process.env

  // Analytics Configuration
  readonly VITE_POSTHOG_KEY: string
  
  // API Configuration
  readonly VITE_API_URL: string
  
  // Maps Configuration
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  
  // Error Tracking (Sentry removed - using console logging)
  // readonly VITE_SENTRY_DSN: string
  readonly VITE_VERCEL_ENV: string
  readonly VITE_VERCEL_GIT_COMMIT_SHA: string
  
  // Feature Flags
  readonly VITE_HYPERTUNE_TOKEN: string
  readonly VITE_EXPERIMENTATION_CONFIG: string
  readonly VITE_EXPERIMENTATION_CONFIG_ITEM_KEY: string
  
  // Security
  readonly VITE_ENCRYPTION_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}