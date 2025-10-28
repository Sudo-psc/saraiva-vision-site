#!/bin/bash
# Versão automática do cleanup (sem confirmação)
# USO: sudo bash /home/saraiva-vision-site/scripts/cleanup-bundles-auto.sh

set -e

ASSETS_DIR="/var/www/saraivavision/current/assets"
INDEX_HTML="/var/www/saraivavision/current/index.html"
BACKUP_DIR="/var/www/saraivavision/bundles-backup-$(date +%Y%m%d-%H%M%S)"

echo "========================================="
echo "Limpeza Automática de Bundles"
echo "========================================="

# Identify current bundle
CURRENT_BUNDLE=$(grep -o 'index-[^"]*\.js' "$INDEX_HTML" | head -1)
echo "✓ Bundle atual: $CURRENT_BUNDLE"

# Find old bundles
OLD_BUNDLES=$(find "$ASSETS_DIR" -name "index-*.js" -type f | grep -v "$CURRENT_BUNDLE")
OLD_COUNT=$(echo "$OLD_BUNDLES" | wc -l)

if [ "$OLD_COUNT" -eq 0 ]; then
    echo "✓ Nenhum bundle antigo para remover"
    exit 0
fi

echo "⚠️  Removendo $OLD_COUNT bundle(s) antigo(s)..."

# Calculate space
TOTAL_SIZE=$(du -ch $OLD_BUNDLES 2>/dev/null | tail -1 | awk '{print $1}')
echo "📦 Espaço a ser liberado: $TOTAL_SIZE"

# Create backup
mkdir -p "$BACKUP_DIR"
echo "$OLD_BUNDLES" | while read bundle; do
    cp "$bundle" "$BACKUP_DIR/"
done
echo "✓ Backup criado em: $BACKUP_DIR"

# Remove old bundles
echo "$OLD_BUNDLES" | while read bundle; do
    basename=$(basename "$bundle")
    rm -f "$bundle"
    echo "  ✗ Removido: $basename"
done

# Final count
REMAINING=$(find "$ASSETS_DIR" -name "index-*.js" -type f | wc -l)
echo ""
echo "✓ Limpeza concluída!"
echo "✓ Bundles restantes: $REMAINING"
echo ""
echo "Para restaurar: sudo cp $BACKUP_DIR/*.js $ASSETS_DIR/"
