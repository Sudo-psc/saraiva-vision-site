/**
 * PostHog Analytics Integration
 * Handles conversion funnel tracking, UTM parameters, and LGPD compliance
 */

import posthog from 'posthog-js';

// PostHog configuration
const POSTHOG_CONFIG = {
    api_host: 'https://app.posthog.com',
    loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded in development mode');
        }
    },
    capture_pageview: false, // We'll handle this manually for better control
    disable_session_recording: true, // LGPD compliance - no session recording
    respect_dnt: true, // Respect Do Not Track headers
    opt_out_capturing_by_default: false,
    cross_subdomain_cookie: false,
    secure_cookie: true,
    persistence: 'localStorage+cookie',
    cookie_expiration: 365, // 1 year
    upgrade: true,
    disable_persistence: false,
    property_blacklist: ['$initial_referrer', '$initial_referring_domain'], // LGPD compliance
};

// Analytics instance
let analyticsInitialized = false;

/**
 * Initialize PostHog analytics
 * @param {string} apiKey - PostHog API key
 * @param {boolean} hasConsent - User consent for analytics
 */
export const initializeAnalytics = (apiKey, hasConsent = false) => {
    if (!apiKey || typeof window === 'undefined') {
        console.warn('PostHog API key not provided or running on server');
        return;
    }

    try {
        posthog.init(apiKey, POSTHOG_CONFIG);

        if (!hasConsent) {
            posthog.opt_out_capturing();
        }

        analyticsInitialized = true;
        console.log('PostHog analytics initialized');
    } catch (error) {
        console.error('Failed to initialize PostHog:', error);
    }
};

/**
 * Enable analytics tracking after user consent
 */
export const enableAnalytics = () => {
    if (!analyticsInitialized) {
        console.warn('Analytics not initialized');
        return;
    }

    posthog.opt_in_capturing();
    console.log('Analytics tracking enabled');
};

/**
 * Disable analytics tracking
 */
export const disableAnalytics = () => {
    if (!analyticsInitialized) {
        return;
    }

    posthog.opt_out_capturing();
    console.log('Analytics tracking disabled');
};

/**
 * Tracks a conversion funnel event.
 *
 * @param {string} eventName The name of the funnel event to track.
 * @param {object} [properties={}] Additional properties to associate with the event.
 */
export const trackFunnelEvent = (eventName, properties = {}) => {
    if (!analyticsInitialized || !posthog.has_opted_in_capturing()) {
        return;
    }

    const funnelEvents = {
        'page_visit': 'Funnel: Page Visit',
        'contact_form_view': 'Funnel: Contact Form Viewed',
        'contact_form_submit': 'Funnel: Contact Form Submitted',
        'appointment_form_view': 'Funnel: Appointment Form Viewed',
        'appointment_form_submit': 'Funnel: Appointment Submitted',
        'appointment_confirmed': 'Funnel: Appointment Confirmed',
    };

    const eventKey = funnelEvents[eventName];
    if (!eventKey) {
        console.warn(`Unknown funnel event: ${eventName}`);
        return;
    }

    try {
        posthog.capture(eventKey, {
            ...properties,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            page_title: document.title,
        });
    } catch (error) {
        console.error('Failed to track funnel event:', error);
    }
};

/**
 * Extracts and tracks UTM parameters from the current URL.
 */
export const trackUTMParameters = () => {
    if (!analyticsInitialized || !posthog.has_opted_in_capturing()) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};

    // Extract UTM parameters
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        const value = urlParams.get(param);
        if (value) {
            utmParams[param] = value;
        }
    });

    // Track if we have UTM parameters
    if (Object.keys(utmParams).length > 0) {
        try {
            posthog.capture('UTM Parameters Detected', {
                ...utmParams,
                referrer: document.referrer,
                landing_page: window.location.pathname,
            });

            // Set user properties for attribution
            posthog.people.set({
                $utm_source: utmParams.utm_source,
                $utm_medium: utmParams.utm_medium,
                $utm_campaign: utmParams.utm_campaign,
            });
        } catch (error) {
            console.error('Failed to track UTM parameters:', error);
        }
    }
};

