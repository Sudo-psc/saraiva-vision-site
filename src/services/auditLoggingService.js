/**
 * Audit Logging Service
 * Comprehensive audit trail and monitoring system for chatbot interactions
 * 
 * Features:
 * - Complete audit trail for all interactions
 * - Security event detection and alerting
 * - Compliance reporting for CFM and LGPD
 * - Data access logging
 * - Real-time monitoring and alerting
 * - Performance metrics tracking
 */

import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

class AuditLoggingService {
    constructor() {
        this.config = {
            // Log levels
            logLevels: {
                DEBUG: 0,
                INFO: 1,
                WARN: 2,
                ERROR: 3,
                CRITICAL: 4
            },

            // Event categories
            eventCategories: {
                USER_INTERACTION: 'user_interaction',
                SECURITY_EVENT: 'security_event',
                MEDICAL_COMPLIANCE: 'medical_compliance',
                DATA_ACCESS: 'data_access',
                SYSTEM_EVENT: 'system_event',
                PERFORMANCE: 'performance',
                COMPLIANCE: 'compliance'
            },

            // Retention policies (in days)
            retentionPolicies: {
                DEBUG: 7,
                INFO: 30,
                WARN: 90,
                ERROR: 365,
                CRITICAL: 2555, // 7 years for critical events
                MEDICAL: 2555,  // 7 years for medical data
                COMPLIANCE: 2555 // 7 years for compliance data
            },

            // Alert thresholds
            alertThresholds: {
                errorRate: 5,           // 5% error rate
                criticalEvents: 1,      // Any critical event
                securityViolations: 3,  // 3 security violations per hour
                performanceDegradation: 10, // 10% performance degradation
                complianceViolations: 1 // Any compliance violation
            },

            // Storage configuration
            storage: {
                maxFileSize: 10 * 1024 * 1024, // 10MB per log file
                maxFiles: 100,                  // Maximum number of log files
                compressionEnabled: true,       // Enable log compression
                encryptionEnabled: true         // Enable log encryption
            }
        };

        // In-memory stores for real-time monitoring
        this.auditStore = new Map();
        this.alertStore = new Map();
        this.metricsStore = new Map();
        this.complianceStore = new Map();

        // Performance tracking
        this.performanceMetrics = {
            requestCount: 0,
            errorCount: 0,
            averageResponseTime: 0,
            lastHourMetrics: [],
            dailyMetrics: []
        };

        // Initialize logging system
        this.initializeLogging();

        // Start background tasks
        this.startBackgroundTasks();
    }

    /**
     * Initialize logging system
     */
    async initializeLogging() {
        try {
            // Ensure log directories exist
            await this.ensureLogDirectories();

            // Load existing audit data if available
            await this.loadExistingAuditData();

            console.log('Audit logging system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audit logging system:', error);
        }
    }

    /**
     * Log audit event
     * @param {string} category - Event category
     * @param {string} action - Action performed
     * @param {Object} details - Event details
     * @param {Object} context - Request context
     * @returns {string} Audit event ID
     */
    async logAuditEvent(category, action, details = {}, context = {}) {
        const eventId = this.generateEventId();
        const timestamp = new Date().toISOString();

        const auditEvent = {
            id: eventId,
            timestamp,
            category,
            action,
            details: this.sanitizeDetails(details),
            context: this.sanitizeContext(context),
            level: this.determineLogLevel(category, action),
            hash: this.generateEventHash(category, action, details, context),
            version: '1.0.0'
        };

        try {
            // Store in memory for real-time access
            this.auditStore.set(eventId, auditEvent);

            // Write to persistent storage
            await this.writeAuditLog(auditEvent);

            // Update metrics
            this.updateMetrics(auditEvent);

            // Check for alerts
            await this.checkAlertConditions(auditEvent);

            // Handle compliance logging
            if (this.isComplianceEvent(category, action)) {
                await this.logComplianceEvent(auditEvent);
            }

            return eventId;

        } catch (error) {
            console.error('Failed to log audit event:', error);
            // Fallback: at least log to console
            console.log('AUDIT_FALLBACK:', JSON.stringify(auditEvent));
            throw error;
        }
    }

    /**
     * Log user interaction
     * @param {Object} interaction - Interaction details
     * @param {Object} context - Request context
     * @returns {string} Event ID
     */
    async logUserInteraction(interaction, context) {
        return await this.logAuditEvent(
            this.config.eventCategories.USER_INTERACTION,
            'message_exchange',
            {
                sessionId: interaction.sessionId,
                messageId: interaction.messageId,
                messageLength: interaction.message?.length || 0,
                responseLength: interaction.response?.length || 0,
                processingTime: interaction.processingTime,
                securityScore: interaction.securityScore,
                complianceFlags: interaction.complianceFlags || [],
                medicalContent: interaction.containsMedicalContent || false
            },
            context
        );
    }

    /**
     * Log security event
     * @param {Object} securityEvent - Security event details
     * @param {Object} context - Request context
     * @returns {string} Event ID
     */
    async logSecurityEvent(securityEvent, context) {
        return await this.logAuditEvent(
            this.config.eventCategories.SECURITY_EVENT,
            securityEvent.type || 'security_violation',
            {
                severity: securityEvent.severity,
                description: securityEvent.description,
                violationType: securityEvent.violationType,
                blocked: securityEvent.blocked || false,
                threatScore: securityEvent.threatScore,
                mitigationActions: securityEvent.mitigationActions || []
            },
            context
        );
    }

    /**
     * Log medical compliance event
     * @param {Object} complianceEvent - Compliance event details
     * @param {Object} context - Request context
     * @returns {string} Event ID
     */
    async logMedicalComplianceEvent(complianceEvent, context) {
        return await this.logAuditEvent(
            this.config.eventCategories.MEDICAL_COMPLIANCE,
            complianceEvent.type || 'compliance_check',
            {
                complianceType: complianceEvent.complianceType, // CFM, LGPD, etc.
                result: complianceEvent.result,
                violations: complianceEvent.violations || [],
                disclaimersShown: complianceEvent.disclaimersShown || [],
                emergencyDetected: complianceEvent.emergencyDetected || false,
                medicalAdviceBlocked: complianceEvent.medicalAdviceBlocked || false
            },
            context
        );
    }

    /**
     * Log data access event
     * @param {Object} dataAccess - Data access details
     * @param {Object} context - Request context
     * @returns {string} Event ID
     */
    async logDataAccessEvent(dataAccess, context) {
        return await this.logAuditEvent(
            this.config.eventCategories.DATA_ACCESS,
            dataAccess.operation || 'data_access',
            {
                dataType: dataAccess.dataType,
                operation: dataAccess.operation, // read, write, delete, export
                recordCount: dataAccess.recordCount || 1,
                dataClassification: dataAccess.dataClassification, // public, internal, confidential, restricted
                purpose: dataAccess.purpose,
                legalBasis: dataAccess.legalBasis, // For LGPD compliance
                consentId: dataAccess.consentId,
                retentionPeriod: dataAccess.retentionPeriod
            },
            context
        );
    }

    /**
     * Log performance metrics
     * @param {Object} metrics - Performance metrics
     * @param {Object} context - Request context
     * @returns {string} Event ID
     */
    async logPerformanceMetrics(metrics, context) {
        return await this.logAuditEvent(
            this.config.eventCategories.PERFORMANCE,
            'performance_metrics',
            {
                responseTime: metrics.responseTime,
                memoryUsage: metrics.memoryUsage,
                cpuUsage: metrics.cpuUsage,
                requestsPerSecond: metrics.requestsPerSecond,
                errorRate: metrics.errorRate,
                throughput: metrics.throughput,
                latency: metrics.latency
            },
            context
        );
    }

    /**
     * Generate compliance report
     * @param {string} reportType - Type of compliance report
     * @param {Object} filters - Report filters
     * @returns {Object} Compliance report
     */
    async generateComplianceReport(reportType, filters = {}) {
        const startTime = Date.now();

        try {
            const reportId = this.generateEventId();
            const timestamp = new Date().toISOString();

            // Get relevant audit events
            const events = await this.getAuditEvents(filters);

            let report;

            switch (reportType) {
                case 'CFM_COMPLIANCE':
                    report = await this.generateCFMComplianceReport(events, filters);
                    break;
                case 'LGPD_COMPLIANCE':
                    report = await this.generateLGPDComplianceReport(events, filters);
                    break;
                case 'SECURITY_AUDIT':
                    report = await this.generateSecurityAuditReport(events, filters);
                    break;
                case 'DATA_ACCESS_AUDIT':
                    report = await this.generateDataAccessAuditReport(events, filters);
                    break;
                default:
                    throw new Error(`Unknown report type: ${reportType}`);
            }

            const fullReport = {
                id: reportId,
                type: reportType,
                timestamp,
                generatedBy: 'audit_logging_service',
                filters,
                summary: report.summary,
                details: report.details,
                recommendations: report.recommendations,
                metadata: {
                    eventCount: events.length,
                    generationTime: Date.now() - startTime,
                    version: '1.0.0'
                }
            };

            // Log report generation
            await this.logAuditEvent(
                this.config.eventCategories.COMPLIANCE,
                'report_generated',
                {
                    reportId,
                    reportType,
                    eventCount: events.length,
                    generationTime: Date.now() - startTime
                }
            );

            return fullReport;

        } catch (error) {
            console.error('Failed to generate compliance report:', error);
            throw error;
        }
    }

    /**
     * Get audit events with filters
     * @param {Object} filters - Event filters
     * @returns {Array} Filtered audit events
     */
    async getAuditEvents(filters = {}) {
        const events = Array.from(this.auditStore.values());

        return events.filter(event => {
            // Time range filter
            if (filters.startTime && new Date(event.timestamp) < new Date(filters.startTime)) {
                return false;
            }
            if (filters.endTime && new Date(event.timestamp) > new Date(filters.endTime)) {
                return false;
            }

            // Category filter
            if (filters.category && event.category !== filters.category) {
                return false;
            }

            // Action filter
            if (filters.action && event.action !== filters.action) {
                return false;
            }

            // Level filter
            if (filters.level && event.level !== filters.level) {
                return false;
            }

            // Session filter
            if (filters.sessionId && event.details.sessionId !== filters.sessionId) {
                return false;
            }

            return true;
        });
    }

    /**
     * Generate CFM compliance report
     * @param {Array} events - Audit events
     * @param {Object} filters - Report filters
     * @returns {Object} CFM compliance report
     */
    async generateCFMComplianceReport(events, filters) {
        const medicalEvents = events.filter(e =>
            e.category === this.config.eventCategories.MEDICAL_COMPLIANCE ||
            e.details.medicalContent === true
        );

        const emergencyEvents = medicalEvents.filter(e =>
            e.details.emergencyDetected === true
        );

        const medicalAdviceBlocked = medicalEvents.filter(e =>
            e.details.medicalAdviceBlocked === true
        );

        const disclaimersShown = medicalEvents.filter(e =>
            e.details.disclaimersShown && e.details.disclaimersShown.length > 0
        );

        return {
            summary: {
                totalMedicalInteractions: medicalEvents.length,
                emergencyDetections: emergencyEvents.length,
                medicalAdviceBlocked: medicalAdviceBlocked.length,
                disclaimersShown: disclaimersShown.length,
                complianceRate: medicalEvents.length > 0 ?
                    ((medicalEvents.length - medicalAdviceBlocked.length) / medicalEvents.length * 100).toFixed(2) : 100
            },
            details: {
                emergencyEvents: emergencyEvents.map(e => ({
                    timestamp: e.timestamp,
                    sessionId: e.details.sessionId,
                    action: e.action,
                    severity: e.details.severity
                })),
                blockedAdvice: medicalAdviceBlocked.map(e => ({
                    timestamp: e.timestamp,
                    sessionId: e.details.sessionId,
                    violationType: e.details.violationType
                })),
                disclaimerUsage: this.analyzeDisclaimerUsage(disclaimersShown)
            },
            recommendations: this.generateCFMRecommendations(medicalEvents)
        };
    }

    /**
     * Generate LGPD compliance report
     * @param {Array} events - Audit events
     * @param {Object} filters - Report filters
     * @returns {Object} LGPD compliance report
     */
    async generateLGPDComplianceReport(events, filters) {
        const dataAccessEvents = events.filter(e =>
            e.category === this.config.eventCategories.DATA_ACCESS
        );

        const consentEvents = dataAccessEvents.filter(e =>
            e.details.consentId
        );

        const dataExports = dataAccessEvents.filter(e =>
            e.details.operation === 'export'
        );

        const dataDeletions = dataAccessEvents.filter(e =>
            e.details.operation === 'delete'
        );

        return {
            summary: {
                totalDataAccess: dataAccessEvents.length,
                consentBasedAccess: consentEvents.length,
                dataExports: dataExports.length,
                dataDeletions: dataDeletions.length,
                complianceRate: dataAccessEvents.length > 0 ?
                    (consentEvents.length / dataAccessEvents.length * 100).toFixed(2) : 100
            },
            details: {
                dataAccessByType: this.groupEventsByDataType(dataAccessEvents),
                consentAnalysis: this.analyzeConsentUsage(consentEvents),
                retentionCompliance: this.analyzeRetentionCompliance(dataAccessEvents),
                userRightsFulfillment: {
                    exports: dataExports.length,
                    deletions: dataDeletions.length
                }
            },
            recommendations: this.generateLGPDRecommendations(dataAccessEvents)
        };
    }

    /**
     * Generate security audit report
     * @param {Array} events - Audit events
     * @param {Object} filters - Report filters
     * @returns {Object} Security audit report
     */
    async generateSecurityAuditReport(events, filters) {
        const securityEvents = events.filter(e =>
            e.category === this.config.eventCategories.SECURITY_EVENT
        );

        const criticalEvents = securityEvents.filter(e =>
            e.details.severity === 'CRITICAL'
        );

        const blockedThreats = securityEvents.filter(e =>
            e.details.blocked === true
        );

        return {
            summary: {
                totalSecurityEvents: securityEvents.length,
                criticalEvents: criticalEvents.length,
                threatsBlocked: blockedThreats.length,
                averageThreatScore: this.calculateAverageThreatScore(securityEvents),
                securityEffectiveness: securityEvents.length > 0 ?
                    (blockedThreats.length / securityEvents.length * 100).toFixed(2) : 100
            },
            details: {
                eventsBySeverity: this.groupEventsBySeverity(securityEvents),
                threatTypes: this.analyzeThreatTypes(securityEvents),
                mitigationEffectiveness: this.analyzeMitigationEffectiveness(securityEvents),
                timelineAnalysis: this.analyzeSecurityTimeline(securityEvents)
            },
            recommendations: this.generateSecurityRecommendations(securityEvents)
        };
    }

    /**
     * Generate data access audit report
     * @param {Array} events - Audit events
     * @param {Object} filters - Report filters
     * @returns {Object} Data access audit report
     */
    async generateDataAccessAuditReport(events, filters) {
        const dataAccessEvents = events.filter(e =>
            e.category === this.config.eventCategories.DATA_ACCESS
        );

        return {
            summary: {
                totalAccess: dataAccessEvents.length,
                uniqueUsers: new Set(dataAccessEvents.map(e => e.context.sessionId)).size,
                dataTypesAccessed: new Set(dataAccessEvents.map(e => e.details.dataType)).size,
                averageAccessFrequency: this.calculateAccessFrequency(dataAccessEvents)
            },
            details: {
                accessByDataType: this.groupEventsByDataType(dataAccessEvents),
                accessByOperation: this.groupEventsByOperation(dataAccessEvents),
                accessPatterns: this.analyzeAccessPatterns(dataAccessEvents),
                complianceStatus: this.analyzeDataAccessCompliance(dataAccessEvents)
            },
            recommendations: this.generateDataAccessRecommendations(dataAccessEvents)
        };
    }

    /**
     * Check alert conditions
     * @param {Object} auditEvent - Audit event
     */
    async checkAlertConditions(auditEvent) {
        const alerts = [];

        // Critical event alert
        if (auditEvent.level === 'CRITICAL') {
            alerts.push({
                type: 'CRITICAL_EVENT',
                severity: 'HIGH',
                message: `Critical event detected: ${auditEvent.action}`,
                event: auditEvent
            });
        }

        // Security violation alert
        if (auditEvent.category === this.config.eventCategories.SECURITY_EVENT) {
            const recentSecurityEvents = this.getRecentEvents(
                this.config.eventCategories.SECURITY_EVENT,
                60 * 60 * 1000 // Last hour
            );

            if (recentSecurityEvents.length >= this.config.alertThresholds.securityViolations) {
                alerts.push({
                    type: 'HIGH_SECURITY_ACTIVITY',
                    severity: 'HIGH',
                    message: `High security activity detected: ${recentSecurityEvents.length} events in the last hour`,
                    eventCount: recentSecurityEvents.length
                });
            }
        }

        // Compliance violation alert
        if (auditEvent.category === this.config.eventCategories.MEDICAL_COMPLIANCE &&
            auditEvent.details.violations && auditEvent.details.violations.length > 0) {
            alerts.push({
                type: 'COMPLIANCE_VIOLATION',
                severity: 'HIGH',
                message: `Compliance violation detected: ${auditEvent.details.violations.join(', ')}`,
                violations: auditEvent.details.violations
            });
        }

        // Process alerts
        for (const alert of alerts) {
            await this.processAlert(alert);
        }
    }

    /**
     * Process alert
     * @param {Object} alert - Alert details
     */
    async processAlert(alert) {
        const alertId = this.generateEventId();
        const timestamp = new Date().toISOString();

        const alertEvent = {
            id: alertId,
            timestamp,
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            details: alert,
            status: 'active',
            acknowledged: false
        };

        // Store alert
        this.alertStore.set(alertId, alertEvent);

        // Log alert
        await this.logAuditEvent(
            this.config.eventCategories.SYSTEM_EVENT,
            'alert_triggered',
            alertEvent
        );

        // Send notifications (in production, integrate with notification systems)
        await this.sendAlertNotification(alertEvent);

        console.warn(`[AUDIT ALERT] ${alert.type}: ${alert.message}`);
    }

    /**
     * Send alert notification
     * @param {Object} alert - Alert event
     */
    async sendAlertNotification(alert) {
        // In production, this would integrate with:
        // - Email notifications
        // - Slack/Teams alerts
        // - SMS notifications
        // - Incident management systems
        // - Security monitoring platforms

        console.log(`Alert notification sent: ${alert.type} - ${alert.message}`);
    }

    /**
     * Get recent events
     * @param {string} category - Event category
     * @param {number} timeWindow - Time window in milliseconds
     * @returns {Array} Recent events
     */
    getRecentEvents(category, timeWindow) {
        const cutoffTime = Date.now() - timeWindow;

        return Array.from(this.auditStore.values()).filter(event =>
            event.category === category &&
            new Date(event.timestamp).getTime() > cutoffTime
        );
    }

    /**
     * Update metrics
     * @param {Object} auditEvent - Audit event
     */
    updateMetrics(auditEvent) {
        // Update performance metrics
        if (auditEvent.category === this.config.eventCategories.PERFORMANCE) {
            this.performanceMetrics.requestCount++;

            if (auditEvent.details.responseTime) {
                const currentAvg = this.performanceMetrics.averageResponseTime;
                const count = this.performanceMetrics.requestCount;
                this.performanceMetrics.averageResponseTime =
                    (currentAvg * (count - 1) + auditEvent.details.responseTime) / count;
            }
        }

        // Update error count
        if (auditEvent.level === 'ERROR' || auditEvent.level === 'CRITICAL') {
            this.performanceMetrics.errorCount++;
        }

        // Store hourly metrics
        const hour = Math.floor(Date.now() / (60 * 60 * 1000));
        if (!this.performanceMetrics.lastHourMetrics[hour]) {
            this.performanceMetrics.lastHourMetrics[hour] = {
                requests: 0,
                errors: 0,
                averageResponseTime: 0
            };
        }

        this.performanceMetrics.lastHourMetrics[hour].requests++;
        if (auditEvent.level === 'ERROR' || auditEvent.level === 'CRITICAL') {
            this.performanceMetrics.lastHourMetrics[hour].errors++;
        }
    }

    /**
     * Utility methods for report generation
     */

    sanitizeDetails(details) {
        // Remove sensitive information from details
        const sanitized = { ...details };

        // Remove or hash PII
        if (sanitized.email) {
            sanitized.email = this.hashPII(sanitized.email);
        }
        if (sanitized.phone) {
            sanitized.phone = this.hashPII(sanitized.phone);
        }
        if (sanitized.name) {
            sanitized.name = this.hashPII(sanitized.name);
        }

        return sanitized;
    }

    sanitizeContext(context) {
        const sanitized = { ...context };

        // Hash IP addresses
        if (sanitized.clientIP) {
            sanitized.clientIP = this.hashPII(sanitized.clientIP);
        }

        // Remove sensitive headers
        if (sanitized.headers) {
            delete sanitized.headers.authorization;
            delete sanitized.headers.cookie;
        }

        return sanitized;
    }

    hashPII(data) {
        return crypto.createHash('sha256')
            .update(data + process.env.AUDIT_HASH_SALT || 'default_audit_salt')
            .digest('hex')
            .substring(0, 16);
    }

    determineLogLevel(category, action) {
        if (category === this.config.eventCategories.SECURITY_EVENT) {
            return 'ERROR';
        }
        if (category === this.config.eventCategories.MEDICAL_COMPLIANCE) {
            return 'WARN';
        }
        if (action.includes('error') || action.includes('failed')) {
            return 'ERROR';
        }
        return 'INFO';
    }

    generateEventId() {
        return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }

