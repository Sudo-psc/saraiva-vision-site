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
  
  const confirmed = window.confirm(message);
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
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : '';
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
  
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  
  const queryString = params.toString();
  return `mailto:${email}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Validates if a URL is safe to open
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is safe
 */
export const isUrlSafe = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  
  // Check for dangerous protocols first (before URL parsing)
  if (url.includes('javascript:') || url.includes('data:') || url.includes('vbscript:') || url.includes('file:')) {
    return false;
  }
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    
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
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)
      ) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    // Invalid URL - check if it's a simple domain that could be made valid
    if (url && !url.includes(' ') && url.includes('.') && !url.includes('://')) {
      return true; // Simple domain like 'example.com'
    }
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