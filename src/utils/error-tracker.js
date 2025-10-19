/**
 * Error Tracker - Sistema de Rastreamento de Erros
 *
 * Rastreamento robusto de erros com:
 * - Queue para batch de erros
 * - Rate limiting para evitar flood
 * - Deduplicação de erros idênticos
 * - Circuit breaker para endpoint de erros
 * - Enrichment automático com contexto
 * - Handlers globais para erros não capturados
 *
 * @author Dr. Philipe Saraiva Cruz
 * @priority P1 - Important
 */

import { CircuitBreaker, postJSON } from './fetch-with-retry.js';

/**
 * Configuração do error tracker
 */
const ERROR_TRACKER_CONFIG = {
  endpoint: '/api/errors',
  batchSize: 10,          // Número de erros por batch
  batchInterval: 5000,    // Intervalo de flush em ms
  maxQueueSize: 100,      // Tamanho máximo da fila
  rateLimit: {
    maxErrors: 50,        // Máximo de erros por janela
    windowMs: 60000       // Janela de 1 minuto
  },
  deduplication: {
    enabled: true,
    windowMs: 300000      // 5 minutos
  },
  circuitBreaker: {
    failureThreshold: 5,
    timeout: 120000       // 2 minutos
  },
  enrichment: {
    captureStackTrace: true,
    captureUserAgent: true,
    captureURL: true,
    captureTimestamp: true,
    captureSessionId: true
  }
};

/**
 * Estado do error tracker
 */
const errorTrackerState = {
  queue: [],
  recentErrors: new Map(), // Para deduplicação
  rateLimitWindow: [],     // Timestamps de erros enviados
  circuitBreaker: new CircuitBreaker(ERROR_TRACKER_CONFIG.circuitBreaker),
  flushInterval: null,
  sessionId: generateSessionId(),
  isInitialized: false
};

/**
 * Gera um ID de sessão único
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Gera um hash de erro para deduplicação
 *
 * @param {Object} error - Objeto de erro
 * @returns {string} Hash do erro
 */
function getErrorHash(error) {
  const { message, stack, url, line, column } = error;
  const hashString = `${message}|${stack}|${url}|${line}|${column}`;
  return hashString;
}

/**
 * Verifica se o erro é duplicado (já foi rastreado recentemente)
 *
 * @param {Object} error - Objeto de erro
 * @returns {boolean} true se for duplicado
 */
function isDuplicate(error) {
  if (!ERROR_TRACKER_CONFIG.deduplication.enabled) {
    return false;
  }

  const hash = getErrorHash(error);
  const now = Date.now();

  // Verifica se erro já existe na janela de deduplicação
  if (errorTrackerState.recentErrors.has(hash)) {
    const lastSeen = errorTrackerState.recentErrors.get(hash);
    const age = now - lastSeen;

    if (age < ERROR_TRACKER_CONFIG.deduplication.windowMs) {
      return true;
    }
  }

  // Registra erro como visto
  errorTrackerState.recentErrors.set(hash, now);

  // Limpa erros antigos do mapa
  for (const [key, timestamp] of errorTrackerState.recentErrors.entries()) {
    if (now - timestamp > ERROR_TRACKER_CONFIG.deduplication.windowMs) {
      errorTrackerState.recentErrors.delete(key);
    }
  }

  return false;
}

/**
 * Verifica rate limit
 *
 * @returns {boolean} true se rate limit não foi excedido
 */
function checkRateLimit() {
  const { maxErrors, windowMs } = ERROR_TRACKER_CONFIG.rateLimit;
  const now = Date.now();

  // Remove timestamps fora da janela
  errorTrackerState.rateLimitWindow = errorTrackerState.rateLimitWindow.filter(
    timestamp => now - timestamp < windowMs
  );

  // Verifica se excedeu limite
  if (errorTrackerState.rateLimitWindow.length >= maxErrors) {
    return false;
  }

  // Adiciona timestamp atual
  errorTrackerState.rateLimitWindow.push(now);
  return true;
}

