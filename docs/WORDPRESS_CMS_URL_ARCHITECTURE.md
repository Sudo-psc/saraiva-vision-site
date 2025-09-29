# WordPress CMS URL Architecture

**Document Version**: 1.0
**Last Updated**: 2025-09-29
**Status**: ✅ Production Configuration Verified

---

## 🎯 Overview

Saraiva Vision uses a **dual-subdomain WordPress architecture**:
- **blog.saraivavision.com.br**: Public WordPress site with theme rendering (HTML)
- **cms.saraivavision.com.br**: Headless CMS API for React application (JSON)

This separation allows the WordPress admin interface to remain accessible while the React SPA consumes content via REST API.

---

## 🌐 Subdomain Architecture

### 1. Blog Subdomain (`blog.saraivavision.com.br`)

**Purpose**: Traditional WordPress site with public theme rendering

**Characteristics**:
- Serves HTML pages with WordPress theme
- Accessible at: `https://blog.saraivavision.com.br`
- WordPress admin: `https://blog.saraivavision.com.br/wp-admin`
- **Not used for API calls** (returns HTML instead of JSON)

**Example Response**:
```bash
curl "https://blog.saraivavision.com.br/wp-json/wp/v2/posts"
# Returns: <!DOCTYPE html>... (HTML page, not JSON)
```

**Use Cases**:
- WordPress admin access
- Direct browser access to WordPress content
- Fallback public site if React app fails
- SEO-friendly WordPress permalinks

---

### 2. CMS Subdomain (`cms.saraivavision.com.br`)

**Purpose**: Headless CMS API for React application consumption

**Characteristics**:
- Serves JSON data via WordPress REST API
- GraphQL endpoint available (currently experiencing SSL issues)
- **Primary endpoint for React application**
- Same WordPress installation, different domain configuration

**Example Response**:
```bash
curl "https://cms.saraivavision.com.br/wp-json/wp/v2/posts"
# Returns: [{"id":1,"title":{"rendered":"Hello world!"},...}] (Valid JSON)
```

**Available Endpoints**:
- REST API: `https://cms.saraivavision.com.br/wp-json/wp/v2/`
- GraphQL: `https://cms.saraivavision.com.br/graphql` (502 errors, not currently used)
- JWT Auth: `https://cms.saraivavision.com.br/wp-json/jwt-auth/v1/token`

**Use Cases**:
- React application data fetching
- Headless CMS integration
- Mobile app API (future)
- Third-party integrations

---

## ⚙️ Configuration

### Environment Variables (`.env.production`)

```bash
# Primary WordPress Configuration
VITE_WORDPRESS_API_URL=https://cms.saraivavision.com.br
VITE_WORDPRESS_SITE_URL=https://cms.saraivavision.com.br
VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql

# Legacy Variables (optional)
VITE_WORDPRESS_URL=https://saraivavision.com.br
WORDPRESS_DOMAIN=https://cms.saraivavision.com.br
```

**Critical Variables**:
- `VITE_WORDPRESS_API_URL`: **Primary REST API endpoint** (must be cms subdomain)
- `VITE_WORDPRESS_SITE_URL`: **WordPress site URL** (must be cms subdomain)
- `VITE_WORDPRESS_GRAPHQL_ENDPOINT`: GraphQL endpoint (currently unused due to 502 errors)

### Service Configuration

#### WordPressBlogService.js
```javascript
class WordPressBlogService {
  constructor(options = {}) {
    // Primary REST API endpoint - MUST be cms subdomain
    this.baseURL = options.baseURL || 'https://blog.saraivavision.com.br';
    this.apiEndpoint = '/wp-json/wp/v2';

    // CMS base URL for headless operations
    this.cmsBaseURL = options.cmsBaseURL || 'https://cms.saraivavision.com.br';

    // Environment variable overrides defaults
    // Reads VITE_WORDPRESS_API_URL from .env.production
  }
}
```

**Important**: The service reads `VITE_WORDPRESS_API_URL` from environment, which overrides the default `baseURL`. Production uses `cms.saraivavision.com.br`.

#### wordpress-compat.js
```javascript
// Initialize REST API service (NOT GraphQL)
const blogService = new WordPressBlogService({
  baseURL: import.meta.env.VITE_WORDPRESS_API_URL || 'https://blog.saraivavision.com.br',
  cmsBaseURL: import.meta.env.VITE_WORDPRESS_SITE_URL || 'https://cms.saraivavision.com.br',
  cacheEnabled: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  useJWTAuth: false // Public endpoints don't need JWT
});
```

**Configuration Priority**:
1. Environment variable `VITE_WORDPRESS_API_URL` (highest priority)
2. Service constructor `baseURL` parameter
3. Default fallback (lowest priority)

---

## 🔍 Verification & Testing

### REST API Health Check

**CMS Subdomain (Correct)**:
```bash
# Test posts endpoint
curl -s "https://cms.saraivavision.com.br/wp-json/wp/v2/posts?per_page=2" | jq '.[0].title'

# Expected Output:
{
  "rendered": "Hello world!"
}

# Status: ✅ Returns valid JSON
```

**Blog Subdomain (Incorrect for API)**:
```bash
# Test posts endpoint
curl -s "https://blog.saraivavision.com.br/wp-json/wp/v2/posts"

# Expected Output:
<!DOCTYPE html>...

# Status: ❌ Returns HTML instead of JSON
```

### GraphQL Health Check

