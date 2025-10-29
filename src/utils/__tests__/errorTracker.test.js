import { vi, describe, beforeEach, it, expect, afterEach } from 'vitest';
import { errorTracker, trackError, trackNetworkError, trackComponentError } from '../errorTracker.js';

// Capture original console before mocking
const originalConsole = global.console;

// Mock console methods
const mockConsole = {
  groupCollapsed: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
  groupEnd: vi.fn(),
  debug: vi.fn()
};

beforeEach(() => {
  vi.clearAllMocks();
  global.console = mockConsole;
});

afterEach(() => {
  // Restore console
  global.console = originalConsole;
});

describe('ErrorTracker', () => {
  beforeEach(() => {
    errorTracker.clear();
  });

  describe('error hashing', () => {
    it('should generate consistent hashes for same error', () => {
      const error1 = new Error('Test error');
      const error2 = new Error('Test error');

      // Remove stack to ensure consistency
      error1.stack = 'Error: Test error';
      error2.stack = 'Error: Test error';

      const hash1 = errorTracker.generateErrorHash(error1);
      const hash2 = errorTracker.generateErrorHash(error2);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different errors', () => {
      const error1 = new Error('Test error 1');
      const error2 = new Error('Test error 2');

      const hash1 = errorTracker.generateErrorHash(error1);
      const hash2 = errorTracker.generateErrorHash(error2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle errors without stack traces', () => {
      const error = new Error('Test error');
      error.stack = undefined;

      const hash = errorTracker.generateErrorHash(error);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('error logging frequency', () => {
    beforeEach(() => {
      // Mock timers
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should log new errors immediately', () => {
      const error = new Error('Test error');

      const shouldLog = errorTracker.shouldLogError(error, 'test');

      expect(shouldLog).toBe(true);
    });

    it('should debounce repeated errors', () => {
      const error = new Error('Test error');

      // First time should log
      expect(errorTracker.shouldLogError(error, 'test')).toBe(true);

      // Second time immediately should not log
      expect(errorTracker.shouldLogError(error, 'test')).toBe(false);

      // Advance timer past debounce period
      vi.advanceTimersByTime(6000);

      // Should log again after debounce
      expect(errorTracker.shouldLogError(error, 'test')).toBe(true);
    });

    it('should log every 10th occurrence', () => {
      const error = new Error('Test error');

      // First occurrence logs (count = 1, new error)
      expect(errorTracker.shouldLogError(error, 'test')).toBe(true);

      // Next 9 occurrences don't log (count 2-10, none are % 10 === 0)
      for (let i = 0; i < 9; i++) {
        expect(errorTracker.shouldLogError(error, 'test')).toBe(false);
      }

      // 11th occurrence should log (count = 10, 10 % 10 === 0)
      expect(errorTracker.shouldLogError(error, 'test')).toBe(true);
    });

    it('should handle different categories separately', () => {
      const error = new Error('Test error');

      // Log in network category
      expect(errorTracker.shouldLogError(error, 'network')).toBe(true);

      // Same error in different category should log
      expect(errorTracker.shouldLogError(error, 'component')).toBe(true);

      // Same error in same category should not log
      expect(errorTracker.shouldLogError(error, 'network')).toBe(false);
    });
  });

  describe('error tracking', () => {
    beforeEach(() => {
      // Mock window and navigator
      global.window = {
        navigator: { onLine: true }
      };
    });

    afterEach(() => {
      delete global.window;
    });

    it('should track error with context', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', userId: 123 };

      errorTracker.trackError(error, context, 'test-category');

      expect(console.groupCollapsed).toHaveBeenCalledWith(
        '🚨 [TEST-CATEGORY] Test error (#1)'
      );
      expect(console.error).toHaveBeenCalledWith('Error:', error);
      expect(console.error).toHaveBeenCalledWith('Context:', context);
    });

    it('should not track debounced errors', () => {
      const error = new Error('Test error');

      // First call
      errorTracker.trackError(error, {}, 'test');
      expect(console.groupCollapsed).toHaveBeenCalledTimes(1);

      // Second call (debounced)
      errorTracker.trackError(error, {}, 'test');
      expect(console.groupCollapsed).toHaveBeenCalledTimes(1);
    });

    it('should send to monitoring service when online', () => {
      // Save original NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      const context = { component: 'TestComponent' };

      errorTracker.trackError(error, context, 'test');

      expect(console.debug).toHaveBeenCalledWith(
        'Would send to monitoring:',
        expect.objectContaining({
          error: 'Test error',
          category: 'test',
          userAgent: expect.any(String),
          url: expect.any(String)
        })
      );

      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });

    it('should not send to monitoring service when offline', () => {
      global.window.navigator.onLine = false;

      const error = new Error('Test error');
      errorTracker.trackError(error, {}, 'test');

      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('specialized tracking methods', () => {
    it('should track network errors with proper context', () => {
      const error = new Error('Network error');
      const url = 'https://api.example.com/data';
      const status = 500;

      trackNetworkError(url, status, error);

      expect(console.groupCollapsed).toHaveBeenCalledWith(
        '🚨 [NETWORK] Network error (#1)'
      );
      expect(console.error).toHaveBeenCalledWith('Error:', error);
      expect(console.error).toHaveBeenCalledWith('Context:', expect.objectContaining({
        url,
        status,
        method: 'GET'
      }));
    });

    it('should track component errors with proper context', () => {
      const error = new Error('Component error');
      const componentName = 'TestComponent';
      const componentStack = 'at TestComponent\n  at ParentComponent';

      trackComponentError(componentName, error, componentStack);

      expect(console.groupCollapsed).toHaveBeenCalledWith(
        '🚨 [COMPONENT] Component error (#1)'
      );
      expect(console.error).toHaveBeenCalledWith('Error:', error);
      expect(console.error).toHaveBeenCalledWith('Context:', expect.objectContaining({
        componentName,
        componentStack
      }));
    });
  });

  describe('error statistics', () => {
    it('should return correct statistics', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      // Track multiple errors
      trackError(error1, {}, 'category1');
      trackError(error2, {}, 'category2');
      trackError(error1, {}, 'category1'); // Duplicate

      const stats = errorTracker.getErrorStats();

      expect(stats.uniqueErrors).toBe(2);
      expect(stats.totalErrors).toBe(3);
      expect(stats.topErrors).toHaveLength(2);
    });

    it('should return empty statistics when no errors tracked', () => {
      const stats = errorTracker.getErrorStats();

      expect(stats.uniqueErrors).toBe(0);
      expect(stats.totalErrors).toBe(0);
      expect(stats.topErrors).toHaveLength(0);
    });
  });

  describe('clear functionality', () => {
    it('should clear all tracking data', () => {
      const error = new Error('Test error');

      trackError(error, {}, 'test');

      expect(errorTracker.getErrorStats().uniqueErrors).toBe(1);

      errorTracker.clear();

      expect(errorTracker.getErrorStats().uniqueErrors).toBe(0);
      expect(errorTracker.getErrorStats().totalErrors).toBe(0);
    });

    it('should clear debounce timers', () => {
      vi.useFakeTimers();

      const error = new Error('Test error');

      trackError(error, {}, 'test');
      trackError(error, {}, 'test');

      expect(errorTracker.debounceTimers.size).toBe(1);

      errorTracker.clear();

      expect(errorTracker.debounceTimers.size).toBe(0);

      vi.useRealTimers();
    });
  });
});

describe('convenience functions', () => {
  beforeEach(() => {
    errorTracker.clear();
  });

  it('should export trackError function', () => {
    const error = new Error('Test error');

    trackError(error, {}, 'test');

    expect(console.groupCollapsed).toHaveBeenCalled();
  });

  it('should export trackNetworkError function', () => {
    const error = new Error('Network error');

    trackNetworkError('https://example.com', 500, error);

    expect(console.groupCollapsed).toHaveBeenCalledWith(
      expect.stringContaining('NETWORK')
    );
  });

  it('should export trackComponentError function', () => {
    const error = new Error('Component error');

    trackComponentError('TestComponent', error, 'stack trace');

    expect(console.groupCollapsed).toHaveBeenCalledWith(
      expect.stringContaining('COMPONENT')
    );
  });
});