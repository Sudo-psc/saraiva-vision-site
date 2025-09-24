-- Enhanced Chatbot Database Schema
-- Migration 010: Enhance existing chatbot schema with additional compliance and performance features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enhance chatbot_conversations table with additional fields
ALTER TABLE chatbot_conversations 
ADD COLUMN IF NOT EXISTS conversation_context JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS ai_model_version VARCHAR(50) DEFAULT 'gemini-2.5-flash',
ADD COLUMN IF NOT EXISTS response_quality_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS contains_medical_content BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS emergency_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS compliance_review_required BOOLEAN DEFAULT FALSE;

-- Create enhanced indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_medical_content ON chatbot_conversations(contains_medical_content) WHERE contains_medical_content = TRUE;
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_emergency ON chatbot_conversations(emergency_detected) WHERE emergency_detected = TRUE;
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_security_score ON chatbot_conversations(security_score) WHERE security_score < 80;
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_context ON chatbot_conversations USING GIN (conversation_context);

-- Enhance user_consents table with additional LGPD fields
ALTER TABLE user_consents 
ADD COLUMN IF NOT EXISTS consent_version VARCHAR(10) DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS data_subject_rights_exercised JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS consent_withdrawal_reason TEXT,
ADD COLUMN IF NOT EXISTS data_portability_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_deletion_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consent_source VARCHAR(100) DEFAULT 'chatbot_widget';

-- Create consent management view for LGPD compliance
CREATE OR REPLACE VIEW consent_management_view AS
SELECT 
    uc.id,
    uc.session_id,
    uc.consent_type,
    uc.consent_granted,
    uc.legal_basis,
    uc.created_at,
    uc.expires_at,
    uc.revoked_at,
    uc.data_subject_rights_exercised,
    CASE 
        WHEN uc.revoked_at IS NOT NULL THEN 'revoked'
        WHEN uc.expires_at IS NOT NULL AND uc.expires_at < NOW() THEN 'expired'
        WHEN uc.consent_granted = TRUE THEN 'active'
        ELSE 'inactive'
    END as consent_status,
    COUNT(cc.id) as conversation_count
FROM user_consents uc
LEFT JOIN chatbot_conversations cc ON cc.user_consent_id = uc.id
GROUP BY uc.id, uc.session_id, uc.consent_type, uc.consent_granted, 
         uc.legal_basis, uc.created_at, uc.expires_at, uc.revoked_at, 
         uc.data_subject_rights_exercised;

-- Enhance medical_referrals table with additional tracking
ALTER TABLE medical_referrals 
ADD COLUMN IF NOT EXISTS referral_priority INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS estimated_wait_time_days INTEGER,
ADD COLUMN IF NOT EXISTS specialist_assigned VARCHAR(255),
ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS patient_age_range VARCHAR(20),
ADD COLUMN IF NOT EXISTS insurance_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS referral_outcome TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add constraints for referral priority (1=highest, 5=lowest)
ALTER TABLE medical_referrals 
ADD CONSTRAINT valid_referral_priority CHECK (referral_priority BETWEEN 1 AND 5);

-- Create comprehensive chatbot_metrics table for performance tracking
CREATE TABLE IF NOT EXISTS chatbot_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_hour INTEGER NOT NULL DEFAULT EXTRACT(HOUR FROM NOW()),
    
    -- Conversation metrics
    total_conversations INTEGER DEFAULT 0,
    unique_sessions INTEGER DEFAULT 0,
    average_conversation_length DECIMAL(5,2) DEFAULT 0,
    average_response_time_ms INTEGER DEFAULT 0,
    
    -- Quality metrics
    average_security_score DECIMAL(5,2) DEFAULT 100,
    average_response_quality DECIMAL(3,2) DEFAULT 0,
    user_satisfaction_score DECIMAL(3,2) DEFAULT 0,
    
    -- Medical compliance metrics
    medical_conversations INTEGER DEFAULT 0,
    emergency_detections INTEGER DEFAULT 0,
    medical_advice_blocked INTEGER DEFAULT 0,
    disclaimers_shown INTEGER DEFAULT 0,
    
    -- LGPD compliance metrics
    consent_requests INTEGER DEFAULT 0,
    consent_granted INTEGER DEFAULT 0,
    data_deletion_requests INTEGER DEFAULT 0,
    data_export_requests INTEGER DEFAULT 0,
    
    -- Security metrics
    security_violations INTEGER DEFAULT 0,
    blocked_requests INTEGER DEFAULT 0,
    suspicious_activities INTEGER DEFAULT 0,
    
    -- Performance metrics
    api_errors INTEGER DEFAULT 0,
    timeout_errors INTEGER DEFAULT 0,
    rate_limit_hits INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(metric_date, metric_hour)
);

