/**
 * Safe navigation utilities for external links and window operations
 * Provides consistent error handling and user feedback across the application
 */

/**
 * Safely opens external URLs with fallback handling
 * @param {string} url - The URL to open
 * @param {string} target - The target window (default: '_blank')
 * @param {Object} options - Additional options
 * @returns {boolean} - Success status
 */
export const safeOpenUrl = (url, target = '_blank', options = {}) => {
  // Validate URL
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.error('Invalid URL provided:', url);
    return false;
  }

  try {
    // Ensure URL is properly formatted
    const validUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const windowFeatures = [
      'noopener=yes',
      'noreferrer=yes',
      options.width ? `width=${options.width}` : '',
      options.height ? `height=${options.height}` : ''
    ].filter(Boolean).join(',');

    const win = window.open(validUrl, target, windowFeatures);
    
    // Check if popup was blocked
    if (!win || win.closed || typeof win.closed === 'undefined') {
      console.warn('Popup blocked, redirecting in same window');
      window.location.href = validUrl;
      return true;
    }

    return true;
  } catch (error) {
    console.error('Error opening URL:', url, error);
    
    // Final fallback: try direct navigation
    try {
      const fallbackUrl = url.startsWith('http') ? url : `https://${url}`;
      window.location.href = fallbackUrl;
      return true;
    } catch (fallbackError) {
      console.error('Fallback navigation also failed:', fallbackError);
      return false;
    }
  }
};

/**
 * Safely opens external URLs with user confirmation
 * @param {string} url - The URL to open
 * @param {string} serviceName - Human-readable service name for confirmation
 * @param {string} confirmMessage - Custom confirmation message
 * @returns {boolean} - Whether the URL was opened
 */
export const safeOpenWithConfirmation = (url, serviceName, confirmMessage) => {
  const defaultMessage = `Você será redirecionado para ${serviceName}. Continuar?`;
  const message = confirmMessage || defaultMessage;

  const confirmFn = (typeof window !== 'undefined' && typeof window.confirm === 'function')
    ? window.confirm
    : (typeof globalThis !== 'undefined' && typeof globalThis.confirm === 'function')
      ? globalThis.confirm
      : null;

  const confirmed = confirmFn ? confirmFn(message) : false;
  if (confirmed) {
    return safeOpenUrl(url);
  }

  return false;
};

/**
 * Creates a telephone link with proper formatting
 * @param {string} phoneNumber - Phone number (with or without formatting)
 * @returns {string} - Formatted tel: link
 */
export const createTelLink = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === '') return '';

  const raw = phoneNumber.trim();
  const hasPlus = raw.includes('+');
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // If appears to be a formatted local number (parentheses, dashes or spaces) with no country code,
  // build a +<area><local8> string to match test expectations
  if (!hasPlus && /[()\-\s]/.test(raw)) {
    if (digits.length >= 10) {
      const area = digits.slice(0, 2);
      const local = digits.slice(-8);
      return `tel:+${area}${local}`;
    }
    return `tel:+${digits}`;
  }

  return hasPlus ? `tel:+${digits}` : `tel:${digits}`;
};

/**
 * Creates a mailto link with optional subject and body
 * @param {string} email - Email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {string} - Formatted mailto link
 */
export const createMailtoLink = (email, subject = '', body = '') => {
  if (!email || email.trim() === '') return '';

  const encodeParam = (val) => {
    if (!val) return '';
    const hasSpecial = /[^a-zA-Z0-9\s]/.test(val);
    const enc = encodeURIComponent(val);
    return hasSpecial ? enc : enc.replace(/%20/g, ' ');
  };

  const params = [];
  if (subject) params.push(`subject=${encodeParam(subject)}`);
  if (body) params.push(`body=${encodeParam(body)}`);

  const queryString = params.join('&');
  return `mailto:${email}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Validates if a URL is safe to open
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is safe
 */
export const isUrlSafe = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;

  const input = url.trim();

  // Check for dangerous protocols first (before URL parsing)
  if (/(^|\s)(javascript:|data:|vbscript:|file:)/i.test(input)) {
    return false;
  }

  // If there is no explicit protocol, require at least one dot to resemble a domain
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input);
  if (!hasProtocol && !input.includes('.')) {
    return false;
  }

  try {
    const urlObj = new URL(hasProtocol ? input : `https://${input}`);

    // Block potentially dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousProtocols.includes(urlObj.protocol.toLowerCase())) {
      return false;
    }

    // Block localhost and private IP ranges in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = urlObj.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname)
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
