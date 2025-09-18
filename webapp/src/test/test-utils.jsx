import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Comprehensive mock translations covering all components
const mockTranslations = {
  // Contact component
  'contact.title': 'Entre em Contato',
  'contact.subtitle': 'Estamos prontos para cuidar da sua visão. Entre em contato conosco para agendar sua consulta.',
  'contact.form_title': 'Formulário de Contato',
  'contact.name_label': 'Nome completo',
  'contact.name_placeholder': 'Seu nome',
  'contact.email_label': 'E-mail',
  'contact.email_placeholder': 'seu@email.com',
  'contact.phone_label': 'Telefone',
  'contact.phone_placeholder': '(33) 99999-9999',
  'contact.message_label': 'Mensagem',
  'contact.message_placeholder': 'Sua mensagem',
  'contact.send_button': 'Enviar Mensagem',
  'contact.sending_label': 'Enviando...',
  'contact.online_scheduling_title': 'Agendamento Online',
  'contact.chatbot_title': 'Assistente IA',
  'contact.info.address_title': 'Endereço',
  'contact.info.phone_title': 'Telefone',
  'contact.info.email_title': 'E-mail',
  'contact.info.hours_title': 'Horários de Funcionamento',
  
  // Services component  
  'services.title': 'Nossos Serviços',
  'services.subtitle': 'Cuidamos da sua visão com excelência e tecnologia de ponta',
  'services.learn_more': 'Saiba Mais',
  'services.items.consultations.title': 'Consultas Oftalmológicas',
  'services.items.consultations.description': 'Exames completos para cuidar da sua visão',
  
  // Hero component
  'hero.title': 'Cuidando da sua <1>visão</1> com excelência',
  'hero.subtitle': 'Na Saraiva Vision, combinamos tecnologia de ponta com um atendimento humanizado',
  'hero.schedule_button': 'Agendar Consulta',
  'hero.services_button': 'Nossos Serviços',
  'hero.microcopy_fast_confirmation': 'Preencha seus dados e receba confirmação em 1 minuto',
  'hero.more_contact_options': 'Outras formas de contato',
  
  // Navbar component
  'navbar.home': 'Início',
  'navbar.services': 'Serviços', 
  'navbar.lenses': 'Lentes',
  'navbar.about': 'Sobre',
  'navbar.testimonials': 'Depoimentos',
  'navbar.contact': 'Contato',
  'navbar.schedule': 'Agendar',
  
  // Podcast component
  'podcast.title': 'Podcast Saraiva Vision',
  'podcast.subtitle': 'Conteúdo especializado sobre saúde ocular',
  
  // Privacy/LGPD
  'privacy.form_consent_html': 'Aceito os termos de privacidade',
  
  // Common
  'common.loading': 'Carregando...',
};

// Mock i18next hook
export const mockUseTranslation = () => ({
  t: (key, defaultValue) => {
    return mockTranslations[key] || defaultValue || key;
  },
  i18n: { 
    language: 'pt',
    changeLanguage: vi.fn()
  }
});

// Mock framer-motion components
export const mockMotionComponents = {
  motion: {
    div: ({ children, whileInView, initial, viewport, transition, whileHover, ...props }) => 
      <div {...props}>{children}</div>,
    form: ({ children, whileInView, initial, viewport, transition, ...props }) => 
      <form {...props}>{children}</form>,
    section: ({ children, whileInView, initial, viewport, transition, ...props }) => 
      <section {...props}>{children}</section>,
    h1: ({ children, whileHover, initial, animate, transition, ...props }) => 
      <h1 {...props}>{children}</h1>,
    h2: ({ children, whileHover, initial, animate, transition, ...props }) => 
      <h2 {...props}>{children}</h2>,
    h3: ({ children, whileHover, initial, animate, transition, ...props }) => 
      <h3 {...props}>{children}</h3>,
    p: ({ children, whileHover, initial, animate, transition, ...props }) => 
      <p {...props}>{children}</p>,
    button: ({ children, whileHover, whileTap, initial, animate, transition, ...props }) => 
      <button {...props}>{children}</button>,
    a: ({ children, whileHover, whileTap, initial, animate, transition, ...props }) => 
      <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const AllTheProviders = ({ children }) => {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { renderWithProviders as render };