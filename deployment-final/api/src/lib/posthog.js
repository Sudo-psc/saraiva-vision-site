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
 * Initialize PostHog
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
 * Feature flag utilities
 */
export class FeatureFlags {
    /**
     * Check if a feature flag is enabled
     * @param {string} flagName - The name of the feature flag
     * @param {boolean} defaultValue - Default value if flag is not available
     * @returns {boolean}
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
     * Wait for feature flags to load, then execute callback
     * @param {Function} callback - Function to execute after flags are loaded
     * @param {number} timeout - Timeout in milliseconds (default: 3000)
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
     * Get the value of a feature flag
     * @param {string} flagName - The name of the feature flag
     * @param {any} defaultValue - Default value if flag is not available
     * @returns {any}
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
     * Instagram integration feature flag
     * @returns {boolean}
     */
    static isInstagramIntegrationEnabled() {
        return this.isEnabled('instagram_integration', true); // Default to true for fallback
    }
    
    /**
     * Instagram web crawler feature flag
     * @returns {boolean}
     */
    static isInstagramWebCrawlerEnabled() {
        return this.isEnabled('instagram_web_crawler', true); // Default to true
    }
    
    /**
     * Instagram real data feature flag
     * @returns {boolean}
     */
    static isInstagramRealDataEnabled() {
        return this.isEnabled('instagram_real_data', true); // Default to true
    }
    
    /**
     * Analytics features
     * @returns {boolean}
     */
    static isAnalyticsEnabled() {
        return this.isEnabled('analytics_enabled', true);
    }
}

/**
 * Event tracking utilities
 */
export class Analytics {
    /**
     * Track an event
     * @param {string} event - Event name
     * @param {object} properties - Event properties
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
     * Track Instagram integration events
     */
    static trackInstagramIntegration(action, properties = {}) {
        this.track('instagram_integration', {
            action,
            ...properties
        });
    }
    
    /**
     * Track page views
     */
    static trackPageView(pageName) {
        this.track('page_view', {
            page_name: pageName,
            url: window.location.href
        });
    }
    
    /**
     * Identify user
     * @param {string} userId - User ID
     * @param {object} properties - User properties
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