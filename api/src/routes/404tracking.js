import express from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rate limiting for 404 tracking
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: { error: 'Too many tracking requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/track-404:
 *   post:
 *     summary: Tracks a 404 error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               attemptedUrl:
 *                 type: string
 *               referrer:
 *                 type: string
 *               userAgent:
 *                 type: string
 *               sessionId:
 *                 type: string
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: The 404 error was tracked successfully.
 *       400:
 *         description: Bad request. Missing required fields.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Internal server error.
 */
router.post('/', trackingLimiter, async (req, res) => {
  try {
    const {
      timestamp,
      attemptedUrl,
      referrer,
      userAgent,
      sessionId,
      id
    } = req.body;

    // Validate required fields
    if (!attemptedUrl || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'URL e timestamp são obrigatórios'
      });
    }

    const error404Data = {
      id: id || Date.now().toString(),
      timestamp: timestamp,
      attemptedUrl: attemptedUrl,
      referrer: referrer || 'direct',
      userAgent: userAgent || 'unknown',
      sessionId: sessionId || 'unknown',
      ip: req.ip,
      country: req.headers['cf-country'] || 'unknown', // Cloudflare header
      city: req.headers['cf-city'] || 'unknown',
      processedAt: new Date().toISOString()
    };

    // Log the 404 error
    logger.warn('404 Error Tracked', {
      id: error404Data.id,
      url: error404Data.attemptedUrl,
      referrer: error404Data.referrer,
      ip: error404Data.ip,
      userAgent: error404Data.userAgent
    });

    // Store in memory (in production, use Redis or database)
    if (!global.error404Data) {
      global.error404Data = [];
    }

    global.error404Data.push(error404Data);

    // Keep only last 1000 errors
    if (global.error404Data.length > 1000) {
      global.error404Data = global.error404Data.slice(-1000);
    }

    // Simple analytics (optimized for performance)
    const total404s = global.error404Data.length;
    const today404s = global.error404Data.filter(error => {
      const errorDate = new Date(error.timestamp);
      const today = new Date();
      return errorDate.toDateString() === today.toDateString();
    }).length;

    // Only calculate detailed analytics periodically (not on every request)
    const analytics = {
      total404s: total404s,
      today404s: today404s,
      topUrls: [], // Omit detailed analytics for performance
      topReferrers: [] // Omit detailed analytics for performance
    };

    // Send silent success response
    res.status(200).json({
      success: true,
      analytics: analytics
    });

  } catch (error) {
    logger.error('Error tracking 404:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking 404'
    });
  }
});

/**
 * @swagger
 * /api/404-analytics:
 *   get:
 *     summary: Retrieves analytics for 404 errors. This is an admin-only endpoint.
 *     responses:
 *       200:
 *         description: The analytics were retrieved successfully.
 *       500:
 *         description: Internal server error.
 */
router.get('/analytics', async (req, res) => {
  try {
    // In production, add authentication check here
    if (!global.error404Data) {
      global.error404Data = [];
    }

    const analytics = {
      total404s: global.error404Data.length,
      today404s: global.error404Data.filter(error => {
        const errorDate = new Date(error.timestamp);
        const today = new Date();
        return errorDate.toDateString() === today.toDateString();
      }).length,
      weekly404s: global.error404Data.filter(error => {
        const errorDate = new Date(error.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return errorDate >= weekAgo;
      }).length,
      topUrls: getTopUrls(),
      topReferrers: getTopReferrers(),
      recentErrors: global.error404Data.slice(-10).reverse()
    };

    res.json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    logger.error('Error fetching 404 analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

/**
 * Gets the top 10 most frequent 404 URLs.
 * @returns {Array<object>} An array of objects, each with a `url` and `count` property.
 * @private
 */
function getTopUrls() {
  if (!global.error404Data) return [];

  const urlCounts = {};
  global.error404Data.forEach(error => {
    const url = error.attemptedUrl;
    urlCounts[url] = (urlCounts[url] || 0) + 1;
  });

  return Object.entries(urlCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([url, count]) => ({ url, count }));
}

/**
 * Gets the top 10 most frequent referrers for 404 errors.
 * @returns {Array<object>} An array of objects, each with a `referrer` and `count` property.
 * @private
 */
function getTopReferrers() {
  if (!global.error404Data) return [];

  const referrerCounts = {};
  global.error404Data.forEach(error => {
    const referrer = error.referrer;
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
  });

  return Object.entries(referrerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([referrer, count]) => ({ referrer, count }));
}

export default router;