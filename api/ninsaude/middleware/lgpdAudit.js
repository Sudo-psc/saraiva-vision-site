/**
 * Ninsaúde LGPD Audit Logging Middleware
 * Logs all Ninsaúde API calls with SHA-256 hashed identifiers for compliance
 * Requirements: T033, LGPD compliance, CFM medical data handling, 5-year retention
 */

import crypto from 'crypto';

/**
 * LGPD audit configuration
 */
const AUDIT_CONFIG = {
    redisKeyPrefix: 'ninsaude:audit',
    retentionYears: 5,
    retentionSeconds: 5 * 365 * 24 * 60 * 60, // 5 years in seconds
    sensitiveFields: ['cpf', 'rg', 'email', 'phone', 'telefone', 'password', 'senha'],
    piiPatterns: {
        cpf: /\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11}/,
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
        phone: /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/
    }
};

/**
 * Hash sensitive data using SHA-256
 * @param {string} data - Data to hash
 * @returns {string} SHA-256 hash
 */
function hashData(data) {
    if (!data) return 'unknown';

    const salt = process.env.AUDIT_HASH_SALT;
    if (!salt) {
        throw new Error('Missing required environment variable: AUDIT_HASH_SALT. This must be set for LGPD compliance.');
    }
    return crypto.createHash('sha256').update(String(data) + salt).digest('hex');
}

/**
 * Extract client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    const vercelForwardedFor = req.headers['x-vercel-forwarded-for'];

    if (vercelForwardedFor) {
        return vercelForwardedFor.split(',')[0].trim();
    }

    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    return req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        'unknown';
}

/**
 * Extract CPF from request body or params (if present)
 * @param {Object} req - Express request object
 * @returns {string|null} CPF if found, null otherwise
 */
function extractCPF(req) {
    // Check body
    if (req.body?.cpf) {
        return req.body.cpf;
    }

    // Check query params
    if (req.query?.cpf) {
        return req.query.cpf;
    }

    // Check URL params
    if (req.params?.cpf) {
        return req.params.cpf;
    }

    // Check for CPF pattern in body (if it's a patient registration)
    if (req.body?.patient?.cpf) {
        return req.body.patient.cpf;
    }

    return null;
}

/**
 * Determine action type from request
 * @param {Object} req - Express request object
 * @returns {string} Action description
 */
function determineAction(req) {
    const method = req.method;
    const path = req.path;

    // Map common patterns to actions
    if (path.includes('/patients') && method === 'POST') {
        return 'patient_registration';
    }

    if (path.includes('/patients') && method === 'GET') {
        return 'patient_lookup';
    }

    if (path.includes('/patients') && method === 'PUT') {
        return 'patient_update';
    }

    if (path.includes('/appointments') && method === 'POST') {
        return 'appointment_booking';
    }

    if (path.includes('/appointments') && method === 'DELETE') {
        return 'appointment_cancellation';
    }

    if (path.includes('/appointments') && method === 'PUT') {
        return 'appointment_reschedule';
    }

    if (path.includes('/availability')) {
        return 'availability_lookup';
    }

    if (path.includes('/notifications')) {
        return 'notification_dispatch';
    }

    // Generic fallback
    return `${method.toLowerCase()}_${path.split('/').pop() || 'request'}`;
}

/**
 * Detect PII in request body
 * @param {Object} body - Request body
 * @returns {Array} Array of detected PII field names
 */
function detectPII(body) {
    const detected = [];

    if (!body || typeof body !== 'object') {
        return detected;
    }

    // Check for sensitive field names
    Object.keys(body).forEach(key => {
        if (AUDIT_CONFIG.sensitiveFields.includes(key.toLowerCase())) {
            detected.push(key);
        }
    });

    // Check for PII patterns in values
    const bodyString = JSON.stringify(body);
    Object.entries(AUDIT_CONFIG.piiPatterns).forEach(([type, pattern]) => {
        if (pattern.test(bodyString)) {
            if (!detected.includes(type)) {
                detected.push(type);
            }
        }
    });

    return detected;
}

/**
 * Create audit log entry
 * @param {Object} req - Express request object
 * @param {Object} options - Additional options
 * @returns {Object} Audit log entry
 */
function createAuditEntry(req, options = {}) {
    const timestamp = new Date().toISOString();
    const clientIP = getClientIP(req);
    const cpf = extractCPF(req);
    const action = determineAction(req);
    const requestId = req.security?.requestId || crypto.randomUUID();

    // Detect PII in request
    const piiDetected = detectPII(req.body);

    const auditEntry = {
        timestamp,
        requestId,
        endpoint: req.path,
        method: req.method,
        action,
        ipHash: hashData(clientIP),
        cpfHash: cpf ? hashData(cpf) : null,
        userAgent: req.headers['user-agent']?.substring(0, 200) || 'unknown',
        statusCode: options.statusCode || null,
        responseTime: options.responseTime || null,
        piiDetected: piiDetected.length > 0 ? piiDetected : null,
        errorCode: options.errorCode || null,
        // CFM compliance: log if medical data was accessed
        medicalDataAccessed: action.includes('patient') || action.includes('appointment'),
        // LGPD compliance marker
        lgpdCompliant: true
    };

    return auditEntry;
}

