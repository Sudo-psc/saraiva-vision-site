#!/bin/bash
# Quick Deploy Script - Saraiva Vision
# Fast deployment without backup (use for minor updates)

set -e

echo "⚡ Quick Deploy - Saraiva Vision"
echo "================================"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo ./scripts/quick-deploy.sh"
    exit 1
fi

# CORRECT production directory matching Nginx config
PROD_DIR="/var/www/saraivavision/current"

# Build
echo "📦 Building..."
cd /home/saraiva-vision-site
npm run build > /dev/null 2>&1

# Deploy
echo "🚢 Deploying to $PROD_DIR..."
cp -r dist/* "$PROD_DIR/"
chown -R www-data:www-data "$PROD_DIR"

# Clear cache
echo "🧹 Clearing cache..."
rm -rf /var/cache/nginx/* 2>/dev/null || true

# Reload
echo "🔄 Reloading..."
systemctl reload nginx > /dev/null 2>&1

echo -e "${GREEN}✅ Deploy completed!${NC}"
echo "🌐 https://saraivavision.com.br"
