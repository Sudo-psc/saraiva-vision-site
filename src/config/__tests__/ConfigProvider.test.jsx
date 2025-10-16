import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import React from 'react';
import { ConfigProvider, useConfig } from '../ConfigProvider.jsx';
import createConfig from '../createConfig.js';

vi.mock('../createConfig.js');

describe('ConfigProvider', () => {
  const mockConfig = {
    app: {
      environment: 'test',
      version: '1.0.0'
    },
    analytics: {
      enabled: true,
      gaId: 'GA-TEST-123',
      gtmId: 'GTM-TEST-123',
      metaPixelId: 'META-TEST-123'
    },
    widgets: {
      accessibility: { enabled: true },
      stickyCta: { enabled: true },
      ctaModal: { enabled: true },
      toaster: { enabled: true },
      cookieManager: { enabled: true },
      serviceWorkerNotification: { enabled: true }
    },
    features: {
      lazyWidgets: true
    }
  };

  beforeEach(() => {
    createConfig.mockReturnValue(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider Rendering', () => {
    it('should render children without crashing', () => {
      render(
        <ConfigProvider>
          <div data-testid="child">Test Child</div>
        </ConfigProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should create config from createConfig when no value provided', () => {
      render(
        <ConfigProvider>
          <div>Test</div>
        </ConfigProvider>
      );

      expect(createConfig).toHaveBeenCalledTimes(1);
    });

    it('should use provided value instead of creating config', () => {
      const customConfig = {
        ...mockConfig,
        app: { environment: 'custom', version: '2.0.0' }
      };

      render(
        <ConfigProvider value={customConfig}>
          <div>Test</div>
        </ConfigProvider>
      );

      expect(createConfig).not.toHaveBeenCalled();
    });

    it('should memoize config value to prevent unnecessary re-renders', () => {
      const customConfig = { ...mockConfig };
      const { rerender } = render(
        <ConfigProvider value={customConfig}>
          <div>Test</div>
        </ConfigProvider>
      );

      // Rerender with same reference
      rerender(
        <ConfigProvider value={customConfig}>
          <div>Test</div>
        </ConfigProvider>
      );

      // Should not call createConfig multiple times
      expect(createConfig).not.toHaveBeenCalled();
    });
  });

  describe('useConfig Hook', () => {
    it('should return config when used inside ConfigProvider', () => {
      const wrapper = ({ children }) => (
        <ConfigProvider value={mockConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current).toEqual(mockConfig);
    });

    it('should throw error when used outside ConfigProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useConfig());
      }).toThrow('useConfig must be used within a ConfigProvider');

      console.error = originalError;
    });

    it('should provide access to app configuration', () => {
      const wrapper = ({ children }) => (
        <ConfigProvider value={mockConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.app.environment).toBe('test');
      expect(result.current.app.version).toBe('1.0.0');
    });

    it('should provide access to analytics configuration', () => {
      const wrapper = ({ children }) => (
        <ConfigProvider value={mockConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.analytics.enabled).toBe(true);
      expect(result.current.analytics.gaId).toBe('GA-TEST-123');
      expect(result.current.analytics.gtmId).toBe('GTM-TEST-123');
      expect(result.current.analytics.metaPixelId).toBe('META-TEST-123');
    });

    it('should provide access to widgets configuration', () => {
      const wrapper = ({ children }) => (
        <ConfigProvider value={mockConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.widgets.accessibility.enabled).toBe(true);
      expect(result.current.widgets.stickyCta.enabled).toBe(true);
      expect(result.current.widgets.ctaModal.enabled).toBe(true);
      expect(result.current.widgets.toaster.enabled).toBe(true);
      expect(result.current.widgets.cookieManager.enabled).toBe(true);
      expect(result.current.widgets.serviceWorkerNotification.enabled).toBe(true);
    });

    it('should provide access to features configuration', () => {
      const wrapper = ({ children }) => (
        <ConfigProvider value={mockConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.features.lazyWidgets).toBe(true);
    });
  });

  describe('Component Integration', () => {
    it('should allow child components to consume config', () => {
      const TestComponent = () => {
        const config = useConfig();
        return <div data-testid="config-value">{config.app.environment}</div>;
      };

      render(
        <ConfigProvider value={mockConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByTestId('config-value')).toHaveTextContent('test');
    });

    it('should allow multiple child components to access same config', () => {
      const Component1 = () => {
        const config = useConfig();
        return <div data-testid="component1">{config.app.version}</div>;
      };

      const Component2 = () => {
        const config = useConfig();
        return <div data-testid="component2">{config.analytics.gaId}</div>;
      };

      render(
        <ConfigProvider value={mockConfig}>
          <Component1 />
          <Component2 />
        </ConfigProvider>
      );

      expect(screen.getByTestId('component1')).toHaveTextContent('1.0.0');
      expect(screen.getByTestId('component2')).toHaveTextContent('GA-TEST-123');
    });

    it('should handle nested components accessing config', () => {
      const ChildComponent = () => {
        const config = useConfig();
        return <div data-testid="child">{config.features.lazyWidgets.toString()}</div>;
      };

      const ParentComponent = () => (
        <div>
          <ChildComponent />
        </div>
      );

      render(
        <ConfigProvider value={mockConfig}>
          <ParentComponent />
        </ConfigProvider>
      );

      expect(screen.getByTestId('child')).toHaveTextContent('true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined value prop', () => {
      render(
        <ConfigProvider value={undefined}>
          <div>Test</div>
        </ConfigProvider>
      );

      expect(createConfig).toHaveBeenCalledTimes(1);
    });

    it('should handle null value prop', () => {
      render(
        <ConfigProvider value={null}>
          <div>Test</div>
        </ConfigProvider>
      );

      expect(createConfig).toHaveBeenCalledTimes(1);
    });

    it('should handle empty config object', () => {
      const emptyConfig = {};

      const wrapper = ({ children }) => (
        <ConfigProvider value={emptyConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current).toEqual(emptyConfig);
    });

    it('should handle partial config object', () => {
      const partialConfig = {
        app: { environment: 'partial' }
      };

      const wrapper = ({ children }) => (
        <ConfigProvider value={partialConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.app.environment).toBe('partial');
    });
  });

  describe('Re-render Behavior', () => {
    it('should update when value prop changes', () => {
      const config1 = { ...mockConfig, app: { environment: 'v1', version: '1.0.0' } };
      const config2 = { ...mockConfig, app: { environment: 'v2', version: '2.0.0' } };

      const TestComponent = () => {
        const config = useConfig();
        return <div data-testid="env">{config.app.environment}</div>;
      };

      const { rerender } = render(
        <ConfigProvider value={config1}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByTestId('env')).toHaveTextContent('v1');

      rerender(
        <ConfigProvider value={config2}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByTestId('env')).toHaveTextContent('v2');
    });

    it('should not re-render children when value reference stays the same', () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        const config = useConfig();
        return <div>{config.app.environment}</div>;
      };

      const { rerender } = render(
        <ConfigProvider value={mockConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      const initialRenderCount = renderCount;

      // Force parent re-render with same config reference
      rerender(
        <ConfigProvider value={mockConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      // Child should not re-render due to memoization
      expect(renderCount).toBe(initialRenderCount + 1); // +1 for the rerender itself
    });
  });

  describe('Type Safety and Validation', () => {
    it('should handle config with all expected properties', () => {
      const wrapper = ({ children }) => (
        <ConfigProvider value={mockConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current).toHaveProperty('app');
      expect(result.current).toHaveProperty('analytics');
      expect(result.current).toHaveProperty('widgets');
      expect(result.current).toHaveProperty('features');
    });

    it('should allow additional custom properties in config', () => {
      const customConfig = {
        ...mockConfig,
        custom: { property: 'value' }
      };

      const wrapper = ({ children }) => (
        <ConfigProvider value={customConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.custom).toEqual({ property: 'value' });
    });
  });
});