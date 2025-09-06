#!/usr/bin/env bash
set -euo pipefail

CURRENT_LINK="/var/www/site/current"
BACKUP_PTR="/var/www/site/last_release.txt"

if [[ ! -f "$BACKUP_PTR" ]]; then echo "No backup pointer found"; exit 1; fi
TARGET="$(cat "$BACKUP_PTR")"
if [[ -z "$TARGET" || ! -d "$TARGET" ]]; then echo "Invalid target: $TARGET"; exit 1; fi

ln -sfn "$TARGET" "$CURRENT_LINK"
sudo nginx -t && sudo systemctl reload nginx
echo "Rolled back to: $TARGET"

