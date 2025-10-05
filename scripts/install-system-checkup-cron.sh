#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CHECK_SCRIPT="$PROJECT_ROOT/scripts/system-checkup-suite.sh"

if [[ ! -x "$CHECK_SCRIPT" ]]; then
    echo "Script de checkup não encontrado ou sem permissão de execução: $CHECK_SCRIPT" >&2
    exit 1
fi

CRON_SCHEDULE="${CRON_SCHEDULE:-0 */6 * * *}"
OUTPUT_MODE="${OUTPUT_MODE:-json}"
LOG_DIR="$PROJECT_ROOT/reports/system-checkup"
mkdir -p "$LOG_DIR"
CRON_LOG_FILE="${CRON_LOG_FILE:-$LOG_DIR/cron.log}"
touch "$CRON_LOG_FILE"

printf -v CHECK_CMD 'cd %q && OUTPUT_MODE=%q %q' "$PROJECT_ROOT" "$OUTPUT_MODE" "$CHECK_SCRIPT"
printf -v CRON_CMD '%s >> %q 2>&1' "$CHECK_CMD" "$CRON_LOG_FILE"

CURRENT_CRON="$(crontab -l 2>/dev/null || true)"
TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

if [[ -n "$CURRENT_CRON" ]]; then
    printf '%s\n' "$CURRENT_CRON" | grep -v "$CHECK_SCRIPT" > "$TMP_FILE" || true
else
    : > "$TMP_FILE"
fi

printf '%s %s\n' "$CRON_SCHEDULE" "$CRON_CMD" >> "$TMP_FILE"
crontab "$TMP_FILE"

printf 'Cron configurado: %s %s\n' "$CRON_SCHEDULE" "$CRON_CMD"
printf 'Logs em: %s\n' "$CRON_LOG_FILE"
