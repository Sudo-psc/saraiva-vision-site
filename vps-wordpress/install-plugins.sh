#!/bin/bash

# WordPress Plugin Installation Script
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# WordPress container name
WP_CONTAINER="wordpress"

# Function to execute WP-CLI commands
wp_cli() {
    docker-compose exec -T "$WP_CONTAINER" wp "$@" --allow-root
}

# Function to check if WordPress is ready
wait_for_wordpress() {
    log "Waiting for WordPress to be ready..."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if wp_cli core is-installed 2>/dev/null; then
            log "WordPress is ready!"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "WordPress did not become ready within the expected time"
        fi
        
        info "Attempt $attempt/$max_attempts: WordPress not ready yet, waiting..."
        sleep 10
        ((attempt++))
    done
}

# Function to install a plugin
install_plugin() {
    local plugin_name="$1"
    local plugin_source="$2"
    local activate="${3:-true}"
    
    log "Processing plugin: $plugin_name"
    
    # Check if plugin is already installed
    if wp_cli plugin is-installed "$plugin_name" 2>/dev/null; then
        info "Plugin $plugin_name is already installed"
        
        # Check if it needs to be activated
        if [ "$activate" = "true" ] && ! wp_cli plugin is-active "$plugin_name" 2>/dev/null; then
            log "Activating plugin: $plugin_name"
            wp_cli plugin activate "$plugin_name"
        fi
        
        return 0
    fi
    
    # Install the plugin
    log "Installing plugin: $plugin_name from $plugin_source"
    
    if wp_cli plugin install "$plugin_source" 2>/dev/null; then
        log "✓ Plugin $plugin_name installed successfully"
        
        # Activate if requested
        if [ "$activate" = "true" ]; then
            log "Activating plugin: $plugin_name"
            if wp_cli plugin activate "$plugin_name" 2>/dev/null; then
                log "✓ Plugin $plugin_name activated successfully"
            else
                warn "Failed to activate plugin: $plugin_name"
            fi
        fi
    else
        error "Failed to install plugin: $plugin_name"
    fi
}

# Function to configure WPGraphQL
configure_wpgraphql() {
    log "Configuring WPGraphQL..."
    
    # Set GraphQL endpoint
    wp_cli option update graphql_general_settings '{
        "graphql_endpoint": "graphql",
        "query_analyzer_enabled": true,
        "query_analyzer_max_query_complexity": 1000,
        "query_analyzer_max_query_depth": 15,
        "show_in_graphql": true,
        "introspection_enabled": true,
        "debug_mode_enabled": false
    }' --format=json 2>/dev/null || warn "Could not update GraphQL settings"
    
    log "✓ WPGraphQL configured"
}

# Function to configure JWT Authentication
configure_jwt_auth() {
    log "Configuring JWT Authentication..."
    
    # The JWT secret is already set in wp-config-extra.php via environment variable
    # Just verify it's working
    if wp_cli config get GRAPHQL_JWT_AUTH_SECRET_KEY 2>/dev/null; then
        log "✓ JWT Authentication secret is configured"
    else
        warn "JWT Authentication secret not found in wp-config.php"
    fi
}

# Function to configure Redis Cache
configure_redis_cache() {
    log "Configuring Redis Cache..."
    
    # Enable Redis object cache
    if wp_cli redis enable 2>/dev/null; then
        log "✓ Redis object cache enabled"
    else
        warn "Could not enable Redis object cache"
    fi
    
    # Check Redis status
    if wp_cli redis status 2>/dev/null; then
        log "✓ Redis cache is working"
    else
        warn "Redis cache status check failed"
    fi
}

# Function to configure Advanced Custom Fields
configure_acf() {
    log "Configuring Advanced Custom Fields..."
    
    # Create field groups for custom post types
    # This would typically be done through the WordPress admin interface
    # or by importing field group JSON files
    
    log "✓ ACF configuration completed (manual setup required in admin)"
}

# Function to install and configure all required plugins
install_all_plugins() {
    log "Installing WordPress plugins for headless CMS..."
    
    # Core GraphQL plugin
    install_plugin "wp-graphql" "https://downloads.wordpress.org/plugin/wp-graphql.latest-stable.zip"
    
    # JWT Authentication for GraphQL
    install_plugin "wp-graphql-jwt-authentication" "https://github.com/wp-graphql/wp-graphql-jwt-authentication/archive/refs/heads/develop.zip"
    
    # Redis Object Cache
    install_plugin "redis-cache" "https://downloads.wordpress.org/plugin/redis-cache.latest-stable.zip"
    
    # CORS support for GraphQL
    install_plugin "wp-graphql-cors" "https://downloads.wordpress.org/plugin/wp-graphql-cors.latest-stable.zip"
    
    # Advanced Custom Fields
    install_plugin "advanced-custom-fields" "https://downloads.wordpress.org/plugin/advanced-custom-fields.latest-stable.zip"
    
    # ACF integration with GraphQL
    install_plugin "wp-graphql-acf" "https://github.com/wp-graphql/wp-graphql-acf/archive/refs/heads/develop.zip"
    
    # Security plugin
    install_plugin "wordfence" "https://downloads.wordpress.org/plugin/wordfence.latest-stable.zip"
    
    # Backup plugin
    install_plugin "updraftplus" "https://downloads.wordpress.org/plugin/updraftplus.latest-stable.zip"
    
    # SEO plugin (optional)
    install_plugin "wordpress-seo" "https://downloads.wordpress.org/plugin/wordpress-seo.latest-stable.zip" "false"
    
    log "✓ All plugins installed successfully"
}

