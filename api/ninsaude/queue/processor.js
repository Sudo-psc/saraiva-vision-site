/**
 * Queue Processor - Background worker for failed notification retries
 * Processes Redis queue with exponential backoff and 24-hour TTL
 *
 * @module api/ninsaude/queue/processor
 */

import { createClient } from 'redis';
import * as emailService from '../services/emailService.js';
import * as whatsappService from '../services/whatsappService.js';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

const QUEUE_PREFIX = 'ninsaude:queue:';
const MAX_RETRIES = 3;
const BACKOFF_DELAYS = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000]; // 5min, 15min, 1hr
const QUEUE_TTL = 24 * 60 * 60; // 24 hours in seconds

let redisClient = null;

/**
 * Initialize Redis client
 */
async function initRedis() {
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
 * Add notification to queue
 */
export async function enqueueNotification(notificationData) {
  const client = await initRedis();

  const queueItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    data: notificationData,
    attempts: 0,
    createdAt: new Date().toISOString(),
    lastAttempt: null,
    errors: []
  };

  const key = `${QUEUE_PREFIX}${queueItem.id}`;

  await client.set(key, JSON.stringify(queueItem), {
    EX: QUEUE_TTL
  });

  console.log(`Notification queued: ${queueItem.id}`);
  return queueItem.id;
}

/**
 * Process a single notification from queue
 */
async function processNotification(queueItem) {
  const { data, attempts } = queueItem;
  const { type, eventType, appointmentData } = data;

  let result = { emailSent: false, whatsappSent: false };

  try {
    // Send email notification
    if (type === 'email' || type === 'dual') {
      let emailResult;

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

      result.emailSent = emailResult?.success || false;
    }

    // Send WhatsApp notification
    if (type === 'whatsapp' || type === 'dual') {
      let whatsappResult;

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

      result.whatsappSent = whatsappResult?.success || false;
    }

    return {
      success: result.emailSent || result.whatsappSent,
      ...result
    };
  } catch (error) {
    console.error(`Error processing notification (attempt ${attempts + 1}):`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate next retry delay with exponential backoff
 */
function getRetryDelay(attempt) {
  if (attempt >= BACKOFF_DELAYS.length) {
    return BACKOFF_DELAYS[BACKOFF_DELAYS.length - 1];
  }
  return BACKOFF_DELAYS[attempt];
}

/**
 * Check if queue item should be retried
 */
function shouldRetry(queueItem) {
  const now = Date.now();
  const lastAttemptTime = queueItem.lastAttempt ? new Date(queueItem.lastAttempt).getTime() : 0;
  const retryDelay = getRetryDelay(queueItem.attempts);

  return now - lastAttemptTime >= retryDelay;
}

/**
 * Escalate to manual processing
 */
async function escalateToManual(queueItem) {
  console.error(`ESCALATION REQUIRED: Notification ${queueItem.id} failed after ${queueItem.attempts} attempts`);
  console.error('Appointment data:', JSON.stringify(queueItem.data.appointmentData, null, 2));

  // TODO: Send notification to admin system or create manual task
  // For now, just log to console
  console.log('Manual processing required for:');
  console.log(`- Patient: ${queueItem.data.appointmentData.patientName}`);
  console.log(`- Email: ${queueItem.data.appointmentData.patientEmail}`);
  console.log(`- Phone: ${queueItem.data.appointmentData.patientPhone}`);
  console.log(`- Event: ${queueItem.data.eventType}`);
  console.log(`- Errors:`, queueItem.errors);
}

/**
 * Process all notifications in queue
 */
export async function processQueue() {
  const client = await initRedis();

  try {
    // Get all queue keys
    const keys = await client.keys(`${QUEUE_PREFIX}*`);

    if (keys.length === 0) {
      console.log('Queue is empty');
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    console.log(`Processing ${keys.length} items from queue`);

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const key of keys) {
      const itemData = await client.get(key);
      if (!itemData) continue;

      const queueItem = JSON.parse(itemData);

      // Check if item has expired (24 hours)
      const createdAt = new Date(queueItem.createdAt).getTime();
      const age = Date.now() - createdAt;

      if (age > QUEUE_TTL * 1000) {
        console.log(`Queue item ${queueItem.id} expired (age: ${Math.round(age / 3600000)}h)`);
        await escalateToManual(queueItem);
        await client.del(key);
        failed++;
        continue;
      }

      // Check if max retries reached
      if (queueItem.attempts >= MAX_RETRIES) {
        console.log(`Queue item ${queueItem.id} reached max retries`);
        await escalateToManual(queueItem);
        await client.del(key);
        failed++;
        continue;
      }

      // Check if should retry now
      if (!shouldRetry(queueItem)) {
        console.log(`Queue item ${queueItem.id} not ready for retry yet`);
        continue;
      }

      // Process notification
      console.log(`Processing queue item ${queueItem.id} (attempt ${queueItem.attempts + 1})`);

      const result = await processNotification(queueItem);

      queueItem.attempts++;
      queueItem.lastAttempt = new Date().toISOString();

      if (result.success) {
        console.log(`Queue item ${queueItem.id} processed successfully`);
        await client.del(key);
        succeeded++;
      } else {
        console.log(`Queue item ${queueItem.id} failed (attempt ${queueItem.attempts})`);
        queueItem.errors.push({
          timestamp: new Date().toISOString(),
          error: result.error || 'Unknown error'
        });

        // Update queue item with new attempt info
        await client.set(key, JSON.stringify(queueItem), {
          EX: QUEUE_TTL
        });
        failed++;
      }

      processed++;
    }

    console.log(`Queue processing complete: ${processed} processed, ${succeeded} succeeded, ${failed} failed`);

    return { processed, succeeded, failed };
  } catch (error) {
    console.error('Error processing queue:', error);
    throw error;
  }
}

/**
 * Get queue status
 */
export async function getQueueStatus() {
  const client = await initRedis();

  try {
    const keys = await client.keys(`${QUEUE_PREFIX}*`);
    const items = [];

    for (const key of keys) {
      const itemData = await client.get(key);
      if (itemData) {
        items.push(JSON.parse(itemData));
      }
    }

    return {
      total: items.length,
      pending: items.filter(item => item.attempts < MAX_RETRIES).length,
      failed: items.filter(item => item.attempts >= MAX_RETRIES).length,
      items
    };
  } catch (error) {
    console.error('Error getting queue status:', error);
    throw error;
  }
}

/**
 * Cleanup Redis connection
 */
export async function cleanup() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, cleaning up...');
  await cleanup();
  process.exit(0);
});
