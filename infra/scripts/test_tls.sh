#!/usr/bin/env bash
set -euo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then echo "Usage: $0 <url>"; exit 1; fi

if ! command -v openssl >/dev/null 2>&1; then echo "openssl missing"; exit 1; fi

HOST="$(echo "$URL" | sed -E 's#https?://([^/]+)/?.*#\1#')"
echo | openssl s_client -servername "$HOST" -connect "$HOST:443" 2>/dev/null | openssl x509 -noout -dates
echo "TLS basic check done (for full scan use testssl.sh)"

