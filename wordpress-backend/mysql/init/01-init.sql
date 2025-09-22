-- WordPress Database Initialization
-- This script runs when the MySQL container starts for the first time

-- Create WordPress database if it doesn't exist
CREATE DATABASE IF NOT EXISTS wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create WordPress user and grant permissions
CREATE USER IF NOT EXISTS 'wordpress'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress'@'%';
FLUSH PRIVILEGES;

-- Use the WordPress database
USE wordpress;

-- Create custom tables for Saraiva Vision
-- Contact form submissions table
CREATE TABLE IF NOT EXISTS wp_saraiva_contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    service_type VARCHAR(100),
    preferred_contact VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'read', 'responded', 'archived') DEFAULT 'new',
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS wp_saraiva_newsletter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    interests JSON,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    status ENUM('active', 'unsubscribed', 'bounced') DEFAULT 'active',
    source VARCHAR(100),
    INDEX idx_status (status),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointment requests table
CREATE TABLE IF NOT EXISTS wp_saraiva_appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME,
    service_type VARCHAR(100) NOT NULL,
    doctor_preference VARCHAR(255),
    symptoms TEXT,
    insurance_info VARCHAR(255),
    emergency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    INDEX idx_status (status),
    INDEX idx_preferred_date (preferred_date),
    INDEX idx_patient_email (patient_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics events table
CREATE TABLE IF NOT EXISTS wp_saraiva_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Performance monitoring table
CREATE TABLE IF NOT EXISTS wp_saraiva_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time FLOAT NOT NULL,
    response_size INT,
    status_code INT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_endpoint (endpoint),
    INDEX idx_created_at (created_at),
    INDEX idx_response_time (response_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
-- These will be created after WordPress installation
-- since we don't know the exact table names yet

-- Set up event scheduler for maintenance tasks
SET GLOBAL event_scheduler = ON;

-- Create event to clean up old analytics data (keep last 90 days)
CREATE EVENT IF NOT EXISTS cleanup_old_analytics
ON SCHEDULE EVERY 1 DAY STARTS '2024-01-01 02:00:00'
DO
    DELETE FROM wp_saraiva_analytics
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Create event to archive old contact submissions (older than 2 years)
CREATE EVENT IF NOT EXISTS archive_old_contacts
ON SCHEDULE EVERY 1 MONTH STARTS '2024-01-01 03:00:00'
DO
    UPDATE wp_saraiva_contact_submissions
    SET status = 'archived'
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR) AND status != 'archived';