#!/bin/bash

# Saraiva Vision VPS Backend Deployment Script

set -e

# Configuration
VPS_IP="31.97.129.78"
VPS_USER="root"
LOCAL_DIR="$(pwd)"
REMOTE_DIR="/root"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

echo "🚀 Saraiva Vision VPS Backend Deployment"
echo "======================================"
echo "📍 VPS IP: $VPS_IP"
echo ""

# Check if setup script exists
if [ ! -f "vps-backend-setup.sh" ]; then
    error "Setup script not found. Please run this from the project root."
    exit 1
fi

# Test SSH connection
log "Testing SSH connection to $VPS_IP..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "echo 'SSH connection successful'"; then
    error "Failed to connect to VPS. Please check:"
    error "  - VPS is running at $VPS_IP"
    error "  - SSH service is enabled"
    error "  - Firewall allows SSH connections"
    error "  - You have SSH access as $VPS_USER"
    exit 1
fi

# Copy setup script to VPS
log "Copying setup script to VPS..."
scp vps-backend-setup.sh $VPS_USER@$VPS_IP:$REMOTE_DIR/

# Copy API endpoints
log "Copying existing API endpoints..."
if [ -d "api" ]; then
    scp -r api/* $VPS_USER@$VPS_IP:$REMOTE_DIR/temp-api/
else
    warn "No local API directory found, will use default endpoints"
fi

# Run setup script on VPS
log "Running backend setup on VPS..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /root
chmod +x vps-backend-setup.sh
./vps-backend-setup.sh

# Copy API endpoints if available
if [ -d "temp-api" ]; then
    cp -r temp-api/* /var/www/saraiva-vision-backend/api/src/routes/
    rm -rf temp-api
fi

echo "✅ Setup completed on VPS"
EOF

# Generate environment file template
log "Creating environment file template..."
cat > vps-env-template.txt << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
WORDPRESS_DB_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 16)

# API Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=$(openssl rand -base64 64)

# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
DOCTOR_EMAIL=philipe_cruz@outlook.com
CONTACT_EMAIL_FROM=noreply@saraivavision.com.br

# ReCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# WordPress Configuration
WORDPRESS_URL=https://saraivavision.com.br

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=5
EOF

echo ""
log "✅ Backend deployment initiated!"
echo ""
echo "🎯 Next Steps:"
echo "1. SSH into VPS: ssh $VPS_USER@$VPS_IP"
echo "2. Configure environment: cd /var/www/saraiva-vision-backend && nano .env"
echo "3. Use template: cat vps-env-template.txt"
echo "4. Start services: ./start-backend.sh"
echo "5. Monitor: ./monitor.sh"
echo ""
warn "⚠️  Important:"
warn "  - Set actual values in .env (not the generated ones)"
warn "  - Configure SSL certificates for production"
warn "  - Set up firewall rules"
warn "  - Configure domain DNS settings"
echo ""
echo "📚 Documentation: See VPS_BACKEND_GUIDE.md"
echo "🔧 Environment template saved to: vps-env-template.txt"