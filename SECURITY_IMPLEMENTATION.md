# Security Hardening Implementation

## Overview

This document describes the comprehensive security hardening implementation for the Saraiva Vision API endpoints. The implementation includes rate limiting, XSS prevention, CORS configuration, security headers, honeypot fields, and advanced spam detection.

## 🔒 Security Features Implemented

### 1. Rate Limiting and IP-based Tracking

**Location**: `api/contact/rateLimiter.js`, `api/middleware/security.js`

- **IP Hashing**: Client IPs are hashed using SHA-256 for privacy compliance
- **Configurable Thresholds**: Rate limits can be adjusted via environment variables
- **Per-endpoint Limits**: Different rate limits for contact forms, appointments, chatbot, etc.
- **Automatic Cleanup**: Expired rate limit entries are automatically cleaned up
- **Penalty System**: Spam attempts increase rate limit penalties

**Configuration**:
```bash
RATE_LIMIT_WINDOW=15  # Minutes
RATE_LIMIT_MAX=10     # Max requests per window
```

### 2. XSS Prevention and Input Sanitization

**Location**: `api/utils/inputValidation.js`

- **HTML Entity Encoding**: Dangerous characters are encoded
- **Tag Removal**: Dangerous HTML tags are completely removed
- **Deep Sanitization**: Nested objects and arrays are recursively sanitized
- **Protocol Filtering**: Dangerous protocols (javascript:, data:, etc.) are blocked
- **Length Limits**: Input fields have configurable maximum lengths

