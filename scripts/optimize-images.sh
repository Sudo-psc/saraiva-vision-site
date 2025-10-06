#!/bin/bash

set -e

QUALITY_HIGH=85
QUALITY_MEDIUM=80
QUALITY_LOW=75

MAX_WIDTH_HERO=1920
MAX_WIDTH_AVATAR=800
MAX_WIDTH_ICON=512

echo "🖼️  Iniciando otimização de imagens..."

optimize_image() {
    local src="$1"
    local quality="$2"
    local max_size="$3"
    
    if [ ! -f "$src" ]; then
        return 0
    fi
    
    local base="${src%.png}"
    base="${base%.jpg}"
    base="${base%.jpeg}"
    
    local avif="${base}.avif"
    local webp="${base}.webp"
    
    if [ ! -f "$avif" ]; then
        convert "$src" -quality "$quality" -resize "${max_size}x${max_size}>" "$avif" 2>/dev/null && \
        echo "  ✓ Criado: $(basename $avif)"
    fi
    
    if [ ! -f "$webp" ]; then
        convert "$src" -quality "$quality" -resize "${max_size}x${max_size}>" "$webp" 2>/dev/null && \
        echo "  ✓ Criado: $(basename $webp)"
    fi
}

cd "$(dirname "$0")/.."

echo ""
echo "📸 Hero images e perfis..."
for img in public/img/{hero,drphilipe_perfil,contact-lenses-hero}.{png,jpg,jpeg}; do
    optimize_image "$img" $QUALITY_HIGH $MAX_WIDTH_HERO
done

echo ""
echo "👤 Avatares..."
for img in public/img/avatar-*.{png,jpg,jpeg}; do
    optimize_image "$img" $QUALITY_MEDIUM $MAX_WIDTH_AVATAR
done

echo ""
echo "🏥 Ícones médicos..."
for img in public/img/icon_*.{png,jpg,jpeg}; do
    optimize_image "$img" $QUALITY_LOW $MAX_WIDTH_ICON
done

echo ""
echo "📱 Ícones sociais..."
for img in public/icons_social/*.{png,jpg,jpeg}; do
    optimize_image "$img" $QUALITY_LOW 256
done

echo ""
echo "📊 Estatísticas:"
echo "  Imagens AVIF: $(find public -name "*.avif" | wc -l)"
echo "  Imagens WebP: $(find public -name "*.webp" | wc -l)"
echo "  Tamanho public/img: $(du -sh public/img/ | cut -f1)"
echo "  Tamanho icons_social: $(du -sh public/icons_social/ | cut -f1)"

echo ""
echo "✅ Otimização concluída!"
