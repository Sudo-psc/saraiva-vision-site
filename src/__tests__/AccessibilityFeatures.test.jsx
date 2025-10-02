import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from '@/utils/router';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import SocialIcons3D from '../components/ui/SocialIcons3D';
import ScrollToTopEnhanced from '../components/ui/ScrollToTopEnhanced';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => children,
}));

// Mock hooks
vi.mock('../hooks/useReducedMotion', () => ({
    useReducedMotion: () => ({
        prefersReducedMotion: false,
        getAnimationSettings: (settings) => ({ ...settings, enableAnimations: true, animationDuration: 300 })
    })
}));

// Test wrapper
const TestWrapper = ({ children }) => (
    <BrowserRouter>
        <I18nextProvider i18n={i18n}>
            {children}
        </I18nextProvider>
    </BrowserRouter>
);

// Mock social media data
const mockSocials = [
    {
        name: 'Facebook',
        href: 'https://facebook.com/test',
        image: '/icons_social/facebook_icon.png',
        color: '#1877F2'
    },
    {
        name: 'Instagram',
        href: 'https://instagram.com/test',
        image: '/icons_social/instagram_icon.png',
        color: '#E4405F'
    }
];

describe('Accessibility Features', () => {
    describe('SocialIcons3D Accessibility', () => {
        test('should have proper ARIA labels', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /facebook/i });
            const instagramButton = screen.getByRole('button', { name: /instagram/i });

            expect(facebookButton).toHaveAttribute('aria-label');
            expect(instagramButton).toHaveAttribute('aria-label');
            expect(facebookButton).toHaveAttribute('tabIndex', '0');
            expect(instagramButton).toHaveAttribute('tabIndex', '0');
        });

        test('should support keyboard navigation', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const buttons = screen.getAllByRole('button');

            // Tab to first button
            await user.tab();
            expect(buttons[0]).toHaveFocus();

            // Tab to second button
            await user.tab();
            expect(buttons[1]).toHaveFocus();
        });

        test('should activate with Enter and Space keys', async () => {
            const user = userEvent.setup();
            const mockOnClick = vi.fn();

            // Mock window.open
            const mockOpen = vi.fn();
            Object.defineProperty(window, 'open', {
                value: mockOpen,
                writable: true
            });

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} onIconClick={mockOnClick} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /facebook/i });
            facebookButton.focus();

            // Test Enter key
            await user.keyboard('{Enter}');
            expect(mockOnClick).toHaveBeenCalledWith('Facebook', 'https://facebook.com/test');

            // Test Space key
            await user.keyboard(' ');
            expect(mockOnClick).toHaveBeenCalledWith('Facebook', 'https://facebook.com/test');
        });

        test('should have proper focus indicators', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /facebook/i });

            // Check for focus-related classes
            expect(facebookButton).toHaveClass('focus:outline-none');
            expect(facebookButton).toHaveClass('focus:ring-2');
        });

        test('should have screen reader descriptions', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /facebook/i });
            const describedBy = facebookButton.getAttribute('aria-describedby');

            expect(describedBy).toBeTruthy();

            const description = document.getElementById(describedBy);
            expect(description).toBeInTheDocument();
            expect(description).toHaveClass('sr-only');
        });

        test('should have proper group role and label', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const container = screen.getByRole('group');
            expect(container).toHaveAttribute('aria-label', 'Social media links with 3D effects');
        });
    });

    describe('ScrollToTopEnhanced Accessibility', () => {
        beforeEach(() => {
            // Mock scrollTo
            Object.defineProperty(window, 'scrollTo', {
                value: vi.fn(),
                writable: true
            });
        });

        test('should have proper ARIA label', () => {
            render(
                <TestWrapper>
                    <ScrollToTopEnhanced />
                </TestWrapper>
            );

            const scrollButton = screen.getByRole('button', { name: /scroll to top/i });
            expect(scrollButton).toHaveAttribute('aria-label');
            expect(scrollButton).toHaveAttribute('aria-describedby');
        });

        test('should be keyboard accessible', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <ScrollToTopEnhanced />
                </TestWrapper>
            );

            const scrollButton = screen.getByRole('button', { name: /scroll to top/i });

            // Should be focusable
            await user.tab();
            expect(scrollButton).toHaveFocus();

            // Should activate with Enter
            await user.keyboard('{Enter}');
            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 0,
                behavior: 'smooth'
            });
        });

        test('should have proper focus styles', () => {
            render(
                <TestWrapper>
                    <ScrollToTopEnhanced />
                </TestWrapper>
            );

            const scrollButton = screen.getByRole('button', { name: /scroll to top/i });
            expect(scrollButton).toHaveClass('focus:outline-none');
            expect(scrollButton).toHaveClass('focus:ring-2');
        });

        test('should provide screen reader description', () => {
            render(
                <TestWrapper>
                    <ScrollToTopEnhanced />
                </TestWrapper>
            );

            const scrollButton = screen.getByRole('button', { name: /scroll to top/i });
            const describedBy = scrollButton.getAttribute('aria-describedby');

            expect(describedBy).toBeTruthy();

            const description = document.getElementById(describedBy);
            expect(description).toBeInTheDocument();
            expect(description).toHaveClass('sr-only');
        });

        test('should handle loading state accessibility', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <ScrollToTopEnhanced />
                </TestWrapper>
            );

            const scrollButton = screen.getByRole('button', { name: /scroll to top/i });

            // Click to start scrolling
            await user.click(scrollButton);

            // Should be disabled during scroll
            expect(scrollButton).toBeDisabled();
            expect(scrollButton).toHaveAttribute('aria-label', 'Scrolling to top of page');
        });
    });

    describe('High Contrast Mode Support', () => {
        test('should apply high contrast styles when needed', () => {
            // Mock high contrast detection
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

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toHaveClass('forced-colors:border-2');
                expect(button).toHaveClass('forced-colors:border-ButtonText');
            });
        });
    });

    describe('Reduced Motion Support', () => {
        test('should respect reduced motion preferences', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} enableAnimations={false} />
                </TestWrapper>
            );

            // Should render without throwing errors when animations are disabled
            const container = screen.getByRole('group');
            expect(container).toBeInTheDocument();

            // Buttons should still be functional
            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(2);
        });
    });

    describe('Touch Accessibility', () => {
        test('should have minimum touch target sizes', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const buttons = screen.getAllByRole('button');

            buttons.forEach(button => {
                const computedStyle = window.getComputedStyle(button);
                // Check for minimum 44px touch targets (WCAG guideline)
                const hasMinSize =
                    parseInt(computedStyle.minHeight) >= 44 ||
                    parseInt(computedStyle.height) >= 44 ||
                    button.classList.contains('p-3'); // Padding that ensures min size

                expect(hasMinSize).toBe(true);
            });
        });
    });

    describe('Screen Reader Compatibility', () => {
        test('should have proper live regions', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const liveRegion = document.getElementById('social-icons-announcements');
            expect(liveRegion).toBeInTheDocument();
            expect(liveRegion).toHaveAttribute('aria-live', 'polite');
            expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
            expect(liveRegion).toHaveClass('sr-only');
        });

        test('should provide navigation instructions', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const instructions = document.getElementById('social-icons-instructions');
            expect(instructions).toBeInTheDocument();
            expect(instructions).toHaveClass('sr-only');
            expect(instructions).toHaveTextContent(/use tab to navigate/i);
        });
    });

    describe('Error Handling', () => {
        test('should handle empty socials array gracefully', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={[]} />
                </TestWrapper>
            );

            const container = screen.getByRole('group');
            expect(container).toBeInTheDocument();
        });

        test('should handle missing image gracefully', () => {
            const socialsWithMissingImage = [
                {
                    name: 'Facebook',
                    href: 'https://facebook.com/test',
                    image: '', // Empty image
                    color: '#1877F2'
                }
            ];

            render(
                <TestWrapper>
                    <SocialIcons3D socials={socialsWithMissingImage} />
                </TestWrapper>
            );

            const button = screen.getByRole('button', { name: /facebook/i });
            expect(button).toBeInTheDocument();
        });
    });
});