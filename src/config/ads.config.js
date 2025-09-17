/**
 * Configuração para detecção de ads e bloqueadores
 * Permite desabilitar funcionalidades que geram erros de console
 */

export const adsConfig = {
  // Habilitar detecção apenas em produção
  enableDetection: process.env.NODE_ENV === 'production',
  // Desabilita sondagens de rede que podem gerar erros ruidosos no console
  enableNetworkProbe: false,
  
  // Comportamento quando detecção está desabilitada
  fallbackBehavior: 'silent',
  
  // Número de tentativas antes de desistir
  retryAttempts: import.meta.env.DEV ? 0 : 1,
  
  // Timeout para requests de detecção
  requestTimeout: 1500,
  
  // URLs que devem ser ignoradas em desenvolvimento
  skipUrls: [
    'google-analytics.com',
    'googletagservices.com',
    'ads-twitter.com'
  ],
  
  // Console logging level
  logLevel: import.meta.env.DEV ? 'debug' : 'error'
};

export default adsConfig;