-- Create indexes for metrics table
CREATE INDEX IF NOT EXISTS idx_chatbot_metrics_date ON chatbot_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_chatbot_metrics_hour ON chatbot_metrics(metric_date, metric_hour);

-- Create chatbot_feedback table for user feedback collection
CREATE TABLE IF NOT EXISTS chatbot_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    conversation_id UUID REFERENCES chatbot_conversations(id),
    
    -- Feedback data
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    feedback_category VARCHAR(50), -- 'helpful', 'accurate', 'fast', 'polite', 'other'
    
    -- Context
    user_agent TEXT,
    feedback_source VARCHAR(50) DEFAULT 'widget', -- 'widget', 'email', 'survey'
    
    -- Privacy
    anonymized BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for feedback table
CREATE INDEX IF NOT EXISTS idx_chatbot_feedback_session ON chatbot_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_feedback_rating ON chatbot_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_chatbot_feedback_category ON chatbot_feedback(feedback_category);
CREATE INDEX IF NOT EXISTS idx_chatbot_feedback_created ON chatbot_feedback(created_at);

-- Create chatbot_configuration table for dynamic configuration
CREATE TABLE IF NOT EXISTS chatbot_configuration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_description TEXT,
    config_category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration values
INSERT INTO chatbot_configuration (config_key, config_value, config_description, config_category) VALUES
('medical_safety_keywords', '["emergência", "socorro", "dor intensa", "perdi a visão", "sangramento"]', 'Keywords that trigger medical safety protocols', 'medical'),
('cfm_disclaimers', '{"general": "Esta informação é apenas educativa e não substitui uma consulta médica.", "emergency": "Em caso de emergência, procure atendimento médico imediatamente."}', 'CFM compliance disclaimers', 'medical'),
('rate_limits', '{"messages_per_minute": 20, "messages_per_hour": 200, "sessions_per_ip": 5}', 'Rate limiting configuration', 'security'),
('lgpd_settings', '{"data_retention_days": 365, "consent_required": true, "anonymization_enabled": true}', 'LGPD compliance settings', 'privacy'),
('performance_thresholds', '{"max_response_time_ms": 5000, "min_security_score": 70, "max_error_rate": 0.05}', 'Performance monitoring thresholds', 'performance')
ON CONFLICT (config_key) DO NOTHING;

-- Create function to update chatbot metrics
CREATE OR REPLACE FUNCTION update_chatbot_metrics()
RETURNS void AS $
DECLARE
    current_date DATE := CURRENT_DATE;
    current_hour INTEGER := EXTRACT(HOUR FROM NOW());
BEGIN
    -- Insert or update metrics for current hour
    INSERT INTO chatbot_metrics (
        metric_date, 
        metric_hour,
        total_conversations,
        unique_sessions,
        average_conversation_length,
        average_response_time_ms,
        average_security_score,
        medical_conversations,
        emergency_detections,
        consent_requests,
        consent_granted
    )
    SELECT 
        current_date,
        current_hour,
        COUNT(*) as total_conversations,
        COUNT(DISTINCT session_id) as unique_sessions,
        AVG(LENGTH(user_message) + LENGTH(bot_response)) as average_conversation_length,
        AVG(processing_time_ms) as average_response_time_ms,
        AVG(security_score) as average_security_score,
        COUNT(*) FILTER (WHERE contains_medical_content = TRUE) as medical_conversations,
        COUNT(*) FILTER (WHERE emergency_detected = TRUE) as emergency_detections,
        (SELECT COUNT(*) FROM user_consents WHERE DATE_TRUNC('hour', created_at) = DATE_TRUNC('hour', NOW())) as consent_requests,
        (SELECT COUNT(*) FROM user_consents WHERE consent_granted = TRUE AND DATE_TRUNC('hour', created_at) = DATE_TRUNC('hour', NOW())) as consent_granted
    FROM chatbot_conversations 
    WHERE DATE_TRUNC('hour', created_at) = DATE_TRUNC('hour', NOW())
    ON CONFLICT (metric_date, metric_hour) 
    DO UPDATE SET
        total_conversations = EXCLUDED.total_conversations,
        unique_sessions = EXCLUDED.unique_sessions,
        average_conversation_length = EXCLUDED.average_conversation_length,
        average_response_time_ms = EXCLUDED.average_response_time_ms,
        average_security_score = EXCLUDED.average_security_score,
        medical_conversations = EXCLUDED.medical_conversations,
        emergency_detections = EXCLUDED.emergency_detections,
        consent_requests = EXCLUDED.consent_requests,
        consent_granted = EXCLUDED.consent_granted,
        updated_at = NOW();
