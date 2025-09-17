#!/usr/bin/env bash
set -euo pipefail

# Rsync built frontend to current release path. Usage: deploy_frontend.sh <local_dist> <remote_path>
DIST_DIR="${1:-./frontend/dist}"
REMOTE_PATH="${2:-/var/www/site/current/frontend}"

if [[ ! -d "$DIST_DIR" ]]; then echo "dist not found: $DIST_DIR"; exit 1; fi
rsync -az --delete "$DIST_DIR"/ "$REMOTE_PATH"/

