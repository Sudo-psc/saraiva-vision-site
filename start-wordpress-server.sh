#!/bin/bash

# WordPress PHP Server Launcher
# Configures and starts PHP built-in server for WordPress with SQLite

set -e

WORDPRESS_DIR="/Users/philipecruz/saraiva-vision-site/wordpress-local"
PHP_PORT="8083"
PHP_HOST="127.0.0.1"

echo "🚀 Starting WordPress PHP Server..."
echo "📁 WordPress Directory: $WORDPRESS_DIR"
echo "🌐 Server URL: http://$PHP_HOST:$PHP_PORT"

# Verify WordPress directory exists
if [ ! -d "$WORDPRESS_DIR" ]; then
    echo "❌ Error: WordPress directory not found: $WORDPRESS_DIR"
    exit 1
fi

# Verify wp-config.php exists
if [ ! -f "$WORDPRESS_DIR/wp-config.php" ]; then
    echo "❌ Error: wp-config.php not found in $WORDPRESS_DIR"
    exit 1
fi

# Check if SQLite plugin is installed
if [ ! -d "$WORDPRESS_DIR/wp-content/plugins/sqlite-database-integration" ]; then
    echo "⚠️  Warning: SQLite Database Integration plugin not found"
fi

# Create database directory if it doesn't exist
mkdir -p "$WORDPRESS_DIR/wp-content/databases"

# Set proper permissions
chmod 755 "$WORDPRESS_DIR/wp-content/databases" 2>/dev/null || true

cd "$WORDPRESS_DIR"

echo "✅ Configuration validated"
echo "🔄 Starting PHP built-in server on port $PHP_PORT..."

# Kill any existing PHP server on this port
lsof -ti:$PHP_PORT | xargs kill -9 2>/dev/null || true

echo "🔍 Testing basic PHP functionality..."
php -r "echo 'PHP is working!' . PHP_EOL;"

# Start PHP server with error reporting and custom router
php -S "$PHP_HOST:$PHP_PORT" -t "$WORDPRESS_DIR" \
    -d error_reporting=E_ALL \
    -d display_errors=1 \
    -d log_errors=1 \
    -d memory_limit=512M \
    -d max_execution_time=300 \
    -d upload_max_filesize=64M \
    -d post_max_size=64M \
    "$WORDPRESS_DIR/router.php"

echo "🛑 WordPress server stopped"