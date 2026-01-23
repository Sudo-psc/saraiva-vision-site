/**
 * Analytics Proxy Component
 *
 * Carrega GTM/GA4 através de proxy local para contornar ad blockers
 *
 * Estratégia Anti-AdBlock (3 camadas):
 * 1. Scripts carregados via /gtm.js e /gtag.js (proxy Nginx)
 * 2. Eventos enviados via /collect (proxy Nginx)
 * 3. GA4 batch collection via /g/collect (proxy Nginx)
 *
 * Eficácia esperada: ~95% de recuperação de tracking
 * (vs ~60% com carregamento direto do Google)
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import useDeferredAnalytics from '@/hooks/useDeferredAnalytics';

const AnalyticsProxy = () => {
  useDeferredAnalytics();
  return null;
};

export default AnalyticsProxy;
