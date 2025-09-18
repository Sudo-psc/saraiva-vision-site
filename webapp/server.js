import 'dotenv/config';
import http from 'node:http';
import url from 'node:url';

// Import the serverless-style handler
import reviewsHandler from './api/reviews.js';
import webVitalsHandler from './api/web-vitals.js';
import contactHandler from './api/contact.js';

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
  const now = Date.now();
  const ip = req.socket.remoteAddress || 'unknown';
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
    return;
  }

  const parsed = url.parse(req.url, true);
  // Route API endpoints
  if (parsed.pathname && parsed.pathname.startsWith('/api/')) {
    try {
      if (parsed.pathname.startsWith('/api/reviews')) {
        await reviewsHandler(req, wrapRes(res));
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
        return;
      }
      // Unknown API route
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    } catch (e) {
      console.error('API handler error:', e);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify({ error: 'Internal server error' }));
      return;
    }
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
