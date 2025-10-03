/**
 * Profile Detection Utilities
 *
 * Edge-compatible, high-performance user profile detection
 * based on User-Agent analysis with intelligent fallbacks.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type UserProfile = 'familiar' | 'jovem' | 'senior';

export interface ProfileDetectionResult {
  profile: UserProfile;
  confidence: 'high' | 'medium' | 'low';
  detectionMethod: 'query' | 'cookie' | 'user-agent' | 'default';
  metadata?: {
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    browserFamily?: string;
    osFamily?: string;
  };
}

// ============================================================================
// Constants
// ============================================================================

export const PROFILE_COOKIE_NAME = 'saraiva_profile_preference';
export const PROFILE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export const VALID_PROFILES: readonly UserProfile[] = ['familiar', 'jovem', 'senior'] as const;

// ============================================================================
// User-Agent Detection Patterns (Pre-compiled for performance)
// ============================================================================

/**
 * Senior Profile Indicators:
 * - Feature phones (KaiOS)
 * - Older Android versions (< 8.0)
 * - Desktop users (statistical preference for desktop)
 * - Traditional browsers (IE, older Edge)
 */
const SENIOR_PATTERNS = [
  /KAIOS/i,
  /Nokia/i,
  /SymbianOS/i,
  /Android [4-7]\./i, // Android 4.x - 7.x
  /MSIE|Trident/i, // Internet Explorer
  /Windows NT (5\.|6\.[01])/i, // Windows XP, Vista, 7
] as const;

/**
 * Jovem Profile Indicators:
 * - Mobile-first devices
 * - Modern Android (10+)
 * - iOS devices
 * - Gaming browsers
 * - TikTok/Instagram in-app browsers
 */
const JOVEM_PATTERNS = [
  /Instagram/i,
  /TikTok/i,
  /Snapchat/i,
  /FBAN|FBAV/i, // Facebook App
  /Android 1[0-9]\./i, // Android 10+
  /iPhone|iPad/i,
  /Mobile.*Safari/i,
  /PlayStation|Xbox/i,
] as const;

/**
 * Device Type Detection
 */
const MOBILE_PATTERNS = [
  /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
] as const;

const TABLET_PATTERNS = [
  /iPad|Android.*Tablet|Kindle|Silk|PlayBook/i,
] as const;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates if a string is a valid profile identifier
 *
 * Performance: O(1) - Array.includes on small constant array
 */
export function isValidProfile(value: unknown): value is UserProfile {
  return typeof value === 'string' && VALID_PROFILES.includes(value as UserProfile);
}

// ============================================================================
// User-Agent Analysis
// ============================================================================

/**
 * Detects device type from User-Agent
 *
 * @param userAgent - Browser User-Agent string
 * @returns Device type classification
 */
function detectDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  if (TABLET_PATTERNS.some(pattern => pattern.test(userAgent))) {
    return 'tablet';
  }

  if (MOBILE_PATTERNS.some(pattern => pattern.test(userAgent))) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Extracts browser family from User-Agent
 *
 * @param userAgent - Browser User-Agent string
 * @returns Browser family name
 */
function detectBrowserFamily(userAgent: string): string {
  if (/Edg/i.test(userAgent)) return 'Edge';
  if (/Chrome/i.test(userAgent)) return 'Chrome';
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'Safari';
  if (/Firefox/i.test(userAgent)) return 'Firefox';
  if (/MSIE|Trident/i.test(userAgent)) return 'Internet Explorer';
  if (/Opera|OPR/i.test(userAgent)) return 'Opera';

  return 'Unknown';
}

/**
 * Extracts OS family from User-Agent
 *
 * @param userAgent - Browser User-Agent string
 * @returns Operating system family
 */
function detectOSFamily(userAgent: string): string {
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac OS/i.test(userAgent)) return 'macOS';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/iOS|iPhone|iPad/i.test(userAgent)) return 'iOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  if (/KAIOS/i.test(userAgent)) return 'KaiOS';

  return 'Unknown';
}

// ============================================================================
// Main Detection Logic
// ============================================================================

/**
 * Detects user profile from User-Agent string
 *
 * Algorithm:
 * 1. Check for senior indicators (feature phones, old OS)
 * 2. Check for jovem indicators (mobile-first, social apps)
 * 3. Default to familiar (general audience)
 *
 * Performance: <5ms typical, <10ms worst case
 *
 * @param userAgent - Browser User-Agent string
 * @returns Detected user profile
 */
