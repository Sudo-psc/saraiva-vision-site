/**
 * Application-wide constants
 *
 * Centralized configuration for contact information, performance settings,
 * accessibility features, and more.
 */

import { clinicInfo } from './clinicInfo';

// Contact Information
export const CONTACT = {
  PHONE: {
    NUMBER: '5533998601427', // Format for WhatsApp API (no spaces/dashes)
    DISPLAY: '+55 (33) 99860-1427',
    HREF: 'tel:+5533998601427',
    WHATSAPP_URL: 'https://wa.me/5533998601427',
  },
  EMAIL: clinicInfo.email || 'saraivavision@gmail.com',
  ADDRESS: clinicInfo.address || 'R. Princesa Isabel, 945 - Centro, Caratinga - MG',
  SCHEDULE: {
    WEEKDAYS: 'Segunda a Sexta: 08:00 - 18:00',
    SATURDAY: 'Sábado: 08:00 - 12:00',
    SUNDAY: 'Domingo: Fechado',
  },
  DEFAULT_MESSAGES: {
    WHATSAPP: 'Olá! Gostaria de agendar uma consulta.',
    EMAIL_SUBJECT: 'Agendamento de Consulta - Saraiva Vision',
  },
} as const;

// Performance & UX Constants
export const PERFORMANCE = {
  SCROLL_THRESHOLD: 20, // pixels for navbar scroll effect
  DEBOUNCE_DELAY: 300, // ms for debounced operations
  ANIMATION_DURATION: 0.5, // seconds for framer-motion
  AUTO_SLIDE_INTERVAL: 5000, // ms for testimonial carousel
  FORM_SUBMIT_TIMEOUT: 10000, // ms before showing timeout error
} as const;

// Accessibility & SEO
export const A11Y = {
  LOADING_TIMEOUT: 10000, // ms before showing loading fallback
  FOCUS_VISIBLE_OUTLINE: '2px solid #3b82f6',
  ARIA_LABELS: {
    NAVIGATION: 'Navegação principal',
    CLOSE: 'Fechar',
    OPEN_MENU: 'Abrir menu',
    PREVIOUS: 'Anterior',
    NEXT: 'Próximo',
    LOADING: 'Carregando',
    ERROR: 'Erro',
    SUCCESS: 'Sucesso',
  },
  MIN_TOUCH_TARGET: 44, // minimum tap target size in pixels (WCAG AAA)
} as const;

// Image Optimization
export const IMAGES = {
  LAZY_LOADING_THRESHOLD: '50px 0px',
  FALLBACK_DIMENSIONS: { width: 400, height: 300 },
  QUALITY_SETTINGS: {
    HIGH: 95,
    MEDIUM: 80,
    LOW: 60,
  },
  FORMATS: {
    MODERN: ['avif', 'webp'],
    FALLBACK: 'jpg',
  },
} as const;

// Form Configuration
export const FORM = {
  VALIDATION: {
    NAME_MIN: 2,
    NAME_MAX: 100,
    EMAIL_MAX: 255,
    PHONE_MIN: 10,
    PHONE_MAX: 11,
    MESSAGE_MIN: 10,
    MESSAGE_MAX: 2000,
  },
  RATE_LIMIT: {
    MAX_ATTEMPTS: 3,
    WINDOW_MS: 3600000, // 1 hour
  },
  DEBOUNCE: {
    VALIDATION: 500, // ms to wait before validating
    AUTOSAVE: 2000, // ms to wait before autosaving
  },
} as const;

// API Configuration
export const API = {
  ENDPOINTS: {
    CONTACT: '/api/contact',
    APPOINTMENTS: '/api/appointments',
    REVIEWS: '/api/reviews',
  },
  TIMEOUT: 10000, // ms
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // ms
    BACKOFF_MULTIPLIER: 2,
  },
} as const;

// LGPD Compliance
export const LGPD = {
  CONSENT_KEY: 'saraiva_vision_consent',
  CONSENT_VERSION: '1.0',
  DATA_RETENTION_DAYS: 365,
  PURPOSES: {
    CONTACT: 'Responder à sua consulta médica',
    APPOINTMENT: 'Agendar e gerenciar consultas',
    COMMUNICATION: 'Enviar lembretes e confirmações',
  },
} as const;

// Social Media
export const SOCIAL = {
  INSTAGRAM: 'https://www.instagram.com/saraivavision/',
  FACEBOOK: 'https://www.facebook.com/saraivavision/',
  LINKEDIN: 'https://www.linkedin.com/company/saraivavision/',
  WHATSAPP: CONTACT.PHONE.WHATSAPP_URL,
} as const;

// Medical Compliance (CFM)
export const CFM = {
  CRM: 'CRM/MG 12345', // Replace with actual CRM number
  DISCLAIMERS: {
    MEDICAL_ADVICE:
      'As informações fornecidas neste site não substituem uma consulta médica presencial.',
    EMERGENCY:
      'Em caso de emergência, procure imediatamente um pronto-socorro oftalmológico.',
    TELEMEDICINE:
      'Consultas por telemedicina seguem as normas do CFM (Resolução CFM nº 2.314/2022).',
  },
} as const;

// Environment-specific URLs
export const URLS = {
  BASE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://saraivavision.com.br',
  GOOGLE_MAPS: 'https://maps.app.goo.gl/example', // Replace with actual Google Maps URL
  ONLINE_SCHEDULING: 'https://agendamento.saraivavision.com.br', // Replace with actual URL
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_CHATBOT: true,
  ENABLE_ONLINE_SCHEDULING: true,
  ENABLE_TELEMEDICINE: false,
  ENABLE_BLOG: true,
  ENABLE_NEWSLETTER: false,
} as const;

// Type exports for better TypeScript support
export type ContactInfo = typeof CONTACT;
export type PerformanceConfig = typeof PERFORMANCE;
export type A11yConfig = typeof A11Y;
export type ImageConfig = typeof IMAGES;
export type FormConfig = typeof FORM;
export type APIConfig = typeof API;
export type LGPDConfig = typeof LGPD;
