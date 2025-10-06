import express from 'express';
import rateLimit from 'express-rate-limit';
import { validateEmail } from '../utils/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Rate limiting for bug reports
const bugReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reports per hour per IP
  message: {
    error: 'Muitos reports enviados. Por favor, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validate bug report data
const validateBugReport = (data) => {
  const errors = [];

  if (!data.problemType || !data.problemType.trim()) {
    errors.push('Tipo de problema é obrigatório');
  }

  if (!data.description || data.description.length < 10) {
    errors.push('Descrição deve ter pelo menos 10 caracteres');
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push('Email inválido');
  }

  // Sanitize input
  const sanitize = (str) => {
    if (!str) return '';
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      email: sanitize(data.email),
      problemType: sanitize(data.problemType),
      description: sanitize(data.description),
      attemptedUrl: sanitize(data.attemptedUrl),
      timestamp: data.timestamp,
      userAgent: sanitize(data.userAgent),
      screenshot: data.screenshot ? sanitize(data.screenshot) : null,
    }
  };
};

// POST /api/bug-report
router.post('/', bugReportLimiter, async (req, res) => {
  try {
    // Check payload size limit (prevent large screenshot issues)
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { // 5MB limit
      return res.status(413).json({
        success: false,
        message: 'Payload muito grande. Por favor, envie screenshots menores.'
      });
    }

    const { email, problemType, description, attemptedUrl, timestamp, userAgent, screenshot } = req.body;

    // Validate input
    const validation = validateBugReport({
      email,
      problemType,
      description,
      attemptedUrl,
      timestamp,
      userAgent,
      screenshot
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validation.errors
      });
    }

    const bugReport = {
      ...validation.sanitized,
      id: Date.now().toString(),
      ip: req.ip,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Log the bug report
    logger.info('Bug report received', {
      id: bugReport.id,
      problemType: bugReport.problemType,
      attemptedUrl: bugReport.attemptedUrl,
      ip: bugReport.ip,
      timestamp: bugReport.timestamp
    });

    // Store in memory (in production, use a database)
    // For now, we'll store in a simple array (this will reset on server restart)
    if (!global.bugReports) {
      global.bugReports = [];
    }

    global.bugReports.push(bugReport);

    // Keep only last 100 reports
    if (global.bugReports.length > 100) {
      global.bugReports = global.bugReports.slice(-100);
    }

    // Send notification (in production, integrate with email/SMS)
    try {
      // This would integrate with your notification system
      console.log('🐛 Bug Report Notification:', {
        id: bugReport.id,
        type: bugReport.problemType,
        url: bugReport.attemptedUrl,
        email: bugReport.email || 'Não informado'
      });
    } catch (notificationError) {
      console.warn('Failed to send bug report notification:', notificationError);
    }

    // Send response
    res.status(201).json({
      success: true,
      message: 'Report recebido com sucesso! Agradecemos sua colaboração.',
      reportId: bugReport.id
    });

  } catch (error) {
    logger.error('Error processing bug report:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar report. Por favor, tente novamente.'
    });
  }
});

// GET /api/bug-report (admin only - would need authentication)
router.get('/', async (req, res) => {
  try {
    // In production, add authentication check here
    if (!global.bugReports) {
      global.bugReports = [];
    }

    res.json({
      success: true,
      reports: global.bugReports,
      total: global.bugReports.length
    });
  } catch (error) {
    logger.error('Error fetching bug reports:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar reports.'
    });
  }
});

export default router;