/**
 * Unit tests for footerThemeManager null safety fixes
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    generateCSSCustomProperties,
    calculateOptimizedTheme,
    getCurrentTheme,
    getResponsiveContext,
    useFooterTheme
} from '../footerThemeManager';

describe('footerThemeManager null safety', () => {
    beforeEach(() => {
        // Reset any mocks
        vi.restoreAllMocks();
    });

    describe('generateCSSCustomProperties', () => {
        it('should handle null themeConfig gracefully', () => {
            const result = generateCSSCustomProperties(null);
            
            expect(result).toBeDefined();
            expect(result['--footer-glass-opacity']).toBe('0.1');
            expect(result['--footer-glass-blur']).toBe('20px');
            expect(result['--footer-glass-saturation']).toBe('150%');
        });

        it('should handle undefined themeConfig gracefully', () => {
            const result = generateCSSCustomProperties(undefined);
            
            expect(result).toBeDefined();
            expect(result['--footer-glass-opacity']).toBe('0.1');
            expect(result['--footer-glass-blur']).toBe('20px');
        });

        it('should handle empty object gracefully', () => {
            const result = generateCSSCustomProperties({});
            
            expect(result).toBeDefined();
            expect(result['--footer-glass-opacity']).toBe('0.1');
            expect(result['--footer-glass-blur']).toBe('20px');
        });

        it('should handle partial themeConfig with null values', () => {
            const themeConfig = {
                glassOpacity: null,
                glassBlur: undefined,
                socialScale: 1.2
            };
            
            const result = generateCSSCustomProperties(themeConfig);
            
            expect(result).toBeDefined();
            expect(result['--footer-glass-opacity']).toBe('0.1'); // fallback
            expect(result['--footer-glass-blur']).toBe('20px'); // fallback
            expect(result['--footer-social-scale']).toBe('1.2'); // actual value
        });

        it('should preserve valid values and use fallbacks for null/undefined', () => {
            const themeConfig = {
                glassOpacity: 0.5,
                glassBlur: null,
                socialScale: undefined,
                beamIntensity: 0.8
            };
            
            const result = generateCSSCustomProperties(themeConfig);
            
            expect(result['--footer-glass-opacity']).toBe('0.5'); // valid value
            expect(result['--footer-glass-blur']).toBe('20px'); // fallback
            expect(result['--footer-social-scale']).toBe('1.1'); // fallback
            expect(result['--footer-beam-intensity']).toBe('0.8'); // valid value
        });
    });

    describe('calculateOptimizedTheme', () => {
        it('should handle null base configuration gracefully', () => {
            const result = calculateOptimizedTheme('invalid-theme');
            
            expect(result).toBeDefined();
            expect(result.glassOpacity).toBeTypeOf('number');
            expect(result.glassBlur).toBeTypeOf('number');
            expect(result.socialScale).toBeTypeOf('number');
        });

        it('should ensure no null values in result', () => {
            const result = calculateOptimizedTheme();
            
            // Check all properties are defined and not null
            expect(result.glassOpacity).not.toBeNull();
            expect(result.glassBlur).not.toBeNull();
            expect(result.socialScale).not.toBeNull();
            expect(result.beamIntensity).not.toBeNull();
            expect(result.beamParticleCount).not.toBeNull();
            
            // Check they are numbers
            expect(typeof result.glassOpacity).toBe('number');
            expect(typeof result.glassBlur).toBe('number');
            expect(typeof result.socialScale).toBe('number');
        });

        it('should handle null custom overrides', () => {
            const result = calculateOptimizedTheme('auto', 'high', 'desktop', null);
            
            expect(result).toBeDefined();
            expect(result.glassOpacity).toBeTypeOf('number');
        });
    });

    describe('getCurrentTheme', () => {
        it('should return auto when window is undefined', () => {
            // Mock window as undefined
            const originalWindow = global.window;
            delete global.window;
            
            const result = getCurrentTheme();
            expect(result).toBe('auto');
            
            // Restore window
            global.window = originalWindow;
        });

        it('should return auto when matchMedia is not available', () => {
            const originalMatchMedia = window.matchMedia;
            delete window.matchMedia;
            
            const result = getCurrentTheme();
            expect(result).toBe('auto');
            
            // Restore matchMedia
            window.matchMedia = originalMatchMedia;
        });

        it('should handle matchMedia exceptions gracefully', () => {
            const originalMatchMedia = window.matchMedia;
            window.matchMedia = vi.fn(() => {
                throw new Error('matchMedia error');
            });
            
            const result = getCurrentTheme();
            expect(result).toBe('auto');
            
            // Restore matchMedia
            window.matchMedia = originalMatchMedia;
        });
    });

    describe('getResponsiveContext', () => {
        it('should return desktop when window is undefined', () => {
            const originalWindow = global.window;
            delete global.window;
            
            const result = getResponsiveContext();
            expect(result).toBe('desktop');
            
            // Restore window
            global.window = originalWindow;
        });

        it('should handle window.innerWidth exceptions gracefully', () => {
            const originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
            Object.defineProperty(window, 'innerWidth', {
                get: () => {
                    throw new Error('innerWidth error');
                }
            });
            
            const result = getResponsiveContext();
            expect(result).toBe('desktop');
            
            // Restore innerWidth
            if (originalInnerWidth) {
                Object.defineProperty(window, 'innerWidth', originalInnerWidth);
            }
        });

        it('should use fallback width when innerWidth is undefined', () => {
            const originalInnerWidth = window.innerWidth;
            Object.defineProperty(window, 'innerWidth', {
                value: undefined,
                configurable: true
            });
            
            const result = getResponsiveContext();
            expect(result).toBe('desktop'); // 1024 fallback width
            
            // Restore innerWidth
            Object.defineProperty(window, 'innerWidth', {
                value: originalInnerWidth,
                configurable: true
            });
        });
    });
});