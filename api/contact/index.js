import { validateContactSubmission } from '../../src/lib/validation.js';
import { sendContactEmail } from './emailService.js';
import { applyRateLimiting, sanitizeFormData, createErrorResponse, createSuccessResponse, logRequest } from './utils.js';

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

  try {
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

    // Send email using Resend API
    const emailResult = await sendContactEmail(contactData);

    if (!emailResult.success) {
      logRequest(req, 'email_failed', {
        contactId: contactData.id,
        error: emailResult.error?.code
      });
      return res.status(500).json(
        createErrorResponse(
          emailResult.error?.code || 'email_service_error',
          emailResult.error?.message || 'Failed to send email'
        )
      );
    }

    // Log successful submission (without PII)
    const processingTime = Date.now() - startTime;
    logRequest(req, 'contact_submitted', {
      contactId: contactData.id,
      messageId: emailResult.messageId,
      processingTime: `${processingTime}ms`
    });

    // Return success response
    return res.status(200).json(
      createSuccessResponse('Mensagem enviada com sucesso! Entraremos em contato em breve.', {
        contactId: contactData.id,
        messageId: emailResult.messageId,
        timestamp: contactData.timestamp.toISOString()
      })
    );

  } catch (error) {
    // Handle unexpected errors
    const processingTime = Date.now() - startTime;
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
