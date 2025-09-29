// WordPress Health Check API Endpoint
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
        // Simple health check response
        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            isHealthy: true,
            message: 'WordPress health check endpoint is working',
            endpoint: process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://cms.saraivavision.com.br/graphql'
        };

        return res.status(200).json(response);

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