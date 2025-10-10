# 🔧 Troubleshooting Guide - Saraiva Vision

## 🚀 Quick Diagnostic

Run the automated diagnostic script to check system health:

```bash
# Run comprehensive health check
./diagnose.sh

# Or run individual checks
curl -f https://saraivavision.com.br/api/health
curl -f https://cms.saraivavision.com.br/graphql
```

## 📊 Common Issues & Solutions

### 502 Bad Gateway Errors

**Symptoms:**
- `/api/*` routes returning 502
- API calls failing in production
- Contact forms not working

**Solutions:**

1. **Check API Health:**
   ```bash
   curl -v https://saraivavision.com.br/api/health
   ```

2. **Verify Environment Variables:**
   ```bash
   # Check Vercel dashboard for these required vars:
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_SUPABASE_SERVICE_ROLE_KEY
   RESEND_API_KEY
   ```

3. **Check API Logs:**
   - Go to Vercel Dashboard → Functions → api/health
   - Check for Supabase connection errors
   - Verify database connectivity

### Google Maps Not Loading

**Symptoms:**
- Maps showing blank or error
- Console errors about Google Maps API

**Solutions:**

1. **Verify API Key:**
   ```bash
   # Check environment variables
   echo $VITE_GOOGLE_MAPS_API_KEY
   echo $VITE_GOOGLE_PLACES_API_KEY
   ```

2. **Check CSP Headers:**
   ```bash
   curl -I https://saraivavision.com.br | grep -i "content-security-policy"
   ```

3. **Validate API Key Restrictions:**
   - Go to Google Cloud Console
   - Ensure domain `saraivavision.com.br` is whitelisted
   - Check API quotas and billing

### PostHog Analytics Not Working

**Symptoms:**
- No analytics data
- Console warnings about PostHog
- Feature flags not loading

**Solutions:**

1. **Check Environment Variables:**
   ```bash
   echo $VITE_POSTHOG_KEY
   echo $VITE_POSTHOG_HOST
   ```

2. **Verify CSP:**
   ```bash
   curl -I https://saraivavision.com.br | grep -i "posthog"
   ```

3. **Check PostHog Dashboard:**
   - Verify project is active
   - Check API key permissions
   - Review event ingestion

### Authentication Issues (INITIAL_SESSION undefined)

**Symptoms:**
- `INITIAL_SESSION undefined` errors
- Auth state not persisting
- Login/logout not working

**Solutions:**

1. **Check Supabase Configuration:**
   ```bash
   # Verify these are set in Vercel:
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```

2. **Test Supabase Connection:**
   ```javascript
   // In browser console:
   import { supabase } from './src/lib/supabase';
   console.log('Supabase client:', supabase);
   ```

3. **Check Auth Context:**
   - Verify AuthProvider is wrapping the app
   - Check for console errors in AuthContext

### Service Worker Cache Issues

**Symptoms:**
- Old content showing after updates
- Assets not loading correctly
- PWA not updating

**Solutions:**

1. **Clear Service Worker Cache:**
   ```javascript
   // In browser console:
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(reg => reg.unregister());
   });
   ```

2. **Force Update:**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   ```

3. **Check Cache Strategy:**
   - HTML: No-cache (always fresh)
   - Assets: 30-day immutable cache
   - Verify skipWaiting is working

### Content Security Policy (CSP) Issues

**Symptoms:**
- Resources blocked by CSP
- Console errors about CSP violations
- External scripts not loading

**Current CSP Configuration:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://maps.googleapis.com
    https://maps.gstatic.com
    https://app.posthog.com
    https://us.i.posthog.com;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' data: https: blob:
    https://maps.googleapis.com
    https://maps.gstatic.com;
  font-src 'self' data: https:;
  connect-src 'self' https: wss:
    https://maps.googleapis.com
    https://maps.gstatic.com
    https://app.posthog.com
    https://us.i.posthog.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
```

**Troubleshooting CSP:**

