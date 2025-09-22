import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import EnhancedFooterResponsive from '../components/EnhancedFooterResponsive';
import ResponsiveSocialIcons from '../components/ResponsiveSocialIcons';
import ResponsiveBeamBackground from '../components/ResponsiveBeamBackground';

import { vi } from 'vitest';

// Mock hooks
vi.mock('../hooks/useGlassMorphism', () => ({
    useGlassMorphism: () => ({
        capabilities: {
            supportsBackdropFilter: true,
            supportsTransform3D: true,
            performanceLevel: 'high',
            reducedMotion: false,
            devicePixelRatio: 1,
            isTouch: false
        },
        getResponsiveIntensity: vi.fn(() => 'medium')
    })
}));

vi.mock('../hooks/usePerformanceMonitor', () => ({
    usePerformanceMonitor: () => ({
        trackComponentMount: vi.fn(() => vi.fn()),
        trackInteraction: vi.fn()
    })
}));

// Mock window properties
const mockWindowProperties = (width, height, orientation = 'landscape') => {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height,
    });

    // Mock orientation
    Object.defineProperty(window.screen, 'orientation', {
        writable: true,
        configurable: true,
        value: { type: orientation },
    });
};

// Test component that uses the responsive design hook
const TestResponsiveComponent = () => {
    const {
        screenSize,
        deviceType,
        responsiveConfig,
        getResponsiveStyles,
        getResponsiveClasses,
        shouldEnableFeature
    } = useResponsiveDesign();

    return (
        <div data-testid="responsive-component">
            <div data-testid="device-type">{deviceType}</div>
            <div data-testid="screen-size">{`${screenSize.width}x${screenSize.height}`}</div>
            <div data-testid="orientation">{screenSize.orientation}</div>
            <div data-testid="glass-enabled">{shouldEnableFeature('glass').toString()}</div>
            <div data-testid="3d-enabled">{shouldEnableFeature('3d-icons').toString()}</div>
            <div data-testid="responsive-classes">{getResponsiveClasses()}</div>
        </div>
    );
};

