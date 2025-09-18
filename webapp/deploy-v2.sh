#!/bin/bash
# Deploy script para Saraiva Vision V2
# Repositório: https://github.com/Sudo-psc/saraivavision-site-v2
# Versão: 2.0.0

set -euo pipefail

echo "🚀 Deploy Saraiva Vision V2"
echo "============================"
echo "📁 Repositório: saraivavision-site-v2"
echo "🔗 URL: https://github.com/Sudo-psc/saraivavision-site-v2"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se estamos no repositório correto
REPO_NAME=$(basename $(git config --get remote.origin.url) .git 2>/dev/null || echo "unknown")
if [ "$REPO_NAME" != "saraivavision-site-v2" ]; then
    echo "⚠️  Aviso: Este script é otimizado para o repositório saraivavision-site-v2"
    echo "   Repositório atual: $REPO_NAME"
    read -p "   Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Aviso: Não está na branch main (atual: $CURRENT_BRANCH)"
    read -p "   Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
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
echo "📁 Publicando build em /var/www/saraivavision/current"
sudo mkdir -p /var/www/saraivavision
sudo rm -rf /var/www/saraivavision/current
sudo mkdir -p /var/www/saraivavision/current
sudo cp -r dist/* /var/www/saraivavision/current/
sudo chown -R www-data:www-data /var/www/saraivavision
echo "✅ Arquivos copiados"

# Deploy nginx se necessário
if [ ! -f "/etc/nginx/sites-available/saraivavision" ] || [ "$1" = "--force-nginx" ] 2>/dev/null; then
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

# Informações da versão
echo ""
echo "� DEPLOY V2 CONCLUÍDO!"
echo "======================="
echo "🌐 Site: https://saraivavision.com.br/"
echo "📦 Repositório: https://github.com/Sudo-psc/saraivavision-site-v2"
echo "🔀 Branch: $CURRENT_BRANCH"
echo "📝 Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
echo ""
 Melhorias V2 aplicadas:"echo "
echo "   • Alt-text em todas as imagens (WCAG 2.1)"
echo "   • Imagens otimizadas (95% redução de tamanho)"
echo "   • Performance melhorada"
echo "   • Players de podcast únicos"
