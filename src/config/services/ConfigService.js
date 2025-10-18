/**
 * ConfigService - Camada de Serviços de Configuração
 *
 * Fornece interface unificada para acessar configurações do sistema
 * com validação, cache e segurança integrados.
 *
 * @version 1.0.0
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-18
 */

import { config } from '../config.base.js';

/**
 * Classe de serviço para gerenciamento de configurações
 */
class ConfigService {
  constructor(baseConfig = config) {
    this._config = baseConfig;
    this._cache = new Map();
    this._validators = new Map();
    this._initialized = false;
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
      // Validar configurações essenciais
      this._validateRequiredConfig();

      // Marcar como inicializado
      this._initialized = true;

      console.log('[ConfigService] Initialized successfully');
    } catch (error) {
      console.error('[ConfigService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Valida configurações obrigatórias
   * @private
   */
  _validateRequiredConfig() {
    const required = [
      'site.name',
      'site.domain',
      'business.name',
      'business.address.street',
      'business.phone.primary.e164',
      'business.email.primary'
    ];

    const missing = [];

    for (const path of required) {
      const value = this.get(path);
      if (!value) {
        missing.push(path);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Obtém valor de configuração por caminho (dot notation)
   * @param {string} path - Caminho da configuração (ex: 'business.phone.primary.e164')
   * @param {*} defaultValue - Valor padrão se não encontrado
   * @returns {*}
   */
  get(path, defaultValue = null) {
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
   * Define valor de configuração (runtime only)
   * @param {string} path - Caminho da configuração
   * @param {*} value - Novo valor
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this._config;

    // Navegar até o objeto pai
    for (const key of keys) {
      if (!(key in target)) {
        target[key] = {};
      }
      target = target[key];
    }

    // Definir valor
    target[lastKey] = value;

    // Limpar cache para este caminho
    this._cache.delete(path);

    console.log(`[ConfigService] Set ${path} =`, value);
  }

  /**
   * Obtém toda a seção de configuração
   * @param {string} section - Nome da seção (site, business, etc.)
   * @returns {object}
   */
  getSection(section) {
    return this._config[section] || {};
  }

  /**
   * Verifica se está em ambiente de produção
   * @returns {boolean}
   */
  isProduction() {
    return this._config.environment === 'production';
  }

  /**
   * Verifica se está em ambiente de desenvolvimento
   * @returns {boolean}
   */
  isDevelopment() {
    return this._config.environment === 'development';
  }

  /**
   * Obtém URL base do site
   * @returns {string}
   */
  getBaseUrl() {
    return this.get('site.baseUrl');
  }

  /**
   * Obtém informações da clínica (NAP)
   * @returns {object}
   */
  getBusinessInfo() {
    return this.getSection('business');
  }

  /**
   * Obtém endereço formatado
   * @param {string} format - Formato desejado (short, medium, long, full)
   * @returns {string}
   */
  getFormattedAddress(format = 'medium') {
    return this.get(`business.address.formatted.${format}`, '');
  }

  /**
   * Obtém telefone formatado
   * @param {string} format - Formato desejado (display, e164, etc.)
   * @returns {string}
   */
  getFormattedPhone(format = 'display') {
    return this.get(`business.phone.primary.${format}`, '');
  }

  /**
   * Obtém URL do WhatsApp com mensagem
   * @param {string} message - Mensagem opcional
   * @returns {string}
   */
  getWhatsAppUrl(message = null) {
    const baseHref = this.get('business.phone.whatsapp.href');
    const defaultMessage = this.get('business.phone.whatsapp.defaultMessage');

    const finalMessage = message || defaultMessage;
    return `${baseHref}?text=${encodeURIComponent(finalMessage)}`;
  }

  /**
   * Obtém configurações de analytics
   * @returns {object}
   */
  getTrackingConfig() {
    return this.getSection('tracking');
  }

  /**
   * Verifica se feature flag está ativa
   * @param {string} flagName - Nome da feature flag
   * @returns {boolean}
   */
  isFeatureEnabled(flagName) {
    return this.get(`featureFlags.${flagName}`, false);
  }

  /**
   * Obtém configuração de API externa
   * @param {string} apiName - Nome da API (googleMaps, supabase, etc.)
   * @returns {object}
   */
  getApiConfig(apiName) {
    return this.get(`site.apis.${apiName}`, {});
  }

  /**
   * Obtém configurações de tema
   * @returns {object}
   */
  getTheme() {
    return this.getSection('theme');
  }

  /**
   * Obtém configurações de SEO
   * @param {string} page - Página específica (opcional)
   * @returns {object}
   */
  getSeoConfig(page = null) {
    const baseSeo = this.getSection('seo');

    if (page && this.get(`seo.pages.${page}`)) {
      return {
        ...baseSeo,
        ...this.get(`seo.pages.${page}`)
      };
    }

    return baseSeo;
  }

  /**
   * Obtém configurações de compliance
   * @returns {object}
   */
  getComplianceConfig() {
    return this.getSection('compliance');
  }

  /**
   * Obtém configurações de internacionalização
   * @returns {object}
   */
  getI18nConfig() {
    return this.getSection('i18n');
  }

  /**
   * Obtém locale padrão
   * @returns {string}
   */
  getDefaultLocale() {
    return this.get('i18n.defaultLocale', 'pt-br');
  }

  /**
   * Valida URL de agendamento
   * @param {string} url - URL para validar
   * @returns {boolean}
   */
  validateSchedulingUrl(url = null) {
    const urlToValidate = url || this.get('business.urls.onlineScheduling');

    try {
      const urlObj = new URL(urlToValidate);

      // Verificar HTTPS
      if (urlObj.protocol !== 'https:') {
        console.error('URL must use HTTPS');
        return false;
      }

      // Verificar domínio
      if (!urlObj.hostname.includes('saraivavision.com.br')) {
        console.error('URL must be from saraivavision.com.br domain');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Invalid scheduling URL:', error);
      return false;
    }
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
    console.log('[ConfigService] Cache cleared');
  }

  /**
   * Exporta configurações para debug
   * @returns {object}
   */
  debug() {
    return {
      environment: this._config.environment,
      initialized: this._initialized,
      cacheSize: this._cache.size,
      config: this._config
    };
  }

  /**
   * Valida configurações de segurança
   * @returns {object}
   */
  validateSecurity() {
    const validation = {
      isValid: true,
      warnings: [],
      errors: []
    };

    // Verificar HTTPS em produção
    if (this.isProduction()) {
      const baseUrl = this.getBaseUrl();
      if (!baseUrl.startsWith('https://')) {
        validation.errors.push('Production baseUrl must use HTTPS');
        validation.isValid = false;
      }
    }

    // Verificar configurações de API
    const googleMapsKey = this.get('site.apis.googleMaps.apiKey');
    if (!googleMapsKey) {
      validation.warnings.push('Google Maps API key not configured');
    }

    const supabaseUrl = this.get('site.apis.supabase.url');
    if (!supabaseUrl) {
      validation.warnings.push('Supabase URL not configured');
    }

    // Verificar compliance LGPD
    const dpoEmail = this.get('compliance.lgpd.dpoEmail');
    if (!dpoEmail) {
      validation.errors.push('DPO email not configured (LGPD requirement)');
      validation.isValid = false;
    }

    return validation;
  }
}

// Singleton instance
const configService = new ConfigService();

// Export singleton
export default configService;

// Export class for testing
export { ConfigService };
