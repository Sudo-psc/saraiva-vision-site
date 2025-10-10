#!/bin/bash

# Restart API Script
# Kills all Node processes on port 3001 and starts fresh

echo "🛑 Stopping all Node processes on port 3001..."
sudo fuser -k -9 3001/tcp 2>/dev/null
sudo pkill -9 -f "node.*src/server.js" 2>/dev/null

echo "⏳ Waiting for port to be released..."
sleep 5

# Verify port is free
if sudo lsof -i :3001 >/dev/null 2>&1; then
    echo "❌ ERROR: Port 3001 still in use!"
    sudo lsof -i :3001
    exit 1
fi

echo "✅ Port 3001 is free"

# Start server
cd /home/saraiva-vision-site/api
echo "🚀 Starting API server..."
PORT=3001 NODE_ENV=production nohup node src/server.js > /var/log/saraiva-api.log 2>&1 &
NEW_PID=$!

echo "⏳ Waiting for server to start..."
sleep 3

# Check if server is running
if ps -p $NEW_PID > /dev/null 2>&1; then
    echo "✅ API server started successfully! PID: $NEW_PID"
    echo "📋 Checking logs..."
    tail -20 /var/log/saraiva-api.log
else
    echo "❌ ERROR: Server failed to start!"
    echo "📋 Last log lines:"
    tail -30 /var/log/saraiva-api.log
    exit 1
fi
