/**
 * BackendConfigService - Camada de Serviços de Configuração Backend
 *
 * Centraliza todas as configurações do backend API com validação,
 * cache e segurança integrados.
 *
 * @version 1.0.0
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-18
 */

/**
 * Classe de serviço para gerenciamento centralizado de configurações do backend
 */
class BackendConfigService {
  constructor() {
    this._config = null;
    this._cache = new Map();
    this._initialized = false;
    this._lastValidation = null;
  }

  /**
   * Inicializa o serviço de configuração
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) {
      return;
    }

    try {
      // Carregar configurações
      this._config = this._loadConfig();
      
      // Validar configurações essenciais
      this._validateRequiredConfig();
      
      // Validar segurança
      this._validateSecurity();
      
      // Marcar como inicializado
      this._initialized = true;

      console.log('[BackendConfigService] Initialized successfully');
    } catch (error) {
      console.error('[BackendConfigService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Carrega configurações de variáveis de ambiente
   * @private
   * @returns {object}
   */
  _loadConfig() {
    return {
      // Environment
      environment: process.env.NODE_ENV || 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isDevelopment: process.env.NODE_ENV === 'development',

      // Email Service Configuration
      email: {
        resend: {
          apiKey: process.env.RESEND_API_KEY,
          fromEmail: process.env.CONTACT_EMAIL_FROM || 'noreply@saraivavision.com.br',
          doctorEmail: process.env.DOCTOR_EMAIL || 'philipe_cruz@outlook.com'
        },
        validation: {
          requireRecaptcha: process.env.NODE_ENV === 'production',
          rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
          rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 5
        }
      },

      // Analytics Configuration
      analytics: {
        posthog: {
          apiKey: process.env.POSTHOG_API_KEY,
          projectId: process.env.POSTHOG_PROJECT_ID,
          host: process.env.POSTHOG_HOST || 'https://app.posthog.com'
        }
      },

      // Google Services Configuration
      google: {
        maps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
          placesApiKey: process.env.GOOGLE_PLACES_API_KEY,
          placeId: process.env.GOOGLE_PLACE_ID
        },
        gemini: {
          apiKey: process.env.GOOGLE_GEMINI_API_KEY
        }
      },

      // WordPress Configuration
      wordpress: {
        graphqlEndpoint: process.env.WORDPRESS_GRAPHQL_ENDPOINT,
        domain: process.env.WORDPRESS_DOMAIN,
        revalidateSecret: process.env.WP_REVALIDATE_SECRET,
        webhookSecret: process.env.WP_WEBHOOK_SECRET
      },

      // Security Configuration
      security: {
        cors: {
          allowedOrigins: this._parseAllowedOrigins(),
          credentials: true
        },
        rateLimiting: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 100
        },
        recaptcha: {
          secretKey: process.env.RECAPTCHA_SECRET_KEY
        }
      },

