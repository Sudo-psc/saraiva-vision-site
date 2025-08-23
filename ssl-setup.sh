#!/bin/bash

# Script para configurar SSL com Let's Encrypt para Saraiva Vision
# Execute como root ou com sudo

set -e

DOMAIN="saraivavision.com.br"
EMAIL="saraivavision@gmail.com"

echo "🔒 Configurando SSL para $DOMAIN..."

# Instalar certbot se não estiver instalado
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Parar containers Docker para liberar portas
echo "🐳 Parando containers Docker..."
docker stop n8n-nginx 2>/dev/null || true

# Obter certificado SSL usando standalone
echo "📜 Obtendo certificado SSL..."
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Reiniciar containers Docker
echo "🐳 Reiniciando containers Docker..."
docker start n8n-nginx 2>/dev/null || true

# Atualizar configuração nginx no projeto
echo "🔧 Atualizando configuração nginx..."
NGINX_CONF="/home/saraiva-vision-site/nginx.conf"
if [ -f "$NGINX_CONF" ]; then
    sed -i "s|/etc/letsencrypt/live/.*\.saraivavision\.com\.br/fullchain\.pem|/etc/letsencrypt/live/$DOMAIN/fullchain.pem|g" "$NGINX_CONF"
    sed -i "s|/etc/letsencrypt/live/.*\.saraivavision\.com\.br/privkey\.pem|/etc/letsencrypt/live/$DOMAIN/privkey.pem|g" "$NGINX_CONF"
fi

# Configurar renovação automática
echo "🔄 Configurando renovação automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --pre-hook 'docker stop n8n-nginx' --post-hook 'docker start n8n-nginx'") | crontab -

# Recriar container nginx com nova configuração
echo "🔄 Recriando container nginx..."
cd /home/saraiva-vision-site
docker-compose up -d --force-recreate nginx 2>/dev/null || echo "⚠️  Execute 'docker-compose up -d' no diretório do projeto para aplicar as mudanças"

echo "✅ SSL configurado com sucesso!"
echo "🌐 Site disponível em: https://$DOMAIN"
echo "📋 Certificado válido por 90 dias (renovação automática configurada)"
echo "📝 Execute 'docker-compose up -d' no diretório do projeto se necessário"