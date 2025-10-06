import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ZapOff, Settings, Monitor, User } from 'lucide-react';
import InstagramFeedContainer from './InstagramFeedContainer';
import useInstagramAccessibilityEnhanced from '../../hooks/useInstagramAccessibilityEnhanced';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * Demo component showcasing Instagram high contrast and reduced motion features
 * Allows users to test and toggle accessibility settings
 */
const InstagramAccessibilityDemo = () => {
    const [demoSettings, setDemoSettings] = useState({
        highContrast: false,
        reducedMotion: false,
        darkMode: false,
        forceFocus: false,
        largeText: false
    });

    const [showSystemInfo, setShowSystemInfo] = useState(false);

    // Get accessibility preferences
    const {
        preferences,
        systemPreferences,
        updatePreference,
        togglePreference,
        resetToSystemDefaults,
        validateContrast,
        isHighContrast,
        isReducedMotion,
        isDarkMode
    } = useAccessibilityPreferences();

    // Get Instagram-specific accessibility features
    const {
        instagramHighContrast,
        instagramReducedMotion,
        systemHighContrast,
        systemReducedMotion,
        getInstagramHighContrastColors,
        getInstagramAnimationConfig,
        getInstagramAccessibilityClasses,
        getInstagramAccessibilityStyles,
        getInstagramFocusStyles,
        validateInstagramContrast,
        shouldDisableInstagramFeature,
        hasAccessibilityPreferences
    } = useInstagramAccessibilityEnhanced({
        enableHighContrast: true,
        enableReducedMotion: true,
        enableSystemDetection: true
    });

    // Handle demo setting changes
    const handleDemoSettingChange = (setting, value) => {
        setDemoSettings(prev => ({
            ...prev,
            [setting]: value
        }));

        // Also update the actual preference for demonstration
        updatePreference(setting, value);
    };

    // Get current colors for demonstration
    const highContrastColors = getInstagramHighContrastColors();
    const animationConfig = getInstagramAnimationConfig();
    const accessibilityClasses = getInstagramAccessibilityClasses();
    const accessibilityStyles = getInstagramAccessibilityStyles();
    const focusStyles = getInstagramFocusStyles();

    // Validate some example color combinations
    const contrastExamples = [
        { fg: '#000000', bg: '#ffffff', label: 'Black on White' },
        { fg: '#ffffff', bg: '#000000', label: 'White on Black' },
        { fg: '#0000ff', bg: '#ffffff', label: 'Blue on White' },
        { fg: '#ff0000', bg: '#ffffff', label: 'Red on White' },
        { fg: '#008000', bg: '#ffffff', label: 'Green on White' }
    ];

    const contrastResults = contrastExamples.map(example => ({
        ...example,
        result: validateInstagramContrast(example.fg, example.bg, 'normal')
    }));

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ${accessibilityClasses}`} style={accessibilityStyles}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Instagram Accessibility Demo
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Test high contrast mode and reduced motion support for Instagram components
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Accessibility Controls
                            </h2>

                            {/* High Contrast Toggle */}
                            <div className="mb-4">
                                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {preferences.highContrast ? (
                                            <Eye className="w-5 h-5 text-cyan-600" />
                                        ) : (
                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                High Contrast Mode
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Enhanced visibility and contrast
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.highContrast}
                                        onChange={(e) => handleDemoSettingChange('highContrast', e.target.checked)}
                                        className="w-5 h-5 text-cyan-600 rounded focus:ring-2 focus:ring-blue-500"
                                        style={focusStyles}
                                    />
                                </label>
                            </div>

                            {/* Reduced Motion Toggle */}
                            <div className="mb-4">
                                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {preferences.reducedMotion ? (
                                            <ZapOff className="w-5 h-5 text-orange-600" />
                                        ) : (
                                            <Zap className="w-5 h-5 text-gray-400" />
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                Reduced Motion
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Minimize animations and transitions
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.reducedMotion}
                                        onChange={(e) => handleDemoSettingChange('reducedMotion', e.target.checked)}
                                        className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                                        style={focusStyles}
                                    />
                                </label>
                            </div>

                            {/* Dark Mode Toggle */}
                            <div className="mb-4">
                                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Monitor className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                Dark Mode
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Dark color scheme
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.darkMode}
                                        onChange={(e) => handleDemoSettingChange('darkMode', e.target.checked)}
                                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                        style={focusStyles}
                                    />
                                </label>
                            </div>

                            {/* Force Focus Toggle */}
                            <div className="mb-4">
                                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-green-600" />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                Enhanced Focus
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Stronger focus indicators
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.forceFocus}
                                        onChange={(e) => handleDemoSettingChange('forceFocus', e.target.checked)}
                                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                        style={focusStyles}
                                    />
                                </label>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={resetToSystemDefaults}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                style={focusStyles}
                            >
                                Reset to System Defaults
                            </button>
                        </div>

                        {/* System Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <button
                                onClick={() => setShowSystemInfo(!showSystemInfo)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    System Information
                                </h3>
                                <motion.div
                                    animate={{ rotate: showSystemInfo ? 180 : 0 }}
                                    transition={{ duration: animationConfig.duration }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </motion.div>
                            </button>

                            {showSystemInfo && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: animationConfig.duration }}
                                    className="mt-4 space-y-3"
                                >
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-700 dark:text-gray-300">System Preferences:</div>
                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                                            <li>High Contrast: {systemHighContrast ? '✓ Enabled' : '✗ Disabled'}</li>
                                            <li>Reduced Motion: {systemReducedMotion ? '✓ Enabled' : '✗ Disabled'}</li>
                                            <li>Dark Mode: {systemPreferences.darkMode ? '✓ Enabled' : '✗ Disabled'}</li>
                                        </ul>
                                    </div>

                                    <div className="text-sm">
                                        <div className="font-medium text-gray-700 dark:text-gray-300">Instagram Settings:</div>
                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-400">
                                            <li>High Contrast: {instagramHighContrast ? '✓ Active' : '✗ Inactive'}</li>
                                            <li>Reduced Motion: {instagramReducedMotion ? '✓ Active' : '✗ Inactive'}</li>
                                            <li>Has Preferences: {hasAccessibilityPreferences ? '✓ Yes' : '✗ No'}</li>
                                        </ul>
                                    </div>

                                    <div className="text-sm">
                                        <div className="font-medium text-gray-700 dark:text-gray-300">Animation Config:</div>
                                        <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-400 font-mono text-xs">
                                            <li>Duration: {animationConfig.duration}s</li>
                                            <li>Hover Effects: {animationConfig.hoverEffects ? '✓' : '✗'}</li>
                                            <li>Image Transitions: {animationConfig.imageTransitions ? '✓' : '✗'}</li>
                                            <li>Loading Animations: {animationConfig.loadingAnimations ? '✓' : '✗'}</li>
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Instagram Feed Demo */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Instagram Feed with Accessibility Features
                            </h2>

                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                <InstagramFeedContainer
                                    maxPosts={4}
                                    showStats={true}
                                    enableAccessibility={true}
                                    layout="grid"
                                    theme="auto"
                                />
                            </div>
                        </div>

                        {/* Color Contrast Information */}
                        {instagramHighContrast && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    High Contrast Colors
                                </h3>

                                {highContrastColors && (
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Container Colors:</div>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: highContrastColors.containerBg }}
                                                    />
                                                    <span>Background: {highContrastColors.containerBg}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: highContrastColors.containerText }}
                                                    />
                                                    <span>Text: {highContrastColors.containerText}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: highContrastColors.focusColor }}
                                                    />
                                                    <span>Focus: {highContrastColors.focusColor}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Semantic Colors:</div>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: highContrastColors.likesColor }}
                                                    />
                                                    <span>Likes: {highContrastColors.likesColor}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: highContrastColors.commentsColor }}
                                                    />
                                                    <span>Comments: {highContrastColors.commentsColor}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: highContrastColors.engagementColor }}
                                                    />
                                                    <span>Engagement: {highContrastColors.engagementColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Contrast Validation Results */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Color Contrast Validation
                                    </h4>
                                    <div className="space-y-2">
                                        {contrastResults.map((example, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex">
                                                        <div
                                                            className="w-6 h-6 border border-gray-300"
                                                            style={{ backgroundColor: example.bg }}
                                                        />
                                                        <div
                                                            className="w-6 h-6 border border-gray-300 flex items-center justify-center text-xs font-bold"
                                                            style={{
                                                                backgroundColor: example.bg,
                                                                color: example.fg
                                                            }}
                                                        >
                                                            A
                                                        </div>
                                                    </div>
                                                    <span className="text-sm">{example.label}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-mono">
                                                        {example.result.ratio ? `${example.result.ratio}:1` : 'N/A'}
                                                    </div>
                                                    <div className="text-xs">
                                                        {example.result.valid ? (
                                                            <span className="text-green-600">✓ WCAG AA</span>
                                                        ) : (
                                                            <span className="text-red-600">✗ Fails</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Feature Status */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Feature Status
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Disabled Features (Reduced Motion)
                                    </h4>
                                    <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                        <li>Image Hover: {shouldDisableInstagramFeature('imageHover') ? '✗ Disabled' : '✓ Enabled'}</li>
                                        <li>Scale Animations: {shouldDisableInstagramFeature('scaleAnimations') ? '✗ Disabled' : '✓ Enabled'}</li>
                                        <li>Hover Effects: {shouldDisableInstagramFeature('hoverEffects') ? '✗ Disabled' : '✓ Enabled'}</li>
                                        <li>Loading Animations: {shouldDisableInstagramFeature('loadingAnimations') ? '✗ Disabled' : '✓ Enabled'}</li>
                                        <li>Tooltip Animations: {shouldDisableInstagramFeature('tooltipAnimations') ? '✗ Disabled' : '✓ Enabled'}</li>
                                        <li>Autoplay: {shouldDisableInstagramFeature('autoplay') ? '✗ Disabled' : '✓ Enabled'}</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Current Settings
                                    </h4>
                                    <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                        <li>High Contrast: {isHighContrast ? '✓ Active' : '✗ Inactive'}</li>
                                        <li>Reduced Motion: {isReducedMotion ? '✓ Active' : '✗ Inactive'}</li>
                                        <li>Dark Mode: {isDarkMode ? '✓ Active' : '✗ Inactive'}</li>
                                        <li>Force Focus: {preferences.forceFocus ? '✓ Active' : '✗ Inactive'}</li>
                                        <li>Large Text: {preferences.largeText ? '✓ Active' : '✗ Inactive'}</li>
                                        <li>Colorblind Friendly: {preferences.colorBlindFriendly ? '✓ Active' : '✗ Inactive'}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstagramAccessibilityDemo;