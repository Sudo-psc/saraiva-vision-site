import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    RefreshCw,
    Activity,
    Shield,
    Zap,
    TrendingUp,
    Settings,
    Play,
    Pause,
    RotateCcw
} from 'lucide-react';
import InstagramErrorBoundary from './InstagramErrorBoundary';
import InstagramFallback from './InstagramFallback';
import InstagramRetryManager from './InstagramRetryManager';
import instagramErrorHandler from '../../services/instagramErrorHandler';
import instagramErrorMonitor from '../../services/instagramErrorMonitor';
import instagramErrorRecovery from '../../services/instagramErrorRecovery';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * Comprehensive demo showcasing Instagram error handling capabilities
 */
const InstagramErrorHandlingDemo = () => {
    const [demoState, setDemoState] = useState({
        monitoringActive: false,
        simulatedErrors: [],
        recoveryStats: {},
        errorStats: {},
        activeRecoveries: 0
    });

    const [selectedErrorType, setSelectedErrorType] = useState('network');
    const [simulationSettings, setSimulationSettings] = useState({
        errorRate: 0.1,
        autoRecovery: true,
        showRetryManager: true,
        enableMonitoring: true
    });

    // Accessibility preferences
    const {
        shouldReduceMotion,
        getAnimationConfig,
        getAccessibilityClasses,
        getAccessibilityStyles
    } = useAccessibilityPreferences();

    // Error types for simulation
    const errorTypes = [
        { id: 'network', name: 'Network Error', description: 'Connection failures and timeouts' },
        { id: 'auth', name: 'Authentication Error', description: 'Invalid tokens and permissions' },
        { id: 'rate-limit', name: 'Rate Limit Error', description: 'API quota exceeded' },
        { id: 'server', name: 'Server Error', description: 'Internal server errors' },
        { id: 'cache', name: 'Cache Error', description: 'Cache corruption and failures' },
        { id: 'component', name: 'Component Error', description: 'React component errors' }
    ];

    // Start monitoring
    const startMonitoring = useCallback(() => {
        instagramErrorMonitor.startMonitoring({
            enableReporting: true,
            reportingInterval: 30000, // 30 seconds for demo
            thresholds: {
                errorRate: 0.05,
                consecutiveErrors: 3,
                criticalErrorCount: 2
            }
        });

        setDemoState(prev => ({ ...prev, monitoringActive: true }));
    }, []);

    // Stop monitoring
    const stopMonitoring = useCallback(() => {
        instagramErrorMonitor.stopMonitoring();
        setDemoState(prev => ({ ...prev, monitoringActive: false }));
    }, []);

    // Simulate error
    const simulateError = useCallback(async (errorType) => {
        const errorInfo = {
            id: `demo-error-${Date.now()}`,
            type: errorType,
            message: `Simulated ${errorType} error for demonstration`,
            severity: errorType === 'auth' ? 'high' : 'medium',
            timestamp: Date.now(),
            context: {
                operation: 'fetchPosts',
                component: 'InstagramFeedContainer',
                url: 'https://api.instagram.com/posts'
            }
        };

        // Record error in monitor
        if (demoState.monitoringActive) {
            instagramErrorMonitor.recordError(errorInfo, {
                component: 'InstagramErrorHandlingDemo',
                userId: 'demo-user'
            });
        }

        // Handle error
        const result = await instagramErrorHandler.handleError(new Error(errorInfo.message), {
            operation: errorInfo.context.operation,
            operationId: errorInfo.id,
            url: errorInfo.context.url
        });

        // Attempt recovery if auto-recovery is enabled
        if (simulationSettings.autoRecovery) {
            const recoveryResult = await instagramErrorRecovery.attemptRecovery(errorInfo, {
                component: 'InstagramErrorHandlingDemo'
            });

            setDemoState(prev => ({
                ...prev,
                simulatedErrors: [...prev.simulatedErrors, {
                    ...errorInfo,
                    handlerResult: result,
                    recoveryResult
                }].slice(-10) // Keep only last 10 errors
            }));
        } else {
            setDemoState(prev => ({
                ...prev,
                simulatedErrors: [...prev.simulatedErrors, {
                    ...errorInfo,
                    handlerResult: result
                }].slice(-10)
            }));
        }
    }, [demoState.monitoringActive, simulationSettings.autoRecovery]);

    // Update stats periodically
    useEffect(() => {
        const updateStats = () => {
            if (demoState.monitoringActive) {
                const errorStats = instagramErrorMonitor.getMetrics();
                const recoveryStats = instagramErrorRecovery.getRecoveryStats();

                setDemoState(prev => ({
                    ...prev,
                    errorStats,
                    recoveryStats,
                    activeRecoveries: recoveryStats.activeRecoveries
                }));
            }
        };

        const interval = setInterval(updateStats, 2000);
        return () => clearInterval(interval);
    }, [demoState.monitoringActive]);

    // Mock retry function for RetryManager demo
    const mockRetryFunction = useCallback(async () => {
        // Simulate API call with random success/failure
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        if (Math.random() < 0.7) { // 70% success rate
            return { success: true, data: 'Mock data retrieved successfully' };
        } else {
            throw new Error('Mock API call failed');
        }
    }, []);

    const animationConfig = getAnimationConfig();

    // Animation variants
    const containerVariants = shouldReduceMotion() ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: animationConfig.duration,
                staggerChildren: animationConfig.stagger
            }
        }
    };

    const cardVariants = shouldReduceMotion() ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: animationConfig.duration }
        }
    };

    return (
        <motion.div
            className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ${getAccessibilityClasses()}`}
            style={getAccessibilityStyles()}
            variants={containerVariants}
            initial={shouldReduceMotion() ? false : "hidden"}
            animate={shouldReduceMotion() ? false : "visible"}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.header className="mb-8" variants={cardVariants}>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Instagram Error Handling System Demo
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Comprehensive error handling, monitoring, and recovery demonstration
                    </p>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Control Panel */}
                    <motion.div className="lg:col-span-1" variants={cardVariants}>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Control Panel
                            </h2>

                            {/* Monitoring Controls */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Error Monitoring
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={demoState.monitoringActive ? stopMonitoring : startMonitoring}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                                            ${demoState.monitoringActive
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                            }
                                        `}
                                    >
                                        {demoState.monitoringActive ? (
                                            <>
                                                <Pause className="w-4 h-4" />
                                                Stop Monitoring
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4" />
                                                Start Monitoring
                                            </>
                                        )}
                                    </button>
                                    <div className={`
                                        flex items-center gap-1 text-sm
                                        ${demoState.monitoringActive ? 'text-green-600' : 'text-gray-500'}
                                    `}>
                                        <Activity className="w-4 h-4" />
                                        {demoState.monitoringActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            </div>

                            {/* Error Simulation */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Error Simulation
                                </h3>

                                <div className="space-y-3">
                                    <select
                                        value={selectedErrorType}
                                        onChange={(e) => setSelectedErrorType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-cyan-500"
                                    >
                                        {errorTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => simulateError(selectedErrorType)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                    >
                                        <Zap className="w-4 h-4" />
                                        Simulate Error
                                    </button>
                                </div>
                            </div>

                            {/* Settings */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Settings
                                </h3>

                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={simulationSettings.autoRecovery}
                                            onChange={(e) => setSimulationSettings(prev => ({
                                                ...prev,
                                                autoRecovery: e.target.checked
                                            }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Auto Recovery
                                        </span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={simulationSettings.showRetryManager}
                                            onChange={(e) => setSimulationSettings(prev => ({
                                                ...prev,
                                                showRetryManager: e.target.checked
                                            }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Show Retry Manager
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Statistics
                            </h3>

                            <div className="space-y-4">
                                {/* Error Stats */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Error Metrics
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                            <div className="font-medium">Total Errors</div>
                                            <div className="text-lg font-bold text-red-600">
                                                {demoState.errorStats.totalErrors || 0}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                            <div className="font-medium">Queue Size</div>
                                            <div className="text-lg font-bold text-cyan-600">
                                                {demoState.errorStats.queueSize || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recovery Stats */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Recovery Metrics
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                            <div className="font-medium">Success Rate</div>
                                            <div className="text-lg font-bold text-green-600">
                                                {Math.round((demoState.recoveryStats.successRate || 0) * 100)}%
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                            <div className="font-medium">Avg Recovery</div>
                                            <div className="text-lg font-bold text-purple-600">
                                                {Math.round(demoState.recoveryStats.averageRecoveryTime || 0)}ms
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Recoveries */}
                                {demoState.activeRecoveries > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-yellow-800">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span className="font-medium">
                                                {demoState.activeRecoveries} Active Recovery
                                                {demoState.activeRecoveries > 1 ? 'ies' : 'y'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Demo Area */}
                    <motion.div className="lg:col-span-2" variants={cardVariants}>
                        {/* Error Boundary Demo */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Error Boundary Demo
                            </h3>

                            <InstagramErrorBoundary>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                    <p className="text-gray-600 dark:text-gray-400 text-center">
                                        This area is protected by an error boundary.
                                        Simulate errors to see how they are handled.
                                    </p>
                                </div>
                            </InstagramErrorBoundary>
                        </div>

                        {/* Fallback Component Demo */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Fallback Component Demo
                            </h3>

                            <InstagramFallback
                                errorType={selectedErrorType}
                                errorMessage={`Simulated ${selectedErrorType} error for demonstration`}
                                fallbackPosts={[
                                    {
                                        id: 'demo-1',
                                        username: 'demo_user',
                                        caption: 'This is a cached post for demonstration',
                                        media_url: '/img/placeholder.svg',
                                        permalink: '#',
                                        timestamp: new Date().toISOString(),
                                        stats: { likes: 42, comments: 5, engagement_rate: 3.2 }
                                    }
                                ]}
                                showCachedContent={true}
                                showRetryOptions={true}
                                onRetry={() => console.log('Retry triggered from fallback')}
                                onClearCache={() => console.log('Cache cleared from fallback')}
                            />
                        </div>

                        {/* Retry Manager Demo */}
                        {simulationSettings.showRetryManager && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Retry Manager Demo
                                </h3>

                                <InstagramRetryManager
                                    onRetry={mockRetryFunction}
                                    maxRetries={3}
                                    baseDelay={2000}
                                    errorType={selectedErrorType}
                                    showProgress={true}
                                    showControls={true}
                                    onRetryStateChange={(state) => {
                                        console.log('Retry state changed:', state);
                                    }}
                                />
                            </div>
                        )}

                        {/* Recent Errors */}
                        {demoState.simulatedErrors.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Recent Simulated Errors
                                </h3>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {demoState.simulatedErrors.map((error, index) => (
                                        <div key={error.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {error.type} Error
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(error.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {error.message}
                                            </p>

                                            <div className="text-xs space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Handler Result:</span>
                                                    <span className={error.handlerResult?.success ? 'text-green-600' : 'text-red-600'}>
                                                        {error.handlerResult?.success ? 'Success' : 'Failed'}
                                                    </span>
                                                </div>

                                                {error.recoveryResult && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">Recovery Result:</span>
                                                        <span className={error.recoveryResult.success ? 'text-green-600' : 'text-red-600'}>
                                                            {error.recoveryResult.success ? 'Recovered' : 'Failed'}
                                                        </span>
                                                        {error.recoveryResult.recoveryTime && (
                                                            <span className="text-gray-500">
                                                                ({error.recoveryResult.recoveryTime}ms)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setDemoState(prev => ({ ...prev, simulatedErrors: [] }))}
                                    className="mt-4 flex items-center gap-2 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Clear History
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default InstagramErrorHandlingDemo;