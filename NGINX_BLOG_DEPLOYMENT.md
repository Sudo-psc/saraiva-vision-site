# Nginx Blog Deployment Documentation

**Static Blog Integration for Saraiva Vision**

## Overview

The blog is a **static, integrated component** of the React SPA, not a separate WordPress or CMS instance. Blog posts are stored as static data in `src/data/blogPosts.js` and rendered client-side by React Router.

**Key Points**:
- No external CMS or WordPress integration for the blog
- No separate Nginx configuration required beyond existing SPA fallback
- Blog routes handled entirely by React Router
- Static data bundled with the application

---

## Current Architecture

### Blog Data Source
```javascript
// src/data/blogPosts.js
export const blogPosts = [
  {
    id: 1,
    slug: 'exemplo-post',
    title: 'Título do Post',
    excerpt: 'Resumo do post...',
    content: 'Conteúdo completo em HTML...',
    date: '2025-01-15',
    category: 'Saúde Ocular',
    // ... more fields
  }
];
```

### React Router Configuration
```javascript
// src/App.jsx
<Route path="/blog" element={<BlogPage />} />
<Route path="/blog/:slug" element={<Navigate to="/blog" replace />} />
```

### Components
- `src/pages/BlogPage.jsx` - Blog listing and individual post display
- `src/data/blogPosts.js` - Static blog post data

---

## Existing Nginx Configuration

The blog is **already working** with the existing Nginx configuration. No changes are required.

### Relevant Configuration (from nginx-optimized.conf)

```nginx
# React Router - SPA fallback (line 264-271)
location / {
    limit_req zone=main_limit burst=20 nodelay;

    # Try to serve request as file, then as directory, then fall back to index.html
    try_files $uri $uri/ /index.html;
}
```

This SPA fallback automatically handles:
- `/blog` → serves index.html → React Router loads BlogPage
- `/blog/some-post` → serves index.html → React Router redirects to `/blog`

### Static Assets (already configured)

```nginx
# Static assets with aggressive caching (line 133-144)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    access_log off;
    gzip_static on;
    try_files $uri =404;
}
```

---

## Verification Steps

### 1. Test Blog Route (Production)

```bash
# Test main blog page
curl -I https://saraivavision.com.br/blog

# Expected Response:
# HTTP/2 200
# Content-Type: text/html
# (should serve index.html)
```

### 2. Test Static Assets

```bash
# Test blog images (if any in /assets/)
curl -I https://saraivavision.com.br/assets/blog-image.jpg

# Expected Response:
# HTTP/2 200
# Cache-Control: public, immutable
# Expires: (1 year from now)
```

### 3. Test React Router Handling

```bash
# Test blog post route (should redirect to /blog)
curl -L https://saraivavision.com.br/blog/exemplo-post

# Expected: Redirect to /blog or serve index.html
```

### 4. Verify Nginx Configuration Syntax

```bash
# Test nginx configuration syntax
sudo nginx -t

# Expected Output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 5. Check Active Configuration

```bash
# View active nginx configuration
sudo cat /etc/nginx/sites-enabled/saraivavision

# Verify that the SPA fallback location / block exists
```

---

## Deployment Process (If Changes Needed)

### Step 1: Backup Current Configuration

```bash
# Backup existing nginx config
sudo cp /etc/nginx/sites-available/saraivavision \
       /etc/nginx/sites-available/saraivavision.backup.$(date +%Y%m%d)

# Verify backup created
ls -lh /etc/nginx/sites-available/saraivavision.backup.*
```

### Step 2: Update Configuration (If Required)

```bash
# Edit nginx configuration
sudo nano /etc/nginx/sites-available/saraivavision

# Add any blog-specific configuration (if needed)
# Note: Current configuration already supports blog routes
```

### Step 3: Test Configuration

```bash
# Test nginx syntax
sudo nginx -t

# Expected Output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4: Reload Nginx

```bash
# Reload nginx (zero downtime)
sudo systemctl reload nginx

# Or restart if major changes
# sudo systemctl restart nginx
```

### Step 5: Verify Service Status

```bash
# Check nginx status
sudo systemctl status nginx

# Expected: active (running)
```

### Step 6: Monitor Logs

```bash
# Monitor nginx error log for issues
sudo tail -f /var/log/nginx/saraivavision_error.log

# Monitor access log for blog requests
sudo tail -f /var/log/nginx/saraivavision_access.log | grep /blog
```

---

## Testing Commands

### Health Check

```bash
# Test nginx health endpoint
curl https://saraivavision.com.br/health

# Expected: healthy
```

### SSL Certificate Verification

```bash
# Verify SSL certificate
echo | openssl s_client -connect saraivavision.com.br:443 -servername saraivavision.com.br 2>/dev/null | openssl x509 -noout -dates

# Expected: Valid certificate dates
```

### Full Site Test

```bash
# Test main site
curl -I https://saraivavision.com.br/

# Test blog
curl -I https://saraivavision.com.br/blog

# Test API
curl -I https://saraivavision.com.br/api/health

# All should return 200 OK
```

