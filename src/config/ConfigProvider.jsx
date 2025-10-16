import React, { createContext, useContext, useMemo } from 'react';
import createConfig from './createConfig.js';

const ConfigContext = createContext(null);

/**
 * Provides a stable configuration object to descendant components via context.
 * @param {{children: import('react').ReactNode, value?: any}} props
 * @param {import('react').ReactNode} props.children - Elements rendered inside the provider.
 * @param {any} [props.value] - Optional configuration to supply; when omitted a default configuration is created.
 * @returns {import('react').JSX.Element} A ConfigContext.Provider element that supplies the resolved configuration to its descendants.
 */
export function ConfigProvider({ children, value }) {
  const resolvedConfig = useMemo(() => value || createConfig(), [value]);
  return <ConfigContext.Provider value={resolvedConfig}>{children}</ConfigContext.Provider>;
}

/**
 * Retrieve the resolved configuration from the ConfigContext for the calling component.
 *
 * @returns {Object} The resolved configuration object provided by ConfigProvider.
 * @throws {Error} If called outside a ConfigProvider — throws "useConfig must be used within a ConfigProvider".
 */
export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export default ConfigProvider;