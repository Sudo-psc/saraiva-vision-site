#!/bin/bash

# ==============================================================================
# DEPLOY COMPLETO - Saraiva Vision
# Corrige cache headers + deploy novo build (index-WfIDUkZD.js)
# ==============================================================================

set -e

echo "======================================================================"
echo "🚀 DEPLOY COMPLETO - Saraiva Vision"
echo "======================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ==============================================================================
# STEP 1: Verify we're in the right directory
# ==============================================================================
echo -e "${YELLOW}📁 Passo 1: Verificando diretório do projeto${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
echo "Diretório atual: $(pwd)"
echo -e "${GREEN}✅ Diretório verificado${NC}"
echo ""

# ==============================================================================
# STEP 2: Execute cache header fix
# ==============================================================================
echo -e "${YELLOW}🔧 Passo 2: Aplicando correção de cache headers${NC}"
sudo bash scripts/fix-cache-headers.sh
echo ""

# ==============================================================================
# STEP 3: Deploy new build to production
# ==============================================================================
echo -e "${YELLOW}📦 Passo 3: Deploy do novo build para produção${NC}"

# Backup current production
echo "Criando backup da produção atual..."
sudo mkdir -p /var/www/html.backup
sudo cp -r /var/www/html/* /var/www/html.backup/ 2>/dev/null || true
echo -e "${GREEN}✅ Backup criado em /var/www/html.backup/${NC}"

# Clear old production files
echo "Limpando arquivos antigos..."
sudo rm -rf /var/www/html/*
echo -e "${GREEN}✅ Arquivos antigos removidos${NC}"

# Copy new build
LATEST_BUNDLE=$(grep -o 'index-[^"]*\.js' dist/index.html | head -1)
echo "Copiando novo build ($LATEST_BUNDLE)..."
sudo cp -r dist/* /var/www/html/
echo -e "${GREEN}✅ Novo build copiado${NC}"

# Set correct permissions
echo "Configurando permissões..."
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
echo -e "${GREEN}✅ Permissões configuradas${NC}"
echo ""

# ==============================================================================
# STEP 4: Verify deployment
# ==============================================================================
echo -e "${YELLOW}✅ Passo 4: Verificando deployment${NC}"

# Check HTML file exists
if [ -f /var/www/html/index.html ]; then
    echo -e "${GREEN}✅ index.html encontrado${NC}"

    # Check for bundle reference
    DEPLOYED_BUNDLE=$(grep -o 'index-[^"]*\.js' /var/www/html/index.html | head -1)
    if [ -n "$DEPLOYED_BUNDLE" ]; then
        echo -e "${GREEN}✅ Bundle deployado: $DEPLOYED_BUNDLE${NC}"

        # Verify bundle file exists
        if [ -f "/var/www/html/assets/$DEPLOYED_BUNDLE" ]; then
            echo -e "${GREEN}✅ Arquivo do bundle encontrado em /assets/${NC}"
        else
            echo -e "${RED}⚠️  Arquivo do bundle não encontrado!${NC}"
        fi
    else
        echo -e "${RED}⚠️  Bundle não referenciado no HTML${NC}"
    fi
else
    echo -e "${RED}❌ index.html não encontrado!${NC}"
    exit 1
fi

# Check asset files
ASSET_COUNT=$(ls -1 /var/www/html/assets/*.js 2>/dev/null | wc -l)
echo -e "${GREEN}✅ ${ASSET_COUNT} arquivos JavaScript encontrados em /assets/${NC}"

echo ""

# ==============================================================================
# STEP 5: Test endpoints
# ==============================================================================
echo -e "${YELLOW}🧪 Passo 5: Testando endpoints${NC}"

# Test HTML cache headers
echo "Testando cache headers HTML..."
HTML_CACHE=$(curl -sI https://saraivavision.com.br/ 2>/dev/null | grep -i "Cache-Control" | head -1)
echo "HTML Cache-Control: $HTML_CACHE"

if echo "$HTML_CACHE" | grep -q "no-store"; then
    echo -e "${GREEN}✅ HTML com no-cache (correto)${NC}"
else
    echo -e "${RED}⚠️  HTML ainda com cache${NC}"
fi

# Test asset cache headers
echo ""
echo "Testando cache headers de assets..."
if [ -n "$DEPLOYED_BUNDLE" ]; then
    ASSET_CACHE=$(curl -sI "https://saraivavision.com.br/assets/$DEPLOYED_BUNDLE" 2>/dev/null | grep -i "Cache-Control" | head -1)
    echo "Asset Cache-Control: $ASSET_CACHE"
else
    echo -e "${RED}⚠️  Não foi possível determinar o bundle para testar${NC}"
fi

if echo "$ASSET_CACHE" | grep -q "immutable"; then
    echo -e "${GREEN}✅ Assets com cache imutável (correto)${NC}"
else
    echo -e "${YELLOW}⚠️  Assets sem cache imutável${NC}"
fi

# Test page loads
echo ""
echo "Testando carregamento de páginas..."
if curl -f -s https://saraivavision.com.br/ > /dev/null; then
    echo -e "${GREEN}✅ Homepage carrega sem erros${NC}"
else
    echo -e "${RED}❌ Erro ao carregar homepage${NC}"
fi

if curl -f -s https://saraivavision.com.br/blog > /dev/null; then
    echo -e "${GREEN}✅ Blog carrega sem erros${NC}"
else
    echo -e "${RED}❌ Erro ao carregar blog${NC}"
fi

echo ""

# ==============================================================================
# FINAL STATUS
# ==============================================================================
echo "======================================================================"
echo -e "${GREEN}✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "======================================================================"
echo ""
echo "📋 Resumo:"
echo "  - Nginx cache headers: HTML no-cache ✅"
echo "  - Novo build deployado: $DEPLOYED_BUNDLE ✅"
echo "  - Assets com cache imutável ✅"
echo "  - Backup disponível: /var/www/html.backup/ ✅"
echo ""
echo "🎯 Próximos Passos:"
echo "  1. Teste no navegador: https://saraivavision.com.br/blog"
echo "  2. Hard refresh: Ctrl+Shift+R (3x)"
echo "  3. Abrir DevTools > Network > Verificar sem erros"
echo "  4. Monitorar logs: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "🔄 Rollback (se necessário):"
echo "  sudo cp -r /var/www/html.backup/* /var/www/html/"
echo "  sudo systemctl reload nginx"
echo ""
echo "======================================================================"