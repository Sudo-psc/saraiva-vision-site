import React, { useState, useEffect } from 'react';
import GoogleBusinessMonitor from '../services/googleBusinessMonitor';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Database,
    Globe,
    RefreshCw,
    Server,
    TrendingUp,
    XCircle,
    Wifi,
    WifiOff
} from 'lucide-react';

/**
 * GoogleBusinessMonitorDashboard Component
 * Real-time monitoring dashboard for Google Business integration
 */
const GoogleBusinessMonitorDashboard = ({
    className = '',
    autoStart = true,
    showDetails = true,
    onAlert
}) => {
    const [monitor, setMonitor] = useState(null);
    const [status, setStatus] = useState(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [historicalData, setHistoricalData] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Initialize monitor
        const monitorInstance = new GoogleBusinessMonitor({
            checkInterval: 30000, // 30 seconds for demo
            notificationChannels: ['console'],
            alertThresholds: {
                errorRate: 0.1,
                responseTime: 3000,
                quotaUsage: 0.8
            }
        });

        // Register alert callback
        monitorInstance.onAlert('api_connectivity', (alert) => {
            setAlerts(prev => [...prev, alert]);
            if (onAlert) onAlert(alert);
        });

        monitorInstance.onAlert('response_time', (alert) => {
            setAlerts(prev => [...prev, alert]);
            if (onAlert) onAlert(alert);
        });

        monitorInstance.onAlert('quota_usage', (alert) => {
            setAlerts(prev => [...prev, alert]);
            if (onAlert) onAlert(alert);
        });

        monitorInstance.onAlert('cache_health', (alert) => {
            setAlerts(prev => [...prev, alert]);
            if (onAlert) onAlert(alert);
        });

        setMonitor(monitorInstance);

        // Auto-start monitoring
        if (autoStart) {
            monitorInstance.startMonitoring();
            setIsMonitoring(true);
        }

        // Update status periodically
        const statusInterval = setInterval(() => {
            if (monitorInstance) {
                const currentStatus = monitorInstance.getStatus();
                setStatus(currentStatus);
                setHistoricalData(monitorInstance.getHistoricalData(12)); // Last 12 entries
            }
        }, 5000);

        return () => {
            clearInterval(statusInterval);
            if (monitorInstance) {
                monitorInstance.stopMonitoring();
            }
        };
    }, [autoStart, onAlert]);

    const toggleMonitoring = () => {
        if (!monitor) return;

        if (isMonitoring) {
            monitor.stopMonitoring();
            setIsMonitoring(false);
        } else {
            monitor.startMonitoring();
            setIsMonitoring(true);
        }
    };

    const formatUptime = (milliseconds) => {
        if (!milliseconds) return '0s';

        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
            case 'warning': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
            case 'info': return 'text-cyan-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'critical': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    if (!status) {
        return (
            <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                                <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-16 mb-2"></div>
                                <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const healthSummary = monitor?.getHealthSummary() || { status: 'unknown', issues: [] };

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Activity className={`w-6 h-6 ${getStatusColor(healthSummary.status)}`} />
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            Google Business Monitor
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Monitoramento em tempo real da integração
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${getSeverityColor(healthSummary.status)}`}>
                        {getStatusIcon(healthSummary.status)}
                        <span className="text-sm font-medium capitalize">
                            {healthSummary.status}
                        </span>
                    </div>

                    <button
                        onClick={toggleMonitoring}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isMonitoring
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                            }`}
                    >
                        {isMonitoring ? (
                            <>
                                <XCircle className="w-4 h-4" />
                                Parar
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Iniciar
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            API Status
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {status.data?.apiConnectivity ? (
                            <Wifi className="w-5 h-5 text-green-600" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`text-lg font-bold ${status.data?.apiConnectivity ? 'text-green-600' : 'text-red-600'}`}>
                            {status.data?.apiConnectivity ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Response Time
                        </span>
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                        {Math.round(status.data?.averageResponseTime || 0)}ms
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Cache Health
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Server className={`w-5 h-5 ${status.data?.cacheHealth ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`text-lg font-bold ${status.data?.cacheHealth ? 'text-green-600' : 'text-red-600'}`}>
                            {status.data?.cacheHealth ? 'Healthy' : 'Unhealthy'}
                        </span>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Quota Usage
                        </span>
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                        {Math.round((status.data?.quotaUsage || 0) * 100)}%
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                        Alertas Ativos
                    </h3>
                    <div className="space-y-2">
                        {alerts.slice(-5).map((alert, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-3 p-3 rounded-lg ${getSeverityColor(alert.severity)}`}
                            >
                                <AlertTriangle className="w-4 h-4" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{alert.message}</p>
                                    <p className="text-xs opacity-75">
                                        {new Date(alert.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Information */}
            {showDetails && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Informações Detalhadas
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Estatísticas do Sistema
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Tempo de atividade:</span>
                                    <span className="font-medium">{formatUptime(status.uptime)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Total de requisições:</span>
                                    <span className="font-medium">{status.data?.totalRequests || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Contagem de erros:</span>
                                    <span className="font-medium">{status.data?.errorCount || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Última verificação:</span>
                                    <span className="font-medium">
                                        {status.data?.lastCheckTime
                                            ? new Date(status.data.lastCheckTime).toLocaleTimeString()
                                            : 'Nunca'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Problemas Detectados
                            </h4>
                            {healthSummary.issues.length > 0 ? (
                                <ul className="space-y-1 text-sm">
                                    {healthSummary.issues.map((issue, index) => (
                                        <li key={index} className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                            <XCircle className="w-3 h-3" />
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    Nenhum problema detectado
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Historical Data */}
                    {historicalData.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Dados Históricos Recentes
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-600">
                                            <th className="text-left py-2 text-slate-600 dark:text-slate-400">Horário</th>
                                            <th className="text-left py-2 text-slate-600 dark:text-slate-400">API</th>
                                            <th className="text-left py-2 text-slate-600 dark:text-slate-400">Cache</th>
                                            <th className="text-left py-2 text-slate-600 dark:text-slate-400">Response</th>
                                            <th className="text-left py-2 text-slate-600 dark:text-slate-400">Quota</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historicalData.slice(-10).map((data, index) => (
                                            <tr key={index} className="border-b border-slate-100 dark:border-slate-700">
                                                <td className="py-2 text-slate-600 dark:text-slate-400">
                                                    {new Date(data.timestamp).toLocaleTimeString()}
                                                </td>
                                                <td className="py-2">
                                                    {data.apiConnectivity ? (
                                                        <Wifi className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <WifiOff className="w-4 h-4 text-red-600" />
                                                    )}
                                                </td>
                                                <td className="py-2">
                                                    {data.cacheHealth ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                    )}
                                                </td>
                                                <td className="py-2 text-slate-600 dark:text-slate-400">
                                                    {Math.round(data.responseTime || 0)}ms
                                                </td>
                                                <td className="py-2 text-slate-600 dark:text-slate-400">
                                                    {Math.round((data.quotaUsage || 0) * 100)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GoogleBusinessMonitorDashboard;
