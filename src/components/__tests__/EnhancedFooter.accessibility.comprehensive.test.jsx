/**
 * Enhanced Footer Comprehensive Accessibility Tests
 * 
 * Tests for keyboard navigation, screen reader compatibility, focus management,
 * and WCAG compliance for the enhanced footer functionality.
 * 
 * Requirements covered: 6.1, 6.2, 6.4, 6.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EnhancedFooter from '../EnhancedFooter';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => {
            const translations = {
                'footer.slogan': 'Your vision, our commitment',
                'footer.back_to_top': 'Back to top',
                'footer.social_media': 'Social media links',
                'footer.quick_links': 'Quick Links',
                'footer.services': 'Services',
                'footer.contact': 'Contact',
                'navbar.home': 'Home',
                'navbar.services': 'Services',
                'navbar.about': 'About',
                'navbar.contact': 'Contact'
            };
            return translations[key] || key;
        }
    })
}));

// Mock hooks with accessibility focus
vi.mock('@/hooks/useFooterAccessibility', () => ({
    useFooterAccessibility: () => ({
        getFooterAriaProps: () => ({
            role: 'contentinfo',
            'aria-label': 'Site footer with enhanced visual effects',
            'aria-describedby': 'footer-description'
        }),
        getGlassLayerAriaProps: () => ({ 'aria-hidden': 'true' }),
        shouldReduceMotion: false,
        shouldDisableGlass: false,
        announcementText: '',
        announce: vi.fn(),
        focusManagement: {
            trapFocus: vi.fn(),
            releaseFocus: vi.fn(),
            setFocusableElements: vi.fn()
        },
        keyboardNavigation: {
            handleKeyDown: vi.fn(),
            currentFocusIndex: 0,
            focusableElements: []
        }
    })
}));

vi.mock('@/hooks/useGlassMorphism', () => ({
    useGlassMorphism: () => ({
        capabilities: {
            supportsBackdropFilter: true,
            performanceLevel: 'high',
            reducedMotion: false
        },
        glassIntensity: 'medium',
        shouldEnableGlass: () => true,
        getGlassStyles: () => ({})
    })
}));

vi.mock('@/hooks/useIntersectionObserver', () => ({
    useIntersectionObserver: () => [{ current: null }, true]
}));

// Mock framer-motion with accessibility considerations
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>
    },
    AnimatePresence: ({ children }) => <>{children}</>,
    useReducedMotion: vi.fn(() => false)
}));

// Mock social links component
vi.mock('@/components/ui/social-links-3d', () => ({
    SocialLinks3D: ({ socials, className }) => (
        <div
            role="group"
            aria-label="Social media links"
            aria-describedby="social-links-description"
            className={className}
        >
            <div id="social-links-description" className="sr-only">
                Social media links with 3D hover effects. Use Tab to navigate, Enter or Space to activate.
            </div>
            {socials.map((social, index) => (
                <button
                    key={social.name}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${social.name} profile in new tab`}
                    aria-describedby={`social-${social.name.toLowerCase()}-description`}
                    data-testid={`social-link-${social.name.toLowerCase()}`}
                    onClick={() => window.open(social.href, '_blank', 'noopener,noreferrer')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            window.open(social.href, '_blank', 'noopener,noreferrer');
                        }
                    }}
                >
                    <img src={social.image} alt="" role="presentation" />
                    <div id={`social-${social.name.toLowerCase()}-description`} className="sr-only">
                        {social.name} social media profile. Press Enter or Space to open in new tab.
                        Use arrow keys to navigate between social links.
                    </div>
                </button>
            ))}
        </div>
    )
}));

// Mock window.matchMedia for media queries
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion') ? false : true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('Enhanced Footer Comprehensive Accessibility Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.open
        Object.defineProperty(window, 'open', {
            value: vi.fn(),
            writable: true
        });
        // Mock scrollTo
        Object.defineProperty(window, 'scrollTo', {
            value: vi.fn(),
            writable: true
        });
    });

    describe('WCAG 2.1 AA Compliance', () => {
        test('should have proper semantic structure', () => {
            renderWithRouter(<EnhancedFooter />);

            // Should have main footer landmark
            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();
            expect(footer).toHaveAttribute('aria-label', 'Site footer with enhanced visual effects');
        });

        test('should have proper heading hierarchy', () => {
            renderWithRouter(<EnhancedFooter />);

            // Check for proper heading levels (should not skip levels)
            const headings = screen.getAllByRole('heading');
            headings.forEach((heading, index) => {
                const level = parseInt(heading.tagName.charAt(1));
                expect(level).toBeGreaterThanOrEqual(2); // Footer headings should be h2 or lower
            });
        });

        test('should have sufficient color contrast', () => {
            renderWithRouter(<EnhancedFooter />);

            const footer = screen.getByRole('contentinfo');
            const computedStyle = window.getComputedStyle(footer);

            // Should have high contrast colors
            expect(footer).toHaveClass('text-white'); // Assuming white text on dark background
        });

        test('should have proper focus indicators', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            const focusableElements = screen.getAllByRole('button').concat(screen.getAllByRole('link'));

            for (const element of focusableElements.slice(0, 3)) { // Test first 3 elements
                await user.tab();
                if (document.activeElement === element) {
                    expect(element).toHaveClass('focus:outline-none', 'focus:ring-2');
                }
            }
        });
    });

    describe('Keyboard Navigation', () => {
        test('should support Tab navigation through all interactive elements', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            const interactiveElements = [
                ...screen.getAllByRole('link'),
                ...screen.getAllByRole('button')
            ];

            // Should be able to tab through all elements
            for (let i = 0; i < Math.min(interactiveElements.length, 5); i++) {
                await user.tab();
                expect(document.activeElement).toBeInstanceOf(HTMLElement);
            }
        });

        test('should support Shift+Tab for reverse navigation', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            // Tab forward a few times
            await user.tab();
            await user.tab();
            const forwardElement = document.activeElement;

            // Tab backward
            await user.tab({ shift: true });
            const backwardElement = document.activeElement;

            expect(backwardElement).not.toBe(forwardElement);
        });

        test('should handle Enter key activation', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            const scrollButton = screen.getByLabelText('Back to top');
            scrollButton.focus();

            await user.keyboard('{Enter}');

            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 0,
                behavior: 'smooth'
            });
        });

        test('should handle Space key activation', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            const scrollButton = screen.getByLabelText('Back to top');
            scrollButton.focus();

            await user.keyboard(' ');

            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 0,
                behavior: 'smooth'
            });
        });

        test('should handle Escape key to exit focus traps', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            const socialLinks = screen.getByRole('group', { name: 'Social media links' });
            const firstSocialLink = socialLinks.querySelector('button');

            firstSocialLink.focus();
            await user.keyboard('{Escape}');

            // Should release focus or move to a safe location
            expect(document.activeElement).not.toBe(firstSocialLink);
        });

        test('should support arrow key navigation within social links', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            const socialButtons = screen.getAllByTestId(/social-link-/);

            if (socialButtons.length > 1) {
                socialButtons[0].focus();

                await user.keyboard('{ArrowRight}');

                // Should move focus to next social link
                expect(document.activeElement).toBe(socialButtons[1]);
            }
        });
    });

    describe('Screen Reader Compatibility', () => {
        test('should have proper ARIA labels for all interactive elements', () => {
            renderWithRouter(<EnhancedFooter />);

            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toHaveAttribute('aria-label');
            });

            const links = screen.getAllByRole('link');
            links.forEach(link => {
                // Should have either aria-label or descriptive text content
                const hasAriaLabel = link.hasAttribute('aria-label');
                const hasTextContent = link.textContent.trim().length > 0;
                expect(hasAriaLabel || hasTextContent).toBe(true);
            });
        });

        test('should have hidden descriptions for complex elements', () => {
            renderWithRouter(<EnhancedFooter />);

            // Footer description
            const footerDescription = document.getElementById('footer-description');
            expect(footerDescription).toBeInTheDocument();
            expect(footerDescription).toHaveClass('sr-only');

            // Social links description
            const socialDescription = document.getElementById('social-links-description');
            expect(socialDescription).toBeInTheDocument();
            expect(socialDescription).toHaveClass('sr-only');
        });

        test('should mark decorative elements as aria-hidden', () => {
            renderWithRouter(<EnhancedFooter />);

            // Glass layer should be hidden from screen readers
            const glassLayers = document.querySelectorAll('[aria-hidden="true"]');
            expect(glassLayers.length).toBeGreaterThan(0);
        });

        test('should provide context for external links', () => {
            renderWithRouter(<EnhancedFooter />);

            const externalLinks = screen.getAllByRole('link').filter(link =>
                link.getAttribute('target') === '_blank'
            );

            externalLinks.forEach(link => {
                const ariaLabel = link.getAttribute('aria-label');
                expect(ariaLabel).toMatch(/new tab|external|opens in/i);
            });
        });

        test('should announce state changes', async () => {
            const mockAnnounce = vi.fn();
            vi.mocked(require('@/hooks/useFooterAccessibility').useFooterAccessibility)
                .mockReturnValue({
                    getFooterAriaProps: () => ({ role: 'contentinfo' }),
                    getGlassLayerAriaProps: () => ({ 'aria-hidden': 'true' }),
                    shouldReduceMotion: false,
                    shouldDisableGlass: false,
                    announcementText: 'Footer effects enabled',
                    announce: mockAnnounce,
                    focusManagement: {
                        trapFocus: vi.fn(),
                        releaseFocus: vi.fn(),
                        setFocusableElements: vi.fn()
                    },
                    keyboardNavigation: {
                        handleKeyDown: vi.fn(),
                        currentFocusIndex: 0,
                        focusableElements: []
                    }
                });

            renderWithRouter(<EnhancedFooter />);

            // Should announce when effects are enabled/disabled
            await waitFor(() => {
                expect(mockAnnounce).toHaveBeenCalledWith('Footer effects enabled');
            });
        });
    });

    describe('Focus Management', () => {
        test('should maintain logical focus order', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            const focusableElements = [
                ...screen.getAllByRole('link'),
                ...screen.getAllByRole('button')
            ];

            // Tab through elements and verify order makes sense
            let previousElement = null;
            for (let i = 0; i < Math.min(focusableElements.length, 5); i++) {
                await user.tab();
                const currentElement = document.activeElement;

                if (previousElement && currentElement) {
                    const prevRect = previousElement.getBoundingClientRect();
                    const currRect = currentElement.getBoundingClientRect();

                    // Focus should generally move left-to-right, top-to-bottom
                    expect(currRect.top >= prevRect.top - 10).toBe(true); // Allow small margin
                }

                previousElement = currentElement;
            }
        });

        test('should handle focus trapping in modal-like sections', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            const socialGroup = screen.getByRole('group', { name: 'Social media links' });
            const socialButtons = socialGroup.querySelectorAll('button');

            if (socialButtons.length > 0) {
                socialButtons[0].focus();

                // Tab should cycle within the group
                await user.tab();
                expect(socialGroup.contains(document.activeElement)).toBe(true);
            }
        });

        test('should restore focus after interactions', async () => {
            const user = userEvent.setup();
            renderWithRouter(<EnhancedFooter />);

            const scrollButton = screen.getByLabelText('Back to top');
            scrollButton.focus();

            await user.click(scrollButton);

            // Focus should remain on the button after activation
            expect(document.activeElement).toBe(scrollButton);
        });

        test('should handle focus when animations are disabled', () => {
            vi.mocked(require('framer-motion').useReducedMotion).mockReturnValue(true);

            renderWithRouter(<EnhancedFooter />);

            const focusableElements = [
                ...screen.getAllByRole('link'),
                ...screen.getAllByRole('button')
            ];

            // All elements should still be focusable
            focusableElements.forEach(element => {
                expect(element).not.toHaveAttribute('tabindex', '-1');
            });
        });
    });

    describe('Reduced Motion Support', () => {
        test('should respect prefers-reduced-motion setting', () => {
            // Mock reduced motion preference
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(query => ({
                    matches: query.includes('prefers-reduced-motion'),
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            });

            vi.mocked(require('framer-motion').useReducedMotion).mockReturnValue(true);

            renderWithRouter(<EnhancedFooter />);

            const footer = screen.getByRole('contentinfo');

            // Should have reduced motion classes
            expect(footer).toHaveClass('motion-reduce');
        });

        test('should provide alternative feedback when animations are disabled', () => {
            vi.mocked(require('framer-motion').useReducedMotion).mockReturnValue(true);

            renderWithRouter(<EnhancedFooter />);

            // Should still provide visual feedback through other means
            const interactiveElements = [
                ...screen.getAllByRole('button'),
                ...screen.getAllByRole('link')
            ];

            interactiveElements.forEach(element => {
                expect(element).toHaveClass('focus:ring-2'); // Alternative focus indicator
            });
        });
    });

    describe('High Contrast Mode', () => {
        test('should work in high contrast mode', () => {
            // Mock high contrast mode
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(query => ({
                    matches: query.includes('prefers-contrast: high'),
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            });

            renderWithRouter(<EnhancedFooter />);

            const footer = screen.getByRole('contentinfo');

            // Should have high contrast compatible styles
            expect(footer).toHaveClass('contrast-more');
        });

        test('should maintain functionality without color dependence', () => {
            renderWithRouter(<EnhancedFooter />);

            const interactiveElements = [
                ...screen.getAllByRole('button'),
                ...screen.getAllByRole('link')
            ];

            // Elements should be identifiable without color
            interactiveElements.forEach(element => {
                const hasTextContent = element.textContent.trim().length > 0;
                const hasAriaLabel = element.hasAttribute('aria-label');
                const hasTitle = element.hasAttribute('title');

                expect(hasTextContent || hasAriaLabel || hasTitle).toBe(true);
            });
        });
    });

    describe('Error Handling and Fallbacks', () => {
        test('should handle accessibility API failures gracefully', () => {
            // Mock accessibility hook to throw error
            vi.mocked(require('@/hooks/useFooterAccessibility').useFooterAccessibility)
                .mockImplementation(() => {
                    throw new Error('Accessibility API error');
                });

            expect(() => {
                renderWithRouter(<EnhancedFooter />);
            }).not.toThrow();
        });

        test('should provide fallback when ARIA is not supported', () => {
            // Mock missing ARIA support
            const originalSetAttribute = Element.prototype.setAttribute;
            Element.prototype.setAttribute = vi.fn((name, value) => {
                if (name.startsWith('aria-')) {
                    return; // Simulate ARIA not working
                }
                return originalSetAttribute.call(this, name, value);
            });

            renderWithRouter(<EnhancedFooter />);

            // Should still be functional without ARIA
            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();

            Element.prototype.setAttribute = originalSetAttribute;
        });

        test('should maintain accessibility when JavaScript fails', () => {
            // Disable JavaScript-dependent features
            vi.mocked(require('@/hooks/useFooterAccessibility').useFooterAccessibility)
                .mockReturnValue({
                    getFooterAriaProps: () => ({}),
                    getGlassLayerAriaProps: () => ({}),
                    shouldReduceMotion: true,
                    shouldDisableGlass: true,
                    announcementText: '',
                    announce: vi.fn(),
                    focusManagement: {
                        trapFocus: vi.fn(),
                        releaseFocus: vi.fn(),
                        setFocusableElements: vi.fn()
                    },
                    keyboardNavigation: {
                        handleKeyDown: vi.fn(),
                        currentFocusIndex: 0,
                        focusableElements: []
                    }
                });

            renderWithRouter(<EnhancedFooter />);

            // Basic functionality should still work
            const links = screen.getAllByRole('link');
            expect(links.length).toBeGreaterThan(0);

            links.forEach(link => {
                expect(link).toHaveAttribute('href');
            });
        });
    });
});