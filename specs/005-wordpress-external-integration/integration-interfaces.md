# Integration Interfaces with Existing Systems

## Overview

This document defines the integration interfaces for connecting the external WordPress integration with existing Saraiva Vision systems. The interfaces ensure seamless operation while maintaining security, performance, and compliance requirements.

## System Integration Architecture

### Integration Points
```
┌─────────────────────────────────────────────────────────────┐
│                    External WordPress Integration              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Database      │  │   API Service   │  │   Frontend      │ │
│  │   Integration   │  │   Integration   │  │   Integration   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │                      │                      │
           ▼                      ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Supabase    │  │   Existing      │  │   React App     │
│     Database    │  │   WordPress     │  │   Components    │
│                 │  │   Integration   │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
           │                      │                      │
           ▼                      ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Auth & Users  │  │   Content       │  │   UI & State    │
│   Integration   │  │   Aggregation   │  │   Management   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 1. Database Integration Interfaces

### 1.1 Supabase Integration

#### Extended Database Schema
```sql
-- Add to existing Supabase schema
ALTER TABLE profiles
ADD COLUMN external_content_preferences JSONB DEFAULT '{}',
ADD COLUMN compliance_level VARCHAR(20) DEFAULT 'standard'
CHECK (compliance_level IN ('basic', 'standard', 'strict'));

ALTER TABLE event_log
ADD COLUMN event_source VARCHAR(50) DEFAULT 'internal',
ADD COLUMN external_source_id INTEGER REFERENCES external_wordpress_sources(id);

-- Create views for unified content access
CREATE OR REPLACE VIEW unified_blog_content AS
SELECT
    'internal' as source_type,
    p.id,
    p.title,
    p.content,
    p.excerpt,
    p.status,
    p.published_at,
    p.created_at,
    p.updated_at,
    NULL as external_source_id,
    NULL as compliance_score,
    TRUE as is_internal
FROM wordpress_posts p
WHERE p.status = 'publish'

UNION ALL

SELECT
    'external' as source_type,
    c.id,
    c.title,
    c.content->>'title' as title,
    c.content->>'excerpt' as excerpt,
    c.status,
    c.published_at,
    c.cached_at as created_at,
    c.cached_at as updated_at,
    c.source_id as external_source_id,
    c.compliance_score,
    FALSE as is_internal
FROM external_wordpress_content c
WHERE c.content_type = 'post'
AND c.status = 'publish'
AND c.expires_at > CURRENT_TIMESTAMP;
```

#### Database Service Integration
```javascript
// api/src/services/integration/database-service.js
import { supabase } from '../../lib/supabase.js';

export class DatabaseIntegrationService {
  constructor() {
    this.supabase = supabase;
  }

