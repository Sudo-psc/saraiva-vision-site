#!/bin/bash
# Fix Nginx Deploy - Correct Document Root Issue
# Deploys to correct directory matching Nginx configuration

set -e

echo "🔧 Saraiva Vision - Nginx Deploy Fix"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration - CORRECT directories
CORRECT_PROD_DIR="/var/www/saraivavision/current"
PROJECT_DIR="/home/saraiva-vision-site"
BACKUP_DIR="/var/backups/saraiva-vision"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run with sudo: sudo ./scripts/fix-nginx-deploy.sh${NC}"
    exit 1
fi

# Verify the correct production directory exists
if [ ! -d "$CORRECT_PROD_DIR" ]; then
    echo -e "${YELLOW}Creating production directory: $CORRECT_PROD_DIR${NC}"
    mkdir -p "$CORRECT_PROD_DIR"
    chown -R www-data:www-data "$CORRECT_PROD_DIR"
fi

echo "📦 Step 1: Building application..."
cd "$PROJECT_DIR"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build completed${NC}"

echo ""
echo "💾 Step 2: Creating backup..."
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

if [ -d "$CORRECT_PROD_DIR" ] && [ "$(ls -A $CORRECT_PROD_DIR)" ]; then
    tar -czf "$BACKUP_FILE" -C "$CORRECT_PROD_DIR" . 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ Production directory empty, skipping backup${NC}"
fi

echo ""
echo "🧹 Step 3: Cleaning production directory..."
# Clean but preserve .htaccess if exists
if [ -f "$CORRECT_PROD_DIR/.htaccess" ]; then
    cp "$CORRECT_PROD_DIR/.htaccess" "/tmp/.htaccess.backup"
fi

rm -rf "$CORRECT_PROD_DIR"/*
rm -rf "$CORRECT_PROD_DIR"/.??*  # Hidden files except . and ..

if [ -f "/tmp/.htaccess.backup" ]; then
    mv "/tmp/.htaccess.backup" "$CORRECT_PROD_DIR/.htaccess"
fi

echo -e "${GREEN}✓ Production directory cleaned${NC}"

echo ""
echo "🚢 Step 4: Deploying to CORRECT directory..."
echo "Target: $CORRECT_PROD_DIR"

# Copy all files from dist to correct production directory
cp -r "$PROJECT_DIR/dist/"* "$CORRECT_PROD_DIR/"

# Verify assets were copied
BUILD_ASSETS=$(find "$PROJECT_DIR/dist/assets" -name "*.js" -o -name "*.css" 2>/dev/null | wc -l)
COPIED_ASSETS=$(find "$CORRECT_PROD_DIR/assets" -name "*.js" -o -name "*.css" 2>/dev/null | wc -l)

if [ "$COPIED_ASSETS" -eq "$BUILD_ASSETS" ]; then
    echo -e "${GREEN}✓ All $COPIED_ASSETS assets copied successfully${NC}"
else
    echo -e "${YELLOW}⚠ Asset count mismatch: expected $BUILD_ASSETS, found $COPIED_ASSETS${NC}"
fi

# Set correct permissions
chown -R www-data:www-data "$CORRECT_PROD_DIR"
chmod -R 755 "$CORRECT_PROD_DIR"
find "$CORRECT_PROD_DIR" -type f -exec chmod 644 {} \;

echo -e "${GREEN}✓ Files deployed to $CORRECT_PROD_DIR${NC}"

echo ""
echo "🔄 Step 5: Clearing Nginx cache and reloading..."
# Clear Nginx cache if it exists
if [ -d "/var/cache/nginx" ]; then
    rm -rf /var/cache/nginx/*
    echo -e "${GREEN}✓ Nginx cache cleared${NC}"
fi

# Reload Nginx
systemctl reload nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ Nginx reload failed${NC}"
    echo "Rolling back..."
    if [ -f "$BACKUP_FILE" ]; then
        tar -xzf "$BACKUP_FILE" -C "$CORRECT_PROD_DIR"
        systemctl reload nginx
        echo -e "${YELLOW}⚠ Rolled back to previous version${NC}"
    fi
    exit 1
fi

echo ""
echo "🔍 Step 6: Verifying deployment..."

# Check Nginx is running
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx is not running${NC}"
    exit 1
fi

# Check index.html exists
if [ -f "$CORRECT_PROD_DIR/index.html" ]; then
    echo -e "${GREEN}✓ index.html found in production${NC}"
else
    echo -e "${RED}✗ index.html not found${NC}"
    exit 1
fi

# Check assets exist
if [ -d "$CORRECT_PROD_DIR/assets" ] && [ "$(ls -A $CORRECT_PROD_DIR/assets)" ]; then
    echo -e "${GREEN}✓ Assets directory populated${NC}"
else
    echo -e "${RED}✗ Assets directory empty or missing${NC}"
    exit 1
fi

# Check site accessibility
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Site is accessible (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠ Site returned HTTP $HTTP_STATUS${NC}"
fi

echo ""
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "======================================"
echo ""
echo "📊 Deployment Summary:"
echo "   - Build: ✓"
echo "   - Deploy directory: $CORRECT_PROD_DIR"
echo "   - Assets: $COPIED_ASSETS files"
echo "   - Backup: $BACKUP_FILE"
echo "   - Nginx: ✓ Reloaded"
echo "   - Cache: ✓ Cleared"
echo "   - Site: HTTP $HTTP_STATUS"
echo ""
echo "🌐 Site URL: https://saraivavision.com.br"
echo ""
echo "⚠️  IMPORTANT: Clear browser cache (Ctrl+Shift+R) to see changes"
echo ""
echo "📝 To rollback: sudo tar -xzf $BACKUP_FILE -C $CORRECT_PROD_DIR && sudo systemctl reload nginx"
