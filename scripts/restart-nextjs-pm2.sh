#!/bin/bash
# Helper script to restart Next.js with PM2

RELEASE_DIR="$1"
PORT="${2:-3002}"

if [[ -z "$RELEASE_DIR" ]]; then
    echo "Usage: $0 <release_dir> [port]"
    exit 1
fi

cd "$RELEASE_DIR" || exit 1

# Delete existing PM2 process
pm2 delete saraiva-nextjs 2>/dev/null || true

# Start Next.js with PM2
PORT=$PORT pm2 start npm --name saraiva-nextjs -- start

# Save PM2 configuration
pm2 save

echo "Next.js started in $RELEASE_DIR on port $PORT"
