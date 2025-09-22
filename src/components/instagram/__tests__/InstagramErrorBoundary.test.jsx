import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstagramErrorBoundary from '../InstagramErrorBoundary';
import instagramErrorHandler from '../../../services/instagramErrorHandler';
import instagramErrorRecovery from '../../../services/instagramErrorRecovery';

// Mock the services
vi.mock('../../../services/instagramErrorHandler');
vi.mock('../../../services/instagramErrorRecovery');

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
    console.error = vi.fn();
});

afterEach(() => {
    console.error = originalConsoleError;
    vi.clearAllMocks();
});

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
    if (shouldThrow) {
        throw new Error(errorMessage);
    }
    return <div>No error</div>;
};

describe('InstagramErrorBoundary', () => {
    beforeEach(() => {
        // Mock error handler response
        instagramErrorHandler.handleError.mockResolvedValue({
            success: false,
            error: {
                id: 'test-error-id',
                type: 'component',
                severity: 'medium',
                message: 'Test error message'
            },
            shouldShowFallback: true,
            userMessage: {
                title: 'Component Error',
                message: 'Something went wrong',
                suggestion: 'Try refreshing'
            }
        });

        // Mock error recovery response
        instagramErrorRecovery.attemptRecovery.mockResolvedValue({
            success: true,
            recoveryId: 'test-recovery-id',
            strategy: 'component-reset',
            recoveryTime: 1000
        });
    });

    it('renders children when there is no error', () => {
        render(
            <InstagramErrorBoundary>
                <ThrowError shouldThrow={false} />
            </InstagramErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('catches errors and displays fallback UI', async () => {
        render(
            <InstagramErrorBoundary>
                <ThrowError shouldThrow={true} errorMessage="Test component error" />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.getByText('Something went wrong with Instagram content')).toBeInTheDocument();
        });

        expect(screen.getByText(/We encountered an error while loading Instagram content/)).toBeInTheDocument();
        expect(screen.getByText('Error ID:')).toBeInTheDocument();
        expect(screen.getByText('test-error-id')).toBeInTheDocument();
    });

    it('calls error handler service when error occurs', async () => {
        render(
            <InstagramErrorBoundary componentName="TestComponent">
                <ThrowError shouldThrow={true} errorMessage="Service test error" />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(instagramErrorHandler.handleError).toHaveBeenCalledWith(
                expect.any(Error),
                expect.objectContaining({
                    operation: 'component_render',
                    component: 'TestComponent',
                    errorBoundary: true
                })
            );
        });
    });

    it('displays retry button and handles retry', async () => {
        render(
            <InstagramErrorBoundary maxRetries={3}>
                <ThrowError shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        });

        const retryButton = screen.getByRole('button', { name: /try again/i });
        fireEvent.click(retryButton);

        // Should attempt to re-render the component
        await waitFor(() => {
            expect(screen.queryByText('Something went wrong with Instagram content')).not.toBeInTheDocument();
        });
    });

    it('displays smart recovery button when enabled', async () => {
        render(
            <InstagramErrorBoundary enableRecovery={true}>
                <ThrowError shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /smart recovery/i })).toBeInTheDocument();
        });
    });

    it('handles smart recovery process', async () => {
        render(
            <InstagramErrorBoundary enableRecovery={true}>
                <ThrowError shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            const recoveryButton = screen.getByRole('button', { name: /smart recovery/i });
            fireEvent.click(recoveryButton);
        });

        await waitFor(() => {
            expect(instagramErrorRecovery.attemptRecovery).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByText(/Recovery successful/)).toBeInTheDocument();
        });
    });

    it('handles failed recovery', async () => {
        instagramErrorRecovery.attemptRecovery.mockResolvedValue({
            success: false,
            error: 'Recovery failed'
        });

        render(
            <InstagramErrorBoundary enableRecovery={true}>
                <ThrowError shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            const recoveryButton = screen.getByRole('button', { name: /smart recovery/i });
            fireEvent.click(recoveryButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/Recovery failed: Recovery failed/)).toBeInTheDocument();
        });
    });

    it('limits retry attempts', async () => {
        render(
            <InstagramErrorBoundary maxRetries={2}>
                <ThrowError shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            const retryButton = screen.getByRole('button', { name: /try again/i });

            // First retry
            fireEvent.click(retryButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Retry attempts: 1/2')).toBeInTheDocument();
        });

        await waitFor(() => {
            const retryButton = screen.getByRole('button', { name: /try again/i });

            // Second retry
            fireEvent.click(retryButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Retry attempts: 2/2')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
        });
    });

    it('handles reset functionality', async () => {
        render(
            <InstagramErrorBoundary>
                <ThrowError shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            const resetButton = screen.getByRole('button', { name: /reset/i });
            fireEvent.click(resetButton);
        });

        // Should reset the error state
        await waitFor(() => {
            expect(screen.queryByText('Something went wrong with Instagram content')).not.toBeInTheDocument();
        });
    });

    it('calls onError callback when provided', async () => {
        const onErrorMock = vi.fn();

        render(
            <InstagramErrorBoundary onError={onErrorMock}>
                <ThrowError shouldThrow={true} errorMessage="Callback test error" />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(onErrorMock).toHaveBeenCalledWith(
                expect.any(Error),
                expect.any(Object),
                expect.any(Object)
            );
        });
    });

    it('sanitizes props before logging', () => {
        const boundary = new InstagramErrorBoundary({
            accessToken: 'secret-token',
            apiKey: 'secret-key',
            normalProp: 'normal-value',
            longProp: 'a'.repeat(150)
        });

        const sanitized = boundary.sanitizeProps(boundary.props);

        expect(sanitized.accessToken).toBeUndefined();
        expect(sanitized.apiKey).toBeUndefined();
        expect(sanitized.normalProp).toBe('normal-value');
        expect(sanitized.longProp).toHaveLength(103); // 100 chars + '...'
    });

    it('shows error details in development mode', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        render(
            <InstagramErrorBoundary showErrorDetails={true}>
                <ThrowError shouldThrow={true} errorMessage="Development error" />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.getByText('Technical Details (Development)')).toBeInTheDocument();
        });

        process.env.NODE_ENV = originalEnv;
    });

    it('hides error details in production mode', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        render(
            <InstagramErrorBoundary showErrorDetails={false}>
                <ThrowError shouldThrow={true} errorMessage="Production error" />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
        });

        process.env.NODE_ENV = originalEnv;
    });

    it('uses custom fallback component when provided', async () => {
        const CustomFallback = ({ error, onRetry }) => (
            <div>
                <h1>Custom Error UI</h1>
                <p>Error: {error.message}</p>
                <button onClick={onRetry}>Custom Retry</button>
            </div>
        );

        render(
            <InstagramErrorBoundary fallbackComponent={CustomFallback}>
                <ThrowError shouldThrow={true} errorMessage="Custom fallback error" />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
            expect(screen.getByText('Error: Custom fallback error')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Custom Retry' })).toBeInTheDocument();
        });
    });

    it('handles report error functionality', async () => {
        // Mock alert
        window.alert = vi.fn();

        render(
            <InstagramErrorBoundary>
                <ThrowError shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            const reportButton = screen.getByRole('button', { name: /report issue/i });
            fireEvent.click(reportButton);
        });

        expect(window.alert).toHaveBeenCalledWith('Error report sent. Thank you for helping us improve!');
    });

    it('prevents recovery when disabled', async () => {
        render(
            <InstagramErrorBoundary enableRecovery={false}>
                <ThrowError shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /smart recovery/i })).not.toBeInTheDocument();
        });
    });

    it('shows loading state during recovery', async () => {
        // Mock a slow recovery
        instagramErrorRecovery.attemptRecovery.mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
        );

        render(
            <InstagramErrorBoundary enableRecovery={true}>
                <ThrowError shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            const recoveryButton = screen.getByRole('button', { name: /smart recovery/i });
            fireEvent.click(recoveryButton);
        });

        // Should show loading state
        expect(screen.getByText('Recovering...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Recovering...')).not.toBeInTheDocument();
        });
    });
});