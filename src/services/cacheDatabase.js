/**
 * Cache Database Adapter
 * Handles database operations for review cache persistence
 */

class CacheDatabase {
    constructor(databaseClient, options = {}) {
        this.db = databaseClient;
        this.options = {
            tableName: options.tableName || 'review_cache',
            statsTableName: options.statsTableName || 'cache_statistics',
            logTableName: options.logTableName || 'cache_invalidation_log',
            enableStatistics: options.enableStatistics !== false,
            enableLogging: options.enableLogging !== false,
            ...options
        };
    }

    /**
     * Get cached data from database
     * @param {string} cacheKey - Cache key
     * @param {string} locationId - Location ID
     */
    async get(cacheKey, locationId) {
        try {
            const query = `
        SELECT data, created_at, updated_at, expires_at, review_count, average_rating
        FROM ${this.options.tableName}
        WHERE cache_key = ? AND location_id = ? AND expires_at > NOW()
        LIMIT 1
      `;

            const result = await this.db.query(query, [cacheKey, locationId]);

            if (result.length === 0) {
                return null;
            }

            const row = result[0];
            const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

            // Add metadata
            data.metadata = {
                ...data.metadata,
                cachedAt: row.created_at,
                lastUpdated: row.updated_at,
                expiresAt: row.expires_at,
                reviewCount: row.review_count,
                averageRating: row.average_rating
            };

            return data;

        } catch (error) {
            console.error('Database cache get error:', error);
            return null;
        }
    }

    /**
     * Set cached data in database
     * @param {string} cacheKey - Cache key
     * @param {string} locationId - Location ID
     * @param {Object} data - Data to cache
     * @param {number} ttl - Time to live in seconds
     */
    async set(cacheKey, locationId, data, ttl) {
        try {
            const expiresAt = new Date(Date.now() + (ttl * 1000));
            const dataString = JSON.stringify(data);
            const dataSize = Buffer.byteLength(dataString, 'utf8');

            // Extract metadata for indexing
            const reviewCount = data.reviews ? data.reviews.length : 0;
            const averageRating = data.averageRating || 0;
            const dataType = this.determineDataType(cacheKey);

            const query = `
        INSERT INTO ${this.options.tableName} (
          cache_key, location_id, data_type, data, expires_at, 
          review_count, average_rating, data_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          data = VALUES(data),
          expires_at = VALUES(expires_at),
          review_count = VALUES(review_count),
          average_rating = VALUES(average_rating),
          data_size = VALUES(data_size),
          updated_at = CURRENT_TIMESTAMP
      `;

            await this.db.query(query, [
                cacheKey, locationId, dataType, dataString, expiresAt,
                reviewCount, averageRating, dataSize
            ]);

            return true;

        } catch (error) {
            console.error('Database cache set error:', error);
            throw error;
        }
    }

    /**
     * Delete cached data from database
     * @param {string} cacheKey - Cache key
     * @param {string} locationId - Location ID
     * @param {string} reason - Deletion reason
     */
    async delete(cacheKey, locationId, reason = 'manual') {
        try {
            const query = `DELETE FROM ${this.options.tableName} WHERE cache_key = ? AND location_id = ?`;
            const result = await this.db.query(query, [cacheKey, locationId]);

            // Log the deletion if logging is enabled
            if (this.options.enableLogging) {
                await this.logInvalidation(locationId, cacheKey, reason, 'system', {
                    deletedRows: result.affectedRows
                });
            }

            return result.affectedRows > 0;

        } catch (error) {
            console.error('Database cache delete error:', error);
            throw error;
        }
    }

    /**
     * Clear all cache entries for a location
     * @param {string} locationId - Location ID
     * @param {string} reason - Deletion reason
     */
    async clearLocation(locationId, reason = 'manual') {
        try {
            const query = `DELETE FROM ${this.options.tableName} WHERE location_id = ?`;
            const result = await this.db.query(query, [locationId]);

            // Log the bulk deletion
            if (this.options.enableLogging) {
                await this.logInvalidation(locationId, 'location_cache', reason, 'system', {
                    deletedRows: result.affectedRows
                });
            }

            return result.affectedRows;

        } catch (error) {
            console.error('Database cache clear location error:', error);
            throw error;
        }
    }

