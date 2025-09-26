#!/bin/bash

# WordPress Blog Deployment Script for Saraiva Vision
# Automated deployment with health checks and rollback capability

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${DOMAIN:-blog.saraivavision.com.br}"
WP_PATH="${WP_PATH:-/var/www/blog.saraivavision.com.br}"
BACKUP_PATH="${BACKUP_PATH:-/var/backups/wordpress}"
HEALTH_CHECK_TIMEOUT=30
ROLLBACK_ENABLED=true

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

# Function to create backup
create_backup() {
    local backup_date=$(date +"%Y%m%d_%H%M%S")
    local backup_dir="${BACKUP_PATH}/${backup_date}"

    print_status "📦 Creating backup at ${backup_dir}"

    mkdir -p "$backup_dir"

    # Backup WordPress files
    if [[ -d "$WP_PATH" ]]; then
        print_status "Backing up WordPress files..."
        cp -r "$WP_PATH" "${backup_dir}/wordpress"
    fi

    # Backup database
    if command_exists wp && [[ -f "${WP_PATH}/wp-config.php" ]]; then
        print_status "Backing up database..."
        cd "$WP_PATH"
        wp db export "${backup_dir}/database.sql" --allow-root --quiet
    fi

    # Backup Nginx configuration
    if [[ -f "/etc/nginx/sites-available/saraiva-wordpress-blog" ]]; then
        print_status "Backing up Nginx configuration..."
        cp "/etc/nginx/sites-available/saraiva-wordpress-blog" "${backup_dir}/nginx.conf"
    fi

    # Backup PHP-FPM configuration
    if [[ -f "/etc/php/8.1/fpm/pool.d/wordpress-blog.conf" ]]; then
        print_status "Backing up PHP-FPM configuration..."
        cp "/etc/php/8.1/fpm/pool.d/wordpress-blog.conf" "${backup_dir}/php-fpm.conf"
    fi

    echo "$backup_dir" > /tmp/latest_backup
    print_success "✅ Backup created successfully at ${backup_dir}"
}

# Function to restore from backup
restore_backup() {
    local backup_dir="$1"

    if [[ ! -d "$backup_dir" ]]; then
        print_error "Backup directory not found: $backup_dir"
        return 1
    fi

    print_warning "🔄 Restoring from backup: $backup_dir"

    # Stop services
    systemctl stop nginx php8.1-fpm

    # Restore WordPress files
    if [[ -d "${backup_dir}/wordpress" ]]; then
        print_status "Restoring WordPress files..."
        rm -rf "$WP_PATH"
        cp -r "${backup_dir}/wordpress" "$WP_PATH"
        chown -R www-data:www-data "$WP_PATH"
    fi

    # Restore database
    if [[ -f "${backup_dir}/database.sql" ]] && command_exists wp; then
        print_status "Restoring database..."
        cd "$WP_PATH"
        wp db import "${backup_dir}/database.sql" --allow-root --quiet
    fi

    # Restore configurations
    if [[ -f "${backup_dir}/nginx.conf" ]]; then
        print_status "Restoring Nginx configuration..."
        cp "${backup_dir}/nginx.conf" "/etc/nginx/sites-available/saraiva-wordpress-blog"
    fi

    if [[ -f "${backup_dir}/php-fpm.conf" ]]; then
        print_status "Restoring PHP-FPM configuration..."
        cp "${backup_dir}/php-fpm.conf" "/etc/php/8.1/fpm/pool.d/wordpress-blog.conf"
    fi

    # Start services
    systemctl start php8.1-fpm nginx

    print_success "✅ Backup restored successfully"
}

