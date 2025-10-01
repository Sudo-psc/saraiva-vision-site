#!/bin/bash

###############################################################################
# Nginx Sanitize Script
# Descrição: Saneamento e consolidação das configurações Nginx
# Uso: sudo ./scripts/nginx_sanitize.sh
###############################################################################

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
NGINX_CONF_D="/etc/nginx/conf.d"
NGINX_SNIPPETS="/etc/nginx/snippets"
NGINX_BACKUPS="/etc/nginx/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/home/saraiva-vision-site/claudelogs/nginx_sanitize_${TIMESTAMP}.log"

# Criar diretórios se não existirem
mkdir -p "$NGINX_BACKUPS"
mkdir -p "$NGINX_SNIPPETS"
mkdir -p "$(dirname "$LOG_FILE")"

# Função de log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
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

log "=========================================="
log "Nginx Sanitize - Iniciando"
log "Timestamp: $TIMESTAMP"
log "=========================================="

# Fase 1: Backup de arquivos existentes
log "\n📦 Fase 1: Criando backups de segurança..."

backup_file() {
    local file=$1
    local basename=$(basename "$file")
    local backup_path="${NGINX_BACKUPS}/${basename}.${TIMESTAMP}.bak"
    
    if [[ -f "$file" ]]; then
        cp "$file" "$backup_path"
        log_success "Backup criado: $backup_path"
    fi
}

backup_file "${NGINX_SITES_AVAILABLE}/saraivavision"
backup_file "${NGINX_SITES_AVAILABLE}/default"
backup_file "${NGINX_SITES_ENABLED}/saraivavision"
backup_file "${NGINX_CONF_D}/cors.conf"

# Fase 2: Detecção de conflitos
log "\n🔍 Fase 2: Detectando conflitos..."

# Contar default_server
DEFAULT_SERVER_COUNT=$(grep -r "default_server" "$NGINX_SITES_ENABLED" 2>/dev/null | grep -v "#" | wc -l)

if [[ $DEFAULT_SERVER_COUNT -gt 2 ]]; then
    log_warning "Detectados $DEFAULT_SERVER_COUNT diretivas default_server"
    log_warning "Esperado: 2 (uma para porta 80, uma para 443)"
fi

# Verificar se saraivavision em sites-enabled é symlink
if [[ -f "${NGINX_SITES_ENABLED}/saraivavision" && ! -L "${NGINX_SITES_ENABLED}/saraivavision" ]]; then
    log_warning "${NGINX_SITES_ENABLED}/saraivavision é um arquivo regular (deveria ser symlink)"
    NEEDS_SYMLINK_FIX=true
else
    NEEDS_SYMLINK_FIX=false
fi

# Fase 3: Remoção de arquivos não utilizados
log "\n🗑️  Fase 3: Removendo arquivos não utilizados..."

# Remover default se não estiver habilitado
if [[ -f "${NGINX_SITES_AVAILABLE}/default" && ! -L "${NGINX_SITES_ENABLED}/default" ]]; then
    log "Removendo ${NGINX_SITES_AVAILABLE}/default (não utilizado)"
    rm "${NGINX_SITES_AVAILABLE}/default"
    log_success "Arquivo default removido"
fi

# Remover backups antigos em conf.d
log "Removendo backups antigos em conf.d..."
find "$NGINX_CONF_D" -name "*.backup" -o -name "*.bak" -o -name "*.disabled" | while read -r file; do
    log "  Removendo: $file"
    rm "$file"
done
log_success "Backups antigos removidos"

# Fase 4: Correção de symlink
if [[ $NEEDS_SYMLINK_FIX == true ]]; then
    log "\n🔗 Fase 4: Corrigindo symlink em sites-enabled..."
    
    # Sincronizar sites-available com sites-enabled (se divergirem)
    if ! diff -q "${NGINX_SITES_ENABLED}/saraivavision" "${NGINX_SITES_AVAILABLE}/saraivavision" > /dev/null 2>&1; then
        log_warning "Divergência detectada entre sites-enabled e sites-available"
        log "Copiando versão de sites-enabled para sites-available..."
        cp "${NGINX_SITES_ENABLED}/saraivavision" "${NGINX_SITES_AVAILABLE}/saraivavision"
    fi
    
    # Remover arquivo e criar symlink
    rm "${NGINX_SITES_ENABLED}/saraivavision"
    ln -sf "${NGINX_SITES_AVAILABLE}/saraivavision" "${NGINX_SITES_ENABLED}/saraivavision"
    log_success "Symlink criado: sites-enabled/saraivavision -> sites-available/saraivavision"
else
    log_success "Symlink já está correto"
fi

# Fase 5: Criar snippets reutilizáveis
log "\n📝 Fase 5: Criando snippets Nginx..."

# Snippet: gzip.conf
cat > "${NGINX_SNIPPETS}/gzip.conf" << 'EOF'
# Gzip Compression Settings
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 1000;
gzip_http_version 1.1;
gzip_types
    application/atom+xml
    application/geo+json
    application/javascript
    application/x-javascript
    application/json
    application/ld+json
    application/manifest+json
    application/rdf+xml
    application/rss+xml
    application/xhtml+xml
    application/xml
    font/eot
    font/otf
    font/ttf
    image/svg+xml
    text/css
    text/javascript
    text/plain
    text/xml;
EOF
log_success "Criado: ${NGINX_SNIPPETS}/gzip.conf"

# Snippet: security.conf
cat > "${NGINX_SNIPPETS}/security.conf" << 'EOF'
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy (comentado - ajustar conforme necessário)
# add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

# HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
EOF
log_success "Criado: ${NGINX_SNIPPETS}/security.conf"

# Snippet: proxy_params_custom.conf
cat > "${NGINX_SNIPPETS}/proxy_params_custom.conf" << 'EOF'
# Custom Proxy Parameters
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port $server_port;

# Timeouts
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# Buffering
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;
EOF
log_success "Criado: ${NGINX_SNIPPETS}/proxy_params_custom.conf"

# Fase 6: Validação e relatório
log "\n✅ Fase 6: Validação..."

# Testar configuração Nginx
log "Testando configuração Nginx..."
if nginx -t 2>&1 | tee -a "$LOG_FILE"; then
    log_success "Configuração Nginx válida"
    
    # Perguntar se deve recarregar
    echo ""
    read -p "Recarregar Nginx agora? (s/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        systemctl reload nginx
        log_success "Nginx recarregado"
    else
        log_warning "Nginx NÃO foi recarregado. Execute manualmente: systemctl reload nginx"
    fi
else
    log_error "Erro na configuração Nginx! Verifique os logs acima."
    log_warning "Restaure os backups se necessário: ${NGINX_BACKUPS}/"
    exit 1
fi

# Fase 7: Relatório final
log "\n📊 Relatório Final"
log "=========================================="
log "✅ Backups criados em: ${NGINX_BACKUPS}/"
log "✅ Log completo salvo em: ${LOG_FILE}"
log ""
log "Snippets criados:"
log "  - ${NGINX_SNIPPETS}/gzip.conf"
log "  - ${NGINX_SNIPPETS}/security.conf"
log "  - ${NGINX_SNIPPETS}/proxy_params_custom.conf"
log ""
log "Arquivos removidos:"
log "  - ${NGINX_SITES_AVAILABLE}/default (se existia)"
log "  - Backups antigos em ${NGINX_CONF_D}/"
log ""

if [[ $NEEDS_SYMLINK_FIX == true ]]; then
    log "✅ Symlink corrigido: sites-enabled/saraivavision"
fi

log "=========================================="
log "Sanitização concluída com sucesso!"
log "=========================================="

exit 0
