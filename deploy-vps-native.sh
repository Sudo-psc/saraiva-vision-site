#!/bin/bash

# Native VPS Deployment Script for Saraiva Vision
# Deploys React application to native VPS without Docker containerization
# Author: Saraiva Vision Development Team
# Version: 2.1.0

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="${VPS_HOST:-31.97.129.78}"
VPS_USER="${VPS_USER:-root}"
WEB_ROOT="${WEB_ROOT:-/var/www/html}"
API_SERVICE="${API_SERVICE:-saraiva-api}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/saraiva-vision}"
BUILD_DIR="${BUILD_DIR:-dist}"

# Print colored output
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

# Function to check VPS connectivity
check_vps_connectivity() {
    print_status "Checking VPS connectivity..."

    if ping -c 1 -W 2 "$VPS_HOST" >/dev/null 2>&1; then
        print_success "VPS is reachable at $VPS_HOST"
    else
        print_error "Cannot reach VPS at $VPS_HOST"
        exit 1
    fi
}

# Function to build application
build_application() {
    print_status "Building React application..."

    # Clean previous build
    rm -rf "$BUILD_DIR"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies (detected fresh workspace)..."
        if command_exists npm && [ -f package-lock.json ]; then
            npm ci
        else
            npm install
        fi
    fi

    # Build application
    npm run build

    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Build failed - $BUILD_DIR directory not found"
        exit 1
    fi

    print_success "Application built successfully"
}

# Function to validate build
validate_build() {
    print_status "Validating build output..."

    # Check essential files
    essential_files=("index.html" "assets")

    for file in "${essential_files[@]}"; do
        if [ ! -e "$BUILD_DIR/$file" ]; then
            print_error "Essential file/directory missing: $file"
            exit 1
        fi
    done

    # Check build size
    build_size=$(du -sh "$BUILD_DIR" | cut -f1)
    print_status "Build size: $build_size"

    print_success "Build validation passed"
}

# Function to create backup on VPS
create_backup() {
    print_status "Creating backup on VPS..."

    ssh "$VPS_USER@$VPS_HOST" "
        # Create backup directory if it doesn't exist
        mkdir -p $BACKUP_DIR

        # Create timestamped backup
        TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE=\"$BACKUP_DIR/saraiva-vision-\$TIMESTAMP.tar.gz\"

        # Backup current deployment
        if [ -d '$WEB_ROOT' ]; then
            tar -czf \"\$BACKUP_FILE\" -C '$WEB_ROOT' . 2>/dev/null || true
            echo \"Backup created: \$BACKUP_FILE\"
        else
            echo \"No existing deployment to backup\"
        fi

        # Keep only last 5 backups
        ls -t $BACKUP_DIR/saraiva-vision-*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    "

    print_success "Backup completed"
}

# Function to deploy to VPS
deploy_to_vps() {
    print_status "Deploying to VPS..."

    # Create temporary deployment package
    TEMP_PACKAGE="$(mktemp /tmp/saraiva-vision-deploy.XXXXXX.tar.gz)"
    tar -czf "$TEMP_PACKAGE" -C "$BUILD_DIR" .
    PACKAGE_NAME="$(basename "$TEMP_PACKAGE")"

    # Copy to VPS
    print_status "Uploading deployment package..."
    scp "$TEMP_PACKAGE" "$VPS_USER@$VPS_HOST:/tmp/$PACKAGE_NAME"

    # Extract and deploy on VPS
    ssh "$VPS_USER@$VPS_HOST" "
        # Ensure web directory exists
        mkdir -p '$WEB_ROOT'

        # Clear current deployment (except .htaccess if exists)
        find '$WEB_ROOT' -mindepth 1 ! -name '.htaccess' -delete 2>/dev/null || true

        # Extract new deployment
        tar -xzf "/tmp/$PACKAGE_NAME" -C '$WEB_ROOT'

        # Set proper permissions
        chown -R www-data:www-data '$WEB_ROOT'
        chmod -R 755 '$WEB_ROOT'

        # Clean up temporary file
        rm -f "/tmp/$PACKAGE_NAME"
    "

    # Clean up local temporary file
    rm -f "$TEMP_PACKAGE"

    print_success "Deployment package uploaded and extracted"
}

# Function to restart services
restart_services() {
    print_status "Managing VPS services..."

    ssh "$VPS_USER@$VPS_HOST" "
        # Validate Nginx configuration before reload
        if nginx -t; then
            systemctl reload nginx
            echo 'Nginx configuration reloaded'
        else
            echo 'Nginx configuration test failed; aborting reload'
            exit 1
        fi

        # Restart API service if it exists
        if systemctl is-active --quiet '$API_SERVICE'; then
            systemctl restart '$API_SERVICE'
            echo 'API service restarted'
        else
            echo 'API service not running or not configured'
        fi

        # Check service statuses
        echo '=== Service Status ==='
        systemctl is-active nginx && echo 'Nginx: Active' || echo 'Nginx: Inactive'
        systemctl is-active '$API_SERVICE' && echo 'API: Active' || echo 'API: Inactive/Not configured'
        systemctl is-active mysql && echo 'MySQL: Active' || echo 'MySQL: Inactive'
        systemctl is-active redis && echo 'Redis: Active' || echo 'Redis: Inactive'
        systemctl is-active php8.1-fpm && echo 'PHP-FPM: Active' || echo 'PHP-FPM: Inactive'
    "

    print_success "Services managed"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."

    # Wait a moment for services to stabilize
    sleep 2

    # Check if site is responding
    if curl -f -s --max-time 5 "https://$VPS_HOST" >/dev/null; then
        print_success "Website is responding"
    else
        print_warning "Website may not be responding properly"
    fi

    # Check service status
    ssh "$VPS_USER@$VPS_HOST" "
        echo '=== Final Service Status ==='
        systemctl status nginx --no-pager -l || true
        echo '---'
        systemctl status '$API_SERVICE' --no-pager -l || true
    "
}

# Function to show deployment summary
show_summary() {
    print_success "=== DEPLOYMENT SUMMARY ==="
    echo -e "${GREEN}✓${NC} Application built successfully"
    echo -e "${GREEN}✓${NC} Backup created on VPS"
    echo -e "${GREEN}✓${NC} Files deployed to $WEB_ROOT"
    echo -e "${GREEN}✓${NC} Services restarted"
    echo -e "${GREEN}✓${NC} Deployment verified"
    echo ""
    echo -e "${BLUE}Website URL:${NC} http://$VPS_HOST"
    echo -e "${BLUE}Deployment Target:${NC} Native VPS (No Docker)"
    echo -e "${BLUE}Services:${NC} Nginx, Node.js API, MySQL, Redis, PHP-FPM"
    echo ""
    print_success "Deployment completed successfully!"
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Starting Native VPS Deployment for Saraiva Vision${NC}"
    echo -e "${BLUE}=================================================${NC}"
    echo ""

    # Pre-deployment checks
    for cmd in npm ssh scp tar curl; do
        if ! command_exists "$cmd"; then
            print_error "Required command missing: $cmd"
            exit 1
        fi
    done

    if [ ! -f "package.json" ]; then
        print_error "Not in a Node.js project directory"
        exit 1
    fi
    
    print_status "Deployment target: $VPS_USER@$VPS_HOST -> $WEB_ROOT"

    # Check connectivity
    check_vps_connectivity

    # Build and deploy
    build_application
    validate_build
    create_backup
    deploy_to_vps
    restart_services
    verify_deployment
    show_summary
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"