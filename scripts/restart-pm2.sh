#!/bin/bash

set -euo pipefail

echo "🔄 Restarting PM2 Application"
echo "=============================="
echo ""

DEPLOY_DIR="/var/www/saraivavision/releases/20251005_032315"

if [[ ! -d "$DEPLOY_DIR" ]]; then
    echo "❌ Error: Deploy directory not found: $DEPLOY_DIR"
    exit 1
fi

echo "📁 Working directory: $DEPLOY_DIR"
echo ""

echo "🛑 Stopping old PM2 processes..."
pm2 delete saraiva-nextjs 2>/dev/null || echo "   No existing process to delete"

echo ""
echo "🚀 Starting new PM2 process..."
cd "$DEPLOY_DIR"

pm2 start npm --name "saraiva-nextjs" -- start -- -p 3002

echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "✅ PM2 restart complete!"
echo ""
echo "📝 View logs: pm2 logs saraiva-nextjs"
echo "📊 Monitor: pm2 monit"
