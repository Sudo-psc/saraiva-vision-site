# Supabase Database Setup for Saraiva Vision

This directory contains the complete database schema and setup scripts for the Saraiva Vision backend system.

## Overview

The database schema includes:
- **Contact Messages**: Patient inquiries and contact form submissions
- **Appointments**: Appointment scheduling and management
- **Message Outbox**: Reliable email/SMS delivery system
- **Podcast Episodes**: Spotify podcast synchronization
- **Event Log**: System monitoring and audit trails
- **Profiles**: User authentication and role management

## Migration Files

Execute these migrations in order:

1. `001_initial_schema.sql` - Core tables and constraints
2. `002_indexes.sql` - Performance optimization indexes
3. `003_rls_policies.sql` - Row Level Security policies
4. `004_triggers_functions.sql` - Database triggers and functions
5. `005_auth_setup.sql` - Authentication and user management

## Quick Setup

### Option 1: Run All Migrations at Once

```sql
-- Copy and paste the contents of setup.sql into Supabase SQL Editor
-- This will run all migrations in the correct order
```

### Option 2: Run Individual Migrations

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste each migration file content in order
3. Execute each migration one by one

## Environment Configuration

### Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# IP Hashing Salt (for rate limiting)
IP_SALT=your-secret-salt-change-this-in-production
```

### Update IP Salt

After running the migrations, update the IP hashing salt:

```sql
ALTER DATABASE postgres SET app.ip_salt = 'your-secure-random-salt-here';
```

## Authentication Setup

### Creating Admin Users

1. **Via Supabase Auth UI:**
   - Go to Authentication → Users in Supabase Dashboard
   - Click "Add User"
   - Enter email and password
   - After creation, update the user's role in the profiles table

2. **Via SQL (after user exists in auth.users):**
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'admin@saraivavision.com.br';
   ```

### User Roles

- `user` - Default role for regular users
- `admin` - Dashboard access, can view and manage data
- `super_admin` - Full system access, can manage other users

## Row Level Security (RLS)

All tables have RLS enabled with the following access patterns:

### Service Role (Backend API)
- Full access to all tables for API operations

### Admin Users
- Read access to operational data
- Update access to appointments and podcast episodes
- No access to sensitive contact information details

### Anonymous Users
- Read access to published podcast episodes only

### Authenticated Users
- Read/update their own profile
- Admins can read all profiles
- Super admins can manage all profiles

## Database Functions

### Appointment Management

```sql
-- Check if a time slot is available
SELECT check_appointment_availability('2024-01-15', '14:00:00');

-- Get available slots for a date range
SELECT * FROM get_available_slots('2024-01-15', '2024-01-22');
```

### Message Outbox

```sql
-- Add message to outbox for reliable delivery
SELECT add_to_outbox(
  'email',
  'patient@example.com',
  'Appointment Confirmation',
  'Your appointment has been confirmed...',
  '{"appointment_id": "123", "date": "2024-01-15"}'::jsonb
);
```

### Event Logging

```sql
-- Log system events
SELECT log_event(
  'appointment_created',
  '{"appointment_id": "123"}'::jsonb,
  'info',
  'appointments_api'
);
```

### Dashboard Statistics

```sql
-- Get dashboard stats (admin only)
SELECT get_dashboard_stats();
```

## Performance Considerations

### Indexes

The schema includes optimized indexes for:
- Contact form rate limiting (IP hash + timestamp)
- Appointment availability queries (date + time)
- Message queue processing (status + send_after)
- Event log searching (type + severity + timestamp)
- User authentication (email, role, active status)

### Query Optimization

- Use partial indexes for conditional queries
- Composite indexes for multi-column WHERE clauses
- Proper constraints to enable query planner optimizations

## Security Features

### Data Protection
- IP addresses are hashed for privacy compliance
- PII is excluded from event logs
- Sensitive data is encrypted at rest (Supabase default)

### Access Control
- RLS policies prevent unauthorized data access
- Role-based permissions for admin functions
- Service role isolation for API operations

### Audit Trail
- All appointment changes are logged
- User registration and login events tracked
- System events with severity levels

## Monitoring and Maintenance

### Health Checks

```sql
-- Check system health
SELECT 
  'contact_messages' as table_name,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as recent_24h
FROM contact_messages
UNION ALL
SELECT 
  'appointments',
  COUNT(*),
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')
FROM appointments;
```

### Cleanup Tasks

```sql
-- Clean old event logs (keep last 30 days)
DELETE FROM event_log 
WHERE created_at < NOW() - INTERVAL '30 days' 
  AND severity = 'debug';

-- Clean processed outbox messages (keep last 7 days)
DELETE FROM message_outbox 
WHERE status = 'sent' 
  AND sent_at < NOW() - INTERVAL '7 days';
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Ensure user has correct role in profiles table
   - Check JWT token contains proper role claim

2. **Appointment Conflicts**
   - Verify business hours constraints (08:00-18:00, Mon-Fri)
   - Check for existing appointments at same time slot

3. **Message Delivery Failures**
   - Check message_outbox table for failed messages
   - Review error_message column for failure details

### Debug Queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- View failed messages
SELECT * FROM message_outbox WHERE status = 'failed';

-- Check recent errors
SELECT * FROM event_log 
WHERE severity IN ('error', 'critical') 
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## Backup and Recovery

### Automated Backups
Supabase provides automated daily backups. For additional protection:

1. Enable Point-in-Time Recovery (PITR) in Supabase Dashboard
2. Set up custom backup schedules if needed
3. Test restore procedures regularly

### Manual Backup

```bash
# Export schema and data
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# Restore from backup
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

## Support

For issues with this database setup:
1. Check Supabase logs in Dashboard → Logs
2. Review RLS policies and user roles
3. Verify environment variables are set correctly
4. Test with service role key for API operations