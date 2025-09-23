/**
 * PostHog Context Provider
 * Provides PostHog analytics and feature flags throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializePostHog, FeatureFlags, Analytics, posthog } from '../lib/posthog';

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
    
    useEffect(() => {
        // Initialize PostHog
        const posthogInstance = initializePostHog();
        
        if (!posthogInstance) {
            console.warn('PostHog not initialized. Feature flags will use defaults.');
            setIsLoaded(true);
            return;
        }
        
        // Wait for feature flags to load
        FeatureFlags.onFeatureFlags(() => {
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
     * Track an event
     */
    const trackEvent = (event, properties = {}) => {
        if (!isLoaded || !featureFlags.analytics_enabled) {
            return;
        }
        
        Analytics.track(event, properties);
    };
    
    /**
     * Track Instagram integration events
     */
    const trackInstagramIntegration = (action, properties = {}) => {
        if (!isLoaded || !featureFlags.analytics_enabled) {
            return;
        }
        
        Analytics.trackInstagramIntegration(action, properties);
    };
    
    /**
     * Identify user
     */
    const identifyUser = (userId, properties = {}) => {
        if (!isLoaded || !featureFlags.analytics_enabled) {
            return;
        }
        
        Analytics.identify(userId, properties);
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