import React from 'react';
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import i18n from '../i18n';

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
    onlineSchedulingUrl: 'https://apolo.ninsaude.com/a/saraivavision/',
    validateSchedulingUrl: vi.fn(() => 'https://apolo.ninsaude.com/a/saraivavision/'),
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

// Mock framer-motion globally with forwardRef support
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => {
      const { whileInView, initial, viewport, transition, whileHover, layout, animate, exit, ...rest } = props;
      return <div ref={ref} {...rest}>{children}</div>;
    }),
    form: React.forwardRef(({ children, ...props }, ref) => {
      const { whileInView, initial, viewport, transition, layout, animate, exit, ...rest } = props;
      return <form ref={ref} {...rest}>{children}</form>;
    }),
    section: React.forwardRef(({ children, ...props }, ref) => {
      const { whileInView, initial, viewport, transition, layout, animate, exit, ...rest } = props;
      return <section ref={ref} {...rest}>{children}</section>;
    }),
    h1: React.forwardRef(({ children, ...props }, ref) => {
      const { whileHover, initial, animate, transition, layout, exit, ...rest } = props;
      return <h1 ref={ref} {...rest}>{children}</h1>;
    }),
    h2: React.forwardRef(({ children, ...props }, ref) => {
      const { whileHover, whileInView, initial, animate, transition, viewport, layout, exit, ...rest } = props;
      return <h2 ref={ref} {...rest}>{children}</h2>;
    }),
    h3: React.forwardRef(({ children, ...props }, ref) => {
      const { whileHover, initial, animate, transition, layout, exit, ...rest } = props;
      return <h3 ref={ref} {...rest}>{children}</h3>;
    }),
    p: React.forwardRef(({ children, ...props }, ref) => {
      const { whileHover, whileInView, initial, animate, transition, viewport, layout, exit, ...rest } = props;
      return <p ref={ref} {...rest}>{children}</p>;
    }),
    button: React.forwardRef(({ children, ...props }, ref) => {
      const { whileHover, whileTap, initial, animate, transition, layout, exit, ...rest } = props;
      return <button ref={ref} {...rest}>{children}</button>;
    }),
    a: React.forwardRef(({ children, ...props }, ref) => {
      const { whileHover, whileTap, initial, animate, transition, layout, exit, ...rest } = props;
      return <a ref={ref} {...rest}>{children}</a>;
    })
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
    'services.section_title': 'Nossos Serviços',
    'services.subtitle': 'Oferecemos uma gama abrangente de serviços especializados',
    'hero.schedule_button': 'Agendar Consulta',
    'hero.services_button': 'Nossos Serviços',
    'navbar.schedule': 'Agendar',
    'about.p1': 'Nossa missão é cuidar da sua visão',
    'about.tag': 'Sobre Nós',
    'privacy.form_consent_html': 'Aceito a Política de Privacidade',
    'contact.info.phone_whatsapp': 'Falar no WhatsApp',
    'homeMeta.title': 'Clínica Saraiva Vision - Oftalmologista em Caratinga/MG',
    'homeMeta.description': 'Clínica oftalmológica especializada em Caratinga/MG',
    'homeMeta.keywords': 'oftalmologista Caratinga, clínica oftalmológica, consulta olhos, exame vista',
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

// Mock UI components - use actual Button implementation to preserve styling
vi.mock('@/components/ui/button', async (importOriginal) => {
  const actual = await importOriginal();
  return actual;
})

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

// Mock window.scrollTo and related scroll APIs
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn((x, y) => {
    window.pageXOffset = typeof x === 'object' ? x.left || 0 : x || 0;
    window.pageYOffset = typeof x === 'object' ? x.top || 0 : y || 0;
    window.scrollX = window.pageXOffset;
    window.scrollY = window.pageYOffset;
  })
});

Object.defineProperty(window, 'scroll', {
  writable: true,
  value: window.scrollTo
});

// Mock window.scrollX and scrollY
Object.defineProperty(window, 'pageXOffset', {
  writable: true,
  value: 0
});

Object.defineProperty(window, 'pageYOffset', {
  writable: true,
  value: 0
});

Object.defineProperty(window, 'scrollX', {
  writable: true,
  value: 0
});

Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0
});

// Mock window.open for popup handling
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn((url, name, features) => {
    // Simulate popup blocker behavior in tests
    const mockWindow = {
      closed: false,
      location: { href: url },
      close: vi.fn(() => { mockWindow.closed = true; }),
      focus: vi.fn(),
      blur: vi.fn()
    };
    return mockWindow;
  })
});

// Mock window.location methods - use delete first to avoid non-configurable errors
delete window.location;
window.location = {
  href: 'http://localhost/',
  origin: 'http://localhost',
  protocol: 'http:',
  hostname: 'localhost',
  port: '',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn()
};

// Mock localStorage and sessionStorage
const createStorage = () => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index) => Object.keys(store)[index] || null)
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorage()
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorage()
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  return setTimeout(cb, 16); // ~60fps
});

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// Mock setTimeout and setInterval for better test control
vi.useFakeTimers();

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
  width: 100,
  height: 100,
  x: 0,
  y: 0,
  toJSON: vi.fn()
}));

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn(() => ({
    getPropertyValue: vi.fn(() => ''),
    columnGap: '24px',
    gap: '24px',
    marginRight: '0px',
    // Add commonly accessed properties
    display: 'block',
    position: 'static',
    visibility: 'visible',
    width: '100px',
    height: '100px'
  }))
});

// Mock addEventListener and removeEventListener on window
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
const eventListeners = new Map();

window.addEventListener = vi.fn((event, handler, options) => {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event).add(handler);
  return originalAddEventListener.call(window, event, handler, options);
});

window.removeEventListener = vi.fn((event, handler, options) => {
  if (eventListeners.has(event)) {
    eventListeners.get(event).delete(handler);
  }
  return originalRemoveEventListener.call(window, event, handler, options);
});

// Helper to trigger events in tests
window.triggerEvent = (eventName, eventData = {}) => {
  const handlers = eventListeners.get(eventName);
  if (handlers) {
    handlers.forEach(handler => {
      handler(new Event(eventName, eventData));
    });
  }
};