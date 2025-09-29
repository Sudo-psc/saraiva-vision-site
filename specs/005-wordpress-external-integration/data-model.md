# Data Model Specification for External WordPress Integration

## Overview

This document defines the data models required for implementing external WordPress integration in the Saraiva Vision platform. The models support a proxy-based architecture that enables seamless integration with multiple external WordPress installations while maintaining performance, security, and compliance requirements.

## Core Data Models

### 1. External WordPress Source Configuration

#### `external_wordpress_sources`
Represents external WordPress installations that serve as content sources.

**Schema Definition:**
```sql
CREATE TABLE external_wordpress_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    api_key VARCHAR(255),
    status ENUM('active', 'inactive', 'error') DEFAULT 'active',
    last_sync TIMESTAMP,
    sync_frequency INTERVAL DEFAULT '5 minutes',
    max_posts_per_sync INTEGER DEFAULT 100,
    cache_ttl INTEGER DEFAULT 300, -- 5 minutes in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Configuration flags
    enable_webhooks BOOLEAN DEFAULT false,
    webhook_secret VARCHAR(255),
    enable_ssl_verification BOOLEAN DEFAULT true,
    enable_compliance_filter BOOLEAN DEFAULT true,

    -- Rate limiting
    rate_limit_requests INTEGER DEFAULT 1000,
    rate_limit_window INTEGER DEFAULT 3600, -- 1 hour

    -- WordPress-specific configuration
    wordpress_version VARCHAR(20),
    rest_api_version VARCHAR(10) DEFAULT 'v2',
    supported_post_types TEXT[], -- Default: ['post', 'page']
    supported_taxonomies TEXT[], -- Default: ['category', 'tag']

    -- Health monitoring
    health_check_url TEXT,
    health_check_interval INTEGER DEFAULT 300, -- 5 minutes
    last_health_check TIMESTAMP,
    health_status VARCHAR(20),

    -- Indexes for performance
    CONSTRAINT external_wordpress_sources_url_check
        CHECK (base_url ~* '^https?://'),
    CONSTRAINT external_wordpress_sources_name_check
        CHECK (name <> '')
);
```

**Key Fields:**
- `base_url`: Base URL of the external WordPress site (e.g., `https://external-blog.example.com`)
- `api_key`: Application password or API key for authentication
- `status`: Current operational status of the source
- `sync_frequency`: How often to sync content from this source
- `cache_ttl`: Time-to-live for cached content
- `enable_compliance_filter`: Whether to apply CFM compliance filtering

**Indexes:**
```sql
CREATE INDEX idx_external_sources_status ON external_wordpress_sources(status);
CREATE INDEX idx_external_sources_last_sync ON external_wordpress_sources(last_sync);
CREATE INDEX idx_external_sources_name ON external_wordpress_sources(name);
CREATE UNIQUE INDEX idx_external_sources_base_url ON external_wordpress_sources(base_url);
```

### 2. Cached External Content

#### `external_wordpress_content`
Stores cached content from external WordPress sources to ensure performance and availability.

**Schema Definition:**
```sql
CREATE TABLE external_wordpress_content (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'post', 'page', 'media', 'category', 'tag'
    external_id INTEGER NOT NULL,
    content JSONB NOT NULL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_modified TIMESTAMP,
    etag VARCHAR(255),

    -- Content metadata
    title TEXT,
    slug VARCHAR(255),
    author_id INTEGER,
    published_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'publish',

    -- Compliance and filtering
    compliance_score INTEGER DEFAULT 0, -- 0-100
    compliance_filtered BOOLEAN DEFAULT false,
    compliance_issues JSONB[],

    -- Performance metrics
    cache_hits INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    response_time INTEGER, -- milliseconds

    -- Search optimization
    search_vector tsvector,

    -- Constraints
    CONSTRAINT external_content_valid_type
        CHECK (content_type IN ('post', 'page', 'media', 'category', 'tag')),
    CONSTRAINT external_content_positive_id
        CHECK (external_id > 0),
    CONSTRAINT external_content_future_expires
        CHECK (expires_at > CURRENT_TIMESTAMP),

    UNIQUE(source_id, content_type, external_id)
);
```

**Content Structure (JSONB):**
```json
{
  "title": "Post Title",
  "content": "Post content with HTML",
  "excerpt": "Post excerpt",
  "author": {
    "id": 1,
    "name": "Author Name",
    "avatar": "avatar_url"
  },
  "featured_media": {
    "id": 123,
    "url": "image_url",
    "alt_text": "Image description",
    "sizes": {
      "thumbnail": "thumbnail_url",
      "medium": "medium_url",
      "large": "large_url"
    }
  },
  "categories": [
    {"id": 1, "name": "Category 1", "slug": "category-1"}
  ],
  "tags": [
    {"id": 1, "name": "Tag 1", "slug": "tag-1"}
  ],
  "custom_fields": {},
  "wordpress_meta": {
    "comment_status": "open",
    "ping_status": "closed",
    "template": "",
    "format": "standard"
  }
}
```

