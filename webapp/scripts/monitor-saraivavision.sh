#!/usr/bin/env bash

set -euo pipefail

LOG_DIR="$(dirname "$0")/../logs"
LOG_FILE="$LOG_DIR/saraivavision-monitor.log"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-300}"
ALERT_EMAIL="${ALERT_EMAIL:-}" # optional

mkdir -p "$LOG_DIR"

while true; do
  timestamp="$(date '+%Y-%m-%d %H:%M:%S')"

  ssl_ok="0"
  if echo | openssl s_client -connect www.saraivavision.com.br:443 >/dev/null 2>&1; then
    ssl_ok="1"
  fi

  ads_status=$(curl -s -o /dev/null -w "%{http_code}" https://www.saraivavision.com.br/ads || echo 000)
  sw_status=$(curl -s -o /dev/null -w "%{http_code}" https://www.saraivavision.com.br/sw.js || echo 000)
  vitals_status=$(curl -s -o /dev/null -w "%{http_code}" https://www.saraivavision.com.br/web-vitals || echo 000)

  echo "[$timestamp] SSL:$ssl_ok | ads:$ads_status | sw:$sw_status | web-vitals:$vitals_status" | tee -a "$LOG_FILE"

  if [[ "$ssl_ok" != "1" || "$ads_status" != "200" || "$sw_status" != "200" || "$vitals_status" != "200" ]]; then
    msg="[$timestamp] ALERT: Issue detected! SSL:$ssl_ok ads:$ads_status sw:$sw_status web-vitals:$vitals_status"
    echo "$msg" | tee -a "$LOG_FILE"
    if [[ -n "$ALERT_EMAIL" && -x "$(command -v mail || true)" ]]; then
      echo "$msg" | mail -s "Saraiva Vision Alert" "$ALERT_EMAIL" || true
    fi
  fi

  sleep "$INTERVAL_SECONDS"
done

