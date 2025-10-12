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

  try {

    await postJSON(
      ERROR_TRACKER_CONFIG.endpoint,
      {
        errors,
        batch: {
          size: errors.length,
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

// Export default como objeto com todas as funções
export default {
  initialize,
  shutdown,
  track,
  trackWithLevel,
  handleFetchError,
  flush,
  clearQueue,
  getStatus
};