/**
 * Enriquece erro com contexto adicional
 *
 * @param {Object} error - Objeto de erro básico
 * @returns {Object} Erro enriquecido
 */
function enrichError(error) {
  const { enrichment } = ERROR_TRACKER_CONFIG;
  const enriched = { ...error };

  if (enrichment.captureTimestamp) {
    enriched.timestamp = new Date().toISOString();
  }

  if (enrichment.captureSessionId) {
    enriched.sessionId = errorTrackerState.sessionId;
  }

  if (enrichment.captureURL) {
    enriched.pageUrl = window.location.href;
    enriched.referrer = document.referrer;
  }

  if (enrichment.captureUserAgent) {
    enriched.userAgent = navigator.userAgent;
    enriched.platform = navigator.platform;
    enriched.language = navigator.language;
  }

  // Informações de viewport
  enriched.viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // Informações de performance
  if (window.performance && window.performance.memory) {
    enriched.memory = {
      used: window.performance.memory.usedJSHeapSize,
      total: window.performance.memory.totalJSHeapSize,
      limit: window.performance.memory.jsHeapSizeLimit
    };
  }

  return enriched;
}

/**
 * Adiciona erro à fila
 *
 * @param {Object} error - Objeto de erro
 * @returns {boolean} true se adicionado com sucesso
 */
function enqueueError(error) {
  // Verifica duplicação
  if (isDuplicate(error)) {
    return false;
  }

  // Verifica rate limit
  if (!checkRateLimit()) {
    return false;
  }

  // Enriquece erro
  const enrichedError = enrichError(error);

  // Adiciona à fila
  errorTrackerState.queue.push(enrichedError);

  // Se fila está cheia, faz flush imediato
  if (errorTrackerState.queue.length >= ERROR_TRACKER_CONFIG.batchSize) {
    flushErrorQueue();
  }

  // Se fila excedeu tamanho máximo, remove os mais antigos
  if (errorTrackerState.queue.length > ERROR_TRACKER_CONFIG.maxQueueSize) {
    errorTrackerState.queue = errorTrackerState.queue.slice(-ERROR_TRACKER_CONFIG.maxQueueSize);
  }

  return true;
}

/**
 * Sanitiza URL para conformidade com Zod validation
 *
 * @param {string} url - URL a ser sanitizada
 * @returns {string} URL válida ou fallback
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return 'https://saraivavision.com.br';
  }

  // Lista de protocolos inválidos para o backend
  const invalidProtocols = [
    'about:',
    'blob:',
    'data:',
    'chrome:',
    'chrome-extension:',
    'moz-extension:',
    'safari-extension:',
    'edge-extension:',
    'file:'
  ];

  // Verificar se URL usa protocolo inválido
  const hasInvalidProtocol = invalidProtocols.some(proto => url.startsWith(proto));
  if (hasInvalidProtocol) {
    return 'https://saraivavision.com.br';
  }

  // Tentar validar e normalizar URL
  try {
    const parsed = new URL(url);

    // Apenas http e https são válidos para Zod z.string().url()
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'https://saraivavision.com.br';
    }

    // Remover trailing slash se pathname é apenas "/"
    let normalized = parsed.toString();
    if (parsed.pathname === '/' && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch (error) {
    // URL malformada, usar fallback
    return 'https://saraivavision.com.br';
  }
}

/**
 * Normaliza timestamp para formato ISO 8601
 *
 * @param {string|number|Date} timestamp - Timestamp a ser normalizado
 * @returns {string} ISO 8601 string
 */
function normalizeTimestamp(timestamp) {
  if (!timestamp) {
    return new Date().toISOString();
  }

  try {
    // Se é string, verificar se é ISO válida
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }

    // Se é número (Unix timestamp em ms ou segundos)
    if (typeof timestamp === 'number') {
      // Se menor que 10 bilhões, é timestamp em segundos
      const ts = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
      const date = new Date(ts);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }

    // Se é objeto Date
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? new Date().toISOString() : timestamp.toISOString();
    }

    // Fallback
    return new Date().toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

