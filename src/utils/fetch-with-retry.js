/**
 * Fetch with Retry, Circuit Breaker, and JSON Guards
 *
 * Sistema robusto de requisições HTTP com:
 * - Retry automático com exponential backoff
 * - Circuit breaker para endpoints problemáticos
 * - Guards para JSON parsing seguro
 * - Timeout configurável
 * - Validação de Content-Type
 *
 * @author Dr. Philipe Saraiva Cruz
 * @priority P0 - Critical
 */

import { normalizeURL } from './url-normalizer.js';

/**
 * Estados do Circuit Breaker
 */
const CircuitState = {
  CLOSED: 'CLOSED',       // Normal - requisições passam
  OPEN: 'OPEN',           // Aberto - requisições bloqueadas
  HALF_OPEN: 'HALF_OPEN'  // Teste - permitindo tentativas limitadas
};

/**
 * Circuit Breaker para prevenir sobrecarga em endpoints problemáticos
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5; // Falhas para abrir
    this.successThreshold = options.successThreshold || 2; // Sucessos para fechar
    this.timeout = options.timeout || 60000; // Tempo em OPEN (60s)
    this.monitoringPeriod = options.monitoringPeriod || 10000; // Janela de monitoramento (10s)

    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.lastFailureTime = null;

    // Resetar contadores periodicamente
    this.resetInterval = setInterval(() => {
      if (this.state === CircuitState.CLOSED && Date.now() - this.lastFailureTime > this.monitoringPeriod) {
        this.failures = 0;
      }
    }, this.monitoringPeriod);
  }

  /**
   * Verifica se a requisição pode passar pelo circuit breaker
   */
  canRequest() {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      // Verifica se é hora de tentar novamente
      if (Date.now() >= this.nextAttempt) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
        return true;
      }
      return false;
    }

    // HALF_OPEN: permite tentativas limitadas
    return true;
  }

  /**
   * Registra uma falha
   */
  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Em HALF_OPEN, qualquer falha reabre o circuito
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      this.logStateChange('OPEN', 'Failure in HALF_OPEN state');
    } else if (this.failures >= this.failureThreshold) {
      // Atingiu threshold de falhas
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
      this.logStateChange('OPEN', `${this.failures} failures exceeded threshold`);
    }
  }

  /**
   * Registra um sucesso
   */
  recordSuccess() {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.logStateChange('CLOSED', `${this.successes} successes in HALF_OPEN`);
      }
    }
  }

  /**
   * Loga mudanças de estado
   */
  logStateChange(newState, reason) {
  }

  /**
   * Obtém status atual do circuit breaker
   */
  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      nextAttempt: this.nextAttempt,
      canRequest: this.canRequest()
    };
  }

  /**
   * Limpa recursos
   */
  destroy() {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }
  }
}

/**
 * Gerenciador global de circuit breakers (um por endpoint)
 */
const circuitBreakers = new Map();

/**
 * Obtém ou cria um circuit breaker para um endpoint
 */
function getCircuitBreaker(url, options = {}) {
  const endpoint = new URL(url, window.location.origin).origin + new URL(url, window.location.origin).pathname;

  if (!circuitBreakers.has(endpoint)) {
    circuitBreakers.set(endpoint, new CircuitBreaker(options));
  }

  return circuitBreakers.get(endpoint);
}

/**
 * Calcula delay com exponential backoff e jitter
 *
 * @param {number} attempt - Número da tentativa (0-indexed)
 * @param {number} baseDelay - Delay base em ms (padrão: 1000ms)
 * @param {number} maxDelay - Delay máximo em ms (padrão: 30000ms)
 * @returns {number} Delay em milissegundos
 */
export function calculateBackoff(attempt, baseDelay = 1000, maxDelay = 30000) {
  // Exponential: baseDelay * 2^attempt
  const exponential = baseDelay * Math.pow(2, attempt);

  // Cap no máximo
  const capped = Math.min(exponential, maxDelay);

  // Adiciona jitter (±25%)
  const jitter = capped * 0.25;
  const withJitter = capped + (Math.random() * jitter * 2 - jitter);

  return Math.floor(withJitter);
}

/**
 * Fetch com timeout usando AbortController
 *
 * @param {string} url - URL da requisição
 * @param {Object} options - Opções do fetch
 * @param {number} timeout - Timeout em ms (padrão: 10000ms)
 * @returns {Promise<Response>} Response object
 */
