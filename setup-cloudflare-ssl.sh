#!/bin/bash

# Saraiva Vision SSL Setup Script for Cloudflare
# Run this after updating Cloudflare DNS records

set -e

DOMAIN="saraivavision.com.br"
WWW_DOMAIN="www.saraivavision.com.br"
EMAIL="saraivavision@gmail.com"
SERVER_IP="31.97.129.78"

echo "🔒 Saraiva Vision SSL Setup for Cloudflare"
echo "=========================================="

# Check if domain points to server
echo "🔍 Checking DNS configuration..."
DOMAIN_IP=$(nslookup $DOMAIN | grep -A 1 "Name:" | tail -1 | awk '{print $2}')

if [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
    echo "✅ Domain $DOMAIN points to server IP $SERVER_IP"
else
    echo "❌ Domain $DOMAIN points to $DOMAIN_IP, not $SERVER_IP"
    echo "Please update Cloudflare DNS records first:"
    echo "  A record @ -> $SERVER_IP (DNS only, proxy disabled)"
    echo "  A record www -> $SERVER_IP (DNS only, proxy disabled)"
    exit 1
fi

# Start Nginx for webroot challenge
echo "🚀 Starting Nginx for SSL challenge..."
docker compose start nginx
sleep 5

# Create webroot directory
echo "📁 Creating webroot directory..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

# Install SSL certificates
echo "📜 Installing Let's Encrypt certificates..."
certbot certonly --webroot -w /var/www/certbot \
    -d $DOMAIN \
    -d $WWW_DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive \
    --force-renewal

if [ $? -eq 0 ]; then
    echo "✅ SSL certificates installed successfully!"
else
    echo "❌ SSL certificate installation failed"
    exit 1
fi

# Set proper permissions
echo "🔐 Setting SSL certificate permissions..."
chmod 600 /etc/letsencrypt/live/$DOMAIN/privkey.pem
chmod 644 /etc/letsencrypt/live/$DOMAIN/fullchain.pem
chmod 644 /etc/letsencrypt/live/$DOMAIN/chain.pem

# Update Nginx configuration for Cloudflare
echo "⚙️  Updating Nginx configuration for Cloudflare..."
cat > /home/saraiva-vision-site/nginx-configs/cloudflare.conf << 'EOF'
# Cloudflare-optimized Nginx configuration
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;

    # ACME challenge for SSL certificate renewal
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
        default_type text/plain;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;

    # SSL Configuration - Cloudflare Full SSL mode
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/saraivavision.com.br/chain.pem;

    # SSL Security settings optimized for Cloudflare
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Cloudflare-specific settings
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;
    real_ip_header CF-Connecting-IP;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
    limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 '{"status":"healthy","service":"nginx","timestamp":"healthy","version":"1.0.0","environment":"production"}';
        add_header Content-Type application/json;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Static assets with long-term caching
    location ~* \.(js|css|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        proxy_pass http://frontend:3002;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # SPA routing
    location / {
        proxy_pass http://frontend:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Visitor $http_cf_visitor;
        proxy_intercept_errors on;
        error_page 404 = @spa_fallback;
    }

    location @spa_fallback {
        proxy_pass http://frontend:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://api:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

        # Rate limiting for sensitive endpoints
        limit_req zone=api burst=10 nodelay;
    }
}
EOF

# Restart Nginx with new configuration
echo "🔄 Restarting Nginx with Cloudflare configuration..."
docker compose restart nginx
sleep 5

# Test SSL certificate
echo "🧪 Testing SSL certificate..."
if curl -k -I https://$DOMAIN | grep -q "200 OK"; then
    echo "✅ SSL certificate is working!"
else
    echo "❌ SSL certificate test failed"
    exit 1
fi

# Test API endpoint
echo "🔧 Testing API endpoint..."
if curl -k -I https://$DOMAIN/api/health | grep -q "200 OK"; then
    echo "✅ API endpoint is working!"
else
    echo "❌ API endpoint test failed"
    exit 1
fi

echo ""
echo "🎉 SSL setup completed successfully!"
echo ""
echo "Next steps for Cloudflare:"
echo "1. Go to Cloudflare dashboard > SSL/TLS > Overview"
echo "2. Set SSL/TLS encryption mode to 'Full (strict)'"
echo "3. Enable Cloudflare proxy (orange cloud ON) for both A records"
echo "4. Configure Cloudflare security settings (see CLOUDFLARE_SETUP.md)"
echo ""
echo "Your site will be available at:"
echo "  - https://$DOMAIN"
echo "  - https://$WWW_DOMAIN"
echo ""
echo "SSL certificates will auto-renew every 90 days."