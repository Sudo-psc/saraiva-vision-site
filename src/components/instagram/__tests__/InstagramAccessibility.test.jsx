import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import InstagramPost from '../InstagramPost';
import InstagramFeedContainer from '../InstagramFeedContainer';
import InstagramStats from '../InstagramStats';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        article: ({ children, ...props }) => <article {...props}>{children}</article>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }) => children
}));

// Mock services
vi.mock('../../../services/instagramService', () => ({
    default: {
        fetchPosts: vi.fn().mockResolvedValue({
            success: true,
            posts: [],
            cached: false
        }),
        subscribeToStats: vi.fn().mockReturnValue(() => { }),
        fetchPostStats: vi.fn().mockResolvedValue({
            success: true,
            stats: { likes: 100, comments: 10, engagement_rate: 5.5 }
        })
    }
}));

// Mock hooks
vi.mock('../../../hooks/useInstagramPerformance', () => ({
    default: () => ({
        preloadImages: vi.fn(),
        getLoadingProgress: () => 0,
        getPerformanceReport: () => ({})
    })
}));

vi.mock('../../../hooks/useInstagramAccessibility', () => ({
    default: () => ({
        focusedIndex: -1,
        keyboardMode: false,
        screenReaderActive: false,
        announcements: [],
        announce: vi.fn(),
        generatePostDescription: (post) => `Instagram post by ${post.username}`,
        generateAriaLabel: (type, context) => {
            if (type === 'post') return `Instagram post by ${context.post.username}`;
            if (type === 'refresh') return 'Refresh Instagram posts';
            if (type === 'expand-caption') return context.expanded ? 'Show less of caption' : 'Show more of caption';
            if (type === 'stats-tooltip') return 'View detailed engagement statistics';
            return 'Instagram element';
        },
        handleKeyNavigation: vi.fn(),
        registerFocusableElements: vi.fn(),
        focusFirst: vi.fn(),
        createLiveRegion: () => ({ 'aria-live': 'polite' })
    })
}));

vi.mock('../../../hooks/useAccessibilityPreferences', () => ({
    default: () => ({
        getAccessibilityClasses: () => '',
        getAccessibilityStyles: () => ({}),
        getAnimationConfig: () => ({ duration: 0.3, ease: 'easeOut', stagger: 0.1 }),
        shouldReduceMotion: () => false,
        isHighContrast: false,
        getAccessibleColors: () => null,
        getFocusStyles: () => ({})
    })
}));

vi.mock('../../../hooks/useResponsiveLayout', () => ({
    default: () => ({
        currentBreakpoint: 'md',
        deviceCapabilities: { isTouchDevice: false },
        getGridColumns: () => 2,
        createTouchHandler: () => ({})
    })
}));

// Mock components
vi.mock('../InstagramResponsiveGrid', () => ({
    default: ({ children }) => <div data-testid="responsive-grid">{children}</div>
}));

vi.mock('../InstagramSkeleton', () => ({
    InstagramFeedSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>
}));

vi.mock('../OptimizedImage', () => ({
    default: ({ alt, ...props }) => <img alt={alt} {...props} />
}));

