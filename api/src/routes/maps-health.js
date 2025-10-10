/**
 * Google Maps Health Check Endpoint
 * Returns status of Google Maps API configuration
 */
import express from 'express';

const router = express.Router();

/**
 * GET /api/maps-health
 * Health check for Google Maps API
 */
router.get('/', (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

    res.status(200).json({
      status: 'healthy',
      service: 'google-maps',
      timestamp: new Date().toISOString(),
      libraries: ['places', 'geometry'],
      apiKey: apiKey ? 'configured' : 'missing',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'google-maps',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
