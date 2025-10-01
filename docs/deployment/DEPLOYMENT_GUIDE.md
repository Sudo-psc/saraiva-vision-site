# Saraiva Vision - Deployment Guide

**Comprehensive deployment documentation for the Saraiva Vision VPS native architecture.**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Deploy](#quick-deploy)
3. [Full Deployment Process](#full-deployment-process)
4. [Build Commands](#build-commands)
5. [Nginx Configuration](#nginx-configuration)
6. [VPS Setup](#vps-setup)
7. [Testing and Verification](#testing-and-verification)
8. [Monitoring](#monitoring)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Current Architecture (VPS Native - Simplified)

```
User Request → Nginx → Static Files (React SPA) → Client-side Rendering
                ↓
            Node.js API (minimal endpoints)
                ↓
            Redis (cache only)
```

### Key Components

- **Frontend**: React 18 SPA (static files served by Nginx)
- **Backend**: Node.js API (systemd service) - minimal endpoints
- **Blog**: 100% static (data in `src/data/blogPosts.js`)
- **Cache**: Redis (Google Reviews cache only)
- **Web Server**: Nginx (static files + API proxy)

### What Was Removed

- ❌ WordPress (completely removed)
- ❌ MySQL (no longer needed)
- ❌ Supabase (completely removed)
- ❌ PHP-FPM (not required)
- ❌ External CMS dependencies

---

## Quick Deploy

### For 90% of Use Cases

```bash
npm run deploy:quick
```

**What it does:**
- Builds the application
- Deploys to `/var/www/html/`
- Reloads Nginx
- ~20 seconds total time

### When to Use Quick Deploy

- ✅ Content updates (HTML/JS/CSS)
- ✅ Adding blog posts
- ✅ Changing images
- ✅ Small bug fixes
- ✅ Style updates

### When NOT to Use Quick Deploy

- ❌ Nginx configuration changes
- ❌ Major architectural changes
- ❌ Database migrations
- ❌ Security updates

---

## Full Deployment Process

### Option 1: Automated Script (Recommended)

```bash
cd /home/saraiva-vision-site
bash scripts/deploy-production.sh
```

**Script actions:**
1. Creates automatic backup (Nginx + files)
2. Tests Nginx configuration
3. Deploys files to `/var/www/html/`
4. Adjusts permissions (`www-data:www-data`)
5. Reloads Nginx (zero downtime)
6. Verifies deployment

### Option 2: Manual Step-by-Step

#### Step 1: Navigate to Project

```bash
cd /home/saraiva-vision-site
```

#### Step 2: Create Backup (Safety First)

```bash
# Backup Nginx config
sudo cp /etc/nginx/sites-available/saraivavision \
       /etc/nginx/sites-available/saraivavision.backup.$(date +%Y%m%d_%H%M%S)

# Backup website files
sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d_%H%M%S)

# Verify backups created
ls -lh /etc/nginx/sites-available/saraivavision.backup.*
ls -lhd /var/www/html.backup.*
```

#### Step 3: Build Application (if not already built)

```bash
npm run build
```

**Expected output:**
- Build completes in ~10-15 seconds
- Output directory: `dist/` (~168MB uncompressed)
- Check for warnings (dynamic imports are non-critical)

#### Step 4: Deploy Website Files

```bash
# Remove old files
sudo rm -rf /var/www/html/*

# Copy new build
sudo cp -r dist/* /var/www/html/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;
```

#### Step 5: Deploy Nginx Configuration (if changed)

```bash
# Copy configuration
sudo cp nginx-optimized.conf /etc/nginx/sites-available/saraivavision

# Test configuration (CRITICAL - do not skip!)
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### Step 6: Reload Nginx

```bash
# Graceful reload (zero downtime)
sudo systemctl reload nginx

# Verify status
sudo systemctl status nginx
```

---

## Build Commands

### Development

```bash
npm run dev              # Dev server (port 3002)
npm run start            # Alternative dev command
```

### Production Build

```bash
npm run build            # Build for production
```

**Build output:**
- Directory: `dist/`
- Size: ~168MB (uncompressed)
- Time: ~10-15 seconds
- Modules: 2746 transformed
- Chunks: ~40 files

### Testing

```bash
npm test                      # Run tests in watch mode
npm run test:run              # Execute all tests
npm run test:coverage         # Coverage report
npm run test:comprehensive    # Comprehensive test suite
```

### Image Optimization

```bash
npm run optimize:images       # Optimize images in public/Blog/
```

---

## Nginx Configuration

### Current Configuration

**File**: `/etc/nginx/sites-available/saraivavision`

**Key sections:**

#### 1. Static File Serving

```nginx
location / {
    limit_req zone=main_limit burst=20 nodelay;
    try_files $uri $uri/ /index.html;  # SPA fallback
}
```

#### 2. Static Assets with Caching

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    access_log off;
    gzip_static on;
    try_files $uri =404;
}
```

#### 3. Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### Blog Route Configuration

**No special configuration needed!** The blog is served via the SPA fallback:

```
/blog → try_files → /index.html → React Router → BlogPage component
```

### Testing Nginx Configuration

```bash
# Test syntax
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx (if needed)
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

## VPS Setup

### Initial VPS Configuration

**Prerequisites:**
- Ubuntu/Debian VPS with root access
- Domain pointing to server IP (31.97.129.78)
- SSH connectivity

### Services Running on VPS

```bash
# Check all service status
sudo systemctl status nginx redis

# Individual service checks
sudo systemctl status nginx
sudo systemctl status redis
```

### Directory Structure

```
/var/www/html/                 # Frontend React (static build)
├── index.html                 # SPA entry point
├── assets/                    # JS, CSS, optimized images
└── Blog/                      # Blog images

/home/saraiva-vision-site/     # Project source code
├── dist/                      # Build output
├── src/                       # React source
├── public/                    # Static assets
├── docs/                      # Documentation
└── scripts/                   # Deployment scripts

/etc/nginx/                    # Nginx configuration
├── sites-available/saraivavision
└── sites-enabled/saraivavision

/var/backups/saraiva-vision/   # Automatic backups
├── saraiva-vision-20251001_*.tar.gz
└── ...
```

---

## Testing and Verification

### Immediate Verification (0-5 minutes)

#### 1. Nginx Status

```bash
sudo systemctl status nginx
# Expected: active (running)
```

#### 2. Main Site

```bash
curl -I https://saraivavision.com.br
# Expected: HTTP/2 200
```

#### 3. Blog Route

```bash
curl -I https://saraivavision.com.br/blog
# Expected: HTTP/2 200
# Content-Type: text/html
```

#### 4. Static Assets

```bash
curl -I https://saraivavision.com.br/assets/index-*.js
# Expected: HTTP/2 200
# Cache-Control: public, immutable
```

#### 5. SSL Certificate

```bash
echo | openssl s_client -connect saraivavision.com.br:443 -servername saraivavision.com.br 2>/dev/null | openssl x509 -noout -dates
# Expected: Valid certificate dates
```

### Short-Term Verification (30 min - 24h)

- ✅ Zero errors in Nginx logs
- ✅ Blog page loads correctly
- ✅ No performance degradation
- ✅ No increase in 404/500 errors

### Performance Metrics

**Expected values:**
- **TTFB**: < 200ms
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

**Check performance:**

```bash
curl -w "@-" -o /dev/null -s https://saraivavision.com.br/blog <<'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
EOF
```

---

## Monitoring

### Real-time Log Monitoring

#### Nginx Access Logs

```bash
# All requests
sudo tail -f /var/log/nginx/saraivavision_access.log

# Blog-specific requests
sudo tail -f /var/log/nginx/saraivavision_access.log | grep /blog
```

#### Nginx Error Logs

```bash
# All errors
sudo tail -f /var/log/nginx/saraivavision_error.log

# Filter for specific issues
sudo tail -f /var/log/nginx/saraivavision_error.log | grep -i "error\|cors\|wordpress"
```

#### Service Logs

```bash
# Nginx service journal
sudo journalctl -u nginx -f

# All system logs
sudo journalctl -f
```

### System Monitoring

#### Resource Usage

```bash
# CPU and memory
htop

# Disk usage
df -h

# Network connections
sudo netstat -tulnp

# Process monitoring
ps aux | grep -E "nginx|node|redis"
```

#### Service Health

```bash
# All service status
sudo systemctl status nginx redis

# Individual service status
sudo systemctl status nginx
sudo systemctl status redis
```

---

## Rollback Procedures

### Quick Rollback (If Issues Occur)

```bash
# 1. Find latest backup
LATEST_NGINX=$(ls -t /etc/nginx/sites-available/saraivavision.backup.* | head -1)
LATEST_HTML=$(ls -td /var/www/html.backup.* | head -1)

# 2. Restore Nginx configuration
sudo cp "$LATEST_NGINX" /etc/nginx/sites-available/saraivavision
sudo nginx -t && sudo systemctl reload nginx

# 3. Restore website files
sudo rm -rf /var/www/html/*
sudo cp -r "$LATEST_HTML"/* /var/www/html/

# 4. Fix permissions
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;

# 5. Verify
curl -I https://saraivavision.com.br
```

### Manual Rollback

```bash
# Restore from specific backup date
sudo cp /etc/nginx/sites-available/saraivavision.backup.20251001_120000 \
       /etc/nginx/sites-available/saraivavision

sudo nginx -t && sudo systemctl reload nginx

sudo rm -rf /var/www/html/*
sudo cp -r /var/www/html.backup.20251001_120000/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Site Not Loading (Nginx)

**Symptoms:**
- 502 Bad Gateway
- 503 Service Unavailable
- Nginx won't start

**Solution:**

```bash
# Check configuration syntax
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Check service status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

#### Issue 2: Blog Shows Blank Page

**Symptoms:**
- `/blog` route shows blank page
- Console errors in browser

**Solution:**

```bash
# Verify build output includes blog components
ls -lh /var/www/html/assets/*.js

# Check for BlogPage chunk
ls -lh /var/www/html/assets/BlogPage-*.js

# Verify index.html exists
cat /var/www/html/index.html

# Rebuild if necessary
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

#### Issue 3: Static Assets Not Loading (404)

**Symptoms:**
- Images/CSS/JS return 404
- Assets have incorrect paths

**Solution:**

```bash
# Verify assets directory exists
ls -lh /var/www/html/assets/

# Check file permissions
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type f -exec chmod 644 {} \;

# Check Nginx error log
sudo tail -f /var/log/nginx/saraivavision_error.log
```

#### Issue 4: 404 Not Found on /blog

**Symptoms:**
- `/blog` returns 404
- SPA routing not working

**Solution:**

```bash
# Verify SPA fallback in Nginx config
sudo grep -A 5 "location / {" /etc/nginx/sites-available/saraivavision

# Should include: try_files $uri $uri/ /index.html;

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

#### Issue 5: Cache Issues (Old Content Showing)

**Symptoms:**
- Old content still visible after deploy
- Browser shows cached version

**Solution:**

```bash
# Clear Redis cache
redis-cli FLUSHALL

# Force browser hard refresh (Ctrl+Shift+R)
# Or clear browser cache

# Verify cache headers
curl -I https://saraivavision.com.br/assets/index-*.js
# Should show: Cache-Control: public, immutable
```

#### Issue 6: Permission Denied Errors

**Symptoms:**
- Nginx can't read files
- 403 Forbidden errors

**Solution:**

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/html

# Fix directory permissions
sudo find /var/www/html -type d -exec chmod 755 {} \;

# Fix file permissions
sudo find /var/www/html -type f -exec chmod 644 {} \;

# Restart Nginx
sudo systemctl restart nginx
```

#### Issue 7: SSL Certificate Issues

**Symptoms:**
- SSL warnings in browser
- Certificate expired

**Solution:**

```bash
# Check certificate status
echo | openssl s_client -connect saraivavision.com.br:443 2>/dev/null | openssl x509 -noout -dates

# Renew certificate
sudo certbot renew

# Test renewal (dry run)
sudo certbot renew --dry-run

# Reload Nginx after renewal
sudo systemctl reload nginx
```

### Debug Commands

```bash
# Check Nginx configuration file
sudo nginx -T

# List all backups
ls -lht /var/www/html.backup.*
ls -lht /etc/nginx/sites-available/saraivavision.backup.*

# Check disk space
df -h /var/www/

# Check open files
sudo lsof -i :80
sudo lsof -i :443

# Network connectivity
ping -c 3 saraivavision.com.br
curl -v https://saraivavision.com.br
```

---

## Success Criteria

### Deployment Success Checklist

- [ ] Build completed without errors
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Files deployed to `/var/www/html/`
- [ ] Permissions set correctly (`www-data:www-data`)
- [ ] Nginx reloaded successfully
- [ ] Main site loads (HTTP 200)
- [ ] Blog route loads (HTTP 200)
- [ ] Static assets load correctly
- [ ] SSL certificate valid
- [ ] No errors in Nginx logs (first 5 minutes)
- [ ] Performance within acceptable range

### Post-Deployment Monitoring

**First 30 minutes:**
- Monitor Nginx error logs
- Check access logs for unusual patterns
- Verify blog functionality
- Test on multiple browsers/devices

**First 24 hours:**
- Monitor error rates
- Check performance metrics
- Verify uptime
- Review user feedback (if applicable)

---

## Additional Resources

### Documentation Files

- **Main Project Docs**: `/home/saraiva-vision-site/CLAUDE.md`
- **Troubleshooting**: `/home/saraiva-vision-site/TROUBLESHOOTING.md`
- **Security**: `/home/saraiva-vision-site/SECURITY.md`
- **README**: `/home/saraiva-vision-site/README.md`

### External Links

- Production Site: https://saraivavision.com.br
- Blog Route: https://saraivavision.com.br/blog
- VPS IP: 31.97.129.78

### Contact Information

- **Nginx Config**: `/etc/nginx/sites-available/saraivavision`
- **Web Root**: `/var/www/html`
- **Project Root**: `/home/saraiva-vision-site`

---

## Deployment Workflow Summary

### Standard Deployment Workflow

1. **Develop locally** → `npm run dev`
2. **Test locally** → `npm test`
3. **Build** → `npm run build`
4. **Backup** → Automatic via script or manual
5. **Deploy** → `npm run deploy:quick` or `bash scripts/deploy-production.sh`
6. **Verify** → Test URLs and check logs
7. **Monitor** → Watch logs for 30 minutes

### Emergency Workflow

1. **Issue detected** → Check logs
2. **Identify cause** → Troubleshooting section
3. **Rollback if needed** → Use backup restoration
4. **Fix issue** → Apply solution
5. **Redeploy** → Follow standard workflow
6. **Verify fix** → Extensive testing

---

**Last Updated**: 2025-10-01
**Architecture**: VPS Native (Simplified)
**Status**: Production Active

---

**Note**: This guide consolidates information from 8 previous deployment documents. All unique and critical information has been preserved. For historical reference, see `/home/saraiva-vision-site/docs/deployment/archive/`.
