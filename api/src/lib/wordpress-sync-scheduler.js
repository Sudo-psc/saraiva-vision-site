// WordPress Synchronization Scheduler
// Automated routines for scheduled content synchronization and maintenance
// Integrates with existing WordPress headless API and cache systems

import { wordpressAPI } from './wordpress-headless-api.js';
import { wordPressCache } from './wordpress-cache.js';
import { supabase } from '../../utils/supabase.js';
import { logger } from './logger.js';

export class WordPressSyncScheduler {
  constructor(options = {}) {
    this.options = {
      defaultInterval: options.defaultInterval || 15 * 60 * 1000, // 15 minutes
      batchSize: options.batchSize || 20,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 5000,
      healthCheckInterval: options.healthCheckInterval || 5 * 60 * 1000, // 5 minutes
      cacheCleanupInterval: options.cacheCleanupInterval || 60 * 60 * 1000, // 1 hour
      ...options
    };

    this.isRunning = false;
    this.intervals = new Map();
    this.metrics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncTime: 0,
      lastSyncTime: null,
      lastError: null
    };
  }

  /**
   * Start the synchronization scheduler
   */
  async start() {
    if (this.isRunning) {
      logger.warn('WordPress sync scheduler is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting WordPress synchronization scheduler', this.options);

    try {
      // Schedule incremental sync
      const syncInterval = setInterval(
        () => this.runIncrementalSync(),
        this.options.defaultInterval
      );
      this.intervals.set('incremental_sync', syncInterval);

      // Schedule health check
      const healthInterval = setInterval(
        () => this.runHealthCheck(),
        this.options.healthCheckInterval
      );
      this.intervals.set('health_check', healthInterval);

      // Schedule cache cleanup
      const cleanupInterval = setInterval(
        () => this.runCacheCleanup(),
        this.options.cacheCleanupInterval
      );
      this.intervals.set('cache_cleanup', cleanupInterval);

      // Run initial sync
      await this.runIncrementalSync();

      logger.info('WordPress sync scheduler started successfully');

    } catch (error) {
      logger.error('Failed to start WordPress sync scheduler', { error: error.message });
      this.stop();
      throw error;
    }
  }

  /**
   * Stop the synchronization scheduler
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('WordPress sync scheduler is not running');
      return;
    }

    this.isRunning = false;

    // Clear all intervals
    for (const [name, intervalId] of this.intervals) {
      clearInterval(intervalId);
      logger.info(`Stopped scheduled task: ${name}`);
    }
    this.intervals.clear();

    logger.info('WordPress sync scheduler stopped');
  }

  /**
   * Run incremental synchronization
   * Syncs only posts modified since last sync
   */
  async runIncrementalSync() {
    if (!this.isRunning) return;

    const syncId = Date.now();
    const startTime = Date.now();

    try {
      logger.info('Starting incremental WordPress sync', { syncId });

      // Get last sync timestamp
      const lastSyncTime = await this.getLastSyncTime();
      const modifiedAfter = lastSyncTime || new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago

      // Fetch modified posts
      const modifiedPosts = await wordpressAPI.fetchModifiedPosts(
        modifiedAfter.toISOString(),
        { perPage: this.options.batchSize }
      );

      if (modifiedPosts.length === 0) {
        logger.info('No modified posts found for incremental sync', { syncId, lastSyncTime });
        await this.recordSyncEvent({
          sync_type: 'incremental',
          status: 'completed',
          posts_processed: 0,
          duration_ms: Date.now() - startTime,
          sync_id: syncId
        });
        return;
      }

      logger.info(`Processing ${modifiedPosts.length} modified posts`, { syncId });

      const results = {
        synced: 0,
        errors: 0,
        skipped: 0,
        deleted: 0
      };

      // Process posts in batches
      for (let i = 0; i < modifiedPosts.length; i += this.options.batchSize) {
        const batch = modifiedPosts.slice(i, i + this.options.batchSize);

        for (const post of batch) {
          try {
            if (post.status === 'trash' || post.status === 'draft') {
              // Remove from cache
              await wordPressCache.invalidatePost(post.id);
              results.deleted++;
              logger.debug(`Post ${post.id} removed from cache (status: ${post.status})`);

            } else if (post.status === 'publish') {
              // Check if we need to sync this post
              const shouldSync = await this.shouldSyncPost(post);

              if (shouldSync) {
                await wordPressCache.cachePost(post);
                results.synced++;
                logger.debug(`Post ${post.id} synced: "${post.title}"`);
              } else {
                results.skipped++;
                logger.debug(`Post ${post.id} skipped: no changes detected`);
              }
            } else {
              results.skipped++;
              logger.debug(`Post ${post.id} skipped: status ${post.status}`);
            }

          } catch (error) {
            results.errors++;
            logger.error(`Failed to sync post ${post.id}`, { error: error.message });
          }
        }

        // Small delay between batches to avoid overwhelming the system
        if (i + this.options.batchSize < modifiedPosts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Update cache lists if we synced any posts
      if (results.synced > 0 || results.deleted > 0) {
        await wordPressCache.invalidatePostsList();
      }

      // Update metrics
      const duration = Date.now() - startTime;
      this.updateMetrics(true, duration);

      // Record sync event
      await this.recordSyncEvent({
        sync_type: 'incremental',
        status: results.errors > 0 ? 'completed_with_errors' : 'completed',
        posts_processed: modifiedPosts.length,
        posts_synced: results.synced,
        posts_deleted: results.deleted,
        posts_skipped: results.skipped,
        errors: results.errors,
        duration_ms: duration,
        sync_id: syncId,
        last_modified_after: modifiedAfter.toISOString()
      });

      logger.info('Incremental sync completed', {
        syncId,
        duration: `${duration}ms`,
        results
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(false, duration);
      this.metrics.lastError = error.message;

      logger.error('Incremental sync failed', {
        syncId,
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`
      });

      // Record failed sync event
      await this.recordSyncEvent({
        sync_type: 'incremental',
        status: 'failed',
        error: error.message,
        duration_ms: duration,
        sync_id: syncId
      });

      // Don't throw error to prevent scheduler from stopping
    }
  }

  /**
   * Run full synchronization
   * Syncs all published posts (used for recovery or initial sync)
   */
  async runFullSync() {
    if (!this.isRunning) return;

    const syncId = Date.now();
    const startTime = Date.now();

    try {
      logger.info('Starting full WordPress sync', { syncId });

      let allPosts = [];
      let page = 1;
      let hasMorePosts = true;

      // Fetch all posts with pagination
      while (hasMorePosts && page <= 50) { // Limit to 50 pages max for safety
        const posts = await wordpressAPI.fetchPosts({
          perPage: this.options.batchSize,
          page
        });

        if (posts.length === 0) {
          hasMorePosts = false;
        } else {
          allPosts = allPosts.concat(posts);
          page++;

          // Stop if we get fewer posts than requested (last page)
          if (posts.length < this.options.batchSize) {
            hasMorePosts = false;
          }
        }

        // Prevent infinite loops
        if (allPosts.length > 1000) {
          logger.warn('Full sync reached maximum post limit (1000)', { syncId });
          break;
        }
      }

      logger.info(`Processing ${allPosts.length} posts for full sync`, { syncId });

      const results = {
        synced: 0,
        errors: 0,
        skipped: 0
      };

      // Process posts in batches
      for (let i = 0; i < allPosts.length; i += this.options.batchSize) {
        const batch = allPosts.slice(i, i + this.options.batchSize);

        for (const post of batch) {
          try {
            if (post.status === 'publish') {
              await wordPressCache.cachePost(post);
              results.synced++;

              if (results.synced % 10 === 0) {
                logger.info(`Full sync progress: ${results.synced}/${allPosts.length} posts`);
              }
            } else {
              results.skipped++;
            }

          } catch (error) {
            results.errors++;
            logger.error(`Failed to sync post ${post.id} in full sync`, {
              error: error.message
            });
          }
        }

        // Longer delay between batches for full sync
        if (i + this.options.batchSize < allPosts.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Clear and refresh cache lists
      await wordPressCache.invalidatePostsList();

      // Update metrics
      const duration = Date.now() - startTime;
      this.updateMetrics(results.errors === 0, duration);

      // Record sync event
      await this.recordSyncEvent({
        sync_type: 'full',
        status: results.errors > 0 ? 'completed_with_errors' : 'completed',
        posts_processed: allPosts.length,
        posts_synced: results.synced,
        posts_skipped: results.skipped,
        errors: results.errors,
        duration_ms: duration,
        sync_id: syncId
      });

      logger.info('Full sync completed', {
        syncId,
        duration: `${duration}ms`,
        results
      });

      return results;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(false, duration);
      this.metrics.lastError = error.message;

      logger.error('Full sync failed', {
        syncId,
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`
      });

      // Record failed sync event
      await this.recordSyncEvent({
        sync_type: 'full',
        status: 'failed',
        error: error.message,
        duration_ms: duration,
        sync_id: syncId
      });

      throw error;
    }
  }

  /**
   * Run health check on WordPress API and cache system
   */
  async runHealthCheck() {
    if (!this.isRunning) return;

    try {
      const healthResults = {
        wordpress_api: 'unknown',
        cache_service: 'unknown',
        database: 'unknown',
        overall: 'healthy',
        timestamp: new Date().toISOString()
      };

      // Check WordPress API
      try {
        const wpHealth = await wordpressAPI.healthCheck();
        healthResults.wordpress_api = wpHealth.status;
      } catch (error) {
        healthResults.wordpress_api = 'unhealthy';
        healthResults.overall = 'degraded';
        logger.warn('WordPress API health check failed', { error: error.message });
      }

      // Check cache service
      try {
        const cacheStats = await wordPressCache.getStats();
        healthResults.cache_service = 'healthy';
        healthResults.cache_stats = cacheStats;
      } catch (error) {
        healthResults.cache_service = 'unhealthy';
        healthResults.overall = 'degraded';
        logger.warn('Cache service health check failed', { error: error.message });
      }

      // Check database connectivity
      try {
        const { data, error } = await supabase
          .from('wordpress_sync_log')
          .select('id')
          .limit(1);

        healthResults.database = error ? 'unhealthy' : 'healthy';
        if (error) {
          healthResults.overall = 'degraded';
          logger.warn('Database health check failed', { error: error.message });
        }
      } catch (error) {
        healthResults.database = 'unhealthy';
        healthResults.overall = 'degraded';
        logger.warn('Database health check failed', { error: error.message });
      }

      // Record health check event
      await this.recordSyncEvent({
        sync_type: 'health_check',
        status: healthResults.overall,
        health_results: healthResults
      });

      if (healthResults.overall !== 'healthy') {
        logger.warn('System health check detected issues', healthResults);
      }

      return healthResults;

    } catch (error) {
      logger.error('Health check failed', { error: error.message });

      await this.recordSyncEvent({
        sync_type: 'health_check',
        status: 'failed',
        error: error.message
      });
    }
  }

  /**
   * Run cache cleanup routine
   */
  async runCacheCleanup() {
    if (!this.isRunning) return;

    try {
      logger.info('Starting cache cleanup routine');

      const cleanupResults = await wordPressCache.cleanup();

      logger.info('Cache cleanup completed', cleanupResults);

      // Record cleanup event
      await this.recordSyncEvent({
        sync_type: 'cache_cleanup',
        status: 'completed',
        cleanup_results: cleanupResults
      });

      return cleanupResults;

    } catch (error) {
      logger.error('Cache cleanup failed', { error: error.message });

      await this.recordSyncEvent({
        sync_type: 'cache_cleanup',
        status: 'failed',
        error: error.message
      });
    }
  }

  /**
   * Check if post should be synchronized based on modification time
   */
  async shouldSyncPost(post) {
    try {
      const cachedPost = await wordPressCache.getPost(post.id);

      if (!cachedPost) {
        return true; // Post not in cache
      }

      const postModified = new Date(post.modifiedAt);
      const cachedModified = new Date(cachedPost.modifiedAt);

      return postModified > cachedModified;

    } catch (error) {
      logger.warn(`Error checking sync status for post ${post.id}`, {
        error: error.message
      });
      return true; // Default to sync on error
    }
  }

  /**
   * Get the timestamp of the last successful sync
   */
  async getLastSyncTime() {
    try {
      const { data, error } = await supabase
        .from('wordpress_sync_log')
        .select('created_at')
        .eq('sync_type', 'incremental')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        logger.info('No previous sync time found, using default');
        return null;
      }

      return new Date(data.created_at);

    } catch (error) {
      logger.error('Failed to get last sync time', { error: error.message });
      return null;
    }
  }

  /**
   * Record synchronization event in database
   */
  async recordSyncEvent(eventData) {
    try {
      const { error } = await supabase
        .from('wordpress_sync_log')
        .insert({
          event_type: 'scheduled_sync',
          action: eventData.sync_type || 'unknown',
          operation_duration_ms: eventData.duration_ms,
          items_processed: eventData.posts_processed || 0,
          items_successful: eventData.posts_synced || 0,
          items_failed: eventData.errors || 0,
          items_skipped: eventData.posts_skipped || 0,
          error_message: eventData.error,
          event_data: eventData,
          triggered_by: 'scheduler',
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Failed to record sync event', { error: error.message });
      }

    } catch (error) {
      logger.error('Error recording sync event', { error: error.message });
    }
  }

  /**
   * Update internal metrics
   */
  updateMetrics(success, duration) {
    this.metrics.totalSyncs++;
    this.metrics.lastSyncTime = new Date().toISOString();

    if (success) {
      this.metrics.successfulSyncs++;
      this.metrics.lastError = null;
    } else {
      this.metrics.failedSyncs++;
    }

    // Update rolling average
    const totalDuration = (this.metrics.averageSyncTime * (this.metrics.totalSyncs - 1)) + duration;
    this.metrics.averageSyncTime = Math.round(totalDuration / this.metrics.totalSyncs);
  }

  /**
   * Get current scheduler metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      isRunning: this.isRunning,
      activeIntervals: Array.from(this.intervals.keys()),
      successRate: this.metrics.totalSyncs > 0
        ? Math.round((this.metrics.successfulSyncs / this.metrics.totalSyncs) * 100)
        : 0,
      nextIncrementalSync: this.isRunning
        ? new Date(Date.now() + this.options.defaultInterval).toISOString()
        : null
    };
  }

  /**
   * Trigger manual sync (full or incremental)
   */
  async triggerManualSync(type = 'incremental') {
    logger.info(`Manual sync triggered: ${type}`);

    if (type === 'full') {
      return await this.runFullSync();
    } else {
      return await this.runIncrementalSync();
    }
  }
}

// Create default scheduler instance
export const wordPressSyncScheduler = new WordPressSyncScheduler();

export default wordPressSyncScheduler;