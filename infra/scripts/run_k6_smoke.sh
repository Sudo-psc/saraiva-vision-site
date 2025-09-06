#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-}"
if [[ -z "$TARGET_URL" ]]; then echo "Usage: $0 <url>"; exit 1; fi

K6_FILE="$(dirname "$0")/k6/smoke.js"
if ! command -v k6 >/dev/null 2>&1; then
  echo "Installing k6 (temporary)"
  curl -sSL https://github.com/grafana/k6/releases/download/v0.48.0/k6-v0.48.0-linux-amd64.tar.gz | tar -xz
  PATH="$PWD/k6-v0.48.0-linux-amd64:$PATH"
fi

K6_TARGET="$TARGET_URL" k6 run "$K6_FILE"

