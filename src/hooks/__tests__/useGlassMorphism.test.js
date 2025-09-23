import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGlassMorphism } from '../useGlassMorphism';

// Mock CSS.supports for testing
const mockCSSSupports = vi.fn();
Object.defineProperty(window, 'CSS', {
    value: {
        supports: mockCSSSupports
    },
    writable: true
});

describe('useGlassMorphism', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCSSSupports.mockReturnValue(true);
    });

    describe('Feature Detection', () => {
        it('should detect backdrop-filter support', () => {
            mockCSSSupports.mockReturnValue(true);

            const { result } = renderHook(() => useGlassMorphism());

            expect(result.current.supportsBackdropFilter).toBe(true);
            expect(mockCSSSupports).toHaveBeenCalledWith('backdrop-filter', 'blur(1px)');
        });

        it('should handle lack of backdrop-filter support', () => {
            mockCSSSupports.mockReturnValue(false);

            const { result } = renderHook(() => useGlassMorphism());

            expect(result.current.supportsBackdropFilter).toBe(false);
        });

        it('should detect 3D transform support', () => {
            mockCSSSupports.mockImplementation((property, value) => {
                if (property === 'transform' && value === 'perspective(1px)') return true;
                if (property === 'backdrop-filter') return true;
                return false;
            });

            const { result } = renderHook(() => useGlassMorphism());

            expect(result.current.supports3DTransforms).toBe(true);
        });
    });

    describe('Glass Effect Utilities', () => {
        it('should generate correct glass morphism styles with full support', () => {
            const { result } = renderHook(() => useGlassMorphism({
                opacity: 0.1,
                blur: 20,
                saturation: 180
            }));

            const styles = result.current.getGlassStyles();

            expect(styles).toEqual({
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            });
        });

        it('should provide fallback styles when backdrop-filter is not supported', () => {
            mockCSSSupports.mockReturnValue(false);

            const { result } = renderHook(() => useGlassMorphism({
                opacity: 0.1,
                blur: 20
            }));

            const styles = result.current.getGlassStyles();

            expect(styles.backdropFilter).toBeUndefined();
            expect(styles.background).toContain('rgba(255, 255, 255, 0.15)'); // Fallback with higher opacity
        });

        it('should adjust opacity based on device capabilities', () => {
            const { result } = renderHook(() => useGlassMorphism({
                opacity: 0.1,
                adaptiveOpacity: true
            }));

            act(() => {
                result.current.setDeviceCapabilities({ performanceLevel: 'low' });
            });

            const styles = result.current.getGlassStyles();
            expect(styles.background).toContain('0.05'); // Reduced opacity for low performance
        });
    });

    describe('Responsive Glass Effects', () => {
        it('should provide mobile-optimized glass effects', () => {
            const { result } = renderHook(() => useGlassMorphism());

            const mobileStyles = result.current.getMobileGlassStyles();

            expect(mobileStyles.backdropFilter).toContain('blur(10px)'); // Reduced blur for mobile
            expect(mobileStyles.background).toContain('0.05'); // Reduced opacity
        });

        it('should provide desktop full-intensity effects', () => {
            const { result } = renderHook(() => useGlassMorphism());

            const desktopStyles = result.current.getDesktopGlassStyles();

            expect(desktopStyles.backdropFilter).toContain('blur(20px)');
            expect(desktopStyles.background).toContain('0.1');
        });
    });

    describe('Performance Optimization', () => {
        it('should disable effects when performance is low', () => {
            const { result } = renderHook(() => useGlassMorphism());

            act(() => {
                result.current.setDeviceCapabilities({ performanceLevel: 'low' });
            });

            expect(result.current.shouldUseGlassEffects).toBe(false);
        });

        it('should respect reduced motion preferences', () => {
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

            const { result } = renderHook(() => useGlassMorphism());

            expect(result.current.prefersReducedMotion).toBe(true);
            expect(result.current.shouldUseGlassEffects).toBe(false);
        });
    });

    describe('CSS Custom Properties', () => {
        it('should generate CSS custom properties for dynamic theming', () => {
            const { result } = renderHook(() => useGlassMorphism({
                opacity: 0.15,
                blur: 25
            }));

            const cssProps = result.current.getCSSCustomProperties();

            expect(cssProps).toEqual({
                '--glass-opacity': '0.15',
                '--glass-blur': '25px',
                '--glass-saturation': '180%',
                '--glass-border-opacity': '0.2'
            });
        });
    });
});