#!/usr/bin/env bash

# Safer, atomic deploy script for Saraiva Vision (Nginx + Vite)
# - Builds to dist/
# - Publishes to /var/www/saraivavision/releases/<timestamp>
# - Atomically switches symlink /var/www/saraivavision/current -> releases/<timestamp>
# - Conditionally updates Nginx config and reloads only when needed

set -Eeuo pipefail
IFS=$'\n\t'

readonly PROJECT_ROOT="$(pwd)"
readonly DEPLOY_ROOT="/var/www/saraivavision"
readonly RELEASES_DIR="$DEPLOY_ROOT/releases"
readonly CURRENT_LINK="$DEPLOY_ROOT/current"   # nginx root points here
readonly BACKUP_DIR="/var/backups/saraivavision"
readonly NGINX_CONFIG_SRC="${PROJECT_ROOT}/nginx.conf"  # configuração canônica completa
# Preferir um site.conf minimal correto, senão cair para nginx.conf canônico.
if [[ -f "${PROJECT_ROOT}/nginx.repaired.conf" ]]; then
  NGINX_SITE_CONFIG_SRC="${PROJECT_ROOT}/nginx.repaired.conf"
elif [[ -f "${PROJECT_ROOT}/nginx.conf" ]]; then
  NGINX_SITE_CONFIG_SRC="${PROJECT_ROOT}/nginx.conf"
elif [[ -f "${PROJECT_ROOT}/nginx-site.conf" ]]; then
  echo "⚠️  Usando nginx-site.conf (verifique se root aponta para /var/www/saraivavision/current)"
  NGINX_SITE_CONFIG_SRC="${PROJECT_ROOT}/nginx-site.conf"
else
  echo "❌ Nenhuma configuração nginx* encontrada no diretório do projeto"; exit 1
fi
# Allow override via env to accommodate different server naming conventions
readonly NGINX_CONFIG_DEST="${NGINX_CONFIG_DEST:-/etc/nginx/sites-available/saraivavision}"
readonly NGINX_SYMLINK="${NGINX_SYMLINK:-/etc/nginx/sites-enabled/saraivavision}"
readonly TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
readonly NEW_RELEASE="$RELEASES_DIR/$TIMESTAMP"

DRY_RUN=false
SKIP_NGINX=false
NO_BUILD=false
LINK_LEGACY=false
PRUNE_KEEP=""
# Verification controls
SKIP_VERIFY=false
WP_CHECK=false
WP_STRICT=false
# Site URL for verification (default local HTTP). Can be overridden by env SITE_URL or --site-url
SITE_URL_DEFAULT="http://localhost:8082"
SITE_URL_INPUT="${SITE_URL:-}"
VERIFY_ONLY=false

# Legacy root compatibility (older vhost may still point to this path)
readonly LEGACY_ROOT_LINK="/var/www/saraiva-vision-site"

# ---------- Structured logging (early) ----------
ts() { date -u +%Y-%m-%dT%H:%M:%SZ; }
_write_log() {
  local line="$1"
  if [[ -n "${LOG_FILE:-}" ]]; then
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
    printf "%s\n" "$line" >> "$LOG_FILE" 2>/dev/null || true
  fi
}
logi() { local tag="$1"; shift; local msg="$*"; local line="$(ts) [INFO] [$tag] $msg"; echo "$line"; _write_log "$line"; }
logw() { local tag="$1"; shift; local msg="$*"; local line="$(ts) [WARN] [$tag] $msg"; echo "$line"; _write_log "$line"; }
loge() { local tag="$1"; shift; local msg="$*"; local line="$(ts) [ERROR] [$tag] $msg"; echo "$line"; _write_log "$line"; }

usage() {
  cat << USAGE
Usage: sudo ./deploy.sh [options]
  --dry-run       Show actions without changing anything
  --skip-nginx    Do not copy/reload nginx config
  --no-build      Skip npm install/build (use existing dist/)
  --link-legacy-root  Create/update symlink ${LEGACY_ROOT_LINK} -> current release (for legacy nginx root)
  --prune N       After deploy, keep only the last N releases (older ones removed)
  --skip-verify   Skip HTTP verification after nginx reload
  --wp-check      Also verify WordPress asset endpoints (jquery, load-styles)
  --site-url URL  Override base URL for verification (default: ${SITE_URL_DEFAULT} or env SITE_URL)
  --verify-only   Run verification against current site and exit (no build/deploy)
  --log-file PATH Write structured logs additionally to PATH
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-nginx)
      SKIP_NGINX=true
      shift
      ;;
    --no-build)
      NO_BUILD=true
      shift
      ;;
    --link-legacy-root)
      LINK_LEGACY=true
      shift
      ;;
    --skip-verify)
      SKIP_VERIFY=true
      shift
      ;;
    --wp-check)
      WP_CHECK=true
      shift
      ;;
    --wp-strict)
      WP_CHECK=true
      WP_STRICT=true
      shift
      ;;
    --site-url)
      if [[ -z "${2:-}" ]]; then echo "❌ --site-url requer URL"; exit 1; fi
      SITE_URL_INPUT="$2"
      shift 2
      ;;
    --verify-only)
      VERIFY_ONLY=true
      shift
      ;;
    --log-file)
      if [[ -z "${2:-}" ]]; then echo "❌ --log-file requer caminho"; exit 1; fi
      LOG_FILE="$2"
      shift 2
      ;;
    --prune)
      if [[ -z "${2:-}" || ! "$2" =~ ^[0-9]+$ ]]; then
        echo "❌ --prune requer número"; exit 1
      fi
      PRUNE_KEEP="$2"
      shift 2
      ;;
    -h|--help)
      usage; exit 0
      ;;
    *)
      echo "Unknown option: $1"; usage; exit 1
      ;;
  esac
done

logi INIT "Starting deploy Saraiva Vision (atomic)"
echo "🚀 Deploy Saraiva Vision (atomic)"

# Preconditions
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
  loge PRECHECK "package.json not found; run from project root"
  echo "❌ Run from project root (package.json not found)"; exit 1
fi

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  loge PRECHECK "Run as root (sudo) to manage files under /var and nginx"
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
    logi BUILD "Using Node $(cat .nvmrc) via nvm"
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

# (logging functions defined earlier)

# ---------- Verification helpers ----------
normalize_url() {
  local u="$1"
  # strip trailing slash
  u=${u%%/}
  printf "%s" "$u"
}

http_head() {
  # args: url; prints headers to stdout, returns 0 if curl succeeded
  curl -sS -I -L "$1" || return 1
}

http_get() {
  curl -sS -L "$1" || return 1
}

check_status() {
  # args: url expected_code_regex
  local url="$1" expect="$2"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" -L "$url" || true)
  [[ "$code" =~ $expect ]]
}

check_header_contains() {
  # args: url header_name regex
  local url="$1" name="$2" re="$3"
  local hdr
  hdr=$(curl -sS -I -L "$url" | tr -d '\r' | grep -i "^$name:" || true)
  [[ "$hdr" =~ $re ]]
}

verify_nginx_site() {
  local base="$1"
  local ok=true

  echo "🔎 Verificando site em: $base"

  # Root should be 200/3xx
  if check_status "$base/" '^(200|30[12])$'; then
    echo "  ✅ Root responde (200/3xx)"
  else
    echo "  ❌ Root não respondeu 200/3xx"; ok=false
  fi

  # Health
  if check_status "$base/health" '^200$'; then
    echo "  ✅ /health 200"
  else
    echo "  ❌ /health não retornou 200"; ok=false
  fi

  # Manifest content-type (warning, não crítico)
  if check_header_contains "$base/site.webmanifest" 'Content-Type' 'application/manifest\+json'; then
    echo "  ✅ /site.webmanifest com Content-Type correto"
  else
    echo "  ⚠️  /site.webmanifest sem Content-Type application/manifest+json (não crítico)"
  fi

  # Try a CSS asset for gzip if available
  local css
  css=$(ls -1 "$NEW_RELEASE"/assets/*.css 2>/dev/null | head -n1 || true)
  if [[ -n "$css" ]]; then
    local css_url="$base/assets/$(basename "$css")"
    local enc
    enc=$(curl -sS -I -H 'Accept-Encoding: gzip' "$css_url" | tr -d '\r' | grep -i '^Content-Encoding:' || true)
    if [[ -n "$enc" ]]; then echo "  ✅ Asset CSS com gzip"; else echo "  ⚠️  Asset CSS sem Content-Encoding (gzip): verificar config"; fi
  else
    echo "  ℹ️  Nenhum CSS em $NEW_RELEASE/assets para testar gzip"
  fi

  # Optional: WordPress endpoints
  if $WP_CHECK; then
    if check_header_contains "$base/wp-includes/js/jquery/jquery.min.js" 'Content-Type' 'javascript'; then
      echo "  ✅ WP jquery entregue com MIME de script"
    else
      echo "  ⚠️  WP jquery não encontrado ou MIME incorreto"; $WP_STRICT && ok=false
    fi
    if check_header_contains "$base/wp-admin/load-styles.php" 'Content-Type' 'text/css'; then
      echo "  ✅ WP load-styles com CSS"
    else
      echo "  ⚠️  WP load-styles não retornou CSS"; $WP_STRICT && ok=false
    fi
  fi

  $ok
}

rollback_to_previous() {
  local ptr="$BACKUP_DIR/last_release.txt"
  if [[ -f "$ptr" ]]; then
    local target
    target=$(cat "$ptr")
    if [[ -n "$target" && -d "$target" ]]; then
      echo "↩️  Rollback para release anterior: $target"
      run "ln -sfn '$target' '$CURRENT_LINK'"
      run "nginx -t && systemctl reload nginx"
      return 0
    fi
  fi
  echo "⚠️  Rollback não executado (ponteiro inválido)"
  return 1
}

# Resolve SITE_URL
SITE_URL_EFFECTIVE="$(normalize_url "${SITE_URL_INPUT:-$SITE_URL_DEFAULT}")"

# Fast path: verification only
if $VERIFY_ONLY; then
  if verify_nginx_site "$SITE_URL_EFFECTIVE"; then
    echo "✅ Verificação concluída com sucesso"; exit 0
  else
    echo "❌ Verificação falhou"; exit 2
  fi
fi

# Build
if [[ "$NO_BUILD" = false ]]; then
  logi BUILD "Installing dependencies (legacy peer deps)"
  echo "📦 Installing dependencies (npm install with legacy peer deps)…"
  # Ensure devDependencies are installed even if NODE_ENV=production is set in the environment
  run "npm install --legacy-peer-deps --no-audit --no-fund --include=dev"

  logi BUILD "Building (vite build)"
  echo "🔨 Building (vite build)…"
  run "npm run build"
fi

if [[ ! -d "dist" ]]; then
  loge BUILD "dist/ not found"
  echo "❌ dist/ not found. Build first or remove --no-build"; exit 1
fi

# Write release metadata for runtime verification
logi RELEASE "Writing release metadata"
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
  "env": "production"
}
META

# Prepare release dir
logi RELEASE "Preparing release directory: $NEW_RELEASE"
echo "📁 Preparing release directory: $NEW_RELEASE"
run "mkdir -p '$NEW_RELEASE'"

logi RELEASE "Rsync dist/ -> $NEW_RELEASE"
echo "📋 Rsync dist/ -> $NEW_RELEASE"
RSYNC_FLAGS="-a --delete --human-readable --stats --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rw,Fg=r,Fo=r"
run "rsync $RSYNC_FLAGS dist/ '$NEW_RELEASE/'"

# Sanity check: index.html exists in new release
if [[ ! -f "$NEW_RELEASE/index.html" ]]; then
  loge RELEASE "Missing index.html in new release ($NEW_RELEASE)"
  echo "❌ index.html não encontrado em $NEW_RELEASE após build. Abortando antes de trocar symlink."; exit 1
fi

logi RELEASE "Fix ownership and permissions on $NEW_RELEASE"
echo "🔐 Fix ownership and permissions"
run "chown -R www-data:www-data '$NEW_RELEASE'"
run "chmod -R u=rwX,g=rX,o=rX '$NEW_RELEASE'"

# Backup current (symlink target) for quick rollback
CURRENT_TARGET=""
if [[ -L "$CURRENT_LINK" ]]; then
  CURRENT_TARGET="$(readlink -f "$CURRENT_LINK" || true)"
fi
if [[ -n "$CURRENT_TARGET" && -d "$CURRENT_TARGET" ]]; then
  logi RELEASE "Backup pointer to $BACKUP_DIR/last_release.txt"
  echo "💾 Backing up current to $BACKUP_DIR (metadata only, as releases persist)"
  run "mkdir -p '$BACKUP_DIR'"
  # Store a pointer to last release
  run "echo '$CURRENT_TARGET' > '$BACKUP_DIR/last_release.txt'"
fi

# Atomic switch (com migração se current ainda for diretório físico)
if [[ -e "$CURRENT_LINK" && ! -L "$CURRENT_LINK" ]]; then
  logw RELEASE "current exists as directory; migrating to symlink"
  echo "⚠️  current existe como diretório físico (não symlink). Convertendo para estratégia atômica."
  MIGRATION_BACKUP="${CURRENT_LINK}.migrated-$(date +%s)"
  # Renomeia diretório atual para backup para depois poder limpar manualmente
  run "mv '$CURRENT_LINK' '$MIGRATION_BACKUP'"
  logi RELEASE "Creating fresh symlink current -> $NEW_RELEASE"
  echo "🔁 Criando symlink fresh current -> $NEW_RELEASE"
  run "ln -s '$NEW_RELEASE' '$CURRENT_LINK'"
  echo "📝 Diretório antigo preservado em: $MIGRATION_BACKUP (remova manualmente após validar)"
else
  logi RELEASE "Switching current -> $NEW_RELEASE"
  echo "🔁 Switching current -> $NEW_RELEASE"
  run "ln -sfn '$NEW_RELEASE' '$CURRENT_LINK'"
fi

# Post-switch quick validation (HTML readable)
if [[ -f "$CURRENT_LINK/index.html" ]]; then
  if ! head -c 15 "$CURRENT_LINK/index.html" >/dev/null 2>&1; then
    echo "⚠️  index.html inacessível após switch (permissões?)";
  fi
else
  echo "⚠️  index.html sumiu após switch (verificar)."
fi

# Optionally maintain a legacy symlink so existing nginx roots keep working
if [[ "$LINK_LEGACY" = true ]]; then
  if [[ -e "$LEGACY_ROOT_LINK" && ! -L "$LEGACY_ROOT_LINK" ]]; then
    echo "⚠️  ${LEGACY_ROOT_LINK} exists and is not a symlink. Skipping legacy link to avoid destructive change."
  else
    logi RELEASE "Linking legacy root: ${LEGACY_ROOT_LINK} -> $CURRENT_LINK"
    echo "🔗 Linking legacy root: ${LEGACY_ROOT_LINK} -> $CURRENT_LINK"
    run "ln -sfn '$CURRENT_LINK' '$LEGACY_ROOT_LINK'"
  fi
fi

# Nginx configuration (conditional)
if [[ "$SKIP_NGINX" = false ]]; then
  logi NGINX "Ensuring nginx site configuration is linked"
  echo "⚙️  Ensuring nginx site configuration is linked"
  # Copy config only if changed
  COPY_NGINX=false
  if [[ -f "$NGINX_SITE_CONFIG_SRC" ]]; then
    if [[ ! -f "$NGINX_CONFIG_DEST" ]] || ! cmp -s "$NGINX_SITE_CONFIG_SRC" "$NGINX_CONFIG_DEST"; then
      COPY_NGINX=true
    fi
  fi
  if $COPY_NGINX; then
    logi NGINX "Updating nginx config"
    echo "📝 Updating nginx config"
    run "cp '$NGINX_SITE_CONFIG_SRC' '$NGINX_CONFIG_DEST'"
  else
    logi NGINX "Nginx config unchanged"
    echo "📝 Nginx config unchanged"
  fi

  if [[ ! -L "$NGINX_SYMLINK" ]]; then
    run "ln -s '$NGINX_CONFIG_DEST' '$NGINX_SYMLINK'"
  fi

  # Remove default site if present
  if [[ -L "/etc/nginx/sites-enabled/default" ]]; then
    run "rm -f /etc/nginx/sites-enabled/default"
  fi

  # Remove legacy/duplicate vhost that conflicts with the new canonical name
  if [[ -L "/etc/nginx/sites-enabled/saraivavisao" ]]; then
    echo "🧹 Removing legacy vhost: /etc/nginx/sites-enabled/saraivavisao"
    run "rm -f /etc/nginx/sites-enabled/saraivavisao"
  fi
  if [[ -f "/etc/nginx/sites-available/saraivavisao" ]]; then
    echo "🧹 Removing legacy available vhost: /etc/nginx/sites-available/saraivavisao"
    run "rm -f /etc/nginx/sites-available/saraivavisao"
  fi

  logi NGINX "Testing nginx config"
  echo "🔍 Testing nginx config"
  run "nginx -t"

  logi NGINX "Reloading nginx (zero-downtime)"
  echo "🔄 Reloading nginx (zero-downtime)"
  run "systemctl reload nginx"

  logi NGINX "Ensuring nginx service is active"
  echo "🧭 Ensuring nginx service is active"
  if ! $DRY_RUN && ! systemctl is-active --quiet nginx; then
    logi NGINX "Starting nginx"
    echo "🚀 Starting nginx"
    run "systemctl start nginx"
  fi

  logi NGINX "Enabling nginx on boot"
  echo "🧷 Enabling nginx on boot"
  run "systemctl enable nginx"

  # Post-reload verification (HTTP checks)
  if ! $SKIP_VERIFY; then
    logi VERIFY "HTTP post-deploy verification"
    echo "🧪 Verificação HTTP pós-deploy"
    if verify_nginx_site "$SITE_URL_EFFECTIVE"; then
      logi VERIFY "HTTP verification OK"
      echo "✅ Verificação HTTP OK"
    else
      loge VERIFY "HTTP verification failed — attempting rollback"
      echo "❌ Verificação HTTP falhou — tentando rollback"
      rollback_to_previous || true
      exit 3
    fi
  else
    logw VERIFY "Skipping HTTP verification (flag)"
    echo "⏭  Pulando verificação HTTP (por flag)"
  fi
else
  logw NGINX "Skipping nginx config/reload as requested"
  echo "⏭  Skipping nginx config/reload as requested"
fi

logi DONE "Deploy completed"
echo "✅ Deploy completed"

# GTM Verification
logi VERIFY "Verificando integração GTM"
echo "🏷️  Verificando integração GTM..."
if [[ -f "$PROJECT_ROOT/scripts/verify-gtm.js" ]]; then
  if ! $DRY_RUN; then
    cd "$PROJECT_ROOT"
    # Set environment variables for verification
    export SITE_URL="https://saraivavision.com.br"
    export DIST_DIR="$NEW_RELEASE"
    export VITE_GTM_ID="${VITE_GTM_ID:-GTM-KF2NP85D}"

    if node scripts/verify-gtm.js; then
      logi VERIFY "GTM verification passed - ID: $VITE_GTM_ID"
      echo "✅ GTM verificação passou - ID: $VITE_GTM_ID"
    else
      logw VERIFY "GTM verification failed (non-blocking)"
      echo "⚠️  GTM verificação falhou, mas deploy continuou"
      echo "💡 Execute manualmente: node scripts/verify-gtm.js"
    fi
  else
    echo "[dry-run] node scripts/verify-gtm.js"
  fi
else
  logw VERIFY "Script de verificação GTM não encontrado (scripts/verify-gtm.js)"
  echo "⚠️  Script de verificação GTM não encontrado (scripts/verify-gtm.js)"
fi

logi DONE "Current release: $NEW_RELEASE"
echo "➡️  Current release: $NEW_RELEASE"
logi DONE "Root serving path: $CURRENT_LINK"
echo "🌐 Root serving path (nginx): $CURRENT_LINK"
if [[ -n "$CURRENT_TARGET" ]]; then
  logi DONE "Previous release: $CURRENT_TARGET"
  echo "↩️  Previous release: $CURRENT_TARGET"
fi
logi DONE "Rollback hint: sudo ./rollback.sh"
echo "💡 Rollback: sudo ./rollback.sh (switch to previous release)"

# Prune old releases if requested
if [[ -n "$PRUNE_KEEP" ]]; then
  logi CLEANUP "Pruning releases (keep last $PRUNE_KEEP)"
  echo "🧹 Pruning releases (keeping last $PRUNE_KEEP)"
  ALL_RELEASES=( $(ls -1 "$RELEASES_DIR" | sort) )
  COUNT=${#ALL_RELEASES[@]}
  if (( COUNT > PRUNE_KEEP )); then
    TO_DELETE_COUNT=$(( COUNT - PRUNE_KEEP ))
    for (( i=0; i<TO_DELETE_COUNT; i++ )); do
      OLD_REL="${ALL_RELEASES[$i]}"
      # Skip if current target (safety)
      if [[ "$CURRENT_TARGET" == "$RELEASES_DIR/$OLD_REL" || "$NEW_RELEASE" == "$RELEASES_DIR/$OLD_REL" ]]; then
        continue
      fi
      logi CLEANUP "Removing $RELEASES_DIR/$OLD_REL"
      echo "   - Removing $RELEASES_DIR/$OLD_REL"
      run "rm -rf '$RELEASES_DIR/$OLD_REL'"
    done
  else
    logi CLEANUP "Nothing to prune (total $COUNT <= $PRUNE_KEEP)"
    echo "   Nada a remover (total $COUNT <= $PRUNE_KEEP)"
fi
fi
