#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-}"
if [[ -z "$TARGET_URL" ]]; then echo "Usage: $0 <url>"; exit 1; fi

docker run --rm -v $(pwd):/zap/wrk -t owasp/zap2docker-stable \ 
  zap-baseline.py -t "$TARGET_URL" -g gen.conf -r zap_report.html || true

echo "ZAP baseline completed (non-blocking in script); review zap_report.html"

