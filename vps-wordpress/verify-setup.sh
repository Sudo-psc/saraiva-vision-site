#!/bin/bash

# WordPress Headless CMS Setup Verification Script
# Verifies all components are properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
    ((PASSED++))
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
    ((WARNINGS++))
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1${NC}"
    ((FAILED++))
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ $1${NC}"
}

# Check file existence
check_file() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        log "$description exists: $file"
    else
        error "$description missing: $file"
    fi
}

# Check directory existence
check_directory() {
    local dir="$1"
    local description="$2"
    
    if [ -d "$dir" ]; then
        log "$description exists: $dir"
    else
        error "$description missing: $dir"
    fi
}

# Check script executability
check_executable() {
    local script="$1"
    local description="$2"
    
    if [ -x "$script" ]; then
        log "$description is executable: $script"
    else
        error "$description is not executable: $script"
    fi
}

# Main verification function
main() {
    info "Starting WordPress Headless CMS setup verification..."
    info "=================================================="
    echo
    
    # Check core configuration files
    info "Checking core configuration files..."
    check_file "docker-compose.yml" "Docker Compose configuration"
    check_file ".env.example" "Environment template"
    check_file "wp-config-extra.php" "WordPress extra configuration"
    check_file "uploads.ini" "PHP uploads configuration"
    echo
    
    # Check Nginx configuration
    info "Checking Nginx configuration..."
    check_directory "nginx" "Nginx configuration directory"
    check_file "nginx/nginx.conf" "Main Nginx configuration"
    check_file "nginx/conf.d/wordpress.conf" "WordPress Nginx configuration"
    echo
    
    # Check setup scripts
    info "Checking setup scripts..."
    check_executable "setup-vps.sh" "VPS setup script"
    check_executable "setup-ssl.sh" "SSL setup script"
    check_executable "install-plugins.sh" "Plugin installation script"
    check_executable "deploy.sh" "Deployment script"
    check_executable "verify-setup.sh" "Verification script"
    echo
    
    # Check documentation
    info "Checking documentation..."
    check_file "README.md" "Documentation"
    echo
    
    # Validate Docker Compose configuration
    info "Validating Docker Compose configuration..."
    if command -v docker-compose &> /dev/null; then
        if docker-compose config > /dev/null 2>&1; then
            log "Docker Compose configuration is valid"
        else
            error "Docker Compose configuration has errors"
        fi
    else
        warn "Docker Compose not installed - cannot validate configuration"
    fi
    echo
    
    # Check environment template
    info "Checking environment template..."
    if [ -f ".env.example" ]; then
        # Check for required variables
        local required_vars=("MYSQL_PASSWORD" "MYSQL_ROOT_PASSWORD" "JWT_SECRET_KEY" "DOMAIN" "EMAIL")
        
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" .env.example; then
                log "Environment variable $var is defined"
            else
                error "Environment variable $var is missing from .env.example"
            fi
        done
    fi
    echo
    
    # Check script syntax
    info "Checking script syntax..."
    local scripts=("setup-vps.sh" "setup-ssl.sh" "install-plugins.sh" "deploy.sh")
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            if bash -n "$script" 2>/dev/null; then
                log "Script syntax is valid: $script"
            else
                error "Script syntax error: $script"
            fi
        fi
    done
    echo
    
    # Check Docker Compose services
    info "Checking Docker Compose services..."
    if [ -f "docker-compose.yml" ]; then
        local services=("db" "redis" "wordpress" "nginx")
        
        for service in "${services[@]}"; do
            if grep -q "^  $service:" docker-compose.yml; then
                log "Service $service is defined"
            else
                error "Service $service is missing from docker-compose.yml"
            fi
        done
    fi
    echo
    
    # Check WordPress plugins configuration
    info "Checking WordPress plugins configuration..."
    if [ -f "install-plugins.sh" ]; then
        local plugins=("wp-graphql" "wp-graphql-jwt-authentication" "redis-cache" "advanced-custom-fields")
        
        for plugin in "${plugins[@]}"; do
            if grep -q "$plugin" install-plugins.sh; then
                log "Plugin $plugin is configured for installation"
            else
                warn "Plugin $plugin not found in installation script"
            fi
        done
    fi
    echo
    
    # Check security configurations
    info "Checking security configurations..."
    
    # Check if SSL is configured
    if grep -q "ssl_certificate" nginx/conf.d/wordpress.conf; then
        log "SSL configuration found in Nginx"
    else
        error "SSL configuration missing from Nginx"
    fi
    
    # Check if rate limiting is configured
    if grep -q "limit_req" nginx/conf.d/wordpress.conf; then
        log "Rate limiting configured in Nginx"
    else
        warn "Rate limiting not configured in Nginx"
    fi
    
    # Check if security headers are configured
    if grep -q "add_header.*X-Frame-Options" nginx/conf.d/wordpress.conf; then
        log "Security headers configured in Nginx"
    else
        warn "Security headers not configured in Nginx"
    fi
    echo
    
    # Check backup and monitoring setup
    info "Checking backup and monitoring setup..."
    
    if grep -q "wordpress-backup.sh" setup-vps.sh; then
        log "Backup script setup is configured"
    else
        warn "Backup script setup not found"
    fi
    
    if grep -q "wordpress-monitor.sh" setup-vps.sh; then
        log "Monitoring script setup is configured"
    else
        warn "Monitoring script setup not found"
    fi
    echo
    
    # Summary
    info "Verification Summary"
    info "==================="
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo
    
    if [ $FAILED -eq 0 ]; then
        if [ $WARNINGS -eq 0 ]; then
            log "All checks passed! Setup is ready for deployment."
            echo
            info "Next steps:"
            info "1. Copy this directory to your VPS"
            info "2. Run ./setup-vps.sh to prepare the server"
            info "3. Create .env file from .env.example"
            info "4. Run ./deploy.sh to deploy WordPress"
        else
            warn "Setup is mostly ready, but please review the warnings above."
        fi
    else
        error "Setup verification failed. Please fix the errors above before deployment."
        exit 1
    fi
}

# Run verification
main "$@"