import DOMPurify from 'dompurify';

const DEFAULT_OPTIONS = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'base'],
  FORBID_ATTR: ['srcdoc', 'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  ADD_ATTR: ['target', 'rel'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|sms|whatsapp|ftp):|\/|#)/i,
};

const fallbackSanitize = (html) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<link[^>]*?>/gi, '')
    .replace(/<base[^>]*?>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/srcdoc="[^"]*"/gi, '')
    .replace(/srcdoc='[^']*'/gi, '');

const mergeArrays = (base, extension = []) => Array.from(new Set([...(base || []), ...(extension || [])]));

export const sanitizeWordPressContent = (html, options = {}) => {
  if (!html) return '';

  try {
    if (typeof window !== 'undefined' && DOMPurify?.sanitize) {
      const sanitizedOptions = { ...DEFAULT_OPTIONS, ...options };

      if (options.FORBID_TAGS) {
        sanitizedOptions.FORBID_TAGS = mergeArrays(DEFAULT_OPTIONS.FORBID_TAGS, options.FORBID_TAGS);
      }

      if (options.FORBID_ATTR) {
        sanitizedOptions.FORBID_ATTR = mergeArrays(DEFAULT_OPTIONS.FORBID_ATTR, options.FORBID_ATTR);
      }

      return DOMPurify.sanitize(html, sanitizedOptions);
    }
  } catch (error) {
    console.warn('DOMPurify sanitation failed, falling back to regex sanitization.', error);
  }

  return fallbackSanitize(html);
};

export const sanitizeWordPressTitle = (html) =>
  sanitizeWordPressContent(html, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'span', 'br', 'sup', 'sub'],
    ALLOWED_ATTR: ['class', 'aria-hidden', 'aria-label'],
  });

export const sanitizeWordPressExcerpt = (html) =>
  sanitizeWordPressContent(html, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'span', 'br'],
    ALLOWED_ATTR: ['class'],
  });

export default sanitizeWordPressContent;
