/**
 * Instagram Security Middleware Service
 * Provides comprehensive security measures for Instagram API integration
 */

import crypto from 'crypto';
import instagramRateLimiter from './instagramRateLimiter';
import instagramTokenManager from './instagramTokenManager';
import instagramInputValidator from './instagramInputValidator';

class InstagramSecurityMiddleware {
    constructor() {
        this.securityPolicies = new Map();
        this.securityEvents = [];
        this.blockedIPs = new Set();
        this.suspiciousActivity = new Map();
        this.securityMetrics = {
            totalRequests: 0,
            blockedRequests: 0,
            suspiciousRequests: 0,
            tokenValidationFailures: 0,
            rateLimitViolations: 0
        };

        // Initialize security policies
        this.initializeSecurityPolicies();

        // Start security monitoring
        this.startSecurityMonitoring();
    }

    /**
     * Initialize default security policies
     */
    initializeSecurityPolicies() {
        // Request validation policy
        this.addSecurityPolicy('request-validation', {
            enabled: true,
            strictMode: true,
            sanitizeInputs: true,
            logViolations: true,
            blockOnViolation: false
        });

        // Rate limiting policy
        this.addSecurityPolicy('rate-limiting', {
            enabled: true,
            enforceGlobal: true,
            enforcePerUser: true,
            blockOnExceed: true,
            logViolations: true
        });

        // Token security policy
        this.addSecurityPolicy('token-security', {
            enabled: true,
            validateTokens: true,
            encryptStorage: true,
            rotateTokens: true,
            logTokenEvents: true
        });

        // Content security policy
        this.addSecurityPolicy('content-security', {
            enabled: true,
            sanitizeContent: true,
            validateUrls: true,
            blockSuspiciousContent: true,
            logContentViolations: true
        });

        // IP security policy
        this.addSecurityPolicy('ip-security', {
            enabled: true,
            trackSuspiciousIPs: true,
            blockMaliciousIPs: false, // Disabled by default
            maxRequestsPerIP: 1000,
            timeWindow: 3600000 // 1 hour
        });
    }

