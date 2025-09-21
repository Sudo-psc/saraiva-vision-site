/**
 * Handles health check requests.
 * This endpoint can be used by monitoring services to verify that the API is running.
 * It returns a JSON response with the current status, timestamp, and environment details.
 *
 * @param {import('http').IncomingMessage} req The incoming request object.
 * @param {import('http').ServerResponse} res The server response object.
 */
export default function handler(req, res) {
  // Log request for monitoring
  console.log(`Health check from ${req.headers['x-forwarded-for'] || 'unknown'}`);

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'saraiva-vision-api',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'local'
  });
}