export function detectProfileFromUserAgent(userAgent: string): UserProfile {
  if (!userAgent || userAgent.length === 0) {
    return 'familiar'; // Default for missing UA
  }

  // Senior detection (highest priority for accessibility)
  const isSeniorDevice = SENIOR_PATTERNS.some(pattern => pattern.test(userAgent));
  if (isSeniorDevice) {
    return 'senior';
  }

  // Jovem detection (mobile-first, social media)
  const isJovemDevice = JOVEM_PATTERNS.some(pattern => pattern.test(userAgent));
  if (isJovemDevice) {
    return 'jovem';
  }

  // Default: familiar (general audience)
  return 'familiar';
}

/**
 * Enhanced detection with metadata and confidence scoring
 *
 * Use this for analytics and monitoring, not for runtime decisions
 * (adds ~2-3ms overhead due to additional parsing)
 *
 * @param userAgent - Browser User-Agent string
 * @param source - Detection source for confidence calculation
 * @returns Detailed detection result
 */
export function detectProfileWithMetadata(
  userAgent: string,
  source: 'query' | 'cookie' | 'user-agent' | 'default'
): ProfileDetectionResult {
  const profile = detectProfileFromUserAgent(userAgent);

  // Confidence scoring
  let confidence: 'high' | 'medium' | 'low';
  switch (source) {
    case 'query':
      confidence = 'high'; // User explicitly selected
      break;
    case 'cookie':
      confidence = 'high'; // Previously set preference
      break;
    case 'user-agent':
      confidence = 'medium'; // Heuristic-based
      break;
    case 'default':
      confidence = 'low'; // Fallback
      break;
  }

  // Metadata extraction
  const metadata = {
    deviceType: detectDeviceType(userAgent),
    browserFamily: detectBrowserFamily(userAgent),
    osFamily: detectOSFamily(userAgent),
  };

  return {
    profile,
    confidence,
    detectionMethod: source,
    metadata,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets profile display name for UI
 *
 * @param profile - User profile identifier
 * @returns Localized display name (Portuguese)
 */
export function getProfileDisplayName(profile: UserProfile): string {
  const names: Record<UserProfile, string> = {
    familiar: 'Navegação Familiar',
    jovem: 'Navegação Jovem',
    senior: 'Navegação Senior',
  };

  return names[profile];
}

/**
 * Gets profile description for accessibility
 *
 * @param profile - User profile identifier
 * @returns Profile description
 */
export function getProfileDescription(profile: UserProfile): string {
  const descriptions: Record<UserProfile, string> = {
    familiar: 'Interface padrão com recursos equilibrados',
    jovem: 'Interface moderna e dinâmica otimizada para mobile',
    senior: 'Interface simplificada com maior contraste e fontes maiores',
  };

  return descriptions[profile];
}

/**
 * Gets profile-specific configuration
 *
 * @param profile - User profile identifier
 * @returns Profile configuration object
 */
export function getProfileConfig(profile: UserProfile) {
  const configs = {
    familiar: {
      fontSize: 'base',
      contrast: 'normal',
      animations: 'normal',
      layout: 'standard',
    },
    jovem: {
      fontSize: 'base',
      contrast: 'normal',
      animations: 'enhanced',
      layout: 'modern',
    },
    senior: {
      fontSize: 'large',
      contrast: 'high',
      animations: 'reduced',
      layout: 'simplified',
    },
  } as const;

  return configs[profile];
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Benchmarks profile detection performance
 *
 * @param iterations - Number of test iterations
 * @returns Performance metrics
 */
export function benchmarkDetection(iterations: number = 1000): {
  averageTime: number;
  minTime: number;
  maxTime: number;
} {
  const testUserAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H)',
    'KAIOS/2.5.0',
  ];

  let totalTime = 0;
  let minTime = Infinity;
  let maxTime = 0;

  for (let i = 0; i < iterations; i++) {
    const ua = testUserAgents[i % testUserAgents.length];
    const start = performance.now();
    detectProfileFromUserAgent(ua);
    const end = performance.now();

    const time = end - start;
    totalTime += time;
    minTime = Math.min(minTime, time);
    maxTime = Math.max(maxTime, time);
  }

  return {
    averageTime: totalTime / iterations,
    minTime,
    maxTime,
  };
}
