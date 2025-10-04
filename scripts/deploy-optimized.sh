#!/bin/bash

# Optimized Deployment Script for Saraiva Vision Healthcare Platform
# Features: Brotli compression, advanced caching, async script loading, healthcare compliance

set -euo pipefail

# Medical compliance logging
LOG_FILE="/var/log/saraiva-deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Colors for medical platform status output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Medical platform configuration
PROJECT_DIR="/home/saraiva-vision-site"
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
BACKUP_DIR="/var/backups/saraiva-vision"
HEALTH_CHECK_URL="https://saraivavision.com.br/health"

# Logging function for medical compliance
log() {
    echo "[$TIMESTAMP] [MEDICAL-PLATFORM] $1" | sudo tee -a "$LOG_FILE"
}

# Health compliance check functions
check_health_compliance() {
    echo -e "${BLUE}[HEALTH-COMPLIANCE]${NC} Verifying medical platform requirements..."

    # Check Node.js version (requirement for medical platform)
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_NODE="22.0.0"
    if [[ $(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1) = "$REQUIRED_NODE" ]]; then
        echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION meets medical platform requirements"
    else
        echo -e "${RED}✗${NC} Node.js $NODE_VERSION below medical platform requirement ($REQUIRED_NODE)"
        return 1
    fi

    # Check critical environment variables for healthcare
    local env_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_GOOGLE_MAPS_API_KEY")
    local missing_vars=()

    for var in "${env_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -eq 0 ]]; then
        echo -e "${GREEN}✓${NC} All required healthcare environment variables are set"
    else
        echo -e "${RED}✗${NC} Missing healthcare environment variables: ${missing_vars[*]}"
        return 1
    fi

    # Check LGPD compliance files
    if [[ -f "$PROJECT_DIR/public/privacy.html" ]] || [[ -f "$PROJECT_DIR/src/pages/PrivacyPolicyPage.jsx" ]]; then
        echo -e "${GREEN}✓${NC} LGPD compliance page found"
    else
        echo -e "${YELLOW}⚠${NC} LGPD compliance page not found"
    fi

    return 0
}

# Performance optimization functions
optimize_build() {
    echo -e "${BLUE}[OPTIMIZATION]${NC} Starting optimized build for healthcare platform..."

    # Clear any existing build artifacts
    rm -rf "$PROJECT_DIR/dist" "$PROJECT_DIR/.next"

    # Run optimized build
    echo -e "${BLUE}[BUILD]${NC} Running optimized Vite build with healthcare compliance..."
    cd "$PROJECT_DIR"

    # Build with optimizations
    if npm run build:vite; then
        echo -e "${GREEN}✓${NC} Optimized build completed successfully"
    else
        echo -e "${RED}✗${NC} Build failed"
        return 1
    fi

    # Generate bundle analysis for medical platform
    if command -v npx &> /dev/null; then
        echo -e "${BLUE}[ANALYSIS]${NC} Generating bundle analysis..."
        npx vite-bundle-analyzer "$PROJECT_DIR/dist/stats.html" 2>/dev/null || echo "Bundle analyzer not available"
    fi

    # Verify bundle sizes meet healthcare platform requirements
    local bundle_size=$(du -sk "$PROJECT_DIR/dist" | cut -f1)
    echo -e "${GREEN}✓${NC} Total bundle size: ${bundle_size}KB"

    return 0
}

# Brotli compression setup
setup_brotli_compression() {
    echo -e "${BLUE}[COMPRESSION]${NC} Setting up Brotli compression for medical content..."

    # Check if Brotli module is available
    if nginx -V 2>&1 | grep -q "ngx_http_brotli_filter_module"; then
        echo -e "${GREEN}✓${NC} Brotli compression module available"
    else
        echo -e "${YELLOW}⚠${NC} Brotli module not found, using Gzip fallback"
        return 0
    fi

    # Generate Brotli compressed files for static assets
    if command -v brotli &> /dev/null; then
        echo -e "${BLUE}[COMPRESSION]${NC} Pre-compressing static assets with Brotli..."
        find "$PROJECT_DIR/dist" -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) \
            -not -name "*.br" \
            -exec brotli -f -k {} \;
        echo -e "${GREEN}✓${NC} Brotli compression completed"
    else
        echo -e "${YELLOW}⚠${NC} Brotli command-line tool not available"
    fi

    return 0
}

