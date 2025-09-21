-- Complete Supabase database setup for Saraiva Vision
-- Execute these migrations in order in your Supabase SQL editor

-- ============================================================================
-- MIGRATION 001: Initial Schema
-- ============================================================================
\i 001_initial_schema.sql

-- ============================================================================
-- MIGRATION 002: Performance Indexes
-- ============================================================================
\i 002_indexes.sql

-- ============================================================================
-- MIGRATION 003: Row Level Security Policies
-- ============================================================================
\i 003_rls_policies.sql

-- ============================================================================
-- MIGRATION 004: Triggers and Functions
-- ============================================================================
\i 004_triggers_functions.sql

-- ============================================================================
-- MIGRATION 005: Authentication Setup
-- ============================================================================
\i 005_auth_setup.sql

-- ============================================================================
-- CONFIGURATION SETTINGS
-- ============================================================================

-- Set application settings for IP hashing salt
-- Replace 'your-secret-salt' with a secure random string
ALTER DATABASE postgres SET app.ip_salt = 'your-secret-salt-change-this-in-production';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Verify indexes were created
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify functions were created
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Test basic functionality
SELECT 'Database setup completed successfully!' as status;