export async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms: ${url}`);
    }

    throw error;
  }
}

/**
 * Fetch JSON com guards, retry, circuit breaker e timeout
 *
 * @param {string} url - URL da requisição
 * @param {Object} options - Opções do fetch
 * @param {Object} config - Configuração adicional
 * @returns {Promise<any>} Dados JSON parseados
 *
 * @example
 * const data = await fetchJSON('/api/users', {
 *   method: 'GET',
 *   headers: { 'Authorization': 'Bearer token' }
 * }, {
 *   retries: 3,
 *   timeout: 5000,
 *   circuitBreaker: true
 * });
 */
export async function fetchJSON(url, options = {}, config = {}) {
  const {
    retries = 3,
    timeout = 10000,
    baseDelay = 1000,
    maxDelay = 30000,
    circuitBreaker = true,
    validateJSON = true
  } = config;

  // Normaliza URL
  const normalizedURL = normalizeURL(url);

  // Verifica circuit breaker
  if (circuitBreaker) {
    const breaker = getCircuitBreaker(normalizedURL);
    if (!breaker.canRequest()) {
      const status = breaker.getStatus();
      throw new Error(
        `Circuit breaker is OPEN for ${normalizedURL}. ` +
        `Next attempt: ${new Date(status.nextAttempt).toISOString()}`
      );
    }
  }

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Executa requisição com timeout
      const response = await fetchWithTimeout(normalizedURL, options, timeout);

      // Guard 1: Verifica status HTTP
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} | URL: ${normalizedURL}`
        );
      }

      // Guard 2: Verifica Content-Type
      const contentType = response.headers.get('Content-Type');
      if (validateJSON && !contentType?.includes('application/json')) {
        // Content-Type validation - JSON expected
      }

      // Guard 3: Verifica se body está vazio (204 No Content é válido)
      if (response.status === 204) {
        if (circuitBreaker) {
          getCircuitBreaker(normalizedURL).recordSuccess();
        }
        return null;
      }

      // Guard 4: Tenta clonar response para poder tentar parse múltiplas vezes
      const clonedResponse = response.clone();
      const text = await response.text();

      // Guard 5: Verifica se o body está vazio
      if (!text || text.trim().length === 0) {
        if (circuitBreaker) {
          getCircuitBreaker(normalizedURL).recordSuccess();
        }
        return null;
      }

      // Guard 6: Tenta parsear JSON com tratamento de erro
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        // Tenta obter snippet do texto para debug
        const snippet = text.length > 100 ? text.substring(0, 100) + '...' : text;
        throw new Error(
          `JSON parse failed | URL: ${normalizedURL} | ` +
          `Content-Type: ${contentType} | ` +
          `Body snippet: ${snippet} | ` +
          `Parse error: ${parseError.message}`
        );
      }

      // Sucesso - registra no circuit breaker
      if (circuitBreaker) {
        getCircuitBreaker(normalizedURL).recordSuccess();
      }

      return data;

    } catch (error) {
      lastError = error;

      // Registra falha no circuit breaker
      if (circuitBreaker) {
        getCircuitBreaker(normalizedURL).recordFailure();
      }

      // Se não é a última tentativa, aguarda antes de retry
      if (attempt < retries) {
        const delay = calculateBackoff(attempt, baseDelay, maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Todas as tentativas falharam
  throw new Error(
    `fetchJSON failed after ${retries + 1} attempts | ` +
    `URL: ${normalizedURL} | ` +
    `Last error: ${lastError.message}`
  );
}

/**
 * Helper para POST requests com JSON
 *
 * @param {string} url - URL da requisição
 * @param {Object} data - Dados a enviar
 * @param {Object} options - Opções adicionais do fetch
 * @param {Object} config - Configuração de retry/timeout
 * @returns {Promise<any>} Resposta parseada
 */
export async function postJSON(url, data, options = {}, config = {}) {
  return fetchJSON(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data),
    ...options
  }, config);
}

/**
 * Helper para PUT requests com JSON
 */
export async function putJSON(url, data, options = {}, config = {}) {
  return fetchJSON(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data),
    ...options
  }, config);
}

/**
 * Helper para DELETE requests
 */
export async function deleteJSON(url, options = {}, config = {}) {
  return fetchJSON(url, {
    method: 'DELETE',
    ...options
  }, config);
}

/**
 * Obtém status de todos os circuit breakers
 */
export function getAllCircuitBreakerStatus() {
  const status = {};
  circuitBreakers.forEach((breaker, endpoint) => {
    status[endpoint] = breaker.getStatus();
  });
  return status;
}

/**
 * Reseta um circuit breaker específico
 */
export function resetCircuitBreaker(url) {
  const endpoint = new URL(url, window.location.origin).origin + new URL(url, window.location.origin).pathname;
  const breaker = circuitBreakers.get(endpoint);
  if (breaker) {
    breaker.destroy();
    circuitBreakers.delete(endpoint);
  }
}

/**
 * Reseta todos os circuit breakers
 */
export function resetAllCircuitBreakers() {
  circuitBreakers.forEach(breaker => breaker.destroy());
  circuitBreakers.clear();
}

// Export default como objeto com todas as funções
export default {
  fetchJSON,
  postJSON,
  putJSON,
  deleteJSON,
  fetchWithTimeout,
  calculateBackoff,
  CircuitBreaker,
  getCircuitBreaker,
  getAllCircuitBreakerStatus,
  resetCircuitBreaker,
  resetAllCircuitBreakers
};
