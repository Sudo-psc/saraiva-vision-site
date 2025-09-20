# Cloudflare Configuration Guide for Saraiva Vision

## Overview
This guide provides step-by-step instructions for configuring Cloudflare with your Saraiva Vision website to ensure optimal performance, security, and SSL compatibility.

## Current Status
- **Domain**: saraivavision.com.br
- **Server IP**: 31.97.129.78
- **SSL**: Ready for Let's Encrypt installation
- **Configuration**: Cloudflare-optimized Nginx setup completed

## Phase 1: DNS Configuration (Temporary - for SSL Setup)

### Step 1: Update DNS Records
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain: `saraivavision.com.br`
3. Navigate to DNS → Records
4. Update the following records:

**Root Domain (@):**
- Type: `A`
- Name: `@`
- Content: `31.97.129.78`
- TTL: `Auto`
- Proxy status: `DNS only` (⚫️ gray cloud - OFF)

**WWW Subdomain:**
- Type: `A`
- Name: `www`
- Content: `31.97.129.78`
- TTL: `Auto`
- Proxy status: `DNS only` (⚫️ gray cloud - OFF)

### Step 2: Wait for DNS Propagation
After updating DNS records, wait 5-10 minutes for propagation. You can verify with:
```bash
nslookup saraivavision.com.br
nslookup www.saraivavision.com.br
```

Both should return `31.97.129.78`.

### Step 3: Install SSL Certificates
Once DNS is updated, run the SSL setup script:
```bash
cd /home/saraiva-vision-site
./setup-cloudflare-ssl.sh
```

## Phase 2: SSL/TLS Configuration

### Step 1: Set SSL/TLS Encryption Mode
1. Navigate to SSL/TLS → Overview
2. Select **Full (strict)** mode
3. This ensures end-to-end encryption with your valid SSL certificate

### Step 2: Enable HSTS
1. Navigate to SSL/TLS → Edge Certificates
2. Enable HTTP Strict Transport Security (HSTS)
3. Recommended settings:
   - Max Age: 12 months
   - Include subdomains: Yes
   - Preload: Yes

### Step 3: Configure Additional SSL Settings
1. **Opportunistic Encryption**: Enable
2. **TLS 1.3**: Enable
3. **Minimum TLS Version**: TLS 1.2
4. **Automatic HTTPS Rewrites**: Enable

## Phase 3: Enable Cloudflare Proxy

### Step 1: Enable Proxy for DNS Records
Once SSL certificates are installed and working:
1. Navigate to DNS → Records
2. Update both A records:
   - Proxy status: `Proxied` (🟠 orange cloud - ON)

### Step 2: Verify SSL Mode
After enabling proxy, verify SSL mode:
1. Navigate to SSL/TLS → Overview
2. Should show **Full (strict)** mode with a green padlock

## Phase 4: Security Configuration

### Step 1: Security Level
1. Navigate to Security → WAF → Settings
2. Set Security Level: **Medium**
3. This provides good protection without excessive false positives

### Step 2: DDoS Protection
1. Navigate to Security → DDoS
2. Enable DDoS protection (should be enabled by default)
3. Configure HTTP DDoS mitigation if needed

### Step 3: Web Application Firewall (WAF)
1. Navigate to Security → WAF → Rules
2. Enable Cloudflare Managed Ruleset
3. Enable OWASP ModSecurity Core Rule Set
4. Consider enabling WordPress Rules if using WordPress

### Step 4: Bot Fight Mode
1. Navigate to Security → Bots
2. Enable Bot Fight Mode
3. Configure Bot Management based on your needs

## Phase 5: Performance Optimization

### Step 1: Caching Configuration
1. Navigate to Caching → Configuration
2. Set Caching Level: **Standard**
3. Enable Development mode temporarily if making frequent changes

### Step 2: Auto Minify
1. Navigate to Caching → Optimization
2. Enable Auto Minify for:
   - CSS
   - JavaScript
   - HTML

### Step 3: Brotli Compression
1. Navigate to Caching → Optimization
2. Enable Brotli compression for better performance

### Step 4: HTTP/3 (QUIC)
1. Navigate to Network → HTTP/3
2. Enable HTTP/3 with QUIC protocol

### Step 5: Image Optimization
1. Navigate to Images
2. Enable basic image optimization features as needed

## Phase 6: Page Rules

