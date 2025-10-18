/**
 * ConfigProvider - React Context Provider para Configurações
 *
 * Fornece acesso centralizado às configurações da aplicação
 * através de React Context API.
 *
 * @version 2.0.0
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-18
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import configService from './services/ConfigService.js';
import createConfig from './createConfig.js';

// Criar contexto
const ConfigContext = createContext(null);

/**
 * Provider de configurações para a aplicação
 * @param {object} props - Props do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 * @param {object} props.value - Configuração legacy (compatibilidade)
 * @param {object} props.overrides - Sobrescritas de configuração (opcional)
 */
export function ConfigProvider({ children, value, overrides = {} }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Suporte a formato legacy (value prop)
  const legacyConfig = useMemo(() => value || createConfig(), [value]);

  // Inicializar ConfigService
  useEffect(() => {
    const init = async () => {
      try {
        // Aplicar overrides se fornecidos
        if (Object.keys(overrides).length > 0) {
          Object.entries(overrides).forEach(([path, valueItem]) => {
            configService.set(path, valueItem);
          });
        }

        // Inicializar serviço
        await configService.initialize();
        setInitialized(true);
      } catch (err) {
        console.error('[ConfigProvider] Initialization error:', err);
        setError(err);
      }
    };

    init();
  }, [overrides]);

  // Criar contexto value memoizado (compatibilidade legacy + novo sistema)
  const contextValue = useMemo(
    () => ({
      // Sistema novo
      configService,
      initialized,
      error,

      // Compatibilidade legacy
      ...legacyConfig
    }),
    [initialized, error, legacyConfig]
  );

  // Mostrar erro se inicialização falhar (apenas em desenvolvimento)
  if (error && configService.isDevelopment()) {
    return (
      <div style={{ padding: '20px', border: '2px solid red', margin: '20px' }}>
        <h2>Configuration Error</h2>
        <p>{error.message}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}

ConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.object,
  overrides: PropTypes.object
};

/**
 * Hook para acessar configurações
 * @returns {object} Objeto com funções de acesso às configurações
 */
export function useConfig() {
  const context = useContext(ConfigContext);

  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }

  const { configService: service } = context;

  // Se ConfigService não estiver disponível, retornar contexto legacy
  if (!service) {
    return context;
  }

  return {
    // Métodos básicos
    get: (path, defaultValue) => service.get(path, defaultValue),
    getSection: (section) => service.getSection(section),
    isFeatureEnabled: (flagName) => service.isFeatureEnabled(flagName),

    // Ambiente
    isProduction: () => service.isProduction(),
    isDevelopment: () => service.isDevelopment(),
    getBaseUrl: () => service.getBaseUrl(),

    // Business (NAP)
    business: service.getBusinessInfo(),
    getFormattedAddress: (format) => service.getFormattedAddress(format),
    getFormattedPhone: (format) => service.getFormattedPhone(format),
    getWhatsAppUrl: (message) => service.getWhatsAppUrl(message),

    // Site
    site: service.getSection('site'),

    // Tracking
    tracking: service.getTrackingConfig(),

    // Tema
    theme: service.getTheme(),

    // SEO
    getSeoConfig: (page) => service.getSeoConfig(page),

    // APIs
    getApiConfig: (apiName) => service.getApiConfig(apiName),

    // i18n
    i18n: service.getI18nConfig(),
    getDefaultLocale: () => service.getDefaultLocale(),

    // Compliance
    compliance: service.getComplianceConfig(),

    // Utilities
    validateSchedulingUrl: (url) => service.validateSchedulingUrl(url),
    validateSecurity: () => service.validateSecurity(),

    // Debug
    debug: () => service.debug(),
    getFullConfig: () => service.getFullConfig(),

    // Compatibilidade legacy
    ...context
  };
}

// Export default para compatibilidade
export default ConfigProvider;
