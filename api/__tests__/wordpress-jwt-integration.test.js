/**
 * WordPress JWT Authentication Integration Test Suite
 * Tests authenticated flows, error handling, and token renewal
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WordPressJWTAuthService from '../../services/WordPressJWTAuthService.js';
import WordPressBlogService from '../../services/WordPressBlogService.js';
import { renderHook, act } from '@testing-library/react';
import { useWordPressAuth } from '../../contexts/WordPressAuthContext.jsx';

// Mock environment variables
const mockEnv = {
  VITE_WORDPRESS_JWT_USERNAME: 'test_user',
  VITE_WORDPRESS_JWT_PASSWORD: 'test_pass'
};

// Mock fetch for API calls
global.fetch = vi.fn();

describe('WordPress JWT Authentication Integration', () => {
  let jwtService;
  let blogService;

  beforeEach(() => {
    // Reset environment
    process.env = { ...process.env, ...mockEnv };

    // Clear sessionStorage
    global.sessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    // Reset fetch mock
    fetch.mockClear();

    // Create service instances
    jwtService = new WordPressJWTAuthService();
    blogService = new WordPressBlogService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('JWT Token Acquisition and Storage', () => {
    it('should successfully authenticate and store JWT token', async () => {
      // Mock successful authentication response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock_jwt_token_123' })
      });

      // Mock JWT utils for payload parsing
      jwtService.jwtUtils = {
        decodeJWTPayload: vi.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })
      };

      const token = await jwtService.authenticate();

      expect(token).toBe('mock_jwt_token_123');
      expect(jwtService.token).toBe('mock_jwt_token_123');
      expect(jwtService.tokenExpiry).toBeGreaterThan(Date.now());
      expect(sessionStorage.setItem).toHaveBeenCalledWith('wp_jwt_token', 'mock_jwt_token_123');
    });

    it('should handle authentication failure', async () => {
      // Mock failed authentication response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' })
      });

      await expect(jwtService.authenticate()).rejects.toThrow('HTTP 401: Invalid credentials');
      expect(jwtService.token).toBeNull();
    });

    it('should restore token from session storage', () => {
      sessionStorage.getItem
        .mockReturnValueOnce('mock_jwt_token_123')
        .mockReturnValueOnce((Date.now() + 3600000).toString());

      const restored = jwtService.initializeFromStorage();

      expect(restored).toBe(true);
      expect(jwtService.token).toBe('mock_jwt_token_123');
    });

    it('should reject expired token from storage', () => {
      sessionStorage.getItem
        .mockReturnValueOnce('expired_token')
        .mockReturnValueOnce((Date.now() - 3600000).toString());

      const restored = jwtService.initializeFromStorage();

      expect(restored).toBe(false);
      expect(jwtService.token).toBeNull();
    });
  });

  describe('Token Validation and Refresh', () => {
    it('should validate active token successfully', async () => {
      jwtService.token = 'valid_token';
      jwtService.tokenExpiry = Date.now() + 3600000;

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'Test User' })
      });

      const isValid = await jwtService.validateToken();

      expect(isValid).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid_token'
          })
        })
      );
    });

    it('should detect expired token', async () => {
      jwtService.token = 'expired_token';
      jwtService.tokenExpiry = Date.now() - 3600000;

      const isValid = await jwtService.validateToken();

      expect(isValid).toBe(false);
    });

    it('should refresh token on 401 error', async () => {
      // Initial token
      jwtService.token = 'expired_token';
      jwtService.tokenExpiry = Date.now() - 3600000;

      // Mock authentication for refresh
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'new_refreshed_token' })
      });

      // Mock JWT utils for new token
      jwtService.jwtUtils = {
        decodeJWTPayload: vi.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })
      };

      const newToken = await jwtService.refreshToken();

      expect(newToken).toBe('new_refreshed_token');
      expect(jwtService.token).toBe('new_refreshed_token');
    });
  });

  describe('Authenticated API Requests', () => {
    it('should make authenticated requests to WordPress API', async () => {
      // Setup authenticated service
      jwtService.token = 'valid_token';
      jwtService.tokenExpiry = Date.now() + 3600000;

      const service = new WordPressJWTAuthService();

      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, title: 'Test Post' }]
      });

      const posts = await service.makeAuthenticatedRequest('/posts');

      expect(posts).toEqual([{ id: 1, title: 'Test Post' }]);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/posts'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid_token'
          })
        })
      );
    });

    it('should automatically refresh token on 401 error', async () => {
      // Setup service with expiring token
      jwtService.token = 'expiring_token';
      jwtService.tokenExpiry = Date.now() + 3600000;

      const service = new WordPressJWTAuthService();

      // Mock initial 401 response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      // Mock authentication for refresh
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'refreshed_token' })
      });

      // Mock successful retry with new token
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, title: 'Refreshed Post' })
      });

      // Mock JWT utils
      service.jwtUtils = {
        decodeJWTPayload: vi.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })
      };

      const posts = await service.makeAuthenticatedRequest('/posts');

      expect(posts).toEqual({ id: 1, title: 'Refreshed Post' });
      expect(service.token).toBe('refreshed_token');
    });
  });

  describe('Blog Service Integration', () => {
    it('should use JWT authentication for blog requests', async () => {
      // Setup authenticated blog service
      const service = new WordPressBlogService({
        useJWTAuth: true,
        jwtCredentials: { username: 'test', password: 'test' }
      });

      // Mock JWT service
      service.jwtService = {
        getAuthorizationHeader: vi.fn().mockResolvedValue({ 'Authorization': 'Bearer token_123' })
      };

      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, title: 'Auth Post' }]
      });

      const posts = await service.getPosts();

      expect(posts).toEqual([{ id: 1, title: 'Auth Post' }]);
      expect(service.jwtService.getAuthorizationHeader).toHaveBeenCalled();
    });

    it('should handle JWT authentication gracefully when disabled', async () => {
      const service = new WordPressBlogService({
        useJWTAuth: false
      });

      // Mock successful response without auth
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, title: 'Public Post' })
      });

      const posts = await service.getPosts();

      expect(posts).toEqual({ id: 1, title: 'Public Post' });
      expect(service.jwtService).toBeNull();
    });
  });

  describe('React Context Integration', () => {
    it('should provide authentication state and methods', () => {
      const wrapper = ({ children }) => (
        <WordPressAuthProvider>{children}</WordPressAuthProvider>
      );

      const { result } = renderHook(() => useWordPressAuth(), { wrapper });

      expect(result.current).toHaveProperty('isAuthenticated', false);
      expect(result.current).toHaveProperty('wordpressUser', null);
      expect(result.current).toHaveProperty('loading', true);
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('refreshToken');
      expect(result.current).toHaveProperty('testConnection');
    });

    it('should handle authentication flow in context', async () => {
      const wrapper = ({ children }) => (
        <WordPressAuthProvider>{children}</WordPressAuthProvider>
      );

      const { result } = renderHook(() => useWordPressAuth(), { wrapper });

      // Mock successful authentication
      result.current.jwtService.authenticate = vi.fn().mockResolvedValue('test_token');
      result.current.jwtService.getCurrentUser = vi.fn().mockResolvedValue({
        id: 1,
        name: 'Test User',
        capabilities: ['edit_posts', 'publish_posts']
      });

      await act(async () => {
        const authResult = await result.current.login('test_user', 'test_password');
        expect(authResult.success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.wordpressUser).toEqual({
        id: 1,
        name: 'Test User',
        capabilities: ['edit_posts', 'publish_posts']
      });
    });

    it('should check user permissions correctly', () => {
      const wrapper = ({ children }) => (
        <WordPressAuthProvider>{children}</WordPressAuthProvider>
      );

      const { result } = renderHook(() => useWordPressAuth(), { wrapper });

      // Setup user with specific capabilities
      act(() => {
        result.current.setWordpressUser({
          capabilities: ['edit_posts', 'upload_files']
        });
      });

      expect(result.current.canEditPosts()).toBe(true);
      expect(result.current.canPublishPosts()).toBe(false);
      expect(result.current.canUploadFiles()).toBe(true);
      expect(result.current.canManageCategories()).toBe(false);
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle network errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(jwtService.authenticate()).rejects.toThrow('Network error');
    });

    it('should handle malformed JWT responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ /* missing token */ })
      });

      await expect(jwtService.authenticate()).rejects.toThrow('Token not found in response');
    });

    it('should handle API server errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal Server Error' })
      });

      await expect(jwtService.authenticate()).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle token validation failures', async () => {
      jwtService.token = 'invalid_token';
      jwtService.tokenExpiry = Date.now() + 3600000;

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      const isValid = await jwtService.validateToken();

      expect(isValid).toBe(false);
    });
  });

  describe('Token Expiry Management', () => {
    it('should detect tokens expiring soon', () => {
      jwtService.tokenExpiry = Date.now() + 4 * 60 * 1000; // 4 minutes from now

      const isExpiringSoon = jwtService.isTokenExpiringSoon();
      expect(isExpiringSoon).toBe(true);
    });

    it('should not detect valid tokens as expiring soon', () => {
      jwtService.tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now

      const isExpiringSoon = jwtService.isTokenExpiringSoon();
      expect(isExpiringSoon).toBe(false);
    });

    it('should calculate remaining time correctly', () => {
      const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now
      jwtService.tokenExpiry = expiryTime;

      const remaining = jwtService.getTokenTimeRemaining();
      expect(remaining).toBeGreaterThan(4 * 60 * 1000); // More than 4 minutes
      expect(remaining).toBeLessThan(6 * 60 * 1000); // Less than 6 minutes
    });
  });

  describe('Connection Testing', () => {
    it('should test WordPress connection successfully', async () => {
      // Mock health check
      fetch.mockResolvedValueOnce({
        ok: true
      });

      // Mock authentication
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test_token' })
      });

      // Mock user info
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'Test User' })
      });

      jwtService.jwtUtils = {
        decodeJWTPayload: vi.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })
      };

      const result = await jwtService.testConnection();

      expect(result.success).toBe(true);
      expect(result.user).toEqual({ id: 1, name: 'Test User' });
    });

    it('should handle connection test failures', async () => {
      fetch.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await jwtService.testConnection();

      expect(result.success).toBe(false);
      expect(result.message).toContain('failed');
    });
  });

  describe('Session Management', () => {
    it('should clear authentication state on logout', () => {
      jwtService.token = 'test_token';
      jwtService.tokenExpiry = Date.now() + 3600000;

      jwtService.clearAuth();

      expect(jwtService.token).toBeNull();
      expect(jwtService.tokenExpiry).toBeNull();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('wp_jwt_token');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('wp_jwt_expiry');
    });

    it('should provide authentication status information', () => {
      jwtService.token = 'test_token';
      jwtService.tokenExpiry = Date.now() + 3600000;

      const status = jwtService.getAuthStatus();

      expect(status.authenticated).toBe(true);
      expect(status.hasToken).toBe(true);
      expect(status.tokenExpiry).toBeGreaterThan(Date.now());
      expect(status.timeToExpiry).toBeGreaterThan(0);
    });

    it('should report unauthenticated status correctly', () => {
      jwtService.token = null;
      jwtService.tokenExpiry = null;

      const status = jwtService.getAuthStatus();

      expect(status.authenticated).toBe(false);
      expect(status.hasToken).toBe(false);
      expect(status.tokenExpiry).toBeNull();
      expect(status.timeToExpiry).toBe(0);
    });
  });
});