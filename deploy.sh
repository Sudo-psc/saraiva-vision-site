#!/usr/bin/env bash

# Safer, atomic deploy script for Saraiva Vision (Nginx + Vite)
# - Builds to dist/
# - Publishes to /var/www/saraivavisao/releases/<timestamp>
# - Atomically switches symlink /var/www/saraivavisao/saraivavision -> releases/<timestamp>
# - Conditionally updates Nginx config and reloads only when needed

set -Eeuo pipefail
IFS=$'\n\t'

readonly PROJECT_ROOT="$(pwd)"
readonly DEPLOY_ROOT="/var/www/saraivavisao"
readonly RELEASES_DIR="$DEPLOY_ROOT/releases"
readonly CURRENT_LINK="$DEPLOY_ROOT/saraivavision"   # keep nginx root path stable
readonly BACKUP_DIR="/var/backups/saraivavisao"
readonly NGINX_CONFIG_SRC="${PROJECT_ROOT}/nginx.local.conf"
readonly NGINX_CONFIG_DEST="/etc/nginx/sites-available/saraivavisao"
readonly NGINX_SYMLINK="/etc/nginx/sites-enabled/saraivavisao"
readonly TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
readonly NEW_RELEASE="$RELEASES_DIR/$TIMESTAMP"

DRY_RUN=false
SKIP_NGINX=false
NO_BUILD=false

usage() {
  cat << USAGE
Usage: sudo ./deploy.sh [options]
  --dry-run       Show actions without changing anything
  --skip-nginx    Do not copy/reload nginx config
  --no-build      Skip npm install/build (use existing dist/)
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true; shift ;;
    --skip-nginx) SKIP_NGINX=true; shift ;;
    --no-build) NO_BUILD=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $arg"; usage; exit 1 ;;
  esac
done

echo "🚀 Deploy Saraiva Vision (atomic)"

# Preconditions
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
  echo "❌ Run from project root (package.json not found)"; exit 1
fi

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "❌ Run as root (sudo) to manage files under /var and nginx"; exit 1
fi

# Optional: respect .nvmrc if available to ensure correct Node for build
if [[ "$NO_BUILD" = false ]]; then
  if [[ -f "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    . "$HOME/.nvm/nvm.sh" || true
  elif [[ -f "/etc/profile.d/nvm.sh" ]]; then
    # shellcheck disable=SC1091
    . "/etc/profile.d/nvm.sh" || true
  fi
  if command -v nvm >/dev/null 2>&1 && [[ -f .nvmrc ]]; then
    echo "🔧 Using Node $(cat .nvmrc) via nvm"; nvm install >/dev/null || true; nvm use || true
  fi
fi

run() {
  if $DRY_RUN; then
    echo "[dry-run] $*"
  else
    eval "$@"
  fi
}

# Build
if [[ "$NO_BUILD" = false ]]; then
  echo "📦 Installing dependencies (npm ci)…"
  run "npm ci --no-audit --no-fund"

  echo "🔨 Building (vite build)…"
  run "npm run build"
fi

if [[ ! -d "dist" ]]; then
  echo "❌ dist/ not found. Build first or remove --no-build"; exit 1
fi

# Prepare release dir
echo "📁 Preparing release directory: $NEW_RELEASE"
run "mkdir -p '$NEW_RELEASE'"

echo "📋 Rsync dist/ -> $NEW_RELEASE"
RSYNC_FLAGS="-a --delete --human-readable --stats --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r"
run "rsync $RSYNC_FLAGS dist/ '$NEW_RELEASE/'"

echo "🔐 Fix ownership and permissions"
run "chown -R www-data:www-data '$NEW_RELEASE'"
run "chmod -R u=rwX,g=rX,o=rX '$NEW_RELEASE'"

# Backup current (symlink target) for quick rollback
CURRENT_TARGET=""
if [[ -L "$CURRENT_LINK" ]]; then
  CURRENT_TARGET="$(readlink -f "$CURRENT_LINK" || true)"
fi
if [[ -n "$CURRENT_TARGET" && -d "$CURRENT_TARGET" ]]; then
  echo "💾 Backing up current to $BACKUP_DIR (metadata only, as releases persist)"
  run "mkdir -p '$BACKUP_DIR'"
  # Store a pointer to last release
  run "echo '$CURRENT_TARGET' > '$BACKUP_DIR/last_release.txt'"
fi

# Atomic switch
echo "🔁 Switching current -> $NEW_RELEASE"
run "ln -sfn '$NEW_RELEASE' '$CURRENT_LINK'"

# Nginx configuration (conditional)
if [[ "$SKIP_NGINX" = false ]]; then
  echo "⚙️  Ensuring nginx site configuration is linked"
  # Copy config only if changed
  COPY_NGINX=false
  if [[ -f "$NGINX_CONFIG_SRC" ]]; then
    if [[ ! -f "$NGINX_CONFIG_DEST" ]] || ! cmp -s "$NGINX_CONFIG_SRC" "$NGINX_CONFIG_DEST"; then
      COPY_NGINX=true
    fi
  fi
  if $COPY_NGINX; then
    echo "📝 Updating nginx config"
    run "cp '$NGINX_CONFIG_SRC' '$NGINX_CONFIG_DEST'"
  else
    echo "📝 Nginx config unchanged"
  fi

  if [[ ! -L "$NGINX_SYMLINK" ]]; then
    run "ln -s '$NGINX_CONFIG_DEST' '$NGINX_SYMLINK'"
  fi

  # Remove any conflicting legacy symlink (old name) to avoid duplicate server_name warnings
  if [[ -L "/etc/nginx/sites-enabled/saraivavision" ]]; then
    echo "🧹 Removing legacy symlink: /etc/nginx/sites-enabled/saraivavision"
    run "rm -f /etc/nginx/sites-enabled/saraivavision"
  fi

  # Remove default site if present
  if [[ -L "/etc/nginx/sites-enabled/default" ]]; then
    run "rm -f /etc/nginx/sites-enabled/default"
  fi

  # Remove legacy/duplicate vhost that conflicts with saraivavisao
  if [[ -L "/etc/nginx/sites-enabled/saraivavision" ]]; then
    echo "🧹 Removing conflicting vhost: /etc/nginx/sites-enabled/saraivavision"
    run "rm -f /etc/nginx/sites-enabled/saraivavision"
  fi

  echo "🔍 Testing nginx config"
  run "nginx -t"

  echo "🔄 Reloading nginx (zero-downtime)"
  run "systemctl reload nginx"

  echo "🧭 Ensuring nginx service is active"
  if ! $DRY_RUN && ! systemctl is-active --quiet nginx; then
    echo "🚀 Starting nginx"
    run "systemctl start nginx"
  fi

  echo "🧷 Enabling nginx on boot"
  run "systemctl enable nginx"
else
  echo "⏭  Skipping nginx config/reload as requested"
fi

echo "✅ Deploy completed"
echo "➡️  Current release: $NEW_RELEASE"
echo "🌐 Root serving path (nginx): $CURRENT_LINK"
if [[ -n "$CURRENT_TARGET" ]]; then
  echo "↩️  Previous release: $CURRENT_TARGET"
fi
echo "💡 Rollback: sudo ./rollback.sh (switch to previous release)"
