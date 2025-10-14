import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Jotform Chatbot Widget
 * Adiciona o widget de chatbot do Jotform em páginas específicas
 */
const JotformChatbot = () => {
  useEffect(() => {
    // Cleanup function para remover o script quando o componente for desmontado
    return () => {
      // Remove o script do DOM ao sair da página
      const existingScript = document.querySelector('script[src*="jotfor.ms/agent/embedjs"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <Helmet>
      <script
        src="https://cdn.jotfor.ms/agent/embedjs/0199cb5550dc71e79d950163cd7d0d45fee0/embed.js"
        async
      />
    </Helmet>
  );
};

export default JotformChatbot;
