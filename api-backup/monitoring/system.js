/**
 * System Monitoring API Endpoint
 * Provides access to production monitoring data and controls
 * Requirements: 6.5, 8.4, 8.5 - Production monitoring and alerting
 */

import productionMonitor from '../../src/monitoring/productionMonitor.js';
import configManager from '../../src/config/configManager.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { action, metric, threshold, level, value } = req.query;

        switch (req.method) {
            case 'GET':
                await handleGetRequest(req, res, action);
                break;

            case 'POST':
                await handlePostRequest(req, res, action);
                break;

            case 'PUT':
                await handlePutRequest(req, res, { metric, threshold, level, value });
                break;

            default:
                res.status(405).json({
                    success: false,
                    error: 'Method not allowed'
                });
        }

    } catch (error) {
        console.error('System monitoring API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}

async function handleGetRequest(req, res, action) {
    switch (action) {
        case 'metrics':
            const metrics = productionMonitor.getMetrics();
            res.status(200).json({
                success: true,
                action: 'metrics',
                data: metrics,
                timestamp: new Date().toISOString()
            });
            break;

        case 'alerts':
            const { limit = 50 } = req.query;
            const alerts = productionMonitor.getAlerts(parseInt(limit));
            res.status(200).json({
                success: true,
                action: 'alerts',
                data: alerts,
                count: alerts.length,
                timestamp: new Date().toISOString()
            });
            break;

        case 'health':
            const health = productionMonitor.getHealthStatus();
            res.status(200).json({
                success: true,
                action: 'health',
                data: health,
                timestamp: new Date().toISOString()
            });
            break;

        case 'dashboard':
            const dashboardData = productionMonitor.getDashboardData();
            res.status(200).json({
                success: true,
                action: 'dashboard',
                data: dashboardData,
                timestamp: new Date().toISOString()
            });
            break;

        case 'status':
            const monitoringStatus = {
                isRunning: productionMonitor.isMonitoring,
                environment: configManager.getEnvironment(),
                uptime: productionMonitor.isMonitoring ? Date.now() - productionMonitor.startTime : 0,
                configuration: configManager.getMonitoringConfig()
            };

            res.status(200).json({
                success: true,
                action: 'status',
                data: monitoringStatus,
                timestamp: new Date().toISOString()
            });
            break;

        default:
            // Default to dashboard data
            const defaultData = productionMonitor.getDashboardData();
            res.status(200).json({
                success: true,
                action: 'overview',
                data: defaultData,
                timestamp: new Date().toISOString()
            });
    }
}

async function handlePostRequest(req, res, action) {
    switch (action) {
        case 'start':
            if (productionMonitor.isMonitoring) {
                res.status(400).json({
                    success: false,
                    error: 'Monitoring is already running'
                });
                return;
            }

            productionMonitor.start();
            res.status(200).json({
                success: true,
                action: 'start',
                message: 'Production monitoring started',
                timestamp: new Date().toISOString()
            });
            break;

        case 'stop':
            if (!productionMonitor.isMonitoring) {
                res.status(400).json({
                    success: false,
                    error: 'Monitoring is not running'
                });
                return;
            }

            productionMonitor.stop();
            res.status(200).json({
                success: true,
                action: 'stop',
                message: 'Production monitoring stopped',
                timestamp: new Date().toISOString()
            });
            break;

        case 'test-alert':
            // Trigger a test alert
            const testAlert = {
                id: `test_alert_${Date.now()}`,
                timestamp: new Date().toISOString(),
                metric: 'test_metric',
                value: 100,
                threshold: 50,
                severity: 'warning',
                unit: '%',
                message: 'Test alert triggered manually',
                environment: configManager.getEnvironment()
            };

            // Send through all alert handlers
            for (const [handlerName, handler] of productionMonitor.alertHandlers) {
                try {
                    await handler.handle(testAlert);
                } catch (error) {
                    console.error(`Test alert handler ${handlerName} failed:`, error);
                }
            }

            res.status(200).json({
                success: true,
                action: 'test-alert',
                message: 'Test alert sent',
                alert: testAlert,
                timestamp: new Date().toISOString()
            });
            break;

        case 'add-alert-handler':
            const { name, webhookUrl, type } = req.body;

            if (!name || !type) {
                res.status(400).json({
                    success: false,
                    error: 'Name and type are required'
                });
                return;
            }

            let handler;
            switch (type) {
                case 'webhook':
                    if (!webhookUrl) {
                        res.status(400).json({
                            success: false,
                            error: 'Webhook URL is required for webhook handler'
                        });
                        return;
                    }

                    handler = {
                        name: `Webhook: ${name}`,
                        handle: async (alert) => {
                            const payload = {
                                text: `🚨 ${alert.severity.toUpperCase()} Alert: ${alert.message}`,
                                alert: alert
                            };

                            await fetch(webhookUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });
                        }
                    };
                    break;

                default:
                    res.status(400).json({
                        success: false,
                        error: `Unsupported handler type: ${type}`
                    });
                    return;
            }

            productionMonitor.addAlertHandler(name, handler);

            res.status(200).json({
                success: true,
                action: 'add-alert-handler',
                message: `Alert handler ${name} added`,
                timestamp: new Date().toISOString()
            });
            break;

        default:
            res.status(400).json({
                success: false,
                error: `Unknown action: ${action}`
            });
    }
}

async function handlePutRequest(req, res, { metric, threshold, level, value }) {
    if (!metric || !level || !value) {
        res.status(400).json({
            success: false,
            error: 'Metric, level, and value are required'
        });
        return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
        res.status(400).json({
            success: false,
            error: 'Value must be a number'
        });
        return;
    }

    if (!['warning', 'critical'].includes(level)) {
        res.status(400).json({
            success: false,
            error: 'Level must be either "warning" or "critical"'
        });
        return;
    }

    try {
        productionMonitor.updateThreshold(metric, level, numericValue);

        res.status(200).json({
            success: true,
            action: 'update-threshold',
            message: `Updated ${metric} ${level} threshold to ${numericValue}`,
            metric,
            level,
            value: numericValue,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}