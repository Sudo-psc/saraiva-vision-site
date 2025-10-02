#!/bin/bash
# Diagnostic Script - Nginx Bundle Issue Investigation
# Identifies why Nginx is serving incorrect bundle

set -e

echo "🔍 Saraiva Vision - Nginx Bundle Diagnostic"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROD_DIR="/var/www/html"
PROJECT_DIR="/home/saraiva-vision-site"

echo "1️⃣ Checking Build Output (dist/)"
echo "--------------------------------"
if [ -d "$PROJECT_DIR/dist" ]; then
    echo -e "${GREEN}✓ dist/ directory exists${NC}"
    echo "Build size: $(du -sh $PROJECT_DIR/dist/ | cut -f1)"
    echo "Asset files: $(ls -1 $PROJECT_DIR/dist/assets/*.js 2>/dev/null | wc -l)"
    echo "Index.html hash references:"
    grep -o 'assets/[a-zA-Z0-9_-]*-[a-zA-Z0-9_-]*.js' "$PROJECT_DIR/dist/index.html" | head -5
else
    echo -e "${RED}✗ dist/ directory not found - build may not have run${NC}"
    exit 1
fi

echo ""
echo "2️⃣ Checking Production Files (/var/www/html/)"
echo "----------------------------------------------"
if [ -d "$PROD_DIR" ]; then
    echo -e "${GREEN}✓ Production directory exists${NC}"
    echo "Production size: $(du -sh $PROD_DIR/ | cut -f1)"
    echo "Asset files: $(ls -1 $PROD_DIR/assets/*.js 2>/dev/null | wc -l)"

    if [ -f "$PROD_DIR/index.html" ]; then
        echo "Index.html hash references:"
        grep -o 'assets/[a-zA-Z0-9_-]*-[a-zA-Z0-9_-]*.js' "$PROD_DIR/index.html" | head -5
    else
        echo -e "${RED}✗ index.html not found in production${NC}"
    fi
else
    echo -e "${RED}✗ Production directory not found${NC}"
    exit 1
fi

echo ""
echo "3️⃣ Comparing Build vs Production"
echo "---------------------------------"
BUILD_HASH=$(grep -o 'assets/index-[a-zA-Z0-9_-]*.js' "$PROJECT_DIR/dist/index.html" | head -1)
PROD_HASH=$(grep -o 'assets/index-[a-zA-Z0-9_-]*.js' "$PROD_DIR/index.html" 2>/dev/null | head -1)

echo "Build index.js: $BUILD_HASH"
echo "Production index.js: $PROD_HASH"

if [ "$BUILD_HASH" = "$PROD_HASH" ]; then
    echo -e "${GREEN}✓ Hashes match - files are in sync${NC}"
else
    echo -e "${YELLOW}⚠ Hashes differ - production may be outdated${NC}"
fi

echo ""
echo "4️⃣ Checking Nginx Configuration"
echo "--------------------------------"
if [ -f "/etc/nginx/sites-enabled/saraivavision" ]; then
    echo -e "${GREEN}✓ Nginx config exists${NC}"
    echo "Document root: $(grep 'root ' /etc/nginx/sites-enabled/saraivavision | head -1 | awk '{print $2}' | tr -d ';')"
    echo "SPA fallback enabled: $(grep -c 'try_files.*index.html' /etc/nginx/sites-enabled/saraivavision || echo 0)"
else
    echo -e "${RED}✗ Nginx config not found${NC}"
fi

echo ""
echo "5️⃣ Checking Nginx Service Status"
echo "---------------------------------"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
    echo "Last reload: $(systemctl show nginx --property=ActiveEnterTimestamp --no-pager | cut -d= -f2)"
else
    echo -e "${RED}✗ Nginx is not running${NC}"
fi

echo ""
echo "6️⃣ Checking Cache Headers"
echo "-------------------------"
echo "Testing index.html cache:"
curl -sI http://localhost/ | grep -E "(Cache-Control|Last-Modified|ETag)" || echo "No cache headers found"

echo ""
echo "Testing asset cache:"
if [ -n "$PROD_HASH" ]; then
    ASSET_URL="http://localhost/$PROD_HASH"
    curl -sI "$ASSET_URL" | grep -E "(Cache-Control|Last-Modified|ETag)" || echo "Asset not accessible"
fi

echo ""
echo "7️⃣ Checking File Permissions"
echo "----------------------------"
echo "Production directory owner: $(stat -c '%U:%G' $PROD_DIR)"
echo "Assets directory owner: $(stat -c '%U:%G' $PROD_DIR/assets 2>/dev/null || echo 'N/A')"
echo "Index.html permissions: $(stat -c '%a' $PROD_DIR/index.html 2>/dev/null || echo 'N/A')"

echo ""
echo "8️⃣ Recent Nginx Access Logs (last 10 requests)"
echo "----------------------------------------------"
if [ -f "/var/log/nginx/saraivavision_access.log" ]; then
    tail -10 /var/log/nginx/saraivavision_access.log | awk '{print $7, $9}' | column -t
else
    echo "Access log not found"
fi

echo ""
echo "9️⃣ Recent Nginx Error Logs"
echo "--------------------------"
if [ -f "/var/log/nginx/saraivavision_error.log" ]; then
    ERROR_COUNT=$(tail -20 /var/log/nginx/saraivavision_error.log | wc -l)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}Found $ERROR_COUNT recent errors:${NC}"
        tail -5 /var/log/nginx/saraivavision_error.log
    else
        echo -e "${GREEN}✓ No recent errors${NC}"
    fi
else
    echo "Error log not found"
fi

echo ""
echo "🔟 Live Site Check"
echo "-----------------"
SITE_STATUS=$(curl -sI https://saraivavision.com.br | grep "HTTP/" | awk '{print $2}')
echo "Live site status: HTTP $SITE_STATUS"

if curl -s https://saraivavision.com.br | grep -q "$BUILD_HASH"; then
    echo -e "${GREEN}✓ Live site is serving latest build${NC}"
else
    echo -e "${YELLOW}⚠ Live site may be serving cached/old version${NC}"
fi

echo ""
echo "📊 DIAGNOSIS SUMMARY"
echo "===================="

# Determine the issue
if [ "$BUILD_HASH" != "$PROD_HASH" ]; then
    echo -e "${YELLOW}ISSUE IDENTIFIED: Production files are outdated${NC}"
    echo "Recommendation: Run deployment script to sync files"
    echo "Command: sudo npm run deploy:quick"
elif ! curl -s https://saraivavision.com.br | grep -q "$BUILD_HASH"; then
    echo -e "${YELLOW}ISSUE IDENTIFIED: Browser cache or CDN serving old content${NC}"
    echo "Recommendation: Clear browser cache and force hard refresh (Ctrl+Shift+R)"
    echo "Alternative: Clear Nginx cache if enabled"
else
    echo -e "${GREEN}✓ No issues detected - site is serving latest build${NC}"
fi

echo ""
echo "💡 QUICK FIX COMMANDS"
echo "===================="
echo "1. Deploy latest build:    sudo npm run deploy:quick"
echo "2. Reload Nginx:           sudo systemctl reload nginx"
echo "3. Restart Nginx:          sudo systemctl restart nginx"
echo "4. Clear Nginx cache:      sudo rm -rf /var/cache/nginx/*"
echo "5. Force rebuild+deploy:   npm run build && sudo npm run deploy:quick"
