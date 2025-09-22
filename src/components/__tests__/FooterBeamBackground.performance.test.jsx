/**
 * Footer Beam Background Performance Tests
 * 
 * Tests for beam background animations, frame rate monitoring, and performance optimization.
 * Covers animation throttling, memory management, and adaptive quality settings.
 * 
 * Requirements covered: 2.3, 3.3, 6.1
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { FooterBeamBackground } from '../ui/footer-beam-background';

// Mock performance APIs
const mockPerformance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => [])
};

// Mock requestAnimationFrame with frame timing control
let animationFrameCallbacks = [];
let currentTime = 0;
const mockRequestAnimationFrame = vi.fn((callback) => {
    const id = animationFrameCallbacks.length;
    animationFrameCallbacks.push(callback);
    return id;
});

const mockCancelAnimationFrame = vi.fn((id) => {
    animationFrameCallbacks[id] = null;
});

// Mock ResizeObserver
class MockResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Mock IntersectionObserver
class MockIntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {
        // Simulate element being visible
        this.callback([{ isIntersecting: true }]);
    }
    unobserve() { }
    disconnect() { }
}

describe('FooterBeamBackground Performance Tests', () => {
    beforeEach(() => {
        // Setup mocks
        global.performance = mockPerformance;
        global.requestAnimationFrame = mockRequestAnimationFrame;
        global.cancelAnimationFrame = mockCancelAnimationFrame;
        global.ResizeObserver = MockResizeObserver;
        global.IntersectionObserver = MockIntersectionObserver;

        // Reset state
        vi.clearAllMocks();
        animationFrameCallbacks = [];
        currentTime = 0;
        mockPerformance.now.mockImplementation(() => currentTime);
    });

    afterEach(() => {
        delete global.performance;
        delete global.requestAnimationFrame;
        delete global.cancelAnimationFrame;
        delete global.ResizeObserver;
        delete global.IntersectionObserver;
    });

    describe('Frame Rate Monitoring', () => {
        test('should monitor frame rate during animations', async () => {
            const onPerformanceUpdate = vi.fn();

            render(
                <FooterBeamBackground
                    enablePerformanceMonitoring={true}
                    onPerformanceUpdate={onPerformanceUpdate}
                />
            );

            // Simulate animation frames
            act(() => {
                currentTime = 0;
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));

                currentTime = 16.67; // 60 FPS
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));

                currentTime = 33.33;
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
            });

            await waitFor(() => {
                expect(onPerformanceUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        fps: expect.any(Number),
                        frameTime: expect.any(Number)
                    })
                );
            });
        });

        test('should detect frame drops and adjust quality', async () => {
            const onQualityAdjustment = vi.fn();

            render(
                <FooterBeamBackground
                    enableAdaptiveQuality={true}
                    onQualityAdjustment={onQualityAdjustment}
                />
            );

            // Simulate poor performance (low FPS)
            act(() => {
                currentTime = 0;
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));

                currentTime = 50; // 20 FPS (poor performance)
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));

                currentTime = 100;
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
            });

            await waitFor(() => {
                expect(onQualityAdjustment).toHaveBeenCalledWith(
                    expect.objectContaining({
                        newQuality: 'low',
                        reason: 'poor_performance'
                    })
                );
            });
        });

        test('should throttle animations when performance is poor', async () => {
            render(
                <FooterBeamBackground
                    enablePerformanceThrottling={true}
                    targetFPS={30}
                />
            );

            const beamContainer = screen.getByTestId('beam-background');

            // Simulate multiple animation frames
            act(() => {
                for (let i = 0; i < 10; i++) {
                    currentTime = i * 16.67;
                    animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
                }
            });

            await waitFor(() => {
                // Should have throttled class applied
                expect(beamContainer).toHaveClass('performance-throttled');
            });
        });
    });

    describe('Memory Management', () => {
        test('should clean up animation frames on unmount', () => {
            const { unmount } = render(<FooterBeamBackground />);

            // Start some animations
            act(() => {
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
            });

            unmount();

            expect(mockCancelAnimationFrame).toHaveBeenCalled();
        });

        test('should limit particle count based on performance', async () => {
            render(
                <FooterBeamBackground
                    maxParticles={100}
                    enablePerformanceOptimization={true}
                />
            );

            // Simulate low performance
            act(() => {
                currentTime = 0;
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));

                currentTime = 100; // 10 FPS
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
            });

            await waitFor(() => {
                const particles = screen.getAllByTestId(/beam-particle-/);
                expect(particles.length).toBeLessThan(50); // Should reduce particle count
            });
        });

        test('should pause animations when not visible', async () => {
            // Mock IntersectionObserver to report not visible
            global.IntersectionObserver = class {
                constructor(callback) {
                    this.callback = callback;
                }
                observe() {
                    this.callback([{ isIntersecting: false }]);
                }
                unobserve() { }
                disconnect() { }
            };

            render(<FooterBeamBackground enableVisibilityOptimization={true} />);

            await waitFor(() => {
                const beamContainer = screen.getByTestId('beam-background');
                expect(beamContainer).toHaveClass('animation-paused');
            });
        });
    });

    describe('Adaptive Quality Settings', () => {
        test('should start with high quality on capable devices', () => {
            render(
                <FooterBeamBackground
                    initialQuality="auto"
                    deviceCapabilities={{
                        performanceLevel: 'high',
                        supportsTransform3D: true,
                        deviceMemory: 8
                    }}
                />
            );

            const beamContainer = screen.getByTestId('beam-background');
            expect(beamContainer).toHaveClass('quality-high');
        });

        test('should reduce quality on low-end devices', () => {
            render(
                <FooterBeamBackground
                    initialQuality="auto"
                    deviceCapabilities={{
                        performanceLevel: 'low',
                        supportsTransform3D: false,
                        deviceMemory: 2
                    }}
                />
            );

            const beamContainer = screen.getByTestId('beam-background');
            expect(beamContainer).toHaveClass('quality-low');
        });

        test('should adjust blur intensity based on performance', async () => {
            const { rerender } = render(
                <FooterBeamBackground
                    enableAdaptiveBlur={true}
                    performanceLevel="high"
                />
            );

            let beamContainer = screen.getByTestId('beam-background');
            expect(beamContainer).toHaveStyle({ '--blur-intensity': '20px' });

            // Simulate performance drop
            rerender(
                <FooterBeamBackground
                    enableAdaptiveBlur={true}
                    performanceLevel="low"
                />
            );

            beamContainer = screen.getByTestId('beam-background');
            expect(beamContainer).toHaveStyle({ '--blur-intensity': '5px' });
        });
    });

    describe('Animation Optimization', () => {
        test('should use CSS transforms for better performance', () => {
            render(<FooterBeamBackground useHardwareAcceleration={true} />);

            const beamElements = screen.getAllByTestId(/beam-element-/);
            beamElements.forEach(element => {
                expect(element).toHaveStyle({
                    transform: expect.stringContaining('translateZ(0)')
                });
            });
        });

        test('should batch DOM updates for better performance', async () => {
            const mockSetAttribute = vi.fn();
            const originalSetAttribute = Element.prototype.setAttribute;
            Element.prototype.setAttribute = mockSetAttribute;

            render(<FooterBeamBackground enableBatchedUpdates={true} />);

            // Simulate multiple animation frames
            act(() => {
                for (let i = 0; i < 5; i++) {
                    currentTime = i * 16.67;
                    animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
                }
            });

            await waitFor(() => {
                // Should batch updates rather than calling setAttribute multiple times per frame
                const callsPerFrame = mockSetAttribute.mock.calls.length / 5;
                expect(callsPerFrame).toBeLessThan(10);
            });

            Element.prototype.setAttribute = originalSetAttribute;
        });

        test('should use requestIdleCallback for non-critical updates', async () => {
            const mockRequestIdleCallback = vi.fn((callback) => {
                setTimeout(callback, 0);
            });
            global.requestIdleCallback = mockRequestIdleCallback;

            render(<FooterBeamBackground enableIdleOptimization={true} />);

            await waitFor(() => {
                expect(mockRequestIdleCallback).toHaveBeenCalled();
            });

            delete global.requestIdleCallback;
        });
    });

    describe('Performance Metrics Collection', () => {
        test('should collect frame timing metrics', async () => {
            const onMetricsUpdate = vi.fn();

            render(
                <FooterBeamBackground
                    enableMetricsCollection={true}
                    onMetricsUpdate={onMetricsUpdate}
                />
            );

            // Simulate animation frames with varying performance
            act(() => {
                const frameTimes = [16.67, 33.33, 16.67, 50, 16.67];
                frameTimes.forEach((time, index) => {
                    currentTime = index * time;
                    animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
                });
            });

            await waitFor(() => {
                expect(onMetricsUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        averageFPS: expect.any(Number),
                        frameDrops: expect.any(Number),
                        worstFrameTime: expect.any(Number),
                        performanceScore: expect.any(Number)
                    })
                );
            });
        });

        test('should track memory usage over time', async () => {
            // Mock performance.memory
            Object.defineProperty(performance, 'memory', {
                value: {
                    usedJSHeapSize: 10000000,
                    totalJSHeapSize: 20000000,
                    jsHeapSizeLimit: 100000000
                },
                writable: true
            });

            const onMemoryUpdate = vi.fn();

            render(
                <FooterBeamBackground
                    enableMemoryMonitoring={true}
                    onMemoryUpdate={onMemoryUpdate}
                />
            );

            await waitFor(() => {
                expect(onMemoryUpdate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        usedMemory: expect.any(Number),
                        memoryPressure: expect.any(String)
                    })
                );
            });
        });

        test('should detect performance regressions', async () => {
            const onPerformanceRegression = vi.fn();

            render(
                <FooterBeamBackground
                    enableRegressionDetection={true}
                    onPerformanceRegression={onPerformanceRegression}
                />
            );

            // Simulate good performance initially
            act(() => {
                for (let i = 0; i < 10; i++) {
                    currentTime = i * 16.67; // 60 FPS
                    animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
                }
            });

            // Then simulate performance regression
            act(() => {
                for (let i = 0; i < 10; i++) {
                    currentTime = 10 * 16.67 + i * 50; // 20 FPS
                    animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
                }
            });

            await waitFor(() => {
                expect(onPerformanceRegression).toHaveBeenCalledWith(
                    expect.objectContaining({
                        previousFPS: expect.any(Number),
                        currentFPS: expect.any(Number),
                        regressionSeverity: expect.any(String)
                    })
                );
            });
        });
    });

    describe('Error Handling and Fallbacks', () => {
        test('should fallback gracefully when requestAnimationFrame is not available', () => {
            delete global.requestAnimationFrame;

            expect(() => {
                render(<FooterBeamBackground />);
            }).not.toThrow();
        });

        test('should handle performance API errors gracefully', () => {
            mockPerformance.now.mockImplementation(() => {
                throw new Error('Performance API error');
            });

            expect(() => {
                render(<FooterBeamBackground enablePerformanceMonitoring={true} />);
            }).not.toThrow();
        });

        test('should disable animations when performance is critically low', async () => {
            render(
                <FooterBeamBackground
                    enableEmergencyFallback={true}
                    criticalFPSThreshold={10}
                />
            );

            // Simulate critically low performance
            act(() => {
                currentTime = 0;
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));

                currentTime = 200; // 5 FPS
                animationFrameCallbacks.forEach(callback => callback && callback(currentTime));
            });

            await waitFor(() => {
                const beamContainer = screen.getByTestId('beam-background');
                expect(beamContainer).toHaveClass('animations-disabled');
            });
        });
    });
});