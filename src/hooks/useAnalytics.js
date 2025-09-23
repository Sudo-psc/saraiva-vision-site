/**
 * React hook for PostHog analytics integration
 * Provides easy-to-use analytics functions for React components
 */

import { useEffect, useCallback, useRef } from 'react';
import analytics from '../lib/analytics';

/**
 * Custom hook for analytics integration
 * @param {Object} options - Configuration options
 * @param {boolean} options.trackPageViews - Auto-track page views
 * @param {boolean} options.trackUTM - Auto-track UTM parameters
 * @param {boolean} options.trackWebVitals - Auto-track Core Web Vitals
 */
export const useAnalytics = (options = {}) => {
    const {
        trackPageViews = true,
        trackUTM = true,
        trackWebVitals = true,
    } = options;

    const hasTrackedUTM = useRef(false);
    const hasTrackedPageView = useRef(false);

    // Track page view on mount
    useEffect(() => {
        if (trackPageViews && !hasTrackedPageView.current) {
            analytics.trackPageView();
            analytics.trackFunnelEvent('page_visit');
            hasTrackedPageView.current = true;
        }
    }, [trackPageViews]);

    // Track UTM parameters on mount
    useEffect(() => {
        if (trackUTM && !hasTrackedUTM.current) {
            analytics.trackUTMParameters();
            hasTrackedUTM.current = true;
        }
    }, [trackUTM]);

    // Track Core Web Vitals
    useEffect(() => {
        if (trackWebVitals && typeof window !== 'undefined') {
            // Dynamic import to avoid SSR issues
            import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getCLS(analytics.trackWebVitals);
                getFID(analytics.trackWebVitals);
                getFCP(analytics.trackWebVitals);
                getLCP(analytics.trackWebVitals);
                getTTFB(analytics.trackWebVitals);
            }).catch(error => {
                console.warn('Failed to load web-vitals:', error);
            });
        }
    }, [trackWebVitals]);

    // Memoized tracking functions
    const trackEvent = useCallback((eventName, properties = {}) => {
        analytics.trackFunnelEvent(eventName, properties);
    }, []);

    const trackInteraction = useCallback((action, element, properties = {}) => {
        analytics.trackUserInteraction(action, element, properties);
    }, []);

    const trackAppointment = useCallback((status, data = {}) => {
        analytics.trackAppointmentMetrics(status, data);
    }, []);

    const trackFormView = useCallback((formType) => {
        const eventMap = {
            'contact': 'contact_form_view',
            'appointment': 'appointment_form_view',
        };

        const eventName = eventMap[formType];
        if (eventName) {
            analytics.trackFunnelEvent(eventName);
        }
    }, []);

    const trackFormSubmit = useCallback((formType, formData = {}) => {
        const eventMap = {
            'contact': 'contact_form_submit',
            'appointment': 'appointment_form_submit',
        };

        const eventName = eventMap[formType];
        if (eventName) {
            // Remove PII from tracking data for LGPD compliance
            const sanitizedData = {
                form_type: formType,
                has_name: !!formData.name,
                has_email: !!formData.email,
                has_phone: !!formData.phone,
                message_length: formData.message?.length || 0,
                consent_given: formData.consent,
            };

            analytics.trackFunnelEvent(eventName, sanitizedData);
        }
    }, []);

    return {
        trackEvent,
        trackInteraction,
        trackAppointment,
        trackFormView,
        trackFormSubmit,
        isEnabled: analytics.isEnabled,
    };
};

/**
 * Hook for tracking component visibility (for conversion funnel)
 */
export const useVisibilityTracking = (eventName, options = {}) => {
    const { threshold = 0.5, trackOnce = true } = options;
    const hasTracked = useRef(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !analytics.isEnabled()) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
                        if (!trackOnce || !hasTracked.current) {
                            analytics.trackFunnelEvent(eventName, {
                                visibility_threshold: threshold,
                                intersection_ratio: entry.intersectionRatio,
                            });
                            hasTracked.current = true;
                        }
                    }
                });
            },
            { threshold }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [eventName, threshold, trackOnce]);

    return elementRef;
};

/**
 * Hook for tracking scroll depth
 */
export const useScrollTracking = (milestones = [25, 50, 75, 100]) => {
    const trackedMilestones = useRef(new Set());

    useEffect(() => {
        if (!analytics.isEnabled()) return;

        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

            milestones.forEach(milestone => {
                if (scrollPercentage >= milestone && !trackedMilestones.current.has(milestone)) {
                    analytics.trackUserInteraction('scroll', 'page', {
                        scroll_depth: milestone,
                        page_url: window.location.href,
                    });
                    trackedMilestones.current.add(milestone);
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [milestones]);
};

export default useAnalytics;