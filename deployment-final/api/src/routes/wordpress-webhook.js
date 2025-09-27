// WordPress webhook handler for content updates
import { invalidateCache } from '../../../..../../../../src/lib/wordpress-api.js';
import { getRevalidationPaths, triggerRevalidation } from '../../../..../../../../src/lib/wordpress-isr.js';

// Webhook secret for security
const WEBHOOK_SECRET = process.env.WP_WEBHOOK_SECRET;
const REVALIDATE_SECRET = process.env.WP_REVALIDATE_SECRET;

// Supported WordPress actions that trigger revalidation
const SUPPORTED_ACTIONS = [
    'publish_post',
    'publish_page',
    'publish_service',
    'publish_team_member',
    'publish_testimonial',
    'trash_post',
    'trash_page',
    'trash_service',
    'trash_team_member',
    'trash_testimonial',
    'wp_update_post',
    'wp_update_page',
];

// Map WordPress post types to our content types
const POST_TYPE_MAPPING = {
    'post': 'post',
    'page': 'page',
    'service': 'service',
    'team_member': 'team_member',
    'testimonial': 'testimonial',
};

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
    res.setHeader('Access-Control-Allow-Origin', process.env.WORDPRESS_DOMAIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
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

        // Map WordPress post type to our content type
        const contentType = POST_TYPE_MAPPING[post_type];
        if (!contentType) {
            console.log(`Ignoring unsupported post type: ${post_type}`);
            return res.status(200).json({
                success: true,
                message: 'Post type not supported for revalidation',
                post_type,
            });
        }

        // Skip if post is not published (unless it's being trashed)
        if (post_status !== 'publish' && !action.includes('trash')) {
            console.log(`Ignoring post with status: ${post_status}`);
            return res.status(200).json({
                success: true,
                message: 'Post not published, skipping revalidation',
                post_status,
            });
        }

        const startTime = Date.now();

        try {
            // Clear cache for this content type
            invalidateCache(contentType);

            // Get paths that need revalidation
            const pathsToRevalidate = getRevalidationPaths(contentType, post_slug);

            // Trigger revalidation for each path
            const revalidationResults = [];

            for (const path of pathsToRevalidate) {
                try {
                    const url = `/api/revalidate?secret=${REVALIDATE_SECRET}&path=${encodeURIComponent(path)}`;

                    // Make internal request to revalidation endpoint
                    const revalidateResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}${url}`, {
                        method: 'POST',
                    });

                    const result = await revalidateResponse.json();

                    revalidationResults.push({
                        path,
                        success: revalidateResponse.ok,
                        result,
                    });
                } catch (error) {
                    console.error(`Failed to revalidate path ${path}:`, error);
                    revalidationResults.push({
                        path,
                        success: false,
                        error: error.message,
                    });
                }
            }

            const duration = Date.now() - startTime;
            const successfulRevalidations = revalidationResults.filter(r => r.success);
            const failedRevalidations = revalidationResults.filter(r => !r.success);

            console.log(`Webhook processing completed in ${duration}ms:`, {
                action,
                contentType,
                post_slug,
                pathsRevalidated: successfulRevalidations.length,
                pathsFailed: failedRevalidations.length,
            });

            return res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
                data: {
                    action,
                    contentType,
                    post_id,
                    post_slug,
                    pathsRevalidated: successfulRevalidations.map(r => r.path),
                    pathsFailed: failedRevalidations.map(r => ({ path: r.path, error: r.error })),
                    duration,
                    timestamp: new Date().toISOString(),
                },
            });

        } catch (error) {
            console.error('Webhook processing error:', error);

            return res.status(500).json({
                success: false,
                message: 'Failed to process webhook',
                error: error.message,
                data: {
                    action,
                    post_id,
                    post_type,
                    post_slug,
                },
            });
        }

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