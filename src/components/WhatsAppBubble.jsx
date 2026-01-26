import React, { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { useConfig } from '@/config';

const WhatsAppBubble = ({ className = '' }) => {
  const { getWhatsAppUrl, getFormattedPhone } = useConfig();

  const { whatsappUrl, ariaLabel } = useMemo(() => {
    const displayPhone = getFormattedPhone('display');
    return {
      whatsappUrl: getWhatsAppUrl(),
      ariaLabel: `Falar no WhatsApp ${displayPhone}`
    };
  }, [getFormattedPhone, getWhatsAppUrl]);

  return (
    <div className={`fixed bottom-5 right-5 z-[60] ${className}`}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className="group relative flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg transition-all duration-300 hover:bg-green-600 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <span className="absolute -inset-1 rounded-full bg-green-400/30 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
        <MessageCircle className="relative h-6 w-6" />
        <span className="relative hidden text-sm font-semibold md:inline">WhatsApp</span>
      </a>
    </div>
  );
};

export default WhatsAppBubble;
