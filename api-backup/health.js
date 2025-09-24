/**
 * Chatbot Health Check API Endpoint
 * Provides system health and configuration status
 */

import geminiService from '../../src/services/geminiService.js';
import chatbotConfig from '../../src/config/chatbotConfig.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for health checks
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Check database connectivity
 */
async function checkDatabaseHealth() {
    try {
        const { data, error } = await supabase
            .from('chatbot_conversations')
            .select('count')
            .limit(1);

        return {
            status: 'healthy',
            connected: true,
            error: null
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            connected: false,
            error: error.message
        };
    }
}

/**
 * Check Gemini API connectivity
 */
async function checkGeminiHealth() {
    try {
        const validation = await geminiService.validateConfiguration();
        return {
            status: validation.valid ? 'healthy' : 'unhealthy',
            configured: validation.valid,
            error: validation.valid ? null : validation.message
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            configured: false,
            error: error.message
        };
    }
}

/**
 * Get system metrics
 */
function getSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
        memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        uptime: {
            seconds: Math.round(uptime),
            formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Main health check handler
 */
export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: 'Only GET requests are supported'
        });
    }

    try {
        const startTime = Date.now();

        // Run health checks in parallel
        const [databaseHealth, geminiHealth] = await Promise.all([
            checkDatabaseHealth(),
            checkGeminiHealth()
        ]);

        const configHealth = chatbotConfig.getHealthInfo();
        const geminiServiceHealth = geminiService.getHealthStatus();
        const systemMetrics = getSystemMetrics();

        const healthCheckTime = Date.now() - startTime;

        // Determine overall health status
        const isHealthy =
            databaseHealth.status === 'healthy' &&
            geminiHealth.status === 'healthy' &&
            configHealth.configurationValid;

        const response = {
            success: true,
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            healthCheckDuration: `${healthCheckTime}ms`,
            services: {
                database: databaseHealth,
                geminiApi: geminiHealth,
                geminiService: geminiServiceHealth,
                configuration: configHealth
            },
            system: systemMetrics,
            features: {
                appointmentBooking: chatbotConfig.isFeatureEnabled('enableAppointmentBooking'),
                referralManagement: chatbotConfig.isFeatureEnabled('enableReferralManagement'),
                websocketSupport: chatbotConfig.isFeatureEnabled('enableWebSocketSupport'),
                caching: chatbotConfig.isFeatureEnabled('enableCaching'),
                analytics: chatbotConfig.isFeatureEnabled('enableAnalytics')
            },
            compliance: {
                cfmCompliance: chatbotConfig.get('medical').enableCFMCompliance,
                lgpdCompliance: chatbotConfig.get('privacy').enableLGPDCompliance,
                auditLogging: chatbotConfig.get('privacy').enableAuditLogging,
                dataEncryption: chatbotConfig.get('privacy').enableDataEncryption
            }
        };

        // Set appropriate HTTP status code
        const statusCode = isHealthy ? 200 : 503;

        return res.status(statusCode).json(response);

    } catch (error) {
        console.error('Health check error:', error);

        return res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: 'Health check failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}