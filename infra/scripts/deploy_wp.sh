#!/usr/bin/env bash
set -euo pipefail

SRC_ROOT="${1:-./wp/wp-content}"
DST_ROOT="${2:-/var/www/site/current/wp-content}"

rsync -az --delete "$SRC_ROOT/themes/" "$DST_ROOT/themes/"
rsync -az --delete "$SRC_ROOT/plugins/" "$DST_ROOT/plugins/"

if [ -f "/var/www/site/current/composer.json" ]; then
  cd /var/www/site/current
  composer install --no-dev --prefer-dist --no-interaction || true
fi

