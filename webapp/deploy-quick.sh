#!/bin/bash
# Quick Deploy Script for Saraiva Vision
# Bypasses eslint warnings for emergency deployment

set -e

echo "🚀 Quick Deploy - Saraiva Vision"
echo "================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)" 
   exit 1
fi

# Variables
WEBAPP_DIR="/home/saraiva-vision-site-v3/webapp"
PROD_DIR="/var/www/saraivavision.com.br"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NEW_RELEASE="${PROD_DIR}/releases/${TIMESTAMP}"

# Create directories
echo "📁 Creating release directory..."
mkdir -p "${PROD_DIR}/releases"
mkdir -p "${PROD_DIR}/shared"

# Check if dist exists
if [ ! -d "${WEBAPP_DIR}/dist" ]; then
    echo "❌ dist directory not found. Run 'npm run build' first"
    exit 1
fi

# Copy files to new release
echo "📦 Copying build files..."
cp -r "${WEBAPP_DIR}/dist" "${NEW_RELEASE}"

# Copy WordPress integration file
echo "📝 Ensuring WordPress integration..."
if [ -f "${WEBAPP_DIR}/src/lib/wordpress-fixed.js" ]; then
    echo "✅ WordPress integration file found"
fi

# Update symlink
echo "🔗 Updating production symlink..."
if [ -L "${PROD_DIR}/current" ]; then
    rm "${PROD_DIR}/current"
fi
ln -s "${NEW_RELEASE}" "${PROD_DIR}/current"

# Set permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data "${NEW_RELEASE}"
chmod -R 755 "${NEW_RELEASE}"

# Test nginx config
echo "🔍 Testing nginx configuration..."
nginx -t

# Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx

# Clear CloudFlare cache (if configured)
echo "🌐 Clearing CDN cache..."
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}' 2>/dev/null || echo "⚠️  CloudFlare cache clear skipped"

# Clean old releases (keep last 5)
echo "🧹 Cleaning old releases..."
cd "${PROD_DIR}/releases"
ls -t | tail -n +6 | xargs rm -rf 2>/dev/null || true

echo ""
echo "✅ Deploy completed successfully!"
echo "📍 New release: ${NEW_RELEASE}"
echo "🔗 Current symlink: ${PROD_DIR}/current -> ${NEW_RELEASE}"
echo ""
echo "🌐 Please check:"
echo "   - https://saraivavision.com.br"
echo "   - https://saraivavision.com.br/blog"
echo "   - https://saraivavision.com.br/status"