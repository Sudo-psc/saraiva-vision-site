#!/bin/bash
# Watch & Deploy Script - Saraiva Vision
# Automatically rebuild and deploy when files change

echo "👁️  Watch Mode - Auto Deploy"
echo "============================"
echo ""
echo "Watching for file changes..."
echo "Press Ctrl+C to stop"
echo ""

# Change to project directory
cd /home/saraiva-vision-site

# Use inotifywait if available, otherwise use a simple loop
if command -v inotifywait &> /dev/null; then
    echo "Using inotifywait for efficient file watching"

    while true; do
        # Watch for changes in src, public, and important config files
        inotifywait -r -e modify,create,delete \
            src/ public/ \
            package.json vite.config.js index.html \
            2>/dev/null

        echo ""
        echo "🔄 Changes detected! Deploying..."
        sudo ./scripts/quick-deploy.sh
        echo ""
        echo "Watching for more changes..."
    done
else
    echo "⚠️  inotifywait not found. Install with: sudo apt-get install inotify-tools"
    echo "Using fallback watch mode (checks every 5 seconds)"
    echo ""

    LAST_CHANGE=$(date +%s)

    while true; do
        # Check if any source files changed in last 5 seconds
        CURRENT=$(find src public -type f -newermt "5 seconds ago" 2>/dev/null | wc -l)

        if [ "$CURRENT" -gt 0 ]; then
            CURRENT_TIME=$(date +%s)
            # Only deploy if at least 3 seconds passed since last change (debounce)
            if [ $((CURRENT_TIME - LAST_CHANGE)) -gt 3 ]; then
                echo ""
                echo "🔄 Changes detected! Deploying..."
                sudo ./scripts/quick-deploy.sh
                echo ""
                echo "Watching for more changes..."
                LAST_CHANGE=$(date +%s)
            fi
        fi

        sleep 5
    done
fi
