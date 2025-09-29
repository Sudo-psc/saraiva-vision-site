#!/bin/bash
# Saraiva Vision - Production Deployment Script
# Blog Fallback Feature Deploy
# Usage: ./scripts/deploy-production.sh

set -e

# Configuration
VPS_HOST="31.97.129.78"
VPS_USER="root"
SOURCE_DIR="/opt/saraiva-vision-source"
WEB_DIR="/var/www/html"
BRANCH="external-wordpress"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Saraiva Vision Production Deployment        ║${NC}"
echo -e "${BLUE}║   Blog Fallback Feature                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Function to run commands on VPS
run_on_vps() {
    ssh -o ConnectTimeout=10 ${VPS_USER}@${VPS_HOST} "$@"
}

# Test SSH connection
echo -e "${BLUE}[1/7]${NC} Testing SSH connection to VPS..."
if ! run_on_vps "echo 'SSH OK'" > /dev/null 2>&1; then
    echo -e "${RED}❌ SSH connection failed!${NC}"
    echo ""
    echo "Please ensure:"
    echo "  1. SSH key is configured: ssh-copy-id ${VPS_USER}@${VPS_HOST}"
    echo "  2. Or use password authentication"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"

# Create backup
echo -e "${BLUE}[2/7]${NC} Creating production backup..."
BACKUP_NAME="saraiva-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
run_on_vps "cd ${WEB_DIR} && tar -czf /tmp/${BACKUP_NAME} . 2>/dev/null || true"
echo -e "${GREEN}✅ Backup created: /tmp/${BACKUP_NAME}${NC}"

# Pull latest code
echo -e "${BLUE}[3/7]${NC} Pulling latest code from GitHub..."
run_on_vps "cd ${SOURCE_DIR} && git fetch origin && git checkout ${BRANCH} && git pull origin ${BRANCH}"
echo -e "${GREEN}✅ Code updated to latest commit${NC}"

# Install dependencies
echo -e "${BLUE}[4/7]${NC} Installing dependencies..."
run_on_vps "cd ${SOURCE_DIR} && npm install --production=false"
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build application
echo -e "${BLUE}[5/7]${NC} Building production bundle..."
run_on_vps "cd ${SOURCE_DIR} && npm run build"
echo -e "${GREEN}✅ Build completed${NC}"

# Deploy to web directory
echo -e "${BLUE}[6/7]${NC} Deploying to production..."
run_on_vps "cd ${SOURCE_DIR} && rsync -av --delete dist/ ${WEB_DIR}/ && chown -R www-data:www-data ${WEB_DIR} && chmod -R 755 ${WEB_DIR}"
echo -e "${GREEN}✅ Files deployed${NC}"

# Reload Nginx
echo -e "${BLUE}[7/7]${NC} Reloading Nginx..."
run_on_vps "systemctl reload nginx && systemctl status nginx --no-pager | head -5"
echo -e "${GREEN}✅ Nginx reloaded${NC}"

# Verification
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Deployment Completed Successfully!        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo "📊 Deployment Summary:"
run_on_vps "ls -lh ${WEB_DIR}/index.html"
echo ""
echo "🌐 Live URL: https://saraivavision.com.br"
echo "📝 Blog URL: https://saraivavision.com.br/blog"
echo ""
echo "💾 Backup location: /tmp/${BACKUP_NAME}"
echo ""
echo "🧪 Test the fallback:"
echo "   1. Visit https://saraivavision.com.br/blog"
echo "   2. If WordPress API is down, you'll see 5 preview posts"
echo "   3. Blue banner: 'Conteúdo de Prévia Disponível'"
echo ""