#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/site/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# TODO: customize DB backup command or credentials
if command -v wp >/dev/null 2>&1; then
  wp --allow-root db export "$BACKUP_DIR/db.sql"
else
  echo "TODO: implement DB backup command"
fi

# Uploads backup
tar -C /var/www/site/current/wp-content/uploads -czf "$BACKUP_DIR/uploads.tgz" .
echo "Backup saved to $BACKUP_DIR"