/**
 * Sanitiza um único erro antes de enviar
 *
 * @param {Object} error - Erro a ser sanitizado
 * @returns {Object} Erro sanitizado
 */
function sanitizeError(error) {
  const sanitized = { ...error };

  // Sanitizar URL
  if (sanitized.pageUrl) {
    sanitized.pageUrl = sanitizeUrl(sanitized.pageUrl);
  }
  if (sanitized.url) {
    sanitized.url = sanitizeUrl(sanitized.url);
  }
  if (sanitized.referrer) {
    sanitized.referrer = sanitizeUrl(sanitized.referrer);
  }

  // Normalizar timestamp
  if (sanitized.timestamp) {
    sanitized.timestamp = normalizeTimestamp(sanitized.timestamp);
  }

  // Limitar tamanhos para evitar payloads gigantes
  if (sanitized.message && typeof sanitized.message === 'string' && sanitized.message.length > 1000) {
    sanitized.message = sanitized.message.substring(0, 1000) + '... (truncated)';
  }

  if (sanitized.stack && typeof sanitized.stack === 'string' && sanitized.stack.length > 5000) {
    sanitized.stack = sanitized.stack.substring(0, 5000) + '... (truncated)';
  }

  // Validar campos obrigatórios
  if (!sanitized.message || typeof sanitized.message !== 'string') {
    sanitized.message = 'Unknown error';
  }

  return sanitized;
}

/**
 * Envia batch de erros para o servidor
 *
 * @returns {Promise<boolean>} true se enviado com sucesso
 */
async function sendBatch(errors) {
  if (!errors || errors.length === 0) {
    return true;
  }

  // Verifica circuit breaker
  if (!errorTrackerState.circuitBreaker.canRequest()) {
    return false;
  }

  // 🛡️ SANITIZAÇÃO: Sanitizar todos os erros antes de enviar
  const sanitizedErrors = errors.map(error => sanitizeError(error));

  // 🛡️ VALIDAÇÃO: Verificar endpoint antes de enviar
  if (!ERROR_TRACKER_CONFIG.endpoint || typeof ERROR_TRACKER_CONFIG.endpoint !== 'string') {
    console.error('[ErrorTracker] Invalid endpoint configuration:', ERROR_TRACKER_CONFIG.endpoint);
    return false;
  }

  try {

    await postJSON(
      ERROR_TRACKER_CONFIG.endpoint,
      {
        errors: sanitizedErrors, // Usar erros sanitizados
        batch: {
          size: sanitizedErrors.length,
          sessionId: errorTrackerState.sessionId,
          timestamp: new Date().toISOString()
        }
      },
      {}, // options
      {
        retries: 2,
        timeout: 5000,
        circuitBreaker: false // Usamos nosso próprio circuit breaker
      }
    );

    errorTrackerState.circuitBreaker.recordSuccess();
    return true;

  } catch (error) {
    errorTrackerState.circuitBreaker.recordFailure();

    // 🛡️ LOG ESTRUTURADO: Logar erro com detalhes para debugging
    console.error('[ErrorTracker] Failed to send batch:', {
      error: error.message,
      endpoint: ERROR_TRACKER_CONFIG.endpoint,
      batchSize: sanitizedErrors.length,
      circuitBreakerStatus: errorTrackerState.circuitBreaker.getStatus()
    });

    return false;
  }
}

/**
 * Faz flush da fila de erros
 */
async function flushErrorQueue() {
  if (errorTrackerState.queue.length === 0) {
    return;
  }

  // Copia e limpa fila
  const batch = [...errorTrackerState.queue];
  errorTrackerState.queue = [];

  // Envia batch
  const success = await sendBatch(batch);

  // Se falhou, recoloca erros na fila (no início)
  if (!success && batch.length > 0) {
    errorTrackerState.queue = [...batch, ...errorTrackerState.queue];

    // Limita tamanho da fila
    if (errorTrackerState.queue.length > ERROR_TRACKER_CONFIG.maxQueueSize) {
      errorTrackerState.queue = errorTrackerState.queue.slice(0, ERROR_TRACKER_CONFIG.maxQueueSize);
    }
  }
}

