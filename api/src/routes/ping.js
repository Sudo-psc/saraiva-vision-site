export default function handler(req, res) {
    return res.status(200).json({
        status: 'ok',
        message: 'API funcionando',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        region: process.env.VERCEL_REGION || 'unknown',
        env: process.env.NODE_ENV || 'development'
    });
}