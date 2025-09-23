import React from 'react';

/**
 * Specialized error boundary for glass morphism effects
 * Provides graceful fallback when CSS features are not supported
 */
class GlassEffectErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            fallbackMode: false,
            supportsBackdropFilter: true
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Glass Effect Error Boundary caught an error:', error, errorInfo);

        // Check if error is related to backdrop-filter support
        const isBackdropFilterError = error.message?.includes('backdrop-filter') ||
            error.message?.includes('filter') ||
            error.stack?.includes('backdrop');

        this.setState({
            hasError: true,
            fallbackMode: true,
            supportsBackdropFilter: !isBackdropFilterError
        });

        // Notify parent of fallback mode
        if (this.props.onFallback) {
            this.props.onFallback({
                supportsBackdropFilter: !isBackdropFilterError,
                error: error.message
            });
        }

        // Auto-recover in fallback mode
        setTimeout(() => {
            this.setState({ hasError: false });
        }, 100);
    }

    render() {
        const { children, fallbackComponent: FallbackComponent } = this.props;

        if (this.state.hasError && !this.state.fallbackMode) {
            // Show loading while switching to fallback
            return (
                <div className="glass-effect-loading">
                    Loading...
                </div>
            );
        }

        // Render with fallback props if in fallback mode
        if (this.state.fallbackMode) {
            if (FallbackComponent) {
                return <FallbackComponent {...this.props} />;
            }

            // Default fallback: render children with disabled glass effects
            return React.cloneElement(children, {
                enableGlassEffect: false,
                enableBackdropFilter: this.state.supportsBackdropFilter,
                fallbackMode: true
            });
        }

        return children;
    }
}

export default GlassEffectErrorBoundary;