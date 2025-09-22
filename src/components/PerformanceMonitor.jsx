import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { getMemoryUsage, getBatteryStatus, getConnectionQuality } from '../utils/performanceUtils';

/**
 * Development component for monitoring performance metrics
 * Only renders in development mode
 */
const PerformanceMonitor = ({ show = false, position = 'top-right' }) => {
    const {
        performanceLevel,
        currentFPS,
        isMonitoring,
        deviceCapabilities,
        startMonitoring,
        stopMonitoring
    } = usePerformanceMonitor();

    const { prefersReducedMotion } = useReducedMotion();
    const [memoryInfo, setMemoryInfo] = useState(null);
    const [batteryInfo, setBatteryInfo] = useState(null);
    const [connectionInfo, setConnectionInfo] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Update system info periodically
    useEffect(() => {
        const updateSystemInfo = async () => {
            setMemoryInfo(getMemoryUsage());
            setBatteryInfo(await getBatteryStatus());
            setConnectionInfo(getConnectionQuality());
        };

        updateSystemInfo();
        const interval = setInterval(updateSystemInfo, 2000);
        return () => clearInterval(interval);
    }, []);

    // Auto-start monitoring when component mounts
    useEffect(() => {
        if (show) {
            startMonitoring();
            return () => stopMonitoring();
        }
    }, [show, startMonitoring, stopMonitoring]);

    // Don't render in production
    if (process.env.NODE_ENV === 'production' && !show) {
        return null;
    }

    const getFPSColor = (fps) => {
        if (fps >= 55) return 'fps-good';
        if (fps >= 30) return 'fps-medium';
        return 'fps-poor';
    };

    const getPerformanceLevelColor = (level) => {
        switch (level) {
            case 'high': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'low': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const positionClasses = {
        'top-right': 'top-2 right-2',
        'top-left': 'top-2 left-2',
        'bottom-right': 'bottom-2 right-2',
        'bottom-left': 'bottom-2 left-2'
    };

    if (!show) return null;

    return (
        <div
            className={`performance-monitor fixed ${positionClasses[position]} z-50 bg-black bg-opacity-80 text-white p-3 rounded-lg font-mono text-xs select-none`}
            style={{ minWidth: isExpanded ? '280px' : '120px' }}
        >
            <div
                className="cursor-pointer flex justify-between items-center"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="font-semibold">Performance</span>
                <span className="text-xs">{isExpanded ? '−' : '+'}</span>
            </div>

            <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                    <span>FPS:</span>
                    <span className={getFPSColor(currentFPS)}>{currentFPS}</span>
                </div>

                <div className="flex justify-between">
                    <span>Level:</span>
                    <span style={{ color: getPerformanceLevelColor(performanceLevel) }}>
                        {performanceLevel.toUpperCase()}
                    </span>
                </div>

                {prefersReducedMotion && (
                    <div className="text-yellow-400 text-xs">
                        Reduced Motion
                    </div>
                )}

                {isExpanded && (
                    <>
                        <hr className="border-gray-600 my-2" />

                        <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-300">Device</div>
                            <div className="flex justify-between text-xs">
                                <span>Cores:</span>
                                <span>{deviceCapabilities.hardwareConcurrency}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>Memory:</span>
                                <span>{deviceCapabilities.deviceMemory}GB</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>WebGL:</span>
                                <span className={deviceCapabilities.supportsWebGL ? 'text-green-400' : 'text-red-400'}>
                                    {deviceCapabilities.supportsWebGL ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>Backdrop:</span>
                                <span className={deviceCapabilities.supportsBackdropFilter ? 'text-green-400' : 'text-red-400'}>
                                    {deviceCapabilities.supportsBackdropFilter ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>

                        {memoryInfo && (
                            <>
                                <hr className="border-gray-600 my-2" />
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-gray-300">Memory</div>
                                    <div className="flex justify-between text-xs">
                                        <span>Used:</span>
                                        <span>{Math.round(memoryInfo.used / 1024 / 1024)}MB</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Usage:</span>
                                        <span className={memoryInfo.percentage > 80 ? 'text-red-400' : 'text-green-400'}>
                                            {Math.round(memoryInfo.percentage)}%
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {batteryInfo && (
                            <>
                                <hr className="border-gray-600 my-2" />
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-gray-300">Battery</div>
                                    <div className="flex justify-between text-xs">
                                        <span>Level:</span>
                                        <span className={batteryInfo.level < 0.2 ? 'text-red-400' : 'text-green-400'}>
                                            {Math.round(batteryInfo.level * 100)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Charging:</span>
                                        <span className={batteryInfo.charging ? 'text-green-400' : 'text-yellow-400'}>
                                            {batteryInfo.charging ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {connectionInfo && (
                            <>
                                <hr className="border-gray-600 my-2" />
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-gray-300">Network</div>
                                    <div className="flex justify-between text-xs">
                                        <span>Type:</span>
                                        <span>{connectionInfo.effectiveType}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Speed:</span>
                                        <span>{connectionInfo.downlink}Mbps</span>
                                    </div>
                                    {connectionInfo.saveData && (
                                        <div className="text-yellow-400 text-xs">Save Data Mode</div>
                                    )}
                                </div>
                            </>
                        )}

                        <hr className="border-gray-600 my-2" />
                        <div className="flex justify-between text-xs">
                            <span>Monitoring:</span>
                            <span className={isMonitoring ? 'text-green-400' : 'text-red-400'}>
                                {isMonitoring ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PerformanceMonitor;