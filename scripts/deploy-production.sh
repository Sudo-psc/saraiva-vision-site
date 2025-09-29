#!/bin/bash

# Deploy Script for Saraiva Vision - Production
# IMPORTANTE: Execute dentro do VPS no diretório /home/saraiva-vision-site
# Date: 2025-09-29

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Saraiva Vision - Production Deploy${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Configuration
PROJECT_DIR="/home/saraiva-vision-site"
WEB_ROOT="/var/www/html"
NGINX_CONFIG="/etc/nginx/sites-available/saraivavision"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Step 1: Verify we're in the right directory
echo -e "${YELLOW}[1/8] Verifying project directory...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi
cd "$PROJECT_DIR"
echo -e "${GREEN}✓ In project directory${NC}"
echo ""

# Step 2: Verify build exists
echo -e "${YELLOW}[2/8] Verifying build files...${NC}"
if [ ! -d "$PROJECT_DIR/dist" ]; then
    echo -e "${RED}Error: Build directory not found. Run 'npm run build' first.${NC}"
    exit 1
fi
if [ ! -f "$PROJECT_DIR/dist/index.html" ]; then
    echo -e "${RED}Error: index.html not found in dist directory.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build files verified${NC}"
echo ""

# Step 3: Backup current Nginx configuration
echo -e "${YELLOW}[3/8] Backing up Nginx configuration...${NC}"
if [ -f "$NGINX_CONFIG" ]; then
    sudo cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.${TIMESTAMP}"
    echo -e "${GREEN}✓ Nginx config backed up to: ${NGINX_CONFIG}.backup.${TIMESTAMP}${NC}"
else
    echo -e "${YELLOW}⚠ No existing Nginx config found (first deploy?)${NC}"
fi
echo ""

# Step 4: Backup current website files
echo -e "${YELLOW}[4/8] Backing up current website files...${NC}"
if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT 2>/dev/null)" ]; then
    sudo cp -r "$WEB_ROOT" "${WEB_ROOT}.backup.${TIMESTAMP}"
    echo -e "${GREEN}✓ Website backed up to: ${WEB_ROOT}.backup.${TIMESTAMP}${NC}"
else
    echo -e "${YELLOW}⚠ No existing website files found (first deploy?)${NC}"
fi
echo ""

# Step 5: Deploy Nginx configuration
echo -e "${YELLOW}[5/8] Deploying Nginx configuration...${NC}"
if [ -f "$PROJECT_DIR/nginx-optimized.conf" ]; then
    sudo cp "$PROJECT_DIR/nginx-optimized.conf" "$NGINX_CONFIG"
    echo -e "${GREEN}✓ Nginx config copied${NC}"

    # Test Nginx configuration
    echo -e "${YELLOW}Testing Nginx configuration...${NC}"
    if sudo nginx -t; then
        echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    else
        echo -e "${RED}✗ Nginx configuration test failed!${NC}"
        echo -e "${YELLOW}Restoring backup...${NC}"
        sudo cp "${NGINX_CONFIG}.backup.${TIMESTAMP}" "$NGINX_CONFIG"
        exit 1
    fi
else
    echo -e "${RED}Error: nginx-optimized.conf not found in project directory${NC}"
    exit 1
fi
echo ""

# Step 6: Deploy website files
echo -e "${YELLOW}[6/8] Deploying website files...${NC}"
echo -e "${YELLOW}Removing old files...${NC}"
sudo rm -rf "$WEB_ROOT"/*

echo -e "${YELLOW}Copying new files...${NC}"
sudo cp -r "$PROJECT_DIR/dist"/* "$WEB_ROOT"/

echo -e "${YELLOW}Setting permissions...${NC}"
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo find "$WEB_ROOT" -type d -exec chmod 755 {} \;
sudo find "$WEB_ROOT" -type f -exec chmod 644 {} \;

echo -e "${GREEN}✓ Website files deployed${NC}"
echo ""

# Step 7: Reload Nginx
echo -e "${YELLOW}[7/8] Reloading Nginx (zero downtime)...${NC}"
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ Nginx reload failed!${NC}"
    exit 1
fi
echo ""

# Step 8: Verify deployment
echo -e "${YELLOW}[8/8] Verifying deployment...${NC}"

# Check Nginx status
if sudo systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx is not running!${NC}"
    exit 1
fi

# Check if website is accessible
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Website is accessible locally${NC}"
else
    echo -e "${YELLOW}⚠ Website local check returned non-200 status${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Post-deployment instructions
echo -e "${YELLOW}Post-deployment checks:${NC}"
echo ""
echo "1. Test main site:"
echo "   curl -I https://saraivavision.com.br"
echo ""
echo "2. Test WordPress API:"
echo "   curl -s 'https://saraivavision.com.br/wp-json/wp/v2/posts?per_page=1' | jq '.[0].id'"
echo ""
echo "3. Test blog page in browser:"
echo "   https://saraivavision.com.br/blog"
echo ""
echo "4. Monitor logs for 30 minutes:"
echo "   sudo tail -f /var/log/nginx/saraivavision_error.log"
echo ""
echo -e "${YELLOW}Backup locations:${NC}"
echo "  Nginx config: ${NGINX_CONFIG}.backup.${TIMESTAMP}"
echo "  Website files: ${WEB_ROOT}.backup.${TIMESTAMP}"
echo ""

# Display deployment summary
echo -e "${GREEN}Deployment Summary:${NC}"
echo "  Timestamp: ${TIMESTAMP}"
echo "  Project dir: ${PROJECT_DIR}"
echo "  Web root: ${WEB_ROOT}"
echo "  Nginx config: ${NGINX_CONFIG}"
echo ""
echo -e "${GREEN}✅ Deploy script completed!${NC}"
