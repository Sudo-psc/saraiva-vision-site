/**
 * Simple placeholder analytics hooks
 * Provides the same interface as the original analytics system but without actual tracking
 */

import { useRef, useEffect } from 'react';

/**
 * useAnalytics - Placeholder hook that provides no-op analytics functions
 */
export const useAnalytics = () => {
    return {
        trackEvent: (event, data) => {
            console.debug(`[Analytics] Event: ${event}`, data);
        },
        trackInteraction: (action, element, data) => {
            console.debug(`[Analytics] Interaction: ${action} on ${element}`, data);
        },
        trackAppointment: (status, data) => {
            console.debug(`[Analytics] Appointment: ${status}`, data);
        },
        trackFormView: (formType) => {
            console.debug(`[Analytics] Form View: ${formType}`);
        },
        trackFormSubmit: (formType, data) => {
            console.debug(`[Analytics] Form Submit: ${formType}`, data);
        },
        isEnabled: () => false,
        trackPageView: () => {
            console.debug('[Analytics] Page view tracked');
        },
        trackFunnelEvent: (event, data) => {
            console.debug(`[Analytics] Funnel: ${event}`, data);
        }
    };
};

/**
 * useVisibilityTracking - Placeholder hook that provides visibility tracking interface
 */
export const useVisibilityTracking = (eventName, options = {}) => {
    const elementRef = useRef(null);

    useEffect(() => {
        if (elementRef.current && options.debug) {
            console.debug(`[Visibility] Tracking ${eventName} on element`, elementRef.current);
        }
    }, [eventName, options.debug]);

    return elementRef;
};

/**
 * useScrollTracking - Placeholder hook for scroll tracking
 */
export const useScrollTracking = (milestones = [25, 50, 75, 100]) => {
    useEffect(() => {
        if (milestones.length > 0) {
            console.debug(`[Scroll] Tracking milestones: ${milestones.join(', ')}`);
        }
    }, [milestones]);
};

/**
 * useSaraivaTracking - Placeholder hook for Saraiva-specific tracking
 */
export const useSaraivaTracking = () => {
    return {
        trackContactInteraction: (type, data) => {
            console.debug(`[Saraiva] Contact: ${type}`, data);
        },
        trackAppointmentRequest: (data) => {
            console.debug(`[Saraiva] Appointment request`, data);
        },
        trackServiceView: (service, data) => {
            console.debug(`[Saraiva] Service view: ${service}`, data);
        }
    };
};