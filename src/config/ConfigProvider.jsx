import React, { createContext, useContext, useMemo } from 'react';
import createConfig from './createConfig.js';

const ConfigContext = createContext(null);

/**
 * Provides a configuration object to descendant components via React context.
 *
 * The component supplies either the `value` prop or a default configuration to the context
 * and memoizes the resolved configuration so it remains stable across renders unless `value` changes.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elements rendered inside the provider.
 * @param {object} [props.value] - Optional configuration object to provide; if omitted a default configuration is created.
 * @returns {JSX.Element} The context provider wrapping the given children.
 */
export function ConfigProvider({ children, value }) {
  const resolvedConfig = useMemo(() => value || createConfig(), [value]);
  return <ConfigContext.Provider value={resolvedConfig}>{children}</ConfigContext.Provider>;
}

/**
 * Retrieve the configuration object supplied by the nearest ConfigProvider.
 *
 * @returns {object} The configuration object from context.
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