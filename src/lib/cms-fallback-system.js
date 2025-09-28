import { createLogger } from './logger.js';
import { generateEnhancedFallbackContent } from './wordpress-offline.js';

class CMSFallbackSystem {
  constructor() {
    this.logger = createLogger('cms-fallback-system');
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    await Promise.resolve();
  }

  async executeWithFallback(fetchFunction, contentType, options = {}) {
    const attemptMetadata = {
      contentType,
      timestamp: new Date().toISOString(),
      options
    };

    try {
      const result = await fetchFunction();

      if (result && !result.error) {
        this.logger.info('CMS primary fetch succeeded', attemptMetadata);
        return {
          ...result,
          isFallback: false,
          isOffline: false,
          fallbackMeta: null
        };
      }

      if (result && result.error) {
        this.logger.warn('CMS fetch returned error payload', {
          ...attemptMetadata,
          error: result.error
        });

        return {
          ...result,
          isFallback: false,
          isOffline: false,
          fallbackMeta: null
        };
      }

      throw new Error('CMS fetch returned empty response');
    } catch (error) {
      const formattedError = error instanceof Error ? error : new Error(error || 'CMS fetch failed');

      this.logger.warn('CMS fetch failed, using fallback', {
        ...attemptMetadata,
        error: formattedError.message
      });

      const fallback = generateEnhancedFallbackContent(contentType, options);
      const fallbackMeta = {
        ...(fallback?.fallbackMeta || {}),
        reason: 'CMS_FETCH_FAILED',
        originalError: formattedError.message,
        generatedAt: new Date().toISOString()
      };

      return {
        ...fallback,
        error: {
          type: 'CMS_FALLBACK',
          message: formattedError.message,
          stack: formattedError.stack
        },
        isFallback: true,
        isOffline: Boolean(options.offlineFallback),
        isCached: false,
        fallbackMeta,
        healthState: options.healthState || null
      };
    }
  }
}

let systemInstance = null;

export const initializeCMSFallbackSystem = async () => {
  if (!systemInstance) {
    systemInstance = new CMSFallbackSystem();
  }
  await systemInstance.initialize();
  return systemInstance;
};

export const getCMSFallbackSystem = () => {
  if (!systemInstance) {
    systemInstance = new CMSFallbackSystem();
  }
  return systemInstance;
};

export default CMSFallbackSystem;
