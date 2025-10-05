#!/bin/bash

###############################################################################
# Deploy Production - Saraiva Vision
# Descrição: Deploy automatizado com sistema de releases e rollback
# Arquitetura: Vite Build + React SPA + Nginx
# Uso: sudo npm run deploy:production
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
BUILD_CMD="npm run build:vite"
BUILD_DIR="dist"
HEALTHCHECK_URL="https://saraivavision.com.br/"
KEEP_RELEASES=5

# Diretórios
RELEASES_DIR="${APP_ROOT}/releases"
CURRENT_LINK="${APP_ROOT}/current"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"
LOG_FILE="${SOURCE_DIR}/claudelogs/deploy/deploy_${TIMESTAMP}.log"

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
║   Deploy Production - Saraiva Vision     ║
║   Vite + React + Nginx                   ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Iniciando deploy em produção"
log "Source: $SOURCE_DIR"
log "Release: $TIMESTAMP"
log "Log: $LOG_FILE"
echo ""

# ============================================================================
# FASE 1: Verificações Pré-Deploy
# ============================================================================
log_step "Fase 1: Verificações pré-deploy"

# Verificar se está no diretório correto
if [ ! -f "$SOURCE_DIR/package.json" ]; then
    log_error "package.json não encontrado em $SOURCE_DIR"
    exit 1
fi

cd "$SOURCE_DIR"

# Verificar Node.js
NODE_VERSION=$(node --version)
log "Node.js: $NODE_VERSION"

# Verificar Nginx
if ! command -v nginx &> /dev/null; then
    log_error "Nginx não está instalado"
    exit 1
fi

NGINX_VERSION=$(nginx -v 2>&1 | grep -oP '(?<=nginx/)\S+')
log "Nginx: $NGINX_VERSION"

# Verificar configuração Nginx
if ! nginx -t &> /dev/null; then
    log_error "Configuração do Nginx inválida"
    nginx -t
    exit 1
fi

log_success "Verificações pré-deploy concluídas"

# ============================================================================
# FASE 2: Build da Aplicação
# ============================================================================
log_step "Fase 2: Build da aplicação Vite"

# Limpar build anterior
rm -rf "$SOURCE_DIR/$BUILD_DIR"

# Executar build
log "Executando: $BUILD_CMD"
if $BUILD_CMD >> "$LOG_FILE" 2>&1; then
    log_success "Build concluído com sucesso"
else
    log_error "Build falhou. Verifique o log: $LOG_FILE"
    exit 1
fi

# Verificar se o build gerou arquivos
if [ ! -f "$SOURCE_DIR/$BUILD_DIR/index.html" ]; then
    log_error "Build não gerou index.html"
    exit 1
fi

DIST_SIZE=$(du -sh "$SOURCE_DIR/$BUILD_DIR" | cut -f1)
log "Tamanho do build: $DIST_SIZE"

# ============================================================================
# FASE 3: Criar Nova Release
# ============================================================================
log_step "Fase 3: Criando release $TIMESTAMP"

# Criar estrutura de diretórios
mkdir -p "$RELEASES_DIR"
mkdir -p "$RELEASE_DIR"

# Copiar arquivos buildados
log "Copiando arquivos para $RELEASE_DIR..."
cp -r "$SOURCE_DIR/$BUILD_DIR"/* "$RELEASE_DIR/"

# Definir permissões corretas
log "Definindo permissões..."
chown -R root:root "$RELEASE_DIR"
find "$RELEASE_DIR" -type d -exec chmod 755 {} \;
find "$RELEASE_DIR" -type f -exec chmod 644 {} \;

log_success "Release criada: $RELEASE_DIR"

# ============================================================================
# FASE 4: Backup e Symlink
# ============================================================================
log_step "Fase 4: Atualizando symlink"

# Backup do symlink atual (se existir)
if [ -L "$CURRENT_LINK" ]; then
    PREVIOUS_RELEASE=$(readlink -f "$CURRENT_LINK")
    log "Release anterior: $PREVIOUS_RELEASE"
fi

# Atualizar symlink atomicamente
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

ACTIVE_RELEASE=$(readlink -f "$CURRENT_LINK")
log_success "Symlink atualizado: $CURRENT_LINK -> $ACTIVE_RELEASE"

# ============================================================================
# FASE 5: Reload Nginx
# ============================================================================
log_step "Fase 5: Reload do Nginx"

# Testar configuração novamente
if ! nginx -t >> "$LOG_FILE" 2>&1; then
    log_error "Configuração do Nginx inválida após deploy"
    # Rollback
    if [ -n "${PREVIOUS_RELEASE:-}" ]; then
        log_warning "Revertendo para release anterior..."
        ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
    fi
    exit 1
fi

# Reload Nginx
if systemctl reload nginx >> "$LOG_FILE" 2>&1; then
    log_success "Nginx recarregado"
else
    log_error "Falha ao recarregar Nginx"
    exit 1
fi

# ============================================================================
# FASE 6: Health Check
# ============================================================================
log_step "Fase 6: Health check"

sleep 2

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTHCHECK_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    log_success "Health check OK (HTTP $HTTP_CODE)"
else
    log_error "Health check FALHOU (HTTP $HTTP_CODE)"
    
    # Rollback automático
    if [ -n "${PREVIOUS_RELEASE:-}" ]; then
        log_warning "Iniciando rollback automático..."
        ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
        systemctl reload nginx
        
        sleep 2
        ROLLBACK_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTHCHECK_URL" || echo "000")
        
        if [ "$ROLLBACK_HTTP" = "200" ]; then
            log_success "Rollback concluído com sucesso"
        else
            log_error "CRÍTICO: Rollback falhou!"
        fi
    fi
    exit 1
fi

# ============================================================================
# FASE 7: Limpeza de Releases Antigas
# ============================================================================
log_step "Fase 7: Limpeza de releases antigas"

cd "$RELEASES_DIR"
TOTAL_RELEASES=$(ls -1 | wc -l)

if [ "$TOTAL_RELEASES" -gt "$KEEP_RELEASES" ]; then
    log "Total de releases: $TOTAL_RELEASES (mantendo últimas $KEEP_RELEASES)"
    
    ls -t | tail -n +$((KEEP_RELEASES + 1)) | while read -r old_release; do
        log "Removendo release antiga: $old_release"
        rm -rf "$old_release"
    done
    
    log_success "Releases antigas removidas"
else
    log "Total de releases: $TOTAL_RELEASES (nenhuma remoção necessária)"
fi

# ============================================================================
# RESUMO
# ============================================================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Deploy Concluído com Sucesso!     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📦 Release:${NC} $TIMESTAMP"
echo -e "${CYAN}🌐 URL:${NC} $HEALTHCHECK_URL"
echo -e "${CYAN}📊 Status:${NC} HTTP $HTTP_CODE"
echo -e "${CYAN}📝 Log:${NC} $LOG_FILE"
echo ""
echo -e "${YELLOW}🔙 Rollback (se necessário):${NC}"
if [ -n "${PREVIOUS_RELEASE:-}" ]; then
    PREVIOUS_TIMESTAMP=$(basename "$PREVIOUS_RELEASE")
    echo -e "   sudo ln -sfn $PREVIOUS_RELEASE $CURRENT_LINK && sudo systemctl reload nginx"
    echo -e "${CYAN}   Release anterior:${NC} $PREVIOUS_TIMESTAMP"
else
    echo -e "   Nenhuma release anterior disponível"
fi
echo ""

exit 0
