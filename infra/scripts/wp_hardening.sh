#!/usr/bin/env bash
set -euo pipefail

cd /var/www/site/current
if command -v wp >/dev/null 2>&1; then
  wp --allow-root option update blog_public 1 || true
  # Disable XML-RPC if desired
  wp --allow-root option update enable_xmlrpc 0 || true
  # Regenerate salts
  wp --allow-root config shuffle-salts || true
  # TODO: file permissions fix (careful in shared envs)
fi

