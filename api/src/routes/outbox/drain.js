/**
 * Outbox Drain API - Processes pending messages and reminders
 * This endpoint is called by Vercel cron jobs every 5 minutes
 * Requirements: 3.3, 4.2, 4.3 - Reliable message delivery and reminder processing
 */

import { processOutbox } from '../contact/outboxService.js'
import { logEvent } from '../../../../..../../../../src/lib/eventLogger.js'

export default async function handler(req, res) {
    // Only allow POST requests from cron jobs
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        })
    }

    // Verify cron secret for security
    const cronSecret = req.headers['authorization']
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized'
        })
    }

    const requestId = `cron_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
        // Process pending messages in outbox
        const outboxResult = await processOutbox(20) // Process up to 20 messages per run

        // Process due reminders
        const reminderResult = await processReminders(requestId)

        const totalProcessed = outboxResult.processed + reminderResult.processed24h + reminderResult.processed2h
        const totalFailed = outboxResult.failed + reminderResult.failed

        await logEvent({
            eventType: 'cron_outbox_drain',
            severity: 'info',
            source: 'outbox_drain_cron',
            requestId,
            eventData: {
                outbox: outboxResult,
                reminders: reminderResult,
                total_processed: totalProcessed,
                total_failed: totalFailed
            }
        })

        return res.status(200).json({
            success: true,
            data: {
                outbox: outboxResult,
                reminders: reminderResult,
                summary: {
                    total_processed: totalProcessed,
                    total_failed: totalFailed
                }
            },
            timestamp: new Date().toISOString(),
            requestId
        })

    } catch (error) {
        console.error('Outbox drain cron error:', error)

        await logEvent({
            eventType: 'cron_outbox_drain_error',
            severity: 'error',
            source: 'outbox_drain_cron',
            requestId,
            eventData: {
                error: error.message,
                stack: error.stack
            }
        })

        return res.status(500).json({
            success: false,
            error: {
                code: 'CRON_ERROR',
                message: 'Failed to process outbox and reminders',
                timestamp: new Date().toISOString(),
                requestId
            }
        })
    }
}

/**
 * Process due reminders (called by cron job)
 * @param {string} requestId - Request ID for tracking
 * @returns {Promise<Object>} Processing results
 */
async function processReminders(requestId) {
    try {
        // Make internal API call to reminders endpoint
        const reminderResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/appointments/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-Cron/1.0'
            }
        })

        if (!reminderResponse.ok) {
            throw new Error(`Reminder processing failed: ${reminderResponse.status}`)
        }

        const reminderData = await reminderResponse.json()
        return reminderData.success ? reminderData.data : {
            processed24h: 0,
            processed2h: 0,
            failed: 1,
            total: 1
        }

    } catch (error) {
        console.error('Error processing reminders in cron:', error)
        return {
            processed24h: 0,
            processed2h: 0,
            failed: 1,
            total: 1,
            error: error.message
        }
    }
}