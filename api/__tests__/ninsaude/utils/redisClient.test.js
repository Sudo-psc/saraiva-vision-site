import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import RedisMock from 'ioredis-mock';
import {
  redisClient,
  initRedis,
  closeRedis,
  storeToken,
  getToken,
  deleteToken,
  enqueueRequest,
  dequeueRequest,
  getQueueLength,
  clearQueue,
  setWithExpiry,
  healthCheck,
} from '../../../utils/ninsaude/redisClient.js';

// Mock ioredis with ioredis-mock
vi.mock('ioredis', () => {
  return {
    default: RedisMock,
  };
});

describe('redisClient', () => {
  beforeEach(async () => {
    // Initialize Redis client before each test
    await initRedis();
  });

  afterEach(async () => {
    // Clear all data and close connection after each test
    if (redisClient) {
      await redisClient.flushall();
      await closeRedis();
    }
  });

  describe('connection management', () => {
    it('should initialize Redis connection', async () => {
      expect(redisClient).toBeDefined();
      expect(redisClient.status).toBe('ready');
    });

    it('should close Redis connection', async () => {
      await closeRedis();
      expect(redisClient.status).toBe('end');
    });

    it('should handle multiple init calls gracefully', async () => {
      await initRedis();
      await initRedis();

      expect(redisClient).toBeDefined();
      expect(redisClient.status).toBe('ready');
    });

    it('should perform health check successfully', async () => {
      const isHealthy = await healthCheck();

      expect(isHealthy).toBe(true);
    });

    it('should handle health check when disconnected', async () => {
      await closeRedis();

      const isHealthy = await healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('token storage with TTL', () => {
    it('should store token with 15 minute TTL', async () => {
      const token = 'test-access-token-123';
      const ttl = 15 * 60; // 15 minutes in seconds

      await storeToken('access_token', token, ttl);

      const stored = await redisClient.get('ninsaude:token:access_token');
      expect(stored).toBe(token);

      const actualTtl = await redisClient.ttl('ninsaude:token:access_token');
      expect(actualTtl).toBeLessThanOrEqual(ttl);
      expect(actualTtl).toBeGreaterThan(ttl - 5); // Allow small margin
    });

    it('should store refresh token with longer TTL', async () => {
      const token = 'test-refresh-token-456';
      const ttl = 30 * 24 * 60 * 60; // 30 days in seconds

      await storeToken('refresh_token', token, ttl);

      const stored = await redisClient.get('ninsaude:token:refresh_token');
      expect(stored).toBe(token);
    });

    it('should default to 15 minute TTL if not specified', async () => {
      const token = 'test-token-default';

      await storeToken('default_token', token);

      const ttl = await redisClient.ttl('ninsaude:token:default_token');
      expect(ttl).toBeLessThanOrEqual(15 * 60);
      expect(ttl).toBeGreaterThan(0);
    });

    it('should overwrite existing token', async () => {
      await storeToken('access_token', 'old-token', 900);
      await storeToken('access_token', 'new-token', 900);

      const stored = await redisClient.get('ninsaude:token:access_token');
      expect(stored).toBe('new-token');
    });
  });

  describe('token retrieval', () => {
    it('should retrieve stored token', async () => {
      await storeToken('access_token', 'test-token-789', 900);

      const token = await getToken('access_token');

      expect(token).toBe('test-token-789');
    });

    it('should return null for non-existent token', async () => {
      const token = await getToken('non_existent_token');

      expect(token).toBe(null);
    });

    it('should return null for expired token', async () => {
      // Store token with 1 second TTL
      await storeToken('short_lived_token', 'expires-soon', 1);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const token = await getToken('short_lived_token');

      expect(token).toBe(null);
    });

    it('should handle concurrent token retrievals', async () => {
      await storeToken('concurrent_token', 'concurrent-value', 900);

      const promises = Array(10)
        .fill()
        .map(() => getToken('concurrent_token'));

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result).toBe('concurrent-value');
      });
    });
  });

  describe('token deletion', () => {
    it('should delete existing token', async () => {
      await storeToken('deletable_token', 'to-be-deleted', 900);

      const deleted = await deleteToken('deletable_token');

      expect(deleted).toBe(true);

      const token = await getToken('deletable_token');
      expect(token).toBe(null);
    });

    it('should return false when deleting non-existent token', async () => {
      const deleted = await deleteToken('non_existent_token');

      expect(deleted).toBe(false);
    });
  });

  describe('queue operations', () => {
    it('should enqueue request', async () => {
      const request = {
        id: 'req-1',
        endpoint: '/appointments',
        method: 'GET',
        timestamp: Date.now(),
      };

      await enqueueRequest('api_queue', request);

      const length = await getQueueLength('api_queue');
      expect(length).toBe(1);
    });

    it('should dequeue request in FIFO order', async () => {
      const req1 = { id: 'req-1', data: 'first' };
      const req2 = { id: 'req-2', data: 'second' };
      const req3 = { id: 'req-3', data: 'third' };

      await enqueueRequest('api_queue', req1);
      await enqueueRequest('api_queue', req2);
      await enqueueRequest('api_queue', req3);

      const dequeued1 = await dequeueRequest('api_queue');
      const dequeued2 = await dequeueRequest('api_queue');
      const dequeued3 = await dequeueRequest('api_queue');

      expect(dequeued1).toEqual(req1);
      expect(dequeued2).toEqual(req2);
      expect(dequeued3).toEqual(req3);
    });

    it('should return null when dequeuing from empty queue', async () => {
      const result = await dequeueRequest('empty_queue');

      expect(result).toBe(null);
    });

    it('should get queue length correctly', async () => {
      await enqueueRequest('test_queue', { id: '1' });
      await enqueueRequest('test_queue', { id: '2' });
      await enqueueRequest('test_queue', { id: '3' });

      const length = await getQueueLength('test_queue');

      expect(length).toBe(3);
    });

    it('should clear entire queue', async () => {
      await enqueueRequest('clear_queue', { id: '1' });
      await enqueueRequest('clear_queue', { id: '2' });
      await enqueueRequest('clear_queue', { id: '3' });

      await clearQueue('clear_queue');

      const length = await getQueueLength('clear_queue');
      expect(length).toBe(0);
    });

    it('should handle concurrent queue operations', async () => {
      const requests = Array(20)
        .fill()
        .map((_, i) => ({ id: `req-${i}` }));

      await Promise.all(
        requests.map((req) => enqueueRequest('concurrent_queue', req))
      );

      const length = await getQueueLength('concurrent_queue');
      expect(length).toBe(20);

      const dequeued = [];
      for (let i = 0; i < 20; i++) {
        const item = await dequeueRequest('concurrent_queue');
        dequeued.push(item);
      }

      expect(dequeued).toHaveLength(20);
    });

    it('should serialize and deserialize complex objects', async () => {
      const complexRequest = {
        id: 'complex-1',
        nested: {
          data: {
            value: 123,
            array: [1, 2, 3],
          },
        },
        timestamp: new Date().toISOString(),
      };

      await enqueueRequest('complex_queue', complexRequest);
      const dequeued = await dequeueRequest('complex_queue');

      expect(dequeued).toEqual(complexRequest);
    });
  });

  describe('setWithExpiry', () => {
    it('should set key-value with expiry', async () => {
      await setWithExpiry('test_key', 'test_value', 60);

      const value = await redisClient.get('test_key');
      expect(value).toBe('test_value');

      const ttl = await redisClient.ttl('test_key');
      expect(ttl).toBeLessThanOrEqual(60);
      expect(ttl).toBeGreaterThan(0);
    });

    it('should handle JSON objects', async () => {
      const obj = { data: 'test', count: 42 };

      await setWithExpiry('json_key', JSON.stringify(obj), 60);

      const value = await redisClient.get('json_key');
      expect(JSON.parse(value)).toEqual(obj);
    });

    it('should overwrite existing key', async () => {
      await setWithExpiry('overwrite_key', 'old_value', 60);
      await setWithExpiry('overwrite_key', 'new_value', 60);

      const value = await redisClient.get('overwrite_key');
      expect(value).toBe('new_value');
    });
  });

  describe('connection error handling', () => {
    it('should handle connection errors gracefully', async () => {
      const errorClient = new RedisMock();

      // Simulate connection error
      errorClient.emit('error', new Error('Connection failed'));

      // Should not throw
      expect(() => errorClient.status).not.toThrow();
    });

    it('should handle operation errors', async () => {
      await closeRedis();

      // Operations on closed connection should handle errors
      await expect(storeToken('test', 'value', 900)).rejects.toThrow();
    });

    it('should handle Redis unavailability', async () => {
      await closeRedis();

      const isHealthy = await healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('namespace handling', () => {
    it('should use ninsaude namespace for tokens', async () => {
      await storeToken('access_token', 'namespaced-token', 900);

      const keys = await redisClient.keys('ninsaude:token:*');
      expect(keys).toContain('ninsaude:token:access_token');
    });

    it('should use ninsaude namespace for queues', async () => {
      await enqueueRequest('test_queue', { id: '1' });

      const keys = await redisClient.keys('ninsaude:queue:*');
      expect(keys).toContain('ninsaude:queue:test_queue');
    });

    it('should not conflict with other namespaces', async () => {
      await storeToken('access_token', 'ninsaude-token', 900);
      await redisClient.set('other:token:access_token', 'other-token');

      const ninsaudeToken = await getToken('access_token');
      const otherToken = await redisClient.get('other:token:access_token');

      expect(ninsaudeToken).toBe('ninsaude-token');
      expect(otherToken).toBe('other-token');
      expect(ninsaudeToken).not.toBe(otherToken);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', async () => {
      await storeToken('empty_token', '', 900);

      const token = await getToken('empty_token');
      expect(token).toBe('');
    });

    it('should handle very long token strings', async () => {
      const longToken = 'a'.repeat(10000);

      await storeToken('long_token', longToken, 900);

      const token = await getToken('long_token');
      expect(token).toBe(longToken);
    });

    it('should handle special characters in keys', async () => {
      await storeToken('token:with:colons', 'value', 900);

      const token = await getToken('token:with:colons');
      expect(token).toBe('value');
    });

    it('should handle zero TTL', async () => {
      await storeToken('zero_ttl', 'value', 0);

      // Key should expire immediately or very soon
      await new Promise((resolve) => setTimeout(resolve, 100));

      const token = await getToken('zero_ttl');
      expect(token).toBe(null);
    });
  });
});
