import React, { useEffect, useState } from 'react';
import { clinicInfo } from '../lib/clinicInfo';

/**
 * Componente para gerenciar o Live Chat do SendPulse
 * Integra o widget de chat com captura automática de UTM tags e variáveis customizadas
 * Configurado para compliance com LGPD e rastreamento de conversões
 */
const AIChatbotWidget = ({ 
  enabled = true, 
  className = '',
  position = 'bottom-right',
  userInfo = {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Função para capturar UTM parameters da URL
  const captureUTMParameters = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined
    };
  };

  // Função para sanitizar valores (evitar strings vazias)
  const sanitizeValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    return value;
  };

  // Configurar variáveis do SendPulse antes do widget carregar
  const setupSendPulseVariables = () => {
    // Captura UTMs da URL
    const utmParams = captureUTMParameters();
    
    // Armazena UTMs globalmente para referência
    window.__utm = utmParams;

    // Configura window.oSpP com variáveis customizadas
    // IMPORTANTE: Todas as variáveis customizadas devem existir na Audience do SendPulse
    // com a MESMA grafia (case-sensitive)
    window.oSpP = {
      // System variables (não precisam ser criadas na Audience)
      phone: sanitizeValue(userInfo.phone || clinicInfo.phone),
      email: sanitizeValue(userInfo.email || 'contato@saraivavision.com'),

      // Custom variables (DEVEM existir na Audience com a mesma grafia)
      name: sanitizeValue(userInfo.name || userInfo.firstName),
      full_name: sanitizeValue(userInfo.fullName || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim()),
      city: sanitizeValue(userInfo.city || 'Caratinga'),
      
      // Variáveis específicas do contexto médico-empresarial
      crm_id: sanitizeValue(userInfo.crmId || `PAC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`),
      clinic: sanitizeValue(userInfo.clinic || 'SaraivaVision_MG'),
      source_detail: sanitizeValue(userInfo.sourceDetail || 'Website_LiveChat'),
      
      // Informações de localização
      state: sanitizeValue(userInfo.state || 'MG'),
      country: sanitizeValue(userInfo.country || 'BR'),
      
      // UTM parameters (capturados automaticamente pelo widget, mas incluídos para redundância)
      utm_source: sanitizeValue(utmParams.utm_source),
      utm_medium: sanitizeValue(utmParams.utm_medium),
      utm_campaign: sanitizeValue(utmParams.utm_campaign),
      utm_term: sanitizeValue(utmParams.utm_term),
      utm_content: sanitizeValue(utmParams.utm_content),
      
      // Metadados adicionais
      page_url: sanitizeValue(window.location.href),
      referrer: sanitizeValue(document.referrer),
      user_agent: sanitizeValue(navigator.userAgent),
      timestamp: new Date().toISOString(),
      
      // Informações de sessão
      session_id: sanitizeValue(userInfo.sessionId || `sess_${Date.now()}`),
      visit_count: sanitizeValue(userInfo.visitCount || 1),
      
      // Preferências do usuário (se disponíveis)
      language: sanitizeValue(userInfo.language || navigator.language || 'pt-BR'),
      timezone: sanitizeValue(Intl.DateTimeFormat().resolvedOptions().timeZone),
      
      // Informações de interesse médico (se disponíveis)
      specialty_interest: sanitizeValue(userInfo.specialtyInterest),
      appointment_type: sanitizeValue(userInfo.appointmentType),
      insurance_provider: sanitizeValue(userInfo.insuranceProvider),
      
      // Dados de marketing
      lead_score: sanitizeValue(userInfo.leadScore),
      customer_segment: sanitizeValue(userInfo.customerSegment || 'prospect'),
      acquisition_channel: sanitizeValue(userInfo.acquisitionChannel || 'organic')
    };

    // Log para debug (remover em produção)
    if (process.env.NODE_ENV === 'development') {
      console.log('SendPulse variables configured:', window.oSpP);
      console.log('UTM parameters captured:', utmParams);
    }
  };

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

    // PASSO 1: Configurar variáveis ANTES de carregar o widget
    setupSendPulseVariables();

    // PASSO 2: Carregar o script do Live Chat do SendPulse
    const script = document.createElement('script');
    script.src = 'https://cdn.pulse.is/livechat/loader.js';
    script.setAttribute('data-live-chat-id', clinicInfo.aiChatbotId);
    script.async = true;
    
    script.onload = () => {
      setIsLoaded(true);
      setHasError(false);
      
      // Log de sucesso
      if (process.env.NODE_ENV === 'development') {
        console.log('SendPulse Live Chat carregado com sucesso');
      }
    };
    
    script.onerror = () => {
      setHasError(true);
      console.error('Falha ao carregar o Live Chat do SendPulse');
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Limpar variáveis globais se necessário
      if (window.oSpP) {
        delete window.oSpP;
      }
      if (window.__utm) {
        delete window.__utm;
      }
    };
  }, [enabled, userInfo]);

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