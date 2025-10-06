#!/bin/bash

# ==============================================================================
# Install GitHub Webhook Receiver
# ==============================================================================

set -e

PROJECT_ROOT="/home/saraiva-vision-site"
SCRIPT_DIR="$PROJECT_ROOT/scripts"

echo "🔧 Installing GitHub Webhook Receiver..."

# 1. Create logs directory
echo "📁 Creating logs directory..."
mkdir -p "$PROJECT_ROOT/logs"
chmod 755 "$PROJECT_ROOT/logs"

# 2. Generate webhook secret if not exists
if [ ! -f "$PROJECT_ROOT/.env.webhook" ]; then
    echo "🔑 Generating webhook secret..."

    WEBHOOK_SECRET=$(openssl rand -hex 32)

    cat > "$PROJECT_ROOT/.env.webhook" <<EOF
# GitHub Webhook Receiver Configuration
WEBHOOK_PORT=9000
GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
GITHUB_PAT=\${GITHUB_PAT:-your_github_pat_here}
NODE_ENV=production
EOF

    chmod 600 "$PROJECT_ROOT/.env.webhook"

    echo "✅ Generated webhook secret: $WEBHOOK_SECRET"
    echo "⚠️  Configure this secret in GitHub repository webhook settings!"
else
    echo "ℹ️  .env.webhook already exists, skipping generation"
fi

# 3. Make webhook receiver executable
echo "🔐 Setting permissions..."
chmod +x "$SCRIPT_DIR/webhook-receiver.cjs"

# 4. Install systemd service
echo "⚙️  Installing systemd service..."
sudo cp "$SCRIPT_DIR/systemd/webhook-receiver.service" /etc/systemd/system/
sudo systemctl daemon-reload

# 5. Start and enable service
echo "🚀 Starting webhook receiver service..."
sudo systemctl enable webhook-receiver
sudo systemctl start webhook-receiver

# 6. Check service status
echo ""
echo "📊 Service status:"
sudo systemctl status webhook-receiver --no-pager -l

# 7. Test Nginx configuration
echo ""
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# 8. Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# 9. Display setup information
echo ""
echo "✅ Webhook receiver installed successfully!"
echo ""
echo "📋 Configuration Details:"
echo "  • Service: webhook-receiver.service"
echo "  • Port: 9000 (internal)"
echo "  • Public URL: https://saraivavision.com.br/webhook"
echo "  • Health Check: https://saraivavision.com.br/webhook/health"
echo "  • Logs: /home/saraiva-vision-site/logs/webhook.log"
echo "  • Service Logs: sudo journalctl -u webhook-receiver -f"
echo ""
echo "🔐 Webhook Secret (configure in GitHub):"
grep "GITHUB_WEBHOOK_SECRET" "$PROJECT_ROOT/.env.webhook" | cut -d'=' -f2
echo ""
echo "📖 Next Steps:"
echo "  1. Go to: https://github.com/Sudo-psc/saraivavision-site-v2/settings/hooks"
echo "  2. Click 'Add webhook'"
echo "  3. Payload URL: https://saraivavision.com.br/webhook"
echo "  4. Content type: application/json"
echo "  5. Secret: (paste the secret above)"
echo "  6. Events: Just the push event"
echo "  7. Active: ✓"
echo ""
echo "✅ Configuration complete!"
