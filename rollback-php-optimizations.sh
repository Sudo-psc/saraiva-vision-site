#!/bin/bash

# Rollback Script for SaraivaVision PHP-FPM Optimizations
# Dr. Philipe Saraiva Cruz - CRM-MG 69.870
# Safely reverts all performance optimizations if issues occur

set -euo pipefail

# Configuration
BACKUP_DIR="/tmp/saraivavision-backup-$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/saraivavision-rollback.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

echo -e "${RED}🏥 SaraivaVision PHP-FPM Optimization Rollback${NC}"
echo -e "${RED}=============================================${NC}"
echo ""

log "Starting rollback process for SaraivaVision medical website"

# Create backup directory
mkdir -p "$BACKUP_DIR"
log "Created backup directory: $BACKUP_DIR"

# Function to backup current file
backup_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        cp "$file" "$BACKUP_DIR/$(basename "$file")"
        log "Backed up: $file"
    fi
}

# Function to restore original file
restore_file() {
    local current="$1"
    local original="$2"
    
    if [[ -f "$original" ]]; then
        backup_file "$current"
        cp "$original" "$current"
        log "Restored: $current from $original"
        echo -e "${GREEN}✅ Restored: $(basename "$current")${NC}"
    else
        echo -e "${YELLOW}⚠️  Original file not found: $original${NC}"
        log "Warning: Original file not found: $original"
    fi
}

# Function to remove optimization files
remove_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        backup_file "$file"
        rm -f "$file"
        log "Removed optimization file: $file"
        echo -e "${GREEN}✅ Removed: $(basename "$file")${NC}"
    fi
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping services for rollback...${NC}"
    
    # Stop Docker containers if running
    if command -v docker-compose &> /dev/null; then
        if [[ -f "docker-compose-optimized.yml" ]]; then
            echo "Stopping optimized Docker containers..."
            docker-compose -f docker-compose-optimized.yml down || true
            log "Stopped optimized Docker containers"
        fi
    fi
    
    # Stop PHP-FPM if running
    if systemctl is-active --quiet php8.3-fpm 2>/dev/null; then
        echo "Stopping PHP-FPM..."
        sudo systemctl stop php8.3-fpm || true
        log "Stopped PHP-FPM service"
    fi
    
    # Stop Redis if running
    if systemctl is-active --quiet redis-server 2>/dev/null; then
        echo "Stopping Redis..."
        sudo systemctl stop redis-server || true
        log "Stopped Redis service"
    fi
    
    # Stop Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo "Reloading Nginx to original configuration..."
        sudo nginx -s reload || true
        log "Reloaded Nginx"
    fi
}

# Function to restore WordPress configuration
restore_wordpress_config() {
    echo -e "${YELLOW}Restoring WordPress configuration...${NC}"
    
    # Restore original wp-config.php
    restore_file "/var/www/html/wp-config.php" "/var/www/html/wp-config.php.backup"
    restore_file "./wp-config.php" "./wp-config-fixed.php"
    
    # Remove Redis object cache
    remove_file "/var/www/html/wp-content/object-cache.php"
    remove_file "./wp-content/object-cache.php"
    
    # Restore original Docker Compose
    restore_file "docker-compose.yml" "docker-compose.wordpress.yml"
}

# Function to restore PHP configuration  
restore_php_config() {
    echo -e "${YELLOW}Restoring PHP configuration...${NC}"
    
    # Remove optimized PHP-FPM pool
    remove_file "/etc/php/8.3/fmp-fpm.d/saraivavision.conf"
    remove_file "/usr/local/etc/php-fpm.d/saraivavision.conf"
    
    # Remove optimized php.ini
    remove_file "/etc/php/8.3/fpm/conf.d/99-optimized.ini"
    remove_file "/usr/local/etc/php/conf.d/99-optimized.ini"
    
    # Restore default PHP settings
    if [[ -f "/etc/php/8.3/fpm/php.ini.backup" ]]; then
        restore_file "/etc/php/8.3/fpm/php.ini" "/etc/php/8.3/fpm/php.ini.backup"
    fi
}

# Function to restore Redis configuration
restore_redis_config() {
    echo -e "${YELLOW}Restoring Redis configuration...${NC}"
    
    # Remove medical Redis configuration
    remove_file "/etc/redis/redis-medical.conf"
    remove_file "/usr/local/etc/redis/redis-medical.conf"
    
    # Restore original Redis config if backed up
    if [[ -f "/etc/redis/redis.conf.backup" ]]; then
        restore_file "/etc/redis/redis.conf" "/etc/redis/redis.conf.backup"
    fi
}

