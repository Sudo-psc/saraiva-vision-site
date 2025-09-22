import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Eye,
    EyeOff,
    Zap,
    ZapOff,
    Palette,
    Settings,
    Check,
    X
} from 'lucide-react';
import InstagramFeedContainer from './InstagramFeedContainer';
import useInstagramAccessibilityEnhanced from '../../hooks/useInstagramAccessibilityEnhanced';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramAccessibilityDemo - Demonstrates high contrast and reduced motion features
 * Shows before/after comparison and allows toggling accessibility features
 */
const InstagramAccessibilityDemo = () => {
    const [demoMode, setDemoMode] = useState('normal'); // 'normal', 'high-contrast', 'reduced-motion', 'both'
    const [showComparison, setShowComparison] = useState(false);

    // Accessibility hooks
    const {
        preferences,
        updatePreference,
        getAccessibilityClasses,
        validateContrast
    } = useAccessibilityPreferences();

    const {
        instagramHighContrast,
        instagramReducedMotion,
        getInstagramHighContrastColors,
        getInstagramAnimationConfig,
        getInstagramAccessibilityClasses,
        shouldDisableInstagramFeature,
        validateInstagramContrast,
        hasAccessibilityPreferences
    } = useInstagramAccessibilityEnhanced({
        enableHighContrast: true,
        enableReducedMotion: true,
        enableSystemDetection: true
    });

    // Demo posts data
    const demoPosts = [
        {
            id: 'demo-1',
            caption: 'Beautiful sunset view from our clinic! 🌅 #SaraivaVision #EyeCare',
            media_type: 'IMAGE',
            media_url: '/img/hero.webp',
            permalink: '#',
            timestamp: '2024-01-15T18:30:00Z',
            username: 'saraivavision',
            stats: { likes: 245, comments: 18, engagement_rate: 6.2 }
        },
        {
            id: 'demo-2',
            caption: 'Advanced eye examination technology for better vision care 👁️‍🗨️',
            media_type: 'IMAGE',
            media_url: '/img/drphilipe_perfil.webp',
            permalink: '#',
            timestamp: '2024-01-14T14:20:00Z',
            username: 'saraivavision',
            stats: { likes: 189, comments: 12, engagement_rate: 5.8 }
        }
    ];

    // Toggle accessibility features
    const toggleHighContrast = () => {
        updatePreference('highContrast', !preferences.highContrast);
        setDemoMode(prev => {
            if (prev === 'normal') return 'high-contrast';
            if (prev === 'high-contrast') return 'normal';
            if (prev === 'reduced-motion') return 'both';
            if (prev === 'both') return 'reduced-motion';
            return 'normal';
        });
    };

    const toggleReducedMotion = () => {
        updatePreference('reducedMotion', !preferences.reducedMotion);
        setDemoMode(prev => {
            if (prev === 'normal') return 'reduced-motion';
            if (prev === 'reduced-motion') return 'normal';
            if (prev === 'high-contrast') return 'both';
            if (prev === 'both') return 'high-contrast';
            return 'normal';
        });
    };

    // Get demo mode description
    const getDemoModeDescription = () => {
        switch (demoMode) {
            case 'high-contrast':
                return 'High contrast mode enhances visual clarity with stronger color differences and improved focus indicators.';
            case 'reduced-motion':
                return 'Reduced motion mode disables animations and transitions for users sensitive to motion.';
            case 'both':
                return 'Combined mode provides both high contrast colors and reduced motion for maximum accessibility.';
            default:
                return 'Normal mode shows the default Instagram feed appearance with standard colors and animations.';
        }
    };

    // Get accessibility status
    const getAccessibilityStatus = () => {
        const colors = getInstagramHighContrastColors();
        const animationConfig = getInstagramAnimationConfig();

        return {
            highContrast: {
                enabled: instagramHighContrast,
                colors: colors ? {
                    background: colors.containerBg,
                    text: colors.containerText,
                    focus: colors.focusColor
                } : null
            },
            reducedMotion: {
                enabled: instagramReducedMotion,
                animationDuration: animationConfig.duration,
                featuresDisabled: [
                    'imageHover',
                    'scaleAnimations',
                    'hoverEffects',
                    'tooltipAnimations'
                ].filter(feature => shouldDisableInstagramFeature(feature))
            },
            contrastValidation: colors ?
                validateInstagramContrast(colors.containerText, colors.containerBg) :
                null
        };
    };

    const status = getAccessibilityStatus();

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Instagram Accessibility Demo
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Experience how high contrast mode and reduced motion preferences
                    improve accessibility for users with visual sensitivities or motion disorders.
                </p>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Accessibility Controls
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* High Contrast Toggle */}
                    <div className="space-y-3">
                        <button
                            onClick={toggleHighContrast}
                            className={`
                                w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all
                                ${preferences.highContrast
                                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                                }
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            `}
                            aria-pressed={preferences.highContrast}
                            aria-describedby="high-contrast-description"
                        >
                            <div className="flex items-center gap-3">
                                {preferences.highContrast ? (
                                    <Eye className="w-5 h-5" />
                                ) : (
                                    <EyeOff className="w-5 h-5" />
                                )}
                                <span className="font-medium">High Contrast Mode</span>
                            </div>
                            {preferences.highContrast ? (
                                <Check className="w-5 h-5 text-green-600" />
                            ) : (
                                <X className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                        <p id="high-contrast-description" className="text-sm text-gray-600">
                            Enhances visual clarity with stronger color differences and improved focus indicators
                        </p>
                    </div>

                    {/* Reduced Motion Toggle */}
                    <div className="space-y-3">
                        <button
                            onClick={toggleReducedMotion}
                            className={`
                                w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all
                                ${preferences.reducedMotion
                                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                                }
                                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                            `}
                            aria-pressed={preferences.reducedMotion}
                            aria-describedby="reduced-motion-description"
                        >
                            <div className="flex items-center gap-3">
                                {preferences.reducedMotion ? (
                                    <ZapOff className="w-5 h-5" />
                                ) : (
                                    <Zap className="w-5 h-5" />
                                )}
                                <span className="font-medium">Reduced Motion</span>
                            </div>
                            {preferences.reducedMotion ? (
                                <Check className="w-5 h-5 text-green-600" />
                            ) : (
                                <X className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                        <p id="reduced-motion-description" className="text-sm text-gray-600">
                            Disables animations and transitions for users sensitive to motion
                        </p>
                    </div>
                </div>

                {/* Current Mode Description */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Current Mode: {demoMode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                    <p className="text-blue-800 text-sm">{getDemoModeDescription()}</p>
                </div>
            </div>

            {/* Accessibility Status */}
            {hasAccessibilityPreferences && (
                <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-200">
                    <h2 className="text-xl font-semibold mb-4 text-green-900 flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Accessibility Status
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* High Contrast Status */}
                        {status.highContrast.enabled && (
                            <div className="space-y-3">
                                <h3 className="font-medium text-green-800">High Contrast Active</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Background:</span>
                                        <span className="font-mono">{status.highContrast.colors?.background}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Text:</span>
                                        <span className="font-mono">{status.highContrast.colors?.text}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Focus:</span>
                                        <span className="font-mono">{status.highContrast.colors?.focus}</span>
                                    </div>
                                    {status.contrastValidation && (
                                        <div className="flex justify-between">
                                            <span>Contrast Ratio:</span>
                                            <span className={`font-medium ${status.contrastValidation.aa ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {status.contrastValidation.ratio}:1
                                                {status.contrastValidation.aa && ' ✓ AA'}
                                                {status.contrastValidation.aaa && ' ✓ AAA'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reduced Motion Status */}
                        {status.reducedMotion.enabled && (
                            <div className="space-y-3">
                                <h3 className="font-medium text-green-800">Reduced Motion Active</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Animation Duration:</span>
                                        <span className="font-mono">{status.reducedMotion.animationDuration}ms</span>
                                    </div>
                                    <div>
                                        <span>Disabled Features:</span>
                                        <ul className="mt-1 ml-4 list-disc text-xs">
                                            {status.reducedMotion.featuresDisabled.map(feature => (
                                                <li key={feature}>{feature.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Demo Instagram Feed */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center">Live Demo</h2>

                {/* Mock Instagram service for demo */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <InstagramFeedContainer
                        maxPosts={2}
                        showStats={true}
                        enableAccessibility={true}
                        className="demo-instagram-feed"
                        onPostClick={(post) => {
                            console.log('Demo post clicked:', post.id);
                        }}
                    />
                </div>
            </div>

            {/* Comparison Mode Toggle */}
            <div className="text-center">
                <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {showComparison ? 'Hide' : 'Show'} Side-by-Side Comparison
                </button>
            </div>

            {/* Side-by-Side Comparison */}
            {showComparison && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid md:grid-cols-2 gap-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                >
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center">Normal Mode</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <InstagramFeedContainer
                                maxPosts={1}
                                showStats={true}
                                enableAccessibility={false}
                                className="comparison-normal"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center">Accessible Mode</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <InstagramFeedContainer
                                maxPosts={1}
                                showStats={true}
                                enableAccessibility={true}
                                className="comparison-accessible"
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Information */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h2 className="text-xl font-semibold mb-4 text-blue-900">About These Features</h2>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
                    <div>
                        <h3 className="font-medium mb-2">High Contrast Mode</h3>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Increases color contrast ratios to meet WCAG AA/AAA standards</li>
                            <li>Enhances focus indicators for better keyboard navigation</li>
                            <li>Improves text readability for users with visual impairments</li>
                            <li>Automatically detects system high contrast preferences</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Reduced Motion</h3>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Disables animations that may trigger vestibular disorders</li>
                            <li>Removes hover effects and scale transformations</li>
                            <li>Respects user's system motion preferences</li>
                            <li>Maintains functionality while reducing visual motion</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstagramAccessibilityDemo;