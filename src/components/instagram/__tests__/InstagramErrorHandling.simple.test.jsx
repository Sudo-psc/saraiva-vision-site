import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    // Mock window.matchMedia
    window.matchMedia = vi.fn((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
    }));

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
            default:
                throw new Error('Generic error occurred');
        }
    }
    return <div data-testid="working-component">Component is working</div>;
};

describe('Instagram Error Handling System - Core Functionality', () => {
    describe('InstagramErrorBoundary', () => {
        it('should catch and display errors', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
            expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        });

        it('should categorize network errors', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} errorType="network" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Connection Issue')).toBeInTheDocument();
        });

        it('should categorize authentication errors', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} errorType="auth" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Authentication Error')).toBeInTheDocument();
        });

        it('should categorize rate limit errors', () => {
            render(
                <InstagramErrorBoundary>
                    <ErrorThrowingComponent shouldThrow={true} errorType="rate-limit" />
                </InstagramErrorBoundary>
            );

            expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
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
            expect(screen.getByText('Posts: 1')).toBeInTheDocument();
        });

        it('should handle retry functionality', async () => {
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

            await waitFor(() => {
                expect(mockOnRetry).toHaveBeenCalledTimes(1);
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

        it('should respect accessibility attributes', () => {
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

        it('should analyze server errors correctly', async () => {
            const serverError = new Error('Internal server error');
            serverError.status = 500;

            const result = await instagramErrorHandler.handleError(serverError);

            expect(result.error.type).toBe('server');
            expect(result.error.severity).toBe('high');
            expect(result.error.retryable).toBe(true);
        });

        it('should limit retry attempts', () => {
            const operationId = 'test-max-retries';

            // Simulate multiple retry attempts
            for (let i = 0; i < 5; i++) {
                instagramErrorHandler.retryAttempts.set(operationId, i);
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
            const authError = new Error('Invalid access token');
            authError.status = 401;

            const result = await instagramErrorHandler.handleError(authError);

            expect(result.userMessage.title).toBe('Authentication Error');
            expect(result.userMessage.message).toContain('There was an issue accessing Instagram content');
        });

        it('should emit error events to listeners', async () => {
            const mockCallback = vi.fn();
            const unsubscribe = instagramErrorHandler.onError(mockCallback);

            const testError = new Error('Test error');
            await instagramErrorHandler.handleError(testError);

            expect(mockCallback).toHaveBeenCalledWith(
                expect.objectContaining({
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

        it('should track error statistics', async () => {
            // Clear any existing errors
            instagramErrorHandler.reset();

            // Generate some test errors
            const authError = new Error('Auth error');
            authError.status = 401;

            const rateLimitError = new Error('Rate limit');
            rateLimitError.status = 429;

            await instagramErrorHandler.handleError(authError);
            await instagramErrorHandler.handleError(rateLimitError);

            const stats = instagramErrorHandler.getErrorStats();

            expect(stats.total).toBe(2);
            expect(stats.byType.auth).toBe(1);
            expect(stats.byType['rate-limit']).toBe(1);
        });
    });
});