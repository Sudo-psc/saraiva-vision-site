#!/usr/bin/env bash

# Deploy script otimizado para Saraiva Vision
# Versão melhorada com tratamento de dependências e configuração nginx atualizada

set -Eeuo pipefail
IFS=$'\n\t'

readonly PROJECT_ROOT="$(pwd)"
readonly DEPLOY_ROOT="/var/www/saraivavision"
readonly RELEASES_DIR="$DEPLOY_ROOT/releases"
readonly CURRENT_LINK="$DEPLOY_ROOT/current"
readonly BACKUP_DIR="/var/backups/saraivavision"
readonly NGINX_CONFIG_SRC="${PROJECT_ROOT}/nginx-production-full.conf"
readonly NGINX_CONFIG_DEST="/etc/nginx/sites-available/saraivavision-production"
readonly NGINX_SYMLINK="/etc/nginx/sites-enabled/saraivavision-production"
readonly TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
readonly NEW_RELEASE="$RELEASES_DIR/$TIMESTAMP"

DRY_RUN=false
SKIP_NGINX=false
NO_BUILD=false
PRUNE_KEEP=""

usage() {
  cat << USAGE
Usage: sudo ./deploy-v3.sh [options]
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

echo "🚀 Deploy Saraiva Vision (otimizado)"

# Preconditions
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
  echo "❌ Run from project root (package.json not found)"; exit 1
fi

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "❌ Run as root (sudo) to manage files under /var and nginx"; exit 1
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
  "env": "production",
  "scrollFixes": "applied",
  "widgetFixes": "applied"
}
META

# Prepare release dir
echo "📁 Preparing release directory: $NEW_RELEASE"
run "mkdir -p '$NEW_RELEASE'"

echo "📋 Rsync dist/ -> $NEW_RELEASE"
RSYNC_FLAGS="-a --delete --human-readable --stats --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r"
run "rsync $RSYNC_FLAGS dist/ '$NEW_RELEASE/'"

# Sanity check
if [[ ! -f "$NEW_RELEASE/index.html" ]]; then
  echo "❌ index.html não encontrado em $NEW_RELEASE após build"; exit 1
fi

echo "🔐 Fix ownership and permissions"
run "chown -R www-data:www-data '$NEW_RELEASE'"
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

# Nginx configuration
if [[ "$SKIP_NGINX" = false ]]; then
  echo "⚙️  Updating nginx configuration"

  if [[ -f "$NGINX_CONFIG_SRC" ]]; then
    run "cp '$NGINX_CONFIG_SRC' '$NGINX_CONFIG_DEST'"

    if [[ ! -L "$NGINX_SYMLINK" ]]; then
      run "ln -s '$NGINX_CONFIG_DEST' '$NGINX_SYMLINK'"
    fi

    # Remove conflicting configs
    if [[ -L "/etc/nginx/sites-enabled/default" ]]; then
      run "rm -f /etc/nginx/sites-enabled/default"
    fi

    echo "🔍 Testing nginx config"
    run "nginx -t"

    echo "🔄 Reloading nginx"
    run "systemctl reload nginx"

    echo "🚀 Ensuring nginx is running"
    if ! $DRY_RUN && ! systemctl is-active --quiet nginx; then
      run "systemctl start nginx"
    fi

    run "systemctl enable nginx"
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
  if curl -sf "http://localhost:8082/health" > /dev/null; then
    echo "✅ Frontend health check: OK"
  else
    echo "⚠️  Frontend health check failed"
  fi

  if curl -sf "http://localhost:8082/wp-json/wp/v2/posts" > /dev/null; then
    echo "✅ WordPress API proxy: OK"
  else
    echo "⚠️  WordPress API proxy failed"
  fi
fi

echo "➡️  Current release: $NEW_RELEASE"
echo "🌐 Frontend: http://localhost:8082"
echo "🔧 WordPress: http://localhost:8083"
echo "💡 Rollback: sudo ./rollback.sh"

# Prune old releases
if [[ -n "$PRUNE_KEEP" ]]; then
  echo "🧹 Pruning releases (keeping last $PRUNE_KEEP)"
  ALL_RELEASES=( $(ls -1 "$RELEASES_DIR" | sort) )
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
echo "   Scroll fixes: ✅ Applied"
echo "   Widget fixes: ✅ Applied"
echo ""
