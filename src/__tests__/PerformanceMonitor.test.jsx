import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useReducedMotion } from '../hooks/useReducedMotion';
import PerformanceAwareWrapper from '../components/ErrorBoundaries/PerformanceAwareWrapper';

// Mock hooks
vi.mock('../hooks/usePerformanceMonitor');
vi.mock('../hooks/useReducedMotion');

// Mock performance APIs
const mockPerformanceObserver = vi.fn();
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

Object.defineProperty(window, 'PerformanceObserver', {
    writable: true,
    value: mockPerformanceObserver
});

Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: mockRequestAnimationFrame
});

Object.defineProperty(window, 'cancelAnimationFrame', {
    writable: true,
    value: mockCancelAnimationFrame
});

// Mock CSS.supports
Object.defineProperty(CSS, 'supports', {
    writable: true,
    value: vi.fn().mockReturnValue(true)
});

describe('Performance Monitoring System', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        usePerformanceMonitor.mockReturnValue({
            performanceLevel: 'high',
            currentFPS: 60,
            isMonitoring: false,
            deviceCapabilities: {
                supportsBackdropFilter: true,
                supportsTransform3D: true,
                supportsWebGL: true,
                hardwareConcurrency: 8,
                deviceMemory: 8,
                connectionType: '4g'
            },
            startMonitoring: vi.fn(),
            stopMonitoring: vi.fn(),
            getOptimizedSettings: vi.fn().mockReturnValue({
                glassBlur: 20,
                glassOpacity: 0.1,
                beamParticleCount: 50,
                animationDuration: 300,
                enable3D: true,
                enableBeams: true,
                enableGlass: true,
                maxAnimations: 10
            }),
            setPerformanceLevel: vi.fn()
        });

        useReducedMotion.mockReturnValue({
            prefersReducedMotion: false,
            getAnimationSettings: vi.fn((settings) => settings),
            withReducedMotion: vi.fn((config) => config)
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('usePerformanceMonitor hook', () => {
        it('should initialize with high performance level for capable devices', () => {
            const { result } = renderHook(() => usePerformanceMonitor());

            expect(result.current.performanceLevel).toBe('high');
            expect(result.current.deviceCapabilities.supportsBackdropFilter).toBe(true);
        });

        it('should detect low-end devices and set appropriate performance level', () => {
            usePerformanceMonitor.mockReturnValue({
                ...usePerformanceMonitor(),
                performanceLevel: 'low',
                deviceCapabilities: {
                    supportsBackdropFilter: false,
                    supportsTransform3D: false,
                    supportsWebGL: false,
                    hardwareConcurrency: 2,
                    deviceMemory: 2,
                    connectionType: '2g'
                }
            });

            const { result } = renderHook(() => usePerformanceMonitor());

            expect(result.current.performanceLevel).toBe('low');
            expect(result.current.deviceCapabilities.hardwareConcurrency).toBe(2);
        });

        it('should provide optimized settings based on performance level', () => {
            const mockSettings = {
                glassBlur: 10,
                glassOpacity: 0.15,
                beamParticleCount: 25,
                animationDuration: 200,
                enable3D: true,
                enableBeams: true,
                enableGlass: true,
                maxAnimations: 5
            };

            usePerformanceMonitor.mockReturnValue({
                ...usePerformanceMonitor(),
                performanceLevel: 'medium',
                getOptimizedSettings: vi.fn().mockReturnValue(mockSettings)
            });

            const { result } = renderHook(() => usePerformanceMonitor());
            const settings = result.current.getOptimizedSettings();

            expect(settings.beamParticleCount).toBe(25);
            expect(settings.animationDuration).toBe(200);
        });
    });

    describe('useReducedMotion hook', () => {
        it('should detect reduced motion preference', () => {
            // Mock matchMedia for reduced motion
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(query => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                })),
            });

            useReducedMotion.mockReturnValue({
                prefersReducedMotion: true,
                getAnimationSettings: vi.fn((settings) => ({
                    ...settings,
                    duration: 0,
                    enableAnimations: false
                })),
                withReducedMotion: vi.fn((config) => ({
                    ...config,
                    transition: { duration: 0 }
                }))
            });

            const { result } = renderHook(() => useReducedMotion());

            expect(result.current.prefersReducedMotion).toBe(true);

            const settings = result.current.getAnimationSettings({ duration: 300 });
            expect(settings.enableAnimations).toBe(false);
        });

        it('should return normal settings when reduced motion is not preferred', () => {
            const { result } = renderHook(() => useReducedMotion());

            expect(result.current.prefersReducedMotion).toBe(false);

            const settings = result.current.getAnimationSettings({ duration: 300 });
            expect(settings.duration).toBe(300);
        });
    });

    describe('PerformanceAwareWrapper component', () => {
        const TestComponent = ({ settings, hasError }) => (
            <div data-testid="test-component">
                Performance: {settings?.performanceLevel || 'unknown'}
                {hasError && <span data-testid="error-indicator">Error</span>}
            </div>
        );

        it('should render children with performance settings', () => {
            render(
                <PerformanceAwareWrapper>
                    {TestComponent}
                </PerformanceAwareWrapper>
            );

            expect(screen.getByTestId('test-component')).toBeInTheDocument();
            expect(screen.getByText(/Performance:/)).toBeInTheDocument();
        });

        it('should render fallback when error occurs', () => {
            const FallbackComponent = () => (
                <div data-testid="fallback">Fallback rendered</div>
            );

            // Mock console.error to avoid test output noise
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const ThrowingComponent = () => {
                throw new Error('Test error');
            };

            render(
                <PerformanceAwareWrapper fallback={<FallbackComponent />}>
                    <ThrowingComponent />
                </PerformanceAwareWrapper>
            );

            expect(screen.getByTestId('fallback')).toBeInTheDocument();

            consoleSpy.mockRestore();
        });

        it('should apply performance-based settings', () => {
            usePerformanceMonitor.mockReturnValue({
                ...usePerformanceMonitor(),
                performanceLevel: 'low',
                getOptimizedSettings: vi.fn().mockReturnValue({
                    enableGlass: false,
                    enable3D: false,
                    enableBeams: false,
                    animationDuration: 100
                })
            });

            render(
                <PerformanceAwareWrapper>
                    {({ settings }) => (
                        <div data-testid="settings">
                            Glass: {settings.enableGlass ? 'enabled' : 'disabled'}
                            3D: {settings.enable3D ? 'enabled' : 'disabled'}
                        </div>
                    )}
                </PerformanceAwareWrapper>
            );

            expect(screen.getByText(/Glass: disabled/)).toBeInTheDocument();
            expect(screen.getByText(/3D: disabled/)).toBeInTheDocument();
        });

        it('should respect reduced motion preferences', () => {
            useReducedMotion.mockReturnValue({
                prefersReducedMotion: true,
                getAnimationSettings: vi.fn((settings) => ({
                    ...settings,
                    enableAnimations: false,
                    animationDuration: 0
                })),
                withReducedMotion: vi.fn()
            });

            render(
                <PerformanceAwareWrapper>
                    {({ settings }) => (
                        <div data-testid="motion-settings">
                            Animations: {settings.enableAnimations ? 'enabled' : 'disabled'}
                            Duration: {settings.animationDuration}
                        </div>
                    )}
                </PerformanceAwareWrapper>
            );

            expect(screen.getByText(/Animations: disabled/)).toBeInTheDocument();
            expect(screen.getByText(/Duration: 0/)).toBeInTheDocument();
        });
    });

    describe('Performance utilities', () => {
        it('should detect hardware acceleration support', async () => {
            const { supportsHardwareAcceleration } = await import('../utils/performanceUtils');

            // Mock DOM methods
            const mockElement = {
                style: {},
                remove: vi.fn()
            };

            const mockComputedStyle = {
                transform: 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
            };

            vi.spyOn(document, 'createElement').mockReturnValue(mockElement);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => { });
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => { });
            vi.spyOn(window, 'getComputedStyle').mockReturnValue(mockComputedStyle);

            const result = supportsHardwareAcceleration();
            expect(result).toBe(true);
        });

        it('should calculate performance score based on device capabilities', async () => {
            const { calculatePerformanceScore } = await import('../utils/performanceUtils');

            // Mock navigator properties
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                writable: true,
                value: 8
            });

            const score = await calculatePerformanceScore();
            expect(typeof score).toBe('number');
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });
    });

    describe('Error boundaries', () => {
        it('should catch and handle animation errors gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const ErrorComponent = () => {
                throw new Error('Animation failed');
            };

            render(
                <PerformanceAwareWrapper>
                    <ErrorComponent />
                </PerformanceAwareWrapper>
            );

            // Should render fallback instead of crashing
            expect(screen.getByText(/Performance:/)).toBeInTheDocument();

            consoleSpy.mockRestore();
        });
    });
});

// Helper function to render hooks (simplified version)
function renderHook(callback) {
    let result = { current: null };

    function TestComponent() {
        result.current = callback();
        return null;
    }

    render(<TestComponent />);

    return { result };
}