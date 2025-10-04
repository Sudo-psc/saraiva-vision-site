/**
 * Performance Monitoring Type Definitions
 * Core Web Vitals, FPS tracking, and device capabilities
 */

// ==================== Core Web Vitals ====================

export type WebVitalMetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

export interface WebVitalMetric {
  name: WebVitalMetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender';
}

export interface WebVitalsReport {
  CLS?: WebVitalMetric;
  FCP?: WebVitalMetric;
  FID?: WebVitalMetric;
  INP?: WebVitalMetric;
  LCP?: WebVitalMetric;
  TTFB?: WebVitalMetric;
  timestamp: number;
}

// ==================== Performance Monitoring ====================

export type PerformanceLevel = 'high' | 'medium' | 'low';

export interface PerformanceMonitorOptions {
  targetFPS?: number;
  degradationThreshold?: number;
  criticalThreshold?: number;
  sampleSize?: number;
  enableAutoAdjustment?: boolean;
}

export interface PerformanceMetrics {
  targetFPS: number;
  currentFPS: number;
  performanceLevel: PerformanceLevel;
  isOptimal: boolean;
}

export interface OptimizedSettings {
  glassBlur: number;
  glassOpacity: number;
  beamParticleCount: number;
  animationDuration: number;
  enableComplexAnimations: boolean;
  enable3DTransforms: boolean;
  enableBackdropFilter: boolean;
}

export interface PerformanceMonitorReturn {
  performanceLevel: PerformanceLevel;
  currentFPS: number;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  setManualPerformanceLevel: (level: PerformanceLevel) => void;
  getOptimizedSettings: () => OptimizedSettings;
  metrics: PerformanceMetrics;
}

// ==================== Device Capabilities ====================

export interface DeviceCapabilities {
  supportsBackdropFilter: boolean;
  supportsTransform3D: boolean;
  supportsWebGL: boolean;
  supportsIntersectionObserver: boolean;
  supportsPerformanceObserver: boolean;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
  connectionType: string | null;
  isLowEndDevice: boolean;
  isMobile: boolean;
  isTablet: boolean;
  preferredColorScheme: 'light' | 'dark';
}

export interface PerformanceRecommendations {
  enableAnimations: boolean;
  enableComplexEffects: boolean;
  enableBackdropFilter: boolean;
  enable3DTransforms: boolean;
  enableWebGLEffects: boolean;
  maxParticleCount: number;
  animationDuration: number;
  blurIntensity: number;
}

export type DeviceFeature =
  | 'backdropFilter'
  | 'transform3D'
  | 'webgl'
  | 'intersectionObserver'
  | 'performanceObserver';

export interface DeviceCapabilitiesReturn {
  capabilities: DeviceCapabilities;
  getPerformanceRecommendations: () => PerformanceRecommendations;
  isSupported: (feature: DeviceFeature) => boolean;
}

// ==================== Reduced Motion ====================

export interface AnimationSettings {
  duration?: number;
  delay?: number;
  transition?: string;
  animate?: boolean;
  enableParticles?: boolean;
  enableTransforms?: boolean;
  enableBlur?: boolean;
  enableOpacityChanges?: boolean;
  enableColorChanges?: boolean;
}

export interface MotionCSSProperties {
  '--animation-duration': string;
  '--animation-delay': string;
  '--transition-duration': string;
  '--transform-scale': string;
  '--transform-rotate': string;
  '--transform-translate': string;
  '--blur-amount': string;
  '--particle-count': string;
}

export type AnimationType = 'default' | 'fade' | 'opacity' | 'color' | 'transform' | 'scale';

export interface ReducedMotionReturn {
  prefersReducedMotion: boolean;
  isInitialized: boolean;
  getAnimationSettings: (defaultSettings?: AnimationSettings) => AnimationSettings;
  getMotionCSSProperties: () => MotionCSSProperties;
  shouldAnimate: (animationType?: AnimationType) => boolean;
  getMotionVariants: (variants?: Record<string, any>) => Record<string, any>;
  getSafeAnimationConfig: (config?: Record<string, any>) => Record<string, any>;
  isMotionSafe: boolean;
  isReady: boolean;
}

// ==================== Performance Optimization ====================

export type OptimizationLevel = 'full' | 'optimized' | 'reduced' | 'minimal';

export interface OptimizationState {
  level: OptimizationLevel;
  reason: string;
  timestamp: number;
}

export interface FooterPerformanceOptions {
  enableAutoOptimization?: boolean;
  aggressiveOptimization?: boolean;
  debugMode?: boolean;
}

export interface ComponentProps {
  enableGlassEffect: boolean;
  enable3DTransforms: boolean;
  enableBeamBackground: boolean;
  enableComplexAnimations: boolean;
  glassBlur: number;
  glassOpacity: number;
  beamParticleCount: number;
  animationDuration: number;
  performanceLevel: PerformanceLevel;
  optimizationLevel: OptimizationLevel;
  reducedMotion: boolean;
}

export interface CSSPropertiesExtended extends React.CSSProperties {
  '--footer-glass-blur'?: string;
  '--footer-glass-opacity'?: string | number;
  '--footer-beam-particles'?: string | number;
  '--footer-animation-duration'?: string;
  '--footer-enable-backdrop-filter'?: string;
  '--footer-enable-3d-transforms'?: string;
  '--footer-optimization-level'?: string;
}

export interface DebugInfo {
  performanceMonitor: {
    level: PerformanceLevel;
    fps: number;
    isMonitoring: boolean;
  };
  deviceCapabilities: DeviceCapabilities;
  reducedMotion: {
    prefersReducedMotion: boolean;
    isInitialized: boolean;
  };
  optimization: OptimizationState;
  settings: OptimizedSettings;
}

export type EffectName = 'glass' | '3d' | 'beams' | 'animations';

export interface FooterPerformanceReturn {
  optimizationLevel: OptimizationLevel;
  optimizationState: OptimizationState;
  getOptimalSettings: () => OptimizedSettings;
  getCSSProperties: () => CSSPropertiesExtended;
  getComponentProps: () => ComponentProps;
  performanceMonitor: PerformanceMonitorReturn;
  deviceCapabilities: DeviceCapabilitiesReturn;
  reducedMotion: ReducedMotionReturn;
  setManualOptimization: (level: PerformanceLevel) => void;
  debugInfo: DebugInfo | null;
  isOptimal: boolean;
  isMinimal: boolean;
  shouldEnableEffect: (effectName: EffectName) => boolean;
}

// ==================== Performance Budget ====================

export interface PerformanceBudget {
  maxBundleSize: number; // in KB
  maxInitialLoadTime: number; // in ms
  maxFCP: number; // First Contentful Paint in ms
  maxLCP: number; // Largest Contentful Paint in ms
  maxTTI: number; // Time to Interactive in ms
  maxTBT: number; // Total Blocking Time in ms
  maxCLS: number; // Cumulative Layout Shift (unitless)
}

export interface PerformanceBudgetViolation {
  metric: string;
  value: number;
  budget: number;
  severity: 'warning' | 'error';
  timestamp: number;
}

export interface PerformanceBudgetReport {
  violations: PerformanceBudgetViolation[];
  passed: boolean;
  timestamp: number;
}

// ==================== Long Task Detection ====================

export interface LongTask {
  duration: number;
  startTime: number;
  name: string;
}

export interface LongTaskReport {
  tasks: LongTask[];
  totalBlockingTime: number;
  averageTaskDuration: number;
  maxTaskDuration: number;
  timestamp: number;
}
