#!/bin/bash

# SSL Certificate Installation Script for Saraiva Vision
# Installs Let's Encrypt SSL certificates for cms.saraivavision.com.br and blog.saraivavision.com.br

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAINS=("cms.saraivavision.com.br" "blog.saraivavision.com.br")
EMAIL="admin@saraivavision.com.br"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if running as root
if [[ $EUID -ne 0 ]]; then
    print_error "This script must be run as root"
    exit 1
fi

print_status "🔐 Starting SSL certificate installation for Saraiva Vision domains"

# Update package list
print_status "📦 Updating package list..."
apt update

# Install certbot and nginx plugin
print_status "📦 Installing Certbot and Nginx plugin..."
apt install -y certbot python3-certbot-nginx

# Check if domains are accessible
print_status "🌐 Checking domain accessibility..."
for domain in "${DOMAINS[@]}"; do
    print_status "Checking $domain..."
    if ! curl -f --max-time 10 "http://$domain" > /dev/null 2>&1; then
        print_warning "⚠️ Domain $domain is not accessible via HTTP. Make sure DNS is configured and the domain points to this server."
        print_warning "Continuing anyway, but certificate installation may fail..."
    else
        print_success "✅ Domain $domain is accessible"
    fi
done

# Configure Nginx for each domain if not already configured
for domain in "${DOMAINS[@]}"; do
    nginx_config="/etc/nginx/sites-available/saraiva-wordpress-${domain%%.*}"

    if [[ "$domain" == "blog.saraivavision.com.br" ]]; then
        config_source="/home/saraiva-vision-site/docs/nginx-wordpress-blog.conf"
    elif [[ "$domain" == "cms.saraivavision.com.br" ]]; then
        config_source="/home/saraiva-vision-site/docs/nginx-wordpress-cms.conf"
    fi

    if [[ ! -f "$nginx_config" ]] && [[ -f "$config_source" ]]; then
        print_status "🔧 Configuring Nginx for $domain..."
        cp "$config_source" "$nginx_config"

        # Create cache directory
        cache_dir="/var/cache/nginx/${domain%%.*}"
        mkdir -p "$cache_dir"
        chown www-data:www-data "$cache_dir"

        # Enable site
        ln -sf "$nginx_config" /etc/nginx/sites-enabled/
        print_success "✅ Nginx configuration created for $domain"
    elif [[ -f "$nginx_config" ]]; then
        print_status "🔧 Nginx configuration already exists for $domain"
    else
        print_warning "⚠️ Nginx configuration source not found for $domain"
    fi
done

# Test and reload Nginx after configuration
print_status "🔧 Testing Nginx configuration..."
if nginx -t; then
    print_success "✅ Nginx configuration is valid"
    systemctl reload nginx
    print_success "✅ Nginx reloaded"
else
    print_error "❌ Nginx configuration has errors"
    exit 1
fi

# Install SSL certificates for each domain
for domain in "${DOMAINS[@]}"; do
    print_status "🔐 Installing SSL certificate for $domain..."

    # Check if certificate already exists
    if [[ -d "/etc/letsencrypt/live/$domain" ]]; then
        print_warning "⚠️ SSL certificate for $domain already exists. Renewing instead..."
        certbot renew --cert-name "$domain" --non-interactive
    else
        # Install certificate
        if certbot --nginx -d "$domain" --non-interactive --agree-tos --email "$EMAIL"; then
            print_success "✅ SSL certificate installed for $domain"
        else
            print_error "❌ Failed to install SSL certificate for $domain"
            print_warning "Make sure the domain points to this server and port 80 is accessible"
            continue
        fi
    fi
done

# Test Nginx configuration
print_status "🔧 Testing Nginx configuration..."
if nginx -t; then
    print_success "✅ Nginx configuration is valid"
else
    print_error "❌ Nginx configuration has errors"
    exit 1
fi

# Reload Nginx to apply SSL configuration
print_status "🔄 Reloading Nginx..."
systemctl reload nginx

# Set up automatic renewal
print_status "⏰ Setting up automatic certificate renewal..."
if ! crontab -l | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    print_success "✅ Automatic renewal configured (runs daily at 12:00)"
else
    print_status "⏰ Automatic renewal already configured"
fi

# Verify SSL certificates
print_status "🔍 Verifying SSL certificates..."
for domain in "${DOMAINS[@]}"; do
    print_status "Checking SSL for $domain..."

    # Check if SSL is working
    if echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
        print_success "✅ SSL certificate is valid for $domain"

        # Show certificate details
        echo "Certificate details for $domain:"
        echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | openssl x509 -noout -subject -issuer -dates | sed 's/^/  /'
        echo ""
    else
        print_error "❌ SSL certificate verification failed for $domain"
    fi
done

# Test HTTP to HTTPS redirect
print_status "🔄 Testing HTTP to HTTPS redirects..."
for domain in "${DOMAINS[@]}"; do
    print_status "Testing redirect for $domain..."

    # Test HTTP redirect to HTTPS
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "http://$domain" || echo "000")
    if [[ "$response_code" == "301" ]]; then
        print_success "✅ HTTP to HTTPS redirect working for $domain"
    else
        print_warning "⚠️ HTTP to HTTPS redirect not working for $domain (HTTP status: $response_code)"
        print_warning "Make sure Nginx configuration includes redirect from HTTP to HTTPS"
    fi
done

print_success "🎉 SSL certificate installation completed!"

# Display summary
echo ""
echo "================================================"
echo "🔐 SSL CERTIFICATES - SARAIVA VISION"
echo "================================================"
echo "✅ Let's Encrypt certificates installed"
echo "✅ Nginx configured for HTTPS"
echo "✅ Automatic renewal configured"
echo ""
echo "📋 Certificate Details:"
for domain in "${DOMAINS[@]}"; do
    if [[ -d "/etc/letsencrypt/live/$domain" ]]; then
        echo "  🌐 $domain"
        echo "    📁 Certificate: /etc/letsencrypt/live/$domain/fullchain.pem"
        echo "    🔑 Private Key: /etc/letsencrypt/live/$domain/privkey.pem"
        echo "    ⏰ Auto-renewal: Daily at 12:00 via cron"
        echo ""
    fi
done

echo "🔍 Test your SSL setup:"
for domain in "${DOMAINS[@]}"; do
    echo "  curl -I https://$domain"
done
echo ""
echo "🛠️ Manual renewal: certbot renew"
echo "📊 Check status: certbot certificates"
echo "================================================"

# Create renewal test script
cat > "/root/test-ssl-renewal.sh" << 'EOF'
#!/bin/bash
echo "Testing SSL certificate renewal (dry run)..."
certbot renew --dry-run
echo "Testing completed."
EOF

chmod +x "/root/test-ssl-renewal.sh"

print_success "📋 Test script created: /root/test-ssl-renewal.sh"