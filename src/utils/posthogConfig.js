/**
 * PostHog Configuration and Utilities for Saraiva Vision
 */

// Feature flag keys used throughout the application
export const FEATURE_FLAGS = {
    // UI/UX Features
    NEW_APPOINTMENT_SYSTEM: 'new-appointment-system',
    ADVANCED_ANALYTICS: 'advanced-analytics',
    BETA_FEATURES: 'beta-features',
    DARK_MODE: 'dark-mode-toggle',

    // A/B Tests
    CTA_BUTTON_TEST: 'cta-button-test',
    PRICING_DISPLAY_TEST: 'pricing-display-test',
    HERO_SECTION_TEST: 'hero-section-test',
    CONTACT_FORM_TEST: 'contact-form-test',

    // Business Features
    ONLINE_BOOKING: 'online-booking-enabled',
    TELEMEDICINE: 'telemedicine-available',
    PAYMENT_INTEGRATION: 'payment-integration',
    INSURANCE_CHECKER: 'insurance-checker',

    // Content Features
    BLOG_RECOMMENDATIONS: 'blog-recommendations',
    PERSONALIZED_CONTENT: 'personalized-content',
    SOCIAL_PROOF: 'social-proof-widgets',

    // Performance Features
    LAZY_LOADING: 'lazy-loading-enabled',
    CDN_OPTIMIZATION: 'cdn-optimization',
    IMAGE_OPTIMIZATION: 'image-optimization',
};

// Event names for consistent tracking
export const EVENTS = {
    // Page Events
    PAGE_VIEW: '$pageview',
    PAGE_LEAVE: '$pageleave',

    // User Actions
    USER_ACTION: 'user_action',
    BUTTON_CLICK: 'button_click',
    FORM_SUBMIT: 'form_submit',
    FORM_ERROR: 'form_error',

    // Business Events
    BUSINESS_EVENT: 'business_event',
    APPOINTMENT_REQUEST: 'appointment_request',
    SERVICE_VIEWED: 'service_viewed',
    CONTACT_INTERACTION: 'contact_interaction',

    // Conversions
    CONVERSION: 'conversion',
    NEWSLETTER_SIGNUP: 'newsletter_signup',
    PHONE_CALL: 'phone_call',
    WHATSAPP_CLICK: 'whatsapp_click',

    // Engagement
    BLOG_ENGAGEMENT: 'blog_engagement',
    INSTAGRAM_INTERACTION: 'instagram_interaction',
    VIDEO_PLAY: 'video_play',
    SEARCH_QUERY: 'search_query',

    // Accessibility
    ACCESSIBILITY_FEATURE: 'accessibility_feature',

    // A/B Testing
    AB_TEST_VARIANT_VIEWED: 'ab_test_variant_viewed',
    AB_TEST_VARIANT_INTERACTION: 'ab_test_variant_interaction',

    // Errors
    ERROR_OCCURRED: 'error_occurred',
    API_ERROR: 'api_error',
    NETWORK_ERROR: 'network_error',
};

// User properties for segmentation
export const USER_PROPERTIES = {
    // Demographics
    AGE_GROUP: 'age_group',
    LOCATION: 'location',
    DEVICE_TYPE: 'device_type',

    // Behavior
    VISIT_COUNT: 'visit_count',
    LAST_VISIT: 'last_visit',
    PREFERRED_LANGUAGE: 'preferred_language',

    // Medical
    PATIENT_TYPE: 'patient_type', // new, returning, referred
    SERVICES_INTERESTED: 'services_interested',
    INSURANCE_TYPE: 'insurance_type',

    // Engagement
    BLOG_READER: 'blog_reader',
    NEWSLETTER_SUBSCRIBER: 'newsletter_subscriber',
    SOCIAL_FOLLOWER: 'social_follower',

    // Accessibility
    ACCESSIBILITY_NEEDS: 'accessibility_needs',
    PREFERRED_CONTRAST: 'preferred_contrast',
    FONT_SIZE_PREFERENCE: 'font_size_preference',
};

