/**
 * Error Tracking and Alerting System
 * Specialized for email/SMS delivery failures and system alerts
 * NOTE: Supabase integration removed - console-only logging
 */

import { createLogger } from './logger.js';

// Supabase removed - always returns null for console fallback
function getSupabaseClient() {
    return null;
}

/**
 * Alert severity levels
 */
export const ALERT_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Alert types
 */
export const ALERT_TYPES = {
    EMAIL_DELIVERY_FAILURE: 'email_delivery_failure',
    SMS_DELIVERY_FAILURE: 'sms_delivery_failure',
    HIGH_ERROR_RATE: 'high_error_rate',
    SLOW_RESPONSE: 'slow_response',
    SERVICE_UNAVAILABLE: 'service_unavailable',
    QUOTA_EXCEEDED: 'quota_exceeded',
    SECURITY_INCIDENT: 'security_incident'
};

/**
 * Alerting System Class
 */
class AlertingSystem {
    constructor() {
        this.logger = createLogger('alerting');
        this.alertThresholds = {
            email_failure_rate: 5, // 5% failure rate
            sms_failure_rate: 5,   // 5% failure rate
            error_rate: 10,        // 10% general error rate
            response_time_p95: 5000, // 5 seconds
            consecutive_failures: 3   // 3 consecutive failures
        };
        this.recentAlerts = new Map(); // For alert deduplication
        this.alertCooldown = 5 * 60 * 1000; // 5 minutes cooldown
    }

    /**
     * Track email delivery attempt
     */
    async trackEmailDelivery(messageId, recipient, success, error = null, metadata = {}) {
        const logData = {
            message_id: messageId,
            recipient_hash: this.hashEmail(recipient),
            success,
            error_message: error?.message,
            error_code: error?.code,
            service: 'resend',
            operation_type: 'email_delivery',
            ...metadata
        };

        if (success) {
            await this.logger.info('Email delivered successfully', logData);
        } else {
            await this.logger.error('Email delivery failed', logData);
            await this.checkEmailDeliveryFailures();
        }

        // Update message status in outbox
        if (messageId) {
            await this.updateOutboxStatus(messageId, success ? 'sent' : 'failed', error?.message);
        }
    }

    /**
     * Track SMS delivery attempt
     */
    async trackSmsDelivery(messageId, recipient, success, error = null, metadata = {}) {
        const logData = {
            message_id: messageId,
            recipient_hash: this.hashPhone(recipient),
            success,
            error_message: error?.message,
            error_code: error?.code,
            service: 'zenvia',
            operation_type: 'sms_delivery',
            ...metadata
        };

        if (success) {
            await this.logger.info('SMS delivered successfully', logData);
        } else {
            await this.logger.error('SMS delivery failed', logData);
            await this.checkSmsDeliveryFailures();
        }

        // Update message status in outbox
        if (messageId) {
            await this.updateOutboxStatus(messageId, success ? 'sent' : 'failed', error?.message);
        }
    }

    /**
     * Hash email for privacy-compliant logging
     */
    hashEmail(email) {
        if (!email) return null;
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').substring(0, 16);
    }

    /**
     * Hash phone number for privacy-compliant logging
     */
    hashPhone(phone) {
        if (!phone) return null;
        const crypto = require('crypto');
        const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits
        return crypto.createHash('sha256').update(cleanPhone).digest('hex').substring(0, 16);
    }

    /**
     * Update message status in outbox
     */
    async updateOutboxStatus(messageId, status, errorMessage = null) {
        try {
            const client = getSupabaseClient();
            if (!client) return;

            const updateData = {
                status,
                sent_at: status === 'sent' ? new Date().toISOString() : null,
                error_message: errorMessage
            };

            await client
                .from('message_outbox')
                .update(updateData)
                .eq('id', messageId);
        } catch (err) {
            await this.logger.error('Failed to update outbox status', {
                message_id: messageId,
                error: err.message
            });
        }
    }