    /**
     * Add security policy
     */
    addSecurityPolicy(name, policy) {
        this.securityPolicies.set(name, {
            ...policy,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }

    /**
     * Main security middleware function
     */
    async processRequest(request, context = {}) {
        const {
            endpoint,
            method = 'GET',
            params = {},
            headers = {},
            userId = 'anonymous',
            clientIP = 'unknown',
            userAgent = 'unknown'
        } = request;

        const securityResult = {
            allowed: true,
            blocked: false,
            warnings: [],
            errors: [],
            sanitizedParams: params,
            securityEvents: [],
            processingTime: 0
        };

        const startTime = Date.now();

        try {
            // Update metrics
            this.securityMetrics.totalRequests++;

            // 1. IP Security Check
            const ipCheck = await this.checkIPSecurity(clientIP, context);
            if (!ipCheck.allowed) {
                securityResult.allowed = false;
                securityResult.blocked = true;
                securityResult.errors.push('IP blocked due to security policy');
                this.recordSecurityEvent('ip-blocked', { clientIP, reason: ipCheck.reason });
                return securityResult;
            }

            // 2. Rate Limiting Check
            const rateLimitCheck = await instagramRateLimiter.isRequestAllowed(endpoint, {
                userId,
                priority: context.priority || 'normal'
            });

            if (!rateLimitCheck.allowed) {
                securityResult.allowed = false;
                securityResult.errors.push(`Rate limit exceeded: ${rateLimitCheck.reason}`);
                securityResult.retryAfter = rateLimitCheck.retryAfter;
                this.securityMetrics.rateLimitViolations++;
                this.recordSecurityEvent('rate-limit-exceeded', {
                    endpoint,
                    userId,
                    reason: rateLimitCheck.reason
                });
                return securityResult;
            }

            // 3. Input Validation and Sanitization
            const validationResult = instagramInputValidator.validate(params, {
                strict: this.getPolicy('request-validation').strictMode,
                sanitize: this.getPolicy('request-validation').sanitizeInputs
            });

            if (!validationResult.isValid) {
                securityResult.allowed = false;
                securityResult.errors.push(...validationResult.errors);
                this.recordSecurityEvent('input-validation-failed', {
                    endpoint,
                    errors: validationResult.errors
                });
                return securityResult;
            }

            securityResult.warnings.push(...validationResult.warnings);
            securityResult.sanitizedParams = validationResult.sanitizedData || params;

            // 4. Token Validation (if token present)
            if (params.access_token || headers.authorization) {
                const tokenCheck = await this.validateRequestToken(params, headers, context);
                if (!tokenCheck.valid) {
                    securityResult.allowed = false;
                    securityResult.errors.push('Token validation failed');
                    this.securityMetrics.tokenValidationFailures++;
                    this.recordSecurityEvent('token-validation-failed', {
                        endpoint,
                        userId,
                        reason: tokenCheck.reason
                    });
                    return securityResult;
                }
            }

            // 5. Content Security Check
            const contentCheck = await this.checkContentSecurity(securityResult.sanitizedParams, context);
            if (!contentCheck.safe) {
                securityResult.warnings.push(...contentCheck.warnings);
                if (contentCheck.block) {
                    securityResult.allowed = false;
                    securityResult.errors.push('Content security violation');
                    this.recordSecurityEvent('content-security-violation', {
                        endpoint,
                        violations: contentCheck.violations
                    });
                    return securityResult;
                }
            }

            // 6. Suspicious Activity Detection
            const suspiciousCheck = this.checkSuspiciousActivity(request, context);
            if (suspiciousCheck.suspicious) {
                securityResult.warnings.push('Suspicious activity detected');
                this.recordSecurityEvent('suspicious-activity', {
                    clientIP,
                    userId,
                    indicators: suspiciousCheck.indicators
                });

                if (suspiciousCheck.block) {
                    securityResult.allowed = false;
                    securityResult.errors.push('Request blocked due to suspicious activity');
                    return securityResult;
                }
            }

            // Record successful security check
            instagramRateLimiter.recordRequest(endpoint, {
                userId,
                responseTime: Date.now() - startTime,
                statusCode: 200
            });

        } catch (error) {
            securityResult.allowed = false;
            securityResult.errors.push(`Security check failed: ${error.message}`);
            this.recordSecurityEvent('security-check-error', {
                endpoint,
                error: error.message
            });
        } finally {
            securityResult.processingTime = Date.now() - startTime;
        }

        return securityResult;
    }

    /**
     * Check IP security
     */
    async checkIPSecurity(clientIP, context) {
        const policy = this.getPolicy('ip-security');

        if (!policy.enabled) {
            return { allowed: true };
        }

        // Check if IP is blocked
        if (this.blockedIPs.has(clientIP)) {
            return {
                allowed: false,
                reason: 'ip-blocked',
                message: 'IP address is blocked'
            };
        }

        // Check request rate per IP
        if (policy.trackSuspiciousIPs) {
            const ipActivity = this.suspiciousActivity.get(clientIP) || {
                requestCount: 0,
                firstRequest: Date.now(),
                lastRequest: Date.now(),
                violations: []
            };

            ipActivity.requestCount++;
            ipActivity.lastRequest = Date.now();

            // Check if exceeding IP rate limit
            const timeWindow = Date.now() - ipActivity.firstRequest;
            if (timeWindow < policy.timeWindow && ipActivity.requestCount > policy.maxRequestsPerIP) {
                if (policy.blockMaliciousIPs) {
                    this.blockedIPs.add(clientIP);
                    return {
                        allowed: false,
                        reason: 'ip-rate-exceeded',
                        message: 'IP rate limit exceeded'
                    };
                } else {
                    ipActivity.violations.push({
                        type: 'rate-exceeded',
                        timestamp: Date.now()
                    });
                }
            }

            this.suspiciousActivity.set(clientIP, ipActivity);
        }

        return { allowed: true };
    }

    /**
     * Validate request token
     */
    async validateRequestToken(params, headers, context) {
        const policy = this.getPolicy('token-security');

        if (!policy.enabled || !policy.validateTokens) {
            return { valid: true };
        }

        let token = null;

        // Extract token from params or headers
        if (params.access_token) {
            token = params.access_token;
        } else if (headers.authorization) {
            const authHeader = headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return {
                valid: false,
                reason: 'no-token',
                message: 'No access token provided'
            };
        }

        try {
            // Validate token format
            const tokenValidation = instagramInputValidator.validateField('access_token', token,
                instagramInputValidator.validationRules.get('access_token')
            );

            if (!tokenValidation.isValid) {
                return {
                    valid: false,
                    reason: 'invalid-format',
                    message: 'Token format is invalid',
                    errors: tokenValidation.errors
                };
            }

            // Check if token exists in our secure storage
            try {
                const storedToken = await instagramTokenManager.getToken('instagram-basic', context.userId || 'default');

                // Compare tokens (in production, use proper token comparison)
                const tokenMatches = this.compareTokens(token, storedToken.token);
                if (!tokenMatches) {
                    return {
                        valid: false,
                        reason: 'token-mismatch',
                        message: 'Token does not match stored token'
                    };
                }
            } catch (error) {
                // Token not found in storage, could be valid but not managed by us
                console.warn('Token not found in secure storage:', error.message);
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                reason: 'validation-error',
                message: `Token validation error: ${error.message}`
            };
        }
    }

    /**
     * Compare tokens securely using crypto.timingSafeEqual
     */
    compareTokens(token1, token2) {
        // Handle null/undefined inputs safely
        if (!token1 || !token2) {
            return false;
        }

        // Ensure both inputs are strings
        const str1 = String(token1);
        const str2 = String(token2);

        // Convert to Buffers for timingSafeEqual
        const buf1 = Buffer.from(str1, 'utf8');
        const buf2 = Buffer.from(str2, 'utf8');

        // If lengths differ, pad the shorter buffer with zeros
        if (buf1.length !== buf2.length) {
            const maxLength = Math.max(buf1.length, buf2.length);
            const paddedBuf1 = Buffer.alloc(maxLength);
            const paddedBuf2 = Buffer.alloc(maxLength);
            
            buf1.copy(paddedBuf1);
            buf2.copy(paddedBuf2);
            
            return crypto.timingSafeEqual(paddedBuf1, paddedBuf2);
        }

        // Use crypto.timingSafeEqual for constant-time comparison
        return crypto.timingSafeEqual(buf1, buf2);
    }

    /**
     * Check content security
     */
    async checkContentSecurity(params, context) {
        const policy = this.getPolicy('content-security');
        const result = {
            safe: true,
            block: false,
            warnings: [],
            violations: []
        };

        if (!policy.enabled) {
            return result;
        }

        // Check for suspicious content patterns
        const suspiciousPatterns = [
            /javascript:/i,
            /<script/i,
            /data:text\/html/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i,
            /eval\(/i,
            /document\.write/i
        ];

        for (const [key, value] of Object.entries(params)) {
            if (typeof value === 'string') {
                const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(value));

                if (hasSuspiciousContent) {
                    result.safe = false;
                    result.violations.push({
                        field: key,
                        type: 'suspicious-content',
                        value: value.substring(0, 100) // Truncate for logging
                    });

                    if (policy.blockSuspiciousContent) {
                        result.block = true;
                    } else {
                        result.warnings.push(`Suspicious content detected in ${key}`);
                    }
                }
            }
        }

        return result;
    }

    /**
     * Check for suspicious activity patterns
     */
    checkSuspiciousActivity(request, context) {
        const { clientIP, userId, userAgent, endpoint } = request;
        const result = {
            suspicious: false,
            block: false,
            indicators: []
        };

        // Check for rapid requests from same IP
        const ipActivity = this.suspiciousActivity.get(clientIP) || {
            requestCount: 0,
            firstRequest: Date.now(),
            endpoints: new Set(),
            userAgents: new Set()
        };

        ipActivity.requestCount++;
        ipActivity.endpoints.add(endpoint);
        ipActivity.userAgents.add(userAgent);

        // Suspicious indicators
        const timeWindow = Date.now() - ipActivity.firstRequest;

        // Too many requests in short time
        if (timeWindow < 60000 && ipActivity.requestCount > 100) { // 100 requests per minute
            result.suspicious = true;
            result.indicators.push('high-request-rate');
        }

        // Too many different endpoints
        if (ipActivity.endpoints.size > 10) {
            result.suspicious = true;
            result.indicators.push('endpoint-scanning');
        }

        // Multiple user agents from same IP
        if (ipActivity.userAgents.size > 5) {
            result.suspicious = true;
            result.indicators.push('multiple-user-agents');
        }

        // Suspicious user agent patterns
        const suspiciousUAPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i,
            /curl/i,
            /wget/i
        ];

        if (suspiciousUAPatterns.some(pattern => pattern.test(userAgent))) {
            result.suspicious = true;
            result.indicators.push('suspicious-user-agent');
        }

        // Update activity tracking
        this.suspiciousActivity.set(clientIP, ipActivity);

        // Determine if should block
        if (result.indicators.length >= 3) {
            result.block = true;
        }

        return result;
    }

    /**
     * Record security event
     */
    recordSecurityEvent(type, data) {
        const event = {
            id: this.generateEventId(),
            type,
            timestamp: Date.now(),
            data: this.sanitizeEventData(data),
            severity: this.getEventSeverity(type)
        };

        this.securityEvents.push(event);

        // Keep only recent events
        if (this.securityEvents.length > 1000) {
            this.securityEvents = this.securityEvents.slice(-500);
        }

        // Update metrics
        if (type.includes('blocked') || type.includes('violation')) {
            this.securityMetrics.blockedRequests++;
        }

        if (type.includes('suspicious')) {
            this.securityMetrics.suspiciousRequests++;
        }

        // Log high severity events
        if (event.severity === 'high') {
            console.warn('High severity security event:', event);
        }

        return event.id;
    }

    /**
     * Get security policy
     */
    getPolicy(policyName) {
        return this.securityPolicies.get(policyName) || { enabled: false };
    }

    /**
     * Update security policy
     */
    updatePolicy(policyName, updates) {
        const existing = this.getPolicy(policyName);
        this.securityPolicies.set(policyName, {
            ...existing,
            ...updates,
            updatedAt: Date.now()
        });
    }

    /**
     * Get event severity
     */
    getEventSeverity(eventType) {
        const severityMap = {
            'ip-blocked': 'high',
            'token-validation-failed': 'high',
            'content-security-violation': 'medium',
            'rate-limit-exceeded': 'medium',
            'suspicious-activity': 'low',
            'input-validation-failed': 'low'
        };

        return severityMap[eventType] || 'low';
    }

    /**
     * Sanitize event data for logging
     */
    sanitizeEventData(data) {
        const sanitized = { ...data };

        // Remove sensitive information
        delete sanitized.access_token;
        delete sanitized.client_secret;
        delete sanitized.password;

        // Truncate long values
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'string' && sanitized[key].length > 200) {
                sanitized[key] = sanitized[key].substring(0, 200) + '...';
            }
        });

        return sanitized;
    }

    /**
     * Generate event ID
     */
    generateEventId() {
        return `sec-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Start security monitoring
     */
    startSecurityMonitoring() {
        // Clean up old events and activity data every hour
        setInterval(() => {
            this.cleanupSecurityData();
        }, 60 * 60 * 1000);

        // Generate security reports every 6 hours
        setInterval(() => {
            this.generateSecurityReport();
        }, 6 * 60 * 60 * 1000);
    }

    /**
     * Cleanup old security data
     */
    cleanupSecurityData() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        // Clean up security events
        this.securityEvents = this.securityEvents.filter(
            event => now - event.timestamp < maxAge
        );

        // Clean up suspicious activity data
        for (const [ip, activity] of this.suspiciousActivity.entries()) {
            if (now - activity.lastRequest > maxAge) {
                this.suspiciousActivity.delete(ip);
            }
        }

        console.log('Security data cleanup completed');
    }

    /**
     * Generate security report
     */
    generateSecurityReport() {
        const now = Date.now();
        const sixHoursAgo = now - (6 * 60 * 60 * 1000);

        const recentEvents = this.securityEvents.filter(
            event => event.timestamp >= sixHoursAgo
        );

        const report = {
            timestamp: now,
            timeRange: '6 hours',
            summary: {
                totalEvents: recentEvents.length,
                highSeverityEvents: recentEvents.filter(e => e.severity === 'high').length,
                blockedRequests: this.securityMetrics.blockedRequests,
                suspiciousActivity: this.securityMetrics.suspiciousRequests
            },
            eventBreakdown: {},
            topThreats: [],
            recommendations: []
        };

        // Event breakdown
        recentEvents.forEach(event => {
            report.eventBreakdown[event.type] = (report.eventBreakdown[event.type] || 0) + 1;
        });

        // Generate recommendations
        if (report.summary.highSeverityEvents > 10) {
            report.recommendations.push('Consider enabling stricter security policies');
        }

        if (this.securityMetrics.rateLimitViolations > 50) {
            report.recommendations.push('Review rate limiting configuration');
        }

        console.log('Security Report:', report);
        return report;
    }

    /**
     * Get security statistics
     */
    getSecurityStatistics() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        const recentEvents = this.securityEvents.filter(
            event => event.timestamp >= oneHourAgo
        );

        return {
            ...this.securityMetrics,
            recentEvents: recentEvents.length,
            blockedIPs: this.blockedIPs.size,
            suspiciousIPs: this.suspiciousActivity.size,
            policies: Object.fromEntries(this.securityPolicies),
            rateLimitStatus: instagramRateLimiter.exportState()
        };
    }

    /**
     * Block IP address
     */
    blockIP(ip, reason = 'manual') {
        this.blockedIPs.add(ip);
        this.recordSecurityEvent('ip-blocked', { ip, reason });
        console.log(`IP blocked: ${ip} (${reason})`);
    }

    /**
     * Unblock IP address
     */
    unblockIP(ip) {
        this.blockedIPs.delete(ip);
        this.recordSecurityEvent('ip-unblocked', { ip });
        console.log(`IP unblocked: ${ip}`);
    }

    /**
     * Export security configuration
     */
    exportSecurityConfig() {
        return {
            policies: Object.fromEntries(this.securityPolicies),
            blockedIPs: Array.from(this.blockedIPs),
            statistics: this.getSecurityStatistics(),
            timestamp: Date.now()
        };
    }

    /**
     * Import security configuration
     */
    importSecurityConfig(config) {
        if (config.policies) {
            Object.entries(config.policies).forEach(([name, policy]) => {
                this.addSecurityPolicy(name, policy);
            });
        }

        if (config.blockedIPs) {
            config.blockedIPs.forEach(ip => {
                this.blockedIPs.add(ip);
            });
        }
    }
}

// Create singleton instance
const instagramSecurityMiddleware = new InstagramSecurityMiddleware();

export default instagramSecurityMiddleware;