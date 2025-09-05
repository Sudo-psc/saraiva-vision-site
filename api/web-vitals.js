/**
 * Web Vitals API Endpoint
 * Collects and persists Core Web Vitals data server-side (JSONL log).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const {
      metric,
      value,
      rating,
      delta,
      id,
      url,
      timestamp,
      userAgent,
      connection
    } = req.body;

    // Validate required fields
    if (!metric || value === undefined || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric}: ${Math.round(value)}ms (${rating})`);
    }

    // Here you would typically store in a database
    // For now, we'll just acknowledge receipt
    const vitalsData = {
      metric,
      value: Math.round(value),
      rating,
      delta: Math.round(delta || 0),
      id,
      url,
      timestamp,
      userAgent: userAgent?.substring(0, 200), // Truncate for storage
      connection,
      received: new Date().toISOString()
    };

    // Persist to JSONL log (local server-side storage)
    try {
      const logDir = process.env.WEB_VITALS_LOG_DIR || path.resolve(process.cwd(), 'logs');
      const logFile = path.join(logDir, 'web-vitals.jsonl');
      await fs.mkdir(logDir, { recursive: true });
      await fs.appendFile(logFile, JSON.stringify(vitalsData) + '\n', 'utf8');
    } catch (logErr) {
      // Non-fatal: log to console, but still return success
      console.warn('Web Vitals log append failed:', logErr.message);
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Web vital recorded',
      data: vitalsData
    });

  } catch (error) {
    console.error('Web Vitals API error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
