#!/bin/bash

# WordPress Blog Installation Script for Saraiva Vision
# This script installs and configures WordPress headless blog with Nginx and PHP-FPM

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
DOMAIN="blog.saraivavision.com.br"
WP_PATH="/var/www/blog.saraivavision.com.br"
DB_NAME="saraiva_blog"
DB_USER="wp_blog_user"
NGINX_CONF="/etc/nginx/sites-available/saraiva-wordpress-blog"
PHP_POOL_CONF="/etc/php/8.1/fpm/pool.d/wordpress-blog.conf"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

print_status "🚀 Starting WordPress Blog installation for Saraiva Vision"

# Update system packages
print_status "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "📦 Installing required packages..."
apt install -y nginx php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-intl \
    php8.1-mbstring php8.1-soap php8.1-xml php8.1-xmlrpc php8.1-zip \
    php8.1-imagick php8.1-cli php8.1-common php8.1-opcache \
    mysql-server mysql-client curl unzip wget

# Install WP-CLI
if ! command_exists wp; then
    print_status "📦 Installing WP-CLI..."
    curl -O https://raw.githubusercontent.com/wp-cli/wp-cli/master/phar/wp-cli.phar
    chmod +x wp-cli.phar
    mv wp-cli.phar /usr/local/bin/wp
fi

# Generate passwords
DB_PASSWORD=$(generate_password)
WP_ADMIN_PASSWORD=$(generate_password)

print_status "🔐 Generated secure passwords for database and WordPress admin"

# Configure MySQL
print_status "🗄️ Configuring MySQL database..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Create WordPress directory
print_status "📁 Creating WordPress directory..."
mkdir -p "$WP_PATH"
cd "$WP_PATH"

# Download WordPress
print_status "⬇️ Downloading WordPress..."
wp core download --allow-root

# Create wp-config.php
print_status "⚙️ Configuring WordPress..."
wp config create \
    --dbname="$DB_NAME" \
    --dbuser="$DB_USER" \
    --dbpass="$DB_PASSWORD" \
    --dbhost="localhost" \
    --dbcharset="utf8mb4" \
    --dbcollate="utf8mb4_unicode_ci" \
    --allow-root

# Add security keys
wp config shuffle-salts --allow-root

# Install WordPress
print_status "🏗️ Installing WordPress..."
wp core install \
    --url="https://$DOMAIN" \
    --title="Blog Saraiva Vision" \
    --admin_user="admin" \
    --admin_password="$WP_ADMIN_PASSWORD" \
    --admin_email="admin@saraivavision.com.br" \
    --allow-root

# Configure WordPress for headless mode
print_status "🔧 Configuring WordPress for headless mode..."

# Add custom configuration to wp-config.php
cat >> wp-config.php << 'EOF'

/* Custom configurations for headless WordPress */
define('WP_POST_REVISIONS', 5);
define('AUTOSAVE_INTERVAL', 300);
define('WP_MEMORY_LIMIT', '512M');
define('DISABLE_WP_CRON', true);

/* Security configurations */
define('DISALLOW_FILE_EDIT', true);
define('WP_AUTO_UPDATE_CORE', true);

/* API configurations */
define('REST_API_ENABLED', true);
EOF

# Install essential plugins
print_status "🔌 Installing essential plugins..."
wp plugin install yoast-seo --activate --allow-root
wp plugin install wordfence --activate --allow-root
wp plugin install w3-total-cache --activate --allow-root
wp plugin install wp-super-cache --allow-root
wp plugin install redirection --activate --allow-root

# Remove default plugins and themes (keep one theme for admin)
wp plugin delete akismet hello --allow-root
wp theme delete twentytwenty twentytwentyone --allow-root

# Set correct file permissions
print_status "🔒 Setting file permissions..."
chown -R www-data:www-data "$WP_PATH"
find "$WP_PATH" -type d -exec chmod 755 {} \;
find "$WP_PATH" -type f -exec chmod 644 {} \;
chmod 600 "$WP_PATH/wp-config.php"

# Configure PHP-FPM pool
print_status "🐘 Configuring PHP-FPM..."
cp /home/saraiva-vision-site/docs/php-fpm-wordpress.conf "$PHP_POOL_CONF"

# Create log directories
mkdir -p /var/log/php
chown www-data:www-data /var/log/php

# Restart PHP-FPM
systemctl restart php8.1-fpm
systemctl enable php8.1-fpm

