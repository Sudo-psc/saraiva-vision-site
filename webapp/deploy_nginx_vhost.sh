#!/usr/bin/env bash
# Deploy correct Nginx vhost with location = /ads and root /var/www/saraivavision/current

set -Eeuo pipefail

trap 'echo "ERROR: Line $LINENO failed. Aborting."; exit 1' ERR

# --- Configuration ---
DOMAIN="saraivavision.com.br"
SITE_NAME="saraivavision"
SITES_AVAILABLE="/etc/nginx/sites-available"
SITES_ENABLED="/etc/nginx/sites-enabled"
TARGET_AVAIL="${SITES_AVAILABLE}/${SITE_NAME}"
TARGET_ENABLED="${SITES_ENABLED}/${SITE_NAME}"
REPO_DIR_DEFAULT="/home/saraiva-vision-site"
REPO_DIR="${REPO_DIR:-$PWD}"
ALT_REPO_DIR="${ALT_REPO_DIR:-$REPO_DIR_DEFAULT}"

# Preferred config files (prefer minimal)
CANDIDATES=(
  "$REPO_DIR/nginx-site-minimal.conf"
  "$ALT_REPO_DIR/nginx-site-minimal.conf"
  "$REPO_DIR/nginx.conf"
  "$ALT_REPO_DIR/nginx.conf"
)

# --- Preconditions ---
if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "This script must run as root (use sudo)."
  exit 1
fi

command -v nginx >/dev/null || { echo "nginx command not found"; exit 1; }
command -v systemctl >/dev/null || { echo "systemctl command not found"; exit 1; }

mkdir -p "$SITES_AVAILABLE" "$SITES_ENABLED"

# --- Choose config file ---
CHOSEN=""
for f in "${CANDIDATES[@]}"; do
  if [[ -f "$f" ]]; then
    CHOSEN="$f"
    break
  fi
done

if [[ -z "$CHOSEN" ]]; then
  echo "No config file found. Looked for: nginx-site-minimal.conf or nginx.conf in:"
  printf ' - %s\n' "$REPO_DIR" "$ALT_REPO_DIR"
  exit 1
fi

echo "Using vhost config: $CHOSEN"

# --- Validate config content requirements ---
# 1) Must contain exact-match 'location = /ads' block
if ! grep -Eq 'location[[:space:]]*=[[:space:]]*/ads[[:space:]]*\{' "$CHOSEN"; then
  echo "Chosen config does not include an exact 'location = /ads' block."
  exit 1
fi

# 2) Must contain server root pointing to /var/www/saraivavision/current
if ! grep -Eq '^[[:space:]]*root[[:space:]]+/var/www/saraivavision/current;' "$CHOSEN"; then
  echo "Chosen config does not include: root /var/www/saraivavision/current;"
  exit 1
fi

# --- Remove conflicting site configs ---
# Known conflicts: default, legacy 'saraivavisao'
echo "Removing known conflicting site configs (if present)..."
rm -f "${SITES_ENABLED}/default" || true
rm -f "${SITES_ENABLED}/saraivavisao" || true
rm -f "${SITES_AVAILABLE}/saraivavisao" || true

# Optional: remove any other non-target symlinks that might compete for the same server_name
# (Print list for operator visibility)
echo "Currently enabled sites before change:"
ls -l "$SITES_ENABLED" || true

# --- Install and enable the chosen site ---
install -m 0644 "$CHOSEN" "$TARGET_AVAIL"
ln -sfn "$TARGET_AVAIL" "$TARGET_ENABLED"

echo "Enabled vhost: $TARGET_ENABLED -> $TARGET_AVAIL"

# --- Validate Nginx config ---
echo "Testing Nginx configuration..."
nginx -t

# --- Reload Nginx ---
echo "Reloading Nginx..."
systemctl reload nginx

# Ensure Nginx is active
if ! systemctl is-active --quiet nginx; then
  echo "Nginx is not active. Attempting to start..."
  systemctl start nginx
fi

systemctl is-active --quiet nginx && echo "Nginx is active."

# --- Post checks ---
echo "Post-deploy sanity checks:"
echo "- Active vhost symlink:"
ls -l "$TARGET_ENABLED" || true

echo "- Root should be /var/www/saraivavision/current in the deployed file:"
grep -nE '^[[:space:]]*root[[:space:]]+/var/www/saraivavision/current;' "$TARGET_AVAIL" || true

echo "- /ads should now return JSON (test via local origin):"
if command -v curl >/dev/null 2>&1; then
  curl -sSI -H "Host: www.${DOMAIN}" http://127.0.0.1/ads | sed -n '1,12p' || true
else
  echo "curl not installed; skipping local HTTP check."
fi

echo "Done."
