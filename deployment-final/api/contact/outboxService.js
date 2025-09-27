import { supabaseAdmin } from '../utils/supabase.js' ;
import { validateMessageOutbox } from '../../src/lib/validation.js';
import { sendContactEmail } from './emailService.js';
import { sendSMS } from './smsService.js';
import { createLogger } from '../../src/lib/logger.js';
import { alertingSystem } from '../../src/lib/alertingSystem.js';

/**
 * Message Outbox Service for reliable email delivery
 * Implements the transactional outbox pattern for guaranteed message delivery
 */

/**
 * Add message to outbox for reliable delivery
 * @param {Object} messageData - Message data to queue
 * @returns {Promise<Object>} Result with message ID
 */
export async function addToOutbox(messageData) {
    const logger = createLogger('outbox-service');

    try {
        // Validate message data
        const validation = validateMessageOutbox(messageData);
        if (!validation.success) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid message data',
                    details: validation.errors
                }
            };
        }

        const validatedData = validation.data;

        // Insert into outbox table using database function
        const { data, error } = await supabaseAdmin.rpc('add_to_outbox', {
            p_message_type: validatedData.message_type,
            p_recipient: validatedData.recipient,
            p_subject: validatedData.subject,
            p_content: validatedData.content,
            p_template_data: validatedData.template_data || null,
            p_send_after: validatedData.send_after?.toISOString() || new Date().toISOString()
        });

        if (error) {
            console.error('Failed to add message to outbox:', error);
            return {
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Failed to queue message for delivery',
                    details: error.message
                }
            };
        }

        // Log the outbox addition
        await logger.info('Message queued in outbox', {
            message_id: data,
            message_type: validatedData.message_type,
            recipient_hash: validatedData.message_type === 'email' ?
                alertingSystem.hashEmail(validatedData.recipient) :
                alertingSystem.hashPhone(validatedData.recipient)
        });

        await logEvent('message_queued', {
            messageId: data,
            messageType: validatedData.message_type,
            recipient: validatedData.recipient
        }, 'info', 'outbox_service');

        return {
            success: true,
            messageId: data,
            status: 'queued'
        };

    } catch (error) {
        console.error('Unexpected error adding to outbox:', error);
        return {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Unexpected error occurred',
                details: error.message
            }
        };
    }
}

/**
 * Process pending messages in outbox
 * @param {number} batchSize - Number of messages to process
 * @returns {Promise<Object>} Processing results
 */
export async function processOutbox(batchSize = 10) {
    try {
        // Get pending messages that are ready to send
        const { data: pendingMessages, error } = await supabaseAdmin.rpc('get_pending_messages', {
            p_batch_size: batchSize
        });

        if (error) {
            console.error('Failed to fetch pending messages:', error);
            return {
                success: false,
                error: 'Failed to fetch pending messages',
                processed: 0,
                failed: 0
            };
        }

        if (!pendingMessages || pendingMessages.length === 0) {
            return {
                success: true,
                message: 'No pending messages to process',
                processed: 0,
                failed: 0
            };
        }

        let processed = 0;
        let failed = 0;

        // Process each message
        for (const message of pendingMessages) {
            try {
                const result = await processMessage(message);
                if (result.success) {
                    processed++;
                } else {
                    failed++;
                }
            } catch (error) {
                console.error(`Failed to process message ${message.id}:`, error);
                failed++;
            }
        }

        await logEvent('outbox_processed', {
            batchSize: pendingMessages.length,
            processed,
            failed
        }, 'info', 'outbox_service');

        return {
            success: true,
            processed,
            failed,
            total: pendingMessages.length
        };

    } catch (error) {
        console.error('Unexpected error processing outbox:', error);
        return {
            success: false,
            error: 'Unexpected error occurred',
            processed: 0,
            failed: 0
        };
    }
}

/**
 * Process individual message from outbox
 * @param {Object} message - Message from outbox
 * @returns {Promise<Object>} Processing result
 */