# Configure Nginx
print_status "🌐 Configuring Nginx..."
cp /home/saraiva-vision-site/docs/nginx-wordpress-blog.conf "$NGINX_CONF"

# Create cache directory
mkdir -p /var/cache/nginx/blog
chown www-data:www-data /var/cache/nginx/blog

# Enable site
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Install Let's Encrypt SSL (commented out for initial setup)
# print_status "🔐 Installing SSL certificate..."
# apt install -y certbot python3-certbot-nginx
# certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@saraivavision.com.br

# Create WordPress cron job
print_status "⏰ Setting up WordPress cron..."
(crontab -l 2>/dev/null; echo "*/15 * * * * cd $WP_PATH && wp cron event run --due-now --allow-root >/dev/null 2>&1") | crontab -

# Create custom CFM compliance plugin
print_status "🏥 Installing CFM compliance plugin..."
mkdir -p "$WP_PATH/wp-content/plugins/cfm-compliance"

cat > "$WP_PATH/wp-content/plugins/cfm-compliance/cfm-compliance.php" << 'EOF'
<?php
/**
 * Plugin Name: CFM Compliance
 * Description: Ensures compliance with Brazilian Medical Council (CFM) regulations
 * Version: 1.0.0
 * Author: Saraiva Vision
 */

if (!defined('ABSPATH')) {
    exit;
}

class CFM_Compliance {

    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('save_post', array($this, 'validate_post_compliance'));
        add_filter('the_content', array($this, 'add_medical_disclaimer'));
        add_action('admin_notices', array($this, 'compliance_notices'));
    }

    public function init() {
        // Register custom post meta for CFM compliance
        register_meta('post', 'cfm_compliance_checked', array(
            'type' => 'boolean',
            'single' => true,
            'show_in_rest' => true,
        ));
    }

    public function validate_post_compliance($post_id) {
        if (wp_is_post_revision($post_id)) {
            return;
        }

        $post = get_post($post_id);
        $content = $post->post_content;

        $violations = array();

        // Check for medical disclaimer
        if (!$this->has_medical_disclaimer($content)) {
            $violations[] = 'Disclaimer médico obrigatório ausente';
        }

        // Check for potential patient data exposure
        if ($this->contains_patient_data($content)) {
            $violations[] = 'Possível exposição de dados de pacientes';
        }

        // Check for unauthorized medical advice
        if ($this->contains_unauthorized_advice($content)) {
            $violations[] = 'Possível conselho médico não autorizado';
        }

        if (!empty($violations)) {
            update_post_meta($post_id, 'cfm_compliance_violations', $violations);
            update_post_meta($post_id, 'cfm_compliance_checked', false);
        } else {
            delete_post_meta($post_id, 'cfm_compliance_violations');
            update_post_meta($post_id, 'cfm_compliance_checked', true);
        }
    }

    private function has_medical_disclaimer($content) {
        $required_phrases = array(
            'não substitui consulta médica',
            'procure orientação médica',
            'consulte um médico'
        );

        foreach ($required_phrases as $phrase) {
            if (stripos($content, $phrase) !== false) {
                return true;
            }
        }

        return false;
    }

    private function contains_patient_data($content) {
        // Simple check for potential patient identifiers
        $patterns = array(
            '/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/', // CPF pattern
            '/paciente\s+[A-Z][a-z]+\s+[A-Z][a-z]+/', // Patient name pattern
        );

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }

        return false;
    }

    private function contains_unauthorized_advice($content) {
        $warning_phrases = array(
            'recomendo que',
            'você deve tomar',
            'o tratamento é',
            'a dose correta é'
        );

        foreach ($warning_phrases as $phrase) {
            if (stripos($content, $phrase) !== false) {
                return true;
            }
        }

        return false;
    }

    public function add_medical_disclaimer($content) {
        if (is_single() && get_post_type() === 'post') {
            $disclaimer = '<div class="medical-disclaimer" style="background: #f0f8ff; padding: 15px; margin: 20px 0; border-left: 4px solid #0073aa; font-size: 14px; line-height: 1.6;">';
            $disclaimer .= '<strong>⚕️ Aviso Médico:</strong> Este conteúdo tem caráter informativo e não substitui consulta médica. ';
            $disclaimer .= 'Para diagnóstico e tratamento, procure sempre orientação médica qualificada. ';
            $disclaimer .= 'Em caso de emergência, procure atendimento médico imediato.<br>';
            $disclaimer .= '<small>📋 <strong>CRM Responsável:</strong> Dr. Philipe Saraiva Cruz - CRM-MG 69.870</small>';
            $disclaimer .= '</div>';

            $content .= $disclaimer;
        }

        return $content;
    }

    public function compliance_notices() {
        global $post;

        if (isset($post) && get_post_meta($post->ID, 'cfm_compliance_checked', true) === false) {
            $violations = get_post_meta($post->ID, 'cfm_compliance_violations', true);
            if (!empty($violations)) {
                echo '<div class="notice notice-error"><p><strong>⚠️ Violações CFM detectadas:</strong> ' . implode(', ', $violations) . '</p></div>';
            }
        }
    }
}