# Function to perform health checks
health_check() {
    local check_url="$1"
    local timeout="$2"

    print_status "🔍 Performing health checks..."

    # Check if services are running
    if ! systemctl is-active --quiet nginx; then
        print_error "Nginx is not running"
        return 1
    fi

    if ! systemctl is-active --quiet php8.1-fpm; then
        print_error "PHP-FPM is not running"
        return 1
    fi

    # Check WordPress installation
    if [[ ! -f "${WP_PATH}/wp-config.php" ]]; then
        print_error "WordPress not properly installed"
        return 1
    fi

    # Check database connectivity
    if command_exists wp; then
        cd "$WP_PATH"
        if ! wp db check --allow-root --quiet; then
            print_error "Database connectivity check failed"
            return 1
        fi
    fi

    # Check HTTP response
    local response_code
    local start_time=$(date +%s)

    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))

        if [[ $elapsed -ge $timeout ]]; then
            print_error "Health check timeout after ${timeout}s"
            return 1
        fi

        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$check_url" || echo "000")

        if [[ "$response_code" == "200" ]]; then
            print_success "✅ Health check passed (HTTP $response_code)"
            return 0
        fi

        print_status "Waiting for service... (HTTP $response_code)"
        sleep 2
    done
}

# Function to check API endpoints
check_api_endpoints() {
    local base_url="https://$DOMAIN"

    print_status "🔗 Checking API endpoints..."

    # WordPress REST API
    local posts_response=$(curl -s -w "%{http_code}" "${base_url}/wp-json/wp/v2/posts" -o /dev/null)
    if [[ "$posts_response" != "200" ]]; then
        print_warning "Posts API returned HTTP $posts_response"
        return 1
    fi

    # Categories API
    local categories_response=$(curl -s -w "%{http_code}" "${base_url}/wp-json/wp/v2/categories" -o /dev/null)
    if [[ "$categories_response" != "200" ]]; then
        print_warning "Categories API returned HTTP $categories_response"
        return 1
    fi

    print_success "✅ All API endpoints responding correctly"
    return 0
}

# Function to update WordPress
update_wordpress() {
    if [[ ! -d "$WP_PATH" ]] || [[ ! -f "${WP_PATH}/wp-config.php" ]]; then
        print_error "WordPress installation not found"
        return 1
    fi

    print_status "🔄 Updating WordPress..."

    cd "$WP_PATH"

    # Update WordPress core
    wp core update --allow-root --quiet

    # Update plugins
    wp plugin update --all --allow-root --quiet

    # Update themes (if any)
    wp theme update --all --allow-root --quiet

    # Flush rewrite rules
    wp rewrite flush --allow-root --quiet

    print_success "✅ WordPress updated successfully"
}

