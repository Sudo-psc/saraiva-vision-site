import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GoogleBusinessMonitor from '../googleBusinessMonitor';

describe('GoogleBusinessMonitor', () => {
    let monitor;
    let mockConsole;

    beforeEach(() => {
        mockConsole = {
            warn: vi.fn(),
            log: vi.fn(),
            error: vi.fn()
        };
        global.console = mockConsole;

        monitor = new GoogleBusinessMonitor({
            checkInterval: 1000, // 1 second for faster testing
            alertThresholds: {
                errorRate: 0.1,
                responseTime: 1000,
                quotaUsage: 0.8
            },
            notificationChannels: ['console']
        });
    });

    afterEach(() => {
        if (monitor.isMonitoring) {
            monitor.stopMonitoring();
        }
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with default options', () => {
            const defaultMonitor = new GoogleBusinessMonitor();
            expect(defaultMonitor.options.checkInterval).toBe(60000);
            expect(defaultMonitor.options.alertThresholds.errorRate).toBe(0.1);
            expect(defaultMonitor.options.notificationChannels).toEqual(['console']);
        });

        it('should initialize with custom options', () => {
            const customMonitor = new GoogleBusinessMonitor({
                checkInterval: 30000,
                alertThresholds: {
                    errorRate: 0.2,
                    responseTime: 2000,
                    quotaUsage: 0.9
                },
                notificationChannels: ['console', 'email']
            });

            expect(customMonitor.options.checkInterval).toBe(30000);
            expect(customMonitor.options.alertThresholds.errorRate).toBe(0.2);
            expect(customMonitor.options.notificationChannels).toEqual(['console', 'email']);
        });

        it('should set up initial monitoring data', () => {
            expect(monitor.monitoringData).toEqual({
                apiConnectivity: true,
                lastCheckTime: null,
                errorCount: 0,
                totalRequests: 0,
                averageResponseTime: 0,
                quotaUsage: 0,
                cacheHealth: true,
                activeAlerts: [],
                historicalData: []
            });
        });
    });

    describe('Start and Stop Monitoring', () => {
        it('should start monitoring successfully', () => {
            monitor.startMonitoring();
            expect(monitor.isMonitoring).toBe(true);
            expect(monitor.monitoringInterval).not.toBeNull();
            expect(mockConsole.log).toHaveBeenCalledWith('Google Business monitoring started');
        });

        it('should not start monitoring if already active', () => {
            monitor.startMonitoring();
            const initialInterval = monitor.monitoringInterval;

            monitor.startMonitoring();

            expect(monitor.monitoringInterval).toBe(initialInterval);
            expect(mockConsole.warn).toHaveBeenCalledWith('Monitoring is already active');
        });

        it('should stop monitoring successfully', () => {
            monitor.startMonitoring();
            monitor.stopMonitoring();

            expect(monitor.isMonitoring).toBe(false);
            expect(monitor.monitoringInterval).toBeNull();
            expect(mockConsole.log).toHaveBeenCalledWith('Google Business monitoring stopped');
        });

        it('should not stop monitoring if not active', () => {
            monitor.stopMonitoring();
            expect(mockConsole.warn).toHaveBeenCalledWith('Monitoring is not active');
        });
    });

    describe('Health Checks', () => {
        it('should perform API connectivity check', async () => {
            const result = await monitor.checkApiConnectivity();

            expect(result).toHaveProperty('connected');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('timestamp');
        });

        it('should perform cache health check', async () => {
            const result = await monitor.checkCacheHealth();

            expect(result).toHaveProperty('healthy');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('timestamp');
        });

        it('should perform quota usage check', async () => {
            const result = await monitor.checkQuotaUsage();

            expect(result).toHaveProperty('usage');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('timestamp');
        });

        it('should handle errors during health checks', async () => {
            // Mock a failed API check
            vi.spyOn(monitor, 'checkApiConnectivity').mockRejectedValue(new Error('API Error'));

            await monitor.performHealthCheck();

            expect(mockConsole.error).toHaveBeenCalledWith('Health check failed:', expect.any(Error));
            expect(monitor.monitoringData.errorCount).toBe(1);
        });
    });

    describe('Alert System', () => {
        it('should trigger alert for API connectivity loss', async () => {
            vi.spyOn(monitor, 'checkApiConnectivity').mockResolvedValue({
                connected: false,
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            });

            await monitor.performHealthCheck();

            expect(monitor.monitoringData.activeAlerts).toHaveLength(1);
            expect(monitor.monitoringData.activeAlerts[0].type).toBe('api_connectivity');
            expect(monitor.monitoringData.activeAlerts[0].severity).toBe('critical');
        });

        it('should trigger alert for high response time', async () => {
            vi.spyOn(monitor, 'checkApiConnectivity').mockResolvedValue({
                connected: true,
                status: 'healthy',
                timestamp: new Date().toISOString()
            });

            // Simulate high response time
            monitor.updateMonitoringData({ responseTime: 2000 });

            await monitor.performHealthCheck();

            const responseTimeAlert = monitor.monitoringData.activeAlerts.find(
                alert => alert.type === 'response_time'
            );
            expect(responseTimeAlert).toBeDefined();
            expect(responseTimeAlert.severity).toBe('warning');
        });

        it('should trigger alert for high quota usage', async () => {
            vi.spyOn(monitor, 'checkQuotaUsage').mockResolvedValue({
                usage: 0.9,
                status: 'warning',
                timestamp: new Date().toISOString()
            });

            await monitor.performHealthCheck();

            const quotaAlert = monitor.monitoringData.activeAlerts.find(
                alert => alert.type === 'quota_usage'
            );
            expect(quotaAlert).toBeDefined();
            expect(quotaAlert.severity).toBe('warning');
        });

        it('should trigger alert for cache health issues', async () => {
            vi.spyOn(monitor, 'checkCacheHealth').mockResolvedValue({
                healthy: false,
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            });

            await monitor.performHealthCheck();

            const cacheAlert = monitor.monitoringData.activeAlerts.find(
                alert => alert.type === 'cache_health'
            );
            expect(cacheAlert).toBeDefined();
            expect(cacheAlert.severity).toBe('warning');
        });

        it('should not trigger duplicate alerts', async () => {
            vi.spyOn(monitor, 'checkApiConnectivity').mockResolvedValue({
                connected: false,
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            });

            // First check should trigger alert
            await monitor.performHealthCheck();
            expect(monitor.monitoringData.activeAlerts).toHaveLength(1);

            // Second check should not trigger duplicate alert
            await monitor.performHealthCheck();
            expect(monitor.monitoringData.activeAlerts).toHaveLength(1);
        });

        it('should clear resolved alerts', async () => {
            // Trigger initial alert
            vi.spyOn(monitor, 'checkApiConnectivity').mockResolvedValue({
                connected: false,
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            });

            await monitor.performHealthCheck();
            expect(monitor.monitoringData.activeAlerts).toHaveLength(1);

            // Resolve the issue
            vi.spyOn(monitor, 'checkApiConnectivity').mockResolvedValue({
                connected: true,
                status: 'healthy',
                timestamp: new Date().toISOString()
            });

            await monitor.performHealthCheck();
            expect(monitor.monitoringData.activeAlerts).toHaveLength(0);
        });
    });

    describe('Alert Callbacks', () => {
        it('should register and call alert callbacks', async () => {
            const mockCallback = vi.fn();
            monitor.onAlert('api_connectivity', mockCallback);

            vi.spyOn(monitor, 'checkApiConnectivity').mockResolvedValue({
                connected: false,
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            });

            await monitor.performHealthCheck();

            expect(mockCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'api_connectivity',
                    severity: 'critical'
                })
            );
        });

        it('should register multiple callbacks for same alert type', async () => {
            const mockCallback1 = vi.fn();
            const mockCallback2 = vi.fn();

            monitor.onAlert('api_connectivity', mockCallback1);
            monitor.onAlert('api_connectivity', mockCallback2);

            vi.spyOn(monitor, 'checkApiConnectivity').mockResolvedValue({
                connected: false,
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            });

            await monitor.performHealthCheck();

            expect(mockCallback1).toHaveBeenCalled();
            expect(mockCallback2).toHaveBeenCalled();
        });
    });

    describe('Data Management', () => {
        it('should update monitoring data correctly', () => {
            const initialData = { ...monitor.monitoringData };

            monitor.updateMonitoringData({
                apiConnectivity: false,
                responseTime: 1500,
                cacheHealth: false,
                quotaUsage: 0.9
            });

            expect(monitor.monitoringData.apiConnectivity).toBe(false);
            expect(monitor.monitoringData.responseTime).toBe(1500);
            expect(monitor.monitoringData.cacheHealth).toBe(false);
            expect(monitor.monitoringData.quotaUsage).toBe(0.9);
            expect(monitor.monitoringData.totalRequests).toBe(initialData.totalRequests + 1);
        });

        it('should calculate average response time correctly', () => {
            // Initial state
            expect(monitor.monitoringData.averageResponseTime).toBe(0);
            expect(monitor.monitoringData.totalRequests).toBe(0);

            // First update
            monitor.updateMonitoringData({ responseTime: 1000 });
            expect(monitor.monitoringData.averageResponseTime).toBe(1000);
            expect(monitor.monitoringData.totalRequests).toBe(1);

            // Second update
            monitor.updateMonitoringData({ responseTime: 2000 });
            expect(monitor.monitoringData.averageResponseTime).toBe(1500);
            expect(monitor.monitoringData.totalRequests).toBe(2);
        });

        it('should store historical data with size limit', () => {
            // Add more than 100 entries
            for (let i = 0; i < 105; i++) {
                monitor.storeHistoricalData();
            }

            expect(monitor.monitoringData.historicalData).toHaveLength(100);
        });

        it('should get historical data with limit', () => {
            // Add some test data
            for (let i = 0; i < 10; i++) {
                monitor.storeHistoricalData();
            }

            const historicalData = monitor.getHistoricalData(5);
            expect(historicalData).toHaveLength(5);
        });
    });

    describe('Status and Health Summary', () => {
        beforeEach(() => {
            // Set up some test data
            monitor.monitoringData = {
                apiConnectivity: true,
                lastCheckTime: new Date().toISOString(),
                errorCount: 0,
                totalRequests: 10,
                averageResponseTime: 500,
                quotaUsage: 0.3,
                cacheHealth: true,
                activeAlerts: [],
                historicalData: []
            };
        });

        it('should get current status', () => {
            const status = monitor.getStatus();

            expect(status).toHaveProperty('isMonitoring');
            expect(status).toHaveProperty('data');
            expect(status).toHaveProperty('uptime');
            expect(status).toHaveProperty('alerts');
        });

        it('should get health summary for healthy system', () => {
            const healthSummary = monitor.getHealthSummary();

            expect(healthSummary.status).toBe('healthy');
            expect(healthSummary.issues).toHaveLength(0);
        });

        it('should get health summary for system with warnings', () => {
            monitor.monitoringData.quotaUsage = 0.9;
            monitor.monitoringData.responseTime = 2000;

            const healthSummary = monitor.getHealthSummary();

            expect(healthSummary.status).toBe('warning');
            expect(healthSummary.issues).toContain('High quota usage');
            expect(healthSummary.issues).toContain('Slow response time');
        });

        it('should get health summary for critical system', () => {
            monitor.monitoringData.apiConnectivity = false;
            monitor.monitoringData.cacheHealth = false;
            monitor.monitoringData.quotaUsage = 0.9;
            monitor.monitoringData.responseTime = 2000;

            const healthSummary = monitor.getHealthSummary();

            expect(healthSummary.status).toBe('critical');
            expect(healthSummary.issues).toHaveLength(4);
        });
    });

    describe('Notification System', () => {
        it('should send console notifications', async () => {
            const alert = {
                type: 'test',
                severity: 'warning',
                message: 'Test alert',
                timestamp: new Date().toISOString()
            };

            await monitor.sendNotification('console', alert);

            expect(mockConsole.warn).toHaveBeenCalledWith(
                '[WARNING] Test alert'
            );
        });

        it('should handle unknown notification channels', async () => {
            const alert = {
                type: 'test',
                severity: 'warning',
                message: 'Test alert',
                timestamp: new Date().toISOString()
            };

            await monitor.sendNotification('unknown', alert);

            expect(mockConsole.warn).toHaveBeenCalledWith(
                'Unknown notification channel: unknown'
            );
        });

        it('should log email notifications (mock)', async () => {
            const alert = {
                type: 'test',
                severity: 'critical',
                message: 'Test alert',
                timestamp: new Date().toISOString()
            };

            await monitor.sendNotification('email', alert);

            expect(mockConsole.log).toHaveBeenCalledWith(
                'Email notification would be sent: Test alert'
            );
        });

        it('should log webhook notifications (mock)', async () => {
            const alert = {
                type: 'test',
                severity: 'info',
                message: 'Test alert',
                timestamp: new Date().toISOString()
            };

            await monitor.sendNotification('webhook', alert);

            expect(mockConsole.log).toHaveBeenCalledWith(
                'Webhook notification would be sent: Test alert'
            );
        });
    });
});
