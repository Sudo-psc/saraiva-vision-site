-- Chatbot Database Schema
-- Migration 008: Create tables for AI chatbot functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chatbot_conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    message_metadata JSONB DEFAULT '{}',
    compliance_flags JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- LGPD Compliance fields
    user_consent_id UUID,
    data_retention_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '365 days'),
    anonymized BOOLEAN DEFAULT FALSE,
    
    -- Performance indexes
    CONSTRAINT chatbot_conversations_session_id_idx UNIQUE (session_id, created_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_created_at ON chatbot_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_compliance_flags ON chatbot_conversations USING GIN (compliance_flags);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_retention ON chatbot_conversations(data_retention_until) WHERE anonymized = FALSE;

-- Create user_consents table for LGPD compliance
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255),
    consent_type VARCHAR(100) NOT NULL,
    consent_granted BOOLEAN NOT NULL,
    consent_text TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- LGPD Compliance fields
    legal_basis VARCHAR(100) NOT NULL DEFAULT 'consent',
    data_controller VARCHAR(255) NOT NULL DEFAULT 'Saraiva Vision',
    processing_purpose TEXT,
    
    -- Constraints
    CONSTRAINT valid_consent_type CHECK (consent_type IN ('data_processing', 'medical_data', 'marketing', 'analytics', 'cookies'))
);

-- Create indexes for user_consents
CREATE INDEX IF NOT EXISTS idx_user_consents_session_id ON user_consents(session_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_consent_type ON user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_created_at ON user_consents(created_at);
CREATE INDEX IF NOT EXISTS idx_user_consents_expires_at ON user_consents(expires_at) WHERE expires_at IS NOT NULL;

-- Create medical_referrals table for referral management
CREATE TABLE IF NOT EXISTS medical_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_name VARCHAR(255) NOT NULL,
    patient_contact VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255),
    referring_symptoms TEXT[],
    specialty_requested VARCHAR(100),
    urgency_level VARCHAR(20) NOT NULL DEFAULT 'routine',
    status VARCHAR(50) DEFAULT 'pending',
    created_via VARCHAR(50) DEFAULT 'chatbot',
    session_id VARCHAR(255),
    
    -- CFM Compliance fields
    medical_disclaimer_shown BOOLEAN DEFAULT TRUE,
    requires_in_person_evaluation BOOLEAN DEFAULT TRUE,
    referral_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_urgency_level CHECK (urgency_level IN ('routine', 'urgent', 'emergency')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled'))
);

-- Create indexes for medical_referrals
CREATE INDEX IF NOT EXISTS idx_medical_referrals_status ON medical_referrals(status);
CREATE INDEX IF NOT EXISTS idx_medical_referrals_urgency_level ON medical_referrals(urgency_level);
CREATE INDEX IF NOT EXISTS idx_medical_referrals_created_at ON medical_referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_medical_referrals_session_id ON medical_referrals(session_id);

-- Create enhanced chatbot_sessions table for conversation state management
CREATE TABLE IF NOT EXISTS chatbot_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID, -- Optional user reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Session metadata
    metadata JSONB DEFAULT '{}', -- userAgent, ipAddress (hashed), language, etc.
    
    -- Consent management
    consent JSONB DEFAULT '{}', -- dataProcessing, medicalData, analytics, etc.
    
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{}', -- encryptMessages, retentionPeriod, etc.
    
    -- Conversation state
    conversation_state JSONB DEFAULT '{}', -- currentTopic, currentIntent, appointmentContext, etc.
    
    -- LGPD Compliance
    data_retention_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '365 days'),
    anonymized BOOLEAN DEFAULT FALSE,
    
    -- Session status
    is_active BOOLEAN DEFAULT TRUE
);

-- Update chatbot_conversations table to support enhanced message storage
ALTER TABLE chatbot_conversations 
ADD COLUMN IF NOT EXISTS message_id UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS encrypted BOOLEAN DEFAULT FALSE;

-- Update the constraint to allow multiple messages per session
DROP CONSTRAINT IF EXISTS chatbot_conversations_session_id_idx;
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_message ON chatbot_conversations(session_id, created_at);

-- Create indexes for chatbot_sessions
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_session_id ON chatbot_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_last_activity ON chatbot_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_retention ON chatbot_sessions(data_retention_until) WHERE anonymized = FALSE;

