/**
 * CORS Helper for External Scripts
 * Ensures proper crossorigin attributes and error handling
 */

export class CORSScriptLoader {
  constructor() {
    this.loadedScripts = new Map();
  }

  /**
   * Load external script with proper CORS configuration
   * @param {string} url - Script URL
   * @param {Object} options - Configuration options
   * @returns {Promise<void>}
   */
  loadScript(url, options = {}) {
    const {
      crossorigin = 'anonymous', // anonymous | use-credentials
      integrity = null, // SRI hash
      async = true,
      defer = false,
      onLoad = null,
      onError = null
    } = options;

    // Check if already loaded
    if (this.loadedScripts.has(url)) {
      return this.loadedScripts.get(url);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = async;
      script.defer = defer;

      // Critical: Set crossorigin BEFORE src
      if (crossorigin) {
        script.crossOrigin = crossorigin;
      }

      // Subresource Integrity
      if (integrity) {
        script.integrity = integrity;
      }

      script.onload = () => {
        console.log('[CORSScriptLoader] Loaded:', url);
        if (onLoad) onLoad();
        resolve();
      };

      script.onerror = (error) => {
        console.error('[CORSScriptLoader] Failed to load:', url, error);
        this.loadedScripts.delete(url);
        if (onError) onError(error);
        reject(new Error(`Failed to load script: ${url}`));
      };

      document.head.appendChild(script);
    });

    this.loadedScripts.set(url, promise);
    return promise;
  }

  /**
   * Load multiple scripts in order
   * @param {Array} scripts - Array of {url, options}
   * @returns {Promise<void>}
   */
  async loadScripts(scripts) {
    for (const script of scripts) {
      await this.loadScript(script.url, script.options);
    }
  }

  /**
   * Load multiple scripts in parallel
   * @param {Array} scripts - Array of {url, options}
   * @returns {Promise<void[]>}
   */
  loadScriptsParallel(scripts) {
    return Promise.all(
      scripts.map(script => this.loadScript(script.url, script.options))
    );
  }

  /**
   * Check if script is already loaded
   * @param {string} url
   * @returns {boolean}
   */
  isLoaded(url) {
    return this.loadedScripts.has(url);
  }
}

/**
 * Iframe CORS Helper
 * Handles postMessage communication with cross-origin iframes
 */
export class IframeCORSHelper {
  constructor() {
    this.allowedOrigins = new Set();
    this.messageHandlers = new Map();
    this.setupMessageListener();
  }

  /**
   * Add allowed origin for postMessage
   * @param {string} origin - e.g., 'https://open.spotify.com'
   */
  allowOrigin(origin) {
    this.allowedOrigins.add(origin);
  }

  /**
   * Register message handler for specific iframe
   * @param {string} type - Message type
   * @param {Function} handler - Handler function
   */
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Security: Check origin
      if (!this.allowedOrigins.has(event.origin)) {
        console.warn('[IframeCORSHelper] Message from unauthorized origin:', event.origin);
        return;
      }

      const { type, data } = event.data;

      if (!type) {
        console.warn('[IframeCORSHelper] Message without type:', event.data);
        return;
      }

      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data, event);
          } catch (error) {
            console.error('[IframeCORSHelper] Handler error:', error);
          }
        });
      }
    });
  }

  /**
   * Send message to iframe
   * @param {HTMLIFrameElement} iframe
   * @param {string} type - Message type
   * @param {*} data - Message data
   * @param {string} targetOrigin - Target origin (defaults to iframe src origin)
   */
  sendToIframe(iframe, type, data, targetOrigin = '*') {
    try {
      // Extract origin from iframe src
      if (targetOrigin === '*' && iframe.src) {
        const url = new URL(iframe.src);
        targetOrigin = url.origin;
      }

      iframe.contentWindow.postMessage(
        { type, data },
        targetOrigin
      );
    } catch (error) {
      console.error('[IframeCORSHelper] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Wrap iframe creation with error handling
   * @param {string} src - Iframe source URL
   * @param {Object} options - Configuration options
   * @returns {HTMLIFrameElement}
   */
  createIframe(src, options = {}) {
    const {
      sandbox = null,
      allow = null,
      onLoad = null,
      onError = null
    } = options;

    const iframe = document.createElement('iframe');
    iframe.src = src;

    // Security: Set sandbox
    if (sandbox) {
      iframe.sandbox = sandbox;
    }

    // Feature Policy / Permissions Policy
    if (allow) {
      iframe.allow = allow;
    }

    iframe.onload = () => {
      console.log('[IframeCORSHelper] Iframe loaded:', src);
      if (onLoad) onLoad(iframe);
    };

    iframe.onerror = (error) => {
      console.error('[IframeCORSHelper] Iframe error:', src, error);
      if (onError) onError(error, iframe);
    };

    return iframe;
  }
}

/**
 * Check CORS configuration for a URL
 * @param {string} url
 * @returns {Promise<Object>}
 */
export async function checkCORS(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors'
    });

    const headers = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
      'timing-allow-origin': response.headers.get('timing-allow-origin')
    };

    return {
      url,
      status: response.status,
      ok: response.ok,
      headers,
      corsEnabled: !!headers['access-control-allow-origin'],
      allowsCredentials: headers['access-control-allow-credentials'] === 'true',
      timingAllowed: !!headers['timing-allow-origin']
    };
  } catch (error) {
    return {
      url,
      error: error.message,
      corsEnabled: false
    };
  }
}

/**
 * Global instance
 */
export const scriptLoader = new CORSScriptLoader();
export const iframeHelper = new IframeCORSHelper();

// Configure allowed iframe origins
iframeHelper.allowOrigin('https://open.spotify.com');
iframeHelper.allowOrigin('https://www.google.com');
iframeHelper.allowOrigin('https://www.googletagmanager.com');
iframeHelper.allowOrigin('https://lc.pulse.is');
iframeHelper.allowOrigin('https://apolo.ninsaude.com');

export default {
  CORSScriptLoader,
  IframeCORSHelper,
  scriptLoader,
  iframeHelper,
  checkCORS
};
