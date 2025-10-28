import { useEffect, useCallback } from 'react';

/**
 * Analytics Fallback Component
 *
 * Este componente atua como fallback quando os scripts do Google Analytics/Tag Manager
 * são bloqueados por ad blockers, usando server-side analytics como alternativa.
 */

const AnalyticsFallback = () => {
  // Gerar Client ID único para o usuário
  const getClientId = useCallback(() => {
    let clientId = localStorage.getItem('ga_client_id');
    if (!clientId) {
      clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      localStorage.setItem('ga_client_id', clientId);
    }
    return clientId;
  }, []);

  // Helper function to deeply sanitize data and remove circular references
  const deepSanitize = useCallback((value, seen = new WeakSet()) => {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'object') {
      if (value.nodeType || value.jquery || value instanceof Element || value instanceof Node) {
        return undefined;
      }

      if (seen.has(value)) {
        return undefined;
      }

      seen.add(value);

      if (Array.isArray(value)) {
        return value.map(item => deepSanitize(item, seen)).filter(item => item !== undefined);
      }

      const sanitized = {};
      for (const key of Object.keys(value)) {
        try {
          const sanitizedValue = deepSanitize(value[key], seen);
          if (sanitizedValue !== undefined) {
            sanitized[key] = sanitizedValue;
          }
        } catch (e) {
          continue;
        }
      }
      return sanitized;
    }

    return undefined;
  }, []);

  // Enviar dados via server-side proxy
  const sendServerSideAnalytics = useCallback(async (data) => {
    try {
      const sanitizedData = {
        v: 1,
        tid: 'G-LXWRK8ELS6',
        cid: getClientId(),
        t: 'pageview',
        dl: window.location.href,
        ua: navigator.userAgent,
        dr: document.referrer
      };

      if (data && typeof data === 'object') {
        const sanitizedCustomData = deepSanitize(data);
        Object.assign(sanitizedData, sanitizedCustomData);
      }

      let requestBody;
      try {
        requestBody = JSON.stringify(sanitizedData);
      } catch (stringifyError) {
        console.error('❌ Failed to stringify analytics data:', stringifyError);
        return;
      }

      const response = await fetch('/api/analytics/ga', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      });

      if (response.status === 204 || response.ok) {
        console.log('✅ Server-side analytics sent successfully');
      } else {
        console.warn('⚠️ Server-side analytics failed:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ Server-side analytics error:', error.message || error);
    }
  }, [getClientId, deepSanitize]);

  // Enviar eventos GTM via server-side
  const sendServerSideGTM = useCallback(async (eventName, eventData = {}) => {
    try {
      const sanitizedEventData = {
        event: eventName,
        page: {
          location: window.location.href,
          title: document.title,
          path: window.location.pathname
        },
        user_properties: {
          user_agent: navigator.userAgent
        }
      };

      if (eventData && typeof eventData === 'object') {
        const sanitizedCustomData = deepSanitize(eventData);
        Object.assign(sanitizedEventData, sanitizedCustomData);
      }

      let requestBody;
      try {
        requestBody = JSON.stringify(sanitizedEventData);
      } catch (stringifyError) {
        console.error(`❌ Failed to stringify GTM event "${eventName}":`, stringifyError);
        return;
      }

      const response = await fetch('/api/analytics/gtm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody
      });

      if (response.ok || response.status === 204) {
        // Silently succeed - don't log every event to avoid console spam
        if (eventName !== 'heartbeat') {
          console.log(`✅ GTM event "${eventName}" sent server-side`);
        }
      } else {
        console.warn(`⚠️ GTM event "${eventName}" failed:`, response.status);
      }
    } catch (error) {
      // Only log non-heartbeat errors to avoid console spam
      if (eventName !== 'heartbeat') {
        console.warn(`⚠️ GTM event "${eventName}" error:`, error.message || error);
      }
      // Silently fail for heartbeat - it's not critical
    }
  }, [deepSanitize]);

  useEffect(() => {
    // Verificar se scripts do Google foram bloqueados
    const checkGoogleScriptsBlocked = () => {
      const isGTMBlocked = !window.gtag && !window.dataLayer;
      const isGABlocked = !window.gtag && !window.ga;

      return isGTMBlocked || isGABlocked;
    };

    // Se scripts não foram bloqueados, não fazer nada
    if (!checkGoogleScriptsBlocked()) {
      console.log('✅ Google scripts are loaded, no fallback needed');
      return;
    }

    console.log('⚠️ Google scripts blocked, activating server-side analytics fallback');

    // Enviar pageview inicial via server-side
    sendServerSideAnalytics({
      t: 'pageview',
      dh: window.location.hostname,
      dp: window.location.pathname,
      dt: document.title
    });

    // Monitorar eventos de interação e enviar via server-side
    const trackInteraction = (eventName, eventData = {}) => {
      sendServerSideGTM(eventName, eventData);

      // Também enviar via PostHog se disponível
      if (window.posthog) {
        window.posthog.capture(eventName, {
          ...eventData,
          fallback_method: 'server-side',
          blocked_scripts: ['google_analytics', 'google_tag_manager']
        });
      }
    };

    // Configurar listeners para eventos comuns
    const eventListeners = [];

    // Click events
    const handleClick = (event) => {
      const target = event.target.closest('a, button, [onclick]');
      if (target) {
        const text = target.textContent?.trim() || target.alt || target.title || 'Unknown element';
        const href = target.href || '';

        trackInteraction('click', {
          element_type: target.tagName.toLowerCase(),
          element_text: text.substring(0, 100),
          destination_url: href,
          timestamp: new Date().toISOString()
        });
      }
    };

    // Form submissions
    const handleSubmit = (event) => {
      const form = event.target;
      const formName = form.name || form.id || form.className || 'Unknown form';

      trackInteraction('form_submit', {
        form_name: formName,
        form_action: form.action || '',
        timestamp: new Date().toISOString()
      });
    };

    // Page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackInteraction('page_hidden', {
          time_on_page: Date.now() - performance.timing.navigationStart,
          timestamp: new Date().toISOString()
        });
      } else if (document.visibilityState === 'visible') {
        trackInteraction('page_visible', {
          timestamp: new Date().toISOString()
        });
      }
    };

    // Adicionar listeners
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener('click', handleClick, true);
        document.addEventListener('submit', handleSubmit, true);
        document.addEventListener('visibilitychange', handleVisibilityChange);
      });
    } else {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('submit', handleSubmit, true);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    eventListeners.push(
      { type: 'click', handler: handleClick },
      { type: 'submit', handler: handleSubmit },
      { type: 'visibilitychange', handler: handleVisibilityChange }
    );

    // Enviar heartbeat a cada 30 segundos
    const heartbeatInterval = setInterval(() => {
      trackInteraction('heartbeat', {
        session_duration: Date.now() - performance.timing.navigationStart,
        timestamp: new Date().toISOString()
      });
    }, 30000);

    // Limpeza
    return () => {
      eventListeners.forEach(({ type, handler }) => {
        document.removeEventListener(type, handler, true);
      });
      clearInterval(heartbeatInterval);
    };

  }, [sendServerSideAnalytics, sendServerSideGTM]);

  // Função global para eventos personalizados
  useEffect(() => {
    // Expor função global para eventos personalizados
    window.trackCustomEvent = (eventName, eventData = {}) => {
      sendServerSideGTM(eventName, eventData);

      if (window.posthog) {
        window.posthog.capture(eventName, {
          ...eventData,
          source: 'fallback_analytics'
        });
      }
    };

    return () => {
      delete window.trackCustomEvent;
    };
  }, [sendServerSideGTM]);

  // Componente não renderiza nada visualmente
  return null;
};

export default AnalyticsFallback;