-- Create audit_logs table for compliance tracking
CREATE TABLE IF NOT EXISTS chatbot_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    session_id VARCHAR(255),
    user_ip INET,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Compliance fields
    compliance_category VARCHAR(50), -- 'cfm', 'lgpd', 'security', 'medical'
    severity_level VARCHAR(20) DEFAULT 'info' -- 'info', 'warning', 'error', 'critical'
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_chatbot_audit_logs_event_type ON chatbot_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_chatbot_audit_logs_created_at ON chatbot_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_audit_logs_compliance_category ON chatbot_audit_logs(compliance_category);
CREATE INDEX IF NOT EXISTS idx_chatbot_audit_logs_severity ON chatbot_audit_logs(severity_level);

-- Add foreign key relationships
ALTER TABLE chatbot_conversations 
ADD CONSTRAINT fk_chatbot_conversations_consent 
FOREIGN KEY (user_consent_id) REFERENCES user_consents(id) ON DELETE SET NULL;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_chatbot_conversations_updated_at 
    BEFORE UPDATE ON chatbot_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_referrals_updated_at 
    BEFORE UPDATE ON medical_referrals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for automatic data anonymization (LGPD compliance)
CREATE OR REPLACE FUNCTION anonymize_expired_data()
RETURNS void AS $$
BEGIN
    -- Anonymize expired conversation data
    UPDATE chatbot_conversations 
    SET 
        user_message = '[ANONYMIZED]',
        bot_response = '[ANONYMIZED]',
        message_metadata = '{}',
        anonymized = TRUE
    WHERE 
        data_retention_until < NOW() 
        AND anonymized = FALSE;
    
    -- Anonymize expired session data
    UPDATE chatbot_sessions 
    SET 
        user_ip = NULL,
        user_agent = '[ANONYMIZED]',
        session_data = '{}',
        anonymized = TRUE
    WHERE 
        data_retention_until < NOW() 
        AND anonymized = FALSE;
    
    -- Log anonymization activity
    INSERT INTO chatbot_audit_logs (event_type, event_data, compliance_category, severity_level)
    VALUES (
        'data_anonymization',
        jsonb_build_object(
            'anonymized_conversations', (SELECT COUNT(*) FROM chatbot_conversations WHERE anonymized = TRUE AND updated_at > NOW() - INTERVAL '1 minute'),
            'anonymized_sessions', (SELECT COUNT(*) FROM chatbot_sessions WHERE anonymized = TRUE AND last_activity > NOW() - INTERVAL '1 minute')
        ),
        'lgpd',
        'info'
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old audit logs (keep for 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM chatbot_audit_logs 
    WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service role access
CREATE POLICY "Service role can access all chatbot_conversations" ON chatbot_conversations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all user_consents" ON user_consents
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all medical_referrals" ON medical_referrals
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all chatbot_sessions" ON chatbot_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all chatbot_audit_logs" ON chatbot_audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON chatbot_conversations TO service_role;
GRANT ALL ON user_consents TO service_role;
GRANT ALL ON medical_referrals TO service_role;
GRANT ALL ON chatbot_sessions TO service_role;
GRANT ALL ON chatbot_audit_logs TO service_role;

-- Create a view for conversation analytics (anonymized)
CREATE OR REPLACE VIEW chatbot_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_conversations,
    COUNT(CASE WHEN compliance_flags->>'emergency_detected' = 'true' THEN 1 END) as emergency_conversations,
    COUNT(CASE WHEN compliance_flags->>'medical_advice_detected' = 'true' THEN 1 END) as medical_advice_conversations,
    AVG(LENGTH(user_message)) as avg_message_length,
    COUNT(DISTINCT session_id) as unique_sessions
FROM chatbot_conversations
WHERE anonymized = FALSE
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant access to analytics view
GRANT SELECT ON chatbot_analytics TO service_role;

COMMENT ON TABLE chatbot_conversations IS 'Stores all chatbot conversation messages with compliance tracking';
COMMENT ON TABLE user_consents IS 'Manages user consent for LGPD compliance';
COMMENT ON TABLE medical_referrals IS 'Tracks medical referral requests from chatbot';
COMMENT ON TABLE chatbot_sessions IS 'Manages chatbot session data and lifecycle';
COMMENT ON TABLE chatbot_audit_logs IS 'Comprehensive audit trail for compliance and security';
COMMENT ON VIEW chatbot_analytics IS 'Anonymized analytics view for conversation insights';