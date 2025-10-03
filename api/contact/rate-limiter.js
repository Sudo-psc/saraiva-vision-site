import crypto from 'crypto';

const rateLimitStore = new Map();

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  cleanupIntervalMs: 5 * 60 * 1000
};

function hashIp(ip) {
  return crypto
    .createHash('sha256')
    .update(ip + process.env.RATE_LIMIT_SALT || 'saraiva-vision-salt')
    .digest('hex');
}

function cleanup() {
  const now = Date.now();
  const expiredKeys = [];

  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.resetTime > RATE_LIMIT_CONFIG.windowMs) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach(key => rateLimitStore.delete(key));

  if (expiredKeys.length > 0) {
    console.log(`Rate limiter cleanup: removed ${expiredKeys.length} expired entries`);
  }
}

setInterval(cleanup, RATE_LIMIT_CONFIG.cleanupIntervalMs);

export const rateLimiter = {
  check(ip) {
    const hashedIp = hashIp(ip);
    const now = Date.now();
    
    let record = rateLimitStore.get(hashedIp);

    if (!record || now - record.resetTime > RATE_LIMIT_CONFIG.windowMs) {
      record = {
        count: 0,
        resetTime: now
      };
      rateLimitStore.set(hashedIp, record);
    }

    record.count++;

    if (record.count > RATE_LIMIT_CONFIG.maxRequests) {
      console.warn(`Rate limit exceeded for IP: ${hashedIp.substring(0, 8)}...`);
      return true;
    }

    return false;
  },

  reset(ip) {
    const hashedIp = hashIp(ip);
    rateLimitStore.delete(hashedIp);
  },

  getStats() {
    return {
      totalEntries: rateLimitStore.size,
      config: RATE_LIMIT_CONFIG
    };
  }
};

export default rateLimiter;
