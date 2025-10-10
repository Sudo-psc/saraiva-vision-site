import express from 'express';

const router = express.Router();

// Proxy endpoint for Google Analytics
router.post('/', (req, res) => {
  res.status(204).send(); // No content needed
});

router.get('/', (req, res) => {
  res.status(405).json({ error: 'Method not allowed' });
});

export default router;