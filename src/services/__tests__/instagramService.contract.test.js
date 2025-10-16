import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InstagramService } from '@/services/instagramService.js';

describe('InstagramService contract', () => {
  let service;
  const originalFetch = global.fetch;
  const originalWebSocket = global.WebSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
    global.WebSocket = { OPEN: 1 };
    window.WebSocket = global.WebSocket;
    service = new InstagramService();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
    global.fetch = originalFetch;
    global.WebSocket = originalWebSocket;
    if (originalWebSocket) {
      window.WebSocket = originalWebSocket;
    } else {
      delete window.WebSocket;
    }
  });

  it('maps Instagram posts response with rate limit headers', async () => {
    const headers = new Map([
      ['x-ratelimit-limit', '200'],
      ['x-ratelimit-remaining', '199'],
      ['x-ratelimit-reset', '1700000000']
    ]);
    const payload = {
      success: true,
      data: [{ id: '1', caption: 'hello' }],
      cached: true,
      cache_age: 42,
      total: 1,
      stats_included: true
    };
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
      headers: {
        get: (key) => headers.get(key)
      }
    });

    const result = await service.fetchPosts({ limit: 2 });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts?'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(result.success).toBe(true);
    expect(result.posts).toEqual(payload.data);
    expect(result.rateLimitInfo).toEqual({
      limit: '200',
      remaining: '199',
      reset: '1700000000'
    });
    expect(result.cacheAge).toBe(42);
  });

  it('throws a descriptive error when Instagram API rate limits', async () => {
    const payload = { message: 'Too many requests', retryAfter: 120 };
    global.fetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => payload,
      headers: {
        get: () => null
      }
    });

    await expect(service.fetchPosts()).rejects.toThrow(/Rate limit exceeded/);
  });

  it('subscribes to stats via WebSocket using expected contract', () => {
    const callback = vi.fn();
    const socketStub = {
      readyState: 1,
      send: vi.fn(),
      addEventListener: vi.fn(),
      connect: vi.fn(),
      close: vi.fn(),
      sendSafe: vi.fn(),
      isReady: vi.fn(() => true),
      getState: vi.fn(() => 'open')
    };
    service.initializeWebSocket = vi.fn(() => {
      service.websocket = socketStub;
    });

    const unsubscribe = service.subscribeToStats(['abc123'], callback, { interval: 10000 });

    expect(service.initializeWebSocket).toHaveBeenCalled();
    expect(socketStub.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'subscribe', postIds: ['abc123'], interval: 10000 })
    );

    const update = {
      type: 'stats_update',
      postId: 'abc123',
      stats: { likes: 10 },
      timestamp: '2024-01-01T00:00:00Z'
    };
    service.handleWebSocketMessage(update);
    expect(callback).toHaveBeenCalledWith({
      postId: 'abc123',
      stats: { likes: 10 },
      timestamp: '2024-01-01T00:00:00Z',
      realtime: true
    });

    unsubscribe();
    expect(socketStub.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'unsubscribe', postIds: ['abc123'] })
    );
  });
});
