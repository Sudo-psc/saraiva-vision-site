#!/bin/bash

# Sanity Studio - Script de Diagnóstico
# Autor: Dr. Philipe Saraiva Cruz
# Data: 2025-10-28

echo "========================================="
echo "  Sanity Studio - Diagnóstico Completo"
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se Studio está deployado
echo "1️⃣  Verificando Studio deployado..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.sanity.studio)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Studio deployado com sucesso!${NC}"
    echo "   URL: https://saraivavision.sanity.studio"
else
    echo -e "${RED}❌ Studio NÃO deployado (HTTP $HTTP_STATUS)${NC}"
    echo "   Execute: npm run deploy"
fi

echo ""

# 2. Verificar autenticação local
echo "2️⃣  Verificando autenticação local..."
if [ -f ~/.sanity/config.json ]; then
    echo -e "${GREEN}✅ Autenticado localmente${NC}"
    echo "   Config: ~/.sanity/config.json"
else
    echo -e "${RED}❌ Não autenticado${NC}"
    echo "   Execute: npx sanity login"
fi

echo ""

# 3. Verificar configuração do projeto
echo "3️⃣  Verificando configuração..."
if [ -f /home/saraiva-vision-site/sanity/sanity.config.js ]; then
    PROJECT_ID=$(grep "projectId:" /home/saraiva-vision-site/sanity/sanity.config.js | sed "s/.*projectId: '\\(.*\\)'.*/\\1/")
    DATASET=$(grep "dataset:" /home/saraiva-vision-site/sanity/sanity.config.js | sed "s/.*dataset: '\\(.*\\)'.*/\\1/")

    echo -e "${GREEN}✅ Configuração encontrada${NC}"
    echo "   Project ID: $PROJECT_ID"
    echo "   Dataset: $DATASET"
else
    echo -e "${RED}❌ sanity.config.js não encontrado${NC}"
fi

echo ""

# 4. Verificar build local
echo "4️⃣  Verificando build local..."
if [ -d /home/saraiva-vision-site/sanity/dist ]; then
    BUILD_SIZE=$(du -sh /home/saraiva-vision-site/sanity/dist | cut -f1)
    echo -e "${GREEN}✅ Build local existe${NC}"
    echo "   Tamanho: $BUILD_SIZE"
else
    echo -e "${YELLOW}⚠️  Build local não encontrado${NC}"
    echo "   Execute: npm run build"
fi

echo ""

# 5. Testar acesso à API Sanity
echo "5️⃣  Testando acesso à API Sanity..."
API_RESPONSE=$(curl -s "https://92ocrdmp.api.sanity.io/v2021-10-21/data/query/production?query=*%5B_type%20%3D%3D%20%22blogPost%22%5D%5B0..2%5D" 2>/dev/null)

if echo "$API_RESPONSE" | grep -q '"_id"'; then
    POST_COUNT=$(echo "$API_RESPONSE" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✅ API Sanity acessível${NC}"
    echo "   Posts retornados: $POST_COUNT/3"
else
    echo -e "${RED}❌ Erro ao acessar API Sanity${NC}"
fi

echo ""

# 6. Verificar dependências instaladas
echo "6️⃣  Verificando dependências..."
if [ -d /home/saraiva-vision-site/sanity/node_modules ]; then
    SANITY_VERSION=$(npm list sanity --depth=0 2>/dev/null | grep sanity@ | sed 's/.*sanity@\\(.*\\)$/\\1/')
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
    echo "   Sanity CLI: $SANITY_VERSION"
else
    echo -e "${RED}❌ Dependências não instaladas${NC}"
    echo "   Execute: npm install"
fi

echo ""

# 7. Verificar variáveis de ambiente
echo "7️⃣  Verificando variáveis de ambiente..."
if [ -f /home/saraiva-vision-site/sanity/.env ]; then
    if grep -q "SANITY_TOKEN=" /home/saraiva-vision-site/sanity/.env; then
        echo -e "${GREEN}✅ Token configurado em .env${NC}"
    else
        echo -e "${YELLOW}⚠️  Token não encontrado em .env${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
fi

echo ""

# Resumo e Próximos Passos
echo "========================================="
echo "  Resumo e Próximos Passos"
echo "========================================="
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ TUDO OK!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Acesse: https://saraivavision.sanity.studio"
    echo "2. Faça login no Studio"
    echo "3. Comece a criar/editar posts!"
else
    echo -e "${YELLOW}⚠️  AÇÃO NECESSÁRIA${NC}"
    echo ""
    echo "Para fazer deploy do Studio:"
    echo ""
    echo "cd /home/saraiva-vision-site/sanity"

    if [ ! -f ~/.sanity/config.json ]; then
        echo "npx sanity login        # 1. Login (apenas uma vez)"
    fi

    echo "npm run deploy          # 2. Deploy do Studio"
    echo ""
    echo "Depois execute este script novamente para verificar!"
fi

echo ""
echo "========================================="
echo "Para troubleshooting detalhado: cat TROUBLESHOOTING.md"
echo "Para guia rápido de deploy: cat QUICK_DEPLOY.md"
echo "========================================="