describe('Instagram Accessibility Compliance', () => {
    const mockPost = {
        id: '1',
        caption: 'Test post caption for accessibility testing',
        media_type: 'IMAGE',
        media_url: 'https://example.com/image1.jpg',
        permalink: 'https://instagram.com/p/1',
        timestamp: '2024-01-01T12:00:00Z',
        username: 'testuser',
        stats: { likes: 100, comments: 10, engagement_rate: 5.5 }
    };

    const mockPosts = [mockPost, { ...mockPost, id: '2', username: 'testuser2' }];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ARIA Attributes and Semantic HTML', () => {
        test('InstagramPost should have comprehensive ARIA attributes', () => {
            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                    aria-setsize={2}
                    aria-posinset={1}
                />
            );

            const article = screen.getByRole('article');
            expect(article).toHaveAttribute('aria-setsize', '2');
            expect(article).toHaveAttribute('aria-posinset', '1');
            expect(article).toHaveAttribute('aria-label');
            expect(article).toHaveAttribute('aria-describedby');
        });

        test('InstagramFeedContainer should have proper semantic structure', () => {
            render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enableAccessibility={true}
                />
            );

            // Check for semantic HTML elements
            expect(screen.getByRole('region')).toBeInTheDocument();
            expect(screen.getByRole('banner')).toBeInTheDocument();
            expect(screen.getByLabelText(/Instagram Feed/)).toBeInTheDocument();
        });

        test('Images should have proper alt text and ARIA attributes', () => {
            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                />
            );

            const image = screen.getByRole('img');
            expect(image).toHaveAttribute('alt');
            expect(image).toHaveAttribute('aria-describedby');
            expect(image).toHaveAttribute('aria-labelledby');

            const altText = image.getAttribute('alt');
            expect(altText).toContain('Instagram');
            expect(altText).toContain(mockPost.caption);
        });

        test('Buttons should have proper ARIA labels and descriptions', () => {
            render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enableAccessibility={true}
                />
            );

            const refreshButton = screen.getByRole('button', { name: /refresh/i });
            expect(refreshButton).toHaveAttribute('aria-label');
            expect(refreshButton).toHaveAttribute('aria-describedby');
            expect(refreshButton).toHaveAttribute('type', 'button');
        });

        test('Statistics should have proper ARIA structure', () => {
            render(
                <InstagramStats
                    postId="1"
                    initialStats={mockPost.stats}
                    enableAccessibility={true}
                />
            );

            const statsRegion = screen.getByRole('region');
            expect(statsRegion).toHaveAttribute('aria-label', 'Instagram post statistics');
            expect(statsRegion).toHaveAttribute('aria-describedby');
        });
    });

    describe('Keyboard Navigation Support', () => {
        test('InstagramPost should handle keyboard events', async () => {
            const user = userEvent.setup();
            const mockOnClick = vi.fn();

            render(
                <InstagramPost
                    post={mockPost}
                    onClick={mockOnClick}
                    enableAccessibility={true}
                    tabIndex={0}
                />
            );

            const article = screen.getByRole('article');

            // Test Enter key
            await user.click(article);
            await user.keyboard('{Enter}');
            expect(mockOnClick).toHaveBeenCalled();

            // Test Space key
            mockOnClick.mockClear();
            await user.keyboard(' ');
            expect(mockOnClick).toHaveBeenCalled();
        });

        test('Caption expand button should be keyboard accessible', async () => {
            const user = userEvent.setup();
            const longCaptionPost = {
                ...mockPost,
                caption: 'This is a very long caption that should be truncated and have an expand button for better accessibility and user experience when reading Instagram posts'
            };

            render(
                <InstagramPost
                    post={longCaptionPost}
                    enableAccessibility={true}
                    maxCaptionLength={50}
                />
            );

            const expandButton = screen.getByRole('button', { name: /Show more/ });
            expect(expandButton).toHaveAttribute('aria-expanded', 'false');

            await user.click(expandButton);
            expect(expandButton).toHaveAttribute('aria-expanded', 'true');
        });

        test('Skip links should be keyboard accessible', () => {
            render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enableAccessibility={true}
                />
            );

            const skipLink = screen.getByText('Skip to Instagram posts');
            expect(skipLink).toHaveAttribute('href', '#instagram-posts-grid');
            expect(skipLink).toHaveClass('skip-link');
        });

        test('Statistics tooltip should be keyboard accessible', async () => {
            const user = userEvent.setup();

            render(
                <InstagramStats
                    postId="1"
                    initialStats={mockPost.stats}
                    enableAccessibility={true}
                    showTooltip={true}
                />
            );

            const tooltipButton = screen.getByRole('button', { name: /detailed engagement statistics/ });
            expect(tooltipButton).toHaveAttribute('aria-expanded', 'false');

            await user.click(tooltipButton);
            expect(tooltipButton).toHaveAttribute('aria-expanded', 'true');
        });
    });

    describe('Screen Reader Compatibility', () => {
        test('Should provide comprehensive screen reader content', () => {
            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                />
            );

            // Check for screen reader only content
            const srElements = document.querySelectorAll('.sr-only');
            expect(srElements.length).toBeGreaterThan(0);

            // Check for specific screen reader descriptions
            expect(screen.getByText(/Instagram post by testuser/)).toBeInTheDocument();
        });

        test('Should announce updates via live regions', () => {
            render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enableAccessibility={true}
                />
            );

            // Check for live regions
            const liveRegions = document.querySelectorAll('[aria-live]');
            expect(liveRegions.length).toBeGreaterThan(0);
        });

        test('Should provide status updates for loading states', () => {
            render(
                <InstagramStats
                    postId="1"
                    initialStats={null}
                    enableAccessibility={true}
                />
            );

            // Should have loading status
            expect(screen.getByRole('status', { name: /loading statistics/i })).toBeInTheDocument();
        });

        test('Should provide proper time information', () => {
            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                    showTimestamp={true}
                />
            );

            const timeElement = screen.getByRole('time');
            expect(timeElement).toHaveAttribute('dateTime', mockPost.timestamp);
            expect(timeElement).toHaveAttribute('aria-label');
        });

        test('Should provide network status information', () => {
            render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enableAccessibility={true}
                />
            );

            const networkStatus = screen.getByRole('status', { name: /online/i });
            expect(networkStatus).toBeInTheDocument();
        });
    });

    describe('Error State Accessibility', () => {
        test('Error states should use proper ARIA roles', () => {
            // Mock error state
            vi.mocked(require('../../../services/instagramService').default.fetchPosts)
                .mockRejectedValueOnce(new Error('Network error'));

            render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enableAccessibility={true}
                />
            );

            // Wait for error state to render
            waitFor(() => {
                const errorAlert = screen.getByRole('alert');
                expect(errorAlert).toBeInTheDocument();
                expect(errorAlert).toHaveAttribute('aria-labelledby');
                expect(errorAlert).toHaveAttribute('aria-describedby');
            });
        });
    });

    describe('Focus Management', () => {
        test('Should have proper focus indicators', () => {
            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                    tabIndex={0}
                />
            );

            const article = screen.getByRole('article');
            expect(article).toHaveAttribute('tabIndex', '0');
        });

        test('Should manage focus for grid navigation', () => {
            render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enableAccessibility={true}
                />
            );

            const container = screen.getByRole('region');
            expect(container).toHaveAttribute('tabIndex', '0');
        });
    });

    describe('Media Type Indicators', () => {
        test('Video indicators should have proper ARIA attributes', () => {
            const videoPost = { ...mockPost, media_type: 'VIDEO' };

            render(
                <InstagramPost
                    post={videoPost}
                    enableAccessibility={true}
                    showMediaType={true}
                />
            );

            const videoIndicator = screen.getByRole('img', { name: /video content indicator/i });
            expect(videoIndicator).toBeInTheDocument();
        });

        test('Album indicators should have proper ARIA attributes', () => {
            const albumPost = { ...mockPost, media_type: 'CAROUSEL_ALBUM' };

            render(
                <InstagramPost
                    post={albumPost}
                    enableAccessibility={true}
                    showMediaType={true}
                />
            );

            const albumIndicator = screen.getByRole('img', { name: /photo album indicator/i });
            expect(albumIndicator).toBeInTheDocument();
        });
    });

    describe('Statistics Accessibility', () => {
        test('Statistics should have proper ARIA labels', () => {
            render(
                <InstagramStats
                    postId="1"
                    initialStats={mockPost.stats}
                    enableAccessibility={true}
                />
            );

            // Check for text roles with proper labels
            const likesText = screen.getByRole('text', { name: /100 likes/i });
            expect(likesText).toBeInTheDocument();

            const commentsText = screen.getByRole('text', { name: /10 comments/i });
            expect(commentsText).toBeInTheDocument();
        });

        test('Tooltip should have proper table structure', async () => {
            const user = userEvent.setup();

            render(
                <InstagramStats
                    postId="1"
                    initialStats={mockPost.stats}
                    enableAccessibility={true}
                    showTooltip={true}
                />
            );

            const tooltipButton = screen.getByRole('button', { name: /detailed engagement statistics/ });
            await user.click(tooltipButton);

            // Check for tooltip with proper role
            const tooltip = screen.getByRole('tooltip');
            expect(tooltip).toBeInTheDocument();
            expect(tooltip).toHaveAttribute('aria-labelledby', 'tooltip-title');
            expect(tooltip).toHaveAttribute('aria-describedby', 'tooltip-content');
        });
    });

    describe('Comprehensive Accessibility Validation', () => {
        test('All interactive elements should have proper labels', () => {
            render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enableAccessibility={true}
                />
            );

            // Get all buttons and check they have accessible names
            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(
                    button.getAttribute('aria-label') ||
                    button.textContent.trim() ||
                    button.getAttribute('aria-labelledby')
                ).toBeTruthy();
            });
        });

        test('All images should have alt text or ARIA labels', () => {
            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                />
            );

            const images = screen.getAllByRole('img');
            images.forEach(img => {
                expect(
                    img.getAttribute('alt') ||
                    img.getAttribute('aria-label') ||
                    img.getAttribute('aria-labelledby')
                ).toBeTruthy();
            });
        });

        test('Should not have accessibility violations', () => {
            const { container } = render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enableAccessibility={true}
                />
            );

            // Basic accessibility checks
            const interactiveElements = container.querySelectorAll('button, a, [role="button"]');
            interactiveElements.forEach(element => {
                // Should have accessible name
                const hasAccessibleName =
                    element.getAttribute('aria-label') ||
                    element.textContent.trim() ||
                    element.getAttribute('aria-labelledby');
                expect(hasAccessibleName).toBeTruthy();
            });

            // Check for proper heading structure
            const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
            expect(headings.length).toBeGreaterThan(0);
        });
    });
});