  // Unified content retrieval combining internal and external
  async getUnifiedContent(options = {}) {
    const {
      limit = 10,
      offset = 0,
      sourceType = 'all',
      contentType = 'post',
      includeExternal = true
    } = options;

    let query = this.supabase
      .from('unified_blog_content')
      .select('*')
      .eq('content_type', contentType)
      .eq('status', 'publish')
      .order('published_at', { ascending: false });

    if (sourceType !== 'all') {
      query = query.eq('source_type', sourceType);
    }

    if (!includeExternal) {
      query = query.eq('is_internal', true);
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Sync external content metadata with user preferences
  async syncContentWithUserPreferences(userId, sourceId, preferences) {
    const { data, error } = await this.supabase
      .from('external_wordpress_user_preferences')
      .upsert({
        user_id: userId,
        source_id: sourceId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get user's preferred content sources
  async getUserContentSources(userId) {
    const { data, error } = await this.supabase
      .from('external_wordpress_user_preferences')
      .select(`
        *,
        external_wordpress_sources (*)
      `)
      .eq('user_id', userId)
      .eq('external_wordpress_sources.status', 'active');

    if (error) throw error;
    return data;
  }
}
```

### 1.2 Migration and Data Seeding

#### Migration Script
```javascript
// api/src/migrations/integration-migration.js
export async function runIntegrationMigration() {
  const migrations = [
    {
      name: 'add_external_integration_columns',
      sql: `
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS external_content_preferences JSONB DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS compliance_level VARCHAR(20) DEFAULT 'standard';
      `
    },
    {
      name: 'extend_event_log',
      sql: `
        ALTER TABLE event_log
        ADD COLUMN IF NOT EXISTS event_source VARCHAR(50) DEFAULT 'internal',
        ADD COLUMN IF NOT EXISTS external_source_id INTEGER;
      `
    },
    {
      name: 'create_unified_content_view',
      sql: `
        CREATE OR REPLACE VIEW unified_blog_content AS
        SELECT
          'internal' as source_type,
          p.id,
          p.title,
          p.content,
          p.excerpt,
          p.status,
          p.published_at,
          p.created_at,
          p.updated_at,
          NULL as external_source_id,
          NULL as compliance_score,
          TRUE as is_internal
        FROM wordpress_posts p
        WHERE p.status = 'publish'

        UNION ALL

        SELECT
          'external' as source_type,
          c.id,
          c.title,
          c.content->>'title' as title,
          c.content->>'excerpt' as excerpt,
          c.status,
          c.published_at,
          c.cached_at as created_at,
          c.cached_at as updated_at,
          c.source_id as external_source_id,
          c.compliance_score,
          FALSE as is_internal
        FROM external_wordpress_content c
        WHERE c.content_type = 'post'
        AND c.status = 'publish'
        AND c.expires_at > CURRENT_TIMESTAMP;
      `
    }
  ];

  for (const migration of migrations) {
    console.log(`Running migration: ${migration.name}`);
    const { error } = await supabase.rpc('exec_sql', { sql: migration.sql });
    if (error) throw error;
  }
}
```

## 2. API Service Integration Interfaces

### 2.1 Existing WordPress Integration Extension

#### Enhanced WordPress Service
```javascript
// Extend existing api/wordpress/services/wordpress-service.js
import { ExternalWordPressProxy } from '../external-wordpress/services/proxy-service.js';
import { DatabaseIntegrationService } from '../integration/database-service.js';

export class EnhancedWordPressService {
  constructor() {
    this.externalProxy = new ExternalWordPressProxy();
    this.dbIntegration = new DatabaseIntegrationService();
    this.internalService = existingWordPressService; // Use existing service
  }

  // Unified content retrieval
  async getContent(options = {}) {
    const {
      includeExternal = true,
      sources = [],
      limit = 10,
      offset = 0
    } = options;

    const internalContent = await this.internalService.getPosts({
      limit,
      offset
    });

    let externalContent = [];

    if (includeExternal && sources.length > 0) {
      externalContent = await this.dbIntegration.getUnifiedContent({
        sourceType: 'external',
        limit,
        offset
      });
    }

    return {
      internal: internalContent,
      external: externalContent,
      combined: [...internalContent, ...externalContent]
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .slice(0, limit)
    };
  }

  // Proxy external content through existing API structure
  async getExternalContent(sourceId, options = {}) {
    const source = await this.dbIntegration.getSourceById(sourceId);
    if (!source) {
      throw new Error('External source not found');
    }

    const content = await this.externalProxy.proxyRequest(
      source,
      'posts',
      options
    );

    // Transform to match existing WordPress post structure
    return this.transformToInternalFormat(content, source);
  }

  // Transform external content to internal format
  transformToInternalFormat(externalContent, source) {
    return {
      id: `external_${source.id}_${externalContent.id}`,
      title: externalContent.title.rendered,
      content: externalContent.content.rendered,
      excerpt: externalContent.excerpt.rendered,
      date: externalContent.date,
      modified: externalContent.modified,
      slug: externalContent.slug,
      status: externalContent.status,
      author: this.transformAuthor(externalContent.author),
      featured_media: externalContent.featured_media,
      categories: externalContent.categories,
      tags: externalContent.tags,
      _links: externalContent._links,
      meta: {
        source_id: source.id,
        source_name: source.name,
        external_id: externalContent.id,
        compliance_score: this.calculateComplianceScore(externalContent)
      }
    };
  }

  // Sync external content with internal systems
  async syncExternalContent(sourceId) {
    const source = await this.dbIntegration.getSourceById(sourceId);
    const syncLog = await this.createSyncLog(sourceId, 'sync');

    try {
      const posts = await this.externalProxy.proxyRequest(
        source,
        'posts',
        { per_page: source.max_posts_per_sync || 100 }
      );

      let processed = 0;
      let failed = 0;

      for (const post of posts) {
        try {
          const transformed = this.transformToInternalFormat(post, source);
          await this.dbIntegration.cacheContent(
            sourceId,
            'post',
            post.id,
            transformed
          );
          processed++;
        } catch (error) {
          console.error(`Failed to process post ${post.id}:`, error);
          failed++;
        }
      }

      await this.updateSyncLog(syncLog.id, {
        status: 'success',
        items_processed: processed,
        items_failed: failed,
        completed_at: new Date()
      });

      await this.dbIntegration.updateSourceLastSync(sourceId);

    } catch (error) {
      await this.updateSyncLog(syncLog.id, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date()
      });
      throw error;
    }
  }
}
```

### 2.2 Authentication Integration

#### Extended Auth Context
```javascript
// src/contexts/AuthContext.js (enhanced)
import { useExternalWordPressAuth } from '../hooks/useExternalWordPressAuth.js';

export const AuthProvider = ({ children }) => {
  // Existing auth state
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  // External WordPress integration
  const {
    externalSources,
    loading: sourcesLoading,
    refreshSources
  } = useExternalWordPressAuth(user);

  // Combined auth state
  const authState = {
    // Existing auth properties
    user,
    session,
    signIn,
    signOut,

    // External WordPress integration
    externalSources,
    sourcesLoading,
    refreshSources,

    // Unified methods
    hasExternalAccess: (sourceId) => {
      return externalSources?.some(source => source.id === sourceId && source.status === 'active');
    },

    getComplianceLevel: () => {
      return user?.user_metadata?.compliance_level || 'standard';
    }
  };

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### External WordPress Auth Hook
```javascript
// src/hooks/useExternalWordPressAuth.js
import { useSupabaseClient } from './useSupabaseClient.js';

export function useExternalWordPressAuth(user) {
  const supabase = useSupabaseClient();
  const [externalSources, setExternalSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadExternalSources();
    } else {
      setExternalSources([]);
      setLoading(false);
    }
  }, [user]);

  const loadExternalSources = async () => {
    try {
      const { data, error } = await supabase
        .from('external_wordpress_user_preferences')
        .select(`
          *,
          external_wordpress_sources (*)
        `)
        .eq('user_id', user.id)
        .eq('external_wordpress_sources.status', 'active');

      if (error) throw error;
      setExternalSources(data || []);
    } catch (error) {
      console.error('Failed to load external sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSources = async () => {
    await loadExternalSources();
  };

  return {
    externalSources,
    loading,
    refreshSources
  };
}
```

## 3. Frontend Integration Interfaces

### 3.1 Enhanced Blog Components

#### Unified Blog List Component
```javascript
// src/components/blog/UnifiedBlogList.jsx
import { useUnifiedBlogContent } from '../hooks/useUnifiedBlogContent.js';
import { BlogCard } from './BlogCard.jsx';
import { ExternalContentCard } from './ExternalContentCard.jsx';
import { ContentLoading } from '../ui/ContentLoading.jsx';
import { CFMCompliance } from '../compliance/CFMCompliance.jsx';

export function UnifiedBlogList({
  limit = 10,
  showExternal = true,
  className = ""
}) {
  const {
    content,
    loading,
    error,
    refresh
  } = useUnifiedBlogContent({ limit, showExternal });

  if (loading) return <ContentLoading />;
  if (error) return <BlogError error={error} onRetry={refresh} />;

  return (
    <div className={`unified-blog-list ${className}`}>
      {content?.map((item) => (
        item.is_internal ? (
          <BlogCard
            key={`internal_${item.id}`}
            post={item}
            className="blog-card"
          />
        ) : (
          <ExternalContentCard
            key={`external_${item.id}`}
            content={item}
            className="external-content-card"
          />
        )
      ))}

      {content?.length === 0 && (
        <div className="no-content">
          <p>No blog content available.</p>
        </div>
      )}
    </div>
  );
}
```

#### External Content Card Component
```javascript
// src/components/blog/ExternalContentCard.jsx
import { useState } from 'react';
import { ExternalContentBadge } from './ExternalContentBadge.jsx';
import { ComplianceIndicator } from '../compliance/ComplianceIndicator.jsx';
import { CFMCompliance } from '../compliance/CFMCompliance.jsx';

export function ExternalContentCard({ content, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  const complianceLevel = useAuthState((state) => state.getComplianceLevel());

  return (
    <article className={`external-content-card ${className}`}>
      <div className="content-header">
        <ExternalContentBadge source={content.source_name} />
        <ComplianceIndicator score={content.compliance_score} />
      </div>

      <h3 className="content-title">
        <a
          href={content.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content.title}
        </a>
      </h3>

      <div className="content-meta">
        <time dateTime={content.published_at}>
          {new Date(content.published_at).toLocaleDateString()}
        </time>
        {content.author && (
          <span className="author">by {content.author.name}</span>
        )}
      </div>

      <div
        className={`content-excerpt ${expanded ? 'expanded' : ''}`}
        dangerouslySetInnerHTML={{ __html: content.excerpt }}
      />

      {expanded && (
        <div className="content-body">
          <CFMCompliance
            content={content.content}
            level={complianceLevel}
            source="external"
          />
        </div>
      )}

      <div className="content-actions">
        <button
          onClick={() => setExpanded(!expanded)}
          className="read-more-btn"
        >
          {expanded ? 'Show Less' : 'Read More'}
        </button>
        <a
          href={content.link}
          target="_blank"
          rel="noopener noreferrer"
          className="view-original-btn"
        >
          View Original
        </a>
      </div>
    </article>
  );
}
```

### 3.2 Unified Content Hook

#### useUnifiedBlogContent Hook
```javascript
// src/hooks/useUnifiedBlogContent.js
import { useQuery } from '@tanstack/react-query';
import { useAuthState } from '../contexts/AuthContext.js';
import { supabase } from '../lib/supabase.js';

export function useUnifiedBlogContent(options = {}) {
  const { limit = 10, showExternal = true } = options;
  const auth = useAuthState();

  return useQuery({
    queryKey: ['unified-blog-content', { limit, showExternal }],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_unified_content', {
          p_limit: limit,
          p_show_external: showExternal,
          p_user_id: auth.user?.id
        });

      if (error) throw error;
      return data;
    },
    enabled: !!auth.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### 3.3 Enhanced Admin Interface

#### External Sources Management Component
```javascript
// src/components/admin/ExternalSourcesManager.jsx
import { useState } from 'react';
import { useExternalSources } from '../hooks/useExternalSources.js';
import { SourceForm } from './SourceForm.jsx';
import { SourceList } from './SourceList.jsx';
import { HealthStatus } from './HealthStatus.jsx';

export function ExternalSourcesManager() {
  const { sources, loading, error, refresh } = useExternalSources();
  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState(null);

  const handleSave = async (sourceData) => {
    try {
      if (editingSource) {
        await updateSource(editingSource.id, sourceData);
      } else {
        await createSource(sourceData);
      }
      setShowForm(false);
      setEditingSource(null);
      refresh();
    } catch (error) {
      console.error('Failed to save source:', error);
    }
  };

  const handleSync = async (sourceId) => {
    try {
      await syncSource(sourceId);
      refresh();
    } catch (error) {
      console.error('Failed to sync source:', error);
    }
  };

  if (loading) return <div>Loading sources...</div>;
  if (error) return <div>Error loading sources</div>;

  return (
    <div className="external-sources-manager">
      <div className="manager-header">
        <h2>External WordPress Sources</h2>
        <button
          onClick={() => setShowForm(true)}
          className="add-source-btn"
        >
          Add New Source
        </button>
      </div>

      {showForm && (
        <SourceForm
          source={editingSource}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingSource(null);
          }}
        />
      )}

      <HealthStatus sources={sources} />

      <SourceList
        sources={sources}
        onEdit={(source) => {
          setEditingSource(source);
          setShowForm(true);
        }}
        onDelete={handleDelete}
        onSync={handleSync}
      />
    </div>
  );
}
```

## 4. Event Integration and Logging

### 4.1 Enhanced Event Logging

#### Extended Event Logger
```javascript
// api/src/services/integration/event-logger.js
import { supabase } from '../../lib/supabase.js';

export class IntegrationEventLogger {
  constructor() {
    this.supabase = supabase;
  }

  async logExternalEvent(eventData) {
    const {
      sourceId,
      action,
      status,
      details,
      userId = null,
      requestInfo = {}
    } = eventData;

    const { error } = await this.supabase
      .from('event_log')
      .insert({
        event_type: 'external_wordpress',
        event_source: 'external',
        external_source_id: sourceId,
        action,
        status,
        details,
        user_id: userId,
        request_info: requestInfo,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log external event:', error);
    }
  }

  async logSyncActivity(sourceId, action, status, details = {}) {
    await this.logExternalEvent({
      sourceId,
      action: `sync_${action}`,
      status,
      details: {
        ...details,
        sync_type: 'automatic'
      }
    });
  }

  async logContentAccess(sourceId, contentId, userId, accessType = 'view') {
    await this.logExternalEvent({
      sourceId,
      action: 'content_access',
      status: 'success',
      details: {
        content_id: contentId,
        access_type: accessType
      },
      userId
    });
  }

  async logComplianceCheck(sourceId, contentId, complianceScore, issues = []) {
    await this.logExternalEvent({
      sourceId,
      action: 'compliance_check',
      status: complianceScore >= 80 ? 'success' : 'warning',
      details: {
        content_id: contentId,
        compliance_score,
        issues_count: issues.length,
        issues: issues.slice(0, 5) // Log first 5 issues
      }
    });
  }
}
```

### 4.2 Real-time Updates Integration

#### Subscription Manager
```javascript
// api/src/services/integration/subscription-manager.js
import { supabase } from '../../lib/supabase.js';

export class SubscriptionManager {
  constructor() {
    this.supabase = supabase;
    this.subscriptions = new Map();
  }

  // Subscribe to external content updates
  subscribeToExternalContent(callback) {
    const subscription = this.supabase
      .channel('external-content-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'external_wordpress_content'
        },
        (payload) => callback(payload)
      )
      .subscribe();

    this.subscriptions.set('external-content', subscription);
    return subscription;
  }

  // Subscribe to sync status updates
  subscribeToSyncStatus(callback) {
    const subscription = this.supabase
      .channel('sync-status-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'external_wordpress_sync_logs'
        },
        (payload) => callback(payload)
      )
      .subscribe();

    this.subscriptions.set('sync-status', subscription);
    return subscription;
  }

  // Subscribe to source health changes
  subscribeToSourceHealth(callback) {
    const subscription = this.supabase
      .channel('source-health-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'external_wordpress_sources'
        },
        (payload) => callback(payload)
      )
      .subscribe();

    this.subscriptions.set('source-health', subscription);
    return subscription;
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    for (const [name, subscription] of this.subscriptions) {
      this.supabase.removeChannel(subscription);
    }
    this.subscriptions.clear();
  }
}
```

## 5. Testing Integration Interfaces

### 5.1 Integration Test Suite

#### Integration Test Framework
```javascript
// tests/integration/external-wordpress-integration.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestServer } from '../utils/test-server.js';
import { TestDatabase } from '../utils/test-database.js';
import { ExternalWordPressClient } from '../../api/src/external-wordpress/client.js';

describe('External WordPress Integration', () => {
  let testServer;
  let testDb;
  let externalClient;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.setup();

    testServer = createTestServer({
      database: testDb,
      auth: testDb.getAuthClient()
    });

    await testServer.start();

    externalClient = new ExternalWordPressClient(testServer.getUrl());
  });

