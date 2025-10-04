import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  DeviceCapabilitiesReturn,
  DeviceCapabilities,
  PerformanceRecommendations,
  DeviceFeature,
} from '@/types/performance';

/**
 * Hook for detecting device capabilities and implementing graceful degradation
 *
 * @returns Device capabilities, performance recommendations, and feature support checks
 *
 * @example
 * ```tsx
 * const { capabilities, getPerformanceRecommendations, isSupported } = useDeviceCapabilities();
 *
 * if (capabilities.isLowEndDevice) {
 *   // Disable expensive effects
 * }
 *
 * if (isSupported('backdropFilter')) {
 *   // Use backdrop-filter
 * }
 * ```
 */
export const useDeviceCapabilities = (): DeviceCapabilitiesReturn => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    supportsBackdropFilter: false,
    supportsTransform3D: false,
    supportsWebGL: false,
    supportsIntersectionObserver: false,
    supportsPerformanceObserver: false,
    deviceMemory: null,
    hardwareConcurrency: null,
    connectionType: null,
    isLowEndDevice: false,
    isMobile: false,
    isTablet: false,
    preferredColorScheme: 'light',
  });

  // Test CSS backdrop-filter support
  const testBackdropFilter = useCallback((): boolean => {
    const testElement = document.createElement('div');
    testElement.style.backdropFilter = 'blur(1px)';
    return testElement.style.backdropFilter !== '';
  }, []);

  // Test CSS 3D transform support
  const testTransform3D = useCallback((): boolean => {
    const testElement = document.createElement('div');
    testElement.style.transform = 'translateZ(0)';
    return testElement.style.transform !== '';
  }, []);

  // Test WebGL support
  const testWebGL = useCallback((): boolean => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (error) {
      return false;
    }
  }, []);

  // Detect device type based on screen size and user agent
  const detectDeviceType = useCallback((): { isMobile: boolean; isTablet: boolean } => {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();

    const isMobile =
      width < 768 ||
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = width >= 768 && width < 1024 && /ipad|android/i.test(userAgent);

    return { isMobile, isTablet };
  }, []);

  // Determine if device is low-end based on various factors
  const isLowEndDevice = useMemo(() => {
    const factors: string[] = [];

    // Memory-based detection
    if (capabilities.deviceMemory && capabilities.deviceMemory <= 2) {
      factors.push('lowMemory');
    }

    // CPU-based detection
    if (capabilities.hardwareConcurrency && capabilities.hardwareConcurrency <= 2) {
      factors.push('lowCPU');
    }

    // Connection-based detection
    if (
      capabilities.connectionType &&
      ['slow-2g', '2g', '3g'].includes(capabilities.connectionType)
    ) {
      factors.push('slowConnection');
    }

    // Mobile device detection
    if (capabilities.isMobile) {
      factors.push('mobile');
    }

    // Feature support detection
    if (!capabilities.supportsWebGL || !capabilities.supportsTransform3D) {
      factors.push('limitedFeatures');
    }

    // Consider low-end if 2 or more factors are present
    return factors.length >= 2;
  }, [capabilities]);

  // Get performance recommendations based on capabilities
  const getPerformanceRecommendations = useCallback((): PerformanceRecommendations => {
    const recommendations: PerformanceRecommendations = {
      enableAnimations: true,
      enableComplexEffects: true,
      enableBackdropFilter: capabilities.supportsBackdropFilter,
      enable3DTransforms: capabilities.supportsTransform3D,
      enableWebGLEffects: capabilities.supportsWebGL,
      maxParticleCount: 50,
      animationDuration: 300,
      blurIntensity: 20,
    };

    if (isLowEndDevice) {
      recommendations.enableComplexEffects = false;
      recommendations.maxParticleCount = 10;
      recommendations.animationDuration = 150;
      recommendations.blurIntensity = 5;
    } else if (capabilities.isMobile) {
      recommendations.maxParticleCount = 25;
      recommendations.animationDuration = 200;
      recommendations.blurIntensity = 10;
    }

    return recommendations;
  }, [capabilities, isLowEndDevice]);

  // Check if specific feature is supported
  const isSupported = useCallback(
    (feature: DeviceFeature): boolean => {
      switch (feature) {
        case 'backdropFilter':
          return capabilities.supportsBackdropFilter;
        case 'transform3D':
          return capabilities.supportsTransform3D;
        case 'webgl':
          return capabilities.supportsWebGL;
        case 'intersectionObserver':
          return capabilities.supportsIntersectionObserver;
        case 'performanceObserver':
          return capabilities.supportsPerformanceObserver;
        default:
          return false;
      }
    },
    [capabilities]
  );

  // Initialize capability detection
  useEffect(() => {
    const detectCapabilities = () => {
      const deviceType = detectDeviceType();

      // Get device memory (Navigator interface extension)
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: any };

      setCapabilities({
        supportsBackdropFilter: testBackdropFilter(),
        supportsTransform3D: testTransform3D(),
        supportsWebGL: testWebGL(),
        supportsIntersectionObserver: typeof IntersectionObserver !== 'undefined',
        supportsPerformanceObserver: typeof PerformanceObserver !== 'undefined',
        deviceMemory: nav.deviceMemory || null,
        hardwareConcurrency: navigator.hardwareConcurrency || null,
        connectionType: nav.connection?.effectiveType || null,
        isLowEndDevice: false, // Will be calculated in useMemo
        isMobile: deviceType.isMobile,
        isTablet: deviceType.isTablet,
        preferredColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      });
    };

    detectCapabilities();

    // Listen for connection changes
    const nav = navigator as Navigator & { connection?: any };
    if (nav.connection) {
      nav.connection.addEventListener('change', detectCapabilities);
    }

    // Listen for color scheme changes
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      setCapabilities((prev) => ({
        ...prev,
        preferredColorScheme: e.matches ? 'dark' : 'light',
      }));
    };

    colorSchemeQuery.addEventListener('change', handleColorSchemeChange);

    // Listen for resize events to update device type
    const handleResize = () => {
      const deviceType = detectDeviceType();
      setCapabilities((prev) => ({
        ...prev,
        isMobile: deviceType.isMobile,
        isTablet: deviceType.isTablet,
      }));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (nav.connection) {
        nav.connection.removeEventListener('change', detectCapabilities);
      }
      colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [detectDeviceType, testBackdropFilter, testTransform3D, testWebGL]);

  // Update isLowEndDevice when capabilities change
  useEffect(() => {
    setCapabilities((prev) => ({
      ...prev,
      isLowEndDevice,
    }));
  }, [isLowEndDevice]);

  return {
    capabilities: {
      ...capabilities,
      isLowEndDevice,
    },
    getPerformanceRecommendations,
    isSupported,
  };
};

export default useDeviceCapabilities;
