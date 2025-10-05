#!/bin/bash

###############################################################################
# Deploy Next.js - Saraiva Vision
# Descrição: Deploy Next.js build (fallback system)
# Arquitetura: Next.js 15 + React 18
# Uso: sudo npm run deploy:next
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
APP_ROOT="/var/www/saraivavision-next"
BUILD_CMD="npm run build:next"
BUILD_DIR=".next"
HEALTHCHECK_URL="https://saraivavision.com.br/"
KEEP_RELEASES=3

# Diretórios
RELEASES_DIR="${APP_ROOT}/releases"
CURRENT_LINK="${APP_ROOT}/current"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"
LOG_FILE="${SOURCE_DIR}/claudelogs/deploy/deploy_next_${TIMESTAMP}.log"

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
║   Deploy Next.js - Saraiva Vision        ║
║   Next.js 15 + React 18                  ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Iniciando deploy Next.js"
log "Source: $SOURCE_DIR"
log "Release: $TIMESTAMP"
log "Log: $LOG_FILE"
echo ""

# ============================================================================
# FASE 1: Verificações Pré-Deploy
# ============================================================================
log_step "Fase 1: Verificações pré-deploy"

if [ ! -f "$SOURCE_DIR/package.json" ]; then
    log_error "package.json não encontrado em $SOURCE_DIR"
    exit 1
fi

cd "$SOURCE_DIR"

NODE_VERSION=$(node --version)
log "Node.js: $NODE_VERSION"

log_success "Verificações pré-deploy concluídas"

# ============================================================================
# FASE 2: Build da Aplicação
# ============================================================================
log_step "Fase 2: Build Next.js"

# Limpar build anterior
rm -rf "$SOURCE_DIR/$BUILD_DIR"

# Executar build
log "Executando: $BUILD_CMD"
if $BUILD_CMD >> "$LOG_FILE" 2>&1; then
    log_success "Build Next.js concluído com sucesso"
else
    log_error "Build falhou. Verifique o log: $LOG_FILE"
    exit 1
fi

# Verificar se o build gerou arquivos
if [ ! -d "$SOURCE_DIR/$BUILD_DIR" ]; then
    log_error "Build não gerou diretório .next"
    exit 1
fi

BUILD_SIZE=$(du -sh "$SOURCE_DIR/$BUILD_DIR" | cut -f1)
log "Tamanho do build: $BUILD_SIZE"

# ============================================================================
# FASE 3: Criar Nova Release
# ============================================================================
log_step "Fase 3: Criando release $TIMESTAMP"

mkdir -p "$RELEASES_DIR"
mkdir -p "$RELEASE_DIR"

# Copiar arquivos necessários para Next.js
log "Copiando arquivos Next.js para $RELEASE_DIR..."
cp -r "$SOURCE_DIR/$BUILD_DIR" "$RELEASE_DIR/"
cp -r "$SOURCE_DIR/public" "$RELEASE_DIR/"
cp "$SOURCE_DIR/package.json" "$RELEASE_DIR/"
cp "$SOURCE_DIR/package-lock.json" "$RELEASE_DIR/"

# Instalar apenas dependências de produção
cd "$RELEASE_DIR"
npm ci --production >> "$LOG_FILE" 2>&1

# Definir permissões
log "Definindo permissões..."
chown -R root:root "$RELEASE_DIR"
find "$RELEASE_DIR" -type d -exec chmod 755 {} \;
find "$RELEASE_DIR" -type f -exec chmod 644 {} \;

log_success "Release criada: $RELEASE_DIR"

# ============================================================================
# FASE 4: PM2 Process Manager
# ============================================================================
log_step "Fase 4: Configurando PM2"

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 não instalado. Instalando globalmente..."
    npm install -g pm2 >> "$LOG_FILE" 2>&1
fi

# Parar processo anterior (se existir)
pm2 delete saraiva-next 2>/dev/null || true

# Criar ecosystem file
cat > "$RELEASE_DIR/ecosystem.config.js" << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'saraiva-next',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3002',
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
}
ECOSYSTEM

# Iniciar aplicação
cd "$RELEASE_DIR"
pm2 start ecosystem.config.js >> "$LOG_FILE" 2>&1
pm2 save >> "$LOG_FILE" 2>&1

log_success "Next.js iniciado na porta 3002"

# ============================================================================
# FASE 5: Atualizar Symlink
# ============================================================================
log_step "Fase 5: Atualizando symlink"

if [ -L "$CURRENT_LINK" ]; then
    PREVIOUS_RELEASE=$(readlink -f "$CURRENT_LINK")
    log "Release anterior: $PREVIOUS_RELEASE"
fi

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
log_success "Symlink atualizado: $CURRENT_LINK -> $RELEASE_DIR"

# ============================================================================
# FASE 6: Health Check
# ============================================================================
log_step "Fase 6: Health check"

sleep 5

# Verificar se Next.js está respondendo
NEXT_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002" || echo "000")

if [ "$NEXT_HEALTH" = "200" ]; then
    log_success "Next.js respondendo (HTTP $NEXT_HEALTH)"
else
    log_error "Next.js não está respondendo (HTTP $NEXT_HEALTH)"
    
    # Rollback
    if [ -n "${PREVIOUS_RELEASE:-}" ]; then
        log_warning "Revertendo para release anterior..."
        pm2 delete saraiva-next
        cd "$PREVIOUS_RELEASE"
        pm2 start ecosystem.config.js
        ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
    fi
    exit 1
fi

# ============================================================================
# FASE 7: Limpeza
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
fi

# ============================================================================
# RESUMO
# ============================================================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deploy Next.js Concluído com Sucesso!  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📦 Release:${NC} $TIMESTAMP"
echo -e "${CYAN}🔗 Local:${NC} http://localhost:3002"
echo -e "${CYAN}📊 Status:${NC} HTTP $NEXT_HEALTH"
echo -e "${CYAN}📝 Log:${NC} $LOG_FILE"
echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO:${NC}"
echo -e "   Next.js está rodando na porta 3002"
echo -e "   Para ativar em produção, use: sudo npm run deploy:switch next"
echo ""

exit 0
