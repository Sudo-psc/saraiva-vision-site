/**
 * Configuração Centralizada - Exports Principais
 *
 * @version 2.0.0
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-18
 */

// React Components e Hooks
export { ConfigProvider, useConfig } from './ConfigProvider.jsx';

// Configuração base
export { config, business, site, theme, seo, tracking, featureFlags, compliance, performance, i18n, isProduction, isDevelopment, getEnv } from './config.base.js';

// Serviços
export { default as configService, ConfigService } from './services/ConfigService.js';

// Legacy support
export { default as createConfig } from './createConfig.js';
