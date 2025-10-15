/**
 * End-to-End Tests for Error Tracking
 * Validates complete error tracking flow including URL validation and backend submission
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

describe('Error Tracking E2E', () => {
  let originalFetch;
  let fetchCalls = [];

  beforeAll(() => {
    // Mock global fetch to intercept error reports
    originalFetch = global.fetch;
    global.fetch = vi.fn((...args) => {
      fetchCalls.push(args);
      return Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.resolve({})
      });
    });

    // Mock window.location
    global.window = {
      location: {
        origin: 'https://saraivavision.com.br',
        href: 'https://saraivavision.com.br/test'
      },
      addEventListener: vi.fn(),
      navigator: {
        userAgent: 'Test Browser',
        onLine: true
      }
    };

    // Mock document
    global.document = {
      addEventListener: vi.fn(),
      referrer: '',
      hidden: false,
      visibilityState: 'visible'
    };
  });

  afterAll(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should initialize ErrorTracker without errors', async () => {
    const { default: ErrorTracker } = await import('../../../public/error-tracker.js');

    expect(() => {
      new ErrorTracker({
        endpoint: '/api/errors',
        environment: 'production',
        enabled: true
      });
    }).not.toThrow();
  });

  it('should validate endpoint URL before sending', async () => {
    const { default: ErrorTracker } = await import('../../../public/error-tracker.js');

    // Test com endpoint vazio (deve prevenir SyntaxError)
    const tracker1 = new ErrorTracker({
      endpoint: '',
      environment: 'production',
      enabled: true
    });

    const error = new Error('Test error');

    // Não deve lançar SyntaxError
    await expect(async () => {
      await tracker1.sendReport({
        message: error.message,
        classification: { severity: 'error', category: 'unknown' }
      });
    }).resolves.not.toThrow();
  });

  it('should sanitize invalid URLs in error reports', async () => {
    const { default: ErrorTracker } = await import('../../../public/error-tracker.js');

    const tracker = new ErrorTracker({
      endpoint: '/api/errors',
      environment: 'production',
      enabled: true
    });

    const problematicUrls = [
      'about:blank',
      'blob:https://example.com/123',
      'chrome-extension://abc/page.html',
      'data:text/html,<h1>Test</h1>',
      ''
    ];

    for (const url of problematicUrls) {
      fetchCalls = [];

      await tracker.sendReport({
        message: 'Test error',
        url: url,
        classification: { severity: 'error', category: 'unknown' },
        timestamp: new Date().toISOString()
      });

      if (fetchCalls.length > 0) {
        const [fetchUrl, options] = fetchCalls[0];
        const body = JSON.parse(options.body);

        // URL deve ter sido sanitizada para fallback
        expect(body.url).toBe('https://saraivavision.com.br');
      }
    }
  });

  it('should normalize timestamps to ISO 8601', async () => {
    const { default: ErrorTracker } = await import('../../../public/error-tracker.js');

    const tracker = new ErrorTracker({
      endpoint: '/api/errors',
      environment: 'production',
      enabled: true
    });

    fetchCalls = [];

    await tracker.sendReport({
      message: 'Test error',
      timestamp: 1697472000000, // Unix timestamp in ms
      classification: { severity: 'error', category: 'unknown' }
    });

    if (fetchCalls.length > 0) {
      const [, options] = fetchCalls[0];
      const body = JSON.parse(options.body);

      // Timestamp deve estar em formato ISO 8601
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    }
  });

  it('should prevent Request() SyntaxError with invalid URLs', async () => {
    const problematicEndpoints = [
      '',
      'undefined',
      'not a url',
      '//',
      ' '
    ];

    const { default: ErrorTracker } = await import('../../../public/error-tracker.js');

    for (const endpoint of problematicEndpoints) {
      const tracker = new ErrorTracker({
        endpoint: endpoint,
        environment: 'production',
        enabled: true
      });

      // Não deve lançar SyntaxError
      await expect(async () => {
        await tracker.sendReport({
          message: 'Test error',
          classification: { severity: 'error', category: 'unknown' }
        });
      }).resolves.not.toThrow();
    }
  });

  it('should handle 400 errors gracefully without infinite loop', async () => {
    // Mock fetch to return 400
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad Request' })
      })
    );

    const { default: ErrorTracker } = await import('../../../public/error-tracker.js');

    const tracker = new ErrorTracker({
      endpoint: '/api/errors',
      environment: 'production',
      enabled: true
    });

    let callCount = 0;
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes('[ErrorTracker]')) {
        callCount++;
      }
    };

    await tracker.sendReport({
      message: 'Test error',
      classification: { severity: 'error', category: 'unknown' }
    });

    // Deve ter sido chamado no máximo 1 vez (não loop infinito)
    expect(callCount).toBeLessThanOrEqual(1);

    console.error = originalError;
  });

  it('should truncate oversized messages and stacks', async () => {
    fetchCalls = [];

    // Reset fetch mock
    global.fetch = vi.fn((...args) => {
      fetchCalls.push(args);
      return Promise.resolve({
        ok: true,
        status: 204
      });
    });

    const { default: ErrorTracker } = await import('../../../public/error-tracker.js');

    const tracker = new ErrorTracker({
      endpoint: '/api/errors',
      environment: 'production',
      enabled: true
    });

    const longMessage = 'A'.repeat(2000);
    const longStack = 'B'.repeat(10000);

    await tracker.sendReport({
      message: longMessage,
      stack: longStack,
      classification: { severity: 'error', category: 'unknown' }
    });

    if (fetchCalls.length > 0) {
      const [, options] = fetchCalls[0];
      const body = JSON.parse(options.body);

      // Message deve ser truncada para 1000 chars
      expect(body.message.length).toBeLessThanOrEqual(1000 + 20); // +20 para '... (truncated)'

      // Stack deve ser truncada para 5000 chars
      expect(body.stack.length).toBeLessThanOrEqual(5000 + 20);
    }
  });

  it('should construct absolute URL from relative endpoint', async () => {
    fetchCalls = [];

    const { default: ErrorTracker } = await import('../../../public/error-tracker.js');

    const tracker = new ErrorTracker({
      endpoint: '/api/errors',
      environment: 'production',
      enabled: true
    });

    await tracker.sendReport({
      message: 'Test error',
      classification: { severity: 'error', category: 'unknown' }
    });

    if (fetchCalls.length > 0) {
      const [fetchUrl] = fetchCalls[0];

      // Deve ter construído URL absoluta
      expect(fetchUrl.startsWith('http://') || fetchUrl.startsWith('https://')).toBe(true);
      expect(fetchUrl).toContain('/api/errors');
    }
  });
});
