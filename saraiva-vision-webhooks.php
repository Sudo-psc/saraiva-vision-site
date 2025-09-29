<?php
/**
 * Plugin Name: Saraiva Vision Webhooks
 * Plugin URI: https://saraivavision.com.br
 * Description: WordPress webhooks integration for Saraiva Vision website
 * Version: 1.0.0
 * Author: Saraiva Vision
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: saraiva-vision-webhooks
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Webhook secrets - configure these in wp-config.php or environment
define('WP_REVALIDATE_SECRET', getenv('WP_REVALIDATE_SECRET') ?: '4943c790a44f9f4abae532323c859fc5a603bba778267e4e0040401350890b52');
define('WP_WEBHOOK_SECRET', getenv('WP_WEBHOOK_SECRET') ?: 'ec22a257b3e8df04cb1d21f369d5e42817250d58c11be75dfef0a9642a996faa');

// Webhook URL - adjust for your domain
define('WEBHOOK_URL', 'https://saraivavision.com.br/api/wordpress-webhook');

/**
 * Trigger revalidation webhook on post changes
 */
function saraiva_vision_trigger_revalidation_webhook($post_id, $post, $update) {
    // Only trigger for published posts
    if ($post->post_status !== 'publish') {
        return;
    }

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
        'timestamp' => time(),
    ];

    $response = wp_remote_post($webhook_url, [
        'body' => json_encode($payload),
        'headers' => [
            'Content-Type' => 'application/json',
            'X-Hub-Signature-256' => 'sha256=' . hash_hmac('sha256', json_encode($payload), $webhook_secret),
            'User-Agent' => 'SaraivaVision-Webhook/1.0',
        ],
        'timeout' => 10,
    ]);

    if (is_wp_error($response)) {
        error_log('Saraiva Vision Webhook failed: ' . $response->get_error_message());
    } else {
        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code === 200) {
            error_log('Saraiva Vision Webhook sent successfully for post: ' . $post->post_title);
        } else {
            error_log('Saraiva Vision Webhook failed with HTTP ' . $response_code . ' for post: ' . $post->post_title);
        }
    }
}

/**
 * Hook into post publish/update events
 */
add_action('wp_insert_post', 'saraiva_vision_trigger_revalidation_webhook', 10, 3);

/**
 * Also trigger on post updates
 */
add_action('post_updated', function($post_id, $post_after, $post_before) {
    if ($post_after->post_status === 'publish' && $post_before->post_status === 'publish') {
        saraiva_vision_trigger_revalidation_webhook($post_id, $post_after, true);
    }
}, 10, 3);

/**
 * Trigger on post deletion (for cache cleanup)
 */
add_action('before_delete_post', function($post_id) {
    $post = get_post($post_id);
    if ($post) {
        saraiva_vision_trigger_revalidation_webhook($post_id, $post, false);
    }
});

/**
 * Add admin notice for webhook configuration
 */
add_action('admin_notices', function() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $webhook_url = WEBHOOK_URL;
    $test_response = wp_remote_get($webhook_url . '/test', ['timeout' => 5]);

    if (is_wp_error($test_response)) {
        echo '<div class="notice notice-warning is-dismissible">';
        echo '<p><strong>Saraiva Vision Webhooks:</strong> Webhook endpoint is not responding. Please check your webhook URL configuration.</p>';
        echo '</div>';
    } else {
        echo '<div class="notice notice-success is-dismissible">';
        echo '<p><strong>Saraiva Vision Webhooks:</strong> Webhook integration is active and responding.</p>';
        echo '</div>';
    }
});

/**
 * Add settings page for webhook configuration
 */
add_action('admin_menu', function() {
    add_options_page(
        'Saraiva Vision Webhooks',
        'Webhooks',
        'manage_options',
        'saraiva-vision-webhooks',
        'saraiva_vision_webhooks_settings_page'
    );
});

function saraiva_vision_webhooks_settings_page() {
    ?>
    <div class="wrap">
        <h1>Saraiva Vision Webhooks</h1>
        <p>This plugin integrates WordPress with the Saraiva Vision website by sending webhooks when posts are published or updated.</p>

        <h2>Configuration</h2>
        <table class="form-table">
            <tr>
                <th scope="row">Webhook URL</th>
                <td><?php echo esc_html(WEBHOOK_URL); ?></td>
            </tr>
            <tr>
                <th scope="row">Revalidate Secret</th>
                <td><?php echo esc_html(substr(WP_REVALIDATE_SECRET, 0, 10) . '...'); ?></td>
            </tr>
            <tr>
                <th scope="row">Webhook Secret</th>
                <td><?php echo esc_html(substr(WP_WEBHOOK_SECRET, 0, 10) . '...'); ?></td>
            </tr>
        </table>

        <h2>Test Webhook</h2>
        <p>You can test the webhook by clicking the button below:</p>
        <button id="test-webhook" class="button button-primary">Test Webhook</button>
        <div id="webhook-result"></div>

        <script>
        jQuery(document).ready(function($) {
            $('#test-webhook').on('click', function() {
                var $button = $(this);
                var $result = $('#webhook-result');

                $button.prop('disabled', true).text('Testing...');
                $result.html('<p>Testing webhook...</p>');

                $.ajax({
                    url: '<?php echo esc_url(WEBHOOK_URL); ?>/test',
                    type: 'GET',
                    timeout: 10000,
                    success: function(response) {
                        $result.html('<p style="color: green;">✅ Webhook test successful!</p>');
                    },
                    error: function(xhr, status, error) {
                        $result.html('<p style="color: red;">❌ Webhook test failed: ' + error + '</p>');
                    },
                    complete: function() {
                        $button.prop('disabled', false).text('Test Webhook');
                    }
                });
            });
        });
        </script>
    </div>
    <?php
}

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    // Create log file if it doesn't exist
    $log_file = WP_CONTENT_DIR . '/saraiva-vision-webhooks.log';
    if (!file_exists($log_file)) {
        file_put_contents($log_file, "Saraiva Vision Webhooks Log\n");
        chmod($log_file, 0644);
    }

    // Set default options
    add_option('saraiva_vision_webhooks_version', '1.0.0');
});

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, function() {
    // Clean up if needed
    delete_option('saraiva_vision_webhooks_version');
});