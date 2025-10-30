/**
 * Nonce-based Content Security Policy Middleware
 * Replaces unsafe-inline with cryptographic nonces for enhanced security
 *
 * SECURITY IMPROVEMENT: Eliminates need for 'unsafe-inline' in CSP
 * - Generates unique nonce per request
 * - Automatically adds nonce to CSP headers
 * - Provides nonce to response locals for templates
 */

import crypto from 'crypto';

/**
 * Generates a cryptographically secure nonce.
 *
 * @returns {string} A Base64-encoded random nonce.
 * @private
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Builds a Content Security Policy (CSP) string with nonce support.
 *
 * @param {string} nonce The request-specific nonce.
 * @returns {string} The complete CSP header value.
 * @private
 */
function buildCSP(nonce) {
  // Pre-compute nonce token to ensure proper interpolation
  const nonceToken = `'nonce-${nonce}'`;

  const directives = {
    // Default: Only same origin
    'default-src': ["'self'"],

    // Scripts: Self + nonce (NO unsafe-inline)
    'script-src': [
      "'self'",
      nonceToken,
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://cdn.jsdelivr.net',
      'https://maps.googleapis.com',
      'https://*.spotify.com'
    ],

    // Styles: Self + nonce for inline styles
    'style-src': [
      "'self'",
      nonceToken,
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net'
    ],

    // Images: Self + data URIs + external sources
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:',
      'https://www.google-analytics.com',
      'https://*.googleusercontent.com'
    ],

    // Fonts: Self + Google Fonts
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ],

    // Connections: API endpoints
    'connect-src': [
      "'self'",
      'https://api.resend.com',
      'https://api.zenvia.com',
      'https://api.ninsaude.com',
      'https://www.google-analytics.com',
      'https://analytics.google.com',
      'https://maps.googleapis.com',
      'https://places.googleapis.com',
      'https://*.supabase.co',
      'wss://*.supabase.co'
    ],

    // Frames: Spotify embeds only
    'frame-src': [
      "'self'",
      'https://open.spotify.com',
      'https://www.google.com'
    ],

    // Frame ancestors: Prevent clickjacking
    'frame-ancestors': ["'none'"],

    // Base URI: Restrict to self
    'base-uri': ["'self'"],

    // Form actions: Only self
    'form-action': ["'self'"],

    // Object/Embed: Block Flash, Java, etc.
    'object-src': ["'none'"],

    // Media: Self + Spotify
    'media-src': [
      "'self'",
      'https://open.spotify.com',
      'https://*.scdn.co'
    ],

    // Worker: Self only
    'worker-src': ["'self'", 'blob:'],

    // Manifest: Self only
    'manifest-src': ["'self'"],

    // Upgrade insecure requests (HTTP → HTTPS)
    'upgrade-insecure-requests': []
  };

  // Convert directives to CSP string
  const cspString = Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key; // Directives without values (like upgrade-insecure-requests)
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');

  return cspString;
}

/**
 * An Express middleware for generating a nonce-based Content Security Policy (CSP).
 *
 * @param {object} [options={}] Configuration options for the middleware.
 * @param {boolean} [options.reportOnly=false] If `true`, the `Content-Security-Policy-Report-Only` header will be used.
 * @param {string} [options.reportUri='/api/csp-reports'] The URI to send CSP violation reports to.
 * @returns {function(object, object, function(): void): void} The Express middleware function.
 */
export function nonceCSP(options = {}) {
  const {
    reportOnly = false,
    reportUri = '/api/csp-reports'
  } = options;

  return (req, res, next) => {
    // Generate unique nonce for this request
    const nonce = generateNonce();

    // Store nonce in response locals for template access
    res.locals.nonce = nonce;
    res.locals.cspNonce = nonce; // Backwards compatibility

    // Build CSP with nonce
    let csp = buildCSP(nonce);

    // Add report URI if specified
    if (reportUri) {
      csp += `; report-uri ${reportUri}`;
      csp += `; report-to default`;
    }

    // Set appropriate CSP header
    const headerName = reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';

    res.setHeader(headerName, csp);

    // Set Report-To header for modern browsers
    if (reportUri) {
      res.setHeader('Report-To', JSON.stringify({
        group: 'default',
        max_age: 31536000,
        endpoints: [{ url: reportUri }],
        include_subdomains: true
      }));
    }

    // Add helper function to response for inline scripts/styles
    res.locals.scriptNonce = () => `nonce="${nonce}"`;
    res.locals.styleNonce = () => `nonce="${nonce}"`;

    next();
  };
}

/**
 * An environment-aware CSP middleware that uses "report-only" mode in development and enforcing mode in production.
 *
 * @returns {function(object, object, function(): void): void} The Express middleware function.
 */
export function adaptiveCSP() {
  const isProduction = process.env.NODE_ENV === 'production';

  return nonceCSP({
    reportOnly: !isProduction,
    reportUri: '/api/csp-reports'
  });
}

/**
 * An Express middleware that applies a stricter Content Security Policy (CSP) for admin or other sensitive endpoints.
 *
 * @returns {function(object, object, function(): void): void} The Express middleware function.
 */
export function strictCSP() {
  return (req, res, next) => {
    const nonce = generateNonce();
    res.locals.nonce = nonce;

    // Pre-compute nonce token to ensure proper interpolation
    const nonceToken = `'nonce-${nonce}'`;

    const strictDirectives = {
      'default-src': ["'self'"],
      'script-src': ["'self'", nonceToken],
      'style-src': ["'self'", nonceToken],
      'img-src': ["'self'", 'data:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-src': ["'none'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'object-src': ["'none'"],
      'upgrade-insecure-requests': []
    };

    const csp = Object.entries(strictDirectives)
      .map(([key, values]) => {
        if (values.length === 0) return key;
        return `${key} ${values.join(' ')}`;
      })
      .join('; ');

    res.setHeader('Content-Security-Policy', csp);
    next();
  };
}

/**
 * An Express route handler for receiving and logging Content Security Policy (CSP) violation reports.
 *
 * @param {object} logger A logger instance with a `warn` method.
 * @returns {function(object, object): void} The Express route handler function.
 */
export function cspReportHandler(logger) {
  return (req, res) => {
    const report = req.body;

    // Log CSP violation
    if (logger) {
      logger.warn('CSP Violation', {
        category: 'security',
        subcategory: 'csp_violation',
        documentUri: report['document-uri'],
        violatedDirective: report['violated-directive'],
        blockedUri: report['blocked-uri'],
        sourceFile: report['source-file'],
        lineNumber: report['line-number'],
        userAgent: req.get('user-agent'),
        ip: req.ip
      });
    } else {
    }

    // Return 204 No Content
    res.status(204).send();
  };
}

/**
 * A helper function to create a script tag with a nonce attribute.
 *
 * @param {string} nonce The CSP nonce.
 * @param {string} content The content of the script tag.
 * @returns {string} The HTML script tag with the nonce attribute.
 */
export function scriptWithNonce(nonce, content) {
  return `<script nonce="${nonce}">${content}</script>`;
}

/**
 * A helper function to create a style tag with a nonce attribute.
 *
 * @param {string} nonce The CSP nonce.
 * @param {string} content The content of the style tag.
 * @returns {string} The HTML style tag with the nonce attribute.
 */
export function styleWithNonce(nonce, content) {
  return `<style nonce="${nonce}">${content}</style>`;
}

export default {
  nonceCSP,
  adaptiveCSP,
  strictCSP,
  cspReportHandler,
  scriptWithNonce,
  styleWithNonce,
  generateNonce,
  buildCSP
};
