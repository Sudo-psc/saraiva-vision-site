#!/bin/bash
# Deploy Script - Saraiva Vision
# Automated deployment to production

set -e  # Exit on any error

echo "🚀 Saraiva Vision - Deploy Automation"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run with sudo: sudo ./scripts/deploy.sh"
    exit 1
fi

# Step 1: Build
echo "📦 Step 1: Building application..."
cd "$PROJECT_DIR"
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 2: Backup current production
echo ""
echo "💾 Step 2: Creating backup..."
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

if [ -d "$PROD_DIR" ]; then
    tar -czf "$BACKUP_FILE" -C "$PROD_DIR" . 2>/dev/null || true
    print_success "Backup created: $BACKUP_FILE"
else
    print_warning "Production directory not found, skipping backup"
fi

# Step 3: Deploy
echo ""
echo "🚢 Step 3: Deploying to production..."

# Copy dist files to production
cp -r "$PROJECT_DIR/dist/"* "$PROD_DIR/"

# Ensure correct permissions
chown -R www-data:www-data "$PROD_DIR"
chmod -R 755 "$PROD_DIR"

print_success "Files deployed to $PROD_DIR"

# Step 4: Copy optimized images (if they exist)
echo ""
echo "🖼️  Step 4: Deploying optimized images..."
if [ -d "$PROJECT_DIR/public/Blog" ]; then
    cp -r "$PROJECT_DIR/public/Blog/"*.webp "$PROD_DIR/Blog/" 2>/dev/null || true
    cp -r "$PROJECT_DIR/public/Blog/"*.avif "$PROD_DIR/Blog/" 2>/dev/null || true
    print_success "Optimized images deployed"
else
    print_warning "No blog images to deploy"
fi

# Step 5: Reload Nginx
echo ""
echo "🔄 Step 5: Reloading Nginx..."
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

# Step 6: Verify deployment
echo ""
echo "🔍 Step 6: Verifying deployment..."

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running"
    exit 1
fi

# Check if site is accessible
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_STATUS" == "200" ]; then
    print_success "Site is accessible (HTTP $HTTP_STATUS)"
else
    print_warning "Site returned HTTP $HTTP_STATUS"
fi

# Step 7: Cleanup old backups (keep last 5)
echo ""
echo "🧹 Step 7: Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
print_success "Old backups cleaned (keeping last 5)"

# Summary
echo ""
echo "✅ Deployment completed successfully!"
echo "======================================"
echo "📊 Deployment Summary:"
echo "   - Build: ✓"
echo "   - Backup: $BACKUP_FILE"
echo "   - Deploy: ✓"
echo "   - Nginx: ✓"
echo "   - Site: HTTP $HTTP_STATUS"
echo ""
echo "🌐 Site URL: https://saraivavision.com.br"
echo "📝 To rollback: sudo tar -xzf $BACKUP_FILE -C $PROD_DIR && sudo systemctl reload nginx"