END;
$ LANGUAGE plpgsql;

-- Create function for LGPD data subject rights fulfillment
CREATE OR REPLACE FUNCTION fulfill_data_subject_rights(
    p_session_id VARCHAR(255),
    p_right_type VARCHAR(50), -- 'access', 'portability', 'deletion', 'rectification'
    p_requester_info JSONB DEFAULT '{}'
)
RETURNS JSONB AS $
DECLARE
    result JSONB := '{}';
    conversation_data JSONB;
    consent_data JSONB;
    referral_data JSONB;
BEGIN
    -- Log the request
    INSERT INTO chatbot_audit_logs (
        event_type, 
        session_id, 
        event_data, 
        compliance_category, 
        severity_level
    ) VALUES (
        'data_subject_rights_request',
        p_session_id,
        jsonb_build_object(
            'right_type', p_right_type,
            'requester_info', p_requester_info,
            'timestamp', NOW()
        ),
        'lgpd',
        'info'
    );
    
    CASE p_right_type
        WHEN 'access' THEN
            -- Provide access to all data
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'user_message', CASE WHEN anonymized THEN '[ANONYMIZED]' ELSE user_message END,
                    'bot_response', CASE WHEN anonymized THEN '[ANONYMIZED]' ELSE bot_response END,
                    'created_at', created_at,
                    'contains_medical_content', contains_medical_content
                )
            ) INTO conversation_data
            FROM chatbot_conversations 
            WHERE session_id = p_session_id;
            
            SELECT jsonb_agg(
                jsonb_build_object(
                    'consent_type', consent_type,
                    'consent_granted', consent_granted,
                    'created_at', created_at,
                    'legal_basis', legal_basis
                )
            ) INTO consent_data
            FROM user_consents 
            WHERE session_id = p_session_id;
            
            result := jsonb_build_object(
                'conversations', COALESCE(conversation_data, '[]'::jsonb),
                'consents', COALESCE(consent_data, '[]'::jsonb),
                'request_fulfilled_at', NOW()
            );
            
        WHEN 'portability' THEN
            -- Export data in structured format
            SELECT jsonb_build_object(
                'personal_data', jsonb_build_object(
                    'conversations', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'message', CASE WHEN anonymized THEN '[ANONYMIZED]' ELSE user_message END,
                                'response', CASE WHEN anonymized THEN '[ANONYMIZED]' ELSE bot_response END,
                                'timestamp', created_at
                            )
                        )
                        FROM chatbot_conversations 
                        WHERE session_id = p_session_id AND anonymized = FALSE
                    ),
                    'consents', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'type', consent_type,
                                'granted', consent_granted,
                                'date', created_at
                            )
                        )
                        FROM user_consents 
                        WHERE session_id = p_session_id
                    )
                ),
                'export_format', 'JSON',
                'exported_at', NOW()
            ) INTO result;
            
            -- Mark portability request as fulfilled
            UPDATE user_consents 
            SET data_portability_requested = TRUE,
                data_subject_rights_exercised = data_subject_rights_exercised || jsonb_build_object('portability', NOW())
            WHERE session_id = p_session_id;
            
        WHEN 'deletion' THEN
            -- Anonymize or delete data based on retention requirements
            UPDATE chatbot_conversations 
            SET 
                user_message = '[DELETED BY REQUEST]',
                bot_response = '[DELETED BY REQUEST]',
                message_metadata = '{}',
                anonymized = TRUE
            WHERE session_id = p_session_id AND anonymized = FALSE;
            
            UPDATE user_consents 
            SET data_deletion_requested = TRUE,
                data_subject_rights_exercised = data_subject_rights_exercised || jsonb_build_object('deletion', NOW())
            WHERE session_id = p_session_id;
            
            result := jsonb_build_object(
                'deleted_conversations', (SELECT COUNT(*) FROM chatbot_conversations WHERE session_id = p_session_id AND anonymized = TRUE),
                'deletion_completed_at', NOW()
            );
            
        WHEN 'rectification' THEN
            -- Log rectification request (actual rectification requires manual review)
            result := jsonb_build_object(
                'rectification_request_logged', true,
                'requires_manual_review', true,
                'logged_at', NOW()
            );
            
        ELSE
            result := jsonb_build_object('error', 'Unknown right type: ' || p_right_type);
    END CASE;
    
    -- Log the fulfillment
    INSERT INTO chatbot_audit_logs (
        event_type, 
        session_id, 
        event_data, 
        compliance_category, 
        severity_level
    ) VALUES (
        'data_subject_rights_fulfilled',
        p_session_id,
        jsonb_build_object(
            'right_type', p_right_type,
            'result', result,
            'timestamp', NOW()
        ),
        'lgpd',
        'info'
    );
    
    RETURN result;