      // Instagram Configuration
      instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        fallbackEnabled: true
      },

      // Cron Jobs Configuration
      cron: {
        secret: process.env.CRON_SECRET
      },

      // Health Check Configuration
      health: {
        timeout: 5000,
        retries: 3
      }
    };
  }

  /**
   * Parse allowed origins from environment
   * @private
   * @returns {string[]}
   */
  _parseAllowedOrigins() {
    const originsEnv = process.env.ALLOWED_ORIGINS;
    if (!originsEnv) {
      // Default origins based on environment
      if (process.env.NODE_ENV === 'production') {
        return ['https://saraivavision.com.br', 'https://www.saraivavision.com.br'];
      }
      return ['http://localhost:3000', 'http://localhost:5173'];
    }
    
    return originsEnv.split(',').map(origin => origin.trim());
  }

  /**
   * Valida configurações obrigatórias
   * @private
   */
  _validateRequiredConfig() {
    const required = [
      'email.resend.apiKey',
      'email.resend.doctorEmail',
      'analytics.posthog.apiKey',
      'analytics.posthog.projectId',
      'google.maps.apiKey',
      'google.maps.placeId'
    ];

    const missing = [];
    const warnings = [];

    for (const path of required) {
      const value = this.get(path);
      if (!value || value === 'your_' + path.split('.').pop() + '_here') {
        if (this.isProduction()) {
          missing.push(path);
        } else {
          warnings.push(`${path} not configured or using placeholder value`);
        }
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration: ${missing.join(', ')}`
      );
    }

    if (warnings.length > 0) {
      console.warn('[BackendConfigService] Warnings:', warnings);
    }

    this._lastValidation = {
      timestamp: new Date().toISOString(),
      missing,
      warnings,
      isValid: missing.length === 0
    };
  }

  /**
   * Valida configurações de segurança
   * @private
   */
  _validateSecurity() {
    const validation = {
      isValid: true,
      warnings: [],
      errors: []
    };

    // Verificar HTTPS em produção
    if (this.isProduction()) {
      const allowedOrigins = this.get('security.cors.allowedOrigins');
      const hasInsecureOrigins = allowedOrigins.some(origin => 
        origin.startsWith('http://')
      );

      if (hasInsecureOrigins) {
        validation.errors.push('HTTP origins not allowed in production');
        validation.isValid = false;
      }
    }

    // Verificar configurações de rate limiting
    const rateLimitMax = this.get('security.rateLimiting.maxRequests');
    if (rateLimitMax > 1000) {
      validation.warnings.push('Very high rate limit may impact security');
    }

    // Verificar segredos obrigatórios em produção
    if (this.isProduction()) {
      const cronSecret = this.get('cron.secret');
      if (!cronSecret) {
        validation.errors.push('CRON_SECRET is required in production');
        validation.isValid = false;
      }
    }

    if (!validation.isValid) {
      throw new Error(
        `Security validation failed: ${validation.errors.join(', ')}`
      );
    }

    if (validation.warnings.length > 0) {
      console.warn('[BackendConfigService] Security warnings:', validation.warnings);
    }
  }

  /**
   * Obtém valor de configuração por caminho (dot notation)
   * @param {string} path - Caminho da configuração (ex: 'email.resend.apiKey')
   * @param {*} defaultValue - Valor padrão se não encontrado
   * @returns {*}
   */
  get(path, defaultValue = null) {
    if (!this._initialized) {
      throw new Error('BackendConfigService not initialized. Call initialize() first.');
    }

    // Verificar cache primeiro
    if (this._cache.has(path)) {
      return this._cache.get(path);
    }

    // Navegação por dot notation
    const keys = path.split('.');
    let value = this._config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        value = defaultValue;
        break;
      }
    }

    // Armazenar em cache
    this._cache.set(path, value);

    return value;
  }

  /**
   * Obtém toda a seção de configuração
   * @param {string} section - Nome da seção (email, analytics, etc.)
   * @returns {object}
   */
  getSection(section) {
    return this.get(section) || {};
  }

  /**
   * Verifica se está em ambiente de produção
   * @returns {boolean}
   */
  isProduction() {
    return this.get('isProduction', false);
  }

  /**
   * Verifica se está em ambiente de desenvolvimento
   * @returns {boolean}
   */
  isDevelopment() {
    return this.get('isDevelopment', false);
  }

  /**
   * Obtém configurações de email
   * @returns {object}
   */
  getEmailConfig() {
    return this.getSection('email');
  }

  /**
   * Obtém configurações de analytics
   * @returns {object}
   */
  getAnalyticsConfig() {
    return this.getSection('analytics');
  }

  /**
   * Obtém configurações do Google Maps
   * @returns {object}
   */
  getGoogleMapsConfig() {
    return this.get('google.maps', {});
  }

  /**
   * Obtém configurações de segurança
   * @returns {object}
   */
  getSecurityConfig() {
    return this.getSection('security');
  }

  /**
   * Obtém configurações CORS
   * @returns {object}
   */
  getCorsConfig() {
    return this.get('security.cors', {});
  }

  /**
   * Obtém configurações de rate limiting
   * @returns {object}
   */
  getRateLimitConfig() {
    return this.get('security.rateLimiting', {});
  }

  /**
   * Obtém configurações de reCAPTCHA
   * @returns {object}
   */
  getRecaptchaConfig() {
    return this.get('security.recaptcha', {});
  }

  /**
   * Valida configuração de email
   * @returns {object}
   */
  validateEmailConfig() {
    const emailConfig = this.getEmailConfig();
    const errors = [];

    if (!emailConfig.resend?.apiKey) {
      errors.push('RESEND_API_KEY environment variable is not set');
    }

    if (!emailConfig.resend?.doctorEmail) {
      errors.push('DOCTOR_EMAIL environment variable is not set');
    }

    if (!emailConfig.resend?.fromEmail) {
      errors.push('CONTACT_EMAIL_FROM environment variable is not set');
    }

    return {
      isValid: errors.length === 0,
      errors,
      config: {
        apiKey: !!emailConfig.resend?.apiKey,
        doctorEmail: emailConfig.resend?.doctorEmail,
        fromEmail: emailConfig.resend?.fromEmail,
        resendConfigured: !!emailConfig.resend?.apiKey
      }
    };
  }

  /**
   * Valida configuração do Google Maps
   * @returns {object}
   */
  validateGoogleMapsConfig() {
    const mapsConfig = this.getGoogleMapsConfig();
    const errors = [];

    if (!mapsConfig.apiKey) {
      errors.push('Google Maps API key not configured');
    }

    if (!mapsConfig.placeId) {
      errors.push('Google Place ID not configured');
    }

    // Verificar se está usando placeholder
    if (mapsConfig.apiKey === 'your_google_maps_api_key_here') {
      errors.push('Google Maps API key using placeholder value');
    }

    if (mapsConfig.placeId === 'your_google_place_id_here') {
      errors.push('Google Place ID using placeholder value');
    }

    return {
      isValid: errors.length === 0,
      errors,
      config: {
        apiKey: !!mapsConfig.apiKey,
        placeId: !!mapsConfig.placeId,
        configured: errors.length === 0
      }
    };
  }

  /**
   * Obtém configuração completa (uso em testes)
   * @returns {object}
   */
  getFullConfig() {
    return this._config;
  }

  /**
   * Limpa cache de configurações
   */
  clearCache() {
    this._cache.clear();
    console.log('[BackendConfigService] Cache cleared');
  }

  /**
   * Exporta configurações para debug
   * @returns {object}
   */
  debug() {
    return {
      environment: this.get('environment'),
      initialized: this._initialized,
      cacheSize: this._cache.size,
      lastValidation: this._lastValidation,
      configKeys: Object.keys(this._config || {})
    };
  }

  /**
   * Verifica saúde das configurações
   * @returns {object}
   */
  healthCheck() {
    const checks = {
      email: this.validateEmailConfig(),
      googleMaps: this.validateGoogleMapsConfig(),
      initialized: this._initialized,
      environment: this.get('environment')
    };

    const allHealthy = Object.values(checks).every(check => 
      typeof check === 'object' ? check.isValid !== false : check === true
    );

    return {
      healthy: allHealthy,
      checks,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
const backendConfigService = new BackendConfigService();

// Export singleton
export default backendConfigService;

// Export class for testing
export { BackendConfigService };
