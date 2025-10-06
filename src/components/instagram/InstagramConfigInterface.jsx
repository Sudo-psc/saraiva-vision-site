import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Save,
    RotateCcw,
    Eye,
    EyeOff,
    Palette,
    Grid,
    List,
    Hash,
    Filter,
    Monitor,
    Smartphone,
    Tablet,
    CheckCircle,
    AlertCircle,
    Info,
    Download,
    Upload
} from 'lucide-react';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramConfigInterface - Admin configuration interface for Instagram integration
 * Allows administrators to configure display settings, content filtering, and appearance
 */
const InstagramConfigInterface = ({
    initialConfig = {},
    onConfigChange = null,
    onSave = null,
    onReset = null,
    onPreview = null,
    showPreview = true,
    className = ''
}) => {
    // Default configuration
    const defaultConfig = {
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
    };

    // State management
    const [config, setConfig] = useState({ ...defaultConfig, ...initialConfig });
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
    const [activeTab, setActiveTab] = useState('display');
    const [previewMode, setPreviewMode] = useState('desktop');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Accessibility
    const {
        shouldReduceMotion,
        getAnimationConfig,
        getAccessibilityClasses,
        getAccessibilityStyles
    } = useAccessibilityPreferences();

    // Update config and mark as dirty
    const updateConfig = useCallback((updates) => {
        setConfig(prev => {
            const newConfig = { ...prev, ...updates };
            setIsDirty(true);

            // Call onChange callback
            if (onConfigChange) {
                onConfigChange(newConfig);
            }

            return newConfig;
        });
    }, [onConfigChange]);

    // Handle save
    const handleSave = async () => {
        if (!onSave) return;

        setIsSaving(true);
        setSaveStatus(null);

        try {
            await onSave(config);
            setIsDirty(false);
            setSaveStatus('success');

            // Clear success status after 3 seconds
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Failed to save configuration:', error);
            setSaveStatus('error');

            // Clear error status after 5 seconds
            setTimeout(() => setSaveStatus(null), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle reset
    const handleReset = () => {
        setConfig({ ...defaultConfig, ...initialConfig });
        setIsDirty(false);
        setSaveStatus(null);

        if (onReset) {
            onReset();
        }
    };

    // Handle preview
    const handlePreview = () => {
        if (onPreview) {
            onPreview(config, previewMode);
        }
    };

    // Export configuration
    const handleExport = () => {
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `instagram-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    // Import configuration
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedConfig = JSON.parse(e.target.result);
                setConfig({ ...defaultConfig, ...importedConfig });
                setIsDirty(true);
            } catch (error) {
                console.error('Failed to import configuration:', error);
                setSaveStatus('error');
            }
        };
        reader.readAsText(file);
    };

    const animationConfig = getAnimationConfig();

    // Animation variants
    const tabVariants = shouldReduceMotion() ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: animationConfig.duration }
        }
    };

    // Tab configuration
    const tabs = [
        { id: 'display', label: 'Display', icon: Monitor },
        { id: 'content', label: 'Content', icon: Filter },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'performance', label: 'Performance', icon: Settings },
        { id: 'accessibility', label: 'Accessibility', icon: Eye }
    ];

    return (
        <div className={`instagram-config-interface ${getAccessibilityClasses()} ${className}`} style={getAccessibilityStyles()}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings className="w-6 h-6 text-gray-600" />
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Instagram Configuration
                            </h1>
                            <p className="text-sm text-gray-600">
                                Configure display settings, content filtering, and appearance
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                        {/* Export/Import */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                title="Export configuration"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            <label className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer">
                                <Upload className="w-4 h-4" />
                                Import
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Preview toggle */}
                        {showPreview && (
                            <button
                                onClick={() => setPreviewMode(prev =>
                                    prev === 'desktop' ? 'mobile' : 'desktop'
                                )}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors"
                            >
                                {previewMode === 'desktop' ? (
                                    <>
                                        <Monitor className="w-4 h-4" />
                                        Desktop
                                    </>
                                ) : (
                                    <>
                                        <Smartphone className="w-4 h-4" />
                                        Mobile
                                    </>
                                )}
                            </button>
                        )}

                        {/* Reset */}
                        <button
                            onClick={handleReset}
                            disabled={!isDirty}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Status messages */}
                <AnimatePresence>
                    {saveStatus && (
                        <motion.div
                            className={`mt-3 p-3 rounded-md flex items-center gap-2 ${saveStatus === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {saveStatus === 'success' ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Configuration saved successfully!
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4" />
                                    Failed to save configuration. Please try again.
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dirty state indicator */}
                {isDirty && !saveStatus && (
                    <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        You have unsaved changes
                    </div>
                )}
            </div>

            {/* Tab navigation */}
            <div className="bg-white border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Configuration tabs">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${isActive
                                        ? 'border-cyan-500 text-cyan-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <IconComponent className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={tabVariants}
                        initial={shouldReduceMotion() ? false : "hidden"}
                        animate={shouldReduceMotion() ? false : "visible"}
                        className="p-6"
                    >
                        {activeTab === 'display' && (
                            <DisplaySettings config={config} updateConfig={updateConfig} />
                        )}
                        {activeTab === 'content' && (
                            <ContentSettings config={config} updateConfig={updateConfig} />
                        )}
                        {activeTab === 'appearance' && (
                            <AppearanceSettings config={config} updateConfig={updateConfig} />
                        )}
                        {activeTab === 'performance' && (
                            <PerformanceSettings config={config} updateConfig={updateConfig} />
                        )}
                        {activeTab === 'accessibility' && (
                            <AccessibilitySettings config={config} updateConfig={updateConfig} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// Display Settings Component
const DisplaySettings = ({ config, updateConfig }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h2>

            {/* Number of posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Posts
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={config.maxPosts}
                        onChange={(e) => updateConfig({ maxPosts: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Maximum number of posts to display (1-20)
                    </p>
                </div>

                {/* Layout */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layout Style
                    </label>
                    <select
                        value={config.layout}
                        onChange={(e) => updateConfig({ layout: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="grid">Grid</option>
                        <option value="carousel">Carousel</option>
                        <option value="list">List</option>
                    </select>
                </div>
            </div>

            {/* Display options */}
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Display Options</h3>
                <div className="space-y-3">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={config.showStats}
                            onChange={(e) => updateConfig({ showStats: e.target.checked })}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show engagement statistics</span>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={config.showCaptions}
                            onChange={(e) => updateConfig({ showCaptions: e.target.checked })}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show post captions</span>
                    </label>
                </div>
            </div>

            {/* Caption length */}
            {config.showCaptions && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption Length
                    </label>
                    <input
                        type="range"
                        min="50"
                        max="300"
                        value={config.captionLength}
                        onChange={(e) => updateConfig({ captionLength: parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>50 chars</span>
                        <span>{config.captionLength} chars</span>
                        <span>300 chars</span>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// Content Settings Component  
const ContentSettings = ({ config, updateConfig }) => {
    const [newHashtag, setNewHashtag] = useState('');
    const [newExcludeHashtag, setNewExcludeHashtag] = useState('');

    const addHashtag = (hashtag, isExclude = false) => {
        if (!hashtag.trim()) return;

        const cleanHashtag = hashtag.replace('#', '').trim().toLowerCase();
        const key = isExclude ? 'excludeHashtags' : 'hashtags';

        if (!config[key].includes(cleanHashtag)) {
            updateConfig({
                [key]: [...config[key], cleanHashtag]
            });
        }

        if (isExclude) {
            setNewExcludeHashtag('');
        } else {
            setNewHashtag('');
        }
    };

    const removeHashtag = (hashtag, isExclude = false) => {
        const key = isExclude ? 'excludeHashtags' : 'hashtags';
        updateConfig({
            [key]: config[key].filter(h => h !== hashtag)
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Content Filtering</h2>

                {/* Content types */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Content Types
                    </label>
                    <div className="space-y-2">
                        {['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].map(type => (
                            <label key={type} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.contentTypes.includes(type)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateConfig({
                                                contentTypes: [...config.contentTypes, type]
                                            });
                                        } else {
                                            updateConfig({
                                                contentTypes: config.contentTypes.filter(t => t !== type)
                                            });
                                        }
                                    }}
                                    className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 capitalize">
                                    {type.toLowerCase().replace('_', ' ')}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Include hashtags */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Include Hashtags
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newHashtag}
                            onChange={(e) => setNewHashtag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addHashtag(newHashtag)}
                            placeholder="Enter hashtag (without #)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => addHashtag(newHashtag)}
                            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {config.hashtags.map(hashtag => (
                            <span
                                key={hashtag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-cyan-800 rounded-md text-sm"
                            >
                                #{hashtag}
                                <button
                                    onClick={() => removeHashtag(hashtag)}
                                    className="text-cyan-600 hover:text-cyan-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Only show posts with these hashtags (leave empty to show all)
                    </p>
                </div>

                {/* Exclude hashtags */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exclude Hashtags
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newExcludeHashtag}
                            onChange={(e) => setNewExcludeHashtag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addHashtag(newExcludeHashtag, true)}
                            placeholder="Enter hashtag to exclude"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => addHashtag(newExcludeHashtag, true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {config.excludeHashtags.map(hashtag => (
                            <span
                                key={hashtag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm"
                            >
                                #{hashtag}
                                <button
                                    onClick={() => removeHashtag(hashtag, true)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Minimum likes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Likes
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={config.minLikes}
                        onChange={(e) => updateConfig({ minLikes: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Only show posts with at least this many likes
                    </p>
                </div>
            </div>
        </div>
    );
};

// Appearance Settings Component
const AppearanceSettings = ({ config, updateConfig }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance</h2>

            {/* Theme */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                    </label>
                    <select
                        value={config.theme}
                        onChange={(e) => updateConfig({ theme: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Scheme
                    </label>
                    <select
                        value={config.colorScheme}
                        onChange={(e) => updateConfig({ colorScheme: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="default">Default</option>
                        <option value="brand">Brand Colors</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
            </div>

            {/* Custom colors */}
            {config.colorScheme === 'custom' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Colors</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(config.customColors).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                                    {key}
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={value}
                                        onChange={(e) => updateConfig({
                                            customColors: {
                                                ...config.customColors,
                                                [key]: e.target.value
                                            }
                                        })}
                                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => updateConfig({
                                            customColors: {
                                                ...config.customColors,
                                                [key]: e.target.value
                                            }
                                        })}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Border radius and spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Border Radius
                    </label>
                    <select
                        value={config.borderRadius}
                        onChange={(e) => updateConfig({ borderRadius: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spacing
                    </label>
                    <select
                        value={config.spacing}
                        onChange={(e) => updateConfig({ spacing: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="compact">Compact</option>
                        <option value="medium">Medium</option>
                        <option value="spacious">Spacious</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
);

// Performance Settings Component
const PerformanceSettings = ({ config, updateConfig }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Performance</h2>

            {/* Performance options */}
            <div className="space-y-4 mb-6">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={config.lazyLoading}
                        onChange={(e) => updateConfig({ lazyLoading: e.target.checked })}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable lazy loading</span>
                </label>

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={config.imageOptimization}
                        onChange={(e) => updateConfig({ imageOptimization: e.target.checked })}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable image optimization</span>
                </label>

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={config.cacheEnabled}
                        onChange={(e) => updateConfig({ cacheEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable caching</span>
                </label>
            </div>

            {/* Refresh interval */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Interval
                </label>
                <select
                    value={config.refreshInterval}
                    onChange={(e) => updateConfig({ refreshInterval: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                    <option value={600000}>10 minutes</option>
                    <option value={1800000}>30 minutes</option>
                    <option value={3600000}>1 hour</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    How often to check for new posts
                </p>
            </div>
        </div>
    </div>
);

// Accessibility Settings Component
const AccessibilitySettings = ({ config, updateConfig }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Accessibility</h2>

            <div className="space-y-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={config.altTextEnabled}
                        onChange={(e) => updateConfig({ altTextEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Generate alt text for images</span>
                </label>

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={config.keyboardNavigation}
                        onChange={(e) => updateConfig({ keyboardNavigation: e.target.checked })}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable keyboard navigation</span>
                </label>

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={config.highContrast}
                        onChange={(e) => updateConfig({ highContrast: e.target.checked })}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">High contrast mode</span>
                </label>

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={config.reducedMotion}
                        onChange={(e) => updateConfig({ reducedMotion: e.target.checked })}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Reduced motion</span>
                </label>
            </div>
        </div>
    </div>
);

export default InstagramConfigInterface;