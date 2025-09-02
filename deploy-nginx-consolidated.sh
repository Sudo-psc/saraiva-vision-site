#!/bin/bash
# Script para deploy das configurações nginx consolidadas

echo "🔧 Nginx Configuration Deployment Script"
echo "========================================="

# Verificar se estamos executando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script deve ser executado como root (sudo)"
    exit 1
fi

# Criar diretório de includes se não existir
INCLUDES_DIR="/etc/nginx/includes"
if [ ! -d "$INCLUDES_DIR" ]; then
    echo "📁 Criando diretório $INCLUDES_DIR"
    mkdir -p "$INCLUDES_DIR"
fi

# Copiar includes
echo "📋 Copiando includes..."
cp nginx-includes/*.conf "$INCLUDES_DIR/"
if [ $? -eq 0 ]; then
    echo "✅ Includes copiados com sucesso"
else
    echo "❌ Erro ao copiar includes"
    exit 1
fi

# Ajustar caminhos nos arquivos principais para usar /etc/nginx/includes
echo "🔄 Ajustando caminhos dos includes..."
sed -i 's|/home/saraiva-vision-site/nginx-includes/|/etc/nginx/includes/|g' nginx.conf

# Fazer backup da configuração atual se existir
SITE_CONF="/etc/nginx/sites-available/saraivavision"
if [ -f "$SITE_CONF" ]; then
    echo "💾 Fazendo backup da configuração atual..."
    cp "$SITE_CONF" "$SITE_CONF.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copiar configuração principal
echo "📝 Copiando configuração principal..."
cp nginx.conf "$SITE_CONF"

# Criar symlink se não existir
ENABLED_CONF="/etc/nginx/sites-enabled/saraivavision"
if [ ! -L "$ENABLED_CONF" ]; then
    echo "🔗 Criando symlink..."
    ln -s "$SITE_CONF" "$ENABLED_CONF"
fi

# Remover configs legadas que possam conflitar
if [ -L "/etc/nginx/sites-enabled/saraivavisao" ]; then
    echo "🧹 Removendo vhost legado: /etc/nginx/sites-enabled/saraivavisao"
    rm -f "/etc/nginx/sites-enabled/saraivavisao"
fi
if [ -f "/etc/nginx/sites-available/saraivavisao" ]; then
    echo "🧹 Removendo vhost legado: /etc/nginx/sites-available/saraivavisao"
    rm -f "/etc/nginx/sites-available/saraivavisao"
fi
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    echo "🧹 Removendo default site"
    rm -f "/etc/nginx/sites-enabled/default"
fi

# Testar configuração
echo "🧪 Testando configuração nginx..."
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Configuração nginx válida!"

    # Recarregar nginx
    echo "🔄 Recarregando nginx..."
    systemctl reload nginx
    if [ $? -eq 0 ]; then
        echo "✅ Nginx recarregado com sucesso!"
        echo ""
        echo "🎉 Deploy concluído! Configurações consolidadas ativas."
        echo ""
        echo "📊 Para verificar headers:"
        echo "curl -I https://saraivavision.com.br/ | grep -Ei '(content-security-policy|strict-transport|x-frame)'"
    else
        echo "❌ Erro ao recarregar nginx"
        exit 1
    fi
else
    echo "❌ Erro na configuração nginx. Verifique os logs."
    exit 1
fi
