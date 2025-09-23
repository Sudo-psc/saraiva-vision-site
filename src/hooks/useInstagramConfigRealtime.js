import { useState, useEffect, useCallback, useRef } from 'react';
import { useInstagramConfigStandalone } from './useInstagramConfig';

/**
 * Real-time Instagram configuration hook
 * Provides live configuration updates with validation and preview
 */
export const useInstagramConfigRealtime = (initialConfig = {}, options = {}) => {
    const {
        debounceMs = 300,
        validateOnChange = true,
        persistConfig = true,
        enablePreview = true,
        onConfigChange = null,
        onValidationChange = null,
        onPreviewUpdate = null
    } = options;

    // Base configuration hook
    const {
        config,
        updateConfig: baseUpdateConfig,
        resetConfig,
        saveConfig,
        validateConfig,
        isLoading,
        error,
        isDirty
    } = useInstagramConfigStandalone(initialConfig, { persistConfig });

    // Real-time state
    const [previewConfig, setPreviewConfig] = useState(config);
    const [validationState, setValidationState] = useState({
        isValid: true,
        errors: [],
        warnings: []
    });
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});
    const [changeHistory, setChangeHistory] = useState([]);

    // Refs for debouncing and cleanup
    const debounceTimeoutRef = useRef(null);
    const validationTimeoutRef = useRef(null);
    const previewTimeoutRef = useRef(null);

    // Update configuration with debouncing
    const updateConfig = useCallback((updates, options = {}) => {
        const { immediate = false, skipValidation = false, skipPreview = false } = options;

        // Update pending changes
        setPendingChanges(prev => ({ ...prev, ...updates }));

        // Update preview immediately for responsive UI
        if (enablePreview && !skipPreview) {
            setPreviewConfig(prev => ({ ...prev, ...updates }));
        }

        // Clear existing debounce timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Apply changes immediately or with debounce
        const applyChanges = () => {
            // Apply to actual config
            baseUpdateConfig(updates);

            // Add to change history
            setChangeHistory(prev => [
                ...prev.slice(-19), // Keep last 20 changes
                {
                    timestamp: Date.now(),
                    changes: updates,
                    user: 'admin' // Could be dynamic
                }
            ]);

            // Clear pending changes
            setPendingChanges({});

            // Trigger callbacks
            if (onConfigChange) {
                onConfigChange({ ...config, ...updates }, updates);
            }

            // Validate if enabled
            if (validateOnChange && !skipValidation) {
                validateConfigRealtime({ ...config, ...updates });
            }

            // Update preview
            if (enablePreview && onPreviewUpdate) {
                previewTimeoutRef.current = setTimeout(() => {
                    onPreviewUpdate({ ...config, ...updates });
                }, 100);
            }
        };

        if (immediate) {
            applyChanges();
        } else {
            debounceTimeoutRef.current = setTimeout(applyChanges, debounceMs);
        }
    }, [config, baseUpdateConfig, debounceMs, validateOnChange, enablePreview, onConfigChange, onPreviewUpdate]);

    // Real-time validation
    const validateConfigRealtime = useCallback((configToValidate = config) => {
        if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
        }

        validationTimeoutRef.current = setTimeout(() => {
            const validation = validateConfig(configToValidate);
            const warnings = generateWarnings(configToValidate);

            const newValidationState = {
                isValid: validation.isValid,
                errors: validation.errors,
                warnings
            };

            setValidationState(newValidationState);

            if (onValidationChange) {
                onValidationChange(newValidationState);
            }
        }, 100);
    }, [config, validateConfig, onValidationChange]);

    // Generate configuration warnings
    const generateWarnings = useCallback((configToValidate) => {
        const warnings = [];

        // Performance warnings
        if (configToValidate.maxPosts > 12) {
            warnings.push('Displaying more than 12 posts may impact performance');
        }

        if (configToValidate.refreshInterval < 300000) { // 5 minutes
            warnings.push('Frequent refresh intervals may exceed API rate limits');
        }

        // Accessibility warnings
        if (!configToValidate.altTextEnabled) {
            warnings.push('Disabling alt text reduces accessibility for screen readers');
        }

        if (configToValidate.captionLength < 80) {
            warnings.push('Short caption length may truncate important content');
        }

        // Content warnings
        if (configToValidate.hashtags.length > 10) {
            warnings.push('Too many hashtag filters may result in no matching posts');
        }

        if (configToValidate.minLikes > 1000) {
            warnings.push('High minimum likes threshold may filter out most posts');
        }

        // Appearance warnings
        if (configToValidate.colorScheme === 'custom') {
            const { customColors } = configToValidate;
            const primaryHex = customColors.primary;
            const backgroundHex = customColors.background;

            // Simple contrast check (basic implementation)
            if (primaryHex && backgroundHex) {
                const contrast = calculateContrast(primaryHex, backgroundHex);
                if (contrast < 4.5) {
                    warnings.push('Low color contrast may affect readability');
                }
            }
        }

        return warnings;
    }, []);

    // Simple contrast calculation
    const calculateContrast = (color1, color2) => {
        const getLuminance = (hex) => {
            const rgb = parseInt(hex.slice(1), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;

            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });

            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };

        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);

        return (brightest + 0.05) / (darkest + 0.05);
    };

    // Toggle preview mode
    const togglePreviewMode = useCallback(() => {
        setIsPreviewMode(prev => !prev);
    }, []);

    // Apply preview changes to actual config
    const applyPreviewChanges = useCallback(() => {
        if (isPreviewMode) {
            baseUpdateConfig(previewConfig);
            setIsPreviewMode(false);
        }
    }, [isPreviewMode, previewConfig, baseUpdateConfig]);

    // Discard preview changes
    const discardPreviewChanges = useCallback(() => {
        setPreviewConfig(config);
        setIsPreviewMode(false);
        setPendingChanges({});
    }, [config]);

    // Batch update multiple configuration values
    const batchUpdateConfig = useCallback((updates) => {
        updateConfig(updates, { immediate: true });
    }, [updateConfig]);

    // Undo last change
    const undoLastChange = useCallback(() => {
        if (changeHistory.length === 0) return;

        const lastChange = changeHistory[changeHistory.length - 1];
        const undoUpdates = {};

        // Create undo updates (this is a simplified implementation)
        Object.keys(lastChange.changes).forEach(key => {
            // For arrays, this would need more sophisticated logic
            if (Array.isArray(config[key])) {
                // Skip array undo for now - would need more complex logic
                return;
            }

            // For simple values, we'd need to store the previous value
            // This is a simplified implementation
            const defaultConfig = initialConfig[key] !== undefined ? initialConfig[key] : null;
            undoUpdates[key] = defaultConfig;
        });

        if (Object.keys(undoUpdates).length > 0) {
            updateConfig(undoUpdates, { immediate: true });
            setChangeHistory(prev => prev.slice(0, -1));
        }
    }, [changeHistory, config, initialConfig, updateConfig]);

    // Get configuration diff
    const getConfigDiff = useCallback(() => {
        const diff = {};
        const defaultConfig = initialConfig;

        Object.keys(config).forEach(key => {
            if (JSON.stringify(config[key]) !== JSON.stringify(defaultConfig[key])) {
                diff[key] = {
                    current: config[key],
                    default: defaultConfig[key]
                };
            }
        });

        return diff;
    }, [config, initialConfig]);

    // Export configuration with metadata
    const exportConfigWithMetadata = useCallback(() => {
        return {
            config,
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '1.0.0',
                changeHistory: changeHistory.slice(-10), // Last 10 changes
                validation: validationState,
                diff: getConfigDiff()
            }
        };
    }, [config, changeHistory, validationState, getConfigDiff]);

    // Initialize validation on mount
    useEffect(() => {
        validateConfigRealtime(config);
    }, []);

    // Update preview config when main config changes
    useEffect(() => {
        if (!isPreviewMode) {
            setPreviewConfig(config);
        }
    }, [config, isPreviewMode]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            if (validationTimeoutRef.current) {
                clearTimeout(validationTimeoutRef.current);
            }
            if (previewTimeoutRef.current) {
                clearTimeout(previewTimeoutRef.current);
            }
        };
    }, []);

    return {
        // Base configuration
        config,
        updateConfig,
        resetConfig,
        saveConfig,
        validateConfig,
        isLoading,
        error,
        isDirty,

        // Real-time features
        previewConfig,
        validationState,
        isPreviewMode,
        pendingChanges,
        changeHistory,

        // Real-time actions
        validateConfigRealtime,
        togglePreviewMode,
        applyPreviewChanges,
        discardPreviewChanges,
        batchUpdateConfig,
        undoLastChange,

        // Utilities
        getConfigDiff,
        exportConfigWithMetadata,

        // State flags
        hasPendingChanges: Object.keys(pendingChanges).length > 0,
        hasValidationErrors: !validationState.isValid,
        hasValidationWarnings: validationState.warnings.length > 0,
        canUndo: changeHistory.length > 0
    };
};

