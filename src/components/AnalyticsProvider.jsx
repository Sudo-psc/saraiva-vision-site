/**
 * Analytics Provider Component
 * Initializes PostHog analytics and provides context to the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import analytics from '../lib/analytics';
import AnalyticsConsent from './AnalyticsConsent';

const AnalyticsContext = createContext({
    isInitialized: false,
    hasConsent: false,
    initializeAnalytics: () => { },
    enableAnalytics: () => { },
    disableAnalytics: () => { },
});

export const useAnalyticsContext = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
    }
    return context;
};

const AnalyticsProvider = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasConsent, setHasConsent] = useState(null);

    useEffect(() => {
        // Get PostHog API key from environment
        const apiKey = import.meta.env.VITE_POSTHOG_KEY;

        if (!apiKey) {
            console.warn('PostHog API key not found in environment variables');
            return;
        }

        // Check for existing consent
        const savedConsent = localStorage.getItem('analytics_consent');
        const consent = savedConsent === 'true';

        // Initialize analytics
        analytics.initialize(apiKey, consent);
        setIsInitialized(true);
        setHasConsent(consent);

        // Track UTM parameters on initial load
        if (consent) {
            analytics.trackUTMParameters();
        }
    }, []);

    const enableAnalytics = () => {
        analytics.enable();
        setHasConsent(true);

        // Track UTM parameters when analytics is enabled
        analytics.trackUTMParameters();
    };

    const disableAnalytics = () => {
        analytics.disable();
        setHasConsent(false);
    };

    const contextValue = {
        isInitialized,
        hasConsent,
        enableAnalytics,
        disableAnalytics,
    };

    return (
        <AnalyticsContext.Provider value={contextValue}>
            {children}
            <AnalyticsConsent />
        </AnalyticsContext.Provider>
    );
};

export default AnalyticsProvider;