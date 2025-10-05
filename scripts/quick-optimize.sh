#!/bin/bash

# Otimização rápida das imagens mais pesadas do blog
set -euo pipefail

BLOG_DIR="/home/saraiva-vision-site/public/Blog"
LOG_FILE="/tmp/quick-optimize.log"

log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

optimize_single_image() {
    local input_file="$1"
    local basename=$(basename "$input_file" | sed 's/\.[^.]*$//')
    local dirname=$(dirname "$input_file")
    local extension="${input_file##*.}"

    log "Otimizando: $input_file"

    # Obter tamanho original
    local original_bytes=$(stat -c%s "$input_file")
    log "  Tamanho original: $(numfmt --to=iec-i --suffix=B $original_bytes)"

    # Redimensionar para máximo 1920px se for maior
    local original_size=$(identify -format "%wx%h" "$input_file" 2>/dev/null || echo "0x0")
    local original_width=$(echo "$original_size" | cut -d'x' -f1)

    if [[ $original_width -gt 1920 ]]; then
        log "  Redimensionando de ${original_width}px para 1920px"
        convert "$input_file" -resize 1920x1920 -quality 85 -strip temp_resized.png
        input_file="temp_resized.png"
    fi

    # Converter para WebP
    local webp_file="${dirname}/${basename}.webp"
    cwebp -q 85 -mt "$input_file" -o "$webp_file" 2>/dev/null || \
    convert "$input_file" -quality 85 -strip "$webp_file"

    # Converter para AVIF
    local avif_file="${dirname}/${basename}.avif"
    avifenc --min 0 --max 63 --speed 6 "$input_file" "$avif_file" 2>/dev/null || \
    convert "$input_file" -quality 85 "$avif_file"

    # Calcular economia
    if [[ -f "$webp_file" ]]; then
        local webp_bytes=$(stat -c%s "$webp_file")
        local savings=$((original_bytes - webp_bytes))
        local savings_percent=$((savings * 100 / original_bytes))

        log "  WebP: $(numfmt --to=iec-i --suffix=B $webp_bytes) (-${savings_percent}%)"

        # Substituir original
        mv "$input_file" "${dirname}/${basename}-original.$extension"
        log "  ✅ Original movido para ${basename}-original.$extension"
    fi

    # Criar versões responsivas
    for size in 320 768 1280; do
        local responsive_file="${dirname}/${basename}-${size}.webp"
        convert "${BLOG_DIR}/${basename}-original.$extension" -resize "${size}x${size}" -quality 80 -strip "$responsive_file" 2>/dev/null || true
        local resp_bytes=$(stat -c%s "$responsive_file" 2>/dev/null || echo "0")
        if [[ $resp_bytes -gt 0 ]]; then
            log "    📱 ${size}px: $(numfmt --to=iec-i --suffix=B $resp_bytes)"
        fi
    done

    # Limpar temporário
    rm -f temp_resized.png

    log "  ✅ Concluído: $basename"
    echo ""
}

# Main
log "🚀 INICIO OTIMIZAÇÃO RÁPIDA"

# Processar as 15 imagens mais pesadas (>500KB)
find "$BLOG_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -size +512000 | head -15 | while read -r file; do
    optimize_single_image "$file"
done

log "✅ OTIMIZAÇÃO CONCLUÍDA"