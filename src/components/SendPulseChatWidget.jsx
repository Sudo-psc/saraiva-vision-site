import { useEffect } from 'react';

/**
 * SendPulse Live Chat Widget
 * Official widget for customer support on specific pages
 *
 * @param {Object} props
 * @param {string} [props.userId] - Optional user ID for identification
 * @param {string} [props.userPhone] - Optional user phone for identification
 */
const SendPulseChatWidget = ({ userId, userPhone }) => {
  useEffect(() => {
    // Set user identification variables if provided
    if (userId || userPhone) {
      window.oSpP = {
        ...(userId && { id: userId }),
        ...(userPhone && { phone: userPhone })
      };
    }

    // Check if script is already loaded
    const existingScript = document.querySelector('script[data-live-chat-id="68d52f7bf91669800d0923ac"]');
    if (existingScript) {
      return; // Script already loaded
    }

    // Create and inject SendPulse script
    const script = document.createElement('script');
    script.src = 'https://cdn.pulse.is/livechat/loader.js';
    script.setAttribute('data-live-chat-id', '68d52f7bf91669800d0923ac');
    script.async = true;

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Remove script on unmount
      const scriptToRemove = document.querySelector('script[data-live-chat-id="68d52f7bf91669800d0923ac"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }

      // Clean up user identification
      if (window.oSpP) {
        delete window.oSpP;
      }

      // Remove SendPulse widget iframe if exists
      const widgetContainer = document.getElementById('sp-widget-container');
      if (widgetContainer) {
        widgetContainer.remove();
      }
    };
  }, [userId, userPhone]);

  return null; // This component doesn't render anything visually
};

export default SendPulseChatWidget;
