import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstagramResponsiveGrid from '../InstagramResponsiveGrid';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    }
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));

describe('InstagramResponsiveGrid', () => {
    const mockChildren = [
        <div key="1" data-testid="post-1">Post 1</div>,
        <div key="2" data-testid="post-2">Post 2</div>,
        <div key="3" data-testid="post-3">Post 3</div>,
        <div key="4" data-testid="post-4">Post 4</div>
    ];

    beforeEach(() => {
        // Mock window.innerWidth
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024
        });

        // Clear all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Grid Layout', () => {
        it('renders children in grid layout by default', () => {
            render(
                <InstagramResponsiveGrid maxPosts={4}>
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            expect(screen.getByTestId('post-1')).toBeInTheDocument();
            expect(screen.getByTestId('post-2')).toBeInTheDocument();
            expect(screen.getByTestId('post-3')).toBeInTheDocument();
            expect(screen.getByTestId('post-4')).toBeInTheDocument();
        });

        it('applies correct grid classes for different post counts', () => {
            const { rerender } = render(
                <InstagramResponsiveGrid maxPosts={2} data-testid="grid">
                    {mockChildren.slice(0, 2)}
                </InstagramResponsiveGrid>
            );

            let grid = screen.getByTestId('grid');
            expect(grid).toHaveClass('grid');

            // Test with 4 posts
            rerender(
                <InstagramResponsiveGrid maxPosts={4} data-testid="grid">
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            grid = screen.getByTestId('grid');
            expect(grid).toHaveClass('grid');
        });

        it('applies carousel layout when specified', () => {
            render(
                <InstagramResponsiveGrid layout="carousel" data-testid="grid">
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const grid = screen.getByTestId('grid');
            expect(grid).toHaveClass('flex');
        });
    });

    describe('Responsive Behavior', () => {
        it('updates breakpoint on window resize', async () => {
            const onLayoutChange = vi.fn();

            render(
                <InstagramResponsiveGrid
                    maxPosts={4}
                    onLayoutChange={onLayoutChange}
                    data-testid="grid"
                >
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            // Simulate window resize to mobile
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 640
            });

            fireEvent(window, new Event('resize'));

            await waitFor(() => {
                expect(onLayoutChange).toHaveBeenCalled();
            });
        });

        it('applies correct breakpoint classes', () => {
            render(
                <InstagramResponsiveGrid maxPosts={4} data-testid="grid">
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const grid = screen.getByTestId('grid');
            expect(grid).toHaveAttribute('data-breakpoint');
            expect(grid).toHaveAttribute('data-layout', 'grid');
            expect(grid).toHaveAttribute('data-post-count', '4');
        });
    });

    describe('Touch Gestures', () => {
        it('handles touch events when enabled', () => {
            render(
                <InstagramResponsiveGrid
                    enableTouchGestures={true}
                    data-testid="grid"
                >
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const grid = screen.getByTestId('grid');

            // Simulate touch start
            fireEvent.touchStart(grid, {
                targetTouches: [{ clientX: 100 }]
            });

            // Simulate touch move
            fireEvent.touchMove(grid, {
                targetTouches: [{ clientX: 50 }]
            });

            // Simulate touch end
            fireEvent.touchEnd(grid);

            // Should not throw errors
            expect(grid).toBeInTheDocument();
        });

        it('disables touch events when disabled', () => {
            render(
                <InstagramResponsiveGrid
                    enableTouchGestures={false}
                    data-testid="grid"
                >
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const grid = screen.getByTestId('grid');
            expect(grid).not.toHaveClass('touch-pan-y');
        });

        it('emits swipe events on swipe gestures', () => {
            const mockDispatchEvent = vi.fn();

            render(
                <InstagramResponsiveGrid
                    enableTouchGestures={true}
                    data-testid="grid"
                >
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const grid = screen.getByTestId('grid');
            grid.dispatchEvent = mockDispatchEvent;

            // Simulate left swipe
            fireEvent.touchStart(grid, {
                targetTouches: [{ clientX: 100 }]
            });

            fireEvent.touchMove(grid, {
                targetTouches: [{ clientX: 40 }]
            });

            fireEvent.touchEnd(grid);

            // Should dispatch swipe event
            expect(mockDispatchEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'instagramSwipe'
                })
            );
        });
    });

    describe('Accessibility', () => {
        it('includes proper ARIA attributes', () => {
            render(
                <InstagramResponsiveGrid data-testid="grid">
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const grid = screen.getByTestId('grid');
            expect(grid).toHaveAttribute('role', 'grid');
            expect(grid).toHaveAttribute('aria-label', 'Instagram posts grid');
        });

        it('adds gridcell role to children', () => {
            render(
                <InstagramResponsiveGrid>
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const posts = screen.getAllByRole('gridcell');
            expect(posts).toHaveLength(4);

            posts.forEach((post, index) => {
                expect(post).toHaveAttribute('aria-setsize', '4');
                expect(post).toHaveAttribute('aria-posinset', String(index + 1));
            });
        });
    });

    describe('Performance', () => {
        it('uses ResizeObserver when available', () => {
            render(
                <InstagramResponsiveGrid>
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            expect(global.ResizeObserver).toHaveBeenCalled();
        });

        it('falls back to window resize when ResizeObserver unavailable', () => {
            // Temporarily remove ResizeObserver
            const originalResizeObserver = global.ResizeObserver;
            delete global.ResizeObserver;

            const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

            render(
                <InstagramResponsiveGrid>
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

            // Restore ResizeObserver
            global.ResizeObserver = originalResizeObserver;
            addEventListenerSpy.mockRestore();
        });
    });

    describe('Layout Variants', () => {
        it('applies masonry layout classes', () => {
            render(
                <InstagramResponsiveGrid layout="masonry" data-testid="grid">
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const grid = screen.getByTestId('grid');
            expect(grid).toHaveClass('grid');
            expect(grid).toHaveClass('auto-rows-max');
        });

        it('applies carousel snap classes', () => {
            render(
                <InstagramResponsiveGrid layout="carousel" data-testid="grid">
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const grid = screen.getByTestId('grid');
            expect(grid).toHaveClass('snap-x');
            expect(grid).toHaveClass('snap-mandatory');
        });
    });

    describe('Custom Props', () => {
        it('forwards additional props to container', () => {
            render(
                <InstagramResponsiveGrid
                    data-testid="grid"
                    id="custom-grid"
                    className="custom-class"
                >
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            const grid = screen.getByTestId('grid');
            expect(grid).toHaveAttribute('id', 'custom-grid');
            expect(grid).toHaveClass('custom-class');
        });

        it('calls onLayoutChange callback', async () => {
            const onLayoutChange = vi.fn();

            render(
                <InstagramResponsiveGrid onLayoutChange={onLayoutChange}>
                    {mockChildren}
                </InstagramResponsiveGrid>
            );

            // Should be called on initial render
            await waitFor(() => {
                expect(onLayoutChange).toHaveBeenCalledWith(
                    expect.objectContaining({
                        breakpoint: expect.any(String),
                        width: expect.any(Number),
                        gridColumns: expect.any(String)
                    })
                );
            });
        });
    });
});