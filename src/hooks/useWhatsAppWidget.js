import { useState, useEffect, useCallback } from 'react';
import { whatsappConfig, isWithinBusinessHours } from '../config/whatsapp.js';

export const useWhatsAppWidget = (options = {}) => {
    const {
        autoShow = true,
        showDelay = whatsappConfig.widget.greetingDelay,
        trackAnalytics = whatsappConfig.analytics.trackClicks
    } = options;

    const [isVisible, setIsVisible] = useState(false);
    const [isGreetingVisible, setIsGreetingVisible] = useState(false);
    const [businessHours, setBusinessHours] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Check business hours on mount and set up interval
    useEffect(() => {
        const checkBusinessHours = () => {
            setBusinessHours(isWithinBusinessHours());
        };

        checkBusinessHours();

        // Check every minute for business hours changes
        const interval = setInterval(checkBusinessHours, 60000);

        return () => clearInterval(interval);
    }, []);

    // Auto-show widget after delay
    useEffect(() => {
        if (autoShow && !hasInteracted) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                if (whatsappConfig.widget.showGreeting) {
                    setIsGreetingVisible(true);
                }
            }, showDelay);

            return () => clearTimeout(timer);
        }
    }, [autoShow, showDelay, hasInteracted]);

    // Hide greeting after auto-hide delay
    useEffect(() => {
        if (isGreetingVisible && whatsappConfig.widget.greetingAutoHide > 0) {
            const timer = setTimeout(() => {
                setIsGreetingVisible(false);
            }, whatsappConfig.widget.greetingAutoHide);

            return () => clearTimeout(timer);
        }
    }, [isGreetingVisible]);

    const showWidget = useCallback(() => {
        setIsVisible(true);
        setHasInteracted(true);
    }, []);

    const hideWidget = useCallback(() => {
        setIsVisible(false);
        setIsGreetingVisible(false);
        setHasInteracted(true);
    }, []);

    const showGreeting = useCallback(() => {
        setIsGreetingVisible(true);
        setHasInteracted(true);
    }, []);

    const hideGreeting = useCallback(() => {
        setIsGreetingVisible(false);
        setHasInteracted(true);
    }, []);

    const trackWhatsAppClick = useCallback((messageType = 'default') => {
        if (!trackAnalytics) return;

        // Track with Google Analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', whatsappConfig.analytics.eventAction, {
                event_category: whatsappConfig.analytics.eventCategory,
                event_label: `${whatsappConfig.analytics.eventLabel}_${messageType}`,
                custom_parameters: {
                    business_hours: businessHours,
                    message_type: messageType
                }
            });
        }

        // Track with PostHog
        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.capture('whatsapp_widget_click', {
                message_type: messageType,
                business_hours: businessHours,
                source: 'widget'
            });
        }

        setHasInteracted(true);
    }, [trackAnalytics, businessHours]);

    return {
        isVisible,
        isGreetingVisible,
        businessHours,
        hasInteracted,
        showWidget,
        hideWidget,
        showGreeting,
        hideGreeting,
        trackWhatsAppClick
    };
};

export default useWhatsAppWidget;