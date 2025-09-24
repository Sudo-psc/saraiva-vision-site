#!/bin/bash

# PostHog Reverse Proxy SSL Setup Script
# This script helps you set up SSL certificates for your PostHog reverse proxy

set -e

# Configuration
DOMAIN="analytics.yourdomain.com"  # Replace with your actual domain
EMAIL="your-email@yourdomain.com"  # Replace with your email
SSL_DIR="./ssl"

echo "🔐 Setting up SSL certificates for PostHog reverse proxy..."

# Create SSL directory
mkdir -p "$SSL_DIR"

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "❌ Certbot is not installed. Installing..."
    
    # Install certbot based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install certbot
        else
            echo "❌ Homebrew not found. Please install certbot manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y certbot
        elif command -v yum &> /dev/null; then
            sudo yum install -y certbot
        else
            echo "❌ Package manager not supported. Please install certbot manually."
            exit 1
        fi
    else
        echo "❌ OS not supported. Please install certbot manually."
        exit 1
    fi
fi

echo "✅ Certbot is available"

# Generate SSL certificate using Let's Encrypt
echo "🔄 Generating SSL certificate for $DOMAIN..."

# Stop nginx if running
docker-compose down 2>/dev/null || true

# Generate certificate using standalone mode
sudo certbot certonly \
    --standalone \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --domains "$DOMAIN"

# Copy certificates to our SSL directory
sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/certificate.crt"
sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/private.key"

# Set proper permissions
sudo chown $(whoami):$(whoami) "$SSL_DIR"/*
chmod 644 "$SSL_DIR/certificate.crt"
chmod 600 "$SSL_DIR/private.key"

echo "✅ SSL certificates generated and copied to $SSL_DIR"

# Update nginx configuration with correct paths
sed -i.bak "s|/path/to/your/ssl/certificate.crt|/etc/nginx/ssl/certificate.crt|g" posthog-proxy.conf
sed -i.bak "s|/path/to/your/ssl/private.key|/etc/nginx/ssl/private.key|g" posthog-proxy.conf
sed -i.bak "s|analytics.yourdomain.com|$DOMAIN|g" posthog-proxy.conf

echo "✅ Nginx configuration updated with SSL paths"

# Create renewal script
cat > renew-ssl.sh << EOF
#!/bin/bash
# SSL Certificate Renewal Script for PostHog Proxy

echo "🔄 Renewing SSL certificates..."

# Stop nginx
docker-compose down

# Renew certificates
sudo certbot renew --standalone

# Copy renewed certificates
sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/certificate.crt"
sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/private.key"

# Set permissions
sudo chown \$(whoami):\$(whoami) "$SSL_DIR"/*
chmod 644 "$SSL_DIR/certificate.crt"
chmod 600 "$SSL_DIR/private.key"

# Restart nginx
docker-compose up -d

echo "✅ SSL certificates renewed and nginx restarted"
EOF

chmod +x renew-ssl.sh

echo "✅ SSL renewal script created (renew-ssl.sh)"

# Create cron job for automatic renewal
echo "📅 Setting up automatic SSL renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * 0 cd $(pwd) && ./renew-ssl.sh >> ssl-renewal.log 2>&1") | crontab -

echo "✅ Automatic SSL renewal configured (runs weekly on Sundays at 3 AM)"

echo ""
echo "🎉 SSL setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your DNS to point $DOMAIN to this server"
echo "2. Start the nginx proxy: docker-compose up -d"
echo "3. Test the proxy: curl -I https://$DOMAIN/health"
echo "4. Update your PostHog configuration to use: https://$DOMAIN"
echo ""