import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFooterBeamPerformance } from '../useFooterBeamPerformance';

// Mock timers
global.setInterval = vi.fn();
global.clearInterval = vi.fn();

// Mock performance.now()
global.performance = {
    now: vi.fn(() => Date.now()),
};

// Mock CSS.supports
Object.defineProperty(CSS, 'supports', {
    value: vi.fn((property, value) => {
        if (property === 'backdrop-filter' && value === 'blur(1px)') {
            return true;
        }
        if (property === 'transform' && value === 'translateZ(1px)') {
            return true;
        }
        return false;
    }),
    writable: true,
});

// Mock navigator properties
Object.defineProperty(navigator, 'deviceMemory', {
    value: 8,
    writable: true,
});

Object.defineProperty(navigator, 'hardwareConcurrency', {
    value: 8,
    writable: true,
});

Object.defineProperty(navigator, 'connection', {
    value: {
        effectiveType: '4g',
    },
    writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion: reduce') ? false : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe('useFooterBeamPerformance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('initializes with default intensity', () => {
        const { result } = renderHook(() => useFooterBeamPerformance());

        expect(result.current.currentIntensity).toBe('medium');
    });

    it('initializes with custom intensity', () => {
        const { result } = renderHook(() => useFooterBeamPerformance('strong'));

        expect(result.current.currentIntensity).toBe('strong');
    });

    it('provides performance metrics', () => {
        const { result } = renderHook(() => useFooterBeamPerformance());

        expect(result.current.performanceMetrics).toEqual({
            averageFrameTime: 16.67,
            frameCount: 0,
            isOptimizing: false,
        });
    });

    it('measures frame performance', () => {
        const { result } = renderHook(() => useFooterBeamPerformance());

        // Mock performance.now to simulate frame timing
        let currentTime = 0;
        performance.now = vi.fn(() => {
            currentTime += 16.67;
            return currentTime;
        });

        act(() => {
            const frameTime = result.current.measureFramePerformance();
            expect(frameTime).toBe(16.67);
        });

        expect(result.current.performanceMetrics.frameCount).toBe(1);
    });

    it('provides beam configuration for different intensities', () => {
        const { result } = renderHook(() => useFooterBeamPerformance('subtle'));

        const config = result.current.getBeamConfig();
        expect(config).toEqual({
            beamCount: 6,
            opacity: 0.4,
            speed: 0.5,
            blur: 15,
        });
    });

    it('provides device capabilities', () => {
        const { result } = renderHook(() => useFooterBeamPerformance());

        const capabilities = result.current.getDeviceCapabilities();
        expect(capabilities).toEqual({
            supportsBackdropFilter: true,
            supportsTransform3D: true,
            prefersReducedMotion: false,
            deviceMemory: 8,
            hardwareConcurrency: 8,
            connectionType: '4g',
        });
    });

    it('adapts configuration for low-end devices', () => {
        // Mock low-end device
        Object.defineProperty(navigator, 'deviceMemory', {
            value: 2,
            writable: true,
        });
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            value: 2,
            writable: true,
        });

        const { result } = renderHook(() => useFooterBeamPerformance('medium'));

        const adaptiveConfig = result.current.getAdaptiveConfig();
        expect(adaptiveConfig.beamCount).toBe(6); // 10 * 0.6
        expect(adaptiveConfig.opacity).toBe(0.42); // 0.6 * 0.7
        expect(adaptiveConfig.blur).toBe(15); // 20 - 5
    });

    it('adapts configuration for slow connections', () => {
        // Mock slow connection
        Object.defineProperty(navigator, 'connection', {
            value: {
                effectiveType: '2g',
            },
            writable: true,
        });

        const { result } = renderHook(() => useFooterBeamPerformance('medium'));

        const adaptiveConfig = result.current.getAdaptiveConfig();
        expect(adaptiveConfig.beamCount).toBe(7); // 10 * 0.7
        expect(adaptiveConfig.opacity).toBe(0.48); // 0.6 * 0.8
    });

    it('optimizes intensity based on poor performance', () => {
        const { result } = renderHook(() => useFooterBeamPerformance('strong'));

        // Simulate poor performance (below 30fps)
        let currentTime = 0;
        performance.now = vi.fn(() => currentTime);

        // Add multiple poor frame times
        act(() => {
            for (let i = 0; i < 35; i++) {
                currentTime += 40; // 40ms per frame = 25fps
                result.current.measureFramePerformance();
            }
        });

        // Trigger performance check
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.currentIntensity).toBe('subtle');
    });

    it('optimizes intensity based on good performance', () => {
        const { result } = renderHook(() => useFooterBeamPerformance('subtle'));

        // Simulate excellent performance (60fps)
        let currentTime = 0;
        performance.now = vi.fn(() => currentTime);

        // Add multiple good frame times
        act(() => {
            for (let i = 0; i < 35; i++) {
                currentTime += 16.67; // 16.67ms per frame = 60fps
                result.current.measureFramePerformance();
            }
        });

        // Trigger performance check
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.currentIntensity).toBe('medium');
    });

    it('sets subtle intensity for reduced motion preference', () => {
        // Mock reduced motion preference
        window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: query.includes('prefers-reduced-motion: reduce') ? true : false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        const { result } = renderHook(() => useFooterBeamPerformance('strong'));

        expect(result.current.currentIntensity).toBe('subtle');
    });

    it('starts and stops performance monitoring', () => {
        const { result } = renderHook(() => useFooterBeamPerformance());

        act(() => {
            result.current.startPerformanceMonitoring();
        });

        // Should start monitoring
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 2000);

        act(() => {
            result.current.stopPerformanceMonitoring();
        });

        // Should stop monitoring
        expect(clearInterval).toHaveBeenCalled();
    });

    it('handles missing navigator properties gracefully', () => {
        // Mock navigator without properties
        const originalNavigator = global.navigator;
        global.navigator = {
            ...originalNavigator,
            deviceMemory: undefined,
            hardwareConcurrency: undefined,
            connection: undefined,
        };

        const { result } = renderHook(() => useFooterBeamPerformance());

        const capabilities = result.current.getDeviceCapabilities();
        expect(capabilities.deviceMemory).toBe(4); // fallback
        expect(capabilities.hardwareConcurrency).toBe(4); // fallback
        expect(capabilities.connectionType).toBe('unknown'); // fallback

        // Restore original navigator
        global.navigator = originalNavigator;
    });

    it('cleans up on unmount', () => {
        const { result, unmount } = renderHook(() => useFooterBeamPerformance());

        act(() => {
            result.current.startPerformanceMonitoring();
        });

        unmount();

        expect(clearInterval).toHaveBeenCalled();
    });

    it('sets optimization flag when intensity changes', () => {
        const { result } = renderHook(() => useFooterBeamPerformance('medium'));

        // Simulate poor performance to trigger intensity change
        let currentTime = 0;
        performance.now = vi.fn(() => currentTime);

        act(() => {
            for (let i = 0; i < 35; i++) {
                currentTime += 40; // Poor performance
                result.current.measureFramePerformance();
            }
        });

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.performanceMetrics.isOptimizing).toBe(true);

        // Should reset optimization flag after delay
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.performanceMetrics.isOptimizing).toBe(false);
    });
});