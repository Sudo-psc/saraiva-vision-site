import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import PerformanceAwareWrapper from '../ErrorBoundaries/PerformanceAwareWrapper';
import PerformanceMonitor from '../PerformanceMonitor';

/**
 * Example component demonstrating the performance monitoring system
 * Shows how components adapt based on device capabilities and user preferences
 */
const PerformanceMonitoringExample = () => {
    const [showMonitor, setShowMonitor] = useState(true);
    const [forceError, setForceError] = useState(false);

    const {
        performanceLevel,
        currentFPS,
        deviceCapabilities,
        startMonitoring,
        stopMonitoring,
        isMonitoring
    } = usePerformanceMonitor();

    const { prefersReducedMotion } = useReducedMotion();

    // Component that throws error when forced
    const PotentiallyFailingComponent = ({ settings }) => {
        if (forceError) {
            throw new Error('Simulated animation error');
        }

        return (
            <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white"
                animate={{
                    scale: settings.enableAnimations ? [1, 1.05, 1] : 1,
                    rotate: settings.enable3D ? [0, 5, -5, 0] : 0
                }}
                transition={{
                    duration: settings.animationDuration / 1000,
                    repeat: settings.enableAnimations ? Infinity : 0,
                    repeatType: "reverse"
                }}
                style={{
                    backdropFilter: settings.enableGlass ? `blur(${settings.glassBlur}px)` : 'none',
                    transform: settings.enable3D ? 'translateZ(0)' : 'none'
                }}
            >
                <h3 className="text-xl font-bold mb-2">Performance-Aware Animation</h3>
                <p className="text-sm opacity-90">
                    This component adapts its animations based on your device's capabilities
                    and your accessibility preferences.
                </p>

                <div className="mt-4 space-y-2 text-xs">
                    <div>Performance Level: <span className="font-mono">{performanceLevel}</span></div>
                    <div>Animations: <span className="font-mono">{settings.enableAnimations ? 'ON' : 'OFF'}</span></div>
                    <div>3D Effects: <span className="font-mono">{settings.enable3D ? 'ON' : 'OFF'}</span></div>
                    <div>Glass Effects: <span className="font-mono">{settings.enableGlass ? 'ON' : 'OFF'}</span></div>
                </div>
            </motion.div>
        );
    };

    // Fallback component for errors
    const ErrorFallback = () => (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h3 className="font-bold">Animation Error Detected</h3>
            <p className="text-sm">
                The animation system encountered an error and has fallen back to a safe state.
            </p>
            <button
                onClick={() => setForceError(false)}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
                Reset
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Performance Monitoring System Demo</h1>
                <p className="text-gray-600 mb-6">
                    This demo shows how the enhanced footer adapts to different device capabilities
                    and user preferences for optimal performance and accessibility.
                </p>
            </div>

            {/* Performance Monitor */}
            <PerformanceMonitor show={showMonitor} position="top-right" />

            {/* Control Panel */}
            <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-3">Controls</h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => setShowMonitor(!showMonitor)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        {showMonitor ? 'Hide' : 'Show'} Performance Monitor
                    </button>

                    <button
                        onClick={() => isMonitoring ? stopMonitoring() : startMonitoring()}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        {isMonitoring ? 'Stop' : 'Start'} Monitoring
                    </button>

                    <button
                        onClick={() => setForceError(!forceError)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        {forceError ? 'Fix' : 'Simulate'} Error
                    </button>
                </div>
            </div>

            {/* Device Capabilities */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Device Capabilities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <div className="font-medium">CPU Cores</div>
                        <div className="text-gray-600">{deviceCapabilities.hardwareConcurrency}</div>
                    </div>
                    <div>
                        <div className="font-medium">Memory</div>
                        <div className="text-gray-600">{deviceCapabilities.deviceMemory}GB</div>
                    </div>
                    <div>
                        <div className="font-medium">WebGL</div>
                        <div className={deviceCapabilities.supportsWebGL ? 'text-green-600' : 'text-red-600'}>
                            {deviceCapabilities.supportsWebGL ? 'Supported' : 'Not Supported'}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">Backdrop Filter</div>
                        <div className={deviceCapabilities.supportsBackdropFilter ? 'text-green-600' : 'text-red-600'}>
                            {deviceCapabilities.supportsBackdropFilter ? 'Supported' : 'Not Supported'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Performance Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="font-medium">Current FPS</div>
                        <div className={`text-2xl font-bold ${currentFPS >= 55 ? 'text-green-600' :
                                currentFPS >= 30 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {currentFPS}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">Performance Level</div>
                        <div className={`text-lg font-semibold ${performanceLevel === 'high' ? 'text-green-600' :
                                performanceLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {performanceLevel.toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium">Reduced Motion</div>
                        <div className={prefersReducedMotion ? 'text-yellow-600' : 'text-green-600'}>
                            {prefersReducedMotion ? 'Enabled' : 'Disabled'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance-Aware Component Demo */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Performance-Aware Component</h2>
                <PerformanceAwareWrapper
                    fallback={<ErrorFallback />}
                    enableMonitoring={true}
                >
                    {({ settings, hasError }) => (
                        <PotentiallyFailingComponent settings={settings} hasError={hasError} />
                    )}
                </PerformanceAwareWrapper>
            </div>

            {/* Performance Levels Comparison */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Performance Levels</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-green-600 mb-2">High Performance</h3>
                        <ul className="text-sm space-y-1">
                            <li>• Full glass morphism effects</li>
                            <li>• 3D transforms enabled</li>
                            <li>• Beam animations (50 particles)</li>
                            <li>• 300ms animation duration</li>
                            <li>• Hardware acceleration</li>
                        </ul>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-600 mb-2">Medium Performance</h3>
                        <ul className="text-sm space-y-1">
                            <li>• Reduced glass effects</li>
                            <li>• Limited 3D transforms</li>
                            <li>• Beam animations (25 particles)</li>
                            <li>• 200ms animation duration</li>
                            <li>• Selective acceleration</li>
                        </ul>
                    </div>

                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-red-600 mb-2">Low Performance</h3>
                        <ul className="text-sm space-y-1">
                            <li>• Minimal glass effects</li>
                            <li>• No 3D transforms</li>
                            <li>• No beam animations</li>
                            <li>• 100ms animation duration</li>
                            <li>• Software rendering</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Accessibility Features */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span>Respects prefers-reduced-motion</span>
                        <span className={prefersReducedMotion ? 'text-green-600' : 'text-gray-400'}>
                            {prefersReducedMotion ? '✓ Active' : '○ Inactive'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Graceful degradation for unsupported features</span>
                        <span className="text-green-600">✓ Implemented</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Error boundaries with fallback rendering</span>
                        <span className="text-green-600">✓ Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Performance-based effect adjustment</span>
                        <span className="text-green-600">✓ Monitoring</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceMonitoringExample;