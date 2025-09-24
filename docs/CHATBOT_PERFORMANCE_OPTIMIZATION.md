# Chatbot Performance Optimization System

## Overview

The Chatbot Performance Optimization System provides intelligent caching, performance monitoring, and resource management for the AI chatbot widget. This system ensures fast response times, efficient resource usage, and comprehensive monitoring while maintaining medical compliance and data protection standards.

## Features

### 🚀 Intelligent Caching System
- **Category-based TTL**: Different cache durations for medical info (7d), general content (24h), appointments (1h)
- **Multi-level Cache**: In-memory cache + database persistence for optimal performance
- **Medical Safety**: Prevents caching of emergency responses and personal information
- **Similarity Search**: Finds related cached responses using Jaccard similarity
- **Content Validation**: Automatic filtering of non-cacheable content

### 📊 Performance Monitoring
- **Real-time Metrics**: Response times, token usage, error rates, cache performance
- **Health Scoring**: Overall system health (0-100) and efficiency scores
- **Trend Analysis**: Historical data analysis with percentile calculations
- **Anomaly Detection**: Automatic identification of performance issues
- **Actionable Insights**: Specific recommendations for optimization

### 🔧 Resource Management
- **Connection Pooling**: Configurable database connection pool (2-10 connections)
- **Auto-scaling**: Dynamic resource allocation based on load thresholds
- **Circuit Breaker**: Fault tolerance for external service failures
- **Request Queue**: Priority-based request processing with load balancing
- **Memory Management**: Intelligent cleanup and garbage collection

## Quick Start

### 1. Environment Setup

Copy the chatbot environment variables to your `.env` file:

```bash
# Copy from .env.example.chatbot
cp .env.example.chatbot .env.local

# Or add to existing .env file
cat .env.example.chatbot >> .env
```

### 2. Database Setup

Run the setup script to initialize database tables and configuration:

```bash
npm run chatbot:setup
```

This will:
- Create cache and performance monitoring tables
- Initialize system configuration
- Warm up cache with common medical questions
- Run health checks

### 3. Test the System

Run performance tests to verify everything is working:

```bash
npm run chatbot:test
```

### 4. Monitor Performance

Access the performance dashboard:
- Overview: `GET /api/chatbot/performance?action=overview`
- Health: `GET /api/chatbot/performance?action=health`
- Cache: `GET /api/chatbot/performance?action=cache`
- Resources: `GET /api/chatbot/performance?action=resources`

## Configuration

### Environment Variables

#### Core Configuration
```bash
# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_MAX_TOKENS=8192

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

#### Performance Optimization
```bash
# Connection Pooling
CHATBOT_MAX_CONNECTIONS=10
CHATBOT_MIN_CONNECTIONS=2
CHATBOT_MAX_CONCURRENT=50
CHATBOT_AUTO_SCALING=true

# Cache Configuration
CHATBOT_ENABLE_CACHING=true
CHATBOT_CACHE_DEFAULT_TTL=86400
CHATBOT_CACHE_MEDICAL_TTL=604800
CHATBOT_CACHE_APPOINTMENT_TTL=3600

