#!/bin/bash
# =============================================================================
# Install Daily Connection Check Cron Job
#
# Sets up a cron job to run the daily connection check script.
# Default schedule: Every day at 07:00 and 19:00 (twice daily)
#
# Usage:
#   bash scripts/install-daily-check-cron.sh
#   CRON_SCHEDULE="0 7 * * *" bash scripts/install-daily-check-cron.sh
#
# @author Dr. Philipe Saraiva Cruz
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CHECK_SCRIPT="$PROJECT_ROOT/scripts/daily-connection-check.sh"

# Verify check script exists
if [[ ! -f "$CHECK_SCRIPT" ]]; then
  echo "ERROR: Check script not found: $CHECK_SCRIPT" >&2
  exit 1
fi

# Make executable
chmod +x "$CHECK_SCRIPT"

# Default: run at 07:00 and 19:00 daily
CRON_SCHEDULE_MORNING="${CRON_SCHEDULE:-0 7 * * *}"
CRON_SCHEDULE_EVENING="${CRON_SCHEDULE_EVENING:-0 19 * * *}"

LOG_DIR="$PROJECT_ROOT/reports/daily-checks"
mkdir -p "$LOG_DIR"
CRON_LOG="$LOG_DIR/cron-output.log"

# Build cron command
CRON_CMD_MORNING="cd $PROJECT_ROOT && bash $CHECK_SCRIPT --quiet >> $CRON_LOG 2>&1"
CRON_CMD_EVENING="cd $PROJECT_ROOT && bash $CHECK_SCRIPT --quiet >> $CRON_LOG 2>&1"

# Get current crontab (or empty)
CURRENT_CRON="$(crontab -l 2>/dev/null || true)"
TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

# Remove old entries for this script
if [[ -n "$CURRENT_CRON" ]]; then
  echo "$CURRENT_CRON" | grep -v "daily-connection-check" > "$TMP_FILE" || true
else
  : > "$TMP_FILE"
fi

# Add new entries
echo "$CRON_SCHEDULE_MORNING $CRON_CMD_MORNING" >> "$TMP_FILE"
echo "$CRON_SCHEDULE_EVENING $CRON_CMD_EVENING" >> "$TMP_FILE"

# Install crontab
crontab "$TMP_FILE"

echo "=========================================="
echo " Daily Connection Check Cron Installed"
echo "=========================================="
echo ""
echo "Schedule:"
echo "  Morning: $CRON_SCHEDULE_MORNING"
echo "  Evening: $CRON_SCHEDULE_EVENING"
echo ""
echo "Script: $CHECK_SCRIPT"
echo "Logs:   $CRON_LOG"
echo "Reports: $LOG_DIR/"
echo ""
echo "Reports are kept for 30 days, then auto-cleaned."
echo ""
echo "To customize schedule:"
echo "  CRON_SCHEDULE=\"0 */6 * * *\" bash scripts/install-daily-check-cron.sh"
echo ""
echo "To verify installation:"
echo "  crontab -l | grep daily-connection-check"
echo ""
echo "To run manually:"
echo "  bash scripts/daily-connection-check.sh"
