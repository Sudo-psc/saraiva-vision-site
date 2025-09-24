import { supabaseAdmin } from 'from 'from '../../src/lib/supabase.js'' ' ;
import crypto from 'crypto';

/**
 * Resend Webhook Handler
 * Handles delivery status updates from Resend email service
 * Updates message outbox status based on delivery events
 */

/**
 * Verify Resend webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Webhook signature from headers
 * @param {string} secret - Webhook secret
 * @returns {boolean} Whether signature is valid
 */
function verifyResendSignature(payload, signature, secret) {
    if (!signature || !secret) {
        return false;
    }

    try {
        // Resend uses HMAC-SHA256 with format: t=timestamp,v1=signature
        const elements = signature.split(',');
        const timestamp = elements.find(el => el.startsWith('t='))?.substring(2);
        const sig = elements.find(el => el.startsWith('v1='))?.substring(3);

        if (!timestamp || !sig) {
            return false;
        }

        // Check timestamp (reject if older than 5 minutes)
        const webhookTimestamp = parseInt(timestamp);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (currentTimestamp - webhookTimestamp > 300) {
            console.log('Webhook timestamp too old:', { webhookTimestamp, currentTimestamp });
            return false;
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${timestamp}.${payload}`)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(sig, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (error) {
        console.error('Error verifying Resend signature:', error);
        return false;
    }
}

/**
 * Process Resend webhook event
 * @param {Object} event - Webhook event data
 * @returns {Promise<Object>} Processing result
 */
async function processResendEvent(event) {
    try {
        const { type, data } = event;

        // Extract message ID from email headers or metadata
        let messageId = null;

        // Try to get message ID from custom headers
        if (data.headers && data.headers['X-Message-ID']) {
            messageId = data.headers['X-Message-ID'];
        }

        // Try to get from metadata
        if (!messageId && data.metadata && data.metadata.messageId) {
            messageId = data.metadata.messageId;
        }

        // Try to get from tags
        if (!messageId && data.tags) {
            const messageTag = data.tags.find(tag => tag.startsWith('msg_'));
            if (messageTag) {
                messageId = messageTag.substring(4); // Remove 'msg_' prefix
            }
        }

        if (!messageId) {
            console.warn('No message ID found in Resend webhook event:', { type, emailId: data.email_id });
            return { success: false, error: 'No message ID found' };
        }

        // Map Resend event types to outbox status
        let newStatus = null;
        let errorMessage = null;

        switch (type) {
            case 'email.sent':
                newStatus = 'sent';
                break;
            case 'email.delivered':
                newStatus = 'delivered';
                break;
            case 'email.bounced':
                newStatus = 'failed';
                errorMessage = `Email bounced: ${data.bounce_type || 'unknown'}`;
                break;
            case 'email.complained':
                newStatus = 'failed';
                errorMessage = 'Email marked as spam';
                break;
            case 'email.delivery_delayed':
                // Don't change status, just log the delay
                await logWebhookEvent('resend_delivery_delayed', {
                    messageId,
                    emailId: data.email_id,
                    delay: data.delay
                }, 'warn');
                return { success: true, action: 'logged_delay' };
            default:
                console.log('Unknown Resend event type:', type);
                return { success: false, error: 'Unknown event type' };
        }

        // Update message status in outbox
        const updateData = {
            status: newStatus,
            updated_at: new Date().toISOString()
        };

        if (newStatus === 'sent' || newStatus === 'delivered') {
            updateData.sent_at = new Date().toISOString();
            updateData.error_message = null;
        } else if (newStatus === 'failed') {
            updateData.error_message = errorMessage;
        }

        const { data: updatedMessage, error } = await supabaseAdmin
            .from('message_outbox')
            .update(updateData)
            .eq('id', messageId)
            .select('id, status, message_type, recipient')
            .single();

        if (error) {
            console.error('Failed to update message status:', error);
            return { success: false, error: error.message };
        }

        // Log the webhook event
        await logWebhookEvent('resend_status_update', {
            messageId,
            emailId: data.email_id,
            eventType: type,
            newStatus,
            recipient: updatedMessage.recipient,
            errorMessage
        }, newStatus === 'failed' ? 'error' : 'info');

        return {
            success: true,
            messageId,
            newStatus,
            action: 'status_updated'
        };

    } catch (error) {
        console.error('Error processing Resend event:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Log webhook event to database
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event data
 * @param {string} severity - Event severity
 */
async function logWebhookEvent(eventType, eventData, severity = 'info') {
    try {
        await supabaseAdmin
            .from('event_log')
            .insert({
                event_type: eventType,
                event_data: eventData,
                severity,
                source: 'resend_webhook'
            });
    } catch (error) {
        console.error('Failed to log webhook event:', error);
    }
}

/**
 * Main webhook handler
 */
export default async function handler(req, res) {
    const startTime = Date.now();

    try {
        // Only allow POST requests
        if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST');
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

        // Get raw body for signature verification
        const rawBody = JSON.stringify(req.body);
        const signature = req.headers['resend-signature'] || req.headers['x-resend-signature'];
        const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

        // Verify webhook signature if secret is configured
        if (webhookSecret) {
            if (!verifyResendSignature(rawBody, signature, webhookSecret)) {
                console.log('Invalid Resend webhook signature');
                return res.status(401).json({
                    success: false,
                    error: 'Invalid signature'
                });
            }
        } else {
            console.warn('RESEND_WEBHOOK_SECRET not configured - webhook signature not verified');
        }

        // Process the webhook event
        const result = await processResendEvent(req.body);

        const processingTime = Date.now() - startTime;

        if (result.success) {
            console.log('Resend webhook processed successfully:', {
                messageId: result.messageId,
                newStatus: result.newStatus,
                action: result.action,
                processingTime: `${processingTime}ms`
            });

            return res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
                data: {
                    messageId: result.messageId,
                    status: result.newStatus,
                    action: result.action
                },
                processingTime: `${processingTime}ms`
            });
        } else {
            console.error('Failed to process Resend webhook:', result.error);

            return res.status(400).json({
                success: false,
                error: result.error,
                processingTime: `${processingTime}ms`
            });
        }

    } catch (error) {
        const processingTime = Date.now() - startTime;

        console.error('Resend webhook handler error:', {
            error: error.message,
            stack: error.stack,
            processingTime: `${processingTime}ms`
        });

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            processingTime: `${processingTime}ms`
        });
    }
}

/**
 * Configuration for Vercel
 */
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
    maxDuration: 10,
};