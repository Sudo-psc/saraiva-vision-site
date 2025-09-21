// Application-wide constants

/**
 * Constants related to contact information.
 * @namespace CONTACT
 */
export const CONTACT = {
  /**
   * Phone number details.
   * @property {string} NUMBER - The phone number in E.164 format.
   * @property {string} DISPLAY - The phone number formatted for display.
   * @property {string} HREF - The `tel:` link for the phone number.
   */
  PHONE: {
    NUMBER: '5533998601427',
    DISPLAY: '+55 33 99860-1427',
    HREF: 'tel:+5533998601427'
  },
  /** @type {string} */
  EMAIL: 'saraivavision@gmail.com',
  /**
   * Default messages for contact actions.
   * @property {string} WHATSAPP - The default pre-filled message for WhatsApp.
   * @property {string} EMAIL_SUBJECT - The default subject line for email.
   */
  DEFAULT_MESSAGES: {
    WHATSAPP: 'Olá! Gostaria de agendar uma consulta.',
    EMAIL_SUBJECT: 'Agendamento de Consulta'
  }
};

/**
 * Constants related to performance and user experience.
 * @namespace PERFORMANCE
 */
export const PERFORMANCE = {
  /** @type {number} The scroll distance in pixels to trigger effects like a sticky navbar. */
  SCROLL_THRESHOLD: 20, // pixels for navbar scroll effect
  /** @type {number} The delay in milliseconds for debounced operations like search input. */
  DEBOUNCE_DELAY: 300, // ms for debounced operations
  /** @type {number} The base duration in seconds for Framer Motion animations. */
  ANIMATION_DURATION: 0.5, // seconds for framer-motion
  /** @type {number} The interval in milliseconds for automatic carousel sliding. */
  AUTO_SLIDE_INTERVAL: 5000 // ms for testimonial carousel
};

/**
 * Constants related to accessibility (a11y) and SEO.
 * @namespace A11Y
 */
export const A11Y = {
  /** @type {number} The time in milliseconds to wait before showing a loading fallback, to avoid layout shifts. */
  LOADING_TIMEOUT: 10000, // ms before showing loading fallback
  /** @type {string} The CSS outline style for focused elements. */
  FOCUS_VISIBLE_OUTLINE: '2px solid #3b82f6',
  /**
   * A collection of reusable ARIA labels for accessible components.
   * @property {string} NAVIGATION - Label for the main navigation landmark.
   * @property {string} CLOSE - Label for a close button (e.g., in a modal).
   * @property {string} OPEN_MENU - Label for a button that opens a menu.
   * @property {string} PREVIOUS - Label for a 'previous' button (e.g., in a carousel).
   * @property {string} NEXT - Label for a 'next' button (e.g., in a carousel).
   */
  ARIA_LABELS: {
    NAVIGATION: 'Navegação principal',
    CLOSE: 'Fechar',
    OPEN_MENU: 'Abrir menu',
    PREVIOUS: 'Anterior',
    NEXT: 'Próximo'
  }
};

/**
 * Constants related to image optimization.
 * @namespace IMAGES
 */
export const IMAGES = {
  /** @type {string} The root margin for the Intersection Observer used for lazy loading images. */
  LAZY_LOADING_THRESHOLD: '50px 0px',
  /**
   * Default dimensions for fallback images.
   * @property {number} width
   * @property {number} height
   */
  FALLBACK_DIMENSIONS: { width: 400, height: 300 },
  /**
   * Image quality settings for optimization.
   * @property {number} HIGH
   * @property {number} MEDIUM
   * @property {number} LOW
   */
  QUALITY_SETTINGS: {
    HIGH: 95,
    MEDIUM: 80,
    LOW: 60
  }
};