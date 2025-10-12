/**
 * URL Normalizer Utility
 *
 * Corrige problemas comuns de construção de URLs:
 * - Barras duplas (//)
 * - Barras ausentes
 * - Query parameters duplicados
 *
 * @author Dr. Philipe Saraiva Cruz
 * @priority P0 - Critical
 */

/**
 * Normaliza uma URL removendo barras duplas e garantindo formato correto
 *
 * @param {string} url - URL a ser normalizada
 * @returns {string} URL normalizada
 *
 * @example
 * normalizeURL('https://api.com//users//123')
 * // Returns: 'https://api.com/users/123'
 *
 * normalizeURL('/api/users')
 * // Returns: '/api/users'
 */
export function normalizeURL(url) {
  if (!url || typeof url !== 'string') {
    throw new TypeError('URL must be a non-empty string');
  }

  // Preserva o protocolo (http://, https://, ws://, wss://)
  const protocolMatch = url.match(/^(https?:\/\/|wss?:\/\/)/);
  const protocol = protocolMatch ? protocolMatch[0] : '';
  let path = protocol ? url.slice(protocol.length) : url;

  // Remove barras duplas ou múltiplas, mantendo apenas uma
  path = path.replace(/\/+/g, '/');

  // Remove barra final, exceto se for a raiz
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // Reconstrói a URL
  const normalized = protocol + path;

  // Validação básica
  if (protocol && !path) {
    throw new Error('Invalid URL: path cannot be empty after protocol');
  }

  return normalized;
}

/**
 * URLBuilder - Construtor fluente de URLs com validação automática
 *
 * @example
 * const url = new URLBuilder('https://api.com')
 *   .path('users')
 *   .path('123')
 *   .query('active', 'true')
 *   .query('role', 'admin')
 *   .build();
 * // Returns: 'https://api.com/users/123?active=true&role=admin'
 */
export class URLBuilder {
  /**
   * @param {string} baseURL - URL base (com ou sem protocolo)
   */
  constructor(baseURL) {
    if (!baseURL || typeof baseURL !== 'string') {
      throw new TypeError('Base URL must be a non-empty string');
    }

    this.base = baseURL.replace(/\/+$/, ''); // Remove trailing slashes
    this.segments = [];
    this.params = new Map();
  }

  /**
   * Adiciona um segmento ao caminho
   *
   * @param {string} segment - Segmento do caminho (será normalizado)
   * @returns {URLBuilder} this para encadeamento
   */
  path(segment) {
    if (segment == null) return this;

    const cleaned = String(segment)
      .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
      .trim();

    if (cleaned) {
      this.segments.push(cleaned);
    }

    return this;
  }

  /**
   * Adiciona múltiplos segmentos ao caminho
   *
   * @param {...string} segments - Segmentos do caminho
   * @returns {URLBuilder} this para encadeamento
   */
  paths(...segments) {
    segments.forEach(seg => this.path(seg));
    return this;
  }

  /**
   * Adiciona um parâmetro de query string
   *
   * @param {string} key - Nome do parâmetro
   * @param {string|number|boolean} value - Valor do parâmetro
   * @returns {URLBuilder} this para encadeamento
   */
  query(key, value) {
    if (key == null || value == null) return this;

    const cleanKey = String(key).trim();
    const cleanValue = String(value).trim();

    if (cleanKey && cleanValue) {
      this.params.set(cleanKey, cleanValue);
    }

    return this;
  }

  /**
   * Adiciona múltiplos parâmetros de query string
   *
   * @param {Object} params - Objeto com pares chave-valor
   * @returns {URLBuilder} this para encadeamento
   */
  queries(params) {
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, value]) => {
        this.query(key, value);
      });
    }
    return this;
  }

  /**
   * Constrói a URL final normalizada
   *
   * @returns {string} URL completa e normalizada
   */
  build() {
    // Constrói o caminho
    const path = this.segments.length > 0
      ? '/' + this.segments.join('/')
      : '';

    // Constrói query string
    const queryString = this.params.size > 0
      ? '?' + Array.from(this.params.entries())
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&')
      : '';

    // Monta URL final
    const fullURL = this.base + path + queryString;

    // Normaliza para remover quaisquer barras duplas restantes
    return normalizeURL(fullURL);
  }

  /**
   * Retorna a URL construída (alias para build)
   *
   * @returns {string} URL completa e normalizada
   */
  toString() {
    return this.build();
  }
}

/**
 * Helper para construir URLs de API rapidamente
 *
 * @param {string} endpoint - Endpoint da API (ex: '/users/123')
 * @param {Object} params - Query parameters opcionais
 * @returns {string} URL normalizada
 *
 * @example
 * buildAPIURL('/users/123', { active: true })
 * // Returns: '/users/123?active=true'
 */
export function buildAPIURL(endpoint, params = {}) {
  const builder = new URLBuilder(endpoint);

  if (params && typeof params === 'object') {
    builder.queries(params);
  }

  return builder.build();
}

/**
 * Helper para construir URLs absolutas rapidamente
 *
 * @param {string} baseURL - URL base
 * @param {string} path - Caminho
 * @param {Object} params - Query parameters opcionais
 * @returns {string} URL completa normalizada
 *
 * @example
 * buildFullURL('https://api.com', '/users/123', { active: true })
 * // Returns: 'https://api.com/users/123?active=true'
 */
export function buildFullURL(baseURL, path, params = {}) {
  return new URLBuilder(baseURL)
    .path(path)
    .queries(params)
    .build();
}

// Export default como objeto com todas as funções
export default {
  normalizeURL,
  URLBuilder,
  buildAPIURL,
  buildFullURL
};
