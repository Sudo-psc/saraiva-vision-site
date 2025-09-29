# Quick Start Guide: External WordPress Integration

This guide provides step-by-step instructions for integrating external WordPress installations with the Saraiva Vision platform using the proxy-based architecture.

## Prerequisites

### System Requirements
- **Node.js**: 22+ (as specified in package.json engines)
- **Supabase**: PostgreSQL database with active project
- **Redis**: Cache server (recommended for production)
- **External WordPress**: Installation with REST API access

### Required Access
- Saraiva Vision project repository access
- Supabase project admin credentials
- External WordPress admin access
- Server/VPS access for deployment (if self-hosting)

## Setup Process

### Step 1: Database Schema Setup

```sql
-- Create external WordPress integration tables
CREATE TABLE external_wordpress_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    api_key VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    last_sync TIMESTAMP,
    sync_frequency INTERVAL DEFAULT '5 minutes',
    max_posts_per_sync INTEGER DEFAULT 100,
    cache_ttl INTEGER DEFAULT 300,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enable_webhooks BOOLEAN DEFAULT false,
    webhook_secret VARCHAR(255),
    enable_ssl_verification BOOLEAN DEFAULT true,
    enable_compliance_filter BOOLEAN DEFAULT true,
    rate_limit_requests INTEGER DEFAULT 1000,
    rate_limit_window INTEGER DEFAULT 3600,
    wordpress_version VARCHAR(20),
    rest_api_version VARCHAR(10) DEFAULT 'v2',
    supported_post_types TEXT[] DEFAULT ARRAY['post', 'page'],
    supported_taxonomies TEXT[] DEFAULT ARRAY['category', 'tag'],
    health_check_url TEXT,
    health_check_interval INTEGER DEFAULT 300,
    last_health_check TIMESTAMP,
    health_status VARCHAR(20),
    CONSTRAINT external_wordpress_sources_url_check CHECK (base_url ~* '^https?://'),
    CONSTRAINT external_wordpress_sources_name_check CHECK (name <> '')
);

-- Create cached content table
CREATE TABLE external_wordpress_content (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    external_id INTEGER NOT NULL,
    content JSONB NOT NULL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_modified TIMESTAMP,
    etag VARCHAR(255),
    title TEXT,
    slug VARCHAR(255),
    author_id INTEGER,
    published_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'publish',
    compliance_score INTEGER DEFAULT 0,
    compliance_filtered BOOLEAN DEFAULT false,
    compliance_issues JSONB[],
    cache_hits INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    response_time INTEGER,
    search_vector tsvector,
    CONSTRAINT external_content_valid_type CHECK (content_type IN ('post', 'page', 'media', 'category', 'tag')),
    CONSTRAINT external_content_positive_id CHECK (external_id > 0),
    CONSTRAINT external_content_future_expires CHECK (expires_at > CURRENT_TIMESTAMP),
    UNIQUE(source_id, content_type, external_id)
);

-- Create sync logs table
CREATE TABLE external_wordpress_sync_logs (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES external_wordpress_sources(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER,
    items_processed INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    error_code VARCHAR(50),
    error_message TEXT,
    stack_trace TEXT,
    request_url TEXT,
    request_method VARCHAR(10),
    response_status INTEGER,
    response_size INTEGER,
    server_info JSONB,
    client_info JSONB
);

-- Create indexes for performance
CREATE INDEX idx_external_sources_status ON external_wordpress_sources(status);
CREATE INDEX idx_external_sources_last_sync ON external_wordpress_sources(last_sync);
CREATE INDEX idx_external_sources_name ON external_wordpress_sources(name);
CREATE UNIQUE INDEX idx_external_sources_base_url ON external_wordpress_sources(base_url);
CREATE INDEX idx_external_content_source_type ON external_wordpress_content(source_id, content_type);
CREATE INDEX idx_external_content_external_id ON external_wordpress_content(external_id);
CREATE INDEX idx_external_content_expires_at ON external_wordpress_content(expires_at);
CREATE INDEX idx_external_content_status ON external_wordpress_content(status);
CREATE INDEX idx_external_content_published_at ON external_wordpress_content(published_at);
CREATE INDEX idx_external_content_compliance ON external_wordpress_content(compliance_score);
CREATE INDEX idx_external_content_search ON external_wordpress_content USING GIN(search_vector);
CREATE INDEX idx_sync_logs_source ON external_wordpress_sync_logs(source_id);
CREATE INDEX idx_sync_logs_action ON external_wordpress_sync_logs(action);
CREATE INDEX idx_sync_logs_status ON external_wordpress_sync_logs(status);
CREATE INDEX idx_sync_logs_started_at ON external_wordpress_sync_logs(started_at);

-- Create views for common queries
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

### Step 2: API Service Setup

#### 2.1 Install Required Dependencies
```bash
# Core dependencies for the proxy service
npm install axios redis bull express-rate-limit helmet cors compression

