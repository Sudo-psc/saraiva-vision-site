import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from '../usePerformanceMonitor';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock performance API
const mockPerformance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn()
};

// Mock PerformanceObserver
class MockPerformanceObserver {
    constructor(callback) {
        this.callback = callback;
    }

    observe() { }
    disconnect() { }
}

// Mock requestAnimationFrame
let animationFrameCallbacks = [];
const mockRequestAnimationFrame = vi.fn((callback) => {
    const id = animationFrameCallbacks.length;
    animationFrameCallbacks.push(callback);
    return id;
});

const mockCancelAnimationFrame = vi.fn((id) => {
    animationFrameCallbacks[id] = null;
});

describe('usePerformanceMonitor', () => {
    beforeEach(() => {
        // Setup mocks
        global.performance = mockPerformance;
        global.PerformanceObserver = MockPerformanceObserver;
        global.requestAnimationFrame = mockRequestAnimationFrame;
        global.cancelAnimationFrame = mockCancelAnimationFrame;

        // Reset mocks
        vi.clearAllMocks();
        animationFrameCallbacks = [];
        mockPerformance.now.mockReturnValue(1000);
    });

    afterEach(() => {
        // Cleanup
        delete global.performance;
        delete global.PerformanceObserver;
        delete global.requestAnimationFrame;
        delete global.cancelAnimationFrame;
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => usePerformanceMonitor());

        expect(result.current.performanceLevel).toBe('high');
        expect(result.current.currentFPS).toBe(60);
        expect(result.current.isMonitoring).toBe(true);
    });

    it('should start monitoring automatically', () => {
        const { result } = renderHook(() => usePerformanceMonitor());

        expect(result.current.isMonitoring).toBe(true);
        expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('should provide optimized settings based on performance level', () => {
        const { result } = renderHook(() => usePerformanceMonitor());

        const highSettings = result.current.getOptimizedSettings();
        expect(highSettings.glassBlur).toBe(20);
        expect(highSettings.beamParticleCount).toBe(50);
        expect(highSettings.enableComplexAnimations).toBe(true);

        // Manually set to low performance
        act(() => {
            result.current.setManualPerformanceLevel('low');
        });

        const lowSettings = result.current.getOptimizedSettings();
        expect(lowSettings.glassBlur).toBe(5);
        expect(lowSettings.beamParticleCount).toBe(10);
        expect(lowSettings.enableComplexAnimations).toBe(false);
    });

    it('should stop monitoring when requested', () => {
        const { result } = renderHook(() => usePerformanceMonitor());

        act(() => {
            result.current.stopMonitoring();
        });

        expect(result.current.isMonitoring).toBe(false);
        expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });

    describe('Advanced Performance Monitoring', () => {
        it('should detect performance bottlenecks', () => {
            const { result } = renderHook(() => usePerformanceMonitor({
                enableBottleneckDetection: true
            }));

            // Simulate consistent poor performance
            act(() => {
                for (let i = 0; i < 10; i++) {
                    mockPerformance.now.mockReturnValue(i * 100); // 10 FPS
                    animationFrameCallbacks.forEach(callback => callback && callback(i * 100));
                }
            });

            const bottlenecks = result.current.getPerformanceBottlenecks();
            expect(bottlenecks).toContain('low_fps');
        });

        it('should provide performance recommendations', () => {
            const { result } = renderHook(() => usePerformanceMonitor());

            act(() => {
                result.current.setManualPerformanceLevel('low');
            });

            const recommendations = result.current.getPerformanceRecommendations();
            expect(recommendations).toMatchObject({
                reduceAnimations: true,
                lowerQuality: true,
                disableComplexEffects: true
            });
        });

        it('should track memory usage patterns', () => {
            // Mock performance.memory
            Object.defineProperty(global.performance, 'memory', {
                value: {
                    usedJSHeapSize: 50000000,
                    totalJSHeapSize: 100000000,
                    jsHeapSizeLimit: 200000000
                },
                writable: true
            });

            const { result } = renderHook(() => usePerformanceMonitor({
                enableMemoryMonitoring: true
            }));

            const memoryInfo = result.current.getMemoryInfo();
            expect(memoryInfo).toMatchObject({
                usedMemory: expect.any(Number),
                memoryPressure: expect.any(String)
            });
        });

        it('should adapt to device capabilities', () => {
            const { result } = renderHook(() => usePerformanceMonitor({
                deviceCapabilities: {
                    deviceMemory: 2,
                    hardwareConcurrency: 2,
                    connectionType: '3g'
                }
            }));

            const settings = result.current.getOptimizedSettings();
            expect(settings.glassBlur).toBeLessThan(15); // Should reduce for low-end device
            expect(settings.beamParticleCount).toBeLessThan(30);
        });

        it('should handle performance spikes and drops', () => {
            const { result } = renderHook(() => usePerformanceMonitor({
                enableSpikeDetection: true
            }));

            // Simulate performance spike
            act(() => {
                mockPerformance.now.mockReturnValue(0);
                animationFrameCallbacks.forEach(callback => callback && callback(0));

                mockPerformance.now.mockReturnValue(8.33); // 120 FPS
                animationFrameCallbacks.forEach(callback => callback && callback(8.33));

                mockPerformance.now.mockReturnValue(50); // Sudden drop to 20 FPS
                animationFrameCallbacks.forEach(callback => callback && callback(50));
            });

            const performanceEvents = result.current.getPerformanceEvents();
            expect(performanceEvents).toContainEqual(
                expect.objectContaining({
                    type: 'performance_drop',
                    severity: expect.any(String)
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle missing performance API gracefully', () => {
            delete global.performance;

            expect(() => {
                renderHook(() => usePerformanceMonitor());
            }).not.toThrow();
        });

        it('should handle requestAnimationFrame errors', () => {
            mockRequestAnimationFrame.mockImplementation(() => {
                throw new Error('RAF error');
            });

            const { result } = renderHook(() => usePerformanceMonitor());

            expect(result.current.performanceLevel).toBe('low'); // Should fallback
        });

        it('should recover from performance monitoring failures', () => {
            const { result } = renderHook(() => usePerformanceMonitor());

            // Simulate monitoring failure
            act(() => {
                mockPerformance.now.mockImplementation(() => {
                    throw new Error('Performance API error');
                });
            });

            // Should continue to work with fallback values
            expect(result.current.performanceLevel).toBeDefined();
            expect(result.current.getOptimizedSettings()).toBeDefined();
        });
    });
});