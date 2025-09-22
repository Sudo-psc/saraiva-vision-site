import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    generateGlassStyles,
    generateDarkGlassStyles,
    getResponsiveGlassIntensity,
    supportsBackdropFilter,
    applyGlobalGlassClasses,
    createGlassCustomProperties,
    generateFallbackStyles
} from '../glassMorphismUtils';

// Mock DOM methods
const mockDocumentElement = {
    classList: {
        toggle: vi.fn(),
        add: vi.fn(),
        remove: vi.fn()
    }
};

Object.defineProperty(document, 'documentElement', {
    value: mockDocumentElement,
    writable: true
});

describe('glassMorphismUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateGlassStyles', () => {
        it('should generate default medium intensity glass styles', () => {
            const styles = generateGlassStyles();

            expect(styles.background).toBe('linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))');
            expect(styles.backdropFilter).toBe('blur(20px) saturate(150%)');
            expect(styles.WebkitBackdropFilter).toBe('blur(20px) saturate(150%)');
            expect(styles.border).toBe('1px solid rgba(255, 255, 255, 0.2)');
            expect(styles.boxShadow).toContain('0 8px 32px rgba(0, 0, 0, 0.1)');
            expect(styles.boxShadow).toContain('inset 0 1px 0 rgba(255, 255, 255,');
        });

        it('should generate subtle intensity glass styles', () => {
            const styles = generateGlassStyles({ intensity: 'subtle' });

            expect(styles.backdropFilter).toBe('blur(10px) saturate(120%)');
            expect(styles.background).toContain('0.05');
        });

        it('should generate strong intensity glass styles', () => {
            const styles = generateGlassStyles({ intensity: 'strong' });

            expect(styles.backdropFilter).toBe('blur(30px) saturate(180%)');
            expect(styles.background).toContain('0.15');
        });

        it('should allow custom opacity override', () => {
            const styles = generateGlassStyles({ opacity: 0.25 });

            expect(styles.background).toContain('0.25');
            expect(styles.background).toContain('0.125'); // Half of opacity
        });

        it('should allow custom blur override', () => {
            const styles = generateGlassStyles({ blur: 35 });

            expect(styles.backdropFilter).toContain('blur(35px)');
            expect(styles.WebkitBackdropFilter).toContain('blur(35px)');
        });
    });

    describe('generateDarkGlassStyles', () => {
        it('should generate dark theme glass styles', () => {
            const styles = generateDarkGlassStyles();

            expect(styles.background).toContain('rgba(0, 0, 0');
            expect(styles.border).toContain('rgba(255, 255, 255');
        });

        it('should have higher shadow opacity for dark theme', () => {
            const lightStyles = generateGlassStyles();
            const darkStyles = generateDarkGlassStyles();

            // Dark theme should have more prominent shadows
            expect(darkStyles.boxShadow).toContain('0.3'); // Higher shadow opacity
            expect(lightStyles.boxShadow).toContain('0.1'); // Lower shadow opacity
        });
    });

    describe('getResponsiveGlassIntensity', () => {
        it('should return subtle for mobile screens', () => {
            expect(getResponsiveGlassIntensity(320)).toBe('subtle');
            expect(getResponsiveGlassIntensity(479)).toBe('subtle');
        });

        it('should return medium for tablet screens', () => {
            expect(getResponsiveGlassIntensity(768)).toBe('medium');
            expect(getResponsiveGlassIntensity(1023)).toBe('medium');
        });

        it('should return strong for desktop with high performance', () => {
            expect(getResponsiveGlassIntensity(1200, 'high')).toBe('strong');
        });

        it('should return medium for desktop with medium performance', () => {
            expect(getResponsiveGlassIntensity(1200, 'medium')).toBe('medium');
        });

        it('should return subtle for low performance devices', () => {
            expect(getResponsiveGlassIntensity(1200, 'low')).toBe('subtle');
            expect(getResponsiveGlassIntensity(768, 'low')).toBe('subtle');
        });
    });

    describe('supportsBackdropFilter', () => {
        it('should detect backdrop-filter support', () => {
            // Mock createElement to return element with backdrop-filter support
            const mockElement = {
                style: {
                    backdropFilter: '',
                    webkitBackdropFilter: ''
                }
            };

            vi.spyOn(document, 'createElement').mockReturnValue(mockElement);

            // Simulate setting backdrop-filter
            Object.defineProperty(mockElement.style, 'backdropFilter', {
                set: function (value) { this._backdropFilter = value; },
                get: function () { return this._backdropFilter || 'blur(1px)'; }
            });

            expect(supportsBackdropFilter()).toBe(true);
        });

        it('should fallback to webkit prefix when standard is not supported', () => {
            const mockElement = {
                style: {
                    backdropFilter: '',
                    webkitBackdropFilter: ''
                }
            };

            vi.spyOn(document, 'createElement').mockReturnValue(mockElement);

            // Standard backdrop-filter not supported
            Object.defineProperty(mockElement.style, 'backdropFilter', {
                set: function (value) { this._backdropFilter = ''; },
                get: function () { return ''; }
            });

            // Webkit prefix supported
            Object.defineProperty(mockElement.style, 'webkitBackdropFilter', {
                set: function (value) { this._webkitBackdropFilter = value; },
                get: function () { return this._webkitBackdropFilter || 'blur(1px)'; }
            });

            expect(supportsBackdropFilter()).toBe(true);
        });
    });

    describe('applyGlobalGlassClasses', () => {
        it('should apply correct CSS classes based on capabilities', () => {
            const capabilities = {
                supportsBackdropFilter: false,
                supportsTransform3D: true,
                reducedMotion: false,
                isTouch: true,
                performanceLevel: 'medium'
            };

            applyGlobalGlassClasses(capabilities);

            expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith('no-backdrop-filter', true);
            expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith('no-transform-3d', false);
            expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith('reduced-motion', false);
            expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith('touch-device', true);
            expect(mockDocumentElement.classList.toggle).toHaveBeenCalledWith('medium-performance', true);
        });
    });

    describe('createGlassCustomProperties', () => {
        it('should create CSS custom properties for medium intensity', () => {
            const props = createGlassCustomProperties('medium');

            expect(props).toEqual({
                '--glass-opacity': '0.1',
                '--glass-blur': '20px',
                '--glass-saturation': '150%',
                '--glass-border-opacity': '0.2',
                '--glass-shadow-opacity': '0.1'
            });
        });

        it('should create CSS custom properties for subtle intensity', () => {
            const props = createGlassCustomProperties('subtle');

            expect(props).toEqual({
                '--glass-opacity': '0.05',
                '--glass-blur': '10px',
                '--glass-saturation': '120%',
                '--glass-border-opacity': '0.1',
                '--glass-shadow-opacity': '0.05'
            });
        });

        it('should create CSS custom properties for strong intensity', () => {
            const props = createGlassCustomProperties('strong');

            expect(props).toEqual({
                '--glass-opacity': '0.15',
                '--glass-blur': '30px',
                '--glass-saturation': '180%',
                '--glass-border-opacity': '0.3',
                '--glass-shadow-opacity': '0.15'
            });
        });
    });

    describe('generateFallbackStyles', () => {
        it('should generate light theme fallback styles', () => {
            const styles = generateFallbackStyles('medium', false);

            expect(styles.background).toContain('255, 255, 255'); // White base
            expect(styles.background).toContain('0.85'); // Medium opacity
            expect(styles.backdropFilter).toBe('none');
            expect(styles.WebkitBackdropFilter).toBe('none');
        });

        it('should generate dark theme fallback styles', () => {
            const styles = generateFallbackStyles('medium', true);

            expect(styles.background).toContain('0, 0, 0'); // Black base
            expect(styles.background).toContain('0.7'); // Medium opacity for dark
            expect(styles.backdropFilter).toBe('none');
        });

        it('should adjust opacity based on intensity', () => {
            const subtleStyles = generateFallbackStyles('subtle', false);
            const strongStyles = generateFallbackStyles('strong', false);

            expect(subtleStyles.background).toContain('0.9'); // Higher opacity (more opaque)
            expect(strongStyles.background).toContain('0.8'); // Lower opacity (more transparent)
        });
    });
});