/**
 * Rastreia um erro
 *
 * @param {Error|Object} error - Erro a ser rastreado
 * @param {Object} context - Contexto adicional
 */
export function track(error, context = {}) {
  try {
    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      name: error.name || 'Error',
      ...context
    };

    enqueueError(errorData);
  } catch (err) {
  }
}

/**
 * Rastreia um erro com nível de severidade
 *
 * @param {string} level - Nível: 'error', 'warning', 'info', 'critical'
 * @param {Error|Object} error - Erro a ser rastreado
 * @param {Object} context - Contexto adicional
 */
export function trackWithLevel(level, error, context = {}) {
  track(error, { level, ...context });
}

/**
 * Handlers globais de erros
 */

/**
 * Handler para window.onerror
 */
function handleWindowError(event) {
  // Extract error information from ErrorEvent
  const message = event.message || 'Unknown error';
  const filename = event.filename || '';
  const lineno = event.lineno || 0;
  const colno = event.colno || 0;
  const error = event.error || new Error(message);

  track(error, {
    type: 'window.onerror',
    url: filename,
    line: lineno,
    column: colno
  });

  // Retorna false para não suprimir o erro
  return false;
}

/**
 * Handler para unhandledrejection
 */
function handleUnhandledRejection(event) {
  track(event.reason || new Error('Unhandled Promise Rejection'), {
    type: 'unhandledrejection',
    promise: event.promise
  });
}

/**
 * Handler para fetch errors
 */
function handleFetchError(url, error, context = {}) {
  track(error, {
    type: 'fetch',
    url,
    ...context
  });
}

/**
 * Inicializa o error tracker
 *
 * @param {Object} customConfig - Configuração customizada
 */
export function initialize(customConfig = {}) {
  if (errorTrackerState.isInitialized) {
    return;
  }

  // Merge configuração customizada
  if (customConfig.endpoint) {
    ERROR_TRACKER_CONFIG.endpoint = customConfig.endpoint;
  }

  // Registra handlers globais
  window.addEventListener('error', handleWindowError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Inicia intervalo de flush
  errorTrackerState.flushInterval = setInterval(
    flushErrorQueue,
    ERROR_TRACKER_CONFIG.batchInterval
  );

  // Flush no unload
  window.addEventListener('beforeunload', () => {
    flushErrorQueue();
  });

  errorTrackerState.isInitialized = true;
}

/**
 * Finaliza o error tracker
 */
export function shutdown() {
  // Flush final
  flushErrorQueue();

  // Limpa interval
  if (errorTrackerState.flushInterval) {
    clearInterval(errorTrackerState.flushInterval);
    errorTrackerState.flushInterval = null;
  }

  // Remove handlers
  window.removeEventListener('error', handleWindowError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);

  errorTrackerState.isInitialized = false;
}

/**
 * Obtém status do error tracker
 */
export function getStatus() {
  return {
    isInitialized: errorTrackerState.isInitialized,
    sessionId: errorTrackerState.sessionId,
    queueSize: errorTrackerState.queue.length,
    recentErrorsCount: errorTrackerState.recentErrors.size,
    rateLimitWindow: errorTrackerState.rateLimitWindow.length,
    circuitBreaker: errorTrackerState.circuitBreaker.getStatus()
  };
}

/**
 * Força flush imediato da fila
 */
export function flush() {
  return flushErrorQueue();
}

/**
 * Limpa a fila de erros
 */
export function clearQueue() {
  errorTrackerState.queue = [];
  errorTrackerState.recentErrors.clear();
  errorTrackerState.rateLimitWindow = [];
}

// Exportar funções de sanitização para testes
export { sanitizeUrl, normalizeTimestamp, sanitizeError };

// Export default como objeto com todas as funções
export default {
  initialize,
  shutdown,
  track,
  trackWithLevel,
  handleFetchError,
  flush,
  clearQueue,
  getStatus,
  // Funções auxiliares (para testes)
  sanitizeUrl,
  normalizeTimestamp,
  sanitizeError
};
