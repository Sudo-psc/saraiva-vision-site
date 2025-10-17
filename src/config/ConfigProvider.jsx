import React, { createContext, useContext, useMemo } from 'react';
import createConfig from './createConfig.js';

const ConfigContext = createContext(null);

export function ConfigProvider({ children, value }) {
  const resolvedConfig = useMemo(() => value || createConfig(), [value]);
  return <ConfigContext.Provider value={resolvedConfig}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export default ConfigProvider;
