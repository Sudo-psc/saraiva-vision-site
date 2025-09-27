#!/bin/bash

# API Deployment Script for Saraiva Vision
# Deploys API changes to the VPS server
# Author: Saraiva Vision Development Team
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="31.97.129.78"
VPS_USER="root"
API_ROOT="/opt/saraiva-vision-api"
API_SERVICE="saraiva-api"
BACKUP_DIR="/var/backups/saraiva-vision-api"

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

# Function to check VPS connectivity
check_vps_connectivity() {
    print_status "Checking VPS connectivity..."

    if ping -c 1 "$VPS_HOST" >/dev/null 2>&1; then
        print_success "VPS is reachable at $VPS_HOST"
    else
        print_error "Cannot reach VPS at $VPS_HOST"
        exit 1
    fi
}

# Function to deploy API files
deploy_api_files() {
    print_status "Deploying API files to VPS..."

    # Create temporary API package
    TEMP_PACKAGE="/tmp/saraiva-vision-api-$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$TEMP_PACKAGE" -C "api" .

    # Copy to VPS
    print_status "Uploading API package..."
    scp "$TEMP_PACKAGE" "$VPS_USER@$VPS_HOST:/tmp/"

    # Extract and deploy on VPS
    ssh "$VPS_USER@$VPS_HOST" "
        # Ensure API directory exists
        mkdir -p '$API_ROOT'

        # Extract new API files
        tar -xzf '/tmp/$(basename $TEMP_PACKAGE)' -C '$API_ROOT'

        # Install/update dependencies
        cd '$API_ROOT'
        if [ -f 'package.json' ]; then
            npm install --production
            echo 'API dependencies installed/updated'
        fi

        # Set proper permissions
        chown -R www-data:www-data '$API_ROOT'
        chmod -R 755 '$API_ROOT'

        # Clean up temporary file
        rm -f '/tmp/$(basename $TEMP_PACKAGE)'
    "

    # Clean up local temporary file
    rm -f "$TEMP_PACKAGE"

    print_success "API files deployed successfully"
}

# Function to restart API service
restart_api_service() {
    print_status "Restarting API service..."

    ssh "$VPS_USER@$VPS_HOST" "
        # Check if service file exists, create if not
        if [ ! -f '/etc/systemd/system/$API_SERVICE.service' ]; then
            echo 'Creating systemd service file...'
            cat > /etc/systemd/system/$API_SERVICE.service << 'EOF'
[Unit]
Description=Saraiva Vision API Service
After=network.target mysql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$API_ROOT
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF

            systemctl daemon-reload
            systemctl enable $API_SERVICE
            echo 'API service created and enabled'
        fi

        # Restart API service
        systemctl restart $API_SERVICE
        echo 'API service restarted'

        # Check service status
        systemctl is-active $API_SERVICE && echo 'API Service: Active' || echo 'API Service: Failed to start'
    "

    print_success "API service restarted"
}

# Function to test image proxy specifically
test_image_proxy() {
    print_status "Testing image proxy functionality..."

    # Test the proxy endpoint
    local test_url="http://$VPS_HOST:3001/api/images/proxy/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/a8dfe42cbf2667c6fde2f934ce773078.png"

    if curl -f -s -I "$test_url" >/dev/null 2>&1; then
        print_success "Image proxy is working correctly"
        echo "Test URL: $test_url"
    else
        print_warning "Image proxy may not be working - will test after full deployment"
    fi
}

# Function to show deployment summary
show_summary() {
    print_success "=== API DEPLOYMENT SUMMARY ==="
    echo -e "${GREEN}✓${NC} API files deployed to $API_ROOT"
    echo -e "${GREEN}✓${NC} Dependencies installed/updated"
    echo -e "${GREEN}✓${NC} API service restarted"
    echo ""
    echo -e "${BLUE}API Base URL:${NC} http://$VPS_HOST:3001"
    echo -e "${BLUE}Image Proxy:${NC} http://$VPS_HOST:3001/api/images/proxy/:path(*)"
    echo -e "${BLUE}Service:${NC} $API_SERVICE"
    echo ""
    print_success "API deployment completed successfully!"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Starting API Deployment for Saraiva Vision${NC}"
    echo -e "${BLUE}=========================================${NC}"
    echo ""

    # Pre-deployment checks
    if ! command_exists ssh; then
        print_error "ssh is not installed"
        exit 1
    fi

    if [ ! -d "api" ]; then
        print_error "API directory not found"
        exit 1
    fi

    # Check connectivity
    check_vps_connectivity

    # Deploy API
    deploy_api_files
    restart_api_service
    test_image_proxy
    show_summary
}

# Handle script interruption
trap 'print_error "API deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"