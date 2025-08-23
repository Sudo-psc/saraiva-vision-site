#!/bin/bash

# Script de deploy para Saraiva Vision
# Execute a partir do diretório do projeto

set -e

PROJECT_DIR="/var/www/saraivavisao"
BACKUP_DIR="/var/backups/saraivavisao"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🚀 Iniciando deploy do Saraiva Vision..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute o script a partir do diretório do projeto"
    exit 1
fi

# Fazer backup da versão atual
if [ -d "$PROJECT_DIR/dist" ]; then
    echo "💾 Fazendo backup da versão atual..."
    mkdir -p $BACKUP_DIR
    cp -r $PROJECT_DIR/dist $BACKUP_DIR/dist_$TIMESTAMP
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --only=production

# Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

# Verificar se o build foi criado
if [ ! -d "dist" ]; then
    echo "❌ Erro: Diretório dist não foi criado"
    exit 1
fi

# Copiar arquivos para o diretório de produção
echo "📋 Copiando arquivos para produção..."
mkdir -p $PROJECT_DIR
rsync -av --delete dist/ $PROJECT_DIR/dist/

# Definir permissões corretas
echo "🔐 Configurando permissões..."
chown -R www-data:www-data $PROJECT_DIR/dist
chmod -R 755 $PROJECT_DIR/dist

# Verificar se .htaccess está configurado
if [ -f "public/.htaccess" ]; then
    echo "⚙️ Atualizando configuração apache..."
    cp public/.htaccess $PROJECT_DIR/dist/.htaccess
    
    # Testar configuração apache
    apache2ctl configtest
    
    # Recarregar apache
    systemctl reload apache2
fi

# Limpar cache se necessário
echo "🧹 Limpando cache..."
find $PROJECT_DIR/dist -name "*.html" -exec touch {} \;

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Site disponível em: https://saraivavisao.com.br"
echo "💾 Backup salvo em: $BACKUP_DIR/dist_$TIMESTAMP"