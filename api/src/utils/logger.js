// Simple logger utility
const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data);
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data);
  },

  error: (message, error = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()}: ${message}`, data);
    }
  }
};

export { logger };