    /**
     * Clear all cache entries matching a pattern
     * @param {string} pattern - Cache key pattern
     * @param {string} reason - Deletion reason
     */
    async clearPattern(pattern, reason = 'manual') {
        try {
            const query = `DELETE FROM ${this.options.tableName} WHERE cache_key LIKE ?`;
            const result = await this.db.query(query, [pattern]);

            // Log the pattern deletion
            if (this.options.enableLogging) {
                await this.logInvalidation('system', pattern, reason, 'system', {
                    deletedRows: result.affectedRows,
                    pattern: pattern
                });
            }

            return result.affectedRows;

        } catch (error) {
            console.error('Database cache clear pattern error:', error);
            throw error;
        }
    }

    /**
     * Clean expired cache entries
     */
    async cleanExpired() {
        try {
            const query = `DELETE FROM ${this.options.tableName} WHERE expires_at < NOW()`;
            const result = await this.db.query(query);

            // Log the cleanup
            if (this.options.enableLogging) {
                await this.logInvalidation('system', 'expired_cleanup', 'expired', 'system', {
                    deletedRows: result.affectedRows
                });
            }

            return result.affectedRows;

        } catch (error) {
            console.error('Database cache clean expired error:', error);
            throw error;
        }
    }

    /**
     * Get cache statistics for a location
     * @param {string} locationId - Location ID
     */
    async getLocationStats(locationId) {
        try {
            const query = `
        SELECT 
          location_id,
          COUNT(*) as total_entries,
          SUM(CASE WHEN expires_at > NOW() THEN 1 ELSE 0 END) as active_entries,
          SUM(CASE WHEN expires_at <= NOW() THEN 1 ELSE 0 END) as expired_entries,
          AVG(review_count) as avg_review_count,
          AVG(average_rating) as avg_rating,
          SUM(data_size) as total_data_size,
          MIN(created_at) as oldest_entry,
          MAX(updated_at) as newest_entry
        FROM ${this.options.tableName}
        WHERE location_id = ?
        GROUP BY location_id
      `;

            const result = await this.db.query(query, [locationId]);
            return result.length > 0 ? result[0] : null;

        } catch (error) {
            console.error('Database get location stats error:', error);
            return null;
        }
    }

    /**
     * Get overall cache statistics
     */
    async getOverallStats() {
        try {
            const query = `
        SELECT 
          COUNT(*) as total_entries,
          COUNT(DISTINCT location_id) as unique_locations,
          SUM(CASE WHEN expires_at > NOW() THEN 1 ELSE 0 END) as active_entries,
          SUM(CASE WHEN expires_at <= NOW() THEN 1 ELSE 0 END) as expired_entries,
          AVG(review_count) as avg_review_count,
          AVG(average_rating) as avg_rating,
          SUM(data_size) as total_data_size,
          MIN(created_at) as oldest_entry,
          MAX(updated_at) as newest_entry
        FROM ${this.options.tableName}
      `;

            const result = await this.db.query(query);
            return result.length > 0 ? result[0] : null;

        } catch (error) {
            console.error('Database get overall stats error:', error);
            return null;
        }
    }

    /**
     * Update cache performance statistics
     * @param {string} locationId - Location ID
     * @param {Object} stats - Performance statistics
     */
    async updatePerformanceStats(locationId, stats) {
        if (!this.options.enableStatistics) return;

        try {
            const query = `
        INSERT INTO ${this.options.statsTableName} (
          location_id, date, cache_hits, cache_misses, cache_sets, cache_deletes, cache_errors,
          avg_response_time_ms, max_response_time_ms, min_response_time_ms,
          total_reviews_cached, total_data_size_bytes
        ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          cache_hits = cache_hits + VALUES(cache_hits),
          cache_misses = cache_misses + VALUES(cache_misses),
          cache_sets = cache_sets + VALUES(cache_sets),
          cache_deletes = cache_deletes + VALUES(cache_deletes),
          cache_errors = cache_errors + VALUES(cache_errors),
          avg_response_time_ms = (avg_response_time_ms + VALUES(avg_response_time_ms)) / 2,
          max_response_time_ms = GREATEST(max_response_time_ms, VALUES(max_response_time_ms)),
          min_response_time_ms = LEAST(min_response_time_ms, VALUES(min_response_time_ms)),
          total_reviews_cached = VALUES(total_reviews_cached),
          total_data_size_bytes = VALUES(total_data_size_bytes),
          updated_at = CURRENT_TIMESTAMP
      `;

            await this.db.query(query, [
                locationId,
                stats.hits || 0,
                stats.misses || 0,
                stats.sets || 0,
                stats.deletes || 0,
                stats.errors || 0,
                stats.avgResponseTime || 0,
                stats.maxResponseTime || 0,
                stats.minResponseTime || 0,
                stats.totalReviews || 0,
                stats.totalDataSize || 0
            ]);

        } catch (error) {
            console.error('Database update performance stats error:', error);
        }
    }

