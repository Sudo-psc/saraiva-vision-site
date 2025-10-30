/**
 * CSP Middleware with Nonce Generation
 * Generates unique nonce per request for Content Security Policy
 *
 * Usage:
 *   import cspMiddleware from './middleware/cspMiddleware.js';
 *   app.use(cspMiddleware('report-only')); // For testing
 *   app.use(cspMiddleware('production')); // For production
 */

import crypto from 'crypto';

/**
 * An Express middleware for setting the Content Security Policy (CSP) headers.
 *
 * @param {string} [mode='report-only'] The mode to run the middleware in. Can be 'report-only' or 'production'.
 * @returns {function(object, object, function(): void): void} The Express middleware function.
 */
function cspMiddleware(mode = 'report-only') {
  return (req, res, next) => {
    // Generate cryptographically secure nonce
    const nonce = crypto.randomBytes(16).toString('base64');

    // Make nonce available to templates/responses
    res.locals.cspNonce = nonce;
    req.cspNonce = nonce;

    // Configure Reporting-Endpoints (modern standard)
    res.setHeader(
      'Reporting-Endpoints',
      'csp-endpoint="https://saraivavision.com.br/api/csp-reports"'
    );

    // Configure Report-To (fallback for older browsers)
    res.setHeader('Report-To', JSON.stringify({
      group: 'csp-endpoint',
      max_age: 86400,
      endpoints: [{ url: 'https://saraivavision.com.br/api/csp-reports' }]
    }));

    // Build CSP directives
    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        mode === 'production' ? `'nonce-${nonce}'` : "'unsafe-inline'",
        mode === 'production' ? "'strict-dynamic'" : "'unsafe-eval'",
        'https://www.google.com',
        'https://www.gstatic.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://maps.googleapis.com',
        'https://cdn.pulse.is',
        'https://web.webformscr.com',
        'https://gp.webformscr.com',
        'https://analytics.saraivavision.com.br',
        'https://googleads.g.doubleclick.net',
        'https://ajax.googleapis.com',
        'https://cdnjs.cloudflare.com'
      ],
      'style-src': [
        "'self'",
        mode === 'production' ? `'nonce-${nonce}'` : "'unsafe-inline'",
        'https://web.webformscr.com',
        'https://cdnjs.cloudflare.com',
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://www.google.com',
        'https://www.googletagmanager.com',
        'https://maps.googleapis.com',
        'https://maps.gstatic.com',
        'https://*.supabase.co',
        'https://i.scdn.co'
      ],
      'font-src': [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com'
      ],
      'connect-src': [
        "'self'",
        'https://saraivavision.com.br',
        'https://analytics.saraivavision.com.br',
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://lc.pulse.is',
        'wss://lc.pulse.is',
        'https://maps.googleapis.com',
        'https://www.google.com',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://stats.g.doubleclick.net',
        'https://apolo.ninsaude.com',
        'https://*.ninsaude.com',
        'https://web.webformscr.com',
        'https://s3.eu-central-1.amazonaws.com'
      ],
      'frame-src': [
        "'self'",
        'https://www.google.com',
        'https://www.googletagmanager.com',
        'https://open.spotify.com',
        'https://*.spotify.com',
        'https://apolo.ninsaude.com',
        'https://*.ninsaude.com'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'", 'https://web.webformscr.com'],
      'frame-ancestors': ["'self'"],
      'report-uri': ['https://saraivavision.com.br/api/csp-reports'],
      'report-to': ['csp-endpoint']
    };

    // Add production-only directives
    if (mode === 'production') {
      cspDirectives['upgrade-insecure-requests'] = [];
      cspDirectives['block-all-mixed-content'] = [];
    }

    // Build CSP string
    const cspString = Object.entries(cspDirectives)
      .map(([key, values]) => {
        if (values.length === 0) {
          return key; // Directives without values
        }
        return `${key} ${values.join(' ')}`;
      })
      .join('; ');

    // Set appropriate CSP header
    const headerName = mode === 'report-only'
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';

    res.setHeader(headerName, cspString);

    next();
  };
}

export default cspMiddleware;
