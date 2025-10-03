/**
 * Profile Configuration
 *
 * Centralized configuration for all profile-related settings
 * including UI preferences, accessibility options, and feature flags.
 */

import type {
  UserProfile,
  ProfileConfig,
  ProfileSettings,
  ProfileCookieConfig,
} from './profile-types';

// ============================================================================
// Cookie Configuration
// ============================================================================

export const PROFILE_COOKIE_NAME = 'saraiva_profile_preference';
export const PROFILE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export const DEFAULT_COOKIE_CONFIG: ProfileCookieConfig = {
  name: PROFILE_COOKIE_NAME,
  maxAge: PROFILE_COOKIE_MAX_AGE,
  path: '/',
  httpOnly: false, // Must be accessible to client for UI updates
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

// ============================================================================
// Profile Configurations
// ============================================================================

/**
 * Familiar Profile - Balanced, general audience
 */
const FAMILIAR_CONFIG: ProfileConfig = {
  fontSize: 'base',
  contrast: 'normal',
  animations: 'normal',
  layout: 'standard',
};

/**
 * Jovem Profile - Modern, mobile-first, dynamic
 */
const JOVEM_CONFIG: ProfileConfig = {
  fontSize: 'base',
  contrast: 'normal',
  animations: 'enhanced',
  layout: 'modern',
};

/**
 * Senior Profile - Accessible, simplified, high contrast
 */
const SENIOR_CONFIG: ProfileConfig = {
  fontSize: 'large',
  contrast: 'high',
  animations: 'reduced',
  layout: 'simplified',
};

/**
 * Profile configuration map
 */
export const PROFILE_CONFIGS: Record<UserProfile, ProfileConfig> = {
  familiar: FAMILIAR_CONFIG,
  jovem: JOVEM_CONFIG,
  senior: SENIOR_CONFIG,
};

// ============================================================================
// Profile Settings (UI Display)
// ============================================================================

/**
 * Complete profile settings with metadata
 */
export const PROFILE_SETTINGS: Record<UserProfile, ProfileSettings> = {
  familiar: {
    profile: 'familiar',
    config: FAMILIAR_CONFIG,
    displayName: 'Navegação Familiar',
    description: 'Interface padrão com recursos equilibrados para todos os públicos',
    icon: '👨‍👩‍👧‍👦',
  },
  jovem: {
    profile: 'jovem',
    config: JOVEM_CONFIG,
    displayName: 'Navegação Jovem',
    description: 'Interface moderna e dinâmica otimizada para dispositivos móveis',
    icon: '📱',
  },
  senior: {
    profile: 'senior',
    config: SENIOR_CONFIG,
    displayName: 'Navegação Senior',
    description: 'Interface simplificada com maior contraste, fontes maiores e navegação facilitada',
    icon: '👴',
  },
};

// ============================================================================
// CSS Variable Mappings
// ============================================================================

/**
 * Font size CSS variables for each profile
 */
export const FONT_SIZE_VARS: Record<ProfileConfig['fontSize'], Record<string, string>> = {
  small: {
    '--font-xs': '0.625rem',   // 10px
    '--font-sm': '0.75rem',    // 12px
    '--font-base': '0.875rem', // 14px
    '--font-lg': '1rem',       // 16px
    '--font-xl': '1.125rem',   // 18px
    '--font-2xl': '1.25rem',   // 20px
    '--font-3xl': '1.5rem',    // 24px
  },
  base: {
    '--font-xs': '0.75rem',    // 12px
    '--font-sm': '0.875rem',   // 14px
    '--font-base': '1rem',     // 16px
    '--font-lg': '1.125rem',   // 18px
    '--font-xl': '1.25rem',    // 20px
    '--font-2xl': '1.5rem',    // 24px
    '--font-3xl': '1.875rem',  // 30px
  },
  large: {
    '--font-xs': '0.875rem',   // 14px
    '--font-sm': '1rem',       // 16px
    '--font-base': '1.125rem', // 18px
    '--font-lg': '1.25rem',    // 20px
    '--font-xl': '1.5rem',     // 24px
    '--font-2xl': '1.875rem',  // 30px
    '--font-3xl': '2.25rem',   // 36px
  },
  xlarge: {
    '--font-xs': '1rem',       // 16px
    '--font-sm': '1.125rem',   // 18px
    '--font-base': '1.25rem',  // 20px
    '--font-lg': '1.5rem',     // 24px
    '--font-xl': '1.875rem',   // 30px
    '--font-2xl': '2.25rem',   // 36px
    '--font-3xl': '3rem',      // 48px
  },
};

/**
 * Contrast CSS variables for each profile
 */
export const CONTRAST_VARS: Record<ProfileConfig['contrast'], Record<string, string>> = {
  low: {
    '--contrast-ratio': '3:1',
    '--text-primary': '#666666',
    '--text-secondary': '#999999',
    '--bg-primary': '#FFFFFF',
    '--bg-secondary': '#F5F5F5',
  },
  normal: {
    '--contrast-ratio': '4.5:1',
    '--text-primary': '#333333',
    '--text-secondary': '#666666',
    '--bg-primary': '#FFFFFF',
    '--bg-secondary': '#F0F0F0',
  },
  high: {
    '--contrast-ratio': '7:1',
    '--text-primary': '#000000',
    '--text-secondary': '#333333',
    '--bg-primary': '#FFFFFF',
    '--bg-secondary': '#E0E0E0',
  },
};

/**
 * Animation preferences for each profile
 */
export const ANIMATION_PREFERENCES: Record<ProfileConfig['animations'], Record<string, string>> = {
  none: {
    '--transition-duration': '0ms',
    '--animation-duration': '0ms',
    'prefers-reduced-motion': 'reduce',
  },
  reduced: {
    '--transition-duration': '150ms',
    '--animation-duration': '200ms',
    'prefers-reduced-motion': 'reduce',
  },
  normal: {
    '--transition-duration': '200ms',
    '--animation-duration': '300ms',
    'prefers-reduced-motion': 'no-preference',
  },
  enhanced: {
    '--transition-duration': '300ms',
    '--animation-duration': '500ms',
    'prefers-reduced-motion': 'no-preference',
  },
};

// ============================================================================
// Performance Configuration
// ============================================================================

/**
 * Performance thresholds for middleware monitoring
 */
export const PERFORMANCE_THRESHOLDS = {
  detection: {
    target: 50,   // Target: <50ms
    warning: 75,  // Warning if >75ms
    critical: 100, // Critical if >100ms
  },
  middleware: {
    target: 50,
    warning: 100,
    critical: 200,
  },
} as const;

/**
 * Throughput targets
 */
export const THROUGHPUT_TARGETS = {
  requestsPerSecond: 1000,
  concurrentUsers: 10000,
  edgeLocations: 200,
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

/**
 * Profile-specific feature flags
 */
export const PROFILE_FEATURES: Record<UserProfile, Record<string, boolean>> = {
  familiar: {
    animations: true,
    complexLayouts: true,
    videoAutoplay: true,
    backgroundEffects: true,
    advancedFilters: true,
  },
  jovem: {
    animations: true,
    complexLayouts: true,
    videoAutoplay: true,
    backgroundEffects: true,
    advancedFilters: true,
  },
  senior: {
    animations: false,      // Reduced motion
    complexLayouts: false,  // Simplified UI
    videoAutoplay: false,   // Manual control
    backgroundEffects: false, // Reduced distractions
    advancedFilters: false, // Simplified options
  },
};

// ============================================================================
// Accessibility Configuration
// ============================================================================

/**
 * WCAG compliance levels for each profile
 */
export const WCAG_COMPLIANCE: Record<UserProfile, {
  level: 'A' | 'AA' | 'AAA';
  minContrastRatio: number;
  minTouchTarget: number; // pixels
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
}> = {
  familiar: {
    level: 'AA',
    minContrastRatio: 4.5,
    minTouchTarget: 44,
    keyboardNavigation: true,
    screenReaderOptimized: true,
  },
  jovem: {
    level: 'AA',
    minContrastRatio: 4.5,
    minTouchTarget: 48, // Larger for mobile
    keyboardNavigation: true,
    screenReaderOptimized: true,
  },
  senior: {
    level: 'AAA',
    minContrastRatio: 7.0,
    minTouchTarget: 60, // Extra large
    keyboardNavigation: true,
    screenReaderOptimized: true,
  },
};

// ============================================================================
// Cache Configuration
// ============================================================================

/**
 * Cache control headers for profile-based content
 */
export const CACHE_CONTROL: Record<UserProfile, string> = {
  familiar: 'public, max-age=3600, stale-while-revalidate=86400',
  jovem: 'public, max-age=3600, stale-while-revalidate=86400',
  senior: 'public, max-age=3600, stale-while-revalidate=86400',
};

/**
 * CDN configuration
 */
export const CDN_CONFIG = {
  varyHeaders: ['Cookie', 'User-Agent'],
  cacheKey: ['profile', 'deviceType'],
  edgeTTL: 3600,
  browserTTL: 1800,
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets complete configuration for a profile
 */
export function getProfileConfiguration(profile: UserProfile) {
  return {
    ...PROFILE_SETTINGS[profile],
    features: PROFILE_FEATURES[profile],
    wcag: WCAG_COMPLIANCE[profile],
    cache: CACHE_CONTROL[profile],
  };
}

/**
 * Gets CSS variables for a profile
 */
export function getProfileCSSVars(profile: UserProfile): Record<string, string> {
  const config = PROFILE_CONFIGS[profile];

  return {
    ...FONT_SIZE_VARS[config.fontSize],
    ...CONTRAST_VARS[config.contrast],
    ...ANIMATION_PREFERENCES[config.animations],
  };
}

/**
 * Checks if a feature is enabled for a profile
 */
export function isFeatureEnabled(profile: UserProfile, feature: string): boolean {
  return PROFILE_FEATURES[profile][feature] ?? false;
}
