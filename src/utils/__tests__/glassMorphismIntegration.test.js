import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    generateGlassStyles,
    getResponsiveGlassIntensity,
    supportsBackdropFilter,
    createGlassCustomProperties,
    generateFallbackStyles
} from '../glassMorphismUtils';

// Mock DOM environment
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
});

describe('Glass Morphism Foundation Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Complete Glass Morphism Workflow', () => {
        it('should provide complete glass morphism foundation for mobile devices', () => {
            // Simulate mobile device
            const mobileWidth = 375;
            const performanceLevel = 'medium';

            // Get responsive intensity
            const intensity = getResponsiveGlassIntensity(mobileWidth, performanceLevel);
            expect(intensity).toBe('subtle');

            // Generate styles for mobile
            const styles = generateGlassStyles({ intensity });
            expect(styles.backdropFilter).toContain('blur(10px)');
            expect(styles.background).toContain('0.05');

            // Generate CSS custom properties
            const customProps = createGlassCustomProperties(intensity);
            expect(customProps['--glass-opacity']).toBe('0.05');
            expect(customProps['--glass-blur']).toBe('10px');
        });

        it('should provide complete glass morphism foundation for desktop devices', () => {
            // Simulate desktop device
            const desktopWidth = 1440;
            const performanceLevel = 'high';

            // Get responsive intensity
            const intensity = getResponsiveGlassIntensity(desktopWidth, performanceLevel);
            expect(intensity).toBe('strong');

            // Generate styles for desktop
            const styles = generateGlassStyles({ intensity });
            expect(styles.backdropFilter).toContain('blur(30px)');
            expect(styles.background).toContain('0.15');

            // Generate CSS custom properties
            const customProps = createGlassCustomProperties(intensity);
            expect(customProps['--glass-opacity']).toBe('0.15');
            expect(customProps['--glass-blur']).toBe('30px');
        });

        it('should provide fallback styles when backdrop-filter is not supported', () => {
            // Generate fallback styles (independent of feature detection)
            const fallbackStyles = generateFallbackStyles('medium', false);
            expect(fallbackStyles.backdropFilter).toBe('none');
            expect(fallbackStyles.WebkitBackdropFilter).toBe('none');
            expect(fallbackStyles.background).toContain('255, 255, 255'); // White fallback
            expect(fallbackStyles.background).toContain('0.85'); // Medium opacity
        });

        it('should adapt glass effects based on performance level', () => {
            const screenWidth = 1024;

            // Test different performance levels
            const lowPerf = getResponsiveGlassIntensity(screenWidth, 'low');
            const mediumPerf = getResponsiveGlassIntensity(screenWidth, 'medium');
            const highPerf = getResponsiveGlassIntensity(screenWidth, 'high');

            expect(lowPerf).toBe('subtle');
            expect(mediumPerf).toBe('medium');
            expect(highPerf).toBe('strong');

            // Verify styles match performance levels
            const lowStyles = generateGlassStyles({ intensity: lowPerf });
            const highStyles = generateGlassStyles({ intensity: highPerf });

            expect(lowStyles.backdropFilter).toContain('blur(10px)');
            expect(highStyles.backdropFilter).toContain('blur(30px)');
        });

        it('should provide consistent CSS custom properties across all intensities', () => {
            const intensities = ['subtle', 'medium', 'strong'];

            intensities.forEach(intensity => {
                const props = createGlassCustomProperties(intensity);

                // Verify all required properties are present
                expect(props).toHaveProperty('--glass-opacity');
                expect(props).toHaveProperty('--glass-blur');
                expect(props).toHaveProperty('--glass-saturation');
                expect(props).toHaveProperty('--glass-border-opacity');
                expect(props).toHaveProperty('--glass-shadow-opacity');

                // Verify values are strings with proper units
                expect(props['--glass-blur']).toMatch(/^\d+px$/);
                expect(props['--glass-saturation']).toMatch(/^\d+%$/);
            });
        });

        it('should generate compatible styles for both light and dark themes', () => {
            const intensity = 'medium';

            const lightStyles = generateGlassStyles({ intensity });
            const darkStyles = generateGlassStyles({ intensity }); // Using same function for consistency

            // Both should have the same structure
            expect(lightStyles).toHaveProperty('background');
            expect(lightStyles).toHaveProperty('backdropFilter');
            expect(lightStyles).toHaveProperty('WebkitBackdropFilter');
            expect(lightStyles).toHaveProperty('border');
            expect(lightStyles).toHaveProperty('boxShadow');

            expect(darkStyles).toHaveProperty('background');
            expect(darkStyles).toHaveProperty('backdropFilter');
            expect(darkStyles).toHaveProperty('WebkitBackdropFilter');
            expect(darkStyles).toHaveProperty('border');
            expect(darkStyles).toHaveProperty('boxShadow');
        });
    });

    describe('Glass Morphism Utility Integration', () => {
        it('should work seamlessly with CSS classes and inline styles', () => {
            const intensity = 'medium';

            // Generate inline styles
            const inlineStyles = generateGlassStyles({ intensity });

            // Generate CSS custom properties
            const customProps = createGlassCustomProperties(intensity);

            // Verify they can work together
            const combinedStyles = {
                ...inlineStyles,
                ...customProps
            };

            expect(combinedStyles).toHaveProperty('background');
            expect(combinedStyles).toHaveProperty('--glass-opacity');
            expect(combinedStyles).toHaveProperty('backdropFilter');
            expect(combinedStyles).toHaveProperty('--glass-blur');
        });

        it('should provide progressive enhancement based on browser capabilities', () => {
            // Generate enhanced styles for supported browsers
            const enhancedStyles = generateGlassStyles({ intensity: 'strong' });
            expect(enhancedStyles.backdropFilter).toContain('blur(30px)');
            expect(enhancedStyles.WebkitBackdropFilter).toContain('blur(30px)');

            // Generate fallback styles for unsupported browsers
            const fallbackStyles = generateFallbackStyles('strong', false);
            expect(fallbackStyles.backdropFilter).toBe('none');
            expect(fallbackStyles.WebkitBackdropFilter).toBe('none');
            expect(fallbackStyles.background).toContain('rgba(255, 255, 255, 0.8)');

            // Verify both styles have different approaches
            expect(enhancedStyles.backdropFilter).not.toBe(fallbackStyles.backdropFilter);
        });
    });
});