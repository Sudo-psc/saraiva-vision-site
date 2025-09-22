#!/bin/bash

# WordPress Plugin Installation Script
# Installs and configures required plugins for headless CMS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WORDPRESS_DIR="/opt/wordpress-cms"
WP_CLI_URL="https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if WordPress is running
check_wordpress() {
    cd "$WORDPRESS_DIR"
    if ! docker-compose ps | grep -q "wordpress.*Up"; then
        error "WordPress container is not running. Please start it first with: docker-compose up -d"
    fi
}

# Install WP-CLI in container
install_wp_cli() {
    log "Installing WP-CLI in WordPress container..."
    
    docker-compose exec wordpress bash -c "
        if ! command -v wp &> /dev/null; then
            curl -O $WP_CLI_URL
            chmod +x wp-cli.phar
            mv wp-cli.phar /usr/local/bin/wp
            echo 'WP-CLI installed successfully'
        else
            echo 'WP-CLI is already installed'
        fi
    "
}

# Wait for WordPress to be ready
wait_for_wordpress() {
    log "Waiting for WordPress to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec wordpress wp core is-installed --allow-root 2>/dev/null; then
            log "WordPress is ready!"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts: WordPress not ready yet, waiting..."
        sleep 10
        ((attempt++))
    done
    
    error "WordPress did not become ready within the expected time"
}

# Install and activate plugins
install_plugins() {
    log "Installing required WordPress plugins..."
    
    # Define plugins to install
    local plugins=(
        "wp-graphql"
        "wp-graphql-jwt-authentication"
        "redis-cache"
        "wp-graphql-cors"
        "advanced-custom-fields"
        "wp-graphql-acf"
        "wp-super-cache"
        "wordfence"
        "updraftplus"
    )
    
    for plugin in "${plugins[@]}"; do
        log "Installing plugin: $plugin"
        
        docker-compose exec wordpress wp plugin install "$plugin" --allow-root --activate
        
        if [ $? -eq 0 ]; then
            log "Successfully installed and activated: $plugin"
        else
            warn "Failed to install plugin: $plugin"
        fi
    done
}

# Configure Redis Cache
configure_redis() {
    log "Configuring Redis Object Cache..."
    
    docker-compose exec wordpress wp redis enable --allow-root
    
    if [ $? -eq 0 ]; then
        log "Redis Object Cache enabled successfully"
    else
        warn "Failed to enable Redis Object Cache"
    fi
    
    # Check Redis connection
    docker-compose exec wordpress wp redis status --allow-root
}

# Configure GraphQL
configure_graphql() {
    log "Configuring WPGraphQL..."
    
    # Enable GraphQL introspection
    docker-compose exec wordpress wp option update graphql_general_settings '{"show_in_graphql":true,"introspection_enabled":true,"debug_mode_enabled":false}' --format=json --allow-root
    
    # Configure JWT Authentication
    docker-compose exec wordpress wp option update graphql_jwt_auth_settings '{"jwt_auth_secret_key":"'$JWT_SECRET_KEY'","jwt_auth_expire":604800}' --format=json --allow-root
    
    # Enable CORS for GraphQL
    docker-compose exec wordpress wp option update graphql_cors_settings '{"enable_cors":true,"allowed_origins":["https://saraivavision.com.br","https://www.saraivavision.com.br"],"allowed_methods":["GET","POST","OPTIONS"],"allowed_headers":["Content-Type","Authorization"]}' --format=json --allow-root
    
    log "GraphQL configuration completed"
}

# Configure security settings
configure_security() {
    log "Configuring security settings..."
    
    # Update WordPress salts
    docker-compose exec wordpress wp config shuffle-salts --allow-root
    
    # Set secure file permissions
    docker-compose exec wordpress bash -c "
        find /var/www/html -type d -exec chmod 755 {} \;
        find /var/www/html -type f -exec chmod 644 {} \;
        chmod 600 /var/www/html/wp-config.php
    "
    
    # Configure Wordfence (if installed)
    docker-compose exec wordpress wp option update wordfence_synced_attack_data 1 --allow-root 2>/dev/null || true
    
    log "Security configuration completed"
}

# Configure performance settings
configure_performance() {
    log "Configuring performance settings..."
    
    # Configure WP Super Cache
    docker-compose exec wordpress wp super-cache enable --allow-root 2>/dev/null || true
    
    # Set WordPress performance options
    docker-compose exec wordpress wp option update uploads_use_yearmonth_folders 1 --allow-root
    docker-compose exec wordpress wp option update image_default_link_type 'none' --allow-root
    docker-compose exec wordpress wp option update thumbnail_size_w 150 --allow-root
    docker-compose exec wordpress wp option update thumbnail_size_h 150 --allow-root
    docker-compose exec wordpress wp option update medium_size_w 300 --allow-root
    docker-compose exec wordpress wp option update medium_size_h 300 --allow-root
    docker-compose exec wordpress wp option update large_size_w 1024 --allow-root
    docker-compose exec wordpress wp option update large_size_h 1024 --allow-root
    
    log "Performance configuration completed"
}

