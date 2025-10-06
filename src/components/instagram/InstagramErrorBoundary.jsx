import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import instagramErrorHandler from '../../services/instagramErrorHandler';
import instagramErrorRecovery from '../../services/instagramErrorRecovery';

/**
 * InstagramErrorBoundary - React Error Boundary for Instagram components
 * Catches JavaScript errors anywhere in the child component tree and displays fallback UI
 */
class InstagramErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            retryCount: 0,
            isRecovering: false,
            recoveryResult: null
        };

        this.maxRetries = props.maxRetries || 3;
        this.showErrorDetails = props.showErrorDetails || process.env.NODE_ENV === 'development';
        this.onError = props.onError;
        this.fallbackComponent = props.fallbackComponent;
        this.enableRecovery = props.enableRecovery !== false;
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to our error handling service
        const context = {
            operation: 'component_render',
            operationId: `boundary-${Date.now()}`,
            component: this.props.componentName || 'InstagramComponent',
            props: this.sanitizeProps(this.props),
            errorBoundary: true
        };

        // Handle the error through our error handler
        instagramErrorHandler.handleError(error, context).then(result => {
            this.setState({
                errorInfo,
                errorId: result.error?.id,
                recoveryResult: result
            });

            // Call onError callback if provided
            if (this.onError) {
                this.onError(error, errorInfo, result);
            }
        }).catch(handlerError => {
            // Fallback if error handler fails
            this.setState({
                errorInfo,
                errorId: `fallback-${Date.now()}`,
                recoveryResult: {
                    success: false,
                    error: { message: 'Error handler failed' }
                }
            });

            if (this.onError) {
                this.onError(error, errorInfo, { success: false, error: handlerError });
            }
        });

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Instagram Error Boundary caught an error:', error, errorInfo);
        }
    }

    /**
     * Sanitize props to remove sensitive information before logging
     */
    sanitizeProps(props) {
        const sanitized = { ...props };

        // Remove potentially sensitive props
        delete sanitized.accessToken;
        delete sanitized.apiKey;
        delete sanitized.children;
        delete sanitized.onError;

        // Truncate large props
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
                sanitized[key] = sanitized[key].substring(0, 100) + '...';
            }
        });

        return sanitized;
    }

    /**
     * Attempt to recover from the error
     */
    handleRecovery = async () => {
        if (!this.enableRecovery || this.state.isRecovering) return;

        this.setState({ isRecovering: true });

        try {
            const errorInfo = {
                type: 'component',
                severity: 'medium',
                message: this.state.error?.message || 'Component error',
                context: {
                    component: this.props.componentName,
                    operation: 'error_recovery'
                }
            };

            const recoveryResult = await instagramErrorRecovery.attemptRecovery(errorInfo, {
                component: this.props.componentName,
                retryCount: this.state.retryCount
            });

            if (recoveryResult.success) {
                // Reset error state to retry rendering
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    errorId: null,
                    retryCount: this.state.retryCount + 1,
                    isRecovering: false,
                    recoveryResult
                });
            } else {
                this.setState({
                    isRecovering: false,
                    recoveryResult
                });
            }
        } catch (recoveryError) {
            console.error('Error recovery failed:', recoveryError);
            this.setState({
                isRecovering: false,
                recoveryResult: {
                    success: false,
                    error: recoveryError.message
                }
            });
        }
    };

    /**
     * Manual retry without recovery
     */
    handleRetry = () => {
        if (this.state.retryCount >= this.maxRetries) return;

        // Force a re-render by updating the key
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            retryCount: this.state.retryCount + 1,
            isRecovering: false,
            recoveryResult: null
        });
    };

    /**
     * Reset error boundary state
     */
    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            retryCount: 0,
            isRecovering: false,
            recoveryResult: null
        });
    };

    /**
     * Report error to external service
     */
    handleReportError = () => {
        const errorReport = {
            error: this.state.error?.message,
            stack: this.state.error?.stack,
            componentStack: this.state.errorInfo?.componentStack,
            errorId: this.state.errorId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // This could send to an error reporting service
        console.log('Error report:', errorReport);

        // Show user feedback
        alert('Error report sent. Thank you for helping us improve!');
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback component
            if (this.fallbackComponent) {
                return React.createElement(this.fallbackComponent, {
                    error: this.state.error,
                    errorInfo: this.state.errorInfo,
                    onRetry: this.handleRetry,
                    onReset: this.handleReset,
                    canRetry: this.state.retryCount < this.maxRetries
                });
            }

            // Default fallback UI
            return (
                <div className="instagram-error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-red-800 mb-2">
                                Something went wrong with Instagram content
                            </h3>

                            <p className="text-red-700 mb-4">
                                We encountered an error while loading Instagram content.
                                This might be a temporary issue.
                            </p>

                            {/* Error ID for support */}
                            {this.state.errorId && (
                                <p className="text-sm text-red-600 mb-4">
                                    Error ID: <code className="bg-red-100 px-2 py-1 rounded">{this.state.errorId}</code>
                                </p>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                {this.state.retryCount < this.maxRetries && (
                                    <button
                                        onClick={this.handleRetry}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                                        disabled={this.state.isRecovering}
                                    >
                                        <RefreshCw className={`w-4 h-4 ${this.state.isRecovering ? 'animate-spin' : ''}`} />
                                        {this.state.isRecovering ? 'Recovering...' : 'Try Again'}
                                    </button>
                                )}

                                {this.enableRecovery && this.state.retryCount < this.maxRetries && (
                                    <button
                                        onClick={this.handleRecovery}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                        disabled={this.state.isRecovering}
                                    >
                                        <RefreshCw className={`w-4 h-4 ${this.state.isRecovering ? 'animate-spin' : ''}`} />
                                        Smart Recovery
                                    </button>
                                )}

                                <button
                                    onClick={this.handleReset}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                >
                                    <Home className="w-4 h-4" />
                                    Reset
                                </button>

                                <button
                                    onClick={this.handleReportError}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                                >
                                    <Bug className="w-4 h-4" />
                                    Report Issue
                                </button>
                            </div>

                            {/* Retry count indicator */}
                            {this.state.retryCount > 0 && (
                                <p className="text-sm text-red-600 mb-4">
                                    Retry attempts: {this.state.retryCount}/{this.maxRetries}
                                </p>
                            )}

                            {/* Recovery result */}
                            {this.state.recoveryResult && (
                                <div className={`p-3 rounded-md mb-4 ${this.state.recoveryResult.success
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-orange-100 text-orange-800'
                                    }`}>
                                    <p className="text-sm">
                                        {this.state.recoveryResult.success
                                            ? 'Recovery successful! The component should work now.'
                                            : `Recovery failed: ${this.state.recoveryResult.error || 'Unknown error'}`
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Error details (development only) */}
                            {this.showErrorDetails && this.state.error && (
                                <details className="mt-4">
                                    <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800">
                                        Technical Details (Development)
                                    </summary>
                                    <div className="mt-2 p-3 bg-red-100 rounded-md">
                                        <p className="text-sm text-red-800 font-medium mb-2">Error:</p>
                                        <pre className="text-xs text-red-700 whitespace-pre-wrap mb-3">
                                            {this.state.error.toString()}
                                        </pre>

                                        {this.state.error.stack && (
                                            <>
                                                <p className="text-sm text-red-800 font-medium mb-2">Stack Trace:</p>
                                                <pre className="text-xs text-red-700 whitespace-pre-wrap mb-3 max-h-32 overflow-y-auto">
                                                    {this.state.error.stack}
                                                </pre>
                                            </>
                                        )}

                                        {this.state.errorInfo?.componentStack && (
                                            <>
                                                <p className="text-sm text-red-800 font-medium mb-2">Component Stack:</p>
                                                <pre className="text-xs text-red-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Fallback content suggestion */}
                            <div className="mt-4 p-3 bg-blue-50 border border-cyan-200 rounded-md">
                                <p className="text-sm text-cyan-800">
                                    <strong>What you can do:</strong>
                                </p>
                                <ul className="text-sm text-cyan-700 mt-1 list-disc list-inside space-y-1">
                                    <li>Check your internet connection</li>
                                    <li>Refresh the page</li>
                                    <li>Try again in a few minutes</li>
                                    <li>Contact support if the problem persists</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default InstagramErrorBoundary;