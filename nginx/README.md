# PostHog Reverse Proxy Setup

This directory contains the configuration for setting up an NGINX reverse proxy for PostHog Cloud to improve tracking reliability and bypass ad blockers.

## 🎯 Benefits

- **Better Data Collection**: Bypass ad blockers and tracking protection
- **Improved Reliability**: Reduce blocked requests by 60-80%
- **Custom Domain**: Use your own domain for analytics endpoints
- **SSL Security**: Encrypted connections with automatic certificate renewal

## 📁 Files Overview

- `posthog-proxy.conf` - NGINX configuration for PostHog proxy
- `docker-compose.yml` - Docker setup for easy deployment
- `setup-ssl.sh` - Automated SSL certificate setup script
- `README.md` - This documentation

## 🚀 Quick Setup

### 1. Prerequisites

- Docker and Docker Compose installed
- Domain name pointing to your server
- Port 80 and 443 available

### 2. Configure Your Domain

Edit the configuration files and replace `analytics.yourdomain.com` with your actual subdomain:

```bash
# Update nginx configuration
sed -i 's/analytics.yourdomain.com/analytics.yourrealdomain.com/g' posthog-proxy.conf

# Update SSL setup script
sed -i 's/analytics.yourdomain.com/analytics.yourrealdomain.com/g' setup-ssl.sh
sed -i 's/your-email@yourdomain.com/your-real-email@yourrealdomain.com/g' setup-ssl.sh
```

### 3. Set Up SSL Certificates

Run the SSL setup script:

```bash
./setup-ssl.sh
```

This will:
- Install certbot if needed
- Generate Let's Encrypt SSL certificates
- Configure automatic renewal
- Update NGINX configuration with correct paths

### 4. Start the Proxy

```bash
docker-compose up -d
```

### 5. Test the Setup

```bash
# Test health endpoint
curl -I https://analytics.yourrealdomain.com/health

# Test PostHog endpoint
curl -I https://analytics.yourrealdomain.com/decide/
```

### 6. Update Your Application

Update your environment variables:

```bash
# .env
VITE_PUBLIC_POSTHOG_HOST=https://analytics.yourrealdomain.com
```

## 🔧 Configuration Details

### NGINX Configuration Features

- **SSL/TLS**: Modern security with TLS 1.2+ support
- **CORS**: Proper cross-origin headers for web applications
- **Large Payloads**: Supports PostHog events up to 1MB and recordings up to 64MB
- **Caching**: Static assets cached for better performance
- **Security Headers**: HSTS, XSS protection, and content type sniffing prevention
- **Health Checks**: Built-in health endpoint for monitoring

### PostHog Endpoints Proxied

- **Main API**: `https://analytics.yourrealdomain.com/*` → `https://us.i.posthog.com/*`
- **Static Assets**: `https://analytics.yourrealdomain.com/static/*` → `https://us-assets.i.posthog.com/static/*`

## 🔒 Security Best Practices

### Domain Selection
- ✅ Use: `analytics.yoursite.com`, `insights.yoursite.com`, `data.yoursite.com`
- ❌ Avoid: `posthog.yoursite.com`, `tracking.yoursite.com`, `analytics-posthog.yoursite.com`

### Path Selection
- ✅ Use: `/`, `/api/`, `/insights/`, `/data/`
- ❌ Avoid: `/posthog/`, `/tracking/`, `/analytics/`, `/ingest/`

### SSL Configuration
- Automatic certificate renewal via Let's Encrypt
- Modern TLS configuration with secure ciphers
- HSTS headers for enhanced security

## 📊 Monitoring

### Health Checks

The proxy includes a health endpoint:

```bash
curl https://analytics.yourrealdomain.com/health
```

### Logs

View NGINX logs:

```bash
# Access logs
docker-compose logs nginx-posthog-proxy

# Real-time logs
docker-compose logs -f nginx-posthog-proxy
```

### SSL Certificate Status

Check certificate expiration:

```bash
echo | openssl s_client -servername analytics.yourrealdomain.com -connect analytics.yourrealdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

## 🔄 Maintenance

### SSL Renewal

Certificates auto-renew via cron job. Manual renewal:

```bash
./renew-ssl.sh
```

### Update Configuration

After changing `posthog-proxy.conf`:

```bash
docker-compose restart nginx-posthog-proxy
```

### Backup Configuration

```bash
# Backup current setup
tar -czf posthog-proxy-backup-$(date +%Y%m%d).tar.gz *.conf *.yml ssl/
```

## 🐛 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if PostHog endpoints are accessible
   - Verify DNS resolution
   - Check NGINX error logs

2. **SSL Certificate Issues**
   - Ensure domain points to your server
   - Check port 80 is accessible for Let's Encrypt validation
   - Verify certificate files exist and have correct permissions

3. **CORS Errors**
   - Verify your domain is correctly configured in the NGINX config
   - Check browser developer tools for specific CORS errors

### Debug Commands

```bash
# Test DNS resolution
nslookup analytics.yourrealdomain.com

# Test SSL certificate
openssl s_client -connect analytics.yourrealdomain.com:443 -servername analytics.yourrealdomain.com

# Check NGINX configuration
docker-compose exec nginx-posthog-proxy nginx -t

# View detailed logs
docker-compose logs --tail=100 nginx-posthog-proxy
```

## 📈 Performance Optimization

### Caching Strategy
- Static assets cached for 1 day
- API responses not cached (real-time data)
- Stale content served during upstream errors

### Connection Optimization
- HTTP/2 enabled for better performance
- Keep-alive connections for reduced latency
- Proper buffer sizes for large payloads

## 🔗 Integration

After setup, update your PostHog initialization:

```javascript
// Before (direct to PostHog)
posthog.init('your-api-key', {
  api_host: 'https://us.i.posthog.com'
})

// After (via reverse proxy)
posthog.init('your-api-key', {
  api_host: 'https://analytics.yourrealdomain.com',
  ui_host: 'https://us.posthog.com' // Keep UI pointing to PostHog
})
```

## 📞 Support

For issues with this setup:
1. Check the troubleshooting section above
2. Review NGINX and Docker logs
3. Verify DNS and SSL configuration
4. Test endpoints manually with curl

## 📚 Additional Resources

- [PostHog Reverse Proxy Documentation](https://posthog.com/docs/advanced/proxy)
- [NGINX Configuration Guide](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)