**Indexes:**
```sql
CREATE INDEX idx_external_content_source_type ON external_wordpress_content(source_id, content_type);
CREATE INDEX idx_external_content_external_id ON external_wordpress_content(external_id);
CREATE INDEX idx_external_content_expires_at ON external_wordpress_content(expires_at);
CREATE INDEX idx_external_content_status ON external_wordpress_content(status);
CREATE INDEX idx_external_content_published_at ON external_wordpress_content(published_at);
CREATE INDEX idx_external_content_compliance ON external_wordpress_content(compliance_score);
CREATE INDEX idx_external_content_search ON external_wordpress_content USING GIN(search_vector);
```

### 3. Synchronization Logs

#### `external_wordpress_sync_logs`
Tracks all synchronization activities for monitoring and debugging.

**Schema Definition:**
```sql
CREATE TABLE external_wordpress_sync_logs (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'sync', 'cache_invalidate', 'error', 'health_check'
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'partial'
    details JSONB,

    -- Performance metrics
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER, -- milliseconds
    items_processed INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,

    -- Error tracking
    error_code VARCHAR(50),
    error_message TEXT,
    stack_trace TEXT,

    -- Request information
    request_url TEXT,
    request_method VARCHAR(10),
    response_status INTEGER,
    response_size INTEGER,

    -- System context
    server_info JSONB,
    client_info JSONB
);
```

**Indexing:**
```sql
CREATE INDEX idx_sync_logs_source ON external_wordpress_sync_logs(source_id);
CREATE INDEX idx_sync_logs_action ON external_wordpress_sync_logs(action);
CREATE INDEX idx_sync_logs_status ON external_wordpress_sync_logs(status);
CREATE INDEX idx_sync_logs_started_at ON external_wordpress_sync_logs(started_at);
```

### 4. Media Content Cache

#### `external_wordpress_media`
Dedicated table for managing media files with additional metadata.

**Schema Definition:**
```sql
CREATE TABLE external_wordpress_media (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE CASCADE,
    external_id INTEGER NOT NULL,

    -- File information
    file_url TEXT NOT NULL,
    file_type VARCHAR(50), -- 'image', 'video', 'audio', 'document'
    file_size BIGINT,
    mime_type VARCHAR(100),

    -- Image-specific metadata
    width INTEGER,
    height INTEGER,
    alt_text TEXT,

    -- Local cache information
    local_path TEXT,
    local_exists BOOLEAN DEFAULT false,
    local_last_modified TIMESTAMP,

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,

    -- Timestamps
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,

    CONSTRAINT external_media_positive_id CHECK (external_id > 0),
    CONSTRAINT external_media_valid_url CHECK (file_url ~* '^https?://'),
    UNIQUE(source_id, external_id)
);
```

### 5. User Preferences

#### `external_wordpress_user_preferences`
Stores user preferences for external content display and filtering.

**Schema Definition:**
```sql
CREATE TABLE external_wordpress_user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE CASCADE,

    -- Display preferences
    preferred_language VARCHAR(10) DEFAULT 'pt-BR',
    items_per_page INTEGER DEFAULT 10,
    content_filter VARCHAR(20) DEFAULT 'all', -- 'all', 'safe', 'medical'

    -- Notification preferences
    enable_notifications BOOLEAN DEFAULT true,
    notification_frequency VARCHAR(20) DEFAULT 'immediate',

    -- Privacy preferences
    allow_analytics BOOLEAN DEFAULT true,
    allow_personalization BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, source_id)
);
```

## Integration with Existing Supabase Schema

### Extensions to Existing Tables

#### `profiles` Table Extensions
```sql
ALTER TABLE profiles
ADD COLUMN external_content_preferences JSONB DEFAULT '{}',
ADD COLUMN compliance_level VARCHAR(20) DEFAULT 'standard' CHECK (compliance_level IN ('basic', 'standard', 'strict'));
```

#### `event_log` Table Extensions
```sql
ALTER TABLE event_log
ADD COLUMN event_source VARCHAR(50) DEFAULT 'internal',
ADD COLUMN external_source_id INTEGER REFERENCES external_wordpress_sources(id);
```

### Views for Common Queries

#### `active_external_sources` View
```sql
CREATE VIEW active_external_sources AS
SELECT
    s.id,
    s.name,
    s.base_url,
    s.status,
    s.last_sync,
    s.health_status,
    COUNT(c.id) as cached_items_count,
    MAX(c.expires_at) as next_expiration
FROM external_wordpress_sources s
LEFT JOIN external_wordpress_content c ON s.id = c.source_id
WHERE s.status = 'active'
GROUP BY s.id, s.name, s.base_url, s.status, s.last_sync, s.health_status;
```

