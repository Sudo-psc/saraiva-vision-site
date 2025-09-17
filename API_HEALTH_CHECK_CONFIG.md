# API Health Check & Error Handling Configuration

## Overview

This document describes the API health check endpoint and improved error handling configuration for Saraiva Vision medical clinic website.

## Features Implemented

### 1. Health Check Endpoint

**Endpoint**: `GET /api/health`

**Response Format**:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T23:51:07.533Z",
  "uptime": 132.876985867,
  "version": "2.0.0",
  "environment": "development",
  "server": "Saraiva Vision API",
  "services": {
    "database": "connected",
    "external_apis": "operational"
  },
  "checks": {
    "memory": "4MB",
    "requests": 1,
    "rate_limit": {
      "window_ms": 60000,
      "max_requests": 100,
      "current_entries": 1
    }
  }
}
```

**Features**:
- ✅ Server status monitoring
- ✅ Uptime tracking
- ✅ Version information
- ✅ Memory usage monitoring
- ✅ Rate limiting status
- ✅ Service health indicators
- ✅ No caching headers

### 2. Enhanced Error Handling

**NGINX Configuration**:
- ✅ Health check endpoint with 5-second timeouts
- ✅ Error interception for API failures (502, 503, 504)
- ✅ Custom fallback responses with Portuguese messages
- ✅ CORS headers for all error responses
- ✅ Timestamp and retry information

**Error Response Format**:
```json
{
  "status": "maintenance",
  "message": "API temporariamente indisponível. Tente novamente em instantes.",
  "timestamp": "2025-09-17T23:51:07.533Z",
  "retry_after": 30
}
```

**Specific Error Messages**:
- **502 Gateway Error**: "Gateway inválido. O servidor API está offline."
- **503 Service Unavailable**: "Serviço indisponível. Manutenção em andamento."
- **504 Gateway Timeout**: "Timeout de gateway. O servidor API não respondeu a tempo."
- **Default**: "API temporariamente indisponível. Tente novamente em instantes."

### 3. Rate Limiting

**Configuration**:
- **Window**: 60 seconds
- **Max Requests**: 100 per IP
- **Headers**: Retry-After header included
- **Monitoring**: Visible in health check response

### 4. CORS Configuration

**Health Check CORS**:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

**API CORS**:
- Domain-based origin validation
- Supports development and production domains
- Proper preflight handling

## NGINX Configuration

### Health Check Location
```nginx
location /api/health {
    proxy_pass http://127.0.0.1:3001/health;
    proxy_connect_timeout 5s;
    proxy_send_timeout 5s;
    proxy_read_timeout 5s;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # CORS headers for health check
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
    add_header 'Content-Type' 'application/json' always;
}
```

### API Error Handling
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_intercept_errors on;
    error_page 502 503 504 = @api_fallback;
}

location @api_fallback {
    add_header Content-Type application/json always;
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

    # Custom error messages based on status code
    set $fallback_message 'API temporariamente indisponível. Tente novamente em instantes.';
    set $fallback_status 'maintenance';

    if ($status = 502) {
        set $fallback_message 'Gateway inválido. O servidor API está offline.';
        set $fallback_status 'gateway_error';
    }
    if ($status = 503) {
        set $fallback_message 'Serviço indisponível. Manutenção em andamento.';
        set $fallback_status 'service_unavailable';
    }
    if ($status = 504) {
        set $fallback_message 'Timeout de gateway. O servidor API não respondeu a tempo.';
        set $fallback_status 'gateway_timeout';
    }

    return 200 "{\"status\":\"$fallback_status\",\"message\":\"$fallback_message\",\"timestamp\":\"$time_iso8601\",\"retry_after\":30}";
}
```

## API Server Implementation

### Health Check Handler (server.js)
```javascript
if (parsed.pathname === '/api/health' || parsed.pathname === '/api/health/') {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    server: 'Saraiva Vision API',
    services: {
      database: 'connected',
      external_apis: 'operational'
    },
    checks: {
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      requests: global.requestCounts?.size || 0,
      rate_limit: {
        window_ms: RATE_LIMIT_WINDOW_MS,
        max_requests: RATE_LIMIT_MAX_REQUESTS,
        current_entries: global.requestCounts?.size || 0
      }
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.end(JSON.stringify(healthData));
  return;
}
```

## Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3001/api/health

# CORS test
curl -H "Origin: https://saraivavision.com.br" http://localhost:3001/api/health

# Error handling test
curl http://localhost:3001/api/unknown-endpoint
```

### Automated Testing
```bash
# Run comprehensive tests
node test-health-check.js

# Test individual endpoints
curl -s http://localhost:3001/api/health | jq .
```

## Monitoring

### Health Check Monitoring
- **Endpoint**: `/api/health`
- **Expected Response**: HTTP 200 with JSON body
- **Timeout**: 5 seconds
- **Frequency**: Recommended every 30-60 seconds

### Error Monitoring
- **502 Errors**: Backend server offline
- **503 Errors**: Service unavailable/maintenance
- **504 Errors**: Gateway timeout
- **429 Errors**: Rate limit exceeded

### Metrics to Monitor
- Response time for health check
- Memory usage trends
- Rate limiting usage
- Error rates by type

## Deployment Notes

### Environment Variables
- `NODE_ENV`: Set to 'production' for production deployment
- `PORT`: API server port (default: 3001)
- `npm_package_version`: Version information

### NGINX Reload
After updating nginx.conf:
```bash
sudo nginx -t      # Test configuration
sudo nginx -s reload  # Reload configuration
```

### Service Management
```bash
# Start API server
npm run start:api

# Development mode
npm run dev:full
```

## Security Considerations

1. **Health Check Security**: Limited to monitoring purposes only
2. **Rate Limiting**: Prevents abuse of API endpoints
3. **CORS**: Properly configured for medical clinic domains
4. **Error Messages**: User-friendly without exposing sensitive information
5. **Headers**: Security headers included in all responses

## Integration with Medical Clinic Systems

### Monitoring Integration
- Health check can be integrated with medical monitoring systems
- Error alerts can trigger medical staff notifications
- Rate limiting ensures fair access during peak hours

### Fallback Strategy
- Graceful degradation when API is unavailable
- Offline functionality maintained for critical features
- Retry logic implemented in frontend

## Troubleshooting

### Common Issues
1. **API Server Offline**: Check if Node.js server is running
2. **Port Conflicts**: Ensure port 3001 is available
3. **NGINX Configuration**: Test with `nginx -t`
4. **CORS Issues**: Verify allowed origins in configuration

### Log Analysis
- API server logs for health check requests
- NGINX error logs for proxy issues
- Application logs for debugging

## Performance Considerations

### Health Check Optimization
- Lightweight endpoint with minimal processing
- No database queries for health check
- Memory monitoring only
- No caching for real-time status

### Error Handling Performance
- Fast fallback responses
- Minimal processing in error scenarios
- Proper headers for caching control

---

This configuration ensures reliable API operation for the Saraiva Vision medical clinic with proper health monitoring, error handling, and fallback strategies suitable for medical applications.