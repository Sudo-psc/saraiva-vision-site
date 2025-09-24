/**
 * Tests for useAuditMonitoring hook
 * Comprehensive test suite for real-time audit monitoring functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuditMonitoring, useMetricMonitoring } from '../useAuditMonitoring.js';

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(() => 'test_token'),
    setItem: vi.fn(),
    removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock URL and Blob for file downloads
global.URL = {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn()
};

global.Blob = vi.fn(() => ({}));

// Mock document methods
Object.defineProperty(document, 'createElement', {
    value: vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn()
    }))
});

Object.defineProperty(document.body, 'appendChild', { value: vi.fn() });
Object.defineProperty(document.body, 'removeChild', { value: vi.fn() });

describe('useAuditMonitoring', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const mockDashboardData = {
        overview: {
            timeRange: '24h',
            totalEvents: 1000,
            securityEvents: 50,
            complianceEvents: 25,
            performanceEvents: 100,
            activeAlerts: 3,
            systemStatus: 'HEALTHY'
        },
        security: {
            threatLevel: 'LOW',
            blockedThreats: 10,
            averageThreatScore: 25
        },
        compliance: {
            cfmCompliance: {
                totalChecks: 100,
                violations: 2,
                complianceRate: 98
            },
            lgpdCompliance: {
                totalDataAccess: 500,
                consentBasedAccess: 480,
                complianceRate: 96
            }
        },
        performance: {
            averageResponseTime: 250,
            errorRate: 2.5,
            throughput: 10.5
        },
        alerts: {
            critical: [],
            high: [],
            medium: []
        }
    };

    const mockAlertsResponse = {
        success: true,
        data: {
            alerts: [
                {
                    id: 'alert1',
                    type: 'HIGH_ERROR_RATE',
                    severity: 'HIGH',
                    message: 'Error rate exceeds threshold',
                    timestamp: new Date().toISOString()
                }
            ],
            hasNewAlerts: true,
            alertCount: 1
        }
    };

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useAuditMonitoring());

        expect(result.current.dashboardData).toBeNull();
        expect(result.current.alerts).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();
        expect(result.current.connectionStatus).toBe('disconnected');
        expect(result.current.systemHealth).toBe('unknown');
    });

    it('should fetch dashboard data on mount', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: mockDashboardData
            })
        });

        const { result } = renderHook(() => useAuditMonitoring());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(fetch).toHaveBeenCalledWith(
            '/api/monitoring/audit?action=dashboard&timeRange=24h',
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test_token'
                })
            })
        );

        expect(result.current.dashboardData).toEqual(mockDashboardData);
        expect(result.current.connectionStatus).toBe('connected');
        expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
        const errorMessage = 'Network error';
        fetch.mockRejectedValueOnce(new Error(errorMessage));

        const onError = vi.fn();
        const { result } = renderHook(() => useAuditMonitoring({ onError }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(errorMessage);
        expect(result.current.connectionStatus).toBe('error');
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should auto-refresh dashboard data', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                data: mockDashboardData
            })
        });

        renderHook(() => useAuditMonitoring({
            autoRefresh: true,
            refreshInterval: 1000
        }));

        // Initial fetch
        expect(fetch).toHaveBeenCalledTimes(1);

        // Fast-forward time to trigger refresh
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(2);
        });
    });

    it('should check for real-time alerts', async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockDashboardData })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockAlertsResponse
            });

        const onAlert = vi.fn();
        const { result } = renderHook(() => useAuditMonitoring({
            enableRealTimeAlerts: true,
            alertCheckInterval: 1000,
            onAlert
        }));

        // Wait for initial dashboard fetch
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Fast-forward to trigger alert check
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(result.current.alerts).toHaveLength(1);
        });

        expect(onAlert).toHaveBeenCalledWith(mockAlertsResponse.data.alerts[0]);
        expect(result.current.hasUnacknowledgedAlerts).toBe(true);
    });

    it('should acknowledge alerts', async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockDashboardData })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        alertId: 'alert1',
                        acknowledged: true,
                        acknowledgedBy: 'admin@example.com'
                    }
                })
            });

        const { result } = renderHook(() => useAuditMonitoring());

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Add an alert to state
        act(() => {
            result.current.alerts.push({
                id: 'alert1',
                type: 'HIGH_ERROR_RATE',
                severity: 'HIGH',
                acknowledged: false
            });
        });

        // Acknowledge the alert
        let acknowledgeResult;
        await act(async () => {
            acknowledgeResult = await result.current.acknowledgeAlert(
                'alert1',
                'admin@example.com',
                'Investigating issue'
            );
        });

        expect(acknowledgeResult.success).toBe(true);
        expect(fetch).toHaveBeenCalledWith(
            '/api/monitoring/audit',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    action: 'acknowledge-alert',
                    alertId: 'alert1',
                    acknowledgedBy: 'admin@example.com',
                    notes: 'Investigating issue'
                })
            })
        );
    });

    it('should generate reports', async () => {
        const mockReportData = {
            id: 'report123',
            type: 'CFM_COMPLIANCE',
            summary: { complianceRate: 95 }
        };

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockDashboardData })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockReportData
                })
            });

        const { result } = renderHook(() => useAuditMonitoring());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let reportResult;
        await act(async () => {
            reportResult = await result.current.generateReport(
                'CFM_COMPLIANCE',
                { startTime: '2024-01-01', endTime: '2024-01-31' }
            );
        });

        expect(reportResult.success).toBe(true);
        expect(reportResult.data).toEqual(mockReportData);
        expect(fetch).toHaveBeenCalledWith(
            '/api/monitoring/audit',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    action: 'generate-report',
                    reportType: 'CFM_COMPLIANCE',
                    filters: { startTime: '2024-01-01', endTime: '2024-01-31' },
                    format: 'json'
                })
            })
        );
    });

    it('should generate CSV reports and trigger download', async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockDashboardData })
            })
            .mockResolvedValueOnce({
                ok: true,
                text: async () => 'CSV,Data,Here'
            });

        const { result } = renderHook(() => useAuditMonitoring());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let reportResult;
        await act(async () => {
            reportResult = await result.current.generateReport(
                'LGPD_COMPLIANCE',
                {},
                'csv'
            );
        });

        expect(reportResult.success).toBe(true);
        expect(global.Blob).toHaveBeenCalledWith(['CSV,Data,Here'], { type: 'text/csv' });
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should perform security analysis', async () => {
        const mockAnalysis = {
            threatDetected: true,
            threatLevel: 'HIGH',
            violations: ['XSS_ATTEMPT'],
            securityScore: 60
        };

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockDashboardData })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockAnalysis
                })
            });

        const { result } = renderHook(() => useAuditMonitoring());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let analysisResult;
        await act(async () => {
            analysisResult = await result.current.analyzeSecurityEvent(
                { message: '<script>alert("xss")</script>' },
                { sessionId: 'session123' }
            );
        });

        expect(analysisResult.success).toBe(true);
        expect(analysisResult.data).toEqual(mockAnalysis);
    });

    it('should monitor compliance', async () => {
        const mockCompliance = {
            cfmCompliant: false,
            lgpdCompliant: true,
            violations: ['MEDICAL_ADVICE_DETECTED'],
            complianceScore: 75
        };

        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockDashboardData })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockCompliance
                })
            });

        const { result } = renderHook(() => useAuditMonitoring());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        let complianceResult;
        await act(async () => {
            complianceResult = await result.current.monitorCompliance(
                { message: 'Que remédio posso tomar?' },
                { sessionId: 'session456' }
            );
        });

        expect(complianceResult.success).toBe(true);
        expect(complianceResult.data).toEqual(mockCompliance);
    });

    it('should calculate system health correctly', async () => {
        // Test excellent health
        const excellentHealthData = {
            ...mockDashboardData,
            overview: { ...mockDashboardData.overview, systemStatus: 'HEALTHY', activeAlerts: 0 },
            security: { ...mockDashboardData.security, threatLevel: 'LOW' },
            performance: { ...mockDashboardData.performance, averageResponseTime: 200, errorRate: 1 },
            compliance: {
                cfmCompliance: { complianceRate: 99 },
                lgpdCompliance: { complianceRate: 98 }
            }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: excellentHealthData })
        });

        const { result } = renderHook(() => useAuditMonitoring());

        await waitFor(() => {
            expect(result.current.systemHealth).toBe('excellent');
        });

        // Test critical health
        const criticalHealthData = {
            ...mockDashboardData,
            overview: { ...mockDashboardData.overview, systemStatus: 'CRITICAL', activeAlerts: 10 },
            security: { ...mockDashboardData.security, threatLevel: 'CRITICAL' },
            performance: { ...mockDashboardData.performance, averageResponseTime: 8000, errorRate: 15 },
            compliance: {
                cfmCompliance: { complianceRate: 70 },
                lgpdCompliance: { complianceRate: 65 }
            }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: criticalHealthData })
        });

        const { rerender } = renderHook(() => useAuditMonitoring());
        rerender();

        await waitFor(() => {
            expect(result.current.systemHealth).toBe('critical');
        });
    });

    it('should handle manual refresh', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: mockDashboardData })
        });

        const { result } = renderHook(() => useAuditMonitoring({ autoRefresh: false }));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Clear previous calls
        fetch.mockClear();

        // Manual refresh
        act(() => {
            result.current.refresh();
        });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(result.current.loading).toBe(true);
    });

    it('should clear alerts', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: mockDashboardData })
        });

        const { result } = renderHook(() => useAuditMonitoring());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Add some alerts
        act(() => {
            result.current.alerts.push(
                { id: 'alert1', type: 'ERROR' },
                { id: 'alert2', type: 'WARNING' }
            );
        });

        expect(result.current.alerts).toHaveLength(2);

        // Clear alerts
        act(() => {
            result.current.clearAlerts();
        });

        expect(result.current.alerts).toHaveLength(0);
    });

    it('should cleanup intervals on unmount', () => {
        const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

        const { unmount } = renderHook(() => useAuditMonitoring({
            autoRefresh: true,
            enableRealTimeAlerts: true
        }));

        unmount();

        expect(clearIntervalSpy).toHaveBeenCalledTimes(2); // One for refresh, one for alerts
    });

    it('should abort pending requests on unmount', () => {
        const abortSpy = vi.fn();
        const mockAbortController = { abort: abortSpy };
        global.AbortController = vi.fn(() => mockAbortController);

        const { unmount } = renderHook(() => useAuditMonitoring());

        unmount();

        expect(abortSpy).toHaveBeenCalled();
    });
});

describe('useMetricMonitoring', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const mockMetricData = {
        success: true,
        data: {
            current: {
                responseTime: 250,
                errorRate: 2.5,
                memoryUsage: 65
            }
        }
    };

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useMetricMonitoring('responseTime'));

        expect(result.current.value).toBeNull();
        expect(result.current.trend).toBe('stable');
        expect(result.current.history).toEqual([]);
        expect(result.current.thresholdExceeded).toBe(false);
    });

    it('should fetch metric data', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMetricData
        });

        const { result } = renderHook(() => useMetricMonitoring('responseTime'));

        await waitFor(() => {
            expect(result.current.value).toBe(250);
        });

        expect(fetch).toHaveBeenCalledWith(
            '/api/monitoring/audit?action=performance-metrics&metric=responseTime',
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test_token'
                })
            })
        );
    });

    it('should detect threshold exceeded', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                ...mockMetricData,
                data: {
                    current: {
                        responseTime: 5000 // Exceeds threshold
                    }
                }
            })
        });

        const onThresholdExceeded = vi.fn();
        const { result } = renderHook(() => useMetricMonitoring('responseTime', {
            threshold: 3000,
            onThresholdExceeded
        }));

        await waitFor(() => {
            expect(result.current.thresholdExceeded).toBe(true);
        });

        expect(onThresholdExceeded).toHaveBeenCalledWith(5000, 3000);
    });

    it('should calculate trends', async () => {
        const { result } = renderHook(() => useMetricMonitoring('responseTime'));

        // Mock multiple responses with increasing values
        const responses = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550];

        for (const value of responses) {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: { current: { responseTime: value } }
                })
            });

            act(() => {
                result.current.refresh();
            });

            await waitFor(() => {
                expect(result.current.value).toBe(value);
            });
        }

        // Should detect increasing trend
        expect(result.current.trend).toBe('increasing');
        expect(result.current.history).toHaveLength(10);
    });

    it('should auto-refresh metrics', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockMetricData
        });

        renderHook(() => useMetricMonitoring('responseTime', {
            refreshInterval: 1000
        }));

        // Initial fetch
        expect(fetch).toHaveBeenCalledTimes(1);

        // Fast-forward time to trigger refresh
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(2);
        });
    });

    it('should handle fetch errors gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        fetch.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useMetricMonitoring('responseTime'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Metric fetch error for responseTime:',
                expect.any(Error)
            );
        });

        expect(result.current.value).toBeNull();
        consoleSpy.mockRestore();
    });

    it('should cleanup interval on unmount', () => {
        const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

        const { unmount } = renderHook(() => useMetricMonitoring('responseTime'));

        unmount();

        expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    });
});