# Supabase client
npm install @supabase/supabase-js

# Validation and schema handling
npm install zod ajv json-schema

# Performance monitoring
npm install @sentry/node prom-client

# Development dependencies
npm install -D @types/node @types/express @types/redis @types/compression
```

#### 2.2 Configure Environment Variables
Add to your `.env` file:

```env
# External WordPress Integration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate limiting configuration
EXTERNAL_WP_RATE_LIMIT_REQUESTS=1000
EXTERNAL_WP_RATE_LIMIT_WINDOW=3600

# Cache configuration
EXTERNAL_WP_CACHE_TTL=300
EXTERNAL_WP_MAX_POSTS_PER_SYNC=100

# Health check configuration
EXTERNAL_WP_HEALTH_CHECK_INTERVAL=300
EXTERNAL_WP_REQUEST_TIMEOUT=30000
```

#### 2.3 Create the Proxy Service Structure
```bash
# Create the service directory structure
mkdir -p api/src/routes/external-wordpress/{middleware,services,controllers,utils}
mkdir -p api/src/routes/external-wordpress/tests
```

#### 2.4 Implement Core Services

**Cache Service** (`api/src/routes/external-wordpress/services/cache-service.js`):
```javascript
import { createClient } from 'redis';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export class CacheService {
  constructor() {
    this.redis = null;
    this.supabase = createSupabaseClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );
    this.connectRedis();
  }

  async connectRedis() {
    try {
      this.redis = createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined
      });
      await this.redis.connect();
      console.log('✅ Redis connected for external WordPress cache');
    } catch (error) {
      console.warn('⚠️ Redis connection failed, using database-only caching:', error.message);
      this.redis = null;
    }
  }

  async get(cacheKey) {
    // Try Redis first (fastest)
    if (this.redis) {
      try {
        const redisResult = await this.redis.get(cacheKey);
        if (redisResult) {
          return JSON.parse(redisResult);
        }
      } catch (error) {
        console.warn('Redis GET failed:', error.message);
      }
    }

    // Fallback to database cache
    const { data, error } = await this.supabase
      .from('external_wordpress_content')
      .select('content')
      .eq('cache_key', cacheKey)
      .single();

    if (error || !data) {
      return null;
    }

    return data.content;
  }

  async set(cacheKey, content, ttl) {
    const contentStr = JSON.stringify(content);

    // Set in Redis with TTL
    if (this.redis) {
      try {
        await this.redis.setex(cacheKey, ttl, contentStr);
      } catch (error) {
        console.warn('Redis SET failed:', error.message);
      }
    }

    // Store in database as backup
    try {
      await this.supabase
        .from('external_wordpress_content')
        .upsert({
          cache_key,
          content,
          expires_at: new Date(Date.now() + ttl * 1000),
          cached_at: new Date()
        });
    } catch (error) {
      console.warn('Database cache SET failed:', error.message);
    }
  }

  generateCacheKey(sourceConfig, endpoint, options) {
    return `external_wp:${sourceConfig.id}:${endpoint}:${JSON.stringify(options)}`;
  }
}
```

**Proxy Service** (`api/src/routes/external-wordpress/services/proxy-service.js`):
```javascript
import axios from 'axios';
import { CacheService } from './cache-service.js';
import { TransformService } from './transform-service.js';
import { HealthService } from './health-service.js';
import { RateLimiter } from '../middleware/rate-limiter.js';

