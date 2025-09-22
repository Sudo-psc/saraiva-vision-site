import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstagramErrorBoundary from '../InstagramErrorBoundary';
import InstagramFallback from '../InstagramFallback';
import InstagramRetryManager from '../InstagramRetryManager';
import instagramErrorHandler from '../../../services/instagramErrorHandler';
import instagramErrorRecovery from '../../../services/instagramErrorRecovery';

// Mock services
vi.mock('../../../services/instagramErrorHandler');
vi.mock('../../../services/instagramErrorRecovery');

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock accessibility hook
vi.mock('../../../hooks/useAccessibilityPreferences', () => ({
    default: () => ({
        shouldReduceMotion: () => false,
        getAnimationConfig: () => ({ duration: 0.3 }),
        getAccessibilityClasses: () => '',
        getAccessibilityStyles: () => ({})
    })
}));

// Test component that can simulate different error scenarios
const TestInstagramComponent = ({
    shouldThrow = false,
    errorType = 'generic',
    throwAfterDelay = false,
    delayMs = 100
}) => {
    const [shouldError, setShouldError] = React.useState(shouldThrow);

    React.useEffect(() => {
        if (throwAfterDelay) {
            const timer = setTimeout(() => setShouldError(true), delayMs);
            return () => clearTimeout(timer);
        }
    }, [throwAfterDelay, delayMs]);

    if (shouldError) {
        const errorMessages = {
            network: 'Network connection failed',
            auth: 'Authentication token expired',
            'rate-limit': 'Rate limit exceeded',
            server: 'Internal server error',
            generic: 'Generic component error'
        };

        const error = new Error(errorMessages[errorType] || errorMessages.generic);
        error.type = errorType;
        throw error;
    }

    return (
        <div data-testid="instagram-component">
            <h2>Instagram Feed</h2>
            <div>Loading Instagram posts...</div>
        </div>
    );
};

