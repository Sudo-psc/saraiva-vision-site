#!/bin/bash
# ==============================================================================
# Saraiva Vision - Multi-Environment Deployment Script
# ==============================================================================
# Script unificado para deploy em beta ou produção
# Uso: ./deploy-to-environment.sh [beta|production]
# ==============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}===================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ==============================================================================
# Check arguments
# ==============================================================================
if [ $# -eq 0 ]; then
    print_error "Missing environment argument"
    echo "Usage: $0 [beta|production]"
    exit 1
fi

ENVIRONMENT=$1

if [[ "$ENVIRONMENT" != "beta" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    echo "Valid environments: beta, production"
    exit 1
fi

# ==============================================================================
# Configuration
# ==============================================================================
PROJECT_ROOT="/home/saraiva-vision-site"
RELEASES_BASE="/var/www/saraivavision/releases"
BACKUPS_BASE="/var/www/saraivavision/backups"

if [ "$ENVIRONMENT" = "beta" ]; then
    DEPLOY_PATH="/var/www/saraivavision/beta"
    DOMAIN="beta.saraivavision.com.br"
    ENV_FILE=".env.beta"
    BUILD_CMD="npm run build:vite"
else
    DEPLOY_PATH="/var/www/saraivavision/current"
    DOMAIN="saraivavision.com.br"
    ENV_FILE=".env.production"
    BUILD_CMD="npm run build:vite"
fi

RELEASE_DIR="$RELEASES_BASE/$ENVIRONMENT/$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$BACKUPS_BASE/$ENVIRONMENT/backup_$(date +%Y%m%d_%H%M%S)"

# ==============================================================================
# Production safety check
# ==============================================================================
if [ "$ENVIRONMENT" = "production" ]; then
    print_header "🚨 PRODUCTION DEPLOYMENT"
    print_warning "You are about to deploy to PRODUCTION!"
    echo ""
    echo "Domain: $DOMAIN"
    echo "Current version will be backed up to: $BACKUP_DIR"
    echo ""
    read -p "Type 'DEPLOY TO PRODUCTION' to continue: " -r
    if [ "$REPLY" != "DEPLOY TO PRODUCTION" ]; then
        print_error "Deployment cancelled"
        exit 1
    fi
else
    print_header "🧪 BETA DEPLOYMENT"
fi

# ==============================================================================
# Step 1: Pre-deployment checks
# ==============================================================================
print_header "🔍 Pre-deployment Checks"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root or with sudo"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_ROOT" ]; then
    print_error "Project directory not found: $PROJECT_ROOT"
    exit 1
fi

# Check if env file exists
if [ ! -f "$PROJECT_ROOT/$ENV_FILE" ]; then
    print_warning "Environment file not found: $ENV_FILE"
    print_warning "Using .env.example as template"
    ENV_FILE=".env.example"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION"

# ==============================================================================
# Step 2: Backup current deployment
# ==============================================================================
if [ -L "$DEPLOY_PATH" ]; then
    print_header "📦 Backing Up Current Deployment"

    mkdir -p "$BACKUP_DIR"

    # Copy current deployment
    cp -rL "$DEPLOY_PATH" "$BACKUP_DIR/www"

    # Backup Nginx config
    if [ "$ENVIRONMENT" = "production" ]; then
        cp /etc/nginx/sites-enabled/saraivavision "$BACKUP_DIR/nginx.conf"
    else
        cp /etc/nginx/sites-enabled/beta-saraivavision "$BACKUP_DIR/nginx.conf" 2>/dev/null || true
    fi

    # Save deployment info
    cat > "$BACKUP_DIR/info.txt" << EOF
Backup created: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Environment: $ENVIRONMENT
Domain: $DOMAIN
Git commit: $(cd $PROJECT_ROOT && git rev-parse HEAD 2>/dev/null || echo "unknown")
Git branch: $(cd $PROJECT_ROOT && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
EOF

    print_success "Backup created at: $BACKUP_DIR"
else
    print_warning "No existing deployment to backup"
fi

# ==============================================================================
# Step 3: Build application
# ==============================================================================
print_header "🏗️  Building Application"

cd "$PROJECT_ROOT"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    print_success "Loading environment from $ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
fi

# Clean previous build
print_success "Cleaning previous build..."
rm -rf dist/

# Install dependencies
print_success "Installing dependencies..."
npm ci --prefer-offline --no-audit

# Run build
print_success "Building for $ENVIRONMENT..."
$BUILD_CMD

# Verify build
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    print_error "Build failed - dist directory or index.html not found"
    exit 1
fi

BUILD_SIZE=$(du -sh dist/ | cut -f1)
print_success "Build completed successfully (Size: $BUILD_SIZE)"

# Add build metadata
cat > dist/BUILD_INFO.txt << EOF
Build Environment: $ENVIRONMENT
Build Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "unknown")
Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
Node Version: $NODE_VERSION
NPM Version: $NPM_VERSION
Build Size: $BUILD_SIZE
EOF

# ==============================================================================
# Step 4: Create release
# ==============================================================================
print_header "📦 Creating Release"

mkdir -p "$RELEASE_DIR"
cp -r dist/* "$RELEASE_DIR/"

print_success "Release created at: $RELEASE_DIR"

# ==============================================================================
# Step 5: Deploy (atomic symlink switch)
# ==============================================================================
print_header "🚀 Deploying to $ENVIRONMENT"

# Create symlink
ln -sfn "$RELEASE_DIR" "$DEPLOY_PATH"
print_success "Symlink updated: $DEPLOY_PATH -> $RELEASE_DIR"

# Verify deployment
if [ -f "$DEPLOY_PATH/index.html" ]; then
    print_success "Deployment verified"
else
    print_error "Deployment verification failed"
    print_error "Rolling back..."

    # Rollback
    if [ -d "$BACKUP_DIR/www" ]; then
        ln -sfn "$BACKUP_DIR/www" "$DEPLOY_PATH"
        print_success "Rollback completed"
    fi

    exit 1
fi

# ==============================================================================
# Step 6: Reload services
# ==============================================================================
print_header "🔄 Reloading Services"

# Test Nginx configuration
if nginx -t; then
    print_success "Nginx configuration valid"

    # Reload Nginx
    systemctl reload nginx
    print_success "Nginx reloaded"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# ==============================================================================
# Step 7: Health check
# ==============================================================================
print_header "🏥 Health Check"

echo "Waiting for deployment to stabilize..."
sleep 5

# Perform health check
HEALTH_URL="https://$DOMAIN"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL || echo "000")

if [ "$RESPONSE" = "200" ]; then
    print_success "Health check passed (HTTP $RESPONSE)"
else
    print_warning "Health check returned HTTP $RESPONSE"

    if [ "$ENVIRONMENT" = "production" ]; then
        print_error "Production health check failed - manual verification required"
        print_warning "To rollback, run: ./scripts/rollback.sh $ENVIRONMENT"
    fi
fi

# ==============================================================================
# Step 8: Cleanup old releases
# ==============================================================================
print_header "🧹 Cleanup"

cd "$RELEASES_BASE/$ENVIRONMENT"

# Keep last 10 releases for production, 5 for beta
if [ "$ENVIRONMENT" = "production" ]; then
    KEEP=10
else
    KEEP=5
fi

RELEASE_COUNT=$(ls -1 | wc -l)

if [ "$RELEASE_COUNT" -gt "$KEEP" ]; then
    ls -t | tail -n +$((KEEP + 1)) | xargs -r rm -rf
    print_success "Cleaned up old releases (kept last $KEEP)"
else
    print_success "No cleanup needed ($RELEASE_COUNT releases)"
fi

# Cleanup old backups
cd "$BACKUPS_BASE/$ENVIRONMENT"
BACKUP_COUNT=$(ls -1 | wc -l)

if [ "$BACKUP_COUNT" -gt "$KEEP" ]; then
    ls -t | tail -n +$((KEEP + 1)) | xargs -r rm -rf
    print_success "Cleaned up old backups (kept last $KEEP)"
fi

# ==============================================================================
# Summary
# ==============================================================================
print_header "✅ DEPLOYMENT COMPLETE"

echo ""
echo "📋 Deployment Summary:"
echo "  • Environment: $ENVIRONMENT"
echo "  • Domain: $DOMAIN"
echo "  • Release: $RELEASE_DIR"
echo "  • Backup: $BACKUP_DIR"
echo "  • Build size: $BUILD_SIZE"
echo "  • Health check: HTTP $RESPONSE"
echo ""
echo "🔗 Quick Links:"
echo "  • Website: https://$DOMAIN"
echo "  • Build info: https://$DOMAIN/BUILD_INFO.txt"
echo "  • Nginx logs: /var/log/nginx/$ENVIRONMENT-saraivavision-*.log"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo "📊 Post-deployment:"
    echo "  1. Monitor error logs for 30 minutes"
    echo "  2. Check analytics for unusual patterns"
    echo "  3. Verify critical functionality"
    echo "  4. Update team on deployment status"
    echo ""
    echo "🔄 Rollback (if needed):"
    echo "  ./scripts/rollback.sh production"
else
    echo "🧪 Next steps:"
    echo "  1. Test thoroughly on beta environment"
    echo "  2. Verify all features work correctly"
    echo "  3. When ready, deploy to production:"
    echo "     sudo ./scripts/deploy-to-environment.sh production"
fi

echo ""
print_success "Deployment completed successfully! 🎉"