# Performance Monitoring
CHATBOT_PERFORMANCE_MONITORING=true
CHATBOT_METRICS_RETENTION_DAYS=30
```

### Cache Categories and TTL

| Category | TTL | Description |
|----------|-----|-------------|
| `cataract` | 7 days | Cataract-related information |
| `glaucoma` | 7 days | Glaucoma-related information |
| `myopia` | 7 days | Myopia-related information |
| `astigmatism` | 7 days | Astigmatism-related information |
| `conjunctivitis` | 7 days | Conjunctivitis-related information |
| `dry_eye` | 7 days | Dry eye-related information |
| `retina` | 7 days | Retina-related information |
| `general_info` | 7 days | General medical information |
| `appointment` | 1 hour | Appointment-related queries |
| `general` | 24 hours | General non-medical queries |
| `emergency` | 0 (never) | Emergency responses |

## API Reference

### Performance Dashboard API

#### Get Overview
```http
GET /api/chatbot/performance?action=overview
```

Returns system overview with health scores, performance metrics, and resource utilization.

#### Get Health Status
```http
GET /api/chatbot/performance?action=health
```

Returns component-level health status for performance, cache, resources, and Gemini API.

#### Get Cache Performance
```http
GET /api/chatbot/performance?action=cache
```

Returns cache statistics, hit rates, and health information.

#### Get Resource Utilization
```http
GET /api/chatbot/performance?action=resources
```

Returns connection pool status, memory usage, and optimization recommendations.

#### Get Detailed Metrics
```http
GET /api/chatbot/performance?action=metrics&timeRange=24h
```

Returns detailed performance metrics with historical data and trends.

**Time Range Options**: `1h`, `24h`, `7d`, `30d`

#### Generate Performance Report
```http
GET /api/chatbot/performance?action=report&timeRange=7d
```

Returns comprehensive performance report with recommendations.

### Response Format

```json
{
  "success": true,
  "action": "overview",
  "timeRange": "24h",
  "data": {
    "summary": {
      "status": "healthy",
      "healthScore": 85,
      "efficiencyScore": 80,
      "uptime": 3600
    },
    "performance": {
      "responseTime": {
        "average": 1500,
        "p95": 2000,
        "p99": 3000
      },
      "throughput": {
        "totalRequests": 1000,
        "successRate": 95.5
      }
    },
    "cache": {
      "hitRate": 75,
      "totalHits": 750,
      "memoryCacheSize": 100
    },
    "resources": {
      "connections": {
        "active": 5,
        "idle": 3,
        "total": 8
      },
      "memory": {
        "heapUsedMB": 150,
        "heapTotalMB": 512
      }
    }
  },
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00Z",
    "requestId": "req_123"
  }
}
```

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chat API      │    │  Cache Service  │    │ Performance     │
│                 │    │                 │    │ Monitor         │
│ - Request       │───▶│ - Memory Cache  │    │                 │
│   Handling      │    │ - DB Cache      │    │ - Metrics       │
│ - Cache Check   │    │ - Similarity    │    │ - Health Score  │
│ - Performance   │    │   Search        │    │ - Insights      │
│   Tracking      │    │ - TTL Mgmt      │    │ - Trends        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Resource        │    │   Database      │    │  Monitoring     │
│ Manager         │    │                 │    │  Dashboard      │
│                 │    │ - Cache Table   │    │                 │
│ - Conn Pool     │    │ - Metrics Table │    │ - Real-time     │
│ - Auto-scaling  │    │ - Config Table  │    │   Status        │
│ - Circuit       │    │ - Logs Table    │    │ - Historical    │
│   Breaker       │    │ - Functions     │    │   Analysis      │
│ - Queue Mgmt    │    │ - Indexes       │    │ - Reports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Request Processing**:
   - User sends message to chat API
   - System checks cache for existing response
   - If cache miss, calls Gemini API
   - Caches response if cacheable
   - Records performance metrics

2. **Cache Management**:
   - Categorizes messages by medical topic
   - Applies appropriate TTL based on category
   - Validates content for cacheability
   - Manages memory and database cache layers

3. **Performance Monitoring**:
   - Tracks response times, token usage, errors
   - Calculates health and efficiency scores
   - Detects anomalies and generates insights
   - Stores metrics for historical analysis

4. **Resource Management**:
   - Manages database connection pool
   - Auto-scales based on load
   - Implements circuit breaker patterns
   - Queues and prioritizes requests

## Performance Targets

### Response Time
- **Target**: < 3 seconds for 95% of requests
- **Cache Hit**: < 200ms
- **API Call**: < 5 seconds
- **P99**: < 10 seconds

### Cache Performance
- **Hit Rate**: > 60% for medical information
- **Memory Cache**: < 1000 entries
- **Database Cache**: < 10,000 entries
- **Cleanup**: Automated daily cleanup

### Resource Utilization
- **Connection Pool**: 80% utilization under normal load
- **Memory Usage**: < 512MB heap
- **CPU Usage**: < 70% average
- **Error Rate**: < 5% of total requests

### Health Scores
- **Overall Health**: > 80 (healthy)
- **Efficiency Score**: > 70 (efficient)
- **Component Health**: All components healthy
- **Availability**: > 99% uptime

## Monitoring and Alerting

### Health Checks

The system provides multiple health check endpoints:

```bash
# Overall system health
curl /api/chatbot/performance?action=health

