// WordPress webhook handler for content updates
// Simplified version for initial testing

// Webhook secret for security
const WEBHOOK_SECRET = process.env.WP_WEBHOOK_SECRET;
const REVALIDATE_SECRET = process.env.WP_REVALIDATE_SECRET;

// Supported WordPress actions that trigger revalidation
const SUPPORTED_ACTIONS = [
    'publish_post',
    'publish_page',
    'wp_update_post',
    'wp_update_page',
];

// Verify webhook signature (if using signed webhooks)
const verifyWebhookSignature = (payload, signature, secret) => {
    if (!signature || !secret) return true; // Skip verification if not configured

    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return `sha256=${expectedSignature}` === signature;
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle GET requests for testing
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            message: 'WordPress webhook endpoint is active',
            timestamp: new Date().toISOString(),
            supported_actions: SUPPORTED_ACTIONS,
        });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        const signature = req.headers['x-hub-signature-256'];
        const rawBody = JSON.stringify(req.body);

        // Verify webhook signature if secret is configured
        if (WEBHOOK_SECRET && !verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
            console.error('Invalid webhook signature');
            return res.status(401).json({
                success: false,
                message: 'Invalid webhook signature',
            });
        }

        const {
            action,
            post_id,
            post_type,
            post_slug,
            post_status,
            post_title,
            post_modified,
        } = req.body;

        // Log webhook received
        console.log('WordPress webhook received:', {
            action,
            post_id,
            post_type,
            post_slug,
            post_status,
            timestamp: new Date().toISOString(),
        });

        // Check if this is a supported action
        if (!SUPPORTED_ACTIONS.includes(action)) {
            console.log(`Ignoring unsupported action: ${action}`);
            return res.status(200).json({
                success: true,
                message: 'Action not supported for revalidation',
                action,
            });
        }

        // Skip if post is not published
        if (post_status !== 'publish') {
            console.log(`Ignoring post with status: ${post_status}`);
            return res.status(200).json({
                success: true,
                message: 'Post not published, skipping revalidation',
                post_status,
            });
        }

        // For now, just log the webhook and return success
        // TODO: Implement actual cache invalidation and revalidation
        console.log(`Webhook processed successfully for ${post_type}: ${post_title}`);

        return res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            data: {
                action,
                post_id,
                post_type,
                post_slug,
                post_title,
                timestamp: new Date().toISOString(),
            },
        });

    } catch (error) {
        console.error('Webhook handler error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
            timestamp: new Date().toISOString(),
        });
    }
}