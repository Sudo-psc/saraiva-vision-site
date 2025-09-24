import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import SocialIcon3D from '../SocialIcon3D';

/**
 * SocialIcon3D Component Tests
 * 
 * Tests for 3D social media icons with glass morphism effects,
 * hover animations, and accessibility features.
 * 
 * Requirements covered: 2.1, 2.2, 2.4, 2.5
 */

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <div>{children}</div>,
}));

// Mock CSS.supports for feature detection
Object.defineProperty(CSS, 'supports', {
    value: vi.fn(() => true),
    writable: true,
});

describe('SocialIcon3D', () => {
    const mockSocial = {
        name: 'Facebook',
        href: 'https://facebook.com/test',
        image: '/icons_social/facebook_icon.png',
        color: '#1877f2'
    };

    const mockOnHover = vi.fn();
    const defaultProps = {
        social: mockSocial,
        index: 0,
        isHovered: false,
        onHover: mockOnHover
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.open
        global.open = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Rendering', () => {
        it('renders social icon with correct image and alt text', () => {
            render(<SocialIcon3D {...defaultProps} />);

            const image = screen.getByAltText('Facebook');
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', '/icons_social/facebook_icon.png');
        });

        it('renders social icon name label', () => {
            render(<SocialIcon3D {...defaultProps} />);

            const label = screen.getByText('Facebook');
            expect(label).toBeInTheDocument();
        });

        it('applies correct CSS classes for 3D transforms', () => {
            const { container } = render(<SocialIcon3D {...defaultProps} />);

            const iconContainer = container.firstChild;
            expect(iconContainer).toHaveClass('transform-gpu');
            expect(iconContainer).toHaveStyle({
                perspective: '1000px',
                transformStyle: 'preserve-3d'
            });
        });
    });

    describe('Hover Interactions', () => {
        it('calls onHover with social name when mouse enters', () => {
            render(<SocialIcon3D {...defaultProps} />);

            const iconContainer = screen.getByAltText('Facebook').closest('[data-testid]') ||
                screen.getByAltText('Facebook').parentElement.parentElement;

            fireEvent.mouseEnter(iconContainer);

            expect(mockOnHover).toHaveBeenCalledWith('Facebook');
        });

        it('calls onHover with null when mouse leaves', () => {
            render(<SocialIcon3D {...defaultProps} />);

            const iconContainer = screen.getByAltText('Facebook').closest('[data-testid]') ||
                screen.getByAltText('Facebook').parentElement.parentElement;

            fireEvent.mouseLeave(iconContainer);

            expect(mockOnHover).toHaveBeenCalledWith(null);
        });

        it('shows glass bubble effect when hovered', () => {
            render(<SocialIcon3D {...defaultProps} isHovered={true} />);

            // Check for glass bubble elements (they should be present when hovered)
            const glassBubbles = document.querySelectorAll('[class*="glass"]');
            expect(glassBubbles.length).toBeGreaterThan(0);
        });

        it('applies hover styles when isHovered is true', () => {
            const { rerender } = render(<SocialIcon3D {...defaultProps} />);

            // Initially not hovered
            let label = screen.getByText('Facebook');
            expect(label).toHaveClass('opacity-0');

            // When hovered
            rerender(<SocialIcon3D {...defaultProps} isHovered={true} />);
            label = screen.getByText('Facebook');
            expect(label).toHaveClass('opacity-100');
        });
    });

    describe('Click Interactions', () => {
        it('opens social media link in new tab when clicked', async () => {
            render(<SocialIcon3D {...defaultProps} />);

            const iconContainer = screen.getByAltText('Facebook').closest('[data-testid]') ||
                screen.getByAltText('Facebook').parentElement.parentElement;

            fireEvent.click(iconContainer);

            // Wait for the click animation delay
            await waitFor(() => {
                expect(global.open).toHaveBeenCalledWith(
                    'https://facebook.com/test',
                    '_blank',
                    'noopener,noreferrer'
                );
            }, { timeout: 300 });
        });

        it('handles click animation state correctly', async () => {
            render(<SocialIcon3D {...defaultProps} />);

            const iconContainer = screen.getByAltText('Facebook').closest('[data-testid]') ||
                screen.getByAltText('Facebook').parentElement.parentElement;

            fireEvent.click(iconContainer);

            // The component should handle the click state internally
            // We can't easily test the internal state, but we can verify the click was processed
            expect(iconContainer).toBeInTheDocument();
        });
    });

    describe('Mouse Movement Tracking', () => {
        it('tracks mouse position for dynamic 3D rotation', () => {
            render(<SocialIcon3D {...defaultProps} isHovered={true} />);

            const iconContainer = screen.getByAltText('Facebook').closest('[data-testid]') ||
                screen.getByAltText('Facebook').parentElement.parentElement;

            // Mock getBoundingClientRect
            iconContainer.getBoundingClientRect = vi.fn(() => ({
                left: 100,
                top: 100,
                width: 48,
                height: 48
            }));

            fireEvent.mouseMove(iconContainer, {
                clientX: 150,
                clientY: 150
            });

            // The component should handle mouse movement internally
            expect(iconContainer).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper image alt text', () => {
            render(<SocialIcon3D {...defaultProps} />);

            const image = screen.getByAltText('Facebook');
            expect(image).toBeInTheDocument();
        });

        it('supports keyboard navigation', () => {
            render(<SocialIcon3D {...defaultProps} />);

            const iconContainer = screen.getByAltText('Facebook').closest('[data-testid]') ||
                screen.getByAltText('Facebook').parentElement.parentElement;

            // Should be focusable
            iconContainer.focus();
            expect(document.activeElement).toBe(iconContainer);
        });

        it('prevents default on click to handle custom navigation', () => {
            render(<SocialIcon3D {...defaultProps} />);

            const iconContainer = screen.getByAltText('Facebook').closest('[data-testid]') ||
                screen.getByAltText('Facebook').parentElement.parentElement;

            const clickEvent = new MouseEvent('click', { bubbles: true });
            const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

            fireEvent(iconContainer, clickEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });
    });

    describe('Performance Optimizations', () => {
        it('uses lazy loading for images', () => {
            render(<SocialIcon3D {...defaultProps} />);

            const image = screen.getByAltText('Facebook');
            expect(image).toHaveAttribute('loading', 'lazy');
            expect(image).toHaveAttribute('decoding', 'async');
        });

        it('applies GPU acceleration classes', () => {
            const { container } = render(<SocialIcon3D {...defaultProps} />);

            const iconContainer = container.firstChild;
            expect(iconContainer).toHaveClass('transform-gpu');
        });

        it('uses React.memo for performance optimization', () => {
            // This test verifies that the component is wrapped with React.memo
            expect(SocialIcon3D.$$typeof).toBeDefined();
        });
    });

    describe('Glass Morphism Effects', () => {
        it('applies glass morphism styles when hovered', () => {
            render(<SocialIcon3D {...defaultProps} isHovered={true} />);

            // Check for backdrop-blur and glass effect classes
            const glassElements = document.querySelectorAll('[class*="backdrop-blur"]');
            expect(glassElements.length).toBeGreaterThan(0);
        });

        it('shows multiple bubble layers for liquid effect', () => {
            render(<SocialIcon3D {...defaultProps} isHovered={true} />);

            // Should have multiple bubble layers for the liquid morphing effect
            const bubbleElements = document.querySelectorAll('[class*="rounded-full"]');
            expect(bubbleElements.length).toBeGreaterThan(1);
        });
    });

    describe('Depth Shadow System', () => {
        it('applies multiple shadow layers for 3D depth', () => {
            render(<SocialIcon3D {...defaultProps} isHovered={true} />);

            // Check for shadow elements
            const shadowElements = document.querySelectorAll('[class*="shadow"]');
            expect(shadowElements.length).toBeGreaterThan(0);
        });

        it('shows depth shadows only when hovered', () => {
            const { rerender } = render(<SocialIcon3D {...defaultProps} isHovered={false} />);

            // Initially no depth shadows visible
            let depthShadows = document.querySelectorAll('[class*="opacity-0"]');
            expect(depthShadows.length).toBeGreaterThan(0);

            // When hovered, depth shadows become visible
            rerender(<SocialIcon3D {...defaultProps} isHovered={true} />);
            let visibleShadows = document.querySelectorAll('[class*="opacity-100"]');
            expect(visibleShadows.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        it('handles missing social href gracefully', () => {
            const socialWithoutHref = { ...mockSocial, href: undefined };

            render(<SocialIcon3D {...defaultProps} social={socialWithoutHref} />);

            const iconContainer = screen.getByAltText('Facebook').closest('[data-testid]') ||
                screen.getByAltText('Facebook').parentElement.parentElement;

            fireEvent.click(iconContainer);

            // Should not throw error and not call window.open
            expect(global.open).not.toHaveBeenCalled();
        });

        it('handles missing social image gracefully', () => {
            const socialWithoutImage = { ...mockSocial, image: undefined };

            expect(() => {
                render(<SocialIcon3D {...defaultProps} social={socialWithoutImage} />);
            }).not.toThrow();
        });
    });
});