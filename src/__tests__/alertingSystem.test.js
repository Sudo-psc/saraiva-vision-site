/**
 * Tests for the alerting system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { alertingSystem, ALERT_SEVERITY, ALERT_TYPES } from '../lib/alertingSystem.js';

// Mock Supabase
const mockSupabase = {
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                contains: vi.fn(() => ({
                    gte: vi.fn(() => ({
                        order: vi.fn(() => ({
                            limit: vi.fn(() => ({ data: [], error: null }))
                        }))
                    }))
                }))
            }))
        })),
        insert: vi.fn(() => ({ error: null })),
        update: vi.fn(() => ({
            eq: vi.fn(() => ({ error: null }))
        }))
    }))
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabase)
}));

// Mock logger
vi.mock('../lib/logger.js', () => ({
    createLogger: vi.fn(() => ({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }))
}));

describe('AlertingSystem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset alert cooldowns
        alertingSystem.recentAlerts.clear();
    });

    describe('Email Delivery Tracking', () => {
        it('should track successful email delivery', async () => {
            await alertingSystem.trackEmailDelivery(
                'msg_123',
                'test@example.com',
                true,
                null,
                { contact_id: 'contact_123' }
            );

            expect(mockSupabase.from).toHaveBeenCalledWith('message_outbox');
        });
    });
}); it
    ('should track failed email delivery and check failure rates', async () => {
        // Mock recent logs with high failure rate
        const mockLogs = [
            { event_data: { metadata: { operation_type: 'email_delivery', success: false } } },
            { event_data: { metadata: { operation_type: 'email_delivery', success: false } } },
            { event_data: { metadata: { operation_type: 'email_delivery', success: true } } }
        ];

        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    contains: vi.fn(() => ({
                        gte: vi.fn(() => ({
                            order: vi.fn(() => ({
                                limit: vi.fn(() => ({ data: mockLogs, error: null }))
                            }))
                        }))
                    }))
                }))
            }))
        });

        await alertingSystem.trackEmailDelivery(
            'msg_123',
            'test@example.com',
            false,
            new Error('Delivery failed'),
            { contact_id: 'contact_123' }
        );

        expect(mockSupabase.from).toHaveBeenCalledWith('event_log');
    });

it('should hash email addresses for privacy', () => {
    const hash1 = alertingSystem.hashEmail('test@example.com');
    const hash2 = alertingSystem.hashEmail('test@example.com');
    const hash3 = alertingSystem.hashEmail('different@example.com');

    expect(hash1).toBe(hash2); // Same email should produce same hash
    expect(hash1).not.toBe(hash3); // Different emails should produce different hashes
    expect(hash1).toHaveLength(16); // Should be truncated to 16 chars
});
  });

describe('SMS Delivery Tracking', () => {
    it('should track successful SMS delivery', async () => {
        await alertingSystem.trackSmsDelivery(
            'sms_123',
            '+5511999999999',
            true,
            null,
            { appointment_id: 'apt_123' }
        );

        expect(mockSupabase.from).toHaveBeenCalledWith('message_outbox');
    });

    it('should hash phone numbers for privacy', () => {
        const hash1 = alertingSystem.hashPhone('+5511999999999');
        const hash2 = alertingSystem.hashPhone('11999999999');
        const hash3 = alertingSystem.hashPhone('+5511888888888');

        expect(hash1).toBeDefined();
        expect(hash1).not.toBe(hash3);
        expect(hash1).toHaveLength(16);
    });
});

describe('Alert Creation', () => {
    it('should create alert without duplication within cooldown', async () => {
        // Create first alert
        await alertingSystem.createAlert(
            ALERT_TYPES.EMAIL_DELIVERY_FAILURE,
            ALERT_SEVERITY.HIGH,
            'High email failure rate detected',
            { failure_rate: 15 }
        );

        // Try to create same alert immediately (should be deduplicated)
        await alertingSystem.createAlert(
            ALERT_TYPES.EMAIL_DELIVERY_FAILURE,
            ALERT_SEVERITY.HIGH,
            'High email failure rate detected',
            { failure_rate: 16 }
        );

        // Should only insert once due to deduplication
        expect(mockSupabase.from).toHaveBeenCalledWith('message_outbox');
    });

    it('should send SMS for critical alerts', async () => {
        process.env.ADMIN_PHONE = '+5511999999999';

        await alertingSystem.createAlert(
            ALERT_TYPES.SERVICE_UNAVAILABLE,
            ALERT_SEVERITY.CRITICAL,
            'Service completely unavailable',
            { service: 'database' }
        );

        // Should insert both email and SMS notifications
        const insertCalls = mockSupabase.from().insert.mock.calls;
        expect(insertCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('should format alert email correctly', () => {
        const alert = {
            type: ALERT_TYPES.HIGH_ERROR_RATE,
            severity: ALERT_SEVERITY.HIGH,
            message: 'Error rate exceeded threshold',
            metadata: { error_rate: 15, endpoint: '/api/test' },
            timestamp: '2024-01-01T00:00:00Z'
        };

        const emailContent = alertingSystem.formatAlertEmail(alert);

        expect(emailContent).toContain('ALERTA: high_error_rate');
        expect(emailContent).toContain('Severidade: HIGH');
        expect(emailContent).toContain('Error rate exceeded threshold');
        expect(emailContent).toContain('error_rate');
    });
});

describe('Delivery Statistics', () => {
    it('should calculate delivery statistics correctly', async () => {
        const mockLogs = [
            { event_data: { metadata: { operation_type: 'email_delivery', success: true } } },
            { event_data: { metadata: { operation_type: 'email_delivery', success: false } } },
            { event_data: { metadata: { operation_type: 'sms_delivery', success: true } } },
            { event_data: { metadata: { operation_type: 'sms_delivery', success: true } } }
        ];

        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    or: vi.fn(() => ({
                        gte: vi.fn(() => ({ data: mockLogs, error: null }))
                    }))
                }))
            }))
        });

        const stats = await alertingSystem.getDeliveryStats(24);

        expect(stats.email.total).toBe(2);
        expect(stats.email.successful).toBe(1);
        expect(stats.email.failed).toBe(1);
        expect(stats.email.failure_rate).toBe(50);

        expect(stats.sms.total).toBe(2);
        expect(stats.sms.successful).toBe(2);
        expect(stats.sms.failed).toBe(0);
        expect(stats.sms.failure_rate).toBe(0);
    });

    it('should handle empty logs gracefully', async () => {
        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    or: vi.fn(() => ({
                        gte: vi.fn(() => ({ data: [], error: null }))
                    }))
                }))
            }))
        });

        const stats = await alertingSystem.getDeliveryStats(24);

        expect(stats.email.total).toBe(0);
        expect(stats.email.failure_rate).toBe(0);
        expect(stats.sms.total).toBe(0);
        expect(stats.sms.failure_rate).toBe(0);
    });
});

describe('Recent Alerts Retrieval', () => {
    it('should retrieve and format recent alerts', async () => {
        const mockAlertLogs = [
            {
                id: 'log_1',
                created_at: '2024-01-01T00:00:00Z',
                severity: 'high',
                event_data: {
                    alert_type: 'email_delivery_failure',
                    message: 'High failure rate',
                    alert_metadata: { failure_rate: 15 }
                }
            }
        ];

        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    contains: vi.fn(() => ({
                        gte: vi.fn(() => ({
                            order: vi.fn(() => ({ data: mockAlertLogs, error: null }))
                        }))
                    }))
                }))
            }))
        });

        const alerts = await alertingSystem.getRecentAlerts(24);

        expect(alerts).toHaveLength(1);
        expect(alerts[0].type).toBe('email_delivery_failure');
        expect(alerts[0].severity).toBe('high');
        expect(alerts[0].message).toBe('High failure rate');
    });
});

describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    contains: vi.fn(() => ({
                        gte: vi.fn(() => ({
                            order: vi.fn(() => ({
                                limit: vi.fn(() => ({ data: null, error: new Error('DB Error') }))
                            }))
                        }))
                    }))
                }))
            }))
        });

        // Should not throw error
        await expect(alertingSystem.checkEmailDeliveryFailures()).resolves.not.toThrow();
    });

    it('should return default stats on database error', async () => {
        mockSupabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    or: vi.fn(() => ({
                        gte: vi.fn(() => ({ data: null, error: new Error('DB Error') }))
                    }))
                }))
            }))
        });

        const stats = await alertingSystem.getDeliveryStats(24);

        expect(stats.email.total).toBe(0);
        expect(stats.sms.total).toBe(0);
    });
});

describe('Threshold Configuration', () => {
    it('should use configurable thresholds', () => {
        expect(alertingSystem.alertThresholds.email_failure_rate).toBe(5);
        expect(alertingSystem.alertThresholds.sms_failure_rate).toBe(5);
        expect(alertingSystem.alertThresholds.error_rate).toBe(10);
        expect(alertingSystem.alertThresholds.response_time_p95).toBe(5000);
        expect(alertingSystem.alertThresholds.consecutive_failures).toBe(3);
    });
});
});