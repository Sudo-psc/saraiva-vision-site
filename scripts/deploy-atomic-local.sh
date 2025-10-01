#!/bin/bash

###############################################################################
# Deploy Atômico Script (Local Source)
# Descrição: Deploy com zero-downtime usando código local
# Uso: sudo ./scripts/deploy-atomic-local.sh
###############################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configurações do projeto
DOMAIN="saraivavision.com.br"
SOURCE_DIR="/home/saraiva-vision-site"
APP_ROOT="/var/www/saraivavision"
BUILD_CMD="npm run build"
BUILD_DIR="dist"
HEALTHCHECK_URL="https://saraivavision.com.br/"
KEEP_RELEASES=5

# Diretórios
RELEASES_DIR="${APP_ROOT}/releases"
SHARED_DIR="${APP_ROOT}/shared"
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

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script deve ser executado como root (sudo)"
   exit 1
fi

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════╗
║     Deploy Atômico - Saraiva Vision      ║
╚══════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Iniciando deploy atômico (source local)"
log "Source: $SOURCE_DIR"
log "Release: $TIMESTAMP"
log "Log: $LOG_FILE"
echo ""

# Fase 1: Criar estrutura de diretórios
log_step "Fase 1: Preparando estrutura de diretórios"

mkdir -p "$RELEASES_DIR"
mkdir -p "$SHARED_DIR"

log_success "Estrutura criada"

# Fase 2: Copiar código fonte
log_step "Fase 2: Copiando código fonte"

mkdir -p "$RELEASE_DIR"

# Copiar arquivos, excluindo node_modules, dist, .git
rsync -a \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='claudelogs' \
    --exclude='venv' \
    "$SOURCE_DIR/" "$RELEASE_DIR/"

COMMIT_HASH=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
log_success "Código copiado (commit: $COMMIT_HASH)"

# Fase 3: Build da aplicação
log_step "Fase 3: Building aplicação"

cd "$RELEASE_DIR"

# Verificar se existe package.json
if [[ ! -f "package.json" ]]; then
    log_error "package.json não encontrado em $RELEASE_DIR"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

# Instalar dependências
log "Instalando dependências..."
if npm install --production=false >> "$LOG_FILE" 2>&1; then
    log_success "Dependências instaladas"
else
    log_error "Falha ao instalar dependências! Verifique o log: $LOG_FILE"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

# Executar build
log "Executando: $BUILD_CMD"
if eval "$BUILD_CMD" >> "$LOG_FILE" 2>&1; then
    log_success "Build concluído"
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

# Fase 4: Criar symlinks para shared folders (se necessário)
log_step "Fase 4: Configurando shared folders"

# Exemplo: se houver uploads ou storage compartilhado
# ln -sf "${SHARED_DIR}/storage" "${RELEASE_DIR}/dist/storage"

log_success "Shared folders configurados"

# Fase 5: Healthcheck local
log_step "Fase 5: Healthcheck local"

log "Verificando arquivos essenciais..."
if [[ ! -f "${RELEASE_DIR}/${BUILD_DIR}/index.html" ]]; then
    log_error "index.html não encontrado em ${RELEASE_DIR}/${BUILD_DIR}/"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

log_success "Healthcheck local passou"

# Fase 6: Trocar symlink current (deploy atômico!)
log_step "Fase 6: Ativando release (deploy atômico)"

# Backup do symlink anterior
if [[ -L "$CURRENT_LINK" ]]; then
    PREVIOUS_RELEASE=$(readlink "$CURRENT_LINK")
    log "Release anterior: $PREVIOUS_RELEASE"
fi

# Trocar symlink atomicamente
ln -sfn "${RELEASE_DIR}/${BUILD_DIR}" "$CURRENT_LINK"

log_success "Symlink atualizado: current -> releases/${TIMESTAMP}/${BUILD_DIR}"

# Ajustar permissões
chown -R www-data:www-data "$APP_ROOT"

# Fase 7: Validar e recarregar Nginx
log_step "Fase 7: Recarregando Nginx"

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

# Fase 8: Healthcheck em produção
log_step "Fase 8: Healthcheck em produção"

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

# Fase 9: Marcar release como OK e limpar antigas
log_step "Fase 9: Limpeza"

touch "${RELEASE_DIR}/.deployed"
echo "$COMMIT_HASH" > "${RELEASE_DIR}/.commit"
date +%Y%m%d_%H%M%S > "${RELEASE_DIR}/.timestamp"

# Manter apenas últimas N releases
RELEASE_COUNT=$(ls -1d "${RELEASES_DIR}"/* 2>/dev/null | wc -l)
if [[ $RELEASE_COUNT -gt $KEEP_RELEASES ]]; then
    log "Removendo releases antigas (mantendo últimas $KEEP_RELEASES)..."
    ls -1dt "${RELEASES_DIR}"/* | tail -n +$((KEEP_RELEASES + 1)) | while read -r old_release; do
        if [[ ! -L "$CURRENT_LINK" ]] || [[ "$(readlink "$CURRENT_LINK")" != "${old_release}/${BUILD_DIR}" ]]; then
            log "  Removendo: $(basename "$old_release")"
            rm -rf "$old_release"
        fi
    done
fi

log_success "Limpeza concluída"

# Relatório final
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ Deploy Concluído com Sucesso!     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
log "Commit: $COMMIT_HASH"
log "Release: $TIMESTAMP"
log "URL: $HEALTHCHECK_URL"
log "Path: $CURRENT_LINK"
log "Log completo: $LOG_FILE"
echo ""

exit 0
