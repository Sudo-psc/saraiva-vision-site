#!/usr/bin/env bash
set -euo pipefail

# Deploy an Nginx site config from this repo to a remote server via SSH.
#
# Env vars:
#   SSH_HOST, SSH_USER, SSH_PORT (default 22)
#   NGINX_SITE_NAME (e.g., saraivavision-production)
#   CONFIG_FILE (path in repo; default nginx.conf)
#
# Example:
#   SSH_HOST=server SSH_USER=ubuntu NGINX_SITE_NAME=saraivavision-production \
#   bash scripts/deploy-nginx-remote.sh

SSH_HOST=${SSH_HOST:-}
SSH_USER=${SSH_USER:-}
SSH_PORT=${SSH_PORT:-22}
NGINX_SITE_NAME=${NGINX_SITE_NAME:-saraivavision-production}
CONFIG_FILE=${CONFIG_FILE:-nginx.conf}

if [[ -z "$SSH_HOST" || -z "$SSH_USER" ]]; then
  echo "SSH_HOST and SSH_USER are required" >&2
  exit 1
fi

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Config file not found: $CONFIG_FILE" >&2
  exit 1
fi

REMOTE_AVAIL="/etc/nginx/sites-available/${NGINX_SITE_NAME}"
REMOTE_ENABLED="/etc/nginx/sites-enabled/${NGINX_SITE_NAME}"

echo "Uploading $CONFIG_FILE to $SSH_USER@$SSH_HOST:/tmp/${NGINX_SITE_NAME}.conf"
scp -P "$SSH_PORT" "$CONFIG_FILE" "$SSH_USER@$SSH_HOST:/tmp/${NGINX_SITE_NAME}.conf"

echo "Installing config on remote host..."
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "\
  set -euo pipefail; \
  sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled; \
  if [ -f '$REMOTE_AVAIL' ]; then sudo cp '$REMOTE_AVAIL' '${REMOTE_AVAIL}.bak.$(date +%Y%m%d_%H%M%S)'; fi; \
  sudo install -m 0644 '/tmp/${NGINX_SITE_NAME}.conf' '$REMOTE_AVAIL'; \
  sudo ln -sfn '$REMOTE_AVAIL' '$REMOTE_ENABLED'; \
  sudo rm -f /etc/nginx/sites-enabled/default || true; \
  sudo nginx -t; \
  sudo systemctl reload nginx; \
  echo 'Nginx reloaded'; \
"

echo "Done. Active: $NGINX_SITE_NAME"

