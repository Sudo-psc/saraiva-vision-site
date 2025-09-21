-- Initial database schema for Saraiva Vision backend
-- This migration creates all core tables with proper constraints and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Contact Messages Table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  ip_hash VARCHAR(64), -- SHA-256 hashed IP for rate limiting
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT contact_messages_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT contact_messages_name_check CHECK (length(trim(name)) >= 2),
  CONSTRAINT contact_messages_message_check CHECK (length(trim(message)) >= 10)
);

-- Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name VARCHAR(100) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  confirmation_token VARCHAR(64) UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_2h_sent BOOLEAN DEFAULT false,
  
  -- Constraints
  CONSTRAINT appointments_email_check CHECK (patient_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT appointments_name_check CHECK (length(trim(patient_name)) >= 2),
  CONSTRAINT appointments_future_date CHECK (appointment_date >= CURRENT_DATE),
  CONSTRAINT appointments_business_hours CHECK (
    appointment_time >= '08:00:00' AND appointment_time <= '18:00:00'
  ),
  -- Prevent double booking (same date/time)
  CONSTRAINT appointments_unique_slot UNIQUE (appointment_date, appointment_time)
);

-- Message Outbox Table (for reliable message delivery)
CREATE TABLE message_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('email', 'sms')),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  template_data JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  send_after TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT outbox_retry_count_check CHECK (retry_count >= 0 AND retry_count <= max_retries),
  CONSTRAINT outbox_max_retries_check CHECK (max_retries >= 0 AND max_retries <= 10)
);

-- Podcast Episodes Table
CREATE TABLE podcast_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id VARCHAR(255) UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_ms INTEGER,
  published_at TIMESTAMPTZ,
  spotify_url VARCHAR(500),
  embed_url VARCHAR(500),
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT podcast_title_check CHECK (length(trim(title)) >= 3),
  CONSTRAINT podcast_duration_check CHECK (duration_ms > 0),
  CONSTRAINT podcast_urls_check CHECK (
    (spotify_url IS NULL OR spotify_url ~* '^https?://') AND
    (embed_url IS NULL OR embed_url ~* '^https?://') AND
    (image_url IS NULL OR image_url ~* '^https?://')
  )
);

-- Event Log Table (for system monitoring and debugging)
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
  source VARCHAR(50), -- api endpoint or service name
  request_id VARCHAR(64), -- for tracing requests across services
  user_id UUID, -- optional user context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT event_type_check CHECK (length(trim(event_type)) >= 3)
);