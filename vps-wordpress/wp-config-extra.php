<?php
/**
 * Additional WordPress configuration for headless CMS setup
 * This file is included in wp-config.php via Docker environment
 */

// Redis Object Cache Configuration
define('WP_REDIS_HOST', 'redis');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_TIMEOUT', 1);
define('WP_REDIS_READ_TIMEOUT', 1);
define('WP_REDIS_DATABASE', 0);

// GraphQL JWT Authentication
define('GRAPHQL_JWT_AUTH_SECRET_KEY', getenv('JWT_SECRET_KEY'));
define('GRAPHQL_JWT_AUTH_EXPIRE', WEEK_IN_SECONDS);

// CORS Headers for GraphQL
define('GRAPHQL_CORS_ENABLE', true);

// WordPress Security
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', false); // Allow plugin installation
define('AUTOMATIC_UPDATER_DISABLED', true);

// WordPress Performance
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// WordPress Cache
define('WP_CACHE', true);
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);
define('CONCATENATE_SCRIPTS', false);
define('ENFORCE_GZIP', true);

// WordPress Debug (disabled in production)
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', false);

// WordPress Revisions
define('WP_POST_REVISIONS', 5);
define('AUTOSAVE_INTERVAL', 300);

// WordPress Trash
define('EMPTY_TRASH_DAYS', 30);

// WordPress Cron
define('DISABLE_WP_CRON', false);

// WordPress File Permissions
define('FS_CHMOD_DIR', (0755 & ~ umask()));
define('FS_CHMOD_FILE', (0644 & ~ umask()));

// WordPress Multisite (disabled)
define('WP_ALLOW_MULTISITE', false);

// WordPress SSL
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

// WordPress URLs (will be set during installation)
// define('WP_HOME', 'https://cms.saraivavision.com.br');
// define('WP_SITEURL', 'https://cms.saraivavision.com.br');

// WordPress Content Directory
define('WP_CONTENT_DIR', '/var/www/html/wp-content');
define('WP_CONTENT_URL', 'https://cms.saraivavision.com.br/wp-content');

// WordPress Plugin Directory
define('WP_PLUGIN_DIR', '/var/www/html/wp-content/plugins');
define('WP_PLUGIN_URL', 'https://cms.saraivavision.com.br/wp-content/plugins');

// WordPress Upload Directory
define('UPLOADS', 'wp-content/uploads');
?>