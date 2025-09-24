import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Eye,
    EyeOff,
    Play,
    Pause,
    RotateCcw,
    AlertTriangle,
    CheckCircle,
    Info,
    Clock,
    Zap,
    Bell,
    BellOff,
    History,
    Save,
    X
} from 'lucide-react';
import InstagramConfigInterface from './InstagramConfigInterface';
import InstagramConfigPreview from './InstagramConfigPreview';
import useInstagramConfigRealtime, { useConfigChangeNotifications } from '../../hooks/useInstagramConfigRealtime';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramConfigRealtime - Real-time configuration with live preview and validation
 * Provides instant feedback and live updates as users modify settings
 */
const InstagramConfigRealtime = ({
    initialConfig = {},
    onSave = null,
    className = ''
}) => {
    const [isLiveMode, setIsLiveMode] = useState(true);
    const [showNotifications, setShowNotifications] = useState(true);
    const [previewMode, setPreviewMode] = useState('desktop');
    const [showValidationPanel, setShowValidationPanel] = useState(true);
    const [showChangeHistory, setShowChangeHistory] = useState(false);

    // Real-time configuration
    const {
        config,
        updateConfig,
        resetConfig,
        saveConfig,
        previewConfig,
        validationState,
        isPreviewMode,
        pendingChanges,
        changeHistory,
        validateConfigRealtime,
        togglePreviewMode,
        applyPreviewChanges,
        discardPreviewChanges,
        batchUpdateConfig,
        undoLastChange,
        getConfigDiff,
        exportConfigWithMetadata,
        hasPendingChanges,
        hasValidationErrors,
        hasValidationWarnings,
        canUndo,
        isDirty,
        isLoading
    } = useInstagramConfigRealtime(initialConfig, {
        debounceMs: isLiveMode ? 100 : 500,
        validateOnChange: true,
        enablePreview: true,
        onConfigChange: (newConfig, changes) => {
            console.log('Config changed:', changes);
        },
        onValidationChange: (validation) => {
            console.log('Validation changed:', validation);
        }
    });

    // Change notifications
    const {
        notifications,
        removeNotification,
        clearNotifications
    } = useConfigChangeNotifications(config, {
        enableNotifications: showNotifications,
        notificationDuration: 3000
    });

    // Accessibility
    const {
        shouldReduceMotion,
        getAnimationConfig,
        getAccessibilityClasses,
        getAccessibilityStyles
    } = useAccessibilityPreferences();

    // Handle save
    const handleSave = async () => {
        if (onSave) {
            await saveConfig(onSave);
        }
    };

    // Toggle live mode
    const toggleLiveMode = () => {
        setIsLiveMode(prev => !prev);
    };

    // Apply quick preset configurations
    const applyPreset = (presetName) => {
        const presets = {
            minimal: {
                maxPosts: 3,
                layout: 'list',
                showStats: false,
                showCaptions: false,
                spacing: 'compact'
            },
            standard: {
                maxPosts: 4,
                layout: 'grid',
                showStats: true,
                showCaptions: true,
                spacing: 'medium'
            },
            showcase: {
                maxPosts: 6,
                layout: 'grid',
                showStats: true,
                showCaptions: true,
                spacing: 'spacious'
            },
            performance: {
                maxPosts: 4,
                layout: 'grid',
                lazyLoading: true,
                imageOptimization: true,
                cacheEnabled: true,
                refreshInterval: 600000 // 10 minutes
            }
        };

        if (presets[presetName]) {
            batchUpdateConfig(presets[presetName]);
        }
    };

    const animationConfig = getAnimationConfig();

    return (
        <div className={`instagram-config-realtime ${getAccessibilityClasses()} ${className}`} style={getAccessibilityStyles()}>
            {/* Header with real-time controls */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-600" />
                                Real-time Configuration
                            </h1>
                            <p className="text-sm text-gray-600">
                                Live preview with instant validation and updates
                            </p>
                        </div>

                        {/* Live mode toggle */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleLiveMode}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                    ${isLiveMode
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                    }
                                `}
                                title={isLiveMode ? 'Disable live mode' : 'Enable live mode'}
                            >
                                {isLiveMode ? (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Live
                                    </>
                                ) : (
                                    <>
                                        <Pause className="w-4 h-4" />
                                        Paused
                                    </>
                                )}
                            </button>

                            {isLiveMode && (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Real-time updates active
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                        {/* Preset buttons */}
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 mr-2">Presets:</span>
                            {['minimal', 'standard', 'showcase'].map(preset => (
                                <button
                                    key={preset}
                                    onClick={() => applyPreset(preset)}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors capitalize"
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>

                        {/* Notifications toggle */}
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`
                                p-2 rounded-md transition-colors
                                ${showNotifications
                                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                    : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                                }
                            `}
                            title={showNotifications ? 'Disable notifications' : 'Enable notifications'}
                        >
                            {showNotifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </button>

                        {/* History toggle */}
                        <button
                            onClick={() => setShowChangeHistory(!showChangeHistory)}
                            className="p-2 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                            title="Show change history"
                        >
                            <History className="w-4 h-4" />
                        </button>

                        {/* Undo button */}
                        <button
                            onClick={undoLastChange}
                            disabled={!canUndo}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Undo last change"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Undo
                        </button>

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || hasValidationErrors || isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Status indicators */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                        {/* Validation status */}
                        <div className="flex items-center gap-2">
                            {hasValidationErrors ? (
                                <>
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600">
                                        {validationState.errors.length} error{validationState.errors.length !== 1 ? 's' : ''}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-600">Valid configuration</span>
                                </>
                            )}
                        </div>

                        {/* Warnings */}
                        {hasValidationWarnings && (
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-orange-600">
                                    {validationState.warnings.length} warning{validationState.warnings.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}

                        {/* Pending changes */}
                        {hasPendingChanges && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-blue-600">
                                    {Object.keys(pendingChanges).length} pending change{Object.keys(pendingChanges).length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Preview mode controls */}
                    {isPreviewMode && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-orange-600">Preview Mode</span>
                            <button
                                onClick={applyPreviewChanges}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                                Apply
                            </button>
                            <button
                                onClick={discardPreviewChanges}
                                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Discard
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications */}
            <AnimatePresence>
                {notifications.map(notification => (
                    <motion.div
                        key={notification.id}
                        className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
                        initial={shouldReduceMotion() ? false : { opacity: 0, x: 100 }}
                        animate={shouldReduceMotion() ? false : { opacity: 1, x: 0 }}
                        exit={shouldReduceMotion() ? false : { opacity: 0, x: 100 }}
                        transition={shouldReduceMotion() ? {} : animationConfig}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        {notification.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Configuration panel */}
                <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
                    <InstagramConfigInterface
                        initialConfig={config}
                        onConfigChange={updateConfig}
                        onSave={handleSave}
                        onReset={resetConfig}
                        showPreview={false}
                        className="h-full"
                    />
                </div>

                {/* Preview and validation panel */}
                <div className="w-1/2 bg-gray-50 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Preview */}
                        <InstagramConfigPreview
                            config={isPreviewMode ? previewConfig : config}
                            previewMode={previewMode}
                            onPreviewModeChange={setPreviewMode}
                            showControls={true}
                        />

                        {/* Validation panel */}
                        {showValidationPanel && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        Validation Results
                                    </h3>
                                    <button
                                        onClick={() => setShowValidationPanel(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Errors */}
                                {validationState.errors.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Errors ({validationState.errors.length})
                                        </h4>
                                        <ul className="space-y-1">
                                            {validationState.errors.map((error, index) => (
                                                <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    {error}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Warnings */}
                                {validationState.warnings.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            Warnings ({validationState.warnings.length})
                                        </h4>
                                        <ul className="space-y-1">
                                            {validationState.warnings.map((warning, index) => (
                                                <li key={index} className="text-sm text-orange-700 flex items-start gap-2">
                                                    <span className="text-orange-500 mt-0.5">•</span>
                                                    {warning}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Success state */}
                                {validationState.isValid && validationState.warnings.length === 0 && (
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">Configuration is valid with no warnings</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Change history */}
                        {showChangeHistory && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        Change History
                                    </h3>
                                    <button
                                        onClick={() => setShowChangeHistory(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {changeHistory.length === 0 ? (
                                    <p className="text-sm text-gray-500">No changes yet</p>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {changeHistory.slice(-10).reverse().map((change, index) => (
                                            <div key={change.timestamp} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                                                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(change.timestamp).toLocaleTimeString()}
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        {Object.entries(change.changes).map(([key, value]) => (
                                                            <span key={key} className="mr-2">
                                                                {key}: {JSON.stringify(value)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstagramConfigRealtime;