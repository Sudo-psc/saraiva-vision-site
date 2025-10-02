import { env } from '@/utils/env';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary.jsx';
import { trackComponentError } from '@/utils/errorTracker.js';

// Mock the error tracker
jest.mock('@/utils/errorTracker.js', () => ({
  trackComponentError: jest.fn()
}));

// Mock the redirectToBackup function
jest.mock('@/utils/redirectToBackup.js', () => ({
  redirectToBackup: jest.fn()
}));

describe('ErrorBoundary', () => {
  let consoleSpy;
  let sessionStorageSpy;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock console.error to suppress noise in tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock sessionStorage
    sessionStorageSpy = jest.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    sessionStorageSpy.mockRestore();
  });

  const ErrorComponent = () => {
    throw new Error('Test error');
  };

  const WorkingComponent = () => <div>Working component</div>;

  describe('error handling', () => {
    it('should catch errors in child components', () => {
      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Ocorreu um erro inesperado')).toBeInTheDocument();
      expect(screen.getByText('Recarregar Página')).toBeInTheDocument();
    });

    it('should display working components normally', () => {
      render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    it('should handle chunk load errors', () => {
      const chunkError = new Error('ChunkLoadError: Loading chunk 3 failed');

      const ThrowChunkError = () => {
        throw chunkError;
      };

      render(
        <ErrorBoundary>
          <ThrowChunkError />
        </ErrorBoundary>
      );

      expect(trackComponentError).toHaveBeenCalledWith(
        'ErrorBoundary',
        chunkError,
        expect.any(String)
      );
    });

    it('should handle network errors', () => {
      const networkError = new Error('NetworkError: Failed to fetch');

      const ThrowNetworkError = () => {
        throw networkError;
      };

      render(
        <ErrorBoundary>
          <ThrowNetworkError />
        </ErrorBoundary>
      );

      expect(trackComponentError).toHaveBeenCalledWith(
        'ErrorBoundary',
        networkError,
        expect.any(String)
      );
    });

    it('should handle authentication errors', () => {
      const authError = new Error('401 Unauthorized');

      const ThrowAuthError = () => {
        throw authError;
      };

      render(
        <ErrorBoundary>
          <ThrowAuthError />
        </ErrorBoundary>
      );

      expect(trackComponentError).toHaveBeenCalledWith(
        'ErrorBoundary',
        authError,
        expect.any(String)
      );
    });

    it('should handle null reference errors', () => {
      const nullError = new Error('Cannot read properties of null');

      const ThrowNullError = () => {
        throw nullError;
      };

      render(
        <ErrorBoundary>
          <ThrowNullError />
        </ErrorBoundary>
      );

      expect(trackComponentError).toHaveBeenCalledWith(
        'ErrorBoundary',
        nullError,
        expect.any(String)
      );
    });
  });

  describe('error details display', () => {
    it('should show error details in development mode', () => {
      const originalEnv = env.DEV;
      env.DEV = true;

      const testError = new Error('Test error message');

      const ThrowTestError = () => {
        throw testError;
      };

      render(
        <ErrorBoundary>
          <ThrowTestError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Detalhes do Erro (DEV)')).toBeInTheDocument();

      env.DEV = originalEnv;
    });

    it('should hide error details in production mode', () => {
      const originalEnv = env.DEV;
      env.DEV = false;

      const testError = new Error('Test error message');

      const ThrowTestError = () => {
        throw testError;
      };

      render(
        <ErrorBoundary>
          <ThrowTestError />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Detalhes do Erro (DEV)')).not.toBeInTheDocument();

      env.DEV = originalEnv;
    });
  });

  describe('error tracking', () => {
    it('should track component errors with stack trace', () => {
      const testError = new Error('Test error');
      testError.stack = 'Error: Test error\n    at Component (/path/to/component.js:10:5)';

      const ThrowTestError = () => {
        throw testError;
      };

      render(
        <ErrorBoundary>
          <ThrowTestError />
        </ErrorBoundary>
      );

      expect(trackComponentError).toHaveBeenCalledWith(
        'ErrorBoundary',
        testError,
        expect.any(String)
      );
    });

    it('should save error details to sessionStorage', () => {
      const testError = new Error('Test error message');
      testError.stack = 'Test stack trace';

      const ThrowTestError = () => {
        throw testError;
      };

      render(
        <ErrorBoundary>
          <ThrowTestError />
        </ErrorBoundary>
      );

      expect(sessionStorageSpy).toHaveBeenCalledWith(
        'lastError',
        expect.stringContaining('"message":"Test error message"')
      );
    });

    it('should handle sessionStorage save failures gracefully', () => {
      const testError = new Error('Test error');

      const ThrowTestError = () => {
        throw testError;
      };

      // Mock sessionStorage.setItem to throw
      sessionStorageSpy.mockImplementation(() => {
        throw new Error('sessionStorage full');
      });

      render(
        <ErrorBoundary>
          <ThrowTestError />
        </ErrorBoundary>
      );

      // Should not throw, should still render error UI
      expect(screen.getByText('Ocorreu um erro inesperado')).toBeInTheDocument();
    });
  });
});