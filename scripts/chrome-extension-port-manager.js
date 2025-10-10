/**
 * Chrome Extension Port Manager com suporte a BFCache
 * Gerencia conexão robusta entre content script e background/service worker
 */

class ExtensionPortManager {
  constructor(portName = 'content-script') {
    this.portName = portName;
    this.port = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.baseDelay = 100;
    this.maxDelay = 30000;
    this.isInBFCache = false;
    this.messageQueue = [];
    this.listeners = new Map();

    this.init();
  }

  init() {
    // Detectar entrada/saída do BFCache
    window.addEventListener('pageshow', this.handlePageShow.bind(this));
    window.addEventListener('pagehide', this.handlePageHide.bind(this));

    // Detectar mudanças de visibilidade
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Conectar inicialmente
    this.connect();
  }

  handlePageShow(event) {
    console.log('[PortManager] pageshow', { persisted: event.persisted });

    if (event.persisted) {
      // Página voltou do BFCache
      this.isInBFCache = false;
      this.reconnectAttempts = 0;
      this.connect();

      // Reenviar mensagens em fila
      this.flushMessageQueue();
    }
  }

  handlePageHide(event) {
    console.log('[PortManager] pagehide', { persisted: event.persisted });

    if (event.persisted) {
      // Página indo para BFCache - fechar conexão graciosamente
      this.isInBFCache = true;
      this.disconnect();
    }
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'visible' && !this.port) {
      console.log('[PortManager] Tab visible, reconnecting');
      this.connect();
    }
  }

  connect() {
    if (this.port) {
      console.log('[PortManager] Port already connected');
      return;
    }

    if (this.isInBFCache) {
      console.log('[PortManager] In BFCache, skipping connection');
      return;
    }

    try {
      console.log('[PortManager] Connecting...', { attempt: this.reconnectAttempts });

      this.port = chrome.runtime.connect({ name: this.portName });

      this.port.onMessage.addListener(this.handleMessage.bind(this));
      this.port.onDisconnect.addListener(this.handleDisconnect.bind(this));

      this.reconnectAttempts = 0;
      console.log('[PortManager] Connected successfully');

      // Notificar listeners
      this.emit('connected', { port: this.port });

    } catch (error) {
      console.error('[PortManager] Connection failed', error);
      this.scheduleReconnect();
    }
  }

  disconnect() {
    if (this.port) {
      try {
        this.port.disconnect();
      } catch (error) {
        console.warn('[PortManager] Error disconnecting', error);
      }
      this.port = null;
      console.log('[PortManager] Disconnected');
    }
  }

  handleMessage(message) {
    console.log('[PortManager] Message received', message);
    this.emit('message', message);
  }

  handleDisconnect() {
    const lastError = chrome.runtime.lastError;

    console.log('[PortManager] Disconnected', {
      error: lastError?.message,
      isInBFCache: this.isInBFCache
    });

    this.port = null;

    // Não reconectar se estiver em BFCache
    if (!this.isInBFCache) {
      this.scheduleReconnect();
    }

    this.emit('disconnected', { error: lastError });
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[PortManager] Max reconnection attempts reached');
      this.emit('failed', { attempts: this.reconnectAttempts });
      return;
    }

    const delay = this.calculateBackoffDelay();
    this.reconnectAttempts++;

    console.log('[PortManager] Scheduling reconnect', {
      delay,
      attempt: this.reconnectAttempts
    });

    setTimeout(() => this.connect(), delay);
  }

  calculateBackoffDelay() {
    // Exponential backoff com jitter
    const exponentialDelay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.maxDelay
    );

    // Adicionar jitter (±20%)
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
    return Math.floor(exponentialDelay + jitter);
  }

  postMessage(message) {
    if (!this.port) {
      console.warn('[PortManager] Port not connected, queueing message');
      this.messageQueue.push(message);
      this.connect(); // Tentar reconectar
      return false;
    }

    try {
      this.port.postMessage(message);

      // Verificar se houve erro após envio
      if (chrome.runtime.lastError) {
        console.error('[PortManager] postMessage error', chrome.runtime.lastError);
        this.handleDisconnect();
        this.messageQueue.push(message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[PortManager] postMessage exception', error);
      this.handleDisconnect();
      this.messageQueue.push(message);
      return false;
    }
  }

  flushMessageQueue() {
    if (!this.port || this.messageQueue.length === 0) {
      return;
    }

    console.log('[PortManager] Flushing message queue', {
      count: this.messageQueue.length
    });

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of queue) {
      this.postMessage(message);
    }
  }

  // Event emitter simples
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error('[PortManager] Listener error', { event, error });
      }
    });
  }

  destroy() {
    this.disconnect();
    this.listeners.clear();
    this.messageQueue = [];

    window.removeEventListener('pageshow', this.handlePageShow);
    window.removeEventListener('pagehide', this.handlePageHide);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// Service Worker / Background Script
class BackgroundPortManager {
  constructor() {
    this.ports = new Map();
    this.init();
  }

  init() {
    chrome.runtime.onConnect.addListener(this.handleConnection.bind(this));
  }

  handleConnection(port) {
    const portId = `${port.name}_${Date.now()}`;

    console.log('[Background] Port connected', {
      name: port.name,
      id: portId
    });

    this.ports.set(portId, port);

    port.onMessage.addListener(async (message) => {
      try {
        const response = await this.handleMessage(message, port);

        // Verificar se port ainda está conectado antes de responder
        if (this.ports.has(portId)) {
          port.postMessage(response);

          if (chrome.runtime.lastError) {
            console.error('[Background] Response error', chrome.runtime.lastError);
            this.handleDisconnect(portId);
          }
        }
      } catch (error) {
        console.error('[Background] Message handler error', error);

        if (this.ports.has(portId)) {
          port.postMessage({
            error: true,
            message: error.message
          });
        }
      }
    });

    port.onDisconnect.addListener(() => {
      this.handleDisconnect(portId);
    });
  }

  handleDisconnect(portId) {
    const lastError = chrome.runtime.lastError;

    console.log('[Background] Port disconnected', {
      id: portId,
      error: lastError?.message
    });

    this.ports.delete(portId);
  }

  async handleMessage(message, port) {
    console.log('[Background] Message received', message);

    // Processar mensagem
    switch (message.type) {
      case 'ping':
        return { type: 'pong', timestamp: Date.now() };

      case 'analytics':
        // Enviar para analytics
        return { type: 'analytics_ack', success: true };

      default:
        return { type: 'unknown', message: message.type };
    }
  }

  broadcast(message) {
    this.ports.forEach((port, portId) => {
      try {
        port.postMessage(message);

        if (chrome.runtime.lastError) {
          console.error('[Background] Broadcast error', chrome.runtime.lastError);
          this.handleDisconnect(portId);
        }
      } catch (error) {
        console.error('[Background] Broadcast exception', { portId, error });
        this.handleDisconnect(portId);
      }
    });
  }
}

// Uso no Content Script
if (typeof chrome !== 'undefined' && chrome.runtime) {
  const portManager = new ExtensionPortManager('saraiva-vision');

  portManager.on('connected', () => {
    console.log('Extension connected!');
  });

  portManager.on('message', (message) => {
    console.log('Received:', message);
  });

  portManager.on('disconnected', ({ error }) => {
    console.warn('Extension disconnected:', error);
  });

  // Exemplo de envio
  portManager.postMessage({
    type: 'analytics',
    data: { pageView: window.location.href }
  });
}

// Uso no Background/Service Worker
if (typeof chrome !== 'undefined' && chrome.runtime && !self.document) {
  const backgroundManager = new BackgroundPortManager();
}

export { ExtensionPortManager, BackgroundPortManager };
