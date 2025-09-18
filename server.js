import 'dotenv/config';
import http from 'node:http';
import url from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

// Import the serverless-style handler
import reviewsHandler from './api/reviews.js';
import webVitalsHandler from './api/web-vitals.js';
import contactHandler from './api/contact.js';

// Logging configuration
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FORMAT = process.env.LOG_FORMAT || 'pretty'; // 'json' or 'pretty'
const ENABLE_ACCESS_LOGS = process.env.ENABLE_ACCESS_LOGS === 'true';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logger utility for structured logging
class Logger {
  constructor(level = 'info', format = 'pretty') {
    this.level = level;
    this.format = format;
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    
    // Create log streams
    if (format === 'json') {
      this.accessStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
      this.errorStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });
      this.appStream = fs.createWriteStream(path.join(logsDir, 'app.log'), { flags: 'a' });
    }
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  formatMessage(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: 'saraiva-vision-api',
      clinic: 'Clínica Saraiva Vision',
      message,
      ...metadata
    };

    if (this.format === 'json') {
      return JSON.stringify(logEntry);
    } else {
      const metaStr = Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : '';
      return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
    }
  }

  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, metadata);
    
    if (this.format === 'json') {
      // Write to appropriate stream
      if (level === 'error') {
        this.errorStream.write(formatted + '\n');
      } else {
        this.appStream.write(formatted + '\n');
      }
    }
    
    // Always log to console
    console.log(formatted);
  }

  access(req, res, duration) {
    if (!ENABLE_ACCESS_LOGS) return;
    
    const logEntry = {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.socket.remoteAddress,
      statusCode: res.statusCode,
      contentLength: res.getHeader('content-length') || 0,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    if (this.format === 'json' && this.accessStream) {
      this.accessStream.write(JSON.stringify(logEntry) + '\n');
    }
    
    if (this.shouldLog('info')) {
      this.log('info', 'HTTP Request', logEntry);
    }
  }

  error(message, metadata = {}) { this.log('error', message, metadata); }
  warn(message, metadata = {}) { this.log('warn', message, metadata); }
  info(message, metadata = {}) { this.log('info', message, metadata); }
  debug(message, metadata = {}) { this.log('debug', message, metadata); }
}

const logger = new Logger(LOG_LEVEL, LOG_FORMAT);

function wrapRes(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    const body = JSON.stringify(obj);
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json');
    }
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);
  };
  return res;
}

// Simple in-memory rate limiter to mitigate local DDoS attempts
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;
if (!global.requestCounts) {
  global.requestCounts = new Map();
}

const server = http.createServer(async (req, res) => {
  const startTime = Date.now();
  const ip = req.socket.remoteAddress || 'unknown';
  
  // Rate limiting
  const now = Date.now();
  const entry = global.requestCounts.get(ip) || { count: 0, start: now };

  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count += 1;
  }

  global.requestCounts.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Too many requests' }));
    
    logger.warn('Rate limit exceeded', {
      ip,
      requestCount: entry.count,
      url: req.url,
      userAgent: req.headers['user-agent']
    });
    
    logger.access(req, res, Date.now() - startTime);
    return;
  }

  const parsed = url.parse(req.url, true);
  
  // Health check endpoint
  if (parsed.pathname === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'saraiva-vision-api',
      clinic: 'Clínica Saraiva Vision',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
    res.end(JSON.stringify(healthData));
    logger.access(req, res, Date.now() - startTime);
    return;
  }
  
  // Route API endpoints
  if (parsed.pathname && parsed.pathname.startsWith('/api/')) {
    try {
      logger.debug('Processing API request', {
        method: req.method,
        pathname: parsed.pathname,
        ip,
        userAgent: req.headers['user-agent']
      });

      if (parsed.pathname.startsWith('/api/reviews')) {
        await reviewsHandler(req, wrapRes(res));
        logger.access(req, res, Date.now() - startTime);
        return;
      }
      
      if (parsed.pathname.startsWith('/api/web-vitals')) {
        // Collect JSON body for POST/OPTIONS
        if (req.method === 'POST') {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString('utf8');
          try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
        }
        await webVitalsHandler(req, wrapRes(res));
        logger.access(req, res, Date.now() - startTime);
        return;
      }
      
      if (parsed.pathname.startsWith('/api/contact')) {
        // Collect JSON body for POST/OPTIONS
        if (req.method === 'POST') {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString('utf8');
          try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
        }
        await contactHandler(req, wrapRes(res));
        logger.access(req, res, Date.now() - startTime);
        return;
      }
      
      // Unknown API route
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
      
      logger.warn('Unknown API endpoint', {
        pathname: parsed.pathname,
        method: req.method,
        ip
      });
      
      logger.access(req, res, Date.now() - startTime);
      return;
    } catch (e) {
      logger.error('API handler error', {
        error: e.message,
        stack: e.stack,
        pathname: parsed.pathname,
        method: req.method,
        ip
      });
      
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify({ error: 'Internal server error' }));
      logger.access(req, res, Date.now() - startTime);
      return;
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
  
  logger.debug('Request to non-API endpoint', {
    pathname: parsed.pathname,
    method: req.method,
    ip
  });
  
  logger.access(req, res, Date.now() - startTime);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info('API server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    logLevel: LOG_LEVEL,
    logFormat: LOG_FORMAT,
    accessLogsEnabled: ENABLE_ACCESS_LOGS,
    pid: process.pid,
    clinic: 'Clínica Saraiva Vision',
    doctor: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM signal, shutting down gracefully');
  server.close(() => {
    logger.info('API server stopped');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT signal, shutting down gracefully');
  server.close(() => {
    logger.info('API server stopped');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: reason?.toString(),
    promise: promise?.toString()
  });
});
