#!/bin/bash

echo "=================================================="
echo "🔧 CORRIGINDO CONFIGURAÇÃO DO WORDPRESS CMS"
echo "=================================================="
echo ""

# 1. Atualizar wp-config.php para URLs dinâmicas
echo "1. Atualizando wp-config.php..."
sudo cat > /var/www/cms.saraivavision.local/wp-config-dynamic.php << 'EOF'
<?php
/**
 * The base configuration for WordPress - Dynamic URLs
 */

// ** Database settings ** //
define( 'DB_NAME', 'wordpress_saraivavision' );
define( 'DB_USER', 'wordpress_user' );
define( 'DB_PASSWORD', 'SaraivaBlog2024!' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 */
define('AUTH_KEY',         '(SzK{K7wPH]>.<h18KMAJ9+%?[Mhh?xoogB>^r<k_<PPcgNYKl %mrX2LjS=TO0U');
define('SECURE_AUTH_KEY',  '8</+J,}~7390a;T;^ @yvkTdY)k5.0g~wfNobr7s5_A$sG*ai1g1>nQxiDKQOdc~');
define('LOGGED_IN_KEY',    'M?J#-60 Z{Zx}gV!+PJMNpBX[nl9f-u;G$6w|0kamQ-tPAmdVj7sC23gN4rpns99');
define('NONCE_KEY',        '_hgu/n_1{_2K|yNp]k3&-Akh]TU%.p~g3Lrm+i|+Dqp9NyP^}wj{KHByS@sZ3&xb');
define('AUTH_SALT',        ')rh.rwRhC!%B-446y18VvQvPY~xdDna^oAJh01I~W:pH8K};FM>}1^7 A-^d,Zk)');
define('SECURE_AUTH_SALT', 'lDBKR+&a7DDD+J LH$x/Z(UKN>JF([rNjbkdp^@WG{vo4|Hyg$m-d:^SD/-|>*Ko');
define('LOGGED_IN_SALT',   'A2DbKGLJ$PA&B94`%J!2&ooio^3T!OU^>cz4}mk*&2z>2$hwl_#m~L#AZ4(bH2s~');
define('NONCE_SALT',       '5m<smm?`Xk=8@0L4{(3>KK I0NC4u7UD$`-|EG)mVo`z+`:>2NI):TFW[F7q,lb[');

/**#@-*/

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

# 2. Backup e substituir wp-config
echo ""
echo "2. Fazendo backup e substituindo wp-config.php..."
sudo cp /var/www/cms.saraivavision.local/wp-config.php /var/www/cms.saraivavision.local/wp-config.php.old
sudo mv /var/www/cms.saraivavision.local/wp-config-dynamic.php /var/www/cms.saraivavision.local/wp-config.php
sudo chown www-data:www-data /var/www/cms.saraivavision.local/wp-config.php
sudo chmod 640 /var/www/cms.saraivavision.local/wp-config.php

# 3. Atualizar .htaccess
echo ""
echo "3. Atualizando .htaccess..."
sudo cat > /var/www/cms.saraivavision.local/.htaccess << 'EOF'
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

# 4. Limpar cache do WordPress
echo ""
echo "4. Limpando cache..."
sudo rm -rf /var/www/cms.saraivavision.local/wp-content/cache/* 2>/dev/null

# 5. Recarregar serviços
echo ""
echo "5. Recarregando serviços..."
sudo nginx -t && sudo nginx -s reload
sudo systemctl reload php8.3-fpm

echo ""
echo "=================================================="
echo "✅ CONFIGURAÇÃO CORRIGIDA!"
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
echo "   • Senha: (a mesma configurada anteriormente)"
echo ""