# Function to configure plugin settings
configure_plugins() {
    log "Configuring plugin settings..."
    
    configure_wpgraphql
    configure_jwt_auth
    configure_redis_cache
    configure_acf
    
    log "✓ Plugin configuration completed"
}

# Function to create custom post types (if not already done in wp-config-extra.php)
create_custom_post_types() {
    log "Verifying custom post types..."
    
    # The custom post types are created in wp-config-extra.php
    # This function just verifies they exist
    
    local post_types=("services" "team_members" "testimonials")
    
    for post_type in "${post_types[@]}"; do
        if wp_cli post-type list --format=csv | grep -q "$post_type"; then
            log "✓ Custom post type '$post_type' is registered"
        else
            warn "Custom post type '$post_type' not found"
        fi
    done
}

# Function to set up WordPress options
configure_wordpress_options() {
    log "Configuring WordPress options..."
    
    # Set timezone
    wp_cli option update timezone_string "America/Sao_Paulo" 2>/dev/null || warn "Could not set timezone"
    
    # Set permalink structure
    wp_cli rewrite structure "/%postname%/" 2>/dev/null || warn "Could not set permalink structure"
    wp_cli rewrite flush 2>/dev/null || warn "Could not flush rewrite rules"
    
    # Disable pingbacks and trackbacks
    wp_cli option update default_pingback_flag 0 2>/dev/null || warn "Could not disable pingbacks"
    wp_cli option update default_ping_status "closed" 2>/dev/null || warn "Could not disable pings"
    
    # Set default comment status
    wp_cli option update default_comment_status "closed" 2>/dev/null || warn "Could not disable comments"
    
    # Update site title and description
    wp_cli option update blogname "Saraiva Vision CMS" 2>/dev/null || warn "Could not set site title"
    wp_cli option update blogdescription "Headless CMS for Saraiva Vision Ophthalmology Clinic" 2>/dev/null || warn "Could not set site description"
    
    # Set language to Portuguese (Brazil)
    wp_cli language core install pt_BR 2>/dev/null || warn "Could not install Portuguese language"
    wp_cli site switch-language pt_BR 2>/dev/null || warn "Could not switch to Portuguese"
    
    log "✓ WordPress options configured"
}

# Function to create sample content (optional)
create_sample_content() {
    log "Creating sample content..."
    
    # Create a sample service
    local service_id=$(wp_cli post create --post_type=services --post_title="Consulta Oftalmológica" --post_content="Consulta completa com exame de vista e diagnóstico." --post_status=publish --porcelain 2>/dev/null || echo "")
    
    if [ -n "$service_id" ]; then
        log "✓ Sample service created (ID: $service_id)"
    fi
    
    # Create a sample team member
    local team_id=$(wp_cli post create --post_type=team_members --post_title="Dr. Philipe Cruz" --post_content="Oftalmologista especializado em cirurgias refrativas." --post_status=publish --porcelain 2>/dev/null || echo "")
    
    if [ -n "$team_id" ]; then
        log "✓ Sample team member created (ID: $team_id)"
    fi
    
    # Create a sample testimonial
    local testimonial_id=$(wp_cli post create --post_type=testimonials --post_title="Excelente atendimento" --post_content="Fui muito bem atendido e o resultado da cirurgia foi perfeito." --post_status=publish --porcelain 2>/dev/null || echo "")
    
    if [ -n "$testimonial_id" ]; then
        log "✓ Sample testimonial created (ID: $testimonial_id)"
    fi
    
    log "✓ Sample content created"
}

# Function to verify GraphQL functionality
verify_graphql() {
    log "Verifying GraphQL functionality..."
    
    # Test basic GraphQL query
    local test_query='{"query":"query { generalSettings { title url } }"}'
    local graphql_url="https://cms.saraivavision.com.br/graphql"
    
    # Wait a moment for services to be ready
    sleep 5
    
    if curl -s -X POST -H "Content-Type: application/json" -d "$test_query" "$graphql_url" | grep -q "title"; then
        log "✓ GraphQL endpoint is working"
    else
        warn "GraphQL endpoint test failed (this is normal if SSL is not yet configured)"
    fi
}

# Function to display plugin status
show_plugin_status() {
    log "Plugin Status Summary"
    log "===================="
    
    wp_cli plugin list --format=table 2>/dev/null || warn "Could not list plugins"
    
    log ""
    log "Custom Post Types:"
    wp_cli post-type list --format=table 2>/dev/null || warn "Could not list post types"
}

# Main execution
main() {
    log "Starting WordPress plugin installation and configuration..."
    
    # Wait for WordPress to be ready
    wait_for_wordpress
    
    # Install all required plugins
    install_all_plugins
    
    # Configure plugins
    configure_plugins
    
    # Configure WordPress options
    configure_wordpress_options
    
    # Verify custom post types
    create_custom_post_types
    
    # Create sample content (optional)
    create_sample_content
    
    # Verify GraphQL functionality
    verify_graphql
    
    # Show final status
    show_plugin_status
    
    log "WordPress plugin installation and configuration completed successfully! 🎉"
    log ""
    log "Next steps:"
    log "1. Complete WordPress admin setup at https://cms.saraivavision.com.br/wp-admin"
    log "2. Configure Advanced Custom Fields for custom post types"
    log "3. Test GraphQL endpoint at https://cms.saraivavision.com.br/graphql"
    log "4. Set up webhooks for Next.js integration"
}

# Run main function
main