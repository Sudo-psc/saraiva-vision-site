/**
 * Performance utilities for animation optimization
 * Implements graceful degradation and performance monitoring
 */

// Debounce function for performance-sensitive operations
export const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
};

// Throttle function for scroll and resize events
export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Check if device supports hardware acceleration
export const supportsHardwareAcceleration = () => {
    const testElement = document.createElement('div');
    testElement.style.transform = 'translateZ(0)';
    testElement.style.backfaceVisibility = 'hidden';
    testElement.style.perspective = '1000px';

    document.body.appendChild(testElement);
    const computedStyle = window.getComputedStyle(testElement);
    const hasTransform = computedStyle.transform !== 'none';
    document.body.removeChild(testElement);

    return hasTransform;
};

// Detect GPU capabilities
export const getGPUCapabilities = () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        return { tier: 'none', renderer: 'software' };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ?
        gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) :
        'unknown';

    // Simple GPU tier detection based on renderer string
    const lowEndGPUs = ['intel', 'integrated', 'software', 'llvmpipe'];
    const isLowEnd = lowEndGPUs.some(gpu =>
        renderer.toLowerCase().includes(gpu)
    );

    return {
        tier: isLowEnd ? 'low' : 'high',
        renderer,
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
    };
};

// Memory usage monitoring
export const getMemoryUsage = () => {
    if ('memory' in performance) {
        return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
        };
    }
    return null;
};

// Battery status detection
export const getBatteryStatus = async () => {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return {
                charging: battery.charging,
                level: battery.level,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
            };
        } catch (e) {
            return null;
        }
    }
    return null;
};

// Network connection quality
export const getConnectionQuality = () => {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        return {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
    }
    return null;
};

// Performance score calculation
export const calculatePerformanceScore = async () => {
    const gpu = getGPUCapabilities();
    const memory = getMemoryUsage();
    const battery = await getBatteryStatus();
    const connection = getConnectionQuality();
    const hardwareAccel = supportsHardwareAcceleration();

    let score = 100;

    // GPU tier impact
    if (gpu.tier === 'low') score -= 30;
    if (gpu.tier === 'none') score -= 50;

    // Memory usage impact
    if (memory && memory.percentage > 80) score -= 20;
    if (memory && memory.percentage > 90) score -= 30;

    // Battery impact
    if (battery && !battery.charging && battery.level < 0.2) score -= 15;

    // Connection impact
    if (connection) {
        if (connection.effectiveType === 'slow-2g') score -= 25;
        if (connection.effectiveType === '2g') score -= 15;
        if (connection.saveData) score -= 10;
    }

    // Hardware acceleration impact
    if (!hardwareAccel) score -= 20;

    // Device concurrency impact
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) score -= 15;

    return Math.max(0, Math.min(100, score));
};

// Animation frame scheduler with priority
export class AnimationScheduler {
    constructor() {
        this.tasks = [];
        this.isRunning = false;
        this.frameId = null;
    }

    addTask(task, priority = 0) {
        this.tasks.push({ task, priority, id: Date.now() + Math.random() });
        this.tasks.sort((a, b) => b.priority - a.priority);

        if (!this.isRunning) {
            this.start();
        }
    }

    removeTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.tick();
    }

    stop() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    tick() {
        if (!this.isRunning) return;

        const frameStart = performance.now();
        const frameTime = 16.67; // Target 60fps

        // Execute tasks within frame budget
        while (this.tasks.length > 0 && (performance.now() - frameStart) < frameTime * 0.8) {
            const { task } = this.tasks.shift();
            try {
                task();
            } catch (error) {
                console.error('Animation task error:', error);
            }
        }

        if (this.tasks.length > 0) {
            this.frameId = requestAnimationFrame(() => this.tick());
        } else {
            this.isRunning = false;
        }
    }
}

// Global animation scheduler instance
export const animationScheduler = new AnimationScheduler();

// CSS custom properties for performance settings
export const applyPerformanceCSS = (performanceLevel) => {
    const root = document.documentElement;

    const settings = {
        high: {
            '--animation-duration': '300ms',
            '--glass-blur': '20px',
            '--glass-opacity': '0.1',
            '--beam-particles': '50',
            '--transform-3d': 'translateZ(0)',
            '--will-change': 'transform, opacity'
        },
        medium: {
            '--animation-duration': '200ms',
            '--glass-blur': '10px',
            '--glass-opacity': '0.15',
            '--beam-particles': '25',
            '--transform-3d': 'translateZ(0)',
            '--will-change': 'transform'
        },
        low: {
            '--animation-duration': '100ms',
            '--glass-blur': '5px',
            '--glass-opacity': '0.2',
            '--beam-particles': '10',
            '--transform-3d': 'none',
            '--will-change': 'auto'
        }
    };

    const levelSettings = settings[performanceLevel] || settings.medium;

    Object.entries(levelSettings).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
};