    generateEventHash(category, action, details, context) {
        const data = JSON.stringify({ category, action, details, context });
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    isComplianceEvent(category, action) {
        return category === this.config.eventCategories.MEDICAL_COMPLIANCE ||
            category === this.config.eventCategories.DATA_ACCESS ||
            action.includes('compliance');
    }

    async logComplianceEvent(auditEvent) {
        this.complianceStore.set(auditEvent.id, {
            ...auditEvent,
            complianceType: this.determineComplianceType(auditEvent),
            retentionUntil: this.calculateRetentionDate(auditEvent)
        });
    }

    determineComplianceType(auditEvent) {
        if (auditEvent.category === this.config.eventCategories.MEDICAL_COMPLIANCE) {
            return 'CFM';
        }
        if (auditEvent.category === this.config.eventCategories.DATA_ACCESS) {
            return 'LGPD';
        }
        return 'GENERAL';
    }

    calculateRetentionDate(auditEvent) {
        const retentionDays = this.config.retentionPolicies[auditEvent.level] ||
            this.config.retentionPolicies.INFO;
        return new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
    }

    // Additional utility methods for report analysis
    analyzeDisclaimerUsage(events) {
        const disclaimerTypes = {};
        events.forEach(event => {
            event.details.disclaimersShown.forEach(disclaimer => {
                disclaimerTypes[disclaimer] = (disclaimerTypes[disclaimer] || 0) + 1;
            });
        });
        return disclaimerTypes;
    }

    generateCFMRecommendations(events) {
        const recommendations = [];

        const emergencyEvents = events.filter(e => e.details.emergencyDetected);
        if (emergencyEvents.length > 0) {
            recommendations.push({
                type: 'EMERGENCY_HANDLING',
                priority: 'HIGH',
                message: 'Review emergency detection protocols and response times'
            });
        }

        return recommendations;
    }

    groupEventsByDataType(events) {
        return events.reduce((acc, event) => {
            const dataType = event.details.dataType || 'unknown';
            acc[dataType] = (acc[dataType] || 0) + 1;
            return acc;
        }, {});
    }

    analyzeConsentUsage(events) {
        return {
            totalWithConsent: events.length,
            uniqueConsents: new Set(events.map(e => e.details.consentId)).size,
            consentTypes: events.reduce((acc, event) => {
                const purpose = event.details.purpose || 'unknown';
                acc[purpose] = (acc[purpose] || 0) + 1;
                return acc;
            }, {})
        };
    }

    analyzeRetentionCompliance(events) {
        const now = new Date();
        return events.map(event => ({
            eventId: event.id,
            retentionPeriod: event.details.retentionPeriod,
            isCompliant: event.details.retentionPeriod ?
                new Date(event.timestamp).getTime() + event.details.retentionPeriod > now.getTime() :
                true
        }));
    }

    generateLGPDRecommendations(events) {
        const recommendations = [];

        const eventsWithoutConsent = events.filter(e => !e.details.consentId);
        if (eventsWithoutConsent.length > 0) {
            recommendations.push({
                type: 'CONSENT_MANAGEMENT',
                priority: 'HIGH',
                message: `${eventsWithoutConsent.length} data access events without proper consent`
            });
        }

        return recommendations;
    }

    calculateAverageThreatScore(events) {
        const scores = events.filter(e => e.details.threatScore).map(e => e.details.threatScore);
        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    }

    groupEventsBySeverity(events) {
        return events.reduce((acc, event) => {
            const severity = event.details.severity || 'UNKNOWN';
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        }, {});
    }

    analyzeThreatTypes(events) {
        return events.reduce((acc, event) => {
            const threatType = event.details.violationType || 'UNKNOWN';
            acc[threatType] = (acc[threatType] || 0) + 1;
            return acc;
        }, {});
    }

    analyzeMitigationEffectiveness(events) {
        const mitigated = events.filter(e => e.details.blocked === true).length;
        return events.length > 0 ? (mitigated / events.length * 100).toFixed(2) : 100;
    }

    analyzeSecurityTimeline(events) {
        return events.map(event => ({
            timestamp: event.timestamp,
            severity: event.details.severity,
            type: event.details.violationType,
            blocked: event.details.blocked
        })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    generateSecurityRecommendations(events) {
        const recommendations = [];

        const criticalEvents = events.filter(e => e.details.severity === 'CRITICAL');
        if (criticalEvents.length > 0) {
            recommendations.push({
                type: 'CRITICAL_SECURITY',
                priority: 'CRITICAL',
                message: `${criticalEvents.length} critical security events require immediate attention`
            });
        }

        return recommendations;
    }

    groupEventsByOperation(events) {
        return events.reduce((acc, event) => {
            const operation = event.details.operation || 'unknown';
            acc[operation] = (acc[operation] || 0) + 1;
            return acc;
        }, {});
    }

    analyzeAccessPatterns(events) {
        // Analyze access patterns by time, frequency, etc.
        const patterns = {
            hourlyDistribution: {},
            frequentUsers: {},
            dataTypePreferences: {}
        };

        events.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            patterns.hourlyDistribution[hour] = (patterns.hourlyDistribution[hour] || 0) + 1;

            const sessionId = event.context.sessionId;
            patterns.frequentUsers[sessionId] = (patterns.frequentUsers[sessionId] || 0) + 1;

            const dataType = event.details.dataType;
            patterns.dataTypePreferences[dataType] = (patterns.dataTypePreferences[dataType] || 0) + 1;
        });

        return patterns;
    }

    analyzeDataAccessCompliance(events) {
        return {
            totalAccess: events.length,
            compliantAccess: events.filter(e => e.details.legalBasis && e.details.purpose).length,
            complianceRate: events.length > 0 ?
                (events.filter(e => e.details.legalBasis && e.details.purpose).length / events.length * 100).toFixed(2) :
                100
        };
    }

    calculateAccessFrequency(events) {
        if (events.length === 0) return 0;

        const timeSpan = new Date(Math.max(...events.map(e => new Date(e.timestamp)))) -
            new Date(Math.min(...events.map(e => new Date(e.timestamp))));

        return timeSpan > 0 ? events.length / (timeSpan / (24 * 60 * 60 * 1000)) : events.length;
    }

    generateDataAccessRecommendations(events) {
        const recommendations = [];

        const nonCompliantAccess = events.filter(e => !e.details.legalBasis || !e.details.purpose);
        if (nonCompliantAccess.length > 0) {
            recommendations.push({
                type: 'DATA_ACCESS_COMPLIANCE',
                priority: 'HIGH',
                message: `${nonCompliantAccess.length} data access events lack proper legal basis or purpose`
            });
        }

        return recommendations;
    }

    // Background tasks and cleanup
    startBackgroundTasks() {
        // Cleanup old events every hour
        setInterval(() => {
            this.cleanupOldEvents();
        }, 60 * 60 * 1000);

        // Generate daily metrics every 24 hours
        setInterval(() => {
            this.generateDailyMetrics();
        }, 24 * 60 * 60 * 1000);

        // Check system health every 5 minutes
        setInterval(() => {
            this.checkSystemHealth();
        }, 5 * 60 * 1000);
    }

    async cleanupOldEvents() {
        const now = Date.now();

        for (const [eventId, event] of this.auditStore.entries()) {
            const retentionPeriod = this.config.retentionPolicies[event.level] ||
                this.config.retentionPolicies.INFO;
            const expiryTime = new Date(event.timestamp).getTime() +
                (retentionPeriod * 24 * 60 * 60 * 1000);

            if (now > expiryTime) {
                this.auditStore.delete(eventId);
            }
        }

        console.log(`Cleaned up old audit events. Current store size: ${this.auditStore.size}`);
    }

    async generateDailyMetrics() {
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = Array.from(this.auditStore.values()).filter(event =>
            event.timestamp.startsWith(today)
        );

        const dailyMetrics = {
            date: today,
            totalEvents: todayEvents.length,
            eventsByCategory: todayEvents.reduce((acc, event) => {
                acc[event.category] = (acc[event.category] || 0) + 1;
                return acc;
            }, {}),
            eventsByLevel: todayEvents.reduce((acc, event) => {
                acc[event.level] = (acc[event.level] || 0) + 1;
                return acc;
            }, {}),
            securityEvents: todayEvents.filter(e =>
                e.category === this.config.eventCategories.SECURITY_EVENT
            ).length,
            complianceEvents: todayEvents.filter(e =>
                e.category === this.config.eventCategories.MEDICAL_COMPLIANCE ||
                e.category === this.config.eventCategories.DATA_ACCESS
            ).length
        };

        this.performanceMetrics.dailyMetrics.push(dailyMetrics);

        // Keep only last 30 days
        if (this.performanceMetrics.dailyMetrics.length > 30) {
            this.performanceMetrics.dailyMetrics = this.performanceMetrics.dailyMetrics.slice(-30);
        }

        console.log(`Generated daily metrics for ${today}:`, dailyMetrics);
    }

    async checkSystemHealth() {
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();

        // Check memory usage
        if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
            await this.logAuditEvent(
                this.config.eventCategories.SYSTEM_EVENT,
                'high_memory_usage',
                { memoryUsage, uptime }
            );
        }

        // Check audit store size
        if (this.auditStore.size > 10000) {
            await this.logAuditEvent(
                this.config.eventCategories.SYSTEM_EVENT,
                'large_audit_store',
                { storeSize: this.auditStore.size }
            );
        }
    }

