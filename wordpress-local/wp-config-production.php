<?php

/**
 * WordPress configuration for production environment
 * SaraivaVision Medical Clinic - Production Settings
 */

// ** Database settings - SQLite ** //
define('DB_NAME', 'wordpress');
define('DB_USER', '');
define('DB_PASSWORD', '');
define('DB_HOST', '');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// Use SQLite database
define('DB_DIR', dirname(__FILE__) . '/wp-content/databases/');
define('DB_FILE', 'database.sqlite');

/**#@+
 * Authentication unique keys and salts.
 * Generate new keys for production using: https://api.wordpress.org/secret-key/1.1/salt/
 */
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');

/**#@-*/

/**
 * WordPress database table prefix.
 */
$table_prefix = 'wp_';

/**
 * Production debugging settings - DISABLED for security
 */
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', false);

// Enable CORS for API
define('WP_CORS_ENABLED', true);

// Dynamic WordPress URLs based on HTTP_HOST
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'saraivavision.com.br';

// WordPress URLs for production
define('WP_HOME', $protocol . '://' . $host);
define('WP_SITEURL', $protocol . '://' . $host);

// Force SSL in admin if on production
if ($protocol === 'https') {
    define('FORCE_SSL_ADMIN', true);
}

// Performance optimizations
define('WP_CACHE', true);
define('WP_MEMORY_LIMIT', '512M');
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 300);

// Security enhancements
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);
define('WP_POST_REVISIONS', 5);
define('AUTOSAVE_INTERVAL', 300);

// Automatic updates
define('WP_AUTO_UPDATE_CORE', 'minor');

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if (! defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
