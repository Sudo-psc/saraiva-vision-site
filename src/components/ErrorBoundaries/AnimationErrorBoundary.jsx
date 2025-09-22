import React from 'react';

/**
 * Error boundary specifically for animated components
 * Provides fallback rendering when animations fail
 */
class AnimationErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error for debugging
        console.error('Animation Error Boundary caught an error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Report to error tracking service if available
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'exception', {
                description: `Animation Error: ${error.message}`,
                fatal: false
            });
        }
    }

    render() {
        if (this.state.hasError) {
            // Render fallback UI
            const { fallback: Fallback, children, fallbackProps = {} } = this.props;

            if (Fallback) {
                return <Fallback {...fallbackProps} error={this.state.error} />;
            }

            // Default fallback - render children without animations
            return (
                <div className="animation-fallback" style={{
                    opacity: 1,
                    transform: 'none',
                    transition: 'none'
                }}>
                    {typeof children === 'function' ?
                        children({ hasAnimationError: true }) :
                        children
                    }
                </div>
            );
        }

        return this.props.children;
    }
}

export default AnimationErrorBoundary;