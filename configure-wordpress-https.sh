#!/bin/bash

# WordPress HTTPS Configuration Script for SaraivaVision
# Configura WordPress para funcionar com HTTPS

DOMAIN="saraivavision.com.br"
WWW_DOMAIN="www.saraivavision.com.br"

echo "🔐 Configuring WordPress for HTTPS"
echo "=================================="

# Wait for WordPress to be accessible
echo "⏳ Waiting for WordPress to be ready..."
until curl -f -k https://$DOMAIN/wp-admin/install.php > /dev/null 2>&1; do
    echo "Waiting for WordPress..."
    sleep 3
done

echo "✅ WordPress is accessible via HTTPS!"

# Create wp-config.php with HTTPS settings
echo "📝 Creating wp-config.php with HTTPS configuration..."

# Check if wp-config.php already exists
if docker exec saraiva-wordpress test -f /var/www/html/wp-config.php; then
    echo "📋 wp-config.php already exists, updating for HTTPS..."

    # Backup existing config
    docker exec saraiva-wordpress cp /var/www/html/wp-config.php /var/www/html/wp-config.php.backup

    # Add HTTPS settings to existing config
    docker exec saraiva-wordpress sh -c "
        sed -i '/define.*WP_HOME/d' /var/www/html/wp-config.php
        sed -i '/define.*WP_SITEURL/d' /var/www/html/wp-config.php
        sed -i '/define.*FORCE_SSL_ADMIN/d' /var/www/html/wp-config.php
        sed -i '/HTTPS detection/d' /var/www/html/wp-config.php

        echo 'define(\"WP_HOME\", \"https://$DOMAIN\");' >> /var/www/html/wp-config.php
        echo 'define(\"WP_SITEURL\", \"https://$DOMAIN\");' >> /var/www/html/wp-config.php
        echo 'define(\"FORCE_SSL_ADMIN\", true);' >> /var/www/html/wp-config.php
        echo '' >> /var/www/html/wp-config.php
        echo '// HTTPS detection for Cloudflare' >> /var/www/html/wp-config.php
        echo 'if (\$_SERVER[\"HTTP_X_FORWARDED_PROTO\"] == \"https\") {' >> /var/www/html/wp-config.php
        echo '    \$_SERVER[\"HTTPS\"] = \"on\";' >> /var/www/html/wp-config.php
        echo '}' >> /var/www/html/wp-config.php
    "
else
    echo "🆕 Creating new wp-config.php with HTTPS settings..."

    # Create new wp-config.php with HTTPS settings
    docker exec saraiva-wordpress sh -c "
        cat > /var/www/html/wp-config.php << 'EOF'
<?php
// HTTPS Configuration
define('WP_HOME', 'https://$DOMAIN');
define('WP_SITEURL', 'https://$DOMAIN');
define('FORCE_SSL_ADMIN', true);

// HTTPS detection for Cloudflare
if (\$_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') {
    \$_SERVER['HTTPS'] = 'on';
}

// Database settings
define('DB_NAME', 'wordpress');
define('DB_USER', 'wordpress');
define('DB_PASSWORD', 'wordpress');
define('DB_HOST', 'db:3306');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// WordPress database table prefix
\$table_prefix = 'wp_';

// WordPress unique keys and salts
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');

// WordPress debugging mode
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

// Disable file editing
define('DISALLOW_FILE_EDIT', true);

// Disable automatic updates
define('WP_AUTO_UPDATE_CORE', false);

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
EOF
    "
fi

echo "✅ wp-config.php configured for HTTPS!"

# Set proper file permissions
echo "🔐 Setting file permissions..."
docker exec saraiva-wordpress chown www-data:www-data /var/www/html/wp-config.php
docker exec saraiva-wordpress chmod 644 /var/www/html/wp-config.php

# Create .htaccess for HTTPS redirects
echo "📝 Creating .htaccess for HTTPS redirects..."
docker exec saraiva-wordpress sh -c "
    cat > /var/www/html/.htaccess << 'EOF'
# HTTPS redirects
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# WordPress
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
EOF
"

docker exec saraiva-wordpress chown www-data:www-data /var/www/html/.htaccess
docker exec saraiva-wordpress chmod 644 /var/www/html/.htaccess

echo "✅ .htaccess configured for HTTPS!"

# Test WordPress HTTPS access
echo "🧪 Testing WordPress HTTPS access..."
if curl -k -I https://$DOMAIN/ | grep -q "200 OK\|302 Found"; then
    echo "✅ WordPress home page is accessible via HTTPS!"
else
    echo "❌ WordPress home page test failed"
fi

if curl -k -I https://$DOMAIN/wp-admin/ | grep -q "200 OK\|302 Found"; then
    echo "✅ WordPress admin is accessible via HTTPS!"
else
    echo "❌ WordPress admin test failed"
fi

echo ""
echo "🎉 WordPress HTTPS configuration completed!"
echo ""
echo "WordPress is now configured for HTTPS:"
echo "  - Home URL: https://$DOMAIN"
echo "  - Site URL: https://$DOMAIN"
echo "  - Admin: https://$DOMAIN/wp-admin/"
echo ""
echo "Next steps:"
echo "1. Complete WordPress installation at: https://$DOMAIN/wp-admin/install.php"
echo "2. Use credentials: admin / admin123"
echo "3. Install required plugins and themes"
echo "4. Set up permalinks and SEO settings"
echo ""
echo "SSL certificate will auto-renew every 90 days."