  afterEach(async () => {
    await testServer.stop();
    await testDb.cleanup();
  });

  describe('Database Integration', () => {
    it('should create external source', async () => {
      const sourceData = {
        name: 'Test Blog',
        base_url: 'https://test-blog.example.com',
        api_key: 'test-api-key'
      };

      const source = await externalClient.createSource(sourceData);

      expect(source.id).toBeDefined();
      expect(source.name).toBe(sourceData.name);
      expect(source.status).toBe('active');
    });

    it('should cache external content', async () => {
      const source = await testDb.createExternalSource();
      const content = {
        id: 123,
        title: 'Test Post',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt'
      };

      const cached = await externalClient.cacheContent(
        source.id,
        'post',
        content.id,
        content
      );

      expect(cached.id).toBeDefined();
      expect(cached.source_id).toBe(source.id);
      expect(cached.content).toEqual(content);
    });
  });

  describe('API Integration', () => {
    it('should proxy external requests', async () => {
      const source = await testDb.createExternalSource();
      const mockResponse = {
        id: 123,
        title: { rendered: 'Test Post' },
        content: { rendered: '<p>Test content</p>' }
      };

      testServer.mockExternalAPI(source, mockResponse);

      const response = await externalClient.getPosts(source.id);

      expect(response).toHaveLength(1);
      expect(response[0].title).toBe('Test Post');
    });

    it('should handle external service errors', async () => {
      const source = await testDb.createExternalSource();
      testServer.mockExternalAPIError(source, 500);

      await expect(externalClient.getPosts(source.id))
        .rejects.toThrow('External service unavailable');
    });
  });

