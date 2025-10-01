/**
 * Safe network request utilities
 * Prevents InvalidStateError in Safari when sending analytics/errors
 */

/**
 * Safe sendBeacon wrapper
 * Handles document.visibilityState to prevent InvalidStateError
 */
export function safeBeacon(url, data) {
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) {
    return false;
  }

  if (document.visibilityState === 'hidden' || document.readyState === 'unloading') {
    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      return navigator.sendBeacon(url, blob);
    } catch (error) {
      console.warn('[SafeBeacon] Error:', error.message);
      return false;
    }
  }

  return false;
}

/**
 * Safe fetch with keepalive
 * Use for non-critical tracking that can be dropped
 */
export async function safeFetch(url, data, options = {}) {
  if (typeof fetch === 'undefined') return false;

  const timeout = options.timeout || 5000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
      keepalive: true,
      ...options
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return false;
    }

    if (options.fallbackBeacon !== false) {
      return safeBeacon(url, data);
    }

    return false;
  }
}

/**
 * Setup visibility change handler for analytics
 */
export function setupVisibilityHandler(callback) {
  if (typeof document === 'undefined') return () => {};

  const handler = () => {
    if (document.visibilityState === 'hidden') {
      callback();
    }
  };

  document.addEventListener('visibilitychange', handler);

  return () => {
    document.removeEventListener('visibilitychange', handler);
  };
}
