import { useEffect } from 'react';

/**
 * Jotform Chatbot Widget
 * Adiciona o widget de chatbot do Jotform em páginas específicas
 *
 * Features:
 * - Previne carregamento duplicado do script
 * - Usa flag global para controlar estado
 * - Cleanup robusto ao desmontar
 */

// Global flag to prevent duplicate script loading
if (typeof window !== 'undefined') {
  window.__jotformChatbotLoaded = window.__jotformChatbotLoaded || false;
  window.__jotformChatbotInstances = window.__jotformChatbotInstances || 0;
}

const JOTFORM_SCRIPT_URL = 'https://cdn.jotfor.ms/agent/embedjs/0199cb5550dc71e79d950163cd7d0d45fee0/embed.js';

const JotformChatbot = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Increment instance counter
    window.__jotformChatbotInstances += 1;

    // Load script only once globally
    if (!window.__jotformChatbotLoaded) {
      const existingScript = document.querySelector(`script[src="${JOTFORM_SCRIPT_URL}"]`);

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = JOTFORM_SCRIPT_URL;
        script.async = true;
        script.id = 'jotform-chatbot-script';

        script.onload = () => {
          window.__jotformChatbotLoaded = true;
          console.log('✅ Jotform chatbot script loaded');
        };

        script.onerror = () => {
          window.__jotformChatbotLoaded = false;
          console.error('❌ Failed to load Jotform chatbot script');
        };

        document.body.appendChild(script);
      } else {
        window.__jotformChatbotLoaded = true;
      }
    }

    // Cleanup function
    return () => {
      // Decrement instance counter
      window.__jotformChatbotInstances = Math.max(0, window.__jotformChatbotInstances - 1);

      // Only remove script when no instances are active
      if (window.__jotformChatbotInstances === 0) {
        const script = document.getElementById('jotform-chatbot-script');
        if (script) {
          script.remove();
          window.__jotformChatbotLoaded = false;

          // Clean up Jotform global variables
          if (window.jfAgentCacheName) {
            delete window.jfAgentCacheName;
          }
          console.log('🧹 Jotform chatbot cleaned up');
        }
      }
    };
  }, []);

  return null; // No need to render anything, script is loaded directly
};

export default JotformChatbot;
