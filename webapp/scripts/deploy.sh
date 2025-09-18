#!/bin/bash

# Enhanced Deploy Script - Saraiva Vision
# Version management with zero-downtime deployment

set -euo pipefail

# Configuration
DEPLOY_USER="www-data"
PROJECT_ROOT="/var/www/saraivavision"
SOURCE_DIR="/home/saraiva-vision-site-v3"
RELEASES_DIR="$PROJECT_ROOT/releases"
CURRENT_LINK="$PROJECT_ROOT/current"
NGINX_CONFIG="/etc/nginx/sites-available/saraivavision-production"
BACKUP_KEEP=5
LOG_FILE="/var/log/deploy-saraivavision.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    log "ERROR: $1"
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS: $1"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARNING: $1"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    log "INFO: $1"
}

# Check if running as root
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        error_exit "This script must be run as root (use sudo)"
    fi
}

# Create deployment directory structure
setup_directories() {
    info "Setting up deployment directories..."
    
    mkdir -p "$RELEASES_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$PROJECT_ROOT"
    
    success "Directories created and permissions set"
}

# Build project
build_project() {
    info "Building project..."
    
    cd "$SOURCE_DIR"
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        error_exit "package.json not found in $SOURCE_DIR"
    fi
    
    # Install dependencies and build
    npm ci --production=false || error_exit "Failed to install dependencies"
    npm run build || error_exit "Build failed"
    
    # Verify build output
    if [[ ! -f "dist/index.html" ]]; then
        error_exit "Build output not found - dist/index.html missing"
    fi
    
    success "Project built successfully"
}

# Create new release
create_release() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local release_dir="$RELEASES_DIR/$timestamp"
    
    info "Creating release: $timestamp"
    
    mkdir -p "$release_dir"
    
    # Copy build output to release directory
    cp -r "$SOURCE_DIR/dist/"* "$release_dir/"
    
    # Set proper permissions
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$release_dir"
    chmod -R 755 "$release_dir"
    
    echo "$release_dir"
}

# Atomic deployment - update symlink
deploy_release() {
    local release_dir="$1"
    local temp_link="${CURRENT_LINK}.tmp.$$"
    
    info "Deploying release atomically..."
    
    # Create temporary symlink
    ln -sfn "$release_dir" "$temp_link"
    
    # Atomic move
    mv "$temp_link" "$CURRENT_LINK"
    
    success "Release deployed: $(basename "$release_dir")"
}

# Validate deployment
validate_deployment() {
    info "Validating deployment..."
    
    # Check symlink
    if [[ ! -L "$CURRENT_LINK" ]]; then
        error_exit "Current symlink not found"
    fi
    
    # Check if index.html exists
    if [[ ! -f "$CURRENT_LINK/index.html" ]]; then
        error_exit "index.html not found in current deployment"
    fi
    
    # Test nginx configuration
    nginx -t || error_exit "Nginx configuration test failed"
    
    success "Deployment validation passed"
}

# Reload nginx
reload_nginx() {
    info "Reloading nginx..."
    
    systemctl reload nginx || error_exit "Failed to reload nginx"
    
    success "Nginx reloaded successfully"
}

# Clean old releases
cleanup_releases() {
    info "Cleaning up old releases (keeping last $BACKUP_KEEP)..."
    
    cd "$RELEASES_DIR"
    
    # Count releases
    local release_count=$(ls -1 | wc -l)
    
    if [[ $release_count -gt $BACKUP_KEEP ]]; then
        # Remove oldest releases
        ls -1t | tail -n +$((BACKUP_KEEP + 1)) | xargs rm -rf
        success "Cleaned up old releases"
    else
        info "No cleanup needed (only $release_count releases)"
    fi
}

# Rollback to previous release
rollback() {
    info "Rolling back to previous release..."
    
    local current_release=$(readlink "$CURRENT_LINK" 2>/dev/null || echo "")
    local previous_release=""
    
    if [[ -n "$current_release" ]]; then
        # Find previous release
        cd "$RELEASES_DIR"
        previous_release=$(ls -1t | grep -v "$(basename "$current_release")" | head -n 1)
    fi
    
    if [[ -z "$previous_release" ]]; then
        error_exit "No previous release found for rollback"
    fi
    
    local previous_path="$RELEASES_DIR/$previous_release"
    ln -sfn "$previous_path" "$CURRENT_LINK"
    
    reload_nginx
    
    success "Rolled back to: $previous_release"
}

# Health check
health_check() {
    info "Performing health check..."
    
    # Test localhost
    if curl -f http://localhost:8082/health >/dev/null 2>&1; then
        success "Health check passed (localhost:8082)"
    else
        warning "Health check failed on localhost:8082"
    fi
    
    # Test if site serves index.html
    if [[ -f "$CURRENT_LINK/index.html" ]]; then
        success "Static files accessible"
    else
        error_exit "Static files not accessible"
    fi
}

# Show deployment status
status() {
    echo
    echo -e "${BLUE}=== Deployment Status ===${NC}"
    echo -e "Current release: ${GREEN}$(readlink "$CURRENT_LINK" 2>/dev/null | xargs basename || "Not deployed")${NC}"
    echo -e "Release count: ${GREEN}$(ls -1 "$RELEASES_DIR" 2>/dev/null | wc -l || 0)${NC}"
    echo -e "Nginx status: ${GREEN}$(systemctl is-active nginx)${NC}"
    echo
    echo -e "${BLUE}Recent releases:${NC}"
    ls -lt "$RELEASES_DIR" 2>/dev/null | head -5 | tail -n +2 || echo "No releases found"
    echo
}

# Main deployment function
main_deploy() {
    log "Starting deployment process..."
    
    check_permissions
    setup_directories
    build_project
    
    local new_release=$(create_release)
    deploy_release "$new_release"
    
    validate_deployment
    reload_nginx
    health_check
    cleanup_releases
    
    success "Deployment completed successfully!"
    status
}

# Command handling
case "${1:-deploy}" in
    "deploy")
        main_deploy
        ;;
    "rollback")
        check_permissions
        rollback
        ;;
    "status")
        status
        ;;
    "cleanup")
        check_permissions
        cleanup_releases
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status|cleanup|health}"
        echo
        echo "Commands:"
        echo "  deploy   - Build and deploy new release"
        echo "  rollback - Rollback to previous release"
        echo "  status   - Show deployment status"
        echo "  cleanup  - Clean up old releases"
        echo "  health   - Perform health check"
        exit 1
        ;;
esac