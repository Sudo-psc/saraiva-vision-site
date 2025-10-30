/**
 * Handles the health check request for the API.
 *
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 * @returns {void}
 */
export default function handler(req, res) {
  // Log request for monitoring
  console.log(`Health check from ${req.headers['x-forwarded-for'] || 'unknown'}`);

  // Check contact form service configuration without importing emailService
  // to avoid Resend initialization errors when API key is missing
  const emailServiceCheck = validateEmailServiceConfigSafe();

  // Determine overall health status
  const isHealthy = emailServiceCheck.isValid;
  const status = isHealthy ? 'ok' : 'degraded';
  const httpStatus = isHealthy ? 200 : 503;

  const healthData = {
    status,
    timestamp: new Date().toISOString(),
    service: 'saraiva-vision-api',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    services: {
      contactForm: {
        status: emailServiceCheck.isValid ? 'ok' : 'error',
        configured: emailServiceCheck.isValid,
        errors: emailServiceCheck.errors || []
      },
      rateLimiting: {
        status: 'ok',
        configured: true
      },
      validation: {
        status: 'ok',
        configured: true
      }
    },
    config: {
      nodeEnv: process.env.NODE_ENV,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasDoctorEmail: !!process.env.DOCTOR_EMAIL,
      rateLimitWindow: process.env.RATE_LIMIT_WINDOW || '15',
      rateLimitMax: process.env.RATE_LIMIT_MAX || '5'
    }
  };

  res.status(httpStatus).json(healthData);
}

/**
 * Safely validates the email service configuration without initializing the service.
 *
 * This function checks for the presence and validity of required environment variables
 * for the email service to avoid runtime errors when the service is not configured.
 *
 * @returns {{isValid: boolean, errors: string[]}} An object indicating if the configuration is valid and a list of errors.
 */
function validateEmailServiceConfigSafe() {
  const errors = [];

  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY environment variable is not set');
  }

  if (!process.env.DOCTOR_EMAIL) {
    errors.push('DOCTOR_EMAIL environment variable is not set');
  } else {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(process.env.DOCTOR_EMAIL)) {
      errors.push('DOCTOR_EMAIL environment variable is not a valid email address');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}