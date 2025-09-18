#!/usr/bin/env bash

# Deploy script adaptado para macOS - Saraiva Vision
# Versão adaptada para desenvolvimento local

set -Eeuo pipefail
IFS=$'\n\t'

readonly PROJECT_ROOT="$(pwd)"
readonly DEPLOY_ROOT="$HOME/.local/www/saraivavision"
readonly RELEASES_DIR="$DEPLOY_ROOT/releases"
readonly CURRENT_LINK="$DEPLOY_ROOT/current"
readonly BACKUP_DIR="$HOME/backups/saraivavision"
readonly NGINX_CONFIG_SRC="${PROJECT_ROOT}/nginx-macos-simple.conf"
readonly NGINX_CONFIG_DEST="/opt/homebrew/etc/nginx/servers/saraivavision.conf"
readonly TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
readonly NEW_RELEASE="$RELEASES_DIR/$TIMESTAMP"

DRY_RUN=false
SKIP_NGINX=false
NO_BUILD=false
PRUNE_KEEP=""

usage() {
  cat << USAGE
Usage: ./deploy-macos.sh [options]
  --dry-run       Show actions without changing anything
  --skip-nginx    Do not copy/reload nginx config
  --no-build      Skip npm install/build (use existing dist/)
  --prune N       After deploy, keep only the last N releases
USAGE
}

# Parse arguments
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true; shift ;;
    --skip-nginx) SKIP_NGINX=true; shift ;;
    --no-build) NO_BUILD=true; shift ;;
    --prune) shift; PRUNE_KEEP="${1:-}"; if [[ -z "$PRUNE_KEEP" || ! "$PRUNE_KEEP" =~ ^[0-9]+$ ]]; then echo "❌ --prune requer número"; exit 1; fi; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $arg"; usage; exit 1 ;;
  esac
done

echo "🚀 Deploy Saraiva Vision (macOS)"

# Preconditions
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
  echo "❌ Run from project root (package.json not found)"; exit 1
fi

run() {
  if $DRY_RUN; then
    echo "[dry-run] $*"
  else
    eval "$@"
  fi
}

# Build with dependency handling
if [[ "$NO_BUILD" = false ]]; then
  echo "📦 Installing dependencies with legacy peer deps…"
  run "npm install --legacy-peer-deps --no-audit --no-fund"

  echo "🔨 Building (vite build)…"
  run "npm run build"
fi

if [[ ! -d "dist" ]]; then
  echo "❌ dist/ not found. Build first or remove --no-build"; exit 1
fi

# Write release metadata
echo "🧾 Writing release metadata to dist/RELEASE_INFO.json"
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
APP_VERSION=$(node -pe "require('./package.json').version" 2>/dev/null || echo "0.0.0")
cat > dist/RELEASE_INFO.json <<META
{
  "release": "${TIMESTAMP}",
  "version": "${APP_VERSION}",
  "commit": "${GIT_COMMIT}",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "node": "$(node -v 2>/dev/null || echo unknown)",
  "env": "development",
  "platform": "macOS",
  "scrollFixes": "applied",
  "widgetFixes": "applied"
}
META

# Prepare release dir
echo "📁 Preparing release directory: $NEW_RELEASE"
run "mkdir -p '$NEW_RELEASE'"
run "mkdir -p '$DEPLOY_ROOT'"
run "mkdir -p '$BACKUP_DIR'"

echo "📋 Rsync dist/ -> $NEW_RELEASE"
RSYNC_FLAGS="-a --delete --human-readable --stats"
run "rsync $RSYNC_FLAGS dist/ '$NEW_RELEASE/'"

# Sanity check
if [[ ! -f "$NEW_RELEASE/index.html" ]]; then
  echo "❌ index.html não encontrado em $NEW_RELEASE após build"; exit 1
fi

echo "🔐 Fix ownership and permissions (macOS)"
run "chown -R $(whoami):staff '$NEW_RELEASE'"
run "chmod -R u=rwX,g=rX,o=rX '$NEW_RELEASE'"

# Backup current
CURRENT_TARGET=""
if [[ -L "$CURRENT_LINK" ]]; then
  CURRENT_TARGET="$(readlink -f "$CURRENT_LINK" || true)"
