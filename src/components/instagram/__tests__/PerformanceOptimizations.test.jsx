import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import OptimizedImage from '../OptimizedImage';
import { InstagramFeedSkeleton, InstagramPostSkeleton, ShimmerSkeleton } from '../InstagramSkeleton';
import useInstagramPerformance from '../../../hooks/useInstagramPerformance';
import InstagramPost from '../InstagramPost';
import InstagramFeedContainer from '../InstagramFeedContainer';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        img: ({ children, ...props }) => <img {...props}>{children}</img>,
        article: ({ children, ...props }) => <article {...props}>{children}</article>
    }
}));

// Mock Instagram service
vi.mock('../../../services/instagramService', () => ({
    default: {
        fetchPosts: vi.fn(),
        subscribeToStats: vi.fn(() => () => { })
    }
}));

// Mock hooks
vi.mock('../../../hooks/useResponsiveLayout', () => ({
    default: () => ({
        currentBreakpoint: 'md',
        deviceCapabilities: { isTouchDevice: false },
        getGridColumns: () => 4,
        createTouchHandler: () => ({})
    })
}));

// Mock Intersection Observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock Performance Observer
const mockPerformanceObserver = vi.fn();
mockPerformanceObserver.mockReturnValue({
    observe: vi.fn(),
    disconnect: vi.fn()
});
window.PerformanceObserver = mockPerformanceObserver;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true
});

