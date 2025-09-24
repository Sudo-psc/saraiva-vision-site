#!/bin/bash

# VPS WordPress Setup Script for Saraiva Vision
# This script configures WordPress for VPS deployment with GraphQL

set -e

# Configuration
VPS_IP="31.97.129.78"
DOMAIN="saraivavision.com.br"
WORDPRESS_PORT="8080"
GRAVITY_PORT="8081"

echo "🚀 Setting up WordPress for VPS deployment..."
echo "VPS IP: $VPS_IP"
echo "Domain: $DOMAIN"
echo "WordPress Port: $WORDPRESS_PORT"
echo "GraphQL Port: $GRAVITY_PORT"

# Create required directories
echo "📁 Creating WordPress directories..."
mkdir -p wordpress/uploads
mkdir -p wordpress/plugins
mkdir -p wordpress/themes
mkdir -p wordpress/wp-content
mkdir -p logs/wordpress
mkdir -p nginx/sites-available
mkdir -p nginx/sites-enabled

# Create WordPress environment file
echo "⚙️ Creating WordPress environment configuration..."
cat > vps-wordpress/.env << EOF
# WordPress Configuration
WORDPRESS_DB_HOST=mysql
WORDPRESS_DB_USER=${MYSQL_USER:-saraiva_wp_user}
WORDPRESS_DB_PASSWORD=${MYSQL_PASSWORD:-saraiva_wp_password_2024}
WORDPRESS_DB_NAME=${MYSQL_DATABASE:-saraiva_wordpress}
WORDPRESS_TABLE_PREFIX=wp_

# WordPress URLs
WORDPRESS_URL=https://$DOMAIN
WP_HOME=https://$DOMAIN
WP_SITEURL=https://$DOMAIN

# WordPress Configuration
WP_DEBUG=false
WP_DEBUG_LOG=true
WP_DEBUG_DISPLAY=false
WP_MEMORY_LIMIT=512M
WP_MAX_MEMORY_LIMIT=512M
FORCE_SSL_ADMIN=true

# Security Keys
AUTH_KEY=$(openssl rand -base64 64)
SECURE_AUTH_KEY=$(openssl rand -base64 64)
LOGGED_IN_KEY=$(openssl rand -base64 64)
NONCE_KEY=$(openssl rand -base64 64)
AUTH_SALT=$(openssl rand -base64 64)
SECURE_AUTH_SALT=$(openssl rand -base64 64)
LOGGED_IN_SALT=$(openssl rand -base64 64)
NONCE_SALT=$(openssl rand -base64 64)

# GraphQL Configuration
GRAPHQL_DEBUG=false
GRAPHQL_CORS_ENABLED=true
GRAPHQL_CORS_ALLOW_ORIGIN=*
GRAPHQL_RATE_LIMITING_ENABLED=true
GRAPHQL_RATE_LIMITING_REQUESTS_PER_MINUTE=60
EOF

# Create WordPress Dockerfile with WPGraphQL
echo "🐳 Creating WordPress Dockerfile..."
cat > vps-wordpress/Dockerfile << EOF
FROM wordpress:6.4-php8.2-apache

# Install required PHP extensions and dependencies
RUN apt-get update && apt-get install -y \\
    libpng-dev \\
    libzip-dev \\
    zip \\
    unzip \\
    curl \\
    mysql-client \\
    vim \\
    git \\
    supervisor \\
    && docker-php-ext-install gd mysqli pdo pdo_mysql zip \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Install WPGraphQL and required plugins
RUN curl -O https://raw.githubusercontent.com/wp-graphql/wp-graphql/master/releases/latest/download/wp-graphql.zip \\
    && unzip wp-graphql.zip -d /tmp \\
    && mv /tmp/wp-graphql /usr/src/wordpress/wp-content/plugins/ \\
    && rm wp-graphql.zip

# Install WPGraphQL for WooCommerce (if needed)
RUN curl -O https://raw.githubusercontent.com/wp-graphql/wp-graphql-woocommerce/master/releases/latest/download/wp-graphql-woocommerce.zip \\
    && unzip wp-graphql-woocommerce.zip -d /tmp \\
    && mv /tmp/wp-graphql-woocommerce /usr/src/wordpress/wp-content/plugins/ \\
    && rm wp-graphql-woocommerce.zip

# Install advanced custom fields and WPGraphQL for ACF
RUN curl -O https://downloads.wordpress.org/plugin/advanced-custom-fields.6.2.1.zip \\
    && unzip advanced-custom-fields.6.2.1.zip -d /tmp \\
    && mv /tmp/advanced-custom-fields /usr/src/wordpress/wp-content/plugins/ \\
    && rm advanced-custom-fields.6.2.1.zip

