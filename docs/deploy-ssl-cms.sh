#!/bin/bash
# Saraiva Vision CMS SSL Deployment Script
# Complete SSL setup for cms.saraivavision.com.br

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="cms.saraivavision.com.br"
EMAIL="admin@saraivavision.com.br"
WEB_ROOT="/var/www/cms.saraivavision.com.br"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}=== Saraiva Vision CMS SSL Deployment ===${NC}"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Web Root: $WEB_ROOT"
echo "Project Root: $PROJECT_ROOT"
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

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to backup file
backup_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
        log "Backed up $file"
    fi
}

# Function to validate SSL certificate
validate_ssl_certificate() {
    local domain="$1"
    if [[ -f "/etc/letsencrypt/live/$domain/fullchain.pem" ]]; then
        openssl x509 -in "/etc/letsencrypt/live/$domain/fullchain.pem" -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"
        return 0
    else
        error "SSL certificate not found for $domain"
        return 1
    fi
}

# Pre-deployment checks
log "=== Pre-deployment Checks ==="

# Check if Nginx is installed
if ! command_exists nginx; then
    error "Nginx is not installed. Please install Nginx first."
    exit 1
fi

# Check if Certbot is installed
if ! command_exists certbot; then
    warn "Certbot not found. Installing..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Check if PHP-FPM is installed
if ! pgrep php-fpm > /dev/null; then
    warn "PHP-FPM not found. Installing PHP-FPM..."
    apt-get install -y php-fpm php-mysql php-xml php-curl php-gd php-mbstring
fi

# Create required directories
log "=== Creating Directories ==="
mkdir -p "$WEB_ROOT"
mkdir -p "$WEB_ROOT/.well-known/acme-challenge"
mkdir -p "/var/log/nginx"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# Deploy SSL configuration
log "=== Deploying SSL Configuration ==="

# Backup existing Nginx configuration
backup_file "$NGINX_SITES_AVAILABLE/$DOMAIN"

# Copy Nginx SSL configuration
if [[ -f "$PROJECT_ROOT/docs/nginx-cms-ssl.conf" ]]; then
    cp "$PROJECT_ROOT/docs/nginx-cms-ssl.conf" "$NGINX_SITES_AVAILABLE/$DOMAIN"
    log "SSL configuration copied to $NGINX_SITES_AVAILABLE/$DOMAIN"
else
    error "SSL configuration file not found: $PROJECT_ROOT/docs/nginx-cms-ssl.conf"
    exit 1
fi

# Create symbolic link for enabled site
if [[ ! -L "$NGINX_SITES_ENABLED/$DOMAIN" ]]; then
    ln -s "$NGINX_SITES_AVAILABLE/$DOMAIN" "$NGINX_SITES_ENABLED/$DOMAIN"
    log "Created symbolic link for $DOMAIN"
fi

# Deploy CORS configuration
log "=== Deploying CORS Configuration ==="
CORS_CONFIG="/etc/nginx/conf.d/cors.conf"
backup_file "$CORS_CONFIG"

if [[ -f "$PROJECT_ROOT/docs/nginx-cors.conf" ]]; then
    cp "$PROJECT_ROOT/docs/nginx-cors.conf" "$CORS_CONFIG"
    log "CORS configuration deployed to $CORS_CONFIG"
else
    warn "CORS configuration file not found"
fi

# Setup SSL certificate
log "=== Setting up SSL Certificate ==="

# Run SSL renewal setup script
if [[ -f "$PROJECT_ROOT/docs/ssl-renewal-setup.sh" ]]; then
    chmod +x "$PROJECT_ROOT/docs/ssl-renewal-setup.sh"
    "$PROJECT_ROOT/docs/ssl-renewal-setup.sh"
else
    warn "SSL renewal setup script not found. Running manual certificate generation..."

    # Create temporary validation file
    echo "SSL validation for $DOMAIN" > "$WEB_ROOT/.well-known/acme-challenge/validation.txt"

    # Generate SSL certificate
    certbot certonly --webroot \
        --webroot-path "$WEB_ROOT" \
        --domain "$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --keep-until-expiring \
        --rsa-key-size 4096
fi

# Test Nginx configuration
log "=== Testing Nginx Configuration ==="
if nginx -t; then
    log "Nginx configuration test passed"
else
    error "Nginx configuration test failed"
    exit 1
fi

# Reload Nginx
log "=== Reloading Nginx ==="
systemctl reload nginx
log "Nginx reloaded successfully"

# Setup automated renewal
log "=== Setting up Automated Renewal ==="

# Create renewal hook
RENEWAL_HOOK="/etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh"
cat > "$RENEWAL_HOOK" << 'EOF'
#!/bin/bash
# Nginx reload hook for certificate renewal
systemctl reload nginx
logger -t certbot "SSL certificate renewed and Nginx reloaded for '$RENEWED_DOMAINS'"
EOF

