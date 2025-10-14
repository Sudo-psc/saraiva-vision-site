/**
 * Comprehensive Logging and Monitoring System
 * Implements structured logging with console fallback
 * Includes PII sanitization and performance monitoring
 * NOTE: Supabase integration removed - console-only logging
 */

/**
 * Get appropriate logging client
 * Returns null to trigger console fallback (Supabase removed)
 */
function getLoggingClient() {
    // Supabase removed - always use console fallback
    return null;
}

// Log levels with numeric values for filtering
export const LOG_LEVELS = {
    DEBUG: { name: 'debug', value: 0 },
    INFO: { name: 'info', value: 1 },
    WARN: { name: 'warn', value: 2 },
    ERROR: { name: 'error', value: 3 },
    CRITICAL: { name: 'critical', value: 4 }
};

// PII patterns for sanitization
const PII_PATTERNS = [
    // Email addresses
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL]' },
    // Phone numbers (Brazilian format)
    { pattern: /\b(?:\+55\s?)?(?:\(?[1-9]{2}\)?\s?)?(?:9\s?)?[0-9]{4}[-\s]?[0-9]{4}\b/g, replacement: '[PHONE]' },
    // CPF (Brazilian tax ID)
    { pattern: /\b\d{3}\.?\d{3}\.?\d{3}[-\.]?\d{2}\b/g, replacement: '[CPF]' },
    // Credit card numbers
    { pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: '[CARD]' },
    // IP addresses (partial masking)
    { pattern: /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, replacement: '$1.$2.xxx.xxx' }
];

/**
 * Sanitize log data to remove PII
 */
function sanitizeData(data) {
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }

    let sanitized = data;
    PII_PATTERNS.forEach(({ pattern, replacement }) => {
        sanitized = sanitized.replace(pattern, replacement);
    });

    return sanitized;
}

/**
 * Generate unique request ID for tracing
 */
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Core Logger Class
 */
class Logger {
    constructor(service = 'unknown', requestId = null) {
        this.service = service;
        this.requestId = requestId || generateRequestId();
        this.startTime = Date.now();
    }

    /**
     * Create structured log entry
     */
    createLogEntry(level, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const sanitizedMessage = sanitizeData(message);
        const sanitizedMetadata = this.sanitizeMetadata(metadata);

        return {
            timestamp,
            level: level.name,
            message: sanitizedMessage,
            service: this.service,
            request_id: this.requestId,
            metadata: sanitizedMetadata,
            environment: process.env.NODE_ENV || 'development'
        };
    }

