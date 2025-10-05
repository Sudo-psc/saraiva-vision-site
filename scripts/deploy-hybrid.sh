#!/bin/bash

###############################################################################
# Deploy Híbrido - Saraiva Vision
# Descrição: Deploy Vite Build + Next.js API Routes com zero-downtime
# Uso: sudo ./scripts/deploy-hybrid.sh
###############################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configurações
DOMAIN="saraivavision.com.br"
SOURCE_DIR="/home/saraiva-vision-site"
APP_ROOT="/var/www/saraivavision"
VITE_BUILD_CMD="npm run build:vite"
VITE_BUILD_DIR="dist"
NEXTJS_PORT="3002"
NEXTJS_PM2_NAME="saraiva-nextjs"
HEALTHCHECK_URL="https://saraivavision.com.br/"
KEEP_RELEASES=5

# Diretórios
RELEASES_DIR="${APP_ROOT}/releases"
SHARED_DIR="${APP_ROOT}/shared"
CURRENT_LINK="${APP_ROOT}/current"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"
LOG_FILE="/home/saraiva-vision-site/claudelogs/deploy/deploy_hybrid_${TIMESTAMP}.log"

# Criar diretórios de log
mkdir -p "$(dirname "$LOG_FILE")"

# Funções de log
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

# Verificar root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script deve ser executado como root (sudo)"
   exit 1
fi

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║   Deploy Híbrido - Saraiva Vision        ║
║   Vite Build + Next.js API Routes        ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Iniciando deploy híbrido"
log "Source: $SOURCE_DIR"
log "Release: $TIMESTAMP"
log "Log: $LOG_FILE"
echo ""

# ============================================================================
# FASE 1: Preparar estrutura
# ============================================================================
log_step "Fase 1: Preparando estrutura de diretórios"

mkdir -p "$RELEASES_DIR"
mkdir -p "$SHARED_DIR"
mkdir -p "${SHARED_DIR}/.next-cache"

log_success "Estrutura criada"

# ============================================================================
# FASE 2: Copiar código fonte
# ============================================================================
log_step "Fase 2: Copiando código fonte"

mkdir -p "$RELEASE_DIR"

rsync -a \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='claudelogs' \
    --exclude='venv' \
    --exclude='test-results' \
    "$SOURCE_DIR/" "$RELEASE_DIR/"

COMMIT_HASH=$(cd "$SOURCE_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
log_success "Código copiado (commit: $COMMIT_HASH)"

# ============================================================================
# FASE 3: Build Vite (Static Site)
# ============================================================================
log_step "Fase 3: Building Vite (Static Site)"

cd "$RELEASE_DIR"

if [[ ! -f "package.json" ]]; then
    log_error "package.json não encontrado"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

# Instalar dependências
log "Instalando dependências..."
if npm install --production=false --legacy-peer-deps >> "$LOG_FILE" 2>&1; then
    log_success "Dependências instaladas"
else
    log_error "Falha ao instalar dependências! Log: $LOG_FILE"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

# Build Vite
log "Executando: $VITE_BUILD_CMD"
if eval "$VITE_BUILD_CMD" >> "$LOG_FILE" 2>&1; then
    log_success "Build Vite concluído"
else
    log_error "Build Vite falhou! Log: $LOG_FILE"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

# Verificar build
if [[ ! -d "${RELEASE_DIR}/${VITE_BUILD_DIR}" ]]; then
    log_error "Diretório de build não encontrado: ${RELEASE_DIR}/${VITE_BUILD_DIR}"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

if [[ ! -f "${RELEASE_DIR}/${VITE_BUILD_DIR}/index.html" ]]; then
    log_error "index.html não encontrado"
    rm -rf "$RELEASE_DIR"
    exit 1
fi

log_success "Build Vite validado"

# ============================================================================
# FASE 4: Build Next.js (API Routes)
# ============================================================================
log_step "Fase 4: Building Next.js (API Routes)"

# Copiar .env.local se existir
if [[ -f "$SOURCE_DIR/.env.local" ]]; then
    cp "$SOURCE_DIR/.env.local" "$RELEASE_DIR/.env.local"
    log_success ".env.local copiado"
fi

# Link para cache compartilhado
ln -sf "${SHARED_DIR}/.next-cache" "${RELEASE_DIR}/.next"

# Build Next.js
log "Executando: npm run build (Next.js)"
if npm run build >> "$LOG_FILE" 2>&1; then
    log_success "Build Next.js concluído"
else
    log_warning "Build Next.js falhou ou não configurado (isso é OK se só usar Vite)"
fi

# ============================================================================
# FASE 5: Trocar symlink (Deploy Atômico - Vite)
# ============================================================================
log_step "Fase 5: Ativando release (Vite Static)"

# Backup do symlink anterior
if [[ -L "$CURRENT_LINK" ]]; then
    PREVIOUS_RELEASE=$(readlink "$CURRENT_LINK")
    log "Release anterior: $PREVIOUS_RELEASE"
fi

# Trocar symlink atomicamente
ln -sfn "${RELEASE_DIR}/${VITE_BUILD_DIR}" "$CURRENT_LINK"
log_success "Symlink atualizado: current -> releases/${TIMESTAMP}/${VITE_BUILD_DIR}"

# Ajustar permissões
chown -R www-data:www-data "$APP_ROOT"

# ============================================================================
# FASE 6: Deploy Next.js com PM2
# ============================================================================
log_step "Fase 6: Deploying Next.js API Routes"

cd "$RELEASE_DIR"

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 não instalado, instalando..."
    npm install -g pm2
fi

# Parar instância anterior se existir
if pm2 describe "$NEXTJS_PM2_NAME" &>/dev/null; then
    log "Parando Next.js anterior..."
    pm2 stop "$NEXTJS_PM2_NAME" >> "$LOG_FILE" 2>&1 || true
    pm2 delete "$NEXTJS_PM2_NAME" >> "$LOG_FILE" 2>&1 || true
fi

# Iniciar Next.js
log "Iniciando Next.js na porta $NEXTJS_PORT..."
PORT=$NEXTJS_PORT pm2 start npm --name "$NEXTJS_PM2_NAME" -- start >> "$LOG_FILE" 2>&1

# Aguardar inicialização
sleep 3

# Verificar se está rodando
if pm2 describe "$NEXTJS_PM2_NAME" | grep -q "online"; then
    log_success "Next.js iniciado (porta $NEXTJS_PORT)"
else
    log_error "Falha ao iniciar Next.js!"
    
    # Rollback
    if [[ -n "${PREVIOUS_RELEASE:-}" ]]; then
        log_warning "Fazendo rollback..."
        ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
    fi
    exit 1
fi

# Salvar configuração PM2
pm2 save >> "$LOG_FILE" 2>&1

# ============================================================================
# FASE 7: Recarregar Nginx
# ============================================================================
log_step "Fase 7: Recarregando Nginx"

if nginx -t >> "$LOG_FILE" 2>&1; then
    systemctl reload nginx
    log_success "Nginx recarregado"
else
    log_error "Configuração Nginx inválida!"
    
    # Rollback
    if [[ -n "${PREVIOUS_RELEASE:-}" ]]; then
        log_warning "Fazendo rollback..."
        ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
        systemctl reload nginx
    fi
    exit 1
fi

# ============================================================================
# FASE 8: Healthcheck
# ============================================================================
log_step "Fase 8: Healthcheck em produção"

sleep 2

# Healthcheck site estático
if curl -f -s -o /dev/null "$HEALTHCHECK_URL"; then
    log_success "Healthcheck site estático: OK"
else
    log_error "Healthcheck site estático: FALHOU"
    
    # Rollback
    if [[ -n "${PREVIOUS_RELEASE:-}" ]]; then
        log_warning "Fazendo rollback automático..."
        ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
        systemctl reload nginx
        log_warning "Rollback concluído"
    fi
    exit 1
fi

# Healthcheck Next.js API
if curl -f -s -o /dev/null "http://localhost:${NEXTJS_PORT}/api/ninsaude/auth" 2>/dev/null; then
    log_success "Healthcheck Next.js API: OK"
else
    log_warning "Healthcheck Next.js API: Não respondeu (verifique manualmente)"
fi

# ============================================================================
# FASE 9: Limpeza
# ============================================================================
log_step "Fase 9: Limpeza"

touch "${RELEASE_DIR}/.deployed"
echo "$COMMIT_HASH" > "${RELEASE_DIR}/.commit"
date +%Y%m%d_%H%M%S > "${RELEASE_DIR}/.timestamp"

# Manter apenas últimas N releases
RELEASE_COUNT=$(ls -1d "${RELEASES_DIR}"/* 2>/dev/null | wc -l)
if [[ $RELEASE_COUNT -gt $KEEP_RELEASES ]]; then
    log "Removendo releases antigas (mantendo últimas $KEEP_RELEASES)..."
    ls -1dt "${RELEASES_DIR}"/* | tail -n +$((KEEP_RELEASES + 1)) | while read -r old_release; do
        if [[ ! -L "$CURRENT_LINK" ]] || [[ "$(readlink "$CURRENT_LINK")" != "${old_release}/${VITE_BUILD_DIR}" ]]; then
            log "  Removendo: $(basename "$old_release")"
            rm -rf "$old_release"
        fi
    done
fi

log_success "Limpeza concluída"

# ============================================================================
# Relatório final
# ============================================================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ Deploy Híbrido Concluído!         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
log "Commit: $COMMIT_HASH"
log "Release: $TIMESTAMP"
log "Site: $HEALTHCHECK_URL"
log "Next.js: http://localhost:$NEXTJS_PORT"
log "Path: $CURRENT_LINK"
log "PM2 Status: pm2 status"
log "PM2 Logs: pm2 logs $NEXTJS_PM2_NAME"
log "Log completo: $LOG_FILE"
echo ""

exit 0
