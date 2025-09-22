import React from 'react';

/**
 * Error boundary specifically designed for animated components
 * Provides fallback rendering when animations fail
 */
class AnimationErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('Animation Error Boundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
            hasError: true
        });

        // Report to error tracking service if available
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = () => {
        if (this.state.retryCount < 3) {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: this.state.retryCount + 1
            });
        }
    };

    render() {
        if (this.state.hasError) {
            // Render fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback with retry option
            return (
                <div className="animation-error-fallback">
                    {this.props.showErrorDetails && process.env.NODE_ENV === 'development' ? (
                        <div className="error-details">
                            <h3>Animation Error</h3>
                            <p>{this.state.error?.message}</p>
                            <details>
                                <summary>Error Details</summary>
                                <pre>{this.state.error?.stack}</pre>
                                <pre>{this.state.errorInfo?.componentStack}</pre>
                            </details>
                        </div>
                    ) : (
                        <div className="simple-fallback">
                            {this.props.children}
                        </div>
                    )}

                    {this.state.retryCount < 3 && (
                        <button
                            onClick={this.handleRetry}
                            className="retry-button"
                            style={{
                                padding: '8px 16px',
                                margin: '8px 0',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry Animation ({3 - this.state.retryCount} attempts left)
                        </button>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default AnimationErrorBoundary;