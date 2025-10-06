#!/usr/bin/env node

/**
 * GitHub Webhook Receiver for Local VPS Deployment
 *
 * Listens for GitHub push events and triggers local deployment scripts
 * Runs on VPS, no SSH required
 */

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.WEBHOOK_PORT || 9000;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';
const PROJECT_ROOT = '/home/saraiva-vision-site';
const LOG_FILE = path.join(PROJECT_ROOT, 'logs', 'webhook.log');

// Ensure logs directory exists
const logsDir = path.join(PROJECT_ROOT, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logging utility
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
  if (!WEBHOOK_SECRET) {
    log('WARNING: GITHUB_WEBHOOK_SECRET not set, skipping signature verification', 'WARN');
    return true;
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Execute deployment script
function deployEnvironment(environment, branch, commitSha) {
  return new Promise((resolve, reject) => {
    log(`Starting deployment: environment=${environment}, branch=${branch}, commit=${commitSha.substring(0, 7)}`);

    const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'deploy-to-environment.sh');
    const command = `cd ${PROJECT_ROOT} && bash ${scriptPath} ${environment} ${branch} ${commitSha}`;

    log(`Executing: ${command}`);

    const startTime = Date.now();

    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (error) {
        log(`Deployment FAILED after ${duration}s: ${error.message}`, 'ERROR');
        log(`STDERR: ${stderr}`, 'ERROR');
        reject({ error: error.message, stderr, duration });
        return;
      }

      log(`Deployment SUCCEEDED in ${duration}s`);
      log(`STDOUT: ${stdout}`);

      resolve({ stdout, stderr, duration });
    });
  });
}

// Determine which environment to deploy based on branch
function getEnvironmentForBranch(branch) {
  // Remove refs/heads/ prefix if present
  const cleanBranch = branch.replace('refs/heads/', '');

  // Beta environment: develop, main, feature branches
  if (cleanBranch === 'develop' ||
      cleanBranch === 'main' ||
      cleanBranch.startsWith('feature/')) {
    return 'beta';
  }

  // Production environment: production branch only (manual workflow)
  if (cleanBranch === 'production') {
    return 'production';
  }

  // Unknown branch, skip deployment
  return null;
}

// Handle webhook request
async function handleWebhook(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // Verify signature
      const signature = req.headers['x-hub-signature-256'];
      if (!verifySignature(body, signature)) {
        log('Invalid signature, rejecting webhook', 'WARN');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid signature' }));
        return;
      }

      // Parse payload
      const payload = JSON.parse(body);
      const event = req.headers['x-github-event'];

      log(`Received GitHub event: ${event}`);

      // Only handle push events
      if (event !== 'push') {
        log(`Ignoring non-push event: ${event}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Event ignored' }));
        return;
      }

      // Extract push information
      const branch = payload.ref; // e.g., refs/heads/develop
      const commitSha = payload.after;
      const pusher = payload.pusher?.name || 'unknown';
      const repository = payload.repository?.full_name || 'unknown';

      log(`Push event: repository=${repository}, branch=${branch}, pusher=${pusher}, commit=${commitSha.substring(0, 7)}`);

      // Determine environment
      const environment = getEnvironmentForBranch(branch);

      if (!environment) {
        log(`No deployment configured for branch: ${branch}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Branch not configured for automatic deployment',
          branch
        }));
        return;
      }

      // Start deployment (don't wait for completion)
      res.writeHead(202, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Deployment started',
        environment,
        branch,
        commit: commitSha.substring(0, 7)
      }));

      // Deploy asynchronously
      try {
        const result = await deployEnvironment(environment, branch, commitSha);
        log(`Deployment completed successfully in ${result.duration}s`);
      } catch (error) {
        log(`Deployment failed: ${JSON.stringify(error)}`, 'ERROR');
      }

    } catch (error) {
      log(`Error processing webhook: ${error.message}`, 'ERROR');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
}

// Health check endpoint
function handleHealthCheck(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'healthy',
    uptime: process.uptime(),
    port: PORT,
    logFile: LOG_FILE
  }));
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/webhook' && req.method === 'POST') {
    handleWebhook(req, res);
  } else if (url.pathname === '/health' && req.method === 'GET') {
    handleHealthCheck(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start server
server.listen(PORT, '127.0.0.1', () => {
  log(`Webhook receiver listening on http://127.0.0.1:${PORT}`);
  log(`Webhook endpoint: http://127.0.0.1:${PORT}/webhook`);
  log(`Health check: http://127.0.0.1:${PORT}/health`);

  if (!WEBHOOK_SECRET) {
    log('WARNING: Running without webhook signature verification!', 'WARN');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'ERROR');
  log(error.stack, 'ERROR');
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at ${promise}: ${reason}`, 'ERROR');
});
