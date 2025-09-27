# SERVER ADMINISTRATOR INSTRUCTIONS - Saraiva Vision WordPress GraphQL Integration

## 🚨 CRITICAL - Immediate Action Required

The WordPress GraphQL integration is **READY FOR PRODUCTION** but requires **SERVER-SIDE FIXES** to function properly. The frontend and backend code is complete and tested.

## ⚡ Quick Summary

### What's Been Implemented ✅
- **Frontend**: Enhanced WordPress GraphQL client with proxy fallback and error handling
- **Backend**: Express.js API server with WordPress GraphQL proxy
- **Testing**: Comprehensive diagnostic and integration test suite
- **Documentation**: Complete deployment guides and troubleshooting

### What Needs Server-Side Fixing ❌
1. **SSL Certificate Renewal** (WordPress server)
2. **WPGraphQL Plugin Installation** (WordPress admin)
3. **CORS Configuration** (Nginx/WordPress)

## 🎯 Server-Side Tasks (Estimated Time: 1-2 hours)

### Task 1: SSL Certificate Renewal (CRITICAL)

#### Problem
- WordPress server at `cms.saraivavision.com.br` has invalid SSL certificate
- SSL error: `tlsv1 alert internal error`
- Prevents all HTTPS connections to WordPress GraphQL endpoint

#### Solution
```bash
# 1. SSH to WordPress server
ssh root@31.97.129.78

# 2. Renew SSL certificate with Let's Encrypt
certbot --nginx -d cms.saraivavision.com.br

# 3. Reload Nginx to apply changes
systemctl reload nginx

# 4. Test SSL certificate
openssl s_client -connect cms.saraivavision.com.br:443

# 5. Verify WordPress GraphQL endpoint accessibility
curl -I https://cms.saraivavision.com.br/graphql
```

#### Expected Result
- SSL certificate should be valid and trusted
- WordPress GraphQL endpoint should be accessible via HTTPS
- No more SSL protocol errors

### Task 2: WPGraphQL Plugin Installation (CRITICAL)

#### Problem
- WordPress does not have WPGraphQL plugin installed
- GraphQL endpoint returns 404 or HTML error page
- Frontend cannot fetch blog categories and posts

#### Solution
1. **Access WordPress Admin Panel**
   ```
   URL: https://cms.saraivavision.com.br/wp-admin
   Username: [WordPress admin username]
   Password: [WordPress admin password]
   ```

2. **Install WPGraphQL Plugin**
   - Go to **Plugins** → **Add New**
   - Search for **"WPGraphQL"**
   - Click **Install Now** on the plugin by WPGraphQL
   - Click **Activate** after installation

3. **Verify Installation**
   - Visit `https://cms.saraivavision.com.br/graphql`
   - Should see GraphQL IDE interface (not 404 error)
   - Should be able to run test GraphQL queries

#### Test GraphQL Query
```graphql
query TestQuery {
  generalSettings {
    title
    url
    description
  }
}
```

#### Expected Result
- GraphQL endpoint should return JSON responses
- Blog categories and posts should be accessible via GraphQL
- Frontend should be able to fetch WordPress content

### Task 3: CORS Configuration (HIGH PRIORITY)

#### Problem
- WordPress server not configured for cross-origin requests
- Frontend cannot access WordPress GraphQL API from different domain
- Browser blocks requests due to CORS policy

#### Solution - Nginx Configuration

Edit WordPress Nginx configuration file:
```bash
# Edit Nginx configuration
nano /etc/nginx/sites-available/cms.saraivavision.com.br
```

Add CORS headers to server block:
```nginx
server {
    listen 443 ssl;
    server_name cms.saraivavision.com.br;

    # SSL configuration (existing)
    ssl_certificate /etc/letsencrypt/live/cms.saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.saraivavision.com.br/privkey.pem;

    # Add CORS headers
    location /graphql {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Max-Age' 86400 always;
            add_header 'Content-Type' 'text/plain charset=UTF-8' always;
            add_header 'Content-Length' 0 always;
            return 204;
        }

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

        # Existing WordPress/GraphQL configuration
        try_files $uri $uri/ /index.php?$args;
    }

    # Existing configuration...
}
```

Reload Nginx after changes:
```bash
# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

#### Alternative: WordPress CORS Plugin
If Nginx configuration is not accessible, install a WordPress CORS plugin:
1. Go to **Plugins** → **Add New**
2. Search for **"CORS"**
3. Install and activate a CORS plugin
4. Configure to allow requests from `saraivavision.com.br`

## 🚀 Deployment After Server Fixes

### Step 1: Deploy Frontend Files
```bash
# Copy frontend build to web server
sudo cp -r deployment-final/dist/* /var/www/html/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### Step 2: Deploy API Server
```bash
# Copy API files to production location
sudo cp -r deployment-final/api/ /opt/saraiva-vision/api/

# Install dependencies
cd /opt/saraiva-vision/api
npm install --production

# Start/restart API service
sudo systemctl restart saraiva-api
```

### Step 3: Verify Deployment
```bash
# Test API health
curl http://localhost:3001/health

# Test WordPress proxy
curl -X POST http://localhost:3001/api/wordpress-graphql/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { generalSettings { title } }"}'

# Run diagnostic tests
node deployment-final/test-wordpress-graphql.cjs
```

## 🔍 Post-Deployment Testing

### Test Blog Functionality
1. Visit `https://saraivavision.com.br/blog`
2. Verify blog categories load
3. Verify blog posts load
4. Test individual blog post pages

### Check Browser Console
- Open browser developer tools
- Look for any JavaScript errors
- Verify no SSL or CORS errors
- Check that WordPress GraphQL requests succeed

### Monitor Server Logs
```bash
# API server logs
sudo journalctl -u saraiva-api -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 📞 Troubleshooting

### Common Issues

#### SSL Certificate Problems
**Symptoms**: `ERR_SSL_PROTOCOL_ERROR`, SSL handshake failures
**Solution**: Renew SSL certificate with Let's Encrypt

#### WPGraphQL Not Found
**Symptoms**: 404 errors on `/graphql` endpoint
**Solution**: Install and activate WPGraphQL plugin

#### CORS Errors
**Symptoms**: `Access-Control-Allow-Origin` header missing
**Solution**: Configure CORS headers in Nginx or WordPress

#### API Server Issues
**Symptoms**: API endpoints returning 502 errors
**Solution**: Check Node.js service status and restart if needed

### Emergency Rollback
If issues occur after deployment:
```bash
# Restore previous version (if available)
git checkout <previous-commit-hash>
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

## 🎯 Success Criteria

### After Implementation
- ✅ Blog page loads categories and posts correctly
- ✅ No SSL or CORS errors in browser console
- ✅ WordPress GraphQL queries return valid JSON responses
- ✅ Frontend gracefully handles WordPress unavailability
- ✅ Performance monitoring and error tracking active

### Before Implementation
- ❌ Blog page shows loading errors or empty content
- ❌ Browser console shows SSL/CORS errors
- ❌ WordPress GraphQL queries fail
- ❌ Poor user experience with broken functionality

---

**PRIORITY**: HIGH - This is critical functionality for the website
**EFFORT**: 1-2 hours for server administrator
**IMPACT**: Restores blog functionality and improves user experience
**RISK**: LOW - Implementation is straightforward with clear instructions

**Please complete the server-side tasks as soon as possible to restore full blog functionality.**

---
*Generated: $(date)*
*Contact development team if you encounter any issues with these instructions.*