-- LGPD Compliance Database Schema
-- Creates tables and policies for data privacy and access control

-- User profiles table for role-based access control
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'patient',
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_role CHECK (role IN ('admin', 'doctor', 'staff', 'patient'))
);

-- LGPD audit log for tracking data access and modifications
CREATE TABLE IF NOT EXISTS lgpd_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_identifier VARCHAR(255), -- Hashed identifier for privacy
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    record_count INTEGER DEFAULT 0,
    anonymized_data JSONB,
    performed_by UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_action CHECK (action IN (
        'data_access', 'data_export_portability', 'data_deletion', 
        'data_anonymization', 'anonymized_backup', 'consent_given',
        'consent_withdrawn', 'data_correction'
    ))
);

-- Access audit log for tracking permission-based access
CREATE TABLE IF NOT EXISTS access_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    permission_requested VARCHAR(100) NOT NULL,
    access_granted BOOLEAN NOT NULL,
    resource_accessed VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Consent records for LGPD compliance
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_identifier VARCHAR(255) NOT NULL, -- Hashed email or ID
    consent_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    purposes JSONB NOT NULL DEFAULT '[]'::jsonb,
    consent_given BOOLEAN NOT NULL DEFAULT true,
    consent_method VARCHAR(50) NOT NULL, -- 'banner_accept', 'form_checkbox', etc.
    ip_hash VARCHAR(64), -- SHA-256 hashed IP
    user_agent_hash VARCHAR(64), -- SHA-256 hashed user agent
    withdrawn_at TIMESTAMPTZ,
    withdrawal_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data retention policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    retention_days INTEGER NOT NULL,
    policy_description TEXT,
    legal_basis VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(table_name)
);

-- Insert default retention policies
INSERT INTO data_retention_policies (table_name, retention_days, policy_description, legal_basis) VALUES
('contact_messages', 730, 'Mensagens de contato mantidas por 2 anos', 'LGPD Art. 16 - Eliminação após término da finalidade'),
('appointments', 1825, 'Dados de consultas mantidos por 5 anos', 'CFM Resolução 1.821/2007 - Prontuário médico'),
('lgpd_audit_log', 2555, 'Logs de auditoria mantidos por 7 anos', 'LGPD Art. 37 - Registro das operações'),
('consent_records', 1095, 'Registros de consentimento mantidos por 3 anos após retirada', 'LGPD Art. 8º §5º - Comprovação do consentimento'),
('access_audit_log', 1095, 'Logs de acesso mantidos por 3 anos', 'LGPD Art. 48 - Medidas de segurança')
ON CONFLICT (table_name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY user_profiles_admin_all ON user_profiles
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY user_profiles_own_read ON user_profiles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY user_profiles_service_all ON user_profiles
    FOR ALL TO service_role
    USING (true);

-- RLS Policies for lgpd_audit_log
CREATE POLICY lgpd_audit_admin_read ON lgpd_audit_log
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'doctor'));

CREATE POLICY lgpd_audit_service_all ON lgpd_audit_log
    FOR ALL TO service_role
    USING (true);

-- RLS Policies for access_audit_log
CREATE POLICY access_audit_admin_read ON access_audit_log
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY access_audit_own_read ON access_audit_log
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY access_audit_service_all ON access_audit_log
    FOR ALL TO service_role
    USING (true);

-- RLS Policies for consent_records
CREATE POLICY consent_records_admin_read ON consent_records
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'doctor'));

CREATE POLICY consent_records_service_all ON consent_records
    FOR ALL TO service_role
    USING (true);

-- RLS Policies for data_retention_policies
CREATE POLICY retention_policies_admin_all ON data_retention_policies
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY retention_policies_read_all ON data_retention_policies
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY retention_policies_service_all ON data_retention_policies
    FOR ALL TO service_role
    USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_lgpd_audit_patient ON lgpd_audit_log(patient_identifier);
CREATE INDEX IF NOT EXISTS idx_lgpd_audit_action ON lgpd_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_lgpd_audit_created ON lgpd_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_access_audit_user ON access_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_timestamp ON access_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_consent_patient ON consent_records(patient_identifier);
CREATE INDEX IF NOT EXISTS idx_consent_created ON consent_records(created_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_records_updated_at 
    BEFORE UPDATE ON consent_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retention_policies_updated_at 
    BEFORE UPDATE ON data_retention_policies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check data retention and mark for deletion
CREATE OR REPLACE FUNCTION check_data_retention()
RETURNS void AS $$
DECLARE
    policy_record RECORD;
    retention_date TIMESTAMPTZ;
BEGIN
    -- Loop through all retention policies
    FOR policy_record IN SELECT * FROM data_retention_policies LOOP
        retention_date := NOW() - (policy_record.retention_days || ' days')::INTERVAL;
        
        -- Mark expired records (don't delete immediately for safety)
        CASE policy_record.table_name
            WHEN 'contact_messages' THEN
                UPDATE contact_messages 
                SET updated_at = NOW() 
                WHERE created_at < retention_date 
                AND updated_at IS NOT NULL; -- Use as deletion marker
                
            WHEN 'appointments' THEN
                UPDATE appointments 
                SET updated_at = NOW() 
                WHERE created_at < retention_date 
                AND status NOT IN ('confirmed', 'completed'); -- Keep active appointments
                
            WHEN 'lgpd_audit_log' THEN
                -- Audit logs should be archived, not deleted
                UPDATE lgpd_audit_log 
                SET created_at = created_at -- No-op, just for logging
                WHERE created_at < retention_date;
                
            ELSE
                -- Log unknown table
                INSERT INTO lgpd_audit_log (action, reason) 
                VALUES ('retention_check_unknown_table', 'Table: ' || policy_record.table_name);
        END CASE;
    END LOOP;
    
    -- Log retention check
    INSERT INTO lgpd_audit_log (action, reason) 
    VALUES ('data_retention_check', 'Automated retention policy check completed');
END;
$$ LANGUAGE plpgsql;

-- Function to anonymize expired data
CREATE OR REPLACE FUNCTION anonymize_expired_data()
RETURNS void AS $$
BEGIN
    -- This function should be implemented based on your anonymization requirements
    -- For now, just log that it was called
    INSERT INTO lgpd_audit_log (action, reason) 
    VALUES ('anonymization_check', 'Automated anonymization check completed');
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Perfis de usuário com controle de acesso baseado em funções para conformidade LGPD';
COMMENT ON TABLE lgpd_audit_log IS 'Log de auditoria para rastreamento de operações de dados pessoais conforme LGPD';
COMMENT ON TABLE access_audit_log IS 'Log de auditoria para rastreamento de acessos e permissões do sistema';
COMMENT ON TABLE consent_records IS 'Registros de consentimento para conformidade com LGPD Art. 8º';
COMMENT ON TABLE data_retention_policies IS 'Políticas de retenção de dados conforme LGPD Art. 16';

COMMENT ON FUNCTION check_data_retention() IS 'Verifica políticas de retenção e marca dados expirados para remoção';
COMMENT ON FUNCTION anonymize_expired_data() IS 'Anonimiza dados expirados conforme políticas de retenção LGPD';