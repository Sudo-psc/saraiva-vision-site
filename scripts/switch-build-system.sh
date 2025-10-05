#!/bin/bash

###############################################################################
# Switch Build System - Saraiva Vision
# Descrição: Alterna entre React/Vite e Next.js
# Uso: sudo npm run deploy:switch [react|next]
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
NGINX_CONFIG="/etc/nginx/sites-enabled/saraivavision"
REACT_ROOT="/var/www/saraivavision/current"
NEXT_ROOT="/var/www/saraivavision-next/current"
HEALTHCHECK_URL="https://saraivavision.com.br/"

# Funções de log
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $*"
}

log_error() {
    echo -e "${RED}[✗]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $*"
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
║   Switch Build System - Saraiva Vision   ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Detectar sistema atual
CURRENT_SYSTEM="unknown"
if grep -q "root /var/www/saraivavision/current" "$NGINX_CONFIG" 2>/dev/null; then
    CURRENT_SYSTEM="react"
elif grep -q "proxy_pass.*:3002" "$NGINX_CONFIG" 2>/dev/null; then
    CURRENT_SYSTEM="next"
fi

log "Sistema atual: ${CURRENT_SYSTEM}"

# Determinar target
TARGET="${1:-}"

if [ -z "$TARGET" ]; then
    echo ""
    echo -e "${YELLOW}Selecione o sistema de build:${NC}"
    echo ""
    if [ "$CURRENT_SYSTEM" = "react" ]; then
        echo -e "  ${GREEN}1) React/Vite (atual)${NC}"
        echo "  2) Next.js"
    elif [ "$CURRENT_SYSTEM" = "next" ]; then
        echo "  1) React/Vite"
        echo -e "  ${GREEN}2) Next.js (atual)${NC}"
    else
        echo "  1) React/Vite"
        echo "  2) Next.js"
    fi
    echo ""
    read -p "Opção (1 ou 2): " choice
    
    case $choice in
        1) TARGET="react" ;;
        2) TARGET="next" ;;
        *) 
            log_error "Opção inválida"
            exit 1
            ;;
    esac
fi

# Validar target
if [ "$TARGET" != "react" ] && [ "$TARGET" != "next" ]; then
    log_error "Target inválido. Use: react ou next"
    exit 1
fi

# Verificar se já está no sistema correto
if [ "$CURRENT_SYSTEM" = "$TARGET" ]; then
    log_warning "Já está usando o sistema $TARGET"
    exit 0
fi

# Confirmação
echo ""
echo -e "${YELLOW}Você está prestes a mudar de:${NC}"
echo -e "  ${RED}$CURRENT_SYSTEM${NC}"
echo -e "  ↓"
echo -e "  ${GREEN}$TARGET${NC}"
echo ""
read -p "Continuar? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log "Operação cancelada pelo usuário"
    exit 0
fi

# ============================================================================
# Configuração React/Vite
# ============================================================================
configure_react() {
    log "Configurando para React/Vite..."
    
    # Verificar se build existe
    if [ ! -d "$REACT_ROOT" ]; then
        log_error "Build React não encontrado em $REACT_ROOT"
        log "Execute primeiro: npm run deploy:react"
        exit 1
    fi
    
    # Backup config atual
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Configuração Nginx para SPA React
    cat > "$NGINX_CONFIG" << 'NGINX_REACT'
server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;

    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/saraivavision/current;
    index index.html;

    access_log /var/log/nginx/saraivavision.access.log;
    error_log /var/log/nginx/saraivavision.error.log;

    # Assets com cache longo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Assets directory
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Service Worker sem cache
    location = /sw.js {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA fallback - React Router
    location / {
        try_files $uri $uri/ /index.html;
        
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
}

server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    return 301 https://$server_name$request_uri;
}
NGINX_REACT

    log_success "Configuração React/Vite aplicada"
}

# ============================================================================
# Configuração Next.js
# ============================================================================
configure_next() {
    log "Configurando para Next.js..."
    
    # Verificar se Next.js está rodando
    if ! pm2 list | grep -q "saraiva-next.*online"; then
        log_error "Next.js não está rodando"
        log "Execute primeiro: npm run deploy:next"
        exit 1
    fi
    
    # Backup config atual
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Configuração Nginx para Next.js
    cat > "$NGINX_CONFIG" << 'NGINX_NEXT'
upstream nextjs_backend {
    server 127.0.0.1:3002;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;

    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    access_log /var/log/nginx/saraivavision.access.log;
    error_log /var/log/nginx/saraivavision.error.log;

    # Proxy para Next.js
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
}

server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    return 301 https://$server_name$request_uri;
}
NGINX_NEXT

    log_success "Configuração Next.js aplicada"
}

# ============================================================================
# Aplicar Configuração
# ============================================================================
echo ""
log "Aplicando configuração para $TARGET..."

case $TARGET in
    react)
        configure_react
        ;;
    next)
        configure_next
        ;;
esac

# Testar configuração Nginx
log "Testando configuração Nginx..."
if nginx -t 2>&1 | grep -q "successful"; then
    log_success "Configuração Nginx válida"
else
    log_error "Configuração Nginx inválida!"
    nginx -t
    
    # Restaurar backup
    log_warning "Restaurando configuração anterior..."
    LATEST_BACKUP=$(ls -t ${NGINX_CONFIG}.backup.* | head -1)
    cp "$LATEST_BACKUP" "$NGINX_CONFIG"
    exit 1
fi

# Reload Nginx
log "Recarregando Nginx..."
systemctl reload nginx
log_success "Nginx recarregado"

# Health check
sleep 2
log "Executando health check..."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTHCHECK_URL" || echo "000")

echo ""
if [ "$HTTP_CODE" = "200" ]; then
    log_success "Health check OK (HTTP $HTTP_CODE)"
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   Sistema Alterado com Sucesso!          ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}🔄 Sistema anterior:${NC} $CURRENT_SYSTEM"
    echo -e "${CYAN}✅ Sistema atual:${NC} $TARGET"
    echo -e "${CYAN}🌐 URL:${NC} $HEALTHCHECK_URL"
    echo -e "${CYAN}📊 Status:${NC} HTTP $HTTP_CODE"
    echo ""
else
    log_error "Health check FALHOU (HTTP $HTTP_CODE)"
    
    # Restaurar configuração anterior
    log_warning "Restaurando configuração anterior..."
    LATEST_BACKUP=$(ls -t ${NGINX_CONFIG}.backup.* | head -1)
    cp "$LATEST_BACKUP" "$NGINX_CONFIG"
    systemctl reload nginx
    
    log_error "Falha ao alternar sistema. Configuração anterior restaurada."
    exit 1
fi

exit 0
