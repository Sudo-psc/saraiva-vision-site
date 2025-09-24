import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResponsiveDesign } from '../hooks/useResponsiveDesign';

// Mock the glass morphism hook
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

// Mock window properties
const mockWindowProperties = (width, height) => {
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
};

describe('Responsive Design System', () => {
    beforeEach(() => {
        // Reset window properties to desktop size
        mockWindowProperties(1024, 768);

        // Mock matchMedia
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
    });

    describe('Device Type Detection', () => {
        it('should detect mobile device correctly', () => {
            mockWindowProperties(375, 667); // iPhone dimensions

            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.deviceType).toBe('mobile');
        });

        it('should detect tablet device correctly', () => {
            mockWindowProperties(768, 1024); // iPad dimensions

            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.deviceType).toBe('tablet');
        });

        it('should detect desktop device correctly', () => {
            mockWindowProperties(1440, 900); // Desktop dimensions

            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.deviceType).toBe('desktop');
        });
    });

    describe('Orientation Detection', () => {
        it('should detect portrait orientation', () => {
            mockWindowProperties(375, 667); // Portrait

            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.screenSize.orientation).toBe('portrait');
        });

        it('should detect landscape orientation', () => {
            mockWindowProperties(667, 375); // Landscape

            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.screenSize.orientation).toBe('landscape');
        });
    });

    describe('Responsive Configuration', () => {
        it('should provide mobile configuration for small screens', () => {
            mockWindowProperties(375, 667);

            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.responsiveConfig.glass?.intensity).toBe('subtle');
            expect(result.current.responsiveConfig.socialIcons?.enable3D).toBe(false);
        });

        it('should provide desktop configuration for large screens', () => {
            mockWindowProperties(1440, 900);

            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.responsiveConfig.glass?.intensity).toBe('strong');
            expect(result.current.responsiveConfig.socialIcons?.enable3D).toBe(true);
        });
    });

    describe('Feature Detection', () => {
        it('should enable glass effects on supported devices', () => {
            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.shouldEnableFeature('glass')).toBe(true);
        });

        it('should enable 3D icons on supported devices', () => {
            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.shouldEnableFeature('3d-icons')).toBe(true);
        });

        it('should enable beam animations on supported devices', () => {
            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.shouldEnableFeature('beams')).toBe(true);
        });
    });

    describe('Responsive Styles', () => {
        it('should generate CSS custom properties', () => {
            const { result } = renderHook(() => useResponsiveDesign());

            const styles = result.current.getResponsiveStyles();

            expect(styles).toHaveProperty('--footer-glass-opacity');
            expect(styles).toHaveProperty('--footer-glass-blur');
            expect(styles).toHaveProperty('--footer-social-scale');
            expect(styles).toHaveProperty('--footer-padding');
        });

        it('should generate responsive class names', () => {
            const { result } = renderHook(() => useResponsiveDesign());

            const classes = result.current.getResponsiveClasses();

            expect(classes).toContain('device-desktop');
            expect(classes).toContain('orientation-landscape');
            expect(classes).toContain('performance-high');
        });
    });

    describe('Breakpoints', () => {
        it('should have correct breakpoint values', () => {
            const { result } = renderHook(() => useResponsiveDesign());

            expect(result.current.breakpoints).toEqual({
                mobile: 0,
                tablet: 768,
                desktop: 1024,
                large: 1440
            });
        });
    });
});