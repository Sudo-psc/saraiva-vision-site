/**
 * URL Sanitization Utilities
 * Valida e sanitiza URLs para evitar SyntaxError e validação backend
 */

/**
 * Valida se string é URL válida
 */
export function isValidUrl(string) {
  if (!string || typeof string !== 'string') {
    return false;
  }

  try {
    const url = new URL(string);
    // Permitir apenas http/https
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitiza URL removendo caracteres problemáticos
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return 'https://saraivavision.com.br';
  }

  // Remover URLs especiais que causam problemas
  const invalidProtocols = ['about:', 'blob:', 'data:', 'chrome:', 'chrome-extension:', 'moz-extension:'];

  if (invalidProtocols.some(proto => url.startsWith(proto))) {
    return 'https://saraivavision.com.br';
  }

  try {
    const parsed = new URL(url);

    // Sanitizar query params
    const sanitizedSearch = Array.from(parsed.searchParams.entries())
      .map(([key, value]) => {
        // Remover PII de query params
        const sanitizedKey = encodeURIComponent(key);
        const sanitizedValue = encodeURIComponent(value.substring(0, 200)); // Limitar tamanho
        return `${sanitizedKey}=${sanitizedValue}`;
      })
      .join('&');

    parsed.search = sanitizedSearch ? `?${sanitizedSearch}` : '';

    // Remover hash se muito longo
    if (parsed.hash.length > 100) {
      parsed.hash = '';
    }

    return parsed.toString();
  } catch (error) {
    console.warn('[url-sanitizer] Failed to parse URL:', error.message);
    return 'https://saraivavision.com.br';
  }
}

/**
 * Constrói URL de endpoint de forma segura
 */
export function buildEndpointUrl(endpoint, base = window.location.origin) {
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Invalid endpoint: must be a non-empty string');
  }

  try {
    // Se endpoint já é URL absoluta
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return new URL(endpoint).toString();
    }

    // Se endpoint é relativo
    if (!base || typeof base !== 'string') {
      throw new Error('Invalid base URL');
    }

    // Garantir que base tem protocolo
    if (!base.startsWith('http://') && !base.startsWith('https://')) {
      base = `https://${base}`;
    }

    // Garantir que endpoint começa com /
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }

    return new URL(endpoint, base).toString();
  } catch (error) {
    console.error('[url-sanitizer] Failed to build endpoint URL:', error.message);
    throw new Error(`Invalid endpoint construction: ${error.message}`);
  }
}

/**
 * Valida e sanitiza timestamp para ISO 8601
 */
export function sanitizeTimestamp(timestamp) {
  if (!timestamp) {
    return new Date().toISOString();
  }

  try {
    // Se já é string ISO
    if (typeof timestamp === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(timestamp)) {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    // Se é número (Unix timestamp em ms ou s)
    if (typeof timestamp === 'number') {
      // Converter segundos para ms se necessário (timestamps antes de 2001 são provavelmente em segundos)
      const ts = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
      const date = new Date(ts);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    // Fallback
    return new Date().toISOString();
  } catch (error) {
    console.warn('[url-sanitizer] Failed to sanitize timestamp:', error.message);
    return new Date().toISOString();
  }
}

export default {
  isValidUrl,
  sanitizeUrl,
  buildEndpointUrl,
  sanitizeTimestamp
};
