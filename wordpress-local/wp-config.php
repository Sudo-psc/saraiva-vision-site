<?php

/**
 * The base configuration for WordPress with SQLite
 *
 * This file contains the following configurations:
 *
 * * Database settings for SQLite
 * * Secret keys
 * * Database table prefix
 * * Absolute path to WordPress directory
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
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
 * 
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
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
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

// Enable CORS for API
define('WP_CORS_ENABLED', true);

// WordPress URLs - configured for nginx proxy
define('WP_HOME', 'http://localhost');
define('WP_SITEURL', 'http://localhost');

// Force admin SSL and cookies for proxy
define('FORCE_SSL_ADMIN', false);
define('COOKIE_DOMAIN', 'localhost');

// Memory and execution limits
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 300);

// Proxy configuration
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

// Fix admin URL redirects for proxy
define('WP_ADMIN_DIR', 'wp-admin');
define('ADMIN_COOKIE_PATH', '/wp-admin');

/* Add any custom values between this line and the "stop editing" line. */

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if (! defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