RUN curl -O https://downloads.wordpress.org/plugin/wp-graphql-acf.1.1.2.zip \\
    && unzip wp-graphql-acf.1.1.2.zip -d /tmp \\
    && mv /tmp/wp-graphql-acf /usr/src/wordpress/wp-content/plugins/ \\
    && rm wp-graphql-acf.1.1.2.zip

# Install WordPress SEO and related plugins
RUN curl -O https://downloads.wordpress.org/plugin/wordpress-seo.21.6.zip \\
    && unzip wordpress-seo.21.6.zip -d /tmp \\
    && mv /tmp/wordpress-seo /usr/src/wordpress/wp-content/plugins/ \\
    && rm wordpress-seo.21.6.zip

# Create wp-config.php with custom configuration
COPY wp-config.php /usr/src/wordpress/

# Set proper permissions
RUN chown -R www-data:www-data /usr/src/wordpress \\
    && find /usr/src/wordpress -type d -exec chmod 755 {} \\; \\
    && find /usr/src/wordpress -type f -exec chmod 644 {} \\;

# Create WordPress configuration directory
RUN mkdir -p /usr/src/wordpress/wp-content/uploads \\
    && chown -R www-data:www-data /usr/src/wordpress/wp-content/uploads

# Health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \\
    CMD curl -f http://localhost/wp-json/wp/v2/ || exit 1
EOF

# Create custom wp-config.php
echo "📝 Creating WordPress configuration..."
cat > vps-wordpress/wp-config.php << EOF
<?php
// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', getenv('WORDPRESS_DB_NAME') ?: 'saraiva_wordpress');

/** Database username */
define('DB_USER', getenv('WORDPRESS_DB_USER') ?: 'saraiva_wp_user');

/** Database password */
define('DB_PASSWORD', getenv('WORDPRESS_DB_PASSWORD') ?: 'saraiva_wp_password_2024');

/** Database hostname */
define('DB_HOST', getenv('WORDPRESS_DB_HOST') ?: 'mysql');

/** Database charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The database collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 */
define('AUTH_KEY', getenv('AUTH_KEY') ?: 'put your unique phrase here');
define('SECURE_AUTH_KEY', getenv('SECURE_AUTH_KEY') ?: 'put your unique phrase here');
define('LOGGED_IN_KEY', getenv('LOGGED_IN_KEY') ?: 'put your unique phrase here');
define('NONCE_KEY', getenv('NONCE_KEY') ?: 'put your unique phrase here');
define('AUTH_SALT', getenv('AUTH_SALT') ?: 'put your unique phrase here');
define('SECURE_AUTH_SALT', getenv('SECURE_AUTH_SALT') ?: 'put your unique phrase here');
define('LOGGED_IN_SALT', getenv('LOGGED_IN_SALT') ?: 'put your unique phrase here');
define('NONCE_SALT', getenv('NONCE_SALT') ?: 'put your unique phrase here');

/**#@-*/

/** WordPress Database Table prefix. */
\$table_prefix = getenv('WORDPRESS_TABLE_PREFIX') ?: 'wp_';

/** WordPress debug mode. */
define('WP_DEBUG', getenv('WP_DEBUG') ?: false);
define('WP_DEBUG_LOG', getenv('WP_DEBUG_LOG') ?: true);
define('WP_DEBUG_DISPLAY', getenv('WP_DEBUG_DISPLAY') ?: false);
define('WP_MEMORY_LIMIT', getenv('WP_MEMORY_LIMIT') ?: '512M');
define('FORCE_SSL_ADMIN', getenv('FORCE_SSL_ADMIN') ?: true);

/** WordPress URLs */
define('WP_HOME', getenv('WP_HOME') ?: 'https://saraivavision.com.br');
define('WP_SITEURL', getenv('WP_SITEURL') ?: 'https://saraivavision.com.br');

/** GraphQL Configuration */
define('GRAPHQL_DEBUG', getenv('GRAPHQL_DEBUG') ?: false);
define('GRAPHQL_CORS_ENABLED', getenv('GRAPHQL_CORS_ENABLED') ?: true);
define('GRAPHQL_CORS_ALLOW_ORIGIN', getenv('GRAPHQL_CORS_ALLOW_ORIGIN') ?: '*');
define('GRAPHQL_RATE_LIMITING_ENABLED', getenv('GRAPHQL_RATE_LIMITING_ENABLED') ?: true);
define('GRAPHQL_RATE_LIMITING_REQUESTS_PER_MINUTE', getenv('GRAPHQL_RATE_LIMITING_REQUESTS_PER_MINUTE') ?: 60);

