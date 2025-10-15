#!/bin/bash

# ============================================================
# Install Analytics Proxy - Nginx Reverse Proxy for GTM/GA4
# ============================================================
# Torna Google Tag Manager e Analytics resistente a ad blockers
#
# @author Dr. Philipe Saraiva Cruz
# ============================================================

set -e

echo "🛡️ Installing Analytics Proxy (Ad Blocker Bypass)"
echo "================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root: sudo ./scripts/install-analytics-proxy.sh${NC}"
  exit 1
fi

# 1. Backup Nginx config
echo ""
echo "📦 Step 1/5: Backing up Nginx configuration..."
BACKUP_FILE="/etc/nginx/sites-enabled/saraivavision.backup.$(date +%Y%m%d_%H%M%S)"
cp /etc/nginx/sites-enabled/saraivavision "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"

# 2. Verificar se proxy já existe
if grep -q "location ~ \^/t/gtm\\.js\$" /etc/nginx/sites-enabled/saraivavision; then
  echo -e "${YELLOW}⚠️  Analytics proxy already configured, skipping...${NC}"
else
  echo ""
  echo "📝 Step 2/5: Adding proxy configuration to Nginx..."

  # Encontrar linha do location /api/
  LINE_NUM=$(grep -n "location /api/" /etc/nginx/sites-enabled/saraivavision | head -1 | cut -d: -f1)

  if [ -z "$LINE_NUM" ]; then
    echo -e "${RED}❌ Could not find 'location /api/' in Nginx config${NC}"
    exit 1
  fi

  # Inserir configuração ANTES do location /api/
  INSERT_LINE=$((LINE_NUM - 1))

  # Criar arquivo temporário com configuração
  cat nginx-gtm-proxy.conf > /tmp/analytics-proxy.conf

  # Inserir no Nginx config
  {
    head -n "$INSERT_LINE" /etc/nginx/sites-enabled/saraivavision
    cat /tmp/analytics-proxy.conf
    tail -n +"$((INSERT_LINE + 1))" /etc/nginx/sites-enabled/saraivavision
  } > /tmp/saraivavision.new

  # Substituir arquivo
  mv /tmp/saraivavision.new /etc/nginx/sites-enabled/saraivavision
  rm /tmp/analytics-proxy.conf

  echo -e "${GREEN}✅ Proxy configuration added at line $INSERT_LINE${NC}"
fi

# 3. Testar configuração Nginx
echo ""
echo "🧪 Step 3/5: Testing Nginx configuration..."
if nginx -t 2>&1 | grep -q "successful"; then
  echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
  echo -e "${RED}❌ Nginx configuration has errors:${NC}"
  nginx -t
  echo ""
  echo -e "${YELLOW}Rolling back to backup...${NC}"
  cp "$BACKUP_FILE" /etc/nginx/sites-enabled/saraivavision
  exit 1
fi

# 4. Recarregar Nginx
echo ""
echo "🔄 Step 4/5: Reloading Nginx..."
systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"

# 5. Testar endpoints
echo ""
echo "🧪 Step 5/5: Testing proxy endpoints..."

# Testar gtm.js
GTM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://saraivavision.com.br/t/gtm.js?id=GTM-KF2NP85D")
if [ "$GTM_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ GTM proxy working: /t/gtm.js → $GTM_STATUS${NC}"
else
  echo -e "${YELLOW}⚠️  GTM proxy: /t/gtm.js → $GTM_STATUS (may need cache warmup)${NC}"
fi

# Testar gtag.js
GTAG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://saraivavision.com.br/t/gtag.js?id=G-LXWRK8ELS6")
if [ "$GTAG_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ GA4 proxy working: /t/gtag.js → $GTAG_STATUS${NC}"
else
  echo -e "${YELLOW}⚠️  GA4 proxy: /t/gtag.js → $GTAG_STATUS (may need cache warmup)${NC}"
fi

# 6. Resumo
echo ""
echo "================================================="
echo -e "${GREEN}✅ Analytics Proxy Installation Complete!${NC}"
echo "================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update your frontend to use AnalyticsProxy component:"
echo "   import AnalyticsProxy from '@/components/AnalyticsProxy';"
echo ""
echo "2. Build and deploy frontend:"
echo "   npm run build:vite"
echo "   sudo npm run deploy:quick"
echo ""
echo "3. Test with ad blocker active:"
echo "   - Open site with uBlock Origin/AdBlock Plus"
echo "   - Check DevTools console for success messages"
echo "   - Verify /t/ endpoints in Network tab"
echo ""
echo "4. Monitor effectiveness:"
echo "   - Compare GA4 data before/after"
echo "   - Expected: ~80% recovery of blocked traffic"
echo ""
echo "📖 Full guide: cat ANALYTICS_PROXY_GUIDE.md"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Rollback: sudo cp $BACKUP_FILE /etc/nginx/sites-enabled/saraivavision"
echo "   - Logs: sudo tail -f /var/log/nginx/error.log"
echo ""
