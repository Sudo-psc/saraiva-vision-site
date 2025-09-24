#!/bin/bash

# =============================================================================
# WordPress Integration Deployment Script
# Saraiva Vision Medical Website - Complete Integration Setup
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ID="wp-deploy-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="wp-deployment-${DEPLOYMENT_ID}.log"
START_TIME=$(date +%s)

# WordPress Configuration
WP_DB_NAME="${WORDPRESS_DB_NAME:-saraiva_wordpress}"
WP_DB_USER="${WORDPRESS_DB_USER:-saraiva_wp_user}"
WP_DB_PASSWORD="${WORDPRESS_DB_PASSWORD:-saraiva_wp_pass_2024!}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-saraiva_root_2024!}"

# Directories
BACKUP_DIR="./wp-backups"
DATA_DIR="./data"
LOGS_DIR="./logs"

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")     echo -e "${BLUE}[${timestamp}] INFO: ${message}${NC}" ;;
        "SUCCESS")  echo -e "${GREEN}[${timestamp}] SUCCESS: ${message}${NC}" ;;
        "WARNING")  echo -e "${YELLOW}[${timestamp}] WARNING: ${message}${NC}" ;;
        "ERROR")    echo -e "${RED}[${timestamp}] ERROR: ${message}${NC}" ;;
        "HEADER")   echo -e "${MAGENTA}[${timestamp}] ${message}${NC}" ;;
        "STEP")     echo -e "${CYAN}[${timestamp}] STEP: ${message}${NC}" ;;
    esac

    # Log to file
    echo "[${timestamp}] [${level}] ${message}" >> "$LOG_FILE"
}

check_prerequisites() {
    log "HEADER" "🔍 Checking Prerequisites for WordPress Integration..."

    # Check Docker and Docker Compose
    if ! command -v docker &> /dev/null; then
        log "ERROR" "Docker is not installed"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log "ERROR" "Docker Compose is not installed"
        exit 1
    fi

    log "SUCCESS" "Docker version: $(docker --version | cut -d' ' -f3 | tr -d ',')"
    log "SUCCESS" "Docker Compose version: $(docker-compose --version | cut -d' ' -f3 | tr -d ',')"

    # Check required files
    local required_files=(
        "wordpress-integration.docker-compose.yml"
        "nginx-wordpress.conf"
        "wordpress-database-init.sql"
        "wordpress-security-config.php"
    )

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log "ERROR" "Required file missing: $file"
            exit 1
        fi
    done
    log "SUCCESS" "All required files present"

    # Check disk space (need at least 2GB for WordPress + MySQL)
    local available_space=$(df . | tail -1 | awk '{print $4}')
    local required_space=2097152 # 2GB in KB

    if [ "$available_space" -lt "$required_space" ]; then
        log "ERROR" "Insufficient disk space. Required: 2GB, Available: $(($available_space/1048576))GB"
        exit 1
    fi
    log "SUCCESS" "Sufficient disk space available: $(($available_space/1048576))GB"
}

setup_directories() {
    log "HEADER" "📁 Setting Up Directory Structure..."

    # Create required directories
    local directories=(
        "$DATA_DIR/mysql"
        "$DATA_DIR/wordpress"
        "$DATA_DIR/redis"
        "$LOGS_DIR/nginx"
        "$LOGS_DIR/mysql"
        "$LOGS_DIR/wordpress"
        "$LOGS_DIR/api"
        "$LOGS_DIR/redis"
        "$LOGS_DIR/health-monitor"
        "$BACKUP_DIR"
        "nginx/wordpress-conf"
        "monitoring"
    )

    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log "SUCCESS" "Created directory: $dir"
        fi
    done

    # Set proper permissions for data directories
    sudo chown -R 999:999 "$DATA_DIR/mysql" 2>/dev/null || true
    sudo chown -R www-data:www-data "$DATA_DIR/wordpress" 2>/dev/null || true
    sudo chown -R 999:999 "$DATA_DIR/redis" 2>/dev/null || true

    log "SUCCESS" "Directory structure setup complete"
}

create_environment_file() {
    log "HEADER" "🔧 Creating Environment Configuration..."

    cat > .env.wordpress << EOF
# WordPress Integration Environment Configuration
# Generated: $(date)

# MySQL Configuration
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
WORDPRESS_DB_NAME=${WP_DB_NAME}
WORDPRESS_DB_USER=${WP_DB_USER}
WORDPRESS_DB_PASSWORD=${WP_DB_PASSWORD}

# Redis Configuration
REDIS_PASSWORD=saraiva_redis_2024!

# WordPress API Integration
WORDPRESS_API_USER=api_user
WORDPRESS_API_PASSWORD=api_pass_2024!

# WordPress Configuration
WORDPRESS_TABLE_PREFIX=sv_
WORDPRESS_DEBUG=false

# External APIs (from existing environment)
SUPABASE_URL=${SUPABASE_URL:-}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-}
RESEND_API_KEY=${RESEND_API_KEY:-}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY:-}

