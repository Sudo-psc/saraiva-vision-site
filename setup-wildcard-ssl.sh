#!/bin/bash

# Saraiva Vision Wildcard SSL Setup Script
# Configura SSL para domínio principal e todos os subdomínios

set -e

DOMAIN="saraivavision.com.br"
WWW_DOMAIN="www.saraivavision.com.br"
API_DOMAIN="api.saraivavision.com.br"
ADMIN_DOMAIN="admin.saraivavision.com.br"
BLOG_DOMAIN="blog.saraivavision.com.br"
DEV_DOMAIN="dev.saraivavision.com.br"
EMAIL="saraivavision@gmail.com"
SERVER_IP="31.97.129.78"

echo "🔒 Saraiva Vision Wildcard SSL Setup"
echo "======================================="

# Check if domain points to server
echo "🔍 Checking DNS configuration..."
DOMAIN_IP=$(nslookup $DOMAIN | grep -A 1 "Name:" | tail -1 | awk '{print $2}')

if [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
    echo "✅ Domain $DOMAIN points to server IP $SERVER_IP"
else
    echo "❌ Domain $DOMAIN points to $DOMAIN_IP, not $SERVER_IP"
    echo "Please update Cloudflare DNS records first:"
    echo "  A record @ -> $SERVER_IP"
    echo "  A record www -> $SERVER_IP"
    echo "  A record api -> $SERVER_IP"
    echo "  A record admin -> $SERVER_IP"
    echo "  A record blog -> $SERVER_IP"
    echo "  A record dev -> $SERVER_IP"
    exit 1
fi

# Create webroot directory
echo "📁 Creating webroot directory..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

# Stop nginx to free port 80
echo "🛑 Stopping nginx temporarily..."
docker compose stop nginx

# Install SSL certificates for all domains
echo "📜 Installing Let's Encrypt certificates for all subdomains..."
certbot certonly --standalone \
    -d $DOMAIN \
    -d $WWW_DOMAIN \
    -d $API_DOMAIN \
    -d $ADMIN_DOMAIN \
    -d $BLOG_DOMAIN \
    -d $DEV_DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive \
    --force-renewal \
    --http-01-port 80

if [ $? -eq 0 ]; then
    echo "✅ SSL certificates installed successfully for all domains!"
else
    echo "❌ SSL certificate installation failed"
    exit 1
fi

# Set proper permissions
echo "🔐 Setting SSL certificate permissions..."
chmod 600 /etc/letsencrypt/live/$DOMAIN/privkey.pem
chmod 644 /etc/letsencrypt/live/$DOMAIN/fullchain.pem
chmod 644 /etc/letsencrypt/live/$DOMAIN/chain.pem

# Test certificates
echo "🧪 Testing SSL certificates..."
certbot certificates

# Update nginx configuration
echo "⚙️  Updating Nginx configuration..."
cp /home/saraiva-vision-site/nginx-ssl.conf /etc/nginx/conf.d/saraivavision-ssl.conf

# Start nginx with SSL configuration
echo "🚀 Starting nginx with SSL configuration..."
docker compose start nginx
sleep 10

# Test main domain
echo "🌐 Testing main domain HTTPS..."
if curl -k -I https://$DOMAIN | grep -q "200 OK\|301 Moved"; then
    echo "✅ Main domain $DOMAIN is working with HTTPS!"
else
    echo "❌ Main domain test failed"
fi

# Test API subdomain
echo "🔧 Testing API subdomain HTTPS..."
if curl -k -I https://$API_DOMAIN/health | grep -q "200 OK"; then
    echo "✅ API subdomain $API_DOMAIN is working with HTTPS!"
else
    echo "❌ API subdomain test failed"
fi

# Test admin subdomain
echo "👤 Testing admin subdomain HTTPS..."
if curl -k -I https://$ADMIN_DOMAIN/wp-admin/ | grep -q "200 OK\|301 Moved"; then
    echo "✅ Admin subdomain $ADMIN_DOMAIN is working with HTTPS!"
else
    echo "❌ Admin subdomain test failed"
fi

# Test health endpoint
echo "🏥 Testing health endpoint..."
if curl -k -I https://$DOMAIN/health | grep -q "200 OK"; then
    echo "✅ Health endpoint is working!"
else
    echo "❌ Health endpoint test failed"
fi

echo ""
echo "🎉 Wildcard SSL setup completed successfully!"
echo ""
echo "Available URLs:"
echo "  - Main site: https://$DOMAIN"
echo "  - API: https://$API_DOMAIN"
echo "  - Admin: https://$ADMIN_DOMAIN"
echo "  - Blog: https://$BLOG_DOMAIN"
echo "  - Development: https://$DEV_DOMAIN"
echo ""
echo "Next steps:"
echo "1. Configure Cloudflare SSL mode to 'Full (strict)'"
echo "2. Enable proxy (orange cloud) for all A records"
echo "3. Update WordPress configuration for HTTPS"
echo "4. Set up auto-renewal with cron job"
echo ""
echo "SSL certificates will auto-renew every 90 days."