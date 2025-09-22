#!/bin/bash
# WordPress Installation and Setup Script
# This script runs inside the WordPress container to set up the CMS

set -e

echo "🚀 Starting WordPress installation..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
while ! mysqladmin ping -h"$WORDPRESS_DB_HOST" -P"$WORDPRESS_DB_PORT" -u"$WORDPRESS_DB_USER" -p"$WORDPRESS_DB_PASSWORD" --silent; do
    echo "Database not ready, waiting..."
    sleep 2
done

echo "✅ Database connection established"

# Check if WordPress is already installed
if wp core is-installed --allow-root; then
    echo "ℹ️  WordPress is already installed"
else
    echo "📦 Installing WordPress core..."

    # Install WordPress
    wp core install \
        --url="$WORDPRESS_URL" \
        --title="$WORDPRESS_TITLE" \
        --admin_user="${WORDPRESS_ADMIN_USER:-admin}" \
        --admin_password="${WORDPRESS_ADMIN_PASSWORD:-admin123}" \
        --admin_email="$WORDPRESS_ADMIN_EMAIL" \
        --allow-root

    echo "✅ WordPress core installed"
fi

# Update WordPress to latest version
echo "⬆️  Updating WordPress core..."
wp core update --allow-root
wp core update-db --allow-root

# Install and activate essential plugins
echo "🔌 Installing essential plugins..."

# Install plugin function
install_plugin() {
    local plugin=$1
    local name=$2

    if wp plugin is-installed "$plugin" --allow-root; then
        echo "ℹ️  $name plugin already installed"
        wp plugin update "$plugin" --allow-root || true
    else
        echo "📦 Installing $name plugin..."
        wp plugin install "$plugin" --activate --allow-root
    fi
}

# Core plugins
install_plugin "advanced-custom-fields" "Advanced Custom Fields"
install_plugin "wp-rest-api" "WP REST API"
install_plugin "wordpress-seo" "Yoast SEO"
install_plugin "wp-smushit" "Smush Image Optimization"
install_plugin "wordfence" "Wordfence Security"
install_plugin "wp-mail-smtp" "WP Mail SMTP"
install_plugin "redis-cache" "Redis Object Cache"

# Configure Redis Object Cache
if wp plugin is-active redis-cache --allow-root; then
    echo "🔄 Configuring Redis Object Cache..."
    wp redis enable --allow-root
fi

# Install custom plugins from local directory
if [ -d "/var/www/html/wp-content/plugins/custom" ]; then
    echo "🔌 Installing custom plugins..."
    for plugin_dir in /var/www/html/wp-content/plugins/custom/*/; do
        if [ -d "$plugin_dir" ]; then
            plugin_name=$(basename "$plugin_dir")
            echo "📦 Activating custom plugin: $plugin_name"
            wp plugin activate "$plugin_name" --allow-root || true
        fi
    done
fi

# Install and activate custom theme
if [ -d "/var/www/html/wp-content/themes/custom" ]; then
    echo "🎨 Installing custom themes..."
    for theme_dir in /var/www/html/wp-content/themes/custom/*/; do
        if [ -d "$theme_dir" ]; then
            theme_name=$(basename "$theme_dir")
            echo "🎨 Activating custom theme: $theme_name"
            wp theme activate "$theme_name" --allow-root || true
        fi
    done
fi

# Configure permalink structure
echo "🔗 Configuring permalinks..."
wp rewrite structure '/%postname%/' --allow-root
wp rewrite flush --allow-root

# Create basic pages
echo "📄 Creating basic pages..."

# Check if pages exist before creating
if ! wp post list --post_type=page --name=home --allow-root | grep -q "home"; then
    wp post create --post_type=page --post_title="Home" --post_name="home" --post_status=publish --allow-root
fi

if ! wp post list --post_type=page --name=servicos --allow-root | grep -q "servicos"; then
    wp post create --post_type=page --post_title="Serviços" --post_name="servicos" --post_status=publish --allow-root
fi

if ! wp post list --post_type=page --name=sobre --allow-root | grep -q "sobre"; then
    wp post create --post_type=page --post_title="Sobre" --post_name="sobre" --post_status=publish --allow-root
fi

if ! wp post list --post_type=page --name=contato --allow-root | grep -q "contato"; then
    wp post create --post_type=page --post_title="Contato" --post_name="contato" --post_status=publish --allow-root
fi

# Set front page
home_page_id=$(wp post list --post_type=page --name=home --field=ID --allow-root)
if [ -n "$home_page_id" ]; then
    wp option update show_on_front 'page' --allow-root
    wp option update page_on_front "$home_page_id" --allow-root
fi

# Configure basic settings
echo "⚙️  Configuring WordPress settings..."

# General settings
wp option update blogdescription "Clínica Oftalmológica Especializada" --allow-root
wp option update timezone_string "America/Sao_Paulo" --allow-root
wp option update date_format "d/m/Y" --allow-root
wp option update time_format "H:i" --allow-root

# Reading settings
wp option update posts_per_page 10 --allow-root
wp option update posts_per_rss 10 --allow-root

# Discussion settings
wp option update default_comment_status "closed" --allow-root
wp option update default_ping_status "closed" --allow-root

# Media settings
wp option update uploads_use_yearmonth_folders 1 --allow-root
wp option update large_size_w 1024 --allow-root
wp option update large_size_h 1024 --allow-root
wp option update medium_size_w 300 --allow-root
wp option update medium_size_h 300 --allow-root
wp option update thumbnail_size_w 150 --allow-root
wp option update thumbnail_size_h 150 --allow-root

# Security settings
wp option update admin_email "$WORDPRESS_ADMIN_EMAIL" --allow-root

echo "🎉 WordPress installation and configuration completed!"
echo "🌐 Site URL: $WORDPRESS_URL"
echo "👤 Admin URL: $WORDPRESS_URL/wp-admin"
echo "📧 Admin Email: $WORDPRESS_ADMIN_EMAIL"