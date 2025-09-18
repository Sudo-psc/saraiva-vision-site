#!/bin/bash

# Installation Script for SaraivaVision PHP-FPM Optimizations
# Dr. Philipe Saraiva Cruz - CRM-MG 69.870
# Automated deployment of performance optimizations

set -euo pipefail

# Configuration
BACKUP_DIR="/backup/saraivavision-$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/saraivavision-optimization-install.log"
WEBSITE_URL="${WEBSITE_URL:-http://localhost}"

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

echo -e "${BLUE}🏥 SaraivaVision PHP-FPM Optimization Installation${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

log "Starting PHP-FPM optimization installation for SaraivaVision medical website"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ This script must be run as root or with sudo${NC}"
        exit 1
    fi
    
    # Check PHP version
    if ! command -v php &> /dev/null; then
        echo -e "${RED}❌ PHP is not installed${NC}"
        exit 1
    fi
    
    local php_version=$(php -v | head -n1 | cut -d" " -f2 | cut -d"." -f1,2)
    if [[ "$php_version" != "8.3" ]]; then
        echo -e "${YELLOW}⚠️  PHP version is $php_version, optimizations are designed for PHP 8.3${NC}"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check required packages
    local required_packages=("nginx" "redis-server")
    for package in "${required_packages[@]}"; do
        if ! dpkg -l | grep -q "^ii  $package "; then
            echo "Installing $package..."
            apt update && apt install -y "$package"
            log "Installed package: $package"
        fi
    done
    
    echo -e "${GREEN}✅ Prerequisites check completed${NC}"
}

# Function to create backups
create_backups() {
    echo -e "${YELLOW}Creating backups...${NC}"
    
    mkdir -p "$BACKUP_DIR"
    log "Created backup directory: $BACKUP_DIR"
    
    # Backup existing configurations
    local backup_files=(
        "/etc/php/8.3/fpm/php.ini"
        "/var/www/html/wp-config.php"
        "/etc/nginx/nginx.conf"
        "/etc/redis/redis.conf"
        "docker-compose.yml"
    )
    
    for file in "${backup_files[@]}"; do
        if [[ -f "$file" ]]; then
            cp "$file" "$BACKUP_DIR/$(basename "$file").backup"
            log "Backed up: $file"
        fi
    done
    
    echo -e "${GREEN}✅ Backups created in $BACKUP_DIR${NC}"
}

# Function to install Redis
install_redis() {
    echo -e "${YELLOW}Configuring Redis for medical website...${NC}"
    
    # Copy Redis configuration
    if [[ -f "redis-medical.conf" ]]; then
        cp "redis-medical.conf" "/etc/redis/redis.conf"
        chown redis:redis "/etc/redis/redis.conf"
        log "Installed Redis medical configuration"
    fi
    
    # Create Redis log directory
    mkdir -p "/var/log/redis"
    chown redis:redis "/var/log/redis"
    
    # Start and enable Redis
    systemctl restart redis-server
    systemctl enable redis-server
    
    # Test Redis connectivity
    if redis-cli ping | grep -q "PONG"; then
        echo -e "${GREEN}✅ Redis configured and running${NC}"
        log "Redis service started successfully"
    else
        echo -e "${RED}❌ Redis configuration failed${NC}"
        log "Error: Redis service failed to start"
        return 1
    fi
}

# Function to configure PHP-FPM
configure_php_fpm() {
    echo -e "${YELLOW}Configuring PHP-FPM for medical website...${NC}"
    
    # Copy PHP-FPM pool configuration
    if [[ -f "php-fpm-saraivavision.conf" ]]; then
        cp "php-fpm-saraivavision.conf" "/etc/php/8.3/fpm/pool.d/"
        log "Installed PHP-FPM pool configuration"
    fi
    
    # Copy optimized PHP configuration
    if [[ -f "php-optimized.ini" ]]; then
        cp "php-optimized.ini" "/etc/php/8.3/fpm/conf.d/99-optimized.ini"
        log "Installed optimized PHP configuration"
    fi
    
    # Create PHP log directories
    mkdir -p "/var/log/php"
    chown www-data:www-data "/var/log/php"
    
    # Test PHP-FPM configuration
    if php-fpm8.3 -t; then
        echo -e "${GREEN}✅ PHP-FPM configuration valid${NC}"
        
        # Restart PHP-FPM
        systemctl restart php8.3-fpm
        systemctl enable php8.3-fpm
        log "PHP-FPM service restarted successfully"
    else
        echo -e "${RED}❌ PHP-FPM configuration error${NC}"
        log "Error: PHP-FPM configuration validation failed"
        return 1
    fi
}

