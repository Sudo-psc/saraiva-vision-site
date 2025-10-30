/**
 * Middleware para logging de webhooks
 * Registra eventos de webhook para auditoria e debugging
 */

import fs from 'fs/promises';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'api', 'logs', 'webhooks');

/**
 * Ensures that the log directory exists.
 * @private
 */
async function ensureLogDirectory() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (error) {
    console.error('[Webhook Logger] Erro ao criar diretório de logs:', error);
  }
}

/**
 * Generates a log file name based on the current date.
 * @returns {string} The log file name.
 * @private
 */
function getLogFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `webhook-${year}-${month}-${day}.log`;
}

/**
 * Formats a log entry as a JSON string.
 * @param {object} data The data to log.
 * @returns {string} The formatted log entry.
 * @private
 */
function formatLogEntry(data) {
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    timestamp,
    ...data
  }) + '\n';
}

/**
 * Logs a webhook event asynchronously. This is a "fire-and-forget" function that does not block the request-response cycle.
 *
 * @param {object} event The webhook event object to log.
 */
export function logWebhookEvent(event) {
  // Fire-and-forget: não bloqueia o webhook response
  setImmediate(async () => {
    try {
      await ensureLogDirectory();
      const logFile = path.join(LOG_DIR, getLogFileName());
      const logEntry = formatLogEntry(event);
      await fs.appendFile(logFile, logEntry, 'utf8');
    } catch (error) {
      console.error('[Webhook Logger] Erro ao registrar evento:', error);
    }
  });
}

/**
 * Creates a middleware function for logging webhook requests.
 *
 * @param {string} webhookName The name of the webhook.
 * @returns {function(object, object, object): void} The middleware function.
 */
export function createWebhookLogger(webhookName) {
  return (req, payload, result) => {
    const event = {
      webhook: webhookName,
      method: req.method,
      ip: req.headers['x-forwarded-for']?.split(',')[0].trim()
           || req.headers['x-real-ip']
           || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      contentType: req.headers['content-type'],
      success: result.success,
      error: result.error || null,
      payloadSize: JSON.stringify(payload).length,
      responseTime: result.responseTime || 0
    };

    // Fire-and-forget: não bloqueia resposta
    logWebhookEvent(event);

    // Console log para desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Webhook]', {
        name: webhookName,
        success: result.success,
        ip: event.ip,
        error: result.error
      });
    }
  };
}

/**
 * Reads and parses webhook logs for a given date.
 *
 * @param {string} date The date of the logs to read, in YYYY-MM-DD format.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of log entry objects.
 */
export async function readWebhookLogs(date) {
  try {
    const logFile = path.join(LOG_DIR, `webhook-${date}.log`);
    const content = await fs.readFile(logFile, 'utf8');
    return content
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Arquivo não existe
    }
    throw error;
  }
}
