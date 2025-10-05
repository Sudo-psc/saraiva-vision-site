/**
 * Notifications Router - Dual-channel notifications (Email + WhatsApp)
 * POST /api/ninsaude/notifications/send - Dispatch notifications
 * GET /api/ninsaude/notifications/:id/status - Track delivery status
 *
 * @module api/ninsaude/notifications
 */

import express from 'express';
import crypto from 'crypto';
import { createClient } from 'redis';
import * as emailService from './services/emailService.js';
import * as whatsappService from './services/whatsappService.js';
import { enqueueNotification } from './queue/processor.js';

const router = express.Router();

// Redis client for notification status tracking
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

let redisClient = null;

async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT
    },
    password: REDIS_PASSWORD || undefined
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  await redisClient.connect();
  return redisClient;
}

/**
 * Validate notification request
 */
function validateNotificationRequest(req, res, next) {
  const { eventType, appointmentData } = req.body;

  // Validate event type
  const validEventTypes = ['booking_confirmation', 'cancellation', 'rescheduling', 'reminder'];
  if (!eventType || !validEventTypes.includes(eventType)) {
    return res.status(400).json({
      error: 'Invalid event type',
      validTypes: validEventTypes
    });
  }

  // Validate appointment data
  if (!appointmentData) {
    return res.status(400).json({
      error: 'Missing appointment data'
    });
  }

  const requiredFields = ['patientName', 'patientEmail', 'patientPhone', 'appointmentDate', 'appointmentTime', 'doctorName'];
  const missingFields = requiredFields.filter(field => !appointmentData[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missingFields
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(appointmentData.patientEmail)) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }

  // Validate phone format (Brazilian format)
  const phoneRegex = /^[\d\s()+-]+$/;
  if (!phoneRegex.test(appointmentData.patientPhone)) {
    return res.status(400).json({
      error: 'Invalid phone format'
    });
  }

  next();
}

/**
 * POST /api/ninsaude/notifications/send
 * Dispatch dual-channel notifications (Email + WhatsApp)
 */
router.post('/send', validateNotificationRequest, async (req, res) => {
  const { eventType, appointmentData } = req.body;

  const notificationId = crypto.randomBytes(16).toString('hex');

  let emailResult = { success: false };
  let whatsappResult = { success: false };

  try {
    // Send email notification
    switch (eventType) {
      case 'booking_confirmation':
        emailResult = await emailService.sendBookingConfirmation(appointmentData);
        break;
      case 'cancellation':
        emailResult = await emailService.sendCancellationNotice(appointmentData);
        break;
      case 'rescheduling':
        emailResult = await emailService.sendReschedulingNotice(appointmentData);
        break;
      case 'reminder':
        emailResult = await emailService.sendReminder(appointmentData);
        break;
    }

    // Send WhatsApp notification
    switch (eventType) {
      case 'booking_confirmation':
        whatsappResult = await whatsappService.sendBookingConfirmation(appointmentData);
        break;
      case 'cancellation':
        whatsappResult = await whatsappService.sendCancellationNotice(appointmentData);
        break;
      case 'rescheduling':
        whatsappResult = await whatsappService.sendReschedulingNotice(appointmentData);
        break;
      case 'reminder':
        whatsappResult = await whatsappService.sendReminder(appointmentData);
        break;
    }

    // Handle partial failures - queue failed notifications for retry
    const emailSent = emailResult.success;
    const whatsappSent = whatsappResult.success;

    if (!emailSent || !whatsappSent) {
      console.warn(`Partial notification failure - Email: ${emailSent}, WhatsApp: ${whatsappSent}`);

      // Queue failed notifications for retry
      if (!emailSent) {
        await enqueueNotification({
          type: 'email',
          eventType,
          appointmentData
        });
      }

      if (!whatsappSent) {
        await enqueueNotification({
          type: 'whatsapp',
          eventType,
          appointmentData
        });
      }
    }

    // Store notification status in Redis (24h TTL)
    const client = await getRedisClient();
    const notificationStatus = {
      id: notificationId,
      eventType,
      emailSent,
      whatsappSent,
      emailMessageId: emailResult.messageId || null,
      whatsappMessageId: whatsappResult.messageId || null,
      timestamp: new Date().toISOString(),
      errors: {
        email: emailResult.error || null,
        whatsapp: whatsappResult.error || null
      }
    };

    await client.set(
      `ninsaude:notification:${notificationId}`,
      JSON.stringify(notificationStatus),
      { EX: 24 * 60 * 60 } // 24 hours
    );

    // Return response
    return res.status(200).json({
      notificationId,
      emailSent,
      whatsappSent,
      partialFailure: !emailSent || !whatsappSent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error dispatching notifications:', error);

    // Queue entire notification for retry on catastrophic failure
    try {
      await enqueueNotification({
        type: 'dual',
        eventType,
        appointmentData
      });
    } catch (queueError) {
      console.error('Failed to queue notification:', queueError);
    }

    return res.status(500).json({
      error: 'Failed to dispatch notifications',
      message: error.message,
      notificationId
    });
  }
});

/**
 * GET /api/ninsaude/notifications/:id/status
 * Track notification delivery status
 */
router.get('/:id/status', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await getRedisClient();
    const statusData = await client.get(`ninsaude:notification:${id}`);

    if (!statusData) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification ID does not exist or has expired'
      });
    }

    const status = JSON.parse(statusData);

    return res.status(200).json({
      id: status.id,
      eventType: status.eventType,
      emailSent: status.emailSent,
      whatsappSent: status.whatsappSent,
      timestamp: status.timestamp,
      emailMessageId: status.emailMessageId,
      whatsappMessageId: status.whatsappMessageId,
      hasErrors: !!(status.errors.email || status.errors.whatsapp),
      errors: status.errors
    });

  } catch (error) {
    console.error('Error retrieving notification status:', error);
    return res.status(500).json({
      error: 'Failed to retrieve notification status',
      message: error.message
    });
  }
});

/**
 * GET /api/ninsaude/notifications/health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const client = await getRedisClient();
    const ping = await client.ping();

    return res.status(200).json({
      status: 'healthy',
      redis: ping === 'PONG' ? 'connected' : 'error',
      resend: !!process.env.RESEND_API_KEY,
      evolution: !!process.env.EVOLUTION_API_KEY,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
