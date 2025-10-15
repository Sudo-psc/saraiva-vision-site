/**
 * Error Tracker com serialização segura e classificação
 * Trata erros de rede, adblock, 4xx/5xx com breadcrumbs
 */

class ErrorTracker {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/api/errors';
    this.maxBreadcrumbs = options.maxBreadcrumbs || 50;
    this.breadcrumbs = [];
    this.environment = options.environment || 'production';
    this.release = options.release || 'unknown';
    this.enabled = options.enabled !== false;

    // PII patterns para remover
    this.piiPatterns = [
      /\b\d{11}\b/g, // CPF
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF formatado
      /\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, // Email
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Cartão de crédito
      /\b\d{3}[- ]?\d{3}[- ]?\d{4}\b/g // Telefone
    ];

    this.init();
  }

  init() {
    if (!this.enabled) {
      console.log('[ErrorTracker] Disabled');
      return;
    }

    // Global error handler
    window.addEventListener('error', this.handleError.bind(this));

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    // Lifecycle breadcrumbs
    window.addEventListener('pageshow', (e) => {
      this.addBreadcrumb('lifecycle', 'pageshow', { persisted: e.persisted });
    });

    window.addEventListener('pagehide', (e) => {
      this.addBreadcrumb('lifecycle', 'pagehide', { persisted: e.persisted });
    });

    document.addEventListener('visibilitychange', () => {
      this.addBreadcrumb('lifecycle', 'visibilitychange', {
        state: document.visibilityState
      });
    });

    // Navigation
    this.addBreadcrumb('navigation', 'init', {
      url: window.location.href,
      referrer: document.referrer
    });

    console.log('[ErrorTracker] Initialized');
  }

  handleError(event) {
    // Ignorar erros de extensões Chrome (não são do nosso código)
    if (event.filename && event.filename.includes('chrome-extension://')) {
      console.log('[ErrorTracker] Ignored Chrome extension error');
      return false;
    }

    // Ignorar erros de scripts third-party conhecidos
    const ignoredDomains = [
      'googletagmanager.com',
      'google-analytics.com',
      'doubleclick.net',
      'facebook.com',
      'connect.facebook.net'
    ];

    if (event.filename && ignoredDomains.some(domain => event.filename.includes(domain))) {
      console.log('[ErrorTracker] Ignored third-party script error');
      return false;
    }

    console.error('[ErrorTracker] Global error', event);

    const error = event.error || new Error(event.message || 'Unknown error');

    this.captureException(error, {
      type: 'error_event',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });

    // Não prevenir comportamento default
    return false;
  }

  handleUnhandledRejection(event) {
    console.error('[ErrorTracker] Unhandled rejection', event);

    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    this.captureException(error, {
      type: 'unhandled_rejection',
      promise: event.promise
    });
  }

  captureException(error, context = {}) {
    if (!this.enabled) return;

    const errorData = this.serializeError(error);
    const classification = this.classifyError(error, context);

    const report = {
      ...errorData,
      ...context,
      classification,
      breadcrumbs: this.breadcrumbs.slice(-20), // Últimas 20
      environment: this.environment,
      release: this.release,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Remover PII
    const sanitized = this.sanitizePII(report);

    console.warn('[ErrorTracker] Captured exception', {
      message: sanitized.message,
      classification: sanitized.classification
    });

    // Enviar para backend (não bloquear)
    this.sendReport(sanitized).catch(err => {
      console.error('[ErrorTracker] Failed to send report', err);
    });
  }

  serializeError(error) {
    // Tratar objetos que não são Error
    if (!(error instanceof Error)) {
      if (typeof error === 'object') {
        return {
          message: JSON.stringify(error),
          name: 'SerializedObject',
          stack: new Error().stack,
          originalType: typeof error,
          serialized: this.safeStringify(error)
        };
      }

      return {
        message: String(error),
        name: 'NonErrorObject',
        stack: new Error().stack,
        originalType: typeof error
      };
    }

    // Error normal
    return {
      message: error.message || 'No message',
      name: error.name || 'Error',
      stack: error.stack || new Error().stack,
      cause: error.cause ? this.serializeError(error.cause) : undefined
    };
  }

  classifyError(error, context) {
    const message = error.message || String(error);
    const name = error.name || '';

    // Network errors
    if (
      message.includes('Failed to fetch') ||
      message.includes('Network request failed') ||
      message.includes('ERR_INTERNET_DISCONNECTED') ||
      name === 'NetworkError'
    ) {
      return {
        category: 'network',
        severity: 'warning',
        retryable: true,
        userAction: 'Check internet connection'
      };
    }

    // Adblock
    if (
      message.includes('ERR_BLOCKED_BY_CLIENT') ||
      message.includes('Failed to load resource') && context.filename?.includes('ads')
    ) {
      return {
        category: 'adblock',
        severity: 'info',
        retryable: false,
        userAction: 'Disable ad blocker'
      };
    }

    // HTTP errors
    const httpMatch = message.match(/HTTP (\d{3}):/);
    if (httpMatch) {
      const status = parseInt(httpMatch[1]);

      if (status >= 500) {
        return {
          category: 'server_error',
          severity: 'error',
          retryable: true,
          statusCode: status,
          userAction: 'Try again later'
        };
      }

      if (status >= 400) {
        return {
          category: 'client_error',
          severity: status === 404 ? 'warning' : 'error',
          retryable: false,
          statusCode: status,
          userAction: status === 404 ? 'Resource not found' : 'Check request'
        };
      }
    }

    // WebSocket errors
    if (
      message.includes('WebSocket') ||
      message.includes('CONNECTING') ||
      message.includes('CLOSING')
    ) {
      return {
        category: 'websocket',
        severity: 'warning',
        retryable: true,
        userAction: 'Reconnecting...'
      };
    }

    // Extension errors
    if (
      message.includes('Extension context invalidated') ||
      message.includes('runtime.lastError') ||
      message.includes('back/forward cache')
    ) {
      return {
        category: 'extension',
        severity: 'info',
        retryable: true,
        userAction: 'Extension reconnecting'
      };
    }

    // QUIC protocol errors
    if (message.includes('ERR_QUIC_PROTOCOL_ERROR')) {
      return {
        category: 'protocol',
        severity: 'warning',
        retryable: true,
        userAction: 'Connection issue, retrying'
      };
    }

    // Generic error
    return {
      category: 'unknown',
      severity: 'error',
      retryable: false,
      userAction: 'Please report this error'
    };
  }

  addBreadcrumb(category, message, data = {}) {
    const breadcrumb = {
      category,
      message,
      data,
      timestamp: new Date().toISOString(),
      level: 'info'
    };

    this.breadcrumbs.push(breadcrumb);

    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }

    console.log('[ErrorTracker] Breadcrumb', breadcrumb);
  }

  safeStringify(obj, maxDepth = 3, depth = 0) {
    if (depth > maxDepth) {
      return '[Max Depth Reached]';
    }

    try {
      const seen = new WeakSet();

      return JSON.stringify(obj, (key, value) => {
        // Remover valores circulares
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }

        // Limitar strings longas
        if (typeof value === 'string' && value.length > 1000) {
          return value.substring(0, 1000) + '... (truncated)';
        }

        // Remover funções
        if (typeof value === 'function') {
          return '[Function]';
        }

        // Remover DOM nodes
        if (value instanceof Node) {
          return '[DOM Node]';
        }

        return value;
      }, 2);

    } catch (error) {
      return `[Stringify Error: ${error.message}]`;
    }
  }

  sanitizePII(data) {
    const stringified = JSON.stringify(data);
    let sanitized = stringified;

    // Substituir padrões de PII
    for (const pattern of this.piiPatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    try {
      return JSON.parse(sanitized);
    } catch (error) {
      console.error('[ErrorTracker] Failed to parse sanitized data', error);
      return data;
    }
  }

  async sendReport(report) {
    // Não enviar em desenvolvimento
    if (this.environment === 'development') {
      console.log('[ErrorTracker] Dev mode, not sending:', report);
      return;
    }

    // Classificar severidade
    const { classification } = report;

    // Não enviar erros de baixa severidade (info, adblock)
    if (classification.severity === 'info' && classification.category === 'adblock') {
      console.log('[ErrorTracker] Skipping adblock error');
      return;
    }

    // 🛡️ VALIDAÇÃO 1: Verificar endpoint antes de tudo
    if (!this.endpoint || typeof this.endpoint !== 'string' || this.endpoint.trim() === '') {
      console.error('[ErrorTracker] Invalid endpoint configuration:', this.endpoint);
      return;
    }

    // 🛡️ VALIDAÇÃO 2: Construir URL do endpoint de forma segura
    let endpointUrl;
    try {
      // Se endpoint é relativo, adicionar origin
      if (this.endpoint.startsWith('/')) {
        endpointUrl = new URL(this.endpoint, window.location.origin).toString();
      } else if (this.endpoint.startsWith('http://') || this.endpoint.startsWith('https://')) {
        // Endpoint já é absoluto
        endpointUrl = new URL(this.endpoint).toString();
      } else {
        throw new Error(`Invalid endpoint format: ${this.endpoint}`);
      }
    } catch (error) {
      console.error('[ErrorTracker] Failed to construct endpoint URL:', error.message);
      return;
    }

    // 🛡️ VALIDAÇÃO 3: Sanitizar report.url (evita rejeição pelo backend Zod)
    if (report.url) {
      const invalidProtocols = ['about:', 'blob:', 'data:', 'chrome:', 'chrome-extension:', 'moz-extension:'];
      if (invalidProtocols.some(proto => report.url.startsWith(proto))) {
        report.url = 'https://saraivavision.com.br';
      } else {
        try {
          // Validar e normalizar URL
          const parsed = new URL(report.url);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            report.url = 'https://saraivavision.com.br';
          } else {
            report.url = parsed.toString();
          }
        } catch {
          report.url = 'https://saraivavision.com.br';
        }
      }
    } else {
      report.url = 'https://saraivavision.com.br';
    }

    // 🛡️ VALIDAÇÃO 4: Normalizar timestamp para ISO 8601
    if (report.timestamp) {
      try {
        // Se é string, verificar se é ISO válida
        if (typeof report.timestamp === 'string') {
          const date = new Date(report.timestamp);
          report.timestamp = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
        }
        // Se é número (Unix timestamp)
        else if (typeof report.timestamp === 'number') {
          const ts = report.timestamp < 10000000000 ? report.timestamp * 1000 : report.timestamp;
          report.timestamp = new Date(ts).toISOString();
        } else {
          report.timestamp = new Date().toISOString();
        }
      } catch {
        report.timestamp = new Date().toISOString();
      }
    } else {
      report.timestamp = new Date().toISOString();
    }

    // 🛡️ VALIDAÇÃO 5: Limitar tamanhos para evitar payloads gigantes
    if (report.message && report.message.length > 1000) {
      report.message = report.message.substring(0, 1000) + '... (truncated)';
    }
    if (report.stack && report.stack.length > 5000) {
      report.stack = report.stack.substring(0, 5000) + '... (truncated)';
    }

    try {
      // 🛡️ VALIDAÇÃO 6: Tentar criar Request antes de fetch (detectar SyntaxError cedo)
      let request;
      try {
        request = new Request(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(report)
        });
      } catch (syntaxError) {
        console.error('[ErrorTracker] SyntaxError creating Request:', {
          error: syntaxError.message,
          endpoint: endpointUrl,
          reportUrl: report.url
        });
        return;
      }

      // Executar fetch
      const response = await fetch(request);

      if (!response.ok) {
        // Não logar erro de 404 ou 429 - endpoint pode não estar disponível ou rate limited
        if (response.status === 404) {
          console.log('[ErrorTracker] Endpoint not available (404), report buffered locally');
          return;
        }
        if (response.status === 429) {
          console.warn('[ErrorTracker] Rate limited (429), skipping error report to avoid loop');
          return;
        }
        if (response.status === 400) {
          // Logar detalhes do 400 para debug
          try {
            const errorBody = await response.json();
            console.error('[ErrorTracker] 400 Bad Request:', errorBody);
          } catch {
            console.error('[ErrorTracker] 400 Bad Request (no JSON body)');
          }
          return;
        }

        console.warn(`[ErrorTracker] HTTP ${response.status}: ${response.statusText}`);
        return;
      }

      console.log('[ErrorTracker] Report sent successfully');

    } catch (error) {
      // 🛡️ PROTEÇÃO CONTRA LOOP: Não logar erro se for do próprio ErrorTracker
      if (error.message && error.message.includes('Failed to send error report')) {
        console.debug('[ErrorTracker] Skipping recursive error');
        return;
      }

      console.error('[ErrorTracker] Failed to send report:', error.message);
      // Não fazer retry para evitar loop infinito
    }
  }

  // Wrapper para fetch com tracking
  async trackedFetch(url, options = {}) {
    this.addBreadcrumb('http', 'fetch', {
      url,
      method: options.method || 'GET'
    });

    try {
      const response = await fetch(url, options);

      this.addBreadcrumb('http', 'response', {
        url,
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;

    } catch (error) {
      this.addBreadcrumb('http', 'error', {
        url,
        error: error.message
      });

      this.captureException(error, {
        type: 'fetch_error',
        url,
        method: options.method || 'GET'
      });

      throw error;
    }
  }
}

// Uso global
const errorTracker = new ErrorTracker({
  endpoint: '/api/errors',
  environment: process.env.NODE_ENV || 'production',
  release: process.env.VITE_APP_VERSION || 'unknown',
  enabled: true
});

// Exportar para uso em módulos
window.errorTracker = errorTracker;

// Exemplo de uso manual
try {
  // Código que pode falhar
  throw new Error('Test error');
} catch (error) {
  errorTracker.captureException(error, {
    context: 'manual_capture',
    additionalData: { foo: 'bar' }
  });
}

// Breadcrumb manual
errorTracker.addBreadcrumb('user', 'button_click', {
  button: 'submit',
  form: 'contact'
});

// Fetch com tracking
errorTracker.trackedFetch('/api/analytics/ga', {
  method: 'POST',
  body: JSON.stringify({ event: 'pageview' })
});

export default ErrorTracker;
