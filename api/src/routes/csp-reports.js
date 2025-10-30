/**
 * CSP Reports Endpoint
 * Receives and logs Content Security Policy violation reports
 *
 * Supports both:
 * - CSP Level 2: application/csp-report (legacy)
 * - Reporting API: application/reports+json (modern)
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'csp-violations.log');

/**
 * Parses a Content Security Policy (CSP) violation report from both legacy and modern formats.
 *
 * @param {object|Array<object>} body The request body containing the CSP report.
 * @returns {Array<object>|null} An array of parsed report objects, or `null` if the format is invalid.
 * @private
 */
function parseCSPReport(body) {
  // New Reporting API format
  if (Array.isArray(body) && body[0]?.type === 'csp-violation') {
    return body.map(report => ({
      type: 'reporting-api',
      timestamp: new Date().toISOString(),
      age: report.age,
      url: report.url,
      userAgent: report.user_agent,
      violation: {
        documentURL: report.body.documentURL,
        blockedURL: report.body.blockedURL,
        effectiveDirective: report.body.effectiveDirective,
        disposition: report.body.disposition,
        statusCode: report.body.statusCode,
        sourceFile: report.body.sourceFile,
        lineNumber: report.body.lineNumber,
        columnNumber: report.body.columnNumber
      }
    }));
  }

  // Legacy CSP Level 2 format
  if (body['csp-report']) {
    const report = body['csp-report'];
    return [{
      type: 'csp-level-2',
      timestamp: new Date().toISOString(),
      violation: {
        documentURL: report['document-uri'],
        blockedURL: report['blocked-uri'],
        effectiveDirective: report['effective-directive'] || report['violated-directive'],
        statusCode: report['status-code'],
        sourceFile: report['source-file'],
        lineNumber: report['line-number'],
        columnNumber: report['column-number'],
        originalPolicy: report['original-policy']
      }
    }];
  }

  return null;
}

/**
 * @swagger
 * /api/csp-reports:
 *   post:
 *     summary: Receives Content Security Policy (CSP) violation reports.
 *     requestBody:
 *       required: true
 *       content:
 *         application/csp-report:
 *           schema:
 *             type: object
 *         application/reports+json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *     responses:
 *       204:
 *         description: The report was received successfully.
 *       400:
 *         description: Bad request. Invalid report format.
 *       500:
 *         description: Internal server error.
 */
router.post('/', (req, res) => {
  try {
    const reports = parseCSPReport(req.body);

    if (!reports) {
      console.warn('[CSP] Invalid report format received');
      return res.status(400).json({ error: 'Invalid report format' });
    }

    reports.forEach(report => {
      // Add request metadata
      const logEntry = {
        ...report,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer')
      };

      // Console log (structured)
      console.warn('🛡️ CSP Violation:', {
        blockedURL: report.violation.blockedURL,
        directive: report.violation.effectiveDirective,
        page: report.violation.documentURL,
        source: report.violation.sourceFile
      });

      // Append to log file
      try {
        fs.appendFileSync(
          logFilePath,
          JSON.stringify(logEntry) + '\n',
          'utf8'
        );
      } catch (err) {
        console.error('[CSP] Failed to write to log file:', err);
      }
    });

    // Return 204 No Content (standard for reporting endpoints)
    res.status(204).send();

  } catch (error) {
    console.error('[CSP] Error processing report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/csp-reports/health:
 *   get:
 *     summary: Checks the health of the CSP reporting endpoint.
 *     responses:
 *       200:
 *         description: The endpoint is healthy.
 *       500:
 *         description: Internal server error.
 */
router.get('/health', (req, res) => {
  try {
    const logExists = fs.existsSync(logFilePath);
    const logSize = logExists ? fs.statSync(logFilePath).size : 0;

    res.json({
      status: 'ok',
      endpoint: '/api/csp-reports',
      logFile: logFilePath,
      logSize: logSize,
      logSizeHuman: `${(logSize / 1024).toFixed(2)} KB`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;