/**
 * TypeScript Type Definitions
 * Profile Detection System
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * User profile identifiers
 */
export type UserProfile = 'familiar' | 'jovem' | 'senior';

/**
 * Confidence levels for profile detection
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Detection methods in priority order
 */
export type DetectionMethod = 'query' | 'cookie' | 'user-agent' | 'default';

/**
 * Device type classifications
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Profile-specific UI configuration
 */
export interface ProfileConfig {
  fontSize: 'small' | 'base' | 'large' | 'xlarge';
  contrast: 'low' | 'normal' | 'high';
  animations: 'none' | 'reduced' | 'normal' | 'enhanced';
  layout: 'simplified' | 'standard' | 'modern';
}

/**
 * Complete profile configuration with metadata
 */
export interface ProfileSettings {
  profile: UserProfile;
  config: ProfileConfig;
  displayName: string;
  description: string;
  icon?: string;
}

// ============================================================================
// Detection Result Types
// ============================================================================

/**
 * Metadata extracted from User-Agent
 */
export interface UserAgentMetadata {
  deviceType: DeviceType;
  browserFamily: string;
  browserVersion?: string;
  osFamily: string;
  osVersion?: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Profile detection result with confidence and metadata
 */
export interface ProfileDetectionResult {
  profile: UserProfile;
  confidence: ConfidenceLevel;
  detectionMethod: DetectionMethod;
  metadata?: Partial<UserAgentMetadata>;
  timestamp?: number;
}

// ============================================================================
// Cookie Types
// ============================================================================

/**
 * Cookie configuration for profile persistence
 */
export interface ProfileCookieConfig {
  name: string;
  maxAge: number;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

/**
 * Cookie value with validation
 */
export interface ProfileCookie {
  value: UserProfile;
  expiresAt: Date;
  createdAt: Date;
  lastUpdated: Date;
}

// ============================================================================
// Middleware Types
// ============================================================================

/**
 * Middleware configuration options
 */
export interface MiddlewareConfig {
  enableProfiling?: boolean;
  enableLogging?: boolean;
  performanceThreshold?: number; // ms
  fallbackProfile?: UserProfile;
  cookieConfig?: Partial<ProfileCookieConfig>;
}

/**
 * Middleware execution context
 */
export interface MiddlewareContext {
  startTime: number;
  endTime?: number;
  executionTime?: number;
  detectionResult: ProfileDetectionResult;
  cookieUpdated: boolean;
  error?: Error;
}

// ============================================================================
// Analytics Types
// ============================================================================

/**
 * Profile analytics event
 */
export interface ProfileAnalyticsEvent {
  eventType: 'detection' | 'change' | 'explicit_selection';
  profile: UserProfile;
  previousProfile?: UserProfile;
  detectionMethod: DetectionMethod;
  confidence: ConfidenceLevel;
  timestamp: number;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  detectionTime: number;
  totalMiddlewareTime: number;
  cookieOperationTime?: number;
  headerSetTime?: number;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Profile validation result
 */
export interface ValidationResult {
  isValid: boolean;
  profile?: UserProfile;
  error?: string;
}

/**
 * User-Agent validation result
 */
export interface UserAgentValidationResult {
  isValid: boolean;
  isEmpty: boolean;
  isSuspicious: boolean;
  metadata?: Partial<UserAgentMetadata>;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Profile detection error
 */
export class ProfileDetectionError extends Error {
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ProfileDetectionError';
  }
}

/**
 * Cookie operation error
 */
export class CookieOperationError extends Error {
  constructor(
    message: string,
    public readonly operation: 'read' | 'write' | 'delete',
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CookieOperationError';
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for UserProfile
 */
export function isUserProfile(value: unknown): value is UserProfile {
  return (
    typeof value === 'string' &&
    ['familiar', 'jovem', 'senior'].includes(value)
  );
}

/**
 * Type guard for DetectionMethod
 */
export function isDetectionMethod(value: unknown): value is DetectionMethod {
  return (
    typeof value === 'string' &&
    ['query', 'cookie', 'user-agent', 'default'].includes(value)
  );
}

/**
 * Type guard for DeviceType
 */
export function isDeviceType(value: unknown): value is DeviceType {
  return (
    typeof value === 'string' &&
    ['mobile', 'tablet', 'desktop'].includes(value)
  );
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make specific properties required
 */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extract profile-specific subset of configuration
 */
export type ProfileSpecificConfig<T extends UserProfile> = ProfileConfig & {
  profileType: T;
};

// ============================================================================
// Constants as Types
// ============================================================================

/**
 * Valid profile values as literal type
 */
export const PROFILES = ['familiar', 'jovem', 'senior'] as const;

/**
 * Detection methods in priority order
 */
export const DETECTION_METHODS = ['query', 'cookie', 'user-agent', 'default'] as const;

/**
 * Device types
 */
export const DEVICE_TYPES = ['mobile', 'tablet', 'desktop'] as const;
