#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${DOMAIN:-cms.saraivavision.com.br}"
EMAIL="${LETSENCRYPT_EMAIL:-admin@saraivavision.com.br}"
WEBROOT="/var/www/certbot"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

# Logging functions
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Install certbot if not already installed
install_certbot() {
    log "Checking if certbot is installed..."
    
    if ! command -v certbot &> /dev/null; then
        log "Installing certbot..."
        
        # Update package list
        apt-get update
        
        # Install certbot
        apt-get install -y certbot
        
        log "Certbot installed successfully"
    else
        log "Certbot is already installed"
    fi
}

# Create webroot directory
create_webroot() {
    log "Creating webroot directory..."
    
    mkdir -p "$WEBROOT"
    chown -R www-data:www-data "$WEBROOT"
    chmod -R 755 "$WEBROOT"
    
    log "Webroot directory created: $WEBROOT"
}

# Check if domain resolves to current server
check_domain_resolution() {
    log "Checking domain resolution for $DOMAIN..."
    
    # Get server's public IP
    SERVER_IP=$(curl -s http://ipv4.icanhazip.com || curl -s http://ipinfo.io/ip || echo "unknown")
    
    if [ "$SERVER_IP" = "unknown" ]; then
        warn "Could not determine server IP address"
        return 0
    fi
    
    # Get domain's resolved IP
    DOMAIN_IP=$(dig +short "$DOMAIN" | tail -n1)
    
    if [ -z "$DOMAIN_IP" ]; then
        warn "Domain $DOMAIN does not resolve to any IP address"
        warn "Please ensure your DNS is configured correctly"
        return 1
    fi
    
    if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
        log "✓ Domain $DOMAIN correctly resolves to server IP: $SERVER_IP"
        return 0
    else
        warn "Domain $DOMAIN resolves to $DOMAIN_IP but server IP is $SERVER_IP"
        warn "SSL certificate generation may fail"
        return 1
    fi
}

# Test HTTP challenge
test_http_challenge() {
    log "Testing HTTP challenge..."
    
    # Create test file
    local test_file="$WEBROOT/.well-known/acme-challenge/test-$(date +%s)"
    mkdir -p "$(dirname "$test_file")"
    echo "test-challenge" > "$test_file"
    
    # Test if file is accessible
    local test_url="http://$DOMAIN/.well-known/acme-challenge/$(basename "$test_file")"
    
    if curl -s -f "$test_url" > /dev/null; then
        log "✓ HTTP challenge test successful"
        rm -f "$test_file"
        return 0
    else
        error "HTTP challenge test failed. URL not accessible: $test_url"
        rm -f "$test_file"
        return 1
    fi
}

# Generate SSL certificate
generate_certificate() {
    log "Generating SSL certificate for $DOMAIN..."
    
    # Check if certificate already exists and is valid
    if [ -f "$CERT_DIR/fullchain.pem" ]; then
        local expiry_date=$(openssl x509 -in "$CERT_DIR/fullchain.pem" -enddate -noout | cut -d= -f2)
        local expiry_timestamp=$(date -d "$expiry_date" +%s)
        local current_timestamp=$(date +%s)
        local days_until_expiry=$(( ($expiry_timestamp - $current_timestamp) / 86400 ))
        
        if [ $days_until_expiry -gt 30 ]; then
            log "Certificate already exists and is valid for $days_until_expiry days"
            return 0
        else
            warn "Certificate expires in $days_until_expiry days, renewing..."
        fi
    fi
    
    # Generate certificate using webroot method
    certbot certonly \
        --webroot \
        --webroot-path="$WEBROOT" \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --domains "$DOMAIN" \
        --non-interactive \
        --expand \
        --keep-until-expiring
    
    if [ $? -eq 0 ]; then
        log "✓ SSL certificate generated successfully"
        
        # Set proper permissions
        chmod 644 "$CERT_DIR/fullchain.pem"
        chmod 600 "$CERT_DIR/privkey.pem"
        
        return 0
    else
        error "Failed to generate SSL certificate"
        return 1
    fi
}

# Setup automatic renewal
setup_auto_renewal() {
    log "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/certbot-renew.sh << 'EOF'
#!/bin/bash
# Automatic certificate renewal script

# Renew certificates
/usr/bin/certbot renew --quiet --no-self-upgrade

# Reload nginx if certificates were renewed
if [ $? -eq 0 ]; then
    # Check if nginx is running in Docker
    if docker ps | grep -q nginx; then
        docker exec $(docker ps -q -f name=nginx) nginx -s reload
    elif systemctl is-active --quiet nginx; then
        systemctl reload nginx
    fi
fi
EOF
    
    chmod +x /usr/local/bin/certbot-renew.sh
    
    # Add cron job for automatic renewal (twice daily)
    if ! crontab -l 2>/dev/null | grep -q "certbot-renew.sh"; then
        (crontab -l 2>/dev/null; echo "0 */12 * * * /usr/local/bin/certbot-renew.sh >> /var/log/certbot-renew.log 2>&1") | crontab -
        log "✓ Automatic renewal cron job added"
    else
        log "Automatic renewal cron job already exists"
    fi
    
    # Create log file
    touch /var/log/certbot-renew.log
    chmod 644 /var/log/certbot-renew.log
    
    log "✓ Automatic renewal setup completed"
}

# Reload nginx configuration
reload_nginx() {
    log "Reloading nginx configuration..."
    
    # Check if nginx is running in Docker
    if docker ps | grep -q nginx; then
        docker exec $(docker ps -q -f name=nginx) nginx -s reload
        log "✓ Nginx reloaded (Docker)"
    elif systemctl is-active --quiet nginx; then
        systemctl reload nginx
        log "✓ Nginx reloaded (systemd)"
    else
        warn "Nginx is not running or not found"
    fi
}

# Verify certificate installation
verify_certificate() {
    log "Verifying SSL certificate installation..."
    
    # Test HTTPS connection
    if curl -s -I "https://$DOMAIN" | grep -q "HTTP/"; then
        log "✓ HTTPS connection successful"
        
        # Check certificate details
        local cert_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates)
        log "Certificate details:"
        echo "$cert_info" | sed 's/^/  /'
        
        return 0
    else
        error "HTTPS connection failed"
        return 1
    fi
}

# Display certificate information
show_certificate_info() {
    log "SSL Certificate Information"
    log "=========================="
    
    if [ -f "$CERT_DIR/fullchain.pem" ]; then
        local cert_info=$(openssl x509 -in "$CERT_DIR/fullchain.pem" -text -noout)
        
        echo "Domain: $DOMAIN"
        echo "Certificate file: $CERT_DIR/fullchain.pem"
        echo "Private key file: $CERT_DIR/privkey.pem"
        echo ""
        
        # Extract and display key information
        echo "Subject: $(echo "$cert_info" | grep "Subject:" | sed 's/.*Subject: //')"
        echo "Issuer: $(echo "$cert_info" | grep "Issuer:" | sed 's/.*Issuer: //')"
        echo "Valid from: $(echo "$cert_info" | grep "Not Before:" | sed 's/.*Not Before: //')"
        echo "Valid until: $(echo "$cert_info" | grep "Not After:" | sed 's/.*Not After: //')"
        
        # Calculate days until expiry
        local expiry_date=$(openssl x509 -in "$CERT_DIR/fullchain.pem" -enddate -noout | cut -d= -f2)
        local expiry_timestamp=$(date -d "$expiry_date" +%s)
        local current_timestamp=$(date +%s)
        local days_until_expiry=$(( ($expiry_timestamp - $current_timestamp) / 86400 ))
        
        echo "Days until expiry: $days_until_expiry"
        
        if [ $days_until_expiry -lt 30 ]; then
            warn "Certificate expires in less than 30 days!"
        fi
    else
        error "Certificate file not found: $CERT_DIR/fullchain.pem"
    fi
}

# Main execution
main() {
    log "Starting SSL certificate setup for $DOMAIN..."
    
    check_root
    install_certbot
    create_webroot
    
    # Check domain resolution (non-fatal)
    check_domain_resolution || warn "Domain resolution check failed, continuing anyway..."
    
    # Test HTTP challenge (non-fatal in some cases)
    if ! test_http_challenge; then
        warn "HTTP challenge test failed, but attempting certificate generation anyway..."
    fi
    
    generate_certificate
    setup_auto_renewal
    reload_nginx
    verify_certificate
    show_certificate_info
    
    log "SSL certificate setup completed successfully! 🎉"
    log ""
    log "Your website is now accessible at: https://$DOMAIN"
    log "Certificate will be automatically renewed every 12 hours"
    log "Renewal logs are stored in: /var/log/certbot-renew.log"
}

# Handle script arguments
case "${1:-setup}" in
    "setup")
        main
        ;;
    "renew")
        log "Renewing SSL certificate..."
        /usr/local/bin/certbot-renew.sh
        ;;
    "info")
        show_certificate_info
        ;;
    "test")
        check_domain_resolution
        test_http_challenge
        ;;
    *)
        echo "Usage: $0 {setup|renew|info|test}"
        echo ""
        echo "Commands:"
        echo "  setup - Full SSL setup (default)"
        echo "  renew - Renew certificate"
        echo "  info  - Show certificate information"
        echo "  test  - Test domain and HTTP challenge"
        exit 1
        ;;
esac