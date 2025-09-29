import express from 'express';
import WordPressJWTClient from '../wordpress-jwt-client.js';
import winston from 'winston';

const router = express.Router();

// Initialize JWT client
const wpClient = new WordPressJWTClient();

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// Middleware to ensure JWT authentication
const ensureAuthenticated = async (_req, res, next) => {
  try {
    await wpClient.ensureValidToken();
    next();
  } catch (error) {
    logger.error('WordPress authentication failed:', error.message);
    res.status(500).json({
      error: 'WordPress authentication failed',
      message: error.message
    });
  }
};

// Get WordPress posts (requires authentication for admin access)
router.get('/posts', ensureAuthenticated, async (req, res) => {
  try {
    const { page = 1, per_page = 10 } = req.query;
    const posts = await wpClient.get(`/wp/v2/posts?page=${page}&per_page=${per_page}&_embed`);

    res.json({
      success: true,
      data: posts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching WordPress posts:', error.message);
    res.status(500).json({
      error: 'Failed to fetch posts',
      message: error.message
    });
  }
});

// Create a new WordPress post
router.post('/posts', ensureAuthenticated, async (req, res) => {
  try {
    const { title, content, status = 'draft' } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title and content are required'
      });
    }

    const postData = {
      title,
      content,
      status,
      author: 1 // Assuming admin user ID
    };

    const newPost = await wpClient.post('/wp/v2/posts', postData);

    res.status(201).json({
      success: true,
      data: newPost,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating WordPress post:', error.message);
    res.status(500).json({
      error: 'Failed to create post',
      message: error.message
    });
  }
});

// Update a WordPress post
router.put('/posts/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;

    const updatedPost = await wpClient.put(`/wp/v2/posts/${id}`, updateData);

    res.json({
      success: true,
      data: updatedPost,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating WordPress post:', error.message);
    res.status(500).json({
      error: 'Failed to update post',
      message: error.message
    });
  }
});

// Delete a WordPress post
router.delete('/posts/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    await wpClient.delete(`/wp/v2/posts/${id}`);

    res.json({
      success: true,
      message: 'Post deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting WordPress post:', error.message);
    res.status(500).json({
      error: 'Failed to delete post',
      message: error.message
    });
  }
});

// Get WordPress users (admin only)
router.get('/users', ensureAuthenticated, async (req, res) => {
  try {
    const users = await wpClient.get('/wp/v2/users');

    res.json({
      success: true,
      data: users,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching WordPress users:', error.message);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Health check for WordPress JWT connection
router.get('/health', async (req, res) => {
  try {
    const isValid = await wpClient.validateToken();

    res.json({
      success: true,
      wordpress: {
        jwt_authenticated: isValid,
        base_url: 'https://cms.saraivavision.com.br'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('WordPress health check failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;