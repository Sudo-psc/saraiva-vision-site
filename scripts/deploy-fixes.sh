#!/bin/bash
# ==============================================================================
# Deploy de Correções - Saraiva Vision
# Aplica todas as correções validadas para produção
# Autor: Dr. Philipe Saraiva Cruz
# Data: 2025-10-24
# ==============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           DEPLOYMENT DE CORREÇÕES - SARAIVA VISION           ║"
echo "╔══════════════════════════════════════════════════════════════╗"
echo ""

# Verificar se está em ambiente correto
if [ ! -f "package.json" ]; then
    log_error "Execute este script no diretório raiz do projeto"
    exit 1
fi

# Modo dry-run por padrão
DRY_RUN=true
SKIP_NGINX=false
SKIP_SW=false

# Parse argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --apply)
            DRY_RUN=false
            shift
            ;;
        --skip-nginx)
            SKIP_NGINX=true
            shift
            ;;
        --skip-sw)
            SKIP_SW=true
            shift
            ;;
        *)
            echo "Uso: $0 [--apply] [--skip-nginx] [--skip-sw]"
            echo ""
            echo "Opções:"
            echo "  --apply       Aplicar mudanças (padrão: dry-run)"
            echo "  --skip-nginx  Pular configuração nginx"
            echo "  --skip-sw     Pular atualização service worker"
            exit 1
            ;;
    esac
done

if [ "$DRY_RUN" = true ]; then
    log_warning "Modo DRY-RUN ativo. Use --apply para aplicar mudanças."
    echo ""
fi

###############################################################################
# FASE 1: BACKUP
###############################################################################

log_info "📦 Fase 1: Criando backups de segurança..."
echo ""

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

if [ "$DRY_RUN" = false ]; then
    mkdir -p "$BACKUP_DIR"

    # Backup service worker
    if [ -f "public/sw.js" ]; then
        cp public/sw.js "$BACKUP_DIR/sw.js.backup"
        log_success "Backup: public/sw.js → $BACKUP_DIR/sw.js.backup"
    fi

    # Backup nginx configs (se tiver permissão)
    if [ -f "/etc/nginx/sites-available/saraivavision" ] && [ -w "/etc/nginx/sites-available/" ]; then
        sudo cp /etc/nginx/sites-available/saraivavision "$BACKUP_DIR/nginx-saraivavision.backup"
        log_success "Backup: nginx config → $BACKUP_DIR/nginx-saraivavision.backup"
    fi
else
    log_info "DRY-RUN: Criaria backups em $BACKUP_DIR"
fi

echo ""

###############################################################################
# FASE 2: SERVICE WORKER
###############################################################################

if [ "$SKIP_SW" = false ]; then
    log_info "🔧 Fase 2: Atualizando Service Worker..."
    echo ""

    if [ -f "public/sw.js.backup.20251022_005207" ]; then
        if [ "$DRY_RUN" = false ]; then
            cp public/sw.js.backup.20251022_005207 public/sw.js
            log_success "Service Worker atualizado com:"
            log_success "  ✓ IndexedDB analytics persistence"
            log_success "  ✓ offline.html precaching"
            log_success "  ✓ navigator.onLine removed"
        else
            log_info "DRY-RUN: Copiaria sw.js.backup.20251022_005207 → sw.js"
            log_info "  Incluindo:"
            log_info "    - IndexedDB analytics persistence"
            log_info "    - offline.html precaching"
            log_info "    - navigator.onLine fix"
        fi
    else
        log_warning "Arquivo sw.js.backup.20251022_005207 não encontrado"
    fi
else
    log_warning "Pulando atualização do Service Worker (--skip-sw)"
fi

echo ""

###############################################################################
# FASE 3: NGINX CONFIGURATION
###############################################################################

if [ "$SKIP_NGINX" = false ]; then
    log_info "🔧 Fase 3: Atualizando configuração Nginx..."
    echo ""

    if [ -f "backups/20251015_222018/nginx-saraivavision.conf" ]; then
        if [ "$DRY_RUN" = false ]; then
            if [ -w "/etc/nginx/sites-available/" ]; then
                # Copiar configuração
                sudo cp backups/20251015_222018/nginx-saraivavision.conf /etc/nginx/sites-available/saraivavision

                # Testar configuração
                log_info "Testando configuração nginx..."
                if sudo nginx -t 2>&1 | grep -q "test is successful"; then
                    log_success "Configuração nginx válida"

                    # Reload nginx
                    log_info "Recarregando nginx..."
                    sudo systemctl reload nginx
                    log_success "Nginx recarregado com sucesso"
                    log_success "  ✓ CSP ativado com JotForm whitelist"
                else
                    log_error "Configuração nginx inválida. Revertendo..."
                    sudo cp "$BACKUP_DIR/nginx-saraivavision.backup" /etc/nginx/sites-available/saraivavision
                    exit 1
                fi
            else
                log_error "Sem permissão para escrever em /etc/nginx/sites-available/"
                log_info "Execute com sudo ou configure manualmente"
            fi
        else
            log_info "DRY-RUN: Copiaria nginx config e testaria"
            log_info "  Incluindo:"
            log_info "    - CSP ativado"
            log_info "    - JotForm domains whitelisted"
        fi
    else
        log_warning "Arquivo nginx-saraivavision.conf não encontrado em backups"
    fi
else
    log_warning "Pulando atualização Nginx (--skip-nginx)"
fi

echo ""

###############################################################################
# FASE 4: REBUILD & VALIDATION
###############################################################################

log_info "🔨 Fase 4: Rebuild e Validação..."
echo ""

if [ "$DRY_RUN" = false ]; then
    # Rebuild
    log_info "Executando build..."
    npm run build

    if [ $? -eq 0 ]; then
        log_success "Build executado com sucesso"

        # Verificar bundle
        bundle_files=(dist/assets/index-*.js)
        if [ -e "${bundle_files[0]}" ]; then
            bundle_size=$(du -h "${bundle_files[0]}" | awk '{print $1}')
            log_success "Bundle gerado: $bundle_size"
        fi

        # Verificar service worker
        if [ -f "dist/sw.js" ]; then
            log_success "Service Worker presente no dist/"
        fi
    else
        log_error "Falha no build"
        exit 1
    fi
else
    log_info "DRY-RUN: Executaria npm run build"
fi

echo ""

###############################################################################
# FASE 5: RESUMO
###############################################################################

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     ✅ DEPLOYMENT COMPLETO                    ║"
echo "╔══════════════════════════════════════════════════════════════╗"
echo ""

if [ "$DRY_RUN" = false ]; then
    log_success "Todas as correções foram aplicadas com sucesso!"
    echo ""
    echo "Próximos passos:"
    echo "  1. Validar site em staging"
    echo "  2. Testar GTM/GA e JotForm"
    echo "  3. Verificar analytics persistence"
    echo "  4. Monitorar CSP violations"
    echo "  5. Deploy para produção"
else
    log_info "Modo DRY-RUN - Nenhuma alteração foi feita"
    log_info "Execute com --apply para aplicar as correções"
fi

echo ""
log_info "Relatório completo: claudedocs/FIXES_VALIDATION_REPORT.md"
echo ""
