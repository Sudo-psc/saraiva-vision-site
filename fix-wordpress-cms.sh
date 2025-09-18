#!/bin/bash

echo "=================================================="
echo "🔧 CORRIGINDO CONFIGURAÇÃO DO WORDPRESS CMS"
echo "=================================================="
echo ""

# 1. Atualizar wp-config.php para URLs dinâmicas
echo "1. Gerando chaves de autenticação seguras..."
# Generate secure random salts using openssl
generate_salt() {
    local salt_length=64
    local salt=$(openssl rand -hex "$salt_length" | tr -d '\n')
    if [ $? -ne 0 ] || [ -z "$salt" ]; then
        echo "❌ ERRO: Falha ao gerar salt com openssl" >&2
        exit 1
    fi
    echo "$salt"
}

# Generate all required salts
echo "   • Gerando AUTH_KEY..."
AUTH_KEY=$(generate_salt)
echo "   • Gerando SECURE_AUTH_KEY..."
SECURE_AUTH_KEY=$(generate_salt)
echo "   • Gerando LOGGED_IN_KEY..."
LOGGED_IN_KEY=$(generate_salt)
echo "   • Gerando NONCE_KEY..."
NONCE_KEY=$(generate_salt)
echo "   • Gerando AUTH_SALT..."
AUTH_SALT=$(generate_salt)
echo "   • Gerando SECURE_AUTH_SALT..."
SECURE_AUTH_SALT=$(generate_salt)
echo "   • Gerando LOGGED_IN_SALT..."
LOGGED_IN_SALT=$(generate_salt)
echo "   • Gerando NONCE_SALT..."
NONCE_SALT=$(generate_salt)

echo "   ✅ Chaves geradas com sucesso!"

echo "2. Criando wp-config.php com chaves seguras..."

# --- Credential Handling ---
# Prioritize environment variables, then prompt securely if not set.
# For production, consider using a secret manager.
# For local development, you can create a .env file in the project root:
# DB_NAME="your_db_name"
# DB_USER="your_db_user"
# DB_PASSWORD="your_db_password"
# DB_HOST="your_db_host"
# And restrict its permissions: chmod 600 .env

# Load .env file if it exists
if [ -f ".env" ]; then
    echo "   • Carregando variáveis de ambiente do arquivo .env"
    set -a
    . ./.env
    set +a
fi

# Set defaults or prompt for missing credentials
DB_NAME="${DB_NAME:-wordpress_saraivavision}"
DB_USER="${DB_USER:-wordpress_user}"
DB_HOST="${DB_HOST:-localhost}"

if [ -z "${DB_PASSWORD}" ]; then
    echo "   • DB_PASSWORD não definida. Solicitando senha do banco de dados..."
    read -sp '     Senha do Banco de Dados: ' DB_PASSWORD_INPUT
    echo
    DB_PASSWORD="${DB_PASSWORD_INPUT}"
    if [ -z "${DB_PASSWORD}" ]; then
        echo "❌ ERRO: Senha do Banco de Dados é obrigatória." >&2
        exit 1
    fi
fi

# Validate all required credentials are set
if [ -z "${DB_NAME}" ] || [ -z "${DB_USER}" ] || [ -z "${DB_PASSWORD}" ] || [ -z "${DB_HOST}" ]; then
    echo "❌ ERRO: As variáveis de ambiente DB_NAME, DB_USER, DB_PASSWORD e DB_HOST devem ser definidas." >&2
    exit 1
fi
# --- End Credential Handling ---

# Create temporary file first
TEMP_CONFIG="/tmp/wp-config-dynamic-$$.$RANDOM.php"
sudo tee "$TEMP_CONFIG" > /dev/null << EOF
<?php
/**
 * The base configuration for WordPress - Dynamic URLs
 */

