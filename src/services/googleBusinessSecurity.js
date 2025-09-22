/**
 * Google Business Security Service
 * Security and privacy compliance features for Google Business integration
 */

class GoogleBusinessSecurity {
    constructor(options = {}) {
        this.options = {
            // Security settings
            enableInputSanitization: options.enableInputSanitization !== false,
            enableXssProtection: options.enableXssProtection !== false,
            enableDataEncryption: options.enableDataEncryption !== false,

            // Privacy compliance settings
            enableLgpdCompliance: options.enableLgpdCompliance !== false,
            enableGdprCompliance: options.enableGdprCompliance !== false,

            // Data retention settings
            dataRetentionPeriod: options.dataRetentionPeriod || 365, // days
            enableAutoCleanup: options.enableAutoCleanup !== false,

            // Audit logging
            enableAuditLogging: options.enableAuditLogging !== false,
            auditLogRetention: options.auditLogRetention || 90, // days

            // Rate limiting
            enableRateLimiting: options.enableRateLimiting !== false,
            rateLimitWindow: options.rateLimitWindow || 60000, // 1 minute
            rateLimitMaxRequests: options.rateLimitMaxRequests || 100,

            ...options
        };

        // Rate limiting tracking
        this.requestTracker = new Map();

        // Audit log
        this.auditLog = [];

        // Data retention timer
        this.cleanupTimer = null;

        // Initialize security features
        this.initialize();
    }

    /**
     * Initialize security features
     */
    initialize() {
        if (this.options.enableAutoCleanup) {
            this.startDataCleanup();
        }

        console.log('Google Business Security Service initialized');
    }

    /**
     * Sanitize input data to prevent XSS and injection attacks
     */
    sanitizeInput(data) {
        if (!this.options.enableInputSanitization) {
            return data;
        }

        if (typeof data !== 'string') {
            return data;
        }

        // Remove potentially dangerous characters and scripts
        const sanitized = data
            // Remove HTML tags
            .replace(/<[^>]*>/g, '')
            // Remove JavaScript protocols
            .replace(/javascript:/gi, '')
            // Remove potentially dangerous event handlers
            .replace(/on\w+\s*=/gi, '')
            // Remove CSS expressions
            .replace(/expression\(/gi, '')
            // Remove data URIs
            .replace(/data:\s*[^;]*;base64,/gi, '')
            // Normalize whitespace
            .replace(/\s+/g, ' ')
            .trim();

        return sanitized;
    }

    /**
     * Sanitize review data comprehensively
     */
    sanitizeReviewData(review) {
        if (!review || typeof review !== 'object') {
            return review;
        }

        const sanitized = { ...review };

        // Sanitize string fields
        if (sanitized.comment) {
            sanitized.comment = this.sanitizeInput(sanitized.comment);
        }

        if (sanitized.reviewer) {
            if (sanitized.reviewer.displayName) {
                sanitized.reviewer.displayName = this.sanitizeInput(sanitized.reviewer.displayName);
            }
        }

        if (sanitized.reviewReply) {
            if (sanitized.reviewReply.comment) {
                sanitized.reviewReply.comment = this.sanitizeInput(sanitized.reviewReply.comment);
            }
        }

        return sanitized;
    }

    /**
     * Validate and sanitize API parameters
     */
    validateApiParams(params) {
        const sanitized = {};
        const errors = [];

        // Validate locationId
        if (params.locationId) {
            if (typeof params.locationId === 'string' && params.locationId.match(/^accounts\/[^\/]+\/locations\/[^\/]+$/)) {
                sanitized.locationId = params.locationId;
            } else {
                errors.push('Invalid locationId format');
            }
        }

        // Validate numeric parameters
        if (params.pageSize !== undefined) {
            const pageSize = parseInt(params.pageSize);
            if (pageSize >= 1 && pageSize <= 100) {
                sanitized.pageSize = pageSize;
            } else {
                errors.push('pageSize must be between 1 and 100');
            }
        }

        // Validate string parameters
        if (params.pageToken) {
            if (typeof params.pageToken === 'string' && params.pageToken.length > 0) {
                sanitized.pageToken = this.sanitizeInput(params.pageToken);
            } else {
                errors.push('Invalid pageToken');
            }
        }

        // Validate orderBy
        if (params.orderBy) {
            const validOrderValues = ['newest', 'oldest', 'highest_rating', 'lowest_rating'];
            if (validOrderValues.includes(params.orderBy)) {
                sanitized.orderBy = params.orderBy;
            } else {
                errors.push('Invalid orderBy value');
            }
        }

        return {
            sanitized,
            errors,
            isValid: errors.length === 0
        };
    }

    /**
     * Check rate limiting for a client
     */
    checkRateLimit(clientId) {
        if (!this.options.enableRateLimiting) {
            return { allowed: true, remaining: Infinity };
        }

        const now = Date.now();
        const windowStart = now - this.options.rateLimitWindow;

        // Get or create client tracker
        if (!this.requestTracker.has(clientId)) {
            this.requestTracker.set(clientId, []);
        }

        const requests = this.requestTracker.get(clientId);

        // Remove old requests outside the window
        const validRequests = requests.filter(timestamp => timestamp > windowStart);
        this.requestTracker.set(clientId, validRequests);

        // Check if limit exceeded
        if (validRequests.length >= this.options.rateLimitMaxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: validRequests[0] + this.options.rateLimitWindow
            };
        }

        // Add current request
        validRequests.push(now);
        this.requestTracker.set(clientId, validRequests);

        const remaining = this.options.rateLimitMaxRequests - validRequests.length;

        return {
            allowed: true,
            remaining,
            resetTime: now + this.options.rateLimitWindow
        };
    }

