/**
 * HTML Sanitization Utility for dangerouslySetInnerHTML
 * Provides DOMPurify-based sanitization for all HTML content
 *
 * SECURITY: All dangerouslySetInnerHTML usages MUST use this utility
 */

import DOMPurify from 'dompurify';
import { useMemo } from 'react';

/**
 * Default sanitization configuration
 * Allows safe HTML tags only, strips dangerous content
 */
const DEFAULT_CONFIG = {
  // Allowed HTML tags for blog content
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'em', 'u', 'i', 'b',
    'a', 'ul', 'ol', 'li',
    'blockquote', 'code', 'pre',
    'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span', 'section', 'article',
    'svg', 'path' // For icons
  ],

  // Allowed attributes
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src',
    'class', 'id', 'style',
    'target', 'rel',
    'width', 'height',
    'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'data-cta-index' // For blog CTA tracking
  ],

  // Allowed URL protocols
  ALLOWED_URI_REGEXP: /^(?:(?:https?|tel|mailto|whatsapp):)/i,

  // Additional security settings
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  FORBID_TAGS: ['script', 'object', 'embed', 'applet', 'base', 'link', 'meta'],
  FORBID_ATTR: [
    'onerror', 'onload', 'onclick', 'ondblclick', 'onmousedown', 'onmouseup',
    'onmouseover', 'onmouseout', 'onmousemove', 'onkeydown', 'onkeyup', 'onkeypress',
    'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect',
    'onabort', 'ondrag', 'ondrop', 'onwheel', 'onscroll'
  ],
  KEEP_CONTENT: true, // Keep text content of removed tags
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  SANITIZE_DOM: true,
  SAFE_FOR_TEMPLATES: true
};

/**
 * Strict configuration for untrusted content
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^https?:/i,
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
  SANITIZE_DOM: true
};

/**
 * Schema.org JSON-LD configuration
 * Blocks all scripts and only allows safe JSON-LD parsing
 */
const SCHEMA_CONFIG = {
  ALLOWED_TAGS: [], // Remove all scripts from general sanitizer
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  CUSTOM_ELEMENT_HANDLING: {
    // Custom handling for script elements when options.schema is true
    element: (node, data) => {
      if (node.tagName === 'SCRIPT' && data.schema) {
        const scriptType = node.getAttribute('type');
        if (scriptType === 'application/ld+json') {
          // Only allow JSON-LD scripts
          try {
            const jsonContent = node.textContent || node.innerHTML;
            JSON.parse(jsonContent); // Validate JSON
            // Return safe text content instead of script tag
            return { textContent: jsonContent };
          } catch (e) {
            // Invalid JSON, remove the script
            return null;
          }
        }
        // Remove all other script types
        return null;
      }
      return data.addNode ? node : null;
    }
  }
};

/**
 * Sanitize HTML content for safe rendering
 *
 * @param {string} html - Raw HTML content
 * @param {object} options - Sanitization options
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html, options = {}) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Handle schema markup with dedicated processing
  if (options.schema) {
    return sanitizeSchemaMarkup(html);
  }

  const config = options.strict ? STRICT_CONFIG :
    { ...DEFAULT_CONFIG, ...options };

  try {
    const sanitized = DOMPurify.sanitize(html, config);

    // Log sanitization if content was modified
    if (sanitized !== html && process.env.NODE_ENV === 'development') {
        originalLength: html.length,
        sanitizedLength: sanitized.length,
        removed: html.length - sanitized.length
      });
    }

    return sanitized;
  } catch (error) {
    // Return empty string on error to prevent XSS
    return '';
  }
}

/**
 * Dedicated schema markup sanitizer
 * Parses HTML, extracts only safe JSON-LD scripts, and returns inert text
 *
 * @param {string} html - HTML containing potential schema markup
 * @returns {string} Sanitized HTML with only safe JSON-LD content
 */
