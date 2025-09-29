# Proxy Architecture Design for External WordPress Integration

## Architecture Overview

This document defines the proxy-based architecture for integrating external WordPress installations with the Saraiva Vision platform. The proxy architecture provides security, performance optimization, and compliance while maintaining seamless integration with multiple external WordPress sources.

## Core Architecture Components

### 1. Multi-Layer Proxy Structure

```
Frontend (React SPA)
    ↓
Local API Gateway (/api/external-wordpress/*)
    ↓
Proxy Service Layer
    ↓
External WordPress APIs
```

**Proxy Service Components:**
- **Request Router**: Directs requests to appropriate handlers
- **Authentication Middleware**: Handles API key authentication and validation
- **Cache Manager**: Implements multi-layer caching strategy
- **Rate Limiter**: Enforces rate limiting per external source
- **Content Transformer**: Normalizes WordPress API responses
- **Compliance Engine**: Applies CFM/LGPD compliance rules
- **Error Handler**: Centralized error management and fallback logic
- **Health Monitor**: Tracks external service availability

### 2. Data Flow Architecture

```
User Request → Nginx → React App → Local API → Proxy Service → Cache Check → External API → Response Transform → Cache Store → User Response
```

**Request Processing Pipeline:**
1. **Request Validation**: Schema validation and authentication
2. **Cache Lookup**: Multi-layer cache check (Redis → Database)
3. **Rate Limit Check**: Per-source rate limiting
4. **External Request**: Proxy to external WordPress API
5. **Response Processing**: Transform, validate, and cache response
6. **Compliance Filtering**: Apply CFM/LGPD rules
7. **Response Delivery**: Return processed data to frontend

## Detailed Component Design

### Proxy Service Architecture

#### File Structure
```
api/src/routes/external-wordpress/
├── index.js                 # Main router entry point
├── middleware/
│   ├── authentication.js    # API key validation
│   ├── rate-limiter.js      # Rate limiting per source
│   ├── cache.js            # Cache management
│   ├── validation.js       # Request validation
│   └── compliance.js       # CFM/LGPD compliance
├── services/
│   ├── proxy-service.js    # Core proxy logic
│   ├── cache-service.js    # Cache operations
│   ├── transform-service.js # Response transformation
│   └── health-service.js   # Health monitoring
├── controllers/
│   ├── sources.js          # Source management
│   ├── posts.js            # Post content proxy
│   ├── pages.js            # Page content proxy
│   ├── media.js            # Media file proxy
│   └── sync.js             # Synchronization
└── utils/
    ├── request-builder.js  # WordPress API requests
    ├── response-normalizer.js # Response standardization
    └── error-handler.js    # Error management
```

#### Core Proxy Service (api/src/routes/external-wordpress/services/proxy-service.js)
```javascript
class ExternalWordPressProxy {
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
}
```

### Caching Architecture

#### Multi-Layer Caching Strategy
```javascript
class CacheService {
  constructor() {
    this.redis = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async get(cacheKey) {
    // Try Redis first (fastest)
    const redisResult = await this.redis.get(cacheKey);
    if (redisResult) {
      return JSON.parse(redisResult);
    }

    // Fallback to database cache
    const { data } = await this.supabase
      .from('external_wordpress_content')
      .select('content')
      .eq('cache_key', cacheKey)
      .single();

    return data?.content;
  }

  async set(cacheKey, content, ttl) {
    const contentStr = JSON.stringify(content);

    // Set in Redis with TTL
    await this.redis.setex(cacheKey, ttl, contentStr);

    // Store in database as backup
    await this.supabase
      .from('external_wordpress_content')
      .upsert({
        cache_key,
        content,
        expires_at: new Date(Date.now() + ttl * 1000),
        cached_at: new Date()
      });
  }
}
```

### Security Architecture

