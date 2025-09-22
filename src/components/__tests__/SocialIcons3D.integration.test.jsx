import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SocialIcon3D } from '../SocialIcon3D';
import { ResponsiveSocialIcons } from '../ResponsiveSocialIcons';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        a: ({ children, ...props }) => <a {...props}>{children}</a>
    },
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        set: vi.fn()
    })
}));

// Mock performance monitoring
vi.mock('../../hooks/usePerformanceMonitor', () => ({
    usePerformanceMonitor: () => ({
        performanceLevel: 'high',
        frameRate: 60,
        isOptimized: true
    })
}));

const mockSocialData = [
    {
        name: 'Instagram',
        href: 'https://instagram.com/test',
        image: '/icons_social/instagram_icon.png',
        color: '#E4405F',
        hoverColor: '#C13584'
    },
    {
        name: 'Facebook',
        href: 'https://facebook.com/test',
        image: '/icons_social/facebook_icon.png',
        color: '#1877F2',
        hoverColor: '#166FE5'
    },
    {
        name: 'WhatsApp',
        href: 'https://wa.me/1234567890',
        image: '/icons_social/whatsapp_icon.png',
        color: '#25D366',
        hoverColor: '#128C7E'
    }
];

describe('3D Social Icons Integration Tests', () => {
    let user;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    describe('Individual Social Icon 3D Interactions', () => {
        it('should render social icon with proper 3D structure', () => {
            const mockOnHover = vi.fn();

            render(
                <SocialIcon3D
                    social={mockSocialData[0]}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('link', { name: /instagram/i });
            expect(iconContainer).toBeInTheDocument();
            expect(iconContainer).toHaveAttribute('href', 'https://instagram.com/test');
        });

        it('should handle hover interactions with 3D transforms', async () => {
            const mockOnHover = vi.fn();

            render(
                <SocialIcon3D
                    social={mockSocialData[0]}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconLink = screen.getByRole('link', { name: /instagram/i });

            await user.hover(iconLink);
            expect(mockOnHover).toHaveBeenCalledWith('Instagram');

            await user.unhover(iconLink);
            expect(mockOnHover).toHaveBeenCalledWith(null);
        });

        it('should apply 3D hover state styles correctly', () => {
            const mockOnHover = vi.fn();

            const { rerender } = render(
                <SocialIcon3D
                    social={mockSocialData[0]}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('link');
            expect(iconContainer).not.toHaveClass('hovered-3d');

            // Simulate hover state
            rerender(
                <SocialIcon3D
                    social={mockSocialData[0]}
                    index={0}
                    isHovered={true}
                    onHover={mockOnHover}
                />
            );

            expect(iconContainer).toHaveClass('hovered-3d');
        });

        it('should handle keyboard navigation for 3D icons', async () => {
            const mockOnHover = vi.fn();

            render(
                <SocialIcon3D
                    social={mockSocialData[0]}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconLink = screen.getByRole('link');

            await user.tab();
            expect(iconLink).toHaveFocus();
            expect(mockOnHover).toHaveBeenCalledWith('Instagram');

            await user.tab();
            expect(mockOnHover).toHaveBeenCalledWith(null);
        });
    });

    describe('Multiple Social Icons Interaction', () => {
        it('should handle multiple icons with smooth state transitions', async () => {
            render(<ResponsiveSocialIcons socialLinks={mockSocialData} />);

            const instagramIcon = screen.getByRole('link', { name: /instagram/i });
            const facebookIcon = screen.getByRole('link', { name: /facebook/i });

            // Hover first icon
            await user.hover(instagramIcon);
            await waitFor(() => {
                expect(instagramIcon).toHaveClass('hovered-3d');
            });

            // Quickly move to second icon
            await user.hover(facebookIcon);
            await waitFor(() => {
                expect(facebookIcon).toHaveClass('hovered-3d');
                expect(instagramIcon).not.toHaveClass('hovered-3d');
            });
        });

        it('should handle rapid hover state changes without conflicts', async () => {
            render(<ResponsiveSocialIcons socialLinks={mockSocialData} />);

            const icons = screen.getAllByRole('link');

            // Rapidly hover over multiple icons
            for (let i = 0; i < 3; i++) {
                await user.hover(icons[i]);
                await act(() => new Promise(resolve => setTimeout(resolve, 50)));
            }

            // Should end with last icon hovered
            await waitFor(() => {
                expect(icons[2]).toHaveClass('hovered-3d');
                expect(icons[0]).not.toHaveClass('hovered-3d');
                expect(icons[1]).not.toHaveClass('hovered-3d');
            });
        });
    });

    describe('Glass Bubble Effect Integration', () => {
        it('should show glass bubble effect on hover', async () => {
            render(<ResponsiveSocialIcons socialLinks={mockSocialData} />);

            const instagramIcon = screen.getByRole('link', { name: /instagram/i });

            await user.hover(instagramIcon);

            await waitFor(() => {
                const glassBubble = screen.getByTestId('glass-bubble-Instagram');
                expect(glassBubble).toBeInTheDocument();
                expect(glassBubble).toHaveClass('glass-bubble-active');
            });
        });

        it('should hide glass bubble when not hovering', async () => {
            render(<ResponsiveSocialIcons socialLinks={mockSocialData} />);

            const instagramIcon = screen.getByRole('link', { name: /instagram/i });

            await user.hover(instagramIcon);
            await user.unhover(instagramIcon);

            await waitFor(() => {
                const glassBubble = screen.queryByTestId('glass-bubble-Instagram');
                expect(glassBubble).not.toHaveClass('glass-bubble-active');
            });
        });
    });

    describe('Animation Performance Integration', () => {
        it('should respect performance level for 3D effects', () => {
            // Mock low performance
            vi.doMock('../../hooks/usePerformanceMonitor', () => ({
                usePerformanceMonitor: () => ({
                    performanceLevel: 'low',
                    frameRate: 25,
                    isOptimized: false
                })
            }));

            render(<ResponsiveSocialIcons socialLinks={mockSocialData} />);

            const icons = screen.getAllByRole('link');
            icons.forEach(icon => {
                expect(icon).toHaveClass('performance-optimized');
                expect(icon).not.toHaveClass('full-3d-effects');
            });
        });

        it('should disable animations when reduced motion is preferred', () => {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(query => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            });

            render(<ResponsiveSocialIcons socialLinks={mockSocialData} />);

            const icons = screen.getAllByRole('link');
            icons.forEach(icon => {
                expect(icon).toHaveClass('reduced-motion');
            });
        });
    });

    describe('Responsive Behavior Integration', () => {
        it('should adapt 3D effects for mobile screens', () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(<ResponsiveSocialIcons socialLinks={mockSocialData} />);

            const container = screen.getByTestId('social-icons-container');
            expect(container).toHaveClass('mobile-optimized');
        });

        it('should provide full effects for desktop screens', () => {
            // Mock desktop viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1920,
            });

            render(<ResponsiveSocialIcons socialLinks={mockSocialData} />);

            const container = screen.getByTestId('social-icons-container');
            expect(container).toHaveClass('desktop-full-effects');
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle missing social media data gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            render(<ResponsiveSocialIcons socialLinks={[]} />);

            const container = screen.getByTestId('social-icons-container');
            expect(container).toBeInTheDocument();
            expect(container).toHaveTextContent(''); // Empty but no crash

            consoleSpy.mockRestore();
        });

        it('should handle animation errors with fallback rendering', () => {
            // Mock animation error
            const mockError = new Error('Animation failed');
            vi.spyOn(console, 'error').mockImplementation(() => { });

            const ErrorBoundaryWrapper = ({ children }) => {
                try {
                    return children;
                } catch (error) {
                    return <div data-testid="fallback-social-icons">Fallback Social Icons</div>;
                }
            };

            render(
                <ErrorBoundaryWrapper>
                    <ResponsiveSocialIcons socialLinks={mockSocialData} />
                </ErrorBoundaryWrapper>
            );

            // Should render without crashing
            expect(screen.getByTestId('social-icons-container')).toBeInTheDocument();
        });
    });
});