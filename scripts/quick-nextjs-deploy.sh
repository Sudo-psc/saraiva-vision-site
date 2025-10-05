#!/bin/bash
# Quick Next.js Standalone Deploy - Saraiva Vision
# Fast deployment for minor updates with API support

set -e

echo "⚡ Quick Next.js Deploy - Saraiva Vision"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo ./scripts/quick-nextjs-deploy.sh"
    exit 1
fi

# Configuration
PROJECT_DIR="/home/saraiva-vision-site"
NEXTJS_DIR="/opt/nextjs-saraiva"
SERVICE_NAME="saraiva-vision"

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Build
echo "📦 Building Next.js..."
cd "$PROJECT_DIR"
rm -rf .next/
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Build completed"
else
    print_error "Build failed"
    exit 1
fi

# Deploy files
echo "🚢 Deploying to $NEXTJS_DIR..."
cp -r .next "$NEXTJS_DIR/"
cp -r public "$NEXTJS_DIR/"
chown -R www-data:www-data "$NEXTJS_DIR"

# Restart service
echo "🔄 Restarting Next.js service..."
systemctl restart "$SERVICE_NAME"

# Wait for service to start
sleep 3

# Verify
if systemctl is-active --quiet "$SERVICE_NAME"; then
    print_success "Service is running"
else
    print_error "Service failed to start"
    systemctl status "$SERVICE_NAME" --no-pager
    exit 1
fi

# Test API
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/config)
if [ "$API_STATUS" == "200" ]; then
    print_success "API endpoints working"
else
    print_warning "API returned HTTP $API_STATUS"
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx > /dev/null 2>&1

echo -e "${GREEN}✅ Quick deploy completed!${NC}"
echo "🌐 https://saraivavision.com.br"
echo "🔧 Service: sudo systemctl status $SERVICE_NAME"