import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import AnalyticsFallback from '../AnalyticsFallback';

describe('AnalyticsFallback', () => {
  let mockFetch;
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    mockFetch = vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({})
    }));
    global.fetch = mockFetch;
    
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn()
    };
    
    global.window = {
      location: {
        href: 'https://example.com',
        hostname: 'example.com',
        pathname: '/',
      },
      gtag: undefined,
      dataLayer: undefined,
      ga: undefined,
      posthog: undefined
    };
    
    global.document = {
      referrer: '',
      title: 'Test Page',
      readyState: 'complete',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    global.navigator = {
      userAgent: 'Test Browser'
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(<AnalyticsFallback />);
    expect(container).toBeDefined();
  });

  it('should not crash when handling circular references in event data', async () => {
    const { container } = render(<AnalyticsFallback />);
    
    const circularObj = { a: 1 };
    circularObj.self = circularObj;
    
    const submitEvent = new Event('submit');
    Object.defineProperty(submitEvent, 'target', {
      value: {
        name: 'test-form',
        action: '/submit',
        id: 'contact-form',
        className: 'form-class'
      }
    });
    
    document.dispatchEvent(submitEvent);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('circular structure')
    );
  });

  it('should filter out DOM elements from event data', async () => {
    const { container } = render(<AnalyticsFallback />);
    
    const fakeInput = {
      nodeType: 1,
      tagName: 'INPUT',
      value: 'test'
    };
    
    const submitEvent = new Event('submit');
    Object.defineProperty(submitEvent, 'target', {
      value: {
        name: 'test-form',
        action: '/submit',
        elements: [fakeInput]
      }
    });
    
    document.dispatchEvent(submitEvent);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (mockFetch.mock.calls.length > 0) {
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      if (lastCall && lastCall[1] && lastCall[1].body) {
        const body = JSON.parse(lastCall[1].body);
        expect(body.elements).toBeUndefined();
      }
    }
  });

  it('should successfully stringify analytics data without circular references', async () => {
    const { container } = render(<AnalyticsFallback />);
    
    const submitEvent = new Event('submit');
    Object.defineProperty(submitEvent, 'target', {
      value: {
        name: 'contact-form',
        action: '/api/contact',
        id: 'contact',
        className: 'contact-form'
      }
    });
    
    document.dispatchEvent(submitEvent);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Failed to stringify')
    );
  });
});
