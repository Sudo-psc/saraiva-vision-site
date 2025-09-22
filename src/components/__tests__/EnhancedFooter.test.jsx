import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { vi } from 'vitest';
import EnhancedFooter from '../EnhancedFooter';
import i18n from '@/i18n';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    }
}));

// Mock hooks
vi.mock('@/hooks/useGlassMorphism', () => ({
    useGlassMorphism: () => ({
        capabilities: {
            supportsBackdropFilter: true,
            supportsTransform3D: true,
            performanceLevel: 'high',
            reducedMotion: false,
            devicePixelRatio: 1,
            isTouch: false
        },
        glassIntensity: 'medium',
        getGlassClasses: vi.fn(() => 'glass-morphism glass-medium'),
        getGlassStyles: vi.fn(() => ({
            '--glass-opacity': '0.1',
            '--glass-blur': '20px',
            '--glass-saturation': '150%'
        })),
        shouldEnableGlass: vi.fn(() => true)
    })
}));

vi.mock('@/hooks/useIntersectionObserver', () => ({
    useIntersectionObserver: () => [{ current: null }, true]
}));

// Mock Footer component
vi.mock('../Footer', () => ({
    default: () => <div data-testid="original-footer">Original Footer Content</div>
}));

const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <I18nextProvider i18n={i18n}>
                {component}
            </I18nextProvider>
        </BrowserRouter>
    );
};

describe('EnhancedFooter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderWithProviders(<EnhancedFooter />);
        expect(screen.getByTestId('original-footer')).toBeInTheDocument();
    });

    it('wraps the original Footer component', () => {
        renderWithProviders(<EnhancedFooter />);

        const originalFooter = screen.getByTestId('original-footer');
        expect(originalFooter).toBeInTheDocument();
        expect(originalFooter.textContent).toBe('Original Footer Content');
    });

    it('applies custom className', () => {
        const { container } = renderWithProviders(
            <EnhancedFooter className="custom-footer-class" />
        );

        const enhancedFooter = container.querySelector('.enhanced-footer-container');
        expect(enhancedFooter).toHaveClass('custom-footer-class');
    });

    it('renders glass layer when effects are active', () => {
        const { container } = renderWithProviders(<EnhancedFooter />);

        const glassLayer = container.querySelector('.enhanced-footer-glass-layer');
        expect(glassLayer).toBeInTheDocument();
    });

    it('accepts custom glass opacity', () => {
        const { container } = renderWithProviders(
            <EnhancedFooter glassOpacity={0.2} />
        );

        const glassLayer = container.querySelector('.enhanced-footer-glass-layer');
        expect(glassLayer).toBeInTheDocument();
    });

    it('can disable animations', () => {
        renderWithProviders(<EnhancedFooter enableAnimations={false} />);

        // Should still render the footer
        expect(screen.getByTestId('original-footer')).toBeInTheDocument();
    });

    it('shows development indicator in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const { container } = renderWithProviders(<EnhancedFooter />);

        // Look for development indicator
        const devIndicator = container.querySelector('.absolute.top-4.right-4');
        expect(devIndicator).toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });

    it('does not show development indicator in production', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const { container } = renderWithProviders(<EnhancedFooter />);

        // Should not show development indicator
        const devIndicator = container.querySelector('.absolute.top-4.right-4');
        expect(devIndicator).not.toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });
});