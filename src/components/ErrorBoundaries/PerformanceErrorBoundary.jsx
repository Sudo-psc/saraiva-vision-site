import React from 'react';

/**
 * Error boundary for performance-sensitive components
 * Automatically degrades to simpler versions when errors occur
 */
class PerformanceErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            performanceLevel: 'high',
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Performance Error Boundary caught an error:', error, errorInfo);

        const newErrorCount = this.state.errorCount + 1;
        let newPerformanceLevel = this.state.performanceLevel;

        // Degrade performance level based on error frequency
        if (newErrorCount >= 3) {
            newPerformanceLevel = 'low';
        } else if (newErrorCount >= 2) {
            newPerformanceLevel = 'medium';
        }

        this.setState({
            hasError: true,
            errorCount: newErrorCount,
            performanceLevel: newPerformanceLevel
        });

        // Notify parent component of performance degradation
        if (this.props.onPerformanceDegradation) {
            this.props.onPerformanceDegradation(newPerformanceLevel, error);
        }

        // Auto-retry with degraded performance after a delay
        setTimeout(() => {
            this.setState({ hasError: false });
        }, 1000);
    }

    render() {
        if (this.state.hasError) {
            // Show loading state while recovering
            return (
                <div className="performance-recovery">
                    <div className="loading-spinner" style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <span>Optimizing performance...</span>
                </div>
            );
        }

        // Pass performance level to children
        return React.cloneElement(this.props.children, {
            performanceLevel: this.state.performanceLevel,
            errorCount: this.state.errorCount
        });
    }
}

export default PerformanceErrorBoundary;