    /**
     * Log security audit events
     */
    logAuditEvent(event) {
        if (!this.options.enableAuditLogging) {
            return;
        }

        const auditEvent = {
            timestamp: new Date().toISOString(),
            type: event.type,
            action: event.action,
            clientId: event.clientId || 'unknown',
            details: event.details || {},
            severity: event.severity || 'info',
            ipAddress: event.ipAddress || 'unknown',
            userAgent: event.userAgent || 'unknown'
        };

        this.auditLog.push(auditEvent);

        // Keep only recent audit logs
        const maxLogs = Math.ceil(this.options.auditLogRetention * 24 * 60); // Convert days to minutes (assuming 1 event per minute)
        if (this.auditLog.length > maxLogs) {
            this.auditLog = this.auditLog.slice(-maxLogs);
        }

        console.log('Security audit event logged:', auditEvent);
    }

    /**
     * Get audit logs
     */
    getAuditLogs(filters = {}) {
        let logs = [...this.auditLog];

        // Apply filters
        if (filters.type) {
            logs = logs.filter(log => log.type === filters.type);
        }

        if (filters.severity) {
            logs = logs.filter(log => log.severity === filters.severity);
        }

        if (filters.clientId) {
            logs = logs.filter(log => log.clientId === filters.clientId);
        }

        if (filters.startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
        }

        // Sort by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Apply limit
        if (filters.limit) {
            logs = logs.slice(0, filters.limit);
        }

        return logs;
    }

    /**
     * Generate privacy compliance information
     */
    generatePrivacyInfo() {
        const privacyInfo = {
            lgpd: {
                applicable: this.options.enableLgpdCompliance,
                dataController: 'Company Name',
                contactEmail: 'privacy@company.com',
                retentionPeriod: `${this.options.dataRetentionPeriod} days`,
                rights: [
                    'Access to personal data',
                    'Correction of personal data',
                    'Deletion of personal data',
                    'Data portability',
                    'Opt-out of data processing'
                ]
            },
            gdpr: {
                applicable: this.options.enableGdprCompliance,
                dataController: 'Company Name',
                contactEmail: 'privacy@company.com',
                retentionPeriod: `${this.options.dataRetentionPeriod} days`,
                rights: [
                    'Right to be informed',
                    'Right of access',
                    'Right to rectification',
                    'Right to erasure',
                    'Right to restrict processing',
                    'Right to data portability',
                    'Right to object'
                ]
            },
            dataProcessing: {
                purposes: [
                    'Display and manage Google Business reviews',
                    'Generate business statistics and analytics',
                    'Improve user experience',
                    'Monitor system performance and security'
                ],
                legalBasis: 'Legitimate interest in business operations',
                thirdPartySharing: 'Data is shared with Google Business API only',
                securityMeasures: [
                    'Data encryption in transit and at rest',
                    'Regular security audits',
                    'Access controls and authentication',
                    'Data retention and cleanup policies'
                ]
            }
        };

        return privacyInfo;
    }

