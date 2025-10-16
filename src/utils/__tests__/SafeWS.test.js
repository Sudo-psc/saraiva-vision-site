import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SafeWS } from '../SafeWS.ts';

describe('SafeWS', () => {
  let mockWebSocket;
  let originalWebSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    originalWebSocket = global.WebSocket;

    // Mock WebSocket class
    mockWebSocket = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
      readyState: 0,
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    global.WebSocket = vi.fn(() => {
      mockWebSocket.readyState = WebSocket.CONNECTING;
      return mockWebSocket;
    });
    global.WebSocket.CONNECTING = 0;
    global.WebSocket.OPEN = 1;
    global.WebSocket.CLOSING = 2;
    global.WebSocket.CLOSED = 3;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
    global.WebSocket = originalWebSocket;
  });

  it('creates SafeWS instance with default options', () => {
    const ws = new SafeWS('ws://localhost:8080');

    expect(ws.getState()).toBe('idle');
    expect(ws.isReady()).toBe(false);
  });

  it('connects to WebSocket URL', () => {
    const ws = new SafeWS('ws://localhost:8080');
    ws.connect();

    expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080');
    expect(ws.getState()).toBe('connecting');
  });

  it('transitions to open state when connection succeeds', () => {
    const onOpen = vi.fn();
    const ws = new SafeWS('ws://localhost:8080', { onOpen });

    ws.connect();
    mockWebSocket.readyState = WebSocket.OPEN;
    mockWebSocket.onopen();

    expect(ws.getState()).toBe('open');
    expect(ws.isReady()).toBe(true);
    expect(onOpen).toHaveBeenCalled();
  });

  it('calls onMessage callback when message received', () => {
    const onMessage = vi.fn();
    const ws = new SafeWS('ws://localhost:8080', { onMessage });

    ws.connect();
    mockWebSocket.readyState = WebSocket.OPEN;
    mockWebSocket.onopen();

    const messageEvent = { data: '{"type":"test"}' };
    mockWebSocket.onmessage(messageEvent);

    expect(onMessage).toHaveBeenCalledWith('{"type":"test"}');
  });

  it('sends data only when WebSocket is open', () => {
    const ws = new SafeWS('ws://localhost:8080');
    ws.connect();

    // Try to send before open
    const result1 = ws.sendSafe('test message');
    expect(result1).toBe(false);
    expect(mockWebSocket.send).not.toHaveBeenCalled();

    // Open connection and send
    mockWebSocket.readyState = WebSocket.OPEN;
    mockWebSocket.onopen();

    const result2 = ws.sendSafe('test message');
    expect(result2).toBe(true);
    expect(mockWebSocket.send).toHaveBeenCalledWith('test message');
  });

  it('prevents sending when readyState is not OPEN', () => {
    const ws = new SafeWS('ws://localhost:8080');
    ws.connect();
    mockWebSocket.readyState = WebSocket.CONNECTING;

    const result = ws.sendSafe('test');
    expect(result).toBe(false);
  });

  it('handles WebSocket close event', () => {
    const onClose = vi.fn();
    const ws = new SafeWS('ws://localhost:8080', { onClose, maxRetries: 0 });

    ws.connect();
    mockWebSocket.onclose();

    expect(ws.getState()).toBe('closed');
    expect(onClose).toHaveBeenCalled();
  });

  it('handles WebSocket error event', () => {
    const onError = vi.fn();
    const ws = new SafeWS('ws://localhost:8080', { onError, maxRetries: 0 });

    ws.connect();
    const errorEvent = new Event('error');
    mockWebSocket.onerror(errorEvent);

    expect(ws.getState()).toBe('error');
    expect(onError).toHaveBeenCalledWith(errorEvent);
  });

  it('attempts reconnection with exponential backoff', () => {
    const ws = new SafeWS('ws://localhost:8080', {
      maxRetries: 3,
      baseDelay: 1000
    });

    ws.connect();
    
    // First connection fails
    mockWebSocket.onclose();
    expect(ws.getState()).toBe('closed');

    // First reconnect after 1000ms
    vi.advanceTimersByTime(1000);
    expect(global.WebSocket).toHaveBeenCalledTimes(2);

    // Second connection fails
    mockWebSocket.onclose();
    
    // Second reconnect after 2000ms (exponential backoff)
    vi.advanceTimersByTime(2000);
    expect(global.WebSocket).toHaveBeenCalledTimes(3);
  });

  it('stops reconnecting after max retries', () => {
    const ws = new SafeWS('ws://localhost:8080', {
      maxRetries: 2,
      baseDelay: 1000
    });

    ws.connect();
    
    // Fail twice
    mockWebSocket.onclose();
    vi.advanceTimersByTime(1000);
    mockWebSocket.onclose();
    vi.advanceTimersByTime(2000);
    mockWebSocket.onclose();
    
    // Should not reconnect after max retries
    vi.advanceTimersByTime(10000);
    expect(global.WebSocket).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('respects maxDelay option for reconnection', () => {
    const ws = new SafeWS('ws://localhost:8080', {
      maxRetries: 10,
      baseDelay: 1000,
      maxDelay: 5000
    });

    ws.connect();
    
    // Fail multiple times to reach max delay
    for (let i = 0; i < 5; i++) {
      mockWebSocket.onclose();
      vi.advanceTimersByTime(Math.min(5000, 1000 * Math.pow(2, i)));
    }

    // Delay should cap at maxDelay
    expect(global.WebSocket).toHaveBeenCalledTimes(6);
  });

  it('resets retry count on successful connection', () => {
    const ws = new SafeWS('ws://localhost:8080', { maxRetries: 3, baseDelay: 1000 });

    ws.connect();
    
    // Fail once
    mockWebSocket.onclose();
    vi.advanceTimersByTime(1000);

    // Successfully connect
    mockWebSocket.readyState = WebSocket.OPEN;
    mockWebSocket.onopen();

    expect(ws.isReady()).toBe(true);

    // Fail again - should start from first retry delay
    mockWebSocket.onclose();
    vi.advanceTimersByTime(1000);
    
    expect(global.WebSocket).toHaveBeenCalledTimes(3);
  });

  it('closes connection cleanly', () => {
    const ws = new SafeWS('ws://localhost:8080');
    ws.connect();
    mockWebSocket.readyState = WebSocket.OPEN;
    mockWebSocket.onopen();

    ws.close();

    expect(mockWebSocket.close).toHaveBeenCalled();
    expect(ws.getState()).toBe('closed');
  });

  it('does not reconnect after manual close', () => {
    const ws = new SafeWS('ws://localhost:8080', { maxRetries: 3 });
    ws.connect();
    
    ws.close();
    vi.advanceTimersByTime(10000);

    // Should only have initial connection attempt
    expect(global.WebSocket).toHaveBeenCalledTimes(1);
  });

  it('prevents multiple simultaneous connections', () => {
    const ws = new SafeWS('ws://localhost:8080');

    ws.connect();
    ws.connect(); // Second call should be ignored
    ws.connect(); // Third call should be ignored

    expect(global.WebSocket).toHaveBeenCalledTimes(1);
  });

  it('handles send errors gracefully', () => {
    const onError = vi.fn();
    const ws = new SafeWS('ws://localhost:8080', { onError, maxRetries: 0 });

    ws.connect();
    mockWebSocket.readyState = WebSocket.OPEN;
    mockWebSocket.onopen();

    mockWebSocket.send.mockImplementation(() => {
      throw new Error('Send failed');
    });

    const result = ws.sendSafe('test');

    expect(result).toBe(false);
    expect(ws.getState()).toBe('error');
  });

  it('handles WebSocket creation errors', () => {
    global.WebSocket = vi.fn(() => {
      throw new Error('WebSocket creation failed');
    });

    const onError = vi.fn();
    const ws = new SafeWS('ws://localhost:8080', { onError, maxRetries: 0 });

    ws.connect();

    expect(ws.getState()).toBe('error');
  });

  it('allows custom retry configuration', () => {
    const ws = new SafeWS('ws://localhost:8080', {
      maxRetries: 10,
      baseDelay: 500,
      maxDelay: 10000
    });

    expect(ws).toBeDefined();
    ws.connect();

    mockWebSocket.onclose();
    vi.advanceTimersByTime(500);

    expect(global.WebSocket).toHaveBeenCalledTimes(2);
  });
});