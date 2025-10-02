import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/Alert';
import { Loader2, Activity, Users, MessageSquare, Calendar, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';

const Dashboard = () => {
    const {
        data: { metrics, health, queue },
        loading,
        error,
        lastUpdated,
        isRefreshing,
        refresh
    } = useDashboardData();



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load dashboard: {error}
                        <button
                            onClick={refresh}
                            className="ml-2 underline hover:no-underline"
                        >
                            Retry
                        </button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Operational Dashboard</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={refresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <div className="text-sm text-gray-500">
                        Last updated: {lastUpdated?.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* System Health Overview */}
            <SystemHealthCard health={health} />

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Contacts (24h)"
                    value={metrics?.contacts?.total24h || 0}
                    subtitle={`${metrics?.contacts?.hourlyRate || 0}/hour avg`}
                    icon={<Users className="h-4 w-4" />}
                    trend="neutral"
                />

                <MetricCard
                    title="Appointments (24h)"
                    value={metrics?.appointments?.total24h || 0}
                    subtitle={`${metrics?.appointments?.conversionRate || 0}% conversion`}
                    icon={<Calendar className="h-4 w-4" />}
                    trend="neutral"
                />

                <MetricCard
                    title="Message Delivery"
                    value={`${metrics?.messaging?.deliveryRate || 100}%`}
                    subtitle={`${metrics?.messaging?.sent || 0}/${metrics?.messaging?.totalMessages || 0} sent`}
                    icon={<MessageSquare className="h-4 w-4" />}
                    trend={metrics?.messaging?.deliveryRate >= 95 ? "positive" : "negative"}
                />

                <MetricCard
                    title="System Errors"
                    value={metrics?.system?.errors24h || 0}
                    subtitle={`${metrics?.system?.errorRate || 0}/hour avg`}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    trend={metrics?.system?.errors24h === 0 ? "positive" : "negative"}
                />
            </div>

            {/* Detailed Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AppointmentStatusCard appointments={metrics?.appointments} />
                <MessageQueueCard queue={queue} />
            </div>

            {/* Service Status */}
            <ServiceStatusCard health={health} />

            {/* Alerts */}
            {queue?.alerts && queue.alerts.length > 0 && (
                <AlertsCard alerts={queue.alerts} />
            )}
        </div>
    );
};

// System Health Card Component
const SystemHealthCard = ({ health }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100';
            case 'degraded': return 'text-yellow-600 bg-yellow-100';
            case 'unhealthy': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="h-5 w-5" />;
            case 'degraded': return <AlertTriangle className="h-5 w-5" />;
            case 'unhealthy': return <XCircle className="h-5 w-5" />;
            default: return <Clock className="h-5 w-5" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${getStatusColor(health?.overall?.status)}`}>
                        {getStatusIcon(health?.overall?.status)}
                        <span className="font-medium capitalize">{health?.overall?.status || 'Unknown'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        {health?.overall?.upServices || 0}/{health?.overall?.totalServices || 0} services operational
                    </div>
                    <div className="text-sm text-gray-600">
                        {health?.overall?.uptime || 0}% uptime
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon, trend }) => {
    const getTrendColor = (trend) => {
        switch (trend) {
            case 'positive': return 'text-green-600';
            case 'negative': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        <p className={`text-sm ${getTrendColor(trend)}`}>{subtitle}</p>
                    </div>
                    <div className="text-gray-400">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Appointment Status Card
const AppointmentStatusCard = ({ appointments }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Appointment Status (24h)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span>Confirmed</span>
                        <Badge variant="success">{appointments?.confirmed || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Pending</span>
                        <Badge variant="warning">{appointments?.pending || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Cancelled</span>
                        <Badge variant="destructive">{appointments?.cancelled || 0}</Badge>
                    </div>
                    <div className="pt-2 border-t">
                        <div className="flex justify-between items-center font-medium">
                            <span>Conversion Rate</span>
                            <span>{appointments?.conversionRate || 0}%</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Message Queue Card
const MessageQueueCard = ({ queue }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Message Queue Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span>Pending</span>
                        <Badge variant={queue?.metrics?.current?.pending > 10 ? "warning" : "default"}>
                            {queue?.metrics?.current?.pending || 0}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Sent (24h)</span>
                        <Badge variant="success">{queue?.metrics?.recent24h?.successful || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Failed (24h)</span>
                        <Badge variant="destructive">{queue?.metrics?.recent24h?.failed || 0}</Badge>
                    </div>
                    <div className="pt-2 border-t">
                        <div className="flex justify-between items-center font-medium">
                            <span>Success Rate</span>
                            <span>{queue?.metrics?.performance?.successRate || 100}%</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Service Status Card
const ServiceStatusCard = ({ health }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'up': return <Badge variant="success">Online</Badge>;
            case 'down': return <Badge variant="destructive">Offline</Badge>;
            default: return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>External Services</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {health?.services?.map((service, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded">
                            <div>
                                <div className="font-medium">{service.service}</div>
                                {service.responseTime && (
                                    <div className="text-sm text-gray-500">{service.responseTime}ms</div>
                                )}
                                {service.error && (
                                    <div className="text-sm text-red-500">{service.error}</div>
                                )}
                            </div>
                            {getStatusBadge(service.status)}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// Alerts Card
const AlertsCard = ({ alerts }) => {
    const getAlertVariant = (type) => {
        switch (type) {
            case 'error': return 'destructive';
            case 'warning': return 'default';
            default: return 'default';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Active Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.map((alert, index) => (
                        <Alert key={index} variant={getAlertVariant(alert.type)}>
                            <AlertDescription>
                                <div className="flex justify-between items-center">
                                    <span>{alert.message}</span>
                                    <Badge variant="outline">{alert.severity}</Badge>
                                </div>
                            </AlertDescription>
                        </Alert>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default Dashboard;