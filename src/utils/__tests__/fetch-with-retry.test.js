/**
 * Fetch with Retry Test Suite
 *
 * Tests for robust HTTP request handling with circuit breaker and retry logic
 * Coverage target: >80%
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CircuitBreaker,
  calculateBackoff,
  fetchWithTimeout,
  fetchJSON,
  postJSON,
  putJSON,
  deleteJSON,
  getAllCircuitBreakerStatus,
  resetCircuitBreaker,
  resetAllCircuitBreakers
} from '../fetch-with-retry.js';

describe('calculateBackoff', () => {
  it('should calculate exponential backoff', () => {
    expect(calculateBackoff(0, 1000, 30000)).toBeGreaterThanOrEqual(750);
    expect(calculateBackoff(0, 1000, 30000)).toBeLessThanOrEqual(1250);

    expect(calculateBackoff(1, 1000, 30000)).toBeGreaterThanOrEqual(1500);
    expect(calculateBackoff(1, 1000, 30000)).toBeLessThanOrEqual(2500);
  });

  it('should respect max delay cap', () => {
    const delay = calculateBackoff(10, 1000, 5000);
    expect(delay).toBeLessThanOrEqual(6250); // 5000 + 25% jitter
  });

  it('should add jitter to prevent thundering herd', () => {
    const delays = Array.from({ length: 10 }, () => calculateBackoff(2, 1000, 30000));
    const uniqueDelays = new Set(delays);
    // With jitter, we should have different values
    expect(uniqueDelays.size).toBeGreaterThan(1);
  });

  it('should handle edge cases', () => {
    expect(calculateBackoff(0, 100, 1000)).toBeGreaterThan(0);
    expect(calculateBackoff(20, 1000, 30000)).toBeLessThanOrEqual(37500);
  });
});

describe('CircuitBreaker', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      monitoringPeriod: 500
    });
  });

  afterEach(() => {
    breaker.destroy();
  });

  describe('State transitions', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.canRequest()).toBe(true);
      expect(breaker.getStatus().state).toBe('CLOSED');
    });

    it('should transition to OPEN after threshold failures', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.getStatus().state).toBe('CLOSED');

      breaker.recordFailure(); // Third failure
      expect(breaker.getStatus().state).toBe('OPEN');
      expect(breaker.canRequest()).toBe(false);
    });

    it('should transition to HALF_OPEN after timeout', async () => {
      // Force OPEN state
      breaker.recordFailure();
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.getStatus().state).toBe('OPEN');

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(breaker.canRequest()).toBe(true);
      expect(breaker.getStatus().state).toBe('HALF_OPEN');
    });

    it('should transition from HALF_OPEN to CLOSED after successes', () => {
      // Force HALF_OPEN state
      breaker.state = 'HALF_OPEN';

      breaker.recordSuccess();
      expect(breaker.getStatus().state).toBe('HALF_OPEN');

      breaker.recordSuccess(); // Second success
      expect(breaker.getStatus().state).toBe('CLOSED');
    });

    it('should transition from HALF_OPEN to OPEN on failure', () => {
      // Force HALF_OPEN state
      breaker.state = 'HALF_OPEN';

      breaker.recordFailure();
      expect(breaker.getStatus().state).toBe('OPEN');
    });
  });

  describe('Success handling', () => {
    it('should reset failure count on success', () => {
      breaker.recordFailure();
      breaker.recordFailure();
      expect(breaker.getStatus().failures).toBe(2);

      breaker.recordSuccess();
      expect(breaker.getStatus().failures).toBe(0);
    });
  });

  describe('Status reporting', () => {
    it('should report complete status', () => {
      const status = breaker.getStatus();
      expect(status).toHaveProperty('state');
      expect(status).toHaveProperty('failures');
      expect(status).toHaveProperty('successes');
      expect(status).toHaveProperty('nextAttempt');
      expect(status).toHaveProperty('canRequest');
    });
  });
});

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    global.AbortController = class {
      signal = {};
      abort() {
        this.signal.aborted = true;
      }
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch successfully within timeout', async () => {
    const mockResponse = { ok: true, data: 'test' };
    global.fetch.mockResolvedValue(mockResponse);

    const response = await fetchWithTimeout('https://api.test.com/data', {}, 5000);
    expect(response).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('https://api.test.com/data', expect.objectContaining({
      signal: expect.any(Object)
    }));
  });

  it('should throw timeout error when request exceeds timeout', async () => {
    global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    await expect(
      fetchWithTimeout('https://api.test.com/slow', {}, 50)
    ).rejects.toThrow('Request timeout');
  });

  it('should propagate fetch errors', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    await expect(
      fetchWithTimeout('https://api.test.com/error', {}, 5000)
    ).rejects.toThrow('Network error');
  });
});

describe('fetchJSON', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    global.AbortController = class {
      signal = {};
      abort() {}
    };
    resetAllCircuitBreakers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetAllCircuitBreakers();
  });

  describe('Successful requests', () => {
    it('should fetch and parse JSON successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['Content-Type', 'application/json']]),
        clone: () => ({
          text: () => Promise.resolve(JSON.stringify(mockData))
        }),
        text: () => Promise.resolve(JSON.stringify(mockData))
      });

      const data = await fetchJSON('https://api.test.com/data');
      expect(data).toEqual(mockData);
    });

    it('should handle 204 No Content response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Map(),
        clone: () => ({}),
        text: () => Promise.resolve('')
      });

      const data = await fetchJSON('https://api.test.com/delete');
      expect(data).toBeNull();
    });

    it('should handle empty response body', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['Content-Type', 'application/json']]),
        clone: () => ({
          text: () => Promise.resolve('')
        }),
        text: () => Promise.resolve('')
      });

      const data = await fetchJSON('https://api.test.com/empty');
      expect(data).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should throw on HTTP error status', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map()
      });

      await expect(
        fetchJSON('https://api.test.com/notfound', {}, { retries: 0 })
      ).rejects.toThrow('HTTP 404: Not Found');
    });

    it('should throw on JSON parse error', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['Content-Type', 'application/json']]),
        clone: () => ({
          text: () => Promise.resolve('invalid json')
        }),
        text: () => Promise.resolve('invalid json')
      });

      await expect(
        fetchJSON('https://api.test.com/bad-json', {}, { retries: 0 })
      ).rejects.toThrow('JSON parse failed');
    });

    it('should warn about wrong Content-Type', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['Content-Type', 'text/html']]),
        clone: () => ({
          text: () => Promise.resolve('{"data": "test"}')
        }),
        text: () => Promise.resolve('{"data": "test"}')
      });

      await fetchJSON('https://api.test.com/html');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Expected JSON, got Content-Type: text/html')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Retry logic', () => {
    it('should retry on failure', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map([['Content-Type', 'application/json']]),
          clone: () => ({
            text: () => Promise.resolve('{"success": true}')
          }),
          text: () => Promise.resolve('{"success": true}')
        });

      const data = await fetchJSON('https://api.test.com/retry', {}, {
        retries: 3,
        baseDelay: 10,
        maxDelay: 100
      });

      expect(data).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(
        fetchJSON('https://api.test.com/always-fail', {}, {
          retries: 2,
          baseDelay: 10,
          maxDelay: 100
        })
      ).rejects.toThrow('fetchJSON failed after 3 attempts');

      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Circuit breaker integration', () => {
    it('should respect circuit breaker OPEN state', async () => {
      // Force circuit breaker to OPEN
      const url = 'https://api.test.com/circuit';
      global.fetch.mockRejectedValue(new Error('Network error'));

      // Make it fail multiple times to open circuit
      for (let i = 0; i < 5; i++) {
        try {
          await fetchJSON(url, {}, { retries: 0 });
        } catch (e) {
          // Expected to fail
        }
      }

      // Circuit should now be OPEN
      await expect(
        fetchJSON(url, {}, { circuitBreaker: true })
      ).rejects.toThrow('Circuit breaker is OPEN');
    });

    it('should allow request when circuit breaker disabled', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['Content-Type', 'application/json']]),
        clone: () => ({
          text: () => Promise.resolve('{"data": "test"}')
        }),
        text: () => Promise.resolve('{"data": "test"}')
      });

      const data = await fetchJSON('https://api.test.com/no-cb', {}, {
        circuitBreaker: false
      });

      expect(data).toEqual({ data: 'test' });
    });
  });
});

describe('HTTP method helpers', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    global.AbortController = class {
      signal = {};
      abort() {}
    };
    resetAllCircuitBreakers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetAllCircuitBreakers();
  });

  describe('postJSON', () => {
    it('should send POST request with JSON body', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Map([['Content-Type', 'application/json']]),
        clone: () => ({
          text: () => Promise.resolve('{"id": 123}')
        }),
        text: () => Promise.resolve('{"id": 123}')
      });

      const data = await postJSON('https://api.test.com/users', { name: 'Test' });

      expect(data).toEqual({ id: 123 });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('users'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ name: 'Test' })
        })
      );
    });
  });

  describe('putJSON', () => {
    it('should send PUT request with JSON body', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['Content-Type', 'application/json']]),
        clone: () => ({
          text: () => Promise.resolve('{"updated": true}')
        }),
        text: () => Promise.resolve('{"updated": true}')
      });

      const data = await putJSON('https://api.test.com/users/123', { name: 'Updated' });

      expect(data).toEqual({ updated: true });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });
  });

  describe('deleteJSON', () => {
    it('should send DELETE request', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Map(),
        clone: () => ({}),
        text: () => Promise.resolve('')
      });

      const data = await deleteJSON('https://api.test.com/users/123');

      expect(data).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });
});

describe('Circuit breaker management', () => {
  beforeEach(() => {
    resetAllCircuitBreakers();
  });

  it('should get all circuit breaker statuses', () => {
    const status = getAllCircuitBreakerStatus();
    expect(typeof status).toBe('object');
  });

  it('should reset specific circuit breaker', () => {
    resetCircuitBreaker('https://api.test.com/users');
    const status = getAllCircuitBreakerStatus();
    expect(status['https://api.test.com/users']).toBeUndefined();
  });

  it('should reset all circuit breakers', () => {
    resetAllCircuitBreakers();
    const status = getAllCircuitBreakerStatus();
    expect(Object.keys(status).length).toBe(0);
  });
});

describe('Integration tests', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    global.AbortController = class {
      signal = {};
      abort() {}
    };
    resetAllCircuitBreakers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetAllCircuitBreakers();
  });

  it('should handle complete request lifecycle with retry and circuit breaker', async () => {
    let callCount = 0;
    global.fetch.mockImplementation(() => {
      callCount++;
      if (callCount < 2) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Map([['Content-Type', 'application/json']]),
        clone: () => ({
          text: () => Promise.resolve('{"success": true}')
        }),
        text: () => Promise.resolve('{"success": true}')
      });
    });

    const data = await fetchJSON('https://api.test.com/lifecycle', {}, {
      retries: 3,
      baseDelay: 10,
      circuitBreaker: true
    });

    expect(data).toEqual({ success: true });
    expect(callCount).toBe(2);
  });
});
