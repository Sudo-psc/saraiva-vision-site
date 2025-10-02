import { env } from '@/utils/env';
/**
 * Conditional Logger Utility
 * Only logs in development environment to reduce production console noise
 */

const isDev = env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },

  warn: (...args) => {
    if (isDev) console.warn(...args);
  },

  error: (...args) => {
    // Always log errors, even in production, for monitoring
    console.error(...args);
  },

  debug: (...args) => {
    if (isDev) console.debug(...args);
  },

  info: (...args) => {
    if (isDev) console.info(...args);
  }
};

export default logger;