    /**
     * Get performance statistics for a location
     * @param {string} locationId - Location ID
     * @param {number} days - Number of days to look back
     */
    async getPerformanceStats(locationId, days = 7) {
        if (!this.options.enableStatistics) return [];

        try {
            const query = `
        SELECT 
          date,
          cache_hits,
          cache_misses,
          cache_sets,
          cache_deletes,
          cache_errors,
          avg_response_time_ms,
          max_response_time_ms,
          min_response_time_ms,
          total_reviews_cached,
          total_data_size_bytes,
          ROUND((cache_hits / (cache_hits + cache_misses)) * 100, 2) as hit_rate_percent
        FROM ${this.options.statsTableName}
        WHERE location_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ORDER BY date DESC
      `;

            return await this.db.query(query, [locationId, days]);

        } catch (error) {
            console.error('Database get performance stats error:', error);
            return [];
        }
    }

    /**
     * Log cache invalidation
     * @param {string} locationId - Location ID
     * @param {string} cacheKey - Cache key
     * @param {string} reason - Invalidation reason
     * @param {string} invalidatedBy - Who invalidated the cache
     * @param {Object} context - Additional context
     */
    async logInvalidation(locationId, cacheKey, reason, invalidatedBy = 'system', context = null) {
        if (!this.options.enableLogging) return;

        try {
            const query = `
        INSERT INTO ${this.options.logTableName} (
          location_id, cache_key, invalidation_reason, invalidated_by, context
        ) VALUES (?, ?, ?, ?, ?)
      `;

            await this.db.query(query, [
                locationId,
                cacheKey,
                reason,
                invalidatedBy,
                context ? JSON.stringify(context) : null
            ]);

        } catch (error) {
            console.error('Database log invalidation error:', error);
        }
    }

    /**
     * Get recent invalidations
     * @param {string} locationId - Location ID (optional)
     * @param {number} hours - Hours to look back
     */
    async getRecentInvalidations(locationId = null, hours = 24) {
        if (!this.options.enableLogging) return [];

        try {
            let query = `
        SELECT 
          location_id,
          cache_key,
          invalidation_reason,
          invalidated_by,
          invalidated_at,
          context
        FROM ${this.options.logTableName}
        WHERE invalidated_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      `;

            const params = [hours];

            if (locationId) {
                query += ' AND location_id = ?';
                params.push(locationId);
            }

            query += ' ORDER BY invalidated_at DESC LIMIT 100';

            const results = await this.db.query(query, params);

            // Parse context JSON
            return results.map(row => ({
                ...row,
                context: row.context ? JSON.parse(row.context) : null
            }));

        } catch (error) {
            console.error('Database get recent invalidations error:', error);
            return [];
        }
    }

    /**
     * Determine data type from cache key
     * @param {string} cacheKey - Cache key
     */
    determineDataType(cacheKey) {
        if (cacheKey.includes(':reviews:')) return 'reviews';
        if (cacheKey.includes(':business_info:')) return 'business_info';
        if (cacheKey.includes(':stats:')) return 'stats';
        return 'reviews'; // default
    }

    /**
     * Health check for database connection
     */
    async healthCheck() {
        try {
            await this.db.query('SELECT 1');
            return { healthy: true, message: 'Database connection OK' };
        } catch (error) {
            return { healthy: false, message: error.message };
        }
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.db && typeof this.db.close === 'function') {
            await this.db.close();
        }
    }
}

export default CacheDatabase;