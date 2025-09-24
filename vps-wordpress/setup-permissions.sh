#!/bin/bash

# Setup file permissions for WordPress VPS deployment
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

log "Setting up file permissions for WordPress VPS deployment..."

# Make shell scripts executable
chmod +x *.sh
chmod +x nginx-entrypoint.sh
chmod +x docker-entrypoint.sh

# Set proper permissions for configuration files
chmod 644 *.yml
chmod 644 *.ini
chmod 644 *.php
chmod 644 nginx/nginx.conf
chmod 644 nginx/conf.d/*.conf
chmod 644 nginx/snippets/*.conf

# Create directories if they don't exist
mkdir -p nginx/ssl
mkdir -p nginx/conf.d
mkdir -p nginx/snippets

# Set directory permissions
chmod 755 nginx
chmod 755 nginx/ssl
chmod 755 nginx/conf.d
chmod 755 nginx/snippets

log "✓ File permissions set successfully"

# Display file status
log "File Status:"
echo "Executable scripts:"
ls -la *.sh | grep -E '^-rwx'
echo ""
echo "Configuration files:"
ls -la *.yml *.ini *.php 2>/dev/null | head -5
echo ""
echo "Nginx configuration:"
ls -la nginx/nginx.conf nginx/conf.d/*.conf nginx/snippets/*.conf 2>/dev/null

log "Permission setup completed successfully!"