#### Authentication & Authorization Middleware
```javascript
// api/src/routes/external-wordpress/middleware/authentication.js
class AuthenticationMiddleware {
  async authenticate(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const sourceId = req.params.sourceId;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    // Verify source exists and API key matches
    const { data: source, error } = await supabase
      .from('external_wordpress_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('api_key', apiKey)
      .single();

    if (error || !source) {
      return res.status(401).json({ error: 'Invalid API key or source' });
    }

    if (source.status !== 'active') {
      return res.status(403).json({ error: 'Source not active' });
    }

    req.source = source;
    next();
  }
}

// Rate limiting middleware
class RateLimiterMiddleware {
  async checkRateLimit(req, res, next) {
    const source = req.source;
    const key = `external_wp_rate_limit:${source.id}`;

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, source.rate_limit_window || 3600);
    }

    if (current > source.rate_limit_requests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: source.rate_limit_window
      });
    }

    next();
  }
}
```

### Content Transformation Service

#### Response Normalization
```javascript
// api/src/routes/external-wordpress/services/transform-service.js
class TransformService {
  transformWordPressResponse(sourceData, sourceConfig) {
    return {
      id: this.generateInternalId(sourceData.id, sourceConfig.id),
      source_id: sourceConfig.id,
      source_name: sourceConfig.name,
      title: sourceData.title?.rendered || '',
      content: this.processContent(sourceData.content?.rendered || ''),
      excerpt: sourceData.excerpt?.rendered || '',
      slug: sourceData.slug,
      status: sourceData.status,
      published_at: sourceData.date,
      modified_at: sourceData.modified,
      author: this.transformAuthor(sourceData.author),
      categories: this.transformTaxonomy(sourceData.categories),
      tags: this.transformTaxonomy(sourceData.tags),
      featured_media: this.transformMedia(sourceData.featured_media),
      meta: this.extractMetadata(sourceData),
      links: sourceData._links,
      compliance_score: this.calculateComplianceScore(sourceData),
      cached_at: new Date().toISOString()
    };
  }

  processContent(content) {
    // Apply CFM compliance filtering
    let processedContent = this.applyCFMCompliance(content);

    // Extract and transform media URLs
    processedContent = this.transformMediaUrls(processedContent);

    // Optimize images and lazy loading
    processedContent = this.optimizeImages(processedContent);

    // Add accessibility attributes
    processedContent = this.enhanceAccessibility(processedContent);

    return processedContent;
  }

  applyCFMCompliance(content) {
    // Inject medical disclaimer if not present
    if (!content.includes('medical-disclaimer')) {
      const disclaimer = CFM_CONFIG.medical_disclaimer;
      content = content.replace(/<\/article>/, `${disclaimer}</article>`);
    }

    // Filter inappropriate content
    content = this.filterInappropriateContent(content);

    // Remove PII data
    content = this.anonymizePII(content);

    return content;
  }
}
```

### Health Monitoring System

#### Service Health Checks
```javascript
// api/src/routes/external-wordpress/services/health-service.js
class HealthService {
  constructor() {
    this.healthStatus = new Map();
  }

  async checkHealth(sourceConfig) {
    const healthKey = `external_wp_health:${sourceConfig.id}`;

    try {
      // Check cached health status
      const cachedHealth = await this.redis.get(healthKey);
      if (cachedHealth) {
        return JSON.parse(cachedHealth);
      }

      // Perform health check
      const startTime = Date.now();
      const response = await this.healthCheckRequest(sourceConfig);
      const responseTime = Date.now() - startTime;

      const healthStatus = {
        status: response.status < 500 ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked: new Date().toISOString(),
        statusCode: response.status,
        details: {
          reachable: response.status !== 0,
          sslValid: this.checkSSL(sourceConfig.base_url),
          apiAccessible: response.status === 200
        }
      };

      // Cache health status
      await this.redis.setex(
        healthKey,
        sourceConfig.health_check_interval || 300,
        JSON.stringify(healthStatus)
      );

      // Log health status
      await this.logHealthCheck(sourceConfig.id, healthStatus);

      return healthStatus;

    } catch (error) {
      const errorStatus = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: error.message,
        details: { reachable: false }
      };

      await this.logHealthCheck(sourceConfig.id, errorStatus);
      throw error;
    }
  }

  async healthCheckRequest(sourceConfig) {
    try {
      const response = await axios.get(
        `${sourceConfig.base_url}/wp-json/wp/v2/`,
        {
          timeout: 10000,
          validateStatus: (status) => status < 500
        }
      );
      return response;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return { status: 0 };
      }
      throw error;
    }
  }
}
```

