/**
 * PostHog Analytics and Feature Flags Configuration
 * Saraiva Vision PostHog Integration
 */

import posthog from 'posthog-js';

// PostHog configuration
const POSTHOG_CONFIG = {
    api_host: process.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    // Enable feature flags
    loaded: function(posthog) {
        if (import.meta.env.DEV) {
            console.log('PostHog loaded successfully');
        }
    },
    // Feature flags configuration
    feature_flag_request_timeout_ms: 3000,
    // Enable session recording (optional)
    capture_pageview: true,
    capture_pageleave: true,
    // Privacy settings
    respect_dnt: true,
    opt_out_capturing_by_default: false,
    // Performance optimizations
    disable_session_recording: false,
    session_recording: {
        maskAllInputs: true,
        maskInputOptions: {
            password: true,
            email: false
        }
    }
};

/**
 * Initializes the PostHog analytics and feature flagging library.
 *
 * @returns {object|null} The PostHog instance, or `null` if the key is not found.
 */
export const initializePostHog = () => {
    const posthogKey = process.env.VITE_POSTHOG_KEY;
    
    if (!posthogKey) {
        console.warn('PostHog key not found. Feature flags will not work.');
        return null;
    }

    if (typeof window !== 'undefined') {
        posthog.init(posthogKey, POSTHOG_CONFIG);
        
        // Enable debug mode in development
        if (import.meta.env.DEV) {
            posthog.debug(true);
        }
    }
    
    return posthog;
};

/**
 * A utility class for working with PostHog feature flags.
 */
export class FeatureFlags {
    /**
     * Checks if a feature flag is enabled.
     *
     * @param {string} flagName The name of the feature flag.
     * @param {boolean} [defaultValue=false] The default value to return if the flag is not available.
     * @returns {boolean} `true` if the feature flag is enabled, `false` otherwise.
     */
    static isEnabled(flagName, defaultValue = false) {
        try {
            if (typeof window === 'undefined') {
                return defaultValue;
            }
            
            return posthog.isFeatureEnabled(flagName) || defaultValue;
        } catch (error) {
            console.warn(`Error checking feature flag ${flagName}:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Executes a callback function after the feature flags have been loaded.
     *
     * @param {function(): void} callback The function to execute.
     * @param {number} [timeout=3000] The timeout in milliseconds to wait for the flags to load.
     */
    static onFeatureFlags(callback, timeout = 3000) {
        if (typeof window === 'undefined') {
            callback();
            return;
        }
        
        // Set a timeout to prevent hanging
        const timeoutId = setTimeout(() => {
            console.warn('PostHog feature flags timeout reached');
            callback();
        }, timeout);
        
        posthog.onFeatureFlags(() => {
            clearTimeout(timeoutId);
            callback();
        });
    }
    
    /**
     * Gets the value of a feature flag.
     *
     * @param {string} flagName The name of the feature flag.
     * @param {any} [defaultValue=null] The default value to return if the flag is not available.
     * @returns {any} The value of the feature flag, or the default value.
     */
    static getFeatureFlag(flagName, defaultValue = null) {
        try {
            if (typeof window === 'undefined') {
                return defaultValue;
            }
            
            const value = posthog.getFeatureFlag(flagName);
            return value !== undefined ? value : defaultValue;
        } catch (error) {
            console.warn(`Error getting feature flag ${flagName}:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Checks if the Instagram integration feature flag is enabled.
     *
     * @returns {boolean} `true` if the Instagram integration is enabled, `false` otherwise.
     */
    static isInstagramIntegrationEnabled() {
        return this.isEnabled('instagram_integration', true); // Default to true for fallback
    }
    
    /**
     * Checks if the Instagram web crawler feature flag is enabled.
     *
     * @returns {boolean} `true` if the Instagram web crawler is enabled, `false` otherwise.
     */
    static isInstagramWebCrawlerEnabled() {
        return this.isEnabled('instagram_web_crawler', true); // Default to true
    }
    
    /**
     * Checks if the Instagram real data feature flag is enabled.
     *
     * @returns {boolean} `true` if the Instagram real data feature is enabled, `false` otherwise.
     */
    static isInstagramRealDataEnabled() {
        return this.isEnabled('instagram_real_data', true); // Default to true
    }
    
    /**
     * Checks if the analytics features are enabled.
     *
     * @returns {boolean} `true` if analytics are enabled, `false` otherwise.
     */
    static isAnalyticsEnabled() {
        return this.isEnabled('analytics_enabled', true);
    }
}

/**
 * A utility class for tracking analytics events with PostHog.
 */
export class Analytics {
    /**
     * Tracks a custom event.
     *
     * @param {string} event The name of the event to track.
     * @param {object} [properties={}] Additional properties to associate with the event.
     */
    static track(event, properties = {}) {
        try {
            if (typeof window === 'undefined') {
                return;
            }
            
            posthog.capture(event, {
                ...properties,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            });
        } catch (error) {
            console.warn(`Error tracking event ${event}:`, error);
        }
    }
    
    /**
     * Tracks an event related to the Instagram integration.
     *
     * @param {string} action The specific action that occurred (e.g., 'view', 'click').
     * @param {object} [properties={}] Additional properties to associate with the event.
     */
    static trackInstagramIntegration(action, properties = {}) {
        this.track('instagram_integration', {
            action,
            ...properties
        });
    }
    
    /**
     * Tracks a page view event.
     *
     * @param {string} pageName The name of the page being viewed.
     */
    static trackPageView(pageName) {
        this.track('page_view', {
            page_name: pageName,
            url: window.location.href
        });
    }
    
    /**
     * Identifies a user and associates them with subsequent events.
     *
     * @param {string} userId A unique identifier for the user.
     * @param {object} [properties={}] Additional properties to set on the user's profile.
     */
    static identify(userId, properties = {}) {
        try {
            if (typeof window === 'undefined') {
                return;
            }
            
            posthog.identify(userId, properties);
        } catch (error) {
            console.warn('Error identifying user:', error);
        }
    }
}

/**
 * PostHog instance
 */
export { posthog };

export default {
    initialize: initializePostHog,
    FeatureFlags,
    Analytics,
    posthog
};