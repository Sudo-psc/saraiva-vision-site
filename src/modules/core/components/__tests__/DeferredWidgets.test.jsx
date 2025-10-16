import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import DeferredWidgets from '../DeferredWidgets.jsx';
import { ConfigProvider } from '@/config';

// Mock all widget components
vi.mock('@/components/ui/toaster.jsx', () => ({
  Toaster: () => <div data-testid="toaster-widget">Toaster</div>
}));

vi.mock('@/components/CTAModal.jsx', () => ({
  default: () => <div data-testid="cta-modal-widget">CTAModal</div>
}));

vi.mock('@/components/StickyCTA.jsx', () => ({
  default: () => <div data-testid="sticky-cta-widget">StickyCTA</div>
}));

vi.mock('@/components/CookieManager.jsx', () => ({
  default: () => <div data-testid="cookie-manager-widget">CookieManager</div>
}));

vi.mock('@/components/ServiceWorkerUpdateNotification.jsx', () => ({
  default: () => <div data-testid="sw-update-widget">ServiceWorkerUpdateNotification</div>
}));

vi.mock('@/components/Accessibility.jsx', () => ({
  default: () => <div data-testid="accessibility-widget">Accessibility</div>
}));

describe('DeferredWidgets', () => {
  let container;

  beforeEach(() => {
    // Clean up any existing deferred-widgets container
    const existing = document.getElementById('deferred-widgets');
    if (existing) {
      existing.remove();
    }
    container = null;
  });

  afterEach(() => {
    const existing = document.getElementById('deferred-widgets');
    if (existing) {
      existing.remove();
    }
  });

  const defaultConfig = {
    app: { environment: 'test' },
    analytics: { enabled: false },
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

  it('renders all enabled widgets when lazyWidgets is false', async () => {
    render(
      <ConfigProvider value={defaultConfig}>
        <DeferredWidgets />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('toaster-widget')).toBeInTheDocument();
    });

    expect(screen.getByTestId('cta-modal-widget')).toBeInTheDocument();
    expect(screen.getByTestId('sticky-cta-widget')).toBeInTheDocument();
    expect(screen.getByTestId('cookie-manager-widget')).toBeInTheDocument();
    expect(screen.getByTestId('sw-update-widget')).toBeInTheDocument();
    expect(screen.getByTestId('accessibility-widget')).toBeInTheDocument();
  });

  it('creates deferred-widgets container if not exists', async () => {
    render(
      <ConfigProvider value={defaultConfig}>
        <DeferredWidgets />
      </ConfigProvider>
    );

    await waitFor(() => {
      const container = document.getElementById('deferred-widgets');
      expect(container).toBeInTheDocument();
    });
  });

  it('respects widget enable/disable flags', async () => {
    const config = {
      ...defaultConfig,
      widgets: {
        toaster: { enabled: true },
        ctaModal: { enabled: false },
        stickyCta: { enabled: false },
        cookieManager: { enabled: true },
        serviceWorkerNotification: { enabled: false },
        accessibility: { enabled: true }
      }
    };

    render(
      <ConfigProvider value={config}>
        <DeferredWidgets />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('toaster-widget')).toBeInTheDocument();
    });

    expect(screen.getByTestId('cookie-manager-widget')).toBeInTheDocument();
    expect(screen.getByTestId('accessibility-widget')).toBeInTheDocument();
    expect(screen.queryByTestId('cta-modal-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sticky-cta-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sw-update-widget')).not.toBeInTheDocument();
  });

  it('defers rendering when lazyWidgets is true', async () => {
    const config = {
      ...defaultConfig,
      features: {
        lazyWidgets: true
      }
    };

    // Mock requestIdleCallback
    const originalRequestIdleCallback = window.requestIdleCallback;
    let idleCallback;
    window.requestIdleCallback = vi.fn((cb) => {
      idleCallback = cb;
      return 123;
    });

    render(
      <ConfigProvider value={config}>
        <DeferredWidgets />
      </ConfigProvider>
    );

    // Initially, widgets should not be rendered
    expect(screen.queryByTestId('toaster-widget')).not.toBeInTheDocument();

    // Simulate idle callback
    if (idleCallback) {
      idleCallback();
    }

    await waitFor(() => {
      expect(screen.getByTestId('toaster-widget')).toBeInTheDocument();
    });

    window.requestIdleCallback = originalRequestIdleCallback;
  });

  it('renders nothing when no widgets are enabled', async () => {
    const config = {
      ...defaultConfig,
      widgets: {
        toaster: { enabled: false },
        ctaModal: { enabled: false },
        stickyCta: { enabled: false },
        cookieManager: { enabled: false },
        serviceWorkerNotification: { enabled: false },
        accessibility: { enabled: false }
      }
    };

    render(
      <ConfigProvider value={config}>
        <DeferredWidgets />
      </ConfigProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('toaster-widget')).not.toBeInTheDocument();
    });
  });
});