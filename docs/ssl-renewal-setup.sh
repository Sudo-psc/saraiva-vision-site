#!/bin/bash
# SSL Certificate Renewal Setup Script
# Configures automated SSL certificate renewal for cms.saraivavision.com.br

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="cms.saraivavision.com.br"
EMAIL="admin@saraivavision.com.br"
WEB_ROOT="/var/www/cms.saraivavision.com.br"
NGINX_SITES="/etc/nginx/sites-available"
SERVICE_USER="www-data"

echo -e "${GREEN}=== Saraiva Vision SSL Certificate Renewal Setup ===${NC}"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Web Root: $WEB_ROOT"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root${NC}"
   exit 1
fi

# Function to log messages
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# 1. Install Certbot if not already installed
log "Step 1: Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    # Update package lists
    apt-get update

    # Install Certbot and Nginx plugin
    apt-get install -y certbot python3-certbot-nginx

    log "Certbot installed successfully"
else
    log "Certbot already installed"
fi

# 2. Create web root directory if it doesn't exist
log "Step 2: Creating web root directory..."
if [[ ! -d "$WEB_ROOT" ]]; then
    mkdir -p "$WEB_ROOT"
    chown $SERVICE_USER:$SERVICE_USER "$WEB_ROOT"
    chmod 755 "$WEB_ROOT"
    log "Web root directory created: $WEB_ROOT"
else
    log "Web root directory already exists"
fi

# 3. Create temporary file for domain validation
log "Step 3: Creating validation files..."
mkdir -p "$WEB_ROOT/.well-known/acme-challenge"
echo "SSL validation domain: $DOMAIN" > "$WEB_ROOT/.well-known/acme-challenge/validation.txt"
chown -R $SERVICE_USER:$SERVICE_USER "$WEB_ROOT/.well-known"
chmod -R 755 "$WEB_ROOT/.well-known"

# 4. Generate SSL certificate
log "Step 4: Generating SSL certificate..."
if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
    warn "SSL certificate already exists for $DOMAIN"
    warn "If you want to force renewal, run: certbot renew --force-renewal"
else
    # Generate certificate using webroot method
    certbot certonly --webroot \
        --webroot-path "$WEB_ROOT" \
        --domain "$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --keep-until-expiring \
        --rsa-key-size 4096 \
        --preferred-chain "ISRG Root X1"

    log "SSL certificate generated successfully"
fi

# 5. Verify certificate exists
if [[ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
    error "SSL certificate generation failed"
    exit 1
fi

# 6. Create renewal hook for Nginx reload
log "Step 6: Creating renewal hooks..."
cat > /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << 'EOF'
#!/bin/bash
# Nginx reload hook for certificate renewal

# Reload Nginx configuration
systemctl reload nginx

# Log renewal
logger -t certbot "SSL certificate renewed and Nginx reloaded"

# Optional: Send notification (configure as needed)
# curl -X POST "https://your-webhook-url" -d '{"event": "ssl_renewed", "domain": "'$RENEWED_DOMAINS'"}'

exit 0
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

# 7. Create systemd timer for automatic renewal
log "Step 7: Setting up automatic renewal..."

# Create systemd service
cat > /etc/systemd/system/certbot-renewal.service << EOF
[Unit]
Description=Certbot Renewal Service
Documentation=man:certbot(8)
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet --no-random-sleep-on-renew
ExecStartPost=/bin/systemctl reload nginx
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOF

# Create systemd timer
cat > /etc/systemd/system/certbot-renewal.timer << EOF
[Unit]
Description=Run certbot renewal twice daily
Requires=certbot-renewal.service

[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=3600
Persistent=true

[Install]
WantedBy=timers.target
EOF

# 8. Enable and start the timer
systemctl daemon-reload
systemctl enable certbot-renewal.timer
systemctl start certbot-renewal.timer

# 9. Create daily health check script
log "Step 8: Creating health check script..."
cat > /usr/local/bin/ssl-health-check.sh << 'EOF'
#!/bin/bash
# SSL Certificate Health Check Script

DOMAIN="cms.saraivavision.com.br"
EMAIL="admin@saraivavision.com.br"
DAYS_WARNING=30

# Function to check SSL certificate expiry
check_ssl_expiry() {
    local domain="$1"
    local expiry_date

    if [[ -f "/etc/letsencrypt/live/$domain/cert.pem" ]]; then
        expiry_date=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$domain/cert.pem" | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))

        echo "$days_until_expiry"
    else
        echo "-1"
    fi
}

# Check certificate expiry
days_left=$(check_ssl_expiry "$DOMAIN")

if [[ "$days_left" -eq -1 ]]; then
    echo "ERROR: SSL certificate not found for $DOMAIN" >&2
    exit 1
elif [[ "$days_left" -lt "$DAYS_WARNING" ]]; then
    echo "WARNING: SSL certificate for $DOMAIN expires in $days_left days" >&2
    # Send email notification (configure mail first)
    # echo "SSL certificate for $DOMAIN expires in $days_left days" | mail -s "SSL Certificate Expiring Soon" "$EMAIL"
    exit 1
else
    echo "OK: SSL certificate for $DOMAIN is valid for $days_left more days"
    exit 0
fi
EOF

chmod +x /usr/local/bin/ssl-health-check.sh

# 10. Create cron job for daily health checks
log "Step 9: Setting up daily health checks..."
(crontab -l 2>/dev/null; echo "0 6 * * * /usr/local/bin/ssl-health-check.sh") | crontab -

# 11. Test certificate renewal
log "Step 10: Testing certificate renewal..."
certbot renew --dry-run

# 12. Display final status
log "=== SSL Certificate Renewal Setup Complete ==="
echo ""
echo "Certificate Status:"
certbot certificates --domain "$DOMAIN"
echo ""
echo "Systemd Timer Status:"
systemctl status certbot-renewal.timer --no-pager
echo ""
echo "Next renewal check:"
systemctl list-timers certbot-renewal.timer --no-pager
echo ""
echo "Manual renewal command: certbot renew --force-renewal"
echo "Health check command: /usr/local/bin/ssl-health-check.sh"
echo ""
echo -e "${GREEN}Setup completed successfully!${NC}"

# Display certificate information
if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
    echo ""
    echo "Certificate Details:"
    openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After|DNS:)"
fi