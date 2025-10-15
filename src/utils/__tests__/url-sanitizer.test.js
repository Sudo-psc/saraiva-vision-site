/**
 * Tests for URL Sanitizer
 * Validates URL validation, sanitization, and endpoint construction
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isValidUrl,
  sanitizeUrl,
  buildEndpointUrl,
  sanitizeTimestamp
} from '../url-sanitizer.js';

describe('url-sanitizer', () => {
  describe('isValidUrl', () => {
    it('should validate HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
    });

    it('should reject invalid protocols', () => {
      expect(isValidUrl('about:blank')).toBe(false);
      expect(isValidUrl('blob:https://example.com/123')).toBe(false);
      expect(isValidUrl('data:text/html,<h1>Test</h1>')).toBe(false);
      expect(isValidUrl('chrome-extension://abc123/page.html')).toBe(false);
      expect(isValidUrl('moz-extension://abc123/page.html')).toBe(false);
    });

    it('should reject malformed URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    it('should sanitize valid HTTP URLs', () => {
      const url = 'https://example.com/path?foo=bar';
      const sanitized = sanitizeUrl(url);
      expect(sanitized).toBe('https://example.com/path?foo=bar');
    });

    it('should replace invalid protocols with fallback', () => {
      expect(sanitizeUrl('about:blank')).toBe('https://saraivavision.com.br');
      expect(sanitizeUrl('blob:https://example.com/123')).toBe('https://saraivavision.com.br');
      expect(sanitizeUrl('chrome-extension://abc/page.html')).toBe('https://saraivavision.com.br');
    });

    it('should handle empty/null/undefined', () => {
      expect(sanitizeUrl('')).toBe('https://saraivavision.com.br');
      expect(sanitizeUrl(null)).toBe('https://saraivavision.com.br');
      expect(sanitizeUrl(undefined)).toBe('https://saraivavision.com.br');
    });

    it('should encode query parameters', () => {
      const url = 'https://example.com/?foo=bar baz&test={value}';
      const sanitized = sanitizeUrl(url);
      expect(sanitized).toContain('foo=bar%20baz');
      expect(sanitized).toContain('test=%7Bvalue%7D');
    });

    it('should truncate long query param values', () => {
      const longValue = 'a'.repeat(300);
      const url = `https://example.com/?foo=${longValue}`;
      const sanitized = sanitizeUrl(url);
      // Should be encoded and truncated
      expect(sanitized.length).toBeLessThan(url.length);
    });

    it('should remove long hash fragments', () => {
      const longHash = '#' + 'a'.repeat(200);
      const url = `https://example.com/path${longHash}`;
      const sanitized = sanitizeUrl(url);
      expect(sanitized).toBe('https://example.com/path');
    });
  });

  describe('buildEndpointUrl', () => {
    beforeEach(() => {
      // Mock window.location.origin
      delete global.window;
      global.window = { location: { origin: 'https://saraivavision.com.br' } };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should build URL from relative endpoint', () => {
      const url = buildEndpointUrl('/api/errors');
      expect(url).toBe('https://saraivavision.com.br/api/errors');
    });

    it('should handle absolute URLs', () => {
      const url = buildEndpointUrl('https://api.example.com/errors');
      expect(url).toBe('https://api.example.com/errors');
    });

    it('should add leading slash if missing', () => {
      const url = buildEndpointUrl('api/errors');
      expect(url).toBe('https://saraivavision.com.br/api/errors');
    });

    it('should throw on invalid endpoint', () => {
      expect(() => buildEndpointUrl('')).toThrow('Invalid endpoint');
      expect(() => buildEndpointUrl(null)).toThrow('Invalid endpoint');
      expect(() => buildEndpointUrl(undefined)).toThrow('Invalid endpoint');
    });

    it('should handle custom base URL', () => {
      const url = buildEndpointUrl('/errors', 'https://custom.com');
      expect(url).toBe('https://custom.com/errors');
    });

    it('should add https:// to base without protocol', () => {
      const url = buildEndpointUrl('/errors', 'custom.com');
      expect(url).toBe('https://custom.com/errors');
    });
  });

  describe('sanitizeTimestamp', () => {
    it('should convert Unix timestamp (ms) to ISO 8601', () => {
      const ts = 1697472000000; // Oct 16 2023
      const iso = sanitizeTimestamp(ts);
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(new Date(iso).getTime()).toBe(ts);
    });

    it('should convert Unix timestamp (seconds) to ISO 8601', () => {
      const ts = 1697472000; // Oct 16 2023 in seconds
      const iso = sanitizeTimestamp(ts);
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(new Date(iso).getTime()).toBe(ts * 1000);
    });

    it('should keep valid ISO 8601 strings unchanged', () => {
      const iso = '2023-10-16T12:00:00.000Z';
      const result = sanitizeTimestamp(iso);
      expect(result).toBe(iso);
    });

    it('should convert Date objects to ISO 8601', () => {
      const date = new Date('2023-10-16T12:00:00Z');
      const iso = sanitizeTimestamp(date.toISOString());
      expect(iso).toBe('2023-10-16T12:00:00.000Z');
    });

    it('should fallback to current time for invalid inputs', () => {
      const before = Date.now();
      const iso1 = sanitizeTimestamp('invalid');
      const iso2 = sanitizeTimestamp(null);
      const iso3 = sanitizeTimestamp(undefined);
      const iso4 = sanitizeTimestamp({});
      const after = Date.now();

      [iso1, iso2, iso3, iso4].forEach(iso => {
        const ts = new Date(iso).getTime();
        expect(ts).toBeGreaterThanOrEqual(before);
        expect(ts).toBeLessThanOrEqual(after);
      });
    });

    it('should fallback to current time for empty string', () => {
      const before = Date.now();
      const iso = sanitizeTimestamp('');
      const after = Date.now();

      const ts = new Date(iso).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  describe('Edge cases and SyntaxError prevention', () => {
    it('should handle URLs with special characters', () => {
      const urls = [
        'https://example.com/path?query={value}',
        'https://example.com/path?query=|pipe|',
        'https://example.com/path with spaces',
        'https://example.com/path?<script>alert()</script>'
      ];

      urls.forEach(url => {
        const sanitized = sanitizeUrl(url);
        expect(sanitized).toBeTruthy();
        // Should not throw when creating URL
        expect(() => new URL(sanitized)).not.toThrow();
      });
    });

    it('should prevent new Request() SyntaxError', () => {
      const problematicUrls = [
        '',
        ' ',
        'undefined',
        'null',
        '//',
        'about:blank'
      ];

      problematicUrls.forEach(url => {
        const sanitized = sanitizeUrl(url);
        // Should not throw SyntaxError
        expect(() => new Request(sanitized)).not.toThrow();
      });
    });

    it('should prevent new URL() SyntaxError', () => {
      const problematicInputs = [
        { endpoint: '', base: 'https://example.com', shouldThrow: true },
        { endpoint: 'api/errors', base: '', shouldThrow: true },
        { endpoint: '//', base: 'https://example.com', shouldThrow: true },
        { endpoint: '/api/valid', base: 'https://example.com', shouldThrow: false }
      ];

      problematicInputs.forEach(({ endpoint, base, shouldThrow }) => {
        if (shouldThrow) {
          expect(() => buildEndpointUrl(endpoint, base)).toThrow();
        } else {
          expect(() => buildEndpointUrl(endpoint, base)).not.toThrow();
        }
      });
    });
  });
});