    /**
     * Check email delivery failure rates
     */
    async checkEmailDeliveryFailures() {
        try {
            const client = getSupabaseClient();
            if (!client) return;

            const { data: recentLogs } = await client
                .from('event_log')
                .select('event_data')
                .eq('event_type', 'application_log')
                .contains('event_data', { operation_type: 'email_delivery' })
                .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
                .order('created_at', { ascending: false })
                .limit(100);

            if (!recentLogs || recentLogs.length === 0) return;

            const emailAttempts = recentLogs.filter(log =>
                log.event_data?.metadata?.operation_type === 'email_delivery'
            );

            const failures = emailAttempts.filter(log => !log.event_data?.metadata?.success);
            const failureRate = (failures.length / emailAttempts.length) * 100;

            if (failureRate > this.alertThresholds.email_failure_rate) {
                await this.createAlert(
                    ALERT_TYPES.EMAIL_DELIVERY_FAILURE,
                    ALERT_SEVERITY.HIGH,
                    `Email delivery failure rate is ${failureRate.toFixed(2)}%`,
                    {
                        failure_rate: failureRate,
                        total_attempts: emailAttempts.length,
                        failures: failures.length,
                        time_window: '1 hour'
                    }
                );
            }
        } catch (err) {
            await this.logger.error('Failed to check email delivery failures', { error: err.message });
        }
    }

    /**
     * Check SMS delivery failure rates
     */
    async checkSmsDeliveryFailures() {
        try {
            const client = getSupabaseClient();
            if (!client) return;

            const { data: recentLogs } = await client
                .from('event_log')
                .select('event_data')
                .eq('event_type', 'application_log')
                .contains('event_data', { operation_type: 'sms_delivery' })
                .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
                .order('created_at', { ascending: false })
                .limit(100);

            if (!recentLogs || recentLogs.length === 0) return;

            const smsAttempts = recentLogs.filter(log =>
                log.event_data?.metadata?.operation_type === 'sms_delivery'
            );

            const failures = smsAttempts.filter(log => !log.event_data?.metadata?.success);
            const failureRate = (failures.length / smsAttempts.length) * 100;

            if (failureRate > this.alertThresholds.sms_failure_rate) {
                await this.createAlert(
                    ALERT_TYPES.SMS_DELIVERY_FAILURE,
                    ALERT_SEVERITY.HIGH,
                    `SMS delivery failure rate is ${failureRate.toFixed(2)}%`,
                    {
                        failure_rate: failureRate,
                        total_attempts: smsAttempts.length,
                        failures: failures.length,
                        time_window: '1 hour'
                    }
                );
            }
        } catch (err) {
            await this.logger.error('Failed to check SMS delivery failures', { error: err.message });
        }
    }

    /**
     * Create alert with deduplication
     */
    async createAlert(type, severity, message, metadata = {}) {
        const alertKey = `${type}:${severity}`;
        const now = Date.now();

        // Check if we recently sent this type of alert (deduplication)
        if (this.recentAlerts.has(alertKey)) {
            const lastAlert = this.recentAlerts.get(alertKey);
            if (now - lastAlert < this.alertCooldown) {
                return; // Skip duplicate alert within cooldown period
            }
        }

        // Record alert time
        this.recentAlerts.set(alertKey, now);

        const alert = {
            type,
            severity,
            message,
            metadata,
            timestamp: new Date().toISOString(),
            resolved: false
        };

        // Log the alert
        await this.logger.error(`ALERT: ${message}`, {
            alert_type: type,
            alert_severity: severity,
            alert_metadata: metadata,
            operation_type: 'system_alert'
        });

        // Send notification based on severity
        await this.sendAlertNotification(alert);

        return alert;
    }

