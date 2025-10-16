import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ConfigProvider, useConfig } from '../ConfigProvider.jsx';

describe('ConfigProvider', () => {
  it('provides config to child components via context', () => {
    const testConfig = {
      app: { environment: 'test' },
      analytics: { gaId: 'G-TEST' }
    };

    const TestComponent = () => {
      const config = useConfig();
      return <div data-testid="config-display">{config.analytics.gaId}</div>;
    };

    render(
      <ConfigProvider value={testConfig}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(screen.getByTestId('config-display')).toHaveTextContent('G-TEST');
  });

  it('creates default config when no value provided', () => {
    const TestComponent = () => {
      const config = useConfig();
      return <div data-testid="config-env">{config.app.environment}</div>;
    };

    render(
      <ConfigProvider>
        <TestComponent />
      </ConfigProvider>
    );

    expect(screen.getByTestId('config-env')).toBeTruthy();
  });

  it('memoizes config value to prevent unnecessary re-renders', () => {
    const renderSpy = vi.fn();
    const testConfig = {
      app: { environment: 'test' },
      analytics: { gaId: 'G-TEST' }
    };

    const TestComponent = () => {
      const config = useConfig();
      renderSpy();
      return <div>{config.analytics.gaId}</div>;
    };

    const { rerender } = render(
      <ConfigProvider value={testConfig}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Re-render with same config reference
    rerender(
      <ConfigProvider value={testConfig}>
        <TestComponent />
      </ConfigProvider>
    );

    // Should only render once due to memoization
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('updates when config value changes', () => {
    const config1 = {
      app: { environment: 'test' },
      analytics: { gaId: 'G-TEST1' }
    };
    const config2 = {
      app: { environment: 'test' },
      analytics: { gaId: 'G-TEST2' }
    };

    const TestComponent = () => {
      const config = useConfig();
      return <div data-testid="config-display">{config.analytics.gaId}</div>;
    };

    const { rerender } = render(
      <ConfigProvider value={config1}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(screen.getByTestId('config-display')).toHaveTextContent('G-TEST1');

    rerender(
      <ConfigProvider value={config2}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(screen.getByTestId('config-display')).toHaveTextContent('G-TEST2');
  });

  it('throws error when useConfig is used outside ConfigProvider', () => {
    const TestComponent = () => {
      useConfig();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponent />)).toThrow(
      'useConfig must be used within a ConfigProvider'
    );

    console.error = originalError;
  });

  it('allows multiple consumers of the same context', () => {
    const testConfig = {
      app: { environment: 'test' },
      analytics: { gaId: 'G-TEST' }
    };

    const Consumer1 = () => {
      const config = useConfig();
      return <div data-testid="consumer1">{config.app.environment}</div>;
    };

    const Consumer2 = () => {
      const config = useConfig();
      return <div data-testid="consumer2">{config.analytics.gaId}</div>;
    };

    render(
      <ConfigProvider value={testConfig}>
        <Consumer1 />
        <Consumer2 />
      </ConfigProvider>
    );

    expect(screen.getByTestId('consumer1')).toHaveTextContent('test');
    expect(screen.getByTestId('consumer2')).toHaveTextContent('G-TEST');
  });

  it('provides deeply nested config values', () => {
    const testConfig = {
      widgets: {
        accessibility: { enabled: true },
        stickyCta: { enabled: false }
      }
    };

    const TestComponent = () => {
      const config = useConfig();
      return (
        <div>
          <span data-testid="a11y">
            {config.widgets.accessibility.enabled.toString()}
          </span>
          <span data-testid="cta">
            {config.widgets.stickyCta.enabled.toString()}
          </span>
        </div>
      );
    };

    render(
      <ConfigProvider value={testConfig}>
        <TestComponent />
      </ConfigProvider>
    );

    expect(screen.getByTestId('a11y')).toHaveTextContent('true');
    expect(screen.getByTestId('cta')).toHaveTextContent('false');
  });

  it('renders children correctly', () => {
    const testConfig = { app: { environment: 'test' } };

    render(
      <ConfigProvider value={testConfig}>
        <div data-testid="child">Child Component</div>
      </ConfigProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Child Component');
  });
});