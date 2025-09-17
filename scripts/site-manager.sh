#!/bin/bash

# Site Manager - Saraiva Vision
# Prevents deployment conflicts and manages site versions

set -euo pipefail

SITES_AVAILABLE="/etc/nginx/sites-available"
SITES_ENABLED="/etc/nginx/sites-enabled"
MAIN_SITE="saraivavision-production"
LOG_FILE="/var/log/site-manager.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Show current site configuration
show_status() {
    echo
    echo -e "${BLUE}=== Site Configuration Status ===${NC}"
    echo
    
    # Show enabled sites
    echo -e "${BLUE}Enabled sites:${NC}"
    for site in "$SITES_ENABLED"/*; do
        if [[ -L "$site" ]]; then
            local name=$(basename "$site")
            local target=$(readlink "$site")
            echo -e "  ${GREEN}$name${NC} -> $target"
        fi
    done
    
    echo
    echo -e "${BLUE}Available configurations for saraivavision.com.br:${NC}"
    
    # Check for conflicting configurations
    local main_config="$SITES_AVAILABLE/$MAIN_SITE"
    local old_config="$SITES_AVAILABLE/saraivavisao"
    
    if [[ -f "$main_config" ]]; then
        if [[ -L "$SITES_ENABLED/$MAIN_SITE" ]]; then
            echo -e "  ${GREEN}✅ $MAIN_SITE (ACTIVE)${NC}"
        else
            echo -e "  ${YELLOW}⚠️  $MAIN_SITE (available but not enabled)${NC}"
        fi
    fi
    
    if [[ -f "$old_config" ]]; then
        if [[ -L "$SITES_ENABLED/saraivavisao" ]]; then
            echo -e "  ${RED}❌ saraivavisao (OLD - CONFLICTING)${NC}"
        else
            echo -e "  ${YELLOW}⚠️  saraivavisao (old config, disabled)${NC}"
        fi
    fi
    
    echo
    echo -e "${BLUE}Port usage:${NC}"
    nginx -T 2>/dev/null | grep -E "listen.*80|listen.*443" | sort | uniq -c | while read count line; do
        if [[ $count -gt 1 ]]; then
            echo -e "  ${RED}$line (used $count times - CONFLICT!)${NC}"
        else
            echo -e "  ${GREEN}$line${NC}"
        fi
    done
    
    echo
}

# Enable the main site configuration
enable_main_site() {
    info "Enabling main site configuration..."
    
    local main_config="$SITES_AVAILABLE/$MAIN_SITE"
    
    if [[ ! -f "$main_config" ]]; then
        error_exit "Main site configuration not found: $main_config"
    fi
    
    # Enable main site
    ln -sf "$main_config" "$SITES_ENABLED/$MAIN_SITE"
    
    success "Main site enabled: $MAIN_SITE"
}

# Disable conflicting configurations
disable_conflicting() {
    info "Disabling conflicting configurations..."
    
    local conflicts=("saraivavisao")
    
    for conflict in "${conflicts[@]}"; do
        local enabled_path="$SITES_ENABLED/$conflict"
        if [[ -L "$enabled_path" ]]; then
            rm "$enabled_path"
            warning "Disabled conflicting site: $conflict"
        fi
    done
    
    success "Conflicting configurations disabled"
}

# Test and reload nginx
reload_nginx() {
    info "Testing nginx configuration..."
    
    if nginx -t 2>/dev/null; then
        success "Nginx configuration test passed"
    else
        error_exit "Nginx configuration test failed"
    fi
    
    info "Reloading nginx..."
    systemctl reload nginx || error_exit "Failed to reload nginx"
    
    success "Nginx reloaded successfully"
}

# Fix common issues
fix_issues() {
    info "Fixing common configuration issues..."
    
    # Remove duplicate sites
    disable_conflicting
    
    # Enable main site
    enable_main_site
    
    # Test and reload
    reload_nginx
    
    success "Configuration issues fixed"
}

# Backup current configuration
backup_config() {
    local backup_dir="/etc/nginx/backup/$(date +%Y%m%d_%H%M%S)"
    
    info "Creating configuration backup..."
    
    mkdir -p "$backup_dir"
    cp -r "$SITES_AVAILABLE" "$backup_dir/"
    cp -r "$SITES_ENABLED" "$backup_dir/"
    
    success "Configuration backed up to: $backup_dir"
}

# Validate deployment
validate() {
    info "Validating site deployment..."
    
    local errors=0
    
    # Check if main site is enabled
    if [[ ! -L "$SITES_ENABLED/$MAIN_SITE" ]]; then
        warning "Main site not enabled"
        ((errors++))
    fi
    
    # Check for conflicts
    if [[ -L "$SITES_ENABLED/saraivavisao" ]]; then
        warning "Conflicting site still enabled: saraivavisao"
        ((errors++))
    fi
    
    # Check nginx syntax
    if ! nginx -t >/dev/null 2>&1; then
        warning "Nginx configuration has syntax errors"
        ((errors++))
    fi
    
    # Check if current deployment exists
    if [[ ! -L "/var/www/saraivavision/current" ]]; then
        warning "Current deployment symlink missing"
        ((errors++))
    fi
    
    if [[ $errors -eq 0 ]]; then
        success "Validation passed - no issues found"
        return 0
    else
        warning "Validation failed - $errors issues found"
        return 1
    fi
}

# Clean up old configurations
cleanup() {
    info "Cleaning up old configurations..."
    
    # List of old/backup configurations to clean
    local old_configs=(
        "saraivavisao.backup*"
        "saraivavision.backup*"
        "saraivavision.bak*"
        "saraivavision.tmp*"
        "saraivavision.min*"
    )
    
    for pattern in "${old_configs[@]}"; do
        find "$SITES_AVAILABLE" -name "$pattern" -type f -exec rm -f {} \; 2>/dev/null || true
    done
    
    success "Old configurations cleaned up"
}

# Main command handling
case "${1:-status}" in
    "status")
        show_status
        ;;
    "fix")
        check_permissions
        backup_config
        fix_issues
        show_status
        ;;
    "enable")
        check_permissions
        enable_main_site
        reload_nginx
        ;;
    "disable-conflicts")
        check_permissions
        disable_conflicting
        reload_nginx
        ;;
    "validate")
        validate
        ;;
    "backup")
        check_permissions
        backup_config
        ;;
    "cleanup")
        check_permissions
        cleanup
        ;;
    "reload")
        check_permissions
        reload_nginx
        ;;
    *)
        echo "Usage: $0 {status|fix|enable|disable-conflicts|validate|backup|cleanup|reload}"
        echo
        echo "Commands:"
        echo "  status            - Show current configuration status"
        echo "  fix               - Fix configuration conflicts automatically"
        echo "  enable            - Enable main site configuration"
        echo "  disable-conflicts - Disable conflicting site configurations"
        echo "  validate          - Validate current deployment"
        echo "  backup            - Backup current nginx configuration"
        echo "  cleanup           - Clean up old configuration files"
        echo "  reload            - Reload nginx after testing configuration"
        exit 1
        ;;
esac