// ** Database settings - from environment variables ** //
define( 'DB_NAME', '${DB_NAME}' );
define( 'DB_USER', '${DB_USER}' );
define( 'DB_PASSWORD', '${DB_PASSWORD}' );
define( 'DB_HOST', '${DB_HOST}' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 * Generated securely using openssl rand -hex 64
 */
EOF

# Append the generated salts to the temporary file
sudo tee -a "$TEMP_CONFIG" > /dev/null << SALT_EOF
define('AUTH_KEY',         '$AUTH_KEY');
define('SECURE_AUTH_KEY',  '$SECURE_AUTH_KEY');
define('LOGGED_IN_KEY',    '$LOGGED_IN_KEY');
define('NONCE_KEY',        '$NONCE_KEY');
define('AUTH_SALT',        '$AUTH_SALT');
define('SECURE_AUTH_SALT', '$SECURE_AUTH_SALT');
define('LOGGED_IN_SALT',   '$LOGGED_IN_SALT');
define('NONCE_SALT',       '$NONCE_SALT');

/**#@-*/
SALT_EOF

# Continue with the rest of the config
sudo tee -a "$TEMP_CONFIG" > /dev/null << EOF

/**
 * WordPress database table prefix.
 */
$table_prefix = 'wp_';

/**
 * WordPress debugging mode.
 */
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

/* Dynamic URL configuration */
// Fixed URLs for proxy setup
define('WP_HOME', 'https://saraivavision.com.br/blog');
define('WP_SITEURL', 'https://saraivavision.com.br/blog');

// Allow multisite
define('WP_ALLOW_MULTISITE', false);

// SSL handling
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

// Fix for proxy headers
if (isset($_SERVER['HTTP_X_FORWARDED_HOST'])) {
    $_SERVER['HTTP_HOST'] = $_SERVER['HTTP_X_FORWARDED_HOST'];
}

// WordPress Cookie settings for subdirectory
define('COOKIE_DOMAIN', '.saraivavision.com.br');
define('COOKIEPATH', '/blog/');
define('SITECOOKIEPATH', '/blog/');
define('ADMIN_COOKIE_PATH', '/blog/wp-admin');

// Memory limits
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// Security
define('DISALLOW_FILE_EDIT', true);
define('FORCE_SSL_ADMIN', false);

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
EOF

# 3. Backup e substituir wp-config de forma atômica
echo ""
echo "3. Fazendo backup e substituindo wp-config.php de forma atômica..."
# Create backup
sudo cp /var/www/cms.saraivavision.local/wp-config.php /var/www/cms.saraivavision.local/wp-config.php.old

# Atomic move: temp file to final location with secure permissions
sudo mv "$TEMP_CONFIG" /var/www/cms.saraivavision.local/wp-config.php
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha ao mover arquivo de configuração" >&2
    exit 1
fi

# Set secure permissions
sudo chown www-data:www-data /var/www/cms.saraivavision.local/wp-config.php
sudo chmod 640 /var/www/cms.saraivavision.local/wp-config.php

echo "   ✅ wp-config.php atualizado com chaves seguras!"

# 4. Atualizar .htaccess
echo ""
echo "4. Atualizando .htaccess..."
cat << 'EOF' | sudo tee /var/www/cms.saraivavision.local/.htaccess > /dev/null
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress

# Security
<Files wp-config.php>
Order allow,deny
Deny from all
</Files>

# Disable directory browsing
Options -Indexes

# Protect .htaccess
<Files .htaccess>
Order allow,deny
Deny from all
</Files>
EOF

sudo chown www-data:www-data /var/www/cms.saraivavision.local/.htaccess

# 5. Limpar cache do WordPress
echo ""
echo "5. Limpando cache..."
sudo rm -rf /var/www/cms.saraivavision.local/wp-content/cache/* 2>/dev/null

# 6. Recarregar serviços
echo ""
echo "6. Recarregando serviços..."
sudo nginx -t && sudo nginx -s reload
sudo systemctl reload php8.3-fpm

echo ""
echo "=================================================="
echo "✅ CONFIGURAÇÃO CORRIGIDA COM SEGURANÇA MELHORADA!"
echo "=================================================="
echo ""
echo "📌 URLs configuradas:"
echo "   • Blog: https://saraivavision.com.br/blog"
echo "   • Admin: https://saraivavision.com.br/blog/wp-admin"
echo "   • API: https://saraivavision.com.br/wp-json"
echo ""
echo "🔑 Credenciais do Admin:"
echo "   • URL: https://saraivavision.com.br/blog/wp-admin"
echo "   • Usuário: admin"
echo '   • Senha: (a mesma configurada anteriormente)'
echo ""
echo '🛡️  Segurança implementada:'
echo '   • Chaves de autenticação geradas com openssl rand -hex 64'
echo '   • Permissões seguras: wp-config.php (640)'
echo '   • Escrita atômica de arquivos de configuração'
echo '   • Backup automático do wp-config.php anterior'
echo ''