chmod +x "$RENEWAL_HOOK"

# Create systemd service and timer
cat > /etc/systemd/system/certbot-renewal.service << EOF
[Unit]
Description=Certbot Renewal Service for $DOMAIN
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

cat > /etc/systemd/system/certbot-renewal.timer << EOF
[Unit]
Description=Run certbot renewal twice daily for $DOMAIN
Requires=certbot-renewal.service

[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=3600
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable certbot-renewal.timer
systemctl start certbot-renewal.timer

# Create health monitoring script
log "=== Setting up Health Monitoring ==="
cat > /usr/local/bin/cms-ssl-health.sh << 'EOF'
#!/bin/bash
# CMS SSL Health Monitoring Script

DOMAIN="cms.saraivavision.com.br"
EMAIL="admin@saraivavision.com.br"
LOG_FILE="/var/log/cms-ssl-health.log"

# Function to check SSL certificate
check_ssl() {
    local domain="$1"
    local expiry_date
    local days_left

    if [[ -f "/etc/letsencrypt/live/$domain/cert.pem" ]]; then
        expiry_date=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$domain/cert.pem" | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_left=$(( (expiry_timestamp - current_timestamp) / 86400 ))

        echo "$days_left"
    else
        echo "-1"
    fi
}

# Function to check Nginx status
check_nginx() {
    if systemctl is-active --quiet nginx; then
        echo "active"
    else
        echo "inactive"
    fi
}

# Function to check SSL endpoint
check_ssl_endpoint() {
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/ssl-health" 2>/dev/null || echo "000")
    echo "$response"
}

# Perform checks
days_left=$(check_ssl "$DOMAIN")
nginx_status=$(check_nginx)
ssl_endpoint=$(check_ssl_endpoint)

# Log results
echo "$(date '+%Y-%m-%d %H:%M:%S') - SSL Days Left: $days_left, Nginx: $nginx_status, SSL Endpoint: $ssl_endpoint" >> "$LOG_FILE"

# Send alerts if needed
if [[ "$days_left" -lt 30 && "$days_left" -gt 0 ]]; then
    echo "WARNING: SSL certificate expires in $days_left days" | logger -t cms-ssl-health
fi

if [[ "$nginx_status" != "active" ]]; then
    echo "ERROR: Nginx is not running" | logger -t cms-ssl-health
fi

if [[ "$ssl_endpoint" != "200" ]]; then
    echo "ERROR: SSL endpoint returning $ssl_endpoint" | logger -t cms-ssl-health
fi

exit 0
EOF

chmod +x /usr/local/bin/cms-ssl-health.sh

# Setup cron job for health monitoring
(crontab -l 2>/dev/null; echo "*/15 * * * * /usr/local/bin/cms-ssl-health.sh") | crontab -

# Test SSL configuration
log "=== Testing SSL Configuration ==="

# Test SSL endpoint
ssl_test=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/ssl-health" 2>/dev/null || echo "000")
if [[ "$ssl_test" == "200" ]]; then
    log "SSL endpoint test passed"
else
    warn "SSL endpoint test failed: HTTP $ssl_test"
fi

# Test GraphQL endpoint
graphql_test=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/graphql" -H "Content-Type: application/json" -d '{"query":"{__typename}"}' 2>/dev/null || echo "000")
if [[ "$graphql_test" == "200" ]]; then
    log "GraphQL endpoint test passed"
else
    warn "GraphQL endpoint test failed: HTTP $graphql_test"
fi

# Display final status
log "=== Deployment Complete ==="
echo ""
echo "Configuration Files:"
echo "  - SSL Config: $NGINX_SITES_AVAILABLE/$DOMAIN"
echo "  - CORS Config: $CORS_CONFIG"
echo "  - Renewal Hook: $RENEWAL_HOOK"
echo ""
echo "System Services:"
echo "  - Certbot Timer: $(systemctl is-enabled certbot-renewal.timer)"
echo "  - Nginx Status: $(systemctl is-active nginx)"
echo ""
echo "SSL Certificate:"
validate_ssl_certificate "$DOMAIN"
echo ""
echo "Health Monitoring:"
echo "  - Health Script: /usr/local/bin/cms-ssl-health.sh"
echo "  - Cron Job: Every 15 minutes"
echo "  - Log File: /var/log/cms-ssl-health.log"
echo ""
echo "Manual Commands:"
echo "  - Test SSL: openssl s_client -connect $DOMAIN:443 -showcerts"
echo "  - Renew SSL: certbot renew --force-renewal"
echo "  - Check Status: systemctl status certbot-renewal.timer"
echo ""
echo "Access URLs:"
echo "  - SSL Health: https://$DOMAIN/ssl-health"
echo "  - GraphQL: https://$DOMAIN/graphql"
echo "  - Health Check: https://$DOMAIN/health"
echo ""
echo -e "${GREEN}SSL deployment completed successfully!${NC}"