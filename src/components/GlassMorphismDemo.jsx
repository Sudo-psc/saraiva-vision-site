import React from 'react';
import { useGlassMorphism } from '../hooks/useGlassMorphism';
import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { generateGlassStyles, createGlassCustomProperties } from '../utils/glassMorphismUtils';

/**
 * Demo component to showcase glass morphism foundation
 * This demonstrates all the implemented glass morphism utilities working together
 */
const GlassMorphismDemo = () => {
    const {
        capabilities,
        glassIntensity,
        getGlassClasses,
        getGlassStyles,
        shouldEnableGlass
    } = useGlassMorphism();

    const {
        deviceType,
        getResponsiveStyles,
        getResponsiveClasses,
        shouldEnableFeature
    } = useResponsiveDesign();

    // Generate glass styles using utilities
    const glassStyles = generateGlassStyles({ intensity: glassIntensity });
    const customProperties = createGlassCustomProperties(glassIntensity);

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-center mb-8">
                    Glass Morphism Foundation Demo
                </h1>

                {/* Capabilities Display */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h2 className="text-xl font-semibold mb-4">Device Capabilities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <strong>Device Type:</strong> {deviceType}
                        </div>
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
                        <div>
                            <strong>Touch Device:</strong> {capabilities.isTouch ? '✅' : '❌'}
                        </div>
                    </div>
                </div>

                {/* Glass Intensity Examples */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Glass Morphism Intensity Levels</h2>

                    {['subtle', 'medium', 'strong'].map((intensity) => {
                        const styles = generateGlassStyles({ intensity });
                        return (
                            <div
                                key={intensity}
                                className="p-6 rounded-xl border border-white/20"
                                style={styles}
                            >
                                <h3 className="font-semibold capitalize mb-2">{intensity} Glass Effect</h3>
                                <p className="text-sm opacity-80">
                                    This demonstrates the {intensity} intensity glass morphism effect with
                                    backdrop-filter blur and transparency.
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Responsive Glass Effects */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Responsive Glass Effects</h2>

                    <div
                        className={`p-6 rounded-xl ${getGlassClasses()} ${getResponsiveClasses()}`}
                        style={{
                            ...getGlassStyles(),
                            ...getResponsiveStyles()
                        }}
                    >
                        <h3 className="font-semibold mb-2">Auto-Responsive Glass Container</h3>
                        <p className="text-sm opacity-80">
                            Current intensity: <strong>{glassIntensity}</strong> (auto-adjusted for {deviceType})
                        </p>
                        <p className="text-sm opacity-80 mt-2">
                            Glass effects enabled: {shouldEnableGlass() ? '✅' : '❌'}
                        </p>
                    </div>
                </div>

                {/* CSS Custom Properties Demo */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">CSS Custom Properties</h2>

                    <div
                        className="p-6 rounded-xl border border-white/20"
                        style={{
                            ...customProperties,
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, var(--glass-opacity)), rgba(255, 255, 255, calc(var(--glass-opacity) * 0.5)))',
                            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturation))',
                            border: '1px solid rgba(255, 255, 255, var(--glass-border-opacity))',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, var(--glass-shadow-opacity))'
                        }}
                    >
                        <h3 className="font-semibold mb-2">Dynamic CSS Properties</h3>
                        <div className="text-sm space-y-1">
                            {Object.entries(customProperties).map(([prop, value]) => (
                                <div key={prop}>
                                    <code>{prop}: {value}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Feature Detection Results */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Feature Support Status</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: 'Glass Effects', enabled: shouldEnableFeature('glass') },
                            { name: 'Beam Animations', enabled: shouldEnableFeature('beams') },
                            { name: '3D Icons', enabled: shouldEnableFeature('3d-icons') },
                            { name: 'Glass Bubble', enabled: shouldEnableFeature('glass-bubble') },
                            { name: 'GPU Acceleration', enabled: shouldEnableFeature('gpu-acceleration') }
                        ].map((feature) => (
                            <div
                                key={feature.name}
                                className={`p-4 rounded-lg border ${feature.enabled
                                        ? 'bg-green-50 border-green-200 text-green-800'
                                        : 'bg-red-50 border-red-200 text-red-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{feature.name}</span>
                                    <span className="text-lg">
                                        {feature.enabled ? '✅' : '❌'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlassMorphismDemo;