import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import DeferredWidgets from '../DeferredWidgets.jsx';
import { ConfigProvider } from '@/config';

// Mock all widget components
vi.mock('@/components/ui/toaster.jsx', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>
}));

vi.mock('@/components/CTAModal.jsx', () => ({
  default: () => <div data-testid="cta-modal">CTAModal</div>
}));

vi.mock('@/components/StickyCTA.jsx', () => ({
  default: () => <div data-testid="sticky-cta">StickyCTA</div>
}));

vi.mock('@/components/CookieManager.jsx', () => ({
  default: () => <div data-testid="cookie-manager">CookieManager</div>
}));

vi.mock('@/components/ServiceWorkerUpdateNotification.jsx', () => ({
  default: () => <div data-testid="sw-update">ServiceWorkerUpdateNotification</div>
}));

vi.mock('@/components/Accessibility.jsx', () => ({
  default: () => <div data-testid="accessibility">Accessibility</div>
}));

describe('DeferredWidgets', () => {
  let mockRequestIdleCallback;
  let mockCancelIdleCallback;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '';
    
    // Mock requestIdleCallback
    mockRequestIdleCallback = vi.fn((cb) => {
      const handle = setTimeout(cb, 0);
      return handle;
    });
    mockCancelIdleCallback = vi.fn(window.clearTimeout);
    
    window.requestIdleCallback = mockRequestIdleCallback;
    window.cancelIdleCallback = mockCancelIdleCallback;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('Container Management', () => {
    it('should create deferred-widgets container if not present', async () => {
      const config = {
        widgets: {
          toaster: { enabled: true }
        },
        features: {
          lazyWidgets: false
        }
      };

      render(
        <ConfigProvider value={config}>
          <DeferredWidgets />
        </ConfigProvider>
      );

      await waitFor(() => {
        const container = document.getElementById('deferred-widgets');
        expect(container).toBeInTheDocument();
      });
    });

    it('should reuse existing deferred-widgets container', async () => {
      // Pre-create container
      const existingContainer = document.createElement('div');
      existingContainer.id = 'deferred-widgets';
      document.body.appendChild(existingContainer);

      const config = {
        widgets: {
          toaster: { enabled: true }
        },
        features: {
          lazyWidgets: false
        }
      };

      render(
        <ConfigProvider value={config}>
          <DeferredWidgets />
        </ConfigProvider>
      );

      await waitFor(() => {
        const containers = document.querySelectorAll('#deferred-widgets');
        expect(containers.length).toBe(1);
      });
    });

    it('should append container to document.body', async () => {
      const config = {
        widgets: {
          toaster: { enabled: true }
        },
        features: {
          lazyWidgets: false
        }
      };

      render(
        <ConfigProvider value={config}>
          <DeferredWidgets />
        </ConfigProvider>
      );

      await waitFor(() => {
        const container = document.getElementById('deferred-widgets');
        expect(container?.parentElement).toBe(document.body);
      });
    });
  });

  describe('Widget Rendering', () => {
    it('should render Toaster when enabled', async () => {
      const config = {
        widgets: {
          toaster: { enabled: true },
          ctaModal: { enabled: false },
          stickyCta: { enabled: false },
          cookieManager: { enabled: false },
          serviceWorkerNotification: { enabled: false },
          accessibility: { enabled: false }
        },
        features: {
          lazyWidgets: false
        }
      };

      render(
        <ConfigProvider value={config}>
          <DeferredWidgets />
        </ConfigProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
      });
    });

    it('should render all widgets when all enabled', async () => {
      const config = {
        widgets: {
          toaster: { enabled: true },
          ctaModal: { enabled: true },
          stickyCta: { enabled: true },
          cookieManager: { enabled: true },
          serviceWorkerNotification: { enabled: true },
          accessibility: { enabled: true }
        },
        features: {
          lazyWidgets: false
        }
      };

      render(
        <ConfigProvider value={config}>
          <DeferredWidgets />
        </ConfigProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
        expect(screen.getByTestId('cta-modal')).toBeInTheDocument();
        expect(screen.getByTestId('sticky-cta')).toBeInTheDocument();
        expect(screen.getByTestId('cookie-manager')).toBeInTheDocument();
        expect(screen.getByTestId('sw-update')).toBeInTheDocument();
        expect(screen.getByTestId('accessibility')).toBeInTheDocument();
      });
    });
  });

  describe('Lazy Loading', () => {
    it('should use requestIdleCallback when lazyWidgets is true', async () => {
      const config = {
        widgets: {
          toaster: { enabled: true }
        },
        features: {
          lazyWidgets: true
        }
      };

      render(
        <ConfigProvider value={config}>
          <DeferredWidgets />
        </ConfigProvider>
      );

      await waitFor(() => {
        expect(mockRequestIdleCallback).toHaveBeenCalled();
      });
    });

    it('should render widgets after idle callback fires', async () => {
      const config = {
        widgets: {
          toaster: { enabled: true }
        },
        features: {
          lazyWidgets: true
        }
      };

      render(
        <ConfigProvider value={config}>
          <DeferredWidgets />
        </ConfigProvider>
      );

      // Wait for idle callback to fire
      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
      });
    });
  });
});