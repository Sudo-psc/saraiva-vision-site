#!/bin/bash
# Deploy Local - Saraiva Vision
# Execute DENTRO do VPS, sem necessidade de SSH
# Uso: sudo ./scripts/deploy-local.sh [--quick|--full]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/home/saraiva-vision-site"
PROD_DIR="/var/www/saraivavision/current"
BACKUP_DIR="/var/backups/saraiva-vision"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

# Mode detection
MODE="${1:-full}"

# Banner
clear
echo -e "${CYAN}╔═══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Saraiva Vision - Deploy Local      ║${NC}"
echo -e "${CYAN}║   Execução Local no VPS               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════╝${NC}"
echo ""

# Root check
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Execute com sudo: sudo ./scripts/deploy-local.sh${NC}"
    exit 1
fi

# Mode confirmation
if [ "$MODE" == "--quick" ]; then
    echo -e "${YELLOW}⚡ MODO RÁPIDO (sem backup)${NC}"
    echo "Press CTRL+C to cancel, or wait 3 seconds..."
    sleep 3
else
    echo -e "${BLUE}🛡️  MODO COMPLETO (com backup e verificação)${NC}"
    echo "Press CTRL+C to cancel, or wait 3 seconds..."
    sleep 3
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Build
echo ""
echo -e "${BLUE}📦 STEP 1/6: Building application...${NC}"
cd "$PROJECT_DIR"
npm run build:vite

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completed${NC}"

# Step 2: Backup (skip in quick mode)
if [ "$MODE" != "--quick" ]; then
    echo ""
    echo -e "${BLUE}💾 STEP 2/6: Creating backup...${NC}"
    mkdir -p "$BACKUP_DIR"

    if [ -d "$PROD_DIR" ] && [ "$(ls -A $PROD_DIR)" ]; then
        tar -czf "$BACKUP_FILE" -C "$PROD_DIR" . 2>/dev/null || true
        echo -e "${GREEN}✅ Backup: $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  Production empty, skipping backup${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}⚡ STEP 2/6: Skipping backup (quick mode)${NC}"
fi

# Step 3: Clean production
echo ""
echo -e "${BLUE}🧹 STEP 3/6: Cleaning production...${NC}"

# Preserve .htaccess if exists
if [ -f "$PROD_DIR/.htaccess" ]; then
    cp "$PROD_DIR/.htaccess" "/tmp/.htaccess.backup"
fi

# Robust cleanup using find - handles all files including hidden ones
find "$PROD_DIR" -mindepth 1 -delete 2>/dev/null || {
    # Fallback to comprehensive rm if find fails
    shopt -s dotglob nullglob
    rm -rf "$PROD_DIR"/*
    shopt -u dotglob nullglob
}

if [ -f "/tmp/.htaccess.backup" ]; then
    mv "/tmp/.htaccess.backup" "$PROD_DIR/.htaccess"
fi

echo -e "${GREEN}✅ Production cleaned${NC}"

# Step 4: Deploy files
echo ""
echo -e "${BLUE}🚀 STEP 4/6: Deploying files...${NC}"
echo "   Target: $PROD_DIR"

cp -r "$PROJECT_DIR/dist/"* "$PROD_DIR/"

# Count assets
BUILD_ASSETS=$(find "$PROJECT_DIR/dist/assets" -type f 2>/dev/null | wc -l)
DEPLOYED_ASSETS=$(find "$PROD_DIR/assets" -type f 2>/dev/null | wc -l)

echo -e "   📊 Assets deployed: ${GREEN}$DEPLOYED_ASSETS${NC} files"

# Set permissions
chown -R www-data:www-data "$PROD_DIR"
chmod -R 755 "$PROD_DIR"
find "$PROD_DIR" -type f -exec chmod 644 {} \;

echo -e "${GREEN}✅ Files deployed with correct permissions${NC}"

# Step 5: Clear cache and reload
echo ""
echo -e "${BLUE}🔄 STEP 5/6: Clearing cache and reloading...${NC}"

# Clear Nginx cache
if [ -d "/var/cache/nginx" ]; then
    rm -rf /var/cache/nginx/* 2>/dev/null || true
    echo "   ✓ Nginx cache cleared"
fi

# Reload Nginx
systemctl reload nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Nginx reload failed${NC}"

    if [ "$MODE" != "--quick" ] && [ -f "$BACKUP_FILE" ]; then
        echo "   🔙 Rolling back..."
        tar -xzf "$BACKUP_FILE" -C "$PROD_DIR"
        systemctl reload nginx
        echo -e "${YELLOW}⚠️  Rolled back to previous version${NC}"
    fi
    exit 1
fi

# Step 6: Verification
echo ""
echo -e "${BLUE}🔍 STEP 6/6: Verifying deployment...${NC}"

# Nginx running?
if systemctl is-active --quiet nginx; then
    echo "   ✓ Nginx running"
else
    echo -e "${RED}   ❌ Nginx not running${NC}"
    exit 1
fi

# index.html exists?
if [ -f "$PROD_DIR/index.html" ]; then
    echo "   ✓ index.html found"
else
    echo -e "${RED}   ❌ index.html missing${NC}"
    exit 1
fi

# Assets exist?
if [ -d "$PROD_DIR/assets" ] && [ "$(ls -A $PROD_DIR/assets)" ]; then
    echo "   ✓ Assets directory populated"
else
    echo -e "${RED}   ❌ Assets missing${NC}"
    exit 1
fi

# HTTP check
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_STATUS" == "200" ]; then
    echo "   ✓ Site accessible (HTTP $HTTP_STATUS)"
else
    echo -e "${YELLOW}   ⚠️  HTTP $HTTP_STATUS${NC}"
fi

# Success banner
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ DEPLOYMENT SUCCESSFUL!           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo "📊 Summary:"
echo "   • Mode: $([ "$MODE" == "--quick" ] && echo "Quick" || echo "Full")"
echo "   • Build: ✅ Completed"
echo "   • Deploy: ✅ $DEPLOYED_ASSETS assets"
if [ "$MODE" != "--quick" ]; then
    echo "   • Backup: ✅ $BACKUP_FILE"
fi
echo "   • Nginx: ✅ Reloaded"
echo "   • Cache: ✅ Cleared"
echo "   • Status: ✅ HTTP $HTTP_STATUS"
echo ""
echo "🌐 Live site: ${CYAN}https://saraivavision.com.br${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Limpe o cache do navegador (Ctrl+Shift+R)${NC}"

if [ "$MODE" != "--quick" ]; then
    echo ""
    echo "📝 Para reverter:"
    echo "   sudo tar -xzf $BACKUP_FILE -C $PROD_DIR && sudo systemctl reload nginx"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
