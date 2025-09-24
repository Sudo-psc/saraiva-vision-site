-- WordPress Database Initialization for Saraiva Vision Medical Website
-- Medical-specific database setup with LGPD compliance and audit trails

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- Create WordPress Database if not exists
CREATE DATABASE IF NOT EXISTS `saraiva_wordpress` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `saraiva_wordpress`;

-- Create WordPress API user for secure integration
CREATE USER IF NOT EXISTS 'api_user'@'%' IDENTIFIED BY 'api_pass_2024!';
GRANT SELECT, INSERT, UPDATE, DELETE ON `saraiva_wordpress`.* TO 'api_user'@'%';

-- Medical WordPress specific tables for LGPD compliance
CREATE TABLE IF NOT EXISTS `sv_medical_audit_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `object_type` varchar(50) NOT NULL,
  `object_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `details` longtext,
  PRIMARY KEY (`id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_object_type` (`object_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patient consent management for LGPD compliance
CREATE TABLE IF NOT EXISTS `sv_patient_consent` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_email` varchar(100) NOT NULL,
  `consent_type` varchar(50) NOT NULL,
  `consent_given` tinyint(1) NOT NULL DEFAULT 0,
  `consent_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `consent_withdrawn_date` datetime DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `legal_basis` varchar(100) DEFAULT NULL,
  `data_categories` longtext,
  `retention_period` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_patient_consent_type` (`patient_email`, `consent_type`),
  KEY `idx_patient_email` (`patient_email`),
  KEY `idx_consent_date` (`consent_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medical appointments integration table
CREATE TABLE IF NOT EXISTS `sv_appointments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_name` varchar(200) NOT NULL,
  `patient_email` varchar(100) NOT NULL,
  `patient_phone` varchar(20) NOT NULL,
  `patient_cpf` varchar(14) DEFAULT NULL,
  `appointment_date` datetime NOT NULL,
  `appointment_type` varchar(100) NOT NULL,
  `doctor_id` bigint(20) unsigned DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'scheduled',
  `notes` longtext,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `gdpr_consent` tinyint(1) NOT NULL DEFAULT 0,
  `marketing_consent` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_patient_email` (`patient_email`),
  KEY `idx_appointment_date` (`appointment_date`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medical staff/doctors management
CREATE TABLE IF NOT EXISTS `sv_medical_staff` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `wp_user_id` bigint(20) unsigned DEFAULT NULL,
  `crm_number` varchar(20) NOT NULL,
  `specialty` varchar(100) NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `bio` longtext,
  `qualifications` longtext,
  `available_times` longtext,
  `consultation_types` longtext,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_crm_number` (`crm_number`),
  KEY `idx_wp_user_id` (`wp_user_id`),
  KEY `idx_specialty` (`specialty`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medical content management (articles, procedures, etc.)
CREATE TABLE IF NOT EXISTS `sv_medical_content` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `wp_post_id` bigint(20) unsigned DEFAULT NULL,
  `content_type` varchar(50) NOT NULL,
  `medical_category` varchar(100) NOT NULL,
  `reviewed_by_doctor` bigint(20) unsigned DEFAULT NULL,
  `review_date` datetime DEFAULT NULL,
  `medical_accuracy_score` tinyint(4) DEFAULT NULL,
  `compliance_status` varchar(50) NOT NULL DEFAULT 'pending',
  `target_audience` varchar(100) DEFAULT NULL,
  `medical_disclaimer` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wp_post_id` (`wp_post_id`),
  KEY `idx_content_type` (`content_type`),
  KEY `idx_medical_category` (`medical_category`),
  KEY `idx_reviewed_by` (`reviewed_by_doctor`),
  KEY `idx_compliance_status` (`compliance_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LGPD data processing activities log
CREATE TABLE IF NOT EXISTS `sv_lgpd_processing_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processing_activity` varchar(100) NOT NULL,
  `legal_basis` varchar(100) NOT NULL,
  `data_subject_email` varchar(100) NOT NULL,
  `data_categories` longtext NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `retention_period` varchar(100) NOT NULL,
  `third_party_sharing` tinyint(1) NOT NULL DEFAULT 0,
  `automated_decision_making` tinyint(1) NOT NULL DEFAULT 0,
  `risk_level` varchar(20) NOT NULL DEFAULT 'low',
  `controller_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_data_subject_email` (`data_subject_email`),
  KEY `idx_processing_activity` (`processing_activity`),
  KEY `idx_legal_basis` (`legal_basis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System health monitoring for medical reliability
CREATE TABLE IF NOT EXISTS `sv_system_health` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `service_name` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `response_time_ms` int(11) DEFAULT NULL,
  `error_message` text,
  `health_score` tinyint(4) DEFAULT NULL,
  `checks_passed` int(11) DEFAULT NULL,
  `checks_total` int(11) DEFAULT NULL,
  `critical_failure` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_service_name` (`service_name`),
  KEY `idx_status` (`status`),
  KEY `idx_critical_failure` (`critical_failure`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial medical staff data (Dr. João Saraiva)
INSERT IGNORE INTO `sv_medical_staff` (
  `crm_number`,
  `specialty`,
  `full_name`,
  `bio`,
  `qualifications`,
  `available_times`,
  `consultation_types`,
  `status`
) VALUES (
  'CRM-SP 123456',
  'Oftalmologia',
  'Dr. João Saraiva',
  'Médico oftalmologista com mais de 15 anos de experiência em cirurgias de catarata, glaucoma e retina. Especialista em diagnóstico e tratamento de doenças oculares complexas.',
  'Graduação em Medicina - USP, Residência em Oftalmologia - UNIFESP, Fellowship em Retina - Harvard Medical School',
  '{"monday": ["09:00-12:00", "14:00-18:00"], "tuesday": ["09:00-12:00", "14:00-18:00"], "wednesday": ["09:00-12:00"], "thursday": ["09:00-12:00", "14:00-18:00"], "friday": ["09:00-12:00", "14:00-18:00"]}',
  '["Consulta Oftalmológica Geral", "Cirurgia de Catarata", "Tratamento de Glaucoma", "Cirurgia de Retina", "Exame de Fundo de Olho"]',
  'active'
);

-- Insert initial LGPD processing activities
INSERT IGNORE INTO `sv_lgpd_processing_log` (
  `processing_activity`,
  `legal_basis`,
  `data_subject_email`,
  `data_categories`,
  `purpose`,
  `retention_period`,
  `risk_level`
) VALUES (
  'appointment_booking',
  'consent_and_legitimate_interest',
  'system@saraivavision.com.br',
  '["name", "email", "phone", "cpf", "medical_history"]',
  'Medical appointment scheduling and patient care',
  '5_years_post_treatment',
  'medium'
),
(
  'contact_form_submission',
  'legitimate_interest',
  'system@saraivavision.com.br',
  '["name", "email", "phone", "inquiry_details"]',
  'Patient inquiries and communication',
  '3_years_post_contact',
  'low'
),
(
  'newsletter_subscription',
  'consent',
  'system@saraivavision.com.br',
  '["email", "preferences"]',
  'Healthcare information dissemination',
  'until_consent_withdrawn',
  'low'
);

-- Create indexes for performance optimization
ALTER TABLE `sv_medical_audit_log` ADD INDEX `idx_medical_audit_composite` (`timestamp`, `user_id`, `action`);
ALTER TABLE `sv_patient_consent` ADD INDEX `idx_consent_active` (`patient_email`, `consent_given`, `consent_withdrawn_date`);
ALTER TABLE `sv_appointments` ADD INDEX `idx_appointment_active` (`appointment_date`, `status`, `patient_email`);
ALTER TABLE `sv_lgpd_processing_log` ADD INDEX `idx_processing_composite` (`timestamp`, `data_subject_email`, `processing_activity`);

-- Create triggers for audit logging
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS `sv_appointments_audit_insert`
AFTER INSERT ON `sv_appointments`
FOR EACH ROW
BEGIN
  INSERT INTO `sv_medical_audit_log` (
    `action`,
    `object_type`,
    `object_id`,
    `details`
  ) VALUES (
    'appointment_created',
    'appointment',
    NEW.id,
    CONCAT('Patient: ', NEW.patient_email, ', Date: ', NEW.appointment_date, ', Type: ', NEW.appointment_type)
  );
END$$

CREATE TRIGGER IF NOT EXISTS `sv_appointments_audit_update`
AFTER UPDATE ON `sv_appointments`
FOR EACH ROW
BEGIN
  INSERT INTO `sv_medical_audit_log` (
    `action`,
    `object_type`,
    `object_id`,
    `details`
  ) VALUES (
    'appointment_updated',
    'appointment',
    NEW.id,
    CONCAT('Status changed from: ', OLD.status, ' to: ', NEW.status)
  );
END$$

CREATE TRIGGER IF NOT EXISTS `sv_patient_consent_audit`
AFTER INSERT ON `sv_patient_consent`
FOR EACH ROW
BEGIN
  INSERT INTO `sv_medical_audit_log` (
    `action`,
    `object_type`,
    `object_id`,
    `details`
  ) VALUES (
    'consent_recorded',
    'patient_consent',
    NEW.id,
    CONCAT('Patient: ', NEW.patient_email, ', Type: ', NEW.consent_type, ', Given: ', NEW.consent_given)
  );
END$$

DELIMITER ;

-- Create stored procedures for common operations
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS `GetPatientConsentStatus`(
  IN patient_email_param VARCHAR(100)
)
BEGIN
  SELECT
    consent_type,
    consent_given,
    consent_date,
    consent_withdrawn_date,
    legal_basis,
    retention_period
  FROM sv_patient_consent
  WHERE patient_email = patient_email_param
    AND (consent_withdrawn_date IS NULL OR consent_withdrawn_date > NOW())
  ORDER BY consent_date DESC;
END$$

CREATE PROCEDURE IF NOT EXISTS `LogLGPDProcessingActivity`(
  IN activity_param VARCHAR(100),
  IN legal_basis_param VARCHAR(100),
  IN data_subject_param VARCHAR(100),
  IN data_categories_param LONGTEXT,
  IN purpose_param VARCHAR(255),
  IN retention_param VARCHAR(100),
  IN risk_level_param VARCHAR(20)
)
BEGIN
  INSERT INTO sv_lgpd_processing_log (
    processing_activity,
    legal_basis,
    data_subject_email,
    data_categories,
    purpose,
    retention_period,
    risk_level
  ) VALUES (
    activity_param,
    legal_basis_param,
    data_subject_param,
    data_categories_param,
    purpose_param,
    retention_param,
    risk_level_param
  );
END$$

CREATE PROCEDURE IF NOT EXISTS `GetSystemHealthSummary`()
BEGIN
  SELECT
    service_name,
    AVG(health_score) as avg_health_score,
    COUNT(*) as total_checks,
    SUM(CASE WHEN critical_failure = 1 THEN 1 ELSE 0 END) as critical_failures,
    MAX(timestamp) as last_check
  FROM sv_system_health
  WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  GROUP BY service_name
  ORDER BY avg_health_score DESC;
END$$

DELIMITER ;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON `saraiva_wordpress`.`sv_medical_audit_log` TO 'api_user'@'%';
GRANT SELECT, INSERT, UPDATE ON `saraiva_wordpress`.`sv_patient_consent` TO 'api_user'@'%';
GRANT SELECT, INSERT, UPDATE ON `saraiva_wordpress`.`sv_appointments` TO 'api_user'@'%';
GRANT SELECT, INSERT ON `saraiva_wordpress`.`sv_lgpd_processing_log` TO 'api_user'@'%';
GRANT SELECT, INSERT ON `saraiva_wordpress`.`sv_system_health` TO 'api_user'@'%';
GRANT EXECUTE ON PROCEDURE `saraiva_wordpress`.`GetPatientConsentStatus` TO 'api_user'@'%';
GRANT EXECUTE ON PROCEDURE `saraiva_wordpress`.`LogLGPDProcessingActivity` TO 'api_user'@'%';
GRANT EXECUTE ON PROCEDURE `saraiva_wordpress`.`GetSystemHealthSummary` TO 'api_user'@'%';

-- Insert initial system health check
INSERT INTO `sv_system_health` (
  `service_name`,
  `status`,
  `health_score`,
  `checks_passed`,
  `checks_total`
) VALUES (
  'wordpress_database',
  'healthy',
  100,
  5,
  5
);

-- Create views for reporting
CREATE OR REPLACE VIEW `v_appointment_summary` AS
SELECT
  DATE(appointment_date) as appointment_day,
  appointment_type,
  status,
  COUNT(*) as appointment_count,
  COUNT(DISTINCT patient_email) as unique_patients
FROM sv_appointments
WHERE appointment_date >= CURDATE() - INTERVAL 30 DAY
GROUP BY DATE(appointment_date), appointment_type, status;

CREATE OR REPLACE VIEW `v_consent_compliance` AS
SELECT
  consent_type,
  COUNT(*) as total_consents,
  SUM(CASE WHEN consent_given = 1 THEN 1 ELSE 0 END) as consents_given,
  SUM(CASE WHEN consent_withdrawn_date IS NOT NULL THEN 1 ELSE 0 END) as consents_withdrawn,
  (SUM(CASE WHEN consent_given = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as consent_rate
FROM sv_patient_consent
GROUP BY consent_type;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- Completion message
SELECT 'WordPress Database Initialization Complete - Medical System Ready' as Status;