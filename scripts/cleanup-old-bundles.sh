#!/bin/bash
# ==============================================================================
# Script: cleanup-old-bundles.sh
# Descrição: Limpa bundles antigos mantendo apenas os referenciados no index.html
# Autor: Dr. Philipe Saraiva Cruz
# Data: 2025-10-25
# Versão: 2.0 - Limpeza baseada em uso real (index.html)
# ==============================================================================

set -e

ASSETS_DIR="/var/www/saraivavision/current/assets"
INDEX_FILE="/var/www/saraivavision/current/index.html"
LOG_FILE="/var/log/saraivavision-cleanup.log"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

echo "🧹 Limpeza de Bundles Antigos - Saraiva Vision"
echo "================================================"
echo ""

# Verificar se diretórios existem
if [ ! -d "$ASSETS_DIR" ]; then
    log_message "ERROR: Diretório $ASSETS_DIR não encontrado"
    exit 1
fi

if [ ! -f "$INDEX_FILE" ]; then
    log_message "ERROR: Arquivo $INDEX_FILE não encontrado"
    exit 1
fi

# Extrair bundles em uso do index.html
echo "📋 Identificando bundles em uso..."
BUNDLES_IN_USE=$(grep -oP 'src="/assets/\K[^"]+' "$INDEX_FILE" 2>/dev/null || echo "")

if [ -z "$BUNDLES_IN_USE" ]; then
    log_message "ERROR: Não foi possível identificar bundles em uso no index.html"
    exit 1
fi

log_message "Bundles em uso identificados:"
echo "$BUNDLES_IN_USE" | while read bundle; do
    log_message "  - $bundle"
    echo "   - $bundle"
done
echo ""

# Contar arquivos antes
BEFORE=$(find "$ASSETS_DIR" -name "*.js" | wc -l)
SIZE_BEFORE=$(du -sh "$ASSETS_DIR" | cut -f1)
log_message "Arquivos JS antes: $BEFORE, Tamanho: $SIZE_BEFORE"
echo "📊 Estatísticas ANTES da limpeza:"
echo "   - Arquivos JS: $BEFORE"
echo "   - Tamanho total: $SIZE_BEFORE"
echo ""

# Modo dry-run por padrão
DRY_RUN=true
if [ "$1" = "--execute" ]; then
    DRY_RUN=false
    log_message "MODO EXECUÇÃO: Arquivos serão removidos"
    echo "⚠️  MODO EXECUÇÃO: Arquivos serão REALMENTE removidos!"
else
    echo "ℹ️  MODO DRY-RUN: Simulação (use --execute para remover)"
fi
echo ""

# Processar arquivos
REMOVED_COUNT=0
echo "🔍 Analisando arquivos JS..."

find "$ASSETS_DIR" -name "*.js" -type f | while read file; do
    basename=$(basename "$file")

    # Verificar se o arquivo está em uso
    if ! echo "$BUNDLES_IN_USE" | grep -q "$basename"; then
        if [ "$DRY_RUN" = false ]; then
            log_message "Removendo: $basename"
            echo "   🗑️  Removendo: $basename"
            rm -f "$file"
        else
            echo "   📋 Seria removido: $basename"
        fi
        REMOVED_COUNT=$((REMOVED_COUNT + 1))
    else
        if [ "$DRY_RUN" = false ]; then
            log_message "Mantendo (em uso): $basename"
        fi
    fi
done

echo ""

# Contar arquivos depois (apenas se executado)
if [ "$DRY_RUN" = false ]; then
    AFTER=$(find "$ASSETS_DIR" -name "*.js" | wc -l)
    SIZE_AFTER=$(du -sh "$ASSETS_DIR" | cut -f1)

    log_message "Arquivos JS depois: $AFTER, Tamanho: $SIZE_AFTER"
    log_message "Removidos: $(($BEFORE - $AFTER)) arquivos"

    echo "📊 Estatísticas DEPOIS da limpeza:"
    echo "   - Arquivos JS: $AFTER"
    echo "   - Tamanho total: $SIZE_AFTER"
    echo ""
    echo "✅ Limpeza concluída!"
    echo "   - Arquivos removidos: $(($BEFORE - $AFTER))"
else
    echo "ℹ️  Para executar a limpeza, rode:"
    echo "   sudo bash $0 --execute"
fi

echo ""
echo "================================================"
