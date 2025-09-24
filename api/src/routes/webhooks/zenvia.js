import { supabaseAdmin } from '../../../../..../../../../src/lib/supabase.ts';
import crypto from 'crypto';

/**
 * Zenvia Webhook Handler
 * Handles delivery status updates from Zenvia SMS service
 * Updates message outbox status based on delivery events
 */

/**
 * Verify Zenvia webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Webhook signature from headers
 * @param {string} secret - Webhook secret
 * @returns {boolean} Whether signature is valid
 */
function verifyZenviaSignature(payload, signature, secret) {
    if (!signature || !secret) {
        return false;
    }

    try {
        // Zenvia uses HMAC-SHA256
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        // Compare signatures (handle both with and without 'sha256=' prefix)
        const cleanSignature = signature.replace('sha256=', '');

        return crypto.timingSafeEqual(
            Buffer.from(cleanSignature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (error) {
        console.error('Error verifying Zenvia signature:', error);
        return false;
    }
}

/**
 * Process Zenvia webhook event
 * @param {Object} event - Webhook event data
 * @returns {Promise<Object>} Processing result
 */
async function processZenviaEvent(event) {
    try {
        const { type, message } = event;

        // Extract message ID from message metadata or external ID
        let messageId = null;

        // Try to get message ID from external ID
        if (message.externalId) {
            messageId = message.externalId;
        }

        // Try to get from message contents or metadata
        if (!messageId && message.contents) {
            // Look for message ID in message metadata
            const content = message.contents.find(c => c.type === 'text');
            if (content && content.payload && content.payload.messageId) {
                messageId = content.payload.messageId;
            }
        }

        if (!messageId) {
            console.warn('No message ID found in Zenvia webhook event:', {
                type,
                messageId: message.id,
                externalId: message.externalId
            });
            return { success: false, error: 'No message ID found' };
        }

        // Map Zenvia event types to outbox status
        let newStatus = null;
        let errorMessage = null;

        switch (type) {
            case 'MESSAGE_STATUS':
                // Handle different message statuses
                switch (message.status) {
                    case 'SENT':
                        newStatus = 'sent';
                        break;
                    case 'DELIVERED':
                        newStatus = 'delivered';
                        break;
                    case 'READ':
                        newStatus = 'delivered'; // Keep as delivered, just log the read event
                        await logWebhookEvent('zenvia_message_read', {
                            messageId,
                            zenviaMessageId: message.id,
                            timestamp: message.timestamp
                        }, 'info');
                        break;
                    case 'FAILED':
                    case 'REJECTED':
                        newStatus = 'failed';
                        errorMessage = `SMS ${message.status.toLowerCase()}: ${message.reason || 'unknown reason'}`;
                        break;
                    case 'PENDING':
                    case 'SENT_TO_CHANNEL':
                        // Don't change status for intermediate states
                        await logWebhookEvent('zenvia_status_update', {
                            messageId,
                            zenviaMessageId: message.id,
                            status: message.status,
                            timestamp: message.timestamp
                        }, 'info');
                        return { success: true, action: 'logged_status' };
                    default:
                        console.log('Unknown Zenvia message status:', message.status);
                        return { success: false, error: 'Unknown message status' };
                }
                break;
            case 'MESSAGE_EVENT':
                // Handle message events (like delivery reports)
                if (message.eventType === 'DELIVERY_REPORT') {
                    switch (message.deliveryStatus) {
                        case 'DELIVERED':
                            newStatus = 'delivered';
                            break;
                        case 'FAILED':
                        case 'EXPIRED':
                            newStatus = 'failed';
                            errorMessage = `SMS delivery ${message.deliveryStatus.toLowerCase()}: ${message.reason || 'unknown reason'}`;
                            break;
                        default:
                            console.log('Unknown Zenvia delivery status:', message.deliveryStatus);
                            return { success: false, error: 'Unknown delivery status' };
                    }
                } else {
                    console.log('Unknown Zenvia event type:', message.eventType);
                    return { success: false, error: 'Unknown event type' };
                }
                break;
            default:
                console.log('Unknown Zenvia webhook type:', type);
                return { success: false, error: 'Unknown webhook type' };
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
        await logWebhookEvent('zenvia_status_update', {
            messageId,
            zenviaMessageId: message.id,
            eventType: type,
            messageStatus: message.status,
            deliveryStatus: message.deliveryStatus,
            newStatus,
            recipient: updatedMessage.recipient,
            errorMessage,
            timestamp: message.timestamp
        }, newStatus === 'failed' ? 'error' : 'info');

        return {
            success: true,
            messageId,
            newStatus,
            action: 'status_updated'
        };

    } catch (error) {
        console.error('Error processing Zenvia event:', error);
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
                source: 'zenvia_webhook'
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
        const signature = req.headers['x-zenvia-signature'] || req.headers['zenvia-signature'];
        const webhookSecret = process.env.ZENVIA_WEBHOOK_SECRET;

        // Verify webhook signature if secret is configured
        if (webhookSecret) {
            if (!verifyZenviaSignature(rawBody, signature, webhookSecret)) {
                console.log('Invalid Zenvia webhook signature');
                return res.status(401).json({
                    success: false,
                    error: 'Invalid signature'
                });
            }
        } else {
            console.warn('ZENVIA_WEBHOOK_SECRET not configured - webhook signature not verified');
        }

        // Process the webhook event
        const result = await processZenviaEvent(req.body);

        const processingTime = Date.now() - startTime;

        if (result.success) {
            console.log('Zenvia webhook processed successfully:', {
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
            console.error('Failed to process Zenvia webhook:', result.error);

            return res.status(400).json({
                success: false,
                error: result.error,
                processingTime: `${processingTime}ms`
            });
        }

    } catch (error) {
        const processingTime = Date.now() - startTime;

        console.error('Zenvia webhook handler error:', {
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