function sanitizeSchemaMarkup(html) {
  try {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Find all script elements
    const scripts = tempDiv.querySelectorAll('script');
    let sanitizedContent = '';

    scripts.forEach(script => {
      const scriptType = script.getAttribute('type');

      // Only process application/ld+json scripts
      if (scriptType === 'application/ld+json') {
        try {
          const jsonContent = script.textContent || script.innerHTML || '';

          // Validate JSON syntax
          JSON.parse(jsonContent);

          // Create safe, inert script tag with the JSON content
          sanitizedContent += `<script type="application/ld+json">${jsonContent}</script>`;

        } catch (jsonError) {
          // Invalid JSON, skip this script
          if (process.env.NODE_ENV === 'development') {
          }
        }
      } else {
        // Log non-JSON-LD scripts being removed
        if (process.env.NODE_ENV === 'development') {
        }
      }
    });

    return sanitizedContent;
  } catch (error) {
    return '';
  }
}

/**
 * Create safe dangerouslySetInnerHTML prop
 *
 * @param {string} html - Raw HTML content
 * @param {object} options - Sanitization options
 * @returns {object} Object with __html property
 *
 * @example
 * <div {...createMarkup(rawHTML)} />
 */
export function createMarkup(html, options = {}) {
  return {
    __html: sanitizeHTML(html, options)
  };
}

/**
 * React Hook for sanitized HTML
 * Memoizes sanitization to prevent unnecessary re-sanitization
 *
 * @param {string} html - Raw HTML content
 * @param {object} options - Sanitization options
 * @returns {object} Object with __html property
 *
 * @example
 * const markup = useSanitizedHTML(content);
 * return <div dangerouslySetInnerHTML={markup} />;
 */

export function useSanitizedHTML(html, options = {}) {
  return useMemo(() => createMarkup(html, options), [html, options]);
}

/**
 * Validate if HTML is safe (returns boolean without sanitizing)
 * Useful for pre-validation before processing
 *
 * @param {string} html - HTML to validate
 * @returns {boolean} True if HTML is safe
 */
export function isHTMLSafe(html) {
  if (!html || typeof html !== 'string') {
    return true;
  }

  const sanitized = DOMPurify.sanitize(html, DEFAULT_CONFIG);
  return sanitized === html;
}

/**
 * Extract plain text from HTML
 * Removes all HTML tags and returns only text content
 *
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
export function extractText(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  });

  return sanitized.trim();
}

/**
 * Sanitize for specific content types
 */
export const sanitizers = {
  /**
   * Sanitize blog post content (allows rich HTML)
   */
  blogPost: (html) => sanitizeHTML(html, DEFAULT_CONFIG),

  /**
   * Sanitize user comments (strict, limited HTML)
   */
  comment: (html) => sanitizeHTML(html, { strict: true }),

  /**
   * Sanitize Schema.org JSON-LD
   */
  schemaMarkup: (html) => sanitizeHTML(html, { schema: true }),

  /**
   * Sanitize podcast transcript (allows formatting)
   */
  transcript: (html) => sanitizeHTML(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h3', 'h4', 'span'],
    ALLOWED_ATTR: ['class']
  }),

  /**
   * Sanitize footer content (allows links and formatting)
   */
  footer: (html) => sanitizeHTML(html, {
    ALLOWED_TAGS: ['p', 'a', 'strong', 'em', 'br', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'aria-label']
  })
};

/**
 * Security audit logger for dangerouslySetInnerHTML usage
 * Logs all usages in development for security review
 */
export function auditDangerousHTML(componentName, html, options = {}) {
  if (process.env.NODE_ENV === 'development') {
      component: componentName,
      htmlLength: html?.length || 0,
      isSanitized: options.sanitized !== false,
      config: options.config || 'default'
    });
  }
}

export default {
  sanitizeHTML,
  createMarkup,
  useSanitizedHTML,
  isHTMLSafe,
  extractText,
  sanitizers,
  auditDangerousHTML
};