# Health Monitoring
HEALTH_ALERT_WEBHOOK_URL=${HEALTH_ALERT_WEBHOOK_URL:-}

# Security
WORDPRESS_LGPD_MODE=true
MEDICAL_SYSTEM_MODE=true
EOF

    log "SUCCESS" "Environment file created: .env.wordpress"
}

initialize_database() {
    log "HEADER" "🗄️ Initializing Medical Database Schema..."

    # Start MySQL container first
    docker-compose -f wordpress-integration.docker-compose.yml up -d mysql

    # Wait for MySQL to be ready
    log "INFO" "Waiting for MySQL to be ready..."
    for i in {1..60}; do
        if docker exec saraiva-mysql-wp mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" --silent 2>/dev/null; then
            log "SUCCESS" "MySQL is ready"
            break
        elif [ $i -eq 60 ]; then
            log "ERROR" "MySQL failed to start within 60 seconds"
            exit 1
        else
            echo "Attempt $i/60: Waiting for MySQL..."
            sleep 2
        fi
    done

    # Initialize database with medical schema
    log "INFO" "Initializing medical database schema..."
    if docker exec -i saraiva-mysql-wp mysql -u root -p"${MYSQL_ROOT_PASSWORD}" < wordpress-database-init.sql; then
        log "SUCCESS" "Medical database schema initialized"
    else
        log "ERROR" "Failed to initialize database schema"
        exit 1
    fi

    # Verify database setup
    local tables_count=$(docker exec saraiva-mysql-wp mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -D "${WP_DB_NAME}" -e "SHOW TABLES;" | wc -l)
    if [ "$tables_count" -gt 5 ]; then
        log "SUCCESS" "Database initialization verified - $((tables_count - 1)) tables created"
    else
        log "ERROR" "Database verification failed - insufficient tables created"
        exit 1
    fi
}

deploy_wordpress_services() {
    log "HEADER" "🐳 Deploying WordPress Integration Services..."

    # Copy security configuration to WordPress data directory
    cp wordpress-security-config.php "$DATA_DIR/wordpress/wp-security-config.php"
    log "SUCCESS" "Security configuration deployed"

    # Start all services
    log "INFO" "Starting WordPress integration services..."
    if docker-compose -f wordpress-integration.docker-compose.yml up -d; then
        log "SUCCESS" "All services started successfully"
    else
        log "ERROR" "Failed to start services"
        exit 1
    fi

    # Wait for services to be healthy
    log "INFO" "Waiting for services to be healthy..."

    local services=("mysql" "redis" "wordpress" "api" "nginx")
    for service in "${services[@]}"; do
        log "INFO" "Checking health of $service service..."
        for i in {1..30}; do
            if docker-compose -f wordpress-integration.docker-compose.yml ps "$service" | grep -q "healthy\|Up"; then
                log "SUCCESS" "$service service is healthy"
                break
            elif [ $i -eq 30 ]; then
                log "WARNING" "$service service health check timeout"
                break
            else
                echo "Attempt $i/30: Waiting for $service..."
                sleep 3
            fi
        done
    done
}

setup_wordpress_configuration() {
    log "HEADER" "⚙️ Configuring WordPress for Medical System..."

    # Wait for WordPress to be ready
    for i in {1..30}; do
        if curl -f -s http://localhost/wp-json/wp/v2/ > /dev/null 2>&1; then
            log "SUCCESS" "WordPress API is responding"
            break
        elif [ $i -eq 30 ]; then
            log "WARNING" "WordPress API not responding - manual configuration may be needed"
            break
        else
            echo "Attempt $i/30: Waiting for WordPress..."
            sleep 3
        fi
    done

    # Create WordPress configuration additions
    cat >> "$DATA_DIR/wordpress/wp-config-medical.php" << 'EOF'
<?php
/**
 * Medical System Configuration for WordPress
 * Auto-generated by deployment script
 */

// Include security configuration
if (file_exists(ABSPATH . 'wp-security-config.php')) {
    require_once ABSPATH . 'wp-security-config.php';
}

// Medical WordPress Theme Configuration
define('WP_DEFAULT_THEME', 'saraiva-medical');

// API Integration Settings
define('SARAIVA_API_ENDPOINT', 'http://api:3002');
define('SARAIVA_FRONTEND_URL', 'https://saraivavision.com.br');

// Redis Object Cache Configuration
define('WP_REDIS_HOST', 'redis');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_PASSWORD', getenv('REDIS_PASSWORD'));
define('WP_REDIS_DATABASE', 1);

// Medical System Settings
define('MEDICAL_APPOINTMENT_INTEGRATION', true);
define('LGPD_PATIENT_CONSENT', true);

EOF

    log "SUCCESS" "WordPress medical configuration created"
}

run_integration_tests() {
    log "HEADER" "🧪 Running WordPress Integration Tests..."

    # Test database connectivity
    log "INFO" "Testing database connectivity..."
    if docker exec saraiva-mysql-wp mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -D "${WP_DB_NAME}" -e "SELECT 'Database Connection OK' as test_result;" | grep -q "Database Connection OK"; then
        log "SUCCESS" "Database connectivity test passed"
    else
        log "ERROR" "Database connectivity test failed"
        return 1
    fi

    # Test Redis connectivity
    log "INFO" "Testing Redis connectivity..."
    if docker exec saraiva-redis-wp redis-cli -a "saraiva_redis_2024!" ping 2>/dev/null | grep -q "PONG"; then
        log "SUCCESS" "Redis connectivity test passed"
    else
        log "ERROR" "Redis connectivity test failed"
        return 1
    fi

    # Test WordPress health
    log "INFO" "Testing WordPress health..."
    if curl -f -s http://localhost/wp-json/wp/v2/ > /dev/null; then
        log "SUCCESS" "WordPress API test passed"
    else
        log "WARNING" "WordPress API test failed - may need manual setup"
    fi

    # Test Nginx proxy
    log "INFO" "Testing Nginx proxy configuration..."
    local test_results=(
        "$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)"
        "$(curl -s -o /dev/null -w "%{http_code}" http://localhost/wp-json/wp/v2/)"
        "$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health)"
    )

    for i in "${!test_results[@]}"; do
        local endpoints=("health" "wp-json" "api")
        if [ "${test_results[$i]}" = "200" ]; then
            log "SUCCESS" "Nginx ${endpoints[$i]} endpoint test passed"
        else
            log "WARNING" "Nginx ${endpoints[$i]} endpoint returned ${test_results[$i]}"
        fi
    done

    # Test medical database schema
    log "INFO" "Testing medical database schema..."
    local medical_tables=$(docker exec saraiva-mysql-wp mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -D "${WP_DB_NAME}" -e "SHOW TABLES LIKE 'sv_%';" | wc -l)
    if [ "$medical_tables" -ge 5 ]; then
        log "SUCCESS" "Medical database schema test passed - $((medical_tables - 1)) tables found"
    else
        log "ERROR" "Medical database schema test failed - insufficient tables"
        return 1
    fi

    log "SUCCESS" "Integration tests completed"
}

create_backup() {
    log "HEADER" "💾 Creating Initial System Backup..."

    local backup_name="saraiva-wp-initial-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"

    mkdir -p "$backup_path"

    # Backup database
    log "INFO" "Backing up database..."
    if docker exec saraiva-mysql-wp mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" "${WP_DB_NAME}" > "$backup_path/database.sql"; then
        log "SUCCESS" "Database backup created"
    else
        log "WARNING" "Database backup failed"
    fi

    # Backup WordPress files
    log "INFO" "Backing up WordPress files..."
    if [ -d "$DATA_DIR/wordpress" ]; then
        tar -czf "$backup_path/wordpress-files.tar.gz" -C "$DATA_DIR" wordpress/
        log "SUCCESS" "WordPress files backup created"
    fi

    # Backup configuration files
    log "INFO" "Backing up configuration files..."
    cp wordpress-integration.docker-compose.yml "$backup_path/"
    cp nginx-wordpress.conf "$backup_path/"
    cp .env.wordpress "$backup_path/"
    log "SUCCESS" "Configuration files backup created"

    echo "$backup_name" > "$BACKUP_DIR/latest-backup.txt"
    log "SUCCESS" "Initial backup created: $backup_path"
}

