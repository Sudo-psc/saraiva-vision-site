#!/bin/bash

# ==============================================================================
# Cleanup Old Bundles Script - Saraiva Vision
# Data: 2025-10-14
# Propósito: Remove bundles JavaScript antigos mantendo apenas os 3 mais recentes
# ==============================================================================

set -euo pipefail

ASSETS_DIR="/var/www/saraivavision/current/assets"
KEEP_COUNT=3
LOG_FILE="/var/log/saraivavision-cleanup.log"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if assets directory exists
if [ ! -d "$ASSETS_DIR" ]; then
    log_message "ERROR: Assets directory not found: $ASSETS_DIR"
    exit 1
fi

cd "$ASSETS_DIR"

# Count current bundles
CURRENT_COUNT=$(ls -1 index-*.js 2>/dev/null | wc -l)
log_message "Current bundles: $CURRENT_COUNT"

if [ "$CURRENT_COUNT" -le "$KEEP_COUNT" ]; then
    log_message "No cleanup needed. Current count ($CURRENT_COUNT) <= Keep count ($KEEP_COUNT)"
    exit 0
fi

# Calculate bundles to remove
REMOVE_COUNT=$((CURRENT_COUNT - KEEP_COUNT))
log_message "Removing $REMOVE_COUNT old bundles..."

# Get disk usage before cleanup
BEFORE_SIZE=$(du -sh "$ASSETS_DIR" | cut -f1)

# Remove old bundles (keep 3 most recent)
ls -t index-*.js | tail -n +"$((KEEP_COUNT + 1))" | while read -r file; do
    log_message "Removing: $file"
    rm -f "$file"
done

# Get disk usage after cleanup
AFTER_SIZE=$(du -sh "$ASSETS_DIR" | cut -f1)

log_message "Cleanup completed. Before: $BEFORE_SIZE, After: $AFTER_SIZE"
log_message "Remaining bundles:"
ls -t index-*.js | tee -a "$LOG_FILE"

exit 0
