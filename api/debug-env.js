/**
 * Debug endpoint to check environment variables
 * TEMPORARY - Remove after debugging
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const envCheck = {
        hasXaiApiKey: !!process.env.XAI_API_KEY,
        xaiApiKeyLength: process.env.XAI_API_KEY ? process.env.XAI_API_KEY.length : 0,
        xaiApiKeyPrefix: process.env.XAI_API_KEY ? process.env.XAI_API_KEY.substring(0, 10) + '...' : 'Not found',
        xaiModel: process.env.XAI_MODEL || 'Not found',
        xaiMaxTokens: process.env.XAI_MAX_TOKENS || 'Not found',
        xaiTemperature: process.env.XAI_TEMPERATURE || 'Not found',
        vercelEnv: process.env.VERCEL_ENV || 'Not found',
        nodeEnv: process.env.NODE_ENV || 'Not found'
    };

    return res.status(200).json(envCheck);
}