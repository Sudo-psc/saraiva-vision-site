#!/bin/bash

# Build Validation Script - Saraiva Vision
# Validação completa de builds antes do deploy

set -euo pipefail

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="${PROJECT_DIR}/dist"
VALIDATION_LOG="${PROJECT_DIR}/logs/validation.log"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Criar diretório de logs
mkdir -p "$(dirname "$VALIDATION_LOG")"

# Função de logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$VALIDATION_LOG"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$VALIDATION_LOG"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$VALIDATION_LOG"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$VALIDATION_LOG"
}

# Verificar se o build existe
check_build_exists() {
    if [[ ! -d "$BUILD_DIR" ]]; then
        error "Diretório de build não encontrado: $BUILD_DIR"
        return 1
    fi

    if [[ ! -f "$BUILD_DIR/index.html" ]]; then
        error "Arquivo index.html não encontrado em: $BUILD_DIR"
        return 1
    fi

    log "✅ Diretório de build encontrado"
    return 0
}

# Validar estrutura de arquivos essenciais
validate_file_structure() {
    log "🔍 Validando estrutura de arquivos..."

    local errors=0
    local required_files=(
        "index.html"
        "favicon.ico"
        "robots.txt"
    )

    local required_dirs=(
        "assets"
        "img"
    )

    # Verificar arquivos obrigatórios
    for file in "${required_files[@]}"; do
        if [[ -f "$BUILD_DIR/$file" ]]; then
            log "  ✅ $file"
        else
            error "  ❌ $file (arquivo obrigatório)"
            ((errors++))
        fi
    done

    # Verificar diretórios obrigatórios
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$BUILD_DIR/$dir" ]]; then
            log "  ✅ $dir/"
        else
            error "  ❌ $dir/ (diretório obrigatório)"
            ((errors++))
        fi
    done

    # Verificar arquivos recomendados
    local recommended_files=(
        "sitemap.xml"
        "site.webmanifest"
        ".htaccess"
        "_redirects"
    )

    for file in "${recommended_files[@]}"; do
        if [[ -f "$BUILD_DIR/$file" ]]; then
            log "  ✅ $file (recomendado)"
        else
            warning "  ⚠️ $file (recomendado)"
        fi
    done

    return $errors
}

# Validar HTML principal
validate_html() {
    log "🔍 Validando HTML principal..."

    local html_file="$BUILD_DIR/index.html"
    local errors=0

    # Verificar DOCTYPE
    if grep -q "<!DOCTYPE html>" "$html_file"; then
        log "  ✅ DOCTYPE HTML5 presente"
    else
        error "  ❌ DOCTYPE ausente"
        ((errors++))
    fi

    # Verificar elementos essenciais
    local essential_elements=(
        "<html"
        "<head>"
        "<body>"
        "<title>"
        "<meta charset="
        "<meta name=\"viewport\""
    )

    for element in "${essential_elements[@]}"; do
        if grep -q "$element" "$html_file"; then
            log "  ✅ $element"
        else
            error "  ❌ $element ausente"
            ((errors++))
        fi
    done

    # Verificar referências a assets
    if grep -q "assets/index-" "$html_file"; then
        log "  ✅ Referência a bundle principal encontrada"

        # Extrair nomes dos bundles
        local js_bundle=$(grep -o 'assets/index-[^"]*\.js' "$html_file" | head -1)
        local css_bundle=$(grep -o 'assets/index-[^"]*\.css' "$html_file" | head -1)

        if [[ -n "$js_bundle" ]]; then
            log "  📦 Bundle JS: $js_bundle"
        else
            error "  ❌ Bundle JS não encontrado no HTML"
            ((errors++))
        fi

        if [[ -n "$css_bundle" ]]; then
            log "  📦 Bundle CSS: $css_bundle"
        else
            error "  ❌ Bundle CSS não encontrado no HTML"
            ((errors++))
        fi
    else
        error "  ❌ Nenhuma referência a bundles encontrada"
        ((errors++))
    fi

    # Verificar conteúdo específico do Saraiva Vision
    local saraiva_content=(
        "Saraiva Vision"
        "Oftalmologia"
        "Caratinga"
    )

    for content in "${saraiva_content[@]}"; do
        if grep -qi "$content" "$html_file"; then
            log "  ✅ Conteúdo '$content' encontrado"
        else
            warning "  ⚠️ Conteúdo '$content' não encontrado"
        fi
    done

    return $errors
}

