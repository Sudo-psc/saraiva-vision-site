#!/bin/bash

# =============================================================================
# Saraiva Vision VPS Deployment Script (Improved)
# Safe deployment with proper error handling, rollback, and validation
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration with environment variable overrides
BUILD_DIR="${BUILD_DIR:-dist}"
WEB_ROOT="${WEB_ROOT:-/var/www/html}"
BACKUP_DIR="${BACKUP_DIR:-/var/www/backup}"
NGINX_SITES_AVAILABLE="${NGINX_SITES_AVAILABLE:-/etc/nginx/sites-available}"
NGINX_SITES_ENABLED="${NGINX_SITES_ENABLED:-/etc/nginx/sites-enabled}"
SITE_NAME="${SITE_NAME:-saraivavision}"

# Deployment options
SKIP_BACKUP=false
SKIP_TESTS=false
DRY_RUN=false
FORCE_DEPLOY=false

# Global variables for cleanup
BACKUP_NAME=""
TEMP_FILES=""
DEPLOYMENT_ID="vps-deploy-$(date +%Y%m%d-%H%M%S)"

# =============================================================================
# LOGGING AND UTILITY FUNCTIONS
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
    esac
}

check_prerequisites() {
    log "HEADER" "🔍 Checking Prerequisites..."

    # Check if running with appropriate permissions
    if [[ $EUID -eq 0 ]] && [[ "$FORCE_DEPLOY" = false ]]; then
        log "ERROR" "Running as root is not recommended. Use --force to override or run as non-root user."
        exit 1
    fi

    # Check required directories exist
    if [[ ! -d "$BUILD_DIR" ]]; then
        log "ERROR" "Build directory not found: $BUILD_DIR"
        log "INFO" "Run 'npm run build' first to create the build"
        exit 1
    fi

    if [[ ! -f "$BUILD_DIR/index.html" ]]; then
        log "ERROR" "Build appears incomplete: $BUILD_DIR/index.html not found"
        exit 1
    fi

    # Check nginx is available
    if ! command -v nginx &> /dev/null; then
        log "ERROR" "nginx is not installed or not in PATH"
        exit 1
    fi

    # Check systemctl is available
    if ! command -v systemctl &> /dev/null; then
        log "ERROR" "systemctl is not available (not running on systemd?)"
        exit 1
    fi

    log "SUCCESS" "Prerequisites check passed"
}

create_backup() {
    if [[ "$SKIP_BACKUP" = true ]]; then
        log "WARNING" "Skipping backup creation"
        return 0
    fi

    log "HEADER" "📦 Creating Backup..."

    if [[ -d "$WEB_ROOT" ]]; then
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="saraiva-vision-backup-$(date +%Y%m%d-%H%M%S)"

        if cp -r "$WEB_ROOT" "$BACKUP_DIR/$BACKUP_NAME"; then
            log "SUCCESS" "Backup created: $BACKUP_DIR/$BACKUP_NAME"
            echo "$BACKUP_DIR/$BACKUP_NAME" > "/tmp/last-backup-$DEPLOYMENT_ID.txt"
            TEMP_FILES="$TEMP_FILES /tmp/last-backup-$DEPLOYMENT_ID.txt"
        else
            log "ERROR" "Failed to create backup"
            if [[ "$FORCE_DEPLOY" = false ]]; then
                exit 1
            fi
        fi
    else
        log "INFO" "No existing web root to backup"
    fi
}

run_tests() {
    if [[ "$SKIP_TESTS" = true ]]; then
        log "WARNING" "Skipping tests"
        return 0
    fi

    log "HEADER" "🧪 Running Pre-deployment Tests..."

    # Test build integrity
    local required_files=("index.html")
    local required_dirs=("assets")

    for file in "${required_files[@]}"; do
        if [[ ! -f "$BUILD_DIR/$file" ]]; then
            log "ERROR" "Required build file missing: $file"
            return 1
        fi
    done

    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$BUILD_DIR/$dir" ]]; then
            log "WARNING" "Expected build directory missing: $dir"
        fi
    done

    # Test nginx configuration syntax
    if nginx -t 2>/dev/null; then
        log "SUCCESS" "Nginx configuration is valid"
    else
        log "ERROR" "Nginx configuration test failed"
        return 1
    fi

    log "SUCCESS" "Pre-deployment tests passed"
}