---

## Troubleshooting

### Issue: 404 Not Found on /blog

**Cause**: SPA fallback not configured correctly

**Solution**:
```bash
# Verify location / block has try_files with index.html fallback
sudo grep -A 5 "location / {" /etc/nginx/sites-available/saraivavision

# Should include: try_files $uri $uri/ /index.html;
```

### Issue: Blog Shows Blank Page

**Cause**: React application not loaded correctly or JavaScript errors

**Solution**:
```bash
# Check browser console for JavaScript errors
# Verify build output includes blog components:
ls -lh /var/www/html/assets/*.js

# Verify blogPosts.js is bundled correctly
npm run build
```

### Issue: Static Assets Not Loading

**Cause**: Incorrect asset paths or missing files

**Solution**:
```bash
# Verify assets directory exists
ls -lh /var/www/html/assets/

# Check nginx error log for missing files
sudo tail -f /var/log/nginx/saraivavision_error.log
```

### Issue: 502 Bad Gateway on API Calls

**Cause**: Node.js API service down (not related to static blog)

**Solution**:
```bash
# Check API service status
sudo systemctl status saraiva-api

# Restart if needed
sudo systemctl restart saraiva-api
```

### Issue: CSS/JS Not Cached Properly

**Cause**: Cache headers not applied correctly

**Solution**:
```bash
# Verify cache headers in response
curl -I https://saraivavision.com.br/assets/index-abc123.js

# Should include: Cache-Control: public, immutable
# Should include: Expires: (far future date)
```

---

## Performance Optimization

### Current Optimizations (Already Implemented)

1. **Gzip Compression**: Static assets compressed (gzip_static on)
2. **Aggressive Caching**: 1-year cache for immutable assets
3. **Code Splitting**: Blog components lazy-loaded via React.lazy()
4. **Bundle Optimization**: Vite optimizes blog code into separate chunks

### Verify Performance

```bash
# Check gzip compression
curl -H "Accept-Encoding: gzip" -I https://saraivavision.com.br/assets/index-abc123.js

# Should include: Content-Encoding: gzip
```

### Monitor Performance

```bash
# Check page load time
curl -w "@-" -o /dev/null -s https://saraivavision.com.br/blog <<'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
EOF
```

---

## Rollback Procedure

### If Issues Occur After Changes

```bash
# Step 1: Restore previous configuration
sudo cp /etc/nginx/sites-available/saraivavision.backup.YYYYMMDD \
       /etc/nginx/sites-available/saraivavision

# Step 2: Test restored configuration
sudo nginx -t

# Step 3: Reload nginx
sudo systemctl reload nginx

# Step 4: Verify site is working
curl -I https://saraivavision.com.br/blog
```

---

## Security Considerations

### Current Security Headers (Already Applied)

```nginx
# Security headers from existing configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "..." always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

These headers apply to all routes including `/blog`.

### Rate Limiting (Already Configured)

```nginx
# Main site rate limiting
limit_req zone=main_limit burst=20 nodelay;

# Applies to all non-API routes including /blog
```

---

## Monitoring and Logging

### View Blog Access Logs

```bash
# Real-time blog access monitoring
sudo tail -f /var/log/nginx/saraivavision_access.log | grep /blog

# Count blog requests in last hour
sudo grep "/blog" /var/log/nginx/saraivavision_access.log | \
  awk '$4 >= "'$(date -d '1 hour ago' '+%d/%b/%Y:%H:%M:%S')'"' | wc -l
```

### View Error Logs

```bash
# Monitor errors related to blog routes
sudo tail -f /var/log/nginx/saraivavision_error.log | grep blog

# Check for 404s on blog routes
sudo grep "GET /blog" /var/log/nginx/saraivavision_error.log | grep " 404 "
```

---

## Summary

### What's Already Working

- ✅ Blog routes (`/blog`) served via SPA fallback
- ✅ Static assets cached with optimal headers
- ✅ Gzip compression enabled
- ✅ Security headers applied
- ✅ Rate limiting configured
- ✅ SSL/TLS configured with Let's Encrypt

### What's NOT Needed

- ❌ No separate WordPress Nginx configuration
- ❌ No PHP-FPM configuration for blog
- ❌ No database proxy for blog data
- ❌ No external CMS integration
- ❌ No GraphQL endpoint for blog

### Key Takeaway

**The blog is already fully functional with the existing Nginx configuration.** The SPA fallback (`try_files $uri $uri/ /index.html`) handles all blog routes automatically. No additional Nginx configuration changes are required.

---

## Contact Information

- **Production Site**: https://saraivavision.com.br
- **Blog Route**: https://saraivavision.com.br/blog
- **VPS IP**: 31.97.129.78
- **Nginx Config**: /etc/nginx/sites-available/saraivavision
- **Web Root**: /var/www/html

---

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- Project Documentation: `/home/saraiva-vision-site/CLAUDE.md`