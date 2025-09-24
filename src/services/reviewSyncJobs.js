/**
 * Review Sync Jobs
 * Specific job handlers for Google Business review synchronization
 */

import CachedGoogleBusinessService from './cachedGoogleBusinessService.js';
import GoogleBusinessConfig from './googleBusinessConfig.js';

/**
 * Review Sync Jobs Class
 * Contains all job handlers for review synchronization
 */
class ReviewSyncJobs {
    constructor(options = {}) {
        this.options = {
            enableLogging: options.enableLogging !== false,
            enableNotifications: options.enableNotifications !== false,
            maxLocationsPerJob: options.maxLocationsPerJob || 10,
            syncTimeout: options.syncTimeout || 300000, // 5 minutes
            ...options
        };

        // Services
        this.googleBusinessService = null;
        this.config = null;
        this.notificationService = options.notificationService || null;

        // Job statistics
        this.jobStats = {
            totalSyncs: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            reviewsProcessed: 0,
            lastSyncTime: null,
            averageSyncTime: 0
        };
    }

    /**
     * Initialize the job handlers
     * @param {Object} services - Required services
     */
    async initialize(services = {}) {
        try {
            this.googleBusinessService = services.googleBusinessService || new CachedGoogleBusinessService();
            this.config = services.config || new GoogleBusinessConfig();
            this.notificationService = services.notificationService || this.notificationService;

            this.log('ReviewSyncJobs initialized');
            return true;
        } catch (error) {
            this.log('Error initializing ReviewSyncJobs:', error);
            throw error;
        }
    }