    // File system operations (simplified for this implementation)
    async ensureLogDirectories() {
        // In production, create actual log directories
        console.log('Log directories ensured');
    }

    async loadExistingAuditData() {
        // In production, load from persistent storage
        console.log('Existing audit data loaded');
    }

    async writeAuditLog(auditEvent) {
        // In production, write to persistent storage (files, database, etc.)
        // For now, just keep in memory
        return Promise.resolve();
    }

    /**
     * Get audit statistics
     * @returns {Object} Audit statistics
     */
    getAuditStatistics() {
        const events = Array.from(this.auditStore.values());
        const alerts = Array.from(this.alertStore.values());

        return {
            totalEvents: events.length,
            eventsByCategory: events.reduce((acc, event) => {
                acc[event.category] = (acc[event.category] || 0) + 1;
                return acc;
            }, {}),
            eventsByLevel: events.reduce((acc, event) => {
                acc[event.level] = (acc[event.level] || 0) + 1;
                return acc;
            }, {}),
            activeAlerts: alerts.filter(a => a.status === 'active').length,
            performanceMetrics: this.performanceMetrics,
            systemHealth: {
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime(),
                storeSize: this.auditStore.size
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get real-time monitoring dashboard data
     * @param {string} timeRange - Time range for metrics (1h, 6h, 24h, 7d)
     * @returns {Object} Dashboard data
     */
    getMonitoringDashboard(timeRange = '24h') {
        const now = Date.now();
        const timeRangeMs = this.parseTimeRange(timeRange);
        const startTime = now - timeRangeMs;

        const events = Array.from(this.auditStore.values()).filter(event =>
            new Date(event.timestamp).getTime() > startTime
        );

        const securityEvents = events.filter(e => e.category === this.config.eventCategories.SECURITY_EVENT);
        const complianceEvents = events.filter(e => e.category === this.config.eventCategories.MEDICAL_COMPLIANCE);
        const performanceEvents = events.filter(e => e.category === this.config.eventCategories.PERFORMANCE);

        return {
            overview: {
                timeRange,
                totalEvents: events.length,
                securityEvents: securityEvents.length,
                complianceEvents: complianceEvents.length,
                performanceEvents: performanceEvents.length,
                activeAlerts: Array.from(this.alertStore.values()).filter(a => a.status === 'active').length,
                systemStatus: this.getSystemStatus()
            },
            security: {
                threatLevel: this.calculateThreatLevel(securityEvents),
                blockedThreats: securityEvents.filter(e => e.details.blocked === true).length,
                averageThreatScore: this.calculateAverageThreatScore(securityEvents),
                topThreats: this.getTopThreats(securityEvents),
                securityTrends: this.getSecurityTrends(securityEvents, timeRange)
            },
            compliance: {
                cfmCompliance: this.getCFMComplianceMetrics(complianceEvents),
                lgpdCompliance: this.getLGPDComplianceMetrics(events),
                complianceScore: this.calculateComplianceScore(complianceEvents),
                violationTrends: this.getViolationTrends(complianceEvents, timeRange)
            },
            performance: {
                averageResponseTime: this.performanceMetrics.averageResponseTime,
                errorRate: this.calculateErrorRate(),
                throughput: this.calculateThroughput(events, timeRange),
                resourceUsage: this.getResourceUsage(),
                performanceTrends: this.getPerformanceTrends(performanceEvents, timeRange)
            },
            alerts: {
                critical: Array.from(this.alertStore.values()).filter(a => a.severity === 'CRITICAL' && a.status === 'active'),
                high: Array.from(this.alertStore.values()).filter(a => a.severity === 'HIGH' && a.status === 'active'),
                medium: Array.from(this.alertStore.values()).filter(a => a.severity === 'MEDIUM' && a.status === 'active'),
                recentAlerts: Array.from(this.alertStore.values())
                    .filter(a => new Date(a.timestamp).getTime() > startTime)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 10)
            }
        };
    }

    /**
     * Enhanced security event detection
     * @param {Object} eventData - Event data to analyze
     * @param {Object} context - Request context
     * @returns {Object} Security analysis result
     */
    async detectSecurityEvents(eventData, context) {
        const securityAnalysis = {
            threatDetected: false,
            threatLevel: 'LOW',
            violations: [],
            recommendations: [],
            securityScore: 100
        };

        // Rate limiting detection
        if (this.detectRateLimitViolation(context)) {
            securityAnalysis.violations.push('RATE_LIMIT_EXCEEDED');
            securityAnalysis.threatLevel = 'MEDIUM';
            securityAnalysis.securityScore -= 20;
        }

        // Malicious input detection
        try {
            const maliciousInputResult = this.detectMaliciousInput(eventData);
            if (maliciousInputResult.detected) {
                securityAnalysis.violations.push(...maliciousInputResult.types);
                securityAnalysis.threatLevel = maliciousInputResult.severity;
                securityAnalysis.securityScore -= maliciousInputResult.scoreReduction;
            }
        } catch (error) {
            console.error('Malicious input detection error:', error);
            securityAnalysis.violations.push('ANALYSIS_ERROR');
            securityAnalysis.securityScore -= 5;
        }

        // Suspicious session behavior
        const sessionAnalysis = this.analyzeSessionBehavior(context.sessionId);
        if (sessionAnalysis.suspicious) {
            securityAnalysis.violations.push('SUSPICIOUS_SESSION_BEHAVIOR');
            securityAnalysis.threatLevel = this.escalateThreatLevel(securityAnalysis.threatLevel, 'MEDIUM');
            securityAnalysis.securityScore -= 15;
        }

        // Bot detection
        const botDetection = this.detectBotBehavior(context);
        if (botDetection.detected) {
            securityAnalysis.violations.push('BOT_DETECTED');
            securityAnalysis.threatLevel = this.escalateThreatLevel(securityAnalysis.threatLevel, 'LOW');
            securityAnalysis.securityScore -= 10;
        }

        // Set threat detected flag
        securityAnalysis.threatDetected = securityAnalysis.violations.length > 0;

        // Generate recommendations
        securityAnalysis.recommendations = this.generateSecurityRecommendations(securityAnalysis.violations);

        // Log security event if threats detected
        if (securityAnalysis.threatDetected) {
            await this.logSecurityEvent({
                type: 'automated_threat_detection',
                severity: securityAnalysis.threatLevel,
                description: `Automated security analysis detected: ${securityAnalysis.violations.join(', ')}`,
                violationType: securityAnalysis.violations[0],
                blocked: securityAnalysis.threatLevel === 'HIGH' || securityAnalysis.threatLevel === 'CRITICAL',
                threatScore: 100 - securityAnalysis.securityScore,
                mitigationActions: securityAnalysis.recommendations
            }, context);
        }

        return securityAnalysis;
    }

    /**
     * Advanced compliance monitoring
     * @param {Object} eventData - Event data to analyze
     * @param {Object} context - Request context
     * @returns {Object} Compliance analysis result
     */
    async monitorCompliance(eventData, context) {
        const complianceAnalysis = {
            cfmCompliant: true,
            lgpdCompliant: true,
            violations: [],
            warnings: [],
            requiredActions: [],
            complianceScore: 100
        };

        // CFM Compliance Checks
        try {
            const cfmResult = await this.checkCFMCompliance(eventData, context);
            if (!cfmResult.compliant) {
                complianceAnalysis.cfmCompliant = false;
                complianceAnalysis.violations.push(...cfmResult.violations);
                complianceAnalysis.complianceScore -= cfmResult.scoreReduction;
            }
            complianceAnalysis.warnings.push(...cfmResult.warnings);
        } catch (error) {
            console.error('CFM compliance check error:', error);
            complianceAnalysis.cfmCompliant = false;
            complianceAnalysis.violations.push('CFM_CHECK_ERROR');
            complianceAnalysis.complianceScore -= 10;
        }

        // LGPD Compliance Checks
        try {
            const lgpdResult = await this.checkLGPDCompliance(eventData, context);
            if (!lgpdResult.compliant) {
                complianceAnalysis.lgpdCompliant = false;
                complianceAnalysis.violations.push(...lgpdResult.violations);
                complianceAnalysis.complianceScore -= lgpdResult.scoreReduction;
            }
            complianceAnalysis.warnings.push(...lgpdResult.warnings);
        } catch (error) {
            console.error('LGPD compliance check error:', error);
            complianceAnalysis.lgpdCompliant = false;
            complianceAnalysis.violations.push('LGPD_CHECK_ERROR');
            complianceAnalysis.complianceScore -= 10;
        }

        // Generate required actions
        complianceAnalysis.requiredActions = this.generateComplianceActions(
            complianceAnalysis.violations,
            complianceAnalysis.warnings
        );

        // Log compliance event
        await this.logMedicalComplianceEvent({
            type: 'automated_compliance_check',
            complianceType: 'COMBINED',
            result: complianceAnalysis.cfmCompliant && complianceAnalysis.lgpdCompliant ? 'compliant' : 'non_compliant',
            violations: complianceAnalysis.violations,
            warnings: complianceAnalysis.warnings,
            complianceScore: complianceAnalysis.complianceScore,
            requiredActions: complianceAnalysis.requiredActions
        }, context);

        return complianceAnalysis;
    }

    /**
     * Real-time alert system
     * @param {Object} conditions - Alert conditions to check
     * @returns {Array} Triggered alerts
     */
    async checkRealTimeAlerts(conditions = {}) {
        const triggeredAlerts = [];
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        // High error rate alert
        const recentEvents = Array.from(this.auditStore.values()).filter(event =>
            new Date(event.timestamp).getTime() > now - oneHour
        );

        const errorEvents = recentEvents.filter(event =>
            event.level === 'ERROR' || event.level === 'CRITICAL'
        );

        const errorRate = recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0;

        if (errorRate > this.config.alertThresholds.errorRate) {
            triggeredAlerts.push({
                type: 'HIGH_ERROR_RATE',
                severity: 'HIGH',
                message: `Error rate is ${errorRate.toFixed(2)}% (threshold: ${this.config.alertThresholds.errorRate}%)`,
                data: { errorRate, threshold: this.config.alertThresholds.errorRate },
                timestamp: new Date().toISOString()
            });
        }

        // Performance degradation alert
        const avgResponseTime = this.performanceMetrics.averageResponseTime;
        const performanceThreshold = 3000; // 3 seconds

        if (avgResponseTime > performanceThreshold) {
            triggeredAlerts.push({
                type: 'PERFORMANCE_DEGRADATION',
                severity: 'MEDIUM',
                message: `Average response time is ${avgResponseTime}ms (threshold: ${performanceThreshold}ms)`,
                data: { responseTime: avgResponseTime, threshold: performanceThreshold },
                timestamp: new Date().toISOString()
            });
        }

        // Security threat volume alert
        const securityEvents = recentEvents.filter(event =>
            event.category === this.config.eventCategories.SECURITY_EVENT
        );

        if (securityEvents.length > this.config.alertThresholds.securityViolations) {
            triggeredAlerts.push({
                type: 'HIGH_SECURITY_ACTIVITY',
                severity: 'HIGH',
                message: `${securityEvents.length} security events in the last hour (threshold: ${this.config.alertThresholds.securityViolations})`,
                data: { eventCount: securityEvents.length, threshold: this.config.alertThresholds.securityViolations },
                timestamp: new Date().toISOString()
            });
        }

        // Compliance violation alert
        const complianceViolations = recentEvents.filter(event =>
            event.category === this.config.eventCategories.MEDICAL_COMPLIANCE &&
            event.details.violations && event.details.violations.length > 0
        );

        if (complianceViolations.length > 0) {
            triggeredAlerts.push({
                type: 'COMPLIANCE_VIOLATIONS',
                severity: 'CRITICAL',
                message: `${complianceViolations.length} compliance violations detected in the last hour`,
                data: { violationCount: complianceViolations.length },
                timestamp: new Date().toISOString()
            });
        }

        // Process triggered alerts
        for (const alert of triggeredAlerts) {
            await this.processAlert(alert);
        }

        return triggeredAlerts;
    }

    // Supporting utility methods for enhanced monitoring

    /**
     * Parse time range string to milliseconds
     * @param {string} timeRange - Time range string
     * @returns {number} Time range in milliseconds
     */
    parseTimeRange(timeRange) {
        const ranges = {
            '1h': 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000
        };
        return ranges[timeRange] || ranges['24h'];
    }

    /**
     * Get system status
     * @returns {string} System status
     */
    getSystemStatus() {
        const memoryUsage = process.memoryUsage();
        const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        const errorRate = this.calculateErrorRate();

        if (errorRate > 10 || memoryUsagePercent > 90) return 'CRITICAL';
        if (errorRate > 5 || memoryUsagePercent > 80) return 'WARNING';
        if (errorRate > 2 || memoryUsagePercent > 70) return 'CAUTION';
        return 'HEALTHY';
    }

    /**
     * Calculate threat level based on security events
     * @param {Array} securityEvents - Security events
     * @returns {string} Threat level
     */
    calculateThreatLevel(securityEvents) {
        if (securityEvents.length === 0) return 'LOW';

        const criticalEvents = securityEvents.filter(e => e.details.severity === 'CRITICAL').length;
        const highEvents = securityEvents.filter(e => e.details.severity === 'HIGH').length;

        if (criticalEvents > 0) return 'CRITICAL';
        if (highEvents > 2) return 'HIGH';
        if (securityEvents.length > 5) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Get top security threats
     * @param {Array} securityEvents - Security events
     * @returns {Array} Top threats
     */
    getTopThreats(securityEvents) {
        const threatCounts = {};
        securityEvents.forEach(event => {
            const threatType = event.details.violationType || 'UNKNOWN';
            threatCounts[threatType] = (threatCounts[threatType] || 0) + 1;
        });

        return Object.entries(threatCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
    }

    /**
     * Get security trends
     * @param {Array} securityEvents - Security events
     * @param {string} timeRange - Time range
     * @returns {Object} Security trends
     */
    getSecurityTrends(securityEvents, timeRange) {
        const intervals = this.groupEventsByInterval(securityEvents, timeRange);
        return {
            eventVolume: intervals.map(interval => ({
                timestamp: interval.timestamp,
                count: interval.events.length
            })),
            threatTypes: this.analyzeThreatTypeDistribution(securityEvents),
            severityDistribution: this.analyzeSeverityDistribution(securityEvents)
        };
    }

    /**
     * Get CFM compliance metrics
     * @param {Array} complianceEvents - Compliance events
     * @returns {Object} CFM compliance metrics
     */
    getCFMComplianceMetrics(complianceEvents) {
        const medicalEvents = complianceEvents.filter(e => e.details.complianceType === 'CFM');
        const violations = medicalEvents.filter(e => e.details.violations && e.details.violations.length > 0);
        const emergencyDetections = medicalEvents.filter(e => e.details.emergencyDetected === true);

        return {
            totalChecks: medicalEvents.length,
            violations: violations.length,
            emergencyDetections: emergencyDetections.length,
            complianceRate: medicalEvents.length > 0 ?
                ((medicalEvents.length - violations.length) / medicalEvents.length * 100).toFixed(2) : 100
        };
    }

    /**
     * Get LGPD compliance metrics
     * @param {Array} events - All events
     * @returns {Object} LGPD compliance metrics
     */
    getLGPDComplianceMetrics(events) {
        const dataAccessEvents = events.filter(e => e.category === this.config.eventCategories.DATA_ACCESS);
        const consentEvents = dataAccessEvents.filter(e => e.details.consentId);
        const deletionRequests = dataAccessEvents.filter(e => e.details.operation === 'delete');

        return {
            totalDataAccess: dataAccessEvents.length,
            consentBasedAccess: consentEvents.length,
            deletionRequests: deletionRequests.length,
            complianceRate: dataAccessEvents.length > 0 ?
                (consentEvents.length / dataAccessEvents.length * 100).toFixed(2) : 100
        };
    }

    /**
     * Calculate compliance score
     * @param {Array} complianceEvents - Compliance events
     * @returns {number} Compliance score
     */
    calculateComplianceScore(complianceEvents) {
        if (complianceEvents.length === 0) return 100;

        const violations = complianceEvents.filter(e =>
            e.details.violations && e.details.violations.length > 0
        ).length;

        return Math.max(0, 100 - (violations / complianceEvents.length * 100));
    }

    /**
     * Get violation trends
     * @param {Array} complianceEvents - Compliance events
     * @param {string} timeRange - Time range
     * @returns {Object} Violation trends
     */
    getViolationTrends(complianceEvents, timeRange) {
        const intervals = this.groupEventsByInterval(complianceEvents, timeRange);
        return intervals.map(interval => ({
            timestamp: interval.timestamp,
            violations: interval.events.filter(e =>
                e.details.violations && e.details.violations.length > 0
            ).length,
            total: interval.events.length
        }));
    }

    /**
     * Calculate error rate
     * @returns {number} Error rate percentage
     */
    calculateErrorRate() {
        const { requestCount, errorCount } = this.performanceMetrics;
        return requestCount > 0 ? (errorCount / requestCount * 100) : 0;
    }

    /**
     * Calculate throughput
     * @param {Array} events - Events
     * @param {string} timeRange - Time range
     * @returns {number} Throughput (events per second)
     */
    calculateThroughput(events, timeRange) {
        const timeRangeSeconds = this.parseTimeRange(timeRange) / 1000;
        return events.length / timeRangeSeconds;
    }

    /**
     * Get resource usage
     * @returns {Object} Resource usage metrics
     */
    getResourceUsage() {
        const memoryUsage = process.memoryUsage();
        return {
            memory: {
                heapUsed: memoryUsage.heapUsed,
                heapTotal: memoryUsage.heapTotal,
                external: memoryUsage.external,
                usagePercent: (memoryUsage.heapUsed / memoryUsage.heapTotal * 100).toFixed(2)
            },
            uptime: process.uptime(),
            storeSize: this.auditStore.size
        };
    }

    /**
     * Get performance trends
     * @param {Array} performanceEvents - Performance events
     * @param {string} timeRange - Time range
     * @returns {Object} Performance trends
     */
    getPerformanceTrends(performanceEvents, timeRange) {
        const intervals = this.groupEventsByInterval(performanceEvents, timeRange);
        return intervals.map(interval => ({
            timestamp: interval.timestamp,
            averageResponseTime: interval.events.length > 0 ?
                interval.events.reduce((sum, e) => sum + (e.details.responseTime || 0), 0) / interval.events.length : 0,
            eventCount: interval.events.length
        }));
    }

    /**
     * Group events by time intervals
     * @param {Array} events - Events to group
     * @param {string} timeRange - Time range
     * @returns {Array} Grouped events
     */
    groupEventsByInterval(events, timeRange) {
        const intervalSize = this.getIntervalSize(timeRange);
        const groups = {};

        events.forEach(event => {
            const timestamp = new Date(event.timestamp).getTime();
            const interval = Math.floor(timestamp / intervalSize) * intervalSize;

            if (!groups[interval]) {
                groups[interval] = {
                    timestamp: new Date(interval).toISOString(),
                    events: []
                };
            }
            groups[interval].events.push(event);
        });

        return Object.values(groups).sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );
    }

    /**
     * Get interval size for time range
     * @param {string} timeRange - Time range
     * @returns {number} Interval size in milliseconds
     */
    getIntervalSize(timeRange) {
        const intervals = {
            '1h': 5 * 60 * 1000,      // 5 minutes
            '6h': 30 * 60 * 1000,     // 30 minutes
            '24h': 60 * 60 * 1000,    // 1 hour
            '7d': 6 * 60 * 60 * 1000  // 6 hours
        };
        return intervals[timeRange] || intervals['24h'];
    }

    /**
     * Detect rate limit violations
     * @param {Object} context - Request context
     * @returns {boolean} Whether rate limit is violated
     */
    detectRateLimitViolation(context) {
        // Simple rate limiting check - in production, use Redis or similar
        const sessionEvents = Array.from(this.auditStore.values()).filter(event =>
            event.context.sessionId === context.sessionId &&
            new Date(event.timestamp).getTime() > Date.now() - 60000 // Last minute
        );

        return sessionEvents.length > 20; // 20 requests per minute limit
    }

    /**
     * Detect malicious input
     * @param {Object} eventData - Event data
     * @returns {Object} Malicious input detection result
     */
    detectMaliciousInput(eventData) {
        const result = {
            detected: false,
            types: [],
            severity: 'LOW',
            scoreReduction: 0
        };

        const message = eventData.message || '';

        // SQL injection patterns
        const sqlPatterns = [
            /(\bUNION\b.*\bSELECT\b)/i,
            /(\bSELECT\b.*\bFROM\b)/i,
            /(\bINSERT\b.*\bINTO\b)/i,
            /(\bDROP\b.*\bTABLE\b)/i,
            /(\bDELETE\b.*\bFROM\b)/i
        ];

        // XSS patterns
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe[^>]*>/gi
        ];

        // Check for SQL injection
        if (sqlPatterns.some(pattern => pattern.test(message))) {
            result.detected = true;
            result.types.push('SQL_INJECTION');
            result.severity = 'CRITICAL';
            result.scoreReduction = 50;
        }

        // Check for XSS
        if (xssPatterns.some(pattern => pattern.test(message))) {
            result.detected = true;
            result.types.push('XSS_ATTEMPT');
            result.severity = result.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
            result.scoreReduction = Math.max(result.scoreReduction, 40);
        }

        return result;
    }

    /**
     * Analyze session behavior
     * @param {string} sessionId - Session ID
     * @returns {Object} Session analysis result
     */
    analyzeSessionBehavior(sessionId) {
        const sessionEvents = Array.from(this.auditStore.values()).filter(event =>
            event.context.sessionId === sessionId
        );

        const result = {
            suspicious: false,
            reasons: []
        };

        // Check for rapid-fire requests
        const recentEvents = sessionEvents.filter(event =>
            new Date(event.timestamp).getTime() > Date.now() - 60000 // Last minute
        );

        if (recentEvents.length > 30) {
            result.suspicious = true;
            result.reasons.push('HIGH_REQUEST_FREQUENCY');
        }

        // Check for repeated identical messages
        const messages = sessionEvents.map(e => e.details.message || '').filter(m => m);
        const uniqueMessages = new Set(messages);

        if (messages.length > 5 && uniqueMessages.size / messages.length < 0.3) {
            result.suspicious = true;
            result.reasons.push('REPEATED_MESSAGES');
        }

        return result;
    }

    /**
     * Detect bot behavior
     * @param {Object} context - Request context
     * @returns {Object} Bot detection result
     */
    detectBotBehavior(context) {
        const result = {
            detected: false,
            confidence: 0,
            indicators: []
        };

        const userAgent = context.userAgent || '';

        // Check for bot user agents
        const botPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i,
            /curl/i,
            /wget/i
        ];

        if (botPatterns.some(pattern => pattern.test(userAgent))) {
            result.detected = true;
            result.confidence += 0.8;
            result.indicators.push('BOT_USER_AGENT');
        }

        // Check for missing common headers
        if (!context.userAgent || context.userAgent.length < 10) {
            result.confidence += 0.3;
            result.indicators.push('MISSING_USER_AGENT');
        }

        result.detected = result.confidence > 0.5;
        return result;
    }

    /**
     * Escalate threat level
     * @param {string} currentLevel - Current threat level
     * @param {string} newLevel - New threat level
     * @returns {string} Escalated threat level
     */
    escalateThreatLevel(currentLevel, newLevel) {
        const levels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
        const currentScore = levels[currentLevel] || 1;
        const newScore = levels[newLevel] || 1;

        const maxScore = Math.max(currentScore, newScore);
        return Object.keys(levels).find(key => levels[key] === maxScore) || 'LOW';
    }

    /**
     * Generate security recommendations
     * @param {Array} violations - Security violations
     * @returns {Array} Security recommendations
     */
    generateSecurityRecommendations(violations) {
        const recommendations = [];

        if (violations.includes('RATE_LIMIT_EXCEEDED')) {
            recommendations.push('IMPLEMENT_STRICTER_RATE_LIMITING');
        }

        if (violations.includes('SQL_INJECTION') || violations.includes('XSS_ATTEMPT')) {
            recommendations.push('ENHANCE_INPUT_VALIDATION');
            recommendations.push('BLOCK_REQUEST');
        }

        if (violations.includes('BOT_DETECTED')) {
            recommendations.push('IMPLEMENT_CAPTCHA');
        }

        if (violations.includes('SUSPICIOUS_SESSION_BEHAVIOR')) {
            recommendations.push('MONITOR_SESSION_CLOSELY');
        }

        return recommendations;
    }

    /**
     * Check CFM compliance
     * @param {Object} eventData - Event data
     * @param {Object} context - Request context
     * @returns {Object} CFM compliance result
     */
    async checkCFMCompliance(eventData, context) {
        const result = {
            compliant: true,
            violations: [],
            warnings: [],
            scoreReduction: 0
        };

        const message = eventData.message || '';

        // Check for medical advice attempts
        const medicalAdvicePatterns = [
            /que remédio/i,
            /como tratar/i,
            /é normal/i,
            /posso tomar/i,
            /diagnóstico/i
        ];

        if (medicalAdvicePatterns.some(pattern => pattern.test(message))) {
            result.warnings.push('POTENTIAL_MEDICAL_ADVICE_REQUEST');
        }

        // Check for emergency keywords
        const emergencyPatterns = [
            /emergência/i,
            /socorro/i,
            /dor intensa/i,
            /perdi a visão/i,
            /sangramento/i
        ];

        if (emergencyPatterns.some(pattern => pattern.test(message))) {
            result.warnings.push('EMERGENCY_KEYWORDS_DETECTED');
        }

        return result;
    }

    /**
     * Check LGPD compliance
     * @param {Object} eventData - Event data
     * @param {Object} context - Request context
     * @returns {Object} LGPD compliance result
     */
    async checkLGPDCompliance(eventData, context) {
        const result = {
            compliant: true,
            violations: [],
            warnings: [],
            scoreReduction: 0
        };

        // Check for consent
        if (!context.consentId && eventData.containsPersonalData) {
            result.compliant = false;
            result.violations.push('MISSING_CONSENT');
            result.scoreReduction = 30;
        }

        // Check for data retention
        if (eventData.dataRetentionPeriod && eventData.dataRetentionPeriod > 365 * 24 * 60 * 60 * 1000) {
            result.warnings.push('LONG_DATA_RETENTION');
        }

        return result;
    }

    /**
     * Generate compliance actions
     * @param {Array} violations - Compliance violations
     * @param {Array} warnings - Compliance warnings
     * @returns {Array} Required actions
     */
    generateComplianceActions(violations, warnings) {
        const actions = [];

        if (violations.includes('MISSING_CONSENT')) {
            actions.push('REQUEST_USER_CONSENT');
        }

        if (warnings.includes('POTENTIAL_MEDICAL_ADVICE_REQUEST')) {
            actions.push('SHOW_MEDICAL_DISCLAIMER');
        }

        if (warnings.includes('EMERGENCY_KEYWORDS_DETECTED')) {
            actions.push('SHOW_EMERGENCY_CONTACT_INFO');
        }

        return actions;
    }

    /**
     * Analyze threat type distribution
     * @param {Array} securityEvents - Security events
     * @returns {Object} Threat type distribution
     */
    analyzeThreatTypeDistribution(securityEvents) {
        return securityEvents.reduce((acc, event) => {
            const threatType = event.details.violationType || 'UNKNOWN';
            acc[threatType] = (acc[threatType] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Analyze severity distribution
     * @param {Array} securityEvents - Security events
     * @returns {Object} Severity distribution
     */
    analyzeSeverityDistribution(securityEvents) {
        return securityEvents.reduce((acc, event) => {
            const severity = event.details.severity || 'UNKNOWN';
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        }, {});
    }
}

export default AuditLoggingService;