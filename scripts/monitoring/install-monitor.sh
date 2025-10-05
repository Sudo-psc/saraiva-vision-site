#!/bin/bash

set -euo pipefail

echo "=== Saraiva Vision Monitoring - Installation Script ==="
echo ""

if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)" 
   exit 1
fi

echo "📦 Installing dependencies..."
apt-get update -qq
apt-get install -y parallel jq bc procps git curl

echo ""
echo "📁 Creating directories..."
mkdir -p /var/log/saraiva-monitoring
chmod 755 /var/log/saraiva-monitoring

echo ""
echo "🔧 Setting up monitoring script..."
SCRIPT_DIR="/home/saraiva-vision-site/scripts/monitoring"
chmod +x "${SCRIPT_DIR}/vps-monitor.sh"

echo ""
echo "⏰ Configuring systemd timer..."

cat > /etc/systemd/system/saraiva-monitor.service << 'EOF'
[Unit]
Description=Saraiva Vision VPS Monitoring Service
After=network.target nginx.service

[Service]
Type=oneshot
User=root
ExecStart=/home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh
StandardOutput=journal
StandardError=journal
EOF

cat > /etc/systemd/system/saraiva-monitor.timer << 'EOF'
[Unit]
Description=Saraiva Vision VPS Monitoring Timer
Requires=saraiva-monitor.service

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 06:00:00
Persistent=true

[Install]
WantedBy=timers.target
EOF

echo ""
echo "🔄 Enabling and starting timer..."
systemctl daemon-reload
systemctl enable saraiva-monitor.timer
systemctl start saraiva-monitor.timer

echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 Status check:"
systemctl status saraiva-monitor.timer --no-pager
echo ""
echo "🧪 Run test execution:"
echo "  sudo /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh"
echo ""
echo "📋 View reports:"
echo "  ls -lh /var/log/saraiva-monitoring/"
echo ""
echo "⏰ Next scheduled run:"
systemctl list-timers saraiva-monitor.timer --no-pager