# Validar assets
validate_assets() {
    log "🔍 Validando assets..."

    local assets_dir="$BUILD_DIR/assets"
    local errors=0

    if [[ ! -d "$assets_dir" ]]; then
        error "  ❌ Diretório assets/ não encontrado"
        return 1
    fi

    # Verificar bundles principais
    local js_bundles=($(find "$assets_dir" -name "index-*.js" 2>/dev/null))
    local css_bundles=($(find "$assets_dir" -name "index-*.css" 2>/dev/null))

    if [[ ${#js_bundles[@]} -gt 0 ]]; then
        for bundle in "${js_bundles[@]}"; do
            local size=$(stat -c%s "$bundle" 2>/dev/null || echo "0")
            if [[ $size -gt 1000 ]]; then
                log "  ✅ $(basename "$bundle") ($(($size / 1024))KB)"
            else
                error "  ❌ $(basename "$bundle") muito pequeno (${size} bytes)"
                ((errors++))
            fi
        done
    else
        error "  ❌ Nenhum bundle JavaScript encontrado"
        ((errors++))
    fi

    if [[ ${#css_bundles[@]} -gt 0 ]]; then
        for bundle in "${css_bundles[@]}"; do
            local size=$(stat -c%s "$bundle" 2>/dev/null || echo "0")
            if [[ $size -gt 1000 ]]; then
                log "  ✅ $(basename "$bundle") ($(($size / 1024))KB)"
            else
                error "  ❌ $(basename "$bundle") muito pequeno (${size} bytes)"
                ((errors++))
            fi
        done
    else
        error "  ❌ Nenhum bundle CSS encontrado"
        ((errors++))
    fi

    # Verificar outros assets
    local other_assets=$(find "$assets_dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.avif" -o -name "*.ico" \) 2>/dev/null | wc -l)
    log "  🖼️ $other_assets arquivos de imagem encontrados"

    # Verificar arquivos de mapa (source maps) - devem ser removidos em produção
    local source_maps=$(find "$assets_dir" -name "*.map" 2>/dev/null | wc -l)
    if [[ $source_maps -gt 0 ]]; then
        warning "  ⚠️ $source_maps source maps encontrados (devem ser removidos em produção)"
    fi

    return $errors
}

# Validar imagens
validate_images() {
    log "🔍 Validando imagens..."

    local img_dir="$BUILD_DIR/img"
    local blog_dir="$BUILD_DIR/Blog"

    # Verificar diretório img/
    if [[ -d "$img_dir" ]]; then
        local img_count=$(find "$img_dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.avif" \) 2>/dev/null | wc -l)
        log "  📸 $img_count imagens em img/"

        # Verificar imagens importantes
        local important_images=(
            "drphilipe_perfil"
            "consultorio"
            "fachada"
        )

        for img in "${important_images[@]}"; do
            if find "$img_dir" -name "$img*" -type f 2>/dev/null | grep -q .; then
                log "  ✅ Imagem $img encontrada"
            else
                warning "  ⚠️ Imagem $img não encontrada"
            fi
        done
    else
        warning "  ⚠️ Diretório img/ não encontrado"
    fi

    # Verificar diretório Blog/
    if [[ -d "$blog_dir" ]]; then
        local blog_img_count=$(find "$blog_dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.avif" \) 2>/dev/null | wc -l)
        log "  📝 $blog_img_count imagens de blog"
    else
        warning "  ⚠️ Diretório Blog/ não encontrado"
    fi
}

# Validar performance
validate_performance() {
    log "🔍 Validando métricas de performance..."

    local total_size=$(du -sb "$BUILD_DIR" 2>/dev/null | cut -f1 || echo "0")
    local total_size_mb=$((total_size / 1024 / 1024))

    log "  📊 Tamanho total: ${total_size_mb}MB"

    if [[ $total_size_mb -lt 50 ]]; then
        log "  ✅ Tamanho total adequado (< 50MB)"
    elif [[ $total_size_mb -lt 100 ]]; then
        warning "  ⚠️ Tamanho total grande (${total_size_mb}MB)"
    else
        error "  ❌ Tamanho total muito grande (${total_size_mb}MB)"
    fi

    # Verificar tamanho dos bundles
    local assets_dir="$BUILD_DIR/assets"
    if [[ -d "$assets_dir" ]]; then
        local main_js=$(find "$assets_dir" -name "index-*.js" -exec stat -c%s {} \; 2>/dev/null | sort -nr | head -1 || echo "0")
        local main_js_kb=$((main_js / 1024))

        if [[ $main_js_kb -lt 500 ]]; then
            log "  ✅ Bundle JS principal compacto (${main_js_kb}KB)"
        elif [[ $main_js_kb -lt 1000 ]]; then
            warning "  ⚠️ Bundle JS principal poderia ser menor (${main_js_kb}KB)"
        else
            error "  ❌ Bundle JS principal muito grande (${main_js_kb}KB)"
        fi
    fi
}

# Validar SEO
validate_seo() {
    log "🔍 Validando elementos SEO..."

    local html_file="$BUILD_DIR/index.html"
    local errors=0

    # Verificar meta tags SEO
    local seo_elements=(
        '<meta name="description"'
        '<meta property="og:title"'
        '<meta property="og:description"'
        '<meta property="og:image"'
        '<meta name="twitter:card"'
        '<link rel="canonical"'
    )

    for element in "${seo_elements[@]}"; do
        if grep -q "$element" "$html_file"; then
            log "  ✅ $(echo "$element" | cut -d'"' -f2)"
        else
            warning "  ⚠️ $(echo "$element" | cut -d'"' -f2) não encontrado"
        fi
    done

    # Verificar structured data
    if grep -q "application/ld+json" "$html_file"; then
        log "  ✅ Structured data encontrado"
    else
        warning "  ⚠️ Structured data não encontrado"
    fi

    # Verificar sitemap
    if [[ -f "$BUILD_DIR/sitemap.xml" ]]; then
        log "  ✅ Sitemap.xml presente"
    else
        warning "  ⚠️ Sitemap.xml não encontrado"
    fi

    return $errors
}

# Validar acessibilidade
validate_accessibility() {
    log "🔍 Validando acessibilidade básica..."

    local html_file="$BUILD_DIR/index.html"

    # Verificar lang attribute
    if grep -q 'lang="pt-BR"' "$html_file"; then
        log "  ✅ Atributo lang correto"
    else
        warning "  ⚠️ Atributo lang não encontrado ou incorreto"
    fi

    # Verificar alt attributes (básico)
    local img_tags=$(grep -c '<img' "$html_file" 2>/dev/null || echo "0")
    if [[ $img_tags -gt 0 ]]; then
        local alt_tags=$(grep -c 'alt=' "$html_file" 2>/dev/null || echo "0")
        if [[ $alt_tags -ge $img_tags ]]; then
            log "  ✅ Todas as imagens têm atributo alt"
        else
            warning "  ⚠️ Algumas imagens podem não ter atributo alt ($alt_tags/$img_tags)"
        fi
    fi

    # Verificar heading structure
    if grep -q "<h1" "$html_file"; then
        log "  ✅ Tag H1 presente"
    else
        warning "  ⚠️ Tag H1 não encontrada"
    fi
}

# Executar testes funcionais básicos
run_functional_tests() {
    log "🧪 Executando testes funcionais básicos..."

    # Testar se o HTML está bem formado (básico)
    if command -v tidy >/dev/null 2>&1; then
        if tidy -eq "$BUILD_DIR/index.html" >/dev/null 2>&1; then
            log "  ✅ HTML bem formado"
        else
            warning "  ⚠️ HTML pode ter problemas de formatação"
        fi
    else
        warning "  ⚠️ 'tidy' não disponível para validação HTML"
    fi

    # Verificar links quebrados (básico)
    local html_file="$BUILD_DIR/index.html"
    local internal_links=$(grep -o 'href="[^"]*"' "$html_file" | grep -v "^href=\"http" | cut -d'"' -f2 | grep -v "^#" | grep -v "^mailto:")

    local broken_links=0
    for link in $internal_links; do
        if [[ -f "$BUILD_DIR/$link" ]]; then
            log "  ✅ Link interno: $link"
        else
            warning "  ⚠️ Link interno quebrado: $link"
            ((broken_links++))
        fi
    done

    if [[ $broken_links -eq 0 ]]; then
        log "  ✅ Todos os links internos funcionam"
    fi
}

# Gerar relatório de validação
generate_report() {
    local total_errors=$1
    local build_name="build_$(date +%Y%m%d_%H%M%S)"

    log ""
    log "📋 RELATÓRIO DE VALIDAÇÃO"
    log "========================="
    log "Build: $build_name"
    log "Data: $(date)"
    log "Erros: $total_errors"
    log ""

    if [[ $total_errors -eq 0 ]]; then
        log "🎉 BUILD VALIDADO COM SUCESSO!"
        log "✅ O build está pronto para deploy em produção"
        return 0
    else
        log "❌ BUILD COM PROBLEMAS!"
        log "⚠️ Corrija os erros antes de fazer o deploy"
        return 1
    fi
}

# Função principal
main() {
    log "🚀 Iniciando validação do build..."
    log "📁 Diretório: $BUILD_DIR"
    log "========================="

    local total_errors=0

    # Executar validações
    check_build_exists || ((total_errors++))
    validate_file_structure; ((total_errors+=$?))
    validate_html; ((total_errors+=$?))
    validate_assets; ((total_errors+=$?))
    validate_images
    validate_performance
    validate_seo
    validate_accessibility
    run_functional_tests

    echo
    generate_report $total_errors
}

# Executar script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi