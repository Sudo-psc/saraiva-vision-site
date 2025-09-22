import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    generateGlassStyles,
    generateDarkGlassStyles,
    getResponsiveGlassIntensity,
    supportsBackdropFilter,
    createGlassCustomProperties,
    generateFallbackStyles
} from '../utils/glassMorphismUtils';

describe('Glass Morphism Utilities', () => {
    describe('generateGlassStyles', () => {
        it('should generate correct styles for medium intensity', () => {
            const styles = generateGlassStyles({ intensity: 'medium' });

            expect(styles.background).toContain('rgba(255, 255, 255, 0.1)');
            expect(styles.backdropFilter).toContain('blur(20px)');
            expect(styles.WebkitBackdropFilter).toContain('blur(20px)');
            expect(styles.border).toContain('rgba(255, 255, 255, 0.2)');
            expect(styles.boxShadow).toBeDefined();
        });

        it('should generate correct styles for subtle intensity', () => {
            const styles = generateGlassStyles({ intensity: 'subtle' });

            expect(styles.background).toContain('rgba(255, 255, 255, 0.05)');
            expect(styles.backdropFilter).toContain('blur(10px)');
        });

        it('should generate correct styles for strong intensity', () => {
            const styles = generateGlassStyles({ intensity: 'strong' });

            expect(styles.background).toContain('rgba(255, 255, 255, 0.15)');
            expect(styles.backdropFilter).toContain('blur(30px)');
        });

        it('should allow custom opacity override', () => {
            const styles = generateGlassStyles({ intensity: 'medium', opacity: 0.25 });

            expect(styles.background).toContain('rgba(255, 255, 255, 0.25)');
        });
    });

    describe('generateDarkGlassStyles', () => {
        it('should generate dark theme styles', () => {
            const styles = generateDarkGlassStyles({ intensity: 'medium' });

            expect(styles.background).toContain('rgba(0, 0, 0, 0.1)');
            expect(styles.backdropFilter).toContain('blur(20px)');
        });
    });

    describe('getResponsiveGlassIntensity', () => {
        it('should return subtle for mobile screens', () => {
            const intensity = getResponsiveGlassIntensity(479, 'high');
            expect(intensity).toBe('subtle');
        });

        it('should return medium for tablet screens', () => {
            const intensity = getResponsiveGlassIntensity(768, 'high');
            expect(intensity).toBe('medium');
        });

        it('should return strong for desktop with high performance', () => {
            const intensity = getResponsiveGlassIntensity(1200, 'high');
            expect(intensity).toBe('strong');
        });

        it('should return subtle for low performance devices', () => {
            const intensity = getResponsiveGlassIntensity(1200, 'low');
            expect(intensity).toBe('subtle');
        });
    });

    describe('createGlassCustomProperties', () => {
        it('should create CSS custom properties for medium intensity', () => {
            const properties = createGlassCustomProperties('medium');

            expect(properties).toHaveProperty('--glass-opacity', '0.1');
            expect(properties).toHaveProperty('--glass-blur', '20px');
            expect(properties).toHaveProperty('--glass-saturation', '150%');
        });
    });

    describe('generateFallbackStyles', () => {
        it('should generate fallback styles for light theme', () => {
            const styles = generateFallbackStyles('medium', false);

            expect(styles.background).toContain('255, 255, 255');
            expect(styles.backdropFilter).toBe('none');
            expect(styles.WebkitBackdropFilter).toBe('none');
        });

        it('should generate fallback styles for dark theme', () => {
            const styles = generateFallbackStyles('medium', true);

            expect(styles.background).toContain('0, 0, 0');
            expect(styles.backdropFilter).toBe('none');
        });
    });
});