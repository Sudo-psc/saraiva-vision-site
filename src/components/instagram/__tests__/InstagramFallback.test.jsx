import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstagramFallback from '../InstagramFallback';

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

describe('InstagramFallback', () => {
    const mockFallbackPosts = [
        {
            id: '1',
            caption: 'Test post 1 caption that is long enough to be truncated when displayed',
            media_url: 'https://example.com/image1.jpg',
            permalink: 'https://instagram.com/p/1',
            stats: { likes: 100, comments: 10 }
        },
        {
            id: '2',
            caption: 'Short caption',
            media_url: 'https://example.com/image2.jpg',
            permalink: 'https://instagram.com/p/2',
            stats: { likes: 50, comments: 5 }
        }
    ];

    beforeEach(() => {
        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders generic fallback message by default', () => {
        render(<InstagramFallback />);

        expect(screen.getByText('Content Unavailable')).toBeInTheDocument();
        expect(screen.getByText('Instagram content is temporarily unavailable.')).toBeInTheDocument();
        expect(screen.getByText('Please try refreshing the page or check back later.')).toBeInTheDocument();
    });

    it('renders network error fallback message', () => {
        render(<InstagramFallback type="network" />);

        expect(screen.getByText('Connection Issue')).toBeInTheDocument();
        expect(screen.getByText('Unable to load Instagram content due to network issues.')).toBeInTheDocument();
        expect(screen.getByText('Please check your internet connection and try again.')).toBeInTheDocument();
    });

    it('renders authentication error fallback message', () => {
        render(<InstagramFallback type="auth" />);

        expect(screen.getByText('Authentication Error')).toBeInTheDocument();
        expect(screen.getByText('There was an issue accessing Instagram content.')).toBeInTheDocument();
        expect(screen.getByText('This is usually temporary. Please try again in a few minutes.')).toBeInTheDocument();
    });

    it('renders rate limit error fallback message', () => {
        render(<InstagramFallback type="rate-limit" />);

        expect(screen.getByText('Rate Limit Reached')).toBeInTheDocument();
        expect(screen.getByText('Instagram has temporarily limited our access.')).toBeInTheDocument();
        expect(screen.getByText('Please wait a few minutes before trying again.')).toBeInTheDocument();
    });

    it('renders server error fallback message', () => {
        render(<InstagramFallback type="server" />);

        expect(screen.getByText('Server Error')).toBeInTheDocument();
        expect(screen.getByText('Instagram servers are experiencing issues.')).toBeInTheDocument();
        expect(screen.getByText('This is usually temporary. Please try again later.')).toBeInTheDocument();
    });

    it('displays offline indicator when offline', () => {
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: false
        });

        render(<InstagramFallback showOfflineMessage={true} />);

        expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
    });

    it('does not display offline indicator when showOfflineMessage is false', () => {
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: false
        });

        render(<InstagramFallback showOfflineMessage={false} />);

        expect(screen.queryByText('You appear to be offline')).not.toBeInTheDocument();
    });

    it('displays cached posts when provided', () => {
        render(
            <InstagramFallback
                fallbackPosts={mockFallbackPosts}
                showCachedContent={true}
            />
        );

        expect(screen.getByText('Cached Instagram Posts')).toBeInTheDocument();
        expect(screen.getByText('Test post 1 caption that is long enough to be truncated...')).toBeInTheDocument();
        expect(screen.getByText('Short caption')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument(); // likes count
        expect(screen.getByText('10')).toBeInTheDocument(); // comments count
    });

    it('limits cached posts to 4 items', () => {
        const manyPosts = Array.from({ length: 10 }, (_, i) => ({
            id: i.toString(),
            caption: `Post ${i}`,
            media_url: `https://example.com/image${i}.jpg`,
            permalink: `https://instagram.com/p/${i}`
        }));

        render(
            <InstagramFallback
                fallbackPosts={manyPosts}
                showCachedContent={true}
            />
        );

        // Should only show first 4 posts
        expect(screen.getByText('Post 0')).toBeInTheDocument();
        expect(screen.getByText('Post 3')).toBeInTheDocument();
        expect(screen.queryByText('Post 4')).not.toBeInTheDocument();
    });

    it('handles retry functionality', () => {
        const onRetryMock = vi.fn();

        render(
            <InstagramFallback
                onRetry={onRetryMock}
                showRetry={true}
                retryCount={1}
                maxRetries={3}
            />
        );

        const retryButton = screen.getByRole('button', { name: /try again/i });
        fireEvent.click(retryButton);

        expect(onRetryMock).toHaveBeenCalledTimes(1);
    });

    it('disables retry button when retrying', () => {
        const onRetryMock = vi.fn();

        render(
            <InstagramFallback
                onRetry={onRetryMock}
                showRetry={true}
                isRetrying={true}
            />
        );

        const retryButton = screen.getByRole('button', { name: /retrying/i });
        expect(retryButton).toBeDisabled();
    });

    it('hides retry button when max retries reached', () => {
        const onRetryMock = vi.fn();

        render(
            <InstagramFallback
                onRetry={onRetryMock}
                showRetry={true}
                retryCount={3}
                maxRetries={3}
            />
        );

        expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('displays error message details when provided', () => {
        render(
            <InstagramFallback
                errorMessage="Detailed error message for debugging"
            />
        );

        const showDetailsButton = screen.getByText('Show error details');
        fireEvent.click(showDetailsButton);

        expect(screen.getByText('Detailed error message for debugging')).toBeInTheDocument();
        expect(screen.getByText('Hide error details')).toBeInTheDocument();
    });

    it('displays last updated timestamp when provided', () => {
        const lastUpdated = new Date('2023-01-01T12:00:00Z');

        render(
            <InstagramFallback
                lastUpdated={lastUpdated.toISOString()}
            />
        );

        expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });

    it('displays retry count indicator', () => {
        render(
            <InstagramFallback
                retryCount={2}
                maxRetries={5}
            />
        );

        expect(screen.getByText('Retry attempts: 2/5')).toBeInTheDocument();
    });

    it('renders Visit Instagram link', () => {
        render(<InstagramFallback />);

        const instagramLink = screen.getByRole('link', { name: /visit instagram/i });
        expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com');
        expect(instagramLink).toHaveAttribute('target', '_blank');
        expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('handles image loading errors in cached posts', () => {
        render(
            <InstagramFallback
                fallbackPosts={mockFallbackPosts}
                showCachedContent={true}
            />
        );

        const images = screen.getAllByRole('img');
        const firstImage = images[0];

        // Simulate image load error
        fireEvent.error(firstImage);

        // Image should be hidden and placeholder should be shown
        expect(firstImage.style.display).toBe('none');
    });

    it('truncates long captions in cached posts', () => {
        const longCaptionPost = {
            id: '1',
            caption: 'This is a very long caption that should be truncated when displayed in the fallback component because it exceeds the maximum length',
            media_url: 'https://example.com/image.jpg'
        };

        render(
            <InstagramFallback
                fallbackPosts={[longCaptionPost]}
                showCachedContent={true}
            />
        );

        expect(screen.getByText(/This is a very long caption that should be truncated when/)).toBeInTheDocument();
        expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
    });

    it('handles posts without stats gracefully', () => {
        const postWithoutStats = {
            id: '1',
            caption: 'Post without stats',
            media_url: 'https://example.com/image.jpg'
        };

        render(
            <InstagramFallback
                fallbackPosts={[postWithoutStats]}
                showCachedContent={true}
            />
        );

        expect(screen.getByText('Post without stats')).toBeInTheDocument();
        // Should not crash or show undefined stats
    });

    it('handles posts without media_url gracefully', () => {
        const postWithoutImage = {
            id: '1',
            caption: 'Post without image'
        };

        render(
            <InstagramFallback
                fallbackPosts={[postWithoutImage]}
                showCachedContent={true}
            />
        );

        expect(screen.getByText('Post without image')).toBeInTheDocument();
        // Should show placeholder icon instead of broken image
    });

    it('monitors online status changes', async () => {
        render(<InstagramFallback showOfflineMessage={true} />);

        // Initially online, no offline message
        expect(screen.queryByText('You appear to be offline')).not.toBeInTheDocument();

        // Simulate going offline
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: false
        });

        fireEvent(window, new Event('offline'));

        await waitFor(() => {
            expect(screen.getByText('You appear to be offline')).toBeInTheDocument();
        });

        // Simulate going back online
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });

        fireEvent(window, new Event('online'));

        await waitFor(() => {
            expect(screen.queryByText('You appear to be offline')).not.toBeInTheDocument();
        });
    });

    it('applies custom className', () => {
        const { container } = render(
            <InstagramFallback className="custom-fallback-class" />
        );

        expect(container.firstChild).toHaveClass('custom-fallback-class');
    });

    it('provides proper accessibility attributes', () => {
        render(<InstagramFallback />);

        const fallbackRegion = screen.getByRole('region');
        expect(fallbackRegion).toHaveAttribute('aria-labelledby', 'fallback-title');
        expect(fallbackRegion).toHaveAttribute('aria-describedby', 'fallback-description');
    });
});