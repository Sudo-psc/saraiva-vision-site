#!/bin/bash

# Setup WordPress Local para Clínica Saraiva Vision
# Dr. Philipe Saraiva Cruz - CRM-MG 69.870

set -e

echo "🏥 Configurando WordPress para Clínica Saraiva Vision..."

# Variáveis de configuração
WP_DIR="./wordpress-local"
WP_URL="http://localhost:8083"
DB_NAME="saraiva_vision"
DB_USER="root"
DB_PASS=""
ADMIN_USER="admin"
ADMIN_PASS="saraiva2024"
ADMIN_EMAIL="contato@saraivavision.com.br"

# Verificar dependências
if ! command -v php &> /dev/null; then
    echo "❌ PHP não encontrado. Instale com: brew install php"
    exit 1
fi

if ! command -v wget &> /dev/null && ! command -v curl &> /dev/null; then
    echo "❌ wget ou curl necessário. Instale com: brew install wget"
    exit 1
fi

# Criar diretório WordPress
echo "📁 Criando diretório WordPress..."
mkdir -p "$WP_DIR"
cd "$WP_DIR"

# Download WordPress se não existir
if [ ! -f "wp-config.php" ]; then
    echo "⬇️ Baixando WordPress..."
    
    if command -v wget &> /dev/null; then
        wget -q https://wordpress.org/latest.tar.gz
    else
        curl -s -O https://wordpress.org/latest.tar.gz
    fi
    
    tar -xzf latest.tar.gz --strip-components=1
    rm latest.tar.gz
    
    echo "✅ WordPress baixado"
fi

# Configurar wp-config.php
if [ ! -f "wp-config.php" ]; then
    echo "⚙️ Configurando WordPress..."
    
    cp wp-config-sample.php wp-config.php
    
    # Configurações básicas
    sed -i '' "s/database_name_here/$DB_NAME/g" wp-config.php
    sed -i '' "s/username_here/$DB_USER/g" wp-config.php
    sed -i '' "s/password_here/$DB_PASS/g" wp-config.php
    sed -i '' "s/localhost/localhost/g" wp-config.php
    
    # Adicionar configurações específicas da clínica
    cat >> wp-config.php << 'EOF'

// Configurações específicas da Clínica Saraiva Vision
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

// Configurações para headless CMS
define('DISALLOW_FILE_EDIT', true);
define('FORCE_SSL_ADMIN', false);

// Habilitar CORS para desenvolvimento
define('ALLOW_UNFILTERED_UPLOADS', true);

// Informações da clínica
define('CLINIC_NAME', 'Clínica Saraiva Vision');
define('DOCTOR_NAME', 'Dr. Philipe Saraiva Cruz');
define('DOCTOR_CRM', 'CRM-MG 69.870');
define('CLINIC_LOCATION', 'Caratinga, Minas Gerais');

// Configurações de URL
define('WP_HOME', 'http://localhost:8083');
define('WP_SITEURL', 'http://localhost:8083');
EOF

    echo "✅ wp-config.php configurado"
fi

# Copiar plugin de correção da API
if [ -f "../wordpress-api-fix.php" ]; then
    echo "📋 Instalando plugin de correção da API..."
    mkdir -p wp-content/mu-plugins
    cp ../wordpress-api-fix.php wp-content/mu-plugins/saraiva-api-fix.php
    echo "✅ Plugin de correção instalado"
fi

# Criar .htaccess para desenvolvimento
cat > .htaccess << 'EOF'
# Clínica Saraiva Vision - WordPress Configuration
RewriteEngine On
RewriteBase /

# WordPress permalinks
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]

# CORS headers for development
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "http://localhost:3002"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>

# Prevent access to sensitive files
<Files wp-config.php>
    order allow,deny
    deny from all
</Files>
EOF

echo "✅ .htaccess configurado"

# Iniciar servidor PHP
echo "🚀 Iniciando servidor WordPress na porta 8083..."
echo "📝 Administração: http://localhost:8083/wp-admin"
echo "🔑 Usuário: $ADMIN_USER | Senha: $ADMIN_PASS"
echo "📋 API REST: http://localhost:8083/wp-json/wp/v2"
echo ""
echo "⚠️ IMPORTANTE: Execute a instalação do WordPress em http://localhost:8083"
echo "               Use as credenciais acima para configurar o administrador"
echo ""

# Matar processo existente na porta 8083
lsof -ti:8083 | xargs kill -9 2>/dev/null || true

# Iniciar servidor
php -S localhost:8083 -t . &
PHP_PID=$!

echo "✅ Servidor iniciado (PID: $PHP_PID)"
echo "🔄 Para parar o servidor: kill $PHP_PID"

# Salvar PID para controle
echo $PHP_PID > ../wordpress-server.pid

cd ..

echo ""
echo "🎉 WordPress configurado com sucesso!"
echo "🌐 Acesse: http://localhost:8083"
echo "📚 Próximos passos:"
echo "   1. Complete a instalação em http://localhost:8083"
echo "   2. Configure temas e plugins"
echo "   3. Teste a API REST em http://localhost:8083/wp-json/wp/v2"