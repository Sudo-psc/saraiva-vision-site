import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes, FaClock } from 'react-icons/fa';
import { whatsappConfig, getWhatsAppMessage, formatWhatsAppNumber, isWithinBusinessHours } from '../config/whatsapp.js';

const WhatsappWidget = ({
  phoneNumber = whatsappConfig.phoneNumber,
  message = null,
  messageType = 'default',
  position = whatsappConfig.widget.position,
  showGreeting = whatsappConfig.widget.showGreeting,
  greetingDelay = whatsappConfig.widget.greetingDelay,
  className = "",
  customGreeting = null
}) => {
  const [isGreetingVisible, setIsGreetingVisible] = useState(false);
  const [isWidgetVisible, setIsWidgetVisible] = useState(true);
  const [businessHours, setBusinessHours] = useState(true);

  // Get the appropriate message
  const whatsappMessage = message || getWhatsAppMessage(messageType);

  useEffect(() => {
    // Check business hours
    setBusinessHours(isWithinBusinessHours());

    // Set up greeting timer
    if (showGreeting) {
      const timer = setTimeout(() => {
        setIsGreetingVisible(true);
      }, greetingDelay);

      // Auto-hide greeting after configured time
      const autoHideTimer = setTimeout(() => {
        setIsGreetingVisible(false);
      }, greetingDelay + whatsappConfig.widget.greetingAutoHide);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoHideTimer);
      };
    }
  }, [showGreeting, greetingDelay]);

  const handleWhatsAppClick = () => {
    const formattedNumber = formatWhatsAppNumber(phoneNumber);
    let finalMessage = whatsappMessage;

    // Add after-hours message if outside business hours
    if (!businessHours && whatsappConfig.businessHours.enabled) {
      finalMessage += `\n\n${whatsappConfig.businessHours.afterHoursMessage}`;
    }

    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

    // Track analytics event
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', whatsappConfig.analytics.eventAction, {
          event_category: whatsappConfig.analytics.eventCategory,
          event_label: whatsappConfig.analytics.eventLabel
        });
      }

      // PostHog Analytics
      if (window.posthog) {
        window.posthog.capture('whatsapp_click', {
          source: 'widget',
          message_type: messageType,
          business_hours: businessHours
        });
      }
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGreetingClose = () => {
    setIsGreetingVisible(false);
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'top-right': 'top-4 right-4 sm:top-6 sm:right-6',
    'top-left': 'top-4 left-4 sm:top-6 sm:left-6'
  };

  if (!isWidgetVisible) return null;

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {/* Greeting Message */}
      {isGreetingVisible && (
        <div className="mb-4 max-w-xs sm:max-w-sm whatsapp-greeting">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 relative animate-fade-in">
            <button
              onClick={handleGreetingClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
              aria-label={whatsappConfig.accessibility.closeButtonLabel}
            >
              <FaTimes size={14} />
            </button>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {whatsappConfig.greeting.showAvatar && whatsappConfig.greeting.avatar ? (
                  <img
                    src={whatsappConfig.greeting.avatar}
                    alt="Dr. Philipe Saraiva"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <FaWhatsapp className="text-white text-lg" />
                  </div>
                )}

                {/* Online status indicator */}
                {whatsappConfig.greeting.showOnlineStatus && (
                  <div className="relative -mt-2 -ml-2">
                    <div className={`w-3 h-3 rounded-full border-2 border-white ${businessHours ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {whatsappConfig.greeting.title}
                  </p>
                  {!businessHours && (
                    <FaClock className="text-gray-400 text-xs" title="Fora do horário comercial" />
                  )}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {customGreeting || whatsappConfig.greeting.message}
                </p>

                {!businessHours && whatsappConfig.businessHours.enabled && (
                  <p className="text-xs text-orange-600 mt-2">
                    Horário: Seg-Sex, 8h-18h
                  </p>
                )}
              </div>
            </div>

            {/* Speech bubble tail */}
            <div className="absolute bottom-0 right-6 transform translate-y-full">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        className={`group relative text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 whatsapp-widget ${businessHours ? 'bg-green-500 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
          }`}
        aria-label={whatsappConfig.accessibility.ariaLabel}
        title={whatsappConfig.accessibility.tooltip}
      >
        <FaWhatsapp size={24} className="sm:w-6 sm:h-6" />

        {/* Pulse animation - only during business hours */}
        {businessHours && whatsappConfig.widget.pulseAnimation && (
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
        )}

        {/* Business hours indicator */}
        {!businessHours && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <FaClock className="text-white text-xs" />
          </div>
        )}

        {/* Tooltip for desktop */}
        {whatsappConfig.widget.showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 hidden sm:group-hover:block">
            <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap">
              {businessHours ? whatsappConfig.accessibility.tooltip : 'Fora do horário (responderemos em breve)'}
              <div className="absolute top-full right-4 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

export default WhatsappWidget;