**Features**:
- Removes `<script>`, `<iframe>`, `<object>`, `<embed>` tags
- Encodes `<`, `>`, `&`, `"`, `'`, `/`, `` ` ``, `=`
- Filters dangerous attributes like `onclick`, `onerror`, etc.
- Normalizes Unicode and removes control characters

### 3. CORS Configuration and Security Headers

**Location**: `api/utils/securityHeaders.js`

**Security Headers Applied**:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Legacy XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info
- `Content-Security-Policy` - Comprehensive CSP policy
- `Strict-Transport-Security` - HTTPS enforcement (production only)
- `Permissions-Policy` - Controls browser features

**CORS Configuration**:
- Allowed origins: `saraivavision.com.br`, `www.saraivavision.com.br`, Vercel deployments
- Development origins: `localhost:3000`, `localhost:3001`
- Regex patterns for Vercel preview deployments
- Credentials disabled for security

### 4. Honeypot Fields and Advanced Spam Detection

**Location**: `api/contact/rateLimiter.js` (enhanced `detectHoneypot` function)

**Honeypot Fields**:
- `website`, `url`, `honeypot`, `bot_field`, `email_confirm`, `phone_confirm`
- Fields should remain empty in legitimate submissions
- Filled honeypot fields indicate automated submissions

**Advanced Detection Techniques**:
- **Timing Analysis**: Submissions too fast (<2s) or too slow (>30min) are flagged
- **User Agent Analysis**: Detects bots, crawlers, and automated tools
- **Browser Headers**: Missing `Accept-Language` or `Accept-Encoding` indicates bots
- **Content Patterns**: Detects spam phrases, excessive URLs, suspicious patterns
- **Duplicate Detection**: SHA-256 hashing prevents duplicate submissions
- **Field Structure**: Validates field lengths and suspicious patterns

### 5. SQL/NoSQL Injection Detection

**Location**: `api/utils/inputValidation.js`

**SQL Injection Patterns**:
- SQL keywords: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `DROP`, `UNION`
- SQL operators: `OR 1=1`, `AND 1=1`
- SQL comments: `--`, `/*`, `*/`
- SQL functions: `WAITFOR`, `DELAY`, `xp_`, `sp_`

**NoSQL Injection Patterns**:
- MongoDB operators: `$where`, `$regex`, `$ne`, `$gt`, `$lt`, `$in`, `$or`
- JavaScript injection: `javascript:`, `function(`
- Object-based injection attempts

### 6. Path Traversal Detection

**Location**: `api/utils/inputValidation.js`

**Detected Patterns**:
- `../`, `..\\` - Directory traversal
- URL-encoded variants: `%2e%2e%2f`, `%2e%2e%5c`
- Double-encoded variants: `%252e%252e%252f`

### 7. Security Monitoring and Metrics

**Location**: `api/security/monitor.js`

**Monitoring Features**:
- Real-time security overview with threat metrics
- Detailed threat logs with pattern analysis
- Rate limiting statistics and violation tracking
- Security configuration validation
- Comprehensive security statistics

**Available Endpoints**:
- `GET /api/security/monitor?type=overview` - Security overview
- `GET /api/security/monitor?type=threats` - Threat detection logs
- `GET /api/security/monitor?type=rate-limits` - Rate limiting metrics
- `GET /api/security/monitor?type=config` - Configuration validation
- `GET /api/security/monitor?type=stats` - Comprehensive statistics

## 🛠️ Configuration

### Environment Variables

```bash
# Rate Limiting
RATE_LIMIT_WINDOW=15        # Rate limit window in minutes
RATE_LIMIT_MAX=10           # Maximum requests per window

# Security
NODE_ENV=production         # Enables production security headers
SUPABASE_URL=your_url       # For security event logging
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Per-Endpoint Configuration

**Location**: `api/config/security.js`

```javascript
// Rate limits per endpoint
RATE_LIMITS = {
  contact: { windowMs: 15 * 60 * 1000, maxRequests: 3 },
  appointments: { windowMs: 10 * 60 * 1000, maxRequests: 5 },
  chatbot: { windowMs: 5 * 60 * 1000, maxRequests: 20 },
  dashboard: { windowMs: 1 * 60 * 1000, maxRequests: 10 }
}

// Input validation rules
VALIDATION_RULES = {
  contact: {
    maxFieldLength: 2000,
    enableSpamDetection: true,
    enableHoneypot: true
  }
}
```

## 🔧 Implementation Guide

### 1. Applying Security to New Endpoints

```javascript
import { applyCorsHeaders, applySecurityHeaders } from '../utils/securityHeaders.js';
import { validateSecurity } from '../utils/inputValidation.js';
import { validateRequest } from '../contact/rateLimiter.js';

export default async function handler(req, res) {
  const requestId = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Apply security measures
  applyCorsHeaders(req, res);
  applySecurityHeaders(res, { requestId });

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Apply rate limiting
  const rateLimitResult = validateRequest(req, req.body || {});
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMITED', message: rateLimitResult.message }
    });
  }

  // Validate input security
  if (req.body) {
    const securityResult = validateSecurity(req.body);
    if (!securityResult.safe) {
      return res.status(400).json({
        success: false,
        error: { code: 'SECURITY_THREAT', message: 'Request blocked' }
      });
    }
  }

  // Your endpoint logic here...
}
```

### 2. Frontend Integration

**Add honeypot fields to forms**:
```html
<!-- Hidden honeypot fields -->
<input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
<input type="text" name="honeypot" style="display:none" tabindex="-1" autocomplete="off">

<!-- Timing fields for bot detection -->
<input type="hidden" name="_formLoadTime" value="">
<input type="hidden" name="_submissionTime" value="">
```

**JavaScript for timing**:
```javascript
// Set form load time
document.querySelector('[name="_formLoadTime"]').value = Date.now();

// Set submission time on form submit
form.addEventListener('submit', () => {
  document.querySelector('[name="_submissionTime"]').value = Date.now();
});
```

### 3. Monitoring Security Events

**Check security overview**:
```bash
curl -X GET "https://your-domain.com/api/security/monitor?type=overview"
```

**View threat logs**:
```bash
curl -X GET "https://your-domain.com/api/security/monitor?type=threats&timeRange=24h&limit=50"
```

**Monitor rate limits**:
```bash
curl -X GET "https://your-domain.com/api/security/monitor?type=rate-limits"
```

## 🚨 Security Alerts

The system logs the following security events to Supabase:

- `security_threat_detected` - SQL/NoSQL injection, XSS attempts
- `spam_detected` - Honeypot triggers, suspicious patterns
- `rate_limit_exceeded` - Rate limit violations
- `suspicious_user_agent` - Bot/crawler detection
- `duplicate_content` - Duplicate form submissions

## 📊 Security Metrics

**Key Performance Indicators**:
- Threat detection rate
- False positive rate
- Request success rate
- Rate limit effectiveness
- Response time impact

**Monitoring Dashboard**:
- Real-time threat detection
- Rate limiting statistics
- Security configuration status
- Historical trend analysis

## 🔍 Testing Security Implementation

### Manual Testing

1. **XSS Prevention**:
   ```bash
   curl -X POST https://your-domain.com/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"<script>alert(1)</script>","email":"test@example.com"}'
   ```

2. **SQL Injection Detection**:
   ```bash
   curl -X POST https://your-domain.com/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"John","message":"'; DROP TABLE users; --"}'
   ```

3. **Rate Limiting**:
   ```bash
   # Send multiple requests rapidly
   for i in {1..20}; do
     curl -X POST https://your-domain.com/api/contact \
       -H "Content-Type: application/json" \
       -d '{"name":"Test","email":"test@example.com","message":"Test"}'
   done
   ```

4. **Honeypot Detection**:
   ```bash
   curl -X POST https://your-domain.com/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"John","email":"test@example.com","honeypot":"spam"}'
   ```

### Automated Testing

Run the security validation script:
```bash
node validate-security.js
```

## 🛡️ Security Best Practices

1. **Regular Updates**: Keep security patterns and configurations updated
2. **Monitoring**: Regularly review security logs and metrics
3. **Testing**: Perform security testing before deployments
4. **Documentation**: Keep security procedures documented
5. **Training**: Ensure team understands security implementations

## 🔄 Maintenance

### Regular Tasks

1. **Weekly**: Review security metrics and threat logs
2. **Monthly**: Update spam patterns and security rules
3. **Quarterly**: Security configuration audit
4. **Annually**: Comprehensive security assessment

### Configuration Updates

Security configurations can be updated in:
- `api/config/security.js` - Main security policies
- Environment variables - Rate limiting thresholds
- `api/utils/securityHeaders.js` - Security headers
- `api/utils/inputValidation.js` - Validation patterns

## 📞 Support

For security-related issues or questions:
1. Check security monitoring dashboard
2. Review security logs in Supabase
3. Consult this documentation
4. Contact the development team

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Implemented and Active