  describe('Frontend Integration', () => {
    it('should display unified content', async () => {
      const user = await testDb.createUser();
      const internalPost = await testDb.createInternalPost();
      const externalSource = await testDb.createExternalSource();
      const externalContent = await testDb.createExternalContent(externalSource);

      const response = await testServer
        .withAuth(user)
        .get('/api/blog/unified');

      expect(response.status).toBe(200);
      const content = response.body;

      expect(content).toHaveLength(2);
      expect(content.some(c => c.is_internal)).toBe(true);
      expect(content.some(c => !c.is_internal)).toBe(true);
    });
  });

  describe('Event Integration', () => {
    it('should log external events', async () => {
      const source = await testDb.createExternalSource();

      await externalClient.logEvent({
        sourceId: source.id,
        action: 'content_access',
        status: 'success'
      });

      const events = await testDb.getEvents({
        sourceId: source.id,
        action: 'content_access'
      });

      expect(events).toHaveLength(1);
      expect(events[0].event_source).toBe('external');
    });
  });
});
```

## 6. Deployment Integration

### 6.1 Enhanced Deployment Scripts

#### Integration Deployment Script
```bash
#!/bin/bash
# scripts/deploy-external-integration.sh

set -e

echo "🚀 Deploying External WordPress Integration..."

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations
echo "🗄️ Running database migrations..."
npm run migrate:external-integration

