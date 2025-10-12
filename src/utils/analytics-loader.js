/**
 * Analytics Loader - Resilient GTM/GA Loading
 *
 * Carregamento robusto de Google Tag Manager e Google Analytics com:
 * - Timeout para prevenir bloqueios
 * - Circuit breaker para AdBlockers
 * - Fallback para analytics alternativo
 * - Detecção de AdBlock
 * - Modo degradado gracioso
 *
 * @author Dr. Philipe Saraiva Cruz
 * @priority P1 - Important
 */

import { CircuitBreaker } from './fetch-with-retry.js';

/**
 * Configuração de analytics
 */
const ANALYTICS_CONFIG = {
  gtm: {
    id: import.meta.env.VITE_GTM_ID || 'GTM-KF2NP85D',
    timeout: 5000, // 5s timeout
    url: 'https://www.googletagmanager.com/gtm.js'
  },
  ga: {
    id: import.meta.env.VITE_GA_ID || 'G-LXWRK8ELS6',
    timeout: 5000,
    url: 'https://www.google-analytics.com/analytics.js'
  },
  posthog: {
    key: import.meta.env.VITE_POSTHOG_KEY || 'phc_bpyxyy0AVVh2E9LhjkDfZhi2vlfEsQhOBkijyjvyRSp',
    host: 'https://app.posthog.com',
    enabled: true // Fallback sempre ativo
  }
};

/**
 * Circuit breakers para analytics
 */
const analyticsCircuitBreakers = {
  gtm: new CircuitBreaker({ failureThreshold: 2, timeout: 300000 }), // 5 min
  ga: new CircuitBreaker({ failureThreshold: 2, timeout: 300000 })
};

/**
 * Estado de carregamento de analytics
 */
const analyticsState = {
  gtmLoaded: false,
  gaLoaded: false,
  posthogLoaded: false,
  adBlockDetected: false,
  errors: []
};

/**
 * Carrega um script externo com timeout
 *
 * @param {string} url - URL do script
 * @param {number} timeout - Timeout em ms
 * @param {Object} attributes - Atributos adicionais para a tag script
 * @returns {Promise<void>}
 */
function loadScriptWithTimeout(url, timeout, attributes = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = url;

    // Adiciona atributos customizados
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    let timeoutId;
    let resolved = false;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      script.onload = null;
      script.onerror = null;
    };

    const handleSuccess = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    };

    const handleError = (error) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      document.head.removeChild(script);
      reject(error);
    };

    // Timeout handler
    timeoutId = setTimeout(() => {
      handleError(new Error(`Script load timeout: ${url}`));
    }, timeout);

    // Success handler
    script.onload = handleSuccess;

    // Error handler
    script.onerror = () => {
      handleError(new Error(`Script load error: ${url}`));
    };

    // Adiciona ao DOM
    document.head.appendChild(script);
  });
}

/**
 * Detecta presença de AdBlocker
 *
 * @returns {Promise<boolean>} true se AdBlock detectado
 */
async function detectAdBlock() {
  try {
    // Tenta carregar um pixel do Google Analytics
    const testUrl = 'https://www.google-analytics.com/analytics.js';
    const response = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
    return false;
  } catch (error) {
    return true;
  }
}

/**
 * Carrega Google Tag Manager
 *
 * @returns {Promise<boolean>} true se carregado com sucesso
 */
export async function loadGTM() {
  const { gtm } = ANALYTICS_CONFIG;

  // Verifica circuit breaker
  if (!analyticsCircuitBreakers.gtm.canRequest()) {
    analyticsState.errors.push({
      service: 'GTM',
      error: 'Circuit breaker OPEN',
      timestamp: new Date().toISOString()
    });
    return false;
  }

  try {
    // Inicializa dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // Carrega script com timeout
    const gtmUrl = `${gtm.url}?id=${gtm.id}`;
    await loadScriptWithTimeout(gtmUrl, gtm.timeout, {
      'data-gtm-id': gtm.id,
      crossorigin: 'anonymous'
    });

    analyticsState.gtmLoaded = true;
    analyticsCircuitBreakers.gtm.recordSuccess();
    return true;

  } catch (error) {
    analyticsCircuitBreakers.gtm.recordFailure();
    analyticsState.errors.push({
      service: 'GTM',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Carrega Google Analytics (fallback se GTM falhar)
 *
 * @returns {Promise<boolean>} true se carregado com sucesso
 */
export async function loadGA() {
  const { ga } = ANALYTICS_CONFIG;

  // Verifica circuit breaker
  if (!analyticsCircuitBreakers.ga.canRequest()) {
    analyticsState.errors.push({
      service: 'GA',
      error: 'Circuit breaker OPEN',
      timestamp: new Date().toISOString()
    });
    return false;
  }

  try {
    // Inicializa gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', ga.id, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    // Carrega script com timeout
    const gaUrl = `https://www.googletagmanager.com/gtag/js?id=${ga.id}`;
    await loadScriptWithTimeout(gaUrl, ga.timeout, {
      'data-ga-id': ga.id,
      crossorigin: 'anonymous'
    });

    analyticsState.gaLoaded = true;
    analyticsCircuitBreakers.ga.recordSuccess();
    return true;

  } catch (error) {
    analyticsCircuitBreakers.ga.recordFailure();
    analyticsState.errors.push({
      service: 'GA',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Carrega PostHog como fallback analytics
 *
 * @returns {Promise<boolean>} true se carregado com sucesso
 */
export async function loadPostHog() {
  const { posthog } = ANALYTICS_CONFIG;

  if (!posthog.enabled) {
    return false;
  }

  try {
    // Inicializa PostHog
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    posthog.init(posthog.key, {
      api_host: posthog.host,
      loaded: function(posthog) {
        analyticsState.posthogLoaded = true;
      }
    });

    return true;

  } catch (error) {
    analyticsState.errors.push({
      service: 'PostHog',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Inicializa analytics com estratégia de fallback
 *
 * Ordem de tentativa:
 * 1. GTM (preferencial)
 * 2. GA (se GTM falhar)
 * 3. PostHog (fallback universal)
 *
 * @returns {Promise<Object>} Status de carregamento
 */
export async function initializeAnalytics() {
  // Detecta AdBlock
  analyticsState.adBlockDetected = await detectAdBlock();
  if (analyticsState.adBlockDetected) {
    await loadPostHog();
    return getAnalyticsStatus();
  }

  // Tenta carregar GTM (preferencial)
  const gtmLoaded = await loadGTM();

  // Se GTM falhou, tenta GA
  if (!gtmLoaded) {
    await loadGA();
  }

  // Sempre carrega PostHog como fallback
  await loadPostHog();

  return getAnalyticsStatus();
}

/**
 * Rastreia um evento em todos os analytics disponíveis
 *
 * @param {string} eventName - Nome do evento
 * @param {Object} properties - Propriedades do evento
 */
export function trackEvent(eventName, properties = {}) {
  // GTM/GA
  if (analyticsState.gtmLoaded || analyticsState.gaLoaded) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...properties
      });
    } catch (error) {
      // GTM/GA track error is non-critical
    }
  }

  // PostHog
  if (analyticsState.posthogLoaded && window.posthog) {
    try {
      window.posthog.capture(eventName, properties);
    } catch (error) {
      // PostHog track error is non-critical
    }
  }
}

/**
 * Registra falha de analytics para monitoramento
 *
 * @param {string} service - Serviço que falhou (GTM, GA, PostHog)
 * @param {Error} error - Erro ocorrido
 */
export function handleAnalyticsFailure(service, error) {
  const failure = {
    service,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    adBlockDetected: analyticsState.adBlockDetected
  };

  analyticsState.errors.push(failure);

  // Envia para endpoint de erros se disponível
  if (typeof fetch !== 'undefined') {
    fetch('/api/analytics-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(failure)
    }).catch(() => {
      // Error reporting failure is non-critical
    });
  }
}

/**
 * Obtém status de todos os analytics
 *
 * @returns {Object} Status de carregamento
 */
export function getAnalyticsStatus() {
  return {
    gtm: analyticsState.gtmLoaded,
    ga: analyticsState.gaLoaded,
    posthog: analyticsState.posthogLoaded,
    adBlockDetected: analyticsState.adBlockDetected,
    anyLoaded: analyticsState.gtmLoaded || analyticsState.gaLoaded || analyticsState.posthogLoaded,
    errors: analyticsState.errors,
    circuitBreakers: {
      gtm: analyticsCircuitBreakers.gtm.getStatus(),
      ga: analyticsCircuitBreakers.ga.getStatus()
    }
  };
}

/**
 * Reseta todos os circuit breakers de analytics
 */
export function resetAnalyticsCircuitBreakers() {
  analyticsCircuitBreakers.gtm = new CircuitBreaker({ failureThreshold: 2, timeout: 300000 });
  analyticsCircuitBreakers.ga = new CircuitBreaker({ failureThreshold: 2, timeout: 300000 });
}

// Export default como objeto com todas as funções
export default {
  initializeAnalytics,
  loadGTM,
  loadGA,
  loadPostHog,
  trackEvent,
  handleAnalyticsFailure,
  getAnalyticsStatus,
  resetAnalyticsCircuitBreakers
};
