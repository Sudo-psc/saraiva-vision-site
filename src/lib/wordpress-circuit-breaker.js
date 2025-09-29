// src/lib/wordpress-circuit-breaker.js
// Circuit Breaker para WordPress API com retry e jitter

/**
 * Circuit Breaker implementado especificamente para WordPress Headless API
 * Implementa estados CLOSED, OPEN, HALF_OPEN com métricas e logging
 */
export class WordPressCircuitBreaker {
  constructor(config = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      timeout: config.timeout || 60000, // 1 minuto
      halfOpenMaxCalls: config.halfOpenMaxCalls || 3,
      resetTimeout: config.resetTimeout || 30000, // 30 segundos
      maxRetries: config.maxRetries || 3,
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      jitterFactor: config.jitterFactor || 0.1,
      ...config
    };

    // Estados: 'CLOSED', 'OPEN', 'HALF_OPEN'
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.halfOpenCalls = 0;

    // Métricas
    this.metrics = {
      totalCalls: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
      circuitOpenCount: 0,
      lastCircuitOpen: null
    };

    // Histórico de falhas para análise
    this.failureHistory = [];
  }

  /**
   * Executar operação com circuit breaker
   */
  async execute(operation) {
    this.metrics.totalCalls++;
    const startTime = performance.now();

    try {
      // Verificar estado do circuit
      this.checkState();

      // Se circuit está OPEN, falhar rápido
      if (this.state === 'OPEN') {
        throw new CircuitBreakerOpenError('Circuit breaker está OPEN - API indisponível');
      }

      // Se HALF_OPEN, limitar chamadas
      if (this.state === 'HALF_OPEN') {
        if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
          throw new CircuitBreakerOpenError('Circuit breaker HALF_OPEN - limite de tentativas atingido');
        }
        this.halfOpenCalls++;
      }

      // Executar com retry e jitter
      const result = await this.executeWithRetry(operation);

      // Sucesso - registrar métricas
      const responseTime = performance.now() - startTime;
      this.onSuccess(responseTime);

      return result;

    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.onFailure(error, responseTime);
      throw error;
    }
  }

  /**
   * Verificar e atualizar estado do circuit breaker
   */
  checkState() {
    const now = Date.now();

    switch (this.state) {
      case 'OPEN':
        // Verificar se já pode tentar HALF_OPEN
        if (this.lastFailureTime && (now - this.lastFailureTime) >= this.config.timeout) {
          this.transitionToHalfOpen();
        }
        break;

      case 'HALF_OPEN':
        // Verificar timeout do HALF_OPEN
        if (this.lastFailureTime && (now - this.lastFailureTime) >= this.config.resetTimeout) {
          this.transitionToClosed();
        }
        break;

      case 'CLOSED':
        // Estado normal, nada a fazer
        break;
    }
  }

  /**
   * Executar operação com retry e backoff exponencial + jitter
   */
  async executeWithRetry(operation, attempt = 1) {
    try {
      return await operation();

    } catch (error) {
      // Se é o último retry, relançar erro
      if (attempt >= this.config.maxRetries) {
        throw error;
      }

      // Verificar se erro é retryable
      if (!this.isRetryableError(error)) {
        throw error;
      }

      // Calcular delay com backoff exponencial + jitter
      const baseDelay = Math.min(
        this.config.baseDelay * Math.pow(2, attempt - 1),
        this.config.maxDelay
      );

      const jitter = baseDelay * this.config.jitterFactor * Math.random();
      const delay = baseDelay + jitter;

      console.log(`⏳ WordPress API retry ${attempt}/${this.config.maxRetries} em ${Math.round(delay)}ms...`);

      // Aguardar antes do retry
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry recursivo
      return this.executeWithRetry(operation, attempt + 1);
    }
  }

  /**
   * Verificar se erro é passível de retry
   */
  isRetryableError(error) {
    // Network errors são sempre retryable
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }

    // HTTP status codes retryable
    if (error.status) {
      const retryableStatus = [408, 429, 500, 502, 503, 504];
      return retryableStatus.includes(error.status);
    }

    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return true;
    }

    // Errors específicos do WordPress
    if (error.message.includes('wp-json') || error.message.includes('WordPress')) {
      return true;
    }

    return false;
  }

  /**
   * Registrar sucesso
   */
  onSuccess(responseTime) {
    this.successCount++;
    this.failureCount = 0;
    this.lastSuccessTime = Date.now();

    // Atualizar métricas
    this.metrics.totalSuccesses++;
    this.metrics.lastResponseTime = responseTime;
    this.updateAverageResponseTime(responseTime);

    // Transição de estado baseada em sucessos
    if (this.state === 'HALF_OPEN') {
      if (this.successCount >= Math.ceil(this.config.halfOpenMaxCalls / 2)) {
        this.transitionToClosed();
      }
    }

    console.log(`✅ WordPress API sucesso (${Math.round(responseTime)}ms) - Estado: ${this.state}`);
  }

  /**
   * Registrar falha
   */
  onFailure(error, responseTime) {
    this.failureCount++;
    this.successCount = 0;
    this.lastFailureTime = Date.now();

    // Atualizar métricas
    this.metrics.totalFailures++;
    this.metrics.lastResponseTime = responseTime;
    this.updateAverageResponseTime(responseTime);

    // Adicionar ao histórico de falhas
    this.addFailureToHistory(error);

    // Transição de estado baseada em falhas
    if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
      this.transitionToOpen();
    } else if (this.state === 'HALF_OPEN') {
      this.transitionToOpen();
    }

    console.error(`❌ WordPress API falha (${Math.round(responseTime)}ms) - Estado: ${this.state}`, error.message);
  }

  /**
   * Transição para estado OPEN
   */
  transitionToOpen() {
    this.state = 'OPEN';
    this.metrics.circuitOpenCount++;
    this.metrics.lastCircuitOpen = Date.now();

    console.warn(`🚨 Circuit Breaker OPEN - WordPress API indisponível (${this.failureCount} falhas)`);

    // Emitir evento personalizado para monitoramento
    this.emitStateChange('OPEN', {
      failureCount: this.failureCount,
      lastError: this.failureHistory[this.failureHistory.length - 1]
    });
  }

  /**
   * Transição para estado HALF_OPEN
   */
  transitionToHalfOpen() {
    this.state = 'HALF_OPEN';
    this.halfOpenCalls = 0;
    this.successCount = 0;

    console.log(`🔶 Circuit Breaker HALF_OPEN - Testando WordPress API...`);

    this.emitStateChange('HALF_OPEN', {
      timeInOpen: Date.now() - this.lastFailureTime
    });
  }

  /**
   * Transição para estado CLOSED
   */
  transitionToClosed() {
    const wasOpen = this.state !== 'CLOSED';
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.halfOpenCalls = 0;

    if (wasOpen) {
      console.log(`✅ Circuit Breaker CLOSED - WordPress API recuperada`);

      this.emitStateChange('CLOSED', {
        recoveryTime: Date.now() - (this.metrics.lastCircuitOpen || 0)
      });
    }
  }

  /**
   * Atualizar média de tempo de resposta
   */
  updateAverageResponseTime(responseTime) {
    const totalCalls = this.metrics.totalSuccesses + this.metrics.totalFailures;
    this.metrics.averageResponseTime =
      ((this.metrics.averageResponseTime * (totalCalls - 1)) + responseTime) / totalCalls;
  }

  /**
   * Adicionar falha ao histórico (máximo 50 entradas)
   */
  addFailureToHistory(error) {
    this.failureHistory.push({
      timestamp: Date.now(),
      error: error.message,
      status: error.status,
      type: error.name || 'Unknown'
    });

    // Manter apenas últimas 50 falhas
    if (this.failureHistory.length > 50) {
      this.failureHistory.shift();
    }
  }

  /**
   * Emitir evento de mudança de estado
   */
  emitStateChange(newState, metadata = {}) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent('wpCircuitBreakerStateChange', {
        detail: {
          state: newState,
          timestamp: Date.now(),
          metrics: { ...this.metrics },
          metadata
        }
      });

      window.dispatchEvent(event);
    }
  }

  /**
   * Forçar reset do circuit breaker
   */
  forceReset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;

    console.log(`🔄 Circuit Breaker resetado manualmente`);

    this.emitStateChange('RESET', {
      manualReset: true
    });
  }

  /**
   * Obter estado atual e métricas
   */
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      halfOpenCalls: this.halfOpenCalls,
      metrics: { ...this.metrics },
      config: { ...this.config },
      isOperational: this.state !== 'OPEN',
      nextRetryIn: this.state === 'OPEN' ?
        Math.max(0, this.config.timeout - (Date.now() - (this.lastFailureTime || 0))) : 0
    };
  }

  /**
   * Obter relatório detalhado
   */
  getDetailedReport() {
    const status = this.getStatus();
    const now = Date.now();

    return {
      ...status,
      uptime: {
        totalTime: now - (this.metrics.lastCircuitOpen || now),
        lastDowntime: this.metrics.lastCircuitOpen ? now - this.metrics.lastCircuitOpen : 0,
        availability: this.calculateAvailability()
      },
      performance: {
        averageResponseTime: Math.round(this.metrics.averageResponseTime),
        lastResponseTime: Math.round(this.metrics.lastResponseTime),
        successRate: this.calculateSuccessRate()
      },
      recentFailures: this.failureHistory.slice(-10), // Últimas 10 falhas
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Calcular disponibilidade (%)
   */
  calculateAvailability() {
    const totalCalls = this.metrics.totalCalls;
    if (totalCalls === 0) return 100;

    return Math.round((this.metrics.totalSuccesses / totalCalls) * 100 * 100) / 100;
  }

  /**
   * Calcular taxa de sucesso (%)
   */
  calculateSuccessRate() {
    const totalCalls = this.metrics.totalCalls;
    if (totalCalls === 0) return 100;

    return Math.round((this.metrics.totalSuccesses / totalCalls) * 100 * 100) / 100;
  }

  /**
   * Obter recomendações baseadas no estado atual
   */
  getRecommendations() {
    const recommendations = [];

    if (this.state === 'OPEN') {
      recommendations.push('🚨 API WordPress indisponível - verifique conectividade e status do servidor');
      recommendations.push('📞 Entre em contato com administrador do WordPress se problema persistir');
    }

    if (this.metrics.averageResponseTime > 5000) {
      recommendations.push('⏰ Tempo de resposta alto - considere otimizar queries ou cache');
    }

    if (this.calculateSuccessRate() < 90) {
      recommendations.push('📉 Taxa de sucesso baixa - investigar causas das falhas');
    }

    if (this.metrics.circuitOpenCount > 5) {
      recommendations.push('🔄 Múltiplas aberturas do circuit - revisar configurações e estabilidade');
    }

    return recommendations;
  }
}

/**
 * Erro customizado para circuit breaker aberto
 */
export class CircuitBreakerOpenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    this.isCircuitBreakerError = true;
  }
}

// Instância singleton para uso global
export const wordPressCircuitBreaker = new WordPressCircuitBreaker();

export default WordPressCircuitBreaker;