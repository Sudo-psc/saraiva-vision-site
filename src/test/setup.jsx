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
    servicesKeywords: []
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
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, params) => {
      const translations = {
        'contact.send_button': 'Enviar Mensagem',
        'contact.sending_label': 'Enviando...',
        'services.learn_more': 'Saiba Mais',
        'hero.schedule_button': 'Agendar Consulta',
        'hero.services_button': 'Nossos Serviços',
        'navbar.schedule': 'Agendar',
        'footer.copyright': '© {{year}} Saraiva Vision. Todos os direitos reservados.',
        'about.p1': 'Nossa missão é cuidar da sua visão',
        'about.tag': 'Sobre Nós'
      };
      let translation = translations[key] || key;
      
      // Handle parameter substitution
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach(param => {
          translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
        });
      }
      
      return translation;
    },
    i18n: { 
      language: 'pt',
      changeLanguage: vi.fn()
    }
  }),
  Trans: ({ children, i18nKey }) => children || i18nKey
}))

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
      const { whileHover, initial, animate, transition, ...rest } = props;
      return <h2 {...rest}>{children}</h2>;
    },
    h3: ({ children, ...props }) => {
      const { whileHover, initial, animate, transition, ...rest } = props;
      return <h3 {...rest}>{children}</h3>;
    },
    p: ({ children, ...props }) => {
      const { whileHover, initial, animate, transition, ...rest } = props;
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
  AnimatePresence: ({ children }) => <>{children}</>
}))

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
  Button: ({ children, className, variant, size, ...props }) => 
    <button className={className} {...props}>{children}</button>
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

// Mock safe navigation utilities
vi.mock('@/utils/safeNavigation', () => ({
  safeOpenUrl: vi.fn(),
  safeOpenWithConfirmation: vi.fn(),
  createTelLink: vi.fn((phone) => `tel:${phone}`),
  createMailtoLink: vi.fn((email) => `mailto:${email}`),
  isUrlSafe: vi.fn(() => true),
  debounce: vi.fn((fn) => fn)
}))

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