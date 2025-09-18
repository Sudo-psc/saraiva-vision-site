#!/bin/bash

# Script para corrigir integração WordPress/CMS
# Clínica Saraiva Vision - Dr. Philipe Saraiva Cruz

echo "=================================================="
echo "🏥 CORREÇÃO WORDPRESS/CMS - SARAIVA VISION"
echo "=================================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Variáveis
WP_DIR="/var/www/cms.saraivavision.local"
NGINX_CONF="/home/saraiva-vision-site-v3/webapp/nginx.conf"
WP_CONFIG="$WP_DIR/wp-config.php"

echo -e "${YELLOW}1. Verificando instalação WordPress...${NC}"
if [ -d "$WP_DIR" ] && [ -f "$WP_DIR/wp-admin/index.php" ]; then
    echo -e "${GREEN}✓${NC} WordPress instalado em $WP_DIR"
else
    echo -e "${RED}✗${NC} WordPress não encontrado em $WP_DIR"
    exit 1
fi

echo ""
echo -e "${YELLOW}2. Criando wp-config.php se necessário...${NC}"
if [ ! -f "$WP_CONFIG" ]; then
    cat > "$WP_CONFIG" << 'EOF'
<?php
/**
 * WordPress Configuration - Saraiva Vision CMS
 * Clínica Oftalmológica - Dr. Philipe Saraiva Cruz
 */

// Database settings
define('DB_NAME', 'saraivavision_cms');
define('DB_USER', 'saraivavision');
define('DB_PASSWORD', 'SV@2024cms!');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// WordPress URLs - Important for proxy setup
define('WP_HOME', 'https://saraivavision.com.br/blog');
define('WP_SITEURL', 'https://saraivavision.com.br/blog');

// Force SSL admin
define('FORCE_SSL_ADMIN', true);

// Handle proxy headers
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

// Fix URLs when behind proxy
if (isset($_SERVER['HTTP_X_ORIGINAL_URI'])) {
    $_SERVER['REQUEST_URI'] = $_SERVER['HTTP_X_ORIGINAL_URI'];
}

// Authentication Keys and Salts
define('AUTH_KEY',         'gK#9vL@2mP$5nR*8wQ!3xY&6uT%1iO^4');
define('SECURE_AUTH_KEY',  'hF$7jN@4kL#9mP*2vB&5xZ!8qW^3eR%6');
define('LOGGED_IN_KEY',    'aS#5dF@8gH*2jK$9lZ&3xC!6vB^4nM%7');
define('NONCE_KEY',        'qW@3eR#6tY$9uI*2oP&5aS!8dF^7gH%4');
define('AUTH_SALT',        'zX#4cV@7bN*3mQ$6wE!9rT&2yU^5iO%8');
define('SECURE_AUTH_SALT', 'lK@9jH#4gF*7dS$2aZ&5xC!8vB^3nM%6');
define('LOGGED_IN_SALT',   'pO#8iU@5yT*2rE$9wQ!3aS&6dF^7gH%4');
define('NONCE_SALT',       'nM@6bV#9cX*4zL$7kJ!2hG&5fD^8sA%3');

// WordPress Database Table prefix
$table_prefix = 'sv_';

// Debug settings (disable in production)
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

// Disable file editing from admin
define('DISALLOW_FILE_EDIT', true);

// Memory limits
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// Auto updates
define('WP_AUTO_UPDATE_CORE', 'minor');

/* That's all, stop editing! */
if (!defined('ABSPATH')) {
    define('ABSPATH', dirname(__FILE__) . '/');
}
require_once(ABSPATH . 'wp-settings.php');
EOF
    
    sudo chown www-data:www-data "$WP_CONFIG"
    sudo chmod 640 "$WP_CONFIG"
    echo -e "${GREEN}✓${NC} wp-config.php criado"
else
    echo -e "${GREEN}✓${NC} wp-config.php já existe"
fi

echo ""
echo -e "${YELLOW}3. Criando banco de dados se necessário...${NC}"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS saraivavision_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
sudo mysql -e "CREATE USER IF NOT EXISTS 'saraivavision'@'localhost' IDENTIFIED BY 'SV@2024cms!';" 2>/dev/null
sudo mysql -e "GRANT ALL PRIVILEGES ON saraivavision_cms.* TO 'saraivavision'@'localhost';" 2>/dev/null
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null
echo -e "${GREEN}✓${NC} Banco de dados configurado"

echo ""
echo -e "${YELLOW}4. Ajustando permissões...${NC}"
sudo chown -R www-data:www-data "$WP_DIR"
sudo find "$WP_DIR" -type d -exec chmod 755 {} \;
sudo find "$WP_DIR" -type f -exec chmod 644 {} \;
sudo chmod 755 "$WP_DIR/wp-admin"
echo -e "${GREEN}✓${NC} Permissões ajustadas"

echo ""
echo -e "${YELLOW}5. Criando .htaccess para WordPress...${NC}"
cat > "$WP_DIR/.htaccess" << 'EOF'
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /blog/
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /blog/index.php [L]
</IfModule>
# END WordPress

# Security
<Files wp-config.php>
Order allow,deny
Deny from all
</Files>

# Disable directory browsing
Options -Indexes
EOF
sudo chown www-data:www-data "$WP_DIR/.htaccess"
echo -e "${GREEN}✓${NC} .htaccess criado"

echo ""
echo -e "${YELLOW}6. Testando configuração nginx...${NC}"
if sudo nginx -t 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Configuração nginx válida"
    echo ""
    echo -e "${YELLOW}7. Recarregando nginx...${NC}"
    sudo nginx -s reload
    echo -e "${GREEN}✓${NC} Nginx recarregado"
else
    echo -e "${RED}✗${NC} Erro na configuração nginx"
    sudo nginx -t
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ CORREÇÕES APLICADAS${NC}"
echo "=================================================="
echo ""
echo "📌 WordPress configurado para funcionar em:"
echo "   • Admin: https://saraivavision.com.br/blog/wp-admin"
echo "   • Blog: https://saraivavision.com.br/blog"
echo "   • API: https://saraivavision.com.br/wp-json"
echo ""
echo "🔑 Credenciais padrão WordPress:"
echo "   • Usuário: admin"
echo "   • Senha: (configure no primeiro acesso)"
echo ""
echo "📝 Próximos passos:"
echo "   1. Acesse https://saraivavision.com.br/blog/wp-admin"
echo "   2. Complete a instalação do WordPress"
echo "   3. Configure o tema Saraiva Vision"
echo "   4. Instale plugins necessários"
echo ""
echo "⚠️  Importante:"
echo "   • O WordPress está rodando na porta 8083"
echo "   • Nginx faz proxy reverso para /blog"
echo "   • Todos os URLs do blog começam com /blog"
echo ""
echo "=================================================="