/**
 * Store audit log in Redis with 5-year retention
 * @param {Object} redisClient - Redis client instance
 * @param {Object} auditEntry - Audit log entry
 */
async function storeAuditLog(redisClient, auditEntry) {
    try {
        // Create unique key for this audit entry
        const auditKey = `${AUDIT_CONFIG.redisKeyPrefix}:${auditEntry.timestamp}:${auditEntry.requestId}`;

        // Store audit entry with 5-year TTL
        await redisClient.setex(
            auditKey,
            AUDIT_CONFIG.retentionSeconds,
            JSON.stringify(auditEntry)
        );

        // Also add to sorted set for time-based queries (optional, for analytics)
        const indexKey = `${AUDIT_CONFIG.redisKeyPrefix}:index`;
        const score = new Date(auditEntry.timestamp).getTime();
        await redisClient.zadd(indexKey, score, auditKey);

        // Set expiry on index as well
        await redisClient.expire(indexKey, AUDIT_CONFIG.retentionSeconds);
    } catch (error) {
        console.error('Audit log storage error:', error);
        // Don't throw - logging failure shouldn't break the request
    }
}

/**
 * LGPD audit logging middleware
 * @param {Object} redisClient - Redis client instance (injected by app setup)
 * @returns {Function} Express middleware function
 */
export function lgpdAudit(redisClient) {
    return async (req, res, next) => {
        const startTime = Date.now();

        // Capture the original end function
        const originalEnd = res.end;
        let responseLogged = false;

        // Override res.end to capture response data
        res.end = function (...args) {
            if (!responseLogged) {
                responseLogged = true;

                // Calculate response time
                const responseTime = Date.now() - startTime;

                // Create audit entry
                const auditEntry = createAuditEntry(req, {
                    statusCode: res.statusCode,
                    responseTime,
                    errorCode: res.locals?.errorCode || null
                });

                // Store audit log asynchronously (don't block response)
                storeAuditLog(redisClient, auditEntry).catch(error => {
                    console.error('Failed to store audit log:', error);
                });

                // Log to console for development (can be disabled in production)
                if (process.env.NODE_ENV !== 'production') {
                    console.log('[LGPD Audit]', {
                        action: auditEntry.action,
                        endpoint: auditEntry.endpoint,
                        status: auditEntry.statusCode,
                        time: `${auditEntry.responseTime}ms`,
                        pii: auditEntry.piiDetected ? 'detected' : 'none'
                    });
                }
            }

            // Call original end function
            return originalEnd.apply(res, args);
        };

        next();
    };
}

/**
 * Query audit logs by date range
 * @param {Object} redisClient - Redis client instance
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Array of audit log entries
 */
export async function queryAuditLogs(redisClient, startDate, endDate, limit = 100) {
    try {
        const indexKey = `${AUDIT_CONFIG.redisKeyPrefix}:index`;
        const startScore = startDate.getTime();
        const endScore = endDate.getTime();

        // Get audit keys in time range
        const auditKeys = await redisClient.zrangebyscore(
            indexKey,
            startScore,
            endScore,
            'LIMIT',
            0,
            limit
        );

        // Retrieve audit entries
        const auditEntries = [];
        for (const key of auditKeys) {
            const entry = await redisClient.get(key);
            if (entry) {
                auditEntries.push(JSON.parse(entry));
            }
        }

        return auditEntries;
    } catch (error) {
        console.error('Audit log query error:', error);
        return [];
    }
}

/**
 * Get audit statistics for compliance reporting
 * @param {Object} redisClient - Redis client instance
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Audit statistics
 */
export async function getAuditStats(redisClient, startDate, endDate) {
    try {
        const batchSize = 100;
        const stats = {
            totalRequests: 0,
            byAction: {},
            byEndpoint: {},
            medicalDataAccesses: 0,
            piiDetections: 0,
            averageResponseTime: 0,
            errorCount: 0
        };

        let totalResponseTime = 0;
        let totalProcessedCount = 0;
        let cursor = '0';

        do {
            // Process logs in batches using streaming/pagination
            const logs = await queryAuditLogs(redisClient, startDate, endDate, batchSize, cursor);
            
            if (!logs || logs.length === 0) break;

            logs.forEach(log => {
                totalProcessedCount++;
                
                // Count by action
                stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

                // Count by endpoint
                stats.byEndpoint[log.endpoint] = (stats.byEndpoint[log.endpoint] || 0) + 1;

                // Medical data accesses
                if (log.medicalDataAccessed) {
                    stats.medicalDataAccesses++;
                }

                // PII detections
                if (log.piiDetected && log.piiDetected.length > 0) {
                    stats.piiDetections++;
                }

                // Response time
                if (log.responseTime) {
                    totalResponseTime += log.responseTime;
                }

                // Errors
                if (log.statusCode >= 400) {
                    stats.errorCount++;
                }
            });

            // Update cursor for pagination (implementation depends on queryAuditLogs)
            cursor = logs.length < batchSize ? '0' : String(logs[logs.length - 1].timestamp);
            
        } while (cursor !== '0');

        stats.totalRequests = totalProcessedCount;
        stats.averageResponseTime = totalProcessedCount > 0 ? Math.round(totalResponseTime / totalProcessedCount) : 0;

        return stats;
    } catch (error) {
        console.error('Audit stats error:', error);
        return null;
    }
}

export default lgpdAudit;
