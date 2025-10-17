type WSState = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

interface SafeWSOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: string) => void;
}

type SafeWSHandlerMap = {
  open: () => void;
  close: () => void;
  error: (error: Event) => void;
  message: (data: string) => void;
  statechange: (state: WSState) => void;
};

type SafeWSEvent = keyof SafeWSHandlerMap;

/**
 * Safe WebSocket wrapper with automatic reconnection, backoff, and state management
 * Prevents InvalidStateError by checking readyState before operations
 */
export class SafeWS {
  private url: string;
  private ws: WebSocket | null = null;
  private state: WSState = 'idle';
  private retryCount = 0;
  private maxRetries: number;
  private baseDelay: number;
  private maxDelay: number;
  private reconnectTimer: number | null = null;
  private options: SafeWSOptions;
  private listeners: Map<SafeWSEvent, Set<SafeWSHandlerMap[SafeWSEvent]>> = new Map();
  private globalScope: typeof globalThis;

  constructor(url: string, options: SafeWSOptions = {}) {
    this.url = url;
    this.maxRetries = options.maxRetries ?? 5;
    this.baseDelay = options.baseDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
    this.options = options;
    this.globalScope = typeof window !== 'undefined' ? window : globalThis;
  }

  /**
   * Connect to WebSocket with automatic retry logic
   */
  connect(): void {
    if (this.state === 'connecting' || this.state === 'open') {
      return;
    }

    this.updateState('connecting');

    try {
      this.ws = new WebSocket(this.url);
    } catch (error) {
      console.error('WebSocket creation failed:', error);
      this.handleError(new Event('error'));
      return;
    }

    this.ws.onopen = () => {
      this.updateState('open');
      this.retryCount = 0;
      this.clearReconnectTimer();
      this.options.onOpen?.();
      this.emit('open');
    };

    this.ws.onclose = () => {
      this.updateState('closed');
      this.options.onClose?.();
      this.emit('close');
      this.scheduleReconnect();
    };

    this.ws.onerror = (event) => {
      this.updateState('error');
      this.options.onError?.(event);
      this.emit('error', event);
      this.scheduleReconnect();
    };

    this.ws.onmessage = (event) => {
      this.options.onMessage?.(event.data);
      this.emit('message', event.data);
    };
  }

  /**
   * Send data safely - only if WebSocket is open
   */
  sendSafe(data: string): boolean {
    if (this.state !== 'open' || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('SafeWS: Cannot send - WebSocket not ready', {
        state: this.state,
        readyState: this.ws?.readyState
      });
      return false;
    }

    try {
      this.ws.send(data);
      return true;
    } catch (error) {
      console.error('SafeWS: Send failed:', error);
      this.handleError(new Event('error'));
      return false;
    }
  }

  /**
   * Close WebSocket connection
   */
  close(): void {
    this.clearReconnectTimer();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.updateState('closed');
  }

  /**
   * Get current connection state
   */
  getState(): WSState {
    return this.state;
  }

  /**
   * Check if WebSocket is ready for sending
   */
  isReady(): boolean {
    return this.state === 'open' && this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  send(data: string): boolean {
    return this.sendSafe(data);
  }

  on<Event extends SafeWSEvent>(event: Event, handler: SafeWSHandlerMap[Event]): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as SafeWSHandlerMap[SafeWSEvent]);
    return () => this.off(event, handler);
  }

  off<Event extends SafeWSEvent>(event: Event, handler: SafeWSHandlerMap[Event]): void {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }
    handlers.delete(handler as SafeWSHandlerMap[SafeWSEvent]);
    if (handlers.size === 0) {
      this.listeners.delete(event);
    }
  }

  private scheduleReconnect(): void {
    if (this.retryCount >= this.maxRetries) {
      console.warn('SafeWS: Max retries reached, giving up');
      return;
    }

    const delay = Math.min(this.maxDelay, this.baseDelay * Math.pow(2, this.retryCount));
    this.retryCount += 1;

    console.log(`SafeWS: Scheduling reconnect in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);

    this.reconnectTimer = this.globalScope.setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      this.globalScope.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private handleError(event: Event): void {
    this.updateState('error');
    this.options.onError?.(event);
    this.scheduleReconnect();
  }

  private emit<Event extends SafeWSEvent>(event: Event, ...args: Parameters<SafeWSHandlerMap[Event]>): void {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }
    handlers.forEach((handler) => {
      (handler as (...params: Parameters<SafeWSHandlerMap[Event]>) => void)(...args);
    });
  }

  private updateState(state: WSState): void {
    if (this.state === state) {
      return;
    }
    this.state = state;
    this.emit('statechange', state);
  }
}