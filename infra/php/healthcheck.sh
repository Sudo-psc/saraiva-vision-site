#!/bin/sh
set -euo pipefail

RESPONSE=$(SCRIPT_NAME=/fpm-ping SCRIPT_FILENAME=/fpm-ping REQUEST_METHOD=GET cgi-fcgi -bind -connect 127.0.0.1:9000 2>&1 || true)
if echo "$RESPONSE" | grep -q "pong"; then
  exit 0
fi

echo "php-fpm healthcheck failed" >&2
echo "$RESPONSE" >&2
exit 1
