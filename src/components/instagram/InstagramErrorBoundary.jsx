import React from 'react';
import { AlertTriangle, RefreshCw, Home, ExternalLink } from 'lucide-react';

/**
 * InstagramErrorBoundary - Error boundary component for Instagram feed
 * Catches JavaScript errors and provides fallback UI with recovery options
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
            lastErrorTime: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            errorId: `ig-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging (without sensitive information)
        const sanitizedError = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            retryCount: this.state.retryCount
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Instagram Error Boundary caught an error:', sanitizedError);
        }

        // Send to error reporting service (without sensitive data)
        this.reportError(sanitizedError);

        this.setState({
            error,
            errorInfo,
            lastErrorTime: Date.now()
        });
    }

    reportError = (errorData) => {
        try {
            // In a real application, send to error reporting service
            // Example: Sentry, LogRocket, or custom error endpoint
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'exception', {
                    description: `Instagram Error: ${errorData.message}`,
                    fatal: false,
                    error_id: errorData.errorId
                });
            }

            // Could also send to custom error endpoint
            // fetch('/api/errors', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(errorData)
            // }).catch(() => {}); // Fail silently if error reporting fails
        } catch (reportingError) {
            // Fail silently if error reporting fails
            console.warn('Failed to report error:', reportingError);
        }
    };

    handleRetry = () => {
        const now = Date.now();
        const timeSinceLastError = now - (this.state.lastErrorTime || 0);

        // Implement exponential backoff - don't allow retry too quickly
        const minRetryDelay = Math.min(1000 * Math.pow(2, this.state.retryCount), 30000); // Max 30 seconds

        if (timeSinceLastError < minRetryDelay) {
            // Show user they need to wait
            const waitTime = Math.ceil((minRetryDelay - timeSinceLastError) / 1000);
            alert(`Please wait ${waitTime} seconds before retrying.`);
            return;
        }

        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1,
            lastErrorTime: now
        }));

        // Trigger a re-render of the component
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    };

    handleReportIssue = () => {
        const errorDetails = {
            errorId: this.state.errorId,
            message: this.state.error?.message || 'Unknown error',
            timestamp: new Date().toISOString()
        };

        // Open email client or support form
        const subject = encodeURIComponent('Instagram Feed Error Report');
        const body = encodeURIComponent(
            `Error ID: ${errorDetails.errorId}\n` +
            `Time: ${errorDetails.timestamp}\n` +
            `Message: ${errorDetails.message}\n\n` +
            `Please describe what you were doing when this error occurred:`
        );

        window.open(`mailto:support@saraivavision.com?subject=${subject}&body=${body}`);
    };

    getErrorSeverity = () => {
        const errorMessage = this.state.error?.message || '';

        // Categorize errors by severity
        if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
            return 'network';
        } else if (errorMessage.includes('Permission') || errorMessage.includes('Auth')) {
            return 'auth';
        } else if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
            return 'rate-limit';
        } else {
            return 'unknown';
        }
    };

    getErrorMessage = () => {
        const severity = this.getErrorSeverity();

        switch (severity) {
            case 'network':
                return {
                    title: 'Connection Issue',
                    message: 'Unable to load Instagram content. Please check your internet connection.',
                    suggestion: 'Try refreshing the page or check your network connection.'
                };
            case 'auth':
                return {
                    title: 'Authentication Error',
                    message: 'There was an issue accessing Instagram content.',
                    suggestion: 'This issue has been reported to our team. Please try again later.'
                };
            case 'rate-limit':
                return {
                    title: 'Rate Limit Exceeded',
                    message: 'Too many requests to Instagram. Please wait a moment.',
                    suggestion: 'Instagram limits how often we can fetch content. Please try again in a few minutes.'
                };
            default:
                return {
                    title: 'Something Went Wrong',
                    message: 'An unexpected error occurred while loading Instagram content.',
                    suggestion: 'Please try refreshing the page. If the problem persists, contact support.'
                };
        }
    };

    render() {
        if (this.state.hasError) {
            const errorDetails = this.getErrorMessage();
            const canRetry = this.state.retryCount < 3; // Limit retry attempts
            const severity = this.getErrorSeverity();

            return (
                <div className="instagram-error-boundary bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        {/* Error Icon */}
                        <div className={`
                            p-3 rounded-full
                            ${severity === 'network' ? 'bg-orange-100 text-orange-600' :
                                severity === 'auth' ? 'bg-red-100 text-red-600' :
                                    severity === 'rate-limit' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-red-100 text-red-600'}
                        `}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        {/* Error Message */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {errorDetails.title}
                            </h3>
                            <p className="text-gray-700 max-w-md">
                                {errorDetails.message}
                            </p>
                            <p className="text-sm text-gray-600">
                                {errorDetails.suggestion}
                            </p>
                        </div>

                        {/* Error ID for support */}
                        {this.state.errorId && (
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                                Error ID: {this.state.errorId}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-center">
                            {canRetry && (
                                <button
                                    onClick={this.handleRetry}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    aria-describedby="retry-description"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Try Again
                                </button>
                            )}

                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh Page
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                <Home className="w-4 h-4" />
                                Go Home
                            </button>

                            <button
                                onClick={this.handleReportIssue}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Report Issue
                            </button>
                        </div>

                        {/* Retry Information */}
                        {!canRetry && (
                            <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-3">
                                <p>Maximum retry attempts reached. Please refresh the page or contact support if the issue persists.</p>
                            </div>
                        )}

                        {/* Hidden descriptions for screen readers */}
                        <div className="sr-only">
                            <div id="retry-description">
                                Attempt to reload the Instagram content. This will try to fetch the data again.
                            </div>
                        </div>

                        {/* Development Error Details */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left w-full max-w-2xl">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Development Error Details
                                </summary>
                                <div className="mt-2 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto">
                                    <div className="mb-2">
                                        <strong>Error:</strong> {this.state.error.message}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Stack:</strong>
                                        <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                                    </div>
                                    {this.state.errorInfo && (
                                        <div>
                                            <strong>Component Stack:</strong>
                                            <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default InstagramErrorBoundary;