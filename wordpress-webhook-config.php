<?php
/**
 * WordPress Webhook Configuration for Saraiva Vision
 * Add this code to your theme's functions.php or create a custom plugin
 */

// Webhook secrets - configure these in wp-config.php or environment
define('WP_REVALIDATE_SECRET', getenv('WP_REVALIDATE_SECRET') ?: '4943c790a44f9f4abae532323c859fc5a603bba778267e4e0040401350890b52');
define('WP_WEBHOOK_SECRET', getenv('WP_WEBHOOK_SECRET') ?: 'ec22a257b3e8df04cb1d21f369d5e42817250d58c11be75dfef0a9642a996faa');

// Webhook URL - adjust for your domain
define('WEBHOOK_URL', 'https://saraivaivision.com.br/api/wordpress-webhook');

// Function to trigger revalidation webhook
function trigger_revalidation_webhook($post_id, $post, $update) {
    // Only trigger for published posts
    if ($post->post_status !== 'publish') return;
    
    $webhook_secret = WP_WEBHOOK_SECRET;
    $webhook_url = WEBHOOK_URL;
    
    $payload = [
        'action' => $update ? 'wp_update_post' : 'publish_' . $post->post_type,
        'post_id' => $post_id,
        'post_type' => $post->post_type,
        'post_slug' => $post->post_name,
        'post_status' => $post->post_status,
        'post_title' => $post->post_title,
        'post_modified' => $post->post_modified,
    ];
    
    $response = wp_remote_post($webhook_url, [
        'body' => json_encode($payload),
        'headers' => [
            'Content-Type' => 'application/json',
            'X-Hub-Signature-256' => 'sha256=' . hash_hmac('sha256', json_encode($payload), $webhook_secret),
        ],
        'timeout' => 10,
    ]);
    
    if (is_wp_error($response)) {
        error_log('Webhook failed: ' . $response->get_error_message());
    } else {
        error_log('Webhook sent successfully for post: ' . $post->post_title);
    }
}

// Hook into post publish/update events
add_action('wp_insert_post', 'trigger_revalidation_webhook', 10, 3);

// Also trigger on post updates
add_action('post_updated', function($post_id, $post_after, $post_before) {
    if ($post_after->post_status === 'publish' && $post_before->post_status === 'publish') {
        trigger_revalidation_webhook($post_id, $post_after, true);
    }
}, 10, 3);

// Trigger on post deletion (for cache cleanup)
add_action('before_delete_post', function($post_id) {
    $post = get_post($post_id);
    if ($post) {
        trigger_revalidation_webhook($post_id, $post, false);
    }
});
?>
