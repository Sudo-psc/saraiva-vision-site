// WordPress Health Check API Endpoint
import { checkWordPressHealthWithCache, getWordPressHealthState, getWordPressHealthStats } from './src/lib/wordpress-health.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { force = 'false', detailed = 'false' } = req.query;
        const forceCheck = force === 'true';
        const includeDetails = detailed === 'true';

        // Perform health check
        const healthResult = await checkWordPressHealthWithCache(forceCheck);
        const healthState = getWordPressHealthState();
        const healthStats = getWordPressHealthStats();

        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            isHealthy: healthResult.isHealthy,
            responseTime: healthResult.responseTime,
            endpoint: healthResult.endpoint,
            healthState: includeDetails ? healthState : undefined,
            stats: includeDetails ? healthStats : undefined,
            error: healthResult.error,
        };

        // Set appropriate HTTP status based on health
        const statusCode = healthResult.isHealthy ? 200 : 503;

        return res.status(statusCode).json(response);

    } catch (error) {
        console.error('WordPress health check API error:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}