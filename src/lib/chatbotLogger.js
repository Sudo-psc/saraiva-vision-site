import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client (this would be imported in the API)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Anonymized conversation logging system for chatbot interactions
 * Complies with LGPD requirements by not storing personal information
 */

// Hash function for anonymizing IP addresses
export function hashIP(ip) {
    return crypto.createHash('sha256').update(ip + process.env.HASH_SALT || 'default_salt').digest('hex').substring(0, 16);
}

// Generate anonymized session ID
export function generateSessionId() {
    return 'session_' + crypto.randomBytes(8).toString('hex') + '_' + Date.now();
}

// Sanitize message content for logging (remove potential PII)
export function sanitizeMessageForLogging(message) {
    // Remove potential phone numbers
    let sanitized = message.replace(/\b\d{2}\s?\d{4,5}-?\d{4}\b/g, '[PHONE_REDACTED]');

    // Remove potential email addresses
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');

    // Remove potential CPF numbers
    sanitized = sanitized.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF_REDACTED]');

    // Remove potential names (basic pattern - words starting with capital letters)
    sanitized = sanitized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME_REDACTED]');

    return sanitized;
}

// Log conversation interaction
export async function logConversation(sessionId, userMessage, botResponse, metadata = {}) {
    try {
        const logEntry = {
            event_type: 'chatbot_interaction',
            event_data: {
                session_id: sessionId,
                user_message_length: userMessage.length,
                user_message_sanitized: sanitizeMessageForLogging(userMessage),
                bot_response_length: botResponse.length,
                interaction_timestamp: new Date().toISOString(),
                ...metadata
            },
            severity: 'info',
            source: 'chatbot_api',
            created_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('event_log')
            .insert(logEntry);

        if (error) {
            console.error('Failed to log conversation:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in logConversation:', error);
        return false;
    }
}

// Log chatbot errors
export async function logChatbotError(error, context = {}) {
    try {
        const logEntry = {
            event_type: 'chatbot_error',
            event_data: {
                error_message: error.message,
                error_stack: error.stack?.substring(0, 1000), // Limit stack trace length
                error_timestamp: new Date().toISOString(),
                ...context
            },
            severity: 'error',
            source: 'chatbot_api',
            created_at: new Date().toISOString()
        };

        const { error: logError } = await supabase
            .from('event_log')
            .insert(logEntry);

        if (logError) {
            console.error('Failed to log error:', logError);
            return false;
        }

        return true;
    } catch (logError) {
        console.error('Error in logChatbotError:', logError);
        return false;
    }
}

// Log session analytics
export async function logSessionAnalytics(sessionId, analytics) {
    try {
        const logEntry = {
            event_type: 'chatbot_session_analytics',
            event_data: {
                session_id: sessionId,
                session_duration: analytics.duration,
                message_count: analytics.messageCount,
                medical_keywords_count: analytics.medicalKeywordsCount,
                emergency_mentions: analytics.emergencyMentions,
                booking_suggestions: analytics.bookingSuggestions,
                user_satisfaction: analytics.userSatisfaction,
                session_end_timestamp: new Date().toISOString()
            },
            severity: 'info',
            source: 'chatbot_analytics',
            created_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('event_log')
            .insert(logEntry);

        if (error) {
            console.error('Failed to log session analytics:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in logSessionAnalytics:', error);
        return false;
    }
}

// Get chatbot analytics (for dashboard)
export async function getChatbotAnalytics(startDate, endDate) {
    try {
        const { data, error } = await supabase
            .from('event_log')
            .select('*')
            .eq('source', 'chatbot_api')
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to get chatbot analytics:', error);
            return null;
        }

        // Process analytics data
        const interactions = data.filter(log => log.event_type === 'chatbot_interaction');
        const errors = data.filter(log => log.event_type === 'chatbot_error');

        const analytics = {
            totalInteractions: interactions.length,
            totalErrors: errors.length,
            errorRate: interactions.length > 0 ? (errors.length / interactions.length) * 100 : 0,
            averageMessageLength: interactions.reduce((sum, log) =>
                sum + (log.event_data.user_message_length || 0), 0) / interactions.length || 0,
            medicalKeywordMentions: interactions.filter(log =>
                log.event_data.contains_medical_keywords).length,
            emergencyMentions: interactions.filter(log =>
                log.event_data.is_emergency).length,
            uniqueSessions: new Set(interactions.map(log =>
                log.event_data.session_id)).size,
            peakHours: getPeakHours(interactions),
            commonTopics: getCommonTopics(interactions)
        };

        return analytics;
    } catch (error) {
        console.error('Error in getChatbotAnalytics:', error);
        return null;
    }
}

// Helper function to get peak usage hours
function getPeakHours(interactions) {
    const hourCounts = {};

    interactions.forEach(log => {
        const hour = new Date(log.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }));
}

// Helper function to analyze common topics (basic keyword analysis)
function getCommonTopics(interactions) {
    const topicKeywords = {
        'Agendamento': ['agendar', 'consulta', 'horário', 'marcar', 'disponível'],
        'Cirurgia': ['cirurgia', 'operação', 'catarata', 'refrativa'],
        'Exames': ['exame', 'campo visual', 'retinografia', 'topografia'],
        'Sintomas': ['dor', 'vermelho', 'coceira', 'visão', 'embaçado'],
        'Lentes': ['lente', 'óculos', 'contato', 'grau'],
        'Informações': ['endereço', 'telefone', 'horário', 'convênio']
    };

    const topicCounts = {};

    interactions.forEach(log => {
        const message = log.event_data.user_message_sanitized?.toLowerCase() || '';

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => message.includes(keyword))) {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            }
        });
    });

    return Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));
}

// Rate limiting for logging (prevent log spam)
const logRateLimit = new Map();

export function checkLogRateLimit(identifier, maxLogs = 100, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!logRateLimit.has(identifier)) {
        logRateLimit.set(identifier, []);
    }

    const logs = logRateLimit.get(identifier);
    const validLogs = logs.filter(timestamp => timestamp > windowStart);
    logRateLimit.set(identifier, validLogs);

    if (validLogs.length >= maxLogs) {
        return false;
    }

    validLogs.push(now);
    logRateLimit.set(identifier, validLogs);
    return true;
}

export default {
    hashIP,
    generateSessionId,
    sanitizeMessageForLogging,
    logConversation,
    logChatbotError,
    logSessionAnalytics,
    getChatbotAnalytics,
    checkLogRateLimit
};