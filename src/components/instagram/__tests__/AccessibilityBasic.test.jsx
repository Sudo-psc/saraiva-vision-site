import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import InstagramPost from '../InstagramPost';

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
        generatePostDescription: (post) => `Instagram post by ${post.username}`,
        generateAriaLabel: (type, context) => {
            if (type === 'post') return `Instagram post by ${context.post.username}`;
            if (type === 'expand-caption') return context.expanded ? 'Show less of caption' : 'Show more of caption';
            return 'Instagram element';
        },
        announce: vi.fn()
    })
}));

vi.mock('../../../hooks/useAccessibilityPreferences', () => ({
    default: () => ({
        getAccessibilityClasses: () => '',
        getAccessibilityStyles: () => ({}),
        getAnimationConfig: () => ({ duration: 0.3, ease: 'easeOut' }),
        shouldReduceMotion: () => false,
        isHighContrast: false,
        getAccessibleColors: () => null,
        getFocusStyles: () => ({})
    })
}));

vi.mock('../OptimizedImage', () => ({
    default: ({ alt, ...props }) => <img alt={alt} {...props} />
}));

describe('Instagram Accessibility Basic Tests', () => {
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

    test('InstagramPost should have proper ARIA attributes', () => {
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

    test('Images should have proper alt text', () => {
        render(
            <InstagramPost
                post={mockPost}
                enableAccessibility={true}
            />
        );

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('alt');
        const altText = image.getAttribute('alt');
        expect(altText).toContain('Instagram');
        expect(altText).toContain(mockPost.caption);
    });

    test('Should provide screen reader content when accessibility is enabled', () => {
        render(
            <InstagramPost
                post={mockPost}
                enableAccessibility={true}
            />
        );

        // Check for screen reader content
        const srElements = document.querySelectorAll('.sr-only');
        expect(srElements.length).toBeGreaterThan(0);
    });

    test('Should handle long captions with expand button', () => {
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
        expect(expandButton).toHaveAttribute('aria-controls');
        expect(expandButton).toHaveAttribute('type', 'button');
    });

    test('Should be keyboard accessible', () => {
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

    test('Should work without accessibility features', () => {
        render(
            <InstagramPost
                post={mockPost}
                enableAccessibility={false}
            />
        );

        const article = screen.getByRole('article');
        expect(article).toBeInTheDocument();
    });

    test('Media type indicators should have proper ARIA attributes', () => {
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

    test('Time elements should have proper attributes', () => {
        render(
            <InstagramPost
                post={mockPost}
                enableAccessibility={true}
                showTimestamp={true}
            />
        );

        const timeElement = document.querySelector('time');
        expect(timeElement).toHaveAttribute('dateTime', mockPost.timestamp);
        expect(timeElement).toHaveAttribute('aria-label');
    });
});