# Create custom post types for clinic
create_custom_post_types() {
    log "Creating custom post types..."
    
    # Create a simple plugin for custom post types
    docker-compose exec wordpress bash -c "
        mkdir -p /var/www/html/wp-content/plugins/saraiva-vision-cpt
        cat > /var/www/html/wp-content/plugins/saraiva-vision-cpt/saraiva-vision-cpt.php << 'EOF'
<?php
/**
 * Plugin Name: Saraiva Vision Custom Post Types
 * Description: Custom post types for Saraiva Vision clinic
 * Version: 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Register Services post type
function sv_register_services_post_type() {
    register_post_type('services', array(
        'labels' => array(
            'name' => 'Services',
            'singular_name' => 'Service',
            'add_new' => 'Add New Service',
            'add_new_item' => 'Add New Service',
            'edit_item' => 'Edit Service',
            'new_item' => 'New Service',
            'view_item' => 'View Service',
            'search_items' => 'Search Services',
            'not_found' => 'No services found',
            'not_found_in_trash' => 'No services found in trash'
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'service',
        'graphql_plural_name' => 'services',
        'menu_icon' => 'dashicons-admin-tools'
    ));
}

// Register Team Members post type
function sv_register_team_post_type() {
    register_post_type('team', array(
        'labels' => array(
            'name' => 'Team Members',
            'singular_name' => 'Team Member',
            'add_new' => 'Add New Member',
            'add_new_item' => 'Add New Team Member',
            'edit_item' => 'Edit Team Member',
            'new_item' => 'New Team Member',
            'view_item' => 'View Team Member',
            'search_items' => 'Search Team Members',
            'not_found' => 'No team members found',
            'not_found_in_trash' => 'No team members found in trash'
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail'),
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'teamMember',
        'graphql_plural_name' => 'teamMembers',
        'menu_icon' => 'dashicons-admin-users'
    ));
}

// Register Testimonials post type
function sv_register_testimonials_post_type() {
    register_post_type('testimonials', array(
        'labels' => array(
            'name' => 'Testimonials',
            'singular_name' => 'Testimonial',
            'add_new' => 'Add New Testimonial',
            'add_new_item' => 'Add New Testimonial',
            'edit_item' => 'Edit Testimonial',
            'new_item' => 'New Testimonial',
            'view_item' => 'View Testimonial',
            'search_items' => 'Search Testimonials',
            'not_found' => 'No testimonials found',
            'not_found_in_trash' => 'No testimonials found in trash'
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail'),
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'testimonial',
        'graphql_plural_name' => 'testimonials',
        'menu_icon' => 'dashicons-format-quote'
    ));
}

// Hook into WordPress
add_action('init', 'sv_register_services_post_type');
add_action('init', 'sv_register_team_post_type');
add_action('init', 'sv_register_testimonials_post_type');

// Flush rewrite rules on activation
function sv_flush_rewrite_rules() {
    sv_register_services_post_type();
    sv_register_team_post_type();
    sv_register_testimonials_post_type();
    flush_rewrite_rules();
}

register_activation_hook(__FILE__, 'sv_flush_rewrite_rules');
?>
EOF
    "
    
    # Activate the custom post types plugin
    docker-compose exec wordpress wp plugin activate saraiva-vision-cpt --allow-root
    
    # Flush rewrite rules
    docker-compose exec wordpress wp rewrite flush --allow-root
    
    log "Custom post types created successfully"
}

# Main execution
main() {
    log "Starting WordPress plugin installation and configuration..."
    
    # Change to WordPress directory
    cd "$WORDPRESS_DIR" || error "WordPress directory not found: $WORDPRESS_DIR"
    
    # Check if WordPress is running
    check_wordpress
    
    # Install WP-CLI
    install_wp_cli
    
    # Wait for WordPress to be ready
    wait_for_wordpress
    
    # Install plugins
    install_plugins
    
    # Configure Redis
    configure_redis
    
    # Configure GraphQL
    configure_graphql
    
    # Configure security
    configure_security
    
    # Configure performance
    configure_performance
    
    # Create custom post types
    create_custom_post_types
    
    log "WordPress plugin installation and configuration completed successfully!"
    log ""
    log "Installed plugins:"
    log "- WPGraphQL (GraphQL API)"
    log "- WPGraphQL JWT Authentication (API authentication)"
    log "- Redis Cache (Object caching)"
    log "- WPGraphQL CORS (Cross-origin requests)"
    log "- Advanced Custom Fields (Custom fields)"
    log "- WPGraphQL ACF (ACF GraphQL integration)"
    log "- WP Super Cache (Page caching)"
    log "- Wordfence (Security)"
    log "- UpdraftPlus (Backups)"
    log ""
    log "Custom post types created:"
    log "- Services (clinic services and procedures)"
    log "- Team Members (doctor and staff profiles)"
    log "- Testimonials (patient reviews)"
    log ""
    log "GraphQL endpoint: https://cms.saraivavision.com.br/graphql"
    log "WordPress admin: https://cms.saraivavision.com.br/wp-admin"
}

# Run main function
main "$@"