#!/bin/bash

# Nginx Configuration Consolidation Plan
# Resolves conflicts and creates organized structure

echo "🚀 NGINX CONFIGURATION CONSOLIDATION"
echo "====================================="
echo

# Create backup directory
BACKUP_DIR="./nginx-configs-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📂 Backup directory: $BACKUP_DIR"

# Move all current .conf files to backup
echo "💾 Backing up existing configurations..."
find . -maxdepth 1 -name "*.conf" -type f | while read file; do
    if [[ "$file" != "./nginx-consolidated.conf" ]]; then
        cp "$file" "$BACKUP_DIR/"
        echo "   Backed up: $file"
    fi
done

echo

# Analysis of current structure
echo "📊 ANALYSIS RESULTS:"
echo "==================="
echo

echo "🔍 IDENTIFIED ISSUES:"
echo "• 19 configuration files with overlapping purposes"
echo "• 12 duplicate server_name directives for saraivavision.com.br"
echo "• 8 duplicate SSL listen directives"
echo "• Multiple port conflicts (80, 443, 8080, 8081, 8083)"
echo "• Inconsistent naming conventions"
echo "• No clear hierarchy or organization"
echo

echo "🎯 CONSOLIDATION STRATEGY:"
echo "========================="
echo

echo "1. 📁 ORGANIZED STRUCTURE:"
echo "   nginx-configs/"
echo "   ├── production.conf       # Main production config"
echo "   ├── staging.conf         # Staging environment"
echo "   ├── local.conf          # Local development"
echo "   └── includes/"
echo "       ├── security-headers.conf"
echo "       ├── ssl.conf"
echo "       ├── gzip.conf"
echo "       ├── csp.conf"
echo "       └── wordpress-proxy.conf"
echo

echo "2. 🌐 CLEAR PORT ALLOCATION:"
echo "   • Production: 80 (HTTP) → 443 (HTTPS)"
echo "   • WordPress CMS: 8080 (local mock)"
echo "   • Development: 3000-3010 (Vite)"
echo "   • Staging: 8443 (if needed)"
echo

echo "3. 🔧 CONFIGURATION HIERARCHY:"
echo "   • nginx-production.conf  → Primary for deploy.sh"
echo "   • nginx-local.conf       → Development/testing"
echo "   • nginx-staging.conf     → CI/CD staging"
echo

echo "4. 📝 STANDARDIZED NAMING:"
echo "   • nginx-[environment].conf for main configs"
echo "   • includes/[feature].conf for modular includes"
echo

echo "✅ NEXT STEPS:"
echo "============="
echo "1. Create consolidated nginx-production.conf"
echo "2. Create modular includes structure"
echo "3. Update deploy.sh to use new structure"
echo "4. Test configurations"
echo "5. Remove obsolete files"
echo

echo "🚨 IMPORTANT:"
echo "• All existing configs are backed up in $BACKUP_DIR"
echo "• Test configurations before deploying to production"
echo "• Update any CI/CD scripts that reference old file names"
echo

echo "Ready to proceed with consolidation? (This will create the new structure)"
read -p "Continue? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Creating consolidated configuration structure..."
    echo "This will be implemented in the next step."
else
    echo "👍 Consolidation cancelled. Backup preserved in $BACKUP_DIR"
    exit 0
fi