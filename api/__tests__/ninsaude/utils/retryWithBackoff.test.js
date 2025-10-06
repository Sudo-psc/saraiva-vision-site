import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryWithBackoff } from '../../../utils/ninsaude/retryWithBackoff.js';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('successful execution', () => {
    it('should execute function successfully on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should return function result without retries', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

      const promise = retryWithBackoff(mockFn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toEqual({ data: 'test' });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('exponential backoff delays', () => {
    it('should retry with 1s delay on first failure', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Wait 1000ms for retry
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockFn).toHaveBeenCalledTimes(2);

      const result = await promise;
      expect(result).toBe('success');
    });

    it('should retry with 2s delay on second failure', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);

      // First attempt
      await vi.advanceTimersByTimeAsync(0);
      expect(mockFn).toHaveBeenCalledTimes(1);

      // First retry after 1s
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockFn).toHaveBeenCalledTimes(2);

      // Second retry after 2s
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockFn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result).toBe('success');
    });

    it('should retry with 4s delay on third failure', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);

      // First attempt
      await vi.advanceTimersByTimeAsync(0);

      // First retry after 1s
      await vi.advanceTimersByTimeAsync(1000);

      // Second retry after 2s
      await vi.advanceTimersByTimeAsync(2000);

      // Third retry after 4s
      await vi.advanceTimersByTimeAsync(4000);

      expect(mockFn).toHaveBeenCalledTimes(4);
      const result = await promise;
      expect(result).toBe('success');
    });
  });

  describe('max retry attempts', () => {
    it('should respect max retry attempts (default 3)', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Always fail'));

      const promise = retryWithBackoff(mockFn).catch((err) => err);

      // Initial attempt
      await vi.advanceTimersByTimeAsync(0);

      // Retry 1 (after 1s)
      await vi.advanceTimersByTimeAsync(1000);

      // Retry 2 (after 2s)
      await vi.advanceTimersByTimeAsync(2000);

      // Retry 3 (after 4s)
      await vi.advanceTimersByTimeAsync(4000);

      // Should have attempted 4 times total (1 initial + 3 retries)
      expect(mockFn).toHaveBeenCalledTimes(4);

      // Should reject after exhausting retries
      const result = await promise;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Always fail');
    });

    it('should allow custom max retry attempts', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));
      const maxRetries = 2;

      const promise = retryWithBackoff(mockFn, maxRetries).catch((err) => err);

      // Initial + 2 retries
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);

      expect(mockFn).toHaveBeenCalledTimes(3);
      const result = await promise;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Fail');
    });

    it('should handle zero retries', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      const promise = retryWithBackoff(mockFn, 0).catch((err) => err);
      await vi.advanceTimersByTimeAsync(0);

      expect(mockFn).toHaveBeenCalledTimes(1);
      const result = await promise;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Fail');
    });
  });

  describe('successful retry after failures', () => {
    it('should succeed on second attempt', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should succeed on third attempt', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should succeed on final attempt', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      const result = await promise;
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(4);
    });
  });

  describe('exhausted retries behavior', () => {
    it('should throw original error after retries exhausted', async () => {
      const error = new Error('Network timeout');
      const mockFn = vi.fn().mockRejectedValue(error);

      const promise = retryWithBackoff(mockFn).catch((err) => err);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      const result = await promise;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Network timeout');
    });

    it('should preserve error details', async () => {
      const error = new Error('API Error');
      error.code = 'ECONNREFUSED';
      error.statusCode = 500;

      const mockFn = vi.fn().mockRejectedValue(error);

      const promise = retryWithBackoff(mockFn, 1).catch((err) => err);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('API Error');
      expect(result.code).toBe('ECONNREFUSED');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('error propagation', () => {
    it('should propagate errors correctly', async () => {
      const mockFn = vi.fn().mockRejectedValue(new TypeError('Type error'));

      const promise = retryWithBackoff(mockFn, 0).catch((err) => err);
      await vi.advanceTimersByTimeAsync(0);

      const result = await promise;
      expect(result).toBeInstanceOf(TypeError);
      expect(result.message).toBe('Type error');
    });

    it('should handle promise rejections', async () => {
      const mockFn = vi
        .fn()
        .mockImplementation(() => Promise.reject(new Error('Rejected')));

      const promise = retryWithBackoff(mockFn, 0).catch((err) => err);
      await vi.advanceTimersByTimeAsync(0);

      const result = await promise;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Rejected');
    });

    it('should handle synchronous throws', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error('Sync throw');
      });

      const promise = retryWithBackoff(mockFn, 0).catch((err) => err);
      await vi.advanceTimersByTimeAsync(0);

      const result = await promise;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Sync throw');
    });
  });

  describe('edge cases', () => {
    it('should handle function that returns null', async () => {
      const mockFn = vi.fn().mockResolvedValue(null);

      const promise = retryWithBackoff(mockFn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe(null);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle function that returns undefined', async () => {
      const mockFn = vi.fn().mockResolvedValue(undefined);

      const promise = retryWithBackoff(mockFn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe(undefined);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle negative retry attempts', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));

      const promise = retryWithBackoff(mockFn, -1).catch((err) => err);
      await vi.advanceTimersByTimeAsync(0);

      expect(mockFn).toHaveBeenCalledTimes(1);
      const result = await promise;
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Fail');
    });

    it('should calculate backoff delay correctly', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(mockFn);

      // Initial attempt
      await vi.advanceTimersByTimeAsync(0);
      const time1 = Date.now();

      // First retry (should wait 1000ms)
      await vi.advanceTimersByTimeAsync(1000);
      const time2 = Date.now();
      expect(time2 - time1).toBe(1000);

      // Second retry (should wait 2000ms)
      await vi.advanceTimersByTimeAsync(2000);
      const time3 = Date.now();
      expect(time3 - time2).toBe(2000);

      await promise;
    });
  });
});