    /**
     * Handle data subject requests (LGPD/GDPR)
     */
    handleDataSubjectRequest(request) {
        const { type, clientId, identifier } = request;

        this.logAuditEvent({
            type: 'privacy_request',
            action: type,
            clientId,
            details: { identifier },
            severity: 'info'
        });

        switch (type) {
            case 'access':
                return this.handleAccessRequest(identifier);
            case 'deletion':
                return this.handleDeletionRequest(identifier);
            case 'rectification':
                return this.handleRectificationRequest(identifier);
            default:
                throw new Error(`Unsupported request type: ${type}`);
        }
    }

    /**
     * Handle data access request
     */
    handleAccessRequest(identifier) {
        // In a real implementation, this would query the database
        // For now, we'll return a mock response
        return {
            success: true,
            data: {
                reviews: [],
                statistics: {},
                lastAccess: new Date().toISOString()
            },
            message: 'Data access request processed successfully'
        };
    }

    /**
     * Handle data deletion request
     */
    handleDeletionRequest(identifier) {
        // In a real implementation, this would delete or anonymize data
        this.logAuditEvent({
            type: 'data_deletion',
            action: 'delete',
            clientId: 'system',
            details: { identifier },
            severity: 'warning'
        });

        return {
            success: true,
            message: 'Data deletion request processed successfully'
        };
    }

    /**
     * Handle data rectification request
     */
    handleRectificationRequest(identifier) {
        // In a real implementation, this would update incorrect data
        this.logAuditEvent({
            type: 'data_rectification',
            action: 'update',
            clientId: 'system',
            details: { identifier },
            severity: 'info'
        });

        return {
            success: true,
            message: 'Data rectification request processed successfully'
        };
    }

    /**
     * Start automatic data cleanup
     */
    startDataCleanup() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }

        // Run cleanup daily
        this.cleanupTimer = setInterval(() => {
            this.performDataCleanup();
        }, 24 * 60 * 60 * 1000); // 24 hours

        console.log('Automatic data cleanup started');
    }

    /**
     * Stop automatic data cleanup
     */
    stopDataCleanup() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
            console.log('Automatic data cleanup stopped');
        }
    }

    /**
     * Perform data cleanup
     */
    performDataCleanup() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.options.dataRetentionPeriod);

        this.logAuditEvent({
            type: 'data_cleanup',
            action: 'cleanup',
            clientId: 'system',
            details: { cutoffDate: cutoffDate.toISOString() },
            severity: 'info'
        });

        // In a real implementation, this would clean up old data
        console.log(`Data cleanup performed for data older than ${cutoffDate.toISOString()}`);
    }

    /**
     * Generate security report
     */
    generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            configuration: {
                inputSanitization: this.options.enableInputSanitization,
                xssProtection: this.options.enableXssProtection,
                dataEncryption: this.options.enableDataEncryption,
                lgpdCompliance: this.options.enableLgpdCompliance,
                gdprCompliance: this.options.enableGdprCompliance,
                rateLimiting: this.options.enableRateLimiting,
                auditLogging: this.options.enableAuditLogging
            },
            statistics: {
                totalAuditEvents: this.auditLog.length,
                activeClients: this.requestTracker.size,
                dataRetentionPeriod: this.options.dataRetentionPeriod
            },
            recentEvents: this.getAuditLogs({ limit: 10 }),
            recommendations: this.generateSecurityRecommendations()
        };

        return report;
    }

    /**
     * Generate security recommendations
     */
    generateSecurityRecommendations() {
        const recommendations = [];

        if (!this.options.enableInputSanitization) {
            recommendations.push({
                priority: 'high',
                category: 'security',
                recommendation: 'Enable input sanitization to prevent XSS attacks'
            });
        }

        if (!this.options.enableRateLimiting) {
            recommendations.push({
                priority: 'medium',
                category: 'security',
                recommendation: 'Enable rate limiting to prevent abuse'
            });
        }

        if (!this.options.enableAuditLogging) {
            recommendations.push({
                priority: 'medium',
                category: 'compliance',
                recommendation: 'Enable audit logging for security monitoring'
            });
        }

        if (!this.options.enableLgpdCompliance && !this.options.enableGdprCompliance) {
            recommendations.push({
                priority: 'high',
                category: 'compliance',
                recommendation: 'Enable privacy compliance features (LGPD/GDPR)'
            });
        }

        if (this.options.dataRetentionPeriod > 365) {
            recommendations.push({
                priority: 'low',
                category: 'privacy',
                recommendation: 'Consider reducing data retention period to minimize privacy risk'
            });
        }

        return recommendations;
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopDataCleanup();
        this.requestTracker.clear();
        this.auditLog = [];
        console.log('Google Business Security Service destroyed');
    }
}

export default GoogleBusinessSecurity;
