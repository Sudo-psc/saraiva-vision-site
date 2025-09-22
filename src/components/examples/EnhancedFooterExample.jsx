import React, { useState } from 'react';
import EnhancedFooter from '../EnhancedFooter';

/**
 * Example component demonstrating EnhancedFooter usage
 * Shows different configurations and customization options
 */
const EnhancedFooterExample = () => {
    const [glassOpacity, setGlassOpacity] = useState(0.1);
    const [enableAnimations, setEnableAnimations] = useState(true);
    const [beamIntensity, setBeamIntensity] = useState('medium');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Demo Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                        Enhanced Footer Demo
                    </h1>

                    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-semibold mb-6">Configuration Options</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Glass Opacity Control */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Glass Opacity: {glassOpacity}
                                </label>
                                <input
                                    type="range"
                                    min="0.05"
                                    max="0.3"
                                    step="0.05"
                                    value={glassOpacity}
                                    onChange={(e) => setGlassOpacity(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Animations Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enable Animations
                                </label>
                                <button
                                    onClick={() => setEnableAnimations(!enableAnimations)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${enableAnimations
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                        }`}
                                >
                                    {enableAnimations ? 'Enabled' : 'Disabled'}
                                </button>
                            </div>

                            {/* Beam Intensity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Beam Intensity
                                </label>
                                <select
                                    value={beamIntensity}
                                    onChange={(e) => setBeamIntensity(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="subtle">Subtle</option>
                                    <option value="medium">Medium</option>
                                    <option value="strong">Strong</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-3 text-blue-600">
                                🔮 Glass Morphism
                            </h3>
                            <p className="text-gray-600">
                                Modern glass effects with configurable opacity and blur intensity
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-3 text-green-600">
                                📱 Responsive Design
                            </h3>
                            <p className="text-gray-600">
                                Adapts glass effects based on screen size and device capabilities
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-3 text-purple-600">
                                ⚡ Performance Optimized
                            </h3>
                            <p className="text-gray-600">
                                Uses intersection observer and graceful degradation for optimal performance
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-3 text-orange-600">
                                ♿ Accessibility
                            </h3>
                            <p className="text-gray-600">
                                Respects reduced motion preferences and high contrast mode
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-3 text-red-600">
                                🔄 Backward Compatible
                            </h3>
                            <p className="text-gray-600">
                                Wraps existing Footer component without breaking changes
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-3 text-indigo-600">
                                🎨 Customizable
                            </h3>
                            <p className="text-gray-600">
                                Configurable glass opacity, animations, and beam intensity
                            </p>
                        </div>
                    </div>

                    {/* Spacer to demonstrate scroll behavior */}
                    <div className="h-96 flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg text-white text-xl font-semibold">
                        Scroll down to see the Enhanced Footer
                    </div>
                </div>
            </div>

            {/* Enhanced Footer with current configuration */}
            <EnhancedFooter
                glassOpacity={glassOpacity}
                enableAnimations={enableAnimations}
                beamIntensity={beamIntensity}
                className="enhanced-footer-demo"
            />
        </div>
    );
};

export default EnhancedFooterExample;