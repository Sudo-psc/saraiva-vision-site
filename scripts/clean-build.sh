#!/bin/bash
# Clean Build Script - Saraiva Vision
# Remove old builds and verify no secrets are exposed
# Usage: ./scripts/clean-build.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧹 Limpando build anterior...${NC}"
rm -rf dist/

echo -e "${GREEN}🔨 Rebuilding sem source maps...${NC}"
npm run build

echo -e "${YELLOW}🔍 Verificando exposição de secrets...${NC}"
SECRET_PATTERNS="AIzaSy|eyJhbGci|sk_|pk_|SUPABASE.*eyJ"

if grep -r -E "$SECRET_PATTERNS" dist/ 2>/dev/null; then
  echo -e "${RED}❌ ERRO: Secrets detectados no build!${NC}"
  echo -e "${RED}Por favor, verifique os arquivos acima e remova secrets expostos.${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Build limpo - nenhum secret detectado${NC}"
fi

echo -e "${YELLOW}📊 Top 10 maiores bundles:${NC}"
du -sh dist/assets/*.js 2>/dev/null | sort -hr | head -10

echo ""
echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo -e "${YELLOW}Próximo passo: Deploy para produção${NC}"