```bash
# Test GraphQL endpoint
curl -X POST "https://cms.saraivavision.com.br/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Expected Output:
502 Bad Gateway

# Status: ❌ GraphQL currently unavailable (SSL issues)
# Application uses REST API instead
```

### Application Configuration Check

```bash
# Verify environment variables in production build
cat .env.production | grep WORDPRESS

# Expected Output:
VITE_WORDPRESS_API_URL=https://cms.saraivavision.com.br
VITE_WORDPRESS_SITE_URL=https://cms.saraivavision.com.br
VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Application Returns HTML Instead of JSON

**Symptom**: API requests return `<!DOCTYPE html>` instead of JSON data

**Root Cause**: Application configured to use `blog.saraivavision.com.br` instead of `cms.saraivavision.com.br`

**Solution**:
1. Check `.env.production`: `VITE_WORDPRESS_API_URL=https://cms.saraivavision.com.br`
2. Rebuild application: `npm run build`
3. Verify built files use correct URL
4. Deploy to production

---

### Issue 2: GraphQL 502 Errors

**Symptom**: GraphQL endpoint returns 502 Bad Gateway

**Root Cause**: SSL configuration issues on cms.saraivavision.com.br GraphQL endpoint

**Current Status**: ❌ Known issue, not critical

**Workaround**: Application now uses REST API instead of GraphQL
- REST API is fully functional: `https://cms.saraivavision.com.br/wp-json/wp/v2/`
- GraphQL endpoint disabled in production
- All blog functionality works via REST API

**Future Fix** (if GraphQL needed):
1. SSH to server: `ssh root@31.97.129.78`
2. Check SSL certificates: `sudo certbot certificates`
3. Renew if needed: `sudo certbot renew`
4. Reload Nginx: `sudo systemctl reload nginx`

---

### Issue 3: Environment Variable Not Loading

**Symptom**: Application uses default URL instead of environment variable

**Root Cause**: Vite requires `VITE_` prefix for client-side access

**Solution**:
1. Ensure variable has `VITE_` prefix: `VITE_WORDPRESS_API_URL`
2. Rebuild application after changing .env: `npm run build`
3. Verify with: `grep -r "cms.saraivavision.com.br" dist/assets/*.js`

---

## 📊 Endpoint Comparison Table

| Endpoint | blog subdomain | cms subdomain | Status |
|----------|----------------|---------------|--------|
| REST API `/wp-json/wp/v2/` | ❌ Returns HTML | ✅ Returns JSON | **Use cms** |
| GraphQL `/graphql` | ❌ Not available | ⚠️ 502 errors | **Don't use** |
| WordPress Admin `/wp-admin` | ✅ Accessible | ✅ Accessible | **Both work** |
| JWT Auth `/wp-json/jwt-auth/v1/token` | ⚠️ Untested | ✅ Working | **Use cms** |
| Public Site (HTML) | ✅ Theme renders | ⚠️ Redirects | **Use blog** |

**Production Recommendation**: Use `cms.saraivavision.com.br` for all API operations.

---

## 🔐 Security Considerations

### Public API Access
- REST API endpoints are **publicly accessible** (no authentication required)
- Rate limiting implemented via Nginx
- CORS headers configured for React application origin

### Admin Operations
- JWT authentication required for admin operations (create/update/delete posts)
- Service role key stored securely in environment variables
- Admin endpoints protected by WordPress user roles

### SSL/TLS
- Both subdomains use Let's Encrypt SSL certificates
- HTTPS enforced for all API requests
- Certificate auto-renewal configured via Certbot

---

## 📋 Migration Checklist

If you need to change WordPress API endpoints:

- [ ] Update `.env.production` with new URL
- [ ] Update `WordPressBlogService.js` default URLs if needed
- [ ] Test REST API endpoint returns JSON: `curl -s "https://NEW_URL/wp-json/wp/v2/posts"`
- [ ] Rebuild application: `npm run build`
- [ ] Test locally: `npm run preview`
- [ ] Deploy to production
- [ ] Verify production site loads blog content
- [ ] Update this documentation with new URL

---

## 🎯 Best Practices

### DO ✅
- Always use `cms.saraivavision.com.br` for API calls
- Test API endpoints return JSON before deployment
- Use environment variables for configuration (don't hardcode URLs)
- Implement proper error handling and fallback content
- Cache API responses to reduce server load

### DON'T ❌
- Don't use `blog.saraivavision.com.br` for API calls (returns HTML)
- Don't hardcode URLs in source code (use environment variables)
- Don't rely on GraphQL endpoint (currently broken)
- Don't skip testing after configuration changes
- Don't forget to rebuild after changing .env files

---

## 📚 Related Documentation

- [EMERGENCY_FIXES_2025-09-29.md](./EMERGENCY_FIXES_2025-09-29.md) - GraphQL to REST API migration
- [WORDPRESS_BLOG_SPECS.md](./WORDPRESS_BLOG_SPECS.md) - WordPress integration specifications
- [WORDPRESS_PHASE2_COMPLETION.md](./WORDPRESS_PHASE2_COMPLETION.md) - Infrastructure completion report
- [nginx-wordpress-blog.conf](./nginx-wordpress-blog.conf) - Nginx proxy configuration

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-09-29 | Initial documentation after emergency fix |

---

**Maintained by**: Saraiva Vision Development Team
**Last Verified**: 2025-09-29 18:37 UTC
**Production Status**: ✅ Verified and operational