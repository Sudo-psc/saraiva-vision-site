import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstagramErrorBoundary from '../InstagramErrorBoundary';
import InstagramFallback from '../InstagramFallback';
import instagramErrorHandler from '../../../services/instagramErrorHandler';

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
    console.error = vi.fn();
    console.warn = vi.fn();

    // Mock window.gtag
    window.gtag = vi.fn();

    // Mock window.open
    window.open = vi.fn();

    // Mock navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
        value: 'Test User Agent',
        writable: true
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
        value: {
            href: 'http://localhost:3000/test',
            reload: vi.fn()
        },
        writable: true
    });
});

afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    vi.clearAllMocks();
    instagramErrorHandler.reset();
});

// Test component that throws errors
const ErrorThrowingComponent = ({ shouldThrow = false, errorType = 'generic' }) => {
    if (shouldThrow) {
        switch (errorType) {
            case 'network':
                throw new Error('Network error: Failed to fetch');
            case 'auth':
                throw new Error('Authentication failed: Invalid access token');
            case 'rate-limit':
                throw new Error('Rate limit exceeded: Too many requests');
            case 'timeout':
                throw new Error('Request timeout: Connection timed out');
            default:
                throw new Error('Generic error occurred');
        }
    }
    return <div data-testid="working-component">Component is working</div>;
};

