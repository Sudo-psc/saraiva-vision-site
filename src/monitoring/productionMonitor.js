/**
 * Production Monitoring System
 * Comprehensive monitoring and alerting for chatbot system
 * Requirements: 6.5, 8.4, 8.5 - Production monitoring and alerting
 */

import configManager from '../config/configManager.js';
import featureFlagManager from '../config/featureFlags.js';

class ProductionMonitor {
    constructor() {
        this.metrics = new Map();
        this.alerts = new Map();
        this.healthChecks = new Map();
        this.thresholds = new Map();
        this.alertHandlers = new Map();

        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.metricsBuffer = [];
        this.alertCooldowns = new Map();

        this.initializeMetrics();
        this.initializeHealthChecks();
        this.initializeThresholds();
        this.initializeAlertHandlers();
    }

    initializeMetrics() {
        // Performance metrics
        this.metrics.set('response_time', {
            name: 'Response Time',
            unit: 'ms',
            values: [],
            current: 0,
            average: 0,
            p95: 0,
            p99: 0
        });

        this.metrics.set('throughput', {
            name: 'Throughput',
            unit: 'req/min',
            values: [],
            current: 0,
            average: 0
        });

        this.metrics.set('error_rate', {
            name: 'Error Rate',
            unit: '%',
            values: [],
            current: 0,
            average: 0
        });

        // System metrics
        this.metrics.set('memory_usage', {
            name: 'Memory Usage',
            unit: 'MB',
            values: [],
            current: 0,
            peak: 0
        });

        this.metrics.set('cpu_usage', {
            name: 'CPU Usage',
            unit: '%',
            values: [],
            current: 0,
            peak: 0
        });

        // Chatbot-specific metrics
        this.metrics.set('active_conversations', {
            name: 'Active Conversations',
            unit: 'count',
            values: [],
            current: 0,
            peak: 0
        });

        this.metrics.set('gemini_api_calls', {
            name: 'Gemini API Calls',
            unit: 'calls/min',
            values: [],
            current: 0,
            total: 0
        });

        this.metrics.set('compliance_violations', {
            name: 'Compliance Violations',
            unit: 'count',
            values: [],
            current: 0,
            total: 0
        });

        // Database metrics
        this.metrics.set('db_connections', {
            name: 'Database Connections',
            unit: 'count',
            values: [],
            current: 0,
            peak: 0
        });

        this.metrics.set('db_query_time', {
            name: 'Database Query Time',
            unit: 'ms',
            values: [],
            current: 0,
            average: 0
        });
    }

