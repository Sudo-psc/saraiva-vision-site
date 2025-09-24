/**
 * Real-time Audit Monitoring Hook
 * Provides real-time monitoring capabilities for audit logs and system health
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for real-time audit monitoring
 * @param {Object} options - Configuration options
 * @returns {Object} Monitoring state and controls
 */
export const useAuditMonitoring = (options = {}) => {
    const {
        autoRefresh = true,
        refreshInterval = 30000, // 30 seconds
        timeRange = '24h',
        enableRealTimeAlerts = true,
        alertCheckInterval = 10000, // 10 seconds
        onAlert = null,
        onError = null
    } = options;

    // State management
    const [dashboardData, setDashboardData] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [lastUpdate, setLastUpdate] = useState(null);

    // Refs for intervals and cleanup
    const refreshIntervalRef = useRef(null);
    const alertIntervalRef = useRef(null);
    const abortControllerRef = useRef(null);

    /**
     * Fetch dashboard data from API
     */
    const fetchDashboardData = useCallback(async () => {
        try {
            // Cancel previous request if still pending
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();
            setConnectionStatus('connecting');

            const response = await fetch(`/api/monitoring/audit?action=dashboard&timeRange=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('audit_token') || 'demo_token'}`,
                    'Content-Type': 'application/json'
                },
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setDashboardData(data.data);
                setError(null);
                setConnectionStatus('connected');
                setLastUpdate(new Date());
            } else {
                throw new Error(data.error?.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                return; // Request was cancelled, ignore
            }

            console.error('Dashboard fetch error:', err);
            setError(err.message);
            setConnectionStatus('error');

            if (onError) {
                onError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [timeRange, onError]);

    /**
     * Check for real-time alerts
     */
    const checkRealTimeAlerts = useCallback(async () => {
        try {
            const response = await fetch('/api/monitoring/audit?action=real-time-alerts', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('audit_token') || 'demo_token'}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success && data.data.hasNewAlerts) {
                    const newAlerts = data.data.alerts;
                    setAlerts(prevAlerts => {
                        // Merge new alerts with existing ones, avoiding duplicates
                        const existingIds = new Set(prevAlerts.map(alert => alert.id || alert.type + alert.timestamp));
                        const uniqueNewAlerts = newAlerts.filter(alert =>
                            !existingIds.has(alert.id || alert.type + alert.timestamp)
                        );

                        if (uniqueNewAlerts.length > 0 && onAlert) {
                            uniqueNewAlerts.forEach(alert => onAlert(alert));
                        }

                        return [...prevAlerts, ...uniqueNewAlerts].slice(-50); // Keep last 50 alerts
                    });
                }
            }
        } catch (err) {
            console.error('Alert check error:', err);
        }
    }, [onAlert]);

    /**
     * Acknowledge an alert
     */
    const acknowledgeAlert = useCallback(async (alertId, acknowledgedBy, notes = '') => {
        try {
            const response = await fetch('/api/monitoring/audit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('audit_token') || 'demo_token'}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'acknowledge-alert',
                    alertId,
                    acknowledgedBy,
                    notes
                })
            });

            if (response.ok) {
                const data = await response.json();

                if (data.success) {
                    // Update local alert state
                    setAlerts(prevAlerts =>
                        prevAlerts.map(alert =>
                            (alert.id || alert.type + alert.timestamp) === alertId
                                ? { ...alert, acknowledged: true, acknowledgedBy, notes }
                                : alert
                        )
                    );

                    return { success: true, data: data.data };
                } else {
                    throw new Error(data.error?.message || 'Failed to acknowledge alert');
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Alert acknowledgment error:', err);
            return { success: false, error: err.message };
        }
    }, []);

    /**
     * Generate and download compliance report
     */
    const generateReport = useCallback(async (reportType, filters = {}, format = 'json') => {
        try {
            setLoading(true);

            const response = await fetch('/api/monitoring/audit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('audit_token') || 'demo_token'}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'generate-report',
                    reportType,
                    filters,
                    format
                })
            });

            if (response.ok) {
                if (format === 'csv') {
                    const csvData = await response.text();
                    const blob = new Blob([csvData], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${reportType}_${Date.now()}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);

                    return { success: true, message: 'Report downloaded successfully' };
                } else {
                    const data = await response.json();
                    return { success: true, data: data.data };
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Report generation error:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Perform security analysis on event data
     */
    const analyzeSecurityEvent = useCallback(async (eventData, context) => {
        try {
            const response = await fetch('/api/monitoring/audit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('audit_token') || 'demo_token'}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'security-analysis',
                    eventData,
                    context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, data: data.data };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Security analysis error:', err);
            return { success: false, error: err.message };
        }
    }, []);

    /**
     * Monitor compliance for event data
     */
    const monitorCompliance = useCallback(async (eventData, context) => {
        try {
            const response = await fetch('/api/monitoring/audit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('audit_token') || 'demo_token'}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'compliance-monitoring',
                    eventData,
                    context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, data: data.data };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Compliance monitoring error:', err);
            return { success: false, error: err.message };
        }
    }, []);

    /**
     * Clear all alerts
     */
    const clearAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    /**
     * Refresh dashboard data manually
     */
    const refresh = useCallback(() => {
        setLoading(true);
        fetchDashboardData();
    }, [fetchDashboardData]);

    /**
     * Get system health status
     */
    const getSystemHealth = useCallback(() => {
        if (!dashboardData) return 'unknown';

        const { overview, security, compliance, performance } = dashboardData;

        // Calculate overall health score
        let healthScore = 100;

        // System status impact
        if (overview?.systemStatus === 'CRITICAL') healthScore -= 40;
        else if (overview?.systemStatus === 'WARNING') healthScore -= 20;
        else if (overview?.systemStatus === 'CAUTION') healthScore -= 10;

        // Security impact
        if (security?.threatLevel === 'CRITICAL') healthScore -= 30;
        else if (security?.threatLevel === 'HIGH') healthScore -= 20;
        else if (security?.threatLevel === 'MEDIUM') healthScore -= 10;

        // Performance impact
        if (performance?.averageResponseTime > 5000) healthScore -= 20;
        else if (performance?.averageResponseTime > 3000) healthScore -= 10;

        if (performance?.errorRate > 10) healthScore -= 20;
        else if (performance?.errorRate > 5) healthScore -= 10;

        // Compliance impact
        if (compliance?.cfmCompliance?.complianceRate < 90) healthScore -= 15;
        if (compliance?.lgpdCompliance?.complianceRate < 90) healthScore -= 15;

        // Active alerts impact
        const criticalAlerts = overview?.activeAlerts || 0;
        if (criticalAlerts > 5) healthScore -= 20;
        else if (criticalAlerts > 2) healthScore -= 10;

        // Determine health status
        if (healthScore >= 90) return 'excellent';
        if (healthScore >= 80) return 'good';
        if (healthScore >= 70) return 'fair';
        if (healthScore >= 60) return 'poor';
        return 'critical';
    }, [dashboardData]);

    // Setup intervals and cleanup
    useEffect(() => {
        // Initial data fetch
        fetchDashboardData();

        // Setup auto-refresh
        if (autoRefresh) {
            refreshIntervalRef.current = setInterval(fetchDashboardData, refreshInterval);
        }

        // Setup real-time alerts
        if (enableRealTimeAlerts) {
            alertIntervalRef.current = setInterval(checkRealTimeAlerts, alertCheckInterval);
        }

        // Cleanup function
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
            if (alertIntervalRef.current) {
                clearInterval(alertIntervalRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchDashboardData, checkRealTimeAlerts, autoRefresh, refreshInterval, enableRealTimeAlerts, alertCheckInterval]);

    // Return hook interface
    return {
        // Data
        dashboardData,
        alerts,
        loading,
        error,
        connectionStatus,
        lastUpdate,

        // Computed values
        systemHealth: getSystemHealth(),
        hasUnacknowledgedAlerts: alerts.some(alert => !alert.acknowledged),
        alertCount: alerts.length,

        // Actions
        refresh,
        acknowledgeAlert,
        generateReport,
        analyzeSecurityEvent,
        monitorCompliance,
        clearAlerts,

        // Configuration
        isAutoRefreshEnabled: autoRefresh,
        currentTimeRange: timeRange,
        isRealTimeAlertsEnabled: enableRealTimeAlerts
    };
};

/**
 * Hook for monitoring specific metrics
 * @param {string} metricType - Type of metric to monitor
 * @param {Object} options - Configuration options
 * @returns {Object} Metric monitoring state
 */
export const useMetricMonitoring = (metricType, options = {}) => {
    const {
        threshold = null,
        onThresholdExceeded = null,
        refreshInterval = 60000 // 1 minute
    } = options;

    const [metricValue, setMetricValue] = useState(null);
    const [trend, setTrend] = useState('stable');
    const [history, setHistory] = useState([]);
    const [thresholdExceeded, setThresholdExceeded] = useState(false);

    const fetchMetric = useCallback(async () => {
        try {
            const response = await fetch(`/api/monitoring/audit?action=performance-metrics&metric=${metricType}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('audit_token') || 'demo_token'}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const newValue = data.data.current[metricType];

                if (newValue !== null && newValue !== undefined) {
                    setMetricValue(newValue);

                    // Update history
                    setHistory(prev => {
                        const newHistory = [...prev, { value: newValue, timestamp: new Date() }];
                        return newHistory.slice(-50); // Keep last 50 values
                    });

                    // Calculate trend
                    setHistory(prev => {
                        if (prev.length >= 2) {
                            const recent = prev.slice(-5); // Last 5 values
                            const older = prev.slice(-10, -5); // Previous 5 values

                            if (older.length > 0) {
                                const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
                                const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;

                                if (recentAvg > olderAvg * 1.1) setTrend('increasing');
                                else if (recentAvg < olderAvg * 0.9) setTrend('decreasing');
                                else setTrend('stable');
                            }
                        }
                        return prev;
                    });

                    // Check threshold
                    if (threshold !== null) {
                        const exceeded = newValue > threshold;
                        setThresholdExceeded(exceeded);

                        if (exceeded && onThresholdExceeded) {
                            onThresholdExceeded(newValue, threshold);
                        }
                    }
                }
            }
        } catch (err) {
            console.error(`Metric fetch error for ${metricType}:`, err);
        }
    }, [metricType, threshold, onThresholdExceeded]);

    useEffect(() => {
        fetchMetric();
        const interval = setInterval(fetchMetric, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchMetric, refreshInterval]);

    return {
        value: metricValue,
        trend,
        history,
        thresholdExceeded,
        refresh: fetchMetric
    };
};

export default useAuditMonitoring;