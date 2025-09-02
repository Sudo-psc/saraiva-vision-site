#!/usr/bin/env bash
set -Eeuo pipefail

readonly DEPLOY_ROOT="/var/www/saraivavision"
readonly CURRENT_LINK="$DEPLOY_ROOT/current"
readonly BACKUP_DIR="/var/backups/saraivavision"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "❌ Run as root (sudo)"; exit 1
fi

if [[ ! -f "$BACKUP_DIR/last_release.txt" ]]; then
  echo "❌ No last release pointer found at $BACKUP_DIR/last_release.txt"; exit 1
fi

TARGET="$(cat "$BACKUP_DIR/last_release.txt")"
if [[ -z "$TARGET" || ! -d "$TARGET" ]]; then
  echo "❌ Invalid last release target: $TARGET"; exit 1
fi

echo "↩️  Rolling back current -> $TARGET"
ln -sfn "$TARGET" "$CURRENT_LINK"

echo "🔄 Reloading nginx"
nginx -t && systemctl reload nginx

echo "✅ Rollback complete"
