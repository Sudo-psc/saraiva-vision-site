import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ErrorBoundary } from '../ErrorBoundaries';

const ServicesStatusDashboard = () => {
    const [serviceData, setServiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [view, setView] = useState('overview'); // overview, detailed, logs, metrics

    const fetchServiceData = async (serviceId = null, viewType = 'overview') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                type: viewType,
                ...(serviceId && { service: serviceId })
            });

            const response = await fetch(`/api/services/status?${params}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setServiceData(data);
        } catch (err) {
            console.error('Error fetching service data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceData();
    }, []);

    useEffect(() => {
        if (selectedService !== null) {
            fetchServiceData(selectedService, view);
        }
    }, [selectedService, view]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'healthy':
            case 'online':
                return 'success';
            case 'warning':
            case 'degraded':
                return 'warning';
            case 'error':
            case 'offline':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const formatUptime = (uptime) => {
        if (!uptime) return 'N/A';
        const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
        const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const formatMemory = (bytes) => {
        if (!bytes) return 'N/A';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading services status...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-red-600 mb-4">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Services</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => fetchServiceData()}
                                className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Services Status Dashboard</h1>
                        <p className="text-gray-600">Monitor the health and performance of all website services</p>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setView('overview'); setSelectedService(null); }}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    view === 'overview' && !selectedService
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setView('detailed')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    view === 'detailed'
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Detailed Status
                            </button>
                            <button
                                onClick={() => setView('logs')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    view === 'logs'
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Logs
                            </button>
                            <button
                                onClick={() => setView('metrics')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    view === 'metrics'
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Metrics
                            </button>
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Healthy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Warning</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Error</span>
                            </div>
                        </div>
                    </div>

                    {view === 'overview' && serviceData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(serviceData.services || {}).map(([serviceName, serviceInfo]) => (
                                <Card
                                    key={serviceName}
                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                        selectedService === serviceName ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                    onClick={() => setSelectedService(serviceName)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg capitalize">
                                                {serviceName.replace(/([A-Z])/g, ' $1').trim()}
                                            </CardTitle>
                                            <Badge variant={getStatusColor(serviceInfo.status)}>
                                                {serviceInfo.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Uptime:</span>
                                                <span className="font-medium">{formatUptime(serviceInfo.uptime)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Response Time:</span>
                                                <span className="font-medium">
                                                    {serviceInfo.responseTime ? `${serviceInfo.responseTime}ms` : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Memory:</span>
                                                <span className="font-medium">
                                                    {formatMemory(serviceInfo.memoryUsage)}
                                                </span>
                                            </div>
                                            {serviceInfo.lastCheck && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Last Check:</span>
                                                    <span className="font-medium">
                                                        {new Date(serviceInfo.lastCheck).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {view === 'detailed' && serviceData && (
                        <div className="space-y-6">
                            {Object.entries(serviceData.services || {}).map(([serviceName, serviceInfo]) => (
                                <Card key={serviceName}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl capitalize">
                                                {serviceName.replace(/([A-Z])/g, ' $1').trim()}
                                            </CardTitle>
                                            <Badge variant={getStatusColor(serviceInfo.status)}>
                                                {serviceInfo.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="text-sm text-gray-600 mb-1">Status</div>
                                                <div className="font-semibold">{serviceInfo.status}</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="text-sm text-gray-600 mb-1">Uptime</div>
                                                <div className="font-semibold">{formatUptime(serviceInfo.uptime)}</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="text-sm text-gray-600 mb-1">Response Time</div>
                                                <div className="font-semibold">
                                                    {serviceInfo.responseTime ? `${serviceInfo.responseTime}ms` : 'N/A'}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="text-sm text-gray-600 mb-1">Memory Usage</div>
                                                <div className="font-semibold">
                                                    {formatMemory(serviceInfo.memoryUsage)}
                                                </div>
                                            </div>
                                        </div>

                                        {serviceInfo.errors && serviceInfo.errors.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold text-red-600 mb-2">Recent Errors</h4>
                                                <div className="space-y-2">
                                                    {serviceInfo.errors.slice(0, 3).map((error, index) => (
                                                        <div key={index} className="bg-red-50 border border-red-200 p-3 rounded-md">
                                                            <div className="text-sm text-red-800">{error.message}</div>
                                                            <div className="text-xs text-red-600 mt-1">
                                                                {new Date(error.timestamp).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {view === 'logs' && serviceData && (
                        <Card>
                            <CardHeader>
                                <CardTitle>System Logs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {serviceData.logs && serviceData.logs.length > 0 ? (
                                        serviceData.logs.map((log, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                                                <Badge variant={getStatusColor(log.level)} className="mt-0.5">
                                                    {log.level}
                                                </Badge>
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-600 mb-1">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </div>
                                                    <div className="text-sm">{log.message}</div>
                                                    {log.service && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Service: {log.service}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            No logs available
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {view === 'metrics' && serviceData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Services</span>
                                            <span className="font-semibold text-lg">
                                                {Object.keys(serviceData.services || {}).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Healthy Services</span>
                                            <span className="font-semibold text-lg text-green-600">
                                                {Object.values(serviceData.services || {}).filter(s =>
                                                    s.status.toLowerCase() === 'healthy' || s.status.toLowerCase() === 'online'
                                                ).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Services with Issues</span>
                                            <span className="font-semibold text-lg text-red-600">
                                                {Object.values(serviceData.services || {}).filter(s =>
                                                    s.status.toLowerCase() === 'error' || s.status.toLowerCase() === 'offline'
                                                ).length}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {serviceData.metrics && (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Average Response Time</span>
                                                    <span className="font-semibold">
                                                        {serviceData.metrics.avgResponseTime || 'N/A'}ms
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Total Memory Usage</span>
                                                    <span className="font-semibold">
                                                        {formatMemory(serviceData.metrics.totalMemoryUsage)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">System Uptime</span>
                                                    <span className="font-semibold">
                                                        {formatUptime(serviceData.metrics.systemUptime)}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ServicesStatusDashboard;