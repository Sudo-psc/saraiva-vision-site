#!/bin/bash
# Quick Deploy Script for Saraiva Vision

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              SARAIVA VISION - QUICK DEPLOY                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Build
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

# Deploy
echo ""
echo "🚀 Deploying to production..."
sudo rsync -av --delete dist/ /var/www/html/

# Reload nginx
echo ""
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Deploy completed successfully!"
echo ""
echo "Production URL: https://saraivavision.com.br"
echo ""