    initializeHealthChecks() {
        // API health check
        this.healthChecks.set('api', {
            name: 'API Health',
            check: async () => {
                try {
                    const startTime = Date.now();
                    const response = await fetch('/api/health');
                    const responseTime = Date.now() - startTime;

                    if (!response.ok) {
                        throw new Error(`API returned ${response.status}`);
                    }

                    const data = await response.json();
                    return {
                        healthy: data.status === 'healthy',
                        responseTime,
                        details: data
                    };
                } catch (error) {
                    return {
                        healthy: false,
                        error: error.message
                    };
                }
            },
            interval: 30000, // 30 seconds
            timeout: 10000   // 10 seconds
        });

        // Chatbot health check
        this.healthChecks.set('chatbot', {
            name: 'Chatbot Health',
            check: async () => {
                try {
                    const startTime = Date.now();
                    const response = await fetch('/api/chatbot/health');
                    const responseTime = Date.now() - startTime;

                    if (!response.ok) {
                        throw new Error(`Chatbot API returned ${response.status}`);
                    }

                    const data = await response.json();
                    return {
                        healthy: data.status === 'healthy',
                        responseTime,
                        details: data
                    };
                } catch (error) {
                    return {
                        healthy: false,
                        error: error.message
                    };
                }
            },
            interval: 60000, // 1 minute
            timeout: 15000   // 15 seconds
        });

        // Database health check
        this.healthChecks.set('database', {
            name: 'Database Health',
            check: async () => {
                try {
                    // This would check database connectivity
                    // For now, we'll simulate a database check
                    const startTime = Date.now();

                    // Simulate database query
                    await new Promise(resolve => setTimeout(resolve, 50));

                    const responseTime = Date.now() - startTime;

                    return {
                        healthy: true,
                        responseTime,
                        connections: this.metrics.get('db_connections').current
                    };
                } catch (error) {
                    return {
                        healthy: false,
                        error: error.message
                    };
                }
            },
            interval: 120000, // 2 minutes
            timeout: 30000    // 30 seconds
        });

        // Gemini API health check
        this.healthChecks.set('gemini', {
            name: 'Gemini API Health',
            check: async () => {
                try {
                    const startTime = Date.now();

                    // Test Gemini API with a simple request
                    const response = await fetch('/api/chatbot/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: 'Health check test',
                            sessionId: 'health-check'
                        })
                    });

                    const responseTime = Date.now() - startTime;

                    if (!response.ok) {
                        throw new Error(`Gemini API test failed with ${response.status}`);
                    }

                    const data = await response.json();

                    return {
                        healthy: data.success,
                        responseTime,
                        tokensUsed: data.metadata?.tokensUsed || 0
                    };
                } catch (error) {
                    return {
                        healthy: false,
                        error: error.message
                    };
                }
            },
            interval: 300000, // 5 minutes
            timeout: 30000    // 30 seconds
        });
    }

    initializeThresholds() {
        // Performance thresholds
        this.thresholds.set('response_time', {
            warning: 3000,  // 3 seconds
            critical: 5000  // 5 seconds
        });

        this.thresholds.set('error_rate', {
            warning: 5,     // 5%
            critical: 10    // 10%
        });

        this.thresholds.set('memory_usage', {
            warning: 512,   // 512 MB
            critical: 1024  // 1 GB
        });

        this.thresholds.set('cpu_usage', {
            warning: 70,    // 70%
            critical: 90    // 90%
        });

        // Chatbot-specific thresholds
        this.thresholds.set('active_conversations', {
            warning: 100,
            critical: 200
        });

        this.thresholds.set('compliance_violations', {
            warning: 1,
            critical: 5
        });

        // Database thresholds
        this.thresholds.set('db_connections', {
            warning: 40,    // 80% of max pool size (50)
            critical: 45    // 90% of max pool size
        });

        this.thresholds.set('db_query_time', {
            warning: 1000,  // 1 second
            critical: 3000  // 3 seconds
        });
    }

    initializeAlertHandlers() {
        // Console alert handler
        this.alertHandlers.set('console', {
            name: 'Console Logger',
            handle: async (alert) => {
                const timestamp = new Date().toISOString();
                const level = alert.severity === 'critical' ? 'ERROR' : 'WARN';
                console.log(`[${timestamp}] ${level}: ${alert.message}`);
                console.log(`  Metric: ${alert.metric} = ${alert.value} ${alert.unit}`);
                console.log(`  Threshold: ${alert.threshold} (${alert.severity})`);
            }
        });

        // File alert handler
        this.alertHandlers.set('file', {
            name: 'File Logger',
            handle: async (alert) => {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    severity: alert.severity,
                    metric: alert.metric,
                    value: alert.value,
                    threshold: alert.threshold,
                    message: alert.message
                };

                // This would write to a log file
                // For now, we'll just store in memory
                this.metricsBuffer.push(logEntry);

                // Keep only last 1000 entries
                if (this.metricsBuffer.length > 1000) {
                    this.metricsBuffer = this.metricsBuffer.slice(-1000);
                }
            }
        });

        // Webhook alert handler (for Slack, Discord, etc.)
        this.alertHandlers.set('webhook', {
            name: 'Webhook Notifier',
            handle: async (alert) => {
                const webhookUrl = process.env.ALERT_WEBHOOK_URL;
                if (!webhookUrl) return;

                const payload = {
                    text: `🚨 ${alert.severity.toUpperCase()} Alert: ${alert.message}`,
                    attachments: [{
                        color: alert.severity === 'critical' ? 'danger' : 'warning',
                        fields: [
                            { title: 'Metric', value: alert.metric, short: true },
                            { title: 'Value', value: `${alert.value} ${alert.unit}`, short: true },
                            { title: 'Threshold', value: alert.threshold, short: true },
                            { title: 'Environment', value: configManager.getEnvironment(), short: true }
                        ],
                        timestamp: Math.floor(Date.now() / 1000)
                    }]
                };

                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } catch (error) {
                    console.error('Webhook alert failed:', error);
                }
            }
        });
    }

    start() {
        if (this.isMonitoring) {
            console.warn('Monitoring is already running');
            return;
        }

        this.isMonitoring = true;
        const monitoringConfig = configManager.getMonitoringConfig();

        console.log('🔍 Starting production monitoring...');
        console.log(`📊 Metrics interval: ${monitoringConfig.metricsInterval}ms`);
        console.log(`🏥 Health check interval: ${monitoringConfig.healthCheckInterval}ms`);

        // Start metrics collection
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
        }, monitoringConfig.metricsInterval);

        // Start health checks
        this.startHealthChecks();

        console.log('✅ Production monitoring started');
    }

    stop() {
        if (!this.isMonitoring) {
            console.warn('Monitoring is not running');
            return;
        }

        this.isMonitoring = false;

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        // Stop health checks
        this.stopHealthChecks();

        console.log('🛑 Production monitoring stopped');
    }

    async collectMetrics() {
        try {
            // Collect system metrics
            await this.collectSystemMetrics();

            // Collect application metrics
            await this.collectApplicationMetrics();

            // Check thresholds and trigger alerts
            this.checkThresholds();

        } catch (error) {
            console.error('Metrics collection failed:', error);
        }
    }

    async collectSystemMetrics() {
        // Memory usage
        const memoryUsage = process.memoryUsage();
        const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        this.updateMetric('memory_usage', memoryMB);

        // CPU usage (simplified)
        const cpuUsage = process.cpuUsage();
        const cpuPercent = Math.round((cpuUsage.user + cpuUsage.system) / 1000000); // Convert to percentage
        this.updateMetric('cpu_usage', Math.min(cpuPercent, 100));
    }

    async collectApplicationMetrics() {
        // This would collect metrics from your application
        // For now, we'll simulate some metrics

        // Simulate active conversations
        const activeConversations = Math.floor(Math.random() * 50);
        this.updateMetric('active_conversations', activeConversations);

        // Simulate database connections
        const dbConnections = Math.floor(Math.random() * 20) + 5;
        this.updateMetric('db_connections', dbConnections);

        // Simulate response time
        const responseTime = Math.floor(Math.random() * 2000) + 500;
        this.updateMetric('response_time', responseTime);

        // Simulate error rate
        const errorRate = Math.random() * 2; // 0-2%
        this.updateMetric('error_rate', errorRate);
    }

    updateMetric(metricName, value) {
        const metric = this.metrics.get(metricName);
        if (!metric) return;

        metric.current = value;
        metric.values.push({
            value,
            timestamp: Date.now()
        });

        // Keep only last 100 values
        if (metric.values.length > 100) {
            metric.values = metric.values.slice(-100);
        }

        // Update aggregated values
        const values = metric.values.map(v => v.value);
        metric.average = values.reduce((a, b) => a + b, 0) / values.length;

        if (metric.unit === 'ms' || metric.unit === '%') {
            metric.p95 = this.calculatePercentile(values, 95);
            metric.p99 = this.calculatePercentile(values, 99);
        }

        if (metric.name.includes('peak') || metricName === 'memory_usage' || metricName === 'cpu_usage') {
            metric.peak = Math.max(metric.peak || 0, value);
        }
    }

    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[index] || 0;
    }

    checkThresholds() {
        for (const [metricName, metric] of this.metrics) {
            const threshold = this.thresholds.get(metricName);
            if (!threshold) continue;

            const value = metric.current;
            let severity = null;

            if (value >= threshold.critical) {
                severity = 'critical';
            } else if (value >= threshold.warning) {
                severity = 'warning';
            }

            if (severity) {
                this.triggerAlert(metricName, value, threshold[severity], severity, metric.unit);
            }
        }
    }

    async triggerAlert(metric, value, threshold, severity, unit) {
        const alertKey = `${metric}_${severity}`;
        const now = Date.now();

        // Check cooldown (prevent spam)
        const lastAlert = this.alertCooldowns.get(alertKey);
        const cooldownPeriod = severity === 'critical' ? 300000 : 600000; // 5min for critical, 10min for warning

        if (lastAlert && (now - lastAlert) < cooldownPeriod) {
            return; // Still in cooldown
        }

        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            metric,
            value,
            threshold,
            severity,
            unit,
            message: `${metric} is ${severity}: ${value}${unit} (threshold: ${threshold}${unit})`,
            environment: configManager.getEnvironment()
        };

        // Store alert
        this.alerts.set(alert.id, alert);

        // Update cooldown
        this.alertCooldowns.set(alertKey, now);

        // Send alert through all handlers
        for (const [handlerName, handler] of this.alertHandlers) {
            try {
                await handler.handle(alert);
            } catch (error) {
                console.error(`Alert handler ${handlerName} failed:`, error);
            }
        }

        console.log(`🚨 Alert triggered: ${alert.message}`);
    }

    startHealthChecks() {
        for (const [checkName, healthCheck] of this.healthChecks) {
            const runCheck = async () => {
                try {
                    const result = await Promise.race([
                        healthCheck.check(),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Health check timeout')), healthCheck.timeout)
                        )
                    ]);

                    if (!result.healthy) {
                        this.triggerAlert(
                            `health_${checkName}`,
                            0,
                            1,
                            'critical',
                            'status'
                        );
                    }

                    // Update health check metrics
                    if (result.responseTime) {
                        this.updateMetric(`${checkName}_response_time`, result.responseTime);
                    }

                } catch (error) {
                    console.error(`Health check ${checkName} failed:`, error);
                    this.triggerAlert(
                        `health_${checkName}`,
                        0,
                        1,
                        'critical',
                        'status'
                    );
                }
            };

            // Run initial check
            runCheck();

            // Schedule recurring checks
            setInterval(runCheck, healthCheck.interval);
        }
    }

    stopHealthChecks() {
        // Health checks are managed by intervals, they'll stop when the main interval stops
    }

    // Public API methods
    getMetrics() {
        const result = {};
        for (const [name, metric] of this.metrics) {
            result[name] = {
                name: metric.name,
                unit: metric.unit,
                current: metric.current,
                average: metric.average,
                peak: metric.peak,
                p95: metric.p95,
                p99: metric.p99
            };
        }
        return result;
    }

    getAlerts(limit = 50) {
        const alerts = Array.from(this.alerts.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

        return alerts;
    }

    getHealthStatus() {
        const status = {
            overall: 'healthy',
            checks: {},
            timestamp: new Date().toISOString()
        };

        // This would check the latest health check results
        // For now, we'll return a basic status
        for (const [checkName, healthCheck] of this.healthChecks) {
            status.checks[checkName] = {
                name: healthCheck.name,
                healthy: true, // This would be the actual status
                lastCheck: new Date().toISOString()
            };
        }

        return status;
    }

    getDashboardData() {
        return {
            metrics: this.getMetrics(),
            alerts: this.getAlerts(10),
            health: this.getHealthStatus(),
            monitoring: {
                isRunning: this.isMonitoring,
                uptime: this.isMonitoring ? Date.now() - this.startTime : 0,
                environment: configManager.getEnvironment()
            }
        };
    }

    // Configuration methods
    updateThreshold(metric, level, value) {
        const threshold = this.thresholds.get(metric);
        if (threshold) {
            threshold[level] = value;
            console.log(`Updated ${metric} ${level} threshold to ${value}`);
        }
    }

    addAlertHandler(name, handler) {
        this.alertHandlers.set(name, handler);
        console.log(`Added alert handler: ${name}`);
    }

    removeAlertHandler(name) {
        this.alertHandlers.delete(name);
        console.log(`Removed alert handler: ${name}`);
    }
}

// Create singleton instance
const productionMonitor = new ProductionMonitor();

export default productionMonitor;
export { ProductionMonitor };