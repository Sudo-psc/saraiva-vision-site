-- Review Cache Database Schema
-- Provides persistent storage for Google Business review cache

-- Main review cache table
CREATE TABLE IF NOT EXISTS review_cache (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    location_id VARCHAR(255) NOT NULL,
    data_type ENUM('reviews', 'business_info', 'stats') NOT NULL DEFAULT 'reviews',
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Metadata
    review_count INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    data_size INT DEFAULT 0,
    compression_enabled BOOLEAN DEFAULT FALSE,
    encryption_enabled BOOLEAN DEFAULT FALSE,
    
    -- Indexes
    INDEX idx_location_id (location_id),
    INDEX idx_data_type (data_type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_at (created_at),
    INDEX idx_location_type (location_id, data_type)
);

-- Cache statistics table
CREATE TABLE IF NOT EXISTS cache_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    location_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    
    -- Hit/Miss statistics
    cache_hits INT DEFAULT 0,
    cache_misses INT DEFAULT 0,
    cache_sets INT DEFAULT 0,
    cache_deletes INT DEFAULT 0,
    cache_errors INT DEFAULT 0,
    
    -- Performance metrics
    avg_response_time_ms INT DEFAULT 0,
    max_response_time_ms INT DEFAULT 0,
    min_response_time_ms INT DEFAULT 0,
    
    -- Data metrics
    total_reviews_cached INT DEFAULT 0,
    total_data_size_bytes BIGINT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicates
    UNIQUE KEY unique_location_date (location_id, date),
    
    -- Indexes
    INDEX idx_location_id (location_id),
    INDEX idx_date (date),
    INDEX idx_created_at (created_at)
);

-- Cache invalidation log
CREATE TABLE IF NOT EXISTS cache_invalidation_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    location_id VARCHAR(255) NOT NULL,
    cache_key VARCHAR(255) NOT NULL,
    invalidation_reason ENUM('manual', 'expired', 'error', 'refresh', 'admin') NOT NULL,
    invalidated_by VARCHAR(255) DEFAULT 'system',
    invalidated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional context
    context JSON DEFAULT NULL,
    
    -- Indexes
    INDEX idx_location_id (location_id),
    INDEX idx_invalidated_at (invalidated_at),
    INDEX idx_reason (invalidation_reason)
);

-- Cache configuration table
CREATE TABLE IF NOT EXISTS cache_configuration (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    location_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- TTL settings (in seconds)
    default_ttl INT DEFAULT 86400, -- 24 hours
    stale_ttl INT DEFAULT 172800,  -- 48 hours
    max_cached_reviews INT DEFAULT 50,
    
    -- Feature flags
    enable_redis BOOLEAN DEFAULT TRUE,
    enable_database BOOLEAN DEFAULT TRUE,
    enable_memory BOOLEAN DEFAULT TRUE,
    enable_compression BOOLEAN DEFAULT FALSE,
    enable_encryption BOOLEAN DEFAULT FALSE,
    enable_background_refresh BOOLEAN DEFAULT TRUE,
    
    -- Performance settings
    refresh_threshold DECIMAL(3,2) DEFAULT 0.80, -- 80%
    max_stale_age INT DEFAULT 172800, -- 48 hours
    
    -- Monitoring settings
    enable_statistics BOOLEAN DEFAULT TRUE,
    enable_logging BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_location_id (location_id),
    INDEX idx_updated_at (updated_at)
);

-- Stored procedures for cache management

DELIMITER //

-- Procedure to clean expired cache entries
CREATE PROCEDURE CleanExpiredCache()
BEGIN
    DECLARE deleted_count INT DEFAULT 0;
    
    -- Delete expired entries
    DELETE FROM review_cache WHERE expires_at < NOW();
    SET deleted_count = ROW_COUNT();
    
    -- Log the cleanup
    INSERT INTO cache_invalidation_log (location_id, cache_key, invalidation_reason, context)
    SELECT 'system', 'bulk_cleanup', 'expired', JSON_OBJECT('deleted_count', deleted_count);
    
    SELECT deleted_count as deleted_entries;
END //

-- Procedure to get cache statistics for a location
CREATE PROCEDURE GetCacheStats(IN p_location_id VARCHAR(255))
BEGIN
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
    FROM review_cache 
    WHERE location_id = p_location_id
    GROUP BY location_id;
END //

-- Procedure to invalidate cache for a location
CREATE PROCEDURE InvalidateLocationCache(
    IN p_location_id VARCHAR(255),
    IN p_reason VARCHAR(50),
    IN p_invalidated_by VARCHAR(255)
)
BEGIN
    DECLARE deleted_count INT DEFAULT 0;
    
    -- Delete cache entries
    DELETE FROM review_cache WHERE location_id = p_location_id;
    SET deleted_count = ROW_COUNT();
    
    -- Log the invalidation
    INSERT INTO cache_invalidation_log (location_id, cache_key, invalidation_reason, invalidated_by, context)
    VALUES (p_location_id, 'location_cache', p_reason, p_invalidated_by, JSON_OBJECT('deleted_count', deleted_count));
    
    SELECT deleted_count as invalidated_entries;
