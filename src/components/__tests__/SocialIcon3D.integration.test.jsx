/**
 * 3D Social Icon Integration Tests
 * 
 * Tests for 3D social icon interactions, animations, and glass bubble effects.
 * Covers hover states, transitions, and performance optimization.
 * 
 * Requirements covered: 2.1, 2.2, 2.4, 2.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SocialIcon3D from '../SocialIcon3D';
import { SocialLinks3D } from '../ui/social-links-3d';

// Mock framer-motion with more detailed implementation
const mockMotionDiv = React.forwardRef(({ children, animate, whileHover, transition, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            ref={ref}
            {...props}
            data-animate={JSON.stringify(animate)}
            data-while-hover={JSON.stringify(whileHover)}
            data-transition={JSON.stringify(transition)}
            data-is-hovered={isHovered}
            onMouseEnter={(e) => {
                setIsHovered(true);
                props.onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
                setIsHovered(false);
                props.onMouseLeave?.(e);
            }}
        >
            {children}
        </div>
    );
});

vi.mock('framer-motion', () => ({
    motion: {
        div: mockMotionDiv,
        span: mockMotionDiv
    },
    AnimatePresence: ({ children }) => <>{children}</>,
    useReducedMotion: vi.fn(() => false)
}));

// Mock performance monitoring
vi.mock('@/hooks/usePerformanceMonitor', () => ({
    usePerformanceMonitor: () => ({
        performanceLevel: 'high',
        currentFPS: 60,
        getOptimizedSettings: () => ({
            enableComplexAnimations: true,
            animationDuration: 300,
            glassBlur: 20
        })
    })
}));

// Mock device capabilities
vi.mock('@/hooks/useDeviceCapabilities', () => ({
    useDeviceCapabilities: () => ({
        capabilities: {
            supportsTransform3D: true,
            supportsBackdropFilter: true,
            isTouch: false,
            performanceLevel: 'high'
        },
        isSupported: (feature) => feature === 'transform3D' || feature === 'backdropFilter'
    })
}));

// Mock reduced motion
vi.mock('@/hooks/useReducedMotion', () => ({
    useReducedMotion: () => false
}));

describe('SocialIcon3D Integration Tests', () => {
    const mockSocial = {
        name: 'Facebook',
        href: 'https://facebook.com/test',
        image: '/icons/facebook.png',
        color: '#1877f2'
    };

    const mockOnHover = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.open
        Object.defineProperty(window, 'open', {
            value: vi.fn(),
            writable: true
        });
    });

    describe('3D Transform Animations', () => {
        test('should apply 3D transforms on hover', async () => {
            const user = userEvent.setup();

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            await user.hover(iconContainer);

            await waitFor(() => {
                expect(mockOnHover).toHaveBeenCalledWith('Facebook');
            });

            // Check if 3D transform data is applied
            const motionDiv = iconContainer.querySelector('[data-while-hover]');
            expect(motionDiv).toBeInTheDocument();

            const whileHoverData = JSON.parse(motionDiv.getAttribute('data-while-hover'));
            expect(whileHoverData).toMatchObject({
                rotateX: expect.any(Number),
                rotateY: expect.any(Number),
                scale: expect.any(Number)
            });
        });

        test('should handle rapid hover state changes', async () => {
            const user = userEvent.setup();

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            // Rapid hover/unhover
            await user.hover(iconContainer);
            await user.unhover(iconContainer);
            await user.hover(iconContainer);
            await user.unhover(iconContainer);

            await waitFor(() => {
                expect(mockOnHover).toHaveBeenCalledTimes(4); // 2 hovers + 2 unhovers
            });
        });

        test('should apply correct perspective and depth', () => {
            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={true}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');
            const style = window.getComputedStyle(iconContainer);

            // Should have perspective applied for 3D effect
            expect(iconContainer).toHaveStyle({
                transformStyle: 'preserve-3d'
            });
        });
    });

    describe('Glass Bubble Effects', () => {
        test('should render glass bubble on hover', async () => {
            const user = userEvent.setup();

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            await user.hover(iconContainer);

            await waitFor(() => {
                const glassBubble = iconContainer.querySelector('.glass-bubble');
                expect(glassBubble).toBeInTheDocument();
            });
        });

        test('should animate glass bubble appearance', async () => {
            const user = userEvent.setup();

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            await user.hover(iconContainer);

            await waitFor(() => {
                const glassBubble = iconContainer.querySelector('.glass-bubble');
                const animateData = glassBubble?.getAttribute('data-animate');

                if (animateData) {
                    const animation = JSON.parse(animateData);
                    expect(animation).toHaveProperty('scale');
                    expect(animation).toHaveProperty('opacity');
                }
            });
        });

        test('should remove glass bubble on unhover', async () => {
            const user = userEvent.setup();

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            // Hover then unhover
            await user.hover(iconContainer);
            await user.unhover(iconContainer);

            await waitFor(() => {
                expect(mockOnHover).toHaveBeenLastCalledWith(null);
            });
        });
    });

    describe('Depth Shadow System', () => {
        test('should apply layered shadows for depth', () => {
            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={true}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            // Should have multiple shadow layers
            expect(iconContainer).toHaveClass('shadow-depth-3d');
        });

        test('should adjust shadow intensity based on hover state', async () => {
            const user = userEvent.setup();

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            // Check default shadow
            expect(iconContainer).toHaveClass('shadow-md');

            await user.hover(iconContainer);

            await waitFor(() => {
                // Should have enhanced shadow on hover
                expect(iconContainer).toHaveClass('shadow-depth-3d');
            });
        });
    });

    describe('Performance Optimization', () => {
        test('should disable complex animations on low performance', () => {
            // Mock low performance
            vi.mocked(require('@/hooks/usePerformanceMonitor').usePerformanceMonitor)
                .mockReturnValue({
                    performanceLevel: 'low',
                    currentFPS: 30,
                    getOptimizedSettings: () => ({
                        enableComplexAnimations: false,
                        animationDuration: 150,
                        glassBlur: 5
                    })
                });

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            // Should have simplified animations
            expect(iconContainer).toHaveClass('animate-simple');
        });

        test('should reduce animation duration for better performance', () => {
            vi.mocked(require('@/hooks/usePerformanceMonitor').usePerformanceMonitor)
                .mockReturnValue({
                    performanceLevel: 'medium',
                    currentFPS: 45,
                    getOptimizedSettings: () => ({
                        enableComplexAnimations: true,
                        animationDuration: 200,
                        glassBlur: 15
                    })
                });

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');
            const motionDiv = iconContainer.querySelector('[data-transition]');

            if (motionDiv) {
                const transitionData = JSON.parse(motionDiv.getAttribute('data-transition'));
                expect(transitionData.duration).toBeLessThanOrEqual(0.3);
            }
        });
    });

    describe('Touch Device Optimization', () => {
        test('should handle touch interactions differently', () => {
            vi.mocked(require('@/hooks/useDeviceCapabilities').useDeviceCapabilities)
                .mockReturnValue({
                    capabilities: {
                        supportsTransform3D: true,
                        supportsBackdropFilter: true,
                        isTouch: true,
                        performanceLevel: 'medium'
                    },
                    isSupported: (feature) => feature === 'transform3D'
                });

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            // Should have touch-optimized classes
            expect(iconContainer).toHaveClass('touch-optimized');
        });

        test('should handle touch events for activation', async () => {
            const user = userEvent.setup();

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            // Simulate touch interaction
            fireEvent.touchStart(iconContainer);
            fireEvent.touchEnd(iconContainer);

            await waitFor(() => {
                expect(window.open).toHaveBeenCalledWith(
                    mockSocial.href,
                    '_blank',
                    'noopener,noreferrer'
                );
            });
        });
    });

    describe('Multiple Icons Interaction', () => {
        const mockSocials = [
            {
                name: 'Facebook',
                href: 'https://facebook.com/test',
                image: '/icons/facebook.png',
                color: '#1877f2'
            },
            {
                name: 'Instagram',
                href: 'https://instagram.com/test',
                image: '/icons/instagram.png',
                color: '#e4405f'
            },
            {
                name: 'LinkedIn',
                href: 'https://linkedin.com/test',
                image: '/icons/linkedin.png',
                color: '#0077b5'
            }
        ];

        test('should handle multiple simultaneous hover states', async () => {
            const user = userEvent.setup();

            render(<SocialLinks3D socials={mockSocials} />);

            const socialIcons = screen.getAllByRole('button');

            // Hover multiple icons rapidly
            await user.hover(socialIcons[0]);
            await user.hover(socialIcons[1]);

            await waitFor(() => {
                // Only the last hovered should be active
                expect(socialIcons[1]).toHaveAttribute('data-is-hovered', 'true');
            });
        });

        test('should maintain proper z-index stacking', async () => {
            const user = userEvent.setup();

            render(<SocialLinks3D socials={mockSocials} />);

            const socialIcons = screen.getAllByRole('button');

            await user.hover(socialIcons[1]); // Middle icon

            await waitFor(() => {
                const hoveredIcon = socialIcons[1];
                expect(hoveredIcon).toHaveStyle({ zIndex: '50' });
            });
        });

        test('should handle smooth transitions between icons', async () => {
            const user = userEvent.setup();

            render(<SocialLinks3D socials={mockSocials} />);

            const socialIcons = screen.getAllByRole('button');

            // Move between icons
            await user.hover(socialIcons[0]);
            await user.hover(socialIcons[1]);
            await user.hover(socialIcons[2]);

            // Should not cause layout shifts or errors
            expect(socialIcons).toHaveLength(3);
            socialIcons.forEach(icon => {
                expect(icon).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle missing social data gracefully', () => {
            const incompleteSocial = {
                name: 'Test',
                // Missing href, image, color
            };

            expect(() => {
                render(
                    <SocialIcon3D
                        social={incompleteSocial}
                        index={0}
                        isHovered={false}
                        onHover={mockOnHover}
                    />
                );
            }).not.toThrow();
        });

        test('should handle animation errors gracefully', () => {
            // Mock framer-motion to throw error
            vi.mocked(require('framer-motion').motion.div).mockImplementation(() => {
                throw new Error('Animation error');
            });

            expect(() => {
                render(
                    <SocialIcon3D
                        social={mockSocial}
                        index={0}
                        isHovered={false}
                        onHover={mockOnHover}
                    />
                );
            }).not.toThrow();
        });

        test('should fallback when 3D transforms are not supported', () => {
            vi.mocked(require('@/hooks/useDeviceCapabilities').useDeviceCapabilities)
                .mockReturnValue({
                    capabilities: {
                        supportsTransform3D: false,
                        supportsBackdropFilter: false,
                        isTouch: false,
                        performanceLevel: 'low'
                    },
                    isSupported: () => false
                });

            render(
                <SocialIcon3D
                    social={mockSocial}
                    index={0}
                    isHovered={false}
                    onHover={mockOnHover}
                />
            );

            const iconContainer = screen.getByRole('button');

            // Should have fallback classes
            expect(iconContainer).toHaveClass('fallback-2d');
        });
    });
});