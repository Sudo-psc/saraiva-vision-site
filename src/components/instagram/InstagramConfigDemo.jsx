import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Eye,
    Code,
    Download,
    Copy,
    CheckCircle
} from 'lucide-react';
import InstagramConfigInterface from './InstagramConfigInterface';
import InstagramConfigPreview from './InstagramConfigPreview';
import { useInstagramConfigStandalone } from '../../hooks/useInstagramConfig';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramConfigDemo - Complete configuration demo with interface and preview
 * Demonstrates the full configuration system with live preview
 */
const InstagramConfigDemo = ({ className = '' }) => {
    const [activeView, setActiveView] = useState('split'); // 'config', 'preview', 'split'
    const [previewMode, setPreviewMode] = useState('desktop');
    const [showCode, setShowCode] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Configuration management
    const {
        config,
        updateConfig,
        resetConfig,
        saveConfig,
        validateConfig,
        isLoading,
        error,
        isDirty
    } = useInstagramConfigStandalone();

    // Accessibility
    const {
        shouldReduceMotion,
        getAnimationConfig,
        getAccessibilityClasses,
        getAccessibilityStyles
    } = useAccessibilityPreferences();

    // Handle configuration save
    const handleSave = async () => {
        // Simulate API save
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Configuration saved:', config);
    };

    // Handle configuration reset
    const handleReset = () => {
        resetConfig();
    };

    // Handle preview mode change
    const handlePreviewModeChange = (mode) => {
        setPreviewMode(mode);
    };

    // Generate configuration code
    const generateConfigCode = () => {
        return `import InstagramFeedContainer from './components/instagram/InstagramFeedContainer';

const config = ${JSON.stringify(config, null, 2)};

function MyInstagramFeed() {
  return (
    <InstagramFeedContainer
      config={config}
      maxPosts={${config.maxPosts}}
      layout="${config.layout}"
      showStats={${config.showStats}}
      showCaptions={${config.showCaptions}}
      theme="${config.theme}"
      // ... other props
    />
  );
}`;
    };

    // Copy configuration code
    const copyConfigCode = async () => {
        try {
            await navigator.clipboard.writeText(generateConfigCode());
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    };

    // Export configuration
    const exportConfig = () => {
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

    const animationConfig = getAnimationConfig();

    return (
        <div className={`instagram-config-demo ${getAccessibilityClasses()} ${className}`} style={getAccessibilityStyles()}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Instagram Configuration Demo
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Configure your Instagram feed settings and see live preview
                        </p>
                    </div>

                    {/* View controls */}
                    <div className="flex items-center gap-4">
                        {/* View mode selector */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            {[
                                { mode: 'config', icon: Settings, label: 'Config Only' },
                                { mode: 'split', icon: Eye, label: 'Split View' },
                                { mode: 'preview', icon: Eye, label: 'Preview Only' }
                            ].map(({ mode, icon: Icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => setActiveView(mode)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                        ${activeView === mode
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }
                                    `}
                                    title={label}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowCode(!showCode)}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                <Code className="w-4 h-4" />
                                {showCode ? 'Hide Code' : 'Show Code'}
                            </button>

                            <button
                                onClick={exportConfig}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-4 mt-4">
                    {isDirty && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Unsaved changes
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {config.maxPosts} posts • {config.layout} layout • {config.theme} theme
                    </div>
                </div>
            </div>

            {/* Code panel */}
            {showCode && (
                <motion.div
                    className="bg-gray-900 text-gray-100 p-4 border-b border-gray-200"
                    initial={shouldReduceMotion() ? false : { height: 0, opacity: 0 }}
                    animate={shouldReduceMotion() ? false : { height: 'auto', opacity: 1 }}
                    exit={shouldReduceMotion() ? false : { height: 0, opacity: 0 }}
                    transition={shouldReduceMotion() ? {} : animationConfig}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium">Generated Configuration Code</h3>
                        <button
                            onClick={copyConfigCode}
                            className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                        >
                            {copySuccess ? (
                                <>
                                    <CheckCircle className="w-3 h-3" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                    <pre className="text-xs overflow-x-auto bg-gray-800 p-3 rounded">
                        <code>{generateConfigCode()}</code>
                    </pre>
                </motion.div>
            )}

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Configuration panel */}
                {(activeView === 'config' || activeView === 'split') && (
                    <motion.div
                        className={`
                            bg-white border-r border-gray-200 overflow-y-auto
                            ${activeView === 'split' ? 'w-1/2' : 'w-full'}
                        `}
                        layout={!shouldReduceMotion()}
                        transition={shouldReduceMotion() ? {} : animationConfig}
                    >
                        <InstagramConfigInterface
                            initialConfig={config}
                            onConfigChange={updateConfig}
                            onSave={handleSave}
                            onReset={handleReset}
                            showPreview={false}
                            className="h-full"
                        />
                    </motion.div>
                )}

                {/* Preview panel */}
                {(activeView === 'preview' || activeView === 'split') && (
                    <motion.div
                        className={`
                            bg-gray-50 overflow-y-auto
                            ${activeView === 'split' ? 'w-1/2' : 'w-full'}
                        `}
                        layout={!shouldReduceMotion()}
                        transition={shouldReduceMotion() ? {} : animationConfig}
                    >
                        <div className="p-6">
                            <InstagramConfigPreview
                                config={config}
                                previewMode={previewMode}
                                onPreviewModeChange={handlePreviewModeChange}
                                showControls={true}
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Configuration validation: {validateConfig().isValid ? (
                            <span className="text-green-600 font-medium">Valid</span>
                        ) : (
                            <span className="text-red-600 font-medium">
                                {validateConfig().errors.length} errors
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            disabled={!isDirty}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Reset to Defaults
                        </button>

                        <button
                            onClick={() => saveConfig(handleSave)}
                            disabled={!isDirty || isLoading || !validateConfig().isValid}
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>

                {/* Validation errors */}
                {!validateConfig().isValid && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <h4 className="text-sm font-medium text-red-800 mb-2">Configuration Errors:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                            {validateConfig().errors.map((error, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    {error}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstagramConfigDemo;