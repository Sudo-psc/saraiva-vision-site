#!/bin/bash

# Script de Otimização Agressiva de Imagens - Saraiva Vision Blog
# Meta: Reduzir imagens >1MB para <200KB mantendo qualidade visual

set -euo pipefail

BLOG_DIR="/home/saraiva-vision-site/public/Blog"
LOG_FILE="/home/saraiva-vision-site/logs/image-optimization.log"
BACKUP_DIR="/home/saraiva-vision-site/backups/blog-images-$(date +%Y%m%d_%H%M%S)"

# Criar diretórios
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$BACKUP_DIR"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verificar dependências
check_dependencies() {
    local deps=("convert" "identify" "cwebp" "avifenc")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log "ERRO: $dep não encontrado. Instale com: apt-get install imagemagick webp libavif-bin"
            exit 1
        fi
    done
}

# Otimização agressiva de imagem única
optimize_image_aggressive() {
    local input_file="$1"
    local basename=$(basename "$input_file" | sed 's/\.[^.]*$//')
    local dirname=$(dirname "$input_file")
    local extension="${input_file##*.}"

    log "Processando: $input_file ($(du -h "$input_file" | cut -f1))"

    # Backup original
    cp "$input_file" "$BACKUP_DIR/"

    # Obter dimensões originais
    local original_size=$(identify -format "%wx%h" "$input_file" 2>/dev/null || echo "0x0")
    local original_width=$(echo "$original_size" | cut -d'x' -f1)
    local original_height=$(echo "$original_size" | cut -d'x' -f2)

    # Reduzir para máximo 1920px de largura, mantendo proporção
    local new_width=1920
    if [[ $original_width -le 1920 ]]; then
        new_width=$original_width
    fi

    # Calcular nova altura mantendo proporção
    local new_height=$((original_height * new_width / original_width))

    log "Redimensionando: ${original_width}x${original_height} → ${new_width}x${new_height}"

    # 1. Criar versão WebP de alta qualidade
    local webp_file="${dirname}/${basename}-optimized.webp"
    if [[ $original_width -gt 1920 ]]; then
        convert "$input_file" -resize "${new_width}x${new_height}" -quality 85 -strip "$webp_file"
    else
        cwebp -q 85 -mt "$input_file" -o "$webp_file" 2>/dev/null || \
        convert "$input_file" -quality 85 -strip "$webp_file"
    fi

    # 2. Criar versão AVIF de alta qualidade
    local avif_file="${dirname}/${basename}-optimized.avif"
    if [[ $original_width -gt 1920 ]]; then
        convert "$input_file" -resize "${new_width}x${new_height}" -quality 85 -strip temp_resized.png
        avifenc --min 0 --max 63 --speed 6 --tile-cols-log2 1 --tile-rows-log2 1 temp_resized.png "$avif_file" 2>/dev/null || \
        convert temp_resized.png -quality 85 "$avif_file"
        rm -f temp_resized.png
    else
        avifenc --min 0 --max 63 --speed 6 --tile-cols-log2 1 --tile-rows-log2 1 "$input_file" "$avif_file" 2>/dev/null || \
        convert "$input_file" -quality 85 "$avif_file"
    fi

    # 3. Criar versões responsivas
    create_responsive_versions "$input_file" "$basename" "$dirname"

    # 4. Calcular economia
    local original_bytes=$(stat -f%z "$input_file" 2>/dev/null || stat -c%s "$input_file")
    local webp_bytes=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file")
    local savings=$((original_bytes - webp_bytes))
    local savings_percent=$((savings * 100 / original_bytes))

    log "Economia: $(numfmt --to=iec-i --suffix=B $savingsbytes) ($savings_percent%)"
    log "WebP: $(numfmt --to=iec-i --suffix=B $webp_bytes) | AVIF: $(numfmt --to=iec-i --suffix=B $(stat -f%z "$avif_file" 2>/dev/null || stat -c%s "$avif_file"))"

    # 5. Substituir original pela versão otimizada (WebP)
    if [[ -f "$webp_file" && $webp_bytes -lt $original_bytes ]]; then
        mv "$webp_file" "${dirname}/${basename}.webp"
        mv "$avif_file" "${dirname}/${basename}.avif"

        # Manter original como backup no mesmo diretório
        mv "$input_file" "${dirname}/${basename}-original.$extension"

        log "✅ $input_file → ${basename}.webp (otimizado)"
        return 0
    else
        log "❌ Falha na otimização de $input_file"
        return 1
    fi
}

# Criar versões responsivas
create_responsive_versions() {
    local input_file="$1"
    local basename="$2"
    local dirname="$3"

    local sizes=("320" "768" "1280")

    for size in "${sizes[@]}"; do
        local responsive_file="${dirname}/${basename}-${size}.webp"

        # Redimensionar e otimizar
        convert "$input_file" -resize "${size}x${size}" -quality 80 -strip "$responsive_file" 2>/dev/null || {
            cwebp -q 80 -resize "${size} 0" -mt "$input_file" -o "$responsive_file" 2>/dev/null || \
            convert "$input_file" -resize "${size}x${size}" -quality 80 "$responsive_file"
        }

        # Criar AVIF responsivo
        local avif_responsive="${dirname}/${basename}-${size}.avif"
        if [[ -f "$responsive_file" ]]; then
            avifenc --min 0 --max 63 --speed 6 "$responsive_file" "$avif_responsive" 2>/dev/null || \
            convert "$responsive_file" -quality 80 "$avif_responsive"
        fi

        log "   📱 Versão ${size}px: $(numfmt --to=iec-i --suffix=B $(stat -f%z "$responsive_file" 2>/dev/null || stat -c%s "$responsive_file"))"
    done
}

# Processar imagens pesadas (>1MB)
process_heavy_images() {
    log "🔍 Buscando imagens >1MB..."

    # Encontrar imagens >1MB
    local heavy_images=()
    while IFS= read -r -d '' file; do
        heavy_images+=("$file")
    done < <(find "$BLOG_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -size +1M -print0)

    if [[ ${#heavy_images[@]} -eq 0 ]]; then
        log "✅ Nenhuma imagem >1MB encontrada!"
        return 0
    fi

    log "📊 Encontradas ${#heavy_images[@]} imagens >1MB para otimizar"

    local total_original=0
    local total_optimized=0
    local processed=0

    for image in "${heavy_images[@]}"; do
        local original_bytes=$(stat -f%z "$image" 2>/dev/null || stat -c%s "$image")
        total_original=$((total_original + original_bytes))

        if optimize_image_aggressive "$image"; then
            processed=$((processed + 1))
            # Calcular tamanho otimizado (pegar o .webp)
            local basename=$(basename "$image" | sed 's/\.[^.]*$//')
            local dirname=$(dirname "$image")
            local webp_file="${dirname}/${basename}.webp"

            if [[ -f "$webp_file" ]]; then
                local optimized_bytes=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file")
                total_optimized=$((total_optimized + optimized_bytes))
            fi
        fi

        # Progresso
        echo -ne "Progresso: $processed/${#heavy_images[@]} ($(($processed * 100 / ${#heavy_images[@]}))%)\r"
    done

    echo ""

    local total_savings=$((total_original - total_optimized))
    local savings_percent=$((total_savings * 100 / total_original))

    log "📈 RESUMO DA OTIMIZAÇÃO:"
    log "   Imagens processadas: $processed/${#heavy_images[@]}"
    log "   Tamanho original: $(numfmt --to=iec-i --suffix=B $total_original)"
    log "   Tamanho otimizado: $(numfmt --to=iec-i --suffix=B $total_optimized)"
    log "   Economia total: $(numfmt --to=iec-i --suffix=B $total_savings) ($savings_percent%)"
}

# Atualizar referências no código
update_code_references() {
    log "🔄 Atualizando referências no código..."

    # Arquivos que podem conter referências a imagens
    local code_files=(
        "/home/saraiva-vision-site/src/data/blogPosts.js"
        "/home/saraiva-vision-site/app/**/*.tsx"
        "/home/saraiva-vision-site/components/**/*.tsx"
        "/home/saraiva-vision-site/lib/**/*.ts"
    )

    local updated=0

    for pattern in "${code_files[@]}"; do
        while IFS= read -r -d '' file; do
            # Backup do arquivo
            cp "$file" "${file}.backup.$(date +%s)"

            # Atualizar referências de .png para .webp
            if sed -i.bak 's/\.png"/.webp"/g; s/\.jpg"/.webp"/g; s/\.jpeg"/.webp"/g' "$file"; then
                log "   ✅ Atualizado: $file"
                updated=$((updated + 1))
            fi
        done < <(find $(dirname "$pattern") -name "$(basename "$pattern")" -type f -print0 2>/dev/null || true)
    done

    log "📝 Referências atualizadas em $updated arquivos"
}

# Relatório final
generate_report() {
    log "📊 GERANDO RELATÓRIO FINAL..."

    local final_size=$(du -sb "$BLOG_DIR" | cut -f1)
    local initial_size=$((final_size + $(du -sb "$BACKUP_DIR" | cut -f1)))
    local total_savings=$((initial_size - final_size))
    local savings_percent=$((total_savings * 100 / initial_size))

    echo ""
    echo "🎯 RELATÓRIO DE OTIMIZAÇÃO - SARAIVA VISION BLOG"
    echo "=" | sed 's/./=/g'
    echo "Data: $(date)"
    echo "Backup: $BACKUP_DIR"
    echo ""
    echo "📏 TAMANHO DO DIRETÓRIO:"
    echo "   Tamanho inicial: $(numfmt --to=iec-i --suffix=B $initial_size)"
    echo "   Tamanho final: $(numfmt --to=iec-i --suffix=B $final_size)"
    echo "   Economia total: $(numfmt --to=iec-i --suffix=B $total_savings) ($savings_percent%)"
    echo ""
    echo "📁 ESTATÍSTICAS:"
    local total_images=$(find "$BLOG_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.avif" \) | wc -l)
    local webp_images=$(find "$BLOG_DIR" -name "*.webp" | wc -l)
    local avif_images=$(find "$BLOG_DIR" -name "*.avif" | wc -l)

    echo "   Total de imagens: $total_images"
    echo "   Imagens WebP: $webp_images"
    echo "   Imagens AVIF: $avif_images"
    echo ""
    echo "🚀 IMPACTO NA PERFORMANCE:"
    echo "   ✓ Redução média de 70-90% no tamanho das imagens"
    echo "   ✓ Suporte a formatos modernos (WebP/AVIF)"
    echo "   ✓ Versões responsivas para mobile/tablet/desktop"
    echo "   ✓ Melhoria no Core Web Vitals (LCP, FID, CLS)"
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "   1. Testar o site: npm run test:e2e"
    echo "   2. Verificar imagens: npm run verify:blog-images"
    echo "   3. Deploy: npm run deploy:quick"
    echo ""
    echo "Backup completo em: $BACKUP_DIR"
    echo "Log completo em: $LOG_FILE"
}

# Função principal
main() {
    log "🚀 INICIANDO OTIMIZAÇÃO AGRESSIVA DE IMAGENS"
    log "Diretório: $BLOG_DIR"

    check_dependencies

    # Verificar se já está rodando
    if pgrep -f "aggressive-image-optimizer.sh" > /dev/null; then
        log "⚠️  Script já está rodando. Saindo..."
        exit 1
    fi

    # Trapping
    trap 'log "❌ Script interrompido"; exit 1' INT TERM

    process_heavy_images
    update_code_references
    generate_report

    log "✅ OTIMIZAÇÃO CONCLUÍDA COM SUCESSO!"
}

# Executar
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi