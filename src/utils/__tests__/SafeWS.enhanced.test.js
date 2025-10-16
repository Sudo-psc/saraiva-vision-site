import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('SafeWS Module', () => {
  let SafeWS;
  let mockWebSocket;

  beforeEach(async () => {
    // Mock WebSocket
    mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 1, // OPEN
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    };

    global.WebSocket = vi.fn(() => mockWebSocket);
    global.WebSocket.OPEN = 1;
    global.WebSocket.CONNECTING = 0;
    global.WebSocket.CLOSING = 2;
    global.WebSocket.CLOSED = 3;

    // Import SafeWS from .ts file
    const module = await import('../SafeWS.ts');
    SafeWS = module.SafeWS;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('SafeWS.js Wrapper Export', () => {
    it('should export SafeWS from SafeWS.ts', async () => {
      const wrapperModule = await import('../SafeWS.js');
      
      expect(wrapperModule).toHaveProperty('SafeWS');
      expect(wrapperModule.SafeWS).toBeDefined();
    });

    it('should allow instantiation through wrapper', async () => {
      const wrapperModule = await import('../SafeWS.js');
      
      const ws = new wrapperModule.SafeWS('ws://test.com');
      expect(ws).toBeDefined();
      expect(ws).toBeInstanceOf(wrapperModule.SafeWS);
    });

    it('should preserve SafeWS functionality through wrapper', async () => {
      const wrapperModule = await import('../SafeWS.js');
      
      const ws = new wrapperModule.SafeWS('ws://test.com');
      
      expect(ws.connect).toBeDefined();
      expect(ws.sendSafe).toBeDefined();
      expect(ws.close).toBeDefined();
      expect(ws.getState).toBeDefined();
      expect(ws.isReady).toBeDefined();
    });

    it('should allow method calls through wrapper', async () => {
      const wrapperModule = await import('../SafeWS.js');
      
      const ws = new wrapperModule.SafeWS('ws://test.com', {
        onOpen: vi.fn()
      });

      ws.connect();
      
      expect(global.WebSocket).toHaveBeenCalledWith('ws://test.com');
    });
  });

  describe('SafeWS Integration with Instagram Service', () => {
    it('should be compatible with InstagramService usage', async () => {
      const wrapperModule = await import('../SafeWS.js');
      
      // Simulate InstagramService pattern
      const ws = new wrapperModule.SafeWS('ws://localhost:8080/stats', {
        onOpen: vi.fn(),
        onMessage: vi.fn(),
        onError: vi.fn()
      });

      expect(ws).toBeDefined();
      expect(typeof ws.sendSafe).toBe('function');
      expect(typeof ws.connect).toBe('function');
    });

    it('should support subscription pattern used by InstagramService', async () => {
      const wrapperModule = await import('../SafeWS.js');
      const onMessage = vi.fn();
      
      const ws = new wrapperModule.SafeWS('ws://test.com', {
        onMessage,
        onOpen: vi.fn()
      });

      ws.connect();
      
      // Simulate message handling
      const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];

      if (messageHandler) {
        messageHandler({ data: JSON.stringify({ type: 'stats_update' }) });
      }

      expect(mockWebSocket.addEventListener).toHaveBeenCalled();
    });
  });

  describe('SafeWS Constructor Options', () => {
    it('should accept url parameter', () => {
      const ws = new SafeWS('ws://test.com');
      expect(ws).toBeDefined();
    });

    it('should accept options with callbacks', () => {
      const options = {
        onOpen: vi.fn(),
        onClose: vi.fn(),
        onError: vi.fn(),
        onMessage: vi.fn()
      };

      const ws = new SafeWS('ws://test.com', options);
      expect(ws).toBeDefined();
    });

    it('should accept options with retry configuration', () => {
      const options = {
        maxRetries: 10,
        baseDelay: 2000,
        maxDelay: 60000
      };

      const ws = new SafeWS('ws://test.com', options);
      expect(ws).toBeDefined();
    });
  });

  describe('SafeWS Methods', () => {
    it('should provide connect method', () => {
      const ws = new SafeWS('ws://test.com');
      
      expect(typeof ws.connect).toBe('function');
      ws.connect();
      
      expect(global.WebSocket).toHaveBeenCalled();
    });

    it('should provide sendSafe method', () => {
      const ws = new SafeWS('ws://test.com');
      ws.connect();
      
      expect(typeof ws.sendSafe).toBe('function');
    });

    it('should provide close method', () => {
      const ws = new SafeWS('ws://test.com');
      
      expect(typeof ws.close).toBe('function');
      ws.close();
    });

    it('should provide getState method', () => {
      const ws = new SafeWS('ws://test.com');
      
      expect(typeof ws.getState).toBe('function');
      const state = ws.getState();
      expect(['idle', 'connecting', 'open', 'closed', 'error']).toContain(state);
    });

    it('should provide isReady method', () => {
      const ws = new SafeWS('ws://test.com');
      
      expect(typeof ws.isReady).toBe('function');
      const ready = ws.isReady();
      expect(typeof ready).toBe('boolean');
    });
  });

  describe('Error Prevention', () => {
    it('should not throw on sendSafe when connection is not ready', () => {
      const ws = new SafeWS('ws://test.com');
      
      expect(() => ws.sendSafe('test message')).not.toThrow();
    });

    it('should not throw on close when already closed', () => {
      const ws = new SafeWS('ws://test.com');
      ws.close();
      
      expect(() => ws.close()).not.toThrow();
    });

    it('should handle WebSocket creation errors', () => {
      global.WebSocket = vi.fn(() => {
        throw new Error('WebSocket creation failed');
      });

      const ws = new SafeWS('ws://test.com');
      
      expect(() => ws.connect()).not.toThrow();
    });
  });

  describe('State Management', () => {
    it('should start in idle state', () => {
      const ws = new SafeWS('ws://test.com');
      
      expect(ws.getState()).toBe('idle');
    });

    it('should transition to connecting on connect', () => {
      const ws = new SafeWS('ws://test.com');
      ws.connect();
      
      const state = ws.getState();
      expect(['connecting', 'open']).toContain(state);
    });
  });
});