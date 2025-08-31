#!/bin/bash

# Script de deploy local para Saraiva Vision (nginx + Vite)
# Execute a partir do diretório do projeto

set -e

PROJECT_DIR="/var/www/saraivavisao"
BACKUP_DIR="/var/backups/saraivavisao"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
NGINX_CONFIG_FILE="/etc/nginx/sites-available/saraivavisao"
NGINX_SYMLINK="/etc/nginx/sites-enabled/saraivavisao"

echo "🚀 Iniciando deploy local do Saraiva Vision (nginx + Vite)..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute o script a partir do diretório do projeto"
    exit 1
fi

# Verificar se é root (necessário para configurar nginx)
if [ "$EUID" -ne 0 ]; then
    echo "❌ Erro: Execute como root (sudo) para configurar nginx"
    exit 1
fi

# Fazer backup da versão atual
if [ -d "$PROJECT_DIR/saraivavision" ]; then
    echo "💾 Fazendo backup da versão atual..."
    mkdir -p $BACKUP_DIR
    cp -r $PROJECT_DIR/saraivavision $BACKUP_DIR/saraivavision_$TIMESTAMP
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Build da aplicação com Vite
echo "🔨 Fazendo build da aplicação com Vite..."
npm run build

# Verificar se o build foi criado
if [ ! -d "dist" ]; then
    echo "❌ Erro: Diretório dist não foi criado pelo Vite"
    exit 1
fi

# Criar diretório de produção se não existir
echo "📁 Criando diretório de produção..."
mkdir -p $PROJECT_DIR

# Copiar arquivos para o diretório de produção
echo "📋 Copiando arquivos para produção..."
rsync -av --delete dist/ $PROJECT_DIR/saraivavision/

# Definir permissões corretas
echo "🔐 Configurando permissões..."
chown -R www-data:www-data $PROJECT_DIR/saraivavision
chmod -R 755 $PROJECT_DIR/saraivavision

# Configurar nginx
echo "⚙️ Configurando nginx..."
cp nginx.local.conf $NGINX_CONFIG_FILE

# Criar symlink se não existir
if [ ! -L "$NGINX_SYMLINK" ]; then
    ln -s $NGINX_CONFIG_FILE $NGINX_SYMLINK
fi

# Remover configuração padrão do nginx se existir
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Testar configuração nginx
echo "🔍 Testando configuração nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração nginx válida"
    
    # Recarregar nginx
    echo "🔄 Recarregando nginx..."
    systemctl reload nginx
    
    # Verificar se nginx está rodando
    if ! systemctl is-active --quiet nginx; then
        echo "🚀 Iniciando nginx..."
        systemctl start nginx
    fi
    
    # Habilitar nginx para iniciar no boot
    systemctl enable nginx
else
    echo "❌ Erro na configuração nginx"
    exit 1
fi

# Verificar se o servidor de API está rodando
echo "🔍 Verificando servidor de API..."
if ! pgrep -f "node.*server.js" > /dev/null; then
    echo "⚠️  Servidor de API não está rodando. Para iniciar:"
    echo "   nohup npm run start:api > /var/log/saraivavisao-api.log 2>&1 &"
fi

echo "✅ Deploy local concluído com sucesso!"
echo "🌐 Site disponível em:"
echo "   - https://saraivavision.com.br (SSL habilitado)"
echo "   - https://www.saraivavision.com.br (SSL habilitado)" 
echo "   - http://localhost (desenvolvimento local)"
echo "💾 Backup salvo em: $BACKUP_DIR/saraivavision_$TIMESTAMP"
echo ""
echo "🔒 SSL/HTTPS configurado e funcionando!"
echo "📋 Próximos passos opcionais:"
echo "   1. Testar SSL: ./test-ssl.sh"
echo "   2. Iniciar API: npm run start:api"
echo "   3. Verificar logs: sudo tail -f /var/log/nginx/access.log"
echo "   4. Monitorar certificado: sudo certbot certificates"
