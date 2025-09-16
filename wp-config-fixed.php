// Adicione estas linhas ao seu arquivo wp-config.php,
// de preferência antes da linha "/* That's all, stop editing! */".

// Define os URLs públicos do site
define('WP_HOME', 'https://www.saraivavision.com.br');
define('WP_SITEURL', 'https://www.saraivavision.com.br');

// Força o uso de SSL para o login e a área administrativa
define('FORCE_SSL_ADMIN', true);

// Faz o WordPress reconhecer o proxy HTTPS
// Isso verifica o header 'X-Forwarded-Proto' que o Nginx envia
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && ['HTTP_X_FORWARDED_PROTO'] === 'https') {
['HTTPS'] = 'on';
}
<?php

/**
 * The base configuration for WordPress
 */

// ** Database settings ** //
define('DB_NAME', 'wordpress_saraivavision');
define('DB_USER', 'wordpress_user');
define('DB_PASSWORD', 'SaraivaBlog2024!');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8');
define('DB_COLLATE', '');

/**#@+
 * Authentication unique keys and salts.
 */
define('AUTH_KEY',         '(SzK{K7wPH]>.<h18KMAJ9+%?[Mhh?xoogB>^r<k_<PPcgNYKl %mrX2LjS=TO0U');
define('SECURE_AUTH_KEY',  '8</+J,}~7390a;T;^ @yvkTdY)k5.0g~wfNobr7s5_A$sG*ai1g1>nQxiDKQOdc~');
define('LOGGED_IN_KEY',    'M?J#-60 Z{Zx}gV!+PJMNpBX[nl9f-u;G$6w|0kamQ-tPAmdVj7sC23gN4rpns99');
define('NONCE_KEY',        '_hgu/n_1{_2K|yNp]k3&-Akh]TU%.p~g3Lrm+i|+Dqp9NyP^}wj{KHByS@sZ3&xb');
define('AUTH_SALT',        ')rh.rwRhC!%B-446y18VvQvPY~xdDna^oAJh01I~W:pH8K};FM>}1^7 A-^d,Zk)');
define('SECURE_AUTH_SALT', 'lDBKR+&a7DDD+J LH$x/Z(UKN>JF([rNjbkdp^@WG{vo4|Hyg$m-d:^SD/-|>*Ko');
define('LOGGED_IN_SALT',   'A2DbKGLJ$PA&B94`%J!2&ooio^3T!OU^>cz4}mk*&2z>2$hwl_#m~L#AZ4(bH2s~');
define('NONCE_SALT',       '5m<smm?`Xk=8@0L4{(3>KK I0NC4u7UD$`-|EG)mVo`z+`:>2NI):TFW[F7q,lb[');

/**#@-*/

/**
 * WordPress database table prefix.
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 */
define('WP_DEBUG', false);

// ============================================
// CONFIGURAÇÕES PARA PROXY REVERSO E BLOG
// ============================================

// URLs principais do WordPress
define('WP_HOME', 'https://saraivavision.com.br/blog');
define('WP_SITEURL', 'https://saraivavision.com.br/blog');

// Configurações de proxy reverso
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

if (isset($_SERVER['HTTP_X_FORWARDED_HOST'])) {
    $_SERVER['HTTP_HOST'] = $_SERVER['HTTP_X_FORWARDED_HOST'];
}

if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $_SERVER['REMOTE_ADDR'] = $_SERVER['HTTP_X_FORWARDED_FOR'];
}

// Forçar HTTPS quando acessado via proxy
define('FORCE_SSL_ADMIN', true);

// Configurações para uploads e mídia
define('UPLOADS', 'wp-content/uploads');

// Configurações de CORS para imagens
header('Access-Control-Allow-Origin: https://saraivavision.com.br');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization');

// Configuração para funcionar com subdiretório /blog
if (!defined('WP_CONTENT_URL')) {
    define('WP_CONTENT_URL', 'https://saraivavision.com.br/wp-content');
}

// Configuração de cookies para subdiretório
define('COOKIE_DOMAIN', '.saraivavision.com.br');
define('COOKIEPATH', '/blog/');
define('SITECOOKIEPATH', '/blog/');

// Configurações de cache
define('WP_CACHE', true);

// Desabilitar editor de arquivos por segurança
define('DISALLOW_FILE_EDIT', true);

// Configurações de memory limit
ini_set('memory_limit', '512M');

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if (! defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
