-- Chatbot Response Cache Table
-- Stores cached responses for intelligent caching system

-- Create chatbot_response_cache table
CREATE TABLE IF NOT EXISTS chatbot_response_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(64) UNIQUE NOT NULL,
    message_normalized TEXT NOT NULL,
    response TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    context_hash VARCHAR(16) NOT NULL,
    metadata JSONB DEFAULT '{}',
    ttl_seconds INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_key ON chatbot_response_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_category ON chatbot_response_cache(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_expires_at ON chatbot_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_created_at ON chatbot_response_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_access_count ON chatbot_response_cache(access_count DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_last_accessed ON chatbot_response_cache(last_accessed);

-- Create composite index for category and expiration
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_category_expires ON chatbot_response_cache(category, expires_at);

-- Create GIN index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_metadata ON chatbot_response_cache USING GIN (metadata);

-- Create partial index for valid (non-expired) entries
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_valid_entries 
ON chatbot_response_cache(category, access_count DESC) 
WHERE expires_at > NOW();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chatbot_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_chatbot_cache_updated_at ON chatbot_response_cache;
CREATE TRIGGER trigger_update_chatbot_cache_updated_at
    BEFORE UPDATE ON chatbot_response_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_cache_updated_at();

-- Create function to automatically clean up expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache_entries()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chatbot_response_cache 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity
    INSERT INTO system_logs (event_type, message, metadata)
    VALUES (
        'cache_cleanup',
        'Cleaned up expired cache entries',
        jsonb_build_object('deleted_count', deleted_count, 'timestamp', NOW())
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get cache statistics
CREATE OR REPLACE FUNCTION get_cache_statistics()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_entries', COUNT(*),
        'valid_entries', COUNT(*) FILTER (WHERE expires_at > NOW()),
        'expired_entries', COUNT(*) FILTER (WHERE expires_at <= NOW()),
        'categories', jsonb_object_agg(category, category_count),
        'total_access_count', SUM(access_count),
        'average_access_count', AVG(access_count),
        'oldest_entry', MIN(created_at),
        'newest_entry', MAX(created_at),
        'most_accessed', MAX(access_count)
    ) INTO stats
    FROM (
        SELECT 
            category,
            COUNT(*) as category_count,
            access_count,
            created_at
        FROM chatbot_response_cache
        GROUP BY category, access_count, created_at
    ) category_stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Create function to find similar cached responses
CREATE OR REPLACE FUNCTION find_similar_cache_entries(
    input_message TEXT,
    similarity_threshold FLOAT DEFAULT 0.8,
    result_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    cache_key VARCHAR(64),
    message_normalized TEXT,
    response TEXT,
    category VARCHAR(50),
    similarity_score FLOAT,
    access_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.cache_key,
        c.message_normalized,
        c.response,
        c.category,
        similarity(c.message_normalized, input_message) as similarity_score,
        c.access_count,
        c.created_at
    FROM chatbot_response_cache c
    WHERE 
        c.expires_at > NOW()
        AND similarity(c.message_normalized, input_message) >= similarity_threshold
    ORDER BY 
        similarity(c.message_normalized, input_message) DESC,
        c.access_count DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Enable pg_trgm extension for similarity search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index for trigram similarity search
CREATE INDEX IF NOT EXISTS idx_chatbot_cache_message_trgm 
ON chatbot_response_cache USING GIN (message_normalized gin_trgm_ops);

-- Create RLS policies for cache table
ALTER TABLE chatbot_response_cache ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role can manage cache" ON chatbot_response_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users (read-only access to their own cached responses)
CREATE POLICY "Users can read cache" ON chatbot_response_cache
    FOR SELECT USING (true); -- Allow reading cache for performance

-- Create view for cache analytics
CREATE OR REPLACE VIEW cache_analytics AS
SELECT 
    category,
    COUNT(*) as total_entries,
    COUNT(*) FILTER (WHERE expires_at > NOW()) as valid_entries,
    COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_entries,
    AVG(access_count) as avg_access_count,
    MAX(access_count) as max_access_count,
    MIN(created_at) as oldest_entry,
    MAX(created_at) as newest_entry,
    AVG(EXTRACT(EPOCH FROM (expires_at - created_at))) as avg_ttl_seconds
FROM chatbot_response_cache
GROUP BY category
ORDER BY total_entries DESC;

-- Grant permissions
GRANT SELECT ON cache_analytics TO authenticated;
GRANT ALL ON chatbot_response_cache TO service_role;
GRANT SELECT ON chatbot_response_cache TO authenticated;

-- Create scheduled job to clean up expired entries (if pg_cron is available)
-- This will run every hour to clean up expired cache entries
-- SELECT cron.schedule('cleanup-cache', '0 * * * *', 'SELECT cleanup_expired_cache_entries();');

-- Insert initial configuration
INSERT INTO system_config (key, value, description) VALUES
('cache_default_ttl', '86400', 'Default cache TTL in seconds (24 hours)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_config (key, value, description) VALUES
('cache_medical_ttl', '604800', 'Medical information cache TTL in seconds (7 days)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_config (key, value, description) VALUES
('cache_appointment_ttl', '3600', 'Appointment-related cache TTL in seconds (1 hour)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_config (key, value, description) VALUES
('cache_max_entries', '10000', 'Maximum number of cache entries to maintain')
ON CONFLICT (key) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE chatbot_response_cache IS 'Intelligent caching system for chatbot responses with category-based TTL and similarity search';
COMMENT ON COLUMN chatbot_response_cache.cache_key IS 'SHA-256 hash of normalized message and context';
COMMENT ON COLUMN chatbot_response_cache.message_normalized IS 'Normalized version of the original message for consistent caching';
COMMENT ON COLUMN chatbot_response_cache.category IS 'Message category for intelligent cache management';
COMMENT ON COLUMN chatbot_response_cache.context_hash IS 'Hash of relevant context for cache key generation';
COMMENT ON COLUMN chatbot_response_cache.ttl_seconds IS 'Time-to-live in seconds for this cache entry';
COMMENT ON COLUMN chatbot_response_cache.access_count IS 'Number of times this cached response has been accessed';