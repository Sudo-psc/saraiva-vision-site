import { validateRequest } from './rateLimiter.js';

/**
 * Middleware function to apply rate limiting and spam detection
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {Object} formData - Form submission data
 * @returns {Object|null} - Error response if blocked, null if allowed
 */
export function applyRateLimiting(req, res, formData) {
  const validation = validateRequest(req, formData);

  // Set rate limiting headers
  Object.entries(validation.headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (!validation.allowed) {
    const statusCode = validation.type === 'rate_limit' ? 429 : 400;

    return {
      statusCode,
      body: JSON.stringify({
        success: false,
        error: {
          code: validation.type,
          message: validation.message,
          retryAfter: validation.retryAfter
        }
      })
    };
  }

  return null; // Request is allowed
}

/**
 * Add honeypot field to form data for spam detection
 * This should be called from the frontend to include the honeypot field
 * @param {Object} formData - Original form data
 * @returns {Object} - Form data with honeypot field
 */
export function addHoneypotField(formData) {
  return {
    ...formData,
    honeypot: formData.honeypot || '', // Preserve existing or set empty
    website: formData.website || '',   // Alternative honeypot field
    url: formData.url || ''            // Another alternative honeypot field
  };
}

/**
 * Sanitize form data to prevent XSS and other attacks
 * @param {Object} formData - Raw form data
 * @returns {Object} - Sanitized form data
 */
export function sanitizeFormData(formData) {
  const sanitized = {};

  // List of allowed fields (including non-string fields for testing)
  const allowedFields = ['name', 'email', 'phone', 'message', 'consent', 'honeypot', 'website', 'url', 'age'];

  allowedFields.forEach(field => {
    if (formData[field] !== undefined) {
      if (typeof formData[field] === 'string') {
        // Basic XSS prevention - encode special characters first, then remove HTML tags
        sanitized[field] = formData[field]
          .replace(/[<>&"']/g, (match) => {
            const entities = {
              '<': '&lt;',
              '>': '&gt;',
              '&': '&amp;',
              '"': '&quot;',
              "'": '&#x27;'
            };
            return entities[match];
          })
          .replace(/&lt;[^&]*&gt;/g, '') // Remove HTML tags (now encoded)
          .trim();
      } else {
        sanitized[field] = formData[field];
      }
    }
  });

  return sanitized;
}

/**
 * Validate required fields are present
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result
 */
export function validateRequiredFields(formData) {
  const requiredFields = ['name', 'email', 'phone', 'message'];
  const missing = [];

  requiredFields.forEach(field => {
    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
      missing.push(field);
    }
  });

  // Check consent separately to provide specific LGPD message
  if (formData.consent !== true && formData.consent !== 'true') {
    missing.push('consent');
  }

  if (missing.length > 0) {
    return {
      valid: false,
      errors: missing.map(field => {
        if (field === 'consent') {
          return {
            field: 'consent',
            message: 'LGPD consent is required to process your request'
          };
        }
        return {
          field,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        };
      })
    };
  }

  return {
    valid: true,
    errors: []
  };
}

/**
 * Create standardized error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {string|null} field - Field name for validation errors
 * @param {number|null} retryAfter - Retry after seconds for rate limiting
 * @param {Object|null} validationErrors - Detailed validation errors
 * @returns {Object} - Standardized error response
 */
export function createErrorResponse(code, message, field = null, retryAfter = null, validationErrors = null) {
  const error = {
    code,
    message
  };

  if (field) {
    error.field = field;
  }

  if (retryAfter) {
    error.retryAfter = retryAfter;
  }

  if (validationErrors) {
    error.validationErrors = validationErrors;
  }

  return {
    success: false,
    error
  };
}

/**
 * Create standardized success response
 * @param {string} message - Success message
 * @param {Object} data - Additional data to include
 * @returns {Object} - Standardized success response
 */
export function createSuccessResponse(message, data = {}) {
  return {
    success: true,
    message,
    ...data
  };
}

/**
 * Log request for monitoring (without exposing PII)
 * @param {Request} req - Request object
 * @param {string} action - Action being performed
 * @param {Object} metadata - Additional metadata
 */
export function logRequest(req, action, metadata = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    action,
    userAgent: req.headers['user-agent'] || 'unknown',
    referer: req.headers.referer || 'direct',
    ...metadata
  };

  // Log without exposing IP or other PII
  console.log(`Contact API: ${JSON.stringify(logData)}`);
}