END //

-- Procedure to update cache statistics
CREATE PROCEDURE UpdateCacheStatistics(
    IN p_location_id VARCHAR(255),
    IN p_hits INT,
    IN p_misses INT,
    IN p_sets INT,
    IN p_deletes INT,
    IN p_errors INT,
    IN p_avg_response_time INT,
    IN p_max_response_time INT,
    IN p_min_response_time INT,
    IN p_total_reviews INT,
    IN p_total_data_size BIGINT
)
BEGIN
    INSERT INTO cache_statistics (
        location_id, date, cache_hits, cache_misses, cache_sets, cache_deletes, cache_errors,
        avg_response_time_ms, max_response_time_ms, min_response_time_ms,
        total_reviews_cached, total_data_size_bytes
    ) VALUES (
        p_location_id, CURDATE(), p_hits, p_misses, p_sets, p_deletes, p_errors,
        p_avg_response_time, p_max_response_time, p_min_response_time,
        p_total_reviews, p_total_data_size
    ) ON DUPLICATE KEY UPDATE
        cache_hits = cache_hits + p_hits,
        cache_misses = cache_misses + p_misses,
        cache_sets = cache_sets + p_sets,
        cache_deletes = cache_deletes + p_deletes,
        cache_errors = cache_errors + p_errors,
        avg_response_time_ms = (avg_response_time_ms + p_avg_response_time) / 2,
        max_response_time_ms = GREATEST(max_response_time_ms, p_max_response_time),
        min_response_time_ms = LEAST(min_response_time_ms, p_min_response_time),
        total_reviews_cached = p_total_reviews,
        total_data_size_bytes = p_total_data_size,
        updated_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_review_cache_composite ON review_cache (location_id, data_type, expires_at);
CREATE INDEX idx_cache_stats_composite ON cache_statistics (location_id, date DESC);

-- Views for easier data access

-- Active cache entries view
CREATE VIEW active_cache_entries AS
SELECT 
    cache_key,
    location_id,
    data_type,
    review_count,
    average_rating,
    data_size,
    created_at,
    updated_at,
    expires_at,
    TIMESTAMPDIFF(SECOND, created_at, NOW()) as age_seconds,
    TIMESTAMPDIFF(SECOND, NOW(), expires_at) as ttl_remaining_seconds
FROM review_cache 
WHERE expires_at > NOW()
ORDER BY updated_at DESC;

-- Cache performance summary view
CREATE VIEW cache_performance_summary AS
SELECT 
    location_id,
    DATE(created_at) as date,
    COUNT(*) as total_requests,
    SUM(cache_hits) as total_hits,
    SUM(cache_misses) as total_misses,
    ROUND((SUM(cache_hits) / (SUM(cache_hits) + SUM(cache_misses))) * 100, 2) as hit_rate_percent,
    AVG(avg_response_time_ms) as avg_response_time,
    SUM(total_reviews_cached) as reviews_cached,
    SUM(total_data_size_bytes) as data_size_bytes
FROM cache_statistics 
GROUP BY location_id, DATE(created_at)
ORDER BY date DESC, location_id;

-- Recent invalidations view
CREATE VIEW recent_invalidations AS
SELECT 
    location_id,
    cache_key,
    invalidation_reason,
    invalidated_by,
    invalidated_at,
    context
FROM cache_invalidation_log 
WHERE invalidated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY invalidated_at DESC;

-- Insert default cache configuration
INSERT IGNORE INTO cache_configuration (location_id) 
VALUES ('default');

-- Create event scheduler for automatic cleanup (if events are enabled)
-- SET GLOBAL event_scheduler = ON;

-- CREATE EVENT IF NOT EXISTS cleanup_expired_cache
-- ON SCHEDULE EVERY 1 HOUR
-- DO
--   CALL CleanExpiredCache();

-- Grants for cache user (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON review_cache TO 'cache_user'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON cache_statistics TO 'cache_user'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON cache_invalidation_log TO 'cache_user'@'%';
-- GRANT SELECT, UPDATE ON cache_configuration TO 'cache_user'@'%';
-- GRANT EXECUTE ON PROCEDURE CleanExpiredCache TO 'cache_user'@'%';
-- GRANT EXECUTE ON PROCEDURE GetCacheStats TO 'cache_user'@'%';
-- GRANT EXECUTE ON PROCEDURE InvalidateLocationCache TO 'cache_user'@'%';
-- GRANT EXECUTE ON PROCEDURE UpdateCacheStatistics TO 'cache_user'@'%';