/**
 * Tracks a Core Web Vitals metric.
 *
 * @param {object} metric The metric object to track.
 * @param {string} metric.name The name of the metric.
 * @param {number} metric.value The value of the metric.
 * @param {string} metric.rating The rating of the metric ('good', 'needs-improvement', or 'poor').
 */
export const trackWebVitals = (metric) => {
    if (!analyticsInitialized || !posthog.has_opted_in_capturing()) {
        return;
    }

    try {
        posthog.capture('Web Vital', {
            metric_name: metric.name,
            metric_value: metric.value,
            metric_rating: metric.rating,
            page_url: window.location.href,
        });
    } catch (error) {
        console.error('Failed to track web vital:', error);
    }
};

/**
 * Tracks a page view manually.
 *
 * @param {string} [path=null] The path of the page to track. If not provided, it defaults to the current path.
 */
export const trackPageView = (path = null) => {
    if (!analyticsInitialized || !posthog.has_opted_in_capturing()) {
        return;
    }

    try {
        const currentPath = path || window.location.pathname;
        posthog.capture('$pageview', {
            $current_url: window.location.href,
            $pathname: currentPath,
            $title: document.title,
        });
    } catch (error) {
        console.error('Failed to track page view:', error);
    }
};

/**
 * Tracks a user interaction event.
 *
 * @param {string} action The action performed by the user (e.g., 'click', 'submit').
 * @param {string} element The element that was interacted with (e.g., 'button', 'link').
 * @param {object} [properties={}] Additional properties to associate with the event.
 */
export const trackUserInteraction = (action, element, properties = {}) => {
    if (!analyticsInitialized || !posthog.has_opted_in_capturing()) {
        return;
    }

    try {
        posthog.capture('User Interaction', {
            action,
            element,
            ...properties,
            page_url: window.location.href,
        });
    } catch (error) {
        console.error('Failed to track user interaction:', error);
    }
};

/**
 * Tracks appointment-related metrics.
 *
 * @param {string} status The status of the appointment (e.g., 'started', 'completed').
 * @param {object} [appointmentData={}] Additional data related to the appointment.
 */
export const trackAppointmentMetrics = (status, appointmentData = {}) => {
    if (!analyticsInitialized || !posthog.has_opted_in_capturing()) {
        return;
    }

    const events = {
        'started': 'Appointment: Booking Started',
        'completed': 'Appointment: Booking Completed',
        'confirmed': 'Appointment: Confirmed',
        'cancelled': 'Appointment: Cancelled',
        'no_show': 'Appointment: No Show',
    };

    const eventName = events[status];
    if (!eventName) {
        console.warn(`Unknown appointment status: ${status}`);
        return;
    }

    try {
        posthog.capture(eventName, {
            ...appointmentData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Failed to track appointment metric:', error);
    }
};

/**
 * Gets the PostHog instance for advanced usage.
 *
 * @returns {object|null} The PostHog instance, or `null` if not initialized.
 */
export const getAnalyticsInstance = () => {
    return analyticsInitialized ? posthog : null;
};

/**
 * Checks if analytics is initialized and the user has opted in to tracking.
 *
 * @returns {boolean} `true` if analytics is enabled, `false` otherwise.
 */
export const isAnalyticsEnabled = () => {
    return analyticsInitialized && posthog.has_opted_in_capturing();
};

export default {
    initialize: initializeAnalytics,
    enable: enableAnalytics,
    disable: disableAnalytics,
    trackFunnelEvent,
    trackUTMParameters,
    trackWebVitals,
    trackPageView,
    trackUserInteraction,
    trackAppointmentMetrics,
    getInstance: getAnalyticsInstance,
    isEnabled: isAnalyticsEnabled,
};