async function processMessage(message) {
    const logger = createLogger('outbox-processor');

    try {
        let deliveryResult;

        // Process based on message type
        if (message.message_type === 'email') {
            // Prepare contact data for email service
            const contactData = {
                ...message.template_data,
                id: message.id,
                timestamp: new Date()
            };

            deliveryResult = await sendContactEmail(contactData);
        } else if (message.message_type === 'sms') {
            // SMS delivery via Zenvia
            deliveryResult = await sendSMS({
                to: message.recipient,
                message: message.content,
                messageId: message.id
            });
        } else {
            deliveryResult = {
                success: false,
                error: { message: 'Unknown message type' }
            };
        }

        // Update message status based on delivery result
        if (deliveryResult.success) {
            // Mark as sent using database function
            await supabaseAdmin.rpc('mark_message_sent', {
                p_message_id: message.id,
                p_sent_at: new Date().toISOString()
            });

            // Track successful delivery
            if (message.message_type === 'email') {
                await alertingSystem.trackEmailDelivery(
                    message.id,
                    message.recipient,
                    true,
                    null,
                    { delivery_method: 'outbox', retry_count: message.retry_count }
                );
            } else if (message.message_type === 'sms') {
                await alertingSystem.trackSmsDelivery(
                    message.id,
                    message.recipient,
                    true,
                    null,
                    { delivery_method: 'outbox', retry_count: message.retry_count }
                );
            }

            await logger.info('Message delivered successfully from outbox', {
                message_id: message.id,
                message_type: message.message_type,
                retry_count: message.retry_count,
                delivery_id: deliveryResult.messageId
            });

            await logEvent('message_sent', {
                messageId: message.id,
                messageType: message.message_type,
                recipient: message.recipient,
                deliveryId: deliveryResult.messageId
            }, 'info', 'outbox_service');

            return { success: true };

        } else {
            // Mark as failed and increment retry count using database function
            const newRetryCount = message.retry_count + 1;
            const shouldFail = newRetryCount >= message.max_retries;
            const nextRetry = shouldFail ? null : calculateNextRetry(newRetryCount, message.message_type);

            await supabaseAdmin.rpc('mark_message_failed', {
                p_message_id: message.id,
                p_error_message: deliveryResult.error?.message || 'Unknown error',
                p_next_retry: nextRetry?.toISOString() || null
            });

            // Track failed delivery
            const error = new Error(deliveryResult.error?.message || 'Unknown delivery error');
            if (message.message_type === 'email') {
                await alertingSystem.trackEmailDelivery(
                    message.id,
                    message.recipient,
                    false,
                    error,
                    { delivery_method: 'outbox', retry_count: newRetryCount, will_retry: !shouldFail }
                );
            } else if (message.message_type === 'sms') {
                await alertingSystem.trackSmsDelivery(
                    message.id,
                    message.recipient,
                    false,
                    error,
                    { delivery_method: 'outbox', retry_count: newRetryCount, will_retry: !shouldFail }
                );
            }

            if (shouldFail) {
                await logger.error('Message delivery failed permanently', {
                    message_id: message.id,
                    message_type: message.message_type,
                    retry_count: newRetryCount,
                    max_retries: message.max_retries,
                    error_message: deliveryResult.error?.message
                });
            } else {
                await logger.warn('Message delivery failed, will retry', {
                    message_id: message.id,
                    message_type: message.message_type,
                    retry_count: newRetryCount,
                    next_retry: nextRetry?.toISOString(),
                    error_message: deliveryResult.error?.message
                });
            }

            await logEvent('message_retry', {
                messageId: message.id,
                messageType: message.message_type,
                recipient: message.recipient,
                retryCount: newRetryCount,
                failed: shouldFail,
                error: deliveryResult.error?.message
            }, shouldFail ? 'error' : 'warn', 'outbox_service');

            return { success: false, retried: !shouldFail };
        }

    } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);

        // Update with error
        await supabaseAdmin
            .from('message_outbox')
            .update({
                status: 'failed',
                error_message: error.message
            })
            .eq('id', message.id);

        return { success: false };
    }
}

