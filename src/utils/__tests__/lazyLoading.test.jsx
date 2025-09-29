import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { trackError } from '@/utils/errorTracker.js';
import createLazyComponent from '../lazyLoading.jsx';

// Mock the error tracker
vi.mock('@/utils/errorTracker.js', () => ({
  trackError: vi.fn()
}));

// Mock React.lazy
vi.mock('react', async () => ({
  ...(await vi.importActual('react')),
  lazy: vi.fn()
}));

describe('createLazyComponent', () => {
  let mockLazyComponent;
  let mockError;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockError = new Error('Failed to load component');
    mockLazyComponent = vi.fn(() => 'Mock Component');

    // Mock React.lazy to return a mock component
    const React = require('react');
    React.lazy.mockReturnValue(mockLazyComponent);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('successful loading', () => {
    it('should render the lazy component successfully', () => {
      const LazyComponent = createLazyComponent(() =>
        Promise.resolve({ default: () => <div>Loaded Component</div> })
      );

      render(<LazyComponent />);

      expect(screen.getByText('Loaded Component')).toBeInTheDocument();
    });

    it('should show fallback during loading', () => {
      let resolvePromise;
      const importPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      const LazyComponent = createLazyComponent(() => importPromise);

      render(<LazyComponent />);

      expect(screen.getByText('Carregando página...')).toBeInTheDocument();

      // Resolve the promise
      act(() => {
        resolvePromise({ default: () => <div>Loaded Component</div> });
      });
    });
  });

  describe('error handling', () => {
    it('should handle chunk loading errors', async () => {
      const chunkError = new Error('ChunkLoadError: Loading chunk 3 failed');

      const LazyComponent = createLazyComponent(() =>
        Promise.reject(chunkError)
      );

      render(<LazyComponent />);

      // Wait for error to be handled
      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(screen.getByText('Erro de Conexão')).toBeInTheDocument();
      expect(screen.getByText('Módulo temporariamente indisponível')).toBeInTheDocument();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error: Failed to fetch');

      const LazyComponent = createLazyComponent(() =>
        Promise.reject(networkError)
      );

      render(<LazyComponent />);

      // Wait for error to be handled
      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(screen.getByText('Erro de Conexão')).toBeInTheDocument();
      expect(screen.getByText('Verifique sua conexão com a internet')).toBeInTheDocument();
    });

    it('should handle generic errors', async () => {
      const genericError = new Error('Generic error');

      const LazyComponent = createLazyComponent(() =>
        Promise.reject(genericError)
      );

      render(<LazyComponent />);

      // Wait for error to be handled
      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(screen.getByText('Erro ao Carregar Página')).toBeInTheDocument();
      expect(screen.getByText('Não foi possível carregar o conteúdo solicitado')).toBeInTheDocument();
    });

    it('should track errors with error tracking system', async () => {
      const testError = new Error('Test error');

      const LazyComponent = createLazyComponent(() =>
        Promise.reject(testError)
      );

      render(<LazyComponent />);

      // Wait for error to be handled
      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(trackError).toHaveBeenCalledWith(testError, expect.objectContaining({
        component: 'LazyComponentWrapper',
        retryCount: 0,
        importFn: 'dynamic-import',
        isLoading: false,
        timestamp: expect.any(String)
      }), 'lazy-loading');
    });
  });

  describe('retry logic', () => {
    it('should retry failed chunk loading with exponential backoff', async () => {
      const chunkError = new Error('ChunkLoadError: Loading chunk 3 failed');
      let attemptCount = 0;

      const mockImport = vi.fn(() => {
        attemptCount++;
        if (attemptCount <= 2) {
          return Promise.reject(chunkError);
        }
        return Promise.resolve({ default: () => <div>Finally Loaded</div> });
      });

      const LazyComponent = createLazyComponent(mockImport, 3, 1000);

      render(<LazyComponent />);

      // First attempt fails
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(screen.getByText('Tentando recarregar... (1/3)')).toBeInTheDocument();

      // Second attempt fails
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      expect(screen.getByText('Tentando recarregar... (2/3)')).toBeInTheDocument();

      // Third attempt succeeds
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000); // Exponential backoff
      });

      expect(screen.getByText('Finally Loaded')).toBeInTheDocument();
      expect(mockImport).toHaveBeenCalledTimes(3);
    });

    it('should stop retrying after max attempts', async () => {
      const chunkError = new Error('ChunkLoadError: Loading chunk 3 failed');
      const mockImport = vi.fn(() => Promise.reject(chunkError));

      const LazyComponent = createLazyComponent(mockImport, 2, 1000);

      render(<LazyComponent />);

      // First attempt fails
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Second attempt fails
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      // Should show error UI after max attempts
      expect(screen.getByText('Erro de Conexão')).toBeInTheDocument();
      expect(screen.getByText('Recarregar Página')).toBeInTheDocument();
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();

      expect(mockImport).toHaveBeenCalledTimes(2);
    });

    it('should allow manual retry after max attempts', async () => {
      const chunkError = new Error('ChunkLoadError: Loading chunk 3 failed');
      let resolvePromise;
      const mockImport = vi.fn(() => new Promise((_, reject) => {
        reject(chunkError);
      }));

      const LazyComponent = createLazyComponent(mockImport, 2, 1000);

      render(<LazyComponent />);

      // Wait for max attempts
      await act(async () => {
        await vi.runAllTimersAsync();
        await vi.advanceTimersByTimeAsync(1000);
      });

      // Should show error UI with retry buttons
      const retryButton = screen.getByText('Tentar Novamente');

      // Manually trigger retry
      await act(async () => {
        fireEvent.click(retryButton);
      });

      expect(screen.getByText('Tentando recarregar... (1/3)')).toBeInTheDocument();
    });
  });

  describe('fallback behavior', () => {
    it('should use custom fallback when provided', async () => {
      const CustomFallback = () => <div>Custom Loading...</div>;
      const CustomErrorFallback = () => <div>Custom Error</div>;

      const ErrorBoundary = ({ children, onError, fallback }) => {
        const [hasError, setHasError] = React.useState(false);

        if (hasError) {
          return fallback || <div>Error occurred</div>;
        }

        return React.createElement(React.Fragment, null, children);
      };

      // Mock the ErrorBoundary import
      const React = require('react');
      const originalCreateElement = React.createElement;
      React.createElement = jest.fn((type, props, ...children) => {
        if (type.name === 'ErrorBoundary') {
          return React.createElement(ErrorBoundary, props, ...children);
        }
        return originalCreateElement.call(React, type, props, ...children);
      });

      const LazyComponent = createLazyComponent(() =>
        Promise.reject(new Error('Test error'))
      );

      render(
        <LazyComponent fallback={<CustomFallback />} onError={() => {}} />
      );

      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    });
  });

  describe('performance considerations', () => {
    it('should cap retry delay at maximum value', async () => {
      const chunkError = new Error('ChunkLoadError: Loading chunk 3 failed');
      let attemptCount = 0;

      const mockImport = jest.fn(() => {
        attemptCount++;
        return Promise.reject(chunkError);
      });

      const LazyComponent = createLazyComponent(mockImport, 5, 1000);

      render(<LazyComponent />);

      // Let all attempts fail
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          await jest.advanceTimersByTimeAsync(5000); // Max delay
        }
      });

      // Should have attempted 5 times
      expect(mockImport).toHaveBeenCalledTimes(5);
    });

    it('should track retry attempts properly', async () => {
      const chunkError = new Error('ChunkLoadError: Loading chunk 3 failed');
      let attemptCount = 0;

      const mockImport = jest.fn(() => {
        attemptCount++;
        return Promise.reject(chunkError);
      });

      const LazyComponent = createLazyComponent(mockImport, 3, 1000);

      render(<LazyComponent />);

      // First attempt
      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(trackError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ retryCount: 0 }),
        'lazy-loading'
      );

      // Second attempt
      await act(async () => {
        await jest.advanceTimersByTimeAsync(1000);
      });

      expect(trackError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ retryCount: 1 }),
        'lazy-loading'
      );
    });
  });
});