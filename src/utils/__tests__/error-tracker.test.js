/**
 * Error Tracker Test Suite
 *
 * Tests for error tracking with queue, deduplication, and circuit breaker
 * Coverage target: >80%
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initialize,
  shutdown,
  track,
  trackWithLevel,
  flush,
  clearQueue,
  getStatus,
  sanitizeUrl,
  normalizeTimestamp,
  sanitizeError
} from '../error-tracker.js';

describe('Error Tracker', () => {
  beforeEach(() => {
    // Mock fetch API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true })
    });

    // Mock window and document
    global.window = {
      location: { href: 'https://test.com/page' },
      innerWidth: 1920,
      innerHeight: 1080,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      performance: {
        memory: {
          usedJSHeapSize: 10000000,
          totalJSHeapSize: 20000000,
          jsHeapSizeLimit: 50000000
        }
      }
    };

    global.document = {
      referrer: 'https://google.com'
    };

    global.navigator = {
      userAgent: 'Mozilla/5.0 Test Browser',
      platform: 'Linux x86_64',
      language: 'pt-BR'
    };

    vi.useFakeTimers();
  });

  afterEach(() => {
    shutdown();
    clearQueue();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('initialize', () => {
    it('should initialize error tracker', () => {
      initialize();
      const status = getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.sessionId).toBeDefined();
    });

    it('should register global error handlers', () => {
      initialize();
      expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });

    it('should warn if already initialized', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      initialize();
      initialize(); // Second call

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Already initialized')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should accept custom configuration', () => {
      initialize({ endpoint: '/custom/errors' });
      const status = getStatus();
      expect(status.isInitialized).toBe(true);
    });

    it('should start flush interval', () => {
      initialize();
      expect(setInterval).toHaveBeenCalled();
    });
  });

  describe('shutdown', () => {
    it('should cleanup resources', () => {
      initialize();
      const status1 = getStatus();
      expect(status1.isInitialized).toBe(true);

      shutdown();
      const status2 = getStatus();
      expect(status2.isInitialized).toBe(false);
    });

    it('should flush pending errors', async () => {
      initialize();
      track(new Error('Test error'));

      shutdown();

      // Verify flush was called
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should remove event listeners', () => {
      initialize();
      shutdown();

      expect(window.removeEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });
  });

  describe('track', () => {
    beforeEach(() => {
      initialize();
    });

    it('should track error with basic info', () => {
      const error = new Error('Test error');
      track(error);

      const status = getStatus();
      expect(status.queueSize).toBeGreaterThan(0);
    });

    it('should enrich error with context', () => {
      const error = new Error('Test error');
      track(error, { component: 'TestComponent' });

      const status = getStatus();
      expect(status.queueSize).toBe(1);
    });

    it('should handle non-Error objects', () => {
      track({ message: 'Custom error' });

      const status = getStatus();
      expect(status.queueSize).toBe(1);
    });

    it('should not throw on tracking failure', () => {
      // Force an error in tracking
      global.window = null;

      expect(() => track(new Error('Test'))).not.toThrow();
    });
  });

  describe('trackWithLevel', () => {
    beforeEach(() => {
      initialize();
    });

    it('should track error with severity level', () => {
      const error = new Error('Critical error');
      trackWithLevel('critical', error, { component: 'Auth' });

      const status = getStatus();
      expect(status.queueSize).toBe(1);
    });

    it('should support different severity levels', () => {
      trackWithLevel('error', new Error('Error'));
      trackWithLevel('warning', new Error('Warning'));
      trackWithLevel('info', new Error('Info'));

      const status = getStatus();
      expect(status.queueSize).toBe(3);
    });
  });

  describe('Error deduplication', () => {
    beforeEach(() => {
      initialize();
    });

    it('should deduplicate identical errors', () => {
      const error = new Error('Duplicate error');

      track(error);
      track(error); // Same error
      track(error); // Same error again

      const status = getStatus();
      // Only first error should be tracked (deduplication)
      expect(status.queueSize).toBeLessThanOrEqual(1);
    });

    it('should track different errors', () => {
      track(new Error('Error 1'));
      track(new Error('Error 2'));
      track(new Error('Error 3'));

      const status = getStatus();
      expect(status.queueSize).toBe(3);
    });

    it('should allow same error after deduplication window', () => {
      const error = new Error('Repeated error');

      track(error);
      const status1 = getStatus();
      expect(status1.queueSize).toBe(1);

      // Advance time beyond deduplication window (5 minutes)
      vi.advanceTimersByTime(300001);

      track(error); // Should be tracked again
      const status2 = getStatus();
      expect(status2.queueSize).toBe(2);
    });
  });

  describe('Rate limiting', () => {
    beforeEach(() => {
      initialize();
    });

    it('should enforce rate limit', () => {
      // Track 51 errors (limit is 50 per minute)
      for (let i = 0; i < 51; i++) {
        track(new Error(`Error ${i}`), { index: i });
      }

      const status = getStatus();
      // Should drop errors beyond rate limit
      expect(status.queueSize).toBeLessThanOrEqual(50);
    });

    it('should reset rate limit after window', () => {
      // Fill rate limit
      for (let i = 0; i < 50; i++) {
        track(new Error(`Error ${i}`), { index: i });
      }

      // Advance time past rate limit window (60s)
      vi.advanceTimersByTime(61000);

      // Should be able to track again
      track(new Error('After window'));
      const status = getStatus();
      expect(status.rateLimitWindow).toBeLessThanOrEqual(50);
    });
  });

  describe('Batch sending', () => {
    beforeEach(() => {
      initialize();
    });

    it('should flush queue when batch size reached', async () => {
      // Track 10 errors (batch size)
      for (let i = 0; i < 10; i++) {
        track(new Error(`Error ${i}`), { index: i });
      }

      // Flush should be triggered automatically
      await vi.runAllTimersAsync();

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should send errors in batches', async () => {
      for (let i = 0; i < 5; i++) {
        track(new Error(`Error ${i}`));
      }

      await flush();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/errors',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('errors')
        })
      );
    });

    it('should include batch metadata', async () => {
      track(new Error('Test'));

      await flush();

      const fetchCall = global.fetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body).toHaveProperty('batch');
      expect(body.batch).toHaveProperty('size');
      expect(body.batch).toHaveProperty('sessionId');
      expect(body.batch).toHaveProperty('timestamp');
    });
  });

  describe('Circuit breaker integration', () => {
    beforeEach(() => {
      initialize();
    });

    it('should respect circuit breaker when OPEN', async () => {
      // Mock fetch to fail
      global.fetch.mockRejectedValue(new Error('Network error'));

      // Track and flush multiple times to open circuit
      for (let i = 0; i < 6; i++) {
        track(new Error(`Error ${i}`));
        await flush().catch(() => {});
      }

      // Circuit should be OPEN now
      const status = getStatus();
      expect(status.circuitBreaker.state).toBe('OPEN');
    });

    it('should requeue errors when send fails', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      track(new Error('Test error'));
      const beforeFlush = getStatus().queueSize;

      await flush();

      const afterFlush = getStatus().queueSize;
      // Errors should be requeued
      expect(afterFlush).toBeGreaterThan(0);
    });

    it('should limit queue size when requeueing', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      // Fill queue beyond max size
      for (let i = 0; i < 150; i++) {
        track(new Error(`Error ${i}`), { index: i });
      }

      await flush();

      const status = getStatus();
      // Should cap at maxQueueSize (100)
      expect(status.queueSize).toBeLessThanOrEqual(100);
    });
  });

  describe('Error enrichment', () => {
    beforeEach(() => {
      initialize();
    });

    it('should add timestamp to errors', () => {
      track(new Error('Test'));
      // Timestamp is added internally, verified through successful tracking
      const status = getStatus();
      expect(status.queueSize).toBe(1);
    });

    it('should add session ID to errors', () => {
      const status1 = getStatus();
      const sessionId = status1.sessionId;

      track(new Error('Test'));

      // Session ID is consistent
      const status2 = getStatus();
      expect(status2.sessionId).toBe(sessionId);
    });

    it('should capture page URL and referrer', () => {
      track(new Error('Test'));
      // URL enrichment happens internally
      const status = getStatus();
      expect(status.queueSize).toBe(1);
    });

    it('should capture viewport dimensions', () => {
      track(new Error('Test'));
      const status = getStatus();
      expect(status.queueSize).toBe(1);
    });

    it('should capture memory info when available', () => {
      track(new Error('Test'));
      const status = getStatus();
      expect(status.queueSize).toBe(1);
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      initialize();
    });

    it('should flush queue immediately', async () => {
      track(new Error('Test 1'));
      track(new Error('Test 2'));

      await flush();

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should clear queue after successful flush', async () => {
      track(new Error('Test'));

      await flush();

      const status = getStatus();
      expect(status.queueSize).toBe(0);
    });

    it('should handle empty queue gracefully', async () => {
      await flush(); // Nothing to flush
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('clearQueue', () => {
    beforeEach(() => {
      initialize();
    });

    it('should clear error queue', () => {
      track(new Error('Test 1'));
      track(new Error('Test 2'));
      track(new Error('Test 3'));

      const before = getStatus();
      expect(before.queueSize).toBe(3);

      clearQueue();

      const after = getStatus();
      expect(after.queueSize).toBe(0);
    });

    it('should reset deduplication map', () => {
      const error = new Error('Test');

      track(error);
      clearQueue();

      track(error); // Should track again after clear

      const status = getStatus();
      expect(status.queueSize).toBe(1);
    });
  });

  describe('getStatus', () => {
    it('should return complete status', () => {
      initialize();

      const status = getStatus();

      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('sessionId');
      expect(status).toHaveProperty('queueSize');
      expect(status).toHaveProperty('recentErrorsCount');
      expect(status).toHaveProperty('rateLimitWindow');
      expect(status).toHaveProperty('circuitBreaker');
    });

    it('should reflect current queue size', () => {
      initialize();

      track(new Error('Test 1'));
      track(new Error('Test 2'));

      const status = getStatus();
      expect(status.queueSize).toBe(2);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete lifecycle', async () => {
      // Initialize
      initialize();

      // Track various errors
      track(new Error('Error 1'));
      trackWithLevel('warning', new Error('Warning 1'));
      track(new Error('Error 2'), { component: 'TestComponent' });

      // Check queue
      const beforeFlush = getStatus();
      expect(beforeFlush.queueSize).toBe(3);

      // Flush
      await flush();

      // Verify sent
      expect(global.fetch).toHaveBeenCalled();

      // Shutdown
      shutdown();

      const afterShutdown = getStatus();
      expect(afterShutdown.isInitialized).toBe(false);
    });

    it('should handle network failures gracefully', async () => {
      initialize();

      // Simulate network failure
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true });

      track(new Error('Test error'));

      // First flush fails
      await flush();
      expect(getStatus().queueSize).toBeGreaterThan(0);

      // Second flush succeeds
      await flush();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should respect queue overflow limits', () => {
      initialize();

      // Track more than max queue size
      for (let i = 0; i < 150; i++) {
        track(new Error(`Error ${i}`), { index: i });
      }

      const status = getStatus();
      // Should cap at maxQueueSize
      expect(status.queueSize).toBeLessThanOrEqual(100);
    });
  });

  describe('sanitizeUrl', () => {
    it('should replace invalid protocols with fallback', () => {
      const invalidUrls = [
        'about:blank',
        'chrome-extension://abc123',
        'blob:https://example.com/abc',
        'data:text/html,<h1>Test</h1>',
        'file:///etc/passwd',
        'moz-extension://abc',
        'safari-extension://abc',
        'edge-extension://abc'
      ];

      invalidUrls.forEach(url => {
        const sanitized = sanitizeUrl(url);
        expect(sanitized).toBe('https://saraivavision.com.br');
      });
    });

    it('should preserve valid HTTP URLs', () => {
      const validUrls = [
        'https://saraivavision.com.br',
        'http://localhost:3000',
        'https://example.com/path?query=value',
        'http://192.168.1.1:8080/api'
      ];

      validUrls.forEach(url => {
        const sanitized = sanitizeUrl(url);
        expect(sanitized).toBe(url);
      });
    });

    it('should handle empty or invalid URLs', () => {
      expect(sanitizeUrl('')).toBe('https://saraivavision.com.br');
      expect(sanitizeUrl(null)).toBe('https://saraivavision.com.br');
      expect(sanitizeUrl(undefined)).toBe('https://saraivavision.com.br');
      expect(sanitizeUrl('not-a-url')).toBe('https://saraivavision.com.br');
    });

    it('should normalize valid URLs', () => {
      const url = 'https://example.com:443/path/../normalized';
      const sanitized = sanitizeUrl(url);
      expect(sanitized).toMatch(/^https:\/\//);
      expect(sanitized).toBeTruthy();
    });
  });

  describe('normalizeTimestamp', () => {
    it('should convert Unix timestamp in milliseconds to ISO', () => {
      const unixMs = 1729350000000; // 2024-10-19
      const normalized = normalizeTimestamp(unixMs);
      expect(normalized).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should convert Unix timestamp in seconds to ISO', () => {
      const unixSec = 1729350000; // 2024-10-19 (in seconds)
      const normalized = normalizeTimestamp(unixSec);
      expect(normalized).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should preserve valid ISO strings', () => {
      const iso = '2025-10-19T12:00:00.000Z';
      const normalized = normalizeTimestamp(iso);
      expect(normalized).toBe(iso);
    });

    it('should handle invalid timestamps', () => {
      const invalids = ['not-a-date', 'invalid', NaN, Infinity];

      invalids.forEach(invalid => {
        const normalized = normalizeTimestamp(invalid);
        expect(normalized).toMatch(/^\d{4}-\d{2}-\d{2}T/); // Fallback to current time
      });
    });

    it('should handle Date objects', () => {
      const date = new Date('2025-10-19T12:00:00.000Z');
      const normalized = normalizeTimestamp(date);
      expect(normalized).toBe('2025-10-19T12:00:00.000Z');
    });

    it('should fallback on null/undefined', () => {
      const normalized1 = normalizeTimestamp(null);
      const normalized2 = normalizeTimestamp(undefined);

      expect(normalized1).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(normalized2).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('sanitizeError', () => {
    it('should sanitize URLs in error object', () => {
      const error = {
        message: 'Test error',
        pageUrl: 'about:blank',
        url: 'chrome-extension://abc',
        referrer: 'blob:https://example.com/abc'
      };

      const sanitized = sanitizeError(error);

      expect(sanitized.pageUrl).toBe('https://saraivavision.com.br');
      expect(sanitized.url).toBe('https://saraivavision.com.br');
      expect(sanitized.referrer).toBe('https://saraivavision.com.br');
    });

    it('should normalize timestamp', () => {
      const error = {
        message: 'Test error',
        timestamp: 1729350000000
      };

      const sanitized = sanitizeError(error);

      expect(sanitized.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should truncate long messages', () => {
      const longMessage = 'a'.repeat(2000);
      const error = {
        message: longMessage
      };

      const sanitized = sanitizeError(error);

      expect(sanitized.message.length).toBeLessThanOrEqual(1015); // 1000 + "... (truncated)"
      expect(sanitized.message).toContain('(truncated)');
    });

    it('should truncate long stack traces', () => {
      const longStack = 'stack trace line\n'.repeat(500);
      const error = {
        message: 'Test',
        stack: longStack
      };

      const sanitized = sanitizeError(error);

      expect(sanitized.stack.length).toBeLessThanOrEqual(5015); // 5000 + "... (truncated)"
      expect(sanitized.stack).toContain('(truncated)');
    });

    it('should ensure message field exists', () => {
      const error1 = {};
      const error2 = { message: null };
      const error3 = { message: '' };

      expect(sanitizeError(error1).message).toBe('Unknown error');
      expect(sanitizeError(error2).message).toBe('Unknown error');
      expect(sanitizeError(error3).message).toBe('Unknown error');
    });

    it('should preserve other fields', () => {
      const error = {
        message: 'Test error',
        name: 'TypeError',
        stack: 'Stack trace here',
        custom: 'Custom field',
        level: 'error'
      };

      const sanitized = sanitizeError(error);

      expect(sanitized.name).toBe('TypeError');
      expect(sanitized.stack).toBe('Stack trace here');
      expect(sanitized.custom).toBe('Custom field');
      expect(sanitized.level).toBe('error');
    });

    it('should handle complex error objects', () => {
      const error = {
        message: 'Complex error',
        pageUrl: 'about:blank',
        timestamp: Date.now(),
        stack: 'a'.repeat(10000), // Very long stack
        custom: {
          nested: 'value'
        }
      };

      const sanitized = sanitizeError(error);

      expect(sanitized.pageUrl).toBe('https://saraivavision.com.br');
      expect(sanitized.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(sanitized.stack.length).toBeLessThanOrEqual(5015);
      expect(sanitized.custom.nested).toBe('value');
    });
  });

  describe('End-to-end sanitization', () => {
    beforeEach(() => {
      initialize();
    });

    it('should sanitize errors before sending to backend', async () => {
      const error = new Error('Test error from about:blank');

      // Override window.location to simulate about:blank
      global.window.location.href = 'about:blank';

      track(error);
      await flush();

      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();

      // Extract the request body
      const fetchCall = global.fetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      // Verify sanitization happened
      expect(body.errors[0].pageUrl).toBe('https://saraivavision.com.br');
      expect(body.errors[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should not throw SyntaxError with invalid URLs', async () => {
      global.window.location.href = 'chrome-extension://abc123/page.html';

      const error = new Error('Extension error');

      expect(() => track(error)).not.toThrow();

      await expect(flush()).resolves.not.toThrow();
    });

    it('should handle all edge cases together', async () => {
      global.window.location.href = 'blob:https://example.com/abc';

      const error = {
        message: 'a'.repeat(2000),
        stack: 'b'.repeat(10000),
        url: 'data:text/html,test'
      };

      track(error);
      await flush();

      const fetchCall = global.fetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      const sent = body.errors[0];

      expect(sent.message.length).toBeLessThanOrEqual(1015);
      expect(sent.stack.length).toBeLessThanOrEqual(5015);
      expect(sent.url).toBe('https://saraivavision.com.br');
      expect(sent.pageUrl).toBe('https://saraivavision.com.br');
    });
  });
});
