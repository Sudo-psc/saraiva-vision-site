import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Eye,
    EyeOff,
    Download,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import instagramErrorHandler from '../../services/instagramErrorHandler';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramErrorMonitor - Real-time error monitoring and analytics
 * Provides insights into error patterns and system health
 */
const InstagramErrorMonitor = ({
    showRealTime = true,
    showStatistics = true,
    showTrends = true,
    maxDisplayErrors = 10,
    updateInterval = 5000,
    className = '',
    onErrorThreshold = null,
    errorThreshold = 5
}) => {
    const [monitorState, setMonitorState] = useState({
        isVisible: false,
        errors: [],
        statistics: {
            total: 0,
            byType: {},
            bySeverity: {},
            recent: []
        },
        trends: {
            errorRate: 0,
            trend: 'stable', // 'increasing', 'decreasing', 'stable'
            lastHour: 0,
            lastDay: 0
        },
        isMonitoring: false
    });

    const [filters, setFilters] = useState({
        severity: 'all', // 'all', 'high', 'medium', 'low'
        type: 'all', // 'all', 'network', 'auth', 'rate-limit', etc.
        timeRange: '1h' // '1h', '6h', '24h', '7d'
    });

    const updateIntervalRef = useRef(null);
    const errorListenerRef = useRef(null);

    // Accessibility preferences
    const {
        shouldReduceMotion,
        getAnimationConfig,
        getAccessibilityClasses,
        getAccessibilityStyles
    } = useAccessibilityPreferences();

    // Update monitor data
    const updateMonitorData = useCallback(() => {
        const stats = instagramErrorHandler.getErrorStats();
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const oneDayAgo = now - (24 * 60 * 60 * 1000);

        // Calculate trends
        const recentErrors = stats.recent || [];
        const lastHourErrors = recentErrors.filter(error =>
            new Date(error.timestamp).getTime() > oneHourAgo
        );
        const lastDayErrors = recentErrors.filter(error =>
            new Date(error.timestamp).getTime() > oneDayAgo
        );

        // Calculate error rate trend
        const currentRate = lastHourErrors.length;
        const previousRate = monitorState.trends.lastHour;
        let trend = 'stable';

        if (currentRate > previousRate * 1.2) {
            trend = 'increasing';
        } else if (currentRate < previousRate * 0.8) {
            trend = 'decreasing';
        }

        setMonitorState(prev => ({
            ...prev,
            statistics: stats,
            trends: {
                errorRate: currentRate,
                trend,
                lastHour: lastHourErrors.length,
                lastDay: lastDayErrors.length
            },
            errors: applyFilters(recentErrors, filters).slice(0, maxDisplayErrors)
        }));

        // Check error threshold
        if (onErrorThreshold && currentRate >= errorThreshold) {
            onErrorThreshold({
                errorCount: currentRate,
                timeWindow: '1h',
                trend,
                errors: lastHourErrors
            });
        }
    }, [monitorState.trends.lastHour, filters, maxDisplayErrors, onErrorThreshold, errorThreshold]);

    // Apply filters to error list
    const applyFilters = useCallback((errors, currentFilters) => {
        return errors.filter(error => {
            // Severity filter
            if (currentFilters.severity !== 'all' && error.severity !== currentFilters.severity) {
                return false;
            }

            // Type filter
            if (currentFilters.type !== 'all' && error.type !== currentFilters.type) {
                return false;
            }

            // Time range filter
            const errorTime = new Date(error.timestamp).getTime();
            const now = Date.now();
            let timeLimit;

            switch (currentFilters.timeRange) {
                case '1h':
                    timeLimit = now - (60 * 60 * 1000);
                    break;
                case '6h':
                    timeLimit = now - (6 * 60 * 60 * 1000);
                    break;
                case '24h':
                    timeLimit = now - (24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    timeLimit = now - (7 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    timeLimit = 0;
            }

            return errorTime > timeLimit;
        });
    }, []);

    // Start monitoring
    const startMonitoring = useCallback(() => {
        setMonitorState(prev => ({ ...prev, isMonitoring: true }));

        // Set up error listener
        errorListenerRef.current = instagramErrorHandler.onError((errorInfo) => {
            setMonitorState(prev => ({
                ...prev,
                errors: [errorInfo, ...prev.errors].slice(0, maxDisplayErrors)
            }));
        });

        // Set up periodic updates
        updateMonitorData();
        updateIntervalRef.current = setInterval(updateMonitorData, updateInterval);
    }, [updateMonitorData, updateInterval, maxDisplayErrors]);

    // Stop monitoring
    const stopMonitoring = useCallback(() => {
        setMonitorState(prev => ({ ...prev, isMonitoring: false }));

        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
            updateIntervalRef.current = null;
        }

        if (errorListenerRef.current) {
            errorListenerRef.current();
            errorListenerRef.current = null;
        }
    }, []);

    // Toggle monitor visibility
    const toggleVisibility = useCallback(() => {
        setMonitorState(prev => {
            const newVisible = !prev.isVisible;

            if (newVisible && !prev.isMonitoring) {
                startMonitoring();
            } else if (!newVisible && prev.isMonitoring) {
                stopMonitoring();
            }

            return { ...prev, isVisible: newVisible };
        });
    }, [startMonitoring, stopMonitoring]);

    // Export error data
    const exportErrorData = useCallback(() => {
        const data = {
            timestamp: new Date().toISOString(),
            statistics: monitorState.statistics,
            trends: monitorState.trends,
            errors: monitorState.errors,
            filters
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instagram-errors-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [monitorState, filters]);

    // Clear error history
    const clearErrorHistory = useCallback(() => {
        instagramErrorHandler.reset();
        setMonitorState(prev => ({
            ...prev,
            errors: [],
            statistics: {
                total: 0,
                byType: {},
                bySeverity: {},
                recent: []
            }
        }));
    }, []);

    // Update filters
    const updateFilter = useCallback((filterType, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [filterType]: value };

            // Re-apply filters to current errors
            const stats = instagramErrorHandler.getErrorStats();
            const filteredErrors = applyFilters(stats.recent || [], newFilters);

            setMonitorState(prevState => ({
                ...prevState,
                errors: filteredErrors.slice(0, maxDisplayErrors)
            }));

            return newFilters;
        });
    }, [applyFilters, maxDisplayErrors]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopMonitoring();
        };
    }, [stopMonitoring]);

    // Get severity color
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'text-red-600 bg-red-100';
            case 'medium':
                return 'text-orange-600 bg-orange-100';
            case 'low':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    // Get type color
    const getTypeColor = (type) => {
        switch (type) {
            case 'network':
                return 'text-blue-600 bg-blue-100';
            case 'auth':
                return 'text-red-600 bg-red-100';
            case 'rate-limit':
                return 'text-orange-600 bg-orange-100';
            case 'server':
                return 'text-purple-600 bg-purple-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const animationConfig = getAnimationConfig();

    // Animation variants
    const containerVariants = shouldReduceMotion() ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: animationConfig.duration }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: { duration: animationConfig.duration }
        }
    };

    return (
        <div className={`instagram-error-monitor ${getAccessibilityClasses()} ${className}`} style={getAccessibilityStyles()}>
            {/* Toggle Button */}
            <button
                onClick={toggleVisibility}
                className={`
                    fixed top-4 right-4 z-50 p-2 rounded-full shadow-lg transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${monitorState.isVisible
                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                        : 'bg-white text-gray-600 hover:bg-gray-50 focus:ring-gray-500'
                    }
                    ${monitorState.trends.trend === 'increasing' ? 'animate-pulse' : ''}
                `}
                aria-label={monitorState.isVisible ? 'Hide error monitor' : 'Show error monitor'}
                title={`Error Monitor (${monitorState.statistics.total} total errors)`}
            >
                {monitorState.isVisible ? (
                    <EyeOff className="w-5 h-5" />
                ) : (
                    <div className="relative">
                        <Eye className="w-5 h-5" />
                        {monitorState.trends.lastHour > 0 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">
                                    {monitorState.trends.lastHour > 9 ? '9+' : monitorState.trends.lastHour}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </button>

            {/* Monitor Panel */}
            <AnimatePresence>
                {monitorState.isVisible && (
                    <motion.div
                        className="fixed top-16 right-4 w-96 max-h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-40 overflow-hidden"
                        variants={containerVariants}
                        initial={shouldReduceMotion() ? false : "hidden"}
                        animate={shouldReduceMotion() ? false : "visible"}
                        exit={shouldReduceMotion() ? false : "exit"}
                        role="region"
                        aria-labelledby="error-monitor-title"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h3 id="error-monitor-title" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Error Monitor
                                    {monitorState.isMonitoring && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    )}
                                </h3>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={exportErrorData}
                                        className="p-1 text-gray-500 hover:text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        aria-label="Export error data"
                                        title="Export error data"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={clearErrorHistory}
                                        className="p-1 text-gray-500 hover:text-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                        aria-label="Clear error history"
                                        title="Clear error history"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Statistics Overview */}
                            {showStatistics && (
                                <div className="p-4 border-b border-gray-200">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Total Errors:</span>
                                            <span className="ml-2 font-medium">{monitorState.statistics.total}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Last Hour:</span>
                                            <span className="ml-2 font-medium">{monitorState.trends.lastHour}</span>
                                        </div>
                                    </div>

                                    {/* Error Types */}
                                    {Object.keys(monitorState.statistics.byType).length > 0 && (
                                        <div className="mt-3">
                                            <h4 className="text-xs font-medium text-gray-700 mb-2">By Type:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(monitorState.statistics.byType).map(([type, count]) => (
                                                    <span
                                                        key={type}
                                                        className={`px-2 py-1 text-xs rounded ${getTypeColor(type)}`}
                                                    >
                                                        {type}: {count}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Trend Indicator */}
                                    {showTrends && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Trend:</span>
                                            <div className="flex items-center gap-1">
                                                {monitorState.trends.trend === 'increasing' && (
                                                    <>
                                                        <TrendingUp className="w-3 h-3 text-red-600" />
                                                        <span className="text-xs text-red-600">Increasing</span>
                                                    </>
                                                )}
                                                {monitorState.trends.trend === 'decreasing' && (
                                                    <>
                                                        <TrendingDown className="w-3 h-3 text-green-600" />
                                                        <span className="text-xs text-green-600">Decreasing</span>
                                                    </>
                                                )}
                                                {monitorState.trends.trend === 'stable' && (
                                                    <>
                                                        <BarChart3 className="w-3 h-3 text-blue-600" />
                                                        <span className="text-xs text-blue-600">Stable</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Filters */}
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h4 className="text-xs font-medium text-gray-700 mb-2">Filters:</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <select
                                        value={filters.severity}
                                        onChange={(e) => updateFilter('severity', e.target.value)}
                                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        aria-label="Filter by severity"
                                    >
                                        <option value="all">All Severity</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>

                                    <select
                                        value={filters.type}
                                        onChange={(e) => updateFilter('type', e.target.value)}
                                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        aria-label="Filter by type"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="network">Network</option>
                                        <option value="auth">Auth</option>
                                        <option value="rate-limit">Rate Limit</option>
                                        <option value="server">Server</option>
                                        <option value="client">Client</option>
                                    </select>

                                    <select
                                        value={filters.timeRange}
                                        onChange={(e) => updateFilter('timeRange', e.target.value)}
                                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        aria-label="Filter by time range"
                                    >
                                        <option value="1h">Last Hour</option>
                                        <option value="6h">Last 6 Hours</option>
                                        <option value="24h">Last 24 Hours</option>
                                        <option value="7d">Last 7 Days</option>
                                    </select>
                                </div>
                            </div>

                            {/* Error List */}
                            <div className="flex-1 overflow-y-auto">
                                {monitorState.errors.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                        <p className="text-sm">No errors found</p>
                                        <p className="text-xs">System is running smoothly</p>
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-2">
                                        {monitorState.errors.map((error, index) => (
                                            <div
                                                key={error.id || index}
                                                className="p-3 bg-gray-50 border border-gray-200 rounded text-xs"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded font-medium ${getSeverityColor(error.severity)}`}>
                                                            {error.severity}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded font-medium ${getTypeColor(error.type)}`}>
                                                            {error.type}
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-500">
                                                        {format(new Date(error.timestamp), 'HH:mm:ss')}
                                                    </span>
                                                </div>

                                                <p className="text-gray-700 mb-2 line-clamp-2">
                                                    {error.message}
                                                </p>

                                                {error.context?.operation && (
                                                    <p className="text-gray-500">
                                                        Operation: {error.context.operation}
                                                    </p>
                                                )}

                                                {error.id && (
                                                    <p className="text-gray-400 font-mono">
                                                        ID: {error.id.substring(0, 8)}...
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                    </motion.div>
                    </motion.div>
                )}
        </AnimatePresence>
        </div >
    );
};

export default InstagramErrorMonitor;
