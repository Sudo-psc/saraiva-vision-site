#!/bin/bash
# Atomic Deploy Script with Rollback
# Usage: ./scripts/deploy-atomic.sh [--skip-build] [--skip-backup]

set -e

BUILD_DIR="dist"
PRODUCTION_DIR="/var/www/html"
BACKUP_DIR="/var/backups/saraiva-$(date +%Y%m%d_%H%M%S)"
SKIP_BUILD=false
SKIP_BACKUP=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --skip-build)
      SKIP_BUILD=true
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      ;;
    *)
      echo "Unknown argument: $arg"
      echo "Usage: $0 [--skip-build] [--skip-backup]"
      exit 1
      ;;
  esac
done

echo "════════════════════════════════════════════════════"
echo "   ATOMIC DEPLOY - Saraiva Vision"
echo "════════════════════════════════════════════════════"
echo ""

# Pre-flight checks
echo "🔍 Pre-flight checks..."
if [ ! -d "$PRODUCTION_DIR" ]; then
  echo "❌ Production directory not found: $PRODUCTION_DIR"
  exit 1
fi

if [ "$SKIP_BUILD" = false ]; then
  if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the project root?"
    exit 1
  fi
fi

echo "✅ Pre-flight OK"
echo ""

# Step 1: Build
if [ "$SKIP_BUILD" = false ]; then
  echo "🔨 Step 1: Building..."
  npm run build || {
    echo "❌ Build failed!"
    exit 1
  }
  echo "✅ Build successful"
  echo ""
else
  echo "⏭️  Skipping build (--skip-build)"
  echo ""
fi

# Verify build output
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Build directory not found: $BUILD_DIR"
  exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
  echo "❌ index.html not found in $BUILD_DIR"
  exit 1
fi

# Step 2: Backup
if [ "$SKIP_BACKUP" = false ]; then
  echo "💾 Step 2: Creating backup..."
  sudo mkdir -p "$(dirname "$BACKUP_DIR")"
  sudo cp -r "$PRODUCTION_DIR" "$BACKUP_DIR" || {
    echo "❌ Backup failed!"
    exit 1
  }
  BACKUP_SIZE=$(sudo du -sh "$BACKUP_DIR" | cut -f1)
  echo "✅ Backup created: $BACKUP_DIR ($BACKUP_SIZE)"
  echo ""
else
  echo "⏭️  Skipping backup (--skip-backup)"
  echo ""
fi

# Step 3: Deploy
echo "🚀 Step 3: Deploying..."
echo "   Source: $BUILD_DIR"
echo "   Target: $PRODUCTION_DIR"

# Copy files
sudo cp -r "$BUILD_DIR"/* "$PRODUCTION_DIR"/ || {
  echo "❌ Deploy failed during copy!"
  if [ "$SKIP_BACKUP" = false ]; then
    echo "🔄 Rolling back..."
    sudo rm -rf "${PRODUCTION_DIR:?}"/*
    sudo cp -r "$BACKUP_DIR"/* "$PRODUCTION_DIR"/
    echo "✅ Rollback complete"
  fi
  exit 1
}

echo "✅ Files copied"
echo ""

# Step 4: Verify
echo "✅ Step 4: Verifying deployment..."

# Check index.html exists
if [ ! -f "$PRODUCTION_DIR/index.html" ]; then
  echo "❌ index.html missing after deploy!"
  if [ "$SKIP_BACKUP" = false ]; then
    echo "🔄 Rolling back..."
    sudo rm -rf "${PRODUCTION_DIR:?}"/*
    sudo cp -r "$BACKUP_DIR"/* "$PRODUCTION_DIR"/
    echo "✅ Rollback complete"
  fi
  exit 1
fi

# HTTP health check
echo "   Testing HTTP response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/ || echo "000")

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Health check failed! HTTP $HTTP_CODE"

  if [ "$SKIP_BACKUP" = false ]; then
    echo "🔄 Rolling back..."
    sudo rm -rf "${PRODUCTION_DIR:?}"/*
    sudo cp -r "$BACKUP_DIR"/* "$PRODUCTION_DIR"/

    # Verify rollback
    ROLLBACK_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/ || echo "000")
    if [ "$ROLLBACK_CODE" = "200" ]; then
      echo "✅ Rollback complete and verified"
    else
      echo "❌ Rollback verification failed! Manual intervention required."
    fi
  fi

  exit 1
fi

echo "✅ Health check passed (HTTP $HTTP_CODE)"
echo ""

# Step 5: Post-deploy checks
echo "🔍 Step 5: Post-deploy verification..."

# Check bundle exists
BUNDLE=$(curl -s https://saraivavision.com.br/ | grep -o 'index-[A-Za-z0-9_-]*.js' | head -1)
if [ -z "$BUNDLE" ]; then
  echo "⚠️  Warning: Could not detect bundle filename"
else
  echo "   Bundle detected: $BUNDLE"

  BUNDLE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://saraivavision.com.br/assets/$BUNDLE")
  if [ "$BUNDLE_CODE" = "200" ]; then
    echo "   ✅ Bundle accessible (HTTP $BUNDLE_CODE)"
  else
    echo "   ⚠️  Bundle not accessible (HTTP $BUNDLE_CODE)"
  fi
fi

# Check AVIF images
echo "   Checking AVIF images..."
AVIF_COUNT=$(find "$PRODUCTION_DIR/Blog" -name "*-{480,768,1280}w.avif" 2>/dev/null | wc -l)
if [ "$AVIF_COUNT" -gt 0 ]; then
  echo "   ✅ AVIF images found ($AVIF_COUNT files)"
else
  echo "   ⚠️  No AVIF images found"
fi

echo ""

# Summary
echo "════════════════════════════════════════════════════"
echo "   ✅ DEPLOY SUCCESSFUL!"
echo "════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "   Build: $([ "$SKIP_BUILD" = true ] && echo "Skipped" || echo "✅ Success")"
echo "   Backup: $([ "$SKIP_BACKUP" = true ] && echo "Skipped" || echo "✅ $BACKUP_DIR")"
echo "   Deploy: ✅ Success"
echo "   Health: ✅ HTTP $HTTP_CODE"
echo ""
echo "🌐 URL: https://saraivavision.com.br"
echo "📋 Logs: sudo tail -f /var/log/nginx/access.log"
echo ""
echo "🔄 Rollback command (se necessário):"
if [ "$SKIP_BACKUP" = false ]; then
  echo "   sudo rm -rf $PRODUCTION_DIR/*"
  echo "   sudo cp -r $BACKUP_DIR/* $PRODUCTION_DIR/"
else
  echo "   (Backup não criado - rollback manual necessário)"
fi
echo ""
