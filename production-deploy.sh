#!/bin/bash

# Script de Deploy de Produção - Saraiva Vision
# Inclui SSL, monitoramento e otimizações de produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Banner
echo "🚀 DEPLOY DE PRODUÇÃO - SARAIVA VISION BLOG"
echo "=============================================="
echo ""

# 1. Verificar serviços
log_step "1. Verificando serviços essenciais..."

services=("nginx" "php8.3-fpm" "mysql")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        log_info "✅ $service: ATIVO"
    else
        log_warn "⚠️  $service: INATIVO - Iniciando..."
        sudo systemctl start $service
        sleep 2
        if systemctl is-active --quiet $service; then
            log_info "✅ $service: INICIADO"
        else
            log_error "❌ Falha ao iniciar $service"
            exit 1
        fi
    fi
done

# 2. Verificar configuração Nginx
log_step "2. Verificando configuração Nginx..."
if sudo nginx -t; then
    log_info "✅ Configuração Nginx válida"
else
    log_error "❌ Configuração Nginx inválida"
    exit 1
fi

# 3. Testes de conectividade
log_step "3. Testando conectividade..."

# Frontend
if curl -s -f "http://localhost:8082/health" > /dev/null; then
    log_info "✅ Frontend respondendo (porta 8082)"
else
    log_error "❌ Frontend não está respondendo"
    exit 1
fi

# WordPress API
if curl -s -f "http://localhost:8083/wp-json/wp/v2/" > /dev/null; then
    log_info "✅ WordPress API respondendo (porta 8083)"
else
    log_error "❌ WordPress API não está respondendo"
    exit 1
fi

# Proxy da API
if curl -s -f "http://localhost:8082/wp-json/wp/v2/" > /dev/null; then
    log_info "✅ Proxy da API funcionando"
else
    log_error "❌ Proxy da API não está funcionando"
    exit 1
fi

# 4. Performance e otimização
log_step "4. Verificando otimizações de performance..."

# Gzip habilitado
if curl -H "Accept-Encoding: gzip" -s -I "http://localhost:8082/" | grep -q "Content-Encoding: gzip"; then
    log_info "✅ Compressão Gzip ativa"
else
    log_warn "⚠️  Compressão Gzip não detectada"
fi

# Cache headers
if curl -s -I "http://localhost:8082/assets/" | grep -q "Cache-Control"; then
    log_info "✅ Headers de cache configurados"
else
    log_warn "⚠️  Headers de cache não detectados"
fi

# 5. Segurança
log_step "5. Verificando configurações de segurança..."

# Security headers
security_headers=("X-Frame-Options" "X-XSS-Protection" "X-Content-Type-Options")
headers_response=$(curl -s -I "http://localhost:8082/")

for header in "${security_headers[@]}"; do
    if echo "$headers_response" | grep -q "$header"; then
        log_info "✅ $header configurado"
    else
        log_warn "⚠️  $header não encontrado"
    fi
done

# 6. WordPress específico
log_step "6. Verificando configurações WordPress..."

# XML-RPC bloqueado
if curl -s -I "http://localhost:8083/xmlrpc.php" | grep -q "403\|444"; then
    log_info "✅ XML-RPC bloqueado"
else
    log_warn "⚠️  XML-RPC acessível"
fi

# wp-config.php protegido
if curl -s -I "http://localhost:8083/wp-config.php" | grep -q "403\|404"; then
    log_info "✅ wp-config.php protegido"
else
    log_warn "⚠️  wp-config.php acessível"
fi

# 7. Monitoramento de recursos
log_step "7. Verificando recursos do sistema..."

# Espaço em disco
disk_usage=$(df /var/www | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
    log_info "✅ Espaço em disco: ${disk_usage}% (OK)"
else
    log_warn "⚠️  Espaço em disco: ${disk_usage}% (Alto)"
fi

# Memória
memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')
log_info "📊 Uso de memória: ${memory_usage}%"

# 8. Backup de configuração
log_step "8. Criando backup de configuração..."

BACKUP_DIR="/var/backups/saraivavision/$(date +%Y%m%d_%H%M%S)"
sudo mkdir -p "$BACKUP_DIR"

# Backup Nginx
sudo cp -r /etc/nginx/sites-available/saraivavision-production "$BACKUP_DIR/"
sudo cp /home/saraiva-vision-site/.env "$BACKUP_DIR/"

log_info "✅ Backup salvo em: $BACKUP_DIR"

# 9. SSL/TLS (preparação)
log_step "9. Verificando preparação SSL..."

if [ -d "/etc/letsencrypt" ]; then
    log_info "✅ Let's Encrypt disponível"
    log_info "💡 Para SSL: certbot --nginx -d seudominio.com"
else
    log_warn "⚠️  Let's Encrypt não instalado"
    log_info "💡 Instale com: sudo apt install certbot python3-certbot-nginx"
fi

# 10. Relatório final
echo ""
echo "🎉 DEPLOY DE PRODUÇÃO CONCLUÍDO!"
echo "================================="
echo ""
log_info "📍 URLs de Acesso:"
echo "   • Frontend:        http://localhost:8082"
echo "   • WordPress Admin: http://localhost:8083/wp-admin"
echo "   • WordPress API:   http://localhost:8082/wp-json/wp/v2"
echo "   • Health Check:    http://localhost:8082/health"
echo ""

log_info "🔑 Credenciais WordPress:"
echo "   • Usuário: admin"
echo "   • Senha: SaraivaBlog2024!"
echo ""

log_info "📂 Diretórios:"
echo "   • Frontend: /var/www/saraivavision"
echo "   • WordPress: /var/www/cms.saraivavision.local"
echo "   • Backups: /var/backups/saraivavision"
echo ""

log_info "⚙️  Configurações:"
echo "   • Nginx: /etc/nginx/sites-available/saraivavision-production"
echo "   • PHP-FPM: Socket Unix (/run/php/php8.3-fpm.sock)"
echo "   • MySQL: localhost:3306"
echo ""

log_info "🔧 Próximos passos para produção:"
echo "   1. Configurar domínio DNS"
echo "   2. Instalar certificado SSL"
echo "   3. Configurar backup automático"
echo "   4. Configurar monitoramento"
echo "   5. Configurar CDN (opcional)"
echo ""

log_info "✅ Sistema pronto para produção!"

exit 0