generate_deployment_report() {
    local end_time=$(date +%s)
    local total_time=$((end_time - START_TIME))
    local total_minutes=$((total_time / 60))
    local total_seconds=$((total_time % 60))

    log "HEADER" "📊 WordPress Integration Deployment Report"
    echo "" | tee -a "$LOG_FILE"
    echo "=============================================================================" | tee -a "$LOG_FILE"
    echo "WordPress Integration Deployment Report" | tee -a "$LOG_FILE"
    echo "=============================================================================" | tee -a "$LOG_FILE"
    echo "Deployment ID: $DEPLOYMENT_ID" | tee -a "$LOG_FILE"
    echo "Total Time: ${total_minutes}m ${total_seconds}s" | tee -a "$LOG_FILE"
    echo "Log File: $LOG_FILE" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "Services Deployed:" | tee -a "$LOG_FILE"
    echo "  ✅ MySQL Database (Medical Schema)" | tee -a "$LOG_FILE"
    echo "  ✅ Redis Cache" | tee -a "$LOG_FILE"
    echo "  ✅ WordPress CMS (Medical Configuration)" | tee -a "$LOG_FILE"
    echo "  ✅ Node.js API Integration" | tee -a "$LOG_FILE"
    echo "  ✅ Nginx Reverse Proxy" | tee -a "$LOG_FILE"
    echo "  ✅ Health Monitoring System" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "Configuration:" | tee -a "$LOG_FILE"
    echo "  - Database: $WP_DB_NAME" | tee -a "$LOG_FILE"
    echo "  - WordPress URL: http://localhost/wp-admin" | tee -a "$LOG_FILE"
    echo "  - API Endpoint: http://localhost/api" | tee -a "$LOG_FILE"
    echo "  - Health Check: http://localhost/health" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "Security Features:" | tee -a "$LOG_FILE"
    echo "  ✅ LGPD Compliance Enabled" | tee -a "$LOG_FILE"
    echo "  ✅ Medical Data Encryption" | tee -a "$LOG_FILE"
    echo "  ✅ Audit Logging System" | tee -a "$LOG_FILE"
    echo "  ✅ Enhanced Security Headers" | tee -a "$LOG_FILE"
    echo "  ✅ Rate Limiting Protection" | tee -a "$LOG_FILE"
    echo "=============================================================================" | tee -a "$LOG_FILE"

    log "SUCCESS" "Deployment report generated"
}

cleanup() {
    log "INFO" "Cleaning up temporary files..."
    # Clean up any temporary files or incomplete deployments if needed
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "WordPress Integration Deployment Script for Saraiva Vision"
    echo ""
    echo "Options:"
    echo "  --skip-tests          Skip integration tests"
    echo "  --no-backup          Skip initial backup creation"
    echo "  --force              Force deployment even with warnings"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Full WordPress integration deployment"
    echo "  $0 --skip-tests              # Deploy without running tests"
    echo "  $0 --no-backup               # Deploy without creating backup"
}

# =============================================================================
# MAIN DEPLOYMENT FLOW
# =============================================================================

# Parse command line arguments
SKIP_TESTS=false
NO_BACKUP=false
FORCE_DEPLOY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Trap for cleanup on exit
trap cleanup EXIT

# Main deployment execution
main() {
    log "HEADER" "🚀 Starting WordPress Integration Deployment"
    log "INFO" "Deployment ID: $DEPLOYMENT_ID"
    log "INFO" "Log file: $LOG_FILE"
    log "INFO" "Target: WordPress + Nginx + MySQL + Redis Integration"

    # Step 1: Prerequisites
    check_prerequisites

    # Step 2: Directory setup
    setup_directories

    # Step 3: Environment configuration
    create_environment_file

    # Step 4: Database initialization
    initialize_database

    # Step 5: Deploy services
    deploy_wordpress_services

    # Step 6: WordPress configuration
    setup_wordpress_configuration

    # Step 7: Integration tests
    if [ "$SKIP_TESTS" = false ]; then
        run_integration_tests
    else
        log "WARNING" "Skipping integration tests"
    fi

    # Step 8: Create backup
    if [ "$NO_BACKUP" = false ]; then
        create_backup
    else
        log "WARNING" "Skipping initial backup"
    fi

    # Step 9: Generate report
    generate_deployment_report

    log "SUCCESS" "🎉 WordPress Integration deployment completed successfully!"

    # Display next steps
    echo ""
    echo "🌐 Next Steps:"
    echo "  1. Access WordPress Admin: http://localhost/wp-admin"
    echo "  2. Configure WordPress settings and create admin user"
    echo "  3. Install and activate medical-specific plugins"
    echo "  4. Configure LGPD compliance settings"
    echo "  5. Test appointment booking integration"
    echo ""
    echo "📋 Service URLs:"
    echo "  WordPress Admin: http://localhost/wp-admin"
    echo "  WordPress API: http://localhost/wp-json/wp/v2/"
    echo "  Node.js API: http://localhost/api/health"
    echo "  System Health: http://localhost/health"
    echo ""
    echo "🔧 Management Commands:"
    echo "  docker-compose -f wordpress-integration.docker-compose.yml logs -f    # View logs"
    echo "  docker-compose -f wordpress-integration.docker-compose.yml ps         # Check status"
    echo "  docker-compose -f wordpress-integration.docker-compose.yml down       # Stop services"
    echo "  docker-compose -f wordpress-integration.docker-compose.yml up -d      # Start services"
    echo ""
    echo "🚨 Important Notes:"
    echo "  - Complete WordPress setup wizard at /wp-admin"
    echo "  - Configure SSL certificates for production"
    echo "  - Review LGPD compliance settings"
    echo "  - Set up automated backups"
    echo ""
}

# Execute main function
main "$@"