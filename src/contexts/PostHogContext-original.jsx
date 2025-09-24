/**
 * PostHog Context Provider
 * Provides PostHog analytics and feature flags throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializePostHog, FeatureFlags, Analytics, posthog } from '../lib/posthog';
import AnalyticsFallback from '../utils/analyticsFallback';

const PostHogContext = createContext({
    isLoaded: false,
    featureFlags: {},
    isFeatureEnabled: () => false,
    trackEvent: () => {},
    trackInstagramIntegration: () => {},
    identifyUser: () => {}
});

export const usePostHog = () => {
    const context = useContext(PostHogContext);
    if (!context) {
        throw new Error('usePostHog must be used within a PostHogProvider');
    }
    return context;
};

export const PostHogProvider = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [featureFlags, setFeatureFlags] = useState({});
    const [analytics, setAnalytics] = useState(Analytics);

    useEffect(() => {
        // Initialize PostHog
        const posthogInstance = initializePostHog();

        // Initialize fallback analytics if PostHog is blocked
        const fallbackAnalytics = AnalyticsFallback.initializeWithFallback(Analytics);
        setAnalytics(fallbackAnalytics);

        if (!posthogInstance) {
            console.warn('PostHog not initialized. Using fallback analytics and default feature flags.');
            setIsLoaded(true);
            setFeatureFlags({
                instagram_integration: true,
                instagram_web_crawler: true,
                instagram_real_data: true,
                analytics_enabled: false
            });
            return;
        }

        // Wait for feature flags to load with timeout
        const timeoutId = setTimeout(() => {
            if (!isLoaded) {
                console.warn('PostHog feature flags timeout - using defaults');
                setIsLoaded(true);
                setFeatureFlags({
                    instagram_integration: true,
                    instagram_web_crawler: true,
                    instagram_real_data: true,
                    analytics_enabled: false
                });
            }
        }, 5000);

        FeatureFlags.onFeatureFlags(() => {
            clearTimeout(timeoutId);
            // Load all feature flags
            const flags = {
                instagram_integration: FeatureFlags.isInstagramIntegrationEnabled(),
                instagram_web_crawler: FeatureFlags.isInstagramWebCrawlerEnabled(),
                instagram_real_data: FeatureFlags.isInstagramRealDataEnabled(),
                analytics_enabled: FeatureFlags.isAnalyticsEnabled()
            };

            setFeatureFlags(flags);
            setIsLoaded(true);

            if (import.meta.env.DEV) {
                console.log('PostHog feature flags loaded:', flags);
            }
        });

        // Cleanup on unmount
        return () => {
            clearTimeout(timeoutId);
            // PostHog cleanup is handled automatically
        };
    }, []);
    
    /**
     * Check if a feature flag is enabled
     */
    const isFeatureEnabled = (flagName, defaultValue = false) => {
        if (!isLoaded) {
            return defaultValue;
        }
        
        return FeatureFlags.isEnabled(flagName, defaultValue);
    };
    
    /**
     * Track an event with fallback support
     */
    const trackEvent = (event, properties = {}) => {
        if (!isLoaded) {
            return;
        }

        // Use fallback analytics if regular analytics are disabled or blocked
        if (!featureFlags.analytics_enabled) {
            analytics.track(event, properties);
            return;
        }

        try {
            Analytics.track(event, properties);
        } catch (error) {
            // Fallback to safe analytics
            analytics.track(event, properties);
        }
    };

    /**
     * Track Instagram integration events with fallback support
     */
    const trackInstagramIntegration = (action, properties = {}) => {
        if (!isLoaded) {
            return;
        }

        // Use fallback analytics if regular analytics are disabled or blocked
        if (!featureFlags.analytics_enabled) {
            analytics.track('instagram_integration', {
                action,
                ...properties
            });
            return;
        }

        try {
            Analytics.trackInstagramIntegration(action, properties);
        } catch (error) {
            // Fallback to safe analytics
            analytics.track('instagram_integration', {
                action,
                ...properties
            });
        }
    };

    /**
     * Identify user with fallback support
     */
    const identifyUser = (userId, properties = {}) => {
        if (!isLoaded) {
            return;
        }

        // Use fallback analytics if regular analytics are disabled or blocked
        if (!featureFlags.analytics_enabled) {
            analytics.identify(userId, properties);
            return;
        }

        try {
            Analytics.identify(userId, properties);
        } catch (error) {
            // Fallback to safe analytics
            analytics.identify(userId, properties);
        }
    };
    
    /**
     * Instagram specific feature flags with fallbacks
     */
    const instagramFeatures = {
        isEnabled: () => isFeatureEnabled('instagram_integration', true),
        isWebCrawlerEnabled: () => isFeatureEnabled('instagram_web_crawler', true),
        isRealDataEnabled: () => isFeatureEnabled('instagram_real_data', true)
    };
    
    const value = {
        isLoaded,
        featureFlags,
        isFeatureEnabled,
        trackEvent,
        trackInstagramIntegration,
        identifyUser,
        instagram: instagramFeatures,
        posthog: typeof window !== 'undefined' ? posthog : null
    };
    
    return (
        <PostHogContext.Provider value={value}>
            {children}
        </PostHogContext.Provider>
    );
};

/**
 * Hook for Instagram feature flags
 */
export const useInstagramFeatureFlags = () => {
    const { instagram, trackInstagramIntegration, isLoaded } = usePostHog();
    
    return {
        isLoaded,
        isEnabled: instagram.isEnabled,
        isWebCrawlerEnabled: instagram.isWebCrawlerEnabled,
        isRealDataEnabled: instagram.isRealDataEnabled,
        trackEvent: trackInstagramIntegration
    };
};

/**
 * HOC for components that need feature flags
 */
export const withFeatureFlags = (Component) => {
    return function FeatureFlaggedComponent(props) {
        const featureFlags = usePostHog();
        
        return <Component {...props} featureFlags={featureFlags} />;
    };
};

export default PostHogContext;