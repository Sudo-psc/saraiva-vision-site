<?php
// Sample WP-CLI migration: create a "Landing" page if not exists and set as static front page.

// Dry run support: --dry-run (wp passes flag in global args)
$dry_run = in_array('--dry-run', $GLOBALS['argv'] ?? [], true);

function logmsg($msg) {
  fwrite(STDOUT, "[MIGRATION] $msg\n");
}

// Ensure WordPress is loaded
if (!function_exists('get_option')) {
  logmsg('WordPress not loaded');
  exit(1);
}

$page_title = 'Landing';
$page = get_page_by_title($page_title);
if ($page) {
  logmsg("Page '$page_title' already exists (ID {$page->ID})");
} else {
  logmsg("Creating page '$page_title'...");
  if (!$dry_run) {
    $id = wp_insert_post([
      'post_title' => $page_title,
      'post_status' => 'publish',
      'post_type' => 'page',
    ]);
    if (is_wp_error($id)) {
      logmsg('Error creating page: ' . $id->get_error_message());
      exit(1);
    }
    $page = get_post($id);
  }
}

logmsg('Setting static front page to Landing');
if (!$dry_run && isset($page->ID)) {
  update_option('show_on_front', 'page');
  update_option('page_on_front', $page->ID);
}

logmsg('Migration complete');

