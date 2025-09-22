#!/bin/bash
# Health Check Script for WordPress Backend
# This script is used by Docker health checks

set -e

# Check if PHP-FPM is running
if ! pgrep -f "php-fpm" > /dev/null; then
    echo "PHP-FPM is not running"
    exit 1
fi

# Check if WordPress files exist
if [ ! -f "/var/www/html/wp-config.php" ]; then
    echo "WordPress config not found"
    exit 1
fi

# Check database connection
if ! wp db check --allow-root > /dev/null 2>&1; then
    echo "Database connection failed"
    exit 1
fi

# Check if WordPress is installed
if ! wp core is-installed --allow-root > /dev/null 2>&1; then
    echo "WordPress not installed"
    exit 1
fi

# Check Redis connection if plugin is active
if wp plugin is-active redis-cache --allow-root > /dev/null 2>&1; then
    if ! wp redis ping --allow-root > /dev/null 2>&1; then
        echo "Redis connection failed"
        exit 1
    fi
fi

echo "All health checks passed"
exit 0