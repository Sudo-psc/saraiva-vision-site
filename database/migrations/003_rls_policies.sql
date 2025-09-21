-- Row Level Security (RLS) policies for Saraiva Vision database
-- This migration enables RLS and creates security policies for all tables

-- Enable RLS on all tables
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SERVICE ROLE POLICIES (Full access for backend operations)
-- ============================================================================

-- Contact Messages - Service role has full access
CREATE POLICY srv_all_contact_messages ON contact_messages 
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Appointments - Service role has full access
CREATE POLICY srv_all_appointments ON appointments 
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Message Outbox - Service role has full access
CREATE POLICY srv_all_message_outbox ON message_outbox 
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Podcast Episodes - Service role has full access
CREATE POLICY srv_all_podcast_episodes ON podcast_episodes 
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Event Log - Service role has full access
CREATE POLICY srv_all_event_log ON event_log 
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- ============================================================================
-- ADMIN USER POLICIES (Read access for dashboard)
-- ============================================================================

-- Contact Messages - Admin users can read all messages
CREATE POLICY admin_read_contact_messages ON contact_messages 
  FOR SELECT TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );

-- Appointments - Admin users can read and update appointments
CREATE POLICY admin_read_appointments ON appointments 
  FOR SELECT TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );

CREATE POLICY admin_update_appointments ON appointments 
  FOR UPDATE TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );

-- Message Outbox - Admin users can read message queue status
CREATE POLICY admin_read_message_outbox ON message_outbox 
  FOR SELECT TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );

-- Podcast Episodes - Admin users can read and manage episodes
CREATE POLICY admin_read_podcast_episodes ON podcast_episodes 
  FOR SELECT TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );

CREATE POLICY admin_manage_podcast_episodes ON podcast_episodes 
  FOR ALL TO authenticated 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );

-- Event Log - Admin users can read system events (filtered for privacy)
CREATE POLICY admin_read_event_log ON event_log 
  FOR SELECT TO authenticated 
  USING (
    (auth.jwt() ->> 'role' = 'admin' OR 
     auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin') AND
    severity IN ('info', 'warn', 'error', 'critical') -- Exclude debug logs
  );

-- ============================================================================
-- PUBLIC POLICIES (Very limited access for specific use cases)
-- ============================================================================

-- Podcast Episodes - Public read access for website display
CREATE POLICY public_read_podcast_episodes ON podcast_episodes 
  FOR SELECT TO anon 
  USING (published_at IS NOT NULL AND published_at <= NOW());

-- ============================================================================
-- SECURITY FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'role',
    auth.jwt() ->> 'user_metadata' ->> 'role',
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;