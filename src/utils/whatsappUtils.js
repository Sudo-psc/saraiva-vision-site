import { whatsappConfig, formatWhatsAppNumber, getWhatsAppMessage, isWithinBusinessHours } from '../config/whatsapp.js';

/**
 * Generate WhatsApp deep link URL
 * @param {Object} options - Configuration options
 * @param {string} options.phoneNumber - WhatsApp number
 * @param {string} options.message - Pre-filled message
 * @param {string} options.messageType - Type of message (default, appointment, etc.)
 * @returns {string} WhatsApp URL
 */
export const generateWhatsAppUrl = (options = {}) => {
    const {
        phoneNumber = whatsappConfig.phoneNumber,
        message = null,
        messageType = 'default'
    } = options;

    const formattedNumber = formatWhatsAppNumber(phoneNumber);
    let finalMessage = message || getWhatsAppMessage(messageType);

    // Add business hours context if outside hours
    if (!isWithinBusinessHours() && whatsappConfig.businessHours.enabled) {
        finalMessage += `\n\n${whatsappConfig.businessHours.afterHoursMessage}`;
    }

    const encodedMessage = encodeURIComponent(finalMessage);
    return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
};

/**
 * Open WhatsApp with pre-filled message
 * @param {Object} options - Configuration options
 */
export const openWhatsApp = (options = {}) => {
    const url = generateWhatsAppUrl(options);

    // Track analytics if enabled
    if (whatsappConfig.analytics.trackClicks) {
        trackWhatsAppInteraction(options.messageType || 'default');
    }

    window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Track WhatsApp interaction for analytics
 * @param {string} messageType - Type of message
 * @param {Object} additionalData - Additional tracking data
 */
export const trackWhatsAppInteraction = (messageType = 'default', additionalData = {}) => {
    const trackingData = {
        message_type: messageType,
        business_hours: isWithinBusinessHours(),
        timestamp: new Date().toISOString(),
        ...additionalData
    };

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', whatsappConfig.analytics.eventAction, {
            event_category: whatsappConfig.analytics.eventCategory,
            event_label: `${whatsappConfig.analytics.eventLabel}_${messageType}`,
            custom_parameters: trackingData
        });
    }

    // PostHog Analytics
    if (typeof window !== 'undefined' && window.posthog) {
        window.posthog.capture('whatsapp_interaction', trackingData);
    }

    // Custom analytics callback if provided
    if (typeof window !== 'undefined' && window.customAnalytics?.trackWhatsApp) {
        window.customAnalytics.trackWhatsApp(trackingData);
    }
};

/**
 * Get appropriate greeting message based on context
 * @param {Object} context - Context information
 * @returns {string} Greeting message
 */
export const getContextualGreeting = (context = {}) => {
    const { page, userAction, timeOfDay } = context;

    // Time-based greetings
    const hour = new Date().getHours();
    let timeGreeting = 'Olá!';

    if (hour >= 6 && hour < 12) {
        timeGreeting = 'Bom dia!';
    } else if (hour >= 12 && hour < 18) {
        timeGreeting = 'Boa tarde!';
    } else if (hour >= 18 || hour < 6) {
        timeGreeting = 'Boa noite!';
    }

    // Page-specific messages
    const pageMessages = {
        home: `${timeGreeting} Bem-vindo à Clínica Saraiva Vision! Como posso ajudá-lo?`,
        services: `${timeGreeting} Interessado em nossos serviços? Posso esclarecer suas dúvidas!`,
        about: `${timeGreeting} Gostaria de conhecer mais sobre Dr. Philipe e nossa clínica?`,
        contact: `${timeGreeting} Vamos conversar! Estou aqui para ajudá-lo.`,
        appointment: `${timeGreeting} Pronto para agendar sua consulta? Vou te ajudar!`
    };

    // Action-based messages
    const actionMessages = {
        form_error: `${timeGreeting} Teve problemas com o formulário? Vamos resolver pelo WhatsApp!`,
        appointment_full: `${timeGreeting} Horários lotados? Posso verificar outras opções para você!`,
        service_inquiry: `${timeGreeting} Interessado em algum tratamento específico?`
    };

    if (userAction && actionMessages[userAction]) {
        return actionMessages[userAction];
    }

    if (page && pageMessages[page]) {
        return pageMessages[page];
    }

    return whatsappConfig.greeting.message;
};

/**
 * Check if device supports native WhatsApp app
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
};

/**
 * Get WhatsApp URL optimized for device type
 * @param {Object} options - Configuration options
 * @returns {string} Optimized WhatsApp URL
 */
export const getOptimizedWhatsAppUrl = (options = {}) => {
    const baseUrl = generateWhatsAppUrl(options);

    // For mobile devices, use the app-specific URL scheme
    if (isMobileDevice()) {
        return baseUrl.replace('https://wa.me/', 'whatsapp://send?phone=');
    }

    return baseUrl;
};

/**
 * Validate WhatsApp phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {Object} Validation result
 */
export const validateWhatsAppNumber = (phoneNumber) => {
    if (!phoneNumber) {
        return { isValid: false, error: 'Phone number is required' };
    }

    const cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.length < 10) {
        return { isValid: false, error: 'Phone number too short' };
    }

    if (cleaned.length > 15) {
        return { isValid: false, error: 'Phone number too long' };
    }

    // Brazilian phone number validation
    if (cleaned.startsWith('55')) {
        const localNumber = cleaned.substring(2);
        if (localNumber.length !== 10 && localNumber.length !== 11) {
            return { isValid: false, error: 'Invalid Brazilian phone number format' };
        }
    }

    return { isValid: true, formatted: formatWhatsAppNumber(phoneNumber) };
};

export default {
    generateWhatsAppUrl,
    openWhatsApp,
    trackWhatsAppInteraction,
    getContextualGreeting,
    isMobileDevice,
    getOptimizedWhatsAppUrl,
    validateWhatsAppNumber
};