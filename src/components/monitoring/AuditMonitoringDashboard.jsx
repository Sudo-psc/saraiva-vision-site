/**
 * Audit Monitoring Dashboard
 * Comprehensive real-time monitoring interface for audit logs and system health
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Shield, Activity, Database, Clock, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AuditMonitoringDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('24h');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/monitoring/audit?action=dashboard&timeRange=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('audit_token') || 'demo_token'}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                setDashboardData(data.data);
                setError(null);
            } else {
                throw new Error(data.error?.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    // Auto-refresh effect
    useEffect(() => {
        fetchDashboardData();

        if (autoRefresh) {
            const interval = setInterval(fetchDashboardData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchDashboardData, autoRefresh, refreshInterval]);

    // Status indicator component
    const StatusIndicator = ({ status, label }) => {
        const getStatusConfig = (status) => {
            switch (status?.toLowerCase()) {
                case 'healthy':
                case 'good':
                case 'compliant':
                    return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' };
                case 'warning':
                case 'caution':
                case 'degraded':
                    return { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-100' };
                case 'critical':
                case 'error':
                case 'non_compliant':
                    return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' };
                default:
                    return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100' };
            }
        };

        const config = getStatusConfig(status);
        const Icon = config.icon;

        return (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-sm font-medium ${config.color}`}>
                    {label || status}
                </span>
            </div>
        );
    };

    // Metric card component
    const MetricCard = ({ title, value, change, icon: Icon, trend, status }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {change && (
                        <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            <span className="text-sm font-medium">{change}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                    {Icon && <Icon className="w-8 h-8 text-gray-400" />}
                    {status && <StatusIndicator status={status} />}
                </div>
            </div>
        </div>
    );

    // Alert card component
    const AlertCard = ({ alert }) => {
        const getSeverityConfig = (severity) => {
            switch (severity?.toLowerCase()) {
                case 'critical':
                    return { color: 'border-red-500 bg-red-50', textColor: 'text-red-800' };
                case 'high':
                    return { color: 'border-orange-500 bg-orange-50', textColor: 'text-orange-800' };
                case 'medium':
                    return { color: 'border-yellow-500 bg-yellow-50', textColor: 'text-yellow-800' };
                default:
                    return { color: 'border-blue-500 bg-blue-50', textColor: 'text-blue-800' };
            }
        };

        const config = getSeverityConfig(alert.severity);

        return (
            <div className={`border-l-4 p-4 ${config.color}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertTriangle className={`w-5 h-5 mr-2 ${config.textColor}`} />
                        <div>
                            <p className={`font-medium ${config.textColor}`}>{alert.type}</p>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-medium ${config.textColor}`}>{alert.severity}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && !dashboardData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                    <XCircle className="w-6 h-6 text-red-500 mr-3" />
                    <div>
                        <h3 className="text-lg font-medium text-red-800">Dashboard Error</h3>
                        <p className="text-red-600 mt-1">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { overview, security, compliance, performance, alerts } = dashboardData || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Audit Monitoring Dashboard</h1>
                    <p className="text-gray-600 mt-1">Real-time system monitoring and compliance tracking</p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Time range selector */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="1h">Last Hour</option>
                        <option value="6h">Last 6 Hours</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                    </select>

                    {/* Auto-refresh toggle */}
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Auto-refresh</span>
                    </label>

                    {/* Manual refresh button */}
                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Overview metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Events"
                    value={overview?.totalEvents?.toLocaleString() || '0'}
                    icon={Activity}
                    status={overview?.systemStatus}
                />
                <MetricCard
                    title="Security Events"
                    value={overview?.securityEvents?.toLocaleString() || '0'}
                    icon={Shield}
                    status={security?.threatLevel}
                />
                <MetricCard
                    title="Active Alerts"
                    value={overview?.activeAlerts?.toLocaleString() || '0'}
                    icon={AlertTriangle}
                    trend={overview?.activeAlerts > 0 ? 'up' : 'down'}
                />
                <MetricCard
                    title="Avg Response Time"
                    value={`${performance?.averageResponseTime || 0}ms`}
                    icon={Clock}
                    status={performance?.averageResponseTime > 3000 ? 'warning' : 'healthy'}
                />
            </div>

            {/* Security section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Shield className="w-6 h-6 mr-2 text-blue-600" />
                        Security Overview
                    </h2>
                    <StatusIndicator status={security?.threatLevel} label={`Threat Level: ${security?.threatLevel}`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{security?.blockedThreats || 0}</p>
                        <p className="text-sm text-gray-600">Blocked Threats</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{security?.averageThreatScore || 0}</p>
                        <p className="text-sm text-gray-600">Avg Threat Score</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{security?.topThreats?.length || 0}</p>
                        <p className="text-sm text-gray-600">Threat Types</p>
                    </div>
                </div>

                {/* Top threats */}
                {security?.topThreats && security.topThreats.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Top Threats</h3>
                        <div className="space-y-2">
                            {security.topThreats.slice(0, 5).map((threat, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="font-medium text-gray-900">{threat.type}</span>
                                    <span className="text-sm text-gray-600">{threat.count} occurrences</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Compliance section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Database className="w-6 h-6 mr-2 text-green-600" />
                        CFM Compliance
                    </h2>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Checks</span>
                            <span className="font-semibold">{compliance?.cfmCompliance?.totalChecks || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Violations</span>
                            <span className="font-semibold text-red-600">{compliance?.cfmCompliance?.violations || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Emergency Detections</span>
                            <span className="font-semibold text-orange-600">{compliance?.cfmCompliance?.emergencyDetections || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Compliance Rate</span>
                            <span className="font-semibold text-green-600">{compliance?.cfmCompliance?.complianceRate || 100}%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Database className="w-6 h-6 mr-2 text-blue-600" />
                        LGPD Compliance
                    </h2>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Data Access Events</span>
                            <span className="font-semibold">{compliance?.lgpdCompliance?.totalDataAccess || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Consent-based Access</span>
                            <span className="font-semibold text-green-600">{compliance?.lgpdCompliance?.consentBasedAccess || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Deletion Requests</span>
                            <span className="font-semibold">{compliance?.lgpdCompliance?.deletionRequests || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Compliance Rate</span>
                            <span className="font-semibold text-green-600">{compliance?.lgpdCompliance?.complianceRate || 100}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active alerts */}
            {alerts && (alerts.critical?.length > 0 || alerts.high?.length > 0 || alerts.medium?.length > 0) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
                        Active Alerts
                    </h2>

                    <div className="space-y-4">
                        {/* Critical alerts */}
                        {alerts.critical?.map((alert, index) => (
                            <AlertCard key={`critical-${index}`} alert={alert} />
                        ))}

                        {/* High alerts */}
                        {alerts.high?.map((alert, index) => (
                            <AlertCard key={`high-${index}`} alert={alert} />
                        ))}

                        {/* Medium alerts */}
                        {alerts.medium?.slice(0, 3).map((alert, index) => (
                            <AlertCard key={`medium-${index}`} alert={alert} />
                        ))}
                    </div>

                    {alerts.medium?.length > 3 && (
                        <div className="mt-4 text-center">
                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                View {alerts.medium.length - 3} more alerts
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Performance metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
                    Performance Metrics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{performance?.averageResponseTime || 0}ms</p>
                        <p className="text-sm text-gray-600">Avg Response Time</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{performance?.errorRate?.toFixed(2) || 0}%</p>
                        <p className="text-sm text-gray-600">Error Rate</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{performance?.throughput?.toFixed(2) || 0}</p>
                        <p className="text-sm text-gray-600">Events/sec</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{performance?.resourceUsage?.memory?.usagePercent || 0}%</p>
                        <p className="text-sm text-gray-600">Memory Usage</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()} |
                Auto-refresh: {autoRefresh ? `Every ${refreshInterval / 1000}s` : 'Disabled'}
            </div>
        </div>
    );
};

export default AuditMonitoringDashboard;