/**
 * Event Logger
 * Centralized logging system for application events
 * Requirement 9.1: Structured logging with appropriate detail levels
 */

import { supabaseAdmin } from './supabase.ts'

/**
 * Log an event to the database
 * @param {Object} eventData - Event data to log
 * @returns {Promise<string>} Event ID
 */
export async function logEvent(eventData) {
    const {
        eventType,
        severity = 'info',
        source = 'unknown',
        requestId = null,
        userId = null,
        eventData: data = null
    } = eventData

    try {
        const { data: result, error } = await supabaseAdmin.rpc('log_event', {
            p_event_type: eventType,
            p_event_data: data,
            p_severity: severity,
            p_source: source,
            p_request_id: requestId,
            p_user_id: userId
        })

        if (error) {
            console.error('Error logging event:', error)
            return null
        }

        return result
    } catch (error) {
        console.error('Error in logEvent:', error)
        return null
    }
}

/**
 * Log API request
 * @param {Object} req - Express request object
 * @param {string} endpoint - API endpoint name
 * @param {string} requestId - Request ID
 */
export async function logAPIRequest(req, endpoint, requestId) {
    await logEvent({
        eventType: 'api_request',
        severity: 'info',
        source: endpoint,
        requestId,
        eventData: {
            method: req.method,
            url: req.url,
            user_agent: req.headers['user-agent'],
            ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
        }
    })
}

/**
 * Log API response
 * @param {number} statusCode - HTTP status code
 * @param {string} endpoint - API endpoint name
 * @param {string} requestId - Request ID
 * @param {number} duration - Request duration in milliseconds
 */
export async function logAPIResponse(statusCode, endpoint, requestId, duration) {
    await logEvent({
        eventType: 'api_response',
        severity: statusCode >= 400 ? 'warn' : 'info',
        source: endpoint,
        requestId,
        eventData: {
            status_code: statusCode,
            duration_ms: duration
        }
    })
}

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {string} source - Source of the error
 * @param {string} requestId - Request ID
 * @param {Object} context - Additional context
 */
export async function logError(error, source, requestId, context = {}) {
    await logEvent({
        eventType: 'error',
        severity: 'error',
        source,
        requestId,
        eventData: {
            error_message: error.message,
            error_stack: error.stack,
            ...context
        }
    })
}

/**
 * Log security event
 * @param {string} eventType - Type of security event
 * @param {string} source - Source of the event
 * @param {string} requestId - Request ID
 * @param {Object} details - Event details
 */
export async function logSecurityEvent(eventType, source, requestId, details = {}) {
    await logEvent({
        eventType: `security_${eventType}`,
        severity: 'warn',
        source,
        requestId,
        eventData: details
    })
}

/**
 * Log performance metric
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {string} source - Source of the metric
 * @param {string} requestId - Request ID
 */
export async function logPerformanceMetric(metric, value, source, requestId) {
    await logEvent({
        eventType: 'performance_metric',
        severity: 'info',
        source,
        requestId,
        eventData: {
            metric_name: metric,
            metric_value: value,
            timestamp: new Date().toISOString()
        }
    })
}

/**
 * Log user action
 * @param {string} action - User action
 * @param {string} userId - User ID
 * @param {string} source - Source of the action
 * @param {string} requestId - Request ID
 * @param {Object} details - Action details
 */
export async function logUserAction(action, userId, source, requestId, details = {}) {
    await logEvent({
        eventType: `user_${action}`,
        severity: 'info',
        source,
        requestId,
        userId,
        eventData: details
    })
}

/**
 * Log business event
 * @param {string} eventType - Business event type
 * @param {string} source - Source of the event
 * @param {string} requestId - Request ID
 * @param {Object} data - Event data
 */
export async function logBusinessEvent(eventType, source, requestId, data = {}) {
    await logEvent({
        eventType: `business_${eventType}`,
        severity: 'info',
        source,
        requestId,
        eventData: data
    })
}

/**
 * Create a logger instance for a specific source
 * @param {string} source - Source identifier
 * @returns {Object} Logger instance with methods
 */
export function createLogger(source) {
    return {
        info: (eventType, requestId, data) => logEvent({
            eventType,
            severity: 'info',
            source,
            requestId,
            eventData: data
        }),

        warn: (eventType, requestId, data) => logEvent({
            eventType,
            severity: 'warn',
            source,
            requestId,
            eventData: data
        }),

        error: (eventType, requestId, data) => logEvent({
            eventType,
            severity: 'error',
            source,
            requestId,
            eventData: data
        }),

        debug: (eventType, requestId, data) => logEvent({
            eventType,
            severity: 'debug',
            source,
            requestId,
            eventData: data
        })
    }
}