END;
$ LANGUAGE plpgsql;

-- Create function for automated compliance reporting
CREATE OR REPLACE FUNCTION generate_compliance_report(
    p_report_type VARCHAR(50), -- 'cfm', 'lgpd', 'security'
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $
DECLARE
    report JSONB := '{}';
BEGIN
    CASE p_report_type
        WHEN 'cfm' THEN
            SELECT jsonb_build_object(
                'report_type', 'CFM Compliance',
                'period', jsonb_build_object('start', p_start_date, 'end', p_end_date),
                'metrics', jsonb_build_object(
                    'total_medical_conversations', COUNT(*) FILTER (WHERE contains_medical_content = TRUE),
                    'emergency_detections', COUNT(*) FILTER (WHERE emergency_detected = TRUE),
                    'medical_advice_blocked', COUNT(*) FILTER (WHERE compliance_flags->>'medical_advice_blocked' = 'true'),
                    'disclaimers_shown', COUNT(*) FILTER (WHERE compliance_flags->>'disclaimer_shown' = 'true'),
                    'compliance_rate', ROUND(
                        (COUNT(*) FILTER (WHERE compliance_flags->>'cfm_compliant' = 'true')::DECIMAL / 
                         NULLIF(COUNT(*) FILTER (WHERE contains_medical_content = TRUE), 0)) * 100, 2
                    )
                ),
                'generated_at', NOW()
            ) INTO report
            FROM chatbot_conversations 
            WHERE created_at::DATE BETWEEN p_start_date AND p_end_date;
            
        WHEN 'lgpd' THEN
            SELECT jsonb_build_object(
                'report_type', 'LGPD Compliance',
                'period', jsonb_build_object('start', p_start_date, 'end', p_end_date),
                'metrics', jsonb_build_object(
                    'consent_requests', COUNT(*),
                    'consents_granted', COUNT(*) FILTER (WHERE consent_granted = TRUE),
                    'consents_revoked', COUNT(*) FILTER (WHERE revoked_at IS NOT NULL),
                    'data_deletion_requests', COUNT(*) FILTER (WHERE data_deletion_requested = TRUE),
                    'data_portability_requests', COUNT(*) FILTER (WHERE data_portability_requested = TRUE),
                    'compliance_rate', ROUND(
                        (COUNT(*) FILTER (WHERE consent_granted = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
                    )
                ),
                'generated_at', NOW()
            ) INTO report
            FROM user_consents 
            WHERE created_at::DATE BETWEEN p_start_date AND p_end_date;
            
        WHEN 'security' THEN
            SELECT jsonb_build_object(
                'report_type', 'Security Compliance',
                'period', jsonb_build_object('start', p_start_date, 'end', p_end_date),
                'metrics', jsonb_build_object(
                    'total_conversations', COUNT(*),
                    'low_security_score', COUNT(*) FILTER (WHERE security_score < 70),
                    'average_security_score', ROUND(AVG(security_score), 2),
                    'security_violations', COUNT(*) FILTER (WHERE compliance_flags->>'security_violation' = 'true'),
                    'blocked_requests', COUNT(*) FILTER (WHERE compliance_flags->>'request_blocked' = 'true')
                ),
                'generated_at', NOW()
            ) INTO report
            FROM chatbot_conversations 
            WHERE created_at::DATE BETWEEN p_start_date AND p_end_date;
            
        ELSE
            report := jsonb_build_object('error', 'Unknown report type: ' || p_report_type);
    END CASE;
    
    -- Log report generation
    INSERT INTO chatbot_audit_logs (
        event_type, 
        event_data, 
        compliance_category, 
        severity_level
    ) VALUES (
        'compliance_report_generated',
        jsonb_build_object(
            'report_type', p_report_type,
            'period', jsonb_build_object('start', p_start_date, 'end', p_end_date),
            'generated_at', NOW()
        ),
        p_report_type,
        'info'
    );
    
    RETURN report;
END;
$ LANGUAGE plpgsql;

-- Create enhanced anonymization function
CREATE OR REPLACE FUNCTION enhanced_anonymize_expired_data()
RETURNS void AS $
DECLARE
    anonymized_count INTEGER := 0;
    deleted_count INTEGER := 0;
BEGIN
    -- Anonymize expired conversation data
    WITH anonymized AS (
        UPDATE chatbot_conversations 
        SET 
            user_message = '[ANONYMIZED]',
            bot_response = '[ANONYMIZED]',
            message_metadata = '{}',
            conversation_context = '{}',
            anonymized = TRUE,
            updated_at = NOW()
        WHERE 
            data_retention_until < NOW() 
            AND anonymized = FALSE
        RETURNING id
    )
    SELECT COUNT(*) INTO anonymized_count FROM anonymized;
    
    -- Delete very old audit logs (keep for 7 years as per LGPD)
    WITH deleted AS (
        DELETE FROM chatbot_audit_logs 
        WHERE created_at < NOW() - INTERVAL '7 years'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    -- Update session data
    UPDATE chatbot_sessions 
    SET 
        metadata = jsonb_build_object('anonymized', true),
        conversation_state = '{}',
        anonymized = TRUE
    WHERE 
        data_retention_until < NOW() 
        AND anonymized = FALSE;
    
    -- Log anonymization activity
    INSERT INTO chatbot_audit_logs (
        event_type, 
        event_data, 
        compliance_category, 
        severity_level
    ) VALUES (
        'automated_data_anonymization',
        jsonb_build_object(
            'anonymized_conversations', anonymized_count,
            'deleted_audit_logs', deleted_count,
            'anonymization_date', NOW()
        ),
        'lgpd',
        'info'
    );
    
    -- Update metrics
    PERFORM update_chatbot_metrics();
END;
$ LANGUAGE plpgsql;

-- Create triggers for automatic metric updates
CREATE TRIGGER update_chatbot_configuration_updated_at 
    BEFORE UPDATE ON chatbot_configuration 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE chatbot_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_configuration ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Service role can access all chatbot_metrics" ON chatbot_metrics
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all chatbot_feedback" ON chatbot_feedback
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all chatbot_configuration" ON chatbot_configuration
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON chatbot_metrics TO service_role;
GRANT ALL ON chatbot_feedback TO service_role;
GRANT ALL ON chatbot_configuration TO service_role;
GRANT SELECT ON consent_management_view TO service_role;

-- Create materialized view for performance analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS chatbot_performance_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_conversations,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(processing_time_ms) as avg_response_time,
    AVG(security_score) as avg_security_score,
    COUNT(*) FILTER (WHERE contains_medical_content = TRUE) as medical_conversations,
    COUNT(*) FILTER (WHERE emergency_detected = TRUE) as emergency_detections,
    COUNT(*) FILTER (WHERE compliance_review_required = TRUE) as compliance_reviews_needed,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) as p95_response_time,
    COUNT(*) FILTER (WHERE security_score < 70) as low_security_conversations
FROM chatbot_conversations
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_chatbot_performance_analytics_date ON chatbot_performance_analytics(date);

-- Grant access to materialized view
GRANT SELECT ON chatbot_performance_analytics TO service_role;

-- Add comments for documentation
COMMENT ON TABLE chatbot_metrics IS 'Hourly aggregated metrics for chatbot performance and compliance monitoring';
COMMENT ON TABLE chatbot_feedback IS 'User feedback collection for chatbot improvement and quality assurance';
COMMENT ON TABLE chatbot_configuration IS 'Dynamic configuration management for chatbot behavior and compliance';
COMMENT ON VIEW consent_management_view IS 'LGPD compliance view for consent status and data subject rights management';
COMMENT ON MATERIALIZED VIEW chatbot_performance_analytics IS 'Daily performance analytics for monitoring and reporting';

COMMENT ON FUNCTION update_chatbot_metrics() IS 'Updates hourly metrics for performance monitoring and compliance reporting';
COMMENT ON FUNCTION fulfill_data_subject_rights(VARCHAR, VARCHAR, JSONB) IS 'Fulfills LGPD data subject rights requests (access, portability, deletion, rectification)';
COMMENT ON FUNCTION generate_compliance_report(VARCHAR, DATE, DATE) IS 'Generates compliance reports for CFM, LGPD, and security audits';
COMMENT ON FUNCTION enhanced_anonymize_expired_data() IS 'Enhanced data anonymization with comprehensive logging and metrics updates';

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_performance_analytics()
RETURNS void AS $
BEGIN
    REFRESH MATERIALIZED VIEW chatbot_performance_analytics;
END;
$ LANGUAGE plpgsql;

-- Schedule automatic refresh of materialized view (requires pg_cron extension)
-- This would typically be set up separately in production
-- SELECT cron.schedule('refresh-chatbot-analytics', '0 1 * * *', 'SELECT refresh_performance_analytics();');