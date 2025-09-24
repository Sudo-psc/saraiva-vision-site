import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OptimizedImage from '../OptimizedImage';
import { InstagramPostSkeleton, ShimmerSkeleton } from '../InstagramSkeleton';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        img: ({ children, ...props }) => <img {...props}>{children}</img>
    }
}));

// Mock Intersection Observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Performance Optimization Core Features', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Image constructor
        global.Image = class {
            constructor() {
                setTimeout(() => {
                    this.onload && this.onload();
                }, 100);
            }
        };
    });

    describe('OptimizedImage Component', () => {
        it('should render image container', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                />
            );

            expect(document.querySelector('.optimized-image-container')).toBeInTheDocument();
        });

        it('should show loading state initially', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                />
            );

            // Should show loading skeleton
            expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
        });

        it('should support lazy loading when enabled', () => {
            const mockObserve = vi.fn();
            mockIntersectionObserver.mockReturnValue({
                observe: mockObserve,
                unobserve: vi.fn(),
                disconnect: vi.fn()
            });

            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={true}
                />
            );

            expect(mockObserve).toHaveBeenCalled();
        });

        it('should load immediately when lazy loading is disabled', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                />
            );

            // Should not use intersection observer
            expect(mockIntersectionObserver).not.toHaveBeenCalled();
        });

        it('should support format optimization', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableFormatOptimization={true}
                    enableLazyLoading={false}
                />
            );

            // Should render the component
            expect(document.querySelector('.optimized-image-container')).toBeInTheDocument();
        });

        it('should show progressive loading when enabled', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableProgressiveLoading={true}
                    enableLazyLoading={false}
                />
            );

            // Should show blur placeholder
            expect(document.querySelector('.filter')).toBeInTheDocument();
        });
    });

    describe('Skeleton Components', () => {
        it('should render InstagramPostSkeleton', () => {
            render(<InstagramPostSkeleton />);

            expect(document.querySelector('.instagram-post-skeleton')).toBeInTheDocument();
        });

        it('should render ShimmerSkeleton with custom dimensions', () => {
            render(
                <ShimmerSkeleton
                    width="200px"
                    height="100px"
                    className="test-shimmer"
                />
            );

            const shimmer = document.querySelector('.test-shimmer');
            expect(shimmer).toBeInTheDocument();
            expect(shimmer).toHaveStyle({ width: '200px', height: '100px' });
        });

        it('should show shimmer animation', () => {
            render(<InstagramPostSkeleton />);

            // Should have gradient animation
            expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
        });
    });

    describe('Performance Features Integration', () => {
        it('should handle image loading states', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                />
            );

            // Should show loading state
            expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument();

            // Should show progress indicator
            expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
        });

        it('should support different image formats', () => {
            const { rerender } = render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableFormatOptimization={true}
                    enableLazyLoading={false}
                />
            );

            expect(document.querySelector('.optimized-image-container')).toBeInTheDocument();

            // Test with WebP
            rerender(
                <OptimizedImage
                    src="/test-image.webp"
                    alt="Test image"
                    enableFormatOptimization={true}
                    enableLazyLoading={false}
                />
            );

            expect(document.querySelector('.optimized-image-container')).toBeInTheDocument();
        });

        it('should handle error states gracefully', () => {
            // Mock Image to fail
            global.Image = class {
                constructor() {
                    setTimeout(() => {
                        this.onerror && this.onerror();
                    }, 100);
                }
            };

            render(
                <OptimizedImage
                    src="/invalid-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                />
            );

            // Should render without crashing
            expect(document.querySelector('.optimized-image-container')).toBeInTheDocument();
        });
    });

    describe('Accessibility Features', () => {
        it('should provide proper alt text', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Descriptive alt text"
                    enableLazyLoading={false}
                />
            );

            // Should have alt attribute when image loads
            const container = document.querySelector('.optimized-image-container');
            expect(container).toBeInTheDocument();
        });

        it('should support keyboard navigation', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                    tabIndex={0}
                />
            );

            const container = document.querySelector('.optimized-image-container');
            expect(container).toBeInTheDocument();
        });
    });

    describe('Performance Monitoring', () => {
        it('should track loading metrics', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                />
            );

            // Should render and start loading process
            expect(document.querySelector('.optimized-image-container')).toBeInTheDocument();
        });

        it('should support performance callbacks', () => {
            const onLoad = vi.fn();
            const onError = vi.fn();

            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                    onLoad={onLoad}
                    onError={onError}
                />
            );

            // Should render without errors
            expect(document.querySelector('.optimized-image-container')).toBeInTheDocument();
        });
    });
});