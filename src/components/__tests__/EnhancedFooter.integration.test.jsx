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

// Mock intersection observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock CSS.supports for backdrop-filter detection
Object.defineProperty(window, 'CSS', {
    value: {
        supports: vi.fn((property, value) => {
            if (property === 'backdrop-filter' && value === 'blur(1px)') {
                return true;
            }
            return false;
        })
    }
});

// Mock matchMedia for reduced motion detection
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <I18nextProvider i18n={i18n}>
                {component}
            </I18nextProvider>
        </BrowserRouter>
    );
};

describe('EnhancedFooter Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('integrates with real app structure', () => {
        const { container } = renderWithProviders(
            <div className="app">
                <main>
                    <h1>Main Content</h1>
                </main>
                <EnhancedFooter />
            </div>
        );

        // Check that the enhanced footer is rendered
        const enhancedFooter = container.querySelector('.enhanced-footer-container');
        expect(enhancedFooter).toBeInTheDocument();

        // Check that original footer content is preserved
        expect(screen.getByText('Original Footer Content')).toBeInTheDocument();
    });

    it('works with different glass configurations', () => {
        const { rerender } = renderWithProviders(
            <EnhancedFooter glassOpacity={0.05} />
        );

        expect(screen.getByText('Original Footer Content')).toBeInTheDocument();

        // Test with different configuration
        rerender(
            <BrowserRouter>
                <I18nextProvider i18n={i18n}>
                    <EnhancedFooter glassOpacity={0.3} enableAnimations={false} />
                </I18nextProvider>
            </BrowserRouter>
        );

        expect(screen.getByText('Original Footer Content')).toBeInTheDocument();
    });

    it('handles responsive behavior', () => {
        // Mock window.innerWidth for responsive testing
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 320,
        });

        const { container } = renderWithProviders(<EnhancedFooter />);

        const enhancedFooter = container.querySelector('.enhanced-footer-container');
        expect(enhancedFooter).toBeInTheDocument();

        // Test tablet size
        window.innerWidth = 768;
        window.dispatchEvent(new Event('resize'));

        // Test desktop size
        window.innerWidth = 1200;
        window.dispatchEvent(new Event('resize'));

        expect(enhancedFooter).toBeInTheDocument();
    });

    it('respects accessibility preferences', () => {
        // Mock reduced motion preference
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        const { container } = renderWithProviders(<EnhancedFooter />);

        const enhancedFooter = container.querySelector('.enhanced-footer-container');
        expect(enhancedFooter).toBeInTheDocument();
    });

    it('handles performance degradation gracefully', () => {
        // Mock low performance scenario
        Object.defineProperty(navigator, 'deviceMemory', {
            writable: true,
            value: 1 // Low memory device
        });

        Object.defineProperty(navigator, 'hardwareConcurrency', {
            writable: true,
            value: 2 // Low CPU cores
        });

        const { container } = renderWithProviders(<EnhancedFooter />);

        const enhancedFooter = container.querySelector('.enhanced-footer-container');
        expect(enhancedFooter).toBeInTheDocument();

        // Should still render the footer content
        expect(screen.getByText('Original Footer Content')).toBeInTheDocument();
    });
});