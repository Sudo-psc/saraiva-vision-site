/**
 * PostHog Analytics Provider for Saraiva Vision Healthcare Platform
 * Provides centralized analytics and feature flag management
 * LGPD/CFM Compliant - respects DNT and user privacy
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import posthog from 'posthog-js';
import PropTypes from 'prop-types';
import { SafeBeacon } from '../lib/safeTransport';

const PostHogContext = createContext(null);

/**
 * PostHog Provider Component
 */
export function PostHogProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOptedOut, setIsOptedOut] = useState(false);

  useEffect(() => {
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
    const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    // Skip initialization if no key provided
    if (!posthogKey) {
      return;
    }

    // Skip initialization in development unless explicitly enabled
    if (import.meta.env.DEV && !import.meta.env.VITE_POSTHOG_ENABLE_DEV) {
      return;
    }

    try {
      posthog.init(posthogKey, {
        api_host: posthogHost,

        // Privacy & LGPD Compliance
        respect_dnt: true,
        opt_out_capturing_by_default: false,
        autocapture: false, // Manual tracking for healthcare compliance
        capture_pageview: true,
        capture_pageleave: true,

        // Session Recording Configuration
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: true, // Mask all inputs for patient privacy
          maskInputOptions: {
            password: true,
            email: true, // Mask email for LGPD compliance
            tel: true, // Mask phone numbers
            text: false
          },
          maskTextSelector: '.sensitive-data, .patient-info, .medical-data',
          recordCrossOriginIframes: false, // Security: don't record external iframes
        },

        // Feature Flags
        feature_flag_request_timeout_ms: 3000,

        // Performance
        loaded: (posthogInstance) => {
          setIsInitialized(true);

          if (import.meta.env.DEV) {
            posthogInstance.debug(true);
          }

          // Wrap transport for safe state management
          if (posthogInstance._send_request) {
            const originalSend = posthogInstance._send_request.bind(posthogInstance);

            posthogInstance._send_request = (url, data, options, callback) => {
              try {
                // Use SafeBeacon for beacon requests
                if (options?.transport === 'sendBeacon' || options?.sendBeacon) {
                  const beacon = new SafeBeacon(url);
                  beacon.send(typeof data === 'string' ? data : JSON.stringify(data))
                    .then(() => callback?.({ status: 1 }))
                    .catch(() => {
                      callback?.({ status: 0 });
                    });
                } else {
                  // Use original transport for XHR
                  originalSend(url, data, options, callback);
                }
              } catch (error) {
                callback?.({ status: 0 });
              }
            };
          }
        },

        // Advanced options
        sanitize_properties: (properties) => {
          // Remove sensitive healthcare data
          const sanitized = { ...properties };
          const sensitiveKeys = ['cpf', 'rg', 'patient_name', 'medical_record', 'health_data'];

          sensitiveKeys.forEach(key => {
            if (key in sanitized) {
              delete sanitized[key];
            }
          });

          return sanitized;
        },

        // Error handling
        on_xhr_error: () => {
          // XHR errors are non-critical for analytics
        }
      });

      // Check opt-out status
      setIsOptedOut(posthog.has_opted_out_capturing());

      // Handle page visibility changes to prevent InvalidStateError
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Don't send events when page is hidden
          posthog.opt_out_capturing();
        } else {
          if (!isOptedOut) {
            posthog.opt_in_capturing();
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup on unmount
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };

    } catch (error) {
      // CRITICAL: PostHog initialization failure
      console.error('PostHog initialization failed:', error);
    }
  }, [isOptedOut]);

  // Track event with healthcare context
  const trackEvent = useCallback((eventName, properties = {}) => {
    if (!isInitialized || isOptedOut) return;

    try {
      posthog.capture(eventName, {
        ...properties,
        healthcare_platform: true,
        timestamp: new Date().toISOString(),
        page_url: window.location.pathname,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      // Event tracking failure is non-critical
    }
  }, [isInitialized, isOptedOut]);

  // Identify user (LGPD compliant - use hashed/anonymized ID)
  const identifyUser = useCallback((userId, properties = {}) => {
    if (!isInitialized || isOptedOut) return;

    try {
      posthog.identify(userId, {
        ...properties,
        platform: 'saraiva-vision-web'
      });
    } catch (error) {
      // User identification failure is non-critical
    }
  }, [isInitialized, isOptedOut]);

  // Reset user session
  const resetUser = useCallback(() => {
    if (!isInitialized) return;

    try {
      posthog.reset();
    } catch (error) {
      // Session reset failure is non-critical
    }
  }, [isInitialized]);

  // Feature flags
  const isFeatureEnabled = useCallback((flagName, defaultValue = false) => {
    if (!isInitialized) return defaultValue;

    try {
      return posthog.isFeatureEnabled(flagName) ?? defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }, [isInitialized]);

  // Get feature flag value
  const getFeatureFlag = useCallback((flagName, defaultValue = null) => {
    if (!isInitialized) return defaultValue;

    try {
      const value = posthog.getFeatureFlag(flagName);
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }, [isInitialized]);

  // Opt out of tracking (LGPD compliance)
  const optOutTracking = useCallback(() => {
    if (!isInitialized) return;

    try {
      posthog.opt_out_capturing();
      setIsOptedOut(true);
    } catch (error) {
      // Opt-out failure is non-critical
    }
  }, [isInitialized]);

  // Opt in to tracking
  const optInTracking = useCallback(() => {
    if (!isInitialized) return;

    try {
      posthog.opt_in_capturing();
      setIsOptedOut(false);
    } catch (error) {
      // Opt-in failure is non-critical
    }
  }, [isInitialized]);

  const value = {
    posthog,
    isInitialized,
    isOptedOut,
    trackEvent,
    identifyUser,
    resetUser,
    isFeatureEnabled,
    getFeatureFlag,
    optOutTracking,
    optInTracking
  };

  return (
    <PostHogContext.Provider value={value}>
      {children}
    </PostHogContext.Provider>
  );
}

PostHogProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * usePostHog Hook
 * Access PostHog analytics and feature flags
 */
export function usePostHog() {
  const context = useContext(PostHogContext);

  if (!context) {
    throw new Error('usePostHog must be used within PostHogProvider');
  }

  return context;
}

export default PostHogProvider;
