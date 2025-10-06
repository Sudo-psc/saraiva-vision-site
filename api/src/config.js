/**
 * API Configuration Endpoint
 *
 * Serves environment configuration to frontend at runtime.
 * This prevents sensitive keys from being inlined into the JavaScript bundle.
 *
 * Security:
 * - Only serves non-sensitive public keys
 * - Never exposes service role keys or admin credentials
 * - Rate limited to prevent abuse
 */

import rateLimit from 'express-rate-limit';

// Rate limiter: 30 requests per 15 minutes per IP
export const configLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: 'Too many configuration requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /api/config
 * Returns public environment configuration
 */
export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  configLimiter(req, res, () => {
    try {
      // Return only public, non-sensitive configuration
      const config = {
        // Google Maps (public client-side key)
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY,
        googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY,
        googlePlaceId: process.env.GOOGLE_PLACE_ID || process.env.VITE_GOOGLE_PLACE_ID,
      };

      // Validate required fields
      if (!config.googleMapsApiKey) {
        return res.status(500).json({ error: 'Server configuration incomplete' });
      }

      // Set cache headers (5 minutes)
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.setHeader('Content-Type', 'application/json');

      return res.status(200).json(config);
    } catch (error) {
      console.error('Error serving configuration:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}