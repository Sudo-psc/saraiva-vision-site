import React, { useState } from 'react';
import { useFooterPerformanceOptimization } from '../hooks/useFooterPerformanceOptimization';
import AnimationErrorBoundary from './ErrorBoundaries/AnimationErrorBoundary';
import PerformanceErrorBoundary from './ErrorBoundaries/PerformanceErrorBoundary';

/**
 * Demo component showcasing the performance monitoring system
 */
const PerformanceMonitorDemo = () => {
    const [debugMode, setDebugMode] = useState(false);
    const [simulateError, setSimulateError] = useState(false);

    const optimization = useFooterPerformanceOptimization({
        enableAutoOptimization: true,
        debugMode
    });

    const cssProperties = optimization.getCSSProperties();
    const componentProps = optimization.getComponentProps();

    // Component that might throw errors for testing
    const TestComponent = () => {
        if (simulateError) {
            throw new Error('Simulated animation error');
        }
        return (
            <div
                className="test-animation"
                style={{
                    ...cssProperties,
                    padding: '20px',
                    background: `rgba(255, 255, 255, ${componentProps.glassOpacity})`,
                    backdropFilter: componentProps.enableGlassEffect ?
                        `blur(${componentProps.glassBlur}px)` : 'none',
                    transform: componentProps.enable3DTransforms ?
                        'perspective(1000px) rotateX(5deg)' : 'none',
                    transition: `all ${componentProps.animationDuration}ms ease`,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}
            >
                <h3>Performance Test Component</h3>
                <p>Optimization Level: {optimization.optimizationLevel}</p>
                <p>Performance Level: {componentProps.performanceLevel}</p>
                <p>FPS: {optimization.performanceMonitor.currentFPS}</p>
            </div>
        );
    };

    return (
        <div className="performance-monitor-demo" style={{ padding: '20px', maxWidth: '800px' }}>
            <h2>Performance Monitoring System Demo</h2>

            {/* Controls */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setDebugMode(!debugMode)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: debugMode ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {debugMode ? 'Disable' : 'Enable'} Debug Mode
                </button>

                <button
                    onClick={() => setSimulateError(!simulateError)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: simulateError ? '#dc3545' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {simulateError ? 'Stop' : 'Simulate'} Error
                </button>

                <button
                    onClick={() => optimization.setManualOptimization('low')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Force Low Performance
                </button>

                <button
                    onClick={() => optimization.setManualOptimization('high')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Reset to High Performance
                </button>
            </div>

            {/* Performance Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <h4>Optimization Level</h4>
                    <p style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: optimization.isOptimal ? '#28a745' :
                            optimization.isMinimal ? '#dc3545' : '#ffc107'
                    }}>
                        {optimization.optimizationLevel.toUpperCase()}
                    </p>
                </div>

                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <h4>Current FPS</h4>
                    <p style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: optimization.performanceMonitor.currentFPS >= 55 ? '#28a745' :
                            optimization.performanceMonitor.currentFPS >= 30 ? '#ffc107' : '#dc3545'
                    }}>
                        {optimization.performanceMonitor.currentFPS}
                    </p>
                </div>

                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <h4>Device Type</h4>
                    <p style={{ fontSize: '16px' }}>
                        {optimization.deviceCapabilities.capabilities.isMobile ? 'Mobile' :
                            optimization.deviceCapabilities.capabilities.isTablet ? 'Tablet' : 'Desktop'}
                        {optimization.deviceCapabilities.capabilities.isLowEndDevice && ' (Low-end)'}
                    </p>
                </div>

                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <h4>Motion Preference</h4>
                    <p style={{ fontSize: '16px' }}>
                        {optimization.reducedMotion.prefersReducedMotion ? 'Reduced' : 'Normal'}
                    </p>
                </div>
            </div>

            {/* Test Components with Error Boundaries */}
            <PerformanceErrorBoundary
                onPerformanceDegradation={(level, error) => {
                    console.log('Performance degraded to:', level, error);
                }}
            >
                <AnimationErrorBoundary
                    onError={(error, errorInfo) => {
                        console.error('Animation error:', error, errorInfo);
                    }}
                    showErrorDetails={debugMode}
                >
                    <TestComponent />
                </AnimationErrorBoundary>
            </PerformanceErrorBoundary>

            {/* Feature Support */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Feature Support</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {[
                        { name: 'Backdrop Filter', supported: optimization.deviceCapabilities.isSupported('backdropFilter') },
                        { name: '3D Transforms', supported: optimization.deviceCapabilities.isSupported('transform3D') },
                        { name: 'WebGL', supported: optimization.deviceCapabilities.isSupported('webgl') },
                        { name: 'Intersection Observer', supported: optimization.deviceCapabilities.isSupported('intersectionObserver') }
                    ].map(feature => (
                        <div key={feature.name} style={{
                            padding: '10px',
                            backgroundColor: feature.supported ? '#d4edda' : '#f8d7da',
                            color: feature.supported ? '#155724' : '#721c24',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}>
                            {feature.name}: {feature.supported ? '✓' : '✗'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Debug Information */}
            {debugMode && optimization.debugInfo && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <h3>Debug Information</h3>
                    <pre style={{
                        fontSize: '12px',
                        overflow: 'auto',
                        backgroundColor: '#ffffff',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                    }}>
                        {JSON.stringify(optimization.debugInfo, null, 2)}
                    </pre>
                </div>
            )}

            {/* Effect Status */}
            <div style={{ marginTop: '20px' }}>
                <h3>Effect Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                    {[
                        { name: 'Glass Effects', enabled: optimization.shouldEnableEffect('glass') },
                        { name: '3D Transforms', enabled: optimization.shouldEnableEffect('3d') },
                        { name: 'Beam Background', enabled: optimization.shouldEnableEffect('beams') },
                        { name: 'Complex Animations', enabled: optimization.shouldEnableEffect('animations') }
                    ].map(effect => (
                        <div key={effect.name} style={{
                            padding: '10px',
                            backgroundColor: effect.enabled ? '#d1ecf1' : '#f8d7da',
                            color: effect.enabled ? '#0c5460' : '#721c24',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontSize: '14px'
                        }}>
                            {effect.name}: {effect.enabled ? 'ON' : 'OFF'}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PerformanceMonitorDemo;