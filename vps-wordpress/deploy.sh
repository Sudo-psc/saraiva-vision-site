#!/bin/bash

# WordPress Headless CMS Deployment Script
# Complete deployment automation for VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORDPRESS_DIR="/opt/wordpress-cms"
BACKUP_DIR="/opt/backups/wordpress"
DOMAIN="cms.saraivavision.com.br"

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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if running as correct user
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please run setup-vps.sh first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please run setup-vps.sh first."
    fi
    
    # Check if user is in docker group
    if ! groups $USER | grep -q docker; then
        error "User $USER is not in docker group. Please run: sudo usermod -aG docker $USER && newgrp docker"
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        error ".env file not found. Please create it from .env.example"
    fi
    
    log "Prerequisites check passed"
}

# Create directory structure
create_directories() {
    log "Creating directory structure..."
    
    sudo mkdir -p "$WORDPRESS_DIR"
    sudo chown $USER:$USER "$WORDPRESS_DIR"
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p /var/log/wordpress
    
    log "Directory structure created"
}

# Copy files to deployment directory
copy_files() {
    log "Copying files to deployment directory..."
    
    # Copy all configuration files
    cp -r . "$WORDPRESS_DIR/"
    
    # Set proper permissions
    chmod +x "$WORDPRESS_DIR"/*.sh
    
    log "Files copied successfully"
}

# Generate secure passwords if not set
generate_passwords() {
    log "Checking environment configuration..."
    
    source .env
    
    # Generate MySQL password if not set
    if [ -z "$MYSQL_PASSWORD" ] || [ "$MYSQL_PASSWORD" = "your_secure_mysql_password_here" ]; then
        MYSQL_PASSWORD=$(openssl rand -base64 32)
        # Use a temporary file and exact matching
        awk -v pass="$MYSQL_PASSWORD" '/^MYSQL_PASSWORD=/ {print "MYSQL_PASSWORD=" pass; next} {print}' .env > .env.tmp && mv .env.tmp .env
        log "Generated new MySQL password"
    fi
    
    # Generate MySQL root password if not set
    if [ -z "$MYSQL_ROOT_PASSWORD" ] || [ "$MYSQL_ROOT_PASSWORD" = "your_secure_root_password_here" ]; then
        MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
        sed -i "s/MYSQL_ROOT_PASSWORD=.*/MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD/" .env
        log "Generated new MySQL root password"
    fi
    
    # Generate JWT secret if not set
    if [ -z "$JWT_SECRET_KEY" ] || [ "$JWT_SECRET_KEY" = "your_jwt_secret_key_for_graphql_auth" ]; then
        JWT_SECRET_KEY=$(openssl rand -base64 64)
        sed -i "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$JWT_SECRET_KEY/" .env
        log "Generated new JWT secret key"
    fi
    
    log "Environment configuration updated"
}

# Start WordPress services
start_services() {
    log "Starting WordPress services..."
    
    cd "$WORDPRESS_DIR"
    
    # Pull latest images
    docker-compose pull
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log "WordPress services started successfully"
    else
        error "Failed to start WordPress services"
    fi
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Check if certificates already exist
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        log "SSL certificates already exist"
        return 0
    fi
    
    # Run SSL setup script
    if [ -f "setup-ssl.sh" ]; then
        sudo ./setup-ssl.sh
    else
        warn "SSL setup script not found. Please run it manually."
    fi
}

# Install WordPress plugins
install_plugins() {
    log "Installing WordPress plugins..."
    
    cd "$WORDPRESS_DIR"
    
    # Wait for WordPress to be fully ready
    log "Waiting for WordPress to be ready..."
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T wordpress wp core is-installed --allow-root 2>/dev/null; then
            log "WordPress is ready!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "WordPress did not become ready within the expected time"
        fi
        
        log "Attempt $attempt/$max_attempts: WordPress not ready yet, waiting..."
        sleep 10
        ((attempt++))
    done
    
    # Run plugin installation script
    if [ -f "install-plugins.sh" ]; then
        ./install-plugins.sh
    else
        warn "Plugin installation script not found"
    fi
}

# Configure monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Enable systemd service
    sudo systemctl enable wordpress-cms.service
    
    # Start monitoring cron jobs
    if ! crontab -l | grep -q "wordpress-monitor.sh"; then
        (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/wordpress-monitor.sh") | crontab -
        log "Monitoring cron job added"
    fi
    
    # Start backup cron jobs
    if ! crontab -l | grep -q "wordpress-backup.sh"; then
        (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/wordpress-backup.sh >> /var/log/wordpress/backup.log 2>&1") | crontab -
        log "Backup cron job added"
    fi
    
    log "Monitoring setup completed"
}

# Run health checks
health_check() {
    log "Running health checks..."
    
    cd "$WORDPRESS_DIR"
    
    # Check container status
    info "Container status:"
    docker-compose ps
    
    # Check WordPress installation
    if docker-compose exec -T wordpress wp core is-installed --allow-root 2>/dev/null; then
        log "✓ WordPress is installed and accessible"
    else
        warn "✗ WordPress installation check failed"
    fi
    
    # Check database connection
    if docker-compose exec -T db mysqladmin ping -h localhost --silent; then
        log "✓ Database is accessible"
    else
        warn "✗ Database connection failed"
    fi
    
    # Check Redis connection
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        log "✓ Redis is accessible"
    else
        warn "✗ Redis connection failed"
    fi
    
    # Check GraphQL endpoint
    if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/graphql" | grep -q "200\|400"; then
        log "✓ GraphQL endpoint is accessible"
    else
        warn "✗ GraphQL endpoint check failed"
    fi
    
    # Check SSL certificate
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        log "✓ SSL certificate is installed"
        
        # Check certificate expiry
        EXPIRY_DATE=$(openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -enddate -noout | cut -d= -f2)
        EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
        CURRENT_TIMESTAMP=$(date +%s)
        DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_TIMESTAMP - $CURRENT_TIMESTAMP) / 86400 ))
        
        if [ $DAYS_UNTIL_EXPIRY -gt 30 ]; then
            log "✓ SSL certificate is valid for $DAYS_UNTIL_EXPIRY days"
        else
            warn "⚠ SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
        fi
    else
        warn "✗ SSL certificate not found"
    fi
    
    log "Health check completed"
}

# Display deployment summary
deployment_summary() {
    log "Deployment Summary"
    log "=================="
    log ""
    log "WordPress CMS URL: https://$DOMAIN"
    log "WordPress Admin: https://$DOMAIN/wp-admin"
    log "GraphQL Endpoint: https://$DOMAIN/graphql"
    log ""
    log "Services:"
    log "- WordPress: Running on port 9000 (internal)"
    log "- MySQL/MariaDB: Running on port 3306 (internal)"
    log "- Redis: Running on port 6379 (internal)"
    log "- Nginx: Running on ports 80/443"
    log ""
    log "Monitoring:"
    log "- Health checks: Every 5 minutes"
    log "- Backups: Daily at 2:00 AM"
    log "- SSL renewal: Automatic"
    log ""
    log "Log files:"
    log "- WordPress logs: /var/log/wordpress/"
    log "- Nginx logs: /var/log/nginx/"
    log "- Container logs: docker-compose logs"
    log ""
    log "Management commands:"
    log "- Check status: docker-compose ps"
    log "- View logs: docker-compose logs -f"
    log "- Restart services: docker-compose restart"
    log "- Stop services: docker-compose down"
    log "- SSL info: ssl-info.sh"
    log "- Create backup: wordpress-backup.sh"
    log ""
    warn "Important: Save your .env file securely - it contains sensitive passwords!"
    log ""
    log "Deployment completed successfully! 🎉"
}

# Main deployment function
main() {
    log "Starting WordPress Headless CMS deployment..."
    
    check_prerequisites
    create_directories
    copy_files
    generate_passwords
    start_services
    setup_ssl
    install_plugins
    setup_monitoring
    health_check
    deployment_summary
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "health")
        health_check
        ;;
    "restart")
        log "Restarting WordPress services..."
        cd "$WORDPRESS_DIR"
        docker-compose restart
        health_check
        ;;
    "stop")
        log "Stopping WordPress services..."
        cd "$WORDPRESS_DIR"
        docker-compose down
        ;;
    "start")
        log "Starting WordPress services..."
        cd "$WORDPRESS_DIR"
        docker-compose up -d
        health_check
        ;;
    "logs")
        cd "$WORDPRESS_DIR"
        docker-compose logs -f
        ;;
    "backup")
        /usr/local/bin/wordpress-backup.sh
        ;;
    *)
        echo "Usage: $0 {deploy|health|restart|stop|start|logs|backup}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment (default)"
        echo "  health  - Run health checks"
        echo "  restart - Restart all services"
        echo "  stop    - Stop all services"
        echo "  start   - Start all services"
        echo "  logs    - View live logs"
        echo "  backup  - Create backup"
        exit 1
        ;;
esac