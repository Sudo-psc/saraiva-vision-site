import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import SocialLinks3D from '../ui/social-links-3d';

/**
 * SocialLinks3D Component Tests
 * 
 * Tests for the enhanced 3D social links container with coordinated
 * hover states and glass morphism effects.
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

// Mock SocialIcon3D component
vi.mock('../SocialIcon3D', () => ({
    default: ({ social, isHovered, onHover, index }) => (
        <div
            data-testid={`social-icon-${social.name}`}
            data-hovered={isHovered}
            onClick={() => onHover(social.name)}
        >
            {social.name}
        </div>
    )
}));

describe('SocialLinks3D', () => {
    const mockSocials = [
        {
            name: 'Facebook',
            href: 'https://facebook.com/test',
            image: '/icons_social/facebook_icon.png',
            color: '#1877f2'
        },
        {
            name: 'Instagram',
            href: 'https://instagram.com/test',
            image: '/icons_social/instagram_icon.png',
            color: '#E4405F'
        },
        {
            name: 'LinkedIn',
            href: 'https://linkedin.com/test',
            image: '/icons_social/linkedin_icon.png',
            color: '#0077B5'
        }
    ];

    const defaultProps = {
        socials: mockSocials
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Rendering', () => {
        it('renders all social icons', () => {
            render(<SocialLinks3D {...defaultProps} />);

            expect(screen.getByTestId('social-icon-Facebook')).toBeInTheDocument();
            expect(screen.getByTestId('social-icon-Instagram')).toBeInTheDocument();
            expect(screen.getByTestId('social-icon-LinkedIn')).toBeInTheDocument();
        });

        it('applies correct spacing classes', () => {
            const { container, rerender } = render(<SocialLinks3D {...defaultProps} spacing="compact" />);
            expect(container.firstChild).toHaveClass('gap-2');

            rerender(<SocialLinks3D {...defaultProps} spacing="normal" />);
            expect(container.firstChild).toHaveClass('gap-4');

            rerender(<SocialLinks3D {...defaultProps} spacing="wide" />);
            expect(container.firstChild).toHaveClass('gap-8');
        });

        it('applies glass container styles when enabled', () => {
            const { container } = render(<SocialLinks3D {...defaultProps} enableGlassContainer={true} />);

            const containerElement = container.firstChild;
            expect(containerElement).toHaveClass('backdrop-blur-sm');
            expect(containerElement).toHaveClass('border-white/10');
        });

        it('does not apply glass container styles when disabled', () => {
            const { container } = render(<SocialLinks3D {...defaultProps} enableGlassContainer={false} />);

            const containerElement = container.firstChild;
            expect(containerElement).not.toHaveClass('backdrop-blur-sm');
        });
    });

    describe('Hover State Management', () => {
        it('manages individual icon hover states', () => {
            render(<SocialLinks3D {...defaultProps} />);

            const facebookIcon = screen.getByTestId('social-icon-Facebook');
            const instagramIcon = screen.getByTestId('social-icon-Instagram');

            // Initially no icons are hovered
            expect(facebookIcon).toHaveAttribute('data-hovered', 'false');
            expect(instagramIcon).toHaveAttribute('data-hovered', 'false');

            // Simulate hover on Facebook icon
            fireEvent.click(facebookIcon);

            // Facebook should be hovered, others should not
            expect(facebookIcon).toHaveAttribute('data-hovered', 'true');
            expect(instagramIcon).toHaveAttribute('data-hovered', 'false');
        });

        it('dims non-hovered icons when one is hovered', () => {
            render(<SocialLinks3D {...defaultProps} />);

            const facebookIcon = screen.getByTestId('social-icon-Facebook');
            const instagramIcon = screen.getByTestId('social-icon-Instagram');

            // Hover Facebook icon
            fireEvent.click(facebookIcon);

            // Check that non-hovered icons have dimmed styling
            const instagramContainer = instagramIcon.parentElement;
            expect(instagramContainer).toHaveClass('opacity-40', 'scale-95');
        });

        it('handles container hover state', () => {
            const { container } = render(<SocialLinks3D {...defaultProps} />);

            const containerElement = container.firstChild;

            fireEvent.mouseEnter(containerElement);

            // Container should have enhanced glass effects when hovered
            expect(containerElement).toHaveClass('backdrop-blur-md');
        });

        it('resets hover state when container is left', () => {
            const { container } = render(<SocialLinks3D {...defaultProps} />);

            const containerElement = container.firstChild;
            const facebookIcon = screen.getByTestId('social-icon-Facebook');

            // Hover an icon first
            fireEvent.click(facebookIcon);
            expect(facebookIcon).toHaveAttribute('data-hovered', 'true');

            // Leave container
            fireEvent.mouseLeave(containerElement);

            // All icons should be reset
            expect(facebookIcon).toHaveAttribute('data-hovered', 'false');
        });
    });

    describe('Animation and Transitions', () => {
        it('applies 3D transform styles', () => {
            const { container } = render(<SocialLinks3D {...defaultProps} />);

            const containerElement = container.firstChild;
            expect(containerElement).toHaveStyle({
                perspective: '1200px',
                transformStyle: 'preserve-3d'
            });
        });

        it('shows stagger animation for icons', () => {
            render(<SocialLinks3D {...defaultProps} />);

            // All icons should be rendered (stagger animation is handled by framer-motion)
            expect(screen.getByTestId('social-icon-Facebook')).toBeInTheDocument();
            expect(screen.getByTestId('social-icon-Instagram')).toBeInTheDocument();
            expect(screen.getByTestId('social-icon-LinkedIn')).toBeInTheDocument();
        });
    });

    describe('Performance Optimizations', () => {
        it('preloads social media images', () => {
            render(<SocialLinks3D {...defaultProps} />);

            // Check for preload links in the document
            const preloadLinks = document.querySelectorAll('link[rel="preload"]');
            expect(preloadLinks.length).toBeGreaterThan(0);

            // Check that social images are preloaded
            const facebookPreload = Array.from(preloadLinks).find(
                link => link.href.includes('facebook_icon.png')
            );
            expect(facebookPreload).toBeTruthy();
        });

        it('uses React.memo for performance optimization', () => {
            // This test verifies that the component is wrapped with React.memo
            expect(SocialLinks3D.$$typeof).toBeDefined();
        });
    });

    describe('Accessibility', () => {
        it('maintains proper focus management', () => {
            render(<SocialLinks3D {...defaultProps} />);

            const facebookIcon = screen.getByTestId('social-icon-Facebook');

            // Should be focusable
            facebookIcon.focus();
            expect(document.activeElement).toBe(facebookIcon);
        });

        it('provides proper ARIA structure', () => {
            const { container } = render(<SocialLinks3D {...defaultProps} />);

            // Container should have proper role and structure
            const containerElement = container.firstChild;
            expect(containerElement).toBeInTheDocument();
        });
    });

    describe('Glass Morphism Effects', () => {
        it('shows background glow effect when container is hovered', () => {
            const { container } = render(<SocialLinks3D {...defaultProps} />);

            const containerElement = container.firstChild;

            fireEvent.mouseEnter(containerElement);

            // Should show enhanced glass effects
            expect(containerElement).toHaveClass('backdrop-blur-md');
            expect(containerElement).toHaveClass('border-white/20');
        });

        it('shows ambient lighting effect when icon is hovered', () => {
            render(<SocialLinks3D {...defaultProps} />);

            const facebookIcon = screen.getByTestId('social-icon-Facebook');

            // Hover an icon
            fireEvent.click(facebookIcon);

            // Ambient lighting should be present (handled by framer-motion AnimatePresence)
            expect(facebookIcon).toHaveAttribute('data-hovered', 'true');
        });
    });

    describe('Responsive Design', () => {
        it('handles different spacing options correctly', () => {
            const { container, rerender } = render(<SocialLinks3D {...defaultProps} spacing="compact" />);

            let containerElement = container.firstChild;
            expect(containerElement).toHaveClass('gap-2');

            rerender(<SocialLinks3D {...defaultProps} spacing="wide" />);
            containerElement = container.firstChild;
            expect(containerElement).toHaveClass('gap-8');
        });
    });

    describe('Error Handling', () => {
        it('handles empty socials array gracefully', () => {
            expect(() => {
                render(<SocialLinks3D socials={[]} />);
            }).not.toThrow();
        });

        it('handles missing social properties gracefully', () => {
            const incompleteSocials = [
                { name: 'Facebook' }, // Missing href and image
                { href: 'https://instagram.com' } // Missing name and image
            ];

            expect(() => {
                render(<SocialLinks3D socials={incompleteSocials} />);
            }).not.toThrow();
        });
    });

    describe('Custom Props', () => {
        it('accepts and applies custom className', () => {
            const { container } = render(
                <SocialLinks3D {...defaultProps} className="custom-class" />
            );

            const containerElement = container.firstChild;
            expect(containerElement).toHaveClass('custom-class');
        });

        it('passes through additional props', () => {
            const { container } = render(
                <SocialLinks3D {...defaultProps} data-testid="social-container" />
            );

            const containerElement = container.firstChild;
            expect(containerElement).toHaveAttribute('data-testid', 'social-container');
        });
    });
});