// PostHog configuration options
export const POSTHOG_CONFIG = {
    // Basic configuration
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',

    // Privacy and compliance
    respect_dnt: true,
    opt_out_capturing_by_default: false,
    cross_subdomain_cookie: true,
    secure_cookie: true,
    persistence: 'localStorage+cookie',
    persistence_name: 'saraiva_vision_posthog',

    // Autocapture settings
    autocapture: {
        dom_event_allowlist: ['click', 'change', 'submit'],
        url_allowlist: [window.location?.origin].filter(Boolean),
        css_selector_allowlist: [
            '[data-ph-capture]',
            '.ph-capture',
            'button',
            'a[href]',
            'input[type="submit"]',
            'input[type="button"]',
        ],
    },

    // Session recording
    disable_session_recording: false,
    session_recording: {
        maskAllInputs: true,
        maskInputOptions: {
            password: true,
            email: false,
            color: false,
            date: false,
            'datetime-local': false,
            month: false,
            number: false,
            range: false,
            search: false,
            tel: false,
            text: false,
            time: false,
            url: false,
            week: false,
        },
        recordCrossOriginIframes: false,
        recordCanvas: false,
        collectFonts: false,
    },

    // Feature flags
    bootstrap: {
        distinctID: undefined,
        isIdentifiedID: false,
        featureFlags: {},
    },

    // Advanced options
    capture_pageview: true,
    capture_pageleave: true,
    property_blacklist: ['$current_url', '$referrer'],

    // Custom sanitization
    sanitize_properties: (properties, event) => {
        // Remove query parameters from URLs for privacy
        if (properties['$current_url']) {
            properties['$current_url'] = properties['$current_url'].split('?')[0];
        }

        // Remove sensitive referrer information
        if (properties['$referrer']) {
            try {
                const referrerUrl = new URL(properties['$referrer']);
                properties['$referrer'] = referrerUrl.origin;
            } catch {
                delete properties['$referrer'];
            }
        }

        return properties;
    },

    // Development settings
    loaded: (posthog) => {
        if (import.meta.env.DEV) {
            posthog.debug();
            console.log('PostHog loaded in development mode');
        }
    },
};

// Utility functions for PostHog
export const posthogUtils = {
    /**
     * Check if PostHog is available and loaded
     */
    isAvailable: () => {
        return typeof window !== 'undefined' && window.posthog && window.posthog.__loaded;
    },

    /**
     * Safely execute PostHog operations
     */
    safeExecute: (operation) => {
        if (posthogUtils.isAvailable()) {
            try {
                return operation(window.posthog);
            } catch (error) {
                console.warn('PostHog operation failed:', error);
                return null;
            }
        }
        return null;
    },

    /**
     * Get current feature flags
     */
    getFeatureFlags: () => {
        return posthogUtils.safeExecute((posthog) => posthog.getFeatureFlags()) || [];
    },

    /**
     * Get feature flag with fallback
     */
    getFeatureFlag: (key, fallback = false) => {
        return posthogUtils.safeExecute((posthog) => posthog.getFeatureFlag(key)) ?? fallback;
    },

    /**
     * Check if user is identified
     */
    isIdentified: () => {
        return posthogUtils.safeExecute((posthog) => posthog.get_distinct_id() !== posthog.get_property('$device_id'));
    },

    /**
     * Get user properties
     */
    getUserProperties: () => {
        return posthogUtils.safeExecute((posthog) => posthog.get_property('$set')) || {};
    },

    /**
     * Batch track multiple events
     */
    batchTrack: (events) => {
        if (!Array.isArray(events)) return;

        events.forEach(({ event, properties }) => {
            posthogUtils.safeExecute((posthog) => posthog.capture(event, properties));
        });
    },

    /**
     * Track page performance
     */
    trackPerformance: (metrics) => {
        posthogUtils.safeExecute((posthog) => {
            posthog.capture('page_performance', {
                ...metrics,
                timestamp: new Date().toISOString(),
                url: window.location.pathname,
            });
        });
    },

    /**
     * Track error with context
     */
    trackError: (error, context = {}) => {
        posthogUtils.safeExecute((posthog) => {
            posthog.capture(EVENTS.ERROR_OCCURRED, {
                error_message: error.message,
                error_stack: error.stack,
                error_name: error.name,
                ...context,
                timestamp: new Date().toISOString(),
                url: window.location.pathname,
            });
        });
    },
};

// Export default configuration
export default POSTHOG_CONFIG;