# Function to configure WordPress
configure_wordpress() {
    echo -e "${YELLOW}Configuring WordPress for performance...${NC}"
    
    # Install Redis Object Cache
    if [[ -f "wp-redis-object-cache.php" ]]; then
        local wp_content_dir
        if [[ -d "/var/www/html/wp-content" ]]; then
            wp_content_dir="/var/www/html/wp-content"
        elif [[ -d "./wordpress-local/wp-content" ]]; then
            wp_content_dir="./wordpress-local/wp-content"
        else
            echo -e "${YELLOW}⚠️  WordPress wp-content directory not found${NC}"
            read -p "Enter wp-content directory path: " wp_content_dir
        fi
        
        if [[ -d "$wp_content_dir" ]]; then
            cp "wp-redis-object-cache.php" "$wp_content_dir/object-cache.php"
            chown www-data:www-data "$wp_content_dir/object-cache.php"
            log "Installed Redis Object Cache"
            echo -e "${GREEN}✅ Redis Object Cache installed${NC}"
        fi
    fi
    
    # Update wp-config.php (optional, user decision)
    if [[ -f "wp-config-performance-optimized.php" ]]; then
        echo -e "${YELLOW}Found optimized wp-config.php${NC}"
        read -p "Replace current wp-config.php with optimized version? (y/N): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            local wp_config_path
            if [[ -f "/var/www/html/wp-config.php" ]]; then
                wp_config_path="/var/www/html/wp-config.php"
            elif [[ -f "./wp-config.php" ]]; then
                wp_config_path="./wp-config.php"
            else
                echo -e "${YELLOW}⚠️  wp-config.php not found${NC}"
                read -p "Enter wp-config.php path: " wp_config_path
            fi
            
            if [[ -f "$wp_config_path" ]]; then
                cp "$wp_config_path" "$BACKUP_DIR/wp-config.php.original"
                cp "wp-config-performance-optimized.php" "$wp_config_path"
                chown www-data:www-data "$wp_config_path"
                log "Updated wp-config.php with optimizations"
                echo -e "${GREEN}✅ WordPress configuration updated${NC}"
            fi
        fi
    fi
}

# Function to update Docker configuration
update_docker_config() {
    echo -e "${YELLOW}Updating Docker configuration...${NC}"
    
    if [[ -f "docker-compose-optimized.yml" ]]; then
        read -p "Replace current Docker Compose with optimized version? (y/N): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [[ -f "docker-compose.yml" ]]; then
                cp "docker-compose.yml" "$BACKUP_DIR/docker-compose.yml.original"
            fi
            
            cp "docker-compose-optimized.yml" "docker-compose.yml"
            log "Updated Docker Compose configuration"
            echo -e "${GREEN}✅ Docker configuration updated${NC}"
            
            # Ask if user wants to restart containers
            read -p "Restart Docker containers with new configuration? (y/N): " -n 1 -r
            echo ""
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker-compose down
                docker-compose up -d
                log "Restarted Docker containers"
                echo -e "${GREEN}✅ Docker containers restarted${NC}"
            fi
        fi
    fi
}

# Function to run performance tests
run_performance_tests() {
    echo -e "${YELLOW}Running performance tests...${NC}"
    
    if [[ -f "./benchmark-performance.sh" ]]; then
        echo "Running benchmark script..."
        chmod +x "./benchmark-performance.sh"
        ./benchmark-performance.sh || true
        echo -e "${GREEN}✅ Performance tests completed${NC}"
    fi
    
    # Basic connectivity tests
    echo "Testing website connectivity..."
    
    if curl -s "$WEBSITE_URL" > /dev/null; then
        echo -e "${GREEN}✅ Website accessible${NC}"
        log "Website connectivity test passed"
    else
        echo -e "${YELLOW}⚠️  Website connectivity test failed${NC}"
        log "Warning: Website connectivity test failed"
    fi
    
    # Test WordPress API
    if curl -s "$WEBSITE_URL/wp-json/wp/v2/posts" > /dev/null; then
        echo -e "${GREEN}✅ WordPress API accessible${NC}"
        log "WordPress API test passed"
    else
        echo -e "${YELLOW}⚠️  WordPress API test failed${NC}"
        log "Warning: WordPress API test failed"
    fi
}

# Function to display final instructions
display_final_instructions() {
    echo ""
    echo -e "${GREEN}🎉 Installation completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Monitor performance with: curl $WEBSITE_URL/fmp-status"
    echo "2. Check Redis cache: redis-cli info memory"
    echo "3. Verify OPcache: php -i | grep opcache"
    echo "4. Review logs in: /var/log/php/"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo "- Complete guide: PHP_FPM_OPTIMIZATION_GUIDE.md"
    echo "- Rollback script: ./rollback-php-optimizations.sh"
    echo "- Performance monitoring: ./benchmark-performance.sh"
    echo ""
    echo -e "${BLUE}💾 Backups saved to:${NC} $BACKUP_DIR"
    echo -e "${BLUE}📋 Installation log:${NC} $LOG_FILE"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "- Test all website functionality before going to production"
    echo "- Monitor server resources for the first few hours"
    echo "- Keep backup files until you're confident everything works"
    echo ""
}

# Main installation process
main() {
    echo -e "${BLUE}Starting installation process...${NC}"
    echo ""
    
    # Confirm installation
    echo -e "${YELLOW}This will install PHP-FPM optimizations for SaraivaVision medical website${NC}"
    echo -e "${YELLOW}including Redis Object Cache, OPcache tuning, and performance enhancements.${NC}"
    echo ""
    read -p "Continue with installation? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Installation cancelled.${NC}"
        exit 0
    fi
    
    log "User confirmed installation process"
    
    # Execute installation steps
    check_prerequisites
    echo ""
    
    create_backups
    echo ""
    
    install_redis
    echo ""
    
    configure_php_fpm
    echo ""
    
    configure_wordpress
    echo ""
    
    update_docker_config
    echo ""
    
    run_performance_tests
    echo ""
    
    display_final_instructions
    
    log "Installation process completed successfully"
}

# Handle script interruption
trap 'echo -e "\n${RED}Installation interrupted!${NC}"; log "Installation process interrupted"; exit 1' INT TERM

# Run installation
main "$@"