    /**
     * Sanitize metadata object recursively
     */
    sanitizeMetadata(metadata) {
        if (!metadata || typeof metadata !== 'object') {
            return metadata;
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(metadata)) {
            if (typeof value === 'string') {
                sanitized[key] = sanitizeData(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeMetadata(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    /**
     * Store log entry in database with robust fallback
     */
    async storeLog(logEntry) {
        try {
            const client = getLoggingClient();

            if (!client) {
                // Fallback: Supabase not configured - log to console only
                if (import.meta?.env?.DEV) {
                    console.log('[LOG_FALLBACK - No Supabase]:', JSON.stringify(logEntry, null, 2));
                }
                return;
            }

            const { error } = await client
                .from('event_log')
                .insert({
                    event_type: 'application_log',
                    event_data: logEntry,
                    severity: logEntry.level,
                    source: logEntry.service,
                    request_id: logEntry.request_id,
                    created_at: logEntry.timestamp
                });

            if (error) {
                // Handle specific error cases
                if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
                    // Authentication error - likely invalid key
                    if (import.meta?.env?.DEV) {
                        console.warn('[LOG_FALLBACK - Auth Error]:', error.message);
                    }
                } else if (error.code === '42P01') {
                    // Table doesn't exist
                    if (import.meta?.env?.DEV) {
                        console.warn('[LOG_FALLBACK - Table Missing]:', 'event_log table not found');
                    }
                } else {
                    console.error('Failed to store log in database:', error);
                }

                // Always fallback to console on error
                console.log('[LOG_FALLBACK]:', JSON.stringify(logEntry, null, 2));
            }
        } catch (err) {
            // Catch-all for unexpected errors
            if (import.meta?.env?.DEV) {
                console.error('Unexpected database logging error:', err);
            }
            console.log('[LOG_FALLBACK]:', JSON.stringify(logEntry, null, 2));
        }
    }

    /**
     * Log debug message
     */
    async debug(message, metadata = {}) {
        const logEntry = this.createLogEntry(LOG_LEVELS.DEBUG, message, metadata);
        if (process.env.NODE_ENV === 'development') {
            console.debug('DEBUG:', logEntry);
        }
        await this.storeLog(logEntry);
    }

    /**
     * Log info message
     */
    async info(message, metadata = {}) {
        const logEntry = this.createLogEntry(LOG_LEVELS.INFO, message, metadata);
        console.info('INFO:', logEntry);
        await this.storeLog(logEntry);
    }

    /**
     * Log warning message
     */
    async warn(message, metadata = {}) {
        const logEntry = this.createLogEntry(LOG_LEVELS.WARN, message, metadata);
        console.warn('WARN:', logEntry);
        await this.storeLog(logEntry);
    }

    /**
     * Log error message
     */
    async error(message, metadata = {}) {
        const logEntry = this.createLogEntry(LOG_LEVELS.ERROR, message, metadata);
        console.error('ERROR:', logEntry);
        await this.storeLog(logEntry);
    }

    /**
     * Log critical error message
     */
    async critical(message, metadata = {}) {
        const logEntry = this.createLogEntry(LOG_LEVELS.CRITICAL, message, metadata);
        console.error('CRITICAL:', logEntry);
        await this.storeLog(logEntry);

        // Send alert for critical errors
        await this.sendAlert(logEntry);
    }

    /**
     * Send alert for critical issues with fallback
     */
    async sendAlert(logEntry) {
        try {
            const client = getLoggingClient();

            if (!client) {
                // Fallback: log critical alert to console
                console.error('[CRITICAL ALERT - No Supabase]:', {
                    service: logEntry.service,
                    message: logEntry.message,
                    request_id: logEntry.request_id,
                    timestamp: logEntry.timestamp
                });
                return;
            }

            // Store alert in outbox for reliable delivery
            const { error } = await client
                .from('message_outbox')
                .insert({
                    message_type: 'email',
                    recipient: process.env.ADMIN_EMAIL || 'admin@saraivavision.com.br',
                    subject: `CRITICAL ALERT: ${logEntry.service}`,
                    content: `Critical error occurred in ${logEntry.service}:\n\n${logEntry.message}\n\nRequest ID: ${logEntry.request_id}\nTimestamp: ${logEntry.timestamp}`,
                    template_data: { logEntry },
                    status: 'pending'
                });

            if (error) {
                console.error('[CRITICAL ALERT - DB Error]:', error.message);
                // Still log to console as fallback
                console.error('[CRITICAL ALERT]:', {
                    service: logEntry.service,
                    message: logEntry.message,
                    request_id: logEntry.request_id,
                    timestamp: logEntry.timestamp
                });
            }
        } catch (err) {
            console.error('Failed to send critical alert:', err);
            // Final fallback to console
            console.error('[CRITICAL ALERT - Exception]:', {
                service: logEntry.service,
                message: logEntry.message,
                request_id: logEntry.request_id,
                timestamp: logEntry.timestamp
            });
        }
    }

    /**
     * Log performance metrics
     */
    async logPerformance(operation, duration, metadata = {}) {
        await this.info(`Performance: ${operation}`, {
            ...metadata,
            duration_ms: duration,
            operation_type: 'performance'
        });
    }

    /**
     * Log API request/response
     */
    async logApiCall(method, url, statusCode, duration, metadata = {}) {
        const level = statusCode >= 500 ? LOG_LEVELS.ERROR :
            statusCode >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;

        const logEntry = this.createLogEntry(level, `API ${method} ${url}`, {
            ...metadata,
            http_method: method,
            url: sanitizeData(url),
            status_code: statusCode,
            duration_ms: duration,
            operation_type: 'api_call'
        });

        if (level === LOG_LEVELS.ERROR) {
            console.error('API_ERROR:', logEntry);
        } else {
            console.log('API_CALL:', logEntry);
        }

        await this.storeLog(logEntry);
    }

    /**
     * Create child logger with same request ID
     */
    child(service) {
        return new Logger(service, this.requestId);
    }

    /**
     * Get elapsed time since logger creation
     */
    getElapsedTime() {
        return Date.now() - this.startTime;
    }
}

/**
 * Create logger instance
 */
export function createLogger(service = 'app', requestId = null) {
    return new Logger(service, requestId);
}

/**
 * Express middleware for request logging
 */
export function requestLoggingMiddleware(req, res, next) {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const logger = createLogger('api', requestId);

    // Attach logger to request
    req.logger = logger;
    req.requestId = requestId;

    // Log request start
    logger.info('Request started', {
        method: req.method,
        url: sanitizeData(req.url),
        user_agent: req.get('User-Agent'),
        ip: req.ip
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - startTime;
        logger.logApiCall(req.method, req.url, res.statusCode, duration, {
            response_size: res.get('Content-Length') || 0
        });
        originalEnd.apply(this, args);
    };

    next();
}

/**
 * Error tracking middleware
 */
export function errorTrackingMiddleware(err, req, res, next) {
    const logger = req.logger || createLogger('error');

    logger.error('Unhandled error', {
        error_message: err.message,
        error_stack: err.stack,
        url: req.url,
        method: req.method,
        operation_type: 'error'
    });

    next(err);
}

export default Logger;