export class ExternalWordPressProxy {
  constructor() {
    this.cacheService = new CacheService();
    this.transformService = new TransformService();
    this.healthService = new HealthService();
    this.rateLimiter = new RateLimiter();
  }

  async proxyRequest(sourceConfig, endpoint, options = {}) {
    const cacheKey = this.generateCacheKey(sourceConfig, endpoint, options);

    // Check cache first
    const cachedResponse = await this.cacheService.get(cacheKey);
    if (cachedResponse && !this.isCacheExpired(cachedResponse)) {
      return this.transformService.transformResponse(cachedResponse);
    }

    // Rate limiting check
    await this.rateLimiter.checkLimit(sourceConfig.id);

    // Health check
    const isHealthy = await this.healthService.checkHealth(sourceConfig);
    if (!isHealthy) {
      throw new Error('External source not available');
    }

    // Build and execute request
    const request = this.buildWordPressRequest(sourceConfig, endpoint, options);
    const response = await this.executeRequest(request);

    // Process and cache response
    const processedResponse = await this.processResponse(response, sourceConfig);
    await this.cacheService.set(cacheKey, processedResponse, sourceConfig.cache_ttl);

    return processedResponse;
  }

  buildWordPressRequest(sourceConfig, endpoint, options) {
    const baseUrl = sourceConfig.base_url.replace(/\/$/, '');
    const url = `${baseUrl}/wp-json/wp/v2/${endpoint}`;

    return {
      url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sourceConfig.api_key}`,
        'User-Agent': 'SaraivaVision-ExternalProxy/1.0',
        ...options.headers
      },
      params: options.params,
      timeout: sourceConfig.request_timeout || 30000
    };
  }

  async executeRequest(request) {
    try {
      const response = await axios(request);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        responseTime: Date.now() - request.startTime
      };
    } catch (error) {
      if (error.response) {
        return {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
          error: error.message,
          responseTime: Date.now() - request.startTime
        };
      }
      throw error;
    }
  }

  async processResponse(response, sourceConfig) {
    return {
      data: response.data,
      status: response.status,
      sourceId: sourceConfig.id,
      processedAt: new Date().toISOString(),
      responseTime: response.responseTime,
      transformed: await this.transformService.transformWordPressResponse(response.data, sourceConfig)
    };
  }

  generateCacheKey(sourceConfig, endpoint, options) {
    return this.cacheService.generateCacheKey(sourceConfig, endpoint, options);
  }

  isCacheExpired(cachedResponse) {
    if (!cachedResponse.expiresAt) return true;
    return new Date(cachedResponse.expiresAt) < new Date();
  }
}
```

### Step 3: Configure External WordPress Source

#### 3.1 Enable WordPress REST API
Ensure the external WordPress site has:
- REST API enabled (default in WordPress 4.7+)
- Pretty permalinks configured
- CORS headers set for your domain

#### 3.2 Create Application Password
In the WordPress admin:
1. Go to Users → Profile → Application Passwords
2. Create a new application password
3. Copy the generated password

#### 3.3 Add Source via API
```bash
curl -X POST http://localhost:3002/api/external-wordpress/sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "External Medical Blog",
    "base_url": "https://external-blog.example.com",
    "api_key": "your_application_password",
    "sync_frequency": "5 minutes",
    "cache_ttl": 300,
    "enable_compliance_filter": true,
    "rate_limit_requests": 1000
  }'
```

### Step 4: Frontend Integration

#### 4.1 Install Frontend Dependencies
```bash
npm install @tanstack/react-query axios
```

#### 4.2 Create React Hook
```javascript
// src/hooks/useExternalWordPress.js
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useExternalWordPress(sourceId, options = {}) {
  return useQuery({
    queryKey: ['external-wordpress', sourceId, options],
    queryFn: async () => {
      const response = await axios.get(`/api/external-wordpress/${sourceId}/posts`, {
        params: options,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    },
    enabled: !!sourceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
}
```

#### 4.3 Create Display Component
```javascript
// src/components/ExternalWordPressContent.jsx
import React from 'react';
import { useExternalWordPress } from '../hooks/useExternalWordPress';

export function ExternalWordPressContent({ sourceId, limit = 10 }) {
  const { data, loading, error } = useExternalWordPress(sourceId, {
    per_page: limit,
    status: 'publish'
  });

  if (loading) return <div className="animate-pulse">Loading external content...</div>;
  if (error) return <div className="text-red-600">Error loading content</div>;
  if (!data || data.length === 0) return <div>No content available</div>;

  return (
    <div className="space-y-6">
      {data.map(post => (
        <article key={post.id} className="border-b border-gray-200 pb-6">
          <h3 className="text-xl font-semibold mb-2">
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              {post.title.rendered}
            </a>
          </h3>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
          <div className="text-sm text-gray-500 mt-2">
            Published: {new Date(post.date).toLocaleDateString()}
          </div>
        </article>
      ))}
    </div>
  );
}
```

### Step 5: Configure Nginx (Optional)

Add to your Nginx configuration:

```nginx
# External WordPress API Proxy
location /api/external-wordpress/ {
    # Rate limiting
    limit_req zone=external_wp_limit burst=20 nodelay;

    # Security headers
    add_header X-Proxy-Server "SaraivaVision-ExternalProxy";
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "DENY";

    # CORS configuration
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://saraivavision.com.br";
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-API-Key";
        add_header Access-Control-Max-Age 86400;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    # Proxy to Node.js service
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Timeouts
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=external_wp_limit:10m rate=10r/s;
```

## Testing Your Integration

### Test API Endpoints
```bash
# Test source creation
curl -X POST http://localhost:3002/api/external-wordpress/sources \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Source","base_url":"https://blog.example.com"}'

# Test content retrieval
curl http://localhost:3002/api/external-wordpress/1/posts

# Test health check
curl http://localhost:3002/api/external-wordpress/1/health
```

### Test Frontend Integration
```javascript
// Test in your React component
const ExternalContent = () => {
  const { data } = useExternalWordPress(1);

  return (
    <div>
      {data?.map(post => (
        <div key={post.id}>{post.title.rendered}</div>
      ))}
    </div>
  );
};
```

## Monitoring & Troubleshooting

### Health Check Endpoints
- `/api/external-wordpress/health` - Overall system health
- `/api/external-wordpress/{sourceId}/health` - Specific source health
- `/api/external-wordpress/stats` - Cache and performance statistics

### Common Issues

**CORS Errors**:
- Verify WordPress REST API CORS configuration
- Check Nginx CORS headers
- Ensure proper domain whitelisting

**Authentication Issues**:
- Verify WordPress Application Password is correct
- Check API key format (should be the full password string)
- Ensure WordPress user has appropriate permissions

**Cache Issues**:
- Check Redis connection status
- Verify cache TTL settings
- Monitor cache hit/miss ratios

**Performance Issues**:
- Monitor external server response times
- Check rate limiting configuration
- Optimize cache strategies

## Production Deployment

### Environment Variables Required
```env
# Core configuration
NODE_ENV=production
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cache configuration
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Rate limiting
EXTERNAL_WP_RATE_LIMIT_REQUESTS=1000
EXTERNAL_WP_RATE_LIMIT_WINDOW=3600
```

### Service Configuration
```bash
# Start the proxy service
node api/src/server.js

# Or use PM2 for process management
pm2 start api/src/server.js --name "external-wordpress-proxy"
```

### Scaling Considerations
- Use Redis cluster for high-traffic scenarios
- Implement connection pooling for database connections
- Consider horizontal scaling with load balancers
- Monitor memory usage and implement appropriate limits

## Support

For issues and questions:
1. Check the health monitoring endpoints
2. Review the sync logs in the database
3. Monitor the API service logs
4. Verify external WordPress accessibility

This quick start guide provides the essential steps for integrating external WordPress content with the Saraiva Vision platform. For advanced configuration and customization, refer to the detailed architecture documentation and API specifications.