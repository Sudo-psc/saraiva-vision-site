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

# Build
echo "📦 Building..."
cd /home/saraiva-vision-site
npm run build > /dev/null 2>&1

# Deploy
echo "🚢 Deploying..."
cp -r dist/* /var/www/html/
chown -R www-data:www-data /var/www/html

# Reload
echo "🔄 Reloading..."
systemctl reload nginx > /dev/null 2>&1

echo -e "${GREEN}✅ Deploy completed!${NC}"
echo "🌐 https://saraivavision.com.br"
