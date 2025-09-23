import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FooterBeamBackground } from '../ui/footer-beam-background';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// Mock CSS.supports
Object.defineProperty(CSS, 'supports', {
    value: vi.fn((property, value) => {
        if (property === 'backdrop-filter' && value === 'blur(1px)') {
            return true;
        }
        return false;
    }),
    writable: true,
});

// Mock navigator properties
Object.defineProperty(navigator, 'deviceMemory', {
    value: 8,
    writable: true,
});

Object.defineProperty(navigator, 'hardwareConcurrency', {
    value: 8,
    writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion: reduce') ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock canvas context
const mockContext = {
    scale: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
    })),
    fillRect: vi.fn(),
    set fillStyle(value) { },
    set filter(value) { },
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 800,
    height: 400,
    top: 0,
    left: 0,
    bottom: 400,
    right: 800,
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

describe('FooterBeamBackground', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders without crashing', () => {
        render(
            <FooterBeamBackground>
                <div>Test content</div>
            </FooterBeamBackground>
        );

        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders children content', () => {
        render(
            <FooterBeamBackground>
                <div data-testid="footer-content">Footer Content</div>
            </FooterBeamBackground>
        );

        expect(screen.getByTestId('footer-content')).toBeInTheDocument();
        expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <FooterBeamBackground className="custom-footer-class">
                <div>Content</div>
            </FooterBeamBackground>
        );

        expect(container.firstChild).toHaveClass('custom-footer-class');
    });

    it('creates canvas element for beam animation', () => {
        render(
            <FooterBeamBackground>
                <div>Content</div>
            </FooterBeamBackground>
        );

        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
        expect(canvas).toHaveClass('absolute', 'inset-0', 'pointer-events-none');
    });

    it('respects reduced motion preference', () => {
        // Mock reduced motion preference
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: query.includes('prefers-reduced-motion: reduce') ? true : false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        const { container } = render(
            <FooterBeamBackground>
                <div>Content</div>
            </FooterBeamBackground>
        );

        // Should not render canvas when reduced motion is preferred
        const canvas = container.querySelector('canvas');
        expect(canvas).not.toBeInTheDocument();
    });

    it('handles different intensity levels', () => {
        const { rerender } = render(
            <FooterBeamBackground intensity="subtle">
                <div>Content</div>
            </FooterBeamBackground>
        );

        expect(document.querySelector('canvas')).toBeInTheDocument();

        rerender(
            <FooterBeamBackground intensity="strong">
                <div>Content</div>
            </FooterBeamBackground>
        );

        expect(document.querySelector('canvas')).toBeInTheDocument();
    });

    it('handles different color schemes', () => {
        const { rerender } = render(
            <FooterBeamBackground colorScheme="brand">
                <div>Content</div>
            </FooterBeamBackground>
        );

        expect(document.querySelector('canvas')).toBeInTheDocument();

        rerender(
            <FooterBeamBackground colorScheme="blue">
                <div>Content</div>
            </FooterBeamBackground>
        );

        expect(document.querySelector('canvas')).toBeInTheDocument();

        rerender(
            <FooterBeamBackground colorScheme="purple">
                <div>Content</div>
            </FooterBeamBackground>
        );

        expect(document.querySelector('canvas')).toBeInTheDocument();
    });

    it('initializes canvas context and starts animation', async () => {
        render(
            <FooterBeamBackground>
                <div>Content</div>
            </FooterBeamBackground>
        );

        await waitFor(() => {
            expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
        });

        // Should start animation after a delay
        await waitFor(() => {
            expect(global.requestAnimationFrame).toHaveBeenCalled();
        }, { timeout: 200 });
    });

    it('handles window resize events', async () => {
        render(
            <FooterBeamBackground>
                <div>Content</div>
            </FooterBeamBackground>
        );

        // Trigger resize event
        window.dispatchEvent(new Event('resize'));

        await waitFor(() => {
            expect(mockContext.scale).toHaveBeenCalled();
        });
    });

    it('cleans up animation on unmount', async () => {
        vi.useFakeTimers();

        const { unmount } = render(
            <FooterBeamBackground>
                <div>Content</div>
            </FooterBeamBackground>
        );

        // Advance timers to trigger the setTimeout that starts animation
        vi.advanceTimersByTime(100);

        // Wait for animation to start
        await waitFor(() => {
            expect(global.requestAnimationFrame).toHaveBeenCalled();
        });

        unmount();

        // The cleanup should be called during unmount
        expect(global.cancelAnimationFrame).toHaveBeenCalled();

        vi.useRealTimers();
    });

    it('adapts to low performance devices', () => {
        // Mock low-end device
        Object.defineProperty(navigator, 'deviceMemory', {
            value: 2,
            writable: true,
        });
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            value: 2,
            writable: true,
        });

        render(
            <FooterBeamBackground intensity="strong">
                <div>Content</div>
            </FooterBeamBackground>
        );

        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();

        // Should apply performance optimizations
        expect(canvas.style.opacity).toBe('0.7');
    });

    it('applies backdrop filter when supported', async () => {
        CSS.supports = vi.fn((property, value) => {
            if (property === 'backdrop-filter' && value === 'blur(1px)') {
                return true;
            }
            return false;
        });

        const { container } = render(
            <FooterBeamBackground>
                <div>Content</div>
            </FooterBeamBackground>
        );

        // Wait for component to initialize
        await waitFor(() => {
            const canvas = container.querySelector('canvas');
            expect(canvas).toBeInTheDocument();
        });

        // Should render the motion overlay (backdrop filter is applied via style prop)
        const overlay = container.querySelector('.absolute.inset-0.pointer-events-none:not(canvas)');
        expect(overlay).toBeInTheDocument();
    });

    it('handles canvas context creation failure gracefully', () => {
        HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

        expect(() => {
            render(
                <FooterBeamBackground>
                    <div>Content</div>
                </FooterBeamBackground>
            );
        }).not.toThrow();

        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies correct z-index layering', () => {
        const { container } = render(
            <FooterBeamBackground>
                <div data-testid="content">Content</div>
            </FooterBeamBackground>
        );

        const canvas = container.querySelector('canvas');
        const overlay = container.querySelector('[class*="absolute inset-0 pointer-events-none"]:not(canvas)');
        const content = container.querySelector('[class*="relative z-10"]');

        expect(canvas).toBeInTheDocument();
        expect(overlay).toBeInTheDocument();
        expect(content).toBeInTheDocument();
        expect(content).toContainElement(screen.getByTestId('content'));
    });
});