/**
 * Google Tag Manager Wrapper com Isolamento de Erros
 *
 * Wrapper robusto para carregamento de GTM/GA com:
 * - Isolamento completo de erros de terceiros
 * - Circuit breaker simplificado para domínios do Google
 * - Fallback via sendBeacon para tracking
 * - Try/catch em todos os callbacks para evitar quebra do app
 * - Feature flags para desabilitar tracking
 *
 * @author Dr. Philipe Saraiva Cruz
 * @priority P0 - Critical
 */

// Circuit breaker simplificado (local)
const circuitBreakers = new Map();

function getCircuitBreaker(url, options = {}) {
  const endpoint = new URL(url, window.location.origin).pathname;
  
  if (!circuitBreakers.has(endpoint)) {
    circuitBreakers.set(endpoint, {
      failures: 0,
      lastFailure: null,
      state: 'CLOSED', // CLOSED | OPEN
      failureThreshold: options.failureThreshold || 5,
      timeout: options.timeout || 60000,
      canRequest() {
        if (this.state === 'OPEN') {
          if (Date.now() - this.lastFailure > this.timeout) {
            this.state = 'CLOSED';
            this.failures = 0;
            return true;
          }
          return false;
        }
        return true;
      },
      recordSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
      },
      recordFailure() {
        this.failures++;
        this.lastFailure = Date.now();
        if (this.failures >= this.failureThreshold) {
          this.state = 'OPEN';
        }
      }
    });
  }
  
  return circuitBreakers.get(endpoint);
}

/**
 * Feature flags globais
 */
const config = {
    disableThirdPartyTracking: false,
    silentMode: true, // Não propaga erros de tracking
    maxRetries: 2
};

/**
 * Configura feature flags
 */
export function configureGTM(options = {}) {
    Object.assign(config, options);
}

/**
 * Carrega script de terceiros com isolamento total de erros
 *
 * @param {string} url - URL do script
 * @param {Object} options - Opções de carregamento
 * @param {Function} options.onSuccess - Callback de sucesso
 * @param {Function} options.onError - Callback de erro
 * @param {string} options.id - ID único para o script
 * @returns {Promise<boolean>} Sucesso do carregamento
 */
export async function loadThirdPartyScript(url, options = {}) {
    const {
        onSuccess,
        onError,
        id = `script-${Date.now()}`
    } = options;

    // Feature flag: bloquear todos os scripts de terceiros
    if (config.disableThirdPartyTracking) {
        if (onError && !config.silentMode) {
            try {
                onError(new Error('Third-party tracking disabled'));
            } catch {}
        }
        return false;
    }

    // Verifica circuit breaker
    const breaker = getCircuitBreaker(url, {
        failureThreshold: 2,
        timeout: 300000 // 5 minutos
    });

    if (!breaker.canRequest()) {
        console.warn(`[GTM] Circuit breaker OPEN for ${url}, skipping`);
        if (onError && !config.silentMode) {
            try {
                onError(new Error('Circuit breaker open'));
            } catch {}
        }
        return false;
    }

    return new Promise((resolve) => {
        try {
            // Remove script anterior se existir
            const existing = document.getElementById(id);
            if (existing) {
                existing.remove();
            }

            // Cria script element
            const script = document.createElement('script');
            script.id = id;
            script.async = true;
            script.src = url;
            script.crossOrigin = 'anonymous';
            script.setAttribute('data-cfasync', 'false');

            // Handler de sucesso ISOLADO
            script.onload = () => {
                try {
                    breaker.recordSuccess();
                    if (onSuccess) {
                        // Isola callback de sucesso
                        setTimeout(() => {
                            try {
                                onSuccess();
                            } catch (callbackError) {
                                console.error('[GTM] onSuccess callback error:', callbackError);
                            }
                        }, 0);
                    }
                    resolve(true);
                } catch (loadError) {
                    console.error('[GTM] onload handler error:', loadError);
                    resolve(false);
                }
            };

            // Handler de erro ISOLADO
            script.onerror = (event) => {
                try {
                    breaker.recordFailure();
                    console.warn('[GTM] Script load failed:', url, event);

                    if (onError && !config.silentMode) {
                        // Isola callback de erro
                        setTimeout(() => {
                            try {
                                onError(new Error(`Failed to load ${url}`));
                            } catch (callbackError) {
                                console.error('[GTM] onError callback error:', callbackError);
                            }
                        }, 0);
                    }
                    resolve(false);
                } catch (errorHandlerError) {
                    console.error('[GTM] onerror handler error:', errorHandlerError);
                    resolve(false);
                }
            };

            // Insere no DOM
            const firstScript = document.getElementsByTagName('script')[0];
            if (firstScript && firstScript.parentNode) {
                firstScript.parentNode.insertBefore(script, firstScript);
            } else {
                document.head.appendChild(script);
            }

            // Timeout de segurança
            setTimeout(() => {
                if (!script.hasAttribute('data-loaded')) {
                    console.warn('[GTM] Script load timeout:', url);
                    breaker.recordFailure();
                    resolve(false);
                }
            }, 10000);

        } catch (error) {
            console.error('[GTM] loadThirdPartyScript error:', error);
            breaker.recordFailure();
            resolve(false);
        }
    });
}

/**
 * Carrega Google Tag Manager com isolamento total
 *
 * @param {string} gtmId - ID do GTM (GTM-XXXXXXX)
 * @returns {Promise<boolean>} Sucesso do carregamento
 */
export async function loadGTM(gtmId) {
    if (!gtmId || typeof window === 'undefined') {
        return false;
    }

    // Evita múltiplos carregamentos
    if (window.gtmLoaded) {
        return true;
    }

    try {
        // Inicializa dataLayer com isolamento
        window.dataLayer = window.dataLayer || [];

        // Função push ISOLADA
        const originalPush = window.dataLayer.push;
        window.dataLayer.push = function(...args) {
            try {
                return originalPush.apply(window.dataLayer, args);
            } catch (error) {
                console.error('[GTM] dataLayer.push error (isolated):', error);
                return 0;
            }
        };

        // Push inicial
        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });

        // Tenta carregar via proxy local primeiro, depois Google
        const urls = [
            `/gtm.js?id=${gtmId}`, // Proxy local (bypassa adblockers)
            `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
        ];

        for (const url of urls) {
            const loaded = await loadThirdPartyScript(url, {
                id: 'gtm-script',
                onSuccess: () => {
                    window.gtmLoaded = true;

                    // Add noscript fallback
                    try {
                        const noscript = document.createElement('noscript');
                        const iframe = document.createElement('iframe');
                        iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
                        iframe.height = '0';
                        iframe.width = '0';
                        iframe.style.display = 'none';
                        iframe.style.visibility = 'hidden';
                        noscript.appendChild(iframe);
                        document.body.insertBefore(noscript, document.body.firstChild);
                    } catch {}
                },
                onError: (error) => {
                    console.warn('[GTM] Failed to load from:', url, error);
                }
            });

            if (loaded) {
                return true;
            }
        }

        return false;

    } catch (error) {
        console.error('[GTM] loadGTM error (isolated):', error);
        return false;
    }
}

/**
 * Envia evento para dataLayer com isolamento total
 *
 * @param {Object} event - Evento para enviar
 * @returns {boolean} Sucesso
 */
export function pushToDataLayer(event) {
    try {
        if (typeof window === 'undefined' || !window.dataLayer) {
            return false;
        }

        // Push com isolamento
        window.dataLayer.push(event);
        return true;

    } catch (error) {
        console.error('[GTM] pushToDataLayer error (isolated):', error);
        return false;
    }
}

/**
 * Envia evento de tracking com sendBeacon/fetch fallback
 *
 * @param {string} url - URL para tracking
 * @param {Object} payload - Dados do evento
 * @returns {Promise<boolean>} Sucesso
 */
export async function sendTrackingEvent(url, payload = {}) {
    try {
        if (config.disableThirdPartyTracking) {
            return false;
        }

        // Tenta sendBeacon primeiro (mais eficiente)
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            const sent = navigator.sendBeacon(url, blob);
            if (sent) {
                return true;
            }
        }

        // Fallback para fetch
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        });

        return response.ok;

    } catch (error) {
        // Isolamento: nunca propaga erro de tracking
        if (!config.silentMode) {
            console.warn('[GTM] sendTrackingEvent error (isolated):', error);
        }
        return false;
    }
}

/**
 * Wrapper isolado para gtag
 *
 * @param {...any} args - Argumentos para gtag
 * @returns {void}
 */
export function safeGtag(...args) {
    try {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag(...args);
        }
    } catch (error) {
        console.error('[GTM] gtag error (isolated):', error);
    }
}

/**
 * Obtém status do GTM
 */
export function getGTMStatus() {
    return {
        loaded: typeof window !== 'undefined' && window.gtmLoaded === true,
        dataLayerAvailable: typeof window !== 'undefined' && Array.isArray(window.dataLayer),
        gtagAvailable: typeof window !== 'undefined' && typeof window.gtag === 'function',
        disableThirdPartyTracking: config.disableThirdPartyTracking
    };
}

/**
 * Desabilita todo tracking de terceiros
 */
export function disableThirdPartyTracking() {
    config.disableThirdPartyTracking = true;
}

/**
 * Habilita tracking de terceiros
 */
export function enableThirdPartyTracking() {
    config.disableThirdPartyTracking = false;
}

export default {
    loadGTM,
    loadThirdPartyScript,
    pushToDataLayer,
    sendTrackingEvent,
    safeGtag,
    getGTMStatus,
    configureGTM,
    disableThirdPartyTracking,
    enableThirdPartyTracking
};
