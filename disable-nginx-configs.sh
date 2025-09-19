#!/bin/bash

# Nginx Configuration Cleanup Script - Saraiva Vision
# Disables redundant nginx configuration files to prevent conflicts
# Based on the problem statement requirements

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NGINX_CONFIGS_DIR="${NGINX_CONFIGS_DIR:-./nginx-configs}"
BACKUP_DIR="/tmp/nginx-configs-backup-$(date +%Y%m%d_%H%M%S)"

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

# Banner
echo "🧹 NGINX CONFIGURATION CLEANUP - SARAIVA VISION"
echo "================================================"
echo
log_info "This script will disable redundant nginx configurations to prevent conflicts"
log_info "Only production.conf will remain active"
echo

# Verify we're in the right directory and configs exist
if [[ ! -d "$NGINX_CONFIGS_DIR" ]]; then
    log_error "nginx-configs directory not found: $NGINX_CONFIGS_DIR"
    exit 1
fi

# Change to nginx-configs directory
cd "$NGINX_CONFIGS_DIR"
log_info "Working in directory: $(pwd)"

# List of files to disable (keeping production.conf active)
FILES_TO_DISABLE=(
    "local.conf"
    "staging.conf" 
    "simple-production.conf"
    "production-fixed.conf"
    "docker.conf"
    "frontend.conf"
)

# Create backup directory
log_step "1. Creating backup..."
mkdir -p "$BACKUP_DIR"
log_info "Backup directory: $BACKUP_DIR"

# Step 1: Backup all current configurations
log_step "2. Backing up current configurations..."
for file in *.conf; do
    if [[ -f "$file" ]]; then
        cp "$file" "$BACKUP_DIR/"
        log_info "Backed up: $file"
    fi
done

# Step 2: Disable redundant configurations
log_step "3. Disabling redundant configurations..."
DISABLED_COUNT=0

for file in "${FILES_TO_DISABLE[@]}"; do
    if [[ -f "$file" ]]; then
        log_info "Disabling: $file → $file.disabled"
        mv "$file" "$file.disabled"
        ((DISABLED_COUNT++))
    else
        log_warn "File not found: $file (skipping)"
    fi
done

# Step 3: Verify production.conf is still active
log_step "4. Verifying production configuration..."
if [[ -f "production.conf" ]]; then
    log_info "✅ production.conf is active and will be used"
else
    log_error "❌ production.conf not found! This is a critical error."
    exit 1
fi

# Step 4: List current state
log_step "5. Current configuration state:"
echo
echo "📁 Active configurations:"
for file in *.conf; do
    if [[ -f "$file" ]]; then
        echo -e "   ${GREEN}✅ $file (ACTIVE)${NC}"
    fi
done

echo
echo "📁 Disabled configurations:"
for file in *.conf.disabled; do
    if [[ -f "$file" ]]; then
        echo -e "   ${YELLOW}⏸️  $file (DISABLED)${NC}"
    fi
done

echo
echo "📊 Summary:"
log_info "Files disabled: $DISABLED_COUNT"
log_info "Active configs: $(ls -1 *.conf 2>/dev/null | wc -l)"
log_info "Backup location: $BACKUP_DIR"

echo
echo "🔧 Next steps:"
echo "   1. Test nginx configuration: nginx -t"  
echo "   2. If using Docker: docker exec <nginx-container> nginx -t"
echo "   3. Restart nginx service if tests pass"
echo "   4. Monitor nginx logs for any issues"

echo
log_info "✅ Nginx configuration cleanup completed successfully!"
log_warn "Remember to test the configuration before restarting nginx in production"