describe('Instagram Error Handling Integration', () => {
    const mockFallbackPosts = [
        {
            id: '1',
            caption: 'Cached post 1',
            media_url: 'https://example.com/cached1.jpg',
            permalink: 'https://instagram.com/p/cached1',
            stats: { likes: 50, comments: 5 }
        },
        {
            id: '2',
            caption: 'Cached post 2',
            media_url: 'https://example.com/cached2.jpg',
            permalink: 'https://instagram.com/p/cached2',
            stats: { likes: 30, comments: 3 }
        }
    ];

    beforeEach(() => {
        // Mock console.error to avoid noise
        console.error = vi.fn();

        // Mock error handler responses
        instagramErrorHandler.handleError.mockResolvedValue({
            success: false,
            error: {
                id: 'test-error-id',
                type: 'component',
                severity: 'medium',
                message: 'Test error'
            },
            shouldShowFallback: true,
            userMessage: {
                title: 'Component Error',
                message: 'Something went wrong',
                suggestion: 'Try refreshing'
            }
        });

        // Mock error recovery responses
        instagramErrorRecovery.attemptRecovery.mockResolvedValue({
            success: true,
            recoveryId: 'test-recovery-id',
            strategy: 'component-reset',
            recoveryTime: 1000
        });

        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('integrates error boundary with fallback component', async () => {
        const CustomFallback = ({ error, onRetry }) => (
            <InstagramFallback
                type={error?.type || 'generic'}
                fallbackPosts={mockFallbackPosts}
                onRetry={onRetry}
                showRetry={true}
                errorMessage={error?.message}
            />
        );

        render(
            <InstagramErrorBoundary fallbackComponent={CustomFallback}>
                <TestInstagramComponent shouldThrow={true} errorType="network" />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.getByText('Connection Issue')).toBeInTheDocument();
            expect(screen.getByText('Cached Instagram Posts')).toBeInTheDocument();
            expect(screen.getByText('Cached post 1')).toBeInTheDocument();
        });
    });

    it('handles complete error recovery flow', async () => {
        let shouldThrow = true;
        const TestComponent = () => {
            if (shouldThrow) {
                throw new Error('Recoverable error');
            }
            return <div data-testid="recovered-component">Component recovered!</div>;
        };

        render(
            <InstagramErrorBoundary enableRecovery={true}>
                <TestComponent />
            </InstagramErrorBoundary>
        );

        // Error should be caught
        await waitFor(() => {
            expect(screen.getByText('Something went wrong with Instagram content')).toBeInTheDocument();
        });

        // Mock successful recovery
        instagramErrorRecovery.attemptRecovery.mockResolvedValue({
            success: true,
            recoveryId: 'recovery-123'
        });

        // Simulate recovery fixing the issue
        shouldThrow = false;

        // Trigger recovery
        const recoveryButton = screen.getByRole('button', { name: /smart recovery/i });
        fireEvent.click(recoveryButton);

        await waitFor(() => {
            expect(screen.getByTestId('recovered-component')).toBeInTheDocument();
        });
    });

    it('integrates retry manager with error boundary', async () => {
        let attemptCount = 0;
        const mockRetryOperation = vi.fn().mockImplementation(() => {
            attemptCount++;
            if (attemptCount < 3) {
                throw new Error(`Attempt ${attemptCount} failed`);
            }
            return Promise.resolve('Success');
        });

        const TestComponentWithRetry = () => {
            const [retryTrigger, setRetryTrigger] = React.useState(0);

            return (
                <div>
                    <InstagramRetryManager
                        onRetry={mockRetryOperation}
                        maxRetries={3}
                        autoRetry={false}
                        showControls={true}
                    />
                    <button onClick={() => setRetryTrigger(prev => prev + 1)}>
                        Trigger Error
                    </button>
                    {retryTrigger > 0 && <TestInstagramComponent shouldThrow={true} />}
                </div>
            );
        };

        render(
            <InstagramErrorBoundary>
                <TestComponentWithRetry />
            </InstagramErrorBoundary>
        );

        // Trigger error
        fireEvent.click(screen.getByText('Trigger Error'));

        await waitFor(() => {
            expect(screen.getByText('Something went wrong with Instagram content')).toBeInTheDocument();
        });
    });

    it('handles multiple error types with appropriate fallbacks', async () => {
        const errorScenarios = [
            { type: 'network', expectedTitle: 'Connection Issue' },
            { type: 'auth', expectedTitle: 'Authentication Error' },
            { type: 'rate-limit', expectedTitle: 'Rate Limit Reached' },
            { type: 'server', expectedTitle: 'Server Error' }
        ];

        for (const scenario of errorScenarios) {
            const { rerender } = render(
                <InstagramErrorBoundary>
                    <InstagramFallback type={scenario.type} />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText(scenario.expectedTitle)).toBeInTheDocument();

            // Clean up for next iteration
            rerender(<div>Clean slate</div>);
        }
    });

    it('handles offline scenarios with cached content', async () => {
        // Simulate offline state
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: false
        });

        render(
            <InstagramFallback
                type="network"
                fallbackPosts={mockFallbackPosts}
                showOfflineMessage={true}
                showCachedContent={true}
            />
        );

        expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
        expect(screen.getByText('Cached Instagram Posts')).toBeInTheDocument();
        expect(screen.getByText('Cached post 1')).toBeInTheDocument();
    });

    it('handles error escalation from retry to recovery', async () => {
        let retryAttempts = 0;
        const failingOperation = vi.fn().mockImplementation(() => {
            retryAttempts++;
            throw new Error(`Retry attempt ${retryAttempts} failed`);
        });

        // Mock retry manager that fails all attempts
        const TestWithFailingRetries = () => {
            const [showRetryManager, setShowRetryManager] = React.useState(false);

            React.useEffect(() => {
                // Simulate error that triggers retry manager
                setShowRetryManager(true);
            }, []);

            if (showRetryManager) {
                return (
                    <InstagramRetryManager
                        onRetry={failingOperation}
                        maxRetries={2}
                        autoRetry={true}
                        baseDelay={10} // Fast for testing
                    />
                );
            }

            return <TestInstagramComponent shouldThrow={true} />;
        };

        render(
            <InstagramErrorBoundary enableRecovery={true}>
                <TestWithFailingRetries />
            </InstagramErrorBoundary>
        );

        // Should eventually show error boundary after retries fail
        await waitFor(() => {
            expect(screen.getByText('Something went wrong with Instagram content')).toBeInTheDocument();
        }, { timeout: 5000 });

        // Recovery should be available
        expect(screen.getByRole('button', { name: /smart recovery/i })).toBeInTheDocument();
    });

    it('provides comprehensive error reporting', async () => {
        const onErrorMock = vi.fn();

        render(
            <InstagramErrorBoundary onError={onErrorMock}>
                <TestInstagramComponent shouldThrow={true} errorType="auth" />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(onErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Authentication token expired',
                    type: 'auth'
                }),
                expect.any(Object),
                expect.any(Object)
            );
        });

        // Should also call error handler service
        expect(instagramErrorHandler.handleError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Authentication token expired'
            }),
            expect.objectContaining({
                operation: 'component_render',
                errorBoundary: true
            })
        );
    });

    it('handles rapid error succession gracefully', async () => {
        let errorCount = 0;
        const RapidErrorComponent = () => {
            errorCount++;
            throw new Error(`Rapid error ${errorCount}`);
        };

        const { rerender } = render(
            <InstagramErrorBoundary maxRetries={1}>
                <RapidErrorComponent />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.getByText('Something went wrong with Instagram content')).toBeInTheDocument();
        });

        // Try to trigger another error quickly
        rerender(
            <InstagramErrorBoundary maxRetries={1}>
                <RapidErrorComponent />
            </InstagramErrorBoundary>
        );

        // Should handle gracefully without crashing
        await waitFor(() => {
            expect(screen.getByText('Something went wrong with Instagram content')).toBeInTheDocument();
        });
    });

    it('maintains accessibility during error states', async () => {
        render(
            <InstagramErrorBoundary>
                <TestInstagramComponent shouldThrow={true} />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            // Check for proper ARIA attributes
            const errorRegion = screen.getByRole('region');
            expect(errorRegion).toBeInTheDocument();

            // Check for proper button labels
            const retryButton = screen.getByRole('button', { name: /try again/i });
            expect(retryButton).toBeInTheDocument();

            // Check for proper headings
            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading).toBeInTheDocument();
        });
    });

    it('handles component unmounting during error recovery', async () => {
        const TestComponentWithUnmount = () => {
            const [mounted, setMounted] = React.useState(true);

            React.useEffect(() => {
                const timer = setTimeout(() => setMounted(false), 100);
                return () => clearTimeout(timer);
            }, []);

            if (!mounted) return null;

            throw new Error('Component will unmount during recovery');
        };

        const { unmount } = render(
            <InstagramErrorBoundary enableRecovery={true}>
                <TestComponentWithUnmount />
            </InstagramErrorBoundary>
        );

        await waitFor(() => {
            expect(screen.getByText('Something went wrong with Instagram content')).toBeInTheDocument();
        });

        // Unmount during recovery
        unmount();

        // Should not cause any errors or warnings
        expect(console.error).not.toHaveBeenCalledWith(
            expect.stringContaining('Warning')
        );
    });
});