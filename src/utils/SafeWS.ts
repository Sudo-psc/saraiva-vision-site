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

  constructor(url: string, options: SafeWSOptions = {}) {
    this.url = url;
    this.maxRetries = options.maxRetries ?? 5;
    this.baseDelay = options.baseDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
    this.options = options;
  }

  /**
   * Connect to WebSocket with automatic retry logic
   */
  connect(): void {
    if (this.state === 'connecting' || this.state === 'open') {
      return;
    }

    this.state = 'connecting';

    try {
      this.ws = new WebSocket(this.url);
    } catch (error) {
      console.error('WebSocket creation failed:', error);
      this.handleError(new Event('error'));
      return;
    }

    this.ws.onopen = () => {
      this.state = 'open';
      this.retryCount = 0;
      this.clearReconnectTimer();
      this.options.onOpen?.();
    };

    this.ws.onclose = () => {
      this.state = 'closed';
      this.options.onClose?.();
      this.scheduleReconnect();
    };

    this.ws.onerror = (event) => {
      this.state = 'error';
      this.options.onError?.(event);
      this.scheduleReconnect();
    };

    this.ws.onmessage = (event) => {
      this.options.onMessage?.(event.data);
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
    this.state = 'closed';
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

  private scheduleReconnect(): void {
    if (this.retryCount >= this.maxRetries) {
      console.warn('SafeWS: Max retries reached, giving up');
      return;
    }

    const delay = Math.min(this.maxDelay, this.baseDelay * Math.pow(2, this.retryCount));
    this.retryCount += 1;

    console.log(`SafeWS: Scheduling reconnect in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private handleError(event: Event): void {
    this.state = 'error';
    this.options.onError?.(event);
    this.scheduleReconnect();
  }
}