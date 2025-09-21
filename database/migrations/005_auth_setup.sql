-- Supabase Auth configuration for admin dashboard access
-- This migration sets up authentication and user management

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================

-- Create profiles table to extend auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT profiles_full_name_check CHECK (length(trim(full_name)) >= 2)
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

-- Service role has full access to profiles
CREATE POLICY srv_all_profiles ON profiles 
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Users can read their own profile
CREATE POLICY users_read_own_profile ON profiles 
  FOR SELECT TO authenticated 
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY users_update_own_profile ON profiles 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Prevent role escalation
  );

-- Admins can read all profiles
CREATE POLICY admins_read_all_profiles ON profiles 
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Super admins can manage all profiles
CREATE POLICY super_admins_manage_profiles ON profiles 
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================================
-- AUTH FUNCTIONS
-- ============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  
  -- Log the new user registration
  PERFORM log_event(
    'user_registered',
    jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'role', COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    ),
    'info',
    'auth_system'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user registration
CREATE TRIGGER tr_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_login = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last login on sign in
CREATE TRIGGER tr_update_last_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION update_last_login();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('admin', 'super_admin') AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role_from_profile(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id AND is_active = true;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADMIN DASHBOARD FUNCTIONS
-- ============================================================================

-- Function to get dashboard statistics (admin only)
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Check if user is admin
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  SELECT jsonb_build_object(
    'total_contacts', (SELECT COUNT(*) FROM contact_messages),
    'total_appointments', (SELECT COUNT(*) FROM appointments),
    'pending_appointments', (SELECT COUNT(*) FROM appointments WHERE status = 'pending'),
    'confirmed_appointments', (SELECT COUNT(*) FROM appointments WHERE status = 'confirmed'),
    'pending_messages', (SELECT COUNT(*) FROM message_outbox WHERE status = 'pending'),
    'failed_messages', (SELECT COUNT(*) FROM message_outbox WHERE status = 'failed'),
    'total_podcast_episodes', (SELECT COUNT(*) FROM podcast_episodes),
    'recent_contacts_24h', (
      SELECT COUNT(*) FROM contact_messages 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    ),
    'recent_appointments_24h', (
      SELECT COUNT(*) FROM appointments 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    ),
    'system_errors_24h', (
      SELECT COUNT(*) FROM event_log 
      WHERE severity IN ('error', 'critical') 
        AND created_at >= NOW() - INTERVAL '24 hours'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL ADMIN USER SETUP
-- ============================================================================

-- Function to create initial admin user (run manually after setup)
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT DEFAULT 'Administrator'
)
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- This function should be called manually during initial setup
  -- It creates an admin user with the specified credentials
  
  -- Note: In production, this should be done through Supabase Auth UI
  -- or by manually inserting into auth.users table
  
  RAISE NOTICE 'To create admin user, use Supabase Auth UI or SQL:';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'After user creation, update their role in profiles table';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR AUTH TABLES
-- ============================================================================

-- Indexes for profiles table
CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_profiles_role ON profiles (role);
CREATE INDEX idx_profiles_is_active ON profiles (is_active);
CREATE INDEX idx_profiles_last_login ON profiles (last_login DESC);

-- Trigger to update updated_at on profiles
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();