#!/usr/bin/env bash
set -euo pipefail

PERCENT="${1:-}"
if [[ -z "$PERCENT" ]]; then echo "Usage: $0 <percent>"; exit 1; fi
# TODO: implement changing upstream weights via envsubst/sed on production.conf and reload
echo "Switching canary to $PERCENT% (TODO implement)"
sudo nginx -t && sudo systemctl reload nginx

