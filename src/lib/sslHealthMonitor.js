/**
 * SSL Health Monitoring for Backend API
 * Provides comprehensive SSL certificate validation and monitoring
 */

import { validateSSLCertificate, simpleGraphQLSSLCheck } from './sslValidation.js';

/**
 * SSL Health Status
 */
export class SSLHealthStatus {
    constructor() {
        this.healthy = false;
        this.lastCheck = null;
        this.certificateInfo = null;
        this.endpointStatus = null;
        this.errors = [];
        this.warnings = [];
        this.recommendations = [];
    }
}

/**
 * Health Monitor Configuration
 */
export class HealthMonitorConfig {
    constructor() {
        this.checkInterval = 5 * 60 * 1000; // 5 minutes
        this.criticalThresholdDays = 7;
        this.warningThresholdDays = 30;
        this.timeoutMs = 10000;
        this.retryAttempts = 3;
        this.retryDelayMs = 1000;
    }
}

/**
 * SSL Health Monitor
 * Monitors SSL certificate health and provides alerts
 */
export class SSLHealthMonitor {
    constructor(config = new HealthMonitorConfig()) {
        this.config = config;
        this.status = new SSLHealthStatus();
        this.intervalId = null;
        this.subscribers = [];
        this.isMonitoring = false;
    }

    /**
     * Subscribe to health status updates
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    /**
     * Notify all subscribers of status updates
     */
    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.status);
            } catch (error) {
                console.error('Error in SSL health monitor subscriber:', error);
            }
        });
    }

    /**
     * Perform comprehensive SSL health check
     */
    async checkHealth(domain = null) {
        const targetDomain = domain || window.location.hostname;
        this.status.lastCheck = new Date().toISOString();
        this.status.errors = [];
        this.status.warnings = [];
        this.status.recommendations = [];

        try {
            // Check SSL certificate
            const sslResult = await validateSSLCertificate(targetDomain);
            this.status.certificateInfo = sslResult;

            if (!sslResult.isValid) {
                this.status.errors.push('SSL certificate validation failed');
                this.status.healthy = false;
            } else {
                // Check expiration warnings
                if (sslResult.daysUntilExpiry < this.config.criticalThresholdDays) {
                    this.status.errors.push(`SSL certificate expires in ${sslResult.daysUntilExpiry} days (CRITICAL)`);
                    this.status.healthy = false;
                } else if (sslResult.daysUntilExpiry < this.config.warningThresholdDays) {
                    this.status.warnings.push(`SSL certificate expires in ${sslResult.daysUntilExpiry} days`);
                }

                // Check chain completeness
                if (!sslResult.chainComplete) {
                    this.status.warnings.push('SSL certificate chain is incomplete');
                }

                this.status.healthy = this.status.errors.length === 0;
            }

            // Check GraphQL endpoint SSL
            const graphqlCheck = await simpleGraphQLSSLCheck();
            this.status.endpointStatus = graphqlCheck;

            if (!graphqlCheck.ok) {
                this.status.errors.push(`GraphQL endpoint SSL error: ${graphqlCheck.error}`);
                this.status.healthy = false;
            }

            // Generate recommendations
            this.generateRecommendations();

        } catch (error) {
            this.status.errors.push(`Health check failed: ${error.message}`);
            this.status.healthy = false;
        }

        this.notifySubscribers();
        return this.status;
    }

    /**
     * Generate recommendations based on health status
     */
    generateRecommendations() {
        const recs = [];

        if (this.status.errors.length > 0) {
            recs.push('Check SSL certificate installation on the server');
            recs.push('Verify domain matches certificate common name');
            recs.push('Ensure certificate chain is complete (fullchain.pem)');
        }

        if (this.status.certificateInfo) {
            if (this.status.certificateInfo.daysUntilExpiry < 30) {
                recs.push('Renew SSL certificate soon');
            }

            if (this.status.certificateInfo.warnings.length > 0) {
                recs.push('Address SSL certificate warnings');
                recs.push(...this.status.certificateInfo.warnings);
            }
        }

        if (this.status.endpointStatus && !this.status.endpointStatus.ok) {
            recs.push('Check GraphQL endpoint SSL configuration');
            recs.push('Verify CORS headers are properly configured');
        }

        this.status.recommendations = recs;
    }

    /**
     * Start continuous monitoring
     */
    startMonitoring(domain = null) {
        if (this.isMonitoring) {
            console.warn('SSL health monitoring is already active');
            return;
        }

        this.isMonitoring = true;

        // Initial check
        this.checkHealth(domain);

        // Set up interval checks
        this.intervalId = setInterval(() => {
            this.checkHealth(domain);
        }, this.config.checkInterval);

        console.log(`SSL health monitoring started (interval: ${this.config.checkInterval}ms)`);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            console.warn('SSL health monitoring is not active');
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isMonitoring = false;
        console.log('SSL health monitoring stopped');
    }

    /**
     * Get current health status
     */
    getCurrentStatus() {
        return { ...this.status };
    }

    /**
     * Get health summary for dashboard display
     */
    getHealthSummary() {
        const status = this.status;

        return {
            status: status.healthy ? 'healthy' : 'unhealthy',
            lastCheck: status.lastCheck,
            daysUntilExpiry: status.certificateInfo?.daysUntilExpiry || null,
            errorsCount: status.errors.length,
            warningsCount: status.warnings.length,
            endpointStatus: status.endpointStatus?.ok ? 'up' : 'down',
            hasCriticalIssues: status.errors.length > 0,
            needsAttention: status.errors.length > 0 ||
                          (status.certificateInfo?.daysUntilExpiry || 999) < 30
        };
    }
}

