/**
 * WebSocket Manager - Gerenciamento Robusto de WebSocket
 *
 * Sistema de WebSocket com:
 * - State machine completa (DISCONNECTED/CONNECTING/CONNECTED/CLOSING/CLOSED)
 * - Message queue para envios antes da conexão
 * - Reconnection automática com exponential backoff
 * - Heartbeat/ping para detectar conexões mortas
 * - Event handlers customizáveis
 * - Timeout para conexão
 *
 * @author Dr. Philipe Saraiva Cruz
 * @priority P0 - Critical
 */

import { calculateBackoff } from './fetch-with-retry.js';
import { track as trackError } from './error-tracker.js';

/**
 * Estados da conexão WebSocket
 */
export const WebSocketState = {
  DISCONNECTED: 'DISCONNECTED',   // Não conectado
  CONNECTING: 'CONNECTING',       // Tentando conectar
  CONNECTED: 'CONNECTED',         // Conectado e pronto
  CLOSING: 'CLOSING',             // Fechando conexão
  CLOSED: 'CLOSED'                // Conexão fechada (terminal)
};

/**
 * Configuração padrão do WebSocket Manager
 */
const DEFAULT_CONFIG = {
  url: null,                    // URL do WebSocket (obrigatório)
  protocols: [],                // Protocolos WebSocket
  reconnect: {
    enabled: true,
    maxAttempts: 10,            // Máximo de tentativas
    baseDelay: 1000,            // Delay base (1s)
    maxDelay: 30000,            // Delay máximo (30s)
    jitter: true                // Adiciona jitter ao backoff
  },
  heartbeat: {
    enabled: true,
    interval: 30000,            // Intervalo de ping (30s)
    timeout: 5000,              // Timeout para pong (5s)
    message: 'ping'             // Mensagem de ping
  },
  timeout: {
    connect: 10000,             // Timeout para conexão (10s)
    message: 5000               // Timeout para resposta de mensagem (5s)
  },
  queue: {
    enabled: true,
    maxSize: 100                // Tamanho máximo da fila
  },
  logging: {
    enabled: true,
    prefix: '[WebSocket]'
  }
};

/**
 * WebSocket Manager Class
 */
export class WebSocketManager {
  constructor(config = {}) {
    // Merge configuração
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      reconnect: { ...DEFAULT_CONFIG.reconnect, ...config.reconnect },
      heartbeat: { ...DEFAULT_CONFIG.heartbeat, ...config.heartbeat },
      timeout: { ...DEFAULT_CONFIG.timeout, ...config.timeout },
      queue: { ...DEFAULT_CONFIG.queue, ...config.queue },
      logging: { ...DEFAULT_CONFIG.logging, ...config.logging }
    };

    if (!this.config.url) {
      throw new Error('WebSocket URL is required');
    }

    // Estado interno
    this.state = WebSocketState.DISCONNECTED;
    this.ws = null;
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.heartbeatTimeout = null;
    this.connectTimeout = null;
    this.lastError = null;

