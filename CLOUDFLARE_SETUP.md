# Cloudflare DNS Configuration Guide

## Current Status
- Domain: saraivavision.com.br
- Current DNS: Points to Cloudflare proxy
- Server IP: 31.97.129.78
- Issue: Let's Encrypt challenge fails due to 521 errors

## Required Actions in Cloudflare

### Step 1: Update DNS Records
1. Log in to your Cloudflare dashboard
2. Select saraivavision.com.br domain
3. Update DNS records:

**A Records:**
- Type: A
- Name: @ (root)
- Content: 31.97.129.78
- TTL: Auto
- Proxy status: DNS only (orange cloud OFF) - temporarily

**A Records:**
- Type: A
- Name: www
- Content: 31.97.129.78
- TTL: Auto
- Proxy status: DNS only (orange cloud OFF) - temporarily

### Step 2: After SSL Certificate Installation
Once SSL certificates are installed, you can:
1. Enable Cloudflare proxy (orange cloud ON)
2. Set SSL/TLS encryption mode to "Full (strict)"
3. Configure Cloudflare settings below

## Current Server Configuration

### Nginx Configuration (Updated for Cloudflare)
- SSL certificates: /etc/letsencrypt/live/saraivavision.com.br/
- HTTP to HTTPS redirects
- Cloudflare-compatible headers
- Proper security settings

### Services Status
- Frontend: Running on port 3002
- API: Running on port 3001
- Nginx: Configured for SSL
- All services: Healthy

## Next Steps
1. Update Cloudflare DNS as above
2. Wait for DNS propagation (5-10 minutes)
3. Run SSL certificate installation
4. Test SSL configuration
5. Enable Cloudflare proxy with Full SSL mode

## Verification Commands
```bash
# Check DNS propagation
nslookup saraivavision.com.br

# Test HTTP access
curl -I http://saraivavision.com.br

# Install SSL certificates
certbot certonly --webroot -w /var/www/certbot -d saraivavision.com.br -d www.saraivavision.com.br
```

## Cloudflare Recommended Settings

### SSL/TLS
- Mode: Full (strict)
- HSTS: Enable
- Opportunistic Encryption: On
- TLS 1.3: Enable

### Security Headers
- Security Level: Medium
- WAF: Enable
- Bot Fight Mode: Enable

### Performance
- Auto Minify: CSS, JS, HTML
- Brotli: Enable
- HTTP/2: Enable
- Caching Level: Standard