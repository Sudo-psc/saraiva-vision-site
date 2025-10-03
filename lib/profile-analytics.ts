/**
 * Profile Analytics & Monitoring
 *
 * Edge-compatible analytics for profile detection and performance monitoring.
 * Designed for integration with Vercel Analytics, Google Analytics, or custom solutions.
 */

import type {
  UserProfile,
  ProfileDetectionResult,
  ProfileAnalyticsEvent,
  PerformanceMetrics,
  DetectionMethod,
} from './profile-types';

// ============================================================================
// Analytics Event Types
// ============================================================================

type AnalyticsEventType =
  | 'profile_detected'
  | 'profile_changed'
  | 'profile_explicit_selection'
  | 'detection_performance'
  | 'detection_error';

interface BaseAnalyticsPayload {
  timestamp: number;
  userAgent?: string;
  deviceType?: string;
  environment: 'production' | 'development';
}

interface ProfileDetectedPayload extends BaseAnalyticsPayload {
  profile: UserProfile;
  detectionMethod: DetectionMethod;
  confidence: string;
  executionTime: number;
}

interface ProfileChangedPayload extends BaseAnalyticsPayload {
  previousProfile: UserProfile;
  newProfile: UserProfile;
  changeReason: 'user_selection' | 'cookie_expired' | 'ua_change';
}

interface DetectionPerformancePayload extends BaseAnalyticsPayload {
  executionTime: number;
  detectionTime: number;
  cookieOperationTime?: number;
  threshold: number;
  isOverThreshold: boolean;
}

interface DetectionErrorPayload extends BaseAnalyticsPayload {
  error: string;
  fallbackProfile: UserProfile;
  context?: Record<string, unknown>;
}

// ============================================================================
// Analytics Service
// ============================================================================

class ProfileAnalyticsService {
  private enabled: boolean;
  private debug: boolean;

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Track profile detection event
   */
  trackDetection(result: ProfileDetectionResult, executionTime: number): void {
    if (!this.enabled && !this.debug) return;

    const payload: ProfileDetectedPayload = {
      profile: result.profile,
      detectionMethod: result.detectionMethod,
      confidence: result.confidence,
      executionTime,
      timestamp: Date.now(),
      deviceType: result.metadata?.deviceType,
      environment: process.env.NODE_ENV as 'production' | 'development',
    };

    this.sendEvent('profile_detected', payload);
  }

  /**
   * Track profile change event
   */
  trackProfileChange(
    previous: UserProfile,
    current: UserProfile,
    reason: 'user_selection' | 'cookie_expired' | 'ua_change'
  ): void {
    if (!this.enabled && !this.debug) return;

    const payload: ProfileChangedPayload = {
      previousProfile: previous,
      newProfile: current,
      changeReason: reason,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV as 'production' | 'development',
    };

    this.sendEvent('profile_changed', payload);
  }

  /**
   * Track explicit user selection
   */
  trackExplicitSelection(profile: UserProfile, userAgent?: string): void {
    if (!this.enabled && !this.debug) return;

    const payload: ProfileDetectedPayload = {
      profile,
      detectionMethod: 'query',
      confidence: 'high',
      executionTime: 0,
      timestamp: Date.now(),
      userAgent,
      environment: process.env.NODE_ENV as 'production' | 'development',
    };

    this.sendEvent('profile_explicit_selection', payload);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: PerformanceMetrics, threshold: number = 50): void {
    if (!this.enabled && !this.debug) return;

    const payload: DetectionPerformancePayload = {
      executionTime: metrics.totalMiddlewareTime,
      detectionTime: metrics.detectionTime,
      cookieOperationTime: metrics.cookieOperationTime,
      threshold,
      isOverThreshold: metrics.totalMiddlewareTime > threshold,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV as 'production' | 'development',
    };

    this.sendEvent('detection_performance', payload);

    // Log warning for slow executions
    if (payload.isOverThreshold && this.debug) {
      console.warn(
        `[Profile Analytics] Slow detection: ${metrics.totalMiddlewareTime}ms (threshold: ${threshold}ms)`
      );
    }
  }

  /**
   * Track detection errors
   */
  trackError(error: Error, fallbackProfile: UserProfile, context?: Record<string, unknown>): void {
    const payload: DetectionErrorPayload = {
      error: error.message,
      fallbackProfile,
      context,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV as 'production' | 'development',
    };

    this.sendEvent('detection_error', payload);

    // Always log errors in development
    if (this.debug) {
      console.error('[Profile Analytics] Detection error:', error, context);
    }
  }

