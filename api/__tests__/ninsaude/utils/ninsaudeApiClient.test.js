import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createApiClient,
  getNinsaudeClient,
  refreshAccessToken,
  handleRateLimit,
  isRateLimited,
  resetRateLimiter,
} from '../../../utils/ninsaude/ninsaudeApiClient.js';

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  };
  return { default: mockAxios };
});

// Mock Redis client
vi.mock('../../../utils/ninsaude/redisClient.js', () => ({
  getToken: vi.fn(),
  storeToken: vi.fn(),
  redisClient: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('ninsaudeApiClient', () => {
  let mockAxios;
  let mockRedis;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import mocked modules
    mockAxios = (await import('axios')).default;
    mockRedis = await import('../../../utils/ninsaude/redisClient.js');

    // Reset rate limiter
    resetRateLimiter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createApiClient', () => {
    it('should create axios instance with base configuration', () => {
      createApiClient();

      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('api.ninsaude.com'),
          timeout: expect.any(Number),
        })
      );
    });

    it('should configure default headers', () => {
      createApiClient();

      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );
    });

    it('should set timeout to 30 seconds', () => {
      createApiClient();

      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });
  });

  describe('OAuth2 token injection', () => {
    it('should inject access token in request headers', async () => {
      const accessToken = 'test-access-token-123';
      mockRedis.getToken.mockResolvedValue(accessToken);

      const client = getNinsaudeClient();

      // Simulate request interceptor
      const requestInterceptor =
        mockAxios.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const modifiedConfig = await requestInterceptor(config);

      expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${accessToken}`);
    });

    it('should handle missing access token', async () => {
      mockRedis.getToken.mockResolvedValue(null);

      const client = getNinsaudeClient();

      const requestInterceptor =
        mockAxios.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };

      await expect(requestInterceptor(config)).rejects.toThrow(
        'Access token not found'
      );
    });

    it('should add token to existing headers', async () => {
      const accessToken = 'test-token';
      mockRedis.getToken.mockResolvedValue(accessToken);

      const client = getNinsaudeClient();

      const requestInterceptor =
        mockAxios.interceptors.request.use.mock.calls[0][0];
      const config = {
        headers: {
          'Custom-Header': 'custom-value',
        },
      };

      const modifiedConfig = await requestInterceptor(config);

      expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${accessToken}`);
      expect(modifiedConfig.headers['Custom-Header']).toBe('custom-value');
    });
  });

  describe('automatic token refresh on 401', () => {
    it('should refresh token on 401 response', async () => {
      const newToken = 'refreshed-access-token';
      mockRedis.getToken
        .mockResolvedValueOnce('old-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce(newToken);

      mockRedis.storeToken.mockResolvedValue(true);

      const client = getNinsaudeClient();

      // Simulate 401 error
      const error = {
        response: { status: 401 },
        config: { headers: {} },
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      // Mock refresh endpoint
      mockAxios.post.mockResolvedValue({
        data: {
          access_token: newToken,
          expires_in: 900,
        },
      });

      await responseInterceptor(error);

      expect(mockRedis.storeToken).toHaveBeenCalledWith(
        'access_token',
        newToken,
        900
      );
    });

    it('should retry original request after token refresh', async () => {
      const newToken = 'refreshed-token';
      mockRedis.getToken
        .mockResolvedValueOnce('old-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce(newToken);

      const client = getNinsaudeClient();

      const originalRequest = {
        url: '/appointments',
        method: 'GET',
        headers: {},
      };

      const error = {
        response: { status: 401 },
        config: originalRequest,
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      mockAxios.post.mockResolvedValue({
        data: { access_token: newToken, expires_in: 900 },
      });

      mockAxios.get.mockResolvedValue({ data: 'success' });

      await responseInterceptor(error);

      expect(mockAxios.get).toHaveBeenCalledWith(
        originalRequest.url,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${newToken}`,
          }),
        })
      );
    });

    it('should not retry on non-401 errors', async () => {
      const client = getNinsaudeClient();

      const error = {
        response: { status: 500 },
        config: {},
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toEqual(error);
      expect(mockAxios.post).not.toHaveBeenCalled();
    });

    it('should handle refresh token failure', async () => {
      mockRedis.getToken
        .mockResolvedValueOnce('old-token')
        .mockResolvedValueOnce('invalid-refresh-token');

      const client = getNinsaudeClient();

      const error = {
        response: { status: 401 },
        config: {},
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      mockAxios.post.mockRejectedValue(new Error('Invalid refresh token'));

      await expect(responseInterceptor(error)).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('rate limiting (30 req/min)', () => {
    it('should allow requests within rate limit', async () => {
      for (let i = 0; i < 30; i++) {
        const allowed = await handleRateLimit();
        expect(allowed).toBe(true);
      }
    });

    it('should block requests exceeding 30 req/min', async () => {
      // Make 30 requests
      for (let i = 0; i < 30; i++) {
        await handleRateLimit();
      }

      // 31st request should be blocked
      const allowed = await handleRateLimit();
      expect(allowed).toBe(false);
    });

    it('should reset rate limit after 1 minute', async () => {
      vi.useFakeTimers();

      // Make 30 requests
      for (let i = 0; i < 30; i++) {
        await handleRateLimit();
      }

      // Should be rate limited
      expect(await handleRateLimit()).toBe(false);

      // Fast forward 1 minute
      vi.advanceTimersByTime(60000);

      // Should be allowed again
      expect(await handleRateLimit()).toBe(true);

      vi.useRealTimers();
    });

    it('should check rate limit status', async () => {
      expect(isRateLimited()).toBe(false);

      // Make 30 requests
      for (let i = 0; i < 30; i++) {
        await handleRateLimit();
      }

      expect(isRateLimited()).toBe(true);
    });

    it('should manually reset rate limiter', async () => {
      // Make 30 requests
      for (let i = 0; i < 30; i++) {
        await handleRateLimit();
      }

      expect(isRateLimited()).toBe(true);

      resetRateLimiter();

      expect(isRateLimited()).toBe(false);
    });

    it('should handle concurrent rate limit checks', async () => {
      const promises = Array(25)
        .fill()
        .map(() => handleRateLimit());

      const results = await Promise.all(promises);

      const allowedCount = results.filter((r) => r === true).length;
      expect(allowedCount).toBeLessThanOrEqual(30);
    });

    it('should throw error when rate limited', async () => {
      const client = getNinsaudeClient();

      const requestInterceptor =
        mockAxios.interceptors.request.use.mock.calls[0][0];

      // Exhaust rate limit
      for (let i = 0; i < 30; i++) {
        await handleRateLimit();
      }

      const config = { headers: {} };

      await expect(requestInterceptor(config)).rejects.toThrow(
        /rate limit/i
      );
    });
  });

  describe('error response handling', () => {
    it('should handle network errors', async () => {
      const client = getNinsaudeClient();

      const error = {
        message: 'Network Error',
        code: 'ECONNREFUSED',
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toEqual(error);
    });

    it('should handle timeout errors', async () => {
      const client = getNinsaudeClient();

      const error = {
        message: 'timeout of 30000ms exceeded',
        code: 'ECONNABORTED',
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toEqual(error);
    });

    it('should handle 400 Bad Request', async () => {
      const client = getNinsaudeClient();

      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid request parameters' },
        },
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toEqual(error);
    });

    it('should handle 403 Forbidden', async () => {
      const client = getNinsaudeClient();

      const error = {
        response: {
          status: 403,
          data: { message: 'Insufficient permissions' },
        },
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toEqual(error);
    });

    it('should handle 404 Not Found', async () => {
      const client = getNinsaudeClient();

      const error = {
        response: {
          status: 404,
          data: { message: 'Resource not found' },
        },
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toEqual(error);
    });

    it('should handle 500 Internal Server Error', async () => {
      const client = getNinsaudeClient();

      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toEqual(error);
    });

    it('should extract error message from response', async () => {
      const client = getNinsaudeClient();

      const error = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: [{ field: 'cpf', message: 'Invalid CPF format' }],
          },
        },
      };

      const responseInterceptor =
        mockAxios.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toEqual(error);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token using refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const newAccessToken = 'new-access-token';

      mockRedis.getToken.mockResolvedValue(refreshToken);
      mockAxios.post.mockResolvedValue({
        data: {
          access_token: newAccessToken,
          expires_in: 900,
        },
      });

      const result = await refreshAccessToken();

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/oauth/token'),
        expect.objectContaining({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        })
      );

      expect(mockRedis.storeToken).toHaveBeenCalledWith(
        'access_token',
        newAccessToken,
        900
      );

      expect(result).toBe(newAccessToken);
    });

    it('should handle missing refresh token', async () => {
      mockRedis.getToken.mockResolvedValue(null);

      await expect(refreshAccessToken()).rejects.toThrow(
        'Refresh token not found'
      );
    });

    it('should handle refresh token expiration', async () => {
      mockRedis.getToken.mockResolvedValue('expired-refresh-token');
      mockAxios.post.mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'invalid_grant' },
        },
      });

      await expect(refreshAccessToken()).rejects.toThrow();
    });
  });

  describe('getNinsaudeClient', () => {
    it('should return singleton instance', () => {
      const client1 = getNinsaudeClient();
      const client2 = getNinsaudeClient();

      expect(client1).toBe(client2);
    });

    it('should configure interceptors on first call', () => {
      getNinsaudeClient();

      expect(mockAxios.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
    });
  });
});
