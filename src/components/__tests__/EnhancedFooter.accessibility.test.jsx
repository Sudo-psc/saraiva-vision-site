import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EnhancedFooter } from '../EnhancedFooter';

expect.extend(toHaveNoViolations);

// Mock Framer Motion for accessibility testing
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        footer: ({ children, ...props }) => <footer {...props}>{children}</footer>,
        a: ({ children, ...props }) => <a {...props}>{children}</a>
    },
    AnimatePresence: ({ children }) => children
}));

// Mock performance hooks
vi.mock('../../hooks/usePerformanceMonitor', () => ({
    usePerformanceMonitor: () => ({
        performanceLevel: 'high',
        isOptimized: true
    })
}));

const mockFooterData = {
    socialLinks: [
        {
            name: 'Instagram',
            href: 'https://instagram.com/test',
            image: '/icons_social/instagram_icon.png',
            color: '#E4405F'
        },
        {
            name: 'Facebook',
            href: 'https://facebook.com/test',
            image: '/icons_social/facebook_icon.png',
            color: '#1877F2'
        },
        {
            name: 'WhatsApp',
            href: 'https://wa.me/1234567890',
            image: '/icons_social/whatsapp_icon.png',
            color: '#25D366'
        }
    ],
    contactInfo: {
        phone: '+55 11 99999-9999',
        email: 'contato@test.com',
        address: 'Test Address, 123'
    },
    navigationLinks: [
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/services' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' }
    ]
};

