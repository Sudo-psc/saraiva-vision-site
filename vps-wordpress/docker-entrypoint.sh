#!/bin/bash
set -euo pipefail

# WordPress Docker entrypoint script with custom optimizations

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Function to wait for database
wait_for_db() {
    log "Waiting for database connection..."
    
    until mysql -h"$WORDPRESS_DB_HOST" -u"$WORDPRESS_DB_USER" -p"$WORDPRESS_DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; do
        log "Database not ready, waiting..."
        sleep 2
    done
    
    log "Database connection established"
}

# Function to wait for Redis
wait_for_redis() {
    log "Waiting for Redis connection..."
    
    until redis-cli -h redis ping >/dev/null 2>&1; do
        log "Redis not ready, waiting..."
        sleep 2
    done
    
    log "Redis connection established"
}

# Function to install WordPress if not already installed
install_wordpress() {
    if ! wp core is-installed --allow-root 2>/dev/null; then
        log "WordPress not installed, running installation..."
        
        # Download WordPress core if needed
        if [ ! -f wp-config.php ]; then
            log "Downloading WordPress core..."
            wp core download --allow-root
        fi
        
        # Create wp-config.php if it doesn't exist
        if [ ! -f wp-config.php ]; then
            log "Creating wp-config.php..."
            wp config create \
                --dbname="$WORDPRESS_DB_NAME" \
                --dbuser="$WORDPRESS_DB_USER" \
                --dbpass="$WORDPRESS_DB_PASSWORD" \
                --dbhost="$WORDPRESS_DB_HOST" \
                --allow-root
            
            # Include our custom configuration
            echo "" >> wp-config.php
            echo "// Include custom configuration" >> wp-config.php
            echo "if (file_exists(__DIR__ . '/wp-config-extra.php')) {" >> wp-config.php
            echo "    require_once __DIR__ . '/wp-config-extra.php';" >> wp-config.php
            echo "}" >> wp-config.php
        fi
        
        log "WordPress core installation completed"
    else
        log "WordPress already installed"
    fi
}

# Function to install and activate required plugins
install_plugins() {
    log "Installing required plugins..."
    
    # Define required plugins
    declare -A plugins=(
        ["wp-graphql"]="https://downloads.wordpress.org/plugin/wp-graphql.latest-stable.zip"
        ["wp-graphql-jwt-authentication"]="https://github.com/wp-graphql/wp-graphql-jwt-authentication/archive/refs/heads/develop.zip"
        ["redis-cache"]="https://downloads.wordpress.org/plugin/redis-cache.latest-stable.zip"
        ["wp-graphql-cors"]="https://downloads.wordpress.org/plugin/wp-graphql-cors.latest-stable.zip"
        ["advanced-custom-fields"]="https://downloads.wordpress.org/plugin/advanced-custom-fields.latest-stable.zip"
        ["wp-graphql-acf"]="https://github.com/wp-graphql/wp-graphql-acf/archive/refs/heads/develop.zip"
    )
    
    for plugin in "${!plugins[@]}"; do
        if ! wp plugin is-installed "$plugin" --allow-root 2>/dev/null; then
            log "Installing plugin: $plugin"
            wp plugin install "${plugins[$plugin]}" --allow-root
        fi
        
        if ! wp plugin is-active "$plugin" --allow-root 2>/dev/null; then
            log "Activating plugin: $plugin"
            wp plugin activate "$plugin" --allow-root
        fi
    done
    
    log "Plugin installation completed"
}

# Function to configure Redis cache
configure_redis() {
    log "Configuring Redis cache..."
    
    # Enable Redis object cache
    if wp plugin is-active redis-cache --allow-root 2>/dev/null; then
        wp redis enable --allow-root 2>/dev/null || true
        log "Redis cache enabled"
    fi
}

# Function to set up GraphQL
configure_graphql() {
    log "Configuring GraphQL..."
    
    # Set GraphQL endpoint
    wp option update graphql_general_settings '{"graphql_endpoint":"graphql","query_analyzer_enabled":true,"query_analyzer_max_query_complexity":1000,"query_analyzer_max_query_depth":15}' --format=json --allow-root 2>/dev/null || true
    
    # Configure JWT authentication
    if [ -n "${JWT_SECRET_KEY:-}" ]; then
        wp config set GRAPHQL_JWT_AUTH_SECRET_KEY "$JWT_SECRET_KEY" --allow-root 2>/dev/null || true
        log "JWT authentication configured"
    fi
}

# Function to optimize WordPress settings
optimize_wordpress() {
    log "Optimizing WordPress settings..."
    
    # Set timezone
    wp option update timezone_string "America/Sao_Paulo" --allow-root 2>/dev/null || true
    
    # Set permalink structure
    wp rewrite structure "/%postname%/" --allow-root 2>/dev/null || true
    
    # Disable pingbacks and trackbacks
    wp option update default_pingback_flag 0 --allow-root 2>/dev/null || true
    wp option update default_ping_status "closed" --allow-root 2>/dev/null || true
    
    # Set default comment status
    wp option update default_comment_status "closed" --allow-root 2>/dev/null || true
    
    # Update site URL if needed
    if [ -n "${WORDPRESS_DOMAIN:-}" ]; then
        wp option update home "$WORDPRESS_DOMAIN" --allow-root 2>/dev/null || true
        wp option update siteurl "$WORDPRESS_DOMAIN" --allow-root 2>/dev/null || true
    fi
    
    log "WordPress optimization completed"
}

# Function to create log directories
setup_logging() {
    log "Setting up logging directories..."
    
    mkdir -p /var/log/wordpress
    chown www-data:www-data /var/log/wordpress
    chmod 755 /var/log/wordpress
    
    log "Logging setup completed"
}

# Function to set proper file permissions
set_permissions() {
    log "Setting file permissions..."
    
    # Set ownership
    chown -R www-data:www-data /var/www/html
    
    # Set directory permissions
    find /var/www/html -type d -exec chmod 755 {} \;
    
    # Set file permissions
    find /var/www/html -type f -exec chmod 644 {} \;
    
    # Make wp-config.php read-only
    if [ -f /var/www/html/wp-config.php ]; then
        chmod 600 /var/www/html/wp-config.php
    fi
    
    log "File permissions set"
}

# Main execution
main() {
    log "Starting WordPress container initialization..."
    
    # Change to WordPress directory
    cd /var/www/html
    
    # Wait for dependencies
    wait_for_db
    wait_for_redis
    
    # Setup logging
    setup_logging
    
    # Install WordPress
    install_wordpress
    
    # Install and configure plugins
    install_plugins
    configure_redis
    configure_graphql
    
    # Optimize WordPress
    optimize_wordpress
    
    # Set permissions
    set_permissions
    
    log "WordPress initialization completed successfully"
    
    # Execute the original entrypoint
    exec docker-entrypoint.sh "$@"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi