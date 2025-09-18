#!/usr/bin/env bash
set -euo pipefail

# Recovery script for deploying the Saraiva Vision site from a specific Git branch.
# The script follows the 12-step playbook described in the recovery prompt and can
# be customised through environment variables.

APP="${APP:-saraiva}"
BASE="${BASE:-/srv/$APP}"
REPO_URL="${REPO_URL:-https://github.com/Sudo-psc/saraiva-vision-site.git}"
BRANCH="${BRANCH:-002-resend-contact-form}"
RELEASES="${RELEASES:-$BASE/releases}"
SHARED="${SHARED:-$BASE/shared}"
DOMAIN="${DOMAIN:-saraivavision.com.br}"
API_PORT="${API_PORT:-8787}"
NODE_MAJOR="${NODE_MAJOR:-}" # Optional (e.g., 20)
SERVICE_USER="${SERVICE_USER:-www-data}"

log() {
  printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

run_or_warn() {
  local description="$1"
  shift
  log "$description"
  if "$@"; then
    return 0
  else
    log "Warning: command failed but continuing: $*"
    return 1
  fi
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' not found" >&2
    exit 1
  fi
}

# Ensure core tools are present before proceeding.
require_command git
require_command curl
require_command npm

if ! command -v sudo >/dev/null 2>&1; then
  echo "Error: sudo is required to run this script." >&2
  exit 1
fi

log "Starting recovery process for branch '$BRANCH'"

# 1. Inventory & backup
log "Step 1/12: Inventory & backup"
uname -a || true
cat /etc/os-release || true
sudo mkdir -p /root/backups
sudo tar -czf "/root/backups/nginx-$(date +%F).tgz" /etc/nginx 2>/dev/null || true
sudo tar -czf "/root/backups/srv-$(date +%F).tgz" "$BASE" 2>/dev/null || true

# 2. Maintenance window
log "Step 2/12: Entering maintenance window"
sudo systemctl stop nginx 2>/dev/null || true
run_or_warn "Stopping PM2 apps" bash -c 'pm2 stop all >/dev/null 2>&1'

# 3. Atomic release structure
log "Step 3/12: Preparing atomic release structure"
sudo mkdir -p "$RELEASES" "$SHARED"
TS="$(date +"%Y%m%d%H%M%S")"
CURRENT_RELEASE="$RELEASES/$TS"
log "Cloning $REPO_URL (branch $BRANCH) into $CURRENT_RELEASE"
cd "$RELEASES"
sudo git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$TS"
cd "$CURRENT_RELEASE"

# Ensure the cloned directory is writable for subsequent steps when running as non-root.
if [ -n "${SUDO_USER:-}" ]; then
  sudo chown -R "$SUDO_USER":"$SUDO_USER" "$CURRENT_RELEASE"
  cd "$CURRENT_RELEASE"
fi

# 4. Align Node & dependencies
log "Step 4/12: Aligning Node.js and installing dependencies"
if [ -n "$NODE_MAJOR" ]; then
  log "Ensuring Node.js major version $NODE_MAJOR"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if [ -f package-lock.json ]; then
  npm ci
elif [ -f pnpm-lock.yaml ]; then
  corepack enable
  pnpm install --frozen-lockfile
elif [ -f yarn.lock ]; then
  yarn install --frozen-lockfile
else
  npm install
fi

# 5. Clean build
log "Step 5/12: Building project"
npm run build
if [ -d dist ]; then
  log "Build completed successfully (dist directory present)"
else
  echo "Error: dist directory not found after build" >&2
  exit 1
fi

# 6. Shared secrets & files
log "Step 6/12: Syncing shared secrets/files"
if [ -f "$SHARED/.env" ]; then
  cp "$SHARED/.env" .env
  log "Copied .env from shared directory"
else
  log "No shared .env found; skipping"
fi

# 7. API service (optional)
log "Step 7/12: Handling optional API service"
if [ -f api/server.js ]; then
  run_or_warn "Starting PM2 API service" pm2 start api/server.js --name "$APP-api" --env production -- "$API_PORT"
  run_or_warn "Saving PM2 process list" pm2 save
else
  log "No api/server.js found; skipping API startup"
fi

# 8. Atomic symlink switch
log "Step 8/12: Updating current symlink"
sudo ln -sfn "$CURRENT_RELEASE" "$BASE/current"

# 9. Nginx validation & reload
log "Step 9/12: Validating and restarting Nginx"
sudo nginx -t
sudo systemctl restart nginx

# 10. Post-deploy validation
log "Step 10/12: Post-deploy validation"
run_or_warn "Checking homepage response" bash -c "curl -sI 'https://$DOMAIN' | sed -n '1p; /content-type/p; /etag/p'"
run_or_warn "Checking SPA fallback" bash -c "curl -sI 'https://$DOMAIN/rota-inexistente' | sed -n '1p'"
run_or_warn "Testing contact API" bash -c "curl -s -X POST 'http://127.0.0.1:$API_PORT/api/contact' -H 'Content-Type: application/json' -d '{\"email\":\"teste@exemplo.com\",\"message\":\"ping\"}' | head -c 200"
run_or_warn "Inspecting recent Nginx logs" bash -c "sudo journalctl -u nginx -n 100 --no-pager | tail -n +1 | sed -n '1,10p'"
run_or_warn "Inspecting PM2 status" pm2 status
run_or_warn "Inspecting API logs" pm2 logs "$APP-api" --lines 50

# 11. Protections & cleanup
log "Step 11/12: Setting permissions and pruning old releases"
sudo chown -R "$SERVICE_USER":"$SERVICE_USER" "$BASE" 2>/dev/null || true
find "$RELEASES" -maxdepth 1 -mindepth 1 -type d | sort | head -n -3 | xargs -r sudo rm -rf

# 12. Tag & annotate release
log "Step 12/12: Documenting release"
git rev-parse HEAD | sudo tee "$BASE/last_release_commit"
echo "Release $TS do branch $BRANCH" | sudo tee "$BASE/last_release_note"

log "Recovery process completed. Current release: $CURRENT_RELEASE"
log "You can run ./diagnostic.sh to verify the deployment." 
