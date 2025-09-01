#!/bin/bash
# Script automatizado para deploy completo do site (build + nginx + copy)

echo "🚀 Deploy Automático - Saraiva Vision"
echo "====================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# Build do projeto
echo "🔨 Executando build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro no build"
    exit 1
fi
echo "✅ Build concluído"

# Criar/atualizar diretório web
echo "📁 Copiando arquivos para /var/www/saraiva-vision-site..."
sudo mkdir -p /var/www/saraiva-vision-site
sudo rm -rf /var/www/saraiva-vision-site/*
sudo cp -r dist/* /var/www/saraiva-vision-site/
sudo chown -R www-data:www-data /var/www/saraiva-vision-site
echo "✅ Arquivos copiados"

# Deploy nginx se necessário
if [ ! -f "/etc/nginx/sites-available/saraivavision" ] || [ "$1" = "--force-nginx" ]; then
    echo "🔧 Atualizando configuração nginx..."
    sudo ./deploy-nginx-consolidated.sh
    if [ $? -ne 0 ]; then
        echo "❌ Erro no deploy nginx"
        exit 1
    fi
else
    echo "🔄 Recarregando nginx..."
    sudo systemctl reload nginx
fi

# Limpar caches
echo "🧹 Limpando caches..."
sudo rm -rf /var/cache/nginx/* 2>/dev/null || true

# Verificações
echo ""
echo "🧪 VERIFICAÇÕES FINAIS:"
echo "====================="
echo -n "📡 Status do site: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ OK (HTTP $HTTP_CODE)"
else
    echo "❌ Erro (HTTP $HTTP_CODE)"
fi

echo -n "🛠️  Service Worker: "
SW_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/sw.js)
if [ "$SW_CODE" = "200" ]; then
    echo "✅ OK (HTTP $SW_CODE)"
else
    echo "❌ Erro (HTTP $SW_CODE)"
fi

echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "=================="
echo "🌐 Site: https://saraivavision.com.br/"
echo ""
echo "📱 Para corrigir Safari (se ainda houver problemas):"
echo "   1. Safari → Develop → Empty Caches"
echo "   2. Safari → Develop → Disable Service Workers (temporário)"
echo "   3. Hard refresh (Cmd+Shift+R)"
echo ""
echo "💡 Service Worker melhorado com:"
echo "   - Melhor tratamento de erros Safari"
echo "   - Headers específicos Safari-friendly"
echo "   - Cache mais conservador"