describe('Enhanced Footer Accessibility Tests', () => {
    let user;

    beforeEach(() => {
        user = userEvent.setup();

        // Mock reduced motion preference
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    describe('ARIA Labels and Roles', () => {
        it('should have proper ARIA labels for all interactive elements', () => {
            render(<EnhancedFooter {...mockFooterData} />);

            // Footer should have proper role
            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();

            // Social links should have descriptive labels
            const instagramLink = screen.getByRole('link', { name: /instagram/i });
            expect(instagramLink).toHaveAttribute('aria-label', 'Visit our Instagram page');

            const facebookLink = screen.getByRole('link', { name: /facebook/i });
            expect(facebookLink).toHaveAttribute('aria-label', 'Visit our Facebook page');

            const whatsappLink = screen.getByRole('link', { name: /whatsapp/i });
            expect(whatsappLink).toHaveAttribute('aria-label', 'Contact us on WhatsApp');
        });

        it('should provide ARIA descriptions for 3D interactive elements', () => {
            render(<EnhancedFooter {...mockFooterData} />);

            const socialIcons = screen.getAllByTestId(/social-icon-3d/);

            socialIcons.forEach(icon => {
                expect(icon).toHaveAttribute('aria-describedby');
                const descriptionId = icon.getAttribute('aria-describedby');
                const description = document.getElementById(descriptionId);
                expect(description).toHaveTextContent(/3D interactive social media icon/);
            });
        });

        it('should have proper ARIA live regions for dynamic content', () => {
            render(<EnhancedFooter {...mockFooterData} />);

            const statusRegion = screen.getByRole('status');
            expect(statusRegion).toHaveAttribute('aria-live', 'polite');
            expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
        });

        it('should provide ARIA labels for glass morphism containers', () => {
            render(<EnhancedFooter {...mockFooterData} />);

            const glassContainer = screen.getByTestId('glass-morphism-container');
            expect(glassContainer).toHaveAttribute('aria-label', 'Enhanced footer with glass effects');
            expect(glassContainer).toHaveAttribute('role', 'region');
        });
    });

    describe('Keyboard Navigation', () => {
        it('should support full keyboard navigation through all interactive elements', async () => {
            render(<EnhancedFooter {...mockFooterData} />);

            // Start navigation
            await user.tab();

            // Should focus on first social link
            const firstSocialLink = screen.getByRole('link', { name: /instagram/i });
            expect(firstSocialLink).toHaveFocus();

            // Continue through social links
            await user.tab();
            const secondSocialLink = screen.getByRole('link', { name: /facebook/i });
            expect(secondSocialLink).toHaveFocus();

            await user.tab();
            const thirdSocialLink = screen.getByRole('link', { name: /whatsapp/i });
            expect(thirdSocialLink).toHaveFocus();

            // Continue to navigation links
            await user.tab();
            const homeLink = screen.getByRole('link', { name: /home/i });
            expect(homeLink).toHaveFocus();
        });

        it('should handle Enter and Space key activation for 3D social icons', async () => {
            const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => { });

            render(<EnhancedFooter {...mockFooterData} />);

            const instagramLink = screen.getByRole('link', { name: /instagram/i });

            await user.tab();
            expect(instagramLink).toHaveFocus();

            // Test Enter key
            await user.keyboard('{Enter}');
            expect(mockOpen).toHaveBeenCalledWith('https://instagram.com/test', '_blank');

            mockOpen.mockRestore();
        });

        it('should provide visible focus indicators for 3D elements', async () => {
            render(<EnhancedFooter {...mockFooterData} />);

            const socialLink = screen.getByRole('link', { name: /instagram/i });

            await user.tab();

            expect(socialLink).toHaveFocus();
            expect(socialLink).toHaveClass('focus-visible');

            // Focus indicator should work with 3D transforms
            const focusRing = socialLink.querySelector('.focus-ring-3d');
            expect(focusRing).toBeInTheDocument();
            expect(focusRing).toHaveClass('focus-ring-active');
        });

        it('should support arrow key navigation within social icons group', async () => {
            render(<EnhancedFooter {...mockFooterData} />);

            const socialIconsContainer = screen.getByTestId('social-icons-container');
            socialIconsContainer.focus();

            // Right arrow should move to next icon
            await user.keyboard('{ArrowRight}');
            const firstIcon = screen.getByRole('link', { name: /instagram/i });
            expect(firstIcon).toHaveFocus();

            await user.keyboard('{ArrowRight}');
            const secondIcon = screen.getByRole('link', { name: /facebook/i });
            expect(secondIcon).toHaveFocus();

            // Left arrow should move back
            await user.keyboard('{ArrowLeft}');
            expect(firstIcon).toHaveFocus();
        });
    });

    describe('Screen Reader Compatibility', () => {
        it('should provide descriptive text for screen readers', () => {
            render(<EnhancedFooter {...mockFooterData} />);

            // Check for screen reader only text
            const srOnlyTexts = screen.getAllByTestId('sr-only');

            expect(srOnlyTexts).toContainEqual(
                expect.objectContaining({
                    textContent: expect.stringContaining('Enhanced footer with 3D social media icons')
                })
            );
        });

        it('should announce hover states to screen readers', async () => {
            render(<EnhancedFooter {...mockFooterData} />);

            const instagramLink = screen.getByRole('link', { name: /instagram/i });
            const announcement = screen.getByRole('status');

            await user.hover(instagramLink);

            await waitFor(() => {
                expect(announcement).toHaveTextContent('Instagram icon activated with 3D effect');
            });

            await user.unhover(instagramLink);

            await waitFor(() => {
                expect(announcement).toHaveTextContent('Instagram icon deactivated');
            });
        });

        it('should provide alternative text for visual effects', () => {
            render(<EnhancedFooter {...mockFooterData} />);

            const beamBackground = screen.getByTestId('beam-background');
            expect(beamBackground).toHaveAttribute('aria-label', 'Animated background with light beams');
            expect(beamBackground).toHaveAttribute('role', 'img');

            const glassEffect = screen.getByTestId('glass-morphism-container');
            expect(glassEffect).toHaveAttribute('aria-describedby');

            const glassDescription = document.getElementById(glassEffect.getAttribute('aria-describedby'));
            expect(glassDescription).toHaveTextContent('Container with glass morphism visual effect');
        });
    });

    describe('High Contrast Mode Support', () => {
        it('should maintain readability in high contrast mode', () => {
            // Mock high contrast media query
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query === '(prefers-contrast: high)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });

            render(<EnhancedFooter {...mockFooterData} />);

            const footer = screen.getByRole('contentinfo');
            expect(footer).toHaveClass('high-contrast-mode');

            // Check that text has sufficient contrast
            const socialLinks = screen.getAllByRole('link');
            socialLinks.forEach(link => {
                expect(link).toHaveClass('high-contrast-text');
            });
        });

        it('should disable glass effects in high contrast mode', () => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query === '(prefers-contrast: high)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });

            render(<EnhancedFooter {...mockFooterData} />);

            const glassContainer = screen.getByTestId('glass-morphism-container');
            expect(glassContainer).toHaveClass('no-glass-effects');
        });
    });

    describe('Reduced Motion Preferences', () => {
        it('should respect prefers-reduced-motion setting', () => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });

            render(<EnhancedFooter {...mockFooterData} />);

            const footer = screen.getByRole('contentinfo');
            expect(footer).toHaveClass('reduced-motion');

            // Animations should be disabled
            const beamBackground = screen.getByTestId('beam-background');
            expect(beamBackground).toHaveClass('no-animation');

            const socialIcons = screen.getAllByTestId(/social-icon-3d/);
            socialIcons.forEach(icon => {
                expect(icon).toHaveClass('no-3d-transforms');
            });
        });

        it('should provide static alternatives when motion is reduced', () => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });

            render(<EnhancedFooter {...mockFooterData} />);

            // Should show static hover effects instead of 3D
            const socialIcons = screen.getAllByTestId(/social-icon-3d/);
            socialIcons.forEach(icon => {
                expect(icon).toHaveClass('static-hover-effects');
            });
        });
    });

    describe('Voice Control Support', () => {
        it('should have proper element labeling for voice navigation', () => {
            render(<EnhancedFooter {...mockFooterData} />);

            // Elements should have voice-friendly names
            const instagramLink = screen.getByRole('link', { name: /instagram/i });
            expect(instagramLink).toHaveAttribute('data-voice-command', 'click instagram');

            const homeLink = screen.getByRole('link', { name: /home/i });
            expect(homeLink).toHaveAttribute('data-voice-command', 'click home');
        });
    });

    describe('Axe Accessibility Compliance', () => {
        it('should pass axe accessibility tests', async () => {
            const { container } = render(<EnhancedFooter {...mockFooterData} />);

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should pass axe tests with animations disabled', async () => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });

            const { container } = render(<EnhancedFooter {...mockFooterData} />);

            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });
    });

    describe('Error State Accessibility', () => {
        it('should announce errors to screen readers', () => {
            const errorProps = {
                ...mockFooterData,
                error: 'Failed to load social media links'
            };

            render(<EnhancedFooter {...errorProps} />);

            const errorAnnouncement = screen.getByRole('alert');
            expect(errorAnnouncement).toHaveTextContent('Failed to load social media links');
            expect(errorAnnouncement).toHaveAttribute('aria-live', 'assertive');
        });

        it('should provide fallback navigation when enhanced features fail', () => {
            const errorProps = {
                ...mockFooterData,
                enhancedFeaturesError: true
            };

            render(<EnhancedFooter {...errorProps} />);

            // Should still have accessible navigation
            const fallbackNavigation = screen.getByTestId('fallback-footer-navigation');
            expect(fallbackNavigation).toBeInTheDocument();

            const socialLinks = screen.getAllByRole('link');
            expect(socialLinks.length).toBeGreaterThan(0);
        });
    });
});