/**
 * Hook for configuration change notifications
 */
export const useConfigChangeNotifications = (config, options = {}) => {
    const {
        enableNotifications = true,
        notificationDuration = 3000,
        onNotification = null
    } = options;

    const [notifications, setNotifications] = useState([]);
    const previousConfigRef = useRef(config);

    // Generate notification for config changes
    const generateChangeNotification = useCallback((changes) => {
        const changeDescriptions = [];

        Object.entries(changes).forEach(([key, value]) => {
            switch (key) {
                case 'maxPosts':
                    changeDescriptions.push(`Posts limit changed to ${value}`);
                    break;
                case 'layout':
                    changeDescriptions.push(`Layout changed to ${value}`);
                    break;
                case 'theme':
                    changeDescriptions.push(`Theme changed to ${value}`);
                    break;
                case 'showStats':
                    changeDescriptions.push(`Statistics ${value ? 'enabled' : 'disabled'}`);
                    break;
                case 'showCaptions':
                    changeDescriptions.push(`Captions ${value ? 'enabled' : 'disabled'}`);
                    break;
                default:
                    changeDescriptions.push(`${key} updated`);
            }
        });

        return {
            id: Date.now(),
            type: 'config-change',
            title: 'Configuration Updated',
            message: changeDescriptions.join(', '),
            timestamp: Date.now(),
            duration: notificationDuration
        };
    }, [notificationDuration]);

    // Add notification
    const addNotification = useCallback((notification) => {
        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, notification.duration);

        if (onNotification) {
            onNotification(notification);
        }
    }, [onNotification]);

    // Detect configuration changes
    useEffect(() => {
        if (!enableNotifications) return;

        const previousConfig = previousConfigRef.current;
        const changes = {};

        Object.keys(config).forEach(key => {
            if (JSON.stringify(config[key]) !== JSON.stringify(previousConfig[key])) {
                changes[key] = config[key];
            }
        });

        if (Object.keys(changes).length > 0) {
            const notification = generateChangeNotification(changes);
            addNotification(notification);
        }

        previousConfigRef.current = config;
    }, [config, enableNotifications, generateChangeNotification, addNotification]);

    // Remove notification
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
        clearNotifications
    };
};

export default useInstagramConfigRealtime;