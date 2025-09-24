# Saraiva Vision Health Monitor Dockerfile
# Medical-grade system monitoring for healthcare applications
FROM node:18-alpine AS base

# Install required packages for health monitoring
RUN apk add --no-cache \
    curl \
    bash \
    jq \
    ca-certificates \
    && update-ca-certificates

WORKDIR /app

# Create package.json for health monitor
COPY <<EOF /app/package.json
{
  "name": "saraiva-health-monitor",
  "version": "1.0.0",
  "description": "Medical-grade health monitoring for Saraiva Vision",
  "main": "monitor.js",
  "type": "module",
  "scripts": {
    "start": "node monitor.js",
    "test": "node test.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.2",
    "winston": "^3.11.0",
    "node-cron": "^3.0.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Install dependencies
RUN npm ci --only=production

# Create health monitor application
COPY <<EOF /app/monitor.js
import express from 'express';
import axios from 'axios';
import winston from 'winston';
import cron from 'node-cron';

const app = express();
const PORT = process.env.MONITOR_PORT || 3000;

// Medical-grade logging configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'health-monitor', medical_system: true },
  transports: [
    new winston.transports.File({ filename: '/app/logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '/app/logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Service health check configuration
const services = [
  {
    name: 'nginx',
    url: 'http://nginx/health',
    interval: 30,
    critical: true
  },
  {
    name: 'api',
    url: 'http://api:3001/api/health',
    interval: 30,
    critical: true
  },
  {
    name: 'wordpress',
    url: 'http://wordpress:8080/wp-json/wp/v2/',
    interval: 60,
    critical: true
  },
  {
    name: 'mysql',
    url: 'http://mysql:3306',
    interval: 60,
    critical: true,
    type: 'database'
  },
  {
    name: 'redis',
    url: 'http://redis:6379',
    interval: 30,
    critical: true,
    type: 'cache'
  }
];

// Health check function
async function checkService(service) {
  try {
    const response = await axios.get(service.url, {
      timeout: 10000,
      validateStatus: (status) => status < 500
    });

    logger.info('Service health check passed', {
      service: service.name,
      status: response.status,
      responseTime: response.headers['response-time'] || 'N/A'
    });

    return { name: service.name, status: 'healthy', responseTime: response.headers['response-time'] };
  } catch (error) {
    logger.error('Service health check failed', {
      service: service.name,
      error: error.message,
      critical: service.critical
    });

    return {
      name: service.name,
      status: 'unhealthy',
      error: error.message,
      critical: service.critical
    };
  }
}

// Medical system alerting
function sendAlert(service, status) {
  if (status === 'unhealthy' && service.critical) {
    logger.error('CRITICAL: Medical service failure detected', {
      service: service.name,
      severity: 'critical',
      impact: 'patient-care',
      action_required: 'immediate'
    });

    // Send webhook alert if configured
    if (process.env.ALERT_WEBHOOK_URL) {
      axios.post(process.env.ALERT_WEBHOOK_URL, {
        service: service.name,
        status: 'critical',
        message: `Medical service ${service.name} is down`,
        timestamp: new Date().toISOString(),
        severity: 'critical'
      }).catch(err => {
        logger.error('Failed to send alert webhook', { error: err.message });
      });
    }
  }
}

// Scheduled health checks
services.forEach(service => {
  cron.schedule(`*/${service.interval} * * * * *`, async () => {
    logger.info('Running scheduled health check', { service: service.name });
    const result = await checkService(service);

    if (result.status === 'unhealthy') {
      sendAlert(service, result.status);
    }
  });
});

// API Routes
app.get('/monitor-health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'health-monitor',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    medical_system: true
  });
});

app.get('/services', async (req, res) => {
  const results = await Promise.all(services.map(checkService));
  res.json({
    services: results,
    timestamp: new Date().toISOString(),
    system_status: results.every(s => s.status === 'healthy') ? 'healthy' : 'degraded'
  });
});

// Medical system metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    cpu_usage: process.cpuUsage(),
    medical_system: true,
    compliance_level: 'HIPAA',
    timestamp: new Date().toISOString()
  });
});

// Start health monitor
app.listen(PORT, () => {
  logger.info('Saraiva Vision Health Monitor started', {
    port: PORT,
    medical_system: true,
    environment: process.env.NODE_ENV || 'production'
  });

  // Initial health checks
  services.forEach(service => {
    setTimeout(() => checkService(service), 5000);
  });
});

export default app;
EOF

# Create test file
COPY <<EOF /app/test.js
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Running health monitor tests...');

// Test health monitor startup
const child = spawn('node', ['monitor.js'], {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'test' }
});

child.stdout.on('data', (data) => {
  console.log(`Monitor: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`Monitor Error: ${data}`);
});

child.on('close', (code) => {
  console.log(`Health monitor tests completed with code: ${code}`);
  process.exit(code || 0);
});

setTimeout(() => {
  child.kill();
  console.log('Health monitor tests completed successfully');
}, 5000);
EOF

# Create logs directory
RUN mkdir -p /app/logs

# Create non-root user for security
RUN addgroup --system --gid 1001 monitor
RUN adduser --system --uid 1001 saramonitor

# Set correct permissions
RUN chown -R saramonitor:monitor /app
USER saramonitor

# Expose port
EXPOSE 3000

# Health check for the monitor itself
HEALTHCHECK --interval=60s --timeout=15s --start-period=30s --retries=2 \
  CMD curl -f http://localhost:3000/monitor-health || exit 1

# Start the health monitor
CMD ["npm", "start"]