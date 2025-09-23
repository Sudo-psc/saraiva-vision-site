/**
 * Feature Flags Demo Component
 * Demonstrates PostHog feature flag usage patterns
 */

import React, { useEffect, useState } from 'react';
import { Settings, ToggleLeft, Eye, EyeOff } from 'lucide-react';
import useFeatureFlags from '../hooks/useFeatureFlags';

const FeatureFlagsDemo = () => {
    const { isFeatureEnabled, onFeatureFlags, isLoaded, posthog, trackEvent } = useFeatureFlags();
    const [demoResults, setDemoResults] = useState({});
    const [flagsLoaded, setFlagsLoaded] = useState(false);
    
    useEffect(() => {
        // Example 1: Ensure flags are loaded before usage
        // This is the first pattern you requested
        if (posthog) {
            posthog.onFeatureFlags(function() {
                // feature flags should be available at this point
                const results = {};
                
                if (posthog.isFeatureEnabled('instagram_integration')) {
                    results.instagram_integration = 'enabled';
                    console.log('Instagram integration is enabled!');
                } else {
                    results.instagram_integration = 'disabled';
                    console.log('Instagram integration is disabled');
                }
                
                if (posthog.isFeatureEnabled('instagram_web_crawler')) {
                    results.instagram_web_crawler = 'enabled';
                    console.log('Instagram web crawler is enabled!');
                } else {
                    results.instagram_web_crawler = 'disabled';
                    console.log('Instagram web crawler is disabled');
                }
                
                if (posthog.isFeatureEnabled('analytics_enabled')) {
                    results.analytics_enabled = 'enabled';
                    console.log('Analytics is enabled!');
                } else {
                    results.analytics_enabled = 'disabled';
                    console.log('Analytics is disabled');
                }
                
                setDemoResults(results);
                setFlagsLoaded(true);
            });
        }
        
        // Example 2: Direct usage (second pattern you requested)
        // This will work after flags are loaded
        const checkDirectly = () => {
            const directResults = {};
            
            if (isFeatureEnabled('instagram_integration')) {
                directResults.direct_instagram = 'enabled via direct check';
            } else {
                directResults.direct_instagram = 'disabled via direct check';
            }
            
            if (isFeatureEnabled('instagram_web_crawler')) {
                directResults.direct_crawler = 'enabled via direct check';
            } else {
                directResults.direct_crawler = 'disabled via direct check';
            }
            
            setDemoResults(prev => ({ ...prev, ...directResults }));
        };
        
        // Check directly after flags are loaded
        if (isLoaded) {
            checkDirectly();
        }
        
    }, [posthog, isFeatureEnabled, isLoaded]);
    
    // Track demo interaction
    const handleFeatureFlagTest = (flagName) => {
        trackEvent('feature_flag_demo', {
            flagName,
            enabled: isFeatureEnabled(flagName),
            timestamp: new Date().toISOString()
        });
    };
    
    const features = [
        {
            key: 'instagram_integration',
            name: 'Instagram Integration',
            description: 'Enable Instagram feed integration'
        },
        {
            key: 'instagram_web_crawler',
            name: 'Instagram Web Crawler',
            description: 'Enable web crawler for Instagram data'
        },
        {
            key: 'instagram_real_data',
            name: 'Instagram Real Data',
            description: 'Use real Instagram data instead of fallback'
        },
        {
            key: 'analytics_enabled',
            name: 'Analytics Tracking',
            description: 'Enable PostHog analytics and event tracking'
        }
    ];
    
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Settings className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">PostHog Feature Flags Demo</h2>
                </div>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">PostHog Integration Status</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            {isLoaded ? (
                                <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                            <span>Feature Flags Loaded: {isLoaded ? 'Yes' : 'Loading...'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {posthog ? (
                                <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                            <span>PostHog Instance: {posthog ? 'Available' : 'Not Available'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {flagsLoaded ? (
                                <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                            <span>onFeatureFlags Callback: {flagsLoaded ? 'Executed' : 'Waiting...'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Pattern 1: onFeatureFlags Callback</h4>
                        <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
{`posthog.onFeatureFlags(function() {
    if (posthog.isFeatureEnabled('instagram_integration')) {
        // do something
    }
})`}
                        </pre>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Pattern 2: Direct Check</h4>
                        <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
{`if (posthog.isFeatureEnabled('instagram_integration')) {
    // do something
}`}
                        </pre>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Feature Flags</h3>
                
                {features.map((feature) => {
                    const enabled = isFeatureEnabled(feature.key, false);
                    const result = demoResults[feature.key] || demoResults[`direct_${feature.key.split('_')[1]}`];
                    
                    return (
                        <div
                            key={feature.key}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <ToggleLeft
                                        className={`w-5 h-5 ${enabled ? 'text-green-600' : 'text-gray-400'}`}
                                    />
                                    <div>
                                        <h4 className="font-medium">{feature.name}</h4>
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                        {result && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                Result: {result}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    enabled 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {enabled ? 'Enabled' : 'Disabled'}
                                </div>
                                
                                <button
                                    onClick={() => handleFeatureFlagTest(feature.key)}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Test
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Code Examples</h4>
                <div className="space-y-4 text-sm">
                    <div>
                        <h5 className="font-medium mb-1">Instagram Integration Check:</h5>
                        <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
{`// Method 1: Wait for flags to load
posthog.onFeatureFlags(function() {
    if (posthog.isFeatureEnabled('instagram_integration')) {
        // Initialize Instagram component
        loadInstagramFeed();
    }
});

// Method 2: Direct check (after flags loaded)
if (posthog.isFeatureEnabled('instagram_integration')) {
    // Show Instagram widget
    showInstagramWidget();
}`}
                        </pre>
                    </div>
                    
                    <div>
                        <h5 className="font-medium mb-1">Web Crawler Feature:</h5>
                        <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
{`if (posthog.isFeatureEnabled('instagram_web_crawler')) {
    // Use web crawler method
    fetchDataViaWebCrawler();
} else {
    // Use fallback data
    useFallbackData();
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureFlagsDemo;