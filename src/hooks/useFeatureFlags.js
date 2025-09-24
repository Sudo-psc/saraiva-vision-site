/**
 * Feature Flags Hook
 * Simple interface for PostHog feature flags
 */

import { usePostHog } from '../contexts/PostHogContext';
import { posthog } from '../lib/posthog';

export const useFeatureFlags = () => {
    const context = usePostHog();
    
    /**
     * Check if a feature flag is enabled with callback support
     * Supports the PostHog pattern:
     * 
     * // Ensure flags are loaded before usage
     * posthog.onFeatureFlags(function() {
     *     if (posthog.isFeatureEnabled('instagram_integration')) {
     *         // do something
     *     }
     * })
     * 
     * // Or directly:
     * if (posthog.isFeatureEnabled('instagram_integration')) {
     *     // do something
     * }
     */
    const isFeatureEnabled = (flagName, defaultValue = false) => {
        if (!context.isLoaded) {
            return defaultValue;
        }
        
        return context.isFeatureEnabled(flagName, defaultValue);
    };
    
    /**
     * Wait for feature flags to load, then execute callback
     * This mimics the PostHog onFeatureFlags pattern
     */
    const onFeatureFlags = (callback) => {
        if (context.isLoaded) {
            // Flags are already loaded, execute immediately
            callback();
        } else {
            // Wait for flags to load
            const checkInterval = setInterval(() => {
                if (context.isLoaded) {
                    clearInterval(checkInterval);
                    callback();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                callback(); // Execute anyway with defaults
            }, 5000);
        }
    };
    
    /**
     * Get raw PostHog instance for advanced usage
     */
    const getPostHog = () => {
        if (typeof window !== 'undefined') {
            return posthog;
        }
        return null;
    };
    
    return {
        isFeatureEnabled,
        onFeatureFlags,
        isLoaded: context.isLoaded,
        posthog: getPostHog(),
        trackEvent: context.trackEvent
    };
};

export default useFeatureFlags;