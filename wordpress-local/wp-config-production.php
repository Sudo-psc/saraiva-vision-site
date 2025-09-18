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
define('AUTH_KEY',         'z  &oEHaWNQt{Qv,L!9%Lgl/=rE-}%s|0i%0]4PRX8Wf&=4UNeELK)U?tr*#Y2h{');
define('SECURE_AUTH_KEY',  'L]~=yc;_X) V |r$-|D@C?e{kGR!@ZYe_/+TS.QpOAPB#^UZE9l52U9+G29@t=V*');
define('LOGGED_IN_KEY',    'MQr7Z>bs/Xr.tC]Q+iF|N~9=5}XSYJ>; eVi@xwB3ka<|Uyv1p%hD^g/|TLG7i{P');
define('NONCE_KEY',        'F[KCuN7{-&Q1zC(z.7&u~W(-c}^X69T2++m|eUSWPTw?&89,AoR98Mn!wy32fUyt');
define('AUTH_SALT',        ',`(bERQS[([U5ljoUF(ZdQ!T|bV^SH e1|Rxt*S]S8)sG&N-(0K[p[Ae RfM-Hil');
define('SECURE_AUTH_SALT', '!0t:BogV@II3Eo{+Q~u%BeO!U<eDEmD,ZSiHN.S4{7i:?ugw!zaT-BkT3R(, _DY');
define('LOGGED_IN_SALT',   'IX+AXyh8+i]4GoW,1O0pt<8}*6YG!t4|dkuDrlZA)9[y`LeM]VmFSgW66-t6o$|a');
define('NONCE_SALT',       'X/Z?*r_3|V_2#he%1-A;k+ExU{NwDt,af7Fu.>|xh%KlOhh5nhDfCJElqZM1Ozo+');

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
