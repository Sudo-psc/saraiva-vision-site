import { validateContactSubmission } from '../../../../../../..../../../../src/lib/validation.js';
import { sendContactEmail } from './emailService.js';
import { addToOutbox } from './outboxService.js';
import { supabaseAdmin } from 'from 'from '../../../../../../..../../../../src/lib/supabase.js'' ' ;
import { applyRateLimiting, sanitizeFormData, logRequest } from './utils.js';
import { getClientIP } from './rateLimiter.js';
import { createLogger } from '../../../../../../..../../../../src/lib/logger.js';
import { alertingSystem } from '../../../../../../..../../../../src/lib/alertingSystem.js';
import { serverEncryption } from '../utils/encryption.js';
import { accessControl } from '../../../../../../..../../../../src/lib/lgpd/accessControl.js';
import { securityHeadersMiddleware, applyCorsHeaders, applySecurityHeaders } from '../utils/securityHeaders.js';
import { handleApiError, createErrorResponse, createSuccessResponse } from '../utils/errorHandler.js';

/**
 * Apply comprehensive security headers and CORS
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
function applySecurityMeasures(req, res) {
  // Apply CORS headers
  applyCorsHeaders(req, res);

  // Apply security headers
  applySecurityHeaders(res, {
    requestId: req.security?.requestId || `contact_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  });
}

/**
 * Parse JSON body from request with enhanced error handling and debugging
 * @param {Request} req - Request object
 * @returns {Promise<Object>} Parsed JSON body
 */
async function parseJsonBody(req) {
  try {
    // Log incoming request for debugging (without sensitive data)
    console.log('Contact API - Request details:', {
      method: req.method,
      contentType: req.headers['content-type'],
      hasBody: !!req.body,
      bodyType: typeof req.body
    });

    if (!req.body) {
      console.log('Contact API - No body found in request');
      return {};
    }

    // Handle different body formats
    let parsedBody;
    if (typeof req.body === 'string') {
      console.log('Contact API - Parsing string body');
      parsedBody = JSON.parse(req.body);
    } else if (typeof req.body === 'object') {
      console.log('Contact API - Using object body directly');
      parsedBody = req.body;
    } else {
      console.log('Contact API - Unexpected body type, converting to string first');
      parsedBody = JSON.parse(String(req.body));
    }

    // Log parsed fields for debugging (without sensitive data)
    const fieldNames = Object.keys(parsedBody);
    console.log('Contact API - Parsed fields:', fieldNames);

    // Ensure required fields exist or set defaults
    if (!parsedBody.consent && !parsedBody.consent_given) {
      console.log('Contact API - Missing consent field, setting default to false');
      parsedBody.consent = false;
    }

    return parsedBody;
  } catch (error) {
    console.error('Contact API - JSON parsing error:', {
      error: error.message,
      bodyType: typeof req.body,
      bodyPreview: typeof req.body === 'string' ? req.body.substring(0, 100) : 'non-string body'
    });
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

    // Apply comprehensive security measures
    applySecurityMeasures(req, res);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      logRequest(req, 'method_not_allowed', { method: req.method });
      return await handleApiError(
        new Error('Method not allowed'),
        req,
        res,
        {
          source: 'contact-api',
          requestId: req.security?.requestId || `contact_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          context: { method: req.method, allowedMethods: ['POST', 'OPTIONS'] }
        }
      );
    }

    // Parse request body
    let formData;
    try {
      formData = await parseJsonBody(req);
    } catch (error) {
      logRequest(req, 'invalid_json', { error: error.message });
      const jsonError = new Error('Invalid JSON in request body');
      jsonError.code = 'INVALID_JSON';
      return await handleApiError(
        jsonError,
        req,
        res,
        {
          source: 'contact-api',
          requestId: req.security?.requestId || `contact_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          context: { parseError: error.message }
        }
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

    // LGPD Compliance: Check consent requirement (accept both 'consent' and 'consent_given' for compatibility)
    if (!sanitizedData.consent_given && !sanitizedData.consent) {
      await logger.warn('Contact form submission without LGPD consent', {
        ip_hash: serverEncryption.hash(getClientIP(req)).hash
      });
      const consentError = new Error('LGPD consent required');
      consentError.code = 'CONSENT_REQUIRED';
      return await handleApiError(
        consentError,
        req,
        res,
        {
          source: 'contact-api',
          requestId: req.security?.requestId || `contact_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          field: 'consent'
        }
      );
    }

    // Validate form data using Zod schema
    const validation = validateContactSubmission(sanitizedData);
    if (!validation.success) {
      logRequest(req, 'validation_failed', {
        errorCount: Object.keys(validation.errors).length,
        fields: Object.keys(validation.errors)
      });
      const validationError = new Error('Form validation failed');
      validationError.code = 'VALIDATION_ERROR';
      return await handleApiError(
        validationError,
        req,
        res,
        {
          source: 'contact-api',
          requestId: req.security?.requestId || `contact_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          validationErrors: validation.errors
        }
      );
    }

    // Add timestamp and unique ID for tracking
    const contactData = {
      ...validation.data,
      timestamp: new Date(),
      id: generateContactId()
    };

    // Store contact message in database first (transactional) with encryption
    const encryptedContactData = serverEncryption.encryptPersonalData({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      message: contactData.message
    });

    const { data: contactRecord, error: dbError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        ...encryptedContactData,
        consent_given: contactData.consent,
        ip_hash: serverEncryption.hash(getClientIP(req)).hash
      })
      .select('id')
      .single();

    if (dbError) {
      logRequest(req, 'database_error', {
        contactId: contactData.id,
        error: dbError.message
      });
      const databaseError = new Error('Failed to store contact information');
      databaseError.code = 'DATABASE_CONNECTION_ERROR';
      return await handleApiError(
        databaseError,
        req,
        res,
        {
          source: 'contact-api',
          requestId: req.security?.requestId || `contact_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          context: { contactId: contactData.id, dbError: dbError.message }
        }
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

    return await handleApiError(
      error,
      req,
      res,
      {
        source: 'contact-api',
        requestId: req.security?.requestId || `contact_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        context: { processingTime: `${processingTime}ms` }
      }
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