    /**
     * Send alert notification
     */
    async sendAlertNotification(alert) {
        try {
            const client = getSupabaseClient();
            if (!client) return;

            const adminEmail = process.env.ADMIN_EMAIL || 'admin@saraivavision.com.br';

            // Determine urgency based on severity
            const isUrgent = alert.severity === ALERT_SEVERITY.CRITICAL || alert.severity === ALERT_SEVERITY.HIGH;

            // Create email notification
            await client
                .from('message_outbox')
                .insert({
                    message_type: 'email',
                    recipient: adminEmail,
                    subject: `${isUrgent ? '🚨 URGENT' : '⚠️'} System Alert: ${alert.type}`,
                    content: this.formatAlertEmail(alert),
                    template_data: { alert },
                    status: 'pending',
                    send_after: new Date().toISOString()
                });

            // For critical alerts, also try to send SMS if configured
            if (alert.severity === ALERT_SEVERITY.CRITICAL && process.env.ADMIN_PHONE) {
                await client
                    .from('message_outbox')
                    .insert({
                        message_type: 'sms',
                        recipient: process.env.ADMIN_PHONE,
                        content: `CRITICAL ALERT: ${alert.message}. Check dashboard immediately.`,
                        template_data: { alert },
                        status: 'pending',
                        send_after: new Date().toISOString()
                    });
            }
        } catch (err) {
            await this.logger.error('Failed to send alert notification', {
                alert,
                error: err.message
            });
        }
    }

    /**
     * Format alert email content
     */
    formatAlertEmail(alert) {
        return `
Sistema de Monitoramento - Saraiva Vision

ALERTA: ${alert.type}
Severidade: ${alert.severity.toUpperCase()}
Timestamp: ${alert.timestamp}

Descrição:
${alert.message}

Detalhes:
${JSON.stringify(alert.metadata, null, 2)}

---
Este é um alerta automático do sistema de monitoramento.
Para mais detalhes, acesse o dashboard administrativo.
    `.trim();
    }

    /**
     * Get recent alerts
     */
    async getRecentAlerts(hours = 24) {
        try {
            const client = getSupabaseClient();
            if (!client) return [];

            const { data: logs } = await client
                .from('event_log')
                .select('*')
                .eq('event_type', 'application_log')
                .contains('event_data', { operation_type: 'system_alert' })
                .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: false });

            return logs?.map(log => ({
                id: log.id,
                timestamp: log.created_at,
                severity: log.severity,
                type: log.event_data?.alert_type,
                message: log.event_data?.message,
                metadata: log.event_data?.alert_metadata
            })) || [];
        } catch (err) {
            await this.logger.error('Failed to get recent alerts', { error: err.message });
            return [];
        }
    }

    /**
     * Get delivery statistics
     */
    async getDeliveryStats(hours = 24) {
        try {
            const client = getSupabaseClient();
            if (!client) {
                return {
                    email: { total: 0, successful: 0, failed: 0, failure_rate: 0 },
                    sms: { total: 0, successful: 0, failed: 0, failure_rate: 0 }
                };
            }

            const { data: logs } = await client
                .from('event_log')
                .select('event_data')
                .eq('event_type', 'application_log')
                .or('event_data->>operation_type.eq.email_delivery,event_data->>operation_type.eq.sms_delivery')
                .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString());

            const emailLogs = logs?.filter(log =>
                log.event_data?.metadata?.operation_type === 'email_delivery'
            ) || [];

            const smsLogs = logs?.filter(log =>
                log.event_data?.metadata?.operation_type === 'sms_delivery'
            ) || [];

            return {
                email: {
                    total: emailLogs.length,
                    successful: emailLogs.filter(log => log.event_data?.metadata?.success).length,
                    failed: emailLogs.filter(log => !log.event_data?.metadata?.success).length,
                    failure_rate: emailLogs.length > 0 ?
                        (emailLogs.filter(log => !log.event_data?.metadata?.success).length / emailLogs.length) * 100 : 0
                },
                sms: {
                    total: smsLogs.length,
                    successful: smsLogs.filter(log => log.event_data?.metadata?.success).length,
                    failed: smsLogs.filter(log => !log.event_data?.metadata?.success).length,
                    failure_rate: smsLogs.length > 0 ?
                        (smsLogs.filter(log => !log.event_data?.metadata?.success).length / smsLogs.length) * 100 : 0
                }
            };
        } catch (err) {
            await this.logger.error('Failed to get delivery stats', { error: err.message });
            return {
                email: { total: 0, successful: 0, failed: 0, failure_rate: 0 },
                sms: { total: 0, successful: 0, failed: 0, failure_rate: 0 }
            };
        }
    }
}

// Global alerting system instance
const alertingSystem = new AlertingSystem();

export { alertingSystem };
export default AlertingSystem;