import { NAP_CANONICAL } from './napCanonical';

export const CONTACT = {
  PHONE: {
    NUMBER: NAP_CANONICAL.phone.primary.raw,
    DISPLAY: NAP_CANONICAL.phone.primary.display,
    HREF: NAP_CANONICAL.phone.primary.href
  },
  EMAIL: NAP_CANONICAL.email.primary,
  DEFAULT_MESSAGES: {
    WHATSAPP: NAP_CANONICAL.phone.whatsapp.defaultMessage,
    EMAIL_SUBJECT: 'Agendamento de Consulta'
  }
};

// Performance & UX Constants
export const PERFORMANCE = {
  SCROLL_THRESHOLD: 20, // pixels for navbar scroll effect
  DEBOUNCE_DELAY: 300, // ms for debounced operations
  ANIMATION_DURATION: 0.5, // seconds for framer-motion
  AUTO_SLIDE_INTERVAL: 5000 // ms for testimonial carousel
};

// Accessibility & SEO
export const A11Y = {
  LOADING_TIMEOUT: 10000, // ms before showing loading fallback
  FOCUS_VISIBLE_OUTLINE: '2px solid #3b82f6',
  ARIA_LABELS: {
    NAVIGATION: 'Navegação principal',
    CLOSE: 'Fechar',
    OPEN_MENU: 'Abrir menu',
    PREVIOUS: 'Anterior',
    NEXT: 'Próximo'
  }
};

// Image Optimization
export const IMAGES = {
  LAZY_LOADING_THRESHOLD: '50px 0px',
  FALLBACK_DIMENSIONS: { width: 400, height: 300 },
  QUALITY_SETTINGS: {
    HIGH: 95,
    MEDIUM: 80,
    LOW: 60
  }
};