import React from 'react';
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Global mocks for all tests
vi.mock('@/lib/clinicInfo', () => ({
  clinicInfo: {
    name: 'Clínica Saraiva Vision',
    phone: '+5533998601427',
    phoneDisplay: '+55 33 99860-1427',
    email: 'saraivavision@gmail.com',
    onlineSchedulingUrl: 'https://agendarconsulta.com/perfil/dr-philipe-cruz-1678973613',
    validateSchedulingUrl: vi.fn(() => 'https://agendarconsulta.com/perfil/dr-philipe-cruz-1678973613'),
    streetAddress: 'Rua Catarina Maria Passos, 97',
    city: 'Caratinga',
    state: 'MG',
    postalCode: '35300-299',
    country: 'BR',
    servicesKeywords: [],
    // Add missing address object required by SEOHead component
    address: {
      street: 'Rua Catarina Maria Passos, 97',
      city: 'Caratinga',
      state: 'MG',
      zip: '35300-299',
      country: 'BR'
    }
  },
  googleMapsProfileUrl: 'https://www.google.com/maps/place/?q=place_id:test_place_id',
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=test_place_id',
  CLINIC_PLACE_ID: 'test_place_id'
}))

vi.mock('@/hooks/useWhatsApp', () => ({
  useWhatsApp: () => ({
    generateWhatsAppUrl: vi.fn(() => 'https://wa.me/5533998601427'),
    defaultWhatsAppUrl: 'https://wa.me/5533998601427',
    openFloatingCTA: vi.fn(),
    openWhatsApp: vi.fn(),
    whatsappNumber: '5533998601427'
  })
}))

vi.mock('@/lib/constants', () => ({
  PERFORMANCE: {
    SCROLL_THRESHOLD: 20,
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 0.5
  },
  CONTACT: {
    PHONE: {
      NUMBER: '5533998601427',
      DISPLAY: '+55 33 99860-1427',
      HREF: 'tel:+5533998601427'
    },
    EMAIL: 'saraivavision@gmail.com',
    DEFAULT_MESSAGES: {
      WHATSAPP: 'Olá! Gostaria de agendar uma consulta.',
      EMAIL_SUBJECT: 'Agendamento de Consulta'
    }
  }
}))

// Mock react-i18next globally
vi.mock('react-i18next', () => {
  const translations = {
    'contact.send_button': 'Enviar Mensagem',
    'contact.sending_label': 'Enviando...',
    'contact.title': 'Entre em Contato',
    'contact.subtitle': 'Estamos prontos para cuidar da sua visão. Entre em contato conosco para agendar sua consulta.',
    'services.learn_more': 'Saiba Mais',
    'services.title': 'Nossos Serviços',
    'hero.schedule_button': 'Agendar Consulta',
    'hero.services_button': 'Nossos Serviços',
    'navbar.schedule': 'Agendar',
    'about.p1': 'Nossa missão é cuidar da sua visão',
    'about.tag': 'Sobre Nós',
    'privacy.form_consent_html': 'Aceito a Política de Privacidade',
    'contact.info.phone_whatsapp': 'Falar no WhatsApp',
  };

  const t = (key, params) => {
    let translation = translations[key] || key;
    if (params && typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
    }
    return translation;
  };

  const useTranslation = vi.fn(() => ({
      t,
      i18n: {
        language: 'pt',
        changeLanguage: vi.fn(),
      },
    }));
  return {
    useTranslation,
    Trans: ({ i18nKey, values, children }) => {
      // Prefer provided children if present to match react-i18next behavior
      if (children) return children;
      return t(i18nKey, values);
    },
  };
})

// Mock framer-motion globally
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { whileInView, initial, viewport, transition, whileHover, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    form: ({ children, ...props }) => {
      const { whileInView, initial, viewport, transition, ...rest } = props;
      return <form {...rest}>{children}</form>;
    },
    section: ({ children, ...props }) => {
      const { whileInView, initial, viewport, transition, ...rest } = props;
      return <section {...rest}>{children}</section>;
    },
    h1: ({ children, ...props }) => {
      const { whileHover, initial, animate, transition, ...rest } = props;
      return <h1 {...rest}>{children}</h1>;
    },
    h2: ({ children, ...props }) => {
      const { whileHover, whileInView, initial, animate, transition, viewport, ...rest } = props;
      return <h2 {...rest}>{children}</h2>;
    },
    h3: ({ children, ...props }) => {
      const { whileHover, initial, animate, transition, ...rest } = props;
      return <h3 {...rest}>{children}</h3>;
    },
    p: ({ children, ...props }) => {
      const { whileHover, whileInView, initial, animate, transition, viewport, ...rest } = props;
      return <p {...rest}>{children}</p>;
    },
    button: ({ children, ...props }) => {
      const { whileHover, whileTap, initial, animate, transition, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    a: ({ children, ...props }) => {
      const { whileHover, whileTap, initial, animate, transition, ...rest } = props;
      return <a {...rest}>{children}</a>;
    }
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useInView: () => true,
  useReducedMotion: () => false
}))

