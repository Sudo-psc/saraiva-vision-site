#!/bin/bash

###############################################################################
# Deploy Atômico Otimizado v2 - Saraiva Vision
# Descrição: Deploy com zero-downtime + shared node_modules
# Uso: sudo ./scripts/deploy-optimized-v2.sh
# Otimizações: Shared dependencies, smart caching, faster deploys
###############################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configurações do projeto
DOMAIN="saraivavision.com.br"
SOURCE_DIR="/home/saraiva-vision-site"
APP_ROOT="/var/www/saraivavision"
BUILD_CMD="npm run build:vite"
BUILD_DIR="dist"
HEALTHCHECK_URL="https://saraivavision.com.br/"
KEEP_RELEASES=5

# Diretórios
RELEASES_DIR="${APP_ROOT}/releases"
SHARED_DIR="${APP_ROOT}/shared"
SHARED_NODE_MODULES="${SHARED_DIR}/node_modules"
CURRENT_LINK="${APP_ROOT}/current"

# Timestamp para esta release
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"
LOG_FILE="/home/saraiva-vision-site/claudelogs/deploy/deploy_${TIMESTAMP}.log"

# Criar diretórios de log
mkdir -p "$(dirname "$LOG_FILE")"

# Função de log
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $*" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[✗]${NC} $*" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "\n${CYAN}▶${NC} ${YELLOW}$*${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${MAGENTA}[ℹ]${NC} $*" | tee -a "$LOG_FILE"
}

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script deve ser executado como root (sudo)"
   exit 1
fi

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════╗
║  Deploy Atômico Otimizado v2 - Saraiva Vision ║
╚══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Iniciando deploy otimizado v2"
log "Source: $SOURCE_DIR"
log "Release: $TIMESTAMP"
log "Log: $LOG_FILE"
echo ""

# Fase 1: Preparar estrutura
log_step "Fase 1: Preparando estrutura de diretórios"

mkdir -p "$RELEASES_DIR"
mkdir -p "$SHARED_DIR"
mkdir -p "$SHARED_NODE_MODULES"

log_success "Estrutura criada"

# Fase 2: Copiar código fonte
log_step "Fase 2: Copiando código fonte"

mkdir -p "$RELEASE_DIR"

rsync -a \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='claudelogs' \
    --exclude='venv' \
    --exclude='.next' \
    "$SOURCE_DIR/" "$RELEASE_DIR/"

COMMIT_HASH=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
log_success "Código copiado (commit: $COMMIT_HASH)"

# Fase 2.5: Análise de mudanças (Smart Dependency Detection)
log_step "Fase 2.5: Analisando mudanças (Smart Detection)"

cd "$RELEASE_DIR"

if [[ ! -f "package.json" ]]; then
    log_error "package.json não encontrado em $RELEASE_DIR"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

# Detectar se package.json mudou
PREVIOUS_RELEASE=""
if [[ -L "$CURRENT_LINK" ]]; then
    PREVIOUS_RELEASE=$(readlink "$CURRENT_LINK" | sed 's|/dist$||')
fi

NEED_NPM_INSTALL=false
PACKAGE_CHANGED=false

# PREVIOUS_RELEASE pode ser /path/releases/TIMESTAMP ou /path/releases/TIMESTAMP/dist
# Vamos normalizar para obter o diretório da release
if [[ "$PREVIOUS_RELEASE" == */dist ]]; then
    PREV_RELEASE_ROOT=$(dirname "$PREVIOUS_RELEASE")
else
    PREV_RELEASE_ROOT="$PREVIOUS_RELEASE"
fi

if [[ -n "$PREV_RELEASE_ROOT" ]] && [[ -f "$PREV_RELEASE_ROOT/package.json" ]]; then
    PREV_PKG_HASH=$(md5sum "$PREV_RELEASE_ROOT/package.json" | awk '{print $1}')
    CURR_PKG_HASH=$(md5sum "$RELEASE_DIR/package.json" | awk '{print $1}')
    
    if [[ "$PREV_PKG_HASH" != "$CURR_PKG_HASH" ]]; then
        log_warning "package.json modificado - instalação completa necessária"
        NEED_NPM_INSTALL=true
        PACKAGE_CHANGED=true
    else
        log_info "package.json inalterado - usando node_modules compartilhado"
        NEED_NPM_INSTALL=false
    fi
else
    log_warning "Primeira instalação ou release anterior não encontrada"
    NEED_NPM_INSTALL=true
fi

# Verificar se shared node_modules existe e está válido
if [[ ! -d "$SHARED_NODE_MODULES" ]] || [[ ! -f "$SHARED_DIR/.package.json" ]]; then
    log_warning "Shared node_modules não encontrado - instalação necessária"
    NEED_NPM_INSTALL=true
fi

log_success "Análise de mudanças concluída"

# Fase 3: Gerenciar dependências (Otimizado)
log_step "Fase 3: Gerenciando dependências"

if [[ "$NEED_NPM_INSTALL" == "true" ]]; then
    log "Instalando dependências (primeira vez ou package.json mudou)..."
    
    # Instalar em diretório temporário
    if npm install --production=false >> "$LOG_FILE" 2>&1; then
        log_success "Dependências instaladas"
        
        # Atualizar shared node_modules
        log "Atualizando shared node_modules..."
        rm -rf "$SHARED_NODE_MODULES"
        cp -r "$RELEASE_DIR/node_modules" "$SHARED_NODE_MODULES"
        
        # Copiar package.json e lock para referência
        cp "$RELEASE_DIR/package.json" "$SHARED_NODE_MODULES/../.package.json"
        cp "$RELEASE_DIR/package-lock.json" "$SHARED_NODE_MODULES/../.package-lock.json" 2>/dev/null || true
        
        log_success "Shared node_modules atualizado"
    else
        log_error "Falha ao instalar dependências! Verifique o log: $LOG_FILE"
        rm -rf "$RELEASE_DIR"
        exit 1
    fi
else
    log_info "Usando node_modules compartilhado (economizando ~24s)"
    
    # Verificar integridade
    if [[ -d "$SHARED_NODE_MODULES" ]]; then
        # Criar symlink
        rm -rf "$RELEASE_DIR/node_modules"
        ln -sf "$SHARED_NODE_MODULES" "$RELEASE_DIR/node_modules"
        log_success "Symlink para shared node_modules criado"
    else
        log_error "Shared node_modules corrompido! Abortando..."
        rm -rf "$RELEASE_DIR"
        exit 1
    fi
fi

# Fase 4: Build da aplicação
log_step "Fase 4: Building aplicação"

cd "$RELEASE_DIR"

# Executar build
BUILD_START=$(date +%s)
log "Executando: $BUILD_CMD"

if eval "$BUILD_CMD" >> "$LOG_FILE" 2>&1; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    log_success "Build concluído em ${BUILD_TIME}s"
else
    log_error "Build falhou! Verifique o log: $LOG_FILE"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

# Verificar se diretório de build existe
if [[ ! -d "${RELEASE_DIR}/${BUILD_DIR}" ]]; then
    log_error "Diretório de build não encontrado: ${RELEASE_DIR}/${BUILD_DIR}"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

# Fase 5: Configurar shared folders
log_step "Fase 5: Configurando shared folders"

# Se houver storage/uploads compartilhados no futuro
# ln -sf "${SHARED_DIR}/storage" "${RELEASE_DIR}/dist/storage"

log_success "Shared folders configurados"

# Fase 6: Healthcheck local
log_step "Fase 6: Healthcheck local"

log "Verificando arquivos essenciais..."

REQUIRED_FILES=(
    "${RELEASE_DIR}/${BUILD_DIR}/index.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        log_error "Arquivo essencial não encontrado: $file"
        rm -rf "$RELEASE_DIR"
        exit 1
    fi
done

# Verificar tamanho mínimo do bundle
BUNDLE_SIZE=$(du -sb "${RELEASE_DIR}/${BUILD_DIR}" | awk '{print $1}')
MIN_BUNDLE_SIZE=100000  # 100KB mínimo

if [[ $BUNDLE_SIZE -lt $MIN_BUNDLE_SIZE ]]; then
    log_error "Bundle muito pequeno (${BUNDLE_SIZE} bytes). Possível build corrompido."
    rm -rf "$RELEASE_DIR"
    exit 1
fi

log_success "Healthcheck local passou (bundle: $(numfmt --to=iec $BUNDLE_SIZE))"

# Fase 7: Ativar release (Deploy Atômico!)
log_step "Fase 7: Ativando release (deploy atômico)"

# Backup do symlink anterior
if [[ -L "$CURRENT_LINK" ]]; then
    PREVIOUS_RELEASE=$(readlink "$CURRENT_LINK")
    log "Release anterior: $PREVIOUS_RELEASE"
fi

# Trocar symlink atomicamente
ln -sfn "${RELEASE_DIR}/${BUILD_DIR}" "$CURRENT_LINK"

log_success "Symlink atualizado: current → releases/${TIMESTAMP}/${BUILD_DIR}"

# Ajustar permissões
chown -R www-data:www-data "$APP_ROOT"

# Fase 8: Validar e recarregar Nginx
log_step "Fase 8: Recarregando Nginx"

if nginx -t >> "$LOG_FILE" 2>&1; then
    systemctl reload nginx
    log_success "Nginx recarregado"
else
    log_error "Configuração Nginx inválida!"
    
    # Rollback
    if [[ -n "${PREVIOUS_RELEASE:-}" ]]; then
        log_warning "Fazendo rollback para release anterior..."
        ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
    fi
    exit 1
fi

# Fase 9: Healthcheck em produção
log_step "Fase 9: Healthcheck em produção"

sleep 2  # Aguardar Nginx recarregar

if /home/saraiva-vision-site/scripts/healthcheck.sh "$HEALTHCHECK_URL" 3 10 >> "$LOG_FILE" 2>&1; then
    log_success "Healthcheck em produção passou"
else
    log_error "Healthcheck em produção falhou!"
    
    # Rollback
    if [[ -n "${PREVIOUS_RELEASE:-}" ]]; then
        log_warning "Fazendo rollback automático..."
        ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
        systemctl reload nginx
        log_warning "Rollback concluído"
    fi
    exit 1
fi

# Fase 10: Smoke tests
log_step "Fase 10: Smoke Tests"

# Test 1: Homepage contém <title>
if curl -sf "$HEALTHCHECK_URL" | grep -q "<title>"; then
    log_success "Homepage renderiza corretamente"
else
    log_warning "Homepage pode estar com problemas (sem <title>)"
fi

# Test 2: Assets críticos existem
CRITICAL_ASSETS=(
    "assets/index-*.js"
)

for pattern in "${CRITICAL_ASSETS[@]}"; do
    if ls "${RELEASE_DIR}/${BUILD_DIR}/${pattern}" >/dev/null 2>&1; then
        log_success "Asset crítico encontrado: $pattern"
    else
        log_warning "Asset não encontrado: $pattern"
    fi
done

log_success "Smoke tests concluídos"

# Fase 11: Marcar release e limpar antigas
log_step "Fase 11: Marcação e limpeza"

# Metadata da release
echo "$COMMIT_HASH" > "${RELEASE_DIR}/.commit"
date +%Y%m%d_%H%M%S > "${RELEASE_DIR}/.timestamp"
echo "$PACKAGE_CHANGED" > "${RELEASE_DIR}/.package-changed"
echo "$NEED_NPM_INSTALL" > "${RELEASE_DIR}/.fresh-install"
touch "${RELEASE_DIR}/.deployed"

# Manter apenas últimas N releases
RELEASE_COUNT=$(ls -1d "${RELEASES_DIR}"/* 2>/dev/null | wc -l)

if [[ $RELEASE_COUNT -gt $KEEP_RELEASES ]]; then
    log "Removendo releases antigas (mantendo últimas $KEEP_RELEASES)..."
    
    ls -1dt "${RELEASES_DIR}"/* | tail -n +$((KEEP_RELEASES + 1)) | while read -r old_release; do
        # Não remover se for a release atual
        if [[ ! -L "$CURRENT_LINK" ]] || [[ "$(readlink "$CURRENT_LINK")" != "${old_release}/${BUILD_DIR}" ]]; then
            log "  Removendo: $(basename "$old_release")"
            rm -rf "$old_release"
        fi
    done
fi

log_success "Limpeza concluída"

# Estatísticas finais
DEPLOY_END=$(date +%s)
DEPLOY_START=$(stat -c %Y "$LOG_FILE" 2>/dev/null || date +%s)
TOTAL_TIME=$((DEPLOY_END - DEPLOY_START))

# Relatório final
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║      ✅ Deploy Concluído com Sucesso!        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
log "Commit: $COMMIT_HASH"
log "Release: $TIMESTAMP"
log "URL: $HEALTHCHECK_URL"
log "Path: $CURRENT_LINK"
log "Tempo total: ${TOTAL_TIME}s"
log "NPM Install: $(if [[ "$NEED_NPM_INSTALL" == "true" ]]; then echo "SIM"; else echo "NÃO (cache)"; fi)"
log "Package.json mudou: $(if [[ "$PACKAGE_CHANGED" == "true" ]]; then echo "SIM"; else echo "NÃO"; fi)"
log "Log completo: $LOG_FILE"
echo ""
log_info "💡 Próximo deploy será ~40% mais rápido se package.json não mudar"
echo ""

exit 0
