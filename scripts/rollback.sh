#!/bin/bash

###############################################################################
# Rollback Script
# Descrição: Reverte para uma release anterior
# Uso: sudo ./scripts/rollback.sh [release_timestamp]
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
APP_ROOT="/var/www/saraivavision"
RELEASES_DIR="${APP_ROOT}/releases"
CURRENT_LINK="${APP_ROOT}/current"
BUILD_DIR="dist"
HEALTHCHECK_URL="https://saraivavision.com.br/"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/home/saraiva-vision-site/claudelogs/deploy/rollback_${TIMESTAMP}.log"

# Criar diretório de log
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

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script deve ser executado como root (sudo)"
   exit 1
fi

# Banner
echo -e "${YELLOW}"
cat << "EOF"
╔══════════════════════════════════════════╗
║         Rollback - Saraiva Vision        ║
╚══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar se estrutura existe
if [[ ! -d "$RELEASES_DIR" ]]; then
    log_error "Diretório de releases não encontrado: $RELEASES_DIR"
    log_error "O deploy atômico ainda não foi configurado."
    exit 1
fi

# Obter release atual
if [[ -L "$CURRENT_LINK" ]]; then
    CURRENT_RELEASE_PATH=$(readlink "$CURRENT_LINK")
    CURRENT_RELEASE=$(basename "$(dirname "$CURRENT_RELEASE_PATH")")
    log "Release atual: $CURRENT_RELEASE"
else
    log_error "Symlink 'current' não encontrado"
    exit 1
fi

# Listar releases disponíveis
echo ""
log "Releases disponíveis:"
echo ""

RELEASES=($(ls -1dt "${RELEASES_DIR}"/* 2>/dev/null))

if [[ ${#RELEASES[@]} -eq 0 ]]; then
    log_error "Nenhuma release encontrada"
    exit 1
fi

if [[ ${#RELEASES[@]} -eq 1 ]]; then
    log_warning "Apenas uma release disponível, não há para onde fazer rollback"
    exit 1
fi

# Exibir releases com informações
for i in "${!RELEASES[@]}"; do
    release="${RELEASES[$i]}"
    release_name=$(basename "$release")
    
    # Verificar se é a atual
    if [[ "$release_name" == "$CURRENT_RELEASE" ]]; then
        echo -e "  ${GREEN}[$i]${NC} $release_name ${GREEN}(ATUAL)${NC}"
    else
        echo "  [$i] $release_name"
        
        # Mostrar commit se existir
        if [[ -f "${release}/.commit" ]]; then
            commit=$(cat "${release}/.commit")
            echo "       └─ commit: $commit"
        fi
    fi
done

echo ""

# Se um release foi especificado como argumento
if [[ -n "${1:-}" ]]; then
    TARGET_RELEASE="$1"
    
    # Verificar se existe
    if [[ ! -d "${RELEASES_DIR}/${TARGET_RELEASE}" ]]; then
        log_error "Release não encontrada: $TARGET_RELEASE"
        exit 1
    fi
else
    # Selecionar automaticamente a release anterior
    PREVIOUS_INDEX=1
    
    # Encontrar próxima release que não seja a atual
    for i in "${!RELEASES[@]}"; do
        release_name=$(basename "${RELEASES[$i]}")
        if [[ "$release_name" != "$CURRENT_RELEASE" ]]; then
            TARGET_RELEASE="$release_name"
            break
        fi
    done
    
    if [[ -z "${TARGET_RELEASE:-}" ]]; then
        log_error "Não foi possível encontrar release anterior"
        exit 1
    fi
    
    log "Release selecionada automaticamente: $TARGET_RELEASE"
fi

# Confirmação
echo ""
echo -e "${YELLOW}Você está prestes a fazer rollback de:${NC}"
echo -e "  ${RED}$CURRENT_RELEASE${NC} (atual)"
echo -e "  ↓"
echo -e "  ${GREEN}$TARGET_RELEASE${NC} (anterior)"
echo ""

read -p "Continuar com o rollback? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    log_warning "Rollback cancelado pelo usuário"
    exit 0
fi

# Executar rollback
log "Iniciando rollback..."

TARGET_PATH="${RELEASES_DIR}/${TARGET_RELEASE}/${BUILD_DIR}"

# Verificar se diretório existe
if [[ ! -d "$TARGET_PATH" ]]; then
    log_error "Diretório de build não encontrado: $TARGET_PATH"
    exit 1
fi

# Trocar symlink
log "Trocando symlink..."
ln -sfn "$TARGET_PATH" "$CURRENT_LINK"
log_success "Symlink atualizado"

# Ajustar permissões
chown -R www-data:www-data "$CURRENT_LINK"

# Validar Nginx
log "Validando configuração Nginx..."
if nginx -t >> "$LOG_FILE" 2>&1; then
    log_success "Configuração Nginx válida"
else
    log_error "Configuração Nginx inválida!"
    
    # Reverter rollback
    log_warning "Revertendo rollback..."
    ln -sfn "${RELEASES_DIR}/${CURRENT_RELEASE}/${BUILD_DIR}" "$CURRENT_LINK"
    exit 1
fi

# Recarregar Nginx
log "Recarregando Nginx..."
systemctl reload nginx
log_success "Nginx recarregado"

# Healthcheck
sleep 2
log "Executando healthcheck..."

if /home/saraiva-vision-site/scripts/healthcheck.sh "$HEALTHCHECK_URL" 3 10 >> "$LOG_FILE" 2>&1; then
    log_success "Healthcheck passou"
else
    log_error "Healthcheck falhou!"
    
    # Reverter rollback
    log_warning "Revertendo rollback devido a falha no healthcheck..."
    ln -sfn "${RELEASES_DIR}/${CURRENT_RELEASE}/${BUILD_DIR}" "$CURRENT_LINK"
    systemctl reload nginx
    
    log_error "Rollback falhou. Release atual mantida: $CURRENT_RELEASE"
    exit 1
fi

# Sucesso
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ Rollback Concluído com Sucesso!   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
log "Release anterior: $CURRENT_RELEASE"
log "Release atual: $TARGET_RELEASE"
log "Log completo: $LOG_FILE"
echo ""

exit 0
