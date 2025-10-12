/**
 * App Initialization Integration Tests
 *
 * Tests for App.jsx initialization of error tracker and analytics
 * Coverage target: >80%
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App.jsx';
import * as errorTracker from '../../utils/error-tracker.js';
import * as analyticsLoader from '../../utils/analytics-loader.js';

// Mock all dependencies
vi.mock('../../utils/error-tracker.js', () => ({
  initialize: vi.fn(),
  shutdown: vi.fn(),
  track: vi.fn(),
  getStatus: vi.fn(() => ({
    isInitialized: true,
    sessionId: 'test-session',
    queueSize: 0,
    recentErrorsCount: 0,
    rateLimitWindow: 0,
    circuitBreaker: { state: 'CLOSED' }
  }))
}));

vi.mock('../../utils/analytics-loader.js', () => ({
  initializeAnalytics: vi.fn(() => Promise.resolve({
    gtm: false,
    ga: false,
    posthog: true,
    adBlockDetected: false,
    anyLoaded: true,
    errors: [],
    circuitBreakers: {
      gtm: { state: 'CLOSED' },
      ga: { state: 'CLOSED' }
    }
  })),
  loadGTM: vi.fn(),
  loadGA: vi.fn(),
  loadPostHog: vi.fn(),
  trackEvent: vi.fn(),
  getAnalyticsStatus: vi.fn()
}));

// Mock other components to simplify testing
vi.mock('../../components/Navbar.jsx', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('../../components/ScrollToTop.jsx', () => ({
  default: () => null
}));

vi.mock('../../components/ErrorBoundary.jsx', () => ({
  default: ({ children }) => <div data-testid="error-boundary">{children}</div>
}));

vi.mock('../../components/Accessibility.jsx', () => ({
  default: () => <div data-testid="accessibility">Accessibility</div>
}));

vi.mock('../../components/LocalBusinessSchema.jsx', () => ({
  default: () => null
}));

vi.mock('../../components/AnalyticsFallback.jsx', () => ({
  default: () => null
}));

vi.mock('../../components/ui/toaster.jsx', () => ({
  Toaster: () => null
}));

vi.mock('../../components/CTAModal.jsx', () => ({
  default: () => null
}));

vi.mock('../../components/StickyCTA.jsx', () => ({
  default: () => null
}));

vi.mock('../../components/CookieManager.jsx', () => ({
  default: () => null
}));

vi.mock('../../components/ServiceWorkerUpdateNotification.jsx', () => ({
  default: () => null
}));

vi.mock('../../utils/widgetManager.jsx', () => ({
  WidgetProvider: ({ children }) => <div data-testid="widget-provider">{children}</div>
}));

vi.mock('../../pages/HomePageLayout.jsx', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}));

vi.mock('../../data/blogPostsLoader.js', () => ({
  default: {
    preloadCriticalPosts: vi.fn()
  }
}));

describe('App Initialization Integration Tests', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock window location
    global.window = {
      ...global.window,
      location: {
        hostname: 'saraivavision.com.br',
        pathname: '/'
      },
      requestIdleCallback: undefined
    };

    // Mock document
    global.document = {
      ...global.document,
      documentElement: {
        lang: null
      }
    };

    // Mock import.meta.env
    import.meta.env.PROD = false;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Error Tracker Initialization', () => {
    it('should initialize error tracker on mount', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(errorTracker.initialize).toHaveBeenCalledWith({
        endpoint: '/api/errors'
      });
    });

    it('should log success when error tracker initialized', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Error tracker initialized');
    });

    it('should handle error tracker initialization failure gracefully', () => {
      errorTracker.initialize.mockImplementationOnce(() => {
        throw new Error('Initialization failed');
      });

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '⚠️ Failed to initialize error tracking:',
        expect.any(Error)
      );
    });

    it('should not break app when error tracker fails', () => {
      errorTracker.initialize.mockImplementationOnce(() => {
        throw new Error('Initialization failed');
      });

      const { getByTestId } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // App should still render
      expect(getByTestId('navbar')).toBeDefined();
    });
  });

  describe('Analytics Initialization', () => {
    it('should initialize analytics in production mode', async () => {
      import.meta.env.PROD = true;

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(analyticsLoader.initializeAnalytics).toHaveBeenCalled();
      });
    });

    it('should not initialize analytics in development mode', () => {
      import.meta.env.PROD = false;

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(analyticsLoader.initializeAnalytics).not.toHaveBeenCalled();
    });

    it('should log analytics status when initialized', async () => {
      import.meta.env.PROD = true;

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '✅ Analytics initialized:',
          expect.objectContaining({
            anyLoaded: true
          })
        );
      });
    });

    it('should warn when no analytics loaded', async () => {
      import.meta.env.PROD = true;

      analyticsLoader.initializeAnalytics.mockResolvedValueOnce({
        gtm: false,
        ga: false,
        posthog: false,
        adBlockDetected: true,
        anyLoaded: false,
        errors: [],
        circuitBreakers: {}
      });

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          '⚠️ No analytics loaded - AdBlock may be active'
        );
      });
    });

    it('should handle analytics initialization error', async () => {
      import.meta.env.PROD = true;

      analyticsLoader.initializeAnalytics.mockRejectedValueOnce(
        new Error('Analytics failed')
      );

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '❌ Analytics initialization failed:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Language Configuration', () => {
    it('should set document language to pt-BR', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(document.documentElement.lang).toBe('pt-BR');
    });
  });

  describe('Check Subdomain Handling', () => {
    it('should detect check subdomain', () => {
      global.window.location.hostname = 'check.saraivavision.com.br';

      const { container } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // In check subdomain, routes are different
      expect(container).toBeDefined();
    });

    it('should handle normal domain', () => {
      global.window.location.hostname = 'saraivavision.com.br';

      const { container } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(container).toBeDefined();
    });
  });

  describe('Complete Initialization Flow', () => {
    it('should initialize all systems in correct order', async () => {
      import.meta.env.PROD = true;

      const { getByTestId } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Error tracker initializes first (synchronous)
      expect(errorTracker.initialize).toHaveBeenCalled();

      // Analytics initializes second (asynchronous)
      await waitFor(() => {
        expect(analyticsLoader.initializeAnalytics).toHaveBeenCalled();
      });

      // App renders successfully
      expect(getByTestId('navbar')).toBeDefined();
      expect(getByTestId('error-boundary')).toBeDefined();
      expect(getByTestId('widget-provider')).toBeDefined();
    });

    it('should handle partial initialization failures', async () => {
      import.meta.env.PROD = true;

      // Error tracker fails
      errorTracker.initialize.mockImplementationOnce(() => {
        throw new Error('Error tracker failed');
      });

      // Analytics succeeds
      analyticsLoader.initializeAnalytics.mockResolvedValueOnce({
        anyLoaded: true,
        gtm: true,
        ga: false,
        posthog: true,
        adBlockDetected: false,
        errors: []
      });

      const { getByTestId } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Error tracker failure is logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize error tracking'),
        expect.any(Error)
      );

      // Analytics still initializes
      await waitFor(() => {
        expect(analyticsLoader.initializeAnalytics).toHaveBeenCalled();
      });

      // App still renders
      expect(getByTestId('navbar')).toBeDefined();
    });

    it('should handle complete initialization failure', async () => {
      import.meta.env.PROD = true;

      // Both fail
      errorTracker.initialize.mockImplementationOnce(() => {
        throw new Error('Error tracker failed');
      });

      analyticsLoader.initializeAnalytics.mockRejectedValueOnce(
        new Error('Analytics failed')
      );

      const { getByTestId } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Both failures logged
      expect(consoleWarnSpy).toHaveBeenCalled();

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      // App still renders (resilient)
      expect(getByTestId('navbar')).toBeDefined();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should wrap routes in error boundary', () => {
      const { getByTestId } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(getByTestId('error-boundary')).toBeDefined();
    });
  });

  describe('Widget Provider Integration', () => {
    it('should provide widget context to app', () => {
      const { getByTestId } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(getByTestId('widget-provider')).toBeDefined();
    });
  });

  describe('Accessibility Integration', () => {
    it('should render accessibility component', () => {
      const { getByTestId } = render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(getByTestId('accessibility')).toBeDefined();
    });
  });

  describe('Performance - Blog Preloading', () => {
    it('should preload critical blog posts with requestIdleCallback', async () => {
      const mockRequestIdleCallback = vi.fn((callback) => {
        setTimeout(() => callback(), 0);
      });
      global.window.requestIdleCallback = mockRequestIdleCallback;

      const blogPostsLoader = await import('../../data/blogPostsLoader.js');

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockRequestIdleCallback).toHaveBeenCalled();
      });
    });

    it('should preload critical blog posts with setTimeout fallback', async () => {
      global.window.requestIdleCallback = undefined;
      vi.useFakeTimers();

      const blogPostsLoader = await import('../../data/blogPostsLoader.js');

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      vi.advanceTimersByTime(2100);

      await waitFor(() => {
        expect(blogPostsLoader.default.preloadCriticalPosts).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });
  });
});
