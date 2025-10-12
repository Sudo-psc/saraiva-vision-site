/**
 * URL Normalizer Test Suite
 *
 * Tests for URL normalization and building utilities
 * Coverage target: >80%
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeURL,
  URLBuilder,
  buildAPIURL,
  buildFullURL
} from '../url-normalizer.js';

describe('normalizeURL', () => {
  describe('Basic normalization', () => {
    it('should normalize URLs with double slashes', () => {
      expect(normalizeURL('https://api.com//users//123')).toBe('https://api.com/users/123');
      expect(normalizeURL('http://example.com///api///test')).toBe('http://example.com/api/test');
    });

    it('should remove trailing slashes (except root)', () => {
      expect(normalizeURL('/api/users/')).toBe('/api/users');
      expect(normalizeURL('https://api.com/users/')).toBe('https://api.com/users');
      expect(normalizeURL('/')).toBe('/');
    });

    it('should preserve protocol', () => {
      expect(normalizeURL('https://api.com/users')).toBe('https://api.com/users');
      expect(normalizeURL('http://api.com/users')).toBe('http://api.com/users');
      expect(normalizeURL('wss://api.com/socket')).toBe('wss://api.com/socket');
      expect(normalizeURL('ws://api.com/socket')).toBe('ws://api.com/socket');
    });

    it('should handle relative URLs', () => {
      expect(normalizeURL('/api/users')).toBe('/api/users');
      expect(normalizeURL('/api//users')).toBe('/api/users');
    });

    it('should handle complex URLs with multiple slashes', () => {
      expect(normalizeURL('https://api.com////users///123////profile')).toBe('https://api.com/users/123/profile');
    });
  });

  describe('Edge cases', () => {
    it('should throw TypeError for invalid input', () => {
      expect(() => normalizeURL(null)).toThrow(TypeError);
      expect(() => normalizeURL(undefined)).toThrow(TypeError);
      expect(() => normalizeURL('')).toThrow(TypeError);
      expect(() => normalizeURL(123)).toThrow(TypeError);
      expect(() => normalizeURL({})).toThrow(TypeError);
    });

    it('should throw Error for protocol without path', () => {
      expect(() => normalizeURL('https://')).toThrow('Invalid URL: path cannot be empty after protocol');
      expect(() => normalizeURL('http://')).toThrow('Invalid URL: path cannot be empty after protocol');
    });

    it('should handle URLs with query parameters', () => {
      expect(normalizeURL('https://api.com//users?id=123')).toBe('https://api.com/users?id=123');
      expect(normalizeURL('/api//users?sort=name&filter=active')).toBe('/api/users?sort=name&filter=active');
    });

    it('should handle URLs with hash fragments', () => {
      expect(normalizeURL('https://example.com//page#section')).toBe('https://example.com/page#section');
    });

    it('should handle root paths correctly', () => {
      expect(normalizeURL('/')).toBe('/');
      // Note: normalizeURL removes trailing slash except for single '/'
      expect(normalizeURL('https://api.com/')).toBe('https://api.com');
    });
  });
});

describe('URLBuilder', () => {
  describe('Construction', () => {
    it('should create builder with base URL', () => {
      const builder = new URLBuilder('https://api.com');
      expect(builder.build()).toBe('https://api.com');
    });

    it('should remove trailing slashes from base URL', () => {
      const builder = new URLBuilder('https://api.com/');
      expect(builder.build()).toBe('https://api.com');
    });

    it('should throw TypeError for invalid base URL', () => {
      expect(() => new URLBuilder(null)).toThrow(TypeError);
      expect(() => new URLBuilder('')).toThrow(TypeError);
      expect(() => new URLBuilder(undefined)).toThrow(TypeError);
    });
  });

  describe('Path building', () => {
    it('should add single path segment', () => {
      const url = new URLBuilder('https://api.com')
        .path('users')
        .build();
      expect(url).toBe('https://api.com/users');
    });

    it('should add multiple path segments', () => {
      const url = new URLBuilder('https://api.com')
        .path('users')
        .path('123')
        .path('profile')
        .build();
      expect(url).toBe('https://api.com/users/123/profile');
    });

    it('should clean leading/trailing slashes from segments', () => {
      const url = new URLBuilder('https://api.com')
        .path('/users/')
        .path('/123/')
        .build();
      expect(url).toBe('https://api.com/users/123');
    });

    it('should handle empty or null segments gracefully', () => {
      const url = new URLBuilder('https://api.com')
        .path('users')
        .path(null)
        .path('')
        .path('123')
        .build();
      expect(url).toBe('https://api.com/users/123');
    });

    it('should add multiple segments with paths()', () => {
      const url = new URLBuilder('https://api.com')
        .paths('users', '123', 'profile')
        .build();
      expect(url).toBe('https://api.com/users/123/profile');
    });

    it('should support method chaining', () => {
      const url = new URLBuilder('https://api.com')
        .path('users')
        .path('123')
        .build();
      expect(url).toBe('https://api.com/users/123');
    });
  });

  describe('Query parameters', () => {
    it('should add single query parameter', () => {
      const url = new URLBuilder('https://api.com')
        .query('active', 'true')
        .build();
      expect(url).toBe('https://api.com?active=true');
    });

    it('should add multiple query parameters', () => {
      const url = new URLBuilder('https://api.com')
        .query('active', 'true')
        .query('role', 'admin')
        .build();
      expect(url).toBe('https://api.com?active=true&role=admin');
    });

    it('should encode query parameters', () => {
      const url = new URLBuilder('https://api.com')
        .query('name', 'John Doe')
        .query('email', 'test@example.com')
        .build();
      expect(url).toContain('name=John%20Doe');
      expect(url).toContain('email=test%40example.com');
    });

    it('should handle null/empty query values gracefully', () => {
      const url = new URLBuilder('https://api.com')
        .query('active', 'true')
        .query(null, 'value')
        .query('key', null)
        .query('', '')
        .build();
      expect(url).toBe('https://api.com?active=true');
    });

    it('should add multiple parameters with queries()', () => {
      const url = new URLBuilder('https://api.com')
        .queries({
          active: 'true',
          role: 'admin',
          page: 1
        })
        .build();
      expect(url).toContain('active=true');
      expect(url).toContain('role=admin');
      expect(url).toContain('page=1');
    });

    it('should convert non-string values to strings', () => {
      const url = new URLBuilder('https://api.com')
        .query('page', 1)
        .query('active', true)
        .build();
      expect(url).toContain('page=1');
      expect(url).toContain('active=true');
    });
  });

  describe('Combined path and query', () => {
    it('should build URL with both path and query', () => {
      const url = new URLBuilder('https://api.com')
        .path('users')
        .path('123')
        .query('active', 'true')
        .query('role', 'admin')
        .build();
      expect(url).toBe('https://api.com/users/123?active=true&role=admin');
    });

    it('should handle complex URLs', () => {
      const url = new URLBuilder('https://api.com')
        .paths('api', 'v1', 'users', '123')
        .queries({
          include: 'profile',
          fields: 'name,email',
          sort: 'created_at'
        })
        .build();
      expect(url).toContain('https://api.com/api/v1/users/123');
      expect(url).toContain('include=profile');
      expect(url).toContain('fields=name%2Cemail');
      expect(url).toContain('sort=created_at');
    });
  });

  describe('toString()', () => {
    it('should return same result as build()', () => {
      const builder = new URLBuilder('https://api.com')
        .path('users')
        .query('active', 'true');
      expect(builder.toString()).toBe(builder.build());
    });
  });

  describe('Normalization integration', () => {
    it('should normalize final URL', () => {
      const url = new URLBuilder('https://api.com/')
        .path('/users/')
        .path('/123/')
        .build();
      expect(url).toBe('https://api.com/users/123');
    });
  });
});

describe('buildAPIURL', () => {
  it('should build simple API URL', () => {
    const url = buildAPIURL('/users/123');
    expect(url).toBe('/users/123');
  });

  it('should build API URL with query parameters', () => {
    const url = buildAPIURL('/users/123', { active: true, role: 'admin' });
    expect(url).toContain('/users/123');
    expect(url).toContain('active=true');
    expect(url).toContain('role=admin');
  });

  it('should handle empty params object', () => {
    const url = buildAPIURL('/users/123', {});
    expect(url).toBe('/users/123');
  });

  it('should handle null params', () => {
    const url = buildAPIURL('/users/123', null);
    expect(url).toBe('/users/123');
  });

  it('should normalize double slashes', () => {
    const url = buildAPIURL('/api//users//123');
    expect(url).toBe('/api/users/123');
  });
});

describe('buildFullURL', () => {
  it('should build complete URL with base and path', () => {
    const url = buildFullURL('https://api.com', '/users/123');
    expect(url).toBe('https://api.com/users/123');
  });

  it('should build complete URL with query parameters', () => {
    const url = buildFullURL('https://api.com', '/users/123', { active: true });
    expect(url).toContain('https://api.com/users/123');
    expect(url).toContain('active=true');
  });

  it('should handle empty params', () => {
    const url = buildFullURL('https://api.com', '/users/123', {});
    expect(url).toBe('https://api.com/users/123');
  });

  it('should normalize complex paths', () => {
    const url = buildFullURL('https://api.com/', '//users//123/');
    expect(url).toBe('https://api.com/users/123');
  });

  it('should handle multiple query parameters', () => {
    const url = buildFullURL('https://api.com', '/search', {
      q: 'test query',
      page: 1,
      limit: 10
    });
    expect(url).toContain('https://api.com/search');
    expect(url).toContain('q=test%20query');
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
  });
});

describe('Integration tests', () => {
  it('should handle real-world API URL patterns', () => {
    // REST API pattern
    const restUrl = new URLBuilder('https://api.example.com')
      .paths('api', 'v1', 'users', '12345')
      .queries({
        include: 'profile,settings',
        fields: 'name,email,created_at'
      })
      .build();
    expect(restUrl).toContain('https://api.example.com/api/v1/users/12345');
    expect(restUrl).toContain('include=profile%2Csettings');
  });

  it('should handle WebSocket URLs', () => {
    const wsUrl = normalizeURL('wss://example.com//socket//events');
    expect(wsUrl).toBe('wss://example.com/socket/events');
  });

  it('should handle medical API patterns (healthcare context)', () => {
    const medicalUrl = new URLBuilder('https://api.saraivavision.com.br')
      .paths('api', 'v1', 'pacientes', '123', 'consultas')
      .queries({
        status: 'agendada',
        data_inicio: '2025-10-01',
        data_fim: '2025-10-31'
      })
      .build();
    expect(medicalUrl).toContain('pacientes/123/consultas');
    expect(medicalUrl).toContain('status=agendada');
  });
});