/**
 * Hook for React components to use SSL health monitoring
 */
export function useSSLHealthMonitor(config) {
    const [healthStatus, setHealthStatus] = useState(null);
    const [isMonitoring, setIsMonitoring] = useState(false);

    useEffect(() => {
        const monitor = new SSLHealthMonitor(config);

        const unsubscribe = monitor.subscribe((status) => {
            setHealthStatus(status);
        });

        return () => {
            unsubscribe();
            monitor.stopMonitoring();
        };
    }, [config]);

    const startMonitoring = useCallback((domain) => {
        const monitor = new SSLHealthMonitor(config);
        monitor.startMonitoring(domain);
        setIsMonitoring(true);

        return () => {
            monitor.stopMonitoring();
            setIsMonitoring(false);
        };
    }, [config]);

    const stopMonitoring = useCallback(() => {
        const monitor = new SSLHealthMonitor(config);
        monitor.stopMonitoring();
        setIsMonitoring(false);
    }, [config]);

    return {
        healthStatus,
        isMonitoring,
        startMonitoring,
        stopMonitoring
    };
}

/**
 * SSL Health Badge Component
 */
export function SSLHealthBadge({ status, className = '' }) {
    if (!status) {
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                Unknown
            </span>
        );
    }

    const getStatusConfig = () => {
        if (!status.healthy) {
            return {
                color: 'red',
                text: 'SSL Issues',
                icon: '⚠️'
            };
        }

        if (status.warnings.length > 0) {
            return {
                color: 'yellow',
                text: 'SSL Warnings',
                icon: '⚡'
            };
        }

        if (status.certificateInfo?.daysUntilExpiry < 30) {
            return {
                color: 'yellow',
                text: 'Expiring Soon',
                icon: '⏰'
            };
        }

        return {
            color: 'green',
            text: 'SSL Secure',
            icon: '✅'
        };
    };

    const config = getStatusConfig();
    const colorClasses = {
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        green: 'bg-green-100 text-green-800'
    };

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses[config.color]} ${className}`}>
            <span className="mr-1">{config.icon}</span>
            {config.text}
        </span>
    );
}

/**
 * SSL Health Details Component
 */
export function SSLHealthDetails({ status, className = '' }) {
    if (!status) {
        return <div className={className}>No SSL health data available</div>;
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Certificate Information */}
            {status.certificateInfo && (
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Certificate Information</h3>
                    <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Domain:</dt>
                            <dd>{status.certificateInfo.domain}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Issuer:</dt>
                            <dd>{status.certificateInfo.issuer}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Valid Until:</dt>
                            <dd>{status.certificateInfo.validTo}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Days Until Expiry:</dt>
                            <dd className={status.certificateInfo.daysUntilExpiry < 30 ? 'text-red-600 font-semibold' : ''}>
                                {status.certificateInfo.daysUntilExpiry}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-600">Chain Complete:</dt>
                            <dd>{status.certificateInfo.chainComplete ? '✅ Yes' : '❌ No'}</dd>
                        </div>
                    </dl>
                </div>
            )}

            {/* Errors */}
            {status.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-2">Errors</h3>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {status.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Warnings */}
            {status.warnings.length > 0 && (
                <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <h3 className="font-semibold text-yellow-800 mb-2">Warnings</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                        {status.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendations */}
            {status.recommendations.length > 0 && (
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold text-blue-800 mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        {status.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Last Check */}
            <div className="text-xs text-gray-500">
                Last checked: {status.lastCheck ? new Date(status.lastCheck).toLocaleString() : 'Never'}
            </div>
        </div>
    );
}

// Export singleton instance
export const sslHealthMonitor = new SSLHealthMonitor();