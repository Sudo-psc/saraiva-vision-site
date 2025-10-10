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
      console.warn('[PostHog] API key not configured - analytics disabled');
      return;
    }

    // Skip initialization in development unless explicitly enabled
    if (import.meta.env.DEV && !import.meta.env.VITE_POSTHOG_ENABLE_DEV) {
      console.info('[PostHog] Development mode - analytics disabled');
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
            console.info('[PostHog] Initialized successfully');
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
                    .catch((error) => {
                      console.error('[PostHog] Send error:', error);
                      callback?.({ status: 0 });
                    });
                } else {
                  // Use original transport for XHR
                  originalSend(url, data, options, callback);
                }
              } catch (error) {
                console.error('[PostHog] Transport error:', error);
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
        on_xhr_error: (req) => {
          console.error('[PostHog] XHR error:', req);
        }
      });

      // Check opt-out status
      setIsOptedOut(posthog.has_opted_out_capturing());

      // Handle page visibility changes to prevent InvalidStateError
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.log('[PostHog] Page hidden, pausing capture');
          // Don't send events when page is hidden
          posthog.opt_out_capturing();
        } else {
          console.log('[PostHog] Page visible, resuming capture');
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
      console.error('[PostHog] Initialization failed:', error);
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

      if (import.meta.env.DEV) {
        console.info(`[PostHog] Event tracked: ${eventName}`, properties);
      }
    } catch (error) {
      console.error(`[PostHog] Failed to track event ${eventName}:`, error);
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

      if (import.meta.env.DEV) {
        console.info('[PostHog] User identified:', userId);
      }
    } catch (error) {
      console.error('[PostHog] Failed to identify user:', error);
    }
  }, [isInitialized, isOptedOut]);

  // Reset user session
  const resetUser = useCallback(() => {
    if (!isInitialized) return;

    try {
      posthog.reset();

      if (import.meta.env.DEV) {
        console.info('[PostHog] User session reset');
      }
    } catch (error) {
      console.error('[PostHog] Failed to reset user:', error);
    }
  }, [isInitialized]);

  // Feature flags
  const isFeatureEnabled = useCallback((flagName, defaultValue = false) => {
    if (!isInitialized) return defaultValue;

    try {
      return posthog.isFeatureEnabled(flagName) ?? defaultValue;
    } catch (error) {
      console.warn(`[PostHog] Failed to check feature flag ${flagName}:`, error);
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
      console.warn(`[PostHog] Failed to get feature flag ${flagName}:`, error);
      return defaultValue;
    }
  }, [isInitialized]);

  // Opt out of tracking (LGPD compliance)
  const optOutTracking = useCallback(() => {
    if (!isInitialized) return;

    try {
      posthog.opt_out_capturing();
      setIsOptedOut(true);

      if (import.meta.env.DEV) {
        console.info('[PostHog] User opted out of tracking');
      }
    } catch (error) {
      console.error('[PostHog] Failed to opt out:', error);
    }
  }, [isInitialized]);

  // Opt in to tracking
  const optInTracking = useCallback(() => {
    if (!isInitialized) return;

    try {
      posthog.opt_in_capturing();
      setIsOptedOut(false);

      if (import.meta.env.DEV) {
        console.info('[PostHog] User opted in to tracking');
      }
    } catch (error) {
      console.error('[PostHog] Failed to opt in:', error);
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