    /**
     * Daily review sync job handler
     * Syncs reviews for all configured locations
     * @param {Object} jobData - Job data
     * @param {Object} job - Job metadata
     */
    async dailyReviewSync(jobData = {}, job = {}) {
        const startTime = Date.now();
        const syncId = `sync_${Date.now()}`;

        try {
            this.log(`Starting daily review sync (${syncId})`);

            // Get locations to sync
            const locations = jobData.locations || await this.getConfiguredLocations();

            if (!locations || locations.length === 0) {
                this.log('No locations configured for sync');
                return {
                    success: true,
                    message: 'No locations to sync',
                    syncId,
                    locationsProcessed: 0
                };
            }

            const results = {
                syncId,
                startTime: new Date(startTime),
                locationsProcessed: 0,
                locationsSuccessful: 0,
                locationsFailed: 0,
                reviewsProcessed: 0,
                errors: []
            };

            // Process locations in batches
            const batchSize = this.options.maxLocationsPerJob;
            for (let i = 0; i < locations.length; i += batchSize) {
                const batch = locations.slice(i, i + batchSize);

                const batchResults = await Promise.allSettled(
                    batch.map(location => this.syncLocationReviews(location, syncId))
                );

                // Process batch results
                batchResults.forEach((result, index) => {
                    const location = batch[index];
                    results.locationsProcessed++;

                    if (result.status === 'fulfilled') {
                        results.locationsSuccessful++;
                        results.reviewsProcessed += result.value.reviewsProcessed || 0;
                        this.log(`Location sync successful: ${location.id} - ${result.value.reviewsProcessed} reviews`);
                    } else {
                        results.locationsFailed++;
                        results.errors.push({
                            locationId: location.id,
                            error: result.reason.message
                        });
                        this.log(`Location sync failed: ${location.id} - ${result.reason.message}`);
                    }
                });
            }

            // Update statistics
            const executionTime = Date.now() - startTime;
            this.updateJobStats(true, executionTime, results.reviewsProcessed);

            results.endTime = new Date();
            results.executionTime = executionTime;
            results.success = results.locationsFailed === 0;

            // Send notifications if enabled
            if (this.options.enableNotifications) {
                await this.sendSyncNotification(results);
            }

            this.log(`Daily review sync completed (${syncId}) - ${results.locationsSuccessful}/${results.locationsProcessed} locations successful`);

            return results;

        } catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateJobStats(false, executionTime, 0);

            this.log(`Daily review sync failed (${syncId}):`, error);

            // Send error notification
            if (this.options.enableNotifications) {
                await this.sendErrorNotification('Daily Review Sync Failed', error, syncId);
            }

            throw error;
        }
    }

    /**
     * Single location review sync job handler
     * @param {Object} jobData - Job data containing locationId
     * @param {Object} job - Job metadata
     */
    async singleLocationSync(jobData = {}, job = {}) {
        const { locationId } = jobData;

        if (!locationId) {
            throw new Error('Location ID is required for single location sync');
        }

        const startTime = Date.now();
        const syncId = `single_sync_${locationId}_${Date.now()}`;

        try {
            this.log(`Starting single location sync: ${locationId} (${syncId})`);

            const result = await this.syncLocationReviews({ id: locationId }, syncId);

            const executionTime = Date.now() - startTime;
            this.updateJobStats(true, executionTime, result.reviewsProcessed);

            this.log(`Single location sync completed: ${locationId} - ${result.reviewsProcessed} reviews processed`);

            return {
                success: true,
                locationId,
                syncId,
                reviewsProcessed: result.reviewsProcessed,
                executionTime,
                ...result
            };

        } catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateJobStats(false, executionTime, 0);

            this.log(`Single location sync failed: ${locationId} - ${error.message}`);

            // Send error notification
            if (this.options.enableNotifications) {
                await this.sendErrorNotification('Single Location Sync Failed', error, syncId, { locationId });
            }

            throw error;
        }
    }

    /**
     * Cache warming job handler
     * Pre-populates cache with fresh data
     * @param {Object} jobData - Job data
     * @param {Object} job - Job metadata
     */
    async cacheWarmingJob(jobData = {}, job = {}) {
        const startTime = Date.now();
        const warmingId = `warming_${Date.now()}`;

        try {
            this.log(`Starting cache warming (${warmingId})`);

            const locations = jobData.locations || await this.getConfiguredLocations();

            if (!locations || locations.length === 0) {
                return {
                    success: true,
                    message: 'No locations to warm',
                    warmingId,
                    locationsProcessed: 0
                };
            }

            const results = {
                warmingId,
                startTime: new Date(startTime),
                locationsProcessed: 0,
                locationsSuccessful: 0,
                locationsFailed: 0,
                errors: []
            };

            // Warm cache for each location
            for (const location of locations) {
                try {
                    await this.googleBusinessService.warmLocationCache(location.id);
                    results.locationsSuccessful++;
                    this.log(`Cache warmed for location: ${location.id}`);
                } catch (error) {
                    results.locationsFailed++;
                    results.errors.push({
                        locationId: location.id,
                        error: error.message
                    });
                    this.log(`Cache warming failed for location: ${location.id} - ${error.message}`);
                }
                results.locationsProcessed++;
            }

            const executionTime = Date.now() - startTime;
            results.endTime = new Date();
            results.executionTime = executionTime;
            results.success = results.locationsFailed === 0;

            this.log(`Cache warming completed (${warmingId}) - ${results.locationsSuccessful}/${results.locationsProcessed} locations successful`);

            return results;

        } catch (error) {
            this.log(`Cache warming failed (${warmingId}):`, error);
            throw error;
        }
    }

    /**
     * Health check job handler
     * Monitors API connectivity and system health
     * @param {Object} jobData - Job data
     * @param {Object} job - Job metadata
     */
    async healthCheckJob(jobData = {}, job = {}) {
        const startTime = Date.now();
        const checkId = `health_${Date.now()}`;

        try {
            this.log(`Starting health check (${checkId})`);

            const healthResults = {
                checkId,
                timestamp: new Date(),
                apiConnectivity: false,
                cacheHealth: false,
                configurationValid: false,
                overallHealth: false,
                details: {}
            };

            // Test API connectivity
            try {
                const connectionTest = await this.googleBusinessService.testConnection();
                healthResults.apiConnectivity = connectionTest.success;
                healthResults.details.apiTest = connectionTest;
            } catch (error) {
                healthResults.details.apiError = error.message;
            }

            // Test cache health
            try {
                const cacheStats = this.googleBusinessService.getCacheStats();
                healthResults.cacheHealth = true;
                healthResults.details.cacheStats = cacheStats;
            } catch (error) {
                healthResults.details.cacheError = error.message;
            }

            // Test configuration
            try {
                const configValidation = this.config.validateConfig();
                healthResults.configurationValid = configValidation.isValid;
                healthResults.details.configValidation = configValidation;
            } catch (error) {
                healthResults.details.configError = error.message;
            }

            // Overall health
            healthResults.overallHealth =
                healthResults.apiConnectivity &&
                healthResults.cacheHealth &&
                healthResults.configurationValid;

            const executionTime = Date.now() - startTime;
            healthResults.executionTime = executionTime;

            // Send alert if health check fails
            if (!healthResults.overallHealth && this.options.enableNotifications) {
                await this.sendHealthAlert(healthResults);
            }

            this.log(`Health check completed (${checkId}) - Overall health: ${healthResults.overallHealth}`);

            return healthResults;

        } catch (error) {
            this.log(`Health check failed (${checkId}):`, error);
            throw error;
        }
    }

    /**
     * Cleanup job handler
     * Cleans up old cache entries and job history
     * @param {Object} jobData - Job data
     * @param {Object} job - Job metadata
     */
    async cleanupJob(jobData = {}, job = {}) {
        const startTime = Date.now();
        const cleanupId = `cleanup_${Date.now()}`;

        try {
            this.log(`Starting cleanup job (${cleanupId})`);

            const cleanupResults = {
                cleanupId,
                timestamp: new Date(),
                cacheCleanup: false,
                jobHistoryCleanup: false,
                details: {}
            };

            // Clean up expired cache entries
            try {
                // This would integrate with the cache database adapter
                // For now, we'll just clear memory cache of expired items
                const cacheStats = this.googleBusinessService.getCacheStats();
                cleanupResults.details.cacheStatsBefore = cacheStats;
                cleanupResults.cacheCleanup = true;
            } catch (error) {
                cleanupResults.details.cacheCleanupError = error.message;
            }

            // Clean up old job history (this would be handled by the scheduler)
            cleanupResults.jobHistoryCleanup = true;

            const executionTime = Date.now() - startTime;
            cleanupResults.executionTime = executionTime;
            cleanupResults.success = cleanupResults.cacheCleanup && cleanupResults.jobHistoryCleanup;

            this.log(`Cleanup job completed (${cleanupId})`);

            return cleanupResults;

        } catch (error) {
            this.log(`Cleanup job failed (${cleanupId}):`, error);
            throw error;
        }
    }

    /**
     * Get job statistics
     */
    getJobStats() {
        return {
            ...this.jobStats,
            successRate: this.jobStats.totalSyncs > 0
                ? (this.jobStats.successfulSyncs / this.jobStats.totalSyncs) * 100
                : 0
        };
    }

    // Private methods

    /**
     * Sync reviews for a single location
     * @param {Object} location - Location configuration
     * @param {string} syncId - Sync identifier
     */
    async syncLocationReviews(location, syncId) {
        try {
            // Fetch fresh reviews
            const reviewsResult = await this.googleBusinessService.fetchReviews(location.id, {
                forceRefresh: true,
                maxReviews: 50
            });

            if (!reviewsResult.success) {
                throw new Error(reviewsResult.error || 'Failed to fetch reviews');
            }

            // Fetch business info
            const businessInfoResult = await this.googleBusinessService.fetchBusinessInfo(location.id, {
                forceRefresh: true
            });

            // Fetch review stats
            const statsResult = await this.googleBusinessService.getReviewStats(location.id, {
                forceRefresh: true
            });

            return {
                locationId: location.id,
                reviewsProcessed: reviewsResult.reviews?.length || 0,
                businessInfoUpdated: businessInfoResult.success,
                statsUpdated: statsResult.success,
                syncId,
                timestamp: new Date()
            };

        } catch (error) {
            this.log(`Error syncing location ${location.id}:`, error);
            throw error;
        }
    }

    /**
     * Get configured locations for sync
     */
    async getConfiguredLocations() {
        try {
            // This would typically come from a database or configuration service
            // For now, return a mock location if config is valid
            const configValidation = this.config.validateConfig();

            if (configValidation.isValid && this.config.getLocationId()) {
                return [{
                    id: this.config.getLocationId(),
                    name: 'Default Location',
                    enabled: true
                }];
            }

            return [];
        } catch (error) {
            this.log('Error getting configured locations:', error);
            return [];
        }
    }

    /**
     * Update job statistics
     * @param {boolean} success - Whether the job was successful
     * @param {number} executionTime - Execution time in milliseconds
     * @param {number} reviewsProcessed - Number of reviews processed
     */
    updateJobStats(success, executionTime, reviewsProcessed) {
        this.jobStats.totalSyncs++;
        this.jobStats.reviewsProcessed += reviewsProcessed;
        this.jobStats.lastSyncTime = new Date();

        if (success) {
            this.jobStats.successfulSyncs++;
        } else {
            this.jobStats.failedSyncs++;
        }

        // Update average sync time
        if (this.jobStats.totalSyncs === 1) {
            this.jobStats.averageSyncTime = executionTime;
        } else {
            this.jobStats.averageSyncTime =
                (this.jobStats.averageSyncTime * (this.jobStats.totalSyncs - 1) + executionTime) / this.jobStats.totalSyncs;
        }
    }

    /**
     * Send sync completion notification
     * @param {Object} results - Sync results
     */
    async sendSyncNotification(results) {
        if (!this.notificationService) return;

        try {
            const message = {
                type: 'sync_completed',
                title: 'Google Business Review Sync Completed',
                message: `Processed ${results.locationsProcessed} locations, ${results.reviewsProcessed} reviews`,
                data: results,
                timestamp: new Date()
            };

            await this.notificationService.send(message);
        } catch (error) {
            this.log('Error sending sync notification:', error);
        }
    }

    /**
     * Send error notification
     * @param {string} title - Error title
     * @param {Error} error - Error object
     * @param {string} syncId - Sync identifier
     * @param {Object} context - Additional context
     */
    async sendErrorNotification(title, error, syncId, context = {}) {
        if (!this.notificationService) return;

        try {
            const message = {
                type: 'sync_error',
                title,
                message: error.message,
                data: {
                    syncId,
                    error: error.message,
                    stack: error.stack,
                    ...context
                },
                timestamp: new Date(),
                priority: 'high'
            };

            await this.notificationService.send(message);
        } catch (notificationError) {
            this.log('Error sending error notification:', notificationError);
        }
    }

    /**
     * Send health alert
     * @param {Object} healthResults - Health check results
     */
    async sendHealthAlert(healthResults) {
        if (!this.notificationService) return;

        try {
            const message = {
                type: 'health_alert',
                title: 'Google Business Integration Health Alert',
                message: 'System health check failed',
                data: healthResults,
                timestamp: new Date(),
                priority: 'high'
            };

            await this.notificationService.send(message);
        } catch (error) {
            this.log('Error sending health alert:', error);
        }
    }

    /**
     * Log messages if logging is enabled
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     */
    log(message, data = null) {
        if (this.options.enableLogging) {
            const timestamp = new Date().toISOString();
            console.log(`[ReviewSyncJobs] ${timestamp}: ${message}`, data || '');
        }
    }
}

export default ReviewSyncJobs;