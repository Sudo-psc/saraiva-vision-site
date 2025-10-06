/**
 * SSL Health Dashboard Component
 * Real-time monitoring and management of SSL certificates
 */

import React, { useState, useEffect } from 'react';
import { useDashboardSSLMonitor, useSSLHealthAlerts } from '../hooks/useSSLHealthMonitor.js';
import { SSLHealthDetails, SSLHealthBadge } from '../lib/sslHealthMonitor.js';

/**
 * SSL Health Dashboard Component
 */
export function SSLHealthDashboard({ domains = [], className = '' }) {
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const {
        statuses,
        loading,
        error,
        overallStatus,
        expiringSoon,
        checkAllDomains,
        refresh
    } = useDashboardSSLMonitor(domains);

    const { alerts, dismissAlert, clearAllAlerts } = useSSLHealthAlerts();

    const defaultDomains = [
        'cms.saraivavision.com.br',
        'saraivavision.com.br',
        'www.saraivavision.com.br'
    ];

    const monitorDomains = domains.length > 0 ? domains : defaultDomains;

    useEffect(() => {
        // Auto-refresh every 5 minutes
        const interval = setInterval(refresh, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [refresh]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'green';
            case 'warning': return 'yellow';
            case 'error': return 'red';
            default: return 'gray';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy': return '✅';
            case 'warning': return '⚡';
            case 'error': return '❌';
            default: return '❓';
        }
    };

    const formatDaysRemaining = (days) => {
        if (days < 0) return 'Expired';
        if (days === 0) return 'Today';
        if (days === 1) return '1 day';
        return `${days} days`;
    };

    const selectedStatus = selectedDomain ? statuses[selectedDomain] : null;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">SSL Health Dashboard</h2>
                    <p className="text-gray-600">Monitor SSL certificates across all domains</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-red-800">Active Alerts</h3>
                        <button
                            onClick={clearAllAlerts}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            Clear All
                        </button>
                    </div>
                    {alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${
                                alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                                alert.type === 'error' ? 'bg-red-50 border-red-400' :
                                'bg-yellow-50 border-yellow-400'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {alert.timestamp.toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => dismissAlert(index)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                            {alert.actions && alert.actions.length > 0 && (
                                <div className="flex space-x-2 mt-3">
                                    {alert.actions.map((action, actionIndex) => (
                                        <button
                                            key={actionIndex}
                                            onClick={action.action}
                                            className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Overall Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Overall Status</h3>
                        <p className="text-sm text-gray-600">
                            Monitoring {monitorDomains.length} domain{monitorDomains.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full bg-${getStatusColor(overallStatus)}-500`}></span>
                            <span className="font-medium capitalize">{overallStatus}</span>
                        </div>
                        {expiringSoon.length > 0 && (
                            <div className="text-sm text-yellow-600">
                                ⚠️ {expiringSoon.length} expiring soon
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Domain Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monitorDomains.map((domain) => {
                    const status = statuses[domain];
                    const isExpiringSoon = expiringSoon.includes(domain);

                    return (
                        <div
                            key={domain}
                            className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
                                selectedDomain === domain ? 'ring-2 ring-blue-500' : ''
                            } ${isExpiringSoon ? 'border-yellow-300' : ''}`}
                            onClick={() => setSelectedDomain(domain)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 truncate">{domain}</h4>
                                    <p className="text-sm text-gray-600">
                                        {status?.lastCheck ?
                                            new Date(status.lastCheck).toLocaleDateString() :
                                            'Never checked'
                                        }
                                    </p>
                                </div>
                                {status && (
                                    <SSLHealthBadge status={status} />
                                )}
                            </div>

                            {status && (
                                <div className="space-y-2">
                                    {status.certificateInfo && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Expires:</span>
                                            <span className={`font-medium ${
                                                status.certificateInfo.daysUntilExpiry < 30 ? 'text-red-600' : 'text-gray-900'
                                            }`}>
                                                {formatDaysRemaining(status.certificateInfo.daysUntilExpiry)}
                                            </span>
                                        </div>
                                    )}

                                    {status.endpointStatus && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">GraphQL:</span>
                                            <span className={`font-medium ${
                                                status.endpointStatus.ok ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {status.endpointStatus.ok ? '✅ Up' : '❌ Down'}
                                            </span>
                                        </div>
                                    )}

                                    {status.errors.length > 0 && (
                                        <div className="text-sm text-red-600">
                                            ❌ {status.errors.length} error{status.errors.length !== 1 ? 's' : ''}
                                        </div>
                                    )}

                                    {status.warnings.length > 0 && (
                                        <div className="text-sm text-yellow-600">
                                            ⚡ {status.warnings.length} warning{status.warnings.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isExpiringSoon && (
                                <div className="mt-3 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                    ⏰ Expiring soon
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Selected Domain Details */}
            {selectedDomain && showDetails && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            SSL Details for {selectedDomain}
                        </h3>
                        <button
                            onClick={() => setShowDetails(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </div>
                    <SSLHealthDetails status={selectedStatus} />
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold">Error</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {Object.keys(statuses).length === 0 && !loading && !error && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">🔒</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No SSL Data Available</h3>
                    <p className="text-gray-600 mb-4">
                        Click "Refresh" to check SSL certificate status
                    </p>
                    <button
                        onClick={checkAllDomains}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                    >
                        Check SSL Status
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking SSL certificates...</p>
                </div>
            )}
        </div>
    );
}

/**
 * Mini SSL Status Widget
 * Compact version for dashboards and sidebars
 */
export function SSLMiniWidget({ domains = [], className = '' }) {
    const { statuses, overallStatus, expiringSoon, loading } = useDashboardSSLMonitor(domains);

    if (loading) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Checking SSL...</span>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <span className={`text-sm font-medium ${getStatusColor(overallStatus)}`}>
                {overallStatus === 'healthy' ? '✅' :
                 overallStatus === 'warning' ? '⚡' :
                 overallStatus === 'error' ? '❌' : '❓'}
            </span>
            <span className="text-sm text-gray-600">SSL</span>
            {expiringSoon.length > 0 && (
                <span className="text-xs text-yellow-600">({expiringSoon.length})</span>
            )}
        </div>
    );
}

/**
 * SSL Alert Component
 * Shows critical SSL alerts in a prominent banner
 */
export function SSLAlertBanner({ className = '' }) {
    const { alerts, dismissAlert, hasCriticalAlerts } = useSSLHealthAlerts();

    if (!hasCriticalAlerts || alerts.length === 0) {
        return null;
    }

    const criticalAlerts = alerts.filter(alert => alert.type === 'critical');

    return (
        <div className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <span className="text-red-500 text-xl">⚠️</span>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                        SSL Certificate Alert
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                        {criticalAlerts.map((alert, index) => (
                            <div key={index} className="flex justify-between items-start">
                                <p>{alert.message}</p>
                                <button
                                    onClick={() => dismissAlert(alerts.indexOf(alert))}
                                    className="ml-4 text-red-600 hover:text-red-800"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SSLHealthDashboard;