new CFM_Compliance();
EOF

# Activate CFM plugin
wp plugin activate cfm-compliance --allow-root

# Create sample medical content
print_status "📝 Creating sample medical content..."
wp post create \
    --post_type=post \
    --post_title="A Importância dos Exames Oftalmológicos Regulares" \
    --post_content="Os exames oftalmológicos regulares são fundamentais para manter a saúde ocular e detectar precocemente possíveis problemas de visão. Durante uma consulta oftalmológica completa, diversos aspectos da saúde ocular são avaliados... Este conteúdo tem caráter informativo e não substitui consulta médica. Procure sempre orientação médica qualificada." \
    --post_status=publish \
    --post_category=1 \
    --allow-root

# Performance optimizations
print_status "⚡ Applying performance optimizations..."

# Configure OPcache
cat >> /etc/php/8.1/fpm/conf.d/99-opcache.ini << 'EOF'
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
opcache.validate_timestamps=1
EOF

# Restart services
systemctl restart php8.1-fpm
systemctl restart nginx

# Health check
print_status "🔍 Running health checks..."
sleep 5

if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "✅ Health check passed"
else
    print_warning "⚠️ Health check failed - please verify configuration"
fi

# Create credentials file
cat > "/root/wordpress-credentials.txt" << EOF
WordPress Blog Credentials - Saraiva Vision
==========================================

🌐 Domain: https://$DOMAIN
📁 WordPress Path: $WP_PATH

🗄️ Database:
- Database: $DB_NAME
- User: $DB_USER
- Password: $DB_PASSWORD

👤 WordPress Admin:
- Username: admin
- Password: $WP_ADMIN_PASSWORD
- URL: https://$DOMAIN/wp-admin

🔗 API Endpoints:
- Posts: https://$DOMAIN/wp-json/wp/v2/posts
- Categories: https://$DOMAIN/wp-json/wp/v2/categories
- Health: https://$DOMAIN/health

⚙️ Configuration Files:
- Nginx: $NGINX_CONF
- PHP-FPM: $PHP_POOL_CONF
- WordPress: $WP_PATH/wp-config.php

📊 Monitoring:
- PHP-FPM Status: http://127.0.0.1:9001/status
- Nginx Logs: /var/log/nginx/blog_saraiva_*.log
- PHP Logs: /var/log/php8.1-fpm-wordpress-*.log

🔒 Next Steps:
1. Configure SSL with Let's Encrypt: certbot --nginx -d $DOMAIN
2. Update DNS to point $DOMAIN to this server
3. Test API endpoints with frontend integration
4. Configure monitoring and backups

EOF

chmod 600 "/root/wordpress-credentials.txt"

print_success "🎉 WordPress blog installation completed successfully!"
print_success "📋 Credentials saved to: /root/wordpress-credentials.txt"
print_warning "🔒 Remember to configure SSL certificate before going live"
print_warning "🌐 Update DNS records to point $DOMAIN to this server"

# Display summary
echo ""
echo "================================================"
echo "🏥 WORDPRESS BLOG - SARAIVA VISION"
echo "================================================"
echo "✅ Nginx + PHP-FPM configured"
echo "✅ WordPress installed and configured"
echo "✅ CFM compliance plugin installed"
echo "✅ Essential SEO plugins installed"
echo "✅ Security configurations applied"
echo "✅ Performance optimizations enabled"
echo ""
echo "🔗 Test the API:"
echo "curl https://$DOMAIN/wp-json/wp/v2/posts"
echo ""
echo "📋 Admin credentials are in /root/wordpress-credentials.txt"
echo "================================================"