#!/bin/bash
# Deploy Verification Script - Saraiva Vision
# Verifies deployment integrity and identifies issues

set -e

echo "🔍 Saraiva Vision - Deploy Verification"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

PROD_DIR="/var/www/html"
PROJECT_DIR="/home/saraiva-vision-site"

echo "📋 Step 1: Checking deployment sync..."

# Check if production files exist
if [ -f "$PROD_DIR/index.html" ]; then
    PROD_TIME=$(stat -c "%Y" "$PROD_DIR/index.html")
    print_success "Production index.html exists (timestamp: $PROD_TIME)"
else
    print_error "Production index.html missing"
    exit 1
fi

if [ -f "$PROJECT_DIR/dist/index.html" ]; then
    DIST_TIME=$(stat -c "%Y" "$PROJECT_DIR/dist/index.html")
    print_success "Dist index.html exists (timestamp: $DIST_TIME)"
else
    print_error "Dist index.html missing - run build first"
    exit 1
fi

# Compare timestamps
TIME_DIFF=$((PROD_TIME - DIST_TIME))
if [ $TIME_DIFF -gt 300 ]; then  # 5 minutes tolerance
    print_warning "Production is older than build by ${TIME_DIFF}s"
else
    print_success "Production and build are in sync"
fi

echo ""
echo "📦 Step 2: Verifying assets..."

# Count assets in both locations
PROD_ASSETS=$(find "$PROD_DIR/assets" -name "*.js" -o -name "*.css" 2>/dev/null | wc -l)
DIST_ASSETS=$(find "$PROJECT_DIR/dist/assets" -name "*.js" -o -name "*.css" 2>/dev/null | wc -l)

print_info "Production assets: $PROD_ASSETS files"
print_info "Build assets: $DIST_ASSETS files"

if [ "$PROD_ASSETS" -eq "$DIST_ASSETS" ] && [ "$PROD_ASSETS" -gt 0 ]; then
    print_success "Asset count matches"
else
    print_error "Asset count mismatch or missing assets"
    if [ "$PROD_ASSETS" -eq 0 ]; then
        print_info "Assets not deployed - run fixed-deploy.sh"
    fi
fi

echo ""
echo "🔧 Step 3: Checking key files..."

# Check for critical files
CRITICAL_FILES=("index.html" "sw.js" "robots.txt" "sitemap.xml")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$PROD_DIR/$file" ]; then
        print_success "$file exists"
    else
        print_error "$file missing"
    fi
done

echo ""
echo "🌐 Step 4: Checking site accessibility..."

# Check HTTP status
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_STATUS" == "200" ]; then
    print_success "Site accessible (HTTP $HTTP_STATUS)"
else
    print_error "Site not accessible (HTTP $HTTP_STATUS)"
fi

# Check HTTPS status
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" == "200" ]; then
    print_success "HTTPS site accessible (HTTP $HTTPS_STATUS)"
else
    print_warning "HTTPS site not accessible (HTTP $HTTPS_STATUS)"
fi

echo ""
echo "📊 Step 5: Deployment Summary"
echo "=============================="
echo "Production Dir: $PROD_DIR"
echo "Build Dir: $PROJECT_DIR/dist"
echo "Production Assets: $PROD_ASSETS"
echo "Build Assets: $DIST_ASSETS"
echo "HTTP Status: $HTTP_STATUS"
echo "HTTPS Status: $HTTPS_STATUS"

echo ""
if [ "$PROD_ASSETS" -eq "$DIST_ASSETS" ] && [ "$PROD_ASSETS" -gt 0 ] && [ "$HTTP_STATUS" == "200" ]; then
    print_success "Deployment verification PASSED"
    exit 0
else
    print_error "Deployment verification FAILED"
    print_info "Run: sudo ./scripts/fixed-deploy.sh"
    exit 1
fi