describe('Performance Optimizations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Mock Image constructor
        global.Image = class {
            constructor() {
                setTimeout(() => {
                    this.onload && this.onload();
                }, 100);
            }
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('OptimizedImage Component', () => {
        it('should render with lazy loading enabled', async () => {
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

        it('should show loading placeholder initially', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                />
            );

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should handle image load success', async () => {
            const onLoad = vi.fn();

            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableLazyLoading={false}
                    onLoad={onLoad}
                />
            );

            await waitFor(() => {
                expect(onLoad).toHaveBeenCalled();
            });
        });

        it('should handle image load error', async () => {
            const onError = vi.fn();

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
                    onError={onError}
                />
            );

            await waitFor(() => {
                expect(screen.getByText('Image unavailable')).toBeInTheDocument();
            });
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

            // Should attempt to load optimized formats
            expect(screen.getByRole('img')).toBeInTheDocument();
        });

        it('should generate responsive srcSet', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableFormatOptimization={true}
                    enableLazyLoading={false}
                />
            );

            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('sizes');
        });

        it('should show progressive loading', () => {
            render(
                <OptimizedImage
                    src="/test-image.jpg"
                    alt="Test image"
                    enableProgressiveLoading={true}
                    enableLazyLoading={false}
                />
            );

            // Should show blur placeholder during loading
            expect(document.querySelector('.filter')).toBeInTheDocument();
        });
    });

    describe('Instagram Skeleton Components', () => {
        it('should render post skeleton with shimmer animation', () => {
            render(<InstagramPostSkeleton />);

            expect(document.querySelector('.instagram-post-skeleton')).toBeInTheDocument();
            expect(document.querySelector('.bg-gray-200')).toBeInTheDocument();
        });

        it('should render feed skeleton with correct post count', () => {
            render(
                <InstagramFeedSkeleton
                    postCount={6}
                    showStats={true}
                    layout="grid"
                />
            );

            const skeletons = document.querySelectorAll('.instagram-post-skeleton');
            expect(skeletons).toHaveLength(6);
        });

        it('should render shimmer skeleton with animation', () => {
            render(
                <ShimmerSkeleton
                    width="200px"
                    height="100px"
                    className="test-shimmer"
                />
            );

            expect(document.querySelector('.test-shimmer')).toBeInTheDocument();
            expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
        });

        it('should support different layouts', () => {
            const { rerender } = render(
                <InstagramFeedSkeleton layout="grid" postCount={4} />
            );

            expect(document.querySelector('.grid')).toBeInTheDocument();

            rerender(
                <InstagramFeedSkeleton layout="carousel" postCount={4} />
            );

            expect(document.querySelector('.flex')).toBeInTheDocument();
        });
    });

    describe('useInstagramPerformance Hook', () => {
        const TestComponent = ({ options = {} }) => {
            const {
                loadingImages,
                loadedImages,
                performanceMetrics,
                registerImage,
                preloadImage,
                getLoadingProgress
            } = useInstagramPerformance(options);

            return (
                <div>
                    <div data-testid="loading-count">{loadingImages.size}</div>
                    <div data-testid="loaded-count">{loadedImages.size}</div>
                    <div data-testid="total-images">{performanceMetrics.totalImages}</div>
                    <button onClick={() => preloadImage('/test.jpg')}>
                        Preload
                    </button>
                    <div data-testid="progress">{getLoadingProgress().percentage}</div>
                </div>
            );
        };

        it('should initialize with default state', () => {
            render(<TestComponent />);

            expect(screen.getByTestId('loading-count')).toHaveTextContent('0');
            expect(screen.getByTestId('loaded-count')).toHaveTextContent('0');
            expect(screen.getByTestId('total-images')).toHaveTextContent('0');
        });

        it('should handle image preloading', async () => {
            render(<TestComponent />);

            fireEvent.click(screen.getByText('Preload'));

            await waitFor(() => {
                expect(screen.getByTestId('loaded-count')).toHaveTextContent('1');
            });
        });

        it('should calculate loading progress', async () => {
            render(<TestComponent />);

            fireEvent.click(screen.getByText('Preload'));

            await waitFor(() => {
                expect(screen.getByTestId('progress')).toHaveTextContent('100');
            });
        });

        it('should support performance monitoring', () => {
            render(
                <TestComponent
                    options={{ enablePerformanceMonitoring: true }}
                />
            );

            expect(mockPerformanceObserver).toHaveBeenCalled();
        });

        it('should support lazy loading configuration', () => {
            render(
                <TestComponent
                    options={{
                        enableLazyLoading: true,
                        lazyLoadingThreshold: 0.5
                    }}
                />
            );

            expect(mockIntersectionObserver).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    threshold: 0.5
                })
            );
        });
    });

    describe('Instagram Post Performance Integration', () => {
        const mockPost = {
            id: '1',
            caption: 'Test post caption',
            media_type: 'IMAGE',
            media_url: '/test-image.jpg',
            permalink: 'https://instagram.com/p/test',
            timestamp: '2024-01-01T00:00:00Z',
            username: 'testuser'
        };

        it('should use OptimizedImage component', () => {
            render(
                <InstagramPost
                    post={mockPost}
                    enableLazyLoading={true}
                />
            );

            expect(document.querySelector('.optimized-image-container')).toBeInTheDocument();
        });

        it('should handle image loading states', async () => {
            render(
                <InstagramPost
                    post={mockPost}
                    enableLazyLoading={false}
                />
            );

            // Should show loading state initially
            await waitFor(() => {
                expect(document.querySelector('.bg-gray-200')).toBeInTheDocument();
            });
        });

        it('should support lazy loading configuration', () => {
            const { rerender } = render(
                <InstagramPost
                    post={mockPost}
                    enableLazyLoading={true}
                />
            );

            expect(mockIntersectionObserver).toHaveBeenCalled();

            rerender(
                <InstagramPost
                    post={mockPost}
                    enableLazyLoading={false}
                />
            );

            // Should load immediately when lazy loading is disabled
            expect(document.querySelector('.optimized-image-container')).toBeInTheDocument();
        });
    });

    describe('Instagram Feed Container Performance', () => {
        beforeEach(() => {
            const mockInstagramService = require('../../../services/instagramService').default;
            mockInstagramService.fetchPosts.mockResolvedValue({
                success: true,
                posts: [
                    {
                        id: '1',
                        caption: 'Test post 1',
                        media_type: 'IMAGE',
                        media_url: '/test1.jpg',
                        permalink: 'https://instagram.com/p/test1',
                        timestamp: '2024-01-01T00:00:00Z'
                    },
                    {
                        id: '2',
                        caption: 'Test post 2',
                        media_type: 'IMAGE',
                        media_url: '/test2.jpg',
                        permalink: 'https://instagram.com/p/test2',
                        timestamp: '2024-01-01T01:00:00Z'
                    }
                ]
            });
        });

        it('should show skeleton while loading', async () => {
            render(<InstagramFeedContainer maxPosts={4} />);

            expect(document.querySelector('.instagram-feed-skeleton')).toBeInTheDocument();

            await waitFor(() => {
                expect(document.querySelector('.instagram-post')).toBeInTheDocument();
            });
        });

        it('should preload images for better performance', async () => {
            render(<InstagramFeedContainer maxPosts={2} />);

            await waitFor(() => {
                expect(document.querySelectorAll('.instagram-post')).toHaveLength(2);
            });

            // Should have preloaded images
            const links = document.querySelectorAll('link[rel="preload"]');
            expect(links.length).toBeGreaterThan(0);
        });

        it('should cache data for performance', async () => {
            render(<InstagramFeedContainer maxPosts={2} />);

            await waitFor(() => {
                expect(document.querySelectorAll('.instagram-post')).toHaveLength(2);
            });

            // Should have cached data in localStorage
            const cacheKey = 'instagram_posts_2_true';
            expect(localStorage.getItem(cacheKey)).toBeTruthy();
        });

        it('should use cached data on subsequent renders', async () => {
            // Set up cached data
            const cacheKey = 'instagram_posts_2_true';
            const cachedData = {
                posts: [
                    {
                        id: 'cached1',
                        caption: 'Cached post',
                        media_type: 'IMAGE',
                        media_url: '/cached.jpg',
                        permalink: 'https://instagram.com/p/cached',
                        timestamp: '2024-01-01T00:00:00Z'
                    }
                ],
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cachedData));

            render(<InstagramFeedContainer maxPosts={2} />);

            await waitFor(() => {
                expect(screen.getByText('Cached post')).toBeInTheDocument();
            });
        });

        it('should handle offline state gracefully', async () => {
            // Simulate offline
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            render(<InstagramFeedContainer maxPosts={2} />);

            await waitFor(() => {
                expect(document.querySelector('[data-testid="offline-indicator"]') ||
                    document.querySelector('.text-red-500')).toBeInTheDocument();
            });
        });

        it('should support performance monitoring', async () => {
            render(
                <InstagramFeedContainer
                    maxPosts={2}
                    enablePerformanceMonitoring={true}
                />
            );

            await waitFor(() => {
                expect(document.querySelectorAll('.instagram-post')).toHaveLength(2);
            });

            // Performance observer should be initialized
            expect(mockPerformanceObserver).toHaveBeenCalled();
        });
    });

    describe('Image Format Optimization', () => {
        it('should detect WebP support', async () => {
            // Mock canvas WebP support
            const mockCanvas = {
                toDataURL: vi.fn().mockReturnValue('data:image/webp;base64,test')
            };
            document.createElement = vi.fn().mockReturnValue(mockCanvas);

            render(
                <OptimizedImage
                    src="/test.jpg"
                    alt="Test"
                    enableFormatOptimization={true}
                    enableLazyLoading={false}
                />
            );

            await waitFor(() => {
                expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp');
            });
        });

        it('should fallback to original format when optimization fails', async () => {
            // Mock Image to fail for optimized formats
            let callCount = 0;
            global.Image = class {
                constructor() {
                    callCount++;
                    setTimeout(() => {
                        if (callCount === 1) {
                            // First call (optimized format) fails
                            this.onerror && this.onerror();
                        } else {
                            // Second call (original format) succeeds
                            this.onload && this.onload();
                        }
                    }, 100);
                }
            };

            const onLoad = vi.fn();
            render(
                <OptimizedImage
                    src="/test.jpg"
                    alt="Test"
                    enableFormatOptimization={true}
                    enableLazyLoading={false}
                    onLoad={onLoad}
                />
            );

            await waitFor(() => {
                expect(onLoad).toHaveBeenCalled();
            });
        });
    });

    describe('Loading States and Skeletons', () => {
        it('should show appropriate loading states during image load', () => {
            render(
                <OptimizedImage
                    src="/test.jpg"
                    alt="Test"
                    enableLazyLoading={false}
                    enableProgressiveLoading={true}
                />
            );

            // Should show loading skeleton
            expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument();

            // Should show progress indicator
            expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
        });

        it('should animate skeleton loading states', () => {
            render(<InstagramPostSkeleton />);

            // Should have shimmer animation
            expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
        });

        it('should stagger skeleton animations in grid', () => {
            render(
                <InstagramFeedSkeleton
                    postCount={4}
                    layout="grid"
                />
            );

            // Should have multiple skeleton items
            const skeletons = document.querySelectorAll('.instagram-post-skeleton');
            expect(skeletons.length).toBe(4);
        });
    });
});