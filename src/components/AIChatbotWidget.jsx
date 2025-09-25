import React, { useEffect, useState } from 'react';
import { clinicInfo } from '../lib/clinicInfo';

/**
 * Componente para gerenciar o chatbot de IA Pulse.live
 * Integra o widget de chat de IA de forma responsiva e acessível
 */
const AIChatbotWidget = ({ 
  enabled = true, 
  className = '',
  position = 'bottom-right',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!enabled || !clinicInfo.aiChatbotId) {
      return;
    }

    // Verifica se o script já foi carregado
    const existingScript = document.querySelector(`script[data-live-chat-id="${clinicInfo.aiChatbotId}"]`);
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    // Cria e carrega o script do chatbot
    const script = document.createElement('script');
    script.src = 'https://cdn.pulse.is/livechat/loader.js';
    script.setAttribute('data-live-chat-id', clinicInfo.aiChatbotId);
    script.async = true;
    
    script.onload = () => {
      setIsLoaded(true);
      setHasError(false);
    };
    
    script.onerror = () => {
      setHasError(true);
      console.error('Falha ao carregar o chatbot de IA Pulse.live');
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [enabled]);

  // Não renderiza nada se desabilitado ou com erro
  if (!enabled || hasError || !clinicInfo.aiChatbotId) {
    return null;
  }

  return (
    <div 
      className={`ai-chatbot-widget ${className}`}
      data-position={position}
      aria-label="Chatbot de IA da Saraiva Vision"
      {...props}
    >
      {/* O widget será inserido automaticamente pelo script Pulse.live */}
      {!isLoaded && (
        <div className="sr-only">
          Carregando chatbot de IA...
        </div>
      )}
    </div>
  );
};

export default React.memo(AIChatbotWidget);