# Build the application
echo "🔨 Building application..."
npm run build

# Copy files to server
echo "📤 Copying files to server..."
if [ "$1" = "production" ]; then
  SERVER_USER="deploy"
  SERVER_HOST="saraivavision.com.br"
  DEPLOY_PATH="/var/www/html"

  # Use rsync for efficient deployment
  rsync -avz --exclude 'node_modules' --exclude '.git' ./dist/ ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/

  # Restart services
  echo "🔄 Restarting services..."
  ssh ${SERVER_USER}@${SERVER_HOST} "sudo systemctl restart saraiva-api nginx"

  echo "✅ Deployment completed successfully!"
else
  echo "🧪 Development deployment completed!"
fi

# Run health checks
echo "🏥 Running health checks..."
npm run test:health

echo "🎉 External WordPress Integration deployment complete!"
```

## 7. Monitoring and Observability

### 7.1 Enhanced Monitoring Dashboard

#### Integration Metrics Component
```javascript
// src/components/admin/IntegrationMetrics.jsx
import { useIntegrationMetrics } from '../hooks/useIntegrationMetrics.js';
import { MetricCard } from './MetricCard.jsx';
import { HealthChart } from './HealthChart.jsx';

export function IntegrationMetrics() {
  const { metrics, loading, error } = useIntegrationMetrics();

  if (loading) return <div>Loading metrics...</div>;
  if (error) return <div>Error loading metrics</div>;

  return (
    <div className="integration-metrics">
      <h2>External Integration Metrics</h2>

      <div className="metrics-grid">
        <MetricCard
          title="Active Sources"
          value={metrics.activeSources}
          change={metrics.sourceChange}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${metrics.cacheHitRate}%`}
          change={metrics.cacheChange}
        />
        <MetricCard
          title="Sync Success Rate"
          value={`${metrics.syncSuccessRate}%`}
          change={metrics.syncChange}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${metrics.avgResponseTime}ms`}
          change={metrics.responseChange}
        />
      </div>

      <HealthChart data={metrics.healthData} />

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <ActivityList activities={metrics.recentActivity} />
      </div>
    </div>
  );
}
```

## Implementation Checklist

### Phase 1: Database Integration
- [ ] Extend Supabase schema with external content tables
- [ ] Create unified content views
- [ ] Implement database integration service
- [ ] Add migration scripts
- [ ] Create database integration tests

### Phase 2: API Integration
- [ ] Extend existing WordPress service
- [ ] Implement external proxy service
- [ ] Add authentication integration
- [ ] Create unified API endpoints
- [ ] Add API integration tests

### Phase 3: Frontend Integration
- [ ] Create unified blog components
- [ ] Implement external content hooks
- [ ] Add admin interface components
- [ ] Integrate with existing auth context
- [ ] Add frontend integration tests

### Phase 4: Event Integration
- [ ] Implement enhanced event logging
- [ ] Add real-time subscription management
- [ ] Create monitoring components
- [ ] Add observability features
- [ ] Create event integration tests

### Phase 5: Deployment Integration
- [ ] Update deployment scripts
- [ ] Add integration health checks
- [ ] Create monitoring dashboards
- [ ] Add deployment automation
- [ ] Create deployment tests

This integration interface specification provides a comprehensive blueprint for connecting the external WordPress integration with existing Saraiva Vision systems while maintaining security, performance, and compliance requirements.