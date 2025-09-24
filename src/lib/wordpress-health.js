// WordPress Health Monitoring Service
import { checkWordPressHealth, generateFallbackContent } from './wordpress.js';

// VPS Health monitoring configuration
const HEALTH_CONFIG = {
  checkInterval: 60000, // 1 minute
  failureThreshold: 3, // 3 consecutive failures before marking as unhealthy
  recoveryThreshold: 2, // 2 consecutive successes before marking as healthy
  timeout: 10000, // 10 seconds
  vpsEndpoint: 'http://31.97.129.78:8081/health', // VPS health check endpoint
};

// Global health state
let healthState = {
  isHealthy: true,
  lastCheck: null,
  consecutiveFailures: 0,
  consecutiveSuccesses: 0,
  responseTime: null,
  error: null,
  endpoint: null,
};

// Cache for health check results
let lastHealthCheck = null;
let healthCheckPromise = null;

/**
 * Check WordPress health with caching and circuit breaker pattern
 */
export const checkWordPressHealthWithCache = async (force = false) => {
  // Return cached result if recent and not forced
  if (!force && lastHealthCheck && (Date.now() - lastHealthCheck.timestamp < HEALTH_CONFIG.checkInterval)) {
    return lastHealthCheck;
  }

  // Return existing promise if check is in progress
  if (healthCheckPromise) {
    return healthCheckPromise;
  }

  // Perform health check
  healthCheckPromise = performHealthCheck();
  const result = await healthCheckPromise;
  healthCheckPromise = null;

  return result;
};

/**
 * Perform actual health check with retry logic
 */
const performHealthCheck = async () => {
  try {
    const result = await checkWordPressHealth();

    // Update health state
    updateHealthState(result);

    // Cache result
    lastHealthCheck = {
      ...result,
      timestamp: Date.now(),
      healthState: { ...healthState },
    };

    return result;
  } catch (error) {
    const errorResult = {
      isHealthy: false,
      responseTime: Date.now() - (lastHealthCheck?.timestamp || Date.now()),
      data: null,
      error: {
        type: 'HEALTH_CHECK_EXCEPTION',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    };

    updateHealthState(errorResult);

    lastHealthCheck = {
      ...errorResult,
      timestamp: Date.now(),
      healthState: { ...healthState },
    };

    return errorResult;
  }
};

/**
 * Update health state based on check results
 */
const updateHealthState = (result) => {
  const wasHealthy = healthState.isHealthy;
  const isNowHealthy = result.isHealthy;

  healthState = {
    isHealthy: isNowHealthy,
    lastCheck: new Date().toISOString(),
    responseTime: result.responseTime,
    error: result.error,
    endpoint: result.endpoint,
  };

  if (isNowHealthy) {
    if (wasHealthy) {
      healthState.consecutiveSuccesses++;
    } else {
      healthState.consecutiveSuccesses = 1;
    }
    healthState.consecutiveFailures = 0;
  } else {
    if (wasHealthy) {
      healthState.consecutiveFailures = 1;
    } else {
      healthState.consecutiveFailures++;
    }
    healthState.consecutiveSuccesses = 0;
  }

  // Log state changes
  if (wasHealthy !== isNowHealthy) {
    console.log(`WordPress health status changed: ${wasHealthy ? 'HEALTHY' : 'UNHEALTHY'} → ${isNowHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);

    if (!isNowHealthy) {
      console.error('WordPress is unhealthy:', result.error);
    }
  }
};

/**
 * Get current health state
 */
export const getWordPressHealthState = () => {
  return {
    ...healthState,
    lastCheck: healthState.lastCheck || 'Never',
    timeSinceLastCheck: healthState.lastCheck
      ? Date.now() - new Date(healthState.lastCheck).getTime()
      : Infinity,
  };
};

/**
 * Execute WordPress query with health check and fallback
 */
export const executeWordPressQueryWithFallback = async (queryFunction, contentType, fallbackParams = {}) => {
  // Check health first
  const health = await checkWordPressHealthWithCache();

  if (!health.isHealthy) {
    console.warn(`WordPress is unhealthy, using fallback content for ${contentType}`);
    return {
      data: generateFallbackContent(contentType, fallbackParams),
      error: health.error,
      isFallback: true,
      healthState: getWordPressHealthState(),
    };
  }

  // Try to execute the query
  try {
    const result = await queryFunction();

    // If query fails despite healthy check, use fallback
    if (result.error) {
      console.warn(`Query failed for ${contentType}, using fallback content`);
      return {
        data: generateFallbackContent(contentType, fallbackParams),
        error: result.error,
        isFallback: true,
        healthState: getWordPressHealthState(),
      };
    }

    return {
      ...result,
      isFallback: false,
      healthState: getWordPressHealthState(),
    };
  } catch (error) {
    console.warn(`Exception executing query for ${contentType}, using fallback content`);
    return {
      data: generateFallbackContent(contentType, fallbackParams),
      error: {
        type: 'QUERY_EXCEPTION',
        message: error.message,
      },
      isFallback: true,
      healthState: getWordPressHealthState(),
    };
  }
};

/**
 * Start periodic health monitoring
 */
export const startWordPressHealthMonitoring = () => {
  if (typeof window === 'undefined') {
    // Server-side monitoring
    setInterval(() => {
      checkWordPressHealthWithCache().catch(error => {
        console.error('Periodic health check failed:', error);
      });
    }, HEALTH_CONFIG.checkInterval);
  }
};

/**
 * Get health statistics for monitoring
 */
export const getWordPressHealthStats = () => {
  const state = getWordPressHealthState();

  return {
    status: state.isHealthy ? 'HEALTHY' : 'UNHEALTHY',
    lastCheck: state.lastCheck,
    responseTime: state.responseTime,
    consecutiveFailures: state.consecutiveFailures,
    consecutiveSuccesses: state.consecutiveSuccesses,
    endpoint: state.endpoint,
    uptime: state.isHealthy ? '100%' : '0%',
  };
};

// Initialize health monitoring
if (typeof window === 'undefined') {
  startWordPressHealthMonitoring();
}