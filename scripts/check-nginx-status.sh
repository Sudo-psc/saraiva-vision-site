#!/bin/bash

# Script para verificar status e configuração do Nginx - Saraiva Vision

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}🔍 Verificação do Status do Nginx - Saraiva Vision${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if nginx is installed
if ! command -v nginx >/dev/null 2>&1; then
    print_error "Nginx não está instalado"
    exit 1
fi

# Check nginx version
NGINX_VERSION=$(nginx -v 2>&1 | cut -d' ' -f3)
print_status "Versão do Nginx: $NGINX_VERSION"

# Check nginx service status
print_status "Status do serviço Nginx:"
if systemctl is-active --quiet nginx; then
    print_success "✓ Nginx está ativo e rodando"
else
    print_error "✗ Nginx não está rodando"
fi

# Check nginx configuration
print_status "Testando configuração do Nginx:"
if nginx -t 2>/dev/null; then
    print_success "✓ Configuração do Nginx é válida"
else
    print_error "✗ Erro na configuração do Nginx:"
    nginx -t
fi

# Check enabled sites
print_status "Sites habilitados:"
if [ -d "/etc/nginx/sites-enabled" ]; then
    for site in /etc/nginx/sites-enabled/*; do
        if [ -L "$site" ]; then
            site_name=$(basename "$site")
            target=$(readlink "$site")
            echo -e "  ${GREEN}✓${NC} $site_name -> $target"
        fi
    done
else
    print_warning "Diretório sites-enabled não encontrado"
fi

# Check available sites
print_status "Sites disponíveis:"
if [ -d "/etc/nginx/sites-available" ]; then
    for site in /etc/nginx/sites-available/*; do
        if [ -f "$site" ]; then
            site_name=$(basename "$site")
            if [ -L "/etc/nginx/sites-enabled/$site_name" ]; then
                echo -e "  ${GREEN}✓${NC} $site_name (habilitado)"
            else
                echo -e "  ${YELLOW}○${NC} $site_name (disponível)"
            fi
        fi
    done
else
    print_warning "Diretório sites-available não encontrado"
fi

# Check cache directories
print_status "Diretórios de cache:"
cache_dirs=("/var/cache/nginx/main" "/var/cache/nginx/cms" "/var/cache/nginx/blog")
for dir in "${cache_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_success "✓ $dir existe"
    else
        print_warning "○ $dir não existe"
    fi
done

# Check log files
print_status "Arquivos de log:"
log_files=(
    "/var/log/nginx/saraiva_main_access.log"
    "/var/log/nginx/saraiva_main_error.log"
    "/var/log/nginx/cms_saraiva_access.log"
    "/var/log/nginx/cms_saraiva_error.log"
    "/var/log/nginx/blog_saraiva_access.log"
    "/var/log/nginx/blog_saraiva_error.log"
)

for log_file in "${log_files[@]}"; do
    if [ -f "$log_file" ]; then
        size=$(du -h "$log_file" | cut -f1)
        print_success "✓ $log_file ($size)"
    else
        print_warning "○ $log_file não existe"
    fi
done

# Check SSL certificates
print_status "Certificados SSL:"
ssl_domains=("saraivavision.com.br" "cms.saraivavision.com.br" "blog.saraivavision.com.br")
for domain in "${ssl_domains[@]}"; do
    cert_path="/etc/letsencrypt/live/$domain/fullchain.pem"
    if [ -f "$cert_path" ]; then
        # Check certificate expiration
        expiry=$(openssl x509 -enddate -noout -in "$cert_path" | cut -d= -f2)
        expiry_epoch=$(date -d "$expiry" +%s)
        current_epoch=$(date +%s)
        days_left=$(( (expiry_epoch - current_epoch) / 86400 ))
        
        if [ $days_left -gt 30 ]; then
            print_success "✓ $domain (expira em $days_left dias)"