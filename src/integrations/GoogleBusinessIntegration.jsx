import React, { useState, useEffect } from 'react';
import GoogleReviewsWidget from '../components/GoogleReviewsWidget';
import BusinessStats from '../components/BusinessStats';
import ReviewsContainer from '../components/ReviewsContainer';
import GoogleBusinessConfig from '../services/googleBusinessConfig';
import CachedGoogleBusinessService from '../services/cachedGoogleBusinessService';

/**
 * GoogleBusinessIntegration Component
 * Integration layer for adding Google Business reviews to existing pages
 * Provides easy-to-use hooks and components for seamless integration
 */
class GoogleBusinessIntegration {
    constructor() {
        this.config = null;
        this.service = null;
        this.initialized = false;
    }

    /**
     * Initialize the Google Business integration
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize configuration
            this.config = new GoogleBusinessConfig();

            // Initialize cached service
            this.service = new CachedGoogleBusinessService();

            this.initialized = true;
            console.log('Google Business integration initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google Business integration:', error);
            throw error;
        }
    }

    /**
     * Get the current configuration
     */
    async getConfig() {
        if (!this.initialized) {
            await this.initialize();
        }

        return this.config ? this.config.getConfig() : null;
    }

    /**
     * Check if the integration is configured and ready
     */
    async isReady() {
        try {
            const config = await this.getConfig();
            return config && config.locationId && config.isActive !== false;
        } catch (error) {
            console.error('Error checking integration readiness:', error);
            return false;
        }
    }

    /**
     * Get reviews for a specific location
     */
    async getReviews(locationId, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (!this.service) {
            throw new Error('Service not initialized');
        }

        return this.service.getReviews(locationId, options);
    }

    /**
     * Get business statistics
     */
    async getBusinessStats(locationId) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (!this.service) {
            throw new Error('Service not initialized');
        }

        return this.service.getBusinessStats(locationId);
    }
}

// Create singleton instance
const googleBusinessIntegration = new GoogleBusinessIntegration();

/**
 * Hook for using Google Business integration
 */
export const useGoogleBusiness = (locationId) => {
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const checkIntegration = async () => {
            try {
                setLoading(true);
                setError(null);

                const ready = await googleBusinessIntegration.isReady();
                setIsReady(ready);

                if (ready) {
                    const configData = await googleBusinessIntegration.getConfig();
                    setConfig(configData);
                }
            } catch (error) {
                console.error('Error checking Google Business integration:', error);
                setError(error.message || 'Failed to initialize integration');
            } finally {
                setLoading(false);
            }
        };

        checkIntegration();
    }, []);

    const getReviews = async (options = {}) => {
        if (!isReady || !locationId) {
            throw new Error('Google Business integration not ready or location ID not provided');
        }

        return googleBusinessIntegration.getReviews(locationId, options);
    };

    const getBusinessStats = async () => {
        if (!isReady || !locationId) {
            throw new Error('Google Business integration not ready or location ID not provided');
        }

        return googleBusinessIntegration.getBusinessStats(locationId);
    };

    return {
        isReady,
        loading,
        error,
        config,
        getReviews,
        getBusinessStats
    };
};

/**
 * Simple Google Reviews Widget Component
 * Easy to use component for basic integration
 */
export const SimpleGoogleReviews = ({
    locationId,
    maxReviews = 5,
    showStats = true,
    className = '',
    ...props
}) => {
    const { isReady, loading, error } = useGoogleBusiness(locationId);

    if (loading) {
        return (
            <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                    <div className="space-y-3">
                        {[...Array(maxReviews)].map((_, i) => (
                            <div key={i} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3 mb-2"></div>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, j) => (
                                                <div key={j} className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded"></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !isReady) {
        return (
            <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 text-center ${className}`}>
                <div className="text-slate-500 dark:text-slate-400">
                    <p className="mb-2">Avaliações do Google Business não disponíveis</p>
                    <p className="text-sm">Verifique a configuração da integração</p>
                </div>
            </div>
        );
    }

    return (
        <GoogleReviewsWidget
            locationId={locationId}
            variant="compact"
            displayCount={maxReviews}
            showStats={showStats}
            className={className}
            {...props}
        />
    );
};

/**
 * Google Business Stats Component
 * Displays business statistics in a compact format
 */
export const GoogleBusinessStats = ({
    locationId,
    className = '',
    ...props
}) => {
    const { isReady, loading, error } = useGoogleBusiness(locationId);

    if (loading) {
        return (
            <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
                    <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-center">
                                <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-16 mx-auto mb-2"></div>
                                <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-20 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !isReady) {
        return null; // Don't show anything if stats are not available
    }

    return (
        <BusinessStats
            locationId={locationId}
            showTrends={false}
            showDistribution={true}
            showRecentActivity={false}
            className={className}
            {...props}
        />
    );
};

/**
 * Google Business Reviews Section Component
 * Complete section with header and reviews
 */
export const GoogleBusinessReviewsSection = ({
    locationId,
    title = "O que nossos clientes dizem",
    subtitle = "Avaliações autênticas do Google Business",
    maxReviews = 6,
    showStats = true,
    className = '',
    ...props
}) => {
    const { isReady, loading, error } = useGoogleBusiness(locationId);

    if (loading) {
        return (
            <section className={`py-12 ${className}`}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-64 mx-auto mb-4"></div>
                            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-96 mx-auto"></div>
                        </div>
                    </div>
                    <div className="animate-pulse space-y-4">
                        {[...Array(maxReviews)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/3 mb-2"></div>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, j) => (
                                                <div key={j} className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded"></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
                                    <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-4/5"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error || !isReady) {
        return null; // Don't show section if not available
    }

    return (
        <section className={`py-12 ${className}`}>
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                        {title}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {subtitle}
                    </p>
                </div>

                {showStats && (
                    <div className="mb-8">
                        <GoogleBusinessStats locationId={locationId} />
                    </div>
                )}

                <ReviewsContainer
                    locationId={locationId}
                    displayCount={maxReviews}
                    showStats={false}
                    enableFiltering={false}
                    enableSorting={false}
                    {...props}
                />
            </div>
        </section>
    );
};

/**
 * Google Business Footer Component
 * Compact widget for footer or sidebar
 */
export const GoogleBusinessFooter = ({
    locationId,
    className = '',
    ...props
}) => {
    const { isReady, loading, error } = useGoogleBusiness(locationId);

    if (loading) {
        return (
            <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 ${className}`}>
                <div className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-32 mb-2"></div>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !isReady) {
        return null;
    }

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 ${className}`}>
            <GoogleReviewsWidget
                locationId={locationId}
                variant="compact"
                displayCount={1}
                showStats={true}
                showHeader={false}
                showActions={false}
                {...props}
            />
        </div>
    );
};

// Export the integration instance for advanced usage
export { googleBusinessIntegration };

// Default export for convenience
export default GoogleBusinessIntegration;
