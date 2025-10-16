import React, { createContext, useContext, useMemo } from 'react';
import createConfig from './createConfig.js';

const ConfigContext = createContext(null);

/**
 * Provides a configuration object to descendant components via React context.
 *
 * If `value` is provided, that configuration is used; otherwise a default
 * configuration is created and provided instead.
 *
 * @param {{children: import('react').ReactNode, value?: object}} props
 * @param {import('react').ReactNode} props.children - Elements that will receive the configuration via context.
 * @param {object} [props.value] - Optional configuration to provide to descendants.
 * @returns {import('react').JSX.Element} The context provider element wrapping `children`.
 */
export function ConfigProvider({ children, value }) {
  const resolvedConfig = useMemo(() => value || createConfig(), [value]);
  return <ConfigContext.Provider value={resolvedConfig}>{children}</ConfigContext.Provider>;
}

/**
 * Accesses the current configuration from the nearest ConfigProvider.
 *
 * @returns {object} The configuration object provided by ConfigProvider.
 * @throws {Error} If called outside of a ConfigProvider.
 */
export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export default ConfigProvider;