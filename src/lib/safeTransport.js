/**
 * Safe Transport Layer
 * Prevents InvalidStateError by managing connection states and queues
 */

export class SafeWebSocket {
  constructor(url, protocols) {
    this.url = url;
    this.protocols = protocols;
    this.ws = null;
    this.queue = [];
    this.maxQueueSize = 100;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1s
    this.maxReconnectDelay = 30000; // Max 30s
    this.isIntentionallyClosed = false;
    this.messageHandlers = [];
    this.errorHandlers = [];
    this.openHandlers = [];
    this.closeHandlers = [];

    this.connect();
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[SafeWebSocket] Already connected');
      return;
    }

    try {
      console.log('[SafeWebSocket] Connecting to', this.url);
      this.ws = new WebSocket(this.url, this.protocols);

      this.ws.addEventListener('open', (event) => {
        console.log('[SafeWebSocket] Connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.openHandlers.forEach(handler => handler(event));
        this.flushQueue();
      });

      this.ws.addEventListener('message', (event) => {
        this.messageHandlers.forEach(handler => handler(event));
      });

      this.ws.addEventListener('error', (event) => {
        console.error('[SafeWebSocket] Error:', event);
        this.errorHandlers.forEach(handler => handler(event));
      });

      this.ws.addEventListener('close', (event) => {
        console.log('[SafeWebSocket] Closed', event.code, event.reason);
        this.closeHandlers.forEach(handler => handler(event));

        // Reconnect if not intentionally closed
        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      });
    } catch (error) {
      console.error('[SafeWebSocket] Connection error:', error);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SafeWebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`[SafeWebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(data) {
    // Check connection state before sending
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[SafeWebSocket] Not connected, queuing message');
      return this.enqueue(data);
    }

    try {
      this.ws.send(data);
      return true;
    } catch (error) {
      console.error('[SafeWebSocket] Send error:', error);

      // Queue if InvalidStateError
      if (error.name === 'InvalidStateError') {
        return this.enqueue(data);
      }

      throw error;
    }
  }

  enqueue(data) {
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('[SafeWebSocket] Queue full, dropping oldest message');
      this.queue.shift();
    }

    this.queue.push({
      data,
      timestamp: Date.now()
    });

    return false;
  }

  flushQueue() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[SafeWebSocket] Cannot flush queue, not connected');
      return;
    }

    console.log(`[SafeWebSocket] Flushing ${this.queue.length} queued messages`);

    while (this.queue.length > 0) {
      const item = this.queue.shift();

      try {
        this.ws.send(item.data);
      } catch (error) {
        console.error('[SafeWebSocket] Error flushing queue:', error);
        // Re-queue if still invalid
        if (error.name === 'InvalidStateError') {
          this.queue.unshift(item);
          break;
        }
      }
    }
  }

  clearQueue() {
    console.log(`[SafeWebSocket] Clearing ${this.queue.length} queued messages`);
    this.queue = [];
  }

  close(code, reason) {
    this.isIntentionallyClosed = true;
    this.clearQueue();

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(code, reason);
    }
  }

  // Event listeners
  onOpen(handler) {
    this.openHandlers.push(handler);
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  onError(handler) {
    this.errorHandlers.push(handler);
  }

  onClose(handler) {
    this.closeHandlers.push(handler);
  }

  getState() {
    return {
      readyState: this.ws?.readyState,
      readyStateText: this.getReadyStateText(),
      queueLength: this.queue.length,
      reconnectAttempts: this.reconnectAttempts,
      isIntentionallyClosed: this.isIntentionallyClosed
    };
  }

  getReadyStateText() {
    if (!this.ws) return 'NO_CONNECTION';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

export class SafeXHR {
  constructor(url, method = 'POST') {
    this.url = url;
    this.method = method;
    this.queue = [];
    this.maxQueueSize = 50;
    this.inFlight = false;
  }

  send(data, options = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        data,
        options,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.queue.push(request);

      if (this.queue.length > this.maxQueueSize) {
        console.warn('[SafeXHR] Queue full, dropping oldest request');
        const dropped = this.queue.shift();
        dropped.reject(new Error('Queue full'));
      }

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.inFlight || this.queue.length === 0) {
      return;
    }

    this.inFlight = true;
    const request = this.queue.shift();

    try {
      const xhr = new XMLHttpRequest();
      xhr.open(this.method, this.url);

      // Set headers
      if (request.options.headers) {
        Object.entries(request.options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      // Set content type if not specified
      if (!request.options.headers?.['Content-Type']) {
        xhr.setRequestHeader('Content-Type', 'application/json');
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          request.resolve({
            status: xhr.status,
            data: xhr.responseText,
            headers: xhr.getAllResponseHeaders()
          });
        } else {
          request.reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
        this.inFlight = false;
        this.processQueue();
      };

      xhr.onerror = () => {
        request.reject(new Error('Network error'));
        this.inFlight = false;
        this.processQueue();
      };

      xhr.ontimeout = () => {
        request.reject(new Error('Request timeout'));
        this.inFlight = false;
        this.processQueue();
      };

      // Check state before sending
      if (xhr.readyState === XMLHttpRequest.OPENED) {
        xhr.send(request.data);
      } else {
        throw new Error(`Invalid XHR state: ${xhr.readyState}`);
      }
    } catch (error) {
      console.error('[SafeXHR] Send error:', error);
      request.reject(error);
      this.inFlight = false;
      this.processQueue();
    }
  }

  clearQueue() {
    console.log(`[SafeXHR] Clearing ${this.queue.length} queued requests`);
    this.queue.forEach(request => {
      request.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }

  getState() {
    return {
      queueLength: this.queue.length,
      inFlight: this.inFlight
    };
  }
}

// Beacon API wrapper with size checks
export class SafeBeacon {
  constructor(url) {
    this.url = url;
    this.maxPayloadSize = 64 * 1024; // 64KB is typical beacon limit
  }

  send(data) {
    try {
      const blob = new Blob([data], { type: 'application/json' });

      if (blob.size > this.maxPayloadSize) {
        console.warn(`[SafeBeacon] Payload too large: ${blob.size} bytes`);
        return this.fallbackToXHR(data);
      }

      const success = navigator.sendBeacon(this.url, blob);

      if (!success) {
        console.warn('[SafeBeacon] sendBeacon failed, falling back to XHR');
        return this.fallbackToXHR(data);
      }

      return Promise.resolve({ success: true });
    } catch (error) {
      console.error('[SafeBeacon] Error:', error);
      return this.fallbackToXHR(data);
    }
  }

  fallbackToXHR(data) {
    const xhr = new SafeXHR(this.url);
    return xhr.send(data);
  }
}

export default {
  SafeWebSocket,
  SafeXHR,
  SafeBeacon
};
