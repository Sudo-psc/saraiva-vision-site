import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../instagram/posts.js';

// Mock environment variables
const mockEnv = {
  INSTAGRAM_ACCESS_TOKEN: 'mock_access_token'
};

describe('/api/instagram/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    Object.assign(process.env, mockEnv);
    
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.INSTAGRAM_ACCESS_TOKEN;
  });

  it('should handle GET request successfully', async () => {
    const mockInstagramResponse = {
      data: [
        {
          id: '1',
          caption: 'Test post 1',
          media_type: 'IMAGE',
          media_url: 'https://example.com/image1.jpg',
          permalink: 'https://instagram.com/p/test1',
          timestamp: '2024-01-01T12:00:00Z',
          username: 'saraivavision'
        },
        {
          id: '2',
          caption: 'Test post 2',
          media_type: 'IMAGE',
          media_url: 'https://example.com/image2.jpg',
          permalink: 'https://instagram.com/p/test2',
          timestamp: '2024-01-02T12:00:00Z',
          username: 'saraivavision'
        }
      ]
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInstagramResponse
    });

    const { req, res } = createMocks({
      method: 'GET',
      query: { limit: '2' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.success).toBe(true);
    expect(responseData.data).toHaveLength(2);
    expect(responseData.data[0].id).toBe('1');
    expect(responseData.data[1].id).toBe('2');
    expect(responseData.cached).toBe(false);
  });

  it('should return fallback posts when access token is not configured', async () => {
    delete process.env.INSTAGRAM_ACCESS_TOKEN;

    const { req, res } = createMocks({
      method: 'GET',
      query: { limit: '4' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.error).toBe('Instagram access token not configured');
    expect(responseData.fallback).toHaveLength(4);
    expect(responseData.fallback[0].fallback).toBe(true);
  });

  it('should handle Instagram API errors gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          message: 'Invalid access token'
        }
      })
    });

    const { req, res } = createMocks({
      method: 'GET',
      query: { limit: '4' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.error).toBe('Failed to fetch Instagram posts');
    expect(responseData.fallback).toHaveLength(4);
  });

  it('should validate request parameters', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { limit: '50' } // Exceeds maximum limit
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.error).toBe('Invalid request parameters');
    expect(responseData.details).toBeDefined();
  });

  it('should handle network errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { req, res } = createMocks({
      method: 'GET',
      query: { limit: '4' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.error).toBe('Failed to fetch Instagram posts');
    expect(responseData.message).toBe('Network error');
    expect(responseData.fallback).toHaveLength(4);
  });

  it('should handle OPTIONS request for CORS', async () => {
    const { req, res } = createMocks({
      method: 'OPTIONS'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
    expect(res.getHeader('Access-Control-Allow-Methods')).toBe('GET,OPTIONS');
  });

  it('should reject non-GET methods', async () => {
    const { req, res } = createMocks({
      method: 'POST'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.error).toBe('Method not allowed');
  });

  it('should transform Instagram data correctly', async () => {
    const mockInstagramResponse = {
      data: [
        {
          id: '1',
          caption: 'Original caption',
          media_type: 'IMAGE',
          media_url: 'https://example.com/image.jpg',
          permalink: 'https://instagram.com/p/test',
          timestamp: '2024-01-01T12:00:00Z'
          // Note: no username in response
        }
      ]
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInstagramResponse
    });

    const { req, res } = createMocks({
      method: 'GET',
      query: { limit: '1' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    
    expect(responseData.data[0].username).toBe('saraivavision'); // Default username
    expect(responseData.data[0].caption).toBe('Original caption');
    expect(responseData.data[0].thumbnail_url).toBe('https://example.com/image.jpg'); // Falls back to media_url
  });

  it('should use cached data when available', async () => {
    // First request - will cache data
    const mockInstagramResponse = {
      data: [
        {
          id: '1',
          caption: 'Cached post',
          media_type: 'IMAGE',
          media_url: 'https://example.com/cached.jpg',
          permalink: 'https://instagram.com/p/cached',
          timestamp: '2024-01-01T12:00:00Z'
        }
      ]
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInstagramResponse
    });

    const { req: req1, res: res1 } = createMocks({
      method: 'GET',
      query: { limit: '1' }
    });

    await handler(req1, res1);
    const firstResponse = JSON.parse(res1._getData());
    expect(firstResponse.cached).toBe(false);

    // Second request - should use cache
    const { req: req2, res: res2 } = createMocks({
      method: 'GET',
      query: { limit: '1' }
    });

    await handler(req2, res2);
    const secondResponse = JSON.parse(res2._getData());
    expect(secondResponse.cached).toBe(true);
    expect(secondResponse.cache_age).toBeGreaterThan(0);
  });
});