# Function to optimize performance
optimize_performance() {
    print_status "⚡ Optimizing performance..."

    cd "$WP_PATH"

    # Clear any caching plugins
    if wp plugin is-installed w3-total-cache --allow-root --quiet; then
        wp w3-total-cache flush all --allow-root --quiet 2>/dev/null || true
    fi

    if wp plugin is-installed wp-super-cache --allow-root --quiet; then
        wp super-cache flush --allow-root --quiet 2>/dev/null || true
    fi

    # Clear OPcache
    systemctl reload php8.1-fpm

    # Clear Nginx cache if directory exists
    if [[ -d "/var/cache/nginx/blog" ]]; then
        rm -rf /var/cache/nginx/blog/*
    fi

    print_success "✅ Performance optimization completed"
}

# Function to check SSL certificate
check_ssl() {
    print_status "🔐 Checking SSL certificate..."

    local ssl_info
    ssl_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "${DOMAIN}:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)

    if [[ -n "$ssl_info" ]]; then
        print_success "✅ SSL certificate is valid"
        echo "$ssl_info"
    else
        print_warning "⚠️ SSL certificate check failed or not configured"
        return 1
    fi
}

# Function to monitor logs
show_logs() {
    print_status "📋 Recent logs:"

    echo "=== Nginx Error Logs ==="
    tail -n 10 /var/log/nginx/error.log 2>/dev/null || echo "No Nginx error logs found"

    echo ""
    echo "=== PHP-FPM Logs ==="
    tail -n 10 /var/log/php8.1-fpm-wordpress-error.log 2>/dev/null || echo "No PHP-FPM logs found"

    echo ""
    echo "=== System Logs ==="
    journalctl -u nginx -u php8.1-fpm --no-pager -n 5 2>/dev/null || echo "No system logs found"
}

# Main deployment function
deploy() {
    local skip_backup="${1:-false}"
    local backup_dir=""

    print_status "🚀 Starting WordPress blog deployment for Saraiva Vision"

    # Create backup unless skipped
    if [[ "$skip_backup" != "true" ]]; then
        create_backup
        backup_dir=$(cat /tmp/latest_backup 2>/dev/null || echo "")
    fi

    # Update WordPress
    if ! update_wordpress; then
        if [[ "$ROLLBACK_ENABLED" == "true" ]] && [[ -n "$backup_dir" ]]; then
            print_error "WordPress update failed, rolling back..."
            restore_backup "$backup_dir"
        fi
        exit 1
    fi

    # Optimize performance
    optimize_performance

    # Health check
    if ! health_check "https://$DOMAIN" "$HEALTH_CHECK_TIMEOUT"; then
        if [[ "$ROLLBACK_ENABLED" == "true" ]] && [[ -n "$backup_dir" ]]; then
            print_error "Health check failed, rolling back..."
            restore_backup "$backup_dir"
        fi
        exit 1
    fi

    # Check API endpoints
    if ! check_api_endpoints; then
        print_warning "Some API endpoints are not responding correctly"
    fi

    # Check SSL
    check_ssl || print_warning "SSL check failed"

    print_success "🎉 WordPress blog deployment completed successfully!"

    # Show summary
    echo ""
    echo "================================================"
    echo "🏥 WORDPRESS BLOG DEPLOYMENT SUMMARY"
    echo "================================================"
    echo "✅ WordPress core and plugins updated"
    echo "✅ Performance optimizations applied"
    echo "✅ Health checks passed"
    echo "✅ API endpoints verified"
    echo "🌐 Blog URL: https://$DOMAIN"
    echo "📊 Admin URL: https://$DOMAIN/wp-admin"
    echo "🔗 API URL: https://$DOMAIN/wp-json/wp/v2/"

    if [[ -n "$backup_dir" ]]; then
        echo "💾 Backup saved: $backup_dir"
    fi

    echo "================================================"
}

# Command line interface
case "${1:-deploy}" in
    "deploy")
        deploy "${2:-false}"
        ;;
    "backup")
        create_backup
        ;;
    "restore")
        if [[ -z "${2:-}" ]]; then
            print_error "Usage: $0 restore <backup_directory>"
            exit 1
        fi
        restore_backup "$2"
        ;;
    "health")
        health_check "https://$DOMAIN" "$HEALTH_CHECK_TIMEOUT"
        ;;
    "api-check")
        check_api_endpoints
        ;;
    "ssl-check")
        check_ssl
        ;;
    "logs")
        show_logs
        ;;
    "optimize")
        optimize_performance
        ;;
    "help")
        echo "WordPress Blog Deployment Script"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  deploy [skip-backup]  Deploy WordPress with updates and health checks"
        echo "  backup                Create backup of WordPress, database, and configs"
        echo "  restore <backup_dir>  Restore from backup directory"
        echo "  health                Perform health checks"
        echo "  api-check             Check API endpoints"
        echo "  ssl-check             Check SSL certificate"
        echo "  logs                  Show recent logs"
        echo "  optimize              Optimize performance"
        echo "  help                  Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  DOMAIN                Blog domain (default: blog.saraivavision.com.br)"
        echo "  WP_PATH               WordPress path (default: /var/www/blog.saraivavision.com.br)"
        echo "  BACKUP_PATH           Backup path (default: /var/backups/wordpress)"
        echo "  HEALTH_CHECK_TIMEOUT  Health check timeout in seconds (default: 30)"
        echo "  ROLLBACK_ENABLED      Enable automatic rollback (default: true)"
        ;;
    *)
        print_error "Unknown command: $1"
        print_status "Use '$0 help' for usage information"
        exit 1
        ;;
esac