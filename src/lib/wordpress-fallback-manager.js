// WordPress Fallback Manager
// Comprehensive fallback and resilience mechanisms for WordPress Headless CMS
// Handles graceful degradation when WordPress API is unavailable

import { WordPressStaticCache } from './wordpress-cache.js';
import { WordPressCircuitBreaker } from './wordpress-circuit-breaker.js';
import { logger } from './logger.js';

/**
 * WordPress Fallback Manager
 * Provides multiple layers of fallback content and error recovery
 */
export class WordPressFallbackManager {
  constructor(options = {}) {
    this.config = {
      enableStaticFallback: options.enableStaticFallback !== false,
      enableGeneratedFallback: options.enableGeneratedFallback !== false,
      enablePartialDegradation: options.enablePartialDegradation !== false,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 2000,
      circuitBreakerTimeout: options.circuitBreakerTimeout || 30000,
      fallbackCacheTtl: options.fallbackCacheTtl || 24 * 60 * 60 * 1000, // 24 hours
      ...options
    };

    this.cache = new WordPressStaticCache();
    this.circuitBreaker = new WordPressCircuitBreaker();

    // Fallback content generators
    this.fallbackGenerators = new Map();
    this.initializeFallbackGenerators();

    // Recovery strategies
    this.recoveryStrategies = new Map();
    this.initializeRecoveryStrategies();

    // Service health status
    this.serviceHealth = {
      wordpress_api: 'unknown',
      cache_service: 'healthy',
      fallback_service: 'healthy',
      last_check: null
    };
  }

  /**
   * Initialize fallback content generators
   */
  initializeFallbackGenerators() {
    // Blog posts fallback generator
    this.fallbackGenerators.set('posts', {
      generate: async (params = {}) => {
        const { limit = 6 } = params;
        return this.generateFallbackPosts(limit);
      },
      priority: 1
    });

    // Single post fallback generator
    this.fallbackGenerators.set('post', {
      generate: async (postId) => {
        return this.generateFallbackPost(postId);
      },
      priority: 1
    });

    // Categories fallback generator
    this.fallbackGenerators.set('categories', {
      generate: async () => {
        return this.generateFallbackCategories();
      },
      priority: 2
    });

    // Tags fallback generator
    this.fallbackGenerators.set('tags', {
      generate: async () => {
        return this.generateFallbackTags();
      },
      priority: 2
    });
  }

  /**
   * Initialize recovery strategies
   */
  initializeRecoveryStrategies() {
    // Exponential backoff recovery
    this.recoveryStrategies.set('exponential_backoff', {
      execute: async (operation, attempt = 1) => {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return operation();
      },
      maxAttempts: 5
    });

    // Circuit breaker recovery
    this.recoveryStrategies.set('circuit_breaker', {
      execute: async (operation) => {
        return this.circuitBreaker.execute(operation);
      },
      maxAttempts: 1
    });

    // Cache-first recovery
    this.recoveryStrategies.set('cache_first', {
      execute: async (operation, cacheKey) => {
        try {
          // Try cache first
          const cached = await this.cache.get(cacheKey);
          if (cached) {
            logger.info('Serving content from cache during recovery', { cacheKey });
            return cached;
          }
        } catch (cacheError) {
          logger.warn('Cache unavailable during recovery', { error: cacheError.message });
        }

        // Fallback to operation
        return operation();
      },
      maxAttempts: 1
    });
  }

  /**
   * Execute operation with comprehensive fallback handling
   */
  async executeWithFallback(operation, fallbackConfig = {}) {
    const {
      fallbackType,
      fallbackParams = {},
      cacheKey,
      retryStrategy = 'exponential_backoff',
      enableGracefulDegradation = true
    } = fallbackConfig;

    const startTime = Date.now();
    let lastError = null;
    let fallbackUsed = false;
    let recoveryUsed = false;

    try {
      // First attempt: Direct operation
      const result = await operation();

      if (result) {
        // Update service health on successful operation
        this.updateServiceHealth('wordpress_api', 'healthy');
        return {
          data: result,
          source: 'primary',
          fallbackUsed: false,
          recoveryUsed: false,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

    } catch (primaryError) {
      lastError = primaryError;
      logger.warn('Primary operation failed, attempting recovery', {
        error: primaryError.message,
        operation: operation.name || 'unknown'
      });

      // Update service health
      this.updateServiceHealth('wordpress_api', 'unhealthy');

      // Attempt recovery strategies
      const strategy = this.recoveryStrategies.get(retryStrategy);
      if (strategy) {
        try {
          const recoveredResult = await this.executeRecoveryStrategy(
            operation,
            strategy,
            cacheKey
          );

          if (recoveredResult) {
            recoveryUsed = true;
            return {
              data: recoveredResult,
              source: 'recovered',
              fallbackUsed: false,
              recoveryUsed: true,
              responseTime: Date.now() - startTime,
              timestamp: new Date().toISOString()
            };
          }

        } catch (recoveryError) {
          logger.error('Recovery strategy failed', {
            strategy: retryStrategy,
            error: recoveryError.message
          });
          lastError = recoveryError;
        }
      }
    }

    // Attempt cache fallback
    if (cacheKey) {
      try {
        const cachedResult = await this.getCachedFallback(cacheKey);
        if (cachedResult) {
          logger.info('Serving stale content from cache as fallback', { cacheKey });
          return {
            data: cachedResult,
            source: 'cache_fallback',
            fallbackUsed: true,
            recoveryUsed: recoveryUsed,
            stale: true,
            responseTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          };
        }
      } catch (cacheError) {
        logger.warn('Cache fallback failed', { error: cacheError.message });
      }
    }

    // Attempt generated fallback
    if (fallbackType && this.config.enableGeneratedFallback) {
      try {
        const fallbackResult = await this.generateFallbackContent(fallbackType, fallbackParams);
        if (fallbackResult) {
          fallbackUsed = true;
          logger.info('Serving generated fallback content', { fallbackType });

          return {
            data: fallbackResult,
            source: 'generated_fallback',
            fallbackUsed: true,
            recoveryUsed: recoveryUsed,
            responseTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          };
        }
      } catch (fallbackError) {
        logger.error('Generated fallback failed', {
          type: fallbackType,
          error: fallbackError.message
        });
      }
    }

    // Graceful degradation as last resort
    if (enableGracefulDegradation && this.config.enablePartialDegradation) {
      const degradedResult = await this.getDegradedContent(fallbackType);
      if (degradedResult) {
        logger.warn('Serving degraded content as final fallback', { fallbackType });

        return {
          data: degradedResult,
          source: 'degraded',
          fallbackUsed: true,
          recoveryUsed: recoveryUsed,
          degraded: true,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Complete failure - throw the last error
    logger.error('All fallback mechanisms exhausted', {
      lastError: lastError?.message,
      fallbackType,
      responseTime: Date.now() - startTime
    });

    throw new WordPressFallbackError(
      `WordPress content unavailable: ${lastError?.message || 'Unknown error'}`,
      {
        originalError: lastError,
        fallbackType,
        responseTime: Date.now() - startTime,
        allFallbacksExhausted: true
      }
    );
  }

  /**
   * Execute recovery strategy with retry logic
   */
  async executeRecoveryStrategy(operation, strategy, cacheKey) {
    let attempt = 1;
    const maxAttempts = strategy.maxAttempts || this.config.maxRetries;

    while (attempt <= maxAttempts) {
      try {
        logger.info(`Recovery attempt ${attempt}/${maxAttempts}`, {
          strategy: strategy.constructor.name
        });

        const result = await strategy.execute(operation, attempt, cacheKey);

        if (result) {
          logger.info(`Recovery successful on attempt ${attempt}`);
          return result;
        }

      } catch (error) {
        logger.warn(`Recovery attempt ${attempt} failed`, { error: error.message });

        if (attempt === maxAttempts) {
          throw error;
        }
      }

      attempt++;
    }

    return null;
  }

  /**
   * Get cached fallback content (including expired cache)
   */
  async getCachedFallback(cacheKey) {
    try {
      // Try regular cache first
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;

      // Try expired cache as fallback
      const expired = await this.cache.getExpired(cacheKey);
      if (expired) {
        logger.info('Using expired cache as fallback', { cacheKey });
        return expired;
      }

      return null;

    } catch (error) {
      logger.error('Cache fallback failed', { error: error.message, cacheKey });
      return null;
    }
  }

  /**
   * Generate fallback content based on type
   */
  async generateFallbackContent(type, params = {}) {
    const generator = this.fallbackGenerators.get(type);
    if (!generator) {
      logger.warn(`No fallback generator for type: ${type}`);
      return null;
    }

    try {
      logger.info(`Generating fallback content: ${type}`, params);
      return await generator.generate(params);

    } catch (error) {
      logger.error(`Fallback generation failed for ${type}`, { error: error.message });
      return null;
    }
  }

  /**
   * Generate fallback blog posts
   */
  async generateFallbackPosts(limit = 6) {
    const fallbackPosts = [];

    for (let i = 1; i <= limit; i++) {
      fallbackPosts.push({
        id: `fallback-${i}`,
        title: `Conteúdo em Manutenção`,
        slug: `manutencao-${i}`,
        excerpt: 'Nosso blog está temporariamente indisponível. Estamos trabalhando para restaurar o serviço o mais rápido possível.',
        content: `
          <div class="maintenance-notice">
            <h2>Serviço Temporariamente Indisponível</h2>
            <p>Nosso sistema de blog está passando por manutenção. Por favor, tente novamente em alguns minutos.</p>
            <p>Em caso de urgência, entre em contato conosco através dos canais oficiais:</p>
            <ul>
              <li>WhatsApp: (33) 99999-9999</li>
              <li>Email: contato@saraivavision.com.br</li>
              <li>Telefone: (33) 3321-1234</li>
            </ul>
          </div>
        `,
        publishedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        modifiedAt: new Date().toISOString(),
        status: 'fallback',
        author: {
          id: 'fallback-author',
          name: 'Equipe Saraiva Vision',
          slug: 'equipe',
          avatar: '/img/logo_prata.png'
        },
        categories: [{ id: 1, name: 'Avisos', slug: 'avisos' }],
        tags: [{ id: 1, name: 'Manutenção', slug: 'manutencao' }],
        featuredImage: {
          id: 'fallback-image',
          url: '/img/logo_prata.png',
          alt: 'Saraiva Vision - Oftalmologia'
        },
        seo: {
          title: 'Conteúdo em Manutenção - Saraiva Vision',
          description: 'Sistema temporariamente indisponível',
          canonical: `https://saraivavision.com.br/blog/manutencao-${i}`
        },
        _metadata: {
          source: 'fallback_generated',
          generatedAt: new Date().toISOString(),
          reason: 'wordpress_api_unavailable'
        }
      });
    }

    return fallbackPosts;
  }

  /**
   * Generate fallback single post
   */
  async generateFallbackPost(postId) {
    return {
      id: postId,
      title: 'Artigo Temporariamente Indisponível',
      slug: `post-${postId}`,
      excerpt: 'Este artigo está temporariamente indisponível devido à manutenção do sistema.',
      content: `
        <div class="post-maintenance-notice">
          <h1>Artigo Temporariamente Indisponível</h1>
          <p>O artigo que você está procurando não pode ser carregado no momento devido à manutenção do nosso sistema de blog.</p>
          <p><strong>O que você pode fazer:</strong></p>
          <ul>
            <li>Tente recarregar a página em alguns minutos</li>
            <li>Visite nossa <a href="/">página inicial</a> para mais conteúdo</li>
            <li>Entre em contato conosco se precisar de informações urgentes</li>
          </ul>

          <div class="contact-info">
            <h3>Contato de Emergência</h3>
            <p><strong>WhatsApp:</strong> (33) 99999-9999</p>
            <p><strong>Email:</strong> contato@saraivavision.com.br</p>
            <p><strong>Telefone:</strong> (33) 3321-1234</p>
          </div>

          <div class="services-preview">
            <h3>Nossos Serviços</h3>
            <p>Enquanto isso, conheça alguns de nossos principais serviços oftalmológicos:</p>
            <ul>
              <li>Consultas Oftalmológicas Completas</li>
              <li>Cirurgia de Catarata</li>
              <li>Tratamento de Glaucoma</li>
              <li>Cirurgia Refrativa (Miopia, Astigmatismo)</li>
              <li>Retina e Vítreo</li>
            </ul>
          </div>
        </div>
      `,
      publishedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      status: 'fallback',
      author: {
        id: 'fallback-author',
        name: 'Equipe Saraiva Vision',
        slug: 'equipe',
        avatar: '/img/logo_prata.png'
      },
      categories: [{ id: 1, name: 'Avisos', slug: 'avisos' }],
      tags: [{ id: 1, name: 'Manutenção', slug: 'manutencao' }],
      featuredImage: {
        id: 'fallback-image',
        url: '/img/logo_prata.png',
        alt: 'Saraiva Vision - Sistema em Manutenção'
      },
      seo: {
        title: 'Artigo Indisponível - Saraiva Vision',
        description: 'Artigo temporariamente indisponível devido à manutenção',
        canonical: `https://saraivavision.com.br/blog/post-${postId}`
      },
      _metadata: {
        source: 'fallback_generated',
        generatedAt: new Date().toISOString(),
        originalId: postId,
        reason: 'wordpress_api_unavailable'
      }
    };
  }

  /**
   * Generate fallback categories
   */
  async generateFallbackCategories() {
    return [
      { id: 1, name: 'Oftalmologia', slug: 'oftalmologia', description: 'Artigos sobre oftalmologia', count: 0 },
      { id: 2, name: 'Tratamentos', slug: 'tratamentos', description: 'Informações sobre tratamentos', count: 0 },
      { id: 3, name: 'Prevenção', slug: 'prevencao', description: 'Dicas de prevenção ocular', count: 0 },
      { id: 4, name: 'Tecnologia', slug: 'tecnologia', description: 'Avanços tecnológicos', count: 0 },
      { id: 5, name: 'Avisos', slug: 'avisos', description: 'Avisos importantes', count: 0 }
    ];
  }

  /**
   * Generate fallback tags
   */
  async generateFallbackTags() {
    return [
      { id: 1, name: 'Catarata', slug: 'catarata' },
      { id: 2, name: 'Glaucoma', slug: 'glaucoma' },
      { id: 3, name: 'Miopia', slug: 'miopia' },
      { id: 4, name: 'Astigmatismo', slug: 'astigmatismo' },
      { id: 5, name: 'Retina', slug: 'retina' },
      { id: 6, name: 'Manutenção', slug: 'manutencao' }
    ];
  }

  /**
   * Get degraded content (minimal content for emergency situations)
   */
  async getDegradedContent(type) {
    switch (type) {
      case 'posts':
        return [{
          id: 'emergency-notice',
          title: 'Sistema Temporariamente Indisponível',
          excerpt: 'Estamos enfrentando problemas técnicos. Tente novamente em breve.',
          status: 'degraded'
        }];

      case 'post':
        return {
          id: 'emergency-post',
          title: 'Conteúdo Indisponível',
          content: '<p>Este conteúdo não está disponível no momento. Tente novamente mais tarde.</p>',
          status: 'degraded'
        };

      case 'categories':
        return [{ id: 1, name: 'Geral', slug: 'geral' }];

      case 'tags':
        return [{ id: 1, name: 'Geral', slug: 'geral' }];

      default:
        return null;
    }
  }

  /**
   * Update service health status
   */
  updateServiceHealth(service, status) {
    this.serviceHealth[service] = status;
    this.serviceHealth.last_check = new Date().toISOString();

    logger.info('Service health updated', {
      service,
      status,
      overall: this.serviceHealth
    });
  }

  /**
   * Get current service health
   */
  getServiceHealth() {
    return {
      ...this.serviceHealth,
      overall_status: this.calculateOverallHealth(),
      circuit_breaker: this.circuitBreaker.getStatus()
    };
  }

  /**
   * Calculate overall system health
   */
  calculateOverallHealth() {
    const services = ['wordpress_api', 'cache_service', 'fallback_service'];
    const statuses = services.map(s => this.serviceHealth[s]);

    if (statuses.includes('unhealthy')) {
      return 'degraded';
    } else if (statuses.every(s => s === 'healthy')) {
      return 'healthy';
    } else {
      return 'partial';
    }
  }

  /**
   * Test all fallback mechanisms
   */
  async testFallbackMechanisms() {
    const testResults = {
      cache_fallback: false,
      generated_fallback: false,
      degraded_content: false,
      circuit_breaker: false,
      recovery_strategies: {}
    };

    try {
      // Test cache fallback
      await this.getCachedFallback('test-key');
      testResults.cache_fallback = true;
    } catch (error) {
      logger.warn('Cache fallback test failed', { error: error.message });
    }

    try {
      // Test generated fallback
      await this.generateFallbackContent('posts', { limit: 1 });
      testResults.generated_fallback = true;
    } catch (error) {
      logger.warn('Generated fallback test failed', { error: error.message });
    }

    try {
      // Test degraded content
      await this.getDegradedContent('posts');
      testResults.degraded_content = true;
    } catch (error) {
      logger.warn('Degraded content test failed', { error: error.message });
    }

    try {
      // Test circuit breaker
      const cbStatus = this.circuitBreaker.getStatus();
      testResults.circuit_breaker = cbStatus.isOperational;
    } catch (error) {
      logger.warn('Circuit breaker test failed', { error: error.message });
    }

    // Test recovery strategies
    for (const [name, strategy] of this.recoveryStrategies) {
      try {
        testResults.recovery_strategies[name] = true;
      } catch (error) {
        logger.warn(`Recovery strategy test failed: ${name}`, { error: error.message });
        testResults.recovery_strategies[name] = false;
      }
    }

    return testResults;
  }
}

/**
 * Custom error class for WordPress fallback failures
 */
export class WordPressFallbackError extends Error {
  constructor(message, metadata = {}) {
    super(message);
    this.name = 'WordPressFallbackError';
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }
}

// Create singleton instance
export const wordPressFallbackManager = new WordPressFallbackManager();

export default wordPressFallbackManager;