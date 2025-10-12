/**
 * WebSocket Manager Test Suite
 *
 * Tests for robust WebSocket connection management with state machine
 * Coverage target: >80%
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  WebSocketManager,
  WebSocketState,
  createWebSocket
} from '../websocket-manager.js';

describe('WebSocketManager', () => {
  let mockWebSocket;
  let manager;

  beforeEach(() => {
    // Mock WebSocket API
    mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      readyState: 0,
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    };

    global.WebSocket = vi.fn(() => mockWebSocket);

    vi.useFakeTimers();
  });

  afterEach(() => {
    if (manager) {
      manager.destroy();
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Construction', () => {
    it('should create manager with URL', () => {
      manager = new WebSocketManager({ url: 'wss://test.com/socket' });
      expect(manager).toBeDefined();
      expect(manager.getState()).toBe(WebSocketState.DISCONNECTED);
    });

    it('should throw error without URL', () => {
      expect(() => new WebSocketManager()).toThrow('WebSocket URL is required');
      expect(() => new WebSocketManager({})).toThrow('WebSocket URL is required');
    });

    it('should merge custom config with defaults', () => {
      manager = new WebSocketManager({
        url: 'wss://test.com',
        reconnect: {
          maxAttempts: 5
        }
      });

      expect(manager.config.reconnect.maxAttempts).toBe(5);
      expect(manager.config.reconnect.baseDelay).toBeDefined(); // Default merged
    });
  });

  describe('connect', () => {
    beforeEach(() => {
      manager = new WebSocketManager({ url: 'wss://test.com/socket' });
    });

    it('should create WebSocket and transition to CONNECTING', () => {
      manager.connect();

      expect(global.WebSocket).toHaveBeenCalledWith('wss://test.com/socket', []);
      expect(manager.getState()).toBe(WebSocketState.CONNECTING);
    });

    it('should setup WebSocket event handlers', () => {
      manager.connect();

      expect(mockWebSocket.onopen).toBeDefined();
      expect(mockWebSocket.onmessage).toBeDefined();
      expect(mockWebSocket.onerror).toBeDefined();
      expect(mockWebSocket.onclose).toBeDefined();
    });

    it('should set connection timeout', () => {
      manager.connect();

      expect(setTimeout).toHaveBeenCalled();
    });

    it('should not connect if already connecting', () => {
      manager.connect();
      const firstCallCount = global.WebSocket.mock.calls.length;

      manager.connect(); // Try again

      expect(global.WebSocket.mock.calls.length).toBe(firstCallCount);
    });

    it('should not connect if already connected', () => {
      manager.connect();
      manager.setState(WebSocketState.CONNECTED);

      const beforeCallCount = global.WebSocket.mock.calls.length;
      manager.connect();

      expect(global.WebSocket.mock.calls.length).toBe(beforeCallCount);
    });

    it('should handle connection timeout', () => {
      manager.connect();

      // Advance past timeout (10s default)
      vi.advanceTimersByTime(11000);

      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });

  describe('Connection lifecycle', () => {
    beforeEach(() => {
      manager = new WebSocketManager({
        url: 'wss://test.com/socket',
        heartbeat: { enabled: false } // Disable for simpler tests
      });
    });

    it('should handle successful connection', () => {
      manager.connect();

      // Simulate WebSocket open
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      expect(manager.getState()).toBe(WebSocketState.CONNECTED);
      expect(manager.isConnected()).toBe(true);
    });

    it('should handle connection error', () => {
      manager.connect();

      // Simulate WebSocket error
      if (mockWebSocket.onerror) {
        mockWebSocket.onerror({ message: 'Connection failed' });
      }

      expect(manager.lastError).toBeDefined();
    });

    it('should handle connection close', () => {
      manager.connect();

      // Connect first
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      // Then close
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1000, reason: 'Normal', wasClean: true });
      }

      expect(manager.getState()).toBe(WebSocketState.CLOSED);
    });
  });

  describe('Message handling', () => {
    beforeEach(() => {
      manager = new WebSocketManager({
        url: 'wss://test.com/socket',
        heartbeat: { enabled: false }
      });
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }
    });

    it('should receive messages', () => {
      const messageHandler = vi.fn();
      manager.on('onMessage', messageHandler);

      // Simulate message
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: 'test message' });
      }

      expect(messageHandler).toHaveBeenCalledWith(
        expect.objectContaining({ data: 'test message' })
      );
    });

    it('should handle pong messages for heartbeat', () => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: 'pong' });
      }

      // Pong messages don't trigger handlers
      expect(manager.isConnected()).toBe(true);
    });
  });

  describe('send', () => {
    beforeEach(() => {
      manager = new WebSocketManager({
        url: 'wss://test.com/socket',
        queue: { enabled: true, maxSize: 10 }
      });
    });

    it('should send message when connected', () => {
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      const result = manager.send('test message');

      expect(result).toBe(true);
      expect(mockWebSocket.send).toHaveBeenCalledWith('test message');
    });

    it('should send JSON objects as strings', () => {
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      manager.send({ type: 'test', data: 'value' });

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'test', data: 'value' })
      );
    });

    it('should queue messages when not connected', () => {
      const result = manager.send('queued message');

      expect(result).toBe(false);
      expect(manager.messageQueue.length).toBe(1);
    });

    it('should not queue when queue disabled', () => {
      manager = new WebSocketManager({
        url: 'wss://test.com',
        queue: { enabled: false }
      });

      const result = manager.send('dropped message');

      expect(result).toBe(false);
      expect(manager.messageQueue.length).toBe(0);
    });

    it('should limit queue size', () => {
      // Send 15 messages (max is 10)
      for (let i = 0; i < 15; i++) {
        manager.send(`message ${i}`);
      }

      expect(manager.messageQueue.length).toBe(10);
    });

    it('should process queue after connection', () => {
      // Queue messages
      manager.send('message 1');
      manager.send('message 2');
      manager.send('message 3');

      expect(manager.messageQueue.length).toBe(3);

      // Connect
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      // Queue should be processed
      expect(manager.messageQueue.length).toBe(0);
      expect(mockWebSocket.send).toHaveBeenCalledTimes(3);
    });
  });

  describe('Reconnection', () => {
    beforeEach(() => {
      manager = new WebSocketManager({
        url: 'wss://test.com/socket',
        reconnect: {
          enabled: true,
          maxAttempts: 3,
          baseDelay: 100,
          maxDelay: 1000
        }
      });
    });

    it('should attempt reconnection after disconnect', () => {
      manager.connect();

      // Simulate connection and then unexpected close
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1006, wasClean: false });
      }

      // Should schedule reconnect
      expect(setTimeout).toHaveBeenCalled();
      expect(manager.reconnectAttempts).toBe(1);
    });

    it('should use exponential backoff for reconnection', () => {
      manager.connect();

      // Force disconnect
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1006, wasClean: false });
      }

      const firstDelay = setTimeout.mock.calls[setTimeout.mock.calls.length - 1][1];

      // Second disconnect
      vi.advanceTimersByTime(firstDelay + 100);
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1006, wasClean: false });
      }

      const secondDelay = setTimeout.mock.calls[setTimeout.mock.calls.length - 1][1];

      // Second delay should be longer
      expect(secondDelay).toBeGreaterThan(firstDelay);
    });

    it('should stop reconnecting after max attempts', () => {
      manager.connect();

      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen({});
        }
        if (mockWebSocket.onclose) {
          mockWebSocket.onclose({ code: 1006, wasClean: false });
        }
        vi.advanceTimersByTime(1000);
      }

      expect(manager.getState()).toBe(WebSocketState.CLOSED);
    });

    it('should not reconnect on clean close', () => {
      manager.connect();

      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      // Clean close (intentional)
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1000, wasClean: true });
      }

      expect(manager.getState()).toBe(WebSocketState.CLOSED);
    });

    it('should reset reconnect attempts on successful connection', () => {
      manager.connect();

      // First connection fails
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1006, wasClean: false });
      }
      expect(manager.reconnectAttempts).toBe(1);

      // Reconnect succeeds
      vi.advanceTimersByTime(200);
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      expect(manager.reconnectAttempts).toBe(0);
    });
  });

  describe('Heartbeat', () => {
    beforeEach(() => {
      manager = new WebSocketManager({
        url: 'wss://test.com/socket',
        heartbeat: {
          enabled: true,
          interval: 1000,
          timeout: 500,
          message: 'ping'
        }
      });
    });

    it('should send heartbeat when connected', () => {
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      // Advance past heartbeat interval
      vi.advanceTimersByTime(1100);

      expect(mockWebSocket.send).toHaveBeenCalledWith('ping');
    });

    it('should close connection on heartbeat timeout', () => {
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      // Trigger heartbeat
      vi.advanceTimersByTime(1100);

      // Don't send pong, let it timeout
      vi.advanceTimersByTime(600);

      expect(mockWebSocket.close).toHaveBeenCalled();
    });

    it('should reset heartbeat timeout on pong', () => {
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      // Trigger heartbeat
      vi.advanceTimersByTime(1100);

      // Send pong
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: 'pong' });
      }

      // Advance past timeout - should not close
      vi.advanceTimersByTime(600);

      expect(mockWebSocket.close).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    beforeEach(() => {
      manager = new WebSocketManager({ url: 'wss://test.com/socket' });
    });

    it('should close WebSocket connection', () => {
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      manager.close();

      expect(manager.getState()).toBe(WebSocketState.CLOSING);
      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Normal closure');
    });

    it('should cancel reconnection timer', () => {
      manager.connect();

      // Force reconnection
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1006, wasClean: false });
      }

      const timerCount = clearTimeout.mock.calls.length;

      manager.close();

      expect(clearTimeout.mock.calls.length).toBeGreaterThan(timerCount);
    });

    it('should allow custom close code and reason', () => {
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      manager.close(1001, 'Going away');

      expect(mockWebSocket.close).toHaveBeenCalledWith(1001, 'Going away');
    });

    it('should not close if already closed', () => {
      manager.setState(WebSocketState.CLOSED);

      manager.close();

      expect(mockWebSocket.close).not.toHaveBeenCalled();
    });
  });

  describe('Event handlers', () => {
    beforeEach(() => {
      manager = new WebSocketManager({ url: 'wss://test.com/socket' });
    });

    it('should register event handlers', () => {
      const handler = vi.fn();
      manager.on('onOpen', handler);

      expect(manager.handlers.onOpen).toContain(handler);
    });

    it('should call onOpen handlers', () => {
      const handler = vi.fn();
      manager.on('onOpen', handler);

      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      expect(handler).toHaveBeenCalled();
    });

    it('should call onStateChange handlers', () => {
      const handler = vi.fn();
      manager.on('onStateChange', handler);

      manager.connect();

      expect(handler).toHaveBeenCalledWith(WebSocketState.CONNECTING, WebSocketState.DISCONNECTED);
    });

    it('should remove event handlers', () => {
      const handler = vi.fn();
      manager.on('onMessage', handler);
      manager.off('onMessage', handler);

      expect(manager.handlers.onMessage).not.toContain(handler);
    });

    it('should throw on unknown event', () => {
      expect(() => manager.on('onInvalidEvent', () => {})).toThrow('Unknown event');
    });
  });

  describe('getStatus', () => {
    it('should return complete status', () => {
      manager = new WebSocketManager({ url: 'wss://test.com/socket' });

      const status = manager.getStatus();

      expect(status).toHaveProperty('state');
      expect(status).toHaveProperty('url');
      expect(status).toHaveProperty('reconnectAttempts');
      expect(status).toHaveProperty('queueSize');
      expect(status).toHaveProperty('lastError');
    });
  });

  describe('destroy', () => {
    it('should cleanup all resources', () => {
      manager = new WebSocketManager({ url: 'wss://test.com/socket' });
      manager.connect();

      manager.destroy();

      expect(manager.messageQueue.length).toBe(0);
      expect(Object.values(manager.handlers).every(arr => arr.length === 0)).toBe(true);
    });

    it('should close connection', () => {
      manager = new WebSocketManager({ url: 'wss://test.com/socket' });
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      manager.destroy();

      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });

  describe('createWebSocket factory', () => {
    it('should create WebSocketManager instance', () => {
      const ws = createWebSocket('wss://test.com/socket');
      expect(ws).toBeInstanceOf(WebSocketManager);
      ws.destroy();
    });

    it('should accept config options', () => {
      const ws = createWebSocket('wss://test.com', {
        reconnect: { maxAttempts: 5 }
      });
      expect(ws.config.reconnect.maxAttempts).toBe(5);
      ws.destroy();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete connection lifecycle', () => {
      manager = new WebSocketManager({
        url: 'wss://test.com/socket',
        heartbeat: { enabled: false }
      });

      // Connect
      manager.connect();
      expect(manager.getState()).toBe(WebSocketState.CONNECTING);

      // Open
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }
      expect(manager.getState()).toBe(WebSocketState.CONNECTED);

      // Send message
      manager.send('test');
      expect(mockWebSocket.send).toHaveBeenCalledWith('test');

      // Close
      manager.close();
      expect(manager.getState()).toBe(WebSocketState.CLOSING);

      // Cleanup
      manager.destroy();
    });

    it('should handle reconnection with queued messages', () => {
      manager = new WebSocketManager({
        url: 'wss://test.com/socket',
        reconnect: { enabled: true, baseDelay: 100 },
        queue: { enabled: true }
      });

      // Queue messages before connection
      manager.send('message 1');
      manager.send('message 2');

      // Connect
      manager.connect();
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      // Messages should be sent
      expect(mockWebSocket.send).toHaveBeenCalledTimes(2);

      // Disconnect unexpectedly
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({ code: 1006, wasClean: false });
      }

      // Queue more messages
      manager.send('message 3');

      // Reconnect
      vi.advanceTimersByTime(200);
      if (mockWebSocket.onopen) {
        mockWebSocket.onopen({});
      }

      // Queued message should be sent
      expect(mockWebSocket.send).toHaveBeenCalledTimes(3);
    });
  });
});
