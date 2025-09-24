import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from '../useReducedMotion';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock matchMedia
const mockMatchMedia = vi.fn();

describe('useReducedMotion', () => {
    beforeEach(() => {
        // Setup window.matchMedia mock
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: mockMatchMedia
        });

        vi.clearAllMocks();
    });

    afterEach(() => {
        delete window.matchMedia;
    });

    it('should initialize with reduced motion disabled by default', () => {
        mockMatchMedia.mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        });

        const { result } = renderHook(() => useReducedMotion());

        expect(result.current.prefersReducedMotion).toBe(false);
        expect(result.current.isMotionSafe).toBe(true);
        expect(result.current.isReady).toBe(true);
    });

    it('should detect when user prefers reduced motion', () => {
        mockMatchMedia.mockReturnValue({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        });

        const { result } = renderHook(() => useReducedMotion());

        expect(result.current.prefersReducedMotion).toBe(true);
        expect(result.current.isMotionSafe).toBe(false);
    });

    it('should provide disabled animation settings when reduced motion is preferred', () => {
        mockMatchMedia.mockReturnValue({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        });

        const { result } = renderHook(() => useReducedMotion());

        const settings = result.current.getAnimationSettings({
            duration: 300,
            delay: 100
        });

        expect(settings.duration).toBe(0);
        expect(settings.delay).toBe(0);
        expect(settings.transition).toBe('none');
        expect(settings.animate).toBe(false);
        expect(settings.enableParticles).toBe(false);
        expect(settings.enableTransforms).toBe(false);
        expect(settings.enableBlur).toBe(false);
    });

    it('should provide appropriate CSS properties for reduced motion', () => {
        mockMatchMedia.mockReturnValue({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        });

        const { result } = renderHook(() => useReducedMotion());

        const cssProps = result.current.getMotionCSSProperties();

        expect(cssProps['--animation-duration']).toBe('0s');
        expect(cssProps['--animation-delay']).toBe('0s');
        expect(cssProps['--transition-duration']).toBe('0s');
        expect(cssProps['--transform-scale']).toBe('1');
        expect(cssProps['--transform-rotate']).toBe('0deg');
        expect(cssProps['--blur-amount']).toBe('0px');
        expect(cssProps['--particle-count']).toBe('0');
    });

    it('should determine which animations are safe', () => {
        mockMatchMedia.mockReturnValue({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        });

        const { result } = renderHook(() => useReducedMotion());

        expect(result.current.shouldAnimate('fade')).toBe(true);
        expect(result.current.shouldAnimate('opacity')).toBe(true);
        expect(result.current.shouldAnimate('color')).toBe(true);
        expect(result.current.shouldAnimate('transform')).toBe(false);
        expect(result.current.shouldAnimate('scale')).toBe(false);
    });
});