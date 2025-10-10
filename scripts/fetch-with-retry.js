/**
 * Fetch com Retry, Backoff Exponencial e Circuit Breaker
 * Trata 503, timeouts, e implementa fallback para analytics
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 1 minuto
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      // Tentar novamente (HALF_OPEN)
      this.state = 'HALF_OPEN';
      console.log('[CircuitBreaker] Attempting recovery (HALF_OPEN)');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        console.log('[CircuitBreaker] Recovery successful, closing circuit');
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.failureThreshold) {
      console.warn('[CircuitBreaker] Threshold reached, opening circuit');
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  isOpen() {
    return this.state === 'OPEN' && Date.now() < this.nextAttempt;
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
  }
}

class FetchWithRetry {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 10000;
    this.timeout = options.timeout || 30000;
    this.retryableStatuses = options.retryableStatuses || [408, 429, 500, 502, 503, 504];
    this.retryableErrors = options.retryableErrors || ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];

    // Circuit breakers por endpoint
    this.circuitBreakers = new Map();
  }

  getCircuitBreaker(url) {
    // Validar URL antes de criar objeto URL
    if (!url || typeof url !== 'string') {
      console.warn('[FetchRetry] Invalid URL provided', { url });
      throw new Error('Invalid URL: must be a non-empty string');
    }

    let key;
    try {
      // Converter URL relativa para absoluta se necessário
      const absoluteUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).href;
      key = new URL(absoluteUrl).origin;
    } catch (error) {
      console.error('[FetchRetry] Failed to parse URL', { url, error: error.message });
      throw new Error(`Invalid URL format: ${url}`);
    }

    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, new CircuitBreaker({
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000
      }));
    }

    return this.circuitBreakers.get(key);
  }

  async fetch(url, options = {}, retryCount = 0) {
    const circuitBreaker = this.getCircuitBreaker(url);

    // Verificar circuit breaker
    if (circuitBreaker.isOpen()) {
      console.warn('[FetchRetry] Circuit breaker is OPEN', { url });
      throw new Error('Circuit breaker is open');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await circuitBreaker.execute(async () => {
        const fetchOptions = {
          ...options,
          signal: controller.signal
        };

        const startTime = performance.now();
        const response = await fetch(url, fetchOptions);
        const duration = performance.now() - startTime;

        console.log('[FetchRetry] Request completed', {
          url,
          status: response.status,
          duration: `${duration.toFixed(2)}ms`,
          attempt: retryCount + 1
        });

        // Verificar se deve fazer retry
        if (!response.ok && this.shouldRetry(response.status, retryCount)) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);

      console.error('[FetchRetry] Request failed', {
        url,
        error: error.message,
        attempt: retryCount + 1,
        willRetry: this.shouldRetryError(error, retryCount)
      });

      // Verificar se deve fazer retry
      if (this.shouldRetryError(error, retryCount)) {
        const delay = this.calculateBackoffDelay(retryCount);

        console.log('[FetchRetry] Retrying after delay', {
          delay,
          attempt: retryCount + 2
        });

        await this.sleep(delay);
        return this.fetch(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  shouldRetry(status, retryCount) {
    return retryCount < this.maxRetries && this.retryableStatuses.includes(status);
  }

  shouldRetryError(error, retryCount) {
    if (retryCount >= this.maxRetries) {
      return false;
    }

    // Timeout (AbortController)
    if (error.name === 'AbortError') {
      return true;
    }

    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      return true;
    }

    // Specific error codes
    for (const code of this.retryableErrors) {
      if (error.message.includes(code)) {
        return true;
      }
    }

    // HTTP errors retryable
    if (error.message.match(/HTTP (408|429|500|502|503|504):/)) {
      return true;
    }

    return false;
  }

  calculateBackoffDelay(retryCount) {
    // Exponential backoff com jitter
    const exponentialDelay = Math.min(
      this.baseDelay * Math.pow(2, retryCount),
      this.maxDelay
    );

    // Jitter ±30%
    const jitter = exponentialDelay * 0.3 * (Math.random() - 0.5);
    return Math.floor(exponentialDelay + jitter);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Analytics com Fallback
class AnalyticsService {
  constructor() {
    this.fetcher = new FetchWithRetry({
      maxRetries: 2,
      baseDelay: 1000,
      maxDelay: 5000,
      timeout: 10000
    });

    this.buffer = [];
    this.maxBufferSize = 100;
    this.flushInterval = 60000; // 1 minuto
    this.flushTimer = null;

    this.startFlushTimer();
  }

  async send(endpoint, data) {
    try {
      const response = await this.fetcher.fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('[Analytics] Event sent successfully');
        return true;
      }

      throw new Error(`Analytics failed: ${response.status}`);

    } catch (error) {
      console.warn('[Analytics] Failed to send event, buffering', {
        error: error.message,
        endpoint
      });

      this.bufferEvent({ endpoint, data, timestamp: Date.now() });
      return false;
    }
  }

  bufferEvent(event) {
    if (this.buffer.length >= this.maxBufferSize) {
      console.warn('[Analytics] Buffer full, dropping oldest event');
      this.buffer.shift();
    }

    this.buffer.push(event);

    console.log('[Analytics] Event buffered', {
      bufferSize: this.buffer.length
    });
  }

  startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  async flushBuffer() {
    if (this.buffer.length === 0) {
      return;
    }

    console.log('[Analytics] Flushing buffer', {
      count: this.buffer.length
    });

    const events = [...this.buffer];
    this.buffer = [];

    for (const event of events) {
      // Descartar eventos muito antigos (>5min)
      if (Date.now() - event.timestamp > 300000) {
        console.warn('[Analytics] Discarding stale event', {
          age: Date.now() - event.timestamp
        });
        continue;
      }

      try {
        await this.send(event.endpoint, event.data);
      } catch (error) {
        console.error('[Analytics] Failed to flush event', error);
        // Re-buffar se ainda não atingiu limite
        this.bufferEvent(event);
      }
    }
  }

  // Enviar para GA
  async sendGA(event) {
    return this.send('/api/analytics/ga', {
      type: 'event',
      ...event
    });
  }

  // Enviar para GTM
  async sendGTM(event) {
    return this.send('/api/analytics/gtm', {
      type: 'dataLayer',
      ...event
    });
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// Uso
const fetcher = new FetchWithRetry({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  timeout: 30000
});

// Exemplo: Request com retry
fetcher.fetch('/api/analytics/ga', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ event: 'pageview', page: '/lentes' })
})
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Failed:', error));

// Analytics com buffer
const analytics = new AnalyticsService();

analytics.sendGA({
  event: 'pageview',
  page: window.location.pathname
});

export { FetchWithRetry, CircuitBreaker, AnalyticsService };