#### `external_content_summary` View
```sql
CREATE VIEW external_content_summary AS
SELECT
    s.id as source_id,
    s.name as source_name,
    c.content_type,
    COUNT(c.id) as total_items,
    COUNT(CASE WHEN c.expires_at > CURRENT_TIMESTAMP THEN 1 END) as active_items,
    COUNT(CASE WHEN c.compliance_score >= 80 THEN 1 END) as compliant_items,
    AVG(c.response_time) as avg_response_time
FROM external_wordpress_sources s
JOIN external_wordpress_content c ON s.id = c.source_id
WHERE s.status = 'active'
GROUP BY s.id, s.name, c.content_type;
```

## Data Integrity and Validation

### Constraints and Triggers

#### Sync Frequency Validation
```sql
CREATE OR REPLACE FUNCTION validate_sync_frequency()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sync_frequency < INTERVAL '1 minute' THEN
        RAISE EXCEPTION 'Sync frequency cannot be less than 1 minute';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_sync_frequency
    BEFORE INSERT OR UPDATE ON external_wordpress_sources
    FOR EACH ROW EXECUTE FUNCTION validate_sync_frequency();
```

#### Content Expiration Management
```sql
CREATE OR REPLACE FUNCTION update_content_access()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed = CURRENT_TIMESTAMP;
    NEW.cache_hits = COALESCE(OLD.cache_hits, 0) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_content_access
    AFTER UPDATE ON external_wordpress_content
    FOR EACH ROW EXECUTE FUNCTION update_content_access();
```

### Stored Procedures for Common Operations

#### Cache Invalidation
```sql
CREATE OR REPLACE PROCEDURE invalidate_source_cache(
    p_source_id INTEGER,
    p_invalidate_all BOOLEAN DEFAULT false
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_invalidate_all THEN
        UPDATE external_wordpress_content
        SET expires_at = CURRENT_TIMESTAMP
        WHERE source_id = p_source_id;
    ELSE
        UPDATE external_wordpress_content
        SET expires_at = CURRENT_TIMESTAMP
        WHERE source_id = p_source_id
        AND expires_at > CURRENT_TIMESTAMP;
    END IF;

    INSERT INTO external_wordpress_sync_logs (
        source_id, action, status, details
    ) VALUES (
        p_source_id, 'cache_invalidate', 'success',
        jsonb_build_object('invalidate_all', p_invalidate_all)
    );
END;
$$;
```

#### Health Check Update
```sql
CREATE OR REPLACE PROCEDURE update_source_health(
    p_source_id INTEGER,
    p_status VARCHAR(20),
    p_response_time INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE external_wordpress_sources
    SET
        last_health_check = CURRENT_TIMESTAMP,
        health_status = p_status
    WHERE id = p_source_id;

    INSERT INTO external_wordpress_sync_logs (
        source_id, action, status, details, response_time
    ) VALUES (
        p_source_id, 'health_check',
        CASE WHEN p_status = 'healthy' THEN 'success' ELSE 'failed' END,
        jsonb_build_object(
            'health_status', p_status,
            'error_message', p_error_message
        ),
        p_response_time
    );
END;
$$;
```

## Security and Compliance Considerations

### Data Encryption
- Sensitive fields (API keys, webhook secrets) should be encrypted using Supabase's pgcrypto extension
- Consider implementing row-level security (RLS) policies for user-specific data

### Audit Trail
- All modifications to source configurations should be logged
- Sync operations should include full request/response logging for compliance

### Performance Optimization
- Implement appropriate partitioning for large content tables
- Use materialized views for reporting and analytics
- Consider connection pooling for high-volume operations

## Migration Strategy

### Initial Migration
```sql
-- Create tables in order of dependencies
CREATE TABLE external_wordpress_sources (...);
CREATE TABLE external_wordpress_content (...);
CREATE TABLE external_wordpress_sync_logs (...);
CREATE TABLE external_wordpress_media (...);
CREATE TABLE external_wordpress_user_preferences (...);

-- Create indexes
CREATE INDEX idx_external_sources_status ON external_wordpress_sources(status);
-- ... (other indexes)

-- Create views
CREATE VIEW active_external_sources AS ...;
CREATE VIEW external_content_summary AS ...;

-- Create functions and triggers
CREATE OR REPLACE FUNCTION validate_sync_frequency() ...;
-- ... (other functions and triggers)
```

### Data Migration from Existing WordPress Integration
- Migrate existing WordPress configuration to new `external_wordpress_sources` table
- Implement backfill process for existing cached content
- Preserve existing user preferences and settings

This data model specification provides a robust foundation for implementing external WordPress integration while maintaining the performance, security, and compliance requirements of the Saraiva Vision platform.