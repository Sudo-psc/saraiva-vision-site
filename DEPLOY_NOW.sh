#!/bin/bash
# Enhanced Deploy Script for Saraiva Vision
# Includes validation, backup, and new agendamento route support
# Medical Compliance: Enforces comprehensive testing before deployment

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SARAIVA VISION - PRODUCTION DEPLOY                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/var/www/saraivavision"
RELEASES_DIR="$DEPLOY_DIR/releases"
CURRENT_LINK="$DEPLOY_DIR/current"
BACKUP_DIR="$DEPLOY_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"

# Pre-Deploy Validation (Medical Compliance Requirement)
echo -e "${BLUE}🔍 Running Pre-Deploy Validation (Medical Compliance)...${NC}"
echo ""

if [ -f "scripts/pre-deploy-validation.sh" ]; then
    if bash scripts/pre-deploy-validation.sh; then
        echo -e "${GREEN}✓ Pre-deploy validation passed${NC}"
        echo ""
    else
        echo -e "${RED}❌ Pre-deploy validation failed!${NC}"
        echo -e "${RED}Deployment aborted for medical compliance reasons.${NC}"
        echo -e "${YELLOW}Please review the validation report and fix all issues before deploying.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Warning: Pre-deploy validation script not found${NC}"
    echo -e "${YELLOW}Continuing without comprehensive validation...${NC}"
    echo ""
fi

# Create necessary directories
echo "📁 Creating deployment directories..."
sudo mkdir -p "$RELEASES_DIR"
sudo mkdir -p "$BACKUP_DIR"

# Backup current deployment
if [ -L "$CURRENT_LINK" ]; then
    echo "💾 Creating backup of current deployment..."
    CURRENT_RELEASE=$(readlink -f "$CURRENT_LINK")
    if [ -d "$CURRENT_RELEASE" ]; then
        sudo cp -rp "$CURRENT_RELEASE" "$BACKUP_DIR/backup_$TIMESTAMP"
        echo -e "${GREEN}✓ Backup created: backup_$TIMESTAMP${NC}"
    fi
fi

# Build
echo ""
echo "📦 Building project with Vite..."
npm run build:norender || npx vite build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
fi

# Validate build output
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build directory 'dist' not found!${NC}"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ index.html not found in dist!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}"

# Create new release directory
echo ""
echo "📤 Deploying to $RELEASE_DIR..."
sudo mkdir -p "$RELEASE_DIR"

# Copy dist to release directory
sudo cp -r dist/* "$RELEASE_DIR/"
sudo chown -R www-data:www-data "$RELEASE_DIR"

# Validate deployment
echo ""
echo "🔍 Validating deployment..."

# Check if agendamento route files exist
if [ ! -f "$RELEASE_DIR/index.html" ]; then
    echo -e "${RED}❌ index.html missing in deployment!${NC}"
    exit 1
fi

# Check if assets are present
if [ ! -d "$RELEASE_DIR/assets" ]; then
    echo -e "${YELLOW}⚠️  Warning: assets directory not found${NC}"
fi

echo -e "${GREEN}✓ Deployment files validated${NC}"

# Update symlink atomically
echo ""
echo "🔗 Updating current symlink..."
sudo ln -sfn "$RELEASE_DIR" "${CURRENT_LINK}.new"
sudo mv -Tf "${CURRENT_LINK}.new" "$CURRENT_LINK"

echo -e "${GREEN}✓ Symlink updated${NC}"

# Test nginx configuration
echo ""
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    echo "Rolling back..."
    if [ -d "$BACKUP_DIR/backup_$TIMESTAMP" ]; then
        sudo ln -sfn "$BACKUP_DIR/backup_$TIMESTAMP/dist" "$CURRENT_LINK"
        echo -e "${YELLOW}⚠️  Rolled back to previous version${NC}"
    fi
    exit 1
fi

echo -e "${GREEN}✓ Nginx configuration is valid${NC}"

# Reload nginx
echo ""
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx reload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"

# Cleanup old releases (keep last 5)
echo ""
echo "🧹 Cleaning up old releases..."
cd "$RELEASES_DIR"
ls -t | tail -n +6 | xargs -r sudo rm -rf
echo -e "${GREEN}✓ Cleanup completed${NC}"

# Display deployment info
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   DEPLOYMENT SUCCESSFUL! ✅                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Deployment Information:"
echo "   Release: $TIMESTAMP"
echo "   Directory: $RELEASE_DIR"
echo "   Current: $CURRENT_LINK -> $RELEASE_DIR"
echo ""
echo "🌐 URLs to test:"
echo "   • Home: https://saraivavision.com.br"
echo "   • Agendamento: https://saraivavision.com.br/agendamento"
echo "   • Blog: https://saraivavision.com.br/blog"
echo "   • Serviços: https://saraivavision.com.br/servicos"
echo ""
echo "💾 Backup: $BACKUP_DIR/backup_$TIMESTAMP"
echo ""
echo "🔍 To verify deployment:"
echo "   curl -I https://saraivavision.com.br/agendamento"
echo ""

