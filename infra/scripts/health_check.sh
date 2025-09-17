#!/usr/bin/env bash
set -euo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then echo "Usage: $0 <url>"; exit 1; fi

codes=$(curl -sS -o /dev/null -w "%{http_code}" -L "$URL")
if [[ "$codes" =~ ^(200|30[12])$ ]]; then
  echo "OK: $URL ($codes)"
else
  echo "FAIL: $URL ($codes)"; exit 1
fi