1. **Check Current Headers:**
   ```bash
   curl -I https://saraivavision.com.br | grep -i "content-security-policy"
   ```

2. **Common CSP Fixes:**
   - Add missing domains to CSP
   - Update nginx/sites-enabled/saraivavision.conf
   - Restart nginx after changes

3. **Test CSP:**
   ```bash
   # Use browser dev tools to check violations
   # Or use online CSP testers
   ```

### WordPress Integration Issues

**Symptoms:**
- CMS content not loading
- GraphQL queries failing
- WordPress admin inaccessible

**Solutions:**

1. **Check WordPress Health:**
   ```bash
   curl -f https://cms.saraivavision.com.br/wp-json/wp/v2/
   ```

2. **Verify GraphQL Endpoint:**
   ```bash
   curl -f https://cms.saraivavision.com.br/graphql
   ```

3. **Check Environment Variables:**
   ```bash
   WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
   WORDPRESS_DOMAIN=https://cms.saraivavision.com.br
   ```

### Performance Issues

**Symptoms:**
- Slow page loads
- High Core Web Vitals scores
- Bundle size too large

**Solutions:**

1. **Check Bundle Size:**
   ```bash
   npm run build
   ls -lh dist/assets/
   ```

2. **Analyze Performance:**
   ```bash
   # Use Lighthouse or WebPageTest
   # Check Vercel analytics
   ```

3. **Optimize Assets:**
   - Enable compression
   - Check image optimization
   - Verify code splitting

## 🐳 Docker Troubleshooting

### Container Health Checks

```bash
# Check all containers
docker ps

# Check unhealthy containers
docker ps --filter "health=unhealthy"

# View container logs
docker logs saraiva-frontend
docker logs saraiva-api
docker logs saraiva-nginx

# Check container health
docker inspect saraiva-api | grep -A 10 "Health"
```

### Network Issues

```bash
# Check network connectivity
docker network ls
docker network inspect saraiva-vision-network

# Test internal connectivity
docker exec saraiva-nginx curl -f http://frontend/health
docker exec saraiva-nginx curl -f http://api:3002/api/health
```

### Upstream Configuration

Verify nginx upstreams match docker-compose ports:

```nginx
# nginx-main.conf upstreams should match:
upstream frontend_upstream { server frontend:80; }
upstream api_upstream { server api:3002; }
upstream wordpress_upstream { server wordpress:80; }
```

## 🔧 Emergency Commands

### Quick Health Check
```bash
# All-in-one health check
./diagnose.sh

# Manual checks
curl -f https://saraivavision.com.br/api/health && echo "✅ API OK"
curl -f https://saraivavision.com.br && echo "✅ Frontend OK"
```

### Force Deploy
```bash
# Force Vercel redeploy
vercel --prod

# Clear all caches
rm -rf .vercel/ dist/ node_modules/.vite/
npm run build
```

### Database Reset
```bash
# If Supabase issues
# Check Supabase dashboard
# Verify connection string
# Reset connection pool if needed
```

## 📞 Support Contacts

- **Primary Contact:** philipe_cruz@outlook.com
- **Emergency:** Check monitoring alerts
- **Documentation:** See CLAUDE.md for detailed commands

## 🔍 Advanced Debugging

### Browser Console Checks
```javascript
// Check Supabase connection
console.log('Supabase:', window.supabase);

// Check PostHog
console.log('PostHog:', window.posthog);

// Check service worker
navigator.serviceWorker.getRegistrations().then(console.log);

// Check auth state
// (Check React DevTools for AuthContext)
```

### Network Analysis
```bash
# Check all network requests
curl -v https://saraivavision.com.br 2>&1 | head -20

# Test API endpoints
curl -X POST https://saraivavision.com.br/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

### Log Analysis
```bash
# Vercel logs
vercel logs

# Check specific function logs
vercel logs --function api/health

# Docker logs
docker-compose logs -f api
```

---

**Last Updated:** September 2025
**Version:** 2.0.1