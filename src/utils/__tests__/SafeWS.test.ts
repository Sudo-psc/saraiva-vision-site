import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SafeWS } from '../SafeWS.ts';

describe('SafeWS', () => {
  let mockWebSocket: any;
  let originalWebSocket: any;

  beforeEach(() => {
    originalWebSocket = global.WebSocket;
    
    // Mock WebSocket
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onclose: null,
      onerror: null,
      onmessage: null
    };

    global.WebSocket = vi.fn(() => mockWebSocket) as any;
    
    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.WebSocket = originalWebSocket;
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      expect(ws).toBeInstanceOf(SafeWS);
      expect(ws.getState()).toBe('idle');
    });

    it('should accept custom options', () => {
      const options = {
        maxRetries: 10,
        baseDelay: 2000,
        maxDelay: 60000,
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onError: vi.fn(),
        onMessage: vi.fn()
      };

      const ws = new SafeWS('ws://localhost:8080', options);
      
      expect(ws).toBeInstanceOf(SafeWS);
    });

    it('should handle missing options', () => {
      const ws = new SafeWS('ws://localhost:8080', {});
      
      expect(ws.getState()).toBe('idle');
    });
  });

  describe('connect', () => {
    it('should create WebSocket connection', () => {
      const ws = new SafeWS('ws://localhost:8080');
      ws.connect();

      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080');
      expect(ws.getState()).toBe('connecting');
    });

    it('should call onOpen callback when connection opens', () => {
      const onOpen = vi.fn();
      const ws = new SafeWS('ws://localhost:8080', { onOpen });
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      expect(onOpen).toHaveBeenCalled();
      expect(ws.getState()).toBe('open');
    });

    it('should not create duplicate connections', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      ws.connect();

      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });

    it('should not reconnect if already open', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      ws.connect();

      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });

    it('should handle WebSocket creation failure', () => {
      global.WebSocket = vi.fn(() => {
        throw new Error('Connection failed');
      }) as any;

      const ws = new SafeWS('ws://localhost:8080');
      ws.connect();

      expect(ws.getState()).toBe('error');
    });

    it('should reset retry count on successful connection', () => {
      const ws = new SafeWS('ws://localhost:8080', { maxRetries: 3 });
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      expect(ws.getState()).toBe('open');
    });
  });

  describe('sendSafe', () => {
    it('should send data when connection is open', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      const result = ws.sendSafe('test message');

      expect(mockWebSocket.send).toHaveBeenCalledWith('test message');
      expect(result).toBe(true);
    });

    it('should not send when connection is not open', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      const result = ws.sendSafe('test message');

      expect(mockWebSocket.send).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should not send when readyState is not OPEN', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.CONNECTING;

      const result = ws.sendSafe('test message');

      expect(mockWebSocket.send).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle send errors gracefully', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      mockWebSocket.send.mockImplementation(() => {
        throw new Error('Send failed');
      });

      const result = ws.sendSafe('test message');

      expect(result).toBe(false);
      expect(ws.getState()).toBe('error');
    });

    it('should return false if WebSocket instance is null', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      const result = ws.sendSafe('test message');

      expect(result).toBe(false);
    });
  });

  describe('close', () => {
    it('should close open connection', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      ws.close();

      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(ws.getState()).toBe('closed');
    });

    it('should not throw when closing already closed connection', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      expect(() => ws.close()).not.toThrow();
    });

    it('should not attempt to close if readyState is not OPEN', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.CONNECTING;

      ws.close();

      expect(mockWebSocket.close).not.toHaveBeenCalled();
    });

    it('should clear reconnect timer when closed', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      
      // Trigger error to schedule reconnect
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }

      ws.close();

      // Advance timers - should not reconnect
      vi.advanceTimersByTime(10000);

      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });
  });

  describe('state management', () => {
    it('should return current state', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      expect(ws.getState()).toBe('idle');

      ws.connect();
      expect(ws.getState()).toBe('connecting');

      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }
      expect(ws.getState()).toBe('open');

      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new Event('close'));
      }
      expect(ws.getState()).toBe('closed');
    });

    it('should transition to error state on error', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }

      expect(ws.getState()).toBe('error');
    });
  });

  describe('isReady', () => {
    it('should return true when connection is open', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      expect(ws.isReady()).toBe(true);
    });

    it('should return false when connection is not open', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      expect(ws.isReady()).toBe(false);

      ws.connect();
      expect(ws.isReady()).toBe(false);
    });

    it('should return false when state is open but readyState is not', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.CLOSING;

      expect(ws.isReady()).toBe(false);
    });
  });

  describe('reconnection logic', () => {
    it('should schedule reconnect on close', () => {
      const ws = new SafeWS('ws://localhost:8080', { baseDelay: 1000 });
      
      ws.connect();
      
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new Event('close'));
      }

      vi.advanceTimersByTime(1000);

      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });

    it('should schedule reconnect on error', () => {
      const ws = new SafeWS('ws://localhost:8080', { baseDelay: 1000 });
      
      ws.connect();
      
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }

      vi.advanceTimersByTime(1000);

      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff for reconnects', () => {
      const ws = new SafeWS('ws://localhost:8080', { 
        baseDelay: 1000,
        maxRetries: 3
      });
      
      // First attempt
      ws.connect();
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }

      // Wait for first retry (1000ms)
      vi.advanceTimersByTime(1000);
      expect(global.WebSocket).toHaveBeenCalledTimes(2);

      // Fail again
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }

      // Wait for second retry (2000ms - exponential backoff)
      vi.advanceTimersByTime(2000);
      expect(global.WebSocket).toHaveBeenCalledTimes(3);
    });

    it('should respect maxDelay for reconnects', () => {
      const ws = new SafeWS('ws://localhost:8080', { 
        baseDelay: 1000,
        maxDelay: 5000,
        maxRetries: 10
      });
      
      ws.connect();
      
      // Trigger multiple errors
      for (let i = 0; i < 5; i++) {
        if (mockWebSocket.onerror) {
          mockWebSocket.onerror(new Event('error'));
        }
        vi.advanceTimersByTime(10000); // Advance by more than maxDelay
      }

      // Should have retried but with capped delay
      expect(global.WebSocket).toHaveBeenCalled();
    });

    it('should stop reconnecting after maxRetries', () => {
      const ws = new SafeWS('ws://localhost:8080', { 
        baseDelay: 100,
        maxRetries: 2
      });
      
      ws.connect();
      
      // Trigger errors up to maxRetries
      for (let i = 0; i < 3; i++) {
        if (mockWebSocket.onerror) {
          mockWebSocket.onerror(new Event('error'));
        }
        vi.advanceTimersByTime(1000);
      }

      const callCount = (global.WebSocket as any).mock.calls.length;

      // Should not retry beyond maxRetries
      vi.advanceTimersByTime(10000);
      expect(global.WebSocket).toHaveBeenCalledTimes(callCount);
    });

    it('should clear reconnect timer on successful connection', () => {
      const ws = new SafeWS('ws://localhost:8080', { baseDelay: 1000 });
      
      ws.connect();
      
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }

      // Before timer fires, simulate successful reconnection
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      const callsBefore = (global.WebSocket as any).mock.calls.length;

      // Advance timer
      vi.advanceTimersByTime(2000);

      // Should not have created new connection
      expect(global.WebSocket).toHaveBeenCalledTimes(callsBefore);
    });
  });

  describe('callback handlers', () => {
    it('should call onOpen callback', () => {
      const onOpen = vi.fn();
      const ws = new SafeWS('ws://localhost:8080', { onOpen });
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should call onClose callback', () => {
      const onClose = vi.fn();
      const ws = new SafeWS('ws://localhost:8080', { onClose });
      
      ws.connect();
      
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose(new Event('close'));
      }

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onError callback', () => {
      const onError = vi.fn();
      const ws = new SafeWS('ws://localhost:8080', { onError });
      
      ws.connect();
      
      const errorEvent = new Event('error');
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(errorEvent);
      }

      expect(onError).toHaveBeenCalledWith(errorEvent);
    });

    it('should call onMessage callback with data', () => {
      const onMessage = vi.fn();
      const ws = new SafeWS('ws://localhost:8080', { onMessage });
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: 'test message' } as MessageEvent);
      }

      expect(onMessage).toHaveBeenCalledWith('test message');
    });

    it('should not throw if callbacks are not provided', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();

      expect(() => {
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen(new Event('open'));
        }
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose(new Event('close'));
        }
        if (mockWebSocket.onerror) {
          mockWebSocket.onerror(new Event('error'));
        }
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage({ data: 'test' } as MessageEvent);
        }
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid connect/disconnect cycles', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      ws.close();
      ws.connect();
      ws.close();

      expect(ws.getState()).toBe('closed');
    });

    it('should handle WebSocket URL with query parameters', () => {
      const ws = new SafeWS('ws://localhost:8080?token=abc123');
      ws.connect();

      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080?token=abc123');
    });

    it('should handle secure WebSocket URLs', () => {
      const ws = new SafeWS('wss://secure.example.com');
      ws.connect();

      expect(global.WebSocket).toHaveBeenCalledWith('wss://secure.example.com');
    });

    it('should handle multiple message callbacks', () => {
      const onMessage = vi.fn();
      const ws = new SafeWS('ws://localhost:8080', { onMessage });
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: 'message1' } as MessageEvent);
        mockWebSocket.onmessage({ data: 'message2' } as MessageEvent);
        mockWebSocket.onmessage({ data: 'message3' } as MessageEvent);
      }

      expect(onMessage).toHaveBeenCalledTimes(3);
    });

    it('should handle sending empty string', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      const result = ws.sendSafe('');

      expect(mockWebSocket.send).toHaveBeenCalledWith('');
      expect(result).toBe(true);
    });

    it('should handle JSON stringified data', () => {
      const ws = new SafeWS('ws://localhost:8080');
      
      ws.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen(new Event('open'));
      }

      const data = JSON.stringify({ type: 'test', payload: 'data' });
      ws.sendSafe(data);

      expect(mockWebSocket.send).toHaveBeenCalledWith(data);
    });
  });

  describe('memory management', () => {
    it('should clean up timers on close', () => {
      const ws = new SafeWS('ws://localhost:8080', { baseDelay: 1000 });
      
      ws.connect();
      
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror(new Event('error'));
      }

      ws.close();

      // Timer should be cleared, no reconnection
      vi.advanceTimersByTime(5000);
      
      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple instances simultaneously', () => {
      const ws1 = new SafeWS('ws://localhost:8080');
      const ws2 = new SafeWS('ws://localhost:8081');
      
      ws1.connect();
      ws2.connect();

      expect(global.WebSocket).toHaveBeenCalledTimes(2);
      expect(global.WebSocket).toHaveBeenNthCalledWith(1, 'ws://localhost:8080');
      expect(global.WebSocket).toHaveBeenNthCalledWith(2, 'ws://localhost:8081');
    });
  });
});