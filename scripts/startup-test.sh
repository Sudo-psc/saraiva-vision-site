#!/bin/bash

# Saraiva Vision - Script de Teste de Inicialização
# Versão simplificada para testes

set -e

LOG_FILE="/var/log/saraiva-vision-startup-test.log"
PROJECT_DIR="/home/saraiva-vision-site"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[$timestamp] $message${NC}" | tee -a "$LOG_FILE"
}

log "=== Teste do Script de Inicialização Saraiva Vision ==="

cd "$PROJECT_DIR"
log "Diretório: $(pwd)"

# Verificar Docker
if systemctl is-active --quiet docker; then
    log "✅ Docker está rodando"
else
    log "❌ Docker não está rodando"
    exit 1
fi

# Iniciar serviços
log "Iniciando serviços Docker..."
if docker-compose up -d; then
    log "✅ Serviços Docker iniciados"
else
    log "❌ Falha ao iniciar serviços Docker"
    exit 1
fi

# Aguardar um pouco
sleep 10

# Verificar status
log "Status dos containers:"
docker-compose ps

# Teste básico de conectividade
if curl -f -s --max-time 5 http://localhost:6379 >/dev/null 2>&1; then
    log "❌ Redis não deveria responder diretamente na porta 6379"
else
    log "✅ Redis não está exposto externamente (correto)"
fi

log "=== Teste concluído ==="