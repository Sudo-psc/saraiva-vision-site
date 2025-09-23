import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import EnhancedFooter from '../EnhancedFooter';

// Mock the hooks
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
        shouldEnableGlass: () => true,
        getGlassStyles: () => ({
            '--glass-opacity': '0.1',
            '--glass-blur': '20px',
            '--glass-saturation': '150%'
        })
    })
}));

vi.mock('@/hooks/useIntersectionObserver', () => ({
    useIntersectionObserver: () => [
        { current: null }, // ref
        true // isIntersecting
    ]
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    }
}));

// Mock the Footer component
vi.mock('../Footer', () => ({
    default: () => <div data-testid="original-footer">Original Footer Content</div>
}));

// Mock translation hook
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key
    })
}));

// Mock clinic info
vi.mock('@/lib/clinicInfo', () => ({
    clinicInfo: {
        phone: '(33) 99999-9999',
        email: 'test@example.com',
        facebook: 'https://facebook.com/test',
        instagram: 'https://instagram.com/test',
        linkedin: 'https://linkedin.com/test',
        chatbotUrl: 'https://chatbot.test'
    }
}));

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('EnhancedFooter', () => {
    beforeEach(() => {
        // Mock IntersectionObserver
        global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderWithRouter(<EnhancedFooter />);
        expect(screen.getByTestId('original-footer')).toBeInTheDocument();
    });

    it('applies enhanced-footer class to container', () => {
        const { container } = renderWithRouter(<EnhancedFooter />);
        const enhancedFooter = container.querySelector('.enhanced-footer');
        expect(enhancedFooter).toBeInTheDocument();
    });

    it('renders glass morphism layer', () => {
        const { container } = renderWithRouter(<EnhancedFooter />);
        const glassLayer = container.querySelector('.enhanced-footer-glass-layer');
        expect(glassLayer).toBeInTheDocument();
    });

    it('applies footer-glass-morphism class when glass is enabled', () => {
        const { container } = renderWithRouter(<EnhancedFooter />);
        const glassLayer = container.querySelector('.footer-glass-morphism');
        expect(glassLayer).toBeInTheDocument();
    });

    it('renders gradient overlay for depth', () => {
        const { container } = renderWithRouter(<EnhancedFooter />);
        const gradientOverlay = container.querySelector('.bg-gradient-to-t');
        expect(gradientOverlay).toBeInTheDocument();
    });

    it('wraps original footer content', () => {
        renderWithRouter(<EnhancedFooter />);
        const originalFooter = screen.getByTestId('original-footer');
        expect(originalFooter).toBeInTheDocument();
    });

    it('accepts custom className prop', () => {
        const { container } = renderWithRouter(<EnhancedFooter className="custom-class" />);
        const enhancedFooter = container.querySelector('.enhanced-footer');
        expect(enhancedFooter).toHaveClass('custom-class');
    });

    it('accepts custom glass opacity', () => {
        const { container } = renderWithRouter(<EnhancedFooter glassOpacity={0.2} />);
        const enhancedFooter = container.querySelector('.enhanced-footer');
        expect(enhancedFooter).toHaveStyle('--glass-opacity: 0.2');
    });

    it('accepts custom glass blur', () => {
        const { container } = renderWithRouter(<EnhancedFooter glassBlur={30} />);
        const enhancedFooter = container.querySelector('.enhanced-footer');
        expect(enhancedFooter).toHaveStyle('--glass-blur: 30px');
    });

    it('shows performance indicator in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        renderWithRouter(<EnhancedFooter />);

        expect(screen.getByText('Glass: ON')).toBeInTheDocument();
        expect(screen.getByText('Intensity: medium')).toBeInTheDocument();
        expect(screen.getByText('Performance: high')).toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });

    it('does not show performance indicator in production mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        renderWithRouter(<EnhancedFooter />);

        expect(screen.queryByText('Glass: ON')).not.toBeInTheDocument();

        process.env.NODE_ENV = originalEnv;
    });
});