/**
 * WebSocket Robusto com reconexão, fila de mensagens e lifecycle
 * Trata BFCache, visibilitychange e estados inválidos
 */

class RobustWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.protocols = options.protocols || [];
    this.ws = null;

    // Reconexão
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.reconnectTimeout = null;

    // Fila de mensagens
    this.messageQueue = [];
    this.maxQueueSize = options.maxQueueSize || 100;

    // Estado
    this.isInBFCache = false;
    this.isManualClose = false;
    this.shouldReconnect = true;

    // Listeners
    this.listeners = {
      open: [],
      message: [],
      error: [],
      close: [],
      stateChange: []
    };

    // Heartbeat/ping
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.heartbeatTimer = null;
    this.pongTimeout = options.pongTimeout || 5000;
    this.pongTimer = null;

    this.init();
  }

  init() {
    // Lifecycle events
    window.addEventListener('pageshow', this.handlePageShow.bind(this));
    window.addEventListener('pagehide', this.handlePageHide.bind(this));
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Conectar inicialmente
    this.connect();
  }

  handlePageShow(event) {
    console.log('[RobustWS] pageshow', { persisted: event.persisted });

    if (event.persisted) {
      // Voltou do BFCache
      this.isInBFCache = false;
      this.reconnectAttempts = 0;

      if (this.shouldReconnect) {
        this.connect();
      }
    }
  }

  handlePageHide(event) {
    console.log('[RobustWS] pagehide', { persisted: event.persisted });

    if (event.persisted) {
      // Indo para BFCache
      this.isInBFCache = true;
      this.closeConnection(false); // Não reconectar
    }
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      console.log('[RobustWS] Tab hidden');
      this.stopHeartbeat();
    } else if (document.visibilityState === 'visible') {
      console.log('[RobustWS] Tab visible');

      if (!this.isConnected() && this.shouldReconnect) {
        this.connect();
      } else if (this.isConnected()) {
        this.startHeartbeat();
      }
    }
  }

  connect() {
    if (this.isInBFCache) {
      console.log('[RobustWS] In BFCache, skipping connection');
      return;
    }

    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      console.log('[RobustWS] Already connected or connecting');
      return;
    }

    try {
      console.log('[RobustWS] Connecting...', {
        url: this.url,
        attempt: this.reconnectAttempts
      });

      this.ws = new WebSocket(this.url, this.protocols);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);

      this.emitStateChange('connecting');

    } catch (error) {
      console.error('[RobustWS] Connection error', error);
      this.scheduleReconnect();
    }
  }

  handleOpen(event) {
    console.log('[RobustWS] Connected');

    this.reconnectAttempts = 0;
    this.isManualClose = false;

    this.emitStateChange('open');
    this.emit('open', event);

    // Iniciar heartbeat
    this.startHeartbeat();

    // Enviar mensagens em fila
    this.flushMessageQueue();
  }

  handleMessage(event) {
    console.log('[RobustWS] Message received', {
      data: event.data?.substring(0, 100)
    });

    // Resetar pong timer se for resposta de ping
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'pong') {
        this.clearPongTimeout();
        return;
      }
    } catch (e) {
      // Não é JSON, ignorar
    }

    this.emit('message', event);
  }

  handleError(event) {
    console.error('[RobustWS] Error', event);
    this.emitStateChange('error');
    this.emit('error', event);
  }

  handleClose(event) {
    console.log('[RobustWS] Closed', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      isManualClose: this.isManualClose
    });

    this.stopHeartbeat();
    this.emitStateChange('closed');
    this.emit('close', event);

    // Reconectar se não foi fechamento manual
    if (!this.isManualClose && this.shouldReconnect && !this.isInBFCache) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[RobustWS] Max reconnection attempts reached');
      this.emitStateChange('failed');
      this.shouldReconnect = false;
      return;
    }

    // Limpar timeout anterior
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = this.calculateBackoffDelay();
    this.reconnectAttempts++;

    console.log('[RobustWS] Scheduling reconnect', {
      delay,
      attempt: this.reconnectAttempts
    });

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  calculateBackoffDelay() {
    // Exponential backoff com jitter
    const exponentialDelay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.maxDelay
    );

    // Jitter ±30%
    const jitter = exponentialDelay * 0.3 * (Math.random() - 0.5);
    return Math.floor(exponentialDelay + jitter);
  }

  send(data) {
    if (!this.ws) {
      console.warn('[RobustWS] No WebSocket, queueing message');
      this.queueMessage(data);
      this.connect();
      return false;
    }

    // Verificar estado antes de enviar
    if (this.ws.readyState === WebSocket.CONNECTING) {
      console.warn('[RobustWS] Still connecting, queueing message');
      this.queueMessage(data);
      return false;
    }

    if (this.ws.readyState === WebSocket.CLOSING || this.ws.readyState === WebSocket.CLOSED) {
      console.warn('[RobustWS] Connection closing/closed, queueing message');
      this.queueMessage(data);
      this.connect();
      return false;
    }

    // Estado OPEN - enviar
    try {
      this.ws.send(data);
      return true;
    } catch (error) {
      console.error('[RobustWS] Send error', error);
      this.queueMessage(data);
      return false;
    }
  }

  queueMessage(data) {
    if (this.messageQueue.length >= this.maxQueueSize) {
      console.warn('[RobustWS] Queue full, dropping oldest message');
      this.messageQueue.shift();
    }

    this.messageQueue.push({
      data,
      timestamp: Date.now()
    });

    console.log('[RobustWS] Message queued', {
      queueSize: this.messageQueue.length
    });
  }

  flushMessageQueue() {
    if (this.messageQueue.length === 0) {
      return;
    }

    console.log('[RobustWS] Flushing message queue', {
      count: this.messageQueue.length
    });

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const { data, timestamp } of queue) {
      // Descartar mensagens muito antigas (>5min)
      if (Date.now() - timestamp > 300000) {
        console.warn('[RobustWS] Discarding stale message', {
          age: Date.now() - timestamp
        });
        continue;
      }

      this.send(data);
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();

    if (!this.heartbeatInterval) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        console.log('[RobustWS] Sending ping');

        this.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));

        // Configurar timeout para pong
        this.pongTimer = setTimeout(() => {
          console.warn('[RobustWS] Pong timeout, reconnecting');
          this.closeConnection(false);
          this.connect();
        }, this.pongTimeout);
      }
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.clearPongTimeout();
  }

  clearPongTimeout() {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  closeConnection(manual = true) {
    this.isManualClose = manual;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close(1000, 'Client closing');
        }
      } catch (error) {
        console.warn('[RobustWS] Close error', error);
      }

      this.ws = null;
    }
  }

  close() {
    this.shouldReconnect = false;
    this.closeConnection(true);
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getState() {
    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  // Event emitter
  on(event, callback) {
    if (!this.listeners[event]) {
      console.warn('[RobustWS] Unknown event', event);
      return;
    }

    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;

    const index = this.listeners[event].indexOf(callback);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('[RobustWS] Listener error', { event, error });
      }
    });
  }

  emitStateChange(state) {
    this.emit('stateChange', { state, timestamp: Date.now() });
  }

  destroy() {
    this.close();
    this.messageQueue = [];

    Object.keys(this.listeners).forEach(event => {
      this.listeners[event] = [];
    });

    window.removeEventListener('pageshow', this.handlePageShow);
    window.removeEventListener('pagehide', this.handlePageHide);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// Uso
const ws = new RobustWebSocket('wss://lc.pulse.is/live-chat', {
  maxReconnectAttempts: 10,
  baseDelay: 1000,
  maxDelay: 30000,
  heartbeatInterval: 30000
});

ws.on('open', () => {
  console.log('WebSocket connected!');
});

ws.on('message', (event) => {
  console.log('Received:', event.data);
});

ws.on('error', (event) => {
  console.error('WebSocket error:', event);
});

ws.on('close', (event) => {
  console.log('WebSocket closed:', event.code, event.reason);
});

ws.on('stateChange', ({ state }) => {
  console.log('State changed:', state);
});

// Enviar mensagem
ws.send(JSON.stringify({ type: 'subscribe', channel: 'notifications' }));

export default RobustWebSocket;
