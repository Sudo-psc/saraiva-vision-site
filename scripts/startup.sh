#!/bin/bash

# Saraiva Vision - Script de Inicialização Automática
# Este script inicia automaticamente todos os serviços após reinicialização do servidor

set -e

# Configurações
LOG_FILE="/var/log/saraiva-vision-startup.log"
PROJECT_DIR="/home/saraiva-vision-site"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
MAX_WAIT_TIME=300  # 5 minutos máximo para aguardar serviços ficarem saudáveis

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de logging
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case "$level" in
        "INFO")
            echo -e "${BLUE}[$timestamp] ℹ️  $message${NC}" | tee -a "$LOG_FILE"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[$timestamp] ✅ $message${NC}" | tee -a "$LOG_FILE"
            ;;
        "WARNING")
            echo -e "${YELLOW}[$timestamp] ⚠️  $message${NC}" | tee -a "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[$timestamp] ❌ $message${NC}" | tee -a "$LOG_FILE"
            ;;
        *)
            echo -e "[$timestamp] $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para aguardar serviço ficar saudável
wait_for_service() {
    local service_name="$1"
    local health_url="$2"
    local max_attempts="$3"
    local attempt=1

    log "INFO" "Aguardando $service_name ficar saudável (máx. ${max_attempts}s)..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s --max-time 10 "$health_url" > /dev/null 2>&1; then
            log "SUCCESS" "$service_name está saudável após ${attempt}s"
            return 0
        fi

        log "INFO" "Tentativa $attempt/$max_attempts: $service_name ainda não está saudável"
        sleep 5
        ((attempt++))
    done

    log "ERROR" "$service_name não ficou saudável após ${max_attempts}s"
    return 1
}

# Função principal
main() {
    log "INFO" "=== Iniciando Saraiva Vision - Startup Script ==="

    # Verificar se estamos no diretório correto
    if [ ! -d "$PROJECT_DIR" ]; then
        log "ERROR" "Diretório do projeto não encontrado: $PROJECT_DIR"
        exit 1
    fi

    cd "$PROJECT_DIR"
    log "INFO" "Diretório do projeto: $(pwd)"

    # Verificar se Docker está instalado e rodando
    if ! command_exists docker; then
        log "ERROR" "Docker não está instalado"
        exit 1
    fi

    if ! systemctl is-active --quiet docker; then
        log "WARNING" "Docker não está rodando. Tentando iniciar..."
        if ! sudo systemctl start docker; then
            log "ERROR" "Falha ao iniciar Docker"
            exit 1
        fi
        sleep 5
    fi

    log "SUCCESS" "Docker está rodando"

    # Verificar se docker-compose está disponível
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        log "ERROR" "docker-compose não está disponível"
        exit 1
    fi

    # Verificar se arquivo docker-compose.yml existe
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log "ERROR" "Arquivo docker-compose.yml não encontrado: $DOCKER_COMPOSE_FILE"
        exit 1
    fi

    # Parar serviços existentes (caso estejam rodando)
    log "INFO" "Parando serviços existentes..."
    if docker-compose ps | grep -q "Up"; then
        docker-compose down || log "WARNING" "Falha ao parar serviços existentes"
    fi

    # Iniciar serviços
    log "INFO" "Iniciando serviços Docker..."
    if ! docker-compose up -d; then
        log "ERROR" "Falha ao iniciar serviços Docker"
        exit 1
    fi

    log "SUCCESS" "Serviços Docker iniciados"

    # Aguardar inicialização dos serviços
    log "INFO" "Aguardando inicialização dos serviços..."

    # Aguardar Redis
    if ! wait_for_service "Redis" "http://localhost:6379" 60; then
        log "WARNING" "Redis pode não estar totalmente saudável, mas continuando..."
    fi

    # Aguardar MySQL
    if ! wait_for_service "MySQL" "http://localhost:3307" 60; then
        log "WARNING" "MySQL pode não estar totalmente saudável, mas continuando..."
    fi

    # Aguardar API
    if ! wait_for_service "API Backend" "http://localhost:3003/api/health" 120; then
        log "ERROR" "API Backend falhou no health check"
        exit 1
    fi

    # Aguardar Frontend
    if ! wait_for_service "Frontend" "http://localhost:3000/health" 60; then
        log "WARNING" "Frontend pode não estar totalmente saudável, mas continuando..."
    fi

    # Aguardar WordPress
    if ! wait_for_service "WordPress" "http://localhost:8080/wp-json/wp/v2/" 120; then
        log "WARNING" "WordPress pode não estar totalmente saudável, mas continuando..."
    fi

    # Aguardar Nginx
    if ! wait_for_service "Nginx" "http://localhost/health" 60; then
        log "ERROR" "Nginx falhou no health check"
        exit 1
    fi

    # Verificação final - testar endpoints principais
    log "INFO" "Executando verificações finais..."

    # Verificar se o site está respondendo
    if curl -f -s --max-time 30 "http://localhost" > /dev/null 2>&1; then
        log "SUCCESS" "Site principal está respondendo"
    else
        log "ERROR" "Site principal não está respondendo"
        exit 1
    fi

    # Verificar API
    if curl -f -s --max-time 30 "http://localhost/api/health" > /dev/null 2>&1; then
        log "SUCCESS" "API está respondendo"
    else
        log "WARNING" "API não está respondendo corretamente"
    fi

    # Status final dos containers
    log "INFO" "Status dos containers Docker:"
    docker-compose ps | tee -a "$LOG_FILE"

    log "SUCCESS" "=== Saraiva Vision iniciado com sucesso! ==="
    log "INFO" "Site disponível em: http://localhost"
    log "INFO" "API disponível em: http://localhost/api"
    log "INFO" "WordPress disponível em: http://localhost:8080"

    # Enviar notificação (opcional - pode ser configurado com email ou webhook)
    # Aqui você pode adicionar código para enviar notificações

    exit 0
}

# Capturar sinais para cleanup
trap 'log "ERROR" "Script interrompido pelo usuário"; exit 1' INT TERM

# Executar função principal
main "$@"