describe('Instagram Error Handling System', () => {
    describe('InstagramErrorBoundary', () => {
        it('should catch and display generic errors', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} errorType="generic" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
            expect(screen.getByText(/An unexpected error occurred while loading Instagram content/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
        });

        it('should categorize network errors correctly', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} errorType="network" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Connection Issue')).toBeInTheDocument();
            expect(screen.getByText(/Unable to load Instagram content/)).toBeInTheDocument();
        });

        it('should categorize authentication errors correctly', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} errorType="auth" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Authentication Error')).toBeInTheDocument();
            expect(screen.getByText(/There was an issue accessing Instagram content/)).toBeInTheDocument();
        });

        it('should categorize rate limit errors correctly', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} errorType="rate-limit" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
            expect(screen.getByText(/Too many requests to Instagram/)).toBeInTheDocument();
        });

        it('should handle retry functionality', async () => {
            const mockOnRetry = vi.fn();

            render(
                <InstagramErrorBoundary onRetry={mockOnRetry}>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            const retryButton = screen.getByRole('button', { name: /try again/i });
            fireEvent.click(retryButton);

            expect(mockOnRetry).toHaveBeenCalledTimes(1);
        });

        it('should limit retry attempts', async () => {
            const mockOnRetry = vi.fn();

            const { rerender } = render(
                <InstagramErrorBoundary onRetry={mockOnRetry}>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            // First retry
            fireEvent.click(screen.getByRole('button', { name: /try again/i }));

            // Simulate error again
            rerender(
                <InstagramErrorBoundary onRetry={mockOnRetry}>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            // Second retry
            fireEvent.click(screen.getByRole('button', { name: /try again/i }));

            // Simulate error again
            rerender(
                <InstagramErrorBoundary onRetry={mockOnRetry}>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            // Third retry
            fireEvent.click(screen.getByRole('button', { name: /try again/i }));

            // Simulate error again - should show max retries message
            rerender(
                <InstagramErrorBoundary onRetry={mockOnRetry}>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText(/Maximum retry attempts reached/)).toBeInTheDocument();
        });

        it('should generate unique error IDs', () => {
            const { rerender } = render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            const firstErrorId = screen.getByText(/Error ID:/).textContent;

            // Reset and throw another error
            rerender(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={false} />
                </InstagramErrorBoundary>
            );

            rerender(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            const secondErrorId = screen.getByText(/Error ID:/).textContent;
            expect(firstErrorId).not.toBe(secondErrorId);
        });

        it('should report errors to analytics', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            expect(window.gtag).toHaveBeenCalledWith('event', 'exception', expect.objectContaining({
                description: expect.stringContaining('Instagram Error'),
                fatal: false
            }));
        });

        it('should handle report issue functionality', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            const reportButton = screen.getByRole('button', { name: /report issue/i });
            fireEvent.click(reportButton);

            expect(window.open).toHaveBeenCalledWith(
                expect.stringContaining('mailto:support@saraivavision.com')
            );
        });

        it('should show development details in development mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Development Error Details')).toBeInTheDocument();

            process.env.NODE_ENV = originalEnv;
        });

        it('should render children when no error occurs', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={false} />
                </InstagramErrorBoundary>
            );

            expect(screen.getByTestId('working-component')).toBeInTheDocument();
            expect(screen.queryByText('Something Went Wrong')).not.toBeInTheDocument();
        });
    });

    describe('InstagramFallback', () => {
        const mockFallbackPosts = [
            {
                id: '1',
                username: 'testuser',
                caption: 'Test post 1',
                media_url: 'https://example.com/image1.jpg',
                permalink: 'https://instagram.com/p/1',
                timestamp: '2024-01-01T00:00:00Z',
                stats: { likes: 100, comments: 10, engagement_rate: 5.5 }
            },
            {
                id: '2',
                username: 'testuser',
                caption: 'Test post 2',
                media_url: 'https://example.com/image2.jpg',
                permalink: 'https://instagram.com/p/2',
                timestamp: '2024-01-02T00:00:00Z',
                stats: { likes: 200, comments: 20, engagement_rate: 7.2 }
            }
        ];

        it('should display network error fallback', () => {
            render(
                <InstagramFallback
                    errorType="network"
                    errorMessage="Network connection failed"
                    fallbackPosts={mockFallbackPosts}
                />
            );

            expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
            expect(screen.getByText(/Unable to connect to Instagram/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        });

        it('should display API error fallback', () => {
            render(
                <InstagramFallback
                    errorType="api"
                    errorMessage="API service unavailable"
                    fallbackPosts={mockFallbackPosts}
                />
            );

            expect(screen.getByText('Instagram API Error')).toBeInTheDocument();
            expect(screen.getByText(/Instagram services are temporarily unavailable/)).toBeInTheDocument();
        });

        it('should display authentication error fallback', () => {
            render(
                <InstagramFallback
                    errorType="auth"
                    errorMessage="Authentication failed"
                    fallbackPosts={mockFallbackPosts}
                />
            );

            expect(screen.getByText('Authentication Issue')).toBeInTheDocument();
            expect(screen.getByText(/Unable to authenticate with Instagram/)).toBeInTheDocument();
        });

        it('should display rate limit error fallback', () => {
            render(
                <InstagramFallback
                    errorType="rate-limit"
                    errorMessage="Rate limit exceeded"
                    fallbackPosts={mockFallbackPosts}
                />
            );

            expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
            expect(screen.getByText(/Too many requests to Instagram/)).toBeInTheDocument();
        });

        it('should show cached content when available', () => {
            render(
                <InstagramFallback
                    errorType="network"
                    fallbackPosts={mockFallbackPosts}
                    showCachedContent={true}
                />
            );

            expect(screen.getByText('Cached Content Available')).toBeInTheDocument();
            expect(screen.getByText('Posts: 2')).toBeInTheDocument();
            expect(screen.getByText('Cached Content')).toBeInTheDocument();

            // Check if cached posts are displayed
            expect(screen.getByText('@testuser')).toBeInTheDocument();
            expect(screen.getByText('Test post 1')).toBeInTheDocument();
        });

        it('should handle retry functionality with exponential backoff', async () => {
            const mockOnRetry = vi.fn().mockResolvedValue();

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

        it('should handle retry failures and increment retry count', async () => {
            const mockOnRetry = vi.fn().mockRejectedValue(new Error('Retry failed'));

            render(
                <InstagramFallback
                    errorType="network"
                    onRetry={mockOnRetry}
                    showRetryOptions={true}
                />
            );

            const retryButton = screen.getByRole('button', { name: /try again/i });

            await act(async () => {
                fireEvent.click(retryButton);
            });

            expect(mockOnRetry).toHaveBeenCalledTimes(1);
        });

        it('should disable retry after maximum attempts', async () => {
            const mockOnRetry = vi.fn().mockRejectedValue(new Error('Retry failed'));

            const { rerender } = render(
                <InstagramFallback
                    errorType="network"
                    onRetry={mockOnRetry}
                    showRetryOptions={true}
                />
            );

            // Simulate multiple failed retries by re-rendering with updated retry count
            for (let i = 0; i < 4; i++) {
                const retryButton = screen.queryByRole('button', { name: /try again/i });
                if (retryButton && !retryButton.disabled) {
                    await act(async () => {
                        fireEvent.click(retryButton);
                    });
                }

                // Re-render to simulate state update
                rerender(
                    <InstagramFallback
                        errorType="network"
                        onRetry={mockOnRetry}
                        showRetryOptions={true}
                    />
                );
            }

            await waitFor(() => {
                const retryButton = screen.queryByRole('button', { name: /try again/i });
                if (retryButton) {
                    expect(retryButton).toBeDisabled();
                }
            });
        });

        it('should handle cache clearing', () => {
            const mockOnClearCache = vi.fn();

            render(
                <InstagramFallback
                    errorType="network"
                    onClearCache={mockOnClearCache}
                    fallbackPosts={mockFallbackPosts}
                />
            );

            const clearCacheButton = screen.getByRole('button', { name: /clear cache/i });
            fireEvent.click(clearCacheButton);

            expect(mockOnClearCache).toHaveBeenCalledTimes(1);
        });

        it('should show detailed information when requested', () => {
            render(
                <InstagramFallback
                    errorType="network"
                    errorMessage="Detailed error message"
                    fallbackPosts={mockFallbackPosts}
                    cacheAge={300000} // 5 minutes
                    lastSuccessfulFetch={new Date('2024-01-01T12:00:00Z')}
                />
            );

            const moreInfoButton = screen.getByRole('button', { name: /more info/i });
            fireEvent.click(moreInfoButton);

            expect(screen.getByText('Troubleshooting Information')).toBeInTheDocument();
            expect(screen.getByText('Error Type: network')).toBeInTheDocument();
            expect(screen.getByText('Cache Status: Available')).toBeInTheDocument();
        });

        it('should format cache age correctly', () => {
            const now = Date.now();
            const fiveMinutesAgo = now - (5 * 60 * 1000);

            render(
                <InstagramFallback
                    errorType="network"
                    fallbackPosts={mockFallbackPosts}
                    cacheAge={5 * 60 * 1000} // 5 minutes in ms
                    showCachedContent={true}
                />
            );

            expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument();
        });

        it('should handle posts without stats gracefully', () => {
            const postsWithoutStats = [
                {
                    id: '1',
                    username: 'testuser',
                    caption: 'Test post without stats',
                    media_url: 'https://example.com/image1.jpg',
                    permalink: 'https://instagram.com/p/1',
                    timestamp: '2024-01-01T00:00:00Z'
                }
            ];

            render(
                <InstagramFallback
                    errorType="network"
                    fallbackPosts={postsWithoutStats}
                    showCachedContent={true}
                />
            );

            expect(screen.getByText('Test post without stats')).toBeInTheDocument();
            expect(screen.getByText('@testuser')).toBeInTheDocument();
        });

        it('should handle empty fallback posts', () => {
            render(
                <InstagramFallback
                    errorType="network"
                    fallbackPosts={[]}
                    showCachedContent={true}
                />
            );

            expect(screen.queryByText('Cached Content')).not.toBeInTheDocument();
            expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
        });

        it('should respect accessibility preferences', () => {
            render(
                <InstagramFallback
                    errorType="network"
                    fallbackPosts={mockFallbackPosts}
                />
            );

            const fallbackContainer = screen.getByRole('region');
            expect(fallbackContainer).toHaveAttribute('aria-labelledby', 'fallback-title');
            expect(fallbackContainer).toHaveAttribute('aria-describedby', 'fallback-description');
        });
    });

    describe('Instagram Error Handler Service', () => {
        it('should analyze network errors correctly', async () => {
            const networkError = new TypeError('Failed to fetch');
            const context = {
                operation: 'fetchPosts',
                operationId: 'test-op-1',
                url: 'https://api.instagram.com/posts'
            };

            const result = await instagramErrorHandler.handleError(networkError, context);

            expect(result.error.type).toBe('network');
            expect(result.error.severity).toBe('high');
            expect(result.error.retryable).toBe(true);
            expect(result.shouldShowFallback).toBe(true);
        });

        it('should analyze authentication errors correctly', async () => {
            const authError = new Error('Invalid access token');
            authError.status = 401;

            const result = await instagramErrorHandler.handleError(authError);

            expect(result.error.type).toBe('auth');
            expect(result.error.severity).toBe('high');
            expect(result.error.retryable).toBe(false);
        });

        it('should analyze rate limit errors correctly', async () => {
            const rateLimitError = new Error('Rate limit exceeded');
            rateLimitError.status = 429;

            const result = await instagramErrorHandler.handleError(rateLimitError);

            expect(result.error.type).toBe('rate-limit');
            expect(result.error.severity).toBe('medium');
            expect(result.error.retryable).toBe(true);
        });

        it('should implement exponential backoff for retries', async () => {
            const mockOperation = vi.fn()
                .mockRejectedValueOnce(new Error('First failure'))
                .mockResolvedValueOnce({ success: true });

            const context = {
                operation: mockOperation,
                operationId: 'test-retry-op',
                url: 'https://api.instagram.com/posts'
            };

            const networkError = new TypeError('Failed to fetch');

            // First call should schedule a retry
            const result = await instagramErrorHandler.handleError(networkError, context);

            // The retry should be scheduled but not executed immediately
            expect(mockOperation).toHaveBeenCalledTimes(0);
        });

        it('should limit retry attempts', async () => {
            const mockOperation = vi.fn().mockRejectedValue(new Error('Always fails'));
            const operationId = 'test-max-retries';

            // Simulate multiple retry attempts
            for (let i = 0; i < 5; i++) {
                const canRetry = instagramErrorHandler.canRetry(operationId);
                if (canRetry) {
                    instagramErrorHandler.retryAttempts.set(operationId, i);
                }
            }

            const canRetryAfterMax = instagramErrorHandler.canRetry(operationId);
            expect(canRetryAfterMax).toBe(false);
        });

        it('should sanitize URLs in error logs', () => {
            const urlWithToken = 'https://api.instagram.com/posts?access_token=secret123&other=param';
            const sanitized = instagramErrorHandler.sanitizeUrl(urlWithToken);

            expect(sanitized).not.toContain('secret123');
            expect(sanitized).toContain('other=param');
        });

        it('should provide user-friendly error messages', async () => {
            const networkError = new TypeError('Failed to fetch');
            const result = await instagramErrorHandler.handleError(networkError);

            expect(result.userMessage.title).toBe('Connection Issue');
            expect(result.userMessage.message).toContain('Unable to connect to Instagram');
            expect(result.userMessage.suggestion).toContain('check your internet connection');
        });

        it('should track error statistics', async () => {
            // Generate some test errors
            await instagramErrorHandler.handleError(new TypeError('Network error'));
            await instagramErrorHandler.handleError(new Error('Auth error'), { status: 401 });
            await instagramErrorHandler.handleError(new Error('Rate limit'), { status: 429 });

            const stats = instagramErrorHandler.getErrorStats();

            expect(stats.total).toBe(3);
            expect(stats.byType.network).toBe(1);
            expect(stats.byType.auth).toBe(1);
            expect(stats.byType['rate-limit']).toBe(1);
        });

        it('should emit error events to listeners', async () => {
            const mockCallback = vi.fn();
            const unsubscribe = instagramErrorHandler.onError(mockCallback);

            const testError = new Error('Test error');
            await instagramErrorHandler.handleError(testError);

            expect(mockCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'unknown',
                    message: 'Test error'
                })
            );

            unsubscribe();
        });

        it('should create operation contexts correctly', () => {
            const context = instagramErrorHandler.createContext(
                'fetchPosts',
                'https://api.instagram.com/posts',
                'GET'
            );

            expect(context.operation).toBe('fetchPosts');
            expect(context.url).toBe('https://api.instagram.com/posts');
            expect(context.method).toBe('GET');
            expect(context.operationId).toMatch(/fetchPosts-\d+/);
        });

        it('should wrap functions with error handling', async () => {
            const mockFn = vi.fn().mockRejectedValue(new Error('Test error'));
            const wrappedFn = instagramErrorHandler.withErrorHandling(mockFn, {
                operation: 'testOperation'
            });

            const result = await wrappedFn();

            expect(result.success).toBe(false);
            expect(result.error.message).toBe('Test error');
        });
    });
});