# Component-specific health
curl /api/chatbot/performance?action=cache
curl /api/chatbot/performance?action=resources
```

### Key Metrics to Monitor

1. **Response Time Metrics**:
   - Average response time
   - P95 and P99 response times
   - Cache hit response time vs API call time

2. **Cache Metrics**:
   - Cache hit rate
   - Memory cache utilization
   - Database cache size
   - Cache invalidation rate

3. **Resource Metrics**:
   - Connection pool utilization
   - Memory usage
   - Active vs idle connections
   - Request queue length

4. **Error Metrics**:
   - Error rate by type
   - Failed requests
   - Circuit breaker status
   - Retry attempts

### Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Response Time | > 3s | > 5s |
| Error Rate | > 5% | > 10% |
| Cache Hit Rate | < 50% | < 30% |
| Health Score | < 70 | < 50 |
| Memory Usage | > 400MB | > 500MB |
| Connection Pool | > 80% | > 95% |

## Troubleshooting

### Common Issues

#### High Response Times
1. Check cache hit rate - low hit rate increases API calls
2. Monitor connection pool utilization
3. Review Gemini API response times
4. Check for database connection issues

#### Low Cache Hit Rate
1. Verify cache TTL settings are appropriate
2. Check if content is being filtered as non-cacheable
3. Review message categorization logic
4. Monitor cache invalidation patterns

#### Resource Exhaustion
1. Check connection pool configuration
2. Monitor memory usage and cleanup
3. Review auto-scaling settings
4. Check for connection leaks

#### Database Issues
1. Verify Supabase connection settings
2. Check database table existence
3. Monitor query performance
4. Review connection pool health

### Debug Commands

```bash
# Test system health
npm run chatbot:test

# Check database tables
node scripts/setup-chatbot-performance.js

# Warm up cache
npm run chatbot:cache:warm

# Run performance tests
npm run chatbot:performance
```

### Log Analysis

The system logs important events and metrics:

```bash
# Cache operations
grep "Cache hit\|Cache miss" logs/

# Performance metrics
grep "Performance\|Health score" logs/

# Resource management
grep "Connection pool\|Auto-scaling" logs/

# Errors and warnings
grep "ERROR\|WARN" logs/
```

## Best Practices

### Development
1. Always test cache behavior with representative data
2. Monitor performance metrics during development
3. Use appropriate TTL values for different content types
4. Implement proper error handling and fallbacks

### Production
1. Monitor health scores and set up alerting
2. Regularly review performance reports
3. Optimize cache hit rates based on usage patterns
4. Scale resources based on actual load patterns

### Security
1. Never cache personal or sensitive information
2. Implement proper access controls for monitoring endpoints
3. Use encrypted connections for all database operations
4. Regularly audit cached content for compliance

### Maintenance
1. Run regular health checks and performance tests
2. Clean up expired cache entries automatically
3. Monitor and optimize database query performance
4. Update TTL values based on content freshness requirements

## Migration Guide

### From Basic Chatbot to Performance Optimized

1. **Update Environment Variables**:
   ```bash
   # Add performance optimization variables
   cat .env.example.chatbot >> .env
   ```

2. **Run Database Migrations**:
   ```bash
   npm run chatbot:setup
   ```

3. **Update API Calls**:
   - No changes required - caching is transparent
   - Monitor performance dashboard for improvements

4. **Configure Monitoring**:
   - Set up health check endpoints
   - Configure alerting thresholds
   - Review performance reports

### Rollback Plan

If issues occur, you can disable optimization features:

```bash
# Disable caching
CHATBOT_ENABLE_CACHING=false

# Disable performance monitoring
CHATBOT_PERFORMANCE_MONITORING=false

# Disable auto-scaling
CHATBOT_AUTO_SCALING=false
```

## Support

### Documentation
- [Performance Optimization Summary](../CHATBOT_PERFORMANCE_OPTIMIZATION_SUMMARY.md)
- [Environment Variables](.env.example.chatbot)
- [API Reference](api/chatbot/performance.js)

### Testing
- Performance Test Suite: `npm run chatbot:test`
- Setup Script: `npm run chatbot:setup`
- Health Checks: `/api/chatbot/performance?action=health`

### Monitoring
- Performance Dashboard: `/api/chatbot/performance`
- Cache Statistics: `/api/chatbot/performance?action=cache`
- Resource Utilization: `/api/chatbot/performance?action=resources`

For additional support, refer to the implementation files and test suites for detailed examples and usage patterns.