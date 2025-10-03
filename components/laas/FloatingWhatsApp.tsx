'use client';

import { MessageCircle } from 'lucide-react';
import { trackCtaClick } from '@/lib/laas/analytics';
import { LAAS_WHATSAPP_NUMBER } from '@/lib/laas/config';

export function FloatingWhatsApp() {
  const handleClick = () => {
    trackCtaClick('whatsapp', 'floating');
    const message = encodeURIComponent('Olá, tenho interesse no LAAS');
    window.open(`https://wa.me/${LAAS_WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" aria-hidden="true" />

      <button
        onClick={handleClick}
        className="relative bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 group focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2"
        aria-label="Abrir conversa no WhatsApp para saber mais sobre LAAS"
        type="button"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />

        {/* Tooltip */}
        <span
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md"
          role="tooltip"
        >
          Fale conosco no WhatsApp
        </span>
      </button>
    </div>
  );
}