### Recommended Page Rules
1. **Redirect to HTTPS:**
   - URL pattern: `saraivavision.com.br/*`
   - Setting: Always Use HTTPS
   - Priority: 1

2. **Cache Static Assets:**
   - URL pattern: `*.css|*.js|*.jpg|*.jpeg|*.png|*.gif|*.svg|*.woff|*.woff2`
   - Setting: Cache Level: Cache Everything
   - Edge Cache TTL: 1 year
   - Priority: 2

3. **Bypass Cache for Admin:**
   - URL pattern: `saraivavision.com.br/wp-admin/*`
   - Setting: Bypass Cache
   - Priority: 3

## Phase 7: Security Headers

### Cloudflare Managed Headers
Cloudflare automatically handles many security headers. Verify these are enabled:

1. **X-Content-Type-Options**: nosniff
2. **X-Frame-Options**: SAMEORIGIN
3. **X-XSS-Protection**: 1; mode=block
4. **Referrer-Policy**: strict-origin-when-cross-origin
5. **Permissions-Policy**: Configure as needed

### Custom Headers (Server-side)
Your Nginx configuration already includes:
- Strict-Transport-Security
- Content-Security-Policy
- Cross-Origin headers
- Medical website specific headers

## Phase 8: Monitoring and Analytics

### Step 1: Enable Analytics
1. Navigate to Analytics & Reports
2. Enable detailed analytics
3. Set up custom reports as needed

### Step 2: Web Application Firewall Analytics
1. Navigate to Security → WAF → Analytics
2. Monitor blocked requests
3. Adjust rules based on false positives

### Step 3: Performance Analytics
1. Navigate to Analytics → Performance
2. Monitor page load times
3. Identify optimization opportunities

## Phase 9: Maintenance and Monitoring

### SSL Certificate Renewal
Your SSL certificates are configured for automatic renewal. Verify:
```bash
certbot renew --dry-run
```

### Health Checks
Monitor your site health:
```bash
# Check SSL certificate
curl -I https://saraivavision.com.br

# Check API health
curl -I https://saraivavision.com.br/api/health

# Check overall health
curl -I https://saraivavision.com.br/health
```

### Cloudflare Notifications
1. Enable email notifications for important events
2. Monitor downtime alerts
3. Set up billing alerts

## Troubleshooting

### Common Issues

**SSL Certificate Errors:**
- Verify DNS points to correct IP
- Check SSL mode is set to Full (strict)
- Ensure certificates are properly installed

**521 Errors:**
- Server is down or not responding
- Firewall blocking Cloudflare IPs
- Server software issues

**Mixed Content Warnings:**
- Ensure all resources use HTTPS
- Check for hardcoded HTTP URLs
- Use relative URLs where possible

**Cache Issues:**
- Clear Cloudflare cache
- Purge individual files as needed
- Use Development mode for testing

### Emergency Actions

**Disable Cloudflare Proxy:**
1. Navigate to DNS → Records
2. Set proxy status to DNS only (⚫️ gray cloud)
3. This bypasses Cloudflare entirely

**Clear Cloudflare Cache:**
1. Navigate to Caching → Configuration
2. Click "Purge Everything"
3. Or purge individual files

## Final Configuration Checklist

- [ ] DNS records point to server IP
- [ ] SSL certificates installed successfully
- [ ] SSL/TLS mode set to Full (strict)
- [ ] HSTS enabled
- [ ] Cloudflare proxy enabled (orange cloud)
- [ ] Security level set to Medium
- [ ] WAF rules enabled
- [ ] Caching configured
- [ ] Performance optimizations enabled
- [ ] Page rules configured
- [ ] Monitoring and alerts set up
- [ ] Health checks passing

## Support

For Cloudflare-specific issues:
- Cloudflare Community: https://community.cloudflare.com
- Cloudflare Support: https://support.cloudflare.com
- Cloudflare Status: https://www.cloudflarestatus.com

For server configuration issues:
- Check your setup script: `./setup-cloudflare-ssl.sh`
- Verify Nginx configuration
- Check Docker container status

## Next Steps

After completing all configurations:
1. Test all website functionality
2. Monitor performance and security
3. Regular maintenance and updates
4. Stay informed about Cloudflare updates

Your Saraiva Vision website will be fully optimized with Cloudflare's global CDN, security features, and performance optimizations.