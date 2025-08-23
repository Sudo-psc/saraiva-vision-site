import { useCallback } from 'react';

/**
 * Hook para tracking de eventos do Exit Intent Popup
 * Integra com Google Analytics e outras ferramentas de análise
 */
export const useExitPopupAnalytics = () => {

    // Função genérica para envio de eventos
    const trackEvent = useCallback((eventName, properties = {}) => {
        // Google Analytics 4 (gtag)
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', eventName, {
                event_category: 'Exit_Popup',
                event_label: 'Saraiva_Vision_Discount',
                value: properties.discount_amount || 20,
                ...properties
            });
        }

        // Facebook Pixel (se disponível)
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('trackCustom', eventName, properties);
        }

        // Console log para desenvolvimento
        console.log('🎯 Exit Popup Event:', eventName, properties);
    }, []);

    // Evento: Popup foi exibido
    const trackPopupShown = useCallback((trigger = 'exit_intent') => {
        trackEvent('popup_shown', {
            trigger_type: trigger,
            popup_type: 'exit_intent_discount',
            timestamp: new Date().toISOString()
        });
    }, [trackEvent]);

    // Evento: Código foi revelado
    const trackCodeRevealed = useCallback((discountCode) => {
        trackEvent('discount_code_revealed', {
            discount_code: discountCode,
            discount_percentage: 20,
            timestamp: new Date().toISOString()
        });
    }, [trackEvent]);

    // Evento: Contato via WhatsApp
    const trackWhatsAppContact = useCallback((discountCode) => {
        trackEvent('whatsapp_contact', {
            contact_method: 'whatsapp',
            discount_code: discountCode,
            phone_number: '5533998601427',
            timestamp: new Date().toISOString()
        });
    }, [trackEvent]);

    // Evento: Contato via telefone
    const trackPhoneContact = useCallback((discountCode) => {
        trackEvent('phone_contact', {
            contact_method: 'phone',
            discount_code: discountCode,
            phone_number: '5533998601427',
            timestamp: new Date().toISOString()
        });
    }, [trackEvent]);

    // Evento: Popup foi fechado
    const trackPopupClosed = useCallback((timeRemaining, codeRevealed) => {
        trackEvent('popup_closed', {
            time_remaining: timeRemaining,
            code_was_revealed: codeRevealed,
            completion_rate: ((600 - timeRemaining) / 600 * 100).toFixed(2),
            timestamp: new Date().toISOString()
        });
    }, [trackEvent]);

    // Evento: Timer expirou
    const trackTimerExpired = useCallback((codeRevealed) => {
        trackEvent('timer_expired', {
            code_was_revealed: codeRevealed,
            session_duration: 600,
            timestamp: new Date().toISOString()
        });
    }, [trackEvent]);

    return {
        trackPopupShown,
        trackCodeRevealed,
        trackWhatsAppContact,
        trackPhoneContact,
        trackPopupClosed,
        trackTimerExpired
    };
};

/**
 * Hook para persistência local dos dados do popup
 * Evita múltiplas exibições e armazena métricas básicas
 */
export const useExitPopupStorage = () => {

    const STORAGE_KEY = 'saraiva_vision_exit_popup';

    // Verificar se popup já foi exibido hoje
    const hasShownToday = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return false;

            const data = JSON.parse(stored);
            const today = new Date().toDateString();

            return data.lastShown === today;
        } catch (error) {
            console.error('Error checking popup storage:', error);
            return false;
        }
    }, []);

    // Marcar popup como exibido
    const markAsShown = useCallback((discountCode) => {
        try {
            const data = {
                lastShown: new Date().toDateString(),
                discountCode: discountCode,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving popup storage:', error);
        }
    }, []);

    // Obter último código gerado (se existir)
    const getLastDiscountCode = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const data = JSON.parse(stored);
            const today = new Date().toDateString();

            // Só retorna se foi gerado hoje
            return data.lastShown === today ? data.discountCode : null;
        } catch (error) {
            console.error('Error getting last discount code:', error);
            return null;
        }
    }, []);

    // Limpar dados armazenados
    const clearStorage = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing popup storage:', error);
        }
    }, []);

    return {
        hasShownToday,
        markAsShown,
        getLastDiscountCode,
        clearStorage
    };
};
