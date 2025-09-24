import { renderHook } from '@testing-library/react';
import { useFooterPerformanceOptimization } from '../useFooterPerformanceOptimization';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the individual hooks
vi.mock('../usePerformanceMonitor');
vi.mock('../useDeviceCapabilities');
vi.mock('../useReducedMotion');

import { usePerformanceMonitor } from '../usePerformanceMonitor';
import { useDeviceCapabilities } from '../useDeviceCapabilities';
import { useReducedMotion } from '../useReducedMotion';

describe('useFooterPerformanceOptimization', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        usePerformanceMonitor.mockReturnValue({
            performanceLevel: 'high',
            currentFPS: 60,
            getOptimizedSettings: () => ({
                glassBlur: 20,
                glassOpacity: 0.1,
                beamParticleCount: 50,
                animationDuration: 300,
                enableComplexAnimations: true,
                enable3DTransforms: true,
                enableBackdropFilter: true
            }),
            setManualPerformanceLevel: vi.fn()
        });

        useDeviceCapabilities.mockReturnValue({
            capabilities: {
                supportsBackdropFilter: true,
                supportsTransform3D: true,
                isLowEndDevice: false,
                isMobile: false
            },
            getPerformanceRecommendations: () => ({
                enableBackdropFilter: true,
                enable3DTransforms: true
            })
        });

        useReducedMotion.mockReturnValue({
            prefersReducedMotion: false,
            getAnimationSettings: () => ({ animate: true }),
            getMotionCSSProperties: () => ({
                '--animation-duration': '0.3s'
            })
        });
    });

    it('should initialize with optimal settings', () => {
        const { result } = renderHook(() => useFooterPerformanceOptimization());

        expect(result.current.optimizationLevel).toBe('full');
        expect(result.current.isOptimal).toBe(true);
    });
});