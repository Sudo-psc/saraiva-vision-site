import { useState, useEffect, useCallback, useRef } from 'react';

export const useBeamPerformance = (options = {}) => {
    const {
        adaptiveQuality = true,
        targetFrameRate = 60,
        thresholds = {
            high: 50, // 50fps for high performance
            medium: 30 // 30fps for medium performance
        }
    } = options;

    const [frameRate, setFrameRate] = useState(60);
    const [performanceLevel, setPerformanceLevel] = useState('high');
    const [isOptimized, setIsOptimized] = useState(true);
    const [adaptiveQuality, setAdaptiveQuality] = useState('high');
    const [batteryOptimized, setBatteryOptimized] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(false);

    const performanceObserverRef = useRef(null);
    const frameTimesRef = useRef([]);
    const lastFrameTimeRef = useRef(performance.now());

    // Calculate frame rate from frame times
    const calculateFrameRate = useCallback((frameTimes) => {
        if (frameTimes.length === 0) return 60;

        const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
        return Math.round(1000 / avgFrameTime);
    }, []);

    // Update performance level based on frame rate
    const updatePerformanceLevel = useCallback((currentFrameRate) => {
        let newLevel = 'low';
        let newOptimized = false;
        let newAdaptiveQuality = 'low';

        if (currentFrameRate >= thresholds.high) {
            newLevel = 'high';
            newOptimized = true;
            newAdaptiveQuality = 'high';
        } else if (currentFrameRate >= thresholds.medium) {
            newLevel = 'medium';
            newOptimized = true;
            newAdaptiveQuality = 'medium';
        }

        setPerformanceLevel(newLevel);
        setIsOptimized(newOptimized);
        if (adaptiveQuality) {
            setAdaptiveQuality(newAdaptiveQuality);
        }
    }, [thresholds, adaptiveQuality]);

    // Start performance monitoring
    const startMonitoring = useCallback(() => {
        if (isMonitoring || !window.PerformanceObserver) return;

        try {
            performanceObserverRef.current = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const frameTimes = entries.map(entry => entry.duration);

                frameTimesRef.current = [...frameTimesRef.current, ...frameTimes].slice(-10); // Keep last 10 frames

                const currentFrameRate = calculateFrameRate(frameTimesRef.current);
                setFrameRate(currentFrameRate);
                updatePerformanceLevel(currentFrameRate);
            });

            performanceObserverRef.current.observe({ entryTypes: ['measure'] });
            setIsMonitoring(true);
        } catch (error) {
            console.warn('Performance monitoring not available:', error);
        }
    }, [isMonitoring, calculateFrameRate, updatePerformanceLevel]);

    // Stop performance monitoring
    const stopMonitoring = useCallback(() => {
        if (performanceObserverRef.current) {
            performanceObserverRef.current.disconnect();
            performanceObserverRef.current = null;
            setIsMonitoring(false);
        }
    }, []);

    // Get optimized beam settings based on performance
    const getOptimizedBeamSettings = useCallback(() => {
        const baseSettings = {
            high: {
                particleCount: 50,
                animationSpeed: 1,
                blurIntensity: 20,
                enableGlow: true,
                enableTrails: true,
                quality: 'high'
            },
            medium: {
                particleCount: 25,
                animationSpeed: 0.8,
                blurIntensity: 15,
                enableGlow: true,
                enableTrails: false,
                quality: 'medium'
            },
            low: {
                particleCount: 10,
                animationSpeed: 0.5,
                blurIntensity: 5,
                enableGlow: false,
                enableTrails: false,
                quality: 'low'
            }
        };

        let settings = baseSettings[performanceLevel] || baseSettings.low;

        // Further reduce if battery is low
        if (batteryOptimized) {
            settings = {
                ...settings,
                particleCount: Math.floor(settings.particleCount * 0.5),
                animationSpeed: settings.animationSpeed * 0.7,
                enableGlow: false,
                enableTrails: false
            };
        }

        // Memory usage adjustment
        const memoryUsage = getMemoryUsage();
        if (memoryUsage.isHigh) {
            settings = {
                ...settings,
                particleCount: Math.floor(settings.particleCount * 0.7)
            };
        }

        return settings;
    }, [performanceLevel, batteryOptimized]);

    // Get memory usage information
    const getMemoryUsage = useCallback(() => {
        if (!performance.memory) {
            return { percentage: 0, isHigh: false };
        }

        const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
        const percentage = Math.round((usedJSHeapSize / totalJSHeapSize) * 100);
        const isHigh = percentage > 75;

        return { percentage, isHigh };
    }, []);

    // Check battery level and adjust accordingly
    const checkBatteryLevel = useCallback(async () => {
        if (!navigator.getBattery) return;

        try {
            const battery = await navigator.getBattery();
            const shouldOptimize = battery.level < 0.2 && !battery.charging;
            setBatteryOptimized(shouldOptimize);
        } catch (error) {
            console.warn('Battery API not available:', error);
        }
    }, []);

    // Initialize monitoring on mount
    useEffect(() => {
        startMonitoring();
        checkBatteryLevel();

        return () => {
            stopMonitoring();
        };
    }, [startMonitoring, stopMonitoring, checkBatteryLevel]);

    // Battery level monitoring - optimized to check every 5 minutes instead of every minute
    useEffect(() => {
        const interval = setInterval(checkBatteryLevel, 300000); // Check every 5 minutes
        return () => clearInterval(interval);
    }, [checkBatteryLevel]);

    return {
        frameRate,
        performanceLevel,
        isOptimized,
        adaptiveQuality,
        batteryOptimized,
        isMonitoring,
        startMonitoring,
        stopMonitoring,
        getOptimizedBeamSettings,
        getMemoryUsage,
        checkBatteryLevel
    };
};