/**
 * Handles basic API ping requests.
 * This is a lightweight endpoint to check for basic API availability and get
 * some simple diagnostic information like the Node.js version and region.
 *
 * @param {import('http').IncomingMessage} req The incoming request object.
 * @param {import('http').ServerResponse} res The server response object.
 */
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