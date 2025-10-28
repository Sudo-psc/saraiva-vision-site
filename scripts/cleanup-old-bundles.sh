#!/bin/bash

# ==============================================================================
# Cleanup Old Bundle Files
# Remove bundles antigos mantendo apenas o atual em uso
#
# Autor: Dr. Philipe Saraiva Cruz
# Data: 2025-10-28
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
ASSETS_DIR="/var/www/saraivavision/current/assets"
INDEX_HTML="/var/www/saraivavision/current/index.html"
BACKUP_DIR="/var/www/saraivavision/bundles-backup-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Limpeza de Bundles Antigos${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Este script precisa ser executado como root (sudo)${NC}"
    exit 1
fi

# Check if assets directory exists
if [ ! -d "$ASSETS_DIR" ]; then
    echo -e "${RED}❌ Diretório de assets não encontrado: $ASSETS_DIR${NC}"
    exit 1
fi

# Check if index.html exists
if [ ! -f "$INDEX_HTML" ]; then
    echo -e "${RED}❌ index.html não encontrado: $INDEX_HTML${NC}"
    exit 1
fi

# Find current bundle in use
echo -e "${YELLOW}🔍 Identificando bundle atual...${NC}"
CURRENT_BUNDLE=$(grep -o 'index-[^"]*\.js' "$INDEX_HTML" | head -1)

if [ -z "$CURRENT_BUNDLE" ]; then
    echo -e "${RED}❌ Não foi possível identificar o bundle atual no index.html${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Bundle atual: ${CURRENT_BUNDLE}${NC}"
echo ""

# List all bundles
echo -e "${YELLOW}📦 Bundles encontrados:${NC}"
BUNDLES=$(find "$ASSETS_DIR" -name "index-*.js" -type f | sort)
BUNDLE_COUNT=$(echo "$BUNDLES" | wc -l)

echo "$BUNDLES" | while read bundle; do
    size=$(du -h "$bundle" | cut -f1)
    basename=$(basename "$bundle")
    if [ "$basename" == "$CURRENT_BUNDLE" ]; then
        echo -e "  ${GREEN}✓ $basename ($size) [ATUAL]${NC}"
    else
        echo -e "  ${YELLOW}○ $basename ($size) [ANTIGO]${NC}"
    fi
done

echo ""
echo -e "${BLUE}Total: ${BUNDLE_COUNT} bundle(s)${NC}"

# Calculate old bundles
OLD_BUNDLES=$(echo "$BUNDLES" | grep -v "$CURRENT_BUNDLE" || true)
OLD_COUNT=$(echo "$OLD_BUNDLES" | grep -c "index-" || echo "0")

if [ "$OLD_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Nenhum bundle antigo para remover!${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}⚠️  ${OLD_COUNT} bundle(s) antigo(s) será(ão) removido(s)${NC}"

# Calculate space to be freed
echo ""
echo -e "${BLUE}Espaço a ser liberado:${NC}"
du -ch $OLD_BUNDLES 2>/dev/null | tail -1 | awk '{print "  " $1}'

# Ask for confirmation
echo ""
read -p "$(echo -e ${YELLOW}Deseja continuar com a remoção? [s/N]:${NC} )" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}❌ Operação cancelada pelo usuário${NC}"
    exit 0
fi

# Create backup
echo ""
echo -e "${YELLOW}📦 Criando backup...${NC}"
mkdir -p "$BACKUP_DIR"

echo "$OLD_BUNDLES" | while read bundle; do
    if [ -f "$bundle" ]; then
        cp -v "$bundle" "$BACKUP_DIR/"
    fi
done

echo -e "${GREEN}✓ Backup criado em: $BACKUP_DIR${NC}"

# Remove old bundles
echo ""
echo -e "${YELLOW}🗑️  Removendo bundles antigos...${NC}"

REMOVED_COUNT=0
echo "$OLD_BUNDLES" | while read bundle; do
    if [ -f "$bundle" ]; then
        basename=$(basename "$bundle")
        rm -f "$bundle"
        echo -e "  ${RED}✗ Removido: $basename${NC}"
        REMOVED_COUNT=$((REMOVED_COUNT + 1))
    fi
done

# Final verification
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Limpeza concluída!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# List remaining bundles
REMAINING_BUNDLES=$(find "$ASSETS_DIR" -name "index-*.js" -type f)
REMAINING_COUNT=$(echo "$REMAINING_BUNDLES" | wc -l)

echo -e "${BLUE}Bundles restantes: ${REMAINING_COUNT}${NC}"
echo "$REMAINING_BUNDLES" | while read bundle; do
    size=$(du -h "$bundle" | cut -f1)
    basename=$(basename "$bundle")
    echo -e "  ${GREEN}✓ $basename ($size)${NC}"
done

echo ""
echo -e "${BLUE}Backup localizado em:${NC}"
echo -e "  $BACKUP_DIR"
echo ""
echo -e "${YELLOW}💡 Para restaurar em caso de problemas:${NC}"
echo -e "  sudo cp $BACKUP_DIR/*.js $ASSETS_DIR/"
echo ""
echo -e "${GREEN}✓ Operação concluída com sucesso!${NC}"
