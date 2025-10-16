import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ConfigProvider, useConfig } from '../ConfigProvider.jsx';
import createConfig from '../createConfig.js';

vi.mock('../createConfig.js', () => ({
  default: vi.fn(() => ({
    app: { environment: 'test', version: '1.0.0' },
    analytics: { enabled: false, gaId: 'G-TEST' },
    widgets: { toaster: { enabled: true } },
    features: { lazyWidgets: true }
  }))
}));

describe('ConfigProvider', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(
        <ConfigProvider>
          <div>Test Child</div>
        </ConfigProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ConfigProvider>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ConfigProvider>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      const NestedComponent = () => <span>Nested</span>;

      render(
        <ConfigProvider>
          <div>
            <NestedComponent />
          </div>
        </ConfigProvider>
      );

      expect(screen.getByText('Nested')).toBeInTheDocument();
    });
  });

  describe('config creation', () => {
    it('should create default config when no value provided', () => {
      const TestComponent = () => {
        const config = useConfig();
        return <div>{config.app.version}</div>;
      };

      render(
        <ConfigProvider>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByText('1.0.0')).toBeInTheDocument();
      expect(createConfig).toHaveBeenCalled();
    });

    it('should use provided config value', () => {
      const customConfig = {
        app: { environment: 'custom', version: '2.0.0' },
        analytics: { enabled: true, gaId: 'G-CUSTOM' },
        widgets: {},
        features: {}
      };

      const TestComponent = () => {
        const config = useConfig();
        return <div>{config.app.version}</div>;
      };

      render(
        <ConfigProvider value={customConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByText('2.0.0')).toBeInTheDocument();
    });

    it('should memoize config value', () => {
      const customConfig = {
        app: { environment: 'test', version: '1.0.0' },
        analytics: { enabled: false },
        widgets: {},
        features: {}
      };

      let renderCount = 0;
      const TestComponent = () => {
        const config = useConfig();
        renderCount++;
        return <div>{config.app.version}</div>;
      };

      const { rerender } = render(
        <ConfigProvider value={customConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      const initialRenderCount = renderCount;

      // Rerender with same value
      rerender(
        <ConfigProvider value={customConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(renderCount).toBe(initialRenderCount + 1); // Only increment by 1
    });

    it('should update config when value prop changes', () => {
      const config1 = {
        app: { environment: 'test', version: '1.0.0' },
        analytics: { enabled: false },
        widgets: {},
        features: {}
      };

      const config2 = {
        app: { environment: 'test', version: '2.0.0' },
        analytics: { enabled: false },
        widgets: {},
        features: {}
      };

      const TestComponent = () => {
        const config = useConfig();
        return <div>{config.app.version}</div>;
      };

      const { rerender } = render(
        <ConfigProvider value={config1}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByText('1.0.0')).toBeInTheDocument();

      rerender(
        <ConfigProvider value={config2}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByText('2.0.0')).toBeInTheDocument();
    });
  });

  describe('useConfig hook', () => {
    it('should return config from context', () => {
      const customConfig = {
        app: { environment: 'production', version: '3.0.0' },
        analytics: { enabled: true, gaId: 'G-PROD' },
        widgets: { toaster: { enabled: false } },
        features: { lazyWidgets: false }
      };

      const TestComponent = () => {
        const config = useConfig();
        return (
          <div>
            <div>{config.app.environment}</div>
            <div>{config.analytics.gaId}</div>
            <div>{config.features.lazyWidgets.toString()}</div>
          </div>
        );
      };

      render(
        <ConfigProvider value={customConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByText('production')).toBeInTheDocument();
      expect(screen.getByText('G-PROD')).toBeInTheDocument();
      expect(screen.getByText('false')).toBeInTheDocument();
    });

    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        const config = useConfig();
        return <div>{config.app.version}</div>;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useConfig must be used within a ConfigProvider');
    });

    it('should work with multiple consumers', () => {
      const customConfig = {
        app: { environment: 'test', version: '1.0.0' },
        analytics: { enabled: false, gaId: 'G-TEST' },
        widgets: {},
        features: {}
      };

      const Consumer1 = () => {
        const config = useConfig();
        return <div>Consumer1: {config.analytics.gaId}</div>;
      };

      const Consumer2 = () => {
        const config = useConfig();
        return <div>Consumer2: {config.analytics.gaId}</div>;
      };

      render(
        <ConfigProvider value={customConfig}>
          <Consumer1 />
          <Consumer2 />
        </ConfigProvider>
      );

      expect(screen.getByText('Consumer1: G-TEST')).toBeInTheDocument();
      expect(screen.getByText('Consumer2: G-TEST')).toBeInTheDocument();
    });

    it('should return same config object to all consumers', () => {
      const customConfig = {
        app: { environment: 'test', version: '1.0.0' },
        analytics: { enabled: false },
        widgets: {},
        features: {}
      };

      let config1, config2;

      const Consumer1 = () => {
        config1 = useConfig();
        return null;
      };

      const Consumer2 = () => {
        config2 = useConfig();
        return null;
      };

      render(
        <ConfigProvider value={customConfig}>
          <Consumer1 />
          <Consumer2 />
        </ConfigProvider>
      );

      expect(config1).toBe(config2);
    });
  });

  describe('nested providers', () => {
    it('should support nested providers with different configs', () => {
      const outerConfig = {
        app: { environment: 'outer', version: '1.0.0' },
        analytics: { enabled: false },
        widgets: {},
        features: {}
      };

      const innerConfig = {
        app: { environment: 'inner', version: '2.0.0' },
        analytics: { enabled: true },
        widgets: {},
        features: {}
      };

      const OuterConsumer = () => {
        const config = useConfig();
        return <div>Outer: {config.app.environment}</div>;
      };

      const InnerConsumer = () => {
        const config = useConfig();
        return <div>Inner: {config.app.environment}</div>;
      };

      render(
        <ConfigProvider value={outerConfig}>
          <OuterConsumer />
          <ConfigProvider value={innerConfig}>
            <InnerConsumer />
          </ConfigProvider>
        </ConfigProvider>
      );

      expect(screen.getByText('Outer: outer')).toBeInTheDocument();
      expect(screen.getByText('Inner: inner')).toBeInTheDocument();
    });
  });

  describe('config access patterns', () => {
    it('should allow accessing nested config properties', () => {
      const customConfig = {
        app: { environment: 'test', version: '1.0.0' },
        analytics: { enabled: false, gaId: 'G-TEST', gtmId: 'GTM-TEST' },
        widgets: {
          toaster: { enabled: true },
          ctaModal: { enabled: false }
        },
        features: { lazyWidgets: true }
      };

      const TestComponent = () => {
        const config = useConfig();
        return (
          <div>
            <div>{config.widgets.toaster.enabled.toString()}</div>
            <div>{config.widgets.ctaModal.enabled.toString()}</div>
            <div>{config.analytics.gtmId}</div>
          </div>
        );
      };

      render(
        <ConfigProvider value={customConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByText('true')).toBeInTheDocument();
      expect(screen.getByText('false')).toBeInTheDocument();
      expect(screen.getByText('GTM-TEST')).toBeInTheDocument();
    });

    it('should handle conditional rendering based on config', () => {
      const customConfig = {
        app: { environment: 'test', version: '1.0.0' },
        analytics: { enabled: true },
        widgets: {},
        features: { lazyWidgets: false }
      };

      const TestComponent = () => {
        const config = useConfig();
        return (
          <div>
            {config.analytics.enabled && <div>Analytics Enabled</div>}
            {config.features.lazyWidgets && <div>Lazy Widgets Enabled</div>}
          </div>
        );
      };

      render(
        <ConfigProvider value={customConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByText('Analytics Enabled')).toBeInTheDocument();
      expect(screen.queryByText('Lazy Widgets Enabled')).not.toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should not recreate config on every render', () => {
      let configInstance1, configInstance2;

      const TestComponent = () => {
        configInstance1 = useConfig();
        return null;
      };

      const { rerender } = render(
        <ConfigProvider>
          <TestComponent />
        </ConfigProvider>
      );

      const FirstInstance = () => {
        configInstance2 = useConfig();
        return null;
      };

      rerender(
        <ConfigProvider>
          <FirstInstance />
        </ConfigProvider>
      );

      expect(configInstance1).toBe(configInstance2);
    });
  });

  describe('hook usage with renderHook', () => {
    it('should work with renderHook utility', () => {
      const customConfig = {
        app: { environment: 'test', version: '1.0.0' },
        analytics: { enabled: false },
        widgets: {},
        features: {}
      };

      const wrapper = ({ children }) => (
        <ConfigProvider value={customConfig}>{children}</ConfigProvider>
      );

      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current).toBe(customConfig);
      expect(result.current.app.version).toBe('1.0.0');
    });

    it('should throw error when hook used without wrapper', () => {
      expect(() => {
        renderHook(() => useConfig());
      }).toThrow('useConfig must be used within a ConfigProvider');
    });
  });

  describe('edge cases', () => {
    it('should handle null children', () => {
      render(<ConfigProvider>{null}</ConfigProvider>);
      // Should not throw
    });

    it('should handle undefined children', () => {
      render(<ConfigProvider>{undefined}</ConfigProvider>);
      // Should not throw
    });

    it('should handle empty children', () => {
      render(<ConfigProvider></ConfigProvider>);
      // Should not throw
    });

    it('should handle config with missing properties', () => {
      const incompleteConfig = {
        app: { environment: 'test' }
        // Missing analytics, widgets, features
      };

      const TestComponent = () => {
        const config = useConfig();
        return <div>{config.app.environment}</div>;
      };

      render(
        <ConfigProvider value={incompleteConfig}>
          <TestComponent />
        </ConfigProvider>
      );

      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });
});