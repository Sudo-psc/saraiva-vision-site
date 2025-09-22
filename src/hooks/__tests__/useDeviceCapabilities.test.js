import { renderHook, act } from '@testing-library/react';
import { useDeviceCapabilities } from '../useDeviceCapabilities';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock navigator properties
const mockNavigator = {
    deviceMemory: 4,
    hardwareConcurrency: 4,
    connection: {
        effectiveType: '4g',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// Mock window properties
const mockWindow = {
    innerWidth: 1920,
    innerHeight: 1080,
    matchMedia: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};

// Mock document for feature detection
const mockDocument = {
    createElement: vi.fn(() => ({
        style: {},
        getContext: vi.fn()
    }))
};

describe('useDeviceCapabilities', () => {
    beforeEach(() => {
        // Setup mocks
        Object.defineProperty(global, 'navigator', {
            value: mockNavigator,
            writable: true
        });

        Object.defineProperty(global, 'window', {
            value: mockWindow,
            writable: true
        });

        Object.defineProperty(global, 'document', {
            value: mockDocument,
            writable: true
        });

        // Mock matchMedia
        mockWindow.matchMedia.mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        });

        // Reset mocks
        vi.clearAllMocks();
    });

    it('should detect device capabilities correctly', () => {
        // Mock CSS feature support
        mockDocument.createElement.mockReturnValue({
            style: {
                backdropFilter: '',
                transform: ''
            }
        });

        const { result } = renderHook(() => useDeviceCapabilities());

        expect(result.current.capabilities).toMatchObject({
            deviceMemory: 4,
            hardwareConcurrency: 4,
            connectionType: '4g',
            isMobile: false,
            isTablet: false
        });
    });

    it('should provide appropriate performance recommendations', () => {
        const { result } = renderHook(() => useDeviceCapabilities());

        const recommendations = result.current.getPerformanceRecommendations();

        expect(recommendations).toHaveProperty('enableAnimations');
        expect(recommendations).toHaveProperty('enableComplexEffects');
        expect(recommendations).toHaveProperty('maxParticleCount');
        expect(recommendations).toHaveProperty('animationDuration');
        expect(recommendations).toHaveProperty('blurIntensity');
    });

    it('should detect CSS feature support', () => {
        // Mock backdrop-filter support
        mockDocument.createElement.mockReturnValue({
            style: {
                backdropFilter: 'blur(1px)', // Supported
                transform: 'translateZ(0)'   // Supported
            }
        });

        const { result } = renderHook(() => useDeviceCapabilities());

        expect(result.current.isSupported('backdropFilter')).toBe(true);
        expect(result.current.isSupported('transform3D')).toBe(true);
    });
});