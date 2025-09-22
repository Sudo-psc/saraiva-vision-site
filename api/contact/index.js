import { validateContactSubmission } from '../../src/lib/validation.js';
import { sendContactEmail } from './emailService.js';
import { addToOutbox } from './outboxService.js';
import { supabaseAdmin } from '../../src/lib/supabase.ts';
import { applyRateLimiting, sanitizeFormData, createErrorResponse, createSuccessResponse, logRequest } from './utils.js';
import { getClientIP } from './rateLimiter.js';
import { createLogger } from '../../src/lib/logger.js';
import { alertingSystem } from '../../src/lib/alertingSystem.js';

/**
 * Apply CORS headers for cross-origin requests
 * @param {Response} res - Response object
 */
function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Parse JSON body from request with error handling
 * @param {Request} req - Request object
 * @returns {Promise<Object>} Parsed JSON body
 */
async function parseJsonBody(req) {
  try {
    if (!req.body) {
      return {};
    }

    // Handle different body formats
    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }

    if (typeof req.body === 'object') {
      return req.body;
    }

    return {};
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Main contact API endpoint handler
 * Vercel serverless function for processing contact form submissions
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  const logger = createLogger('contact-api', req.headers['x-request-id']);

  try {
    await logger.info('Contact form submission started', {
      method: req.method,
      user_agent: req.headers['user-agent'],
      ip: getClientIP(req)
    });
    // Apply CORS headers
    applyCors(res);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      logRequest(req, 'method_not_allowed', { method: req.method });
      return res.status(405).json(
        createErrorResponse('method_not_allowed', 'Only POST requests are allowed')
      );
    }

    // Parse request body
    let formData;
    try {
      formData = await parseJsonBody(req);
    } catch (error) {
      logRequest(req, 'invalid_json', { error: error.message });
      return res.status(400).json(
        createErrorResponse('invalid_json', 'Invalid JSON in request body')
      );
    }

    // Sanitize form data to prevent XSS
    const sanitizedData = sanitizeFormData(formData);

    // Apply rate limiting and spam detection
    const rateLimitResult = applyRateLimiting(req, res, sanitizedData);
    if (rateLimitResult) {
      logRequest(req, 'rate_limited', { type: rateLimitResult.statusCode === 429 ? 'rate_limit' : 'spam' });
      return res.status(rateLimitResult.statusCode).json(JSON.parse(rateLimitResult.body));
    }

    // Validate form data using Zod schema
    const validation = validateContactSubmission(sanitizedData);
    if (!validation.success) {
      logRequest(req, 'validation_failed', {
        errorCount: Object.keys(validation.errors).length,
        fields: Object.keys(validation.errors)
      });
      return res.status(400).json(
        createErrorResponse('validation_error', 'Form validation failed', null, null, validation.errors)
      );
    }

    // Add timestamp and unique ID for tracking
    const contactData = {
      ...validation.data,
      timestamp: new Date(),
      id: generateContactId()
    };

    // Store contact message in database first (transactional)
    const { data: contactRecord, error: dbError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        message: contactData.message,
        consent_given: contactData.consent,
        ip_hash: require('crypto').createHash('sha256').update(getClientIP(req)).digest('hex')
      })
      .select('id')
      .single();

    if (dbError) {
      logRequest(req, 'database_error', {
        contactId: contactData.id,
        error: dbError.message
      });
      return res.status(500).json(
        createErrorResponse('database_error', 'Failed to store contact information')
      );
    }

    // Add email to outbox for reliable delivery
    const outboxResult = await addToOutbox({
      message_type: 'email',
      recipient: process.env.DOCTOR_EMAIL || 'philipe_cruz@outlook.com',
      subject: `Novo contato do site - ${contactData.name}`,
      content: `Contact form submission from ${contactData.name}`,
      template_data: {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        message: contactData.message,
        timestamp: contactData.timestamp,
        id: contactRecord.id
      },
      max_retries: 3,
      send_after: new Date()
    });

    if (!outboxResult.success) {
      logRequest(req, 'outbox_failed', {
        contactId: contactData.id,
        dbId: contactRecord.id,
        error: outboxResult.error?.code
      });

      // Even if outbox fails, we still have the contact stored
      // Return success but log the issue for manual follow-up
      console.error('Failed to queue email for delivery:', outboxResult.error);
    }

    // Try immediate delivery (best effort)
    let immediateDelivery = null;
    try {
      immediateDelivery = await sendContactEmail({
        ...contactData,
        id: contactRecord.id
      });

      // Track email delivery
      await alertingSystem.trackEmailDelivery(
        outboxResult.messageId,
        process.env.DOCTOR_EMAIL || 'philipe_cruz@outlook.com',
        immediateDelivery.success,
        immediateDelivery.success ? null : new Error(immediateDelivery.error || 'Unknown error'),
        {
          contact_id: contactRecord.id,
          delivery_method: 'immediate'
        }
      );

      if (immediateDelivery.success && outboxResult.success) {
        // Mark outbox message as sent since immediate delivery succeeded
        await supabaseAdmin
          .from('message_outbox')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', outboxResult.messageId);
      }
    } catch (error) {
      await logger.warn('Immediate email delivery failed, will retry via outbox', {
        contact_id: contactRecord.id,
        error_message: error.message
      });

      // Track failed delivery
      await alertingSystem.trackEmailDelivery(
        outboxResult.messageId,
        process.env.DOCTOR_EMAIL || 'philipe_cruz@outlook.com',
        false,
        error,
        {
          contact_id: contactRecord.id,
          delivery_method: 'immediate'
        }
      );
    }

    // Log successful submission (without PII)
    const processingTime = Date.now() - startTime;
    await logger.info('Contact form submission completed successfully', {
      contact_id: contactRecord.id,
      outbox_id: outboxResult.messageId,
      immediate_delivery: immediateDelivery?.success || false,
      processing_time_ms: processingTime
    });

    logRequest(req, 'contact_submitted', {
      contactId: contactData.id,
      dbId: contactRecord.id,
      outboxId: outboxResult.messageId,
      immediateDelivery: immediateDelivery?.success || false,
      processingTime: `${processingTime}ms`
    });

    // Return success response
    return res.status(200).json(
      createSuccessResponse('Mensagem enviada com sucesso! Entraremos em contato em breve.', {
        contactId: contactRecord.id,
        messageId: immediateDelivery?.messageId || outboxResult.messageId,
        timestamp: contactData.timestamp.toISOString(),
        deliveryMethod: immediateDelivery?.success ? 'immediate' : 'queued'
      })
    );

  } catch (error) {
    // Handle unexpected errors
    const processingTime = Date.now() - startTime;

    await logger.error('Contact API unexpected error', {
      error_message: error.message,
      error_stack: error.stack,
      processing_time_ms: processingTime
    });

    console.error('Contact API unexpected error:', {
      error: error.message,
      stack: error.stack,
      processingTime: `${processingTime}ms`
    });

    logRequest(req, 'unexpected_error', {
      error: error.message,
      processingTime: `${processingTime}ms`
    });

    return res.status(500).json(
      createErrorResponse('internal_server_error', 'An unexpected error occurred. Please try again.')
    );
  }
}

/**
 * Generate unique contact ID for tracking
 * @returns {string} Unique contact ID
 */
function generateContactId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `contact_${timestamp}_${random}`;
}