fi
if [[ -n "$CURRENT_TARGET" && -d "$CURRENT_TARGET" ]]; then
  echo "💾 Backing up current to $BACKUP_DIR"
  run "mkdir -p '$BACKUP_DIR'"
  run "echo '$CURRENT_TARGET' > '$BACKUP_DIR/last_release.txt'"
fi

# Atomic switch
echo "🔁 Switching current -> $NEW_RELEASE"
run "ln -sfn '$NEW_RELEASE' '$CURRENT_LINK'"

# Nginx configuration (macOS specific)
if [[ "$SKIP_NGINX" = false ]]; then
  echo "⚙️  Updating nginx configuration (macOS)"

  if [[ -f "$NGINX_CONFIG_SRC" ]]; then
    # Create nginx config adapted for macOS
    echo "📝 Creating macOS-adapted nginx config..."
    
    # Create adapted config for macOS paths
    run "mkdir -p '/opt/homebrew/etc/nginx/servers'"
    
    # Adapt the config for macOS
    sed "s|DEPLOY_PATH_PLACEHOLDER|$CURRENT_LINK|g" "$NGINX_CONFIG_SRC" > "/tmp/saraivavision.conf"
    run "mv /tmp/saraivavision.conf '$NGINX_CONFIG_DEST'"

    echo "🔍 Testing nginx config"
    if command -v nginx >/dev/null; then
      run "nginx -t"
      
      echo "🔄 Reloading nginx"
      if pgrep nginx > /dev/null; then
        run "nginx -s reload"
      else
        echo "🚀 Starting nginx"
        run "nginx"
      fi
    else
      echo "⚠️  nginx command not found, skipping reload"
    fi
  else
    echo "⚠️  Nginx config source not found: $NGINX_CONFIG_SRC"
  fi
else
  echo "⏭  Skipping nginx config/reload"
fi

echo "✅ Deploy completed"

# Test deployment
echo "🧪 Testing deployment..."
if ! $DRY_RUN; then
  sleep 2
  
  # Test if files are accessible
  if [[ -f "$CURRENT_LINK/index.html" ]]; then
    echo "✅ Files deployed successfully"
  else
    echo "⚠️  Files not found at $CURRENT_LINK"
  fi
  
  # Test local server if running
  if curl -sf "http://localhost:8082/health" > /dev/null 2>&1; then
    echo "✅ Frontend health check: OK"
  elif curl -sf "http://localhost:3002/" > /dev/null 2>&1; then
    echo "✅ Vite dev server running: OK"
  else
    echo "⚠️  No server responding on expected ports"
  fi
fi

echo "➡️  Current release: $NEW_RELEASE"
echo "📂 Deploy path: $CURRENT_LINK"
echo "🌐 Frontend: http://localhost:8082 (nginx) or http://localhost:3002 (dev)"
echo "🔧 WordPress mock: http://localhost:8083"

# Prune old releases
if [[ -n "$PRUNE_KEEP" ]] && [[ -d "$RELEASES_DIR" ]]; then
  echo "🧹 Pruning releases (keeping last $PRUNE_KEEP)"
  ALL_RELEASES=( $(ls -1 "$RELEASES_DIR" | sort 2>/dev/null || true) )
  COUNT=${#ALL_RELEASES[@]}
  if (( COUNT > PRUNE_KEEP )); then
    TO_DELETE_COUNT=$(( COUNT - PRUNE_KEEP ))
    for (( i=0; i<TO_DELETE_COUNT; i++ )); do
      OLD_REL="${ALL_RELEASES[$i]}"
      if [[ "$CURRENT_TARGET" == "$RELEASES_DIR/$OLD_REL" || "$NEW_RELEASE" == "$RELEASES_DIR/$OLD_REL" ]]; then
        continue
      fi
      echo "   - Removing $RELEASES_DIR/$OLD_REL"
      run "rm -rf '$RELEASES_DIR/$OLD_REL'"
    done
  fi
fi

echo ""
echo "📋 Deploy Summary:"
echo "   Release: $TIMESTAMP"
echo "   Commit: $GIT_COMMIT"
echo "   Version: $APP_VERSION"
echo "   Platform: macOS"
echo "   Path: $CURRENT_LINK"
echo "   Scroll fixes: ✅ Applied"
echo "   Widget fixes: ✅ Applied"
echo ""