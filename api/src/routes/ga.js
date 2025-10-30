import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/ga:
 *   post:
 *     summary: Proxies requests to Google Analytics.
 *     responses:
 *       204:
 *         description: The request was successfully proxied.
 */
router.post('/', (req, res) => {
  res.status(204).send(); // No content needed
});

/**
 * @swagger
 * /api/ga:
 *   get:
 *     summary: Method not allowed.
 *     responses:
 *       405:
 *         description: Method not allowed.
 */
router.get('/', (req, res) => {
  res.status(405).json({ error: 'Method not allowed' });
});

export default router;