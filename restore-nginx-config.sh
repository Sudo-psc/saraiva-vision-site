#!/bin/bash

# Nginx Configuration Restore Script - Saraiva Vision
# Allows selective restoration of disabled nginx configurations

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NGINX_CONFIGS_DIR="${NGINX_CONFIGS_DIR:-./nginx-configs}"

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Help function
show_help() {
    echo "🔄 Nginx Configuration Restore Script"
    echo "====================================="
    echo
    echo "Usage: $0 [OPTIONS] [CONFIG_NAME]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -l, --list     List all disabled configurations"
    echo "  --all          Restore all disabled configurations"
    echo
    echo "Examples:"
    echo "  $0 --list                    # List disabled configs"
    echo "  $0 staging                   # Restore staging.conf"
    echo "  $0 local                     # Restore local.conf"
    echo "  $0 --all                     # Restore all disabled configs"
    echo
    echo "Available configs typically include:"
    echo "  - local (development)"
    echo "  - staging (testing)"
    echo "  - simple-production (legacy)"
    echo "  - production-fixed (legacy)"
    echo "  - docker (container-specific)"
    echo "  - frontend (frontend-only)"
}

# List disabled configurations
list_disabled() {
    log_step "Available disabled configurations:"
    cd "$NGINX_CONFIGS_DIR"
    
    local found=false
    for file in *.conf.disabled; do
        if [[ -f "$file" ]]; then
            found=true
            local config_name="${file%.conf.disabled}"
            local size=$(wc -l < "$file")
            echo -e "   ${YELLOW}📄 $config_name${NC} ($size lines)"
        fi
    done
    
    if [[ "$found" == false ]]; then
        log_info "No disabled configurations found"
        return 1
    fi
}

# Restore specific configuration
restore_config() {
    local config_name="$1"
    local disabled_file="$config_name.conf.disabled"
    local active_file="$config_name.conf"
    
    cd "$NGINX_CONFIGS_DIR"
    
    if [[ ! -f "$disabled_file" ]]; then
        log_error "Disabled configuration not found: $disabled_file"
        return 1
    fi
    
    if [[ -f "$active_file" ]]; then
        log_warn "Active configuration already exists: $active_file"
        read -p "Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Restore cancelled"
            return 1
        fi
    fi
    
    log_info "Restoring: $disabled_file → $active_file"
    mv "$disabled_file" "$active_file"
    log_info "✅ Successfully restored $config_name.conf"
}

# Restore all configurations
restore_all() {
    log_step "Restoring all disabled configurations..."
    cd "$NGINX_CONFIGS_DIR"
    
    local restored=0
    for file in *.conf.disabled; do
        if [[ -f "$file" ]]; then
            local config_name="${file%.conf.disabled}"
            local active_file="$config_name.conf"
            
            if [[ -f "$active_file" ]]; then
                log_warn "Skipping $config_name (already active)"
                continue
            fi
            
            log_info "Restoring: $file → $active_file"
            mv "$file" "$active_file"
            ((restored++))
        fi
    done
    
    if [[ $restored -eq 0 ]]; then
        log_info "No configurations were restored"
    else
        log_info "✅ Successfully restored $restored configuration(s)"
        log_warn "⚠️  Remember to test nginx configuration and handle potential conflicts"
    fi
}

# Main script
echo "🔄 NGINX CONFIGURATION RESTORE - SARAIVA VISION"
echo "==============================================="
echo

# Verify directory exists
if [[ ! -d "$NGINX_CONFIGS_DIR" ]]; then
    log_error "nginx-configs directory not found: $NGINX_CONFIGS_DIR"
    exit 1
fi

# Parse arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -l|--list)
        list_disabled
        exit $?
        ;;
    --all)
        restore_all
        ;;
    "")
        log_info "No arguments provided. Use --help for usage information."
        list_disabled
        ;;
    *)
        restore_config "$1"
        ;;
esac

echo
log_info "Restoration process completed"
log_warn "Remember to validate nginx configuration after changes:"
log_warn "  • Run: ./validate-nginx-configs.sh"
log_warn "  • Test: nginx -t (or docker exec <container> nginx -t)"