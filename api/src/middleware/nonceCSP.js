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
 * Generate cryptographically secure nonce
 * @returns {string} Base64-encoded random nonce
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * CSP configuration with nonce support
 * @param {string} nonce - Request-specific nonce
 * @returns {string} Complete CSP header value
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
 * Nonce-based CSP middleware
 * Generates nonce per request and injects into CSP header
 *
 * @param {object} options - Configuration options
 * @param {boolean} options.reportOnly - Use CSP Report-Only mode
 * @param {string} options.reportUri - URI for CSP violation reports
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
 * Environment-aware CSP middleware
 * - Production: Enforcing CSP
 * - Development: Report-Only CSP
 */
export function adaptiveCSP() {
  const isProduction = process.env.NODE_ENV === 'production';

  return nonceCSP({
    reportOnly: !isProduction,
    reportUri: '/api/csp-reports'
  });
}

/**
 * Strict CSP for admin/sensitive endpoints
 * More restrictive than public CSP
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
 * CSP violation report handler
 * Logs CSP violations for security monitoring
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
 * Helper: Create script tag with nonce
 * @param {string} nonce - CSP nonce
 * @param {string} content - Script content
 * @returns {string} Script tag with nonce
 */
export function scriptWithNonce(nonce, content) {
  return `<script nonce="${nonce}">${content}</script>`;
}

/**
 * Helper: Create inline style tag with nonce
 * @param {string} nonce - CSP nonce
 * @param {string} content - CSS content
 * @returns {string} Style tag with nonce
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
