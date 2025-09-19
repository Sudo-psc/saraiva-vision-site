#!/bin/sh
set -euo pipefail

APP_ENV=${APP_ENV:-production}
AUTO_RELOAD=${NGINX_AUTO_RELOAD:-false}
TEMPLATE_FILE="/etc/nginx/templates/upstreams.conf.template"
GENERATED_UPSTREAM="/etc/nginx/conf.d/00-upstreams.conf"

if [ -f "$TEMPLATE_FILE" ]; then
  echo "[entrypoint] Rendering upstream definitions from template" >&2
  envsubst < "$TEMPLATE_FILE" > "$GENERATED_UPSTREAM"
fi

mkdir -p /var/cache/nginx /var/log/nginx /var/run /var/www/letsencrypt
: > /var/log/nginx/health.log
chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run

if [ "$AUTO_RELOAD" = "true" ]; then
  echo "[entrypoint] Starting inotify watcher for live reload" >&2
  inotifywait -m -e modify,create,delete,move \
    /etc/nginx/nginx.conf \
    /etc/nginx/conf.d \
    /etc/nginx/snippets \
    /etc/nginx/templates 2>/dev/null |
  while read -r _; do
    if nginx -t >/tmp/nginx-test.log 2>&1; then
      echo "[entrypoint] Reloading nginx after config change" >&2
      nginx -s reload || true
    else
      echo "[entrypoint] Skipping reload - invalid configuration" >&2
      cat /tmp/nginx-test.log >&2 || true
    fi
  done &
  watcher_pid=$!
  trap 'kill "$watcher_pid" 2>/dev/null || true' EXIT
fi

if nginx -t; then
  echo "[entrypoint] Configuration test successful" >&2
else
  echo "[entrypoint] Configuration test failed" >&2
  exit 1
fi

exec su-exec nginx "$@"
