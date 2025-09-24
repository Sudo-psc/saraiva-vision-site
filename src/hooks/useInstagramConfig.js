import { useState, useEffect, useCallback, useContext, createContext } from 'react';

/**
 * Instagram Configuration Context
 */
const InstagramConfigContext = createContext();

/**
 * Instagram Configuration Provider
 */
export const InstagramConfigProvider = ({ children, initialConfig = {}, persistConfig = true }) => {
    const [config, setConfig] = useState(() => {
        // Try to load from localStorage if persistence is enabled
        if (persistConfig && typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('instagram-config');
                if (saved) {
                    return { ...getDefaultConfig(), ...JSON.parse(saved), ...initialConfig };
                }
            } catch (error) {
                console.warn('Failed to load Instagram config from localStorage:', error);
            }
        }

        return { ...getDefaultConfig(), ...initialConfig };
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Save config to localStorage when it changes
    useEffect(() => {
        if (persistConfig && typeof window !== 'undefined') {
            try {
                localStorage.setItem('instagram-config', JSON.stringify(config));
            } catch (error) {
                console.warn('Failed to save Instagram config to localStorage:', error);
            }
        }
    }, [config, persistConfig]);

    // Update configuration
    const updateConfig = useCallback((updates) => {
        setConfig(prev => ({ ...prev, ...updates }));
        setError(null);
    }, []);

    // Reset to default configuration
    const resetConfig = useCallback(() => {
        const defaultConfig = getDefaultConfig();
        setConfig({ ...defaultConfig, ...initialConfig });
        setError(null);
    }, [initialConfig]);

    // Save configuration (for external persistence)
    const saveConfig = useCallback(async (saveFunction) => {
        if (!saveFunction) return;

        setIsLoading(true);
        setError(null);

        try {
            await saveFunction(config);
        } catch (err) {
            setError(err.message || 'Failed to save configuration');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [config]);

    // Load configuration (from external source)
    const loadConfig = useCallback(async (loadFunction) => {
        if (!loadFunction) return;

        setIsLoading(true);
        setError(null);

        try {
            const loadedConfig = await loadFunction();
            setConfig({ ...getDefaultConfig(), ...loadedConfig });
        } catch (err) {
            setError(err.message || 'Failed to load configuration');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Validate configuration
    const validateConfig = useCallback((configToValidate = config) => {
        const errors = [];

        // Validate maxPosts
        if (configToValidate.maxPosts < 1 || configToValidate.maxPosts > 20) {
            errors.push('Number of posts must be between 1 and 20');
        }

        // Validate captionLength
        if (configToValidate.captionLength < 50 || configToValidate.captionLength > 300) {
            errors.push('Caption length must be between 50 and 300 characters');
        }

        // Validate refreshInterval
        if (configToValidate.refreshInterval < 60000) {
            errors.push('Refresh interval must be at least 1 minute');
        }

        // Validate custom colors if using custom color scheme
        if (configToValidate.colorScheme === 'custom') {
            const colorRegex = /^#[0-9A-F]{6}$/i;
            Object.entries(configToValidate.customColors).forEach(([key, value]) => {
                if (!colorRegex.test(value)) {
                    errors.push(`Invalid color format for ${key}: ${value}`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [config]);

    // Get filtered configuration for specific use cases
    const getDisplayConfig = useCallback(() => {
        return {
            maxPosts: config.maxPosts,
            layout: config.layout,
            showStats: config.showStats,
            showCaptions: config.showCaptions,
            captionLength: config.captionLength
        };
    }, [config]);

    const getContentConfig = useCallback(() => {
        return {
            hashtags: config.hashtags,
            excludeHashtags: config.excludeHashtags,
            contentTypes: config.contentTypes,
            minLikes: config.minLikes
        };
    }, [config]);

    const getAppearanceConfig = useCallback(() => {
        return {
            theme: config.theme,
            colorScheme: config.colorScheme,
            customColors: config.customColors,
            borderRadius: config.borderRadius,
            spacing: config.spacing
        };
    }, [config]);

    const getPerformanceConfig = useCallback(() => {
        return {
            lazyLoading: config.lazyLoading,
            imageOptimization: config.imageOptimization,
            cacheEnabled: config.cacheEnabled,
            refreshInterval: config.refreshInterval
        };
    }, [config]);

    const getAccessibilityConfig = useCallback(() => {
        return {
            highContrast: config.highContrast,
            reducedMotion: config.reducedMotion,
            altTextEnabled: config.altTextEnabled,
            keyboardNavigation: config.keyboardNavigation
        };
    }, [config]);

    const value = {
        config,
        updateConfig,
        resetConfig,
        saveConfig,
        loadConfig,
        validateConfig,
        isLoading,
        error,

        // Filtered configs
        getDisplayConfig,
        getContentConfig,
        getAppearanceConfig,
        getPerformanceConfig,
        getAccessibilityConfig
    };

    return (
        <InstagramConfigContext.Provider value={value}>
            {children}
        </InstagramConfigContext.Provider>
    );
};

/**
 * Hook to use Instagram configuration
 */
export const useInstagramConfig = () => {
    const context = useContext(InstagramConfigContext);

    if (!context) {
        throw new Error('useInstagramConfig must be used within an InstagramConfigProvider');
    }

    return context;
};

/**
 * Hook for standalone configuration management (without provider)
 */
export const useInstagramConfigStandalone = (initialConfig = {}, options = {}) => {
    const { persistConfig = true, autoSave = false } = options;

    const [config, setConfig] = useState(() => {
        // Try to load from localStorage if persistence is enabled
        if (persistConfig && typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('instagram-config');
                if (saved) {
                    return { ...getDefaultConfig(), ...JSON.parse(saved), ...initialConfig };
                }
            } catch (error) {
                console.warn('Failed to load Instagram config from localStorage:', error);
            }
        }

        return { ...getDefaultConfig(), ...initialConfig };
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    // Auto-save to localStorage when config changes
    useEffect(() => {
        if (persistConfig && typeof window !== 'undefined' && isDirty) {
            try {
                localStorage.setItem('instagram-config', JSON.stringify(config));
                if (autoSave) {
                    setIsDirty(false);
                }
            } catch (error) {
                console.warn('Failed to save Instagram config to localStorage:', error);
            }
        }
    }, [config, persistConfig, autoSave, isDirty]);

    // Update configuration
    const updateConfig = useCallback((updates) => {
        setConfig(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
        setError(null);
    }, []);

    // Reset configuration
    const resetConfig = useCallback(() => {
        const defaultConfig = getDefaultConfig();
        setConfig({ ...defaultConfig, ...initialConfig });
        setIsDirty(false);
        setError(null);
    }, [initialConfig]);

    // Manual save
    const saveConfig = useCallback(async (saveFunction) => {
        if (!saveFunction) {
            setIsDirty(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await saveFunction(config);
            setIsDirty(false);
        } catch (err) {
            setError(err.message || 'Failed to save configuration');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [config]);

    // Validate configuration
    const validateConfig = useCallback((configToValidate = config) => {
        const errors = [];

        // Validate maxPosts
        if (configToValidate.maxPosts < 1 || configToValidate.maxPosts > 20) {
            errors.push('Number of posts must be between 1 and 20');
        }

        // Validate captionLength
        if (configToValidate.captionLength < 50 || configToValidate.captionLength > 300) {
            errors.push('Caption length must be between 50 and 300 characters');
        }

        // Validate refreshInterval
        if (configToValidate.refreshInterval < 60000) {
            errors.push('Refresh interval must be at least 1 minute');
        }

        // Validate custom colors if using custom color scheme
        if (configToValidate.colorScheme === 'custom') {
            const colorRegex = /^#[0-9A-F]{6}$/i;
            Object.entries(configToValidate.customColors).forEach(([key, value]) => {
                if (!colorRegex.test(value)) {
                    errors.push(`Invalid color format for ${key}: ${value}`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [config]);

    return {
        config,
        updateConfig,
        resetConfig,
        saveConfig,
        validateConfig,
        isLoading,
        error,
        isDirty
    };
};

/**
 * Get default configuration
 */
export const getDefaultConfig = () => ({
    // Display settings
    maxPosts: 4,
    layout: 'grid', // 'grid', 'carousel', 'list'
    showStats: true,
    showCaptions: true,
    captionLength: 100,

    // Content filtering
    hashtags: [],
    excludeHashtags: [],
    contentTypes: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'],
    minLikes: 0,

    // Appearance
    theme: 'light', // 'light', 'dark', 'auto'
    colorScheme: 'default', // 'default', 'brand', 'custom'
    borderRadius: 'medium', // 'none', 'small', 'medium', 'large'
    spacing: 'medium', // 'compact', 'medium', 'spacious'

    // Custom colors (when colorScheme is 'custom')
    customColors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        background: '#FFFFFF',
        text: '#111827',
        border: '#E5E7EB'
    },

    // Performance
    lazyLoading: true,
    imageOptimization: true,
    cacheEnabled: true,
    refreshInterval: 300000, // 5 minutes

    // Accessibility
    highContrast: false,
    reducedMotion: false,
    altTextEnabled: true,
    keyboardNavigation: true
});

/**
 * Configuration validation schema
 */
export const configSchema = {
    maxPosts: { type: 'number', min: 1, max: 20, required: true },
    layout: { type: 'string', enum: ['grid', 'carousel', 'list'], required: true },
    showStats: { type: 'boolean', required: true },
    showCaptions: { type: 'boolean', required: true },
    captionLength: { type: 'number', min: 50, max: 300, required: true },
    hashtags: { type: 'array', items: { type: 'string' }, required: true },
    excludeHashtags: { type: 'array', items: { type: 'string' }, required: true },
    contentTypes: { type: 'array', items: { type: 'string', enum: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'] }, required: true },
    minLikes: { type: 'number', min: 0, required: true },
    theme: { type: 'string', enum: ['light', 'dark', 'auto'], required: true },
    colorScheme: { type: 'string', enum: ['default', 'brand', 'custom'], required: true },
    borderRadius: { type: 'string', enum: ['none', 'small', 'medium', 'large'], required: true },
    spacing: { type: 'string', enum: ['compact', 'medium', 'spacious'], required: true },
    customColors: {
        type: 'object',
        properties: {
            primary: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
            secondary: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
            background: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
            text: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
            border: { type: 'string', pattern: '^#[0-9A-F]{6}$' }
        },
        required: true
    },
    lazyLoading: { type: 'boolean', required: true },
    imageOptimization: { type: 'boolean', required: true },
    cacheEnabled: { type: 'boolean', required: true },
    refreshInterval: { type: 'number', min: 60000, required: true },
    highContrast: { type: 'boolean', required: true },
    reducedMotion: { type: 'boolean', required: true },
    altTextEnabled: { type: 'boolean', required: true },
    keyboardNavigation: { type: 'boolean', required: true }
};

export default useInstagramConfig;