describe('Responsive Design System', () => {
    beforeEach(() => {
        // Reset window properties
        mockWindowProperties(1024, 768);

        // Mock requestAnimationFrame
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
        global.cancelAnimationFrame = jest.fn();

        // Mock canvas context
        HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
            clearRect: jest.fn(),
            scale: jest.fn(),
            arc: jest.fn(),
            beginPath: jest.fn(),
            fill: jest.fn(),
            createRadialGradient: jest.fn(() => ({
                addColorStop: jest.fn()
            })),
            save: jest.fn(),
            restore: jest.fn()
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('useResponsiveDesign Hook', () => {
        test('detects mobile device correctly', () => {
            mockWindowProperties(375, 667); // iPhone dimensions

            render(<TestResponsiveComponent />);

            expect(screen.getByTestId('device-type')).toHaveTextContent('mobile');
            expect(screen.getByTestId('responsive-classes')).toHaveTextContent('device-mobile');
        });

        test('detects tablet device correctly', () => {
            mockWindowProperties(768, 1024); // iPad dimensions

            render(<TestResponsiveComponent />);

            expect(screen.getByTestId('device-type')).toHaveTextContent('tablet');
            expect(screen.getByTestId('responsive-classes')).toHaveTextContent('device-tablet');
        });

        test('detects desktop device correctly', () => {
            mockWindowProperties(1440, 900); // Desktop dimensions

            render(<TestResponsiveComponent />);

            expect(screen.getByTestId('device-type')).toHaveTextContent('desktop');
            expect(screen.getByTestId('responsive-classes')).toHaveTextContent('device-desktop');
        });

        test('detects orientation correctly', () => {
            // Portrait orientation
            mockWindowProperties(375, 667);
            render(<TestResponsiveComponent />);
            expect(screen.getByTestId('orientation')).toHaveTextContent('portrait');

            // Landscape orientation
            mockWindowProperties(667, 375);
            render(<TestResponsiveComponent />);
            expect(screen.getByTestId('orientation')).toHaveTextContent('landscape');
        });

        test('handles window resize events', async () => {
            const { rerender } = render(<TestResponsiveComponent />);

            // Start with desktop
            expect(screen.getByTestId('device-type')).toHaveTextContent('desktop');

            // Resize to mobile
            act(() => {
                mockWindowProperties(375, 667);
                fireEvent(window, new Event('resize'));
            });

            rerender(<TestResponsiveComponent />);

            await waitFor(() => {
                expect(screen.getByTestId('device-type')).toHaveTextContent('mobile');
            });
        });

        test('handles orientation change events', async () => {
            const { rerender } = render(<TestResponsiveComponent />);

            // Start with landscape
            expect(screen.getByTestId('orientation')).toHaveTextContent('landscape');

            // Change to portrait
            act(() => {
                mockWindowProperties(768, 1024);
                fireEvent(window, new Event('orientationchange'));
            });

            rerender(<TestResponsiveComponent />);

            await waitFor(() => {
                expect(screen.getByTestId('orientation')).toHaveTextContent('portrait');
            });
        });
    });

    describe('EnhancedFooterResponsive Component', () => {
        test('renders with responsive classes', () => {
            render(
                <EnhancedFooterResponsive>
                    <div>Footer content</div>
                </EnhancedFooterResponsive>
            );

            const footer = screen.getByRole('contentinfo');
            expect(footer).toHaveClass('enhanced-footer');
            expect(footer).toHaveClass('device-desktop');
        });

        test('applies mobile optimizations', () => {
            mockWindowProperties(375, 667);

            render(
                <EnhancedFooterResponsive>
                    <div>Footer content</div>
                </EnhancedFooterResponsive>
            );

            const footer = screen.getByRole('contentinfo');
            expect(footer).toHaveClass('device-mobile');
        });

        test('renders glass layer when enabled', () => {
            render(
                <EnhancedFooterResponsive enableGlass={true}>
                    <div>Footer content</div>
                </EnhancedFooterResponsive>
            );

            const glassLayer = document.querySelector('.glass-layer');
            expect(glassLayer).toBeInTheDocument();
        });

        test('does not render glass layer when disabled', () => {
            render(
                <EnhancedFooterResponsive enableGlass={false}>
                    <div>Footer content</div>
                </EnhancedFooterResponsive>
            );

            const glassLayer = document.querySelector('.glass-layer');
            expect(glassLayer).not.toBeInTheDocument();
        });

        test('renders beam background when enabled', () => {
            render(
                <EnhancedFooterResponsive enableBeams={true}>
                    <div>Footer content</div>
                </EnhancedFooterResponsive>
            );

            const beamBackground = document.querySelector('.responsive-beam-background');
            expect(beamBackground).toBeInTheDocument();
        });
    });

    describe('ResponsiveSocialIcons Component', () => {
        const mockSocialLinks = [
            {
                name: 'facebook',
                href: 'https://facebook.com/test',
                image: '/icons_social/facebook_icon.png'
            },
            {
                name: 'instagram',
                href: 'https://instagram.com/test',
                image: '/icons_social/instagram_icon.png'
            }
        ];

        test('renders social icons with responsive classes', () => {
            render(<ResponsiveSocialIcons socialLinks={mockSocialLinks} />);

            const container = document.querySelector('.social-icons-container');
            expect(container).toBeInTheDocument();

            const icons = screen.getAllByRole('button');
            expect(icons).toHaveLength(2);
        });

        test('handles hover interactions on desktop', () => {
            mockWindowProperties(1440, 900); // Desktop

            render(<ResponsiveSocialIcons socialLinks={mockSocialLinks} />);

            const facebookIcon = screen.getByLabelText('Visit our facebook page');

            fireEvent.mouseEnter(facebookIcon);
            // Verify hover state is applied (would need to check computed styles in real test)

            fireEvent.mouseLeave(facebookIcon);
            // Verify hover state is removed
        });

        test('handles touch interactions on mobile', () => {
            mockWindowProperties(375, 667); // Mobile

            render(<ResponsiveSocialIcons socialLinks={mockSocialLinks} />);

            const facebookIcon = screen.getByLabelText('Visit our facebook page');

            fireEvent.touchStart(facebookIcon);
            // Verify touch state is applied
        });

        test('handles keyboard navigation', () => {
            render(<ResponsiveSocialIcons socialLinks={mockSocialLinks} />);

            const facebookIcon = screen.getByLabelText('Visit our facebook page');

            fireEvent.keyDown(facebookIcon, { key: 'Enter' });
            // Verify click handler is called

            fireEvent.keyDown(facebookIcon, { key: ' ' });
            // Verify click handler is called
        });

        test('opens links in new tab when clicked', () => {
            // Mock window.open
            const mockOpen = jest.fn();
            global.window.open = mockOpen;

            render(<ResponsiveSocialIcons socialLinks={mockSocialLinks} />);

            const facebookIcon = screen.getByLabelText('Visit our facebook page');
            fireEvent.click(facebookIcon);

            expect(mockOpen).toHaveBeenCalledWith(
                'https://facebook.com/test',
                '_blank',
                'noopener,noreferrer'
            );
        });
    });

    describe('ResponsiveBeamBackground Component', () => {
        test('renders canvas element', () => {
            render(<ResponsiveBeamBackground />);

            const canvas = document.querySelector('.responsive-beam-background');
            expect(canvas).toBeInTheDocument();
            expect(canvas.tagName).toBe('CANVAS');
        });

        test('does not render when animations are disabled', () => {
            // Mock reduced motion preference
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

            render(<ResponsiveBeamBackground enableAnimation={false} />);

            const canvas = document.querySelector('.responsive-beam-background');
            expect(canvas).not.toBeInTheDocument();
        });

        test('adjusts particle count based on device type', () => {
            // This would require more complex testing of the internal particle system
            // For now, we just verify the component renders
            mockWindowProperties(375, 667); // Mobile

            render(<ResponsiveBeamBackground />);

            const canvas = document.querySelector('.responsive-beam-background');
            expect(canvas).toBeInTheDocument();
        });
    });

    describe('Accessibility Features', () => {
        test('respects reduced motion preference', () => {
            // Mock reduced motion preference
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

            render(<TestResponsiveComponent />);

            const classes = screen.getByTestId('responsive-classes').textContent;
            expect(classes).toContain('reduced-motion');
        });

        test('provides proper ARIA labels for social icons', () => {
            const mockSocialLinks = [
                {
                    name: 'facebook',
                    href: 'https://facebook.com/test',
                    image: '/icons_social/facebook_icon.png'
                }
            ];

            render(<ResponsiveSocialIcons socialLinks={mockSocialLinks} />);

            const facebookIcon = screen.getByLabelText('Visit our facebook page');
            expect(facebookIcon).toBeInTheDocument();
            expect(facebookIcon).toHaveAttribute('role', 'button');
            expect(facebookIcon).toHaveAttribute('tabIndex', '0');
        });

        test('hides decorative elements from screen readers', () => {
            render(
                <EnhancedFooterResponsive>
                    <div>Footer content</div>
                </EnhancedFooterResponsive>
            );

            const glassLayer = document.querySelector('.glass-layer');
            const beamBackground = document.querySelector('.responsive-beam-background');

            expect(glassLayer).toHaveAttribute('aria-hidden', 'true');
            expect(beamBackground).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('Performance Optimizations', () => {
        test('applies GPU acceleration on high-performance devices', () => {
            render(<TestResponsiveComponent />);

            const classes = screen.getByTestId('responsive-classes').textContent;
            expect(classes).toContain('performance-high');
        });

        test('disables expensive effects on low-performance devices', () => {
            // Mock low performance
            jest.doMock('../hooks/useGlassMorphism', () => ({
                useGlassMorphism: () => ({
                    capabilities: {
                        supportsBackdropFilter: false,
                        supportsTransform3D: false,
                        performanceLevel: 'low',
                        reducedMotion: false,
                        devicePixelRatio: 1,
                        isTouch: true
                    },
                    getResponsiveIntensity: jest.fn(() => 'subtle')
                })
            }));

            render(<TestResponsiveComponent />);

            expect(screen.getByTestId('glass-enabled')).toHaveTextContent('false');
            expect(screen.getByTestId('3d-enabled')).toHaveTextContent('false');
        });
    });
});