  /**
   * Send event to analytics provider
   */
  private sendEvent(eventType: AnalyticsEventType, payload: Record<string, unknown>): void {
    if (this.debug) {
      console.log(`[Profile Analytics] ${eventType}:`, payload);
    }

    // Integration points for various analytics providers
    this.sendToVercelAnalytics(eventType, payload);
    this.sendToGoogleAnalytics(eventType, payload);
    this.sendToCustomEndpoint(eventType, payload);
  }

  /**
   * Vercel Analytics integration
   */
  private sendToVercelAnalytics(eventType: string, payload: Record<string, unknown>): void {
    if (typeof window === 'undefined') return; // Edge runtime check

    // Vercel Analytics Web Vitals integration
    try {
      // @ts-ignore - Vercel Analytics global
      if (window.va) {
        window.va('event', eventType, payload);
      }
    } catch (error) {
      if (this.debug) {
        console.warn('[Profile Analytics] Vercel Analytics error:', error);
      }
    }
  }

  /**
   * Google Analytics integration (GA4)
   */
  private sendToGoogleAnalytics(eventType: string, payload: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;

    try {
      // @ts-ignore - Google Analytics global
      if (window.gtag) {
        window.gtag('event', eventType, payload);
      }
    } catch (error) {
      if (this.debug) {
        console.warn('[Profile Analytics] Google Analytics error:', error);
      }
    }
  }

  /**
   * Custom analytics endpoint
   */
  private sendToCustomEndpoint(eventType: string, payload: Record<string, unknown>): void {
    if (!this.enabled) return;

    // Example: Send to your own analytics API
    // This should be non-blocking and use sendBeacon or fetch with keepalive
    try {
      const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
      if (!endpoint) return;

      const data = JSON.stringify({
        eventType,
        ...payload,
      });

      // Use sendBeacon for reliability (fires even if page unloads)
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, data);
      } else {
        // Fallback to fetch with keepalive
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true,
        }).catch((error) => {
          if (this.debug) {
            console.warn('[Profile Analytics] Custom endpoint error:', error);
          }
        });
      }
    } catch (error) {
      if (this.debug) {
        console.warn('[Profile Analytics] Custom endpoint error:', error);
      }
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const profileAnalytics = new ProfileAnalyticsService();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Track profile detection
 */
export function trackProfileDetection(
  result: ProfileDetectionResult,
  executionTime: number
): void {
  profileAnalytics.trackDetection(result, executionTime);
}

/**
 * Track profile change
 */
export function trackProfileChange(
  previous: UserProfile,
  current: UserProfile,
  reason: 'user_selection' | 'cookie_expired' | 'ua_change'
): void {
  profileAnalytics.trackProfileChange(previous, current, reason);
}

/**
 * Track explicit selection
 */
export function trackExplicitSelection(profile: UserProfile, userAgent?: string): void {
  profileAnalytics.trackExplicitSelection(profile, userAgent);
}

/**
 * Track performance
 */
export function trackPerformance(metrics: PerformanceMetrics, threshold?: number): void {
  profileAnalytics.trackPerformance(metrics, threshold);
}

/**
 * Track error
 */
export function trackError(
  error: Error,
  fallbackProfile: UserProfile,
  context?: Record<string, unknown>
): void {
  profileAnalytics.trackError(error, fallbackProfile, context);
}

// ============================================================================
// Performance Monitoring Utilities
// ============================================================================

/**
 * Create performance timer
 */
export function createPerformanceTimer() {
  const startTime = performance.now();
  const marks: Record<string, number> = {};

  return {
    mark(label: string): void {
      marks[label] = performance.now() - startTime;
    },

    getMetrics(): PerformanceMetrics {
      return {
        detectionTime: marks.detection || 0,
        totalMiddlewareTime: performance.now() - startTime,
        cookieOperationTime: marks.cookieOperation,
        headerSetTime: marks.headerSet,
      };
    },
  };
}

/**
 * Monitor detection performance
 */
export async function monitorDetection<T>(
  fn: () => T | Promise<T>,
  label: string = 'detection'
): Promise<T> {
  const timer = createPerformanceTimer();

  try {
    const result = await fn();
    timer.mark(label);

    const metrics = timer.getMetrics();
    trackPerformance(metrics);

    return result;
  } catch (error) {
    timer.mark('error');
    throw error;
  }
}
