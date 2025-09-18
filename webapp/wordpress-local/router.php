<?php
// WordPress Router for PHP Built-in Server - Optimized
// SaraivaVision Medical Clinic - Efficient routing for local development

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);
$query = parse_url($uri, PHP_URL_QUERY);

// Log only important requests for debugging
if (strpos($path, '/wp-admin') !== false || strpos($path, '/wp-login') !== false) {
    error_log("WordPress Router: Admin request for: " . $uri);
}

// Static assets - let PHP handle them directly (more efficient)
if (preg_match('/\.(?:css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|otf|map|webp|avif)$/', $path)) {
    return false;
}

// WordPress core files that should be served directly
$wordpress_core_files = [
    '/wp-login.php',
    '/wp-register.php',
    '/wp-cron.php',
    '/wp-trackback.php',
    '/wp-links-opml.php',
    '/wp-load.php',
    '/wp-config.php',
    '/xmlrpc.php'
];

if (in_array($path, $wordpress_core_files)) {
    $file = __DIR__ . $path;
    if (file_exists($file)) {
        require $file;
        return true;
    }
    return false;
}

// Check if file exists in WordPress directory
$file = __DIR__ . $path;

// Handle directory requests
if (is_dir($file)) {
    // Remove trailing slash for consistency
    $path = rtrim($path, '/');
    $file = __DIR__ . $path;

    // Try index.php first (WordPress standard)
    $index_file = $file . '/index.php';
    if (file_exists($index_file)) {
        require $index_file;
        return true;
    }

    // Try index.html for static content
    $html_file = $file . '/index.html';
    if (file_exists($html_file)) {
        require $html_file;
        return true;
    }

    // If no index file found, redirect to remove trailing slash
    if ($uri !== $path . '/') {
        header('Location: ' . $path . ($query ? '?' . $query : ''));
        exit;
    }
}

// Handle PHP files directly
if (file_exists($file)) {
    $extension = pathinfo($file, PATHINFO_EXTENSION);
    if ($extension === 'php') {
        require $file;
        return true;
    }
    // Let PHP serve non-PHP files
    return false;
}

// WordPress pretty URLs - load index.php
// This handles all WordPress routes including posts, pages, categories, etc.
require __DIR__ . '/index.php';
