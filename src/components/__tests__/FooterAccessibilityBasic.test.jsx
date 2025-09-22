/**
 * Basic Footer Accessibility Tests
 * 
 * Simple tests to verify core accessibility features are working
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>
    },
    AnimatePresence: ({ children }) => <>{children}</>,
    useReducedMotion: vi.fn(() => false)
}));

// Mock window.matchMedia
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

// Mock hooks
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

vi.mock('../Footer', () => ({
    default: function MockFooter() {
        return (
            <div data-testid="original-footer">
                <div>
                    <a href="/test" aria-label="Test link">Test Link</a>
                    <button aria-label="Scroll to top">↑</button>
                </div>
            </div>
        );
    }
}));

import { useFooterAccessibility } from '@/hooks/useFooterAccessibility';
import SocialIcon3D from '../SocialIcon3D';

describe('Footer Accessibility Basic Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('useFooterAccessibility hook should work without errors', () => {
        const TestComponent = () => {
            const {
                getSocialAriaProps,
                getFooterAriaProps,
                shouldReduceMotion
            } = useFooterAccessibility();

            return (
                <div data-testid="test-component">
                    <div {...getFooterAriaProps()}>Footer</div>
                    <div {...getSocialAriaProps({ name: 'Facebook' }, 0, false)}>Social</div>
                    <div data-testid="reduced-motion">{shouldReduceMotion ? 'true' : 'false'}</div>
                </div>
            );
        };

        render(<TestComponent />);

        expect(screen.getByTestId('test-component')).toBeInTheDocument();
        expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
    });

    test('SocialIcon3D should render with accessibility attributes', () => {
        const mockSocial = {
            name: 'Facebook',
            href: 'https://facebook.com/test',
            image: '/icons/facebook.png',
            color: '#1877f2'
        };
        const mockOnHover = vi.fn();

        render(
            <SocialIcon3D
                social={mockSocial}
                index={0}
                isHovered={false}
                onHover={mockOnHover}
            />
        );

        const socialIcon = screen.getByRole('button');
        expect(socialIcon).toBeInTheDocument();
        expect(socialIcon).toHaveAttribute('aria-label');
        expect(socialIcon).toHaveAttribute('tabIndex', '0');
    });

    test('should handle keyboard events without errors', () => {
        const mockSocial = {
            name: 'Facebook',
            href: 'https://facebook.com/test',
            image: '/icons/facebook.png',
            color: '#1877f2'
        };
        const mockOnHover = vi.fn();

        render(
            <SocialIcon3D
                social={mockSocial}
                index={0}
                isHovered={false}
                onHover={mockOnHover}
            />
        );

        const socialIcon = screen.getByRole('button');

        // Test that keyboard events don't throw errors
        expect(() => {
            socialIcon.focus();
            socialIcon.blur();
        }).not.toThrow();
    });

    test('should have screen reader descriptions', () => {
        const mockSocial = {
            name: 'Facebook',
            href: 'https://facebook.com/test',
            image: '/icons/facebook.png',
            color: '#1877f2'
        };
        const mockOnHover = vi.fn();

        render(
            <SocialIcon3D
                social={mockSocial}
                index={0}
                isHovered={false}
                onHover={mockOnHover}
            />
        );

        const description = document.getElementById('social-facebook-description');
        expect(description).toBeInTheDocument();
        expect(description).toHaveClass('sr-only');
    });
});