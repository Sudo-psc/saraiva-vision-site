import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstagramErrorBoundary from '../InstagramErrorBoundary';
import InstagramFallback from '../InstagramFallback';
import instagramErrorHandler from '../../../services/instagramErrorHandler';

// Mock components that might throw errors
const ThrowingComponent = ({ shouldThrow, errorType }) => {
    if (shouldThrow) {
        if (errorType === 'network') {
            throw new Error('Network request failed');
        } else if (errorType === 'auth') {
            const error = new Error('Authentication failed');
            error.status = 401;
            throw error;
        } else if (errorType === 'rate-limit') {
            const error = new Error('Rate limit exceeded');
            error.status = 429;
            throw error;
        } else {
            throw new Error('Generic error');
        }
    }
    return <div>Component rendered successfully</div>;
};

// Mock date-fns
vi.mock('date-fns', () => ({
    format: vi.fn(() => '12:00'),
    formatDistanceToNow: vi.fn(() => '2 hours ago')
}));

vi.mock('date-fns/locale', () => ({
    ptBR: {}
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        article: ({ children, ...props }) => <article {...props}>{children}</article>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock OptimizedImage
vi.mock('../OptimizedImage', () => ({
    default: ({ src, alt, className, ...props }) => (
        <img src={src} alt={alt} className={className} {...props} />
    )
}));

// Mock accessibility hooks
vi.mock('../../../hooks/useAccessibilityPreferences', () => ({
    default: () => ({
        getAccessibilityClasses: () => '',
        getAccessibilityStyles: () => ({}),
        shouldReduceMotion: () => false,
        getAnimationConfig: () => ({
            duration: 0.3,
            ease: 'easeOut',
            stagger: 0.1
        })
    })
}));

describe('Instagram Error Handling', () => {
    const mockFallbackPosts = [
        {
            id: 'cached-1',
            caption: 'Cached post 1',
            media_type: 'IMAGE',
            media_url: '/img/test1.jpg',
            permalink: 'https://instagram.com/p/cached1',
            timestamp: '2024-01-01T12:00:00Z',
            username: 'testuser',
            stats: { likes: 50, comments: 5, engagement_rate: 3.2 }
        },
        {
            id: 'cached-2',
            caption: 'Cached post 2',
            media_type: 'IMAGE',
            media_url: '/img/test2.jpg',
            permalink: 'https://instagram.com/p/cached2',
            timestamp: '2024-01-02T12:00:00Z',
            username: 'testuser',
            stats: { likes: 75, comments: 8, engagement_rate: 4.1 }
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock console methods to avoid noise in tests
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });

        // Reset error handler state
        instagramErrorHandler.reset();

        // Mock window.gtag for error reporting
        Object.defineProperty(window, 'gtag', {
            writable: true,
            value: vi.fn()
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('InstagramErrorBoundary', () => {
        it('should render children when no error occurs', () => {
            render(
                <InstagramErrorBoundary>
                    <ThrowingComponent shouldThrow={false} />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Component rendered successfully')).toBeInTheDocument();
        });

        it('should catch and display network errors', () => {
            render(
                <InstagramErrorBoundary>
                    <ThrowingComponent shouldThrow={true} errorType="network" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Connection Issue')).toBeInTheDocument();
            expect(screen.getByText(/Unable to connect to Instagram/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        });

        it('should catch and display authentication errors', () => {
            render(
                <InstagramErrorBoundary>
                    <ThrowingComponent shouldThrow={true} errorType="auth" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Authentication Error')).toBeInTheDocument();
            expect(screen.getByText(/issue accessing Instagram content/)).toBeInTheDocument();
        });

        it('should catch and display rate limit errors', () => {
            render(
                <InstagramErrorBoundary>
                    <ThrowingComponent shouldThrow={true} errorType="rate-limit" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
            expect(screen.getByText(/Too many requests to Instagram/)).toBeInTheDocument();
        });

        it('should provide retry functionality', async () => {
            const mockOnRetry = vi.fn();

            render(
                <InstagramErrorBoundary onRetry={mockOnRetry}>
                    <ThrowingComponent shouldThrow={true} errorType="network" />
                </InstagramErrorBoundary>
            );

            const retryButton = screen.getByRole('button', { name: /try again/i });
            fireEvent.click(retryButton);

            expect(mockOnRetry).toHaveBeenCalledTimes(1);
        });

        it('should limit retry attempts', async () => {
            const { rerender } = render(
                <InstagramErrorBoundary>
                    <ThrowingComponent shouldThrow={true} errorType="network" />
                </InstagramErrorBoundary>
            );

            // Simulate multiple retries by re-rendering with errors
            for (let i = 0; i < 4; i++) {
                const retryButton = screen.queryByRole('button', { name: /try again/i });
                if (retryButton) {
                    fireEvent.click(retryButton);
                }

                rerender(
                    <InstagramErrorBoundary>
                        <ThrowingComponent shouldThrow={true} errorType="network" />
                    </InstagramErrorBoundary>
                );
            }

            await waitFor(() => {
                expect(screen.getByText(/Maximum retry attempts reached/)).toBeInTheDocument();
            });
        });

        it('should generate unique error IDs', () => {
            const { rerender } = render(
                <InstagramErrorBoundary>
                    <ThrowingComponent shouldThrow={true} errorType="network" />
                </InstagramErrorBoundary>
            );

            const firstErrorId = screen.getByText(/Error ID:/).textContent;

            rerender(
                <InstagramErrorBoundary>
                    <ThrowingComponent shouldThrow={true} errorType="auth" />
                </InstagramErrorBoundary>
            );

            const secondErrorId = screen.getByText(/Error ID:/).textContent;
            expect(firstErrorId).not.toBe(secondErrorId);
        });

        it('should report errors to analytics', () => {
            render(
                <InstagramErrorBoundary>
                    <ThrowingComponent shouldThrow={true} errorType="network" />
                </InstagramErrorBoundary>
            );

            expect(window.gtag).toHaveBeenCalledWith('event', 'exception', expect.objectContaining({
                description: expect.stringContaining('Instagram Error'),
                fatal: false
            }));
        });
    });

    describe('InstagramFallback', () => {
        it('should display network error message', () => {
            render(
                <InstagramFallback
                    errorType="network"
                    errorMessage="Network connection failed"
                    fallbackPosts={[]}
                />
            );

            expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
            expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
        });

        it('should display cached content when available', () => {
            render(
                <InstagramFallback
                    errorType="network"
                    errorMessage="Network connection failed"
                    fallbackPosts={mockFallbackPosts}
                    showCachedContent={true}
                />
            );

            expect(screen.getByText('Cached Content')).toBeInTheDocument();
            expect(screen.getByText('Cached post 1')).toBeInTheDocument();
            expect(screen.getByText('Cached post 2')).toBeInTheDocument();
        });

        it('should show cache information', () => {
            const lastFetch = new Date('2024-01-01T10:00:00Z');
            const cacheAge = 2 * 60 * 60 * 1000; // 2 hours

            render(
                <InstagramFallback
                    errorType="api"
                    fallbackPosts={mockFallbackPosts}
                    lastSuccessfulFetch={lastFetch}
                    cacheAge={cacheAge}
                />
            );

            expect(screen.getByText('Cached Content Available')).toBeInTheDocument();
            expect(screen.getByText('Posts: 2')).toBeInTheDocument();
        });

        it('should handle retry functionality', async () => {
            const mockOnRetry = vi.fn();

            render(
                <InstagramFallback
                    errorType="network"
                    onRetry={mockOnRetry}
                    showRetryOptions={true}
                />
            );

            const retryButton = screen.getByRole('button', { name: /try again/i });
            fireEvent.click(retryButton);

            expect(mockOnRetry).toHaveBeenCalledTimes(1);
        });

        it('should handle cache clearing', () => {
            const mockOnClearCache = vi.fn();

            render(
                <InstagramFallback
                    errorType="network"
                    onClearCache={mockOnClearCache}
                    showRetryOptions={true}
                />
            );

            const clearCacheButton = screen.getByRole('button', { name: /clear cache/i });
            fireEvent.click(clearCacheButton);

            expect(mockOnClearCache).toHaveBeenCalledTimes(1);
        });

        it('should show detailed information when requested', () => {
            render(
                <InstagramFallback
                    errorType="rate-limit"
                    errorMessage="Rate limit exceeded"
                />
            );

            const moreInfoButton = screen.getByRole('button', { name: /more info/i });
            fireEvent.click(moreInfoButton);

            expect(screen.getByText('Troubleshooting Information')).toBeInTheDocument();
            expect(screen.getByText('Error Type: rate-limit')).toBeInTheDocument();
        });

        it('should disable retry after maximum attempts', async () => {
            const { rerender } = render(
                <InstagramFallback
                    errorType="network"
                    onRetry={vi.fn()}
                    showRetryOptions={true}
                />
            );

            // Simulate multiple failed retries
            for (let i = 0; i < 4; i++) {
                const retryButton = screen.queryByRole('button', { name: /try again/i });
                if (retryButton && !retryButton.disabled) {
                    fireEvent.click(retryButton);
                }

                // Re-render to simulate retry failure
                rerender(
                    <InstagramFallback
                        errorType="network"
                        onRetry={vi.fn()}
                        showRetryOptions={true}
                    />
                );
            }

            await waitFor(() => {
                const retryButton = screen.queryByRole('button', { name: /try again/i });
                expect(retryButton).toBeDisabled();
            });
        });

        it('should format cache age correctly', () => {
            const cacheAge = 90 * 60 * 1000; // 90 minutes

            render(
                <InstagramFallback
                    errorType="network"
                    fallbackPosts={mockFallbackPosts}
                    cacheAge={cacheAge}
                />
            );

            expect(screen.getByText(/1 hour ago/)).toBeInTheDocument();
        });
    });

    describe('Error Handler Service', () => {
        it('should analyze network errors correctly', async () => {
            const networkError = new TypeError('fetch failed');
            const context = { operation: 'fetchPosts', operationId: 'test-1' };

            const result = await instagramErrorHandler.handleError(networkError, context);

            expect(result.error.type).toBe('network');
            expect(result.error.retryable).toBe(true);
            expect(result.shouldShowFallback).toBe(true);
        });

        it('should analyze authentication errors correctly', async () => {
            const authError = new Error('Unauthorized');
            authError.status = 401;
            const context = { operation: 'fetchPosts', operationId: 'test-2' };

            const result = await instagramErrorHandler.handleError(authError, context);

            expect(result.error.type).toBe('auth');
            expect(result.error.retryable).toBe(false);
            expect(result.shouldShowFallback).toBe(false);
        });

        it('should analyze rate limit errors correctly', async () => {
            const rateLimitError = new Error('Too Many Requests');
            rateLimitError.status = 429;
            const context = { operation: 'fetchStats', operationId: 'test-3' };

            const result = await instagramErrorHandler.handleError(rateLimitError, context);

            expect(result.error.type).toBe('rate-limit');
            expect(result.error.retryable).toBe(true);
            expect(result.shouldShowFallback).toBe(true);
        });

        it('should implement exponential backoff for retries', async () => {
            const operation = vi.fn().mockRejectedValue(new Error('Network error'));
            const context = { operation, operationId: 'test-retry' };

            const startTime = Date.now();
            await instagramErrorHandler.handleError(new Error('Network error'), context);
            const endTime = Date.now();

            // Should have some delay for retry
            expect(endTime - startTime).toBeGreaterThan(100);
        });

        it('should limit retry attempts', async () => {
            const operation = vi.fn().mockRejectedValue(new Error('Network error'));
            const operationId = 'test-max-retries';

            // Simulate multiple failures
            for (let i = 0; i < 5; i++) {
                await instagramErrorHandler.handleError(new Error('Network error'), {
                    operation,
                    operationId
                });
            }

            expect(instagramErrorHandler.hasExceededRetries(operationId)).toBe(true);
        });

        it('should sanitize URLs in error logs', () => {
            const url = 'https://api.instagram.com/posts?access_token=secret123&key=private';
            const sanitized = instagramErrorHandler.sanitizeUrl(url);

            expect(sanitized).not.toContain('secret123');
            expect(sanitized).not.toContain('private');
        });

        it('should provide error statistics', async () => {
            // Generate some errors
            await instagramErrorHandler.handleError(new Error('Network error'), { operationId: 'test-1' });

            const authError = new Error('Auth error');
            authError.status = 401;
            await instagramErrorHandler.handleError(authError, { operationId: 'test-2' });

            const stats = instagramErrorHandler.getErrorStats();

            expect(stats.total).toBe(2);
            expect(stats.byType.network).toBe(1);
            expect(stats.byType.auth).toBe(1);
        });

        it('should emit error events', async () => {
            const errorCallback = vi.fn();
            const unsubscribe = instagramErrorHandler.onError(errorCallback);

            await instagramErrorHandler.handleError(new Error('Test error'), { operationId: 'test-event' });

            expect(errorCallback).toHaveBeenCalledWith(expect.objectContaining({
                type: 'unknown',
                message: 'Test error'
            }));

            unsubscribe();
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete error flow from component to fallback', async () => {
            const mockOnRetry = vi.fn();

            render(
                <InstagramErrorBoundary onRetry={mockOnRetry}>
                    <ThrowingComponent shouldThrow={true} errorType="network" />
                </InstagramErrorBoundary>
            );

            // Error boundary should catch the error
            expect(screen.getByText('Connection Issue')).toBeInTheDocument();

            // Should provide retry option
            const retryButton = screen.getByRole('button', { name: /try again/i });
            expect(retryButton).toBeInTheDocument();

            // Should call retry handler
            fireEvent.click(retryButton);
            expect(mockOnRetry).toHaveBeenCalled();
        });

        it('should show fallback content when API fails', () => {
            render(
                <InstagramFallback
                    errorType="api"
                    errorMessage="API temporarily unavailable"
                    fallbackPosts={mockFallbackPosts}
                    showCachedContent={true}
                />
            );

            // Should show error message
            expect(screen.getByText('Instagram API Error')).toBeInTheDocument();

            // Should show cached content
            expect(screen.getByText('Cached Content')).toBeInTheDocument();
            expect(screen.getByText('Cached post 1')).toBeInTheDocument();

            // Should show cache indicators
            expect(screen.getAllByText('Cached Content')).toHaveLength(3); // Header + 2 post indicators
        });
    });
});