    // Event handlers
    this.handlers = {
      onOpen: [],
      onMessage: [],
      onError: [],
      onClose: [],
      onStateChange: []
    };
  }

  /**
   * Loga mensagem (se logging habilitado)
   */
  log(message, ...args) {
    if (this.config.logging.enabled) {
    }
  }

  /**
   * Loga warning
   */
  warn(message, ...args) {
    if (this.config.logging.enabled) {
    }
  }

  /**
   * Loga erro
   */
  error(message, ...args) {
  }

  /**
   * Muda estado e notifica handlers
   */
  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.log(`State: ${oldState} → ${newState}`);
    this.handlers.onStateChange.forEach(handler => handler(newState, oldState));
  }

  /**
   * Conecta ao WebSocket
   */
  connect() {
    if (this.state === WebSocketState.CONNECTING || this.state === WebSocketState.CONNECTED) {
      this.warn('Already connecting or connected');
      return;
    }

    if (this.state === WebSocketState.CLOSING) {
      this.warn('Currently closing connection, wait before reconnecting');
      return;
    }

    this.setState(WebSocketState.CONNECTING);
    this.log(`Connecting to ${this.config.url}...`);

    try {
      // Cria WebSocket
      this.ws = new WebSocket(this.config.url, this.config.protocols);

      // Timeout de conexão
      this.connectTimeout = setTimeout(() => {
        if (this.state === WebSocketState.CONNECTING) {
          this.error('Connection timeout');
          this.ws.close();
          this.handleConnectionFailure(new Error('Connection timeout'));
        }
      }, this.config.timeout.connect);

      // Event handlers
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);

    } catch (error) {
      this.error('Failed to create WebSocket:', error);
      this.handleConnectionFailure(error);
    }
  }

  /**
   * Handler para onopen
   */
  handleOpen(event) {
    this.log('Connected');
    clearTimeout(this.connectTimeout);
    this.setState(WebSocketState.CONNECTED);
    this.reconnectAttempts = 0;

    // Inicia heartbeat
    if (this.config.heartbeat.enabled) {
      this.startHeartbeat();
    }

    // Processa fila de mensagens
    this.processMessageQueue();

    // Notifica handlers
    this.handlers.onOpen.forEach(handler => handler(event));
  }

  /**
   * Handler para onmessage
   */
  handleMessage(event) {
    this.log('Message received:', event.data);

    // Reseta heartbeat timeout se for um pong
    if (event.data === 'pong') {
      clearTimeout(this.heartbeatTimeout);
      return;
    }

    // Notifica handlers
    this.handlers.onMessage.forEach(handler => handler(event));
  }

  /**
   * Handler para onerror
   */
  handleError(event) {
    this.error('WebSocket error:', event);
    this.lastError = event;

    // Rastreia erro
    trackError(new Error('WebSocket error'), {
      type: 'websocket',
      url: this.config.url,
      state: this.state
    });

    // Notifica handlers
    this.handlers.onError.forEach(handler => handler(event));
  }

  /**
   * Handler para onclose
   */
  handleClose(event) {
    this.log('Connection closed:', event.code, event.reason);
    clearTimeout(this.connectTimeout);
    clearTimeout(this.heartbeatTimer);
    clearTimeout(this.heartbeatTimeout);

    const wasConnected = this.state === WebSocketState.CONNECTED;
    this.setState(WebSocketState.DISCONNECTED);

    // Notifica handlers
    this.handlers.onClose.forEach(handler => handler(event));

    // Tenta reconectar se habilitado e não foi close intencional
    if (this.config.reconnect.enabled && !event.wasClean && wasConnected) {
      this.scheduleReconnect();
    } else {
      this.setState(WebSocketState.CLOSED);
    }
  }

  /**
   * Handler para falha de conexão
   */
  handleConnectionFailure(error) {
    this.lastError = error;
    this.setState(WebSocketState.DISCONNECTED);

    // Rastreia erro
    trackError(error, {
      type: 'websocket_connection_failure',
      url: this.config.url,
      attempts: this.reconnectAttempts
    });

    // Tenta reconectar se habilitado
    if (this.config.reconnect.enabled) {
      this.scheduleReconnect();
    } else {
      this.setState(WebSocketState.CLOSED);
    }
  }

  /**
   * Agenda reconexão com exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.config.reconnect.maxAttempts) {
      this.error(`Max reconnect attempts (${this.config.reconnect.maxAttempts}) reached`);
      this.setState(WebSocketState.CLOSED);
      return;
    }

    this.reconnectAttempts++;

    const delay = calculateBackoff(
      this.reconnectAttempts - 1,
      this.config.reconnect.baseDelay,
      this.config.reconnect.maxDelay
    );

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.reconnect.maxAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Inicia heartbeat/ping
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.state === WebSocketState.CONNECTED) {
        this.log('Sending heartbeat');
        this.ws.send(this.config.heartbeat.message);

        // Timeout para resposta (pong)
        this.heartbeatTimeout = setTimeout(() => {
          this.warn('Heartbeat timeout, connection may be dead');
          this.ws.close();
        }, this.config.heartbeat.timeout);
      }
    }, this.config.heartbeat.interval);
  }

  /**
   * Envia mensagem
   *
   * @param {string|Object} data - Dados a enviar
   * @returns {boolean} true se enviado, false se enfileirado
   */
  send(data) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);

    // Se não está conectado, enfileira (se habilitado)
    if (this.state !== WebSocketState.CONNECTED) {
      if (this.config.queue.enabled) {
        this.enqueueMessage(message);
        return false;
      } else {
        this.warn('Not connected, message dropped:', message);
        return false;
      }
    }

    try {
      this.ws.send(message);
      this.log('Message sent:', message);
      return true;
    } catch (error) {
      this.error('Failed to send message:', error);
      trackError(error, {
        type: 'websocket_send_error',
        url: this.config.url,
        message
      });

      // Enfileira para retry se habilitado
      if (this.config.queue.enabled) {
        this.enqueueMessage(message);
      }

      return false;
    }
  }

  /**
   * Enfileira mensagem
   */
  enqueueMessage(message) {
    if (this.messageQueue.length >= this.config.queue.maxSize) {
      this.warn('Message queue full, dropping oldest message');
      this.messageQueue.shift();
    }

    this.messageQueue.push(message);
    this.log(`Message queued (${this.messageQueue.length}/${this.config.queue.maxSize})`);
  }

  /**
   * Processa fila de mensagens
   */
  processMessageQueue() {
    if (this.messageQueue.length === 0) {
      return;
    }

    this.log(`Processing ${this.messageQueue.length} queued messages`);

    while (this.messageQueue.length > 0 && this.state === WebSocketState.CONNECTED) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  /**
   * Fecha conexão
   *
   * @param {number} code - Código de fechamento
   * @param {string} reason - Razão do fechamento
   */
  close(code = 1000, reason = 'Normal closure') {
    if (this.state === WebSocketState.CLOSED || this.state === WebSocketState.CLOSING) {
      this.warn('Already closed or closing');
      return;
    }

    this.log('Closing connection:', reason);
    this.setState(WebSocketState.CLOSING);

    // Cancela reconexão
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Fecha WebSocket
    if (this.ws) {
      this.ws.close(code, reason);
    }
  }

  /**
   * Registra handler de evento
   *
   * @param {string} event - Nome do evento (onOpen, onMessage, onError, onClose, onStateChange)
   * @param {Function} handler - Handler function
   */
  on(event, handler) {
    if (!this.handlers[event]) {
      throw new Error(`Unknown event: ${event}`);
    }

    this.handlers[event].push(handler);
  }

  /**
   * Remove handler de evento
   */
  off(event, handler) {
    if (!this.handlers[event]) {
      throw new Error(`Unknown event: ${event}`);
    }

    this.handlers[event] = this.handlers[event].filter(h => h !== handler);
  }

  /**
   * Obtém estado atual
   */
  getState() {
    return this.state;
  }

  /**
   * Verifica se está conectado
   */
  isConnected() {
    return this.state === WebSocketState.CONNECTED;
  }

  /**
   * Obtém status completo
   */
  getStatus() {
    return {
      state: this.state,
      url: this.config.url,
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length,
      lastError: this.lastError
    };
  }

  /**
   * Limpa recursos
   */
  destroy() {
    this.close(1000, 'Destroyed');
    clearTimeout(this.connectTimeout);
    clearTimeout(this.heartbeatTimer);
    clearTimeout(this.heartbeatTimeout);
    clearTimeout(this.reconnectTimer);
    this.messageQueue = [];
    this.handlers = {
      onOpen: [],
      onMessage: [],
      onError: [],
      onClose: [],
      onStateChange: []
    };
  }
}

/**
 * Factory function para criar WebSocketManager
 */
export function createWebSocket(url, config = {}) {
  return new WebSocketManager({ url, ...config });
}

// Export default
export default {
  WebSocketManager,
  createWebSocket,
  WebSocketState
};
