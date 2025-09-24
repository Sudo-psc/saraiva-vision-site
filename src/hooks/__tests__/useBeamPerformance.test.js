import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBeamPerformance } from '../useBeamPerformance';

// Mock requestAnimationFrame and performance APIs
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();
const mockPerformanceNow = vi.fn();

global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;
global.performance = {
    now: mockPerformanceNow
};

// Mock PerformanceObserver
const mockPerformanceObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

global.PerformanceObserver = vi.fn().mockImplementation((callback) => {
    mockPerformanceObserver.mockImplementation(callback);
    return {
        observe: mockObserve,
        disconnect: mockDisconnect
    };
});

describe('useBeamPerformance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPerformanceNow.mockReturnValue(0);
        mockRequestAnimationFrame.mockImplementation(callback => {
            setTimeout(callback, 16.67); // 60fps
            return 1;
        });
    });

    describe('Frame Rate Monitoring', () => {
        it('should initialize with default performance metrics', () => {
            const { result } = renderHook(() => useBeamPerformance());

            expect(result.current.frameRate).toBe(60);
            expect(result.current.performanceLevel).toBe('high');
            expect(result.current.isOptimized).toBe(true);
        });

        it('should monitor frame rate and adjust performance level', async () => {
            const { result } = renderHook(() => useBeamPerformance());

            // Simulate low frame rate
            mockPerformanceNow
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(33.33) // 30fps
                .mockReturnValueOnce(66.66)
                .mockReturnValueOnce(100);

            act(() => {
                result.current.startMonitoring();
            });

            // Simulate performance observer callback
            act(() => {
                mockPerformanceObserver([
                    { duration: 33.33 }, // Frame time for 30fps
                    { duration: 33.33 },
                    { duration: 33.33 }
                ]);
            });

            expect(result.current.frameRate).toBeLessThan(60);
            expect(result.current.performanceLevel).toBe('medium');
        });

        it('should detect very low performance and adjust accordingly', () => {
            const { result } = renderHook(() => useBeamPerformance());

            act(() => {
                mockPerformanceObserver([
                    { duration: 50 }, // Frame time for 20fps
                    { duration: 50 },
                    { duration: 50 }
                ]);
            });

            expect(result.current.performanceLevel).toBe('low');
            expect(result.current.isOptimized).toBe(false);
        });
    });

    describe('Beam Animation Optimization', () => {
        it('should provide optimized beam settings for high performance', () => {
            const { result } = renderHook(() => useBeamPerformance());

            const settings = result.current.getOptimizedBeamSettings();

            expect(settings).toEqual({
                particleCount: 50,
                animationSpeed: 1,
                blurIntensity: 20,
                enableGlow: true,
                enableTrails: true,
                quality: 'high'
            });
        });

        it('should reduce beam complexity for medium performance', () => {
            const { result } = renderHook(() => useBeamPerformance());

            act(() => {
                mockPerformanceObserver([{ duration: 25 }]); // 40fps
            });

            const settings = result.current.getOptimizedBeamSettings();

            expect(settings.particleCount).toBeLessThan(50);
            expect(settings.quality).toBe('medium');
            expect(settings.enableTrails).toBe(false);
        });

        it('should provide minimal beam settings for low performance', () => {
            const { result } = renderHook(() => useBeamPerformance());

            act(() => {
                mockPerformanceObserver([{ duration: 50 }]); // 20fps
            });

            const settings = result.current.getOptimizedBeamSettings();

            expect(settings).toEqual({
                particleCount: 10,
                animationSpeed: 0.5,
                blurIntensity: 5,
                enableGlow: false,
                enableTrails: false,
                quality: 'low'
            });
        });
    });

    describe('Memory Usage Monitoring', () => {
        it('should track memory usage and adjust beam settings', () => {
            // Mock memory API
            Object.defineProperty(performance, 'memory', {
                value: {
                    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
                    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
                    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
                },
                configurable: true
            });

            const { result } = renderHook(() => useBeamPerformance());

            const memoryUsage = result.current.getMemoryUsage();

            expect(memoryUsage.percentage).toBe(50);
            expect(memoryUsage.isHigh).toBe(false);
        });

        it('should detect high memory usage and reduce beam complexity', () => {
            Object.defineProperty(performance, 'memory', {
                value: {
                    usedJSHeapSize: 80 * 1024 * 1024, // 80MB
                    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
                    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024
                },
                configurable: true
            });

            const { result } = renderHook(() => useBeamPerformance());

            const memoryUsage = result.current.getMemoryUsage();
            expect(memoryUsage.isHigh).toBe(true);

            const settings = result.current.getOptimizedBeamSettings();
            expect(settings.particleCount).toBeLessThan(30);
        });
    });

    describe('Battery Level Optimization', () => {
        it('should detect low battery and reduce animations', async () => {
            // Mock Battery API
            const mockBattery = {
                level: 0.15, // 15% battery
                charging: false
            };

            Object.defineProperty(navigator, 'getBattery', {
                value: () => Promise.resolve(mockBattery),
                configurable: true
            });

            const { result } = renderHook(() => useBeamPerformance());

            await act(async () => {
                await result.current.checkBatteryLevel();
            });

            expect(result.current.batteryOptimized).toBe(true);

            const settings = result.current.getOptimizedBeamSettings();
            expect(settings.animationSpeed).toBeLessThan(1);
        });

        it('should maintain full performance when battery is charging', async () => {
            const mockBattery = {
                level: 0.15,
                charging: true
            };

            Object.defineProperty(navigator, 'getBattery', {
                value: () => Promise.resolve(mockBattery),
                configurable: true
            });

            const { result } = renderHook(() => useBeamPerformance());

            await act(async () => {
                await result.current.checkBatteryLevel();
            });

            expect(result.current.batteryOptimized).toBe(false);
        });
    });

    describe('Adaptive Quality System', () => {
        it('should automatically adjust quality based on performance metrics', () => {
            const { result } = renderHook(() => useBeamPerformance({
                adaptiveQuality: true,
                targetFrameRate: 60
            }));

            // Simulate performance drop
            act(() => {
                mockPerformanceObserver([
                    { duration: 20 }, // 50fps
                    { duration: 25 }, // 40fps
                    { duration: 30 }  // 33fps
                ]);
            });

            expect(result.current.adaptiveQuality).toBe('medium');

            // Simulate further performance drop
            act(() => {
                mockPerformanceObserver([
                    { duration: 40 }, // 25fps
                    { duration: 45 }, // 22fps
                    { duration: 50 }  // 20fps
                ]);
            });

            expect(result.current.adaptiveQuality).toBe('low');
        });

        it('should recover quality when performance improves', () => {
            const { result } = renderHook(() => useBeamPerformance({
                adaptiveQuality: true
            }));

            // Start with low performance
            act(() => {
                mockPerformanceObserver([{ duration: 50 }]);
            });
            expect(result.current.adaptiveQuality).toBe('low');

            // Improve performance
            act(() => {
                mockPerformanceObserver([
                    { duration: 16 }, // 60fps
                    { duration: 16 },
                    { duration: 16 }
                ]);
            });

            expect(result.current.adaptiveQuality).toBe('high');
        });
    });

    describe('Performance Thresholds', () => {
        it('should use custom performance thresholds', () => {
            const { result } = renderHook(() => useBeamPerformance({
                thresholds: {
                    high: 45, // 45fps for high
                    medium: 25 // 25fps for medium
                }
            }));

            act(() => {
                mockPerformanceObserver([{ duration: 25 }]); // 40fps
            });

            expect(result.current.performanceLevel).toBe('medium');
        });
    });

    describe('Cleanup and Resource Management', () => {
        it('should cleanup performance observers on unmount', () => {
            const { unmount } = renderHook(() => useBeamPerformance());

            unmount();

            expect(mockDisconnect).toHaveBeenCalled();
        });

        it('should stop monitoring when requested', () => {
            const { result } = renderHook(() => useBeamPerformance());

            act(() => {
                result.current.startMonitoring();
            });

            act(() => {
                result.current.stopMonitoring();
            });

            expect(mockDisconnect).toHaveBeenCalled();
        });
    });
});