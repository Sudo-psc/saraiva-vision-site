#!/bin/bash

# Script para configurar Nginx - Saraiva Vision
# Aplica as configurações otimizadas para o site principal e WordPress

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script deve ser executado como root"
    exit 1
fi

print_status "Configurando Nginx para Saraiva Vision..."

# Backup existing configurations
BACKUP_DIR="/etc/nginx/backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -d "/etc/nginx/sites-available" ]; then
    cp -r /etc/nginx/sites-available/* "$BACKUP_DIR/" 2>/dev/null || true
    print_status "Backup das configurações existentes criado em $BACKUP_DIR"
fi

# Copy new configurations
print_status "Aplicando novas configurações..."

# Site principal
cp docs/nginx-saraivavision-main.conf /etc/nginx/sites-available/saraivavision-main
print_status "Configuração do site principal aplicada"

# WordPress CMS
cp docs/nginx-wordpress-cms.conf /etc/nginx/sites-available/wordpress-cms
print_status "Configuração do WordPress CMS aplicada"

# WordPress Blog
cp docs/nginx-wordpress-blog.conf /etc/nginx/sites-available/wordpress-blog
print_status "Configuração do WordPress Blog aplicada"

# Enable sites
print_status "Habilitando sites..."

# Remove default site if exists
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
    print_status "Site padrão removido"
fi

# Enable new sites
ln -sf /etc/nginx/sites-available/saraivavision-main /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/wordpress-cms /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/wordpress-blog /etc/nginx/sites-enabled/

print_success "Sites habilitados"

# Create cache directories
print_status "Criando diretórios de cache..."
mkdir -p /var/cache/nginx/main
mkdir -p /var/cache/nginx/cms
mkdir -p /var/cache/nginx/blog

# Set proper permissions
chown -R www-data:www-data /var/cache/nginx/
chmod -R 755 /var/cache/nginx/

print_success "Diretórios de cache criados"

# Create log directories if they don't exist
mkdir -p /var/log/nginx
chown -R www-data:adm /var/log/nginx
chmod -R 755 /var/log/nginx

# Test nginx configuration
print_status "Testando configuração do Nginx..."
if nginx -t; then
    print_success "Configuração do Nginx válida"
    
    # Reload nginx
    print_status "Recarregando Nginx..."
    systemctl reload nginx
    print_success "Nginx recarregado com sucesso"
    
    # Show status
    print_status "Status dos serviços:"
    systemctl is-active nginx && echo -e "${GREEN}✓${NC} Nginx: Ativo" || echo -e "${RED}✗${NC} Nginx: Inativo"
    
else
    print_error "Erro na configuração do Nginx"
    print_warning "Restaurando backup..."
    
    # Restore backup
    rm -f /etc/nginx/sites-enabled/saraivavision-main
    rm -f /etc/nginx/sites-enabled/wordpress-cms
    rm -f /etc/nginx/sites-enabled/wordpress-blog
    
    if [ -d "$BACKUP_DIR" ]; then
        cp -r "$BACKUP_DIR"/* /etc/nginx/sites-available/ 2>/dev/null || true
    fi
    
    exit 1
fi

# Show configuration summary
print_success "=== CONFIGURAÇÃO NGINX APLICADA ==="
echo -e "${GREEN}✓${NC} Site Principal: saraivavision.com.br"
echo -e "${GREEN}✓${NC} WordPress CMS: cms.saraivavision.com.br"
echo -e "${GREEN}✓${NC} WordPress Blog: blog.saraivavision.com.br"
echo -e "${GREEN}✓${NC} Cache configurado para melhor performance"
echo -e "${GREEN}✓${NC} Compressão Gzip habilitada"
echo -e "${GREEN}✓${NC} Headers de segurança aplicados"
echo -e "${GREEN}✓${NC} Rate limiting configurado"
echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo "1. Configurar certificados SSL com Let's Encrypt"
echo "2. Verificar DNS dos subdomínios"
echo "3. Testar todas as rotas e APIs"
echo ""
print_success "Configuração do Nginx concluída!"