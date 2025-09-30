/**
 * React Hook for SSL Health Monitoring
 * Provides real-time SSL certificate status and health monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { SSLHealthMonitor, SSLHealthBadge, SSLHealthDetails } from '../lib/sslHealthMonitor.js';

/**
 * Custom hook for SSL health monitoring
 * @param {Object} config - Monitor configuration
 * @param {string} domain - Domain to monitor (optional)
 * @returns {Object} SSL health monitoring state and controls
 */
export function useSSLHealthMonitor(config = {}, domain = null) {
    const [healthStatus, setHealthStatus] = useState(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [monitor] = useState(() => new SSLHealthMonitor(config));

    // Subscribe to health status updates
    useEffect(() => {
        const unsubscribe = monitor.subscribe((status) => {
            setHealthStatus(status);
            setLoading(false);
            setError(null);
        });

        return () => {
            unsubscribe();
        };
    }, [monitor]);

    // Start monitoring
    const startMonitoring = useCallback((targetDomain) => {
        const domainToMonitor = targetDomain || domain;
        if (!domainToMonitor) {
            setError('Domain is required for monitoring');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            monitor.startMonitoring(domainToMonitor);
            setIsMonitoring(true);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [monitor, domain]);

    // Stop monitoring
    const stopMonitoring = useCallback(() => {
        try {
            monitor.stopMonitoring();
            setIsMonitoring(false);
        } catch (err) {
            setError(err.message);
        }
    }, [monitor]);

    // Manual health check
    const checkHealth = useCallback(async (targetDomain) => {
        const domainToCheck = targetDomain || domain;
        if (!domainToCheck) {
            setError('Domain is required for health check');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await monitor.checkHealth(domainToCheck);
            // Status will be updated via subscription
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [monitor, domain]);

    // Get health summary
    const getHealthSummary = useCallback(() => {
        return monitor.getHealthSummary();
    }, [monitor]);

    // Auto-start monitoring if domain is provided
    useEffect(() => {
        if (domain && !isMonitoring) {
            startMonitoring(domain);
        }

        return () => {
            if (isMonitoring) {
                stopMonitoring();
            }
        };
    }, [domain, isMonitoring, startMonitoring, stopMonitoring]);

    return {
        // State
        healthStatus,
        isMonitoring,
        loading,
        error,

        // Actions
        startMonitoring,
        stopMonitoring,
        checkHealth,
        getHealthSummary,

        // Components
        SSLHealthBadge: (props) => (
            <SSLHealthBadge status={healthStatus} {...props} />
        ),
        SSLHealthDetails: (props) => (
            <SSLHealthDetails status={healthStatus} {...props} />
        )
    };
}


/**
 * Hook for dashboard SSL monitoring
 * Provides aggregated SSL status across multiple domains
 */
export function useDashboardSSLMonitor(domains = []) {
    const [statuses, setStatuses] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkAllDomains = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const results = {};
            const monitor = new SSLHealthMonitor();

            for (const domain of domains) {
                try {
                    const status = await monitor.checkHealth(domain);
                    results[domain] = status;
                } catch (err) {
                    results[domain] = {
                        healthy: false,
                        error: err.message,
                        lastCheck: new Date().toISOString()
                    };
                }
            }

            setStatuses(results);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }, [domains]);

    // Auto-check on mount and every 5 minutes
    useEffect(() => {
        if (domains.length > 0) {
            checkAllDomains();
            const interval = setInterval(checkAllDomains, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [domains, checkAllDomains]);

    const getOverallStatus = useCallback(() => {
        const domainStatuses = Object.values(statuses);
        const hasErrors = domainStatuses.some(status => !status.healthy);
        const hasWarnings = domainStatuses.some(status => status.warnings?.length > 0);

        if (hasErrors) return 'error';
        if (hasWarnings) return 'warning';
        return 'healthy';
    }, [statuses]);

    const getExpiringSoon = useCallback(() => {
        return Object.entries(statuses).filter(([domain, status]) => {
            return status.certificateInfo?.daysUntilExpiry < 30;
        }).map(([domain]) => domain);
    }, [statuses]);

    return {
        statuses,
        loading,
        error,
        overallStatus: getOverallStatus(),
        expiringSoon: getExpiringSoon(),
        checkAllDomains,
        refresh: checkAllDomains
    };
}

/**
 * SSL Health Alert Hook
 * Provides notification system for SSL issues
 */
export function useSSLHealthAlerts(config = {}) {
    const [alerts, setAlerts] = useState([]);
    const { healthStatus, startMonitoring } = useSSLHealthMonitor(config);

    useEffect(() => {
        if (!healthStatus) return;

        const newAlerts = [];

        // Critical errors
        if (healthStatus.errors.length > 0) {
            newAlerts.push({
                type: 'error',
                title: 'SSL Certificate Issues Detected',
                message: healthStatus.errors[0],
                timestamp: new Date(),
                actions: [
                    { label: 'View Details', action: () => {} },
                    { label: 'Dismiss', action: () => {} }
                ]
            });
        }

        // Expiry warnings
        if (healthStatus.certificateInfo?.daysUntilExpiry < 7) {
            newAlerts.push({
                type: 'critical',
                title: 'SSL Certificate Expiring Soon',
                message: `Certificate expires in ${healthStatus.certificateInfo.daysUntilExpiry} days`,
                timestamp: new Date(),
                actions: [
                    { label: 'Renew Now', action: () => {} },
                    { label: 'Snooze', action: () => {} }
                ]
            });
        } else if (healthStatus.certificateInfo?.daysUntilExpiry < 30) {
            newAlerts.push({
                type: 'warning',
                title: 'SSL Certificate Expiring Soon',
                message: `Certificate expires in ${healthStatus.certificateInfo.daysUntilExpiry} days`,
                timestamp: new Date(),
                actions: [
                    { label: 'Renew', action: () => {} },
                    { label: 'Dismiss', action: () => {} }
                ]
            });
        }


        setAlerts(newAlerts);
    }, [healthStatus]);

    const dismissAlert = useCallback((index) => {
        setAlerts(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearAllAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    return {
        alerts,
        healthStatus,
        startMonitoring,
        dismissAlert,
        clearAllAlerts,
        hasCriticalAlerts: alerts.some(alert => alert.type === 'critical'),
        hasWarnings: alerts.some(alert => alert.type === 'warning')
    };
}

// Default export for backward compatibility
export default useSSLHealthMonitor;