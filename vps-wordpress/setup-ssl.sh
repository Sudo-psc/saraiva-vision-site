#!/bin/bash

# SSL Certificate Setup Script for WordPress CMS
# Uses Let's Encrypt with Certbot

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="cms.saraivavision.com.br"
EMAIL="admin@saraivavision.com.br"
WEBROOT="/var/lib/letsencrypt"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

log "Setting up SSL certificates for $DOMAIN..."

# Check if domain resolves to this server
log "Checking DNS resolution for $DOMAIN..."
DOMAIN_IP=$(dig +short $DOMAIN)
SERVER_IP=$(curl -s ifconfig.me)

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    warn "Domain $DOMAIN does not resolve to this server IP ($SERVER_IP)"
    warn "Current DNS points to: $DOMAIN_IP"
    warn "Please update your DNS records before continuing"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create webroot directory for Let's Encrypt challenges
log "Creating webroot directory..."
mkdir -p $WEBROOT
chown -R www-data:www-data $WEBROOT

# Create temporary nginx configuration for initial certificate
log "Creating temporary nginx configuration..."
cat > /etc/nginx/sites-available/temp-ssl << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root $WEBROOT;
    }
    
    location / {
        return 200 'SSL setup in progress...';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable temporary configuration
ln -sf /etc/nginx/sites-available/temp-ssl /etc/nginx/sites-enabled/temp-ssl
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t || error "Nginx configuration test failed"

# Reload nginx
systemctl reload nginx

# Obtain SSL certificate
log "Obtaining SSL certificate from Let's Encrypt..."
certbot certonly \
    --webroot \
    --webroot-path=$WEBROOT \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN \
    --non-interactive

if [ $? -ne 0 ]; then
    error "Failed to obtain SSL certificate"
fi

log "SSL certificate obtained successfully!"

# Remove temporary nginx configuration
rm -f /etc/nginx/sites-enabled/temp-ssl

# Set up automatic renewal
log "Setting up automatic certificate renewal..."
cat > /etc/cron.d/certbot-renew << EOF
# Renew Let's Encrypt certificates
0 2 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# Test certificate renewal
log "Testing certificate renewal..."
certbot renew --dry-run

if [ $? -eq 0 ]; then
    log "Certificate renewal test passed!"
else
    warn "Certificate renewal test failed. Please check the configuration."
fi

# Create certificate info script
cat > /usr/local/bin/ssl-info.sh << 'EOF'
#!/bin/bash

DOMAIN="cms.saraivavision.com.br"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ -f "$CERT_PATH" ]; then
    echo "SSL Certificate Information for $DOMAIN:"
    echo "----------------------------------------"
    openssl x509 -in "$CERT_PATH" -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:)"
    echo
    echo "Certificate expires in:"
    openssl x509 -in "$CERT_PATH" -checkend 0 -noout && echo "Certificate is valid" || echo "Certificate has expired"
    
    # Check expiration date
    EXPIRY_DATE=$(openssl x509 -in "$CERT_PATH" -enddate -noout | cut -d= -f2)
    EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
    CURRENT_TIMESTAMP=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_TIMESTAMP - $CURRENT_TIMESTAMP) / 86400 ))
    
    echo "Days until expiry: $DAYS_UNTIL_EXPIRY"
    
    if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
        echo "WARNING: Certificate expires in less than 30 days!"
    fi
else
    echo "SSL certificate not found at $CERT_PATH"
fi
EOF

chmod +x /usr/local/bin/ssl-info.sh

# Create SSL monitoring script
cat > /usr/local/bin/ssl-monitor.sh << 'EOF'
#!/bin/bash

DOMAIN="cms.saraivavision.com.br"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
LOG_FILE="/var/log/ssl-monitor.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

if [ -f "$CERT_PATH" ]; then
    # Check if certificate is valid
    if openssl x509 -in "$CERT_PATH" -checkend 2592000 -noout; then
        log_message "INFO: SSL certificate is valid for more than 30 days"
    else
        log_message "WARNING: SSL certificate expires within 30 days"
        
        # Attempt renewal
        log_message "INFO: Attempting certificate renewal"
        if certbot renew --quiet; then
            log_message "INFO: Certificate renewed successfully"
            systemctl reload nginx
        else
            log_message "ERROR: Certificate renewal failed"
        fi
    fi
else
    log_message "ERROR: SSL certificate not found"
fi
EOF

chmod +x /usr/local/bin/ssl-monitor.sh

# Add SSL monitoring to cron
(crontab -l 2>/dev/null; echo "0 6 * * * /usr/local/bin/ssl-monitor.sh") | crontab -

# Set proper permissions for certificates
chown -R root:root /etc/letsencrypt
chmod -R 755 /etc/letsencrypt
chmod -R 644 /etc/letsencrypt/archive
chmod -R 644 /etc/letsencrypt/live

log "SSL setup completed successfully!"
log "Certificate location: /etc/letsencrypt/live/$DOMAIN/"
log "Certificate will be automatically renewed"
log "Run 'ssl-info.sh' to check certificate status"
log ""
log "Next steps:"
log "1. Update your Docker Compose nginx configuration to use SSL"
log "2. Start your WordPress containers"
log "3. Test HTTPS access to https://$DOMAIN"