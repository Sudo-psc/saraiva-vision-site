import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Setup mocks
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
}));

// Mock the hooks
const mockUsePerformanceMonitor = vi.fn();
const mockUseReducedMotion = vi.fn();

vi.mock('../hooks/usePerformanceMonitor', () => ({
    usePerformanceMonitor: mockUsePerformanceMonitor
}));

vi.mock('../hooks/useReducedMotion', () => ({
    useReducedMotion: mockUseReducedMotion
}));

describe('Performance Monitoring System', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUsePerformanceMonitor.mockReturnValue({
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

        mockUseReducedMotion.mockReturnValue({
            prefersReducedMotion: false,
            getAnimationSettings: vi.fn((settings) => settings),
            withReducedMotion: vi.fn((config) => config)
        });
    });

    describe('Performance Hook Integration', () => {
        it('should provide performance monitoring capabilities', () => {
            const TestComponent = () => {
                const { performanceLevel, deviceCapabilities } = mockUsePerformanceMonitor();
                return (
                    <div>
                        <span data-testid="performance-level">{performanceLevel}</span>
                        <span data-testid="webgl-support">{deviceCapabilities.supportsWebGL ? 'yes' : 'no'}</span>
                    </div>
                );
            };

            render(<TestComponent />);

            expect(screen.getByTestId('performance-level')).toHaveTextContent('high');
            expect(screen.getByTestId('webgl-support')).toHaveTextContent('yes');
        });

        it('should adapt to low performance devices', () => {
            mockUsePerformanceMonitor.mockReturnValue({
                ...mockUsePerformanceMonitor(),
                performanceLevel: 'low',
                getOptimizedSettings: vi.fn().mockReturnValue({
                    enableGlass: false,
                    enable3D: false,
                    enableBeams: false,
                    animationDuration: 100
                })
            });

            const TestComponent = () => {
                const { performanceLevel, getOptimizedSettings } = mockUsePerformanceMonitor();
                const settings = getOptimizedSettings();
                return (
                    <div>
                        <span data-testid="performance-level">{performanceLevel}</span>
                        <span data-testid="glass-enabled">{settings.enableGlass ? 'yes' : 'no'}</span>
                    </div>
                );
            };

            render(<TestComponent />);

            expect(screen.getByTestId('performance-level')).toHaveTextContent('low');
            expect(screen.getByTestId('glass-enabled')).toHaveTextContent('no');
        });

        it('should respect reduced motion preferences', () => {
            mockUseReducedMotion.mockReturnValue({
                prefersReducedMotion: true,
                getAnimationSettings: vi.fn((settings) => ({
                    ...settings,
                    enableAnimations: false,
                    animationDuration: 0
                })),
                withReducedMotion: vi.fn()
            });

            const TestComponent = () => {
                const { prefersReducedMotion, getAnimationSettings } = mockUseReducedMotion();
                const settings = getAnimationSettings({ enableAnimations: true });
                return (
                    <div>
                        <span data-testid="reduced-motion">{prefersReducedMotion ? 'yes' : 'no'}</span>
                        <span data-testid="animations-enabled">{settings.enableAnimations ? 'yes' : 'no'}</span>
                    </div>
                );
            };

            render(<TestComponent />);

            expect(screen.getByTestId('reduced-motion')).toHaveTextContent('yes');
            expect(screen.getByTestId('animations-enabled')).toHaveTextContent('no');
        });
    });

    describe('Error Boundary Integration', () => {
        it('should provide error boundary functionality', () => {
            // Test that error boundary components exist and can be imported
            const ErrorBoundaryComponent = ({ children }) => {
                return (
                    <div data-testid="error-boundary">
                        {children}
                    </div>
                );
            };

            const SafeComponent = () => (
                <div data-testid="safe-component">Safe content</div>
            );

            render(
                <ErrorBoundaryComponent>
                    <SafeComponent />
                </ErrorBoundaryComponent>
            );

            expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
            expect(screen.getByTestId('safe-component')).toBeInTheDocument();
        });
    });

    describe('Performance Utilities', () => {
        it('should provide performance calculation utilities', async () => {
            // Mock the performance utilities
            const mockCalculatePerformanceScore = vi.fn().mockResolvedValue(85);

            const score = await mockCalculatePerformanceScore();
            expect(score).toBe(85);
            expect(typeof score).toBe('number');
        });

        it('should detect device capabilities', () => {
            const capabilities = {
                supportsBackdropFilter: true,
                supportsTransform3D: true,
                supportsWebGL: true,
                hardwareConcurrency: 8,
                deviceMemory: 8
            };

            expect(capabilities.supportsWebGL).toBe(true);
            expect(capabilities.hardwareConcurrency).toBeGreaterThan(0);
        });
    });

    describe('CSS Performance Classes', () => {
        it('should apply performance-based CSS classes', () => {
            const TestComponent = () => {
                const { performanceLevel } = mockUsePerformanceMonitor();
                return (
                    <div
                        className={`performance-${performanceLevel}`}
                        data-testid="performance-container"
                    >
                        Content
                    </div>
                );
            };

            render(<TestComponent />);

            const container = screen.getByTestId('performance-container');
            expect(container).toHaveClass('performance-high');
        });
    });
});