// Provide a minimal require shim for specific aliased modules used in tests
// This helps when tests call require('@/lib/schemaMarkup') directly.
// We resolve to the mocked ESM module via dynamic import at setup time.
let __schemaMarkupModule;
let __reactI18nextModule;
try {
  __schemaMarkupModule = await import('@/lib/schemaMarkup');
} catch {}
try {
  // Provide a CommonJS-like module for require('react-i18next') in tests
  const translations = {
    'contact.send_button': 'Enviar Mensagem',
    'contact.sending_label': 'Enviando...',
    'contact.title': 'Entre em Contato',
    'contact.subtitle': 'Estamos prontos para cuidar da sua visão. Entre em contato conosco para agendar sua consulta.',
    'services.learn_more': 'Saiba Mais',
    'services.title': 'Nossos Serviços',
    'hero.schedule_button': 'Agendar Consulta',
    'hero.services_button': 'Nossos Serviços',
    'navbar.schedule': 'Agendar',
    'about.p1': 'Nossa missão é cuidar da sua visão',
    'about.tag': 'Sobre Nós',
    'privacy.form_consent_html': 'Aceito a Política de Privacidade',
    'contact.info.phone_whatsapp': 'Falar no WhatsApp',
  };
  const t = (key, params) => {
    let translation = translations[key] || key;
    if (params && typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
    }
    return translation;
  };
  const useTranslationMock = vi.fn(() => ({
    t,
    i18n: { language: 'pt', changeLanguage: vi.fn() }
  }));
  __reactI18nextModule = { useTranslation: useTranslationMock, Trans: ({ i18nKey, values, children }) => children || t(i18nKey, values) };
} catch {}
if (typeof globalThis.require !== 'function') {
  // eslint-disable-next-line no-global-assign
  globalThis.require = (id) => {
    if (id === '@/lib/schemaMarkup' && __schemaMarkupModule) return __schemaMarkupModule;
    if (id === 'react-i18next' && __reactI18nextModule) return __reactI18nextModule;
    throw new Error(`Cannot find module '${id}'`);
  };
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: React.forwardRef(({ children, className, variant, size, ...props }, ref) => 
    <button ref={ref} className={className} {...props}>{children}</button>
  )
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

// Use real safeNavigation implementation to ensure util tests validate actual behavior
vi.mock('@/utils/safeNavigation', async () => {
  const actual = await vi.importActual('@/utils/safeNavigation');
  return { ...actual };
})

// Mock performance hooks
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value) => value,
  default: (value) => value
}))

vi.mock('@/hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => [{ current: null }, true],
  default: () => [{ current: null }, true]
}))

vi.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    trackComponentMount: () => () => {},
    trackInteraction: vi.fn()
  }),
  default: () => ({
    trackComponentMount: () => () => {},
    trackInteraction: vi.fn()
  })
}))

// Mock analytics consent system
vi.mock('@/utils/consentMode', () => ({
  hasConsent: vi.fn(() => false),
  onConsentChange: vi.fn(),
  getConsentState: vi.fn(() => ({ analytics: false, marketing: false })),
  updateConsent: vi.fn(),
  acceptAll: vi.fn(),
  acceptNecessaryOnly: vi.fn(),
  shouldShowConsentBanner: vi.fn(() => true),
}))

vi.mock('@/utils/analyticsConsent', () => ({
  trackGA: vi.fn(),
  trackMeta: vi.fn(),
  bindConsentUpdates: vi.fn(),
  trackEnhancedConversion: vi.fn(),
}))

// Mock global analytics functions
global.gtag = vi.fn()
global.fbq = vi.fn()

// Mock scrollIntoView for JSDOM
Element.prototype.scrollIntoView = vi.fn()
