import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DeferredWidgets from '../DeferredWidgets.jsx';
import { useConfig } from '@/config';

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
  default: () => <div data-testid="sw-notification">ServiceWorkerUpdateNotification</div>
}));

vi.mock('@/components/Accessibility.jsx', () => ({
  default: () => <div data-testid="accessibility">Accessibility</div>
}));

// Mock useConfig hook
vi.mock('@/config', () => ({
  useConfig: vi.fn()
}));

describe('DeferredWidgets', () => {
  let mockConfig;
  let requestIdleCallbackSpy;
  let cancelIdleCallbackSpy;

  beforeEach(() => {
    // Default config with all widgets enabled
    mockConfig = {
      widgets: {
        toaster: { enabled: true },
        ctaModal: { enabled: true },
        stickyCta: { enabled: true },
        cookieManager: { enabled: true },
        serviceWorkerNotification: { enabled: true },
        accessibility: { enabled: true }
      },
      features: {
        lazyWidgets: true
      }
    };

    vi.mocked(useConfig).mockReturnValue(mockConfig);

    // Mock requestIdleCallback/cancelIdleCallback
    requestIdleCallbackSpy = vi.fn((cb) => {
      setTimeout(cb, 0);
      return 123;
    });
    cancelIdleCallbackSpy = vi.fn();

    global.requestIdleCallback = requestIdleCallbackSpy;
    global.cancelIdleCallback = cancelIdleCallbackSpy;

    // Mock createPortal to render inline for testing
    vi.mock('react-dom', async () => {
      const actual = await vi.importActual('react-dom');
      return {
        ...actual,
        createPortal: (children) => children
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('container creation', () => {
    it('should create deferred-widgets container if not exists', async () => {
      render(<DeferredWidgets />);

      await waitFor(() => {
        const container = document.getElementById('deferred-widgets');
        expect(container).toBeInTheDocument();
      });
    });

    it('should use existing deferred-widgets container', async () => {
      const existingContainer = document.createElement('div');
      existingContainer.id = 'deferred-widgets';
      document.body.appendChild(existingContainer);

      render(<DeferredWidgets />);

      await waitFor(() => {
        const containers = document.querySelectorAll('#deferred-widgets');
        expect(containers).toHaveLength(1);
      });
    });

    it('should append container to document body', async () => {
      render(<DeferredWidgets />);

      await waitFor(() => {
        const container = document.getElementById('deferred-widgets');
        expect(container?.parentElement).toBe(document.body);
      });
    });
  });

  describe('lazy loading behavior', () => {
    it('should use requestIdleCallback when lazyWidgets is enabled', async () => {
      mockConfig.features.lazyWidgets = true;
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      render(<DeferredWidgets />);

      await waitFor(() => {
        expect(requestIdleCallbackSpy).toHaveBeenCalled();
      });
    });

    it('should render immediately when lazyWidgets is disabled', async () => {
      mockConfig.features.lazyWidgets = false;
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      render(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
      });
    });

    it('should fallback to setTimeout when requestIdleCallback is not available', async () => {
      global.requestIdleCallback = undefined;
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      render(<DeferredWidgets />);

      await waitFor(() => {
        expect(setTimeoutSpy).toHaveBeenCalled();
      });
    });

    it('should cleanup idle callback on unmount', () => {
      mockConfig.features.lazyWidgets = true;
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      const { unmount } = render(<DeferredWidgets />);

      unmount();

      expect(cancelIdleCallbackSpy).toHaveBeenCalled();
    });

    it('should use clearTimeout for cleanup when cancelIdleCallback unavailable', () => {
      global.cancelIdleCallback = undefined;
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = render(<DeferredWidgets />);

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('widget rendering', () => {
    it('should render all enabled widgets', async () => {
      render(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
        expect(screen.getByTestId('cta-modal')).toBeInTheDocument();
        expect(screen.getByTestId('sticky-cta')).toBeInTheDocument();
        expect(screen.getByTestId('cookie-manager')).toBeInTheDocument();
        expect(screen.getByTestId('sw-notification')).toBeInTheDocument();
        expect(screen.getByTestId('accessibility')).toBeInTheDocument();
      });
    });

    it('should not render disabled widgets', async () => {
      mockConfig.widgets.toaster.enabled = false;
      mockConfig.widgets.ctaModal.enabled = false;
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      render(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.queryByTestId('toaster')).not.toBeInTheDocument();
        expect(screen.queryByTestId('cta-modal')).not.toBeInTheDocument();
        expect(screen.getByTestId('sticky-cta')).toBeInTheDocument();
      });
    });

    it('should render only toaster when only toaster is enabled', async () => {
      mockConfig.widgets = {
        toaster: { enabled: true },
        ctaModal: { enabled: false },
        stickyCta: { enabled: false },
        cookieManager: { enabled: false },
        serviceWorkerNotification: { enabled: false },
        accessibility: { enabled: false }
      };
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      render(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
        expect(screen.queryByTestId('cta-modal')).not.toBeInTheDocument();
        expect(screen.queryByTestId('sticky-cta')).not.toBeInTheDocument();
      });
    });

    it('should render nothing when all widgets are disabled', async () => {
      mockConfig.widgets = {
        toaster: { enabled: false },
        ctaModal: { enabled: false },
        stickyCta: { enabled: false },
        cookieManager: { enabled: false },
        serviceWorkerNotification: { enabled: false },
        accessibility: { enabled: false }
      };
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      const { container } = render(<DeferredWidgets />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should return null when container is not ready', () => {
      const { container } = render(<DeferredWidgets />);

      // Before container is created
      expect(container.firstChild).toBeNull();
    });

    it('should return null when not ready (lazy loading)', () => {
      mockConfig.features.lazyWidgets = true;
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      const { container } = render(<DeferredWidgets />);

      // Before idle callback fires
      expect(container.firstChild).toBeNull();
    });
  });

  describe('config changes', () => {
    it('should update widgets when config changes', async () => {
      const { rerender } = render(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
      });

      // Disable toaster
      mockConfig.widgets.toaster.enabled = false;
      vi.mocked(useConfig).mockReturnValue({ ...mockConfig });

      rerender(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.queryByTestId('toaster')).not.toBeInTheDocument();
      });
    });

    it('should handle adding widgets dynamically', async () => {
      mockConfig.widgets.toaster.enabled = false;
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      const { rerender } = render(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.queryByTestId('toaster')).not.toBeInTheDocument();
      });

      // Enable toaster
      mockConfig.widgets.toaster.enabled = true;
      vi.mocked(useConfig).mockReturnValue({ ...mockConfig });

      rerender(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing widget config gracefully', async () => {
      mockConfig.widgets = {};
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      const { container } = render(<DeferredWidgets />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should handle undefined enabled flags', async () => {
      mockConfig.widgets.toaster = {};
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      render(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.queryByTestId('toaster')).not.toBeInTheDocument();
      });
    });

    it('should handle null config', async () => {
      mockConfig.widgets = null;
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      expect(() => render(<DeferredWidgets />)).not.toThrow();
    });

    it('should handle rapid mount/unmount cycles', () => {
      const { unmount } = render(<DeferredWidgets />);
      unmount();
      
      const { unmount: unmount2 } = render(<DeferredWidgets />);
      unmount2();

      expect(() => render(<DeferredWidgets />)).not.toThrow();
    });
  });

  describe('performance', () => {
    it('should defer widget rendering with requestIdleCallback', async () => {
      mockConfig.features.lazyWidgets = true;
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      render(<DeferredWidgets />);

      expect(screen.queryByTestId('toaster')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
      });
    });

    it('should load all widgets in a single render when ready', async () => {
      mockConfig.features.lazyWidgets = false;
      vi.mocked(useConfig).mockReturnValue(mockConfig);

      render(<DeferredWidgets />);

      await waitFor(() => {
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
        expect(screen.getByTestId('cta-modal')).toBeInTheDocument();
        expect(screen.getByTestId('sticky-cta')).toBeInTheDocument();
        expect(screen.getByTestId('cookie-manager')).toBeInTheDocument();
        expect(screen.getByTestId('sw-notification')).toBeInTheDocument();
        expect(screen.getByTestId('accessibility')).toBeInTheDocument();
      });
    });
  });
});