# Function to restore Nginx configuration
restore_nginx_config() {
    echo -e "${YELLOW}Restoring Nginx configuration...${NC}"
    
    # Restore original nginx configuration
    restore_file "/etc/nginx/nginx.conf" "/etc/nginx/nginx.conf.backup"
    restore_file "nginx.conf" "nginx-production-full.conf"
    
    # Remove optimization includes
    if [[ -d "/etc/nginx/includes" ]]; then
        sudo rm -rf "/etc/nginx/includes.backup" 2>/dev/null || true
        sudo mv "/etc/nginx/includes" "/etc/nginx/includes.backup" 2>/dev/null || true
        log "Backed up nginx includes directory"
    fi
}

# Function to clear caches
clear_caches() {
    echo -e "${YELLOW}Clearing caches...${NC}"
    
    # Clear OPcache
    if command -v php &> /dev/null; then
        php -r "if (function_exists('opcache_reset')) opcache_reset();" 2>/dev/null || true
        log "Cleared OPcache"
    fi
    
    # Clear Redis cache
    if command -v redis-cli &> /dev/null; then
        redis-cli flushall 2>/dev/null || true
        log "Cleared Redis cache"
    fi
    
    # Clear WordPress cache files
    find /var/www/html -name "*.cache" -delete 2>/dev/null || true
    find ./wordpress-local -name "*.cache" -delete 2>/dev/null || true
    log "Cleared WordPress cache files"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}Restarting services with original configuration...${NC}"
    
    # Start original Docker setup
    if [[ -f "docker-compose.wordpress.yml" ]]; then
        echo "Starting original Docker containers..."
        docker-compose -f docker-compose.wordpress.yml up -d || log "Warning: Could not start original Docker containers"
    fi
    
    # Restart PHP if using system PHP
    if systemctl is-enabled --quiet php8.3-fpm 2>/dev/null; then
        sudo systemctl restart php8.3-fpm || log "Warning: Could not restart PHP-FPM"
        log "Restarted PHP-FPM with original configuration"
    fi
    
    # Restart Nginx
    if systemctl is-enabled --quiet nginx 2>/dev/null; then
        sudo nginx -t && sudo systemctl reload nginx || log "Warning: Could not reload Nginx"
        log "Reloaded Nginx with original configuration"
    fi
}

# Function to verify rollback
verify_rollback() {
    echo -e "${YELLOW}Verifying rollback...${NC}"
    
    # Test website accessibility
    local website_url="${WEBSITE_URL:-http://localhost}"
    
    if curl -s "$website_url" > /dev/null; then
        echo -e "${GREEN}✅ Website is accessible${NC}"
        log "Rollback verification: Website accessible"
    else
        echo -e "${RED}❌ Website may not be accessible${NC}"
        log "Rollback verification: Website not accessible"
    fi
    
    # Check if optimization files are removed
    local optimization_files=(
        "php-fpm-saraivavision.conf"
        "php-optimized.ini"
        "wp-redis-object-cache.php"
        "redis-medical.conf"
        "docker-compose-optimized.yml"
    )
    
    local removed_count=0
    for file in "${optimization_files[@]}"; do
        if [[ ! -f "$file" ]] || [[ ! -f "/etc/nginx/sites-available/$file" ]] || [[ ! -f "/var/www/html/$file" ]]; then
            ((removed_count++))
        fi
    done
    
    echo "Optimization files removed: $removed_count/${#optimization_files[@]}"
    log "Rollback verification: $removed_count optimization files removed"
}

# Main rollback process
main() {
    echo -e "${BLUE}Starting rollback process...${NC}"
    echo ""
    
    # Confirm rollback
    read -p "Are you sure you want to rollback all PHP-FPM optimizations? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Rollback cancelled.${NC}"
        exit 0
    fi
    
    log "User confirmed rollback process"
    
    # Execute rollback steps
    stop_services
    echo ""
    
    restore_wordpress_config
    echo ""
    
    restore_php_config
    echo ""
    
    restore_redis_config
    echo ""
    
    restore_nginx_config
    echo ""
    
    clear_caches
    echo ""
    
    restart_services
    echo ""
    
    verify_rollback
    echo ""
    
    echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Rollback Summary:${NC}"
    echo "- Original configurations restored"
    echo "- Optimization files removed/backed up"
    echo "- Services restarted with original settings"
    echo "- Caches cleared"
    echo ""
    echo -e "${YELLOW}Backup files saved to: $BACKUP_DIR${NC}"
    echo -e "${YELLOW}Rollback log: $LOG_FILE${NC}"
    
    log "Rollback process completed successfully"
}

# Handle script interruption
trap 'echo -e "\n${RED}Rollback interrupted!${NC}"; log "Rollback process interrupted"; exit 1' INT TERM

# Run rollback
main "$@"