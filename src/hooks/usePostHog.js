import { usePostHog as usePostHogReact, useFeatureFlagEnabled, useFeatureFlagPayload } from 'posthog-js/react';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom PostHog hook with enhanced functionality for Saraiva Vision
 */
export const usePostHog = () => {
    const posthog = usePostHogReact();
    let location = null;

    try {
        location = useLocation();
    } catch (error) {
        // Handle case where hook is used outside Router context (e.g., in tests)
        location = {
            pathname: window.location?.pathname || '/',
            search: window.location?.search || '',
            hash: window.location?.hash || '',
        };
    }

    // Track page views automatically
    useEffect(() => {
        if (posthog) {
            posthog.capture('$pageview', {
                $current_url: window.location.href,
                path: location.pathname,
                search: location.search,
                hash: location.hash,
            });
        }
    }, [posthog, location]);

    // Enhanced tracking methods
    const trackEvent = useCallback((eventName, properties = {}) => {
        if (posthog) {
            posthog.capture(eventName, {
                ...properties,
                timestamp: new Date().toISOString(),
                page: location.pathname,
            });
        }
    }, [posthog, location.pathname]);

    const trackUserAction = useCallback((action, context = {}) => {
        trackEvent('user_action', {
            action,
            context,
            user_agent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
        });
    }, [trackEvent]);

    const trackBusinessEvent = useCallback((eventType, data = {}) => {
        trackEvent('business_event', {
            event_type: eventType,
            ...data,
            clinic: 'saraiva_vision',
        });
    }, [trackEvent]);

    const trackConversion = useCallback((conversionType, value = null, properties = {}) => {
        trackEvent('conversion', {
            conversion_type: conversionType,
            value,
            ...properties,
            converted_at: new Date().toISOString(),
        });
    }, [trackEvent]);

    const identifyUser = useCallback((userId, properties = {}) => {
        if (posthog) {
            posthog.identify(userId, {
                ...properties,
                identified_at: new Date().toISOString(),
            });
        }
    }, [posthog]);

    const setUserProperties = useCallback((properties) => {
        if (posthog) {
            posthog.setPersonProperties(properties);
        }
    }, [posthog]);

    const resetUser = useCallback(() => {
        if (posthog) {
            posthog.reset();
        }
    }, [posthog]);

    return {
        posthog,
        trackEvent,
        trackUserAction,
        trackBusinessEvent,
        trackConversion,
        identifyUser,
        setUserProperties,
        resetUser,
        isReady: !!posthog,
    };
};

/**
 * Hook for feature flags
 */
export const useFeatureFlag = (flagKey) => {
    const isEnabled = useFeatureFlagEnabled(flagKey);
    const payload = useFeatureFlagPayload(flagKey);

    return {
        isEnabled,
        payload,
        isLoading: isEnabled === undefined,
    };
};

/**
 * Hook for A/B testing
 */
export const useABTest = (testKey) => {
    const { isEnabled, payload } = useFeatureFlag(testKey);
    const { trackEvent } = usePostHog();

    const trackVariantView = useCallback((variant) => {
        trackEvent('ab_test_variant_viewed', {
            test_key: testKey,
            variant,
            payload,
        });
    }, [trackEvent, testKey, payload]);

    const trackVariantInteraction = useCallback((variant, interaction) => {
        trackEvent('ab_test_variant_interaction', {
            test_key: testKey,
            variant,
            interaction,
            payload,
        });
    }, [trackEvent, testKey, payload]);

    return {
        isEnabled,
        variant: payload?.variant || 'control',
        payload,
        trackVariantView,
        trackVariantInteraction,
    };
};

/**
 * Predefined tracking functions for common Saraiva Vision events
 */
export const useSaraivaTracking = () => {
    const { trackBusinessEvent, trackConversion, trackUserAction } = usePostHog();

    const trackAppointmentRequest = useCallback((serviceType, method = 'form') => {
        trackBusinessEvent('appointment_request', {
            service_type: serviceType,
            request_method: method,
        });
        trackConversion('appointment_request', 1, { service_type: serviceType });
    }, [trackBusinessEvent, trackConversion]);

    const trackServiceView = useCallback((serviceId, serviceName) => {
        trackBusinessEvent('service_viewed', {
            service_id: serviceId,
            service_name: serviceName,
        });
    }, [trackBusinessEvent]);

    const trackContactInteraction = useCallback((type, method) => {
        trackUserAction('contact_interaction', {
            interaction_type: type, // 'whatsapp', 'phone', 'form', 'email'
            method,
        });
    }, [trackUserAction]);

    const trackBlogEngagement = useCallback((postSlug, action) => {
        trackUserAction('blog_engagement', {
            post_slug: postSlug,
            action, // 'view', 'share', 'comment', 'like'
        });
    }, [trackUserAction]);

    const trackInstagramInteraction = useCallback((action, postId = null) => {
        trackUserAction('instagram_interaction', {
            action, // 'view', 'click', 'follow'
            post_id: postId,
        });
    }, [trackUserAction]);

    const trackAccessibilityUsage = useCallback((feature, enabled) => {
        trackUserAction('accessibility_feature', {
            feature,
            enabled,
        });
    }, [trackUserAction]);

    const trackSearchQuery = useCallback((query, results_count = 0) => {
        trackUserAction('search', {
            query,
            results_count,
        });
    }, [trackUserAction]);

    const trackNewsletterSignup = useCallback((email, source = 'footer') => {
        trackConversion('newsletter_signup', 1, {
            email_hash: btoa(email), // Basic hash for privacy
            source,
        });
    }, [trackConversion]);

    return {
        trackAppointmentRequest,
        trackServiceView,
        trackContactInteraction,
        trackBlogEngagement,
        trackInstagramInteraction,
        trackAccessibilityUsage,
        trackSearchQuery,
        trackNewsletterSignup,
    };
};

export default usePostHog;