deploy_files() {
    if [[ "$DRY_RUN" = true ]]; then
        log "INFO" "DRY RUN: Would deploy files to $WEB_ROOT"
        return 0
    fi

    log "HEADER" "📂 Deploying Files..."

    # Create web root directory if it doesn't exist
    mkdir -p "$WEB_ROOT"

    # Create temporary directory for staging
    local temp_deploy_dir="/tmp/deploy-staging-$DEPLOYMENT_ID"
    mkdir -p "$temp_deploy_dir"
    TEMP_FILES="$TEMP_FILES $temp_deploy_dir"

    # Copy build files to staging
    if cp -r "$BUILD_DIR"/* "$temp_deploy_dir/"; then
        log "SUCCESS" "Files staged for deployment"
    else
        log "ERROR" "Failed to stage files"
        return 1
    fi

    # Atomic deployment: move staging to live
    if [[ -d "$WEB_ROOT.old" ]]; then
        rm -rf "$WEB_ROOT.old"
    fi

    if [[ -d "$WEB_ROOT" ]]; then
        mv "$WEB_ROOT" "$WEB_ROOT.old"
    fi

    if mv "$temp_deploy_dir" "$WEB_ROOT"; then
        log "SUCCESS" "Files deployed atomically"
        rm -rf "$WEB_ROOT.old"
    else
        log "ERROR" "Atomic deployment failed"
        # Rollback
        if [[ -d "$WEB_ROOT.old" ]]; then
            mv "$WEB_ROOT.old" "$WEB_ROOT"
            log "INFO" "Rollback completed"
        fi
        return 1
    fi
}

set_permissions() {
    if [[ "$DRY_RUN" = true ]]; then
        log "INFO" "DRY RUN: Would set permissions on $WEB_ROOT"
        return 0
    fi

    log "HEADER" "🔒 Setting Permissions..."

    # Detect web server user
    local web_user="www-data"
    if ! id "$web_user" &>/dev/null; then
        web_user="nginx"
        if ! id "$web_user" &>/dev/null; then
            web_user="apache"
            if ! id "$web_user" &>/dev/null; then
                log "WARNING" "Could not detect web server user, using current user"
                web_user="$(whoami)"
            fi
        fi
    fi

    if chown -R "$web_user:$web_user" "$WEB_ROOT" 2>/dev/null; then
        log "SUCCESS" "Ownership set to $web_user"
    else
        log "WARNING" "Could not set ownership (insufficient permissions)"
    fi

    chmod -R 755 "$WEB_ROOT"
    find "$WEB_ROOT" -type f -exec chmod 644 {} \;
    log "SUCCESS" "Permissions set correctly"
}

update_nginx_config() {
    if [[ "$DRY_RUN" = true ]]; then
        log "INFO" "DRY RUN: Would update nginx configuration"
        return 0
    fi

    log "HEADER" "⚙️ Updating Nginx Configuration..."

    local config_file="$NGINX_SITES_AVAILABLE/$SITE_NAME"
    local config_updated=false

    # Only create config if it doesn't exist
    if [[ ! -f "$config_file" ]]; then
        log "INFO" "Creating new nginx configuration..."

        cat > "$config_file" << EOF
# Saraiva Vision Nginx Configuration
# Generated on $(date)
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;
    root $WEB_ROOT;
    index index.html index.php;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Static file caching with versioning support
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        try_files \$uri =404;
    }

    # React Router fallback
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # API proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WordPress endpoints
    location /wp-json/ {
        proxy_pass http://localhost:8083;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
EOF
        config_updated=true
        log "SUCCESS" "Nginx configuration created"
    else
        log "INFO" "Nginx configuration already exists, not overwriting"
    fi

    # Enable site
    if [[ ! -L "$NGINX_SITES_ENABLED/$SITE_NAME" ]]; then
        ln -sf "$NGINX_SITES_AVAILABLE/$SITE_NAME" "$NGINX_SITES_ENABLED/$SITE_NAME"
        log "SUCCESS" "Site enabled"
        config_updated=true
    fi

    # Test configuration
    if nginx -t 2>/dev/null; then
        log "SUCCESS" "Nginx configuration is valid"

        if [[ "$config_updated" = true ]]; then
            systemctl reload nginx
            log "SUCCESS" "Nginx reloaded"
        fi
    else
        log "ERROR" "Nginx configuration test failed"
        return 1
    fi
}

verify_deployment() {
    log "HEADER" "🔍 Verifying Deployment..."

    # Check if files exist
    if [[ -f "$WEB_ROOT/index.html" ]]; then
        log "SUCCESS" "Frontend files deployed"
    else
        log "ERROR" "Frontend deployment verification failed"
        return 1
    fi

    # Check services
    if systemctl is-active --quiet nginx; then
        log "SUCCESS" "Nginx is running"
    else
        log "ERROR" "Nginx is not running"
        return 1
    fi

    # Test HTTP response
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost/" | grep -q "200\|301\|302"; then
        log "SUCCESS" "HTTP response check passed"
    else
        log "WARNING" "HTTP response check failed (service might still be starting)"
    fi

    log "SUCCESS" "Deployment verification completed"
}

rollback_deployment() {
    log "HEADER" "🔄 Rolling Back Deployment..."

    if [[ -f "/tmp/last-backup-$DEPLOYMENT_ID.txt" ]]; then
        local backup_path=$(cat "/tmp/last-backup-$DEPLOYMENT_ID.txt")
        if [[ -d "$backup_path" ]]; then
            rm -rf "$WEB_ROOT"
            cp -r "$backup_path" "$WEB_ROOT"
            systemctl reload nginx
            log "SUCCESS" "Rollback completed from: $backup_path"
        else
            log "ERROR" "Backup not found: $backup_path"
        fi
    else
        log "ERROR" "No backup information found for rollback"
    fi
}

cleanup() {
    log "INFO" "Cleaning up temporary files..."
    if [[ -n "$TEMP_FILES" ]]; then
        rm -rf $TEMP_FILES
    fi
}

# =============================================================================
# MAIN DEPLOYMENT FLOW
# =============================================================================

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

VPS Deployment Script for Saraiva Vision

Options:
  --skip-backup         Skip backup creation
  --skip-tests          Skip pre-deployment tests
  --dry-run            Show what would be done without making changes
  --force              Force deployment even with warnings
  --help               Show this help message

Environment Variables:
  BUILD_DIR            Build directory (default: dist)
  WEB_ROOT            Web server root (default: /var/www/html)
  BACKUP_DIR          Backup directory (default: /var/www/backup)
  SITE_NAME           Nginx site name (default: saraivavision)

Examples:
  $0                          # Standard deployment
  $0 --dry-run               # Preview changes
  $0 --skip-backup --force   # Quick deployment
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
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

# Main deployment function
main() {
    log "HEADER" "🚀 Starting Saraiva Vision VPS Deployment"
    log "INFO" "Deployment ID: $DEPLOYMENT_ID"

    if [[ "$DRY_RUN" = true ]]; then
        log "INFO" "DRY RUN MODE - No changes will be made"
    fi

    # Execute deployment steps
    check_prerequisites || exit 1
    create_backup || exit 1
    run_tests || exit 1
    deploy_files || { rollback_deployment; exit 1; }
    set_permissions || { rollback_deployment; exit 1; }
    update_nginx_config || { rollback_deployment; exit 1; }
    verify_deployment || { rollback_deployment; exit 1; }

    log "SUCCESS" "🎉 VPS Deployment completed successfully!"

    echo ""
    echo "📋 Deployment Summary:"
    echo "   ✅ Files deployed to: $WEB_ROOT"
    echo "   ✅ Nginx configured and running"
    if [[ -n "$BACKUP_NAME" ]]; then
        echo "   ✅ Backup created: $BACKUP_DIR/$BACKUP_NAME"
    fi
    echo ""
    echo "🌐 Website: https://saraivavision.com.br"
    echo "🔍 Health check: https://saraivavision.com.br/health"
    echo ""
    echo "🛠️  Useful commands:"
    echo "   systemctl status nginx"
    echo "   journalctl -u nginx -f"
    echo "   nginx -t"
    echo ""
    if [[ -n "$BACKUP_NAME" ]]; then
        echo "📝 To rollback:"
        echo "   rm -rf $WEB_ROOT && cp -r $BACKUP_DIR/$BACKUP_NAME $WEB_ROOT && systemctl reload nginx"
    fi
}

# Execute main function
main "$@"