/** Performance optimizations */
define('WP_CACHE', true);
define('DISABLE_WP_CRON', true);
define('WP_AUTO_UPDATE_CORE', false);
define('AUTOMATIC_UPDATER_DISABLED', true);

/** Security */
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);
define('WP_HTTP_BLOCK_EXTERNAL', false);

/** Custom content directory */
define('WP_CONTENT_DIR', '/var/www/html/wp-content');
define('WP_CONTENT_URL', 'https://' . \$_SERVER['HTTP_HOST'] . '/wp-content');

/** That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined('ABSPATH') ) {
    define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
EOF

# Create Nginx configuration for WordPress GraphQL
echo "🔧 Creating Nginx configuration for WordPress..."
cat > nginx/sites-available/wordpress-gravity.conf << EOF
# WordPress GraphQL (Gravity) Configuration
server {
    listen $GRAVITY_PORT;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CORS headers for GraphQL
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-WP-Nonce" always;

    # WordPress GraphQL endpoint
    location /graphql {
        proxy_pass http://wordpress:80/graphql;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # GraphQL specific settings
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;

        # Security for GraphQL
        if (\$request_method = "OPTIONS") {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-WP-Nonce";
            add_header Access-Control-Max-Age 86400;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # WordPress REST API
    location /wp-json {
        proxy_pass http://wordpress:80/wp-json;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WordPress admin
    location /wp-admin {
        proxy_pass http://wordpress:80/wp-admin;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Security for admin
        auth_basic "WordPress Admin";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    # WordPress uploads
    location /wp-content/uploads {
        proxy_pass http://wordpress:80/wp-content/uploads;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "WordPress GraphQL healthy\\n";
        add_header Content-Type text/plain;
    }

    # Deny access to sensitive files
    location ~* /wp-config.php {
        deny all;
        return 403;
    }

    location ~* /wp-content/.*\.php$ {
        deny all;
        return 403;
    }
}
EOF

# Create WordPress initialization script
echo "📜 Creating WordPress initialization script..."
cat > vps-wordpress/init-wordpress.sh << EOF
#!/bin/bash

# WordPress Initialization Script for VPS

set -e

echo "🚀 Initializing WordPress..."

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL..."
until mysql -h mysql -u \$MYSQL_USER -p\$MYSQL_PASSWORD \$MYSQL_DATABASE -e "SELECT 1"; do
    echo "Waiting for MySQL to be ready..."
    sleep 5
done

# Install WordPress CLI
echo "📥 Installing WP-CLI..."
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
php wp-cli.phar --info
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

# Install WordPress core
echo "🔧 Installing WordPress core..."
wp core install --url=https://saraivavision.com.br --title="Saraiva Vision" --admin_user=saraiva_admin --admin_password=saraiva_admin_2024 --admin_email=admin@saraivavision.com.br --skip-email

# Install and activate required plugins
echo "🔌 Installing plugins..."
wp plugin install wp-graphql --activate
wp plugin install wp-graphql-acf --activate
wp plugin install advanced-custom-fields --activate
wp plugin install wordpress-seo --activate
wp plugin install wp-graphql-rate-limiting --activate
wp plugin install wp-graphql-cors --activate

# Configure permalinks
echo "🔗 Configuring permalinks..."
wp rewrite structure '/%postname%/'
wp rewrite flush

# Configure GraphQL settings
echo "⚙️ Configuring GraphQL..."
wp option update graphql_debug false
wp option update graphql_cors_enabled true
wp option update graphql_cors_allow_origin '*'
wp option update graphql_rate_limiting_enabled true
wp option update graphql_rate_limiting_request_limit 60

# Create basic pages
echo "📄 Creating basic pages..."
wp post create --post_type=page --post_title='Início' --post_content='Bem-vindo à Saraiva Vision' --post_status=publish
wp post create --post_type=page --post_title='Sobre' --post_content='Sobre a Saraiva Vision' --post_status=publish
wp post create --post_type=page --post_title='Contato' --post_content='Entre em contato conosco' --post_status=publish

# Configure WordPress settings
echo "🔧 Configuring WordPress settings..."
wp option update blogdescription 'Clínica Oftalmológica de Excelência'
wp option update default_comment_status 'closed'
wp option update comment_registration '0'
wp option update show_on_front 'page'
wp option update page_on_front 1

# Set up proper permissions
echo "🔐 Setting up permissions..."
chown -R www-data:www-data /var/www/html
find /var/www/html -type d -exec chmod 755 {} \\;
find /var/www/html -type f -exec chmod 644 {} \\;

echo "✅ WordPress initialization complete!"
EOF

# Create WordPress backup script
echo "💾 Creating WordPress backup script..."
cat > vps-wordpress/backup-wordpress.sh << EOF
#!/bin/bash

# WordPress Backup Script for VPS

BACKUP_DIR="/backups/wordpress"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="wordpress_\${DATE}.tar.gz"

# Create backup directory
mkdir -p \$BACKUP_DIR

# Create backup
echo "📦 Creating WordPress backup..."
tar -czf \$BACKUP_DIR/\$BACKUP_FILE \\
    --exclude=wp-content/cache \\
    --exclude=wp-content/uploads/cache \\
    -C /var/www/html .

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "wordpress_*.tar.gz" -mtime +7 -delete

echo "✅ WordPress backup complete: \$BACKUP_DIR/\$BACKUP_FILE"
EOF

# Make scripts executable
chmod +x vps-wordpress/init-wordpress.sh
chmod +x vps-wordpress/backup-wordpress.sh

# Create Docker Compose override for WordPress
echo "🐳 Creating Docker Compose override..."
cat > docker-compose.override.yml << EOF
version: '3.8'

services:
  # WordPress service override
  wordpress:
    build:
      context: ./vps-wordpress
      dockerfile: Dockerfile
    environment:
      - WORDPRESS_DB_HOST=mysql
      - WORDPRESS_DB_USER=\${MYSQL_USER:-saraiva_wp_user}
      - WORDPRESS_DB_PASSWORD=\${MYSQL_PASSWORD:-saraiva_wp_password_2024}
      - WORDPRESS_DB_NAME=\${MYSQL_DATABASE:-saraiva_wordpress}
      - WORDPRESS_CONFIG_EXTRA=
          define('WP_DEBUG', false);
          define('WP_DEBUG_LOG', true);
          define('WP_MEMORY_LIMIT', '512M');
          define('FORCE_SSL_ADMIN', true);
          define('WP_HOME', 'https://saraivavision.com.br');
          define('WP_SITEURL', 'https://saraivavision.com.br');
    volumes:
      - wordpress_data:/var/www/html
      - ./wordpress/uploads:/var/www/html/wp-content/uploads
      - ./vps-wordpress/wp-config.php:/var/www/html/wp-config.php
      - ./logs/wordpress:/var/log/wordpress
    ports:
      - "8080:80"
    depends_on:
      mysql:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/wp-json/wp/v2/"]
      interval: 60s
      timeout: 15s
      retries: 2
      start_period: 120s
    restart: unless-stopped
    networks:
      - saraiva-network

  # GraphQL proxy service
  graphql-proxy:
    image: nginx:1.25-alpine
    container_name: saraiva-graphql-proxy
    ports:
      - "8081:80"
    volumes:
      - ./nginx/sites-available/wordpress-gravity.conf:/etc/nginx/conf.d/default.conf:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      wordpress:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped
    networks:
      - saraiva-network
EOF

# Update main Docker Compose to include WordPress health check
echo "🔧 Updating main Docker Compose configuration..."
sed -i 's/wordpress:/wordpress:/' docker-compose.yml

echo "✅ WordPress VPS setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: docker-compose up -d"
echo "2. Initialize WordPress: docker-compose exec wordpress /bin/bash /init-wordpress.sh"
echo "3. Access WordPress admin: https://saraivavision.com.br/wp-admin"
echo "4. Configure WPGraphQL plugin in WordPress admin"
echo "5. Test GraphQL endpoint: curl http://localhost:8081/graphql"
echo ""
echo "🔗 WordPress URLs:"
echo "- Main site: https://saraivavision.com.br"
echo "- Admin: https://saraivavision.com.br/wp-admin"
echo "- GraphQL: http://localhost:8081/graphql"
echo "- GraphQL health: http://localhost:8081/health"
EOF

chmod +x vps-wordpress-setup.sh
TodoWrite
<arg_key>todos</arg_key>
<arg_value>[{"content": "Configure VPS WordPress endpoint and DNS", "id": "1", "status": "completed", "activeForm": "Configured VPS WordPress endpoint and DNS"}, {"content": "Update WordPress integration for VPS environment", "id": "2", "status": "in_progress", "activeForm": "Updating WordPress integration for VPS environment"}, {"content": "Create VPS-specific health monitoring", "id": "3", "status": "pending", "activeForm": "Creating VPS-specific health monitoring"}, {"content": "Configure Nginx for WordPress GraphQL", "id": "4", "status": "pending", "activeForm": "Configuring Nginx for WordPress GraphQL"}, {"content": "Set up WordPress Docker container", "id": "5", "status": "pending", "activeForm": "Setting up WordPress Docker container"}, {"content": "Test VPS WordPress integration", "id": "6", "status": "pending", "activeForm": "Testing VPS WordPress integration"}]