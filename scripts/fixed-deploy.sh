#!/bin/bash
# Fixed Deploy Script - Saraiva Vision
# Addresses asset copying and version control issues

set -e  # Exit on any error

echo "🚀 Saraiva Vision - Fixed Deploy Script"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROD_DIR="/var/www/html"
PROJECT_DIR="/home/saraiva-vision-site"
BACKUP_DIR="/var/backups/saraiva-vision"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Function to print colored output
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

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run with sudo: sudo ./scripts/fixed-deploy.sh"
    exit 1
fi

# Step 1: Clean previous build
echo "🧹 Step 1: Cleaning previous build..."
cd "$PROJECT_DIR"
rm -rf dist/
print_success "Previous build cleaned"

# Step 2: Build
echo ""
echo "📦 Step 2: Building application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 3: Verify build structure
echo ""
echo "🔍 Step 3: Verifying build structure..."
if [ ! -d "$PROJECT_DIR/dist/assets" ]; then
    print_error "Assets directory not found in build"
    exit 1
fi

ASSETS_COUNT=$(find "$PROJECT_DIR/dist/assets" -name "*.js" -o -name "*.css" | wc -l)
print_info "Found $ASSETS_COUNT asset files in build"

# Step 4: Backup current production
echo ""
echo "💾 Step 4: Creating backup..."
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

if [ -d "$PROD_DIR" ]; then
    tar -czf "$BACKUP_FILE" -C "$PROD_DIR" . 2>/dev/null || true
    print_success "Backup created: $BACKUP_FILE"
else
    print_warning "Production directory not found, skipping backup"
fi

# Step 5: Clean production directory (except specific dirs)
echo ""
echo "🧹 Step 5: Cleaning production directory..."
# Remove files but preserve structure for specific directories
find "$PROD_DIR" -maxdepth 1 -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" -o -name "*.txt" -o -name "*.xml" -o -name "*.webmanifest" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.ico" \) -delete 2>/dev/null || true

# Remove and recreate assets directory
rm -rf "$PROD_DIR/assets" 2>/dev/null || true
print_success "Production directory cleaned"

# Step 6: Deploy ALL build files
echo ""
echo "🚢 Step 6: Deploying to production..."

# Copy everything from dist (including assets)
cp -r "$PROJECT_DIR/dist/"* "$PROD_DIR/"

# Ensure correct permissions
chown -R www-data:www-data "$PROD_DIR"
chmod -R 755 "$PROD_DIR"

# Verify assets were copied
COPIED_ASSETS=$(find "$PROD_DIR/assets" -name "*.js" -o -name "*.css" 2>/dev/null | wc -l)
if [ "$COPIED_ASSETS" -eq "$ASSETS_COUNT" ]; then
    print_success "All $COPIED_ASSETS assets copied successfully"
else
    print_error "Asset count mismatch: expected $ASSETS_COUNT, found $COPIED_ASSETS"
    exit 1
fi

print_success "Files deployed to $PROD_DIR"

# Step 7: Copy optimized images (if they exist)
echo ""
echo "🖼️  Step 7: Deploying optimized images..."
if [ -d "$PROJECT_DIR/public/Blog" ]; then
    cp -r "$PROJECT_DIR/public/Blog/"*.webp "$PROD_DIR/Blog/" 2>/dev/null || true
    cp -r "$PROJECT_DIR/public/Blog/"*.avif "$PROD_DIR/Blog/" 2>/dev/null || true
    print_success "Optimized images deployed"
else
    print_warning "No blog images to deploy"
fi

# Step 8: Reload Nginx
echo ""
echo "🔄 Step 8: Reloading Nginx..."
systemctl reload nginx

if [ $? -eq 0 ]; then
    print_success "Nginx reloaded successfully"
else
    print_error "Nginx reload failed"
    echo ""
    echo "🔙 Rolling back to backup..."
    if [ -f "$BACKUP_FILE" ]; then
        tar -xzf "$BACKUP_FILE" -C "$PROD_DIR"
        systemctl reload nginx
        print_warning "Rolled back to previous version"
    fi
    exit 1
fi

# Step 9: Verify deployment
echo ""
echo "🔍 Step 9: Verifying deployment..."

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
    exit 1
fi

# Check if index.html exists
if [ -f "$PROD_DIR/index.html" ]; then
    print_success "index.html found in production"
else
    print_error "index.html not found in production"
    exit 1
fi

# Check if assets exist
if [ -d "$PROD_DIR/assets" ] && [ "$(ls -A "$PROD_DIR/assets")" ]; then
    print_success "Assets directory is populated"
else
    print_error "Assets directory is empty or missing"
    exit 1
fi

# Check if site is accessible
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_STATUS" == "200" ]; then
    print_success "Site is accessible (HTTP $HTTP_STATUS)"
else
    print_warning "Site returned HTTP $HTTP_STATUS"
fi

# Step 10: Cleanup old backups (keep last 5)
echo ""
echo "🧹 Step 10: Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
print_success "Old backups cleaned (keeping last 5)"

# Summary
echo ""
echo "✅ Deployment completed successfully!"
echo "======================================"
echo "📊 Deployment Summary:"
echo "   - Build: ✓"
echo "   - Assets: $COPIED_ASSETS files"
echo "   - Backup: $BACKUP_FILE"
echo "   - Deploy: ✓"
echo "   - Nginx: ✓"
echo "   - Site: HTTP $HTTP_STATUS"
echo ""
echo "🌐 Site URL: https://saraivavision.com.br"
echo "📝 To rollback: sudo tar -xzf $BACKUP_FILE -C $PROD_DIR && sudo systemctl reload nginx"