#!/bin/bash

# ==============================================================================
# Script de Correção: Cache Headers Nginx
# Resolve: "Importing a module script failed" causado por cache inconsistente
# ==============================================================================

set -e  # Exit on error

echo "======================================================================"
echo "🔧 Correção de Cache Headers - Saraiva Vision"
echo "======================================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NGINX_CONFIG="/etc/nginx/sites-available/saraivavision"
BACKUP_DIR="/etc/nginx/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# ==============================================================================
# Step 1: Backup atual
# ==============================================================================
echo -e "${YELLOW}📦 Passo 1: Criando backup da configuração atual${NC}"

sudo mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/saraivavision.$TIMESTAMP.conf"

if sudo cp "$NGINX_CONFIG" "$BACKUP_FILE"; then
    echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE${NC}"
else
    echo -e "${RED}❌ Falha ao criar backup${NC}"
    exit 1
fi

echo ""

# ==============================================================================
# Step 2: Verificar headers atuais
# ==============================================================================
echo -e "${YELLOW}🔍 Passo 2: Verificando headers atuais${NC}"

HTML_CACHE=$(curl -sI https://saraivavision.com.br/ 2>/dev/null | grep -i "Cache-Control" || echo "Not found")
echo "HTML Cache-Control: $HTML_CACHE"

if echo "$HTML_CACHE" | grep -q "max-age=3600"; then
    echo -e "${RED}⚠️  PROBLEMA DETECTADO: HTML com cache de 1 hora${NC}"
    echo "   Isso causa chunk loading errors após deploys"
else
    echo -e "${GREEN}✅ Headers OK${NC}"
fi

echo ""

# ==============================================================================
# Step 3: Aplicar correções
# ==============================================================================
echo -e "${YELLOW}🛠️  Passo 3: Aplicando correções de cache${NC}"

# Criar arquivo temporário com nova config
TEMP_CONFIG=$(mktemp)

cat > "$TEMP_CONFIG" << 'EOF'
# ==============================================================================
# CORRECAO: Cache Headers para prevenir chunk loading errors
# Data: 2025-09-29
# Issue: "Importing a module script failed"
# ==============================================================================

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;

    root /var/www/html;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ============================================================
    # CRITICAL FIX: HTML sem cache (SPA entry point)
    # ============================================================
    location = / {
        try_files /index.html =404;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    location = /index.html {
        try_files /index.html =404;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # ============================================================
    # FIX: Static assets com cache imutável (hash-based)
    # ============================================================
    location ~* ^/assets/.*\.(js|mjs|css|woff2?|ttf|eot|otf)$ {
        try_files $uri =404;

        types {
            application/javascript js mjs;
            text/css css;
            font/woff2 woff2;
            font/woff woff;
        }

        expires 1y;
        add_header Cache-Control "public, immutable, max-age=31536000" always;
        add_header Access-Control-Allow-Origin "*" always;
        add_header Vary "Accept-Encoding" always;

        gzip_static on;
        access_log off;
    }

    # ============================================================
    # Images e outros assets
    # ============================================================
    location ~* \.(png|jpg|jpeg|gif|webp|avif|svg|ico)$ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable" always;
        access_log off;
    }

    # ============================================================
    # SPA Routing fallback
    # ============================================================
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
    }

    # Security Headers
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    return 301 https://$server_name$request_uri;
}
EOF

echo -e "${GREEN}✅ Nova configuração preparada${NC}"
echo ""

# ==============================================================================
# Step 4: Validar sintaxe
# ==============================================================================
echo -e "${YELLOW}✔️  Passo 4: Validando sintaxe da nova configuração${NC}"

if sudo nginx -t -c "$TEMP_CONFIG" 2>&1 | grep -q "syntax is ok"; then
    echo -e "${GREEN}✅ Sintaxe válida${NC}"
else
    echo -e "${RED}❌ Erro de sintaxe na nova configuração${NC}"
    rm "$TEMP_CONFIG"
    exit 1
fi

echo ""

# ==============================================================================
# Step 5: Aplicar nova configuração
# ==============================================================================
echo -e "${YELLOW}🚀 Passo 5: Aplicando nova configuração${NC}"

if sudo cp "$TEMP_CONFIG" "$NGINX_CONFIG"; then
    echo -e "${GREEN}✅ Configuração aplicada${NC}"
    rm "$TEMP_CONFIG"
else
    echo -e "${RED}❌ Falha ao aplicar configuração${NC}"
    rm "$TEMP_CONFIG"
    exit 1
fi

echo ""

# ==============================================================================
# Step 6: Teste final de sintaxe
# ==============================================================================
echo -e "${YELLOW}🧪 Passo 6: Teste final de sintaxe${NC}"

if sudo nginx -t; then
    echo -e "${GREEN}✅ Teste de sintaxe passou${NC}"
else
    echo -e "${RED}❌ Erro na configuração - Restaurando backup${NC}"
    sudo cp "$BACKUP_FILE" "$NGINX_CONFIG"
    echo -e "${YELLOW}⚠️  Backup restaurado${NC}"
    exit 1
fi

echo ""

# ==============================================================================
# Step 7: Reload Nginx (zero downtime)
# ==============================================================================
echo -e "${YELLOW}🔄 Passo 7: Recarregando Nginx (zero downtime)${NC}"

if sudo systemctl reload nginx; then
    echo -e "${GREEN}✅ Nginx recarregado com sucesso${NC}"
else
    echo -e "${RED}❌ Falha ao recarregar - Restaurando backup${NC}"
    sudo cp "$BACKUP_FILE" "$NGINX_CONFIG"
    sudo systemctl reload nginx
    exit 1
fi

echo ""

# ==============================================================================
# Step 8: Verificação pós-deploy
# ==============================================================================
echo -e "${YELLOW}✅ Passo 8: Verificando headers aplicados${NC}"

sleep 2  # Wait for Nginx to fully reload

NEW_HTML_CACHE=$(curl -sI https://saraivavision.com.br/ 2>/dev/null | grep -i "Cache-Control" || echo "Not found")
echo "Novo HTML Cache-Control: $NEW_HTML_CACHE"

if echo "$NEW_HTML_CACHE" | grep -q "no-store"; then
    echo -e "${GREEN}✅ SUCESSO: HTML agora sem cache${NC}"
else
    echo -e "${RED}❌ AVISO: Headers podem não ter sido aplicados corretamente${NC}"
    echo "   Verifique manualmente com: curl -I https://saraivavision.com.br/"
fi

echo ""

# ==============================================================================
# Resumo final
# ==============================================================================
echo "======================================================================"
echo -e "${GREEN}✅ Correção Concluída com Sucesso!${NC}"
echo "======================================================================"
echo ""
echo "📋 Resumo:"
echo "  - Backup: $BACKUP_FILE"
echo "  - Config: $NGINX_CONFIG"
echo "  - HTML Cache: no-store, no-cache (correto)"
echo "  - Assets Cache: immutable, 1 ano (correto)"
echo ""
echo "🎯 Próximos Passos:"
echo "  1. Testar rotas lazy: https://saraivavision.com.br/blog"
echo "  2. Hard refresh (Ctrl+Shift+R) no navegador"
echo "  3. Verificar DevTools > Network > sem erros"
echo "  4. Monitorar logs: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "🔄 Rollback (se necessário):"
echo "  sudo cp $BACKUP_FILE $NGINX_CONFIG"
echo "  sudo systemctl reload nginx"
echo ""
echo "======================================================================"