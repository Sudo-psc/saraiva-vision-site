import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Request, Response } from 'express';

const router = express.Router();

// Enable CORS for image proxy
router.use(cors({
  origin: [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

/**
 * Proxy endpoint for Google Cloud Storage images
 * This bypasses CORS issues by serving images through our backend
 */
router.get('/proxy/:path(*)', async (req: Request, res: Response) => {
  try {
    const { path } = req.params;

    // Construct the full GCS URL
    const imageUrl = `https://storage.googleapis.com/${path}`;

    // Validate the path to prevent abuse
    if (!path.startsWith('hostinger-horizons-assets-prod/')) {
      return res.status(403).json({ error: 'Invalid path' });
    }

    // Fetch the image from GCS
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'SaraivaVision-ImageProxy/1.0'
      }
    });

    // Set appropriate headers
    const contentType = response.headers['content-type'] || 'image/png';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.set('Access-Control-Allow-Origin', '*');

    // Stream the image response
    response.data.pipe(res);

  } catch (error) {
    console.error('Image proxy error:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).send('Image not found');
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(408).send('Request timeout');
    }

    res.status(500).send('Failed to fetch image');
  }
});

/**
 * Health check endpoint for the image proxy
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'image-proxy',
    timestamp: new Date().toISOString()
  });
});

export default router;