/**
 * Calculate next retry time with exponential backoff
 * @param {number} retryCount - Current retry count
 * @param {string} messageType - Type of message (email, sms)
 * @returns {Date} Next retry time
 */
function calculateNextRetry(retryCount, messageType = 'email') {
    // Different base delays for different message types
    const baseDelays = {
        email: 60 * 1000,      // 1 minute for email
        sms: 30 * 1000         // 30 seconds for SMS (faster retry)
    };

    const baseDelay = baseDelays[messageType] || baseDelays.email;

    // Exponential backoff with different strategies
    let delay;

    if (retryCount <= 3) {
        // Fast retries for first 3 attempts: 1min, 2min, 4min (or 30s, 1min, 2min for SMS)
        delay = baseDelay * Math.pow(2, retryCount - 1);
    } else {
        // Slower retries after 3 attempts: 8min, 16min, 30min
        delay = baseDelay * Math.pow(2, 3) * Math.pow(1.5, retryCount - 4);
    }

    // Maximum delays by message type
    const maxDelays = {
        email: 30 * 60 * 1000,    // 30 minutes max for email
        sms: 15 * 60 * 1000       // 15 minutes max for SMS
    };

    const maxDelay = maxDelays[messageType] || maxDelays.email;
    const actualDelay = Math.min(delay, maxDelay);

    // Add jitter to prevent thundering herd (5-15% of delay)
    const jitterPercent = 0.05 + Math.random() * 0.1; // 5-15%
    const jitter = actualDelay * jitterPercent;

    return new Date(Date.now() + actualDelay + jitter);
}

/**
 * Get outbox statistics for monitoring
 * @returns {Promise<Object>} Outbox statistics
 */
export async function getOutboxStats() {
    try {
        const { data, error } = await supabaseAdmin.rpc('get_outbox_stats', {
            p_hours_back: 24
        });

        if (error) {
            throw error;
        }

        const stats = data[0] || {
            total_messages: 0,
            pending_messages: 0,
            sent_messages: 0,
            failed_messages: 0,
            email_messages: 0,
            sms_messages: 0,
            avg_retry_count: 0
        };

        return {
            success: true,
            stats: {
                total: parseInt(stats.total_messages),
                pending: parseInt(stats.pending_messages),
                sent: parseInt(stats.sent_messages),
                failed: parseInt(stats.failed_messages),
                byType: {
                    email: parseInt(stats.email_messages),
                    sms: parseInt(stats.sms_messages)
                },
                avgRetryCount: parseFloat(stats.avg_retry_count) || 0
            }
        };

    } catch (error) {
        console.error('Failed to get outbox stats:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Retry failed messages that haven't exceeded max retries
 * @returns {Promise<Object>} Retry result
 */
export async function retryFailedMessages() {
    try {
        const { data, error } = await supabaseAdmin.rpc('retry_failed_messages');

        if (error) {
            throw error;
        }

        await logEvent('failed_messages_retried', {
            count: data
        }, 'info', 'outbox_service');

        return {
            success: true,
            retriedCount: data
        };

    } catch (error) {
        console.error('Failed to retry messages:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Log event to database
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event data
 * @param {string} severity - Event severity
 * @param {string} source - Event source
 */
async function logEvent(eventType, eventData, severity = 'info', source = 'outbox_service') {
    try {
        await supabaseAdmin
            .from('event_log')
            .insert({
                event_type: eventType,
                event_data: eventData,
                severity,
                source
            });
    } catch (error) {
        console.error('Failed to log event:', error);
    }
}

export default {
    addToOutbox,
    processOutbox,
    getOutboxStats,
    retryFailedMessages
};