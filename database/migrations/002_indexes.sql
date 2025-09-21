-- Performance optimization indexes for Saraiva Vision database
-- This migration creates indexes for common query patterns

-- Contact Messages Indexes
CREATE INDEX idx_contact_messages_created_at ON contact_messages (created_at DESC);
CREATE INDEX idx_contact_messages_email ON contact_messages (email);
CREATE INDEX idx_contact_messages_ip_hash ON contact_messages (ip_hash, created_at) 
  WHERE ip_hash IS NOT NULL; -- Partial index for rate limiting

-- Appointments Indexes
CREATE INDEX idx_appointments_date_time ON appointments (appointment_date, appointment_time);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_appointments_patient_email ON appointments (patient_email);
CREATE INDEX idx_appointments_created_at ON appointments (created_at DESC);
CREATE INDEX idx_appointments_confirmation_token ON appointments (confirmation_token) 
  WHERE confirmation_token IS NOT NULL; -- Partial index for active tokens
CREATE INDEX idx_appointments_reminders ON appointments (appointment_date, reminder_24h_sent, reminder_2h_sent)
  WHERE status = 'confirmed'; -- For reminder processing

-- Message Outbox Indexes
CREATE INDEX idx_outbox_status_send_after ON message_outbox (status, send_after)
  WHERE status IN ('pending', 'failed'); -- For processing queue
CREATE INDEX idx_outbox_created_at ON message_outbox (created_at DESC);
CREATE INDEX idx_outbox_message_type ON message_outbox (message_type);
CREATE INDEX idx_outbox_retry_count ON message_outbox (retry_count, status)
  WHERE status = 'failed'; -- For retry logic

-- Podcast Episodes Indexes
CREATE INDEX idx_podcast_episodes_published_at ON podcast_episodes (published_at DESC NULLS LAST);
CREATE INDEX idx_podcast_episodes_spotify_id ON podcast_episodes (spotify_id) 
  WHERE spotify_id IS NOT NULL; -- Partial index for Spotify sync
CREATE INDEX idx_podcast_episodes_updated_at ON podcast_episodes (updated_at DESC);

-- Event Log Indexes
CREATE INDEX idx_event_log_created_at ON event_log (created_at DESC);
CREATE INDEX idx_event_log_event_type ON event_log (event_type);
CREATE INDEX idx_event_log_severity ON event_log (severity);
CREATE INDEX idx_event_log_source ON event_log (source);
CREATE INDEX idx_event_log_request_id ON event_log (request_id) 
  WHERE request_id IS NOT NULL; -- For request tracing
CREATE INDEX idx_event_log_user_id ON event_log (user_id) 
  WHERE user_id IS NOT NULL; -- For user activity tracking

-- Composite indexes for common query patterns
CREATE INDEX idx_appointments_date_status ON appointments (appointment_date, status);
CREATE INDEX idx_event_log_type_severity_created ON event_log (event_type, severity, created_at DESC);
CREATE INDEX idx_outbox_type_status_created ON message_outbox (message_type, status, created_at DESC);