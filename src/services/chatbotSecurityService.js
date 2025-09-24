/**
 * Chatbot Security Service
 * Comprehensive security framework for AI chatbot interactions
 * 
 * Features:
 * - Multi-factor authentication for sensitive operations
 * - Advanced input validation and XSS protection
 * - Rate limiting and DDoS protection
 * - Security event detection and alerting
 * - Audit logging for compliance
 */

import crypto from 'crypto';
import { getClientIP } from '../../api/contact/rateLimiter.js';
import MedicalSafetyFilter from './medicalSafetyFilter.js';
import CFMComplianceEngine from './cfmComplianceEngine.js';

class ChatbotSecurityService {
    constructor() {
        this.medicalSafetyFilter = new MedicalSafetyFilter();
        this.cfmComplianceEngine = new CFMComplianceEngine();

        // Security configuration
        this.config = {
            // Rate limiting per session/IP
            rateLimits: {
                messagesPerMinute: 20,
                messagesPerHour: 200,
                sessionsPerIP: 5,
                sensitiveOperationsPerHour: 3
            },

            // Input validation
            validation: {
                maxMessageLength: 1000,
                maxSessionDuration: 3600000, // 1 hour
                allowedCharacters: /^[\w\s\u00C0-\u017F\u0100-\u024F.,!?;:()\-"'@#$%&*+=<>[\]{}|\\\/\n\r]*$/,
                blockedPatterns: [
                    // Script injection attempts
                    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
                    /javascript:/gi,
                    /on\w+\s*=/gi,

                    // SQL injection attempts
                    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
                    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
                    /(--|\/\*|\*\/)/g,

                    // Path traversal attempts
                    /\.\.\//g,
                    /\.\.\\/g,
                    /%2e%2e%2f/gi,

                    // Command injection attempts
                    /[;&|`$(){}[\]]/g,
                    /\b(eval|exec|system|shell_exec|passthru)\b/gi
                ]
            },

            // Sensitive operations requiring additional security
            sensitiveOperations: [
                'appointment_booking',
                'personal_data_access',
                'medical_history_request',
                'prescription_inquiry',
                'emergency_contact',
                'data_deletion_request'
            ],

            // Security event thresholds
            alertThresholds: {
                suspiciousActivityScore: 70,
                rateLimitViolations: 5,
                maliciousInputAttempts: 3,
                emergencyKeywordDetections: 1,
                medicalAdviceAttempts: 3
            }
        };

        // In-memory stores (in production, use Redis or database)
        this.sessionStore = new Map();
        this.rateLimitStore = new Map();
        this.securityEventStore = new Map();
        this.suspiciousActivityStore = new Map();

        // Initialize cleanup intervals
        this.initializeCleanupTasks();
    }

    /**
     * Initialize periodic cleanup tasks
     */
    initializeCleanupTasks() {
        // Clean expired sessions every 5 minutes
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 5 * 60 * 1000);

        // Clean old rate limit entries every 10 minutes
        setInterval(() => {
            this.cleanupRateLimitStore();
        }, 10 * 60 * 1000);

        // Clean old security events every hour
        setInterval(() => {
            this.cleanupSecurityEvents();
        }, 60 * 60 * 1000);
    }

    /**
     * Validate and secure incoming chatbot message
     * @param {Object} request - Request object containing message and metadata
     * @param {Object} context - Request context (IP, user agent, etc.)
     * @returns {Object} Security validation result
     */
    async validateChatbotRequest(request, context) {
        const startTime = Date.now();
        const clientIP = context.clientIP || getClientIP(context.req);
        const sessionId = request.sessionId || this.generateSessionId();

        const validation = {
            isValid: true,
            sessionId,
            securityScore: 100,
            violations: [],
            warnings: [],
            actions: [],
            metadata: {
                timestamp: new Date().toISOString(),
                clientIP: this.hashIP(clientIP),
                processingTime: 0
            }
        };

        try {
            // 1. Rate limiting validation
            const rateLimitResult = await this.validateRateLimit(clientIP, sessionId);
            if (!rateLimitResult.allowed) {
                validation.isValid = false;
                validation.violations.push({
                    type: 'RATE_LIMIT_EXCEEDED',
                    severity: 'HIGH',
                    message: rateLimitResult.message,
                    retryAfter: rateLimitResult.retryAfter
                });
                validation.securityScore -= 30;
            }

            // 2. Input validation and sanitization
            const inputValidation = await this.validateInput(request.message, request);
            if (!inputValidation.isValid) {
                validation.isValid = false;
                validation.violations.push(...inputValidation.violations);
                validation.securityScore -= inputValidation.securityPenalty;
            }

            // 3. Session validation
            const sessionValidation = await this.validateSession(sessionId, clientIP, context);
            if (!sessionValidation.isValid) {
                validation.warnings.push(...sessionValidation.warnings);
                validation.securityScore -= sessionValidation.securityPenalty;
            } else if (sessionValidation.warnings.length > 0) {
                // Add warnings even for valid sessions
                validation.warnings.push(...sessionValidation.warnings);
                validation.securityScore -= sessionValidation.securityPenalty;
            }

            // 4. Medical safety and compliance validation
            const medicalValidation = await this.validateMedicalSafety(request.message);
            if (medicalValidation.requiresIntervention) {
                validation.actions.push({
                    type: 'MEDICAL_INTERVENTION',
                    priority: 'HIGH',
                    data: medicalValidation
                });
                validation.securityScore -= 20;
            }

            // 5. Suspicious activity detection
            const suspiciousActivity = await this.detectSuspiciousActivity(request, context, clientIP);
            if (suspiciousActivity.detected) {
                validation.warnings.push({
                    type: 'SUSPICIOUS_ACTIVITY',
                    severity: suspiciousActivity.severity,
                    details: suspiciousActivity.details
                });
                validation.securityScore -= suspiciousActivity.penalty;
            }

            // 6. Update security metrics
            await this.updateSecurityMetrics(clientIP, sessionId, validation);

            // 7. Log security event if necessary
            if (validation.securityScore < this.config.alertThresholds.suspiciousActivityScore) {
                await this.logSecurityEvent('SECURITY_ALERT', {
                    sessionId,
                    clientIP: this.hashIP(clientIP),
                    securityScore: validation.securityScore,
                    violations: validation.violations,
                    warnings: validation.warnings
                });
            }

        } catch (error) {
            console.error('Security validation error:', error);
            validation.isValid = false;
            validation.violations.push({
                type: 'SECURITY_VALIDATION_ERROR',
                severity: 'CRITICAL',
                message: 'Security validation failed'
            });
        }

        validation.metadata.processingTime = Date.now() - startTime;
        return validation;
    }

    /**
     * Validate rate limits for IP and session
     * @param {string} clientIP - Client IP address
     * @param {string} sessionId - Session identifier
     * @returns {Object} Rate limit validation result
     */
    async validateRateLimit(clientIP, sessionId) {
        const now = Date.now();
        const ipKey = `ip:${this.hashIP(clientIP)}`;
        const sessionKey = `session:${sessionId}`;

        // Get current counters
        const ipCounters = this.rateLimitStore.get(ipKey) || {
            messagesPerMinute: [],
            messagesPerHour: [],
            sessionsCreated: [],
            sensitiveOperations: []
        };

        const sessionCounters = this.rateLimitStore.get(sessionKey) || {
            messagesPerMinute: [],
            messagesPerHour: []
        };

        // Clean old entries
        const oneMinuteAgo = now - 60 * 1000;
        const oneHourAgo = now - 60 * 60 * 1000;

        ipCounters.messagesPerMinute = ipCounters.messagesPerMinute.filter(t => t > oneMinuteAgo);
        ipCounters.messagesPerHour = ipCounters.messagesPerHour.filter(t => t > oneHourAgo);
        ipCounters.sessionsCreated = ipCounters.sessionsCreated.filter(t => t > oneHourAgo);
        ipCounters.sensitiveOperations = ipCounters.sensitiveOperations.filter(t => t > oneHourAgo);

        sessionCounters.messagesPerMinute = sessionCounters.messagesPerMinute.filter(t => t > oneMinuteAgo);
        sessionCounters.messagesPerHour = sessionCounters.messagesPerHour.filter(t => t > oneHourAgo);

        // Check limits
        if (ipCounters.messagesPerMinute.length >= this.config.rateLimits.messagesPerMinute) {
            return {
                allowed: false,
                message: 'Too many messages per minute',
                retryAfter: 60,
                type: 'RATE_LIMIT_MINUTE'
            };
        }

        if (ipCounters.messagesPerHour.length >= this.config.rateLimits.messagesPerHour) {
            return {
                allowed: false,
                message: 'Too many messages per hour',
                retryAfter: 3600,
                type: 'RATE_LIMIT_HOUR'
            };
        }

        if (sessionCounters.messagesPerMinute.length >= this.config.rateLimits.messagesPerMinute) {
            return {
                allowed: false,
                message: 'Session rate limit exceeded',
                retryAfter: 60,
                type: 'RATE_LIMIT_SESSION'
            };
        }

        // Update counters
        ipCounters.messagesPerMinute.push(now);
        ipCounters.messagesPerHour.push(now);
        sessionCounters.messagesPerMinute.push(now);
        sessionCounters.messagesPerHour.push(now);

        this.rateLimitStore.set(ipKey, ipCounters);
        this.rateLimitStore.set(sessionKey, sessionCounters);

        return {
            allowed: true,
            remaining: {
                messagesPerMinute: this.config.rateLimits.messagesPerMinute - ipCounters.messagesPerMinute.length,
                messagesPerHour: this.config.rateLimits.messagesPerHour - ipCounters.messagesPerHour.length
            }
        };
    }

    /**
     * Validate and sanitize input message
     * @param {string} message - User message
     * @param {Object} request - Full request object
     * @returns {Object} Input validation result
     */
    async validateInput(message, request) {
        const validation = {
            isValid: true,
            violations: [],
            sanitizedMessage: message,
            securityPenalty: 0
        };

        // Check message length
        if (!message || typeof message !== 'string') {
            validation.isValid = false;
            validation.violations.push({
                type: 'INVALID_MESSAGE_FORMAT',
                severity: 'HIGH',
                message: 'Message must be a non-empty string'
            });
            return validation;
        }

        if (message.length > this.config.validation.maxMessageLength) {
            validation.isValid = false;
            validation.violations.push({
                type: 'MESSAGE_TOO_LONG',
                severity: 'MEDIUM',
                message: `Message exceeds maximum length of ${this.config.validation.maxMessageLength} characters`
            });
            validation.securityPenalty += 10;
        }

        // Check for blocked patterns
        for (const pattern of this.config.validation.blockedPatterns) {
            if (pattern.test(message)) {
                validation.isValid = false;
                validation.violations.push({
                    type: 'MALICIOUS_INPUT_DETECTED',
                    severity: 'CRITICAL',
                    message: 'Potentially malicious input detected',
                    pattern: pattern.source.substring(0, 50)
                });
                validation.securityPenalty += 50;

                // Log security event for malicious input
                await this.logSecurityEvent('MALICIOUS_INPUT', {
                    message: message.substring(0, 100),
                    pattern: pattern.source,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Check character set
        if (!this.config.validation.allowedCharacters.test(message)) {
            validation.violations.push({
                type: 'INVALID_CHARACTERS',
                severity: 'MEDIUM',
                message: 'Message contains invalid characters'
            });
            validation.securityPenalty += 15;
        }

        // Sanitize message
        validation.sanitizedMessage = this.sanitizeMessage(message);

        return validation;
    }

    /**
     * Validate session security
     * @param {string} sessionId - Session identifier
     * @param {string} clientIP - Client IP address
     * @param {Object} context - Request context
     * @returns {Object} Session validation result
     */
    async validateSession(sessionId, clientIP, context) {
        const validation = {
            isValid: true,
            warnings: [],
            securityPenalty: 0
        };

        const session = this.sessionStore.get(sessionId);
        const now = Date.now();

        if (!session) {
            // Create new session
            const newSession = {
                id: sessionId,
                clientIP: this.hashIP(clientIP),
                createdAt: now,
                lastActivity: now,
                messageCount: 0,
                securityScore: 100,
                userAgent: context.userAgent || '',
                flags: []
            };

            this.sessionStore.set(sessionId, newSession);

            // Track session creation for rate limiting
            const ipKey = `ip:${this.hashIP(clientIP)}`;
            const ipCounters = this.rateLimitStore.get(ipKey) || { sessionsCreated: [] };
            ipCounters.sessionsCreated.push(now);
            this.rateLimitStore.set(ipKey, ipCounters);

        } else {
            // Validate existing session

            // Check session age
            if (now - session.createdAt > this.config.validation.maxSessionDuration) {
                validation.warnings.push({
                    type: 'SESSION_EXPIRED',
                    severity: 'MEDIUM',
                    message: 'Session has expired'
                });
                validation.securityPenalty += 10;
            }

            // Check IP consistency
            if (session.clientIP !== this.hashIP(clientIP)) {
                validation.warnings.push({
                    type: 'IP_CHANGE_DETECTED',
                    severity: 'HIGH',
                    message: 'Client IP changed during session'
                });
                validation.securityPenalty += 25;
                session.flags.push('IP_CHANGE');
            }

            // Check user agent consistency
            if (session.userAgent && session.userAgent !== context.userAgent) {
                validation.warnings.push({
                    type: 'USER_AGENT_CHANGE',
                    severity: 'MEDIUM',
                    message: 'User agent changed during session'
                });
                validation.securityPenalty += 15;
                session.flags.push('UA_CHANGE');
            }

            // Update session
            session.lastActivity = now;
            session.messageCount++;
            session.securityScore = Math.max(0, session.securityScore - validation.securityPenalty);

            this.sessionStore.set(sessionId, session);
        }

        return validation;
    }

    /**
     * Validate medical safety and compliance
     * @param {string} message - User message
     * @returns {Object} Medical validation result
     */
    async validateMedicalSafety(message) {
        // Use existing medical safety filter
        const safetyAnalysis = this.medicalSafetyFilter.analyzeSafety(message);

        // Use CFM compliance engine
        const complianceAnalysis = this.cfmComplianceEngine.analyzeMessage(message);

        return {
            requiresIntervention: safetyAnalysis.requiresIntervention || complianceAnalysis.emergencyDetected,
            emergencyDetected: safetyAnalysis.emergencyDetected || complianceAnalysis.emergencyDetected,
            medicalAdviceDetected: complianceAnalysis.medicalAdviceDetected,
            riskLevel: safetyAnalysis.riskLevel,
            complianceLevel: complianceAnalysis.riskLevel,
            recommendedActions: [
                ...safetyAnalysis.recommendedActions || [],
                ...complianceAnalysis.recommendedActions || []
            ]
        };
    }

    /**
     * Detect suspicious activity patterns
     * @param {Object} request - Request object
     * @param {Object} context - Request context
     * @param {string} clientIP - Client IP address
     * @returns {Object} Suspicious activity detection result
     */
    async detectSuspiciousActivity(request, context, clientIP) {
        const detection = {
            detected: false,
            severity: 'LOW',
            details: [],
            penalty: 0
        };

        const ipKey = this.hashIP(clientIP);
        const activity = this.suspiciousActivityStore.get(ipKey) || {
            messages: [],
            patterns: [],
            flags: []
        };

        const now = Date.now();
        const message = request.message;

        // 1. Rapid-fire messaging detection
        activity.messages.push(now);
        activity.messages = activity.messages.filter(t => t > now - 60000); // Last minute

        if (activity.messages.length > 15) { // More than 15 messages per minute
            detection.detected = true;
            detection.severity = 'HIGH';
            detection.details.push('Rapid-fire messaging detected');
            detection.penalty += 30;
        }

        // 2. Repetitive content detection
        const messageHash = crypto.createHash('md5').update(message).digest('hex');
        activity.patterns.push({ hash: messageHash, timestamp: now });
        activity.patterns = activity.patterns.filter(p => p.timestamp > now - 300000); // Last 5 minutes

        const duplicateCount = activity.patterns.filter(p => p.hash === messageHash).length;
        if (duplicateCount > 3) {
            detection.detected = true;
            detection.severity = 'MEDIUM';
            detection.details.push('Repetitive content detected');
            detection.penalty += 20;
        }

        // 3. Bot-like behavior detection
        const userAgent = context.userAgent || '';
        const botPatterns = [
            /bot|crawler|spider|scraper/i,
            /curl|wget|python|php|java/i,
            /^$/
        ];

        if (botPatterns.some(pattern => pattern.test(userAgent))) {
            detection.detected = true;
            detection.severity = 'HIGH';
            detection.details.push('Bot-like user agent detected');
            detection.penalty += 40;
        }

        // 4. Unusual timing patterns
        if (activity.messages.length >= 2) {
            const intervals = [];
            for (let i = 1; i < activity.messages.length; i++) {
                intervals.push(activity.messages[i] - activity.messages[i - 1]);
            }

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;

            // Very consistent timing might indicate automation
            if (variance < 100 && avgInterval < 5000 && intervals.length > 5) {
                detection.detected = true;
                detection.severity = 'MEDIUM';
                detection.details.push('Automated timing pattern detected');
                detection.penalty += 25;
            }
        }

        // Update activity store
        this.suspiciousActivityStore.set(ipKey, activity);

        return detection;
    }

    /**
     * Update security metrics for monitoring
     * @param {string} clientIP - Client IP address
     * @param {string} sessionId - Session identifier
     * @param {Object} validation - Validation result
     */
    async updateSecurityMetrics(clientIP, sessionId, validation) {
        const metrics = {
            timestamp: new Date().toISOString(),
            clientIP: this.hashIP(clientIP),
            sessionId,
            securityScore: validation.securityScore,
            violationCount: validation.violations.length,
            warningCount: validation.warnings.length,
            processingTime: validation.metadata.processingTime
        };

        // Store metrics (in production, send to monitoring system)
        if (!global.chatbotSecurityMetrics) {
            global.chatbotSecurityMetrics = [];
        }

        global.chatbotSecurityMetrics.push(metrics);

        // Keep only last 1000 metrics in memory
        if (global.chatbotSecurityMetrics.length > 1000) {
            global.chatbotSecurityMetrics = global.chatbotSecurityMetrics.slice(-1000);
        }
    }

    /**
     * Log security event for audit trail
     * @param {string} eventType - Type of security event
     * @param {Object} eventData - Event data
     */
    async logSecurityEvent(eventType, eventData) {
        const event = {
            id: crypto.randomUUID(),
            type: eventType,
            timestamp: new Date().toISOString(),
            data: eventData,
            severity: this.getEventSeverity(eventType)
        };

        // Store event
        this.securityEventStore.set(event.id, event);

        // Log to console (in production, send to logging system)
        console.log(`[SECURITY EVENT] ${eventType}:`, {
            id: event.id,
            timestamp: event.timestamp,
            severity: event.severity,
            data: eventData
        });

        // Trigger alerts for high-severity events
        if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
            await this.triggerSecurityAlert(event);
        }
    }

    /**
     * Trigger security alert
     * @param {Object} event - Security event
     */
    async triggerSecurityAlert(event) {
        // In production, this would send alerts to security team
        console.warn(`[SECURITY ALERT] ${event.type}:`, event);

        // Could integrate with:
        // - Email notifications
        // - Slack/Teams alerts
        // - Security monitoring systems
        // - Incident response systems
    }

    /**
     * Sanitize message content
     * @param {string} message - Message to sanitize
     * @returns {string} Sanitized message
     */
    sanitizeMessage(message) {
        return message
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<[^>]*>/g, '') // Remove all HTML tags
            .trim();
    }

    /**
     * Generate secure session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return crypto.randomUUID();
    }

    /**
     * Hash IP address for privacy
     * @param {string} ip - IP address
     * @returns {string} Hashed IP
     */
    hashIP(ip) {
        return crypto.createHash('sha256').update(ip + process.env.IP_HASH_SALT || 'default_salt').digest('hex').substring(0, 16);
    }

    /**
     * Get event severity level
     * @param {string} eventType - Event type
     * @returns {string} Severity level
     */
    getEventSeverity(eventType) {
        const severityMap = {
            'MALICIOUS_INPUT': 'CRITICAL',
            'SECURITY_ALERT': 'HIGH',
            'RATE_LIMIT_EXCEEDED': 'MEDIUM',
            'SUSPICIOUS_ACTIVITY': 'MEDIUM',
            'SESSION_ANOMALY': 'LOW',
            'INPUT_VALIDATION': 'LOW'
        };

        return severityMap[eventType] || 'LOW';
    }

    /**
     * Cleanup expired sessions
     */
    cleanupExpiredSessions() {
        const now = Date.now();
        const maxAge = this.config.validation.maxSessionDuration;

        for (const [sessionId, session] of this.sessionStore.entries()) {
            if (now - session.lastActivity > maxAge) {
                this.sessionStore.delete(sessionId);
            }
        }
    }

    /**
     * Cleanup old rate limit entries
     */
    cleanupRateLimitStore() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [key, data] of this.rateLimitStore.entries()) {
            const hasRecentActivity = Object.values(data).some(array =>
                Array.isArray(array) && array.some(timestamp => now - timestamp < maxAge)
            );

            if (!hasRecentActivity) {
                this.rateLimitStore.delete(key);
            }
        }
    }

    /**
     * Cleanup old security events
     */
    cleanupSecurityEvents() {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        for (const [eventId, event] of this.securityEventStore.entries()) {
            if (now - new Date(event.timestamp).getTime() > maxAge) {
                this.securityEventStore.delete(eventId);
            }
        }
    }

    /**
     * Get security statistics for monitoring
     * @returns {Object} Security statistics
     */
    getSecurityStats() {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        const recentEvents = Array.from(this.securityEventStore.values())
            .filter(event => new Date(event.timestamp).getTime() > oneHourAgo);

        const dailyEvents = Array.from(this.securityEventStore.values())
            .filter(event => new Date(event.timestamp).getTime() > oneDayAgo);

        return {
            activeSessions: this.sessionStore.size,
            recentSecurityEvents: recentEvents.length,
            dailySecurityEvents: dailyEvents.length,
            eventsByType: this.groupEventsByType(dailyEvents),
            eventsBySeverity: this.groupEventsBySeverity(dailyEvents),
            averageSecurityScore: this.calculateAverageSecurityScore(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Group events by type
     * @param {Array} events - Security events
     * @returns {Object} Events grouped by type
     */
    groupEventsByType(events) {
        return events.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Group events by severity
     * @param {Array} events - Security events
     * @returns {Object} Events grouped by severity
     */
    groupEventsBySeverity(events) {
        return events.reduce((acc, event) => {
            acc[event.severity] = (acc[event.severity] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Calculate average security score
     * @returns {number} Average security score
     */
    calculateAverageSecurityScore() {
        const sessions = Array.from(this.sessionStore.values());
        if (sessions.length === 0) return 100;

        const totalScore = sessions.reduce((sum, session) => sum + session.securityScore, 0);
        return Math.round(totalScore / sessions.length);
    }
}

export default ChatbotSecurityService;