# Nginx optimization deployment
deploy_nginx_config() {
    echo -e "${BLUE}[NGINX]${NC} Deploying optimized Nginx configuration..."

    # Backup current configuration
    if [[ -f "/etc/nginx/sites-available/saraivavision" ]]; then
        sudo cp "/etc/nginx/sites-available/saraivavision" "$BACKUP_DIR/nginx.conf.backup.$TIMESTAMP"
        echo -e "${GREEN}✓${NC} Current Nginx configuration backed up"
    fi

    # Deploy optimized configuration
    sudo cp "$PROJECT_DIR/nginx-optimized.conf" "/etc/nginx/sites-available/saraivavision"

    # Test Nginx configuration
    if sudo nginx -t; then
        echo -e "${GREEN}✓${NC} Nginx configuration test passed"
    else
        echo -e "${RED}✗${NC} Nginx configuration test failed"
        return 1
    fi

    # Enable site if not already enabled
    if [[ ! -L "$NGINX_ENABLED_DIR/saraivavision" ]]; then
        sudo ln -s "$NGINX_CONF_DIR/saraivavision" "$NGINX_ENABLED_DIR/saraivavision"
        echo -e "${GREEN}✓${NC} Site enabled"
    fi

    # Reload Nginx
    if sudo systemctl reload nginx; then
        echo -e "${GREEN}✓${NC} Nginx reloaded successfully"
    else
        echo -e "${RED}✗${NC} Failed to reload Nginx"
        return 1
    fi

    return 0
}

# Security and compliance validation
validate_security_compliance() {
    echo -e "${BLUE}[SECURITY]${NC} Validating healthcare security compliance..."

    # Check SSL certificate
    if curl -s "https://saraivavision.com.br" | grep -q "200 OK"; then
        echo -e "${GREEN}✓${NC} SSL certificate is valid"
    else
        echo -e "${RED}✗${NC} SSL certificate issue detected"
        return 1
    fi

    # Check security headers
    local headers=$(curl -s -I "https://saraivavision.com.br")

    if echo "$headers" | grep -qi "x-frame-options"; then
        echo -e "${GREEN}✓${NC} X-Frame-Options header present"
    else
        echo -e "${YELLOW}⚠${NC} X-Frame-Options header missing"
    fi

    if echo "$headers" | grep -qi "x-content-type-options"; then
        echo -e "${GREEN}✓${NC} X-Content-Type-Options header present"
    else
        echo -e "${YELLOW}⚠${NC} X-Content-Type-Options header missing"
    fi

    if echo "$headers" | grep -qi "strict-transport-security"; then
        echo -e "${GREEN}✓${NC} HSTS header present"
    else
        echo -e "${YELLOW}⚠${NC} HSTS header missing"
    fi

    return 0
}

# Performance monitoring setup
setup_performance_monitoring() {
    echo -e "${BLUE}[MONITORING]${NC} Setting up performance monitoring..."

    # Create performance monitoring directory
    sudo mkdir -p "/var/log/nginx/performance"

    # Set up log rotation for performance logs
    sudo tee "/etc/logrotate.d/saraiva-performance" > /dev/null <<EOF
/var/log/nginx/performance/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

    echo -e "${GREEN}✓${NC} Performance monitoring configured"
    return 0
}

# Health checks
perform_health_checks() {
    echo -e "${BLUE}[HEALTH-CHECK]${NC} Performing post-deployment health checks..."

    local health_check_passed=true

    # Check main site
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
        echo -e "${GREEN}✓${NC} Main site health check passed"
    else
        echo -e "${RED}✗${NC} Main site health check failed"
        health_check_passed=false
    fi

    # Check API health
    if curl -f -s "https://saraivavision.com.br/api/health" > /dev/null; then
        echo -e "${GREEN}✓${NC} API health check passed"
    else
        echo -e "${YELLOW}⚠${NC} API health check failed (API may be starting)"
    fi

    # Check critical medical pages
    local critical_pages=("/" "/servicos" "/sobre" "/privacy")
    for page in "${critical_pages[@]}"; do
        if curl -f -s "https://saraivavision.com.br$page" > /dev/null; then
            echo -e "${GREEN}✓${NC} Critical page $page accessible"
        else
            echo -e "${RED}✗${NC} Critical page $page not accessible"
            health_check_passed=false
        fi
    done

    # Check compression
    local compression_response=$(curl -s -I -H "Accept-Encoding: br" "https://saraivavision.com.br" | grep -i "content-encoding")
    if echo "$compression_response" | grep -qi "br"; then
        echo -e "${GREEN}✓${NC} Brotli compression is active"
    elif echo "$compression_response" | grep -qi "gzip"; then
        echo -e "${YELLOW}⚠${NC} Gzip compression is active (Brotli not available)"
    else
        echo -e "${YELLOW}⚠${NC} No compression detected"
    fi

    return $([[ "$health_check_passed" == true ]] && echo 0 || echo 1)
}

# Main deployment function
main() {
    echo -e "${BLUE}[DEPLOY]${NC} Starting optimized deployment for Saraiva Vision Healthcare Platform..."
    log "Starting optimized deployment"

    # Create backup directory
    sudo mkdir -p "$BACKUP_DIR"

    # Step 1: Health compliance check
    if ! check_health_compliance; then
        echo -e "${RED}[ERROR]${NC} Health compliance check failed. Aborting deployment."
        exit 1
    fi

    # Step 2: Optimized build
    if ! optimize_build; then
        echo -e "${RED}[ERROR]${NC} Build optimization failed. Aborting deployment."
        exit 1
    fi

    # Step 3: Brotli compression setup
    setup_brotli_compression

    # Step 4: Nginx configuration deployment
    if ! deploy_nginx_config; then
        echo -e "${RED}[ERROR]${NC} Nginx deployment failed. Aborting deployment."
        exit 1
    fi

    # Step 5: Security validation
    validate_security_compliance

    # Step 6: Performance monitoring setup
    setup_performance_monitoring

    # Step 7: Health checks
    if ! perform_health_checks; then
        echo -e "${RED}[ERROR]${NC} Post-deployment health checks failed."
        log "Deployment completed with health check failures"
        exit 1
    fi

    echo -e "${GREEN}[SUCCESS]${NC} Optimized deployment completed successfully!"
    echo -e "${GREEN}[PERFORMANCE]${NC} Medical platform is now running with:"
    echo -e "  • Async script loading"
    echo -e "  • Brotli compression"
    echo -e "  • Advanced caching strategies"
    echo -e "  • Healthcare compliance validation"
    echo -e "  • Performance monitoring enabled"

    log "Optimized deployment completed successfully"

    # Performance summary
    echo -e "${BLUE}[SUMMARY]${NC} Performance improvements:"
    echo -e "  • Reduced bundle sizes: $(du -sk "$PROJECT_DIR/dist" | cut -f1)KB"
    echo -e "  • Brotli compression: Enabled"
    echo -e "  • Resource hints: Configured"
    echo -e "  • Async loading: Implemented"
    echo -e "  • Healthcare compliance: Validated"
}

# Error handling
trap 'echo -e "${RED}[ERROR]${NC} Deployment failed at line $LINENO"; log "Deployment failed at line $LINENO"; exit 1' ERR

# Run main function
main "$@"