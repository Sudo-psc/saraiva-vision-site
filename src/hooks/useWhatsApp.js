import { useCallback, useMemo } from 'react';
import { CONTACT } from '@/lib/constants';

/**
 * Custom hook for WhatsApp functionality
 * Centralizes WhatsApp URL generation and message handling
 * Optimized with memoization for better performance
 */
export const useWhatsApp = () => {
  const whatsappNumber = CONTACT.PHONE.NUMBER;
  
  // Memoize the default WhatsApp URL to avoid recomputation
  const defaultWhatsAppUrl = useMemo(() => {
    const encodedMessage = encodeURIComponent(CONTACT.DEFAULT_MESSAGES.WHATSAPP);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  }, [whatsappNumber]);
  
  const generateWhatsAppUrl = useCallback((message = CONTACT.DEFAULT_MESSAGES.WHATSAPP) => {
    // Return memoized URL if using default message
    if (message === CONTACT.DEFAULT_MESSAGES.WHATSAPP) {
      return defaultWhatsAppUrl;
    }
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  }, [whatsappNumber, defaultWhatsAppUrl]);
  
  const openWhatsApp = useCallback((message, target = '_blank') => {
    const url = generateWhatsAppUrl(message);
    try {
      const win = window.open(url, target, 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } catch (e) {
      window.location.href = url;
    }
  }, [generateWhatsAppUrl]);
  
  const openFloatingCTA = useCallback(() => {
    window.dispatchEvent(new Event('open-floating-cta'));
  }, []);
  
  return {
    whatsappNumber,
    generateWhatsAppUrl,
    openWhatsApp,
    openFloatingCTA,
    defaultWhatsAppUrl // Export for direct use when default message is needed
  };
};