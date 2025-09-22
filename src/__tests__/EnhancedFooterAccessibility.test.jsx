import React from 'react';
import { render, screen, fireEvent, waitFor, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import EnhancedFooter from '../components/EnhancedFooter';
import SocialIcons3D from '../components/ui/SocialIcons3D';
import ScrollToTopEnhanced from '../components/ui/ScrollToTopEnhanced';
import { vi } from 'vitest';
import { useAccessibility } from '../hooks/useAccessibility';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => children,
}));

// Mock hooks
vi.mock('../hooks/useGlassMorphism');
vi.mock('../hooks/usePerformanceMonitor');
vi.mock('../hooks/useReducedMotion');
vi.mock('../hooks/useIntersectionObserver');
vi.mock('../hooks/useAccessibility');


const mockUseAccessibility = useAccessibility;

// Test wrapper component
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

describe('Enhanced Footer Accessibility', () => {
    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Mock default accessibility hook return
        mockUseAccessibility.mockReturnValue({
            isHighContrast: false,
            isKeyboardUser: false,
            announce: vi.fn(),
            getAriaAttributes: vi.fn(() => ({})),
            getFocusStyles: vi.fn(() => ({ className: 'focus-styles' }))
        });

        // Mock other hooks
        require('../hooks/useGlassMorphism').useGlassMorphism.mockReturnValue({
            capabilities: { supportsBackdropFilter: true },
            glassIntensity: 0.5,
            getGlassClasses: vi.fn(() => 'glass-classes'),
            getGlassStyles: vi.fn(() => ({})),
            shouldEnableGlass: vi.fn(() => true)
        });

        require('../hooks/usePerformanceMonitor').usePerformanceMonitor.mockReturnValue({
            performanceLevel: 'high',
            getOptimizedSettings: jest.fn(() => ({ enableGlass: true, enableAnimations: true })),
            deviceCapabilities: { supportsBackdropFilter: true }
        });

        require('../hooks/useReducedMotion').useReducedMotion.mockReturnValue({
            prefersReducedMotion: false,
            getAnimationSettings: jest.fn((settings) => settings)
        });

        require('../hooks/useIntersectionObserver').useIntersectionObserver.mockReturnValue([
            { current: null },
            true
        ]);
    });

    describe('ARIA Labels and Descriptions', () => {
        test('should provide proper ARIA labels for 3D social icons', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });
            const instagramButton = screen.getByRole('button', { name: /visit our instagram page/i });

            expect(facebookButton).toHaveAttribute('aria-label', 'Visit our Facebook page (opens in new tab)');
            expect(instagramButton).toHaveAttribute('aria-label', 'Visit our Instagram page (opens in new tab)');

            // Check for describedby attributes
            expect(facebookButton).toHaveAttribute('aria-describedby');
            expect(instagramButton).toHaveAttribute('aria-describedby');
        });

        test('should provide proper ARIA labels for scroll to top button', () => {
            render(
                <TestWrapper>
                    <ScrollToTopEnhanced />
                </TestWrapper>
            );

            const scrollButton = screen.getByRole('button', { name: /scroll to top of page/i });
            expect(scrollButton).toHaveAttribute('aria-label', 'Scroll to top of page');
            expect(scrollButton).toHaveAttribute('aria-describedby');
        });

        test('should have proper role and aria-label for social icons container', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const container = screen.getByRole('group', { name: /social media links with 3d effects/i });
            expect(container).toBeInTheDocument();
        });

        test('should provide screen reader instructions', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const instructions = screen.getByText(/use tab to navigate to social media links/i);
            expect(instructions).toHaveClass('sr-only');
        });
    });

    describe('Keyboard Navigation', () => {
        test('should support Tab navigation through social icons', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });
            const instagramButton = screen.getByRole('button', { name: /visit our instagram page/i });

            // Tab to first icon
            await user.tab();
            expect(facebookButton).toHaveFocus();

            // Tab to second icon
            await user.tab();
            expect(instagramButton).toHaveFocus();
        });

        test('should support arrow key navigation between social icons', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });
            const instagramButton = screen.getByRole('button', { name: /visit our instagram page/i });

            // Focus first icon
            facebookButton.focus();
            expect(facebookButton).toHaveFocus();

            // Arrow right to next icon
            await user.keyboard('{ArrowRight}');
            expect(instagramButton).toHaveFocus();

            // Arrow left back to first icon
            await user.keyboard('{ArrowLeft}');
            expect(facebookButton).toHaveFocus();
        });

        test('should support Home and End keys for social icons', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });
            const instagramButton = screen.getByRole('button', { name: /visit our instagram page/i });

            // Focus middle icon (if we had more)
            facebookButton.focus();

            // Home key should go to first icon
            await user.keyboard('{Home}');
            expect(facebookButton).toHaveFocus();

            // End key should go to last icon
            await user.keyboard('{End}');
            expect(instagramButton).toHaveFocus();
        });

        test('should activate social icons with Enter and Space keys', async () => {
            const user = userEvent.setup();
            const mockOnClick = jest.fn();

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} onIconClick={mockOnClick} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });

            facebookButton.focus();

            // Test Enter key
            await user.keyboard('{Enter}');
            expect(mockOnClick).toHaveBeenCalledWith('Facebook', 'https://facebook.com/test');

            // Test Space key
            await user.keyboard(' ');
            expect(mockOnClick).toHaveBeenCalledWith('Facebook', 'https://facebook.com/test');
        });

        test('should support Escape key to exit navigation', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });
            facebookButton.focus();

            await user.keyboard('{Escape}');
            expect(facebookButton).not.toHaveFocus();
        });
    });

    describe('Focus Indicators', () => {
        test('should apply focus styles to social icons', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });

            // Focus the button
            act(() => {
                facebookButton.focus();
            });

            // Check for focus classes
            expect(facebookButton).toHaveClass('focus:outline-none');
            expect(facebookButton).toHaveClass('focus:ring-2');
        });

        test('should apply focus styles to scroll to top button', () => {
            render(
                <TestWrapper>
                    <ScrollToTopEnhanced />
                </TestWrapper>
            );

            const scrollButton = screen.getByRole('button', { name: /scroll to top of page/i });

            act(() => {
                scrollButton.focus();
            });

            expect(scrollButton).toHaveClass('focus:outline-none');
            expect(scrollButton).toHaveClass('focus:ring-2');
        });

        test('should handle high contrast mode focus styles', () => {
            mockUseAccessibility.mockReturnValue({
                isHighContrast: true,
                isKeyboardUser: true,
                announce: jest.fn(),
                getAriaAttributes: jest.fn(() => ({})),
                getFocusStyles: jest.fn(() => ({
                    className: 'forced-colors:border-2 forced-colors:border-ButtonText'
                }))
            });

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });
            expect(facebookButton).toHaveClass('forced-colors:border-2');
        });
    });

    describe('Screen Reader Compatibility', () => {
        test('should announce social icon interactions', async () => {
            const mockAnnounce = jest.fn();
            mockUseAccessibility.mockReturnValue({
                isHighContrast: false,
                isKeyboardUser: false,
                announce: mockAnnounce,
                getAriaAttributes: jest.fn(() => ({})),
                getFocusStyles: jest.fn(() => ({ className: 'focus-styles' }))
            });

            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });

            await user.click(facebookButton);

            // Should announce the action
            await waitFor(() => {
                expect(mockAnnounce).toHaveBeenCalledWith('Opening Facebook in new tab');
            });
        });

        test('should announce scroll to top action', async () => {
            const mockAnnounce = jest.fn();
            mockUseAccessibility.mockReturnValue({
                isHighContrast: false,
                isKeyboardUser: false,
                announce: mockAnnounce,
                getAriaAttributes: jest.fn(() => ({})),
                getFocusStyles: jest.fn(() => ({ className: 'focus-styles' }))
            });

            // Mock scrollTo
            Object.defineProperty(window, 'scrollTo', {
                value: jest.fn(),
                writable: true
            });

            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <ScrollToTopEnhanced />
                </TestWrapper>
            );

            const scrollButton = screen.getByRole('button', { name: /scroll to top of page/i });

            await user.click(scrollButton);

            await waitFor(() => {
                expect(mockAnnounce).toHaveBeenCalledWith('Scrolling to top of page');
            });
        });

        test('should have proper live regions for announcements', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const liveRegion = screen.getByLabelText(/social-icons-announcements/i);
            expect(liveRegion).toHaveAttribute('aria-live', 'polite');
            expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
            expect(liveRegion).toHaveClass('sr-only');
        });

        test('should provide descriptive text for complex interactions', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });
            const describedBy = facebookButton.getAttribute('aria-describedby');

            expect(describedBy).toBeTruthy();

            const description = document.getElementById(describedBy);
            expect(description).toHaveTextContent(/press enter or space to open in new tab/i);
            expect(description).toHaveTextContent(/use arrow keys to navigate/i);
        });
    });

    describe('Reduced Motion Support', () => {
        test('should respect prefers-reduced-motion for animations', () => {
            require('../hooks/useReducedMotion').useReducedMotion.mockReturnValue({
                prefersReducedMotion: true,
                getAnimationSettings: jest.fn(() => ({
                    enableAnimations: false,
                    animationDuration: 0
                }))
            });

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const container = screen.getByRole('group');
            // Should not have animation classes when reduced motion is preferred
            expect(container.closest('.enhanced-footer-container')).not.toHaveClass('animate-');
        });

        test('should disable 3D transforms when reduced motion is preferred', () => {
            require('../hooks/useReducedMotion').useReducedMotion.mockReturnValue({
                prefersReducedMotion: true,
                getAnimationSettings: jest.fn(() => ({
                    enableAnimations: false,
                    animationDuration: 0
                }))
            });

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} enableAnimations={false} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });

            // Should not have 3D transform styles
            const computedStyle = window.getComputedStyle(facebookButton);
            expect(computedStyle.transform).toBe('none');
        });
    });

    describe('High Contrast Mode', () => {
        test('should adapt styles for high contrast mode', () => {
            mockUseAccessibility.mockReturnValue({
                isHighContrast: true,
                isKeyboardUser: false,
                announce: jest.fn(),
                getAriaAttributes: jest.fn(() => ({})),
                getFocusStyles: jest.fn(() => ({
                    className: 'forced-colors:bg-ButtonFace forced-colors:text-ButtonText'
                }))
            });

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });
            expect(facebookButton).toHaveClass('forced-colors:bg-ButtonFace');
            expect(facebookButton).toHaveClass('forced-colors:text-ButtonText');
        });

        test('should disable glass effects in high contrast mode', () => {
            mockUseAccessibility.mockReturnValue({
                isHighContrast: true,
                isKeyboardUser: false,
                announce: jest.fn(),
                getAriaAttributes: jest.fn(() => ({})),
                getFocusStyles: jest.fn(() => ({ className: 'high-contrast-focus' }))
            });

            render(
                <TestWrapper>
                    <EnhancedFooter />
                </TestWrapper>
            );

            const container = screen.getByRole('contentinfo');
            expect(container).toHaveClass('high-contrast');
        });
    });

    describe('Touch and Mobile Accessibility', () => {
        test('should have minimum touch target sizes', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });

            // Check minimum size (44px is WCAG recommendation)
            const computedStyle = window.getComputedStyle(facebookButton);
            const minSize = 44;

            expect(parseInt(computedStyle.minHeight) || parseInt(computedStyle.height)).toBeGreaterThanOrEqual(minSize);
            expect(parseInt(computedStyle.minWidth) || parseInt(computedStyle.width)).toBeGreaterThanOrEqual(minSize);
        });

        test('should handle touch interactions properly', async () => {
            const user = userEvent.setup();

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });

            // Simulate touch interaction
            await user.pointer({ keys: '[TouchA>]', target: facebookButton });
            await user.pointer({ keys: '[/TouchA]' });

            // Should handle touch without issues
            expect(facebookButton).toBeInTheDocument();
        });
    });

    describe('Error Handling and Fallbacks', () => {
        test('should provide fallback when animations fail', () => {
            // Mock animation failure
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            render(
                <TestWrapper>
                    <SocialIcons3D socials={mockSocials} />
                </TestWrapper>
            );

            // Should still render functional buttons
            const facebookButton = screen.getByRole('button', { name: /visit our facebook page/i });
            expect(facebookButton).toBeInTheDocument();

            consoleSpy.mockRestore();
        });

        test('should handle missing social media data gracefully', () => {
            render(
                <TestWrapper>
                    <SocialIcons3D socials={[]} />
                </TestWrapper>
            );

            // Should render container even with no socials
            const container = screen.getByRole('group');
            expect(container).toBeInTheDocument();
        });
    });
});

describe('useAccessibility Hook', () => {
    test('should detect high contrast mode', () => {
        // Mock matchMedia for high contrast
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: query.includes('prefers-contrast: high'),
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });

        const { result } = renderHook(() => useAccessibility());

        // Should detect high contrast (mocked as true)
        expect(result.current.isHighContrast).toBe(true);
    });

    test('should provide announcement function', () => {
        const { result } = renderHook(() => useAccessibility());

        expect(typeof result.current.announce).toBe('function');

        // Should not throw when called
        expect(() => {
            result.current.announce('Test announcement');
        }).not.toThrow();
    });

    test('should generate proper ARIA attributes', () => {
        const { result } = renderHook(() => useAccessibility());

        const socialIconAttrs = result.current.getAriaAttributes('social-icon', {
            name: 'Facebook',
            label: 'Visit Facebook page'
        });

        expect(socialIconAttrs).toHaveProperty('role', 'button');
        expect(socialIconAttrs).toHaveProperty('aria-label');
        expect(socialIconAttrs).toHaveProperty('tabIndex', 0);
    });
});