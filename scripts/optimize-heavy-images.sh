#!/bin/bash

set -euo pipefail

BLOG_DIR="/home/saraiva-vision-site/public/Blog"

# Lista das imagens mais pesadas para otimizar
HEAVY_IMAGES=(
    "$BLOG_DIR/terapia-genetica.png"
    "$BLOG_DIR/capa-lampada.png"
    "$BLOG_DIR/capa-cuidados-visuais-esportes.png"
    "$BLOG_DIR/retinose-pigmentar.png"
    "$BLOG_DIR/capa_post_1_imagen4_opt2_20251001_100736.png"
    "$BLOG_DIR/capa_post_10_imagen4_opt1_20251001_095940.png"
)

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

optimize_image() {
    local input_file="$1"
    local basename=$(basename "$input_file" | sed 's/\.[^.]*$//')
    local dirname=$(dirname "$input_file")

    if [[ ! -f "$input_file" ]]; then
        log "⚠️  Arquivo não encontrado: $input_file"
        return 1
    fi

    log "🔄 Otimizando: $(basename "$input_file")"

    # Tamanho original
    local original_bytes=$(stat -c%s "$input_file")
    local original_mb=$((original_bytes / 1024 / 1024))
    log "   📏 Tamanho original: ${original_mb}MB"

    # Verificar se já foi otimizado
    if [[ -f "${dirname}/${basename}.webp" ]]; then
        log "   ⏭️  Já otimizado, pulando..."
        return 0
    fi

    # Redimensionar para máximo 1920px
    local temp_file="/tmp/temp_${basename}.png"
    convert "$input_file" -resize 1920x1920 -quality 85 -strip "$temp_file"

    # Converter para WebP
    local webp_file="${dirname}/${basename}.webp"
    cwebp -q 85 -mt "$temp_file" -o "$webp_file" 2>/dev/null || \
    convert "$temp_file" -quality 85 -strip "$webp_file"

    # Converter para AVIF
    local avif_file="${dirname}/${basename}.avif"
    avifenc --min 0 --max 63 --speed 6 "$temp_file" "$avif_file" 2>/dev/null || \
    convert "$temp_file" -quality 85 "$avif_file"

    # Verificar resultado
    if [[ -f "$webp_file" ]]; then
        local webp_bytes=$(stat -c%s "$webp_file")
        local webp_mb=$((webp_bytes / 1024 / 1024))
        local savings_mb=$(((original_bytes - webp_bytes) / 1024 / 1024))
        local savings_percent=$(((original_bytes - webp_bytes) * 100 / original_bytes))

        log "   ✅ WebP: ${webp_mb}MB (-${savings_mb}MB, -${savings_percent}%)"

        # Backup do original
        mv "$input_file" "${dirname}/${basename}-original.png"

        log "   📦 Original backup: ${basename}-original.png"
    else
        log "   ❌ Falha na otimização"
        return 1
    fi

    # Criar versões responsivas
    for size in 320 768 1280; do
        local responsive_file="${dirname}/${basename}-${size}.webp"
        convert "$temp_file" -resize "${size}x${size}" -quality 80 -strip "$responsive_file" 2>/dev/null || true

        if [[ -f "$responsive_file" ]]; then
            local resp_kb=$(( $(stat -c%s "$responsive_file") / 1024 ))
            log "      📱 ${size}px: ${resp_kb}KB"
        fi
    done

    # Limpar temporário
    rm -f "$temp_file"

    log "   ✅ Concluído: $basename"
    echo ""
}

# Main
log "🚀 INICIO OTIMIZAÇÃO DAS IMAGENS PESADAS"

total_original=0
total_saved=0

for image in "${HEAVY_IMAGES[@]}"; do
    if [[ -f "$image" ]]; then
        original_bytes=$(stat -c%s "$image")
        total_original=$((total_original + original_bytes))

        if optimize_image "$image"; then
            # Calcular economia
            basename=$(basename "$image" | sed 's/\.[^.]*$//')
            dirname=$(dirname "$image")
            webp_file="${dirname}/${basename}.webp"

            if [[ -f "$webp_file" ]]; then
                webp_bytes=$(stat -c%s "$webp_file")
                saved=$((original_bytes - webp_bytes))
                total_saved=$((total_saved + saved))
            fi
        fi
    fi
done

# Relatório final
if [[ $total_original -gt 0 ]]; then
    saved_percent=$((total_saved * 100 / total_original))
    log "📊 RESUMO:"
    log "   Tamanho original: $((total_original / 1024 / 1024))MB"
    log "   Economia total: $((total_saved / 1024 / 1024))MB (-${saved_percent}%)"
fi

log "✅ OTIMIZAÇÃO CONCLUÍDA"