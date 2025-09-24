import React from 'react';
import GlassContainer from '../ui/GlassContainer';
import { useGlassMorphism } from '../../hooks/useGlassMorphism';

/**
 * Demo component showcasing glass morphism effects
 * This component demonstrates the different intensity levels and capabilities
 */
const GlassMorphismDemo = () => {
    const { capabilities, glassIntensity, shouldEnableGlass } = useGlassMorphism();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Glass Morphism Demo
                </h1>

                {/* Capabilities Display */}
                <div className="mb-8 p-4 bg-white/80 rounded-lg backdrop-blur-sm">
                    <h2 className="text-xl font-semibold mb-4">Browser Capabilities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <strong>Backdrop Filter:</strong> {capabilities.supportsBackdropFilter ? '✅' : '❌'}
                        </div>
                        <div>
                            <strong>3D Transforms:</strong> {capabilities.supportsTransform3D ? '✅' : '❌'}
                        </div>
                        <div>
                            <strong>Performance:</strong> {capabilities.performanceLevel}
                        </div>
                        <div>
                            <strong>Reduced Motion:</strong> {capabilities.reducedMotion ? '✅' : '❌'}
                        </div>
                    </div>
                    <div className="mt-2">
                        <strong>Current Intensity:</strong> {glassIntensity} |
                        <strong> Glass Enabled:</strong> {shouldEnableGlass() ? '✅' : '❌'}
                    </div>
                </div>

                {/* Glass Effect Examples */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <GlassContainer
                        intensity="subtle"
                        className="p-6 rounded-2xl"
                        fallbackClassName="bg-white/90 border border-gray-200"
                    >
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Subtle Glass</h3>
                        <p className="text-gray-600 mb-4">
                            Light glass effect with minimal blur and transparency. Perfect for mobile devices
                            and low-performance scenarios.
                        </p>
                        <div className="text-sm text-gray-500">
                            • 5% opacity<br />
                            • 10px blur<br />
                            • 120% saturation
                        </div>
                    </GlassContainer>

                    <GlassContainer
                        intensity="medium"
                        className="p-6 rounded-2xl"
                        fallbackClassName="bg-white/90 border border-gray-200"
                    >
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Medium Glass</h3>
                        <p className="text-gray-600 mb-4">
                            Balanced glass effect with moderate blur and transparency. Ideal for tablets
                            and medium-performance devices.
                        </p>
                        <div className="text-sm text-gray-500">
                            • 10% opacity<br />
                            • 20px blur<br />
                            • 150% saturation
                        </div>
                    </GlassContainer>

                    <GlassContainer
                        intensity="strong"
                        className="p-6 rounded-2xl"
                        fallbackClassName="bg-white/90 border border-gray-200"
                    >
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Strong Glass</h3>
                        <p className="text-gray-600 mb-4">
                            Intense glass effect with heavy blur and transparency. Best for desktop
                            and high-performance devices.
                        </p>
                        <div className="text-sm text-gray-500">
                            • 15% opacity<br />
                            • 30px blur<br />
                            • 180% saturation
                        </div>
                    </GlassContainer>
                </div>

                {/* Interactive Example */}
                <GlassContainer
                    intensity={glassIntensity}
                    className="p-8 rounded-3xl text-center"
                    fallbackClassName="bg-white/90 border border-gray-200"
                >
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                        Responsive Glass Container
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        This container automatically adapts its glass intensity based on your screen size
                        and device capabilities. Resize your browser window to see the effect change.
                    </p>
                    <div className="inline-flex items-center space-x-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                            Current: {glassIntensity}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                            Performance: {capabilities.performanceLevel}
                        </span>
                    </div>
                </GlassContainer>

                {/* Footer Note */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        Glass morphism effects automatically degrade gracefully on unsupported browsers
                        and respect user preferences for reduced motion.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlassMorphismDemo;