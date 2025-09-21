# Data Model: Backend Integration Strategy

## Core Entities

### 1. Contact Submissions
**Purpose**: Store and manage contact form submissions from website visitors

```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status contact_status DEFAULT 'pending',
  priority contact_priority DEFAULT 'normal',
  source VARCHAR(50) DEFAULT 'website',
  metadata JSONB,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE contact_status AS ENUM ('pending', 'in_progress', 'resolved', 'archived');
CREATE TYPE contact_priority AS ENUM ('low', 'normal', 'high', 'urgent');
```

**Validation Rules**:
- Email must be valid format
- Phone optional but validated if provided
- Message required, minimum 10 characters
- Subject optional, maximum 255 characters

**Relationships**:
- `processed_by` → `auth.users` (staff member who handled the inquiry)

### 2. Podcast Episodes
**Purpose**: Store podcast episode data synchronized from Spotify

```sql
CREATE TABLE podcast_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id VARCHAR(255) UNIQUE NOT NULL,
  show_id UUID NOT NULL REFERENCES podcast_shows(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  html_description TEXT,
  duration_ms INTEGER NOT NULL,
  episode_number INTEGER,
  season_number INTEGER,
  release_date DATE NOT NULL,
  release_date_precision VARCHAR(10) DEFAULT 'day',
  explicit BOOLEAN DEFAULT false,
  languages TEXT[] DEFAULT ARRAY['pt-BR'],
  image_url TEXT,
  spotify_url TEXT NOT NULL,
  audio_preview_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  status episode_status DEFAULT 'published',
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE episode_status AS ENUM ('draft', 'published', 'archived', 'hidden');
```

**Validation Rules**:
- Spotify ID must be unique
- Duration must be positive
- Release date cannot be in future beyond 1 year
- Episode and season numbers must be positive if provided

### 3. Podcast Shows
**Purpose**: Store podcast show metadata

```sql
CREATE TABLE podcast_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  publisher VARCHAR(255),
  language VARCHAR(10) DEFAULT 'pt-BR',
  explicit BOOLEAN DEFAULT false,
  total_episodes INTEGER DEFAULT 0,
  image_url TEXT,
  spotify_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. WhatsApp Conversations
**Purpose**: Track WhatsApp conversations (non-PHI only)

```sql
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  contact_name VARCHAR(255),
  conversation_type conversation_type DEFAULT 'inquiry',
  status conversation_status DEFAULT 'active',
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_automated BOOLEAN DEFAULT true,
  assigned_to UUID REFERENCES auth.users(id),
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE conversation_type AS ENUM ('inquiry', 'appointment', 'support', 'marketing', 'emergency');
CREATE TYPE conversation_status AS ENUM ('active', 'resolved', 'archived', 'blocked');
```

**Privacy Note**: This table stores NO PHI (Protected Health Information). Medical details must never be stored here.

### 5. WhatsApp Messages
**Purpose**: Store individual WhatsApp messages for conversation history

```sql
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  message_id VARCHAR(255) UNIQUE, -- WhatsApp message ID
  direction message_direction NOT NULL,
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  status message_status DEFAULT 'sent',
  is_automated BOOLEAN DEFAULT false,
  template_name VARCHAR(100),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_type AS ENUM ('text', 'image', 'document', 'audio', 'video', 'template');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'failed');
```

### 6. System Metrics
**Purpose**: Store system performance and usage metrics

```sql
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  unit VARCHAR(20),
  source VARCHAR(100) NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for time-series queries
CREATE INDEX idx_system_metrics_timestamp ON system_metrics (timestamp DESC);
CREATE INDEX idx_system_metrics_type_name ON system_metrics (metric_type, metric_name);
```

**Metric Types**:
- `api_performance`: Response times, error rates
- `user_engagement`: Page views, contact form submissions
- `system_health`: Uptime, resource usage
- `external_apis`: Spotify, WhatsApp, Resend API metrics

### 7. Email Templates
**Purpose**: Manage email templates for automated responses

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type template_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  variables JSONB, -- Available template variables
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE template_type AS ENUM ('contact_confirmation', 'appointment_reminder', 'newsletter', 'notification');
```

### 8. Dashboard Configuration
**Purpose**: Store dashboard settings and user preferences

```sql
CREATE TABLE dashboard_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  config_type VARCHAR(50) NOT NULL,
  settings JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, config_type)
);
```

## Relationships & Constraints

### Primary Relationships
```sql
-- Podcast hierarchy
podcast_shows ←1:M→ podcast_episodes

-- WhatsApp conversation flow
whatsapp_conversations ←1:M→ whatsapp_messages

-- User management
auth.users ←1:M→ contact_submissions (processed_by)
auth.users ←1:M→ whatsapp_conversations (assigned_to)
auth.users ←1:M→ email_templates (created_by)
auth.users ←1:M→ dashboard_config (user_id)
```

### Database Constraints
```sql
-- Ensure phone numbers are properly formatted
ALTER TABLE contact_submissions
ADD CONSTRAINT valid_phone CHECK (phone ~ '^\+?[1-9]\d{1,14}$' OR phone IS NULL);

ALTER TABLE whatsapp_conversations
ADD CONSTRAINT valid_phone CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$');

-- Ensure positive durations
ALTER TABLE podcast_episodes
ADD CONSTRAINT positive_duration CHECK (duration_ms > 0);

-- Ensure valid episode numbers
ALTER TABLE podcast_episodes
ADD CONSTRAINT valid_episode_number CHECK (episode_number > 0 OR episode_number IS NULL);

-- Ensure future release dates are reasonable
ALTER TABLE podcast_episodes
ADD CONSTRAINT reasonable_release_date CHECK (release_date <= CURRENT_DATE + INTERVAL '1 year');
```

## Security & Row Level Security (RLS)

### Authentication Schema
Using Supabase Auth with custom profiles:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'staff',
  full_name VARCHAR(255),
  department VARCHAR(100),
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff', 'readonly');
```

### Row Level Security Policies
```sql
-- Contact submissions: Staff can view all, readonly users can view non-sensitive
CREATE POLICY "Staff can view all contact submissions" ON contact_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'staff')
      AND is_active = true
    )
  );

-- WhatsApp conversations: Only assigned users or admins
CREATE POLICY "Users can view assigned conversations" ON whatsapp_conversations
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      AND is_active = true
    )
  );

-- System metrics: Read-only for all authenticated users
CREATE POLICY "Authenticated users can view metrics" ON system_metrics
  FOR SELECT TO authenticated
  USING (true);
```

## Data Migration Strategy

### Phase 1: Core Tables
1. Set up authentication and user profiles
2. Create contact submissions table
3. Migrate existing contact data (if any)

### Phase 2: Content Management
1. Create podcast shows and episodes tables
2. Initial Spotify data sync
3. Set up email templates

### Phase 3: Communication
1. Create WhatsApp conversation tables
2. Set up message templates
3. Configure automation rules

### Phase 4: Analytics
1. Create system metrics table
2. Set up dashboard configuration
3. Initialize default dashboards

## Performance Optimization

### Indexing Strategy
```sql
-- Contact submissions
CREATE INDEX idx_contact_status ON contact_submissions (status, created_at);
CREATE INDEX idx_contact_priority ON contact_submissions (priority, status);

-- Podcast episodes
CREATE INDEX idx_episodes_show_release ON podcast_episodes (show_id, release_date DESC);
CREATE INDEX idx_episodes_featured ON podcast_episodes (is_featured, release_date DESC) WHERE is_featured = true;

-- WhatsApp conversations
CREATE INDEX idx_conversations_phone ON whatsapp_conversations (phone_number);
CREATE INDEX idx_conversations_status ON whatsapp_conversations (status, last_message_at DESC);

-- WhatsApp messages
CREATE INDEX idx_messages_conversation ON whatsapp_messages (conversation_id, sent_at DESC);
```

### Partitioning Strategy
For high-volume tables, consider monthly partitioning:

```sql
-- Partition system_metrics by month
CREATE TABLE system_metrics_y2025m01 PARTITION OF system_metrics
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

## Backup & Recovery

### Backup Strategy
- Daily automated backups via Supabase
- Point-in-time recovery capability
- Monthly exports for compliance

### Data Retention Policies
- Contact submissions: 7 years (medical record requirement)
- WhatsApp messages: 2 years (communication history)
- System metrics: 1 year (performance analysis)
- Email logs: 6 months (deliverability tracking)