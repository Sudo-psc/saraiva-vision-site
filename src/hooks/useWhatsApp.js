import { useCallback } from 'react';
import { CONTACT } from '@/lib/constants';

/**
 * Custom hook for WhatsApp functionality
 * Centralizes WhatsApp URL generation and message handling
 */
export const useWhatsApp = () => {
  const whatsappNumber = CONTACT.PHONE.NUMBER;
  
  const generateWhatsAppUrl = useCallback((message = CONTACT.DEFAULT_MESSAGES.WHATSAPP) => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  }, []);
  
  const openWhatsApp = useCallback((message, target = '_blank') => {
    const url = generateWhatsAppUrl(message);
    window.open(url, target, 'noopener,noreferrer');
  }, [generateWhatsAppUrl]);
  
  const openFloatingCTA = useCallback(() => {
    window.dispatchEvent(new Event('open-floating-cta'));
  }, []);
  
  return {
    whatsappNumber,
    generateWhatsAppUrl,
    openWhatsApp,
    openFloatingCTA
  };
};