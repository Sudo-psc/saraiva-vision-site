#!/bin/bash

LATEST_REPORT=$(ls -t /var/log/saraiva-monitoring/report_*.md 2>/dev/null | head -1)

if [[ -z "$LATEST_REPORT" ]]; then
    echo "❌ No reports found in /var/log/saraiva-monitoring/"
    exit 1
fi

echo "📊 Latest Monitoring Report"
echo "=========================="
echo "File: $LATEST_REPORT"
echo ""

if command -v bat >/dev/null 2>&1; then
    bat --style=plain --paging=never "$LATEST_REPORT"
elif command -v less >/dev/null 2>&1; then
    less "$LATEST_REPORT"
else
    cat "$LATEST_REPORT"
fi
