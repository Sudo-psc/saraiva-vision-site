#!/usr/bin/env bash
set -euo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then echo "Usage: $0 <url>"; exit 1; fi

hdrs=$(curl -sSI "$URL")
echo "$hdrs" | grep -qi "Strict-Transport-Security" || { echo "Missing HSTS"; exit 1; }
echo "$hdrs" | grep -qi "Content-Security-Policy" || echo "CSP not enforced (OK in canary)"
echo "$hdrs" | grep -qi "X-Content-Type-Options: nosniff" || { echo "Missing X-Content-Type-Options"; exit 1; }
echo "$hdrs" | grep -qi "X-Frame-Options" || { echo "Missing X-Frame-Options"; exit 1; }
echo "$hdrs" | grep -qi "Referrer-Policy" || { echo "Missing Referrer-Policy"; exit 1; }
echo "$hdrs" | grep -qi "Cache-Control" || echo "Missing Cache-Control (warn)"
echo "Headers OK"