## Nginx Configuration

### Proxy and Caching Configuration
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

## Integration with Existing Systems

### Supabase Integration
```javascript
// Database service for external WordPress data
class ExternalWordPressDatabase {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async createSource(sourceData) {
    const { data, error } = await this.supabase
      .from('external_wordpress_sources')
      .insert([sourceData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async cacheContent(sourceId, contentType, externalId, content) {
    const { data, error } = await this.supabase
      .from('external_wordpress_content')
      .upsert({
        source_id: sourceId,
        content_type: contentType,
        external_id: externalId,
        content: content,
        cached_at: new Date(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async logSyncActivity(sourceId, action, status, details) {
    const { error } = await this.supabase
      .from('external_wordpress_sync_logs')
      .insert([{
        source_id: sourceId,
        action,
        status,
        details,
        started_at: new Date()
      }]);

    if (error) console.error('Failed to log sync activity:', error);
  }
}
```

### Frontend Integration
```javascript
// src/hooks/useExternalWordPress.js
export function useExternalWordPress(sourceId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/external-wordpress/${sourceId}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchContent };
}

// src/components/ExternalWordPressContent.jsx
export function ExternalWordPressContent({ sourceId, contentType, limit = 10 }) {
  const { data, loading, error, fetchContent } = useExternalWordPress(sourceId);

  useEffect(() => {
    fetchContent(`${contentType}?per_page=${limit}`);
  }, [sourceId, contentType, limit]);

  if (loading) return <ExternalContentLoading />;
  if (error) return <ExternalContentError error={error} />;
  if (!data) return null;

  return (
    <div className="external-wordpress-content">
      {data.map(item => (
        <ExternalContentItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## Security Considerations

### 1. API Security
- **API Key Management**: Secure storage and rotation
- **Request Validation**: Input sanitization and schema validation
- **Rate Limiting**: Per-source and global rate limiting
- **CORS Configuration**: Proper cross-origin resource sharing
- **HTTPS Enforcement**: SSL/TLS for all external communications

### 2. Data Security
- **PII Filtering**: Automatic detection and anonymization
- **Content Validation**: Malicious content detection
- **Secure Caching**: Encrypted cache storage
- **Audit Logging**: Complete request/response logging

### 3. Compliance Integration
- **CFM Compliance**: Medical content validation and disclaimer injection
- **LGPD Compliance**: Data protection and right to deletion
- **Accessibility**: WCAG 2.1 AA compliance for external content

## Performance Optimization

### 1. Caching Strategy
- **Multi-layer Cache**: Redis → Database → Browser
- **Cache Invalidation**: Time-based and event-based
- **Cache Warming**: Pre-cache popular content
- **CDN Integration**: Static asset optimization

### 2. Request Optimization
- **Connection Pooling**: Reuse HTTP connections
- **Request Batching**: Multiple requests in parallel
- **Compression**: Gzip compression for responses
- **Lazy Loading**: Progressive content loading

### 3. Monitoring & Alerting
- **Response Time Tracking**: Performance metrics
- **Error Rate Monitoring**: Service health
- **Cache Hit/Miss Analysis**: Cache effectiveness
- **External Service Health**: Third-party availability

## Deployment Considerations

### 1. Scaling Architecture
- **Horizontal Scaling**: Multiple proxy instances
- **Load Balancing**: Nginx load distribution
- **Database Scaling**: Read replicas for cache data
- **Service Isolation**: Separate services for different functions

### 2. High Availability
- **Redundant Services**: Multiple proxy instances
- **Failover Mechanisms**: Graceful degradation
- **Backup Systems**: Database and cache backups
- **Monitoring**: Real-time health and performance

### 3. Maintenance Strategy
- **Zero Downtime Deployment**: Rolling updates
- **Configuration Management**: Environment-based configs
- **Version Compatibility**: API version management
- **Rollback Procedures**: Quick recovery mechanisms

This proxy architecture provides a robust, scalable, and secure foundation for integrating external WordPress content while maintaining performance, compliance, and user experience standards.