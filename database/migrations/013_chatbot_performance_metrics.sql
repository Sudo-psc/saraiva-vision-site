-- Chatbot Performance Metrics Table
-- Stores performance monitoring data and analytics

-- Create chatbot_performance_metrics table
CREATE TABLE IF NOT EXISTS chatbot_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metrics JSONB NOT NULL,
    insights JSONB DEFAULT '[]',
    health_score FLOAT DEFAULT 0,
    efficiency_score FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chatbot_perf_timestamp ON chatbot_performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_chatbot_perf_health_score ON chatbot_performance_metrics(health_score);
CREATE INDEX IF NOT EXISTS idx_chatbot_perf_efficiency_score ON chatbot_performance_metrics(efficiency_score);
CREATE INDEX IF NOT EXISTS idx_chatbot_perf_created_at ON chatbot_performance_metrics(created_at);

-- Create GIN index for metrics JSONB queries
CREATE INDEX IF NOT EXISTS idx_chatbot_perf_metrics ON chatbot_performance_metrics USING GIN (metrics);
CREATE INDEX IF NOT EXISTS idx_chatbot_perf_insights ON chatbot_performance_metrics USING GIN (insights);

-- Create partial indexes for different time ranges
CREATE INDEX IF NOT EXISTS idx_chatbot_perf_recent_24h 
ON chatbot_performance_metrics(timestamp DESC) 
WHERE timestamp > NOW() - INTERVAL '24 hours';

CREATE INDEX IF NOT EXISTS idx_chatbot_perf_recent_7d 
ON chatbot_performance_metrics(timestamp DESC) 
WHERE timestamp > NOW() - INTERVAL '7 days';

-- Create function to get performance summary
CREATE OR REPLACE FUNCTION get_performance_summary(
    time_range INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS JSONB AS $$
DECLARE
    summary JSONB;
BEGIN
    SELECT jsonb_build_object(
        'time_range', time_range,
        'total_records', COUNT(*),
        'avg_health_score', AVG(health_score),
        'avg_efficiency_score', AVG(efficiency_score),
        'min_health_score', MIN(health_score),
        'max_health_score', MAX(health_score),
        'health_trend', CASE 
            WHEN COUNT(*) < 2 THEN 'insufficient_data'
            WHEN (
                SELECT AVG(health_score) 
                FROM chatbot_performance_metrics 
                WHERE timestamp > NOW() - time_range/2
            ) > (
                SELECT AVG(health_score) 
                FROM chatbot_performance_metrics 
                WHERE timestamp BETWEEN NOW() - time_range AND NOW() - time_range/2
            ) THEN 'improving'
            ELSE 'declining'
        END,
        'latest_metrics', (
            SELECT metrics 
            FROM chatbot_performance_metrics 
            WHERE timestamp > NOW() - time_range
            ORDER BY timestamp DESC 
            LIMIT 1
        ),
        'common_insights', (
            SELECT jsonb_agg(DISTINCT insight_type)
            FROM (
                SELECT jsonb_array_elements(insights)->>'category' as insight_type
                FROM chatbot_performance_metrics
                WHERE timestamp > NOW() - time_range
                AND jsonb_array_length(insights) > 0
            ) insight_types
        )
    ) INTO summary
    FROM chatbot_performance_metrics
    WHERE timestamp > NOW() - time_range;
    
    RETURN summary;
END;
$$ LANGUAGE plpgsql;

-- Create function to get performance trends
CREATE OR REPLACE FUNCTION get_performance_trends(
    metric_path TEXT,
    time_range INTERVAL DEFAULT INTERVAL '24 hours',
    bucket_interval INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS TABLE (
    time_bucket TIMESTAMP WITH TIME ZONE,
    avg_value FLOAT,
    min_value FLOAT,
    max_value FLOAT,
    sample_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_trunc(EXTRACT(EPOCH FROM bucket_interval)::text || ' seconds', timestamp) as time_bucket,
        AVG((metrics #>> string_to_array(metric_path, '.'))::FLOAT) as avg_value,
        MIN((metrics #>> string_to_array(metric_path, '.'))::FLOAT) as min_value,
        MAX((metrics #>> string_to_array(metric_path, '.'))::FLOAT) as max_value,
        COUNT(*) as sample_count
    FROM chatbot_performance_metrics
    WHERE 
        timestamp > NOW() - time_range
        AND metrics #>> string_to_array(metric_path, '.') IS NOT NULL
    GROUP BY time_bucket
    ORDER BY time_bucket;
END;
$$ LANGUAGE plpgsql;

-- Create function to detect performance anomalies
CREATE OR REPLACE FUNCTION detect_performance_anomalies(
    threshold_multiplier FLOAT DEFAULT 2.0,
    time_range INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS TABLE (
    timestamp TIMESTAMP WITH TIME ZONE,
    anomaly_type TEXT,
    metric_name TEXT,
    actual_value FLOAT,
    expected_range_min FLOAT,
    expected_range_max FLOAT,
    severity TEXT
) AS $$
BEGIN
    -- Detect response time anomalies
    RETURN QUERY
    WITH response_time_stats AS (
        SELECT 
            AVG((metrics #>> '{responseTime,average}')::FLOAT) as avg_response_time,
            STDDEV((metrics #>> '{responseTime,average}')::FLOAT) as stddev_response_time
        FROM chatbot_performance_metrics
        WHERE 
            timestamp > NOW() - time_range * 2
            AND metrics #>> '{responseTime,average}' IS NOT NULL
    )
    SELECT 
        m.timestamp,
        'response_time_anomaly'::TEXT as anomaly_type,
        'responseTime.average'::TEXT as metric_name,
        (m.metrics #>> '{responseTime,average}')::FLOAT as actual_value,
        (stats.avg_response_time - threshold_multiplier * stats.stddev_response_time) as expected_range_min,
        (stats.avg_response_time + threshold_multiplier * stats.stddev_response_time) as expected_range_max,
        CASE 
            WHEN ABS((m.metrics #>> '{responseTime,average}')::FLOAT - stats.avg_response_time) > 3 * stats.stddev_response_time THEN 'critical'
            WHEN ABS((m.metrics #>> '{responseTime,average}')::FLOAT - stats.avg_response_time) > 2 * stats.stddev_response_time THEN 'high'
            ELSE 'medium'
        END as severity
    FROM chatbot_performance_metrics m
    CROSS JOIN response_time_stats stats
    WHERE 
        m.timestamp > NOW() - time_range
        AND m.metrics #>> '{responseTime,average}' IS NOT NULL
        AND ABS((m.metrics #>> '{responseTime,average}')::FLOAT - stats.avg_response_time) > threshold_multiplier * stats.stddev_response_time
    
    UNION ALL
    
    -- Detect error rate anomalies
    WITH error_rate_stats AS (
        SELECT 
            AVG((metrics #>> '{errors,rate}')::FLOAT) as avg_error_rate,
            STDDEV((metrics #>> '{errors,rate}')::FLOAT) as stddev_error_rate
        FROM chatbot_performance_metrics
        WHERE 
            timestamp > NOW() - time_range * 2
            AND metrics #>> '{errors,rate}' IS NOT NULL
    )
    SELECT 
        m.timestamp,
        'error_rate_anomaly'::TEXT as anomaly_type,
        'errors.rate'::TEXT as metric_name,
        (m.metrics #>> '{errors,rate}')::FLOAT as actual_value,
        GREATEST(0, stats.avg_error_rate - threshold_multiplier * stats.stddev_error_rate) as expected_range_min,
        (stats.avg_error_rate + threshold_multiplier * stats.stddev_error_rate) as expected_range_max,
        CASE 
            WHEN (m.metrics #>> '{errors,rate}')::FLOAT > stats.avg_error_rate + 3 * stats.stddev_error_rate THEN 'critical'
            WHEN (m.metrics #>> '{errors,rate}')::FLOAT > stats.avg_error_rate + 2 * stats.stddev_error_rate THEN 'high'
            ELSE 'medium'
        END as severity
    FROM chatbot_performance_metrics m
    CROSS JOIN error_rate_stats stats
    WHERE 
        m.timestamp > NOW() - time_range
        AND m.metrics #>> '{errors,rate}' IS NOT NULL
        AND (m.metrics #>> '{errors,rate}')::FLOAT > stats.avg_error_rate + threshold_multiplier * stats.stddev_error_rate
    
    ORDER BY timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to cleanup old performance metrics
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics(
    retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chatbot_performance_metrics 
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity
    INSERT INTO system_logs (event_type, message, metadata)
    VALUES (
        'performance_metrics_cleanup',
        'Cleaned up old performance metrics',
        jsonb_build_object(
            'deleted_count', deleted_count, 
            'retention_days', retention_days,
            'timestamp', NOW()
        )
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for performance dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS performance_dashboard AS
SELECT 
    date_trunc('hour', timestamp) as hour,
    AVG(health_score) as avg_health_score,
    AVG(efficiency_score) as avg_efficiency_score,
    AVG((metrics #>> '{responseTime,average}')::FLOAT) as avg_response_time,
    AVG((metrics #>> '{cache,hitRate}')::FLOAT) as avg_cache_hit_rate,
    AVG((metrics #>> '{errors,rate}')::FLOAT) as avg_error_rate,
    AVG((metrics #>> '{requests,total}')::FLOAT) as avg_total_requests,
    COUNT(*) as sample_count
FROM chatbot_performance_metrics
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY date_trunc('hour', timestamp)
ORDER BY hour DESC;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_performance_dashboard_hour ON performance_dashboard(hour);

-- Create function to refresh performance dashboard
CREATE OR REPLACE FUNCTION refresh_performance_dashboard()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY performance_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE chatbot_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role can manage performance metrics" ON chatbot_performance_metrics
    FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users (read-only access)
CREATE POLICY "Users can read performance metrics" ON chatbot_performance_metrics
    FOR SELECT USING (true);

-- Create view for performance alerts
CREATE OR REPLACE VIEW performance_alerts AS
SELECT 
    timestamp,
    CASE 
        WHEN health_score < 50 THEN 'critical'
        WHEN health_score < 70 THEN 'warning'
        ELSE 'info'
    END as alert_level,
    CASE 
        WHEN health_score < 50 THEN 'System health is critical'
        WHEN health_score < 70 THEN 'System health needs attention'
        WHEN (metrics #>> '{responseTime,average}')::FLOAT > 5000 THEN 'Response time is high'
        WHEN (metrics #>> '{errors,rate}')::FLOAT > 10 THEN 'Error rate is elevated'
        WHEN (metrics #>> '{cache,hitRate}')::FLOAT < 30 THEN 'Cache hit rate is low'
        ELSE 'System is performing well'
    END as message,
    health_score,
    efficiency_score,
    (metrics #>> '{responseTime,average}')::FLOAT as response_time,
    (metrics #>> '{errors,rate}')::FLOAT as error_rate,
    (metrics #>> '{cache,hitRate}')::FLOAT as cache_hit_rate
FROM chatbot_performance_metrics
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- Grant permissions
GRANT SELECT ON performance_dashboard TO authenticated;
GRANT SELECT ON performance_alerts TO authenticated;
GRANT ALL ON chatbot_performance_metrics TO service_role;
GRANT SELECT ON chatbot_performance_metrics TO authenticated;

-- Create scheduled job to refresh dashboard (if pg_cron is available)
-- SELECT cron.schedule('refresh-performance-dashboard', '*/15 * * * *', 'SELECT refresh_performance_dashboard();');

-- Create scheduled job to cleanup old metrics (if pg_cron is available)
-- SELECT cron.schedule('cleanup-performance-metrics', '0 2 * * *', 'SELECT cleanup_old_performance_metrics(30);');

-- Insert initial configuration
INSERT INTO system_config (key, value, description) VALUES
('performance_metrics_retention_days', '30', 'Number of days to retain performance metrics')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_config (key, value, description) VALUES
('performance_alert_threshold_health', '70', 'Health score threshold for performance alerts')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_config (key, value, description) VALUES
('performance_alert_threshold_response_time', '5000', 'Response time threshold in milliseconds for alerts')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_config (key, value, description) VALUES
('performance_monitoring_enabled', 'true', 'Enable performance monitoring and metrics collection')
ON CONFLICT (key) DO NOTHING;

-- Add comments to table
COMMENT ON TABLE chatbot_performance_metrics IS 'Performance monitoring data for chatbot system with health and efficiency scoring';
COMMENT ON COLUMN chatbot_performance_metrics.metrics IS 'Detailed performance metrics in JSON format';
COMMENT ON COLUMN chatbot_performance_metrics.insights IS 'Performance insights and recommendations';
COMMENT ON COLUMN chatbot_performance_metrics.health_score IS 'Overall system health score (0-100)';
COMMENT ON COLUMN chatbot_performance_metrics.efficiency_score IS 'System efficiency score (0-100)';

COMMENT ON MATERIALIZED VIEW performance_dashboard IS 'Hourly aggregated performance metrics for dashboard